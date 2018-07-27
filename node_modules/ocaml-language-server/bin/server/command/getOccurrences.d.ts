import { CancellationToken, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";
declare const _default: (session: Session, event: TextDocumentPositionParams, token: CancellationToken, priority?: number) => Promise<merlin.ILocation[] | null>;
export default _default;
