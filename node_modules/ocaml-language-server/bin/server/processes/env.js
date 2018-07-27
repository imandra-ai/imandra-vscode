"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Env {
    constructor(session) {
        const command = session.settings.reason.path.env;
        this.process = session.environment.spawn(command, []);
    }
}
exports.default = Env;
//# sourceMappingURL=env.js.map