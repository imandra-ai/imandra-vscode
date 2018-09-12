import { Glob } from "glob";
import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import { default as Session, Environment } from "../session";

export default async function(
  session: Session,
  token: LSP.CancellationToken | null,
  event: LSP.TextDocumentIdentifier,
  priority: number = 0,
): Promise<LSP.TextDocumentIdentifier[]> {
  const request = merlin.Query.path.list.source();
  const response = await session.merlin.query(request, token, event, priority);
  if ("return" !== response.class) return [];
  const srcDirs: Set<string> = new Set();
  const srcMods: LSP.TextDocumentIdentifier[] = [];
  for (const cwd of response.value) {
    if (!(/\.opam\b/.test(cwd) || srcDirs.has(cwd))) {
      srcDirs.add(cwd);
      const cwdMods = new Glob("*.@(iml|ml|re)?(i)", {
        cwd,
        realpath: true,
        sync: true,
      }).found;
      for (const path of cwdMods) srcMods.push(Environment.pathToUri(path));
    }
  }
  return srcMods;
}
