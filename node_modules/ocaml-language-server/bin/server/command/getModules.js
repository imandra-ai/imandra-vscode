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
const glob_1 = require("glob");
const lib_1 = require("../../../lib");
const session_1 = require("../session");
function default_1(session, token, event, priority = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = lib_1.merlin.Query.path.list.source();
        const response = yield session.merlin.query(request, token, event, priority);
        if ("return" !== response.class)
            return [];
        const srcDirs = new Set();
        const srcMods = [];
        for (const cwd of response.value) {
            if (!(/\.opam\b/.test(cwd) || srcDirs.has(cwd))) {
                srcDirs.add(cwd);
                const cwdMods = new glob_1.Glob("*.@(ml|re)?(i)", {
                    cwd,
                    realpath: true,
                    sync: true,
                }).found;
                for (const path of cwdMods)
                    srcMods.push(session_1.Environment.pathToUri(path));
            }
        }
        return srcMods;
    });
}
exports.default = default_1;
//# sourceMappingURL=getModules.js.map