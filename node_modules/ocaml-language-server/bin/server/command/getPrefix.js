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
function default_1(session, event) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = session.synchronizer.getTextDocument(event.textDocument.uri);
        if (null == document)
            return null;
        const startPosition = {
            character: 0,
            line: event.position.line,
        };
        const endPosition = event.position;
        const startOffset = document.offsetAt(startPosition);
        const endOffset = document.offsetAt(endPosition);
        const lineContent = document.getText().substring(startOffset, endOffset);
        const pattern = /[A-Za-z_][A-Za-z_'0-9]*(?:\.[A-Za-z_][A-Za-z_'0-9]*)*\.?$/;
        const match = pattern.exec(lineContent);
        return match ? match[0] : null;
    });
}
exports.default = default_1;
//# sourceMappingURL=getPrefix.js.map