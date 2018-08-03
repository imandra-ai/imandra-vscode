# imandra-vscode

Imandra support for Visual Studio Code

## Installation

In order to make this extension work for developments using Imandra, please follow the two installation sections below.

### Imandra-merlin

Please use the following commands to install the correct imandra and imandra-merlin executables on your opam switch - replace SWITCHNAME with some appropriately named switch.
```
opam switch create SWITCHNAME ocaml-base-compiler.4.06.1
eval $(opam env)
opam pin add z3 git@github.com:aestheticintegration/z3-bin.git
opam pin add imandra git@github.com:aestheticintegration/imandra.git
opam pin add imandra-merlin git@github.com:aestheticintegration/imandra-merlin.git
opam pin add https://github.com/bronsa/merlin.git\#merlin-extend
ln -s `which ocamlmerlin-imandra` /usr/local/bin
```

### VSCode extension

In order to run this extension you need to first run the following commands in the installation directory:

```
npm install
npm run build
vsce package
```

Then in VSCode choose the "Install from VSIX" option from the `...` menu under the extension view (square symbol bottom of the 5 on the left). Once this has been installed choose "reload now". 

If you try to open just an iml file in no workspace (i.e. not opening a directory) then the extension will fail to start and an error will be displayed. Open the directory where you installed the SWITCHNAME switch explained above and put your iml/ml files there.
