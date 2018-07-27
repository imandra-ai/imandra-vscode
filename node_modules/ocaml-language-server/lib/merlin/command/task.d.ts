import * as LSP from "vscode-languageserver-protocol";
export declare class Task {
    readonly task: any;
    readonly token: LSP.CancellationToken | null;
    readonly enqueuedAt: Date;
    constructor(task: any, token?: LSP.CancellationToken | null, enqueuedAt?: Date);
}
