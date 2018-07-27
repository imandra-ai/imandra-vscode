"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = require("../command");
function default_1(session) {
    return event => command.getProjectEnv(session, event);
}
exports.default = default_1;
//# sourceMappingURL=giveProjectEnv.js.map