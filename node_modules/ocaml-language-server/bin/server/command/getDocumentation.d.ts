import { CancellationToken, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import Session from "../session";
declare const _default: (session: Session, token: CancellationToken, event: TextDocumentPositionParams, priority?: number) => Promise<string | null>;
export default _default;
