import * as LSP from "vscode-languageserver-protocol";

const capabilities: LSP.ServerCapabilities = {
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

export default capabilities;
