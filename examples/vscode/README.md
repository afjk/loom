# VS Code Runtime Preview Examples

These examples are intended for the Loomlet VS Code extension.

Open a `.loom` file in this directory, then run:

```text
Loomlet: Open Node Preview to the Side
```

The Node Preview shows the node graph as an overlay and uses the background canvas as a small runtime host.

## Examples

| File | What to try |
| --- | --- |
| `01-bouncing-bar.loom` | A simple animated bar rendered to the preview canvas. |
| `console-log.loom` | Writes values to `View > Output > Loomlet` while rendering a bar. |
| `03-mouse-follower.loom` | Move the mouse over the preview canvas. |
| `04-mouse-paint.loom` | Hold the mouse button down and draw. Press Reset to clear the canvas. |
| `05-key-visualizer.loom` | Click the preview canvas, then press Space or Arrow keys. |

## Host-specific capabilities

The following helpers are currently provided by the VS Code Runtime Preview host:

- `input.mouseX()`
- `input.mouseY()`
- `input.mouseDown()`
- `input.key("Space")` and other `KeyboardEvent.code` values
- `render point(..., enabled: ...)`
- `render keys(...)`

These are useful for learning and interactive previews, but they are not yet a shared contract across every Loomlet host. Other hosts may ignore or reject them until they are promoted into the common runtime/host specification.

## Output

`console.log(...)` writes to:

```text
View > Output > Loomlet
```

Use the command below to clear it:

```text
Loomlet: Clear Output
```
