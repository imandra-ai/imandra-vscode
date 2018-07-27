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
const processes = require("../processes");
function default_1(session, _) {
    return __awaiter(this, void 0, void 0, function* () {
        const ocamlfind = new processes.Ocamlfind(session).process;
        ocamlfind.stdin.end();
        const otxt = yield new Promise((resolve, reject) => {
            let buffer = "";
            ocamlfind.stdout.on("error", (error) => reject(error));
            ocamlfind.stdout.on("data", (data) => (buffer += data.toString()));
            ocamlfind.stdout.on("end", () => resolve(buffer));
        });
        ocamlfind.unref();
        return /^\s*$/.test(otxt) ? [] : otxt.trim().split("\n");
    });
}
exports.default = default_1;
//# sourceMappingURL=getAvailableLibraries.js.map