import * as path from "path";
import * as vscode from "vscode";
import * as client from "vscode-languageclient";
import * as command from "./command";
import * as request from "./request";

class ClientWindow implements vscode.Disposable {
  public readonly merlin: vscode.StatusBarItem;
  constructor() {
    this.merlin = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    this.merlin.text = "$(hubot) [loading]";
    this.merlin.command = "imandra.showMerlinFiles";
    this.merlin.show();
    return this;
  }
  public dispose() {
    this.merlin.dispose();
  }
}

class ErrorHandler {
  public closed(): client.CloseAction {
    return client.CloseAction.DoNotRestart;
  }
  public error(): client.ErrorAction {
    return client.ErrorAction.Shutdown;
  }
}

export async function launch(context: vscode.ExtensionContext): Promise<void> {
  const imandraConfig = vscode.workspace.getConfiguration("imandra");
  const module = context.asAbsolutePath(path.join("node_modules", "ocaml-language-server", "bin", "server"));
  const options = { execArgv: ["--nolazy", "--inspect=6009"] };
  const transport = client.TransportKind.ipc;
  const run = { module, transport };
  const debug = {
    module,
    options,
    transport,
  };
  const serverOptions = { run, debug };

  const clientOptions: client.LanguageClientOptions = {
    diagnosticCollectionName: "ocaml-language-server",
    documentSelector: [{ language: "imandra", scheme: "file" }, { language: "imandra", scheme: "untitled" }],
    errorHandler: new ErrorHandler(),
    initializationOptions: imandraConfig,
    outputChannelName: "OCaml Language Server",
    stdioEncoding: "utf8",
    synchronize: {
      configurationSection: "imandra",
      fileEvents: [vscode.workspace.createFileSystemWatcher("**/*.iml")],
    },
  };
  const languageClient = new client.LanguageClient("imandra", serverOptions, clientOptions);
  const window = new ClientWindow();
  const session = languageClient.start();
  context.subscriptions.push(window);
  context.subscriptions.push(session);
  await languageClient.onReady();
  command.registerAll(context, languageClient);
  request.registerAll(context, languageClient);
  window.merlin.text = "$(hubot) [merlin]";
  window.merlin.tooltip = "merlin server online";
}
