import * as LSP from "vscode-languageserver-protocol";
import * as ordinal from "./ordinal";
export declare namespace Case {
    type Destruct = [{
        end: ordinal.IColumnLine;
        start: ordinal.IColumnLine;
    }, string];
}
export declare namespace Completion {
    interface ILabel {
        name: string;
        type: string;
    }
    type Context = null | ["application", {
        argument_type: string;
        labels: ILabel[];
    }];
    type Kind = "#" | "Class" | "Constructor" | "Exn" | "Label" | "Method" | "Module" | "Signature" | "Type" | "Value" | "Variant";
    namespace Kind {
        function intoCode(kind: Kind): LSP.CompletionItemKind;
    }
    interface IEntry {
        name: string;
        kind: Kind;
        desc: string;
        info: string;
    }
    function intoCode({name: label, kind, desc: detail, info: documentation}: IEntry): LSP.CompletionItem;
}
export interface IErrorReport {
    start: ordinal.IColumnLine;
    end: ordinal.IColumnLine;
    valid: boolean;
    message: string;
    type: IErrorReport.Type;
}
export declare namespace IErrorReport {
    type Type = "env" | "error" | "parser" | "type" | "unknown" | "warning";
    namespace Type {
        function intoCode(type: Type): LSP.DiagnosticSeverity;
    }
    function intoCode(session: any, {uri}: LSP.TextDocumentIdentifier, {end, message: original, start, type}: IErrorReport): Promise<LSP.Diagnostic>;
}
export declare namespace Outline {
    type Kind = "Class" | "Constructor" | "Exn" | "Label" | "Method" | "Modtype" | "Module" | "Signature" | "Type" | "Value";
    namespace Kind {
        function intoCode(kind: Kind): LSP.SymbolKind;
    }
    interface IItem {
        start: ordinal.IColumnLine;
        end: ordinal.IColumnLine;
        name: string;
        kind: Kind;
        children: IItem[];
    }
    function intoCode(outline: IItem[], id: LSP.TextDocumentIdentifier): LSP.SymbolInformation[];
}
export declare type Outline = Outline.IItem[];
export declare type TailPosition = "call" | "no" | "position";
export declare namespace TailPosition {
    function intoCode(info: TailPosition): LSP.MarkedString;
}
export interface IType {
    start: ordinal.Position;
    end: ordinal.Position;
    type: string;
    tail: TailPosition;
}
