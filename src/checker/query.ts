// import * as vscode from 'vscode';

/* Protocole to communicate with Imandra-vscode-server
 */

// TODO: communicate diff or whole buffers? see `TextDocument` and `vscode.TextDocumentChangeEvent`

export type Timestamp = number;

export interface IUpdateBuf {
  kind: "update_buf";
  text: string;
  ts: Timestamp;
}

/** Main interface for queries sent to imandra-vscode-server */
export type Query = IUpdateBuf;
