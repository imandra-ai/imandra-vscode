"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = require("../command");
function default_1(session) {
    return event => command.getAvailableLibraries(session, event);
}
exports.default = default_1;
//# sourceMappingURL=giveAvailableLibraries.js.map