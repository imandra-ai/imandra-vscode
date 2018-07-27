"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OcpIndent {
    constructor(session, args = []) {
        const command = session.settings.reason.path.ocpindent;
        this.process = session.environment.spawn(command, args);
        this.process.on("error", error => session.error(`Error formatting file: ${error}`));
    }
}
exports.default = OcpIndent;
//# sourceMappingURL=ocpIndent.js.map