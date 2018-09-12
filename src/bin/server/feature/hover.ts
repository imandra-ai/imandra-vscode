import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import * as parser from "../parser";
import Session from "../session";
import * as support from "../support";

export default function(session: Session): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.Hover, never> {
  return support.cancellableHandler(session, async (event, token) => {
    const word = await command.getWordAtPosition(session, event);
    const markedStrings: LSP.MarkedString[] = [];
    const itemTypes = await command.getType(session, event, token);
    if (null == itemTypes) return { contents: [] };
    const itemDocs = await command.getDocumentation(session, token, event);
    const { type: value } = itemTypes;
    let language = "plaintext";
    if (/\.imli?/.test(event.textDocument.uri)) {
      language = "imandra.hover.type";
    }
    if (/\.irei?/.test(event.textDocument.uri)) {
      language = /^[A-Z]/.test(word) ? "imandra-reason.hover.signature" : "imandra-reason.hover.type";
    }
    markedStrings.push({ language, value });
    if (null != itemDocs && !parser.ocamldoc.ignore.test(itemDocs)) {
      markedStrings.push(parser.ocamldoc.intoMarkdown(itemDocs));
    }
    return { contents: markedStrings };
  });
}
