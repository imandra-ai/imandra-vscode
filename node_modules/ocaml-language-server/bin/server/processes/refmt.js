"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReFMT {
    constructor(session, id, argsOpt) {
        const uri = id ? id.uri : ".re";
        const command = session.settings.reason.path.refmt;
        const width = session.settings.reason.format.width;
        const widthArg = width === null ? [] : ["--print-width", `${width}`];
        const args = argsOpt || ["--parse", "re", "--print", "re", "--interface", `${/\.rei$/.test(uri)}`].concat(widthArg);
        this.process = session.environment.spawn(command, args);
    }
}
exports.default = ReFMT;
//# sourceMappingURL=refmt.js.map