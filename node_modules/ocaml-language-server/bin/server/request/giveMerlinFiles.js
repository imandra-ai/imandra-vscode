"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = require("../command");
function default_1(session) {
    return event => command.getMerlinFiles(session, null, event);
}
exports.default = default_1;
//# sourceMappingURL=giveMerlinFiles.js.map