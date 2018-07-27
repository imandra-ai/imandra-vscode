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
exports.default = (session, event, token, priority = 0) => __awaiter(this, void 0, void 0, function* () {
    const position = lib_1.merlin.Position.fromCode(event.position);
    const request = lib_1.merlin.Query.occurrences.ident.at(position);
    const response = yield session.merlin.query(request, token, event.textDocument, priority);
    if ("return" !== response.class)
        return null;
    return response.value;
});
//# sourceMappingURL=getOccurrences.js.map