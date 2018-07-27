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
const command = require("../command");
const support = require("../support");
function default_1(session) {
    return support.cancellableHandler(session, (event, token) => __awaiter(this, void 0, void 0, function* () {
        let prefix = null;
        try {
            prefix = yield command.getPrefix(session, event);
        }
        catch (err) {
        }
        if (null == prefix)
            return [];
        const colLine = lib_1.merlin.Position.fromCode(event.position);
        const request = lib_1.merlin.Query.complete
            .prefix(prefix)
            .at(colLine)
            .with.doc();
        const response = yield session.merlin.query(request, token, event.textDocument, Infinity);
        if ("return" !== response.class)
            return [];
        const entries = response.value.entries || [];
        return entries.map(lib_1.merlin.Completion.intoCode);
    }));
}
exports.default = default_1;
//# sourceMappingURL=completion.js.map