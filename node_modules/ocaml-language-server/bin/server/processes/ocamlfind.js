"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Ocamlfind {
    constructor(session, argsOpt) {
        const command = session.settings.reason.path.ocamlfind;
        const args = argsOpt || ["list"];
        this.process = session.environment.spawn(command, args);
    }
}
exports.default = Ocamlfind;
//# sourceMappingURL=ocamlfind.js.map