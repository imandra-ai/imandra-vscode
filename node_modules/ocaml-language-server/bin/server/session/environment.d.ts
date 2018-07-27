/// <reference types="node" />
import * as childProcess from "child_process";
import * as LSP from "vscode-languageserver-protocol";
import Session from "./index";
export default class Environment implements LSP.Disposable {
    private readonly session;
    static pathToUri(path: string): LSP.TextDocumentIdentifier;
    static uriToPath({uri}: LSP.TextDocumentIdentifier): string;
    private projectCommandWrapper;
    constructor(session: Session);
    initialize(): Promise<void>;
    dispose(): void;
    relativize(id: LSP.TextDocumentIdentifier): string | undefined;
    spawn(command: string, args?: string[], options?: childProcess.SpawnOptions): childProcess.ChildProcess;
    workspaceRoot(): string | null | undefined;
    private projectCommandWrapperPath(workspaceRoot);
    private determineCommandWrapper();
}
