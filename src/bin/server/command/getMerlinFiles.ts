import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";

export default async function(
  session: Session,
  token: LSP.CancellationToken | null,
  event: LSP.TextDocumentIdentifier,
  priority: number = 0,
): Promise<string[]> {
  const request = merlin.Query.project.get();
  const response = await session.merlin.query(request, token, event, priority);
  if ("return" !== response.class) return [];
  return response.value.result;
}
