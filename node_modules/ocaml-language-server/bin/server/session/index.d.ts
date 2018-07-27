import * as server from "vscode-languageserver";
import * as LSP from "vscode-languageserver-protocol";
import { ISettings } from "../../../lib";
import { Merlin } from "../processes";
import Analyzer from "./analyzer";
import Environment from "./environment";
import Indexer from "./indexer";
import Synchronizer from "./synchronizer";
export { Environment };
export declare type CancellationSources = "analyzer/refreshWithKind";
export default class Session implements LSP.Disposable {
    readonly analyzer: Analyzer;
    readonly cancellationSources: {
        readonly [S in CancellationSources]: LSP.CancellationTokenSource;
    };
    readonly connection: server.IConnection;
    readonly environment: Environment;
    readonly indexer: Indexer;
    readonly initConf: LSP.InitializeParams;
    readonly merlin: Merlin;
    readonly settings: ISettings;
    readonly synchronizer: Synchronizer;
    constructor();
    cancelTokens<S extends CancellationSources>(sourceName: S): void;
    dispose(): void;
    error(data: any): void;
    initialize(): Promise<void>;
    listen(): void;
    log(data: any): void;
    onDidChangeConfiguration({settings}: LSP.DidChangeConfigurationParams): Promise<void>;
}
