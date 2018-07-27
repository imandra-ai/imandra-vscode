import URI from "vscode-uri";
import { Host } from "./host";
export declare class Resource {
    readonly source: Host;
    readonly uri: URI;
    static from(source: Host, uri: URI): Resource;
    protected constructor(source: Host, uri: URI);
    into(target: Host, skipEncoding?: boolean): URI;
    protected readNative(skipEncoding: boolean): URI;
    protected readWSL(skipEncoding: boolean): URI;
}
