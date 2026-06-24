# VS Code extension

Loomlet provides a VS Code extension under `extensions/vscode-loomlet`.

It includes:

- syntax highlighting
- completion
- diagnostics
- preview support

## Host compatibility diagnostics

Set the `loomlet.targetHost` setting to one of `web-scenesync`, `unity-runtime`,
`export-viewer`, or `cli` to get inline warnings when a `.loom` file uses nodes
that require a capability the target host does not provide (for example,
`scene.setColor` on `cli`). The default `none` disables these warnings. See the
[Host Capability Guide](HOST_CAPABILITY_GUIDE.md) for what each host supports.

See:

- [Extension README](../extensions/vscode-loomlet/README.md)
- [Marketplace listing](https://marketplace.visualstudio.com/search?term=Loomlet&target=VSCode&category=All%20categories&sortBy=Relevance)
