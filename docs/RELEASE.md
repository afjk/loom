# Release artifacts and maintainer notes

## Pre-release checklist

Before cutting a release:

1. Refresh generated metadata and docs.

   ```bash
   npm run generate:metadata
   ```

2. Run unit tests.

   ```bash
   npm test
   ```

3. Run package dry-run.

   ```bash
   npm run pack:dry-run
   ```

4. Optionally build the VS Code extension package.

   ```bash
   npm run pack:vscode
   ```

5. Review release notes draft.

6. Bump versions only in the release PR.

## Generated files

The following files are generated from shared metadata and should be committed when changed:

- `extensions/vscode-loomlet/generated/library-metadata.json`
- `docs/STANDARD_LIBRARY_REFERENCE.md`

Run:

```bash
npm run generate:metadata
```

Freshness tests fail if these files are stale.

## Release artifacts and build workflows

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
