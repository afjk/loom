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

4. Ensure root `package.json` version is bumped.

5. Ensure `extensions/vscode-loomlet/package.json` version matches root version.

6. Review release notes.

7. Create a GitHub Release with a tag like `v0.1.2`.

## Generated files

The following files are generated from shared metadata and should be committed when changed:

- `extensions/vscode-loomlet/generated/library-metadata.json`
- `docs/STANDARD_LIBRARY_REFERENCE.md`

Run:

```bash
npm run generate:metadata
```

Freshness tests fail if these files are stale.

## GitHub Pages deployment

GitHub Pages is deployed automatically on pushes to `main` via:

```
.github/workflows/deploy-pages.yml
```

This workflow builds the Node Editor and publishes the node editor, examples, and source code.

## GitHub Release automation

Publishing a GitHub Release automatically triggers the full release distribution flow via `.github/workflows/release-artifacts.yml`:

1. **Validates** root package version against the release tag
2. **Validates** VS Code extension version against root package version
3. **Generates** metadata and docs via `npm run generate:metadata`
4. **Fails** if generated files are stale (not committed)
5. **Runs** unit tests
6. **Builds** npm tarball
7. **Runs** VS Code extension tests
8. **Builds** VSIX
9. **Uploads** artifacts (`*.tgz` and `*.vsix`) to GitHub Release
10. **Publishes** `@afjk/loomlet` to npm via trusted publishing
11. **Publishes** the VS Code extension to Visual Studio Marketplace

## Required configuration

### npm publishing

The `@afjk/loomlet` package is published to npm using npm Trusted Publishing.

Trusted Publishing does not require an `NPM_TOKEN` repository secret. Configure this GitHub repository and release workflow as a trusted publisher in the npm package settings.

If token-based publishing is used instead, configure `NODE_AUTH_TOKEN` explicitly and update the workflow accordingly.

### Visual Studio Marketplace publishing

VS Code extension publishing requires the `VSCE_PAT` repository secret, which is a Personal Access Token with Marketplace publishing permissions.

## Manual workflows

### Manual VS Code extension publish

The `.github/workflows/publish-vscode-extension.yml` workflow is available as a fallback for emergency republishes or extension-only fixes:

```
.github/workflows/publish-vscode-extension.yml
  - manually triggered via workflow_dispatch
  - publishes only extensions/vscode-loomlet to Visual Studio Marketplace
  - requires VSCE_PAT secret
```
