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
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const URL = require("url");
const fileSchemeLength = "file://".length - 1;
class Environment {
    constructor(session) {
        this.session = session;
        this.projectCommandWrapper = null;
    }
    static pathToUri(path) {
        const uri = URL.format(URL.parse(`file://${path}`));
        return { uri };
    }
    static uriToPath({ uri }) {
        return uri.substr(fileSchemeLength);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.determineCommandWrapper();
        });
    }
    dispose() {
        return;
    }
    relativize(id) {
        const rootPath = this.workspaceRoot();
        if (null == rootPath)
            return;
        return path.relative(rootPath, Environment.uriToPath(id));
    }
    spawn(command, args = [], options = {}) {
        options.shell = process.platform === "win32" ? true : options.shell;
        if (null != this.projectCommandWrapper) {
            return childProcess.spawn(this.projectCommandWrapper, [command].concat(args), options);
        }
        else {
            return childProcess.spawn(command, args, options);
        }
    }
    workspaceRoot() {
        return this.session.initConf.rootPath;
    }
    projectCommandWrapperPath(workspaceRoot) {
        return workspaceRoot === null || workspaceRoot === undefined
            ? null
            : path.join(workspaceRoot, "node_modules", ".cache", "_esy", "build", "bin", process.platform === "win32" ? "command-exec.bat" : "command-exec");
    }
    determineCommandWrapper() {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceRoot = this.workspaceRoot();
            try {
                const projectCommandWrapper = this.projectCommandWrapperPath(workspaceRoot);
                if (null != projectCommandWrapper) {
                    const exists = yield fs.existsSync(projectCommandWrapper);
                    this.projectCommandWrapper = exists ? projectCommandWrapper : null;
                }
            }
            catch (err) {
                this.session.error(`Error determining if command wrapper exists at: ${workspaceRoot}`);
            }
        });
    }
}
exports.default = Environment;
//# sourceMappingURL=environment.js.map