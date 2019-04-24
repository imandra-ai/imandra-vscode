"use strict";

import * as vscode from "vscode";
import * as proc from "child_process";
import * as net from "net";
import { promisify, inspect } from "util";
import * as assert from "assert";

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
  return d.fileName.includes(".iml"); // TODO: improve on that!
}

// messages to imandra
namespace msg {
  export interface IDocAdd {
    kind: "doc_add";
    uri: string;
    version: number;
    text: string;
  }

  export interface IDocRemove {
    kind: "doc_remove";
    uri: string;
  }

  // NOTE: non incremental, resends the whole doc. TODO: send patches instead.
  export interface IDocUpdate {
    kind: "doc_update";
    uri: string;
    version: number;
    new_content: string;
  }

  export interface IPing {
    kind: "ping";
    epoch: number;
  }

  /** Main interface for queries sent to imandra-vscode-server */
  export type Msg = IDocAdd | IDocRemove | IDocUpdate | IPing;
}

// responses from Imandra
namespace response {
  export interface IValid {
    kind: "valid";
    range: IRange;
    uri: string;
    version: number;
    msg: string;
  }

  export interface IError {
    kind: "error";
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
  }

  export interface IPong {
    kind: "pong";
    epoch: number;
  }

  /** A response from imandra */
  export type Res = IError | IValid | IAck | IPong;
}

/**
 * A document with its current list of diagnostics.
 */
class DocState implements vscode.Disposable {
  private curDiags: vscode.Diagnostic[] = [];
  private doc: vscode.TextDocument;
  private diagsColl: vscode.DiagnosticCollection;
  constructor(d: vscode.TextDocument, diags: vscode.DiagnosticCollection) {
    this.doc = d;
    this.diagsColl = diags;
  }
  public uri(): vscode.Uri {
    return this.doc.uri;
  }
  public uriStr(): string {
    return this.doc.uri.fsPath;
  }
  public version(): number {
    return this.doc.version;
  }
  public document(): vscode.TextDocument {
    return this.doc;
  }
  public getText(): string {
    return this.doc.getText();
  }
  public addDiagnostic(version: number, d: vscode.Diagnostic) {
    if (version === this.version()) {
      this.curDiags.push(d);
      // update the diagnostic collection
      this.diagsColl.set(this.uri(), this.curDiags);
    }
  }
  public updateDoc(d: vscode.TextDocument) {
    assert(d.uri.fsPath.toString() === this.uriStr() && d.version >= this.version()); // same doc
    this.doc = d;
    // clear diagnostics
    this.curDiags.length = 0;
    this.diagsColl.delete(this.uri());
  }
  public dispose() {
    this.diagsColl.delete(this.uri()); // clear diagnostics for this document
  }
}

const PING_FREQ = 20 * 1000; // in ms
const MAX_EPOCH_MISSED = 3; // maximum number of missed "ping" we accept before concluding the server is dead

export class ImandraServer implements vscode.Disposable {
  public serverPath: string = "imandra-vscode-server";
  private debug: boolean;
  private st: state = state.Start;
  private subprocConn: undefined | net.Socket;
  private subproc: undefined | proc.ChildProcess; // connection to imandra server
  private server: net.Server; // listen for a connection from imandra
  private docs: Map<string, DocState> = new Map(); // set of active docs, by their uri string
  private subscriptions: vscode.Disposable[] = [];
  private diagnostics: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection("imandra");
  private pingEpoch: number = 0;
  private lastPongEpoch: number = 0;
  private decoOk = vscode.window.createTextEditorDecorationType({ backgroundColor: "lightgreen" });
  // TODO: use it (textEditor.setDecorations) instead of diagnostics, for ok results

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
    this.subproc.on("close", (code, signal) => {
      console.log(`imandra-vscode closed with code=${code}, signal=${signal}`);
      this.st = state.Disposed;
    });
    this.subproc.on("exit", code => {
      console.log(`imandra-vscode exited with ${code}`);
      this.st = state.Disposed;
      subproc.kill();
    });
    sock.on("data", j => {
      if (this.debug) console.log(`got message from imandra: ${j}`);
      const res = JSON.parse(j.toString()) as response.Res;
      this.handleRes(res);
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

  public constructor(debug?: undefined | boolean) {
    if (debug === undefined) debug = true; // TODO: make it false by default
    this.debug = debug;
    this.server = net.createServer();
  }

  public dispose() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions.length = 0;
    this.server.close();
    if (this.connected() && this.subproc) {
      this.st = state.Disposed;
      this.subproc.kill();
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

  private async addDoc(d: vscode.TextDocument) {
    if (!isDocIml(d)) return;
    const key = d.uri.fsPath.toString();
    const isNew = !this.docs.has(key);
    // insert a new docstate
    this.docs.set(key, new DocState(d, this.diagnostics));
    assert(isNew);
    await this.sendMsg({
      kind: "doc_add",
      uri: key,
      version: d.version,
      text: d.getText(),
    });
  }

  private async removeDoc(d: vscode.TextDocument) {
    if (!isDocIml(d)) return;
    const key = d.uri.fsPath.toString();
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
    const key = d.document.uri.fsPath.toString();
    {
      // update stored document
      const dState = this.docs.get(key);
      if (dState) dState.updateDoc(d.document);
    }
    await this.sendMsg({
      kind: "doc_update",
      uri: d.document.uri.fsPath.toString(),
      new_content: d.document.getText(),
      version: d.document.version,
    });
  }

  // handle messages from imandra-vscode
  private handleRes(res: response.Res) {
    switch (res.kind) {
      case "valid": {
        console.log(`res: valid! (range ${inspect(res.range)})`);
        const d = this.docs.get(res.uri);
        if (d) {
          const r = IRangeToRange(res.range);
          const sev = vscode.DiagnosticSeverity.Information;
          const diag = new vscode.Diagnostic(r, res.msg, sev);
          //diag.source = "imandra";
          d.addDiagnostic(res.version, diag);
        }
        return;
      }
      case "error": {
        console.log(`res: error (range ${inspect(res.range)})`);
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
      case "ack": {
        const d = this.docs.get(res.uri);
        console.log(`got ack for document update version: ${res.version} uri: "${res.uri}"`);
        assert(!d || res.version <= d.version()); // no docs from the future
        if (d && d.version() === res.version) {
          // check that length corresponds, just to be sure
          const expectedLen = d.getText().length;
          assert(expectedLen === res.len, `expected len ${expectedLen}, reported len ${res.len}`);
        }
        return;
      }
      case "pong": {
        // console.log(`got pong from client with epoch=${res.epoch}`);
        this.lastPongEpoch = Math.max(this.lastPongEpoch, res.epoch);
        return;
      }
      default: {
        const _exhaustiveCheck: never = res;
        return _exhaustiveCheck;
      }
    }
  }

  /// attach to changes in documents
  public async init() {
    // listen on random port
    console.log("connecting to imandra-vscode-server...");
    // TODO: use `opam exec imandra-vscode-server` instead
    await listenPromise(this.server);
    const port = this.server.address().port;
    const args = [...(this.debug ? ["-d", "4"] : []), "--host", "127.0.0.1", "--port", port.toString()];
    //console.log("call imandra-vscode-server with args ", args);
    const sockP = waitForConnectionPromise(this.server);
    const subproc = proc.spawn(this.serverPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    if (!subproc.pid) {
      this.dispose();
      return;
    }
    subproc.stderr.on("data", msg => console.log(`imandra.stderr: ${msg}`));
    subproc.stdout.on("data", msg => console.log(`imandra.stdout: ${msg}`));
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
    }
  }
}

export async function launch(_ctx: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const imandraConfig = vscode.workspace.getConfiguration("imandra");
  const clientPath = imandraConfig.get<string>("path.imandra-vscode-server", "imandra-vscode-server");
  const debug = imandraConfig.get<boolean>("debug-vscode-server", false);
  const server = new ImandraServer(true || debug); // TODO: remove
  server.serverPath = clientPath;
  await server.init();
  return Promise.resolve(server);
}
