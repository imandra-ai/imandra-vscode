import * as LSP from "vscode-languageserver-protocol";
import * as processes from "../processes";
import Session from "../session";

export default async function(session: Session, _: LSP.TextDocumentIdentifier): Promise<string[]> {
  const env = new processes.Env(session).process;
  env.stdin.end();
  const otxt = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    env.stdout.on("error", (error: Error) => reject(error));
    env.stdout.on("data", (data: Buffer | string) => (buffer += data.toString()));
    env.stdout.on("end", () => resolve(buffer));
  });
  env.unref();
  return /^\s*$/.test(otxt) ? [] : otxt.trim().split("\n");
}
