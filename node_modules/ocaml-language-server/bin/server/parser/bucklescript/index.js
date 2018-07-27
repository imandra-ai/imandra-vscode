"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver-protocol");
const shared_1 = require("../shared");
const createBucklescriptDiagnostic = shared_1.createDiagnostic("bucklescript");
function parseErrors(bsbOutput) {
    const parsedDiagnostics = {};
    const reLevel1Errors = new RegExp([
        /File "(.*)", line (\d*), characters (\d*)-(\d*):[\s\S]*?/,
        /(?:Error|Warning \d+): (?:([\s\S]*?)(?:We've found a bug for you!|File "|ninja: build stopped|\[\d\/\d] Building )|(.*?)\n\S)/,
    ]
        .map(r => r.source)
        .join(""), "g");
    let errorMatch;
    while ((errorMatch = reLevel1Errors.exec(bsbOutput))) {
        const fileUri = "file://" + errorMatch[1];
        const startLine = Number(errorMatch[2]) - 1;
        const endLine = Number(errorMatch[2]) - 1;
        const startCharacter = Number(errorMatch[3]);
        const endCharacter = Number(errorMatch[4]);
        const message = (errorMatch[5] || errorMatch[6]).trim();
        const severity = /^Warning number \d+/.exec(errorMatch[0])
            ? LSP.DiagnosticSeverity.Warning
            : LSP.DiagnosticSeverity.Error;
        const diagnostic = createBucklescriptDiagnostic(message, startCharacter, startLine, endCharacter, endLine, severity);
        if (!parsedDiagnostics[fileUri]) {
            parsedDiagnostics[fileUri] = [];
        }
        parsedDiagnostics[fileUri].push(diagnostic);
    }
    const reLevel2Errors = new RegExp([
        /(?:We've found a bug for you!|Warning number \d+)\n\s*/,
        /(.*) (\d+):(\d+)(?:-(\d+)(?::(\d+))?)?\n  \n/,
        /(?:.|\n)*?\n  \n/,
        /((?:.|\n)*?)/,
        /((?=We've found a bug for you!)|(?:\[\d+\/\d+\] (?:\x1b\[[0-9;]*?m)?Building)|(?:ninja: build stopped: subcommand failed)|(?=Warning number \d+)|$)/,
    ]
        .map(r => r.source)
        .join(""), "g");
    while ((errorMatch = reLevel2Errors.exec(bsbOutput))) {
        const fileUri = "file://" + errorMatch[1];
        const startLine = Number(errorMatch[2]) - 1;
        const startCharacter = Number(errorMatch[3]) - 1;
        let endLine = Number(errorMatch[4]) - 1;
        let endCharacter = Number(errorMatch[5]);
        const message = errorMatch[6].replace(/\n  /g, "\n");
        if (isNaN(endLine)) {
            endCharacter = startCharacter + 1;
            endLine = startLine;
        }
        else if (isNaN(endCharacter)) {
            endCharacter = endLine + 1;
            endLine = startLine;
        }
        const severity = /^Warning number \d+/.exec(errorMatch[0])
            ? LSP.DiagnosticSeverity.Warning
            : LSP.DiagnosticSeverity.Error;
        const diagnostic = createBucklescriptDiagnostic(message, startCharacter, startLine, endCharacter, endLine, severity);
        if (!parsedDiagnostics[fileUri]) {
            parsedDiagnostics[fileUri] = [];
        }
        parsedDiagnostics[fileUri].push(diagnostic);
    }
    const reLevel3Errors = new RegExp([
        /(?:We've found a bug for you!|Warning number \d+)\n\s*/,
        /(.*)/,
        /\n  \n  ((?:.|\n)*?)/,
        /((?=We've found a bug for you!)|(?:\[\d+\/\d+\] (?:\x1b\[[0-9;]*?m)?Building)|(?:ninja: build stopped: subcommand failed)|(?=Warning number \d+)|$)/,
    ]
        .map(r => r.source)
        .join(""), "g");
    if (Object.keys(parsedDiagnostics).length === 0) {
        while ((errorMatch = reLevel3Errors.exec(bsbOutput))) {
            const fileUri = "file://" + errorMatch[1];
            const startLine = 0;
            const startCharacter = 0;
            const endLine = 0;
            const endCharacter = 0;
            const message = errorMatch[2].replace(/\n  /g, "\n");
            const severity = /^Warning number \d+/.exec(errorMatch[0])
                ? LSP.DiagnosticSeverity.Warning
                : LSP.DiagnosticSeverity.Error;
            const diagnostic = createBucklescriptDiagnostic(message, startCharacter, startLine, endCharacter, endLine, severity);
            if (!parsedDiagnostics[fileUri]) {
                parsedDiagnostics[fileUri] = [];
            }
            parsedDiagnostics[fileUri].push(diagnostic);
        }
    }
    return parsedDiagnostics;
}
exports.parseErrors = parseErrors;
//# sourceMappingURL=index.js.map