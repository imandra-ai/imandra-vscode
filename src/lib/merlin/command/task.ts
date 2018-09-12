import * as LSP from "vscode-languageserver-protocol";

export class Task {
  constructor(
    readonly task: any,
    readonly token: LSP.CancellationToken | null = null,
    readonly enqueuedAt: Date = new Date(),
  ) {}
}
