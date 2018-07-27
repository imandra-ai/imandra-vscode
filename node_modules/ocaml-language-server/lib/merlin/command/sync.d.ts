import * as ordinal from "../ordinal";
export declare class Sync<I, O> {
    readonly sync: I;
    constructor(sync: I);
}
export declare namespace Sync {
    namespace protocol {
        namespace version {
            const get: () => Sync<["protocol", "version"], {
                selected: number;
                latest: number;
                merlin: string;
            }>;
            const set: (version: number) => Sync<["protocol", "version", number], {
                selected: number;
                latest: number;
                merlin: string;
            }>;
        }
    }
    const tell: (startPos: ordinal.Position, endPos: ordinal.Position, source: string) => Sync<["tell", ordinal.Position, ordinal.Position, string], null>;
}
