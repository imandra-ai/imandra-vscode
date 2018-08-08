// tslint:disable object-literal-sort-keys
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

const imandraConfiguration = {
  indentationRules: {
    decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
    increaseIndentPattern: /^.*\{[^}"']*$/,
  },
  onEnterRules: [
    {
      beforeText: /^.*\b(switch|try)\b[^\{]*{\s*$/,
      action: {
        indentAction: vscode.IndentAction.IndentOutdent,
        appendText: "| ",
      },
    },
    {
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      afterText: /^\s*\*\/$/,
      action: {
        indentAction: vscode.IndentAction.IndentOutdent,
        appendText: " * ",
      },
    },
    {
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      action: {
        indentAction: vscode.IndentAction.None,
        appendText: " * ",
      },
    },
    {
      beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
      action: {
        indentAction: vscode.IndentAction.None,
        appendText: "* ",
      },
    },
    {
      beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
      action: {
        indentAction: vscode.IndentAction.None,
        removeText: 1,
      },
    },
    {
      beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
      action: {
        indentAction: vscode.IndentAction.None,
        removeText: 1,
      },
    },
    {
      beforeText: /^.*\bfun\b\s*$/,
      action: {
        indentAction: vscode.IndentAction.None,
        appendText: "| ",
      },
    },
    {
      beforeText: /^\s*\btype\b.*=(.*[^;\\{<]\s*)?$/,
      afterText: /^\s*$/,
      action: {
        indentAction: vscode.IndentAction.None,
        appendText: "  | ",
      },
    },
    {
      beforeText: /^(\t|[ ]{2})*[\|]([^!$%&*+-/<=>?@^~;}])*(?:$|=>.*[^\s\{]\s*$)/m,
      action: {
        indentAction: vscode.IndentAction.None,
        appendText: "| ",
      },
    },
    {
      beforeText: /^(\t|(\ \ ))*\|(.*[;])$/,
      action: {
        indentAction: vscode.IndentAction.Outdent,
      },
    },
    {
      beforeText: /^(\t|(\ \ ))*;\s*$/,
      action: {
        indentAction: vscode.IndentAction.Outdent,
      },
    },
  ],
  wordPattern: /\\[^\s]+|[^\\\s\d(){}\[\]#.][^\\\s(){}\[\]#.]*/,
};

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.setLanguageConfiguration("imandra", imandraConfiguration));
  const configName = "path.ocamlmerlin";
  const langConfigName = "server.languages";

  const execLocation = context.asAbsolutePath("ext-script/imandra-merlin");
  const config = vscode.workspace.getConfiguration("reason");

  if (vscode.workspace.rootPath === undefined) {
    vscode.window.showErrorMessage(
      "The Imandra VSCode extension is only permissable when a local workspace is available - please open this file in a directory.",
    );
  } else {
    const filePath = path.join(vscode.workspace.rootPath, ".vscode/settings.json");
    ensureDirectoryExistence(filePath);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "", "utf8");
    }
    config.update(langConfigName, ["ocaml", "reason", "imandra"]);

    const existingExecLocation = config.get(configName);

    if (existingExecLocation !== execLocation) {
      config.update(configName, execLocation);
      await vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  }
}

export function deactivate() {
  return;
}
