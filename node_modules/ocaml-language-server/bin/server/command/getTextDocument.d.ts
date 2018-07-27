import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";
export default function (session: Session, event: LSP.TextDocumentIdentifier): Promise<null | LSP.TextDocument>;
