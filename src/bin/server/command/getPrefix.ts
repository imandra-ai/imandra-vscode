import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default async function(session: Session, event: LSP.TextDocumentPositionParams): Promise<null | string> {
  const document = session.synchronizer.getTextDocument(event.textDocument.uri);
  if (null == document) return null;
  const startPosition = {
    character: 0,
    line: event.position.line,
  };
  const endPosition = event.position;
  const startOffset = document.offsetAt(startPosition);
  const endOffset = document.offsetAt(endPosition);
  const lineContent = document.getText().substring(startOffset, endOffset);

  const pattern = /[A-Za-z_][A-Za-z_'0-9]*(?:\.[A-Za-z_][A-Za-z_'0-9]*)*\.?$/;
  const match = pattern.exec(lineContent);
  return match ? match[0] : null;
}
