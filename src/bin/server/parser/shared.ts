import * as LSP from "vscode-languageserver-protocol";

type DiagnosticSource = "bucklescript" | "refmt";

export const createDiagnostic = (source: DiagnosticSource) => (
  message: string,
  startCharacter: number,
  startLine: number,
  endCharacter: number,
  endLine: number,
  severity: LSP.DiagnosticSeverity,
) => {
  return {
    code: "",
    message,
    range: {
      end: {
        character: endCharacter,
        line: endLine,
      },
      start: {
        character: startCharacter,
        line: startLine,
      },
    },
    severity,
    source,
  };
};
