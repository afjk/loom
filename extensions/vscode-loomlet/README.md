# Loomlet for Scene Sync

A minimal VS Code extension for writing `.loom` scene behavior scripts used with Scene Sync.

## Features

- `.loom` language association
- basic syntax highlighting
- import completion
- `time.`, `math.`, and `scene.` completions
- named argument completion
- `Loomlet: Run Current File`
- `Loomlet: Scene Sync Dev Current File`

## Development

Open this folder in VS Code and press F5 to launch an Extension Development Host.

## Commands

### Loomlet: Run Current File

Runs:

loomlet run <current-file>

### Loomlet: Scene Sync Dev Current File

Runs:

loomlet scenesync dev <current-file>

This uses the existing Loomlet CLI Scene Sync session configuration.

## Limitations

This MVP does not include:

- full Language Server Protocol
- diagnostics
- formatter
- hover documentation from compiler metadata
- graph preview

VS Code completions are generated from Loomlet library metadata. Run `npm run generate:vscode-metadata` after changing library metadata.
