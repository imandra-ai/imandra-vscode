import Session from "../session";

export default class Esy {
  constructor(private readonly session: Session) {}

  public run(): Promise<string> {
    let buffer = "";
    return new Promise(resolve => {
      const command = this.session.settings.imandra.path.esy;
      const args = ["build"];
      const process = this.session.environment.spawn(command, args);

      process.on("error", (error: Error & { code: string }) => {
        if ("ENOENT" === error.code) {
          const msg = `Perhapse we cannot find esy binary at "${command}".`;
          this.session.connection.window.showWarningMessage(msg);
          this.session.connection.window.showWarningMessage(
            `Double check your path or try configuring "imandra.path.esy" under "User Settings". Do you need to "npm install -g esy"? Alternatively, disable "esy" in "reason.diagnostics.tools"`,
          );
        }
        resolve("");
      });
      process.stdout.on("data", (data: Buffer | string) => (buffer += data.toString()));
      process.stdout.on("end", () => resolve(buffer));
    });
  }
}
