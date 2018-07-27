"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver-protocol");
const lib_1 = require("../../../lib");
const command = require("../command");
const support = require("../support");
const annotateKinds = new Set([LSP.SymbolKind.Variable]);
function default_1(session) {
    return support.cancellableHandler(session, ({ textDocument }, token) => __awaiter(this, void 0, void 0, function* () {
        if (!session.settings.reason.codelens.enabled) {
            return [];
        }
        const languages = new Set(session.settings.reason.server.languages);
        if (languages.size < 1)
            return [];
        const allowedFileKinds = [];
        if (languages.has("ocaml"))
            allowedFileKinds.push("ml");
        if (languages.has("reason"))
            allowedFileKinds.push("re");
        const fileKindMatch = textDocument.uri.match(new RegExp(`\.(${allowedFileKinds.join("|")})$`));
        if (null == fileKindMatch)
            return [];
        const fileKind = fileKindMatch[1];
        const request = lib_1.merlin.Query.outline();
        const response = yield session.merlin.query(request, token, textDocument, 1);
        if ("return" !== response.class)
            return [];
        const outline = response.value;
        const document = yield command.getTextDocument(session, textDocument);
        if (null == document)
            return [];
        const symbols = lib_1.merlin.Outline.intoCode(outline, textDocument);
        const codeLenses = [];
        let matches = null;
        let textLine = null;
        for (const { containerName, kind, location, name } of symbols) {
            if (annotateKinds.has(kind)) {
                const { range } = location;
                const { start } = range;
                const end = LSP.Position.create(start.line + 1, 0);
                const { character, line } = start;
                const position = LSP.Position.create(line, character);
                const event = { position, textDocument };
                if (null != (textLine = document.getText().substring(document.offsetAt(start), document.offsetAt(end))) &&
                    null !=
                        (matches = textLine.match(/^\s*\b(and|let)\b(\s*)(\brec\b)?(\s*)(?:(?:\(?(?:[^\)]*)\)?(?:\s*::\s*(?:(?:\b\w+\b)|\((?:\b\w+\b):.*?\)=(?:\b\w+\b)))?|\((?:\b\w+\b)(?::.*?)?\))\s*)(?:(?:(?:(?:\b\w+\b)(?:\s*::\s*(?:(?:\b\w+\b)|\((?:\b\w+\b):.*?\)=(?:\b\w+\b)))?|\((?:\b\w+\b)(?::.*?)?\))\s*)|(?::(?=[^:])(?:.*?=>)*)?(?:.*?=)\s*[^\s=;]+?\s*.*?;?$)/m))) {
                    event.position.character += matches[1].length;
                    event.position.character += matches[2].length;
                    event.position.character += matches[3] ? matches[3].length : 0;
                    event.position.character += matches[4].length;
                }
                if (null != matches) {
                    codeLenses.push({
                        data: { containerName, event, fileKind, kind, location, name },
                        range,
                    });
                }
            }
        }
        return codeLenses;
    }));
}
exports.default = default_1;
//# sourceMappingURL=codeLens.js.map