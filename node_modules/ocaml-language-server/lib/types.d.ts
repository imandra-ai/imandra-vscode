import * as LSP from "vscode-languageserver-protocol";
export interface ITextDocumentRange {
    range: LSP.Range;
    textDocument: LSP.TextDocumentIdentifier;
}
