import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";
import * as support from "../support";

export default function(session: Session): LSP.RequestHandler<LSP.RenameParams, LSP.WorkspaceEdit, never> {
  return support.cancellableHandler(session, async (event, token) => {
    const occurrences = await command.getOccurrences(session, event, token);
    if (null == occurrences) return { changes: {} };
    const renamings = occurrences.map(loc => LSP.TextEdit.replace(merlin.Location.intoCode(loc), event.newName));
    // FIXME: versioning
    const documentChanges = [
      LSP.TextDocumentEdit.create(LSP.VersionedTextDocumentIdentifier.create(event.textDocument.uri, 0), renamings),
    ];
    const edit: LSP.WorkspaceEdit = { documentChanges };
    return edit;
  });
}
