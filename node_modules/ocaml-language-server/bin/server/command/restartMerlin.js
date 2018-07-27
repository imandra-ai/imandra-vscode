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
const lodash = require("lodash");
const lib_1 = require("../../../lib");
function restartMerlin(session) {
    return __awaiter(this, void 0, void 0, function* () {
        yield session.merlin.restart();
        for (const document of session.synchronizer.documents.values()) {
            const content = document.getText();
            const request = lib_1.merlin.Sync.tell("start", "end", content);
            yield session.merlin.sync(request, document);
            const tools = new Set(session.settings.reason.diagnostics.tools);
            if (!tools.has("bsb")) {
                yield session.analyzer.refreshImmediate(document);
            }
            session.indexer.populated = false;
            yield session.indexer.populate(document);
        }
    });
}
const restartMerlinDebounced = lodash.debounce(restartMerlin, 3000, { trailing: true });
exports.default = restartMerlinDebounced;
//# sourceMappingURL=restartMerlin.js.map