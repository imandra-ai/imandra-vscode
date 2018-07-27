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
function default_1(session) {
    return (event, token) => __awaiter(this, void 0, void 0, function* () {
        const start = lib_1.merlin.Position.fromCode(event.range.start);
        const end = lib_1.merlin.Position.fromCode(event.range.end);
        const request = lib_1.merlin.Query.kase.analysis.from(start).to(end);
        const response = yield session.merlin.query(request, token, event.textDocument);
        if (token.isCancellationRequested)
            return null;
        if ("return" !== response.class)
            throw response.value;
        return response.value;
    });
}
exports.default = default_1;
//# sourceMappingURL=giveCaseAnalysis.js.map