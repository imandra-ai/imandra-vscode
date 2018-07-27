import * as LSP from "vscode-languageserver-protocol";
export declare const createDiagnostic: (source: "refmt" | "bucklescript") => (message: string, startCharacter: number, startLine: number, endCharacter: number, endLine: number, severity: LSP.DiagnosticSeverity) => {
    code: string;
    message: string;
    range: {
        end: {
            character: number;
            line: number;
        };
        start: {
            character: number;
            line: number;
        };
    };
    severity: LSP.DiagnosticSeverity;
    source: "refmt" | "bucklescript";
};
