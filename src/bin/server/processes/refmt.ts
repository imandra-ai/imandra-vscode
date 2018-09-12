import { ChildProcess } from "child_process";
import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default class ReFMT {
  public readonly process: ChildProcess;
  constructor(session: Session, id?: LSP.TextDocumentIdentifier, argsOpt?: string[]) {
    const uri = id ? id.uri : ".ire";
    const command = session.settings.imandra.path.refmt;

    const width = session.settings.imandra.format.width;
    const widthArg = width === null ? [] : ["--print-width", `${width}`];

    const args =
      argsOpt || ["--parse", "re", "--print", "re", "--interface", `${/\.irei$/.test(uri)}`].concat(widthArg);
    this.process = session.environment.spawn(command, args);
  }
}
