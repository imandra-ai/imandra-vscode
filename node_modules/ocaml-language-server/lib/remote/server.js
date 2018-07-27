"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const ordinal = require("../merlin/ordinal");
exports.giveCaseAnalysis = new vscode_jsonrpc_1.RequestType("reason.server.giveCaseAnalysis");
exports.giveMerlinFiles = new vscode_jsonrpc_1.RequestType("reason.server.giveMerlinFiles");
exports.giveAvailableLibraries = new vscode_jsonrpc_1.RequestType("reason.server.giveAvailableLibraries");
exports.giveProjectEnv = new vscode_jsonrpc_1.RequestType("reason.server.giveProjectEnv");
void ordinal;
//# sourceMappingURL=server.js.map