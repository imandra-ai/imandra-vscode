import * as deepmerge from "deepmerge";
import * as merlin from "./merlin";
import * as remote from "./remote";
import * as types from "./types";

export interface ISettings {
  imandra: {
    codelens: {
      enabled: boolean;
      unicode: boolean;
    };
    debounce: {
      linter: number;
    };
    diagnostics: {
      merlinPerfLogging: boolean;
      tools: Array<"merlin" | "bsb" | "esy">;
    };
    path: {
      bsb: string;
      env: string;
      esy: string;
      ocamlfind: string;
      ocamlmerlin: string;
      ocamlmerlinArgs: string[];
      ocpindent: string;
      opam: string;
      rebuild: string;
      refmt: string;
      refmterr: string;
      rtop: string;
    };
    format: {
      width: number | null;
    };
    server: {
      languages: Array<"imandra" | "imandra-reason">;
    };
  };
}
export namespace ISettings {
  export const defaults: ISettings = {
    imandra: {
      codelens: {
        enabled: true,
        unicode: true,
      },
      debounce: {
        linter: 500,
      },
      diagnostics: {
        merlinPerfLogging: false,
        tools: ["merlin"],
      },
      format: {
        width: null,
      },
      path: {
        bsb: "./node_modules/bs-platform/lib/bsb.exe",
        env: "env",
        esy: "esy",
        ocamlfind: "ocamlfind",
        ocamlmerlin: "ocamlmerlin",
        ocamlmerlinArgs: [],
        ocpindent: "ocp-indent",
        opam: "opam",
        rebuild: "rebuild",
        refmt: "refmt",
        refmterr: "refmterr",
        rtop: "rtop",
      },
      server: {
        languages: ["imandra", "imandra-reason"],
      },
    },
  };

  export function withDefaults(overrides: typeof defaults.imandra | undefined | null): typeof defaults.imandra {
    return deepmerge(ISettings.defaults.imandra, overrides || {}, {
      arrayMerge<A>(_: A[], source: A[]): A[] {
        return source; // overwites arrays (with overrides) instead of merging
      },
    });
  }
}

export { merlin, remote, types };
