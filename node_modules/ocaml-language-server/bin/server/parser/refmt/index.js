"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver-protocol");
const shared_1 = require("../shared");
const createRefmtDiagnostic = shared_1.createDiagnostic("refmt");
function parseErrors(refmtOutput) {
    const parsedDiagnostics = [];
    const reErrors = new RegExp([/File "(.*)", line (\d*), characters (\d*)-(\d*):[\s\S]*?(?:Error|Warning \d+): ([\s\S]*)/]
        .map(r => r.source)
        .join(""), "g");
    let errorMatch;
    while ((errorMatch = reErrors.exec(refmtOutput))) {
        const startLine = Number(errorMatch[2]) - 1;
        const endLine = Number(errorMatch[2]) - 1;
        const startCharacter = Number(errorMatch[3]);
        const endCharacter = Number(errorMatch[4]);
        const message = errorMatch[5].trim();
        const severity = /^Warning number \d+/.exec(errorMatch[0])
            ? LSP.DiagnosticSeverity.Warning
            : LSP.DiagnosticSeverity.Error;
        const diagnostic = createRefmtDiagnostic(message, startCharacter, startLine, endCharacter, endLine, severity);
        parsedDiagnostics.push(diagnostic);
    }
    return parsedDiagnostics;
}
exports.parseErrors = parseErrors;
//# sourceMappingURL=index.js.map