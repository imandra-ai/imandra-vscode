import * as LSP from "vscode-languageserver-protocol";
import { default as Session } from "../session";
export default function (session: Session, token: LSP.CancellationToken | null, event: LSP.TextDocumentIdentifier, priority?: number): Promise<LSP.TextDocumentIdentifier[]>;
