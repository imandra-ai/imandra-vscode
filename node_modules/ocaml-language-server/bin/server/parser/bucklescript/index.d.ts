import * as LSP from "vscode-languageserver-protocol";
export declare function parseErrors(bsbOutput: string): {
    [key: string]: LSP.Diagnostic[];
};
