"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LSP = require("vscode-languageserver-protocol");
function cancellableHandler(_session, handler) {
    return (event, token) => {
        const sentinel = new Promise((_resolve, reject) => token.onCancellationRequested(() => {
            const error = new LSP.ResponseError(LSP.ErrorCodes.RequestCancelled, "cancellableHandler::reject");
            return reject(error);
        }));
        return Promise.race([sentinel, handler(event, token)]);
    };
}
exports.cancellableHandler = cancellableHandler;
//# sourceMappingURL=support.js.map