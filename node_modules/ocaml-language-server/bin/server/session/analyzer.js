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
const LSP = require("vscode-languageserver-protocol");
const lib_1 = require("../../../lib");
const command = require("../command");
const parser = require("../parser");
const processes = require("../processes");
class Analyzer {
    constructor(session) {
        this.session = session;
        this.bsbDiagnostics = {};
    }
    clear({ uri }) {
        if (this.bsbDiagnostics[uri] == null ||
            this.bsbDiagnostics[uri][0] == null ||
            this.bsbDiagnostics[uri][0].source !== "bucklescript") {
            this.session.connection.sendDiagnostics({
                diagnostics: [],
                uri,
            });
        }
    }
    dispose() {
        return;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.onDidChangeConfiguration();
        });
    }
    onDidChangeConfiguration() {
        this.refreshImmediate = this.refreshWithKind(LSP.TextDocumentSyncKind.Full);
        this.refreshDebounced = lodash.debounce(this.refreshWithKind(LSP.TextDocumentSyncKind.Incremental), this.session.settings.reason.debounce.linter, { trailing: true });
    }
    refreshWithKind(syncKind) {
        return (id) => __awaiter(this, void 0, void 0, function* () {
            const tools = new Set(this.session.settings.reason.diagnostics.tools);
            if (tools.size < 1)
                return;
            Object.keys(this.bsbDiagnostics).forEach(fileUri => {
                this.bsbDiagnostics[fileUri] = [];
            });
            this.bsbDiagnostics[id.uri] = [];
            if (tools.has("bsb") && syncKind === LSP.TextDocumentSyncKind.Full) {
                this.refreshDebounced.cancel();
                const bsbProcess = new processes.BuckleScript(this.session);
                const bsbOutput = yield bsbProcess.run();
                const diagnostics = parser.bucklescript.parseErrors(bsbOutput);
                Object.keys(diagnostics).forEach(fileUri => {
                    if (!this.bsbDiagnostics[fileUri]) {
                        this.bsbDiagnostics[fileUri] = [];
                    }
                    this.bsbDiagnostics[fileUri] = this.bsbDiagnostics[fileUri].concat(diagnostics[fileUri]);
                });
                Object.keys(this.bsbDiagnostics).forEach(fileUri => {
                    this.session.connection.sendDiagnostics({
                        diagnostics: this.bsbDiagnostics[fileUri],
                        uri: fileUri,
                    });
                    if (this.bsbDiagnostics[fileUri].length === 0) {
                        delete this.bsbDiagnostics[fileUri];
                    }
                });
            }
            else if (tools.has("merlin")) {
                if (syncKind === LSP.TextDocumentSyncKind.Full) {
                    const document = yield command.getTextDocument(this.session, id);
                    if (null != document) {
                        yield this.session.merlin.sync(lib_1.merlin.Sync.tell("start", "end", document.getText()), id);
                    }
                }
                this.session.cancelTokens("analyzer/refreshWithKind");
                const errors = yield this.session.merlin.query(lib_1.merlin.Query.errors(), this.session.cancellationSources["analyzer/refreshWithKind"].token, id);
                if ("return" !== errors.class)
                    return;
                const diagnostics = [];
                for (const report of errors.value)
                    diagnostics.push(yield lib_1.merlin.IErrorReport.intoCode(this.session, id, report));
                this.session.connection.sendDiagnostics({ diagnostics, uri: id.uri });
            }
        });
    }
}
exports.default = Analyzer;
//# sourceMappingURL=analyzer.js.map