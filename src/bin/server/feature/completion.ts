import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";
import * as support from "../support";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.CompletionItem[], never> {
  return support.cancellableHandler(session, async (event, token) => {
    let prefix: null | string = null;
    try {
      prefix = await command.getPrefix(session, event);
    } catch (err) {
      // ignore errors from completing ' .'
    }
    if (null == prefix) return [];
    const colLine = merlin.Position.fromCode(event.position);
    const request = merlin.Query.complete
      .prefix(prefix)
      .at(colLine)
      .with.doc();
    const response = await session.merlin.query(request, token, event.textDocument, Infinity);
    if ("return" !== response.class) return [];
    const entries = response.value.entries || [];
    return entries.map(merlin.Completion.intoCode);
  });
}
