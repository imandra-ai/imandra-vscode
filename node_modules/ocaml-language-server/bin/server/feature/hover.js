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
const command = require("../command");
const parser = require("../parser");
const support = require("../support");
function default_1(session) {
    return support.cancellableHandler(session, (event, token) => __awaiter(this, void 0, void 0, function* () {
        const word = yield command.getWordAtPosition(session, event);
        const markedStrings = [];
        const itemTypes = yield command.getType(session, event, token);
        if (null == itemTypes)
            return { contents: [] };
        const itemDocs = yield command.getDocumentation(session, token, event);
        const { type: value } = itemTypes;
        let language = "plaintext";
        if (/\.mli?/.test(event.textDocument.uri)) {
            language = "ocaml.hover.type";
        }
        if (/\.rei?/.test(event.textDocument.uri)) {
            language = /^[A-Z]/.test(word) ? "reason.hover.signature" : "reason.hover.type";
        }
        markedStrings.push({ language, value });
        if (null != itemDocs && !parser.ocamldoc.ignore.test(itemDocs)) {
            markedStrings.push(parser.ocamldoc.intoMarkdown(itemDocs));
        }
        return { contents: markedStrings };
    }));
}
exports.default = default_1;
//# sourceMappingURL=hover.js.map