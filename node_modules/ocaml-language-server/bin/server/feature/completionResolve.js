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
const parser = require("../parser");
const support = require("../support");
function default_1(session) {
    return support.cancellableHandler(session, (event, _token) => __awaiter(this, void 0, void 0, function* () {
        const documentation = event.data.documentation
            .replace(/\{\{:.*?\}(.*?)\}/g, "$1")
            .replace(/\{!(.*?)\}/g, "$1");
        const markedDoc = parser.ocamldoc
            .intoMarkdown(documentation)
            .replace(/`(.*?)`/g, "$1")
            .replace(/\s+/g, " ")
            .replace(/\n/g, "");
        event.documentation = markedDoc;
        return event;
    }));
}
exports.default = default_1;
//# sourceMappingURL=completionResolve.js.map