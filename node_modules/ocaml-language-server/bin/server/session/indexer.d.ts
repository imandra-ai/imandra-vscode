/// <reference types="lokijs" />
import * as LSP from "vscode-languageserver-protocol";
import Session from "./index";
export default class Indexer implements LSP.Disposable {
    private readonly session;
    populated: boolean;
    private readonly db;
    private readonly symbols;
    constructor(session: Session);
    dispose(): void;
    findSymbols(query: LokiQuery): LSP.SymbolInformation[];
    indexSymbols(id: LSP.TextDocumentIdentifier): Promise<void | LSP.ResponseError<void>>;
    initialize(): Promise<void>;
    populate(origin: LSP.TextDocumentIdentifier): Promise<void>;
    refreshSymbols(id: LSP.TextDocumentIdentifier): Promise<void | LSP.ResponseError<void>>;
    removeSymbols({uri}: LSP.TextDocumentIdentifier): void;
}
