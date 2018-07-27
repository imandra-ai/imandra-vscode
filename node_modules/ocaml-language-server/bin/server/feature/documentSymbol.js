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
const lib_1 = require("../../../lib");
const support = require("../support");
function default_1(session) {
    return support.cancellableHandler(session, (event, token) => __awaiter(this, void 0, void 0, function* () {
        const request = lib_1.merlin.Query.outline();
        const response = yield session.merlin.query(request, token, event.textDocument, Infinity);
        if ("return" !== response.class)
            return [];
        const outline = response.value;
        return lib_1.merlin.Outline.intoCode(outline, event.textDocument);
    }));
}
exports.default = default_1;
//# sourceMappingURL=documentSymbol.js.map