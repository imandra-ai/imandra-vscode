import * as vscode from "vscode";
import * as proc from "child_process";

enum state { Start, Connected, Disposed }

export class ImandraServer implements vscode.Disposable {
  private _st: state = state.Start;
  private _conn: proc.ChildProcess; // connection to imandra server

  public constructor() {
    console.log("connecting to imandra server...");
    this._conn = proc.spawn("imandra-vscode-server", [], { stdio: "pipe" });
    this._st = this._conn.pid === undefined ? state.Disposed : state.Connected;
    console.log(`state: ${this._st}, PID ${this._conn ? this._conn.pid : 0}`);
  }

  public dispose() {
    if (this._st === state.Connected) {
      this._st = state.Disposed;
      this._conn.kill();
    }
  }
}

export async function launch(_context: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const server = new ImandraServer();
  return Promise.resolve(server);
}
