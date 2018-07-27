/// <reference types="node" />
import { ChildProcess } from "child_process";
import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";
export default class ReFMT {
    readonly process: ChildProcess;
    constructor(session: Session, id?: LSP.TextDocumentIdentifier, argsOpt?: string[]);
}
