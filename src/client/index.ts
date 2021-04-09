import * as path from "path";
import * as vscode from "vscode";
import * as client from "vscode-languageclient";
import * as command from "./command";
import * as request from "./request";
// import { RegistrationRequest } from "vscode-languageclient";

class ClientWindow implements vscode.Disposable {
  public readonly merlin: vscode.StatusBarItem;
  public readonly lsp: vscode.StatusBarItem;
  constructor() {
    this.merlin = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    this.merlin.text = "$(hubot) [loading]";
    this.merlin.command = "imandra.showMerlinFiles";
    this.merlin.show();
    this.lsp = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    this.lsp.text = "$(hubot) [loading]";
    this.lsp.show();
    return this;
  }
  public dispose() {
    this.merlin.dispose();
    this.lsp.dispose();
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
let curClientLsp: client.LanguageClient | undefined;

export async function launchLsp(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
  const imandraConfig = vscode.workspace.getConfiguration("imandra");
  ////const transport = client.TransportKind.stdio;
  ////const run = { module, transport };
  const languages = imandraConfig.get<string[]>("server.languages", ["imandra", "imandra-reason"]);
  console.log(`imandra config => languages: ${languages}`);
  const documentSelector: client.DocumentSelector = new Array();
  for (const language of languages) {
    documentSelector.push({ language, scheme: "file" });
    documentSelector.push({ language, scheme: "untitled" });
  }
  const clientOptions: client.LanguageClientOptions = {
    diagnosticCollectionName: "imandra-lsp",
    documentSelector,
    //  errorHandler: new ErrorHandler(),
    initializationOptions: imandraConfig,
    //  outputChannelName: "Imandra LSP",
    stdioEncoding: "utf8",
    //  //synchronize: {
    //  //  configurationSection: "imandra",
    //  //  fileEvents: [
    //  //    vscode.workspace.createFileSystemWatcher("**/*.iml"),
    //  //    vscode.workspace.createFileSystemWatcher("**/*.ire"),
    //  //  ],
    //  //},
  };
  const serverOptions: client.ServerOptions = {
    run: {
      command: "imandra-lsp",
      args: ["--check-on-save=true"],
      transport: client.TransportKind.stdio,
    },
    debug: {
      command: "imandra-lsp",
      args: ["--check-on-save=true", "-d", "5"],
      transport: client.TransportKind.stdio,
    },
  };
  const languageClient = new client.LanguageClient("imandra.lsp", "imandra lsp", serverOptions, clientOptions);
  const window = new ClientWindow();
  const session = languageClient.start();
  curClientLsp = languageClient; // so we can restart it
  context.subscriptions.push(window);
  context.subscriptions.push(session);
  const reloadCmd = vscode.commands.registerCommand("imandra.lsp.reload", () => {
    console.log("imandra.lsp.reload called");
    restartLsp(context);
  });
  context.subscriptions.push(reloadCmd);
  await languageClient.onReady();
  command.registerAll(context, languageClient);
  request.registerAll(context, languageClient);
  window.lsp.text = "$(hubot) [imandra-lsp]";
  window.lsp.tooltip = "Imandra LSP online";
  window.lsp.command = "imandra.lsp.reload";
  return {
    dispose() {
      if (curClientLsp) curClientLsp.stop();
    },
  };
}

export async function launchMerlin(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
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
    restartMerlin(context);
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

export async function restartMerlin(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
  if (curClient !== undefined) {
    await curClient.stop();
    curClient = undefined;
  }
  return launchMerlin(context);
}

export async function restartLsp(context: vscode.ExtensionContext): Promise<vscode.Disposable> {
  if (curClientLsp !== undefined) {
    await curClientLsp.stop();
    curClientLsp = undefined;
  }
  return launchLsp(context);
}
