import * as path from "path";
import * as vscode from "vscode";
import * as client from "vscode-languageclient";
import * as command from "./command";
import * as request from "./request";
// import { RegistrationRequest } from "vscode-languageclient";

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

let curClient: client.LanguageClient | undefined;

export async function launch(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const imandraConfig = vscode.workspace.getConfiguration("imandra");
  const module = context.asAbsolutePath(path.join("node_modules", "imandra-language-server", "bin", "server"));
  const options = { execArgv: ["--nolazy", "--inspect=6009"] };
  const transport = client.TransportKind.ipc;
  const run = { module, transport };
  const debug = {
    module,
    options,
    transport,
  };
  const serverOptions = { run, debug };
  const languages = imandraConfig.get<string[]>("server.languages", ["imandra", "imandra-reason"]);
  const documentSelector = new Array();
  for (const language of languages) {
    documentSelector.push({ language, scheme: "file" });
    documentSelector.push({ language, scheme: "untitled" });
  }
  const clientOptions: client.LanguageClientOptions = {
    diagnosticCollectionName: "imandra-language-server",
    documentSelector,
    errorHandler: new ErrorHandler(),
    initializationOptions: imandraConfig,
    outputChannelName: "Imandra Language Server",
    stdioEncoding: "utf8",
    synchronize: {
      configurationSection: "imandra",
      fileEvents: [
        vscode.workspace.createFileSystemWatcher("**/*.iml"),
        vscode.workspace.createFileSystemWatcher("**/*.ire"),
        vscode.workspace.createFileSystemWatcher("**/_build"),
        vscode.workspace.createFileSystemWatcher("**/_build/*"),
      ],
    },
  };
  const languageClient = new client.LanguageClient("Imandra", serverOptions, clientOptions);
  const window = new ClientWindow();
  const session = languageClient.start();
  curClient = languageClient; // so we can restart it
  context.subscriptions.push(window);
  context.subscriptions.push(session);
  const reloadCmd = vscode.commands.registerCommand("imandra.merlin.reload", () => {
    console.log("imandra.merlin.reload called");
    restart(context);
  });
  context.subscriptions.push(reloadCmd);
  await languageClient.onReady();
  command.registerAll(context, languageClient);
  request.registerAll(context, languageClient);
  window.merlin.text = "$(hubot) [imandra-merlin]";
  window.merlin.tooltip = "Imandra merlin server online";
  return {
    dispose() {
      if (curClient) curClient.stop();
    },
  };
}

export async function restart(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
  if (curClient !== undefined) {
    await curClient.stop();
    curClient = undefined;
  }
  return launch(context);
}
