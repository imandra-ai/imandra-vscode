import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";
export default function (session: Session): LSP.RequestHandler<LSP.CompletionItem, LSP.CompletionItem, never>;
