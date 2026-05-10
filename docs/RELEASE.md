# Release artifacts and maintainer notes

GitHub release/build workflows:

- `.github/workflows/release-artifacts.yml`
  - builds Loomlet npm package tarball (`*.tgz`)
  - builds Loomlet VS Code extension VSIX (`*.vsix`)
  - runs on release publish and manual dispatch
  - does not publish to npm
  - does not publish to Visual Studio Marketplace

- `.github/workflows/publish-vscode-extension.yml`
  - manually publishes only `extensions/vscode-loomlet` to Visual Studio Marketplace
  - uses repository secret `VSCE_PAT`

Related docs:

- [VS Code extension publish instructions](../extensions/vscode-loomlet/README.md#publishing-the-vs-code-extension)
