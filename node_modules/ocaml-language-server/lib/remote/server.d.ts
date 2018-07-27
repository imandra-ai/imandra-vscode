import { RequestType } from "vscode-jsonrpc";
import { TextDocumentIdentifier } from "vscode-languageserver-protocol";
import * as merlin from "../merlin";
import { ITextDocumentRange } from "../types";
export declare const giveCaseAnalysis: RequestType<ITextDocumentRange, [{
        end: merlin.IColumnLine;
        start: merlin.IColumnLine;
    }, string] | null, void, void>;
export declare const giveMerlinFiles: RequestType<TextDocumentIdentifier, string[], void, void>;
export declare const giveAvailableLibraries: RequestType<TextDocumentIdentifier, string[], void, void>;
export declare const giveProjectEnv: RequestType<TextDocumentIdentifier, string[], void, void>;
