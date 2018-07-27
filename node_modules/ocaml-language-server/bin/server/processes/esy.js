"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Esy {
    constructor(session) {
        this.session = session;
    }
    run() {
        let buffer = "";
        return new Promise(resolve => {
            const command = this.session.settings.reason.path.esy;
            const args = ["build"];
            const process = this.session.environment.spawn(command, args);
            process.on("error", (error) => {
                if ("ENOENT" === error.code) {
                    const msg = `Perhapse we cannot find esy binary at "${command}".`;
                    this.session.connection.window.showWarningMessage(msg);
                    this.session.connection.window.showWarningMessage(`Double check your path or try configuring "reason.path.esy" under "User Settings". Do you need to "npm install -g esy"? Alternatively, disable "esy" in "reason.diagnostics.tools"`);
                }
                resolve("");
            });
            process.stdout.on("data", (data) => (buffer += data.toString()));
            process.stdout.on("end", () => resolve(buffer));
        });
    }
}
exports.default = Esy;
//# sourceMappingURL=esy.js.map