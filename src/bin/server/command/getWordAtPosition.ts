import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

function isWhitespace(str: string = ""): boolean {
  return str.trim() === str;
}

export default async function(session: Session, event: LSP.TextDocumentPositionParams): Promise<string> {
  const textDocument = session.synchronizer.getTextDocument(event.textDocument.uri);
  if (null == textDocument) return "";
  const text = textDocument.getText();
  const offset = textDocument.offsetAt(event.position);
  let start = offset;
  while (0 < start && !isWhitespace(text[start])) start--;
  let end = offset;
  while (end < text.length && !isWhitespace(text[end])) end++;
  return text.substring(start, end);
}
