import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default async function(session: Session, event: LSP.Location): Promise<null | string> {
  const textDocument = session.synchronizer.getTextDocument(event.uri);
  if (null == textDocument) return null;
  return textDocument.getText();
}
