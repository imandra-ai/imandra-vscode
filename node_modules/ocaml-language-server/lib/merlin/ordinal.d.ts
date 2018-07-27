import * as LSP from "vscode-languageserver-protocol";
export interface IColumnLine {
    col: number;
    line: number;
}
export declare type Position = "start" | "end" | number | IColumnLine;
export declare namespace Position {
    function fromCode({character: col, line}: LSP.Position): IColumnLine;
    function intoCode({col: character, line}: IColumnLine): LSP.Position;
}
export interface ILocation {
    start: IColumnLine;
    end: IColumnLine;
}
export declare namespace Location {
    function fromCode(range: LSP.Range): ILocation;
    function intoCode(location: ILocation): LSP.Range;
}
