import * as lodash from "lodash";
import * as LSP from "vscode-languageserver-protocol";
import Session from "./index";
export default class Analyzer implements LSP.Disposable {
    private readonly session;
    readonly refreshImmediate: ((event: LSP.TextDocumentIdentifier) => Promise<void>);
    readonly refreshDebounced: ((event: LSP.TextDocumentIdentifier) => Promise<void>) & lodash.Cancelable;
    private readonly bsbDiagnostics;
    constructor(session: Session);
    clear({uri}: LSP.TextDocumentIdentifier): void;
    dispose(): void;
    initialize(): Promise<void>;
    onDidChangeConfiguration(): void;
    refreshWithKind(syncKind: LSP.TextDocumentSyncKind): (id: LSP.TextDocumentIdentifier) => Promise<void>;
}
