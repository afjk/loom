# Scene Sync Workflow Guide

Loomlet supports two distinct Scene Sync workflows for controlling scene behavior: **Scene Commands** (one-shot operations) and **Behavior Graphs** (persistent continuous behavior).

## 1. Scene Command Workflow

A one-shot operation that evaluates Loomlet DSL once and immediately broadcasts scene state changes to Scene Sync.

### Command

```bash
loomlet scenesync run <file>
```

### What it does

- Evaluates the Loomlet source file once
- Converts Scene Sync scene effects into immediate `scene-delta` broadcast operations
- Sends the result directly to Scene Sync (or prints with `--dry-run`)

### When to use

- Simple one-time scene state changes
- Immediate mutations not requiring continuous update loops
- Rapid prototyping

### Example scene effects

```
scene.setPosition(x, y, z)
scene.setRotation(x, y, z)
scene.setScale(x, y, z)
```

### Examples

```bash
# Preview without sending
loomlet scenesync run examples/scene-effects.loom --dry-run

# Send to Scene Sync
loomlet scenesync run examples/scene-effects.loom --send
```

### Important

This is **not a persistent behavior graph attachment**. Scene commands execute once and complete.

---

## 2. Behavior Graph Workflow

Compile Loomlet DSL into a behavior graph and attach or clear it persistently in Scene Sync. Behavior graphs run continuously and are managed via `scene-graph-set` and `scene-graph-clear` protocol messages.

### Commands

#### Compile behavior graph

```bash
loomlet scenesync behavior compile <file> [--object <id> | --scene]
```

Compile Loomlet DSL to a Scene Sync behavior graph payload without sending. Useful for inspection and testing.

#### Set (attach) behavior graph

```bash
loomlet scenesync behavior set <file> [--object <id> | --scene]
```

Compile and attach a behavior graph to a scope. Replaces any existing graph at that scope.

#### Clear behavior graph

```bash
loomlet scenesync behavior clear [--object <id> | --scene]
```

Clear (detach) a persistent behavior graph from a scope.

### Scope options

#### `--object <id>`

Attach or clear an **object-level** behavior graph. The graph is scoped to a single scene object by ID.

```bash
loomlet scenesync behavior set examples/lissajous.loom --object sample-cube --send
loomlet scenesync behavior clear --object sample-cube --send
```

#### `--scene`

Attach or clear a **scene-level** behavior graph. The graph affects the entire scene.

```bash
loomlet scenesync behavior set examples/lissajous.loom --scene --send
loomlet scenesync behavior clear --scene --send
```

**Scope is required** for `behavior set` and `behavior clear`.

### Internal payloads

When you run `behavior set`, Loomlet sends a `scene-graph-set` message:

```json
{
  "type": "scene-graph-set",
  "scope": "scene",
  "graph": { "nodes": [...], "edges": [...] }
}
```

When you run `behavior clear`, Loomlet sends a `scene-graph-clear` message:

```json
{
  "type": "scene-graph-clear",
  "scope": "scene"
}
```

For object-scoped graphs, `scope` becomes `{ "object": "sample-cube" }`.

### Examples

Object-level persistent behavior:

```bash
loomlet scenesync behavior compile examples/lissajous.loom --object sample-cube --dry-run
loomlet scenesync behavior set examples/lissajous.loom --object sample-cube --send
```

Scene-level persistent behavior:

```bash
loomlet scenesync behavior set examples/lissajous.loom --scene --dry-run
loomlet scenesync behavior set examples/lissajous.loom --scene --send
```

Clear object-level behavior:

```bash
loomlet scenesync behavior clear --object sample-cube --send
```

Clear scene-level behavior:

```bash
loomlet scenesync behavior clear --scene --send
```

---

## 3. Development Workflow

Watch a Loomlet source file and repeatedly compile and send behavior graph updates to Scene Sync on every file change.

### Command

```bash
loomlet scenesync dev <file> [--object <id> | --scene]
```

### What it does

- Watches the input file for changes
- Compiles on every save
- Repeatedly sends `scene-graph-set` updates to Scene Sync
- Useful for iterative development and testing

### Example

```bash
loomlet scenesync dev examples/lissajous.loom --object sample-cube
```

Edits to `examples/lissajous.loom` will trigger recompilation and automatic updates to the Scene Sync behavior graph.

### Notes

- Primarily for development iteration
- Still requires an active Scene Sync session or endpoint
- Use `--dry-run` to preview updates without sending

---

## 4. Terminology Table

This table maps design terminology to CLI commands:

| Design term | CLI term | Meaning |
|---|---|---|
| attach | `behavior set` | Attach a persistent behavior graph |
| clear | `behavior clear` | Clear (detach) a persistent behavior graph |
| run | `scenesync run` | Execute a one-shot scene command (not persistent) |
| dev | `scenesync dev` | Watch and update behavior graph during development |

The CLI terms are the **public-facing workflow**. Older or internal design wording should map to these.

---

## 5. Scope Concepts

Scene Sync behavior graphs can be scoped to different targets.

### Scene-level graph

```json
"scope": "scene"
```

A behavior graph attached to the entire scene. Used for scene-wide behavior or object-to-object relationships.

### Object-level graph

```json
"scope": { "object": "sample-cube" }
```

A behavior graph attached to a single scene object by ID. Multiple objects can have independent graphs.

---

## 6. Lower-level Graph Commands

Loomlet also provides lower-level graph-oriented commands:

```
graph-compile
graph-set
graph-clear
graph-run
```

These are internal or compatibility-level commands. **New documentation and user-facing workflows should prefer the higher-level `behavior compile`, `behavior set`, `behavior clear`, and `dev` commands.**

---

## 7. Common Patterns

### Quick test of a behavior graph

```bash
loomlet scenesync behavior compile examples/lissajous.loom --object sample-cube --dry-run
```

### Attach a persistent animation to an object

```bash
loomlet scenesync behavior set examples/lissajous.loom --object sample-cube --send
```

### Iteratively develop and test behavior

```bash
loomlet scenesync dev examples/lissajous.loom --object sample-cube
# Edit examples/lissajous.loom and save; updates automatically send
```

### Stop a running behavior

```bash
loomlet scenesync behavior clear --object sample-cube --send
```

### One-shot scene state change

```bash
loomlet scenesync run examples/scene-effects.loom --send
```

---

## 8. Related Documentation

- [Loomlet SPEC](./SPEC.md) – Design principles and 3-layer model
- [Scene Sync Protocol](./SCENESYNC.md) – Low-level message protocol and node reference
- [CLI Reference](./cli.md) – General CLI usage
