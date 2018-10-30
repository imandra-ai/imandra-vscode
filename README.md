# Imandra IDE

Imandra is both a programming language and a reasoning engine with which you can analyse and verify properties of your programs. This VSCode plugin allows you to develop files which can be analysed by imandra, and incorporates a specific merlin extension which provides information on underlying types and completions.

In order to learn more about imandra, please visit the interactive [documentation pages](https://docs.imandra.ai/imandra-docs/).

## System requirements

It is necessary that you have the executables `ocamlmerlin` and `ocamlmerlin-imandra` installed on your system. All the imandra-specific components required are installed automatically by following the instructions provided [here](https://docs.imandra.ai/imandra-docs-dev/notebooks/installation/).If installed using [opam](https://opam.ocaml.org/) - the OCaml package manager - the switch detected by VSCode will be the same as if using opam from the directory which corresponds to your workspace root. For example - if you open a directory `~/my_imandra_project/` which has a local switch then the switch in which `merlin` and `ocp-indent` is executed will be this local switch. If no local switch exists, then the default global switch will be used.

Alternatively you can use systems such as [esy](https://esy.sh/) with which you can configure the installation of executables such as `merlin` and `ocp-indent`.

In order for the `ocp-indent`, `ocamlfind` and `refmt` commands to work (for example on automatic code-formatting), these must be installed either globally or on the local switch.

## Functionality

This VSCode extension builds on the existing excellent [OCaml and Reason IDE](https://marketplace.visualstudio.com/items?itemName=freebroccolo.reasonml) for Reason and OCaml files. It provides a mirror of the environment variables for each of the possible commands, and code actions function exactly the same as from this repository.

### Syntax highlighting

This extension provides a syntax highlighter is provided for imandra files with extension `.iml`, by which the `imandra` language is identified, which provides identifiable syntax highlighting for the extra reasoning related keywords in imandra such as `verify` and `theorem`. It also highlights files with a `.ire` extension, by which the `imandra-reason` language is identified, and provides highlighting for the same reasoning related keywords.

### Merlin functionality

By default, merlin uses specific readers to analyse `imandra` and `imandra-reason` files.

At present the `imandra` and `imandra-reason` reader extensions for merlin provide:

* basic syntax error highlighting
* type error information
* type information of the underlying `imandra` types
* general syntax completions

![](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/animGifVSCode1.gif)

![](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/animGifVSCode2.gif)

### Inherited functionality

All code actions and commands are inherited from the [OCaml and Reason IDE](https://marketplace.visualstudio.com/items?itemName=freebroccolo.reasonml) extension, but the behaviour of merlin is specific to imandra.
