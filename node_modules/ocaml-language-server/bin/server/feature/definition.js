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
const vscode_uri_1 = require("vscode-uri");
const lib_1 = require("../../../lib");
const support = require("../support");
function default_1(session) {
    return support.cancellableHandler(session, (event, token) => __awaiter(this, void 0, void 0, function* () {
        const find = (kind) => __awaiter(this, void 0, void 0, function* () {
            const colLine = lib_1.merlin.Position.fromCode(event.position);
            const request = lib_1.merlin.Query.locate(null, kind).at(colLine);
            const response = yield session.merlin.query(request, token, event.textDocument);
            if ("return" !== response.class)
                return null;
            if (null == response.value.pos)
                return null;
            const uri = response.value.file ? vscode_uri_1.default.file(response.value.file).toString() : event.textDocument.uri;
            const position = lib_1.merlin.Position.intoCode(response.value.pos);
            const range = LSP.Range.create(position, position);
            const location = LSP.Location.create(uri, range);
            return location;
        });
        const locML = yield find("ml");
        const locations = [];
        if (null != locML)
            locations.push(locML);
        return locations;
    }));
}
exports.default = default_1;
//# sourceMappingURL=definition.js.map