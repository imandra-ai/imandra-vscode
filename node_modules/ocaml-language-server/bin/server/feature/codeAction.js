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
const support = require("../support");
function default_1(session) {
    return support.cancellableHandler(session, (event, _token) => __awaiter(this, void 0, void 0, function* () {
        const actions = [];
        let matches = null;
        for (const { message, range } of event.context.diagnostics) {
            if (message === "Functions must be defined with => instead of the = symbol.") {
                const title = "change = to =>";
                const command = "reason.codeAction.fixEqualsShouldBeArrow";
                const location = LSP.Location.create(event.textDocument.uri, range);
                const args = [location];
                const action = LSP.Command.create(title, command, args);
                actions.push(action);
                continue;
            }
            if (message === "Statements must be terminated with a semicolon.") {
                const title = "insert missing semicolon";
                const command = "reason.codeAction.fixMissingSemicolon";
                const location = LSP.Location.create(event.textDocument.uri, range);
                const args = [location];
                const action = LSP.Command.create(title, command, args);
                actions.push(action);
                continue;
            }
            if (null != (matches = message.match(/Warning (?:26|27): unused variable\s+\b(\w+)\b/))) {
                const title = "ignore unused variable";
                const command = "reason.codeAction.fixUnusedVariable";
                const location = LSP.Location.create(event.textDocument.uri, range);
                const args = [location, matches[1]];
                const action = LSP.Command.create(title, command, args);
                actions.push(action);
                continue;
            }
        }
        return actions;
    }));
}
exports.default = default_1;
//# sourceMappingURL=codeAction.js.map