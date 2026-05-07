# Release artifacts

GitHub Releases attach:

- Loomlet npm package tarball (`*.tgz`)
- Loomlet VS Code extension VSIX (`*.vsix`)

Artifacts are built by `.github/workflows/release-artifacts.yml` on:

- Release publish (`release.published`)
- Manual run (`workflow_dispatch`)

Manual test:

`gh workflow run release-artifacts.yml`

## Notes

- The workflow runs root unit tests with `npm test`.
- The workflow does **not** publish to npm.
- The workflow does **not** publish to the VS Code Marketplace.
