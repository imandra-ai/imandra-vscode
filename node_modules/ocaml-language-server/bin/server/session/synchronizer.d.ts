import * as LSP from "vscode-languageserver-protocol";
import Session from "./index";
export default class Synchronizer implements LSP.Disposable {
    private readonly session;
    readonly documents: Map<string, LSP.TextDocument>;
    constructor(session: Session);
    dispose(): void;
    initialize(): Promise<void>;
    listen(): void;
    onDidChangeConfiguration(): void;
    getTextDocument(uri: string): null | LSP.TextDocument;
    private applyChangesToTextDocumentContent(oldDocument, change);
    private doFullSync(document, languageId, content);
    private doIncrementalSync(oldDocument, newDocument, change);
    private onDidChangeTextDocument(event);
    private onDidOpenTextDocument(event);
    private onDidCloseTextDocument(event);
    private onDidSaveTextDocument(event);
}
