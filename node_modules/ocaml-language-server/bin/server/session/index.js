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
const server = require("vscode-languageserver");
const LSP = require("vscode-languageserver-protocol");
const processes_1 = require("../processes");
const analyzer_1 = require("./analyzer");
const environment_1 = require("./environment");
exports.Environment = environment_1.default;
const indexer_1 = require("./indexer");
const synchronizer_1 = require("./synchronizer");
class Session {
    constructor() {
        this.cancellationSources = {
            "analyzer/refreshWithKind": new LSP.CancellationTokenSource(),
        };
        this.connection = server.createConnection();
        this.settings = {};
        this.analyzer = new analyzer_1.default(this);
        this.environment = new environment_1.default(this);
        this.indexer = new indexer_1.default(this);
        this.merlin = new processes_1.Merlin(this);
        this.synchronizer = new synchronizer_1.default(this);
    }
    cancelTokens(sourceName) {
        this.cancellationSources[sourceName].cancel();
        this.cancellationSources[sourceName] = new LSP.CancellationTokenSource();
        return;
    }
    dispose() {
        this.analyzer.dispose();
        this.environment.dispose();
        this.indexer.dispose();
        this.merlin.dispose();
        this.synchronizer.dispose();
    }
    error(data) {
        this.connection.console.error(JSON.stringify(data, null, 2));
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.environment.initialize();
            yield this.merlin.initialize();
            yield this.indexer.initialize();
            yield this.synchronizer.initialize();
            yield this.analyzer.initialize();
        });
    }
    listen() {
        this.synchronizer.listen();
        this.connection.listen();
    }
    log(data) {
        this.connection.console.log(JSON.stringify(data, null, 2));
    }
    onDidChangeConfiguration({ settings }) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldMerlinPath = this.settings.reason.path.ocamlmerlin;
            this.settings = Object.assign({}, this.settings, settings);
            if (this.settings.reason.path.ocamlmerlin !== oldMerlinPath) {
                yield this.merlin.restart();
            }
            this.analyzer.onDidChangeConfiguration();
            this.synchronizer.onDidChangeConfiguration();
        });
    }
}
exports.default = Session;
//# sourceMappingURL=index.js.map