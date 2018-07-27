"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_uri_1 = require("vscode-uri");
const host_1 = require("./host");
class Resource {
    constructor(source, uri) {
        this.source = source;
        this.uri = uri;
    }
    static from(source, uri) {
        return new this(source, uri);
    }
    into(target, skipEncoding = true) {
        switch (target) {
            case host_1.Host.Native:
                return this.readNative(skipEncoding);
            case host_1.Host.WSL:
                return this.readWSL(skipEncoding);
        }
    }
    readNative(skipEncoding) {
        switch (this.source) {
            case host_1.Host.Native:
                return this.uri;
            case host_1.Host.WSL:
                const uri = this.uri.toString(skipEncoding);
                const localappdataFile = process.env.localappdata;
                if (null == localappdataFile)
                    throw new Error("LOCALAPPDATA must be set in environment to interpret WSL /home");
                const localappdata = vscode_uri_1.default.file(localappdataFile).toString(skipEncoding);
                let match = null;
                if (null != (match = uri.match(/^file:\/\/\/mnt\/([a-zA-Z])\/(.*)$/))) {
                    match.shift();
                    const drive = match.shift();
                    const rest = match.shift();
                    return vscode_uri_1.default.parse(`file:///${drive}:/${rest}`);
                }
                if (null != (match = uri.match(/^file:\/\/\/home\/(.+)$/))) {
                    match.shift();
                    const rest = match.shift();
                    return vscode_uri_1.default.parse(`${localappdata}/lxss/home/${rest}`);
                }
                throw new Error("unreachable");
        }
    }
    readWSL(skipEncoding) {
        switch (this.source) {
            case host_1.Host.Native:
                const uri = this.uri.toString(skipEncoding);
                let match = null;
                if (null != (match = uri.match(/^file:\/\/\/([a-zA-Z]):(.*)$/))) {
                    match.shift();
                    const drive = match.shift();
                    const rest = match.shift();
                    return vscode_uri_1.default.parse(`file:///mnt/${drive}${rest}`);
                }
                throw new Error("unreachable");
            case host_1.Host.WSL:
                return this.uri;
        }
    }
}
exports.Resource = Resource;
//# sourceMappingURL=resource.js.map