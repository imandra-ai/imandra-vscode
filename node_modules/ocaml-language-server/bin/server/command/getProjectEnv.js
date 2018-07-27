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
        const env = new processes.Env(session).process;
        env.stdin.end();
        const otxt = yield new Promise((resolve, reject) => {
            let buffer = "";
            env.stdout.on("error", (error) => reject(error));
            env.stdout.on("data", (data) => (buffer += data.toString()));
            env.stdout.on("end", () => resolve(buffer));
        });
        env.unref();
        return /^\s*$/.test(otxt) ? [] : otxt.trim().split("\n");
    });
}
exports.default = default_1;
//# sourceMappingURL=getProjectEnv.js.map