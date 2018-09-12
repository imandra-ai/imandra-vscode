import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";
import * as support from "../support";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.DocumentSymbolParams, LSP.SymbolInformation[], never> {
  return support.cancellableHandler(session, async (event, token) => {
    const request = merlin.Query.outline();
    const response = await session.merlin.query(request, token, event.textDocument, Infinity);
    if ("return" !== response.class) return [];
    const outline = response.value;
    return merlin.Outline.intoCode(outline, event.textDocument);
  });
}
