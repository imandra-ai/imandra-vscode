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
const async = require("async");
const lodash = require("lodash");
const readline = require("readline");
const vscode_uri_1 = require("vscode-uri");
const lib_1 = require("../../../lib");
class Merlin {
    constructor(session) {
        this.session = session;
    }
    dispose() {
        this.readline.close();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const ocamlmerlin = this.session.settings.reason.path.ocamlmerlin;
            const cwd = this.session.initConf.rootUri || this.session.initConf.rootPath;
            const options = cwd ? { cwd: vscode_uri_1.default.parse(cwd).fsPath } : {};
            this.process = this.session.environment.spawn(ocamlmerlin, [], options);
            this.process.on("error", (error) => {
                if ("ENOENT" === error.code) {
                    this.session.connection.window.showWarningMessage(`Cannot find merlin binary at "${ocamlmerlin}".`);
                    this.session.connection.window.showWarningMessage(`Double check your path or try configuring "reason.path.ocamlmerlin" under "User Settings".`);
                }
                throw error;
            });
            this.process.stderr.on("data", (data) => {
                this.session.connection.window.showErrorMessage(`ocamlmerlin error: ${data}`);
            });
            this.readline = readline.createInterface({
                input: this.process.stdout,
                output: this.process.stdin,
                terminal: false,
            });
            const worker = (task, callback) => {
                const begunProcessing = new Date();
                if (null != task.token && task.token.isCancellationRequested) {
                    return callback({
                        class: "canceled",
                        value: "Request has been canceled.",
                    });
                }
                this.readline.question(JSON.stringify(task.task), lodash.flow(JSON.parse, this.logMessage(begunProcessing, task), data => {
                    return callback(data);
                }));
            };
            this.queue = async.priorityQueue(worker, 1);
            yield this.establishProtocol();
        });
    }
    query({ query }, token, id, priority = 0) {
        const context = id ? ["auto", vscode_uri_1.default.parse(id.uri).fsPath] : undefined;
        const request = context ? { context, query } : query;
        return new Promise(resolve => this.queue.push(new lib_1.merlin.Task(request, token), priority, resolve));
    }
    restart() {
        return __awaiter(this, void 0, void 0, function* () {
            if (null != this.queue) {
                this.queue.kill();
                this.queue = null;
            }
            if (null != this.readline) {
                this.readline.close();
                this.readline = null;
            }
            if (null != this.process) {
                this.process.kill();
                this.process = null;
            }
            yield this.initialize();
        });
    }
    sync({ sync: query }, id) {
        const context = id ? ["auto", vscode_uri_1.default.parse(id.uri).fsPath] : undefined;
        const request = context ? { context, query } : query;
        return new Promise(resolve => this.queue.push(new lib_1.merlin.Task(request), 0, resolve));
    }
    establishProtocol() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = lib_1.merlin.Sync.protocol.version.set(3);
            const response = yield this.sync(request);
            if ("return" !== response.class || 3 !== response.value.selected) {
                throw new Error("onInitialize: failed to establish protocol v3");
            }
        });
    }
    logMessage(begunProcessing, task) {
        return result => {
            if (null != this.session.settings.reason.diagnostics &&
                this.session.settings.reason.diagnostics.merlinPerfLogging) {
                const queueDuration = begunProcessing.getTime() - task.enqueuedAt.getTime();
                const merlinDuration = new Date().getTime() - begunProcessing.getTime();
                this.session.connection.telemetry.logEvent(`(${this.queue.length()}) Task ${JSON.stringify(task.task)} was in the queue for ${queueDuration} ms and took ${merlinDuration} ms to process.`);
            }
            return result;
        };
    }
}
exports.default = Merlin;
//# sourceMappingURL=merlin.js.map