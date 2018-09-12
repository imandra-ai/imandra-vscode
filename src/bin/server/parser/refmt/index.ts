import * as LSP from "vscode-languageserver-protocol";
import { createDiagnostic } from "../shared";

const createRefmtDiagnostic = createDiagnostic("refmt");

export function parseErrors(refmtOutput: string): LSP.Diagnostic[] {
  const parsedDiagnostics: LSP.Diagnostic[] = [];

  const reErrors = new RegExp(
    [/File "(.*)", line (\d*), characters (\d*)-(\d*):[\s\S]*?(?:Error|Warning \d+): ([\s\S]*)/]
      .map(r => r.source)
      .join(""),
    "g",
  );

  let errorMatch;
  while ((errorMatch = reErrors.exec(refmtOutput))) {
    // const fileUri = "file://" + errorMatch[1];
    const startLine = Number(errorMatch[2]) - 1;
    const endLine = Number(errorMatch[2]) - 1;
    const startCharacter = Number(errorMatch[3]);
    const endCharacter = Number(errorMatch[4]);
    const message = errorMatch[5].trim();
    const severity = /^Warning number \d+/.exec(errorMatch[0])
      ? LSP.DiagnosticSeverity.Warning
      : LSP.DiagnosticSeverity.Error;

    const diagnostic: LSP.Diagnostic = createRefmtDiagnostic(
      message,
      startCharacter,
      startLine,
      endCharacter,
      endLine,
      severity,
    );
    parsedDiagnostics.push(diagnostic);
  }

  return parsedDiagnostics;
}
