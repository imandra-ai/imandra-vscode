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
function isWhitespace(str = "") {
    return str.trim() === str;
}
function default_1(session, event) {
    return __awaiter(this, void 0, void 0, function* () {
        const textDocument = session.synchronizer.getTextDocument(event.textDocument.uri);
        if (null == textDocument)
            return "";
        const text = textDocument.getText();
        const offset = textDocument.offsetAt(event.position);
        let start = offset;
        while (0 < start && !isWhitespace(text[start]))
            start--;
        let end = offset;
        while (end < text.length && !isWhitespace(text[end]))
            end++;
        return text.substring(start, end);
    });
}
exports.default = default_1;
//# sourceMappingURL=getWordAtPosition.js.map