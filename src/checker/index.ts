"use strict";

import * as vscode from "vscode";
import * as proc from "child_process";
import * as net from "net";
import { promisify, inspect } from "util";
import * as assert from "assert";
import * as path from "path";
import * as crypto from "crypto";

enum state {
  Start,
  Connecting,
  Connected,
  Disposed,
}

export interface IPosition {
  line: number;
  char: number;
}
export interface IRange {
  start: IPosition;
  end: IPosition;
}

function PosToIPos(p: vscode.Position): IPosition {
  return { line: p.line, char: p.character };
}

export function RangeToIRange(r: vscode.Range): IRange {
  return { start: PosToIPos(r.start), end: PosToIPos(r.end) };
}

function IPosToPos(p: IPosition): vscode.Position {
  return new vscode.Position(p.line, p.char);
}

function IRangeToRange(r: IRange): vscode.Range {
  return new vscode.Range(IPosToPos(r.start), IPosToPos(r.end));
}

function waitForConnectionPromise(server: net.Server): Promise<net.Socket> {
  return new Promise((resolve, _) => {
    server.once("connection", (sock: net.Socket) => {
      resolve(sock);
    });
  });
}

function listenPromise(server: net.Server): Promise<void> {
  return new Promise((resolve, _) => server.listen(() => resolve()));
}

function isDocIml(d: vscode.TextDocument): boolean {
  return d.languageId === "imandra" || d.fileName.endsWith(".iml") || d.fileName.endsWith(".ire"); // TODO: improve on that!
}

// messages to imandra
namespace msg {
  export interface IDocAdd {
    kind: "doc_add";
    uri: string;
    reason: boolean;
    version: number;
    text: string;
  }

  export interface IDocRemove {
    kind: "doc_remove";
    uri: string;
  }

  export interface IDocChange {
    range: IRange;
    rangeLen: number;
    text: string; // new text
  }

  export interface IDocUpdate {
    kind: "doc_update";
    uri: string;
    version: number;
    changes: IDocChange[];
  }

  export interface IDocCheck {
    kind: "doc_check";
    uri: string;
    version: number;
    len: number;
  }

  export interface IDocCancel {
    kind: "doc_cancel";
    uri: string;
    version: number;
  }

  export interface IPing {
    kind: "ping";
    epoch: number;
  }

  /** Main interface for queries sent to imandra-vscode-server */
  export type Msg = IDocAdd | IDocRemove | IDocUpdate | IDocCheck | IDocCancel | IPing | "cache_sync" | "cache_clear";
}

const CUR_PROTOCOL_VERSION: string = "0.1";

// responses from Imandra
namespace response {
  export interface IValid {
    kind: "valid";
    range: IRange;
    uri: string;
    version: number;
    msg: string[];
  }

  export interface IError {
    kind: "error";
    range: IRange;
    uri: string;
    version: number;
    msg: string;
  }

  export interface IWarning {
    kind: "warning";
    range: IRange;
    uri: string;
    version: number;
    msg: string;
  }

  export interface IAck {
    kind: "ack";
    uri: string;
    version: number;
    len: number; // length of document, in bytes
    md5: string; // md5 of content
  }
  export interface IResend {
    kind: "resend";
    uri: string;
  }

  export interface IPong {
    kind: "pong";
    epoch: number;
  }

  export interface IVersion {
    kind: "version";
    v: string; // current version number for the protocole
  }

  /** A response from imandra */
  export type Res = IError | IValid | IWarning | IAck | IResend | IVersion | IPong;
}

/**
 * A document with its current list of diagnostics.
 */
class DocState implements vscode.Disposable {
  private curDiags: vscode.Diagnostic[] = [];
  private curDecorations: vscode.DecorationOptions[] = [];
  private curVersion: number;
  private hadEditor = false; // had an editor before last call to `clearEditor()`
  private doc: vscode.TextDocument;
  private server: ImandraServerConn;
  private editor?: vscode.TextEditor;
  private get debug(): boolean {
    return this.server.debug;
  }
  constructor(d: vscode.TextDocument, server: ImandraServerConn) {
    this.doc = d;
    this.curVersion = d.version;
    this.server = server;
  }
  public get uri(): vscode.Uri {
    return this.doc.uri;
  }
  public get uriStr(): string {
    return this.doc.uri.fsPath;
  }
  public setEditor(ed: vscode.TextEditor) {
    assert(this.doc === ed.document);
    if (this.editor) this.editor.setDecorations(this.server.decoration, []);
    this.editor = ed;
    ed.setDecorations(this.server.decoration, this.curDecorations);
  }
  public resetEditor() {
    if (this.editor) {
      this.editor.setDecorations(this.server.decoration, []);
    }
    this.editor = undefined;
  }
  public updateEditor() {
    if (this.editor) {
      this.hadEditor = true;
      this.updateDecorations();
      if (this.debug) console.log(`send doc_check for ${this.uri}:${this.version}`);
      this.server.sendMsg({ kind: "doc_check", version: this.version, uri: this.uriStr, len: this.text.length });
    } else if (this.hadEditor) {
      // had an editor but not anymore: cancel any lingering computation
      this.hadEditor = false;
      this.curDecorations = [];
      if (this.debug) console.log(`send doc_cancel for ${this.uri}:${this.version}`);
      this.server.sendMsg({ kind: "doc_cancel", version: this.version, uri: this.uriStr });
    }
  }
  public get hasEditor(): boolean {
    return this.editor !== undefined;
  }
  public get version(): number {
    return this.curVersion;
  }
  public get document(): vscode.TextDocument {
    return this.doc;
  }
  public get text(): string {
    return this.doc.getText();
  }
  public addDiagnostic(version: number, d: vscode.Diagnostic) {
    if (version === this.version && this.hasEditor) {
      this.curDiags.push(d);
      // update the diagnostic collection
      this.server.diagnostics.set(this.uri, this.curDiags);
    }
  }
  public addDecoration(version: number, d: vscode.DecorationOptions) {
    if (version === this.version && this.hasEditor) {
      this.curDecorations.push(d);
      this.updateDecorations();
    }
  }
  public updateDecorations() {
    if (this.editor) this.editor.setDecorations(this.server.decoration, this.curDecorations);
  }
  private cleanAll() {
    // clear diagnostics and decorations
    this.curDiags.length = 0;
    this.server.diagnostics.delete(this.uri);
    this.curDecorations.length = 0;
    if (this.editor) {
      this.editor.setDecorations(this.server.decoration, []);
    }
  }
  public updateDoc(d: vscode.TextDocument) {
    assert(d.uri.fsPath === this.uriStr && d.version >= this.version); // same doc
    if (this.server.debug) {
      console.log(`docstate[uri=${d.uri.fsPath}]: update to v${d.version} (current v${this.version})`);
    }
    if (d.version > this.version) {
      this.cleanAll();
    }
    this.doc = d;
    this.curVersion = d.version;
  }
  public dispose() {
    this.cleanAll();
  }
}

const PING_FREQ = 20 * 1000; // in ms
const MAX_EPOCH_MISSED = 3; // maximum number of missed "ping" we accept before concluding the server is dead

export interface ImandraServerConfig {
  debug: boolean;
  serverPath: string;
}

export const defaultImandraServerConfig: ImandraServerConfig = {
  serverPath: "imandra-vscode-server",
  debug: false,
};

/**
 * A connection to imandra-vscode-server, as well as the current
 * set of active documents/editors
 */
export class ImandraServerConn implements vscode.Disposable {
  private config: ImandraServerConfig;
  private st: state = state.Start;
  private subprocConn: undefined | net.Socket;
  private subproc: undefined | proc.ChildProcess; // connection to imandra server
  private server: net.Server; // listen for a connection from imandra
  private docs: Map<string, DocState> = new Map(); // set of active docs, by their uri string
  private subscriptions: vscode.Disposable[] = [];
  private pingEpoch: number = 0;
  private lastPongEpoch: number = 0;
  public diagnostics: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection("imandra");
  public decoration: vscode.TextEditorDecorationType;
  private procDie: vscode.EventEmitter<void> = new vscode.EventEmitter();

  public get debug(): boolean {
    return this.config.debug;
  }

  // setup connection to imandra-vscode-server
  private setupConn(subproc: proc.ChildProcess, sock: net.Socket) {
    this.subproc = subproc;
    this.subprocConn = sock;
    if (this.subproc.pid) {
      this.st = state.Connected;
    } else {
      this.st = state.Disposed;
      return;
    }
    sock.setNoDelay();
    sock.setKeepAlive(true);
    this.subproc.on("close", (code, signal) => {
      console.log(`imandra-vscode closed with code=${code}, signal=${signal}`);
      this.dispose();
    });
    this.subproc.on("exit", code => {
      console.log(`imandra-vscode exited with ${code}`);
      this.dispose();
    });
    sock.on("data", j => {
      if (this.debug) console.log(`got message from imandra: ${j}`);
      for (let line of j.toString().split("\n")) {
        line = line.trim();
        if (line === "") continue;
        try {
          const res = JSON.parse(line) as response.Res;
          this.handleRes(res);
        } catch (e) {
          console.log(`could not parse message's line "${line}" as json`);
        }
      }
    });
    // regularly ping the server
    const timer = setInterval(() => {
      if (!this.connected()) return;
      const missed = this.pingEpoch - this.lastPongEpoch;
      if (missed > MAX_EPOCH_MISSED) {
        console.log(`missed ${missed} "ping" epochs, consider the server as dead`);
        this.dispose();
      }
      this.sendMsg({ kind: "ping", epoch: ++this.pingEpoch });
    }, PING_FREQ);
    this.subscriptions.push(
      new vscode.Disposable(() => {
        console.log("kill ping timer");
        clearInterval(timer);
      }),
    );
  }

  /// Triggered when the subprocess died
  public get onProcDied(): vscode.Event<void> {
    return this.procDie.event;
  }

  public constructor(config: ImandraServerConfig, ctx: vscode.ExtensionContext) {
    this.config = config;
    this.server = net.createServer();
    const decoStyle: vscode.DecorationRenderOptions = {
      //backgroundColor: new vscode.ThemeColor("editor.wordHighlightBackground"),
      overviewRulerColor: "green",
      gutterIconPath: ctx.asAbsolutePath(path.join("assets", "imandra-smile.png")),
      gutterIconSize: "70%",
      outlineColor: "green",
    };
    this.decoration = vscode.window.createTextEditorDecorationType(decoStyle);
  }

  public dispose() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions.length = 0;
    this.docs.forEach((d, _) => d.dispose());
    this.diagnostics.clear();
    // idempotent disposal
    if (this.st !== state.Disposed) {
      console.log("disconnecting imandra-vscode-server…");
      this.st = state.Disposed;
      if (this.subproc) {
        const subproc = this.subproc;
        // give a bit of time to subprocess to catch up before killing it
        setTimeout(() => {
          try {
            subproc.kill();
          } catch (_) {}
        }, 800);
      }
      this.subproc = undefined;

      this.server.close();
      this.procDie.fire(); // notify
    }
  }

  public connected(): boolean {
    return this.st === state.Connected;
  }

  /// Send a message to the underlying server.
  public async sendMsg(m: msg.Msg): Promise<void> {
    const conn = this.subprocConn;
    if (!this.connected() || conn === undefined) {
      console.log("do not send message, imandra-vscode disconnected");
      throw new Error("imandra-vscode disconnected");
    }
    const j = JSON.stringify(m);
    //console.log(`send msg ${j}`);
    const isDone = conn.write(j);
    if (!isDone) {
      await promisify(f => conn.once("drain", () => f(null, {})));
    }
    return;
  }

  private async sendDoc(d: vscode.TextDocument) {
    const key = d.uri.fsPath;
    const reason = key.endsWith(".ire") || key.endsWith(".re");
    await this.sendMsg({
      kind: "doc_add",
      uri: key,
      reason,
      version: d.version,
      text: d.getText(),
    });
  }

  private async addDoc(d: vscode.TextDocument) {
    if (!isDocIml(d)) return;
    const key = d.uri.fsPath;
    const isNew = !this.docs.has(key);
    // insert a new docstate
    this.docs.set(key, new DocState(d, this));
    assert(isNew);
    await this.sendDoc(d);
  }

  private async removeDoc(d: vscode.TextDocument) {
    if (!isDocIml(d)) return;
    const key = d.uri.fsPath;
    const dSt = this.docs.get(key);
    if (dSt) {
      this.docs.delete(key);
      dSt.dispose();
      await this.sendMsg({ kind: "doc_remove", uri: key });
    }
  }

  private async changeDoc(d: vscode.TextDocumentChangeEvent) {
    if (!isDocIml(d.document)) return;
    console.log(`[connected: ${this.connected()}]: change doc ${d.document.uri} version ${d.document.version}`);
    const key = d.document.uri.fsPath;
    let needsMsg = true;
    const newVersion = d.document.version;
    // update stored document
    const dState = this.docs.get(key);
    if (dState) {
      if (dState.version === newVersion) needsMsg = false;
      dState.updateDoc(d.document);
    }
    if (dState && needsMsg) {
      const changes: msg.IDocChange[] = [];
      for (const { text, range, rangeLength } of d.contentChanges) {
        changes.push({
          range: RangeToIRange(range),
          rangeLen: rangeLength,
          text,
        });
      }
      await this.sendMsg({
        kind: "doc_update",
        uri: key,
        changes,
        version: d.document.version,
      });
      // basic debounce: wait to see if there's another update within 300ms,
      // in which case, it'll do the `check` call. Otherwise we ask to check this version.
      setTimeout(() => {
        if (dState.version === newVersion && dState.hasEditor) {
          this.sendMsg({
            kind: "doc_check",
            uri: key,
            version: newVersion,
            len: d.document.getText().length,
          });
        }
      }, 300);
    }
  }

  private async changeVisibleEditors(eds: vscode.TextEditor[]) {
    this.docs.forEach((d, _) => d.resetEditor()); // clear current editor
    for (const ed of eds) {
      const key = ed.document.uri.fsPath;
      const d = this.docs.get(key);
      if (d) {
        d.setEditor(ed);
      }
    }
    this.docs.forEach((d, _) => d.updateEditor());
  }

  // handle messages from imandra-vscode
  private async handleRes(res: response.Res) {
    switch (res.kind) {
      case "valid": {
        if (this.debug) console.log(`res (v${res.version}): valid! (range ${inspect(res.range)})`);
        const d = this.docs.get(res.uri);
        if (d) {
          const r = IRangeToRange(res.range);
          const deco = {
            range: r,
            hoverMessage: res.msg,
          };
          d.addDecoration(res.version, deco);
        }
        return;
      }
      case "error": {
        if (this.debug) console.log(`res (v${res.version}): error! (range ${inspect(res.range)})`);
        const d = this.docs.get(res.uri);
        if (d) {
          const r = IRangeToRange(res.range);
          const sev = vscode.DiagnosticSeverity.Error;
          const diag = new vscode.Diagnostic(r, res.msg, sev);
          diag.source = "imandra";
          d.addDiagnostic(res.version, diag);
        }
        return;
      }
      case "warning": {
        if (this.debug) console.log(`res (v${res.version}): warning! (range ${inspect(res.range)})`);
        const d = this.docs.get(res.uri);
        if (d) {
          const r = IRangeToRange(res.range);
          const sev = vscode.DiagnosticSeverity.Warning;
          const diag = new vscode.Diagnostic(r, res.msg, sev);
          diag.source = "imandra";
          d.addDiagnostic(res.version, diag);
        }
        return;
      }
      case "ack": {
        const d = this.docs.get(res.uri);
        if (this.debug) console.log(`got ack for document update version: ${res.version} uri: "${res.uri}"`);
        assert(!d || res.version <= d.version); // no docs from the future
        if (d && d.version === res.version) {
          // check that length corresponds, just to be sure
          const text = d.text;
          const expectedLen = text.length;
          if (expectedLen !== res.len) {
            console.log(`ack: expected len ${expectedLen}, reported len ${res.len}. Resend.`);
            this.sendDoc(d.document); // send again
            return;
          }
          const expectedMd5 = crypto
            .createHash("md5")
            .update(text)
            .digest("hex");
          if (expectedLen !== res.len) {
            console.log(`ack: expected md5 ${expectedMd5}, reported md5 ${res.md5}. Resend.`);
            this.sendDoc(d.document); // send again
            return;
          }
        }
        console.log("document is correct");
        return;
      }
      case "resend": {
        // imandra is desync'd, resend this doc
        const d = this.docs.get(res.uri);
        if (d) {
          this.sendDoc(d.document);
        }
        return;
      }
      case "pong": {
        // console.log(`got pong from client with epoch=${res.epoch}`);
        this.lastPongEpoch = Math.max(this.lastPongEpoch, res.epoch);
        return;
      }
      case "version": {
        if (res.v !== CUR_PROTOCOL_VERSION) {
          console.log(`error: imandra-server has version ${res.v}, not ${CUR_PROTOCOL_VERSION} as expected`);
          this.dispose();
        }
        return;
      }
      default: {
        const _exhaustiveCheck: never = res;
        return _exhaustiveCheck;
      }
    }
  }

  /// attach to changes in documents
  public async init(onConn: (_: boolean) => void) {
    // listen on random port
    console.log("connecting to imandra-vscode-server...");
    // TODO: use `opam exec -- imandra-vscode-server` instead
    await listenPromise(this.server);
    const port = this.server.address().port;
    const args = [...(this.debug ? ["-d", "4"] : []), "--host", "127.0.0.1", "--port", port.toString()];
    //console.log("call imandra-vscode-server with args ", args);
    const sockP = waitForConnectionPromise(this.server);
    const subproc = proc.spawn(this.config.serverPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    if (!subproc.pid) {
      onConn(false);
      this.dispose();
      return;
    }
    if (this.debug) {
      subproc.stderr.on("data", msg => console.log(`imandra.stderr: ${msg}`));
      subproc.stdout.on("data", msg => console.log(`imandra.stdout: ${msg}`));
    }
    console.log(`waiting for connection (pid: ${subproc.pid})...`);
    const sock = await sockP;
    console.log("got connection!");
    if (this.subprocConn === undefined) {
      this.setupConn(subproc, sock);
    }
    console.log(`state: ${state[this.st]}, PID ${this.subproc ? this.subproc.pid : 0}`);
    if (this.connected()) {
      for (const d of vscode.workspace.textDocuments) this.addDoc(d); // add existing docs
      vscode.workspace.onDidOpenTextDocument(this.addDoc, this, this.subscriptions);
      vscode.workspace.onDidCloseTextDocument(this.removeDoc, this, this.subscriptions);
      vscode.workspace.onDidChangeTextDocument(this.changeDoc, this, this.subscriptions);
      await this.changeVisibleEditors(vscode.window.visibleTextEditors);
      vscode.window.onDidChangeVisibleTextEditors(this.changeVisibleEditors, this, this.subscriptions);
    }
    onConn(this.connected());
  }
}

const MAX_RESTARTS: number = 5;
const RESTART_LIMIT_TIMEOUT_S = 30;

/**
 * A long-lived wrapper that maintains an `ImandraServerConn` and restarts
 * it when needed.
 */
export class ImandraServer implements vscode.Disposable {
  private conn?: ImandraServerConn; // current connection
  private config: ImandraServerConfig;
  private ctx: vscode.ExtensionContext;
  private nRestarts = 0;
  private lastSuccessfulStart = Date.now();
  private status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  private subscriptions: vscode.Disposable[] = [];

  private setStatus(ok: boolean) {
    if (ok) {
      this.status.text = "[imandra-server: active ✔]";
      this.status.tooltip = "Connection to imandra-vscode-server established";
      this.status.command = "imandra.server.reload";
    } else {
      this.status.text = "[imandra-server: dead ×]";
      this.status.tooltip = `Lost connection to imandra-vscode-server (${this.nRestarts} restarts)`;
    }
    this.status.show();
  }

  private async trySync() {
    if (this.conn) {
      console.log("send `sync` message");
      try {
        await this.conn.sendMsg("cache_sync");
      } catch {}
    }
  }

  // restart connection
  private restart() {
    if (this.conn) {
      this.trySync();
      this.conn.dispose();
      this.conn = undefined;
    }
    this.nRestarts = 0;
    this.setStatus(false);
    this.setupConn();
  }

  private setupConn() {
    if (this.conn && this.conn.connected()) return; // already there
    const timeSince = Date.now() - this.lastSuccessfulStart;
    if (this.nRestarts > MAX_RESTARTS && timeSince < RESTART_LIMIT_TIMEOUT_S) {
      console.log(`did ${this.nRestarts} restarts of imandra-vscode-server within ${timeSince}s, give up`);
      this.conn = undefined;
      this.setStatus(false);
      return;
    }
    this.conn = new ImandraServerConn(this.config, this.ctx);
    this.conn.onProcDied(() => {
      this.conn = undefined;
      this.setStatus(false);
      this.nRestarts++;

      // try to restart in a little while
      setTimeout(() => {
        console.log("try to restart imandra-vscode-server");
        this.setupConn();
      }, 5 * 1000);
    });
    // now start the connection
    this.conn.init(ok => {
      this.setStatus(ok);
      if (ok) {
        this.nRestarts = 0;
        this.lastSuccessfulStart = Date.now();
      } else {
        this.conn = undefined;
      }
    });
  }

  public init() {
    console.log("init imandra server...");
    this.subscriptions.push(
      vscode.commands.registerCommand("imandra.server.reload", () => {
        console.log("imandra.server.reload called");
        this.restart();
      }),
      vscode.commands.registerCommand("imandra.server.cache.clear", () => {
        console.log("imandra.server.cache.clear called");
        if (this.conn) this.conn.sendMsg("cache_clear");
      }),
      vscode.commands.registerCommand("imandra.server.cache.sync", () => {
        console.log("imandra.server.cache.sync called");
        if (this.conn) this.conn.sendMsg("cache_sync");
      }),
    );
    this.setupConn();
  }

  constructor(ctx: vscode.ExtensionContext, config?: ImandraServerConfig) {
    this.ctx = ctx;
    this.config = { ...defaultImandraServerConfig, ...config };
    this.status.hide();
  }

  public async dispose() {
    this.status.dispose();
    this.subscriptions.forEach(d => d.dispose());
    this.subscriptions.length = 0;
    if (this.conn) {
      await this.trySync();
      this.conn.dispose();
      this.conn = undefined;
    }
  }
}

let cur: ImandraServer | null = null;

export async function launch(ctx: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const imandraConfig = vscode.workspace.getConfiguration("imandra");
  const config = {
    ...defaultImandraServerConfig,
    debug: imandraConfig.get<boolean>("debug.imandra-vscode-server", false),
    serverPath: imandraConfig.get<string>("path.imandra-vscode-server", "imandra-vscode-server"),
  };
  console.log(`imandra.debug: ${config.debug}`);
  const server = new ImandraServer(ctx, config);
  if (cur) cur.dispose();
  cur = server;
  server.init();
  return Promise.resolve(server);
}

export async function deactivate() {
  if (cur) {
    await cur.dispose();
  }
  cur = null;
}
