import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";
export default function (session: Session, _: LSP.TextDocumentIdentifier): Promise<string[]>;
