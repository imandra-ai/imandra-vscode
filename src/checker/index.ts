import * as vscode from "vscode";
import * as proc from "child_process";
import { promisify } from "util";
import * as assert from "assert";
import { DiagnosticSeverity } from "vscode-languageclient";

enum state {
  Start,
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

const PosToIPos = (p: vscode.Position): IPosition => {
  return { line: p.line, char: p.character };
};
export const RangeToIRange = (r: vscode.Range): IRange => {
  return { start: PosToIPos(r.start), end: PosToIPos(r.end) };
};

const IPosToPos = (p: IPosition): vscode.Position => {
  return new vscode.Position(p.line, p.char);
};
const IRangeToRange = (r: IRange): vscode.Range => {
  return new vscode.Range(IPosToPos(r.start), IPosToPos(r.end));
};

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
  private _diagnostics: vscode.Diagnostic[] = [];
  private _doc: vscode.TextDocument;
  private _diagsColl: vscode.DiagnosticCollection;
  constructor(d: vscode.TextDocument, diags: vscode.DiagnosticCollection) {
    this._doc = d;
    this._diagsColl = diags;
  }
  public uri(): vscode.Uri {
    return this._doc.uri;
  }
  public uriStr(): string {
    return this._doc.uri.toString();
  }
  public version(): number {
    return this._doc.version;
  }
  public getText(): string {
    return this._doc.getText();
  }
  public diagnostics(): vscode.Diagnostic[] {
    return this._diagnostics;
  }
  public addDiagnostic(version: number, d: vscode.Diagnostic) {
    if (version === this.version()) {
      this._diagnostics.push(d);
      // update the diagnostic collection
      this._diagsColl.delete(this._doc.uri);
      this._diagsColl.set(this.uri(), this._diagnostics);
    }
  }
  public updateDoc(d: vscode.TextDocument) {
    const curVer = this.version();
    assert(d.uri.toString() === this.uriStr() && d.version >= curVer); // same doc
    this._doc = d;
    if (d.version > curVer) {
      // clear diagnostics
      this._diagnostics.length = 0;
      this._diagsColl.delete(this.uri());
    }
  }
  public dispose() {
    this._diagsColl.delete(this.uri()); // clear diagnostics for this document
  }
}

const PING_FREQ = 5 * 1000; // in seconds
const MAX_EPOCH_MISSED = 6; // maximum number of missed "ping" we accept before concluding the server is dead

export class ImandraServer implements vscode.Disposable {
  private st: state = state.Start;
  private subproc: proc.ChildProcess; // connection to imandra server
  private docs: Map<string, DocState> = new Map(); // set of active docs, by their uri string
  private subscriptions: vscode.Disposable[] = [];
  private diagnostics: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection("imandra");
  private pingEpoch: number = 0;
  private lastPongEpoch: number = 0;

  // setup connection to imandra-vscode-server
  private setupConn() {
    this.subproc.on("close", (code, signal) => {
      console.log(`imandra-vscode closed with code=${code}, signal=${signal}`);
      this.st = state.Disposed;
    });
    this.subproc.on("exit", code => {
      console.log(`imandra-vscode exited with ${code}`);
      this.st = state.Disposed;
      this.subproc.kill();
    });
    this.subproc.stdout.on("data", j => {
      console.log(`got message from imandra: ${j}`);
      const res = JSON.parse(j.toString()) as response.Res;
      this.handleRes(res);
    });
    // regularly ping the server
    const timer = setInterval(() => {
      const missed = this.pingEpoch - this.lastPongEpoch;
      if (missed > MAX_EPOCH_MISSED) {
        console.log(`missed ${missed} "ping" epochs, consider the server is dead`);
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

  public constructor() {
    console.log("connecting to imandra server...");
    const opts = ["-d", "4"];
    // TODO: use `opam exec imandra-vscode-server` instead
    this.subproc = proc.spawn("imandra-vscode-server", opts);
    if (this.subproc.pid) {
      this.setupConn();
      this.st = state.Connected;
    } else {
      this.st = state.Disposed;
    }
    console.log(`state: ${state[this.st]}, PID ${this.subproc ? this.subproc.pid : 0}`);
  }

  public dispose() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions.length = 0;
    if (this.st === state.Connected) {
      this.st = state.Disposed;
      this.subproc.kill();
    }
  }

  public connected(): boolean {
    return this.st === state.Connected;
  }

  /// Send a message to the underlying server.
  public async sendMsg(m: msg.Msg): Promise<void> {
    if (!this.connected()) {
      console.log("do not send message, imandra-vscode disconnected");
      throw new Error("imandra-vscode disconnected");
    }
    const j = JSON.stringify(m);
    //console.log(`send msg ${j}`);
    const isDone = this.subproc.stdin.write(j);
    if (!isDone) {
      await promisify(f => this.subproc.stdin.once("drain", () => f(null, {})));
    }
    return;
  }

  private async addDoc(d: vscode.TextDocument) {
    const key = d.uri.toString();
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
    const key = d.uri.toString();
    const dSt = this.docs.get(key);
    if (dSt) {
      this.docs.delete(key);
      dSt.dispose();
      await this.sendMsg({ kind: "doc_remove", uri: key });
    }
  }

  private async changeDoc(d: vscode.TextDocumentChangeEvent) {
    console.log(`[connected: ${this.connected()}]: change doc ${d}`);
    const key = d.document.uri.toString();
    {
      // update stored document
      const dState = this.docs.get(key);
      if (dState) dState.updateDoc(d.document);
    }
    await this.sendMsg({
      kind: "doc_update",
      uri: d.document.uri.toString(),
      new_content: d.document.getText(),
      version: d.document.version,
    });
  }

  // handle messages from imandra-vscode
  private handleRes(res: response.Res) {
    switch (res.kind) {
      case "valid": {
        console.log("res: valid!");
        const d = this.docs.get(res.uri);
        if (d) {
          const r = IRangeToRange(res.range);
          const sev = DiagnosticSeverity.Information;
          const diag = new vscode.Diagnostic(r, res.msg, sev);
          d.addDiagnostic(res.version, diag);
        }
        return;
      }
      case "error": {
        console.log("res: error");
        const d = this.docs.get(res.uri);
        if (d) {
          const r = IRangeToRange(res.range);
          const sev = DiagnosticSeverity.Error;
          const diag = new vscode.Diagnostic(r, res.msg, sev);
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
  public init() {
    vscode.workspace.onDidOpenTextDocument(this.addDoc, this, this.subscriptions);
    vscode.workspace.onDidCloseTextDocument(this.removeDoc, this, this.subscriptions);
    vscode.workspace.onDidChangeTextDocument(this.changeDoc, this, this.subscriptions);
  }
}

export async function launch(_ctx: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const server = new ImandraServer();
  server.init();
  return Promise.resolve(server);
}
