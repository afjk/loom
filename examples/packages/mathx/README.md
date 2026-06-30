# mathx Package

A small **example of authoring your own functions** for Loomlet.

A Loomlet "function" is a node type: a JavaScript object that declares its
inputs, params, and outputs, plus an `evaluate()` implementation. Register node
types inside `registerLoomletPackage(registry)` and they become callable from
`.loom` source after an `import`.

This package is a trusted local package. It is not loaded from npm or a remote
URL. It is loaded by an explicit path, demonstrating the directory-manifest form
(`loomlet.package.json` + `index.js` + `metadata.json`).

## Files

- `index.js` - registers the node implementations (`registerLoomletPackage`)
- `metadata.json` - optional metadata for `:libs`, `:help`, `loomlet docs`
- `loomlet.package.json` - manifest pointing at the entry and metadata

## Usage

```loom
import mathx

# clamp a value into a range
safe = mathx.clamp(1.5, min: 0, max: 1)   # -> 1

# linear interpolation: a + (b - a) * t
# only the first argument may be positional; the rest must be named
mid = mathx.lerp(0, b: 100, t: 0.25)      # -> 25
```

Run it from the repository root by pointing `--package` at this directory:

```bash
node bin/loomlet.mjs run examples/mathx.loom \
  --package ./examples/packages/mathx \
  --get safe.out --get mid.out
```

You can also point `--package` directly at the entry file
(`./examples/packages/mathx/index.js`).

Inspect the docs that come from the metadata:

```bash
node bin/loomlet.mjs docs mathx --package ./examples/packages/mathx
```

## Nodes

### mathx.clamp

Constrains a value to the `[min, max]` range.

**Inputs:**
- `value` (number, default: 0) - positional
- `min` (number, default: 0)
- `max` (number, default: 1)

**Output:** `out` (number)

### mathx.lerp

Linear interpolation between `a` and `b` by `t` in `[0, 1]`.

**Inputs:**
- `a` (number, default: 0) - positional
- `b` (number, default: 1)
- `t` (number, default: 0)

**Output:** `out` (number)

## Writing your own

1. Copy this directory.
2. Rename the library prefix (`mathx.*`) and update `loomlet.package.json`.
3. Add node types in `index.js`; each `evaluate(inputs, params, ctx)` returns an
   object keyed by your output port names.
4. (Optional) Mirror them in `metadata.json` for editor/REPL/docs support.

See [docs/labs/PACKAGE_SYSTEM.md](../../../docs/labs/PACKAGE_SYSTEM.md) for the
full package API.
