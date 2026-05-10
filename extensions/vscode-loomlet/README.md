# Loomlet for Scene Sync

A minimal VS Code extension for writing `.loom` scene behavior scripts used with Scene Sync.

The extension depends on the [`@afjk/loomlet`](https://www.npmjs.com/package/@afjk/loomlet) npm package.

## Features

- `.loom` language association
- basic syntax highlighting
- diagnostics for parse and compile errors
- import completion
- `time.`, `math.`, and `scene.` completions
- named argument completion
- `Loomlet: Run Current File`
- `Loomlet: Scene Sync Dev Current File`
- `Loomlet: Compile Scene Sync Behavior Graph`
- `Loomlet: Set Scene Sync Object Behavior Graph`
- `Loomlet: Clear Scene Sync Object Behavior Graph`
- `Loomlet: Set Scene Sync Scene Behavior Graph`
- `Loomlet: Clear Scene Sync Scene Behavior Graph`

## Development

Open this folder in VS Code and press F5 to launch an Extension Development Host.

## Publishing the VS Code extension

The VS Code extension can be published through GitHub Actions.

1. Ensure `extensions/vscode-loomlet/package.json` has a new version.
2. Ensure the repository secret `VSCE_PAT` is configured.
3. Run the `Publish VS Code Extension` workflow manually from GitHub Actions.

The workflow:
- installs extension dependencies
- runs extension tests
- packages the VSIX
- publishes to Visual Studio Marketplace using `VSCE_PAT`

## Commands

### Loomlet: Run Current File

Runs:

loomlet run <current-file>

### Loomlet: Scene Sync Dev Current File

Runs:

loomlet scenesync dev <current-file>

This uses the existing Loomlet CLI Scene Sync session configuration. It watches the current file and repeatedly compiles/sends during development.

### Loomlet: Compile Scene Sync Behavior Graph

Compiles the current `.loom` file to a Scene Sync Behavior Graph payload and displays it in the output channel.

Select either "Object Behavior Graph" or "Scene Behavior Graph":
- **Object Behavior Graph**: Requires a Scene Sync object id (e.g., `sample-cube`)
- **Scene Behavior Graph**: No additional input required

### Loomlet: Set Scene Sync Object Behavior Graph

Sends the current `.loom` file as an Object Behavior Graph to Scene Sync.

Prompts for a Scene Sync object id (e.g., `sample-cube`).

### Loomlet: Clear Scene Sync Object Behavior Graph

Clears the Object Behavior Graph for a given Scene Sync object id.

### Loomlet: Set Scene Sync Scene Behavior Graph

Sends the current `.loom` file as a Scene Behavior Graph to Scene Sync.

### Loomlet: Clear Scene Sync Scene Behavior Graph

Clears the Scene Behavior Graph for the current Scene Sync scene.

## Scene Sync Workflow

1. Open a `.loom` file in VS Code.
2. Edit the file and preview with **Loomlet: Open Node Preview to the Side**.
3. Once satisfied, use one of the Scene Sync Behavior Graph commands:
   - Run **Loomlet: Compile Scene Sync Behavior Graph** to preview the payload.
   - Run **Loomlet: Set Scene Sync Object Behavior Graph** to send it to a specific object.
   - Run **Loomlet: Set Scene Sync Scene Behavior Graph** to send it to the scene.
4. The object or scene will receive the Behavior Graph through `scene-graph-set`.

A Behavior Graph is persistent continuous behavior, different from one-shot Scene Commands such as `scene-delta`.

## Limitations

This MVP does not include:

- full Language Server Protocol
- formatter
- hover documentation from compiler metadata
- graph preview (experimental / not fully implemented)

VS Code completions are generated from Loomlet library metadata. Run `npm run generate:vscode-metadata` after changing library metadata.
