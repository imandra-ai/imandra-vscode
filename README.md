# Imandra IDE

Imandra is both a programming language and a reasoning engine with which you can analyse and verify properties of your programs. This VSCode plugin allows you to develop files which can be analysed by Imandra, and also incorporates a specific merlin extension which provides information on underlying types and completions.

## System requirements

It is necessary that the Imandra installation instructions are followed in order for the asynchronous verification, and integration with Imandra-specific merlin to function properly. All the required components are installed automatically by following the instructions provided [here](https://docs.imandra.ai/imandra-docs-dev/notebooks/installation/). If you have any question about the installation or using Imandra, please ask us on our [Discord server](https://discord.gg/byQApJ3).

In order for the `ocp-indent`, `ocamlfind` and `refmt` commands to work (for example on automatic code-formatting), these must be installed globally on the system.

## Functionality

This plugin provides both an interface to the Imandra reasoning engine, and also to the merlin type checker and development environment, specific to Imandra's .iml and .ire file format.

Please see the [documentation](https://docs.imandra.ai/imandra-docs/) to learn more about how to write verification goals and perform counter-example checking in Imandra.

### Asynchronous verification with Imandra

As an Imandra file is edited, the plugin communicates with Imandra and updates the status of definitions, verification goals and bounded model-checking statements. Statements which are admissible receive a green Imandra icon in the left margin, and those that fail either receive a red Imandra icon - in the case of an unverfiable goal, or an instance not being found. An error is displayed for statements which are inadmissible by Imandra, such as those which cannot be shown to be terminating, or which are declared as theorems but cannot be proved. Please view the below gifs as examples of the plugin in use.

![Imandra VS Code screenshot](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/vscodeV1.gif)

![Imandra VS Code screenshot](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/vscodeV2.gif)

![Imandra VS Code screenshot](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/vscodeV3.gif)

### Syntax highlighting

This extension provides a syntax highlighter is provided for Imandra files with extension `.iml`, by which the `imandra` language is identified, which provides identifiable syntax highlighting for the extra reasoning related keywords in Imandra such as `verify` and `theorem`. It also highlights files with a `.ire` extension, by which the `imandra-reason` language is identified, and provides highlighting for the same reasoning related keywords.

### Merlin functionality

The merlin integration for this VSCode extension builds on the existing excellent [OCaml and Reason IDE](https://marketplace.visualstudio.com/items?itemName=freebroccolo.reasonml) for Reason and OCaml files. It provides a mirror of the environment variables for each of the possible commands, and code actions function exactly the same as from this repository. By default, merlin uses specific readers to analyse `imandra` and `imandra-reason` files.

At present the `imandra` and `imandra-reason` reader extensions for merlin provide:

- basic syntax error highlighting
- type error information
- type information of the underlying `imandra` types
- general syntax completions

![Imandra VS Code screenshot](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/animGifVSCode1.gif)

![Imandra VS Code screenshot](https://storage.googleapis.com/imandra-assets/images/github/VS_code_documentation_gif/animGifVSCode2.gif)

### Inherited functionality

All code actions and commands are inherited from the [OCaml and Reason IDE](https://marketplace.visualstudio.com/items?itemName=freebroccolo.reasonml) extension, but the behaviour of merlin is specific to Imandra.
