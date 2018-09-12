import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";
import * as support from "../support";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.DocumentHighlight[], never> {
  return support.cancellableHandler(session, async (event, token) => {
    const occurrences = await command.getOccurrences(session, event, token);
    if (null == occurrences) return [];
    const highlights = occurrences.map(loc => {
      const range = merlin.Location.intoCode(loc);
      const kind = LSP.DocumentHighlightKind.Write;
      return LSP.DocumentHighlight.create(range, kind);
    });
    return highlights;
  });
}
