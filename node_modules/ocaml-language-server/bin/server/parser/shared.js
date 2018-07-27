"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnostic = (source) => (message, startCharacter, startLine, endCharacter, endLine, severity) => {
    return {
        code: "",
        message,
        range: {
            end: {
                character: endCharacter,
                line: endLine,
            },
            start: {
                character: startCharacter,
                line: startLine,
            },
        },
        severity,
        source,
    };
};
//# sourceMappingURL=shared.js.map