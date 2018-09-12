import { CancellationToken, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import { Position } from "../../../lib/merlin/ordinal";
import Session from "../session";

export default async (
  session: Session,
  event: TextDocumentPositionParams,
  token: CancellationToken,
  priority: number = 0,
): Promise<null | {
  end: Position;
  start: Position;
  tail: merlin.TailPosition;
  type: string;
}> => {
  const position = merlin.Position.fromCode(event.position);
  const request = merlin.Query.type.enclosing.at(position);
  const response = await session.merlin.query(request, token, event.textDocument, priority);
  if ("return" !== response.class) return null;
  return response.value.length > 0 ? response.value[0] : null;
};
