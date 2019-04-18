import * as vscode from "vscode";
import * as proc from "child_process";
import { promisify } from "util";
import * as assert from "assert";

enum state {
  Start,
  Connected,
  Disposed,
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

  /** Main interface for queries sent to imandra-vscode-server */
  export type Msg = IDocAdd | IDocRemove | IDocUpdate;
}

// responses from Imandra
namespace response {
  export interface IPosition {
    col: number;
    char: number;
  }
  export interface IRange {
    start: IPosition;
    end: IPosition;
  }

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

  export type Res = IError | IValid | IAck;
}

export class ImandraServer implements vscode.Disposable {
  private _st: state = state.Start;
  private _subproc: proc.ChildProcess; // connection to imandra server
  private _docs: Map<string, vscode.TextDocument> = new Map(); // set of active docs, by their uri string
  private _disps: vscode.Disposable[] = [];

  // setup connection to imandra-vscode-server
  private setupConn() {
    this._subproc.on("close", code => {
      console.log(`imandra-vscode exited with ${code}`);
      this._st = state.Disposed;
    });
    this._subproc.on("exit", code => {
      console.log(`imandra-vscode exited with ${code}`);
      this._st = state.Disposed;
      this._subproc.kill();
    });
    this._subproc.stdout.on("data", j => {
      console.log(`got message from imandra: ${j}`);
      const res = JSON.parse(j.toString()) as response.Res;
      console.log(`decoded response: ${res}`);
      this.handleRes(res);
    });
  }

  public constructor() {
    console.log("connecting to imandra server...");
    const opts = ["-d", "4"];
    // TODO: use `opam exec imandra-vscode-server` instead
    this._subproc = proc.spawn("imandra-vscode-server", opts);
    if (this._subproc.pid) {
      this.setupConn();
      this._st = state.Connected;
    } else {
      this._st = state.Disposed;
    }
    console.log(`state: ${state[this._st]}, PID ${this._subproc ? this._subproc.pid : 0}`);
  }

  public dispose() {
    this._disps.forEach(x => x.dispose());
    this._disps.length = 0;
    if (this._st === state.Connected) {
      this._st = state.Disposed;
      this._subproc.kill();
    }
  }

  public connected(): boolean {
    return this._st === state.Connected;
  }

  /// Send a message to the underlying server.
  public async sendMsg(m: msg.Msg): Promise<void> {
    if (!this.connected()) {
      console.log("do not send message, imandra-vscode disconnected");
      throw new Error("imandra-vscode disconnected");
    }
    const j = JSON.stringify(m);
    //console.log(`send msg ${j}`);
    const isDone = this._subproc.stdin.write(j);
    if (!isDone) {
      await promisify(f => this._subproc.stdin.once("drain", () => f(null, {})));
    }
    return;
  }

  private async addDoc(d: vscode.TextDocument) {
    const key = d.uri.toString();
    const isNew = !this._docs.has(key);
    this._docs.set(key, d);
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
    if (this._docs.has(key)) {
      this._docs.delete(key);
      await this.sendMsg({ kind: "doc_remove", uri: key });
    }
  }

  private async changeDoc(d: vscode.TextDocumentChangeEvent) {
    console.log(`[connected: ${this.connected()}]: change doc ${d}`);
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
        return;
      }
      case "error": {
        console.log("res: error");
        return;
      }
      case "ack": {
        const d = this._docs.get(res.uri);
        if (d && d.version === res.version) {
          // check that length corresponds, just to be sure
          assert(d.getText().length === res.len);
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
  public init() {
    vscode.workspace.onDidOpenTextDocument(this.addDoc, this, this._disps);
    vscode.workspace.onDidCloseTextDocument(this.removeDoc, this, this._disps);
    vscode.workspace.onDidChangeTextDocument(this.changeDoc, this, this._disps);
  }
}

export async function launch(_ctx: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const server = new ImandraServer();
  server.init();
  return Promise.resolve(server);
}
