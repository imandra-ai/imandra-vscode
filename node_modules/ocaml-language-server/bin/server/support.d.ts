import * as LSP from "vscode-languageserver-protocol";
import Session from "./session";
export declare type AsyncRequestHandler<P, R, E> = (event: P, token: LSP.CancellationToken) => Thenable<R | LSP.ResponseError<E>>;
export declare function cancellableHandler<P, R, E>(_session: Session, handler: AsyncRequestHandler<P, R, E>): LSP.RequestHandler<P, R, E>;
