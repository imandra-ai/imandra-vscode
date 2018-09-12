import Loki = require("lokijs");
import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "./index";

export default class Indexer implements LSP.Disposable {
  public populated: boolean = false;
  private readonly db: Loki = new Loki(".vscode.imandra.loki");
  private readonly symbols: LokiCollection<LSP.SymbolInformation>;

  constructor(private readonly session: Session) {
    this.symbols = this.db.addCollection<LSP.SymbolInformation>("symbols", {
      indices: ["name"],
    });
  }

  public dispose(): void {
    return;
  }

  public findSymbols(query: LokiQuery): LSP.SymbolInformation[] {
    let result: LSP.SymbolInformation[] = [];
    try {
      result = this.symbols
        .chain()
        .find(query)
        .simplesort("name")
        .data();
    } catch (err) {
      //
    }
    return result;
  }

  public async indexSymbols(id: LSP.TextDocumentIdentifier): Promise<void | LSP.ResponseError<void>> {
    const request = merlin.Query.outline();
    const response = await this.session.merlin.query(request, null, id);
    if ("return" !== response.class) return new LSP.ResponseError(-1, "indexSymbols: failed", undefined);
    for (const item of merlin.Outline.intoCode(response.value, id)) {
      const prefix = item.containerName ? `${item.containerName}.` : "";
      item.name = `${prefix}${item.name}`;
      item.containerName = this.session.environment.relativize(id);
      this.symbols.insert(item);
    }
  }

  public async initialize(): Promise<void> {
    return;
  }

  public async populate(origin: LSP.TextDocumentIdentifier): Promise<void> {
    if (!this.populated) {
      this.populated = true;
      const modules = await command.getModules(this.session, null, origin);
      for (const id of modules) {
        if (/\.(iml|ire)i$/.test(id.uri)) continue;
        const document = await command.getTextDocument(this.session, id);
        if (null != document) {
          await this.session.merlin.sync(merlin.Sync.tell("start", "end", document.getText()), id);
          await this.refreshSymbols(id);
        }
      }
    }
  }

  public refreshSymbols(id: LSP.TextDocumentIdentifier): Promise<void | LSP.ResponseError<void>> {
    this.removeSymbols(id);
    return this.indexSymbols(id);
  }

  public removeSymbols({ uri }: LSP.TextDocumentIdentifier): void {
    this.symbols
      .chain()
      .where(item => item.location.uri === uri)
      .remove();
  }
}
