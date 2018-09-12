import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default function(_: Session): LSP.NotificationHandler0 {
  return () => {
    // session.dispose();
  };
}
