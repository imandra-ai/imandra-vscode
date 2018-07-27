import * as LSP from "vscode-languageserver-protocol";
import { merlin, types } from "../../../lib";
import Session from "../session";
export default function (session: Session): LSP.RequestHandler<types.ITextDocumentRange, null | merlin.Case.Destruct, void>;
