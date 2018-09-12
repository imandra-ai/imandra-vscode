import * as ordinal from "../ordinal";

export class Sync<I, O> {
  constructor(public readonly sync: I) {}
}

export namespace Sync {
  // protocol
  export namespace protocol {
    export namespace version {
      export const get = () =>
        new Sync<["protocol", "version"], { selected: number; latest: number; merlin: string }>([
          "protocol",
          "version",
        ]);
      export const set = (version: number) =>
        new Sync<["protocol", "version", number], { selected: number; latest: number; merlin: string }>([
          "protocol",
          "version",
          version,
        ]);
    }
  }

  // tell
  export const tell = (startPos: ordinal.Position, endPos: ordinal.Position, source: string) =>
    new Sync<["tell", ordinal.Position, ordinal.Position, string], null>(["tell", startPos, endPos, source]);
}
