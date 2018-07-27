"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BuckleScript {
    constructor(session) {
        this.session = session;
    }
    run() {
        let buffer = "";
        return new Promise(resolve => {
            const command = this.session.settings.reason.path.bsb;
            const args = ["-make-world"];
            const process = this.session.environment.spawn(command, args);
            process.on("error", (error) => {
                if ("ENOENT" === error.code) {
                    const msg = `Cannot find bsb binary at "${command}".`;
                    this.session.connection.window.showWarningMessage(msg);
                    this.session.connection.window.showWarningMessage(`Double check your path or try configuring "reason.path.bsb" under "User Settings". Alternatively, disable "bsb" in "reason.diagnostics.tools"`);
                }
                resolve("");
            });
            process.stdout.on("data", (data) => (buffer += data.toString()));
            process.stdout.on("end", () => resolve(buffer));
            process.on("uncaughtException", (error) => {
                this.session.connection.window.showWarningMessage(error.message);
            });
        });
    }
}
exports.default = BuckleScript;
//# sourceMappingURL=bucklescript.js.map