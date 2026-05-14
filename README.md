# Loomlet

A small reactive DSL and node graph toolkit for interactive scenes.

Loomlet provides:

- a `.loom` DSL
- a core JavaScript library
- a CLI
- a VS Code extension
- a Web Node Editor

> Status: experimental. APIs, graph format, and DSL syntax may change.

## Try it

- Web Node Editor: https://afjk.github.io/loomlet/node-editor/
- Examples: [examples/README.md](examples/README.md)

## Install

```bash
npm install @afjk/loomlet
```

## CLI

Create a small `.loom` file:

```bash
echo 'x = 1' > hello.loom
```

Compile it:

```bash
npx -p @afjk/loomlet loomlet compile hello.loom
```

For global install:

```bash
npm install -g @afjk/loomlet
loomlet --help
```

To load a trusted local package:

```bash
loomlet run ./file.loom --package ./examples/packages/demo/index.js --get x.out
```

See [Package System docs](docs/labs/PACKAGE_SYSTEM.md) for details.

## Library usage

```js
import { parseDSLToAST, compileToGraph } from "@afjk/loomlet";

const source = `x = 1`;

const { ast, errors: parseErrors } = parseDSLToAST(source);
if (parseErrors.length) {
  console.error(parseErrors);
}

const { graph, errors: compileErrors } = compileToGraph(ast);
if (compileErrors.length) {
  console.error(compileErrors);
}

console.log(graph);
```

## VS Code extension

The Loomlet VS Code extension provides:

- syntax highlighting
- completion
- diagnostics
- preview support

Search for `Loomlet` in the VS Code Marketplace.

## Documentation

- [Language guide](docs/language-guide.md)
- [CLI guide](docs/cli.md)
- [VS Code extension](docs/vscode-extension.md)
- [Concepts and design notes](docs/concepts.md)
- [Terminology](docs/TERMINOLOGY.md)
- [Stabilization roadmap](docs/STABILIZATION_ROADMAP.md)
- [設計ノート（日本語）](docs/concepts.ja.md)
- [Scene Sync integration](docs/scene-sync.md)
- [Release and maintainer notes](docs/RELEASE.md)
- [Standard library reference](docs/STANDARD_LIBRARY_REFERENCE.md)
- [Runtime node registration](docs/RUNTIME_NODE_REGISTRATION.md)
- [Runtime parity fixtures](docs/RUNTIME_PARITY_FIXTURES.md)
- [Unity runtime compatibility](docs/UNITY_RUNTIME_COMPATIBILITY.md)

Generated metadata and reference docs can be refreshed with `npm run generate:metadata`.

## License

MIT
