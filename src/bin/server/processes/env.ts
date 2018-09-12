import { ChildProcess } from "child_process";
import Session from "../session";

export default class Env {
  public readonly process: ChildProcess;
  constructor(session: Session) {
    const command = session.settings.imandra.path.env;
    this.process = session.environment.spawn(command, []);
  }
}
