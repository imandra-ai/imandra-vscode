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
function default_1(session) {
    return support.cancellableHandler(session, (event, token) => __awaiter(this, void 0, void 0, function* () {
        const occurrences = yield command.getOccurrences(session, event, token);
        if (null == occurrences)
            return [];
        const highlights = occurrences.map(loc => {
            const range = lib_1.merlin.Location.intoCode(loc);
            const kind = LSP.DocumentHighlightKind.Write;
            return LSP.DocumentHighlight.create(range, kind);
        });
        return highlights;
    }));
}
exports.default = default_1;
//# sourceMappingURL=documentHighlight.js.map