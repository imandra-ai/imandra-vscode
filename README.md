# imandra-vscode

Imandra support for Visual Studio Code

## Installation

```
npm install
npm run build
vsce package
```

```
opam switch create imandra-vscode ocaml-base-compiler.4.06.1
eval $(opam env)
opam pin add z3 git@github.com:aestheticintegration/z3-bin.git
opam pin add imandra git@github.com:aestheticintegration/imandra.git
opam pin add imandra-merlin git@github.com:aestheticintegration/imandra-merlin.git
```
