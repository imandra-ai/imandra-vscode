"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver-protocol");
const capabilities = {
    codeActionProvider: true,
    codeLensProvider: {
        resolveProvider: true,
    },
    completionProvider: {
        resolveProvider: true,
        triggerCharacters: ["."],
    },
    definitionProvider: true,
    documentFormattingProvider: true,
    documentHighlightProvider: true,
    documentSymbolProvider: true,
    hoverProvider: true,
    referencesProvider: true,
    renameProvider: true,
    textDocumentSync: LSP.TextDocumentSyncKind.Incremental,
    workspaceSymbolProvider: true,
};
exports.default = capabilities;
//# sourceMappingURL=capabilities.js.map