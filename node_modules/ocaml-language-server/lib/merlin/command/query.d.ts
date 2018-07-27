import * as data from "../data";
import * as json from "../json";
import { IColumnLine, ILocation, Position } from "../ordinal";
export declare class Query<I, O> {
    readonly query: I;
    constructor(query: I);
}
export declare namespace Query {
    namespace kase {
        const analysis: {
            from: (start: Position) => {
                to: (end: Position) => Query<["case", "analysis", "from", Position, "to", Position], [{
                        end: IColumnLine;
                        start: IColumnLine;
                    }, string]>;
            };
        };
    }
    namespace complete {
        const prefix: (text: string) => {
            at: (position: Position) => {
                with: {
                    doc: () => Query<["complete", "prefix", string, "at", Position, "with", "doc"], {
                        entries?: data.Completion.IEntry[] | undefined;
                    }>;
                };
            };
        };
    }
    const document: (name: string | null) => {
        at: (position: Position) => Query<["document", string | null, "at", Position], string>;
    };
    namespace dump {
        namespace env {
            const at: (position: Position) => Query<["dump", "env", "at", Position], json.Value>;
        }
    }
    const enclosing: (position: Position) => Query<["enclosing", Position], ILocation[]>;
    const errors: () => Query<["errors"], data.IErrorReport[]>;
    const locate: (name: string | null, kind: "ml" | "mli") => {
        at: (position: Position) => Query<["locate", string | null, "ml" | "mli", "at", Position], {
            file: string;
            pos: IColumnLine;
        }>;
    };
    namespace occurrences {
        namespace ident {
            const at: (position: Position) => Query<["occurrences", "ident", "at", Position], ILocation[]>;
        }
    }
    const outline: () => Query<["outline"], data.Outline.IItem[]>;
    namespace path {
        namespace list {
            const source: () => Query<["path", "list", "source"], string[]>;
        }
    }
    namespace project {
        const get: () => Query<["project", "get"], {
            result: string[];
        }>;
    }
    namespace type {
        const expression: (expr: string) => {
            at: (position: Position) => Query<["type", "expression", string, "at", Position], string>;
        };
        namespace enclosing {
            const at: (position: Position) => Query<["type", "enclosing", "at", Position], data.IType[]>;
        }
    }
}
