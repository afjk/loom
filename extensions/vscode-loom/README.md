# Loom for Scene Sync

A minimal VS Code extension for writing `.loom` scene behavior scripts used with Scene Sync.

## Features

- `.loom` language association
- basic syntax highlighting
- import completion
- `time.`, `math.`, and `scene.` completions
- named argument completion
- `Loom: Run Current File`
- `Loom: Scene Sync Dev Current File`

## Development

Open this folder in VS Code and press F5 to launch an Extension Development Host.

## Commands

### Loom: Run Current File

Runs:

node bin/loom.mjs run <current-file>

### Loom: Scene Sync Dev Current File

Runs:

node bin/loom.mjs scenesync dev <current-file>

This uses the existing Loom CLI Scene Sync session configuration.

## Limitations

This MVP does not include:

- full Language Server Protocol
- diagnostics
- formatter
- hover documentation from compiler metadata
- graph preview
