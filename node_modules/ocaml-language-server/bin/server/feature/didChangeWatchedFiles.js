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
const Path = require("path");
const vscode_uri_1 = require("vscode-uri");
const command = require("../command");
function default_1(session) {
    return (event) => __awaiter(this, void 0, void 0, function* () {
        for (const id of event.changes) {
            const root = session.environment.workspaceRoot();
            const rawPath = vscode_uri_1.default.parse(id.uri).path;
            const path = Path.parse(root ? Path.relative(root, rawPath) : rawPath);
            switch (path.dir.split(Path.sep)[0]) {
                case "_build":
                    return command.restartMerlin(session);
            }
            if (".ml" === path.ext) {
                return session.indexer.refreshSymbols(id);
            }
            if (".re" === path.ext) {
                return session.indexer.refreshSymbols(id);
            }
            if (".merlin" === path.base) {
                return command.restartMerlin(session);
            }
            if ("command-exec" === path.name) {
                return command.restartMerlin(session);
            }
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=didChangeWatchedFiles.js.map