import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";
export default class Merlin implements LSP.Disposable {
    private readonly session;
    private readonly queue;
    private readonly readline;
    private readonly process;
    constructor(session: Session);
    dispose(): void;
    initialize(): Promise<void>;
    query<I, O>({query}: merlin.Query<I, O>, token: LSP.CancellationToken | null, id?: LSP.TextDocumentIdentifier, priority?: number): merlin.Response<O>;
    restart(): Promise<void>;
    sync<I, O>({sync: query}: merlin.Sync<I, O>, id?: LSP.TextDocumentIdentifier): merlin.Response<O>;
    private establishProtocol();
    private logMessage<A>(begunProcessing, task);
}
