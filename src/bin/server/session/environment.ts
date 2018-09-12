import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as URL from "url";
import * as LSP from "vscode-languageserver-protocol";
import Session from "./index";

const fileSchemeLength = "file://".length - 1;

export default class Environment implements LSP.Disposable {
  public static pathToUri(path: string): LSP.TextDocumentIdentifier {
    const uri = URL.format(URL.parse(`file://${path}`));
    return { uri };
  }

  public static uriToPath({ uri }: LSP.TextDocumentIdentifier): string {
    return uri.substr(fileSchemeLength);
  }

  /**
   * Projects may optionally generate a command-exec runner script.
   * By outputting this file, projects are opting into having IDE features,
   * executed through a command wrapper which will ensure that all the
   * right build tools and dependencies are made available.
   * For example, ocamlfind libraries will be seen, and the correct version
   * of `refmt` will be selected etc.
   *
   */
  private projectCommandWrapper: null | string = null;

  constructor(private readonly session: Session) {}

  public async initialize(): Promise<void> {
    await this.determineCommandWrapper();
  }

  public dispose(): void {
    return;
  }

  public relativize(id: LSP.TextDocumentIdentifier): string | undefined {
    const rootPath = this.workspaceRoot();
    if (null == rootPath) return;
    return path.relative(rootPath, Environment.uriToPath(id));
  }

  public spawn(
    command: string,
    args: string[] = [],
    options: childProcess.SpawnOptions = {},
  ): childProcess.ChildProcess {
    options.shell = process.platform === "win32" ? true : options.shell;
    if (null != this.projectCommandWrapper) {
      return childProcess.spawn(this.projectCommandWrapper, [command].concat(args), options);
    } else {
      return childProcess.spawn(command, args, options);
    }
  }

  public workspaceRoot(): string | null | undefined {
    return this.session.initConf.rootPath;
  }

  private projectCommandWrapperPath(workspaceRoot: string | null | undefined): string | null {
    return workspaceRoot === null || workspaceRoot === undefined
      ? null
      : path.join(
          workspaceRoot,
          "node_modules",
          ".cache",
          "_esy",
          "build",
          "bin",
          process.platform === "win32" ? "command-exec.bat" : "command-exec",
        );
  }

  private async determineCommandWrapper(): Promise<void> {
    const workspaceRoot = this.workspaceRoot();
    try {
      const projectCommandWrapper = this.projectCommandWrapperPath(workspaceRoot);
      if (null != projectCommandWrapper) {
        const exists = await fs.existsSync(projectCommandWrapper);
        this.projectCommandWrapper = exists ? projectCommandWrapper : null;
      }
    } catch (err) {
      this.session.error(`Error determining if command wrapper exists at: ${workspaceRoot}`);
    }
  }
}
