# Runtime Node Registry

## 1. Purpose

`NODE_TYPES` is currently the runtime/compiler registry for executable Loomlet node types.

It defines:

- node type name
- category
- inputs
- params
- outputs
- runtime evaluation behavior
- optional lifecycle hooks such as `onStart` / `onStop`

## 2. Current relationship to metadata

**Key distinction:**

```
NODE_TYPES describes what can actually run.
LIBRARY_METADATA describes how nodes are documented, completed, and shown in editors.
```

Today, metadata is not yet the single source of truth. Node definitions, library metadata, and editor completions are maintained separately. The runtime registry and library metadata are gradually being reconciled through drift detection tests.

## 3. Node type naming

Runtime node type names currently include two categories:

### Legacy/unqualified names

Simple names without dots:

- `add`
- `multiply`
- `sine`
- `clock`
- `constant`

These are typically basic operators from Phase 0 and Phase 1 development.

### Library-qualified names

Names using `library.function` dot notation:

- `math.add`
- `logic.select`
- `scene.setPosition`
- `text.upper`

These correspond to functions in the standard library and are the preferred form for public APIs going forward.

Legacy names are still present for backward compatibility and will not be removed in this stabilization phase. New public library nodes should use library-qualified names.

## 4. Expected runtime node shape

Each node definition in `NODE_TYPES` should have this minimum shape:

```js
{
  category: 'transform',
  inputs: [
    { name: 'a', type: 'number', default: 0, kind: 'behavior' }
  ],
  params: [
    { name: 'a', type: 'number', default: 0 }
  ],
  outputs: [
    { name: 'out', type: 'number', kind: 'behavior' }
  ],
  evaluate(inputs, params, ctx) {
    return { out: inputs.a };
  }
}
```

### Fields

- **`category`** (string): Node category for visual organization (e.g., `'source'`, `'transform'`, `'sink'`, `'behavior'`)

- **`inputs`** (array): List of input ports available during compilation. Each input has:
  - `name` (string): port identifier
  - `type` (string): Loomlet type (e.g., `'number'`, `'string'`, `'any'`)
  - `kind` (string, optional): `'behavior'` for continuous inputs, omitted for discrete
  - `default` (any, optional): default value if not connected

- **`params`** (array): List of static literal parameter ports. Each param has:
  - `name` (string): parameter identifier
  - `type` (string): Loomlet type
  - `default` (any, optional): default value if not specified

- **`outputs`** (array): List of output ports produced by evaluation. Each output has:
  - `name` (string): port identifier
  - `type` (string): Loomlet type
  - `kind` (string, optional): `'behavior'` for continuous outputs

- **`evaluate`** (function): Runtime computation. Signature:
  ```js
  evaluate(inputs, params, ctx) -> { [outputName]: value, ... }
  ```
  - `inputs`: object mapping input names to current values
  - `params`: object mapping parameter names to literal values
  - `ctx`: runtime context (frame time, engine, node ID, etc.)
  - Return value: object with one key per output

- **`onStart`** (function, optional): Called when the node first enters the graph. Signature: `onStart(ctx) -> void`

- **`onStop`** (function, optional): Called when the node leaves the graph. Signature: `onStop(ctx) -> void`

## 5. Drift policy

The following policy guides reconciliation between `NODE_TYPES` and `LIBRARY_METADATA`:

- **Public metadata should only advertise executable runtime nodes.** Every function in `LIBRARY_METADATA` must have a corresponding implementation in `NODE_TYPES`. Experimental or future nodes should be designed in lab notes or PRs, not added to public metadata until execution semantics are clear and implementation is ready.

- **Runtime node input/param names should not casually drift** from metadata argument names. If a metadata function documents argument `x`, the runtime node should also have an input or param named `x`.

- **Runtime-only legacy nodes are allowed** for now but should be documented. These are unqualified names without metadata, kept for backward compatibility.

- **New public library nodes should be library-qualified.** Prefer `library.function` form for new additions.

- **A formal `registerNodeType()` API is now available** through `createNodeRegistry()` in `src/runtime/node-registry.js`. Built-in node types are registered through the default registry at startup, then exported as `NODE_TYPES` for backward compatibility.

## 6. Known gaps

The following are not yet complete but are tracked:

- **Legacy unqualified nodes still exist.** Phase 0 and Phase 1 basic operators (`add`, `multiply`, etc.) are not yet library-qualified.

- **Metadata is not yet generated from runtime definitions.** Updates to runtime signatures require manual metadata updates.

- **Runtime definitions are not yet generated from metadata.** The metadata is currently hand-written alongside runtime code.

- **Some runtime nodes may not yet have complete metadata.** Check `LIBRARY_METADATA` coverage for specific functions.

- **Node Editor port generation is not yet fully driven by the registry.** Port completions are generated but don't yet auto-sync with runtime definitions.

These gaps are documented in test allowlists (`KNOWN_RUNTIME_ONLY_NODE_TYPES`) and will be addressed in future PRs as coverage improves.

---

## See Also

- `src/loom.js` — `DEFAULT_NODE_REGISTRY` runtime registry instance and `NODE_TYPES` export
- `src/runtime/node-registry.js` — Registry implementation
- `docs/RUNTIME_NODE_REGISTRATION.md` — Registry API and usage guide
- `src/toolchain/library-metadata.js` — `LIBRARY_METADATA` descriptive metadata
- `test/node-registry.test.mjs` — Registry API tests
- `test/runtime-node-registry.test.mjs` — Shape and stability tests for `NODE_TYPES`
- `test/runtime-metadata-drift.test.mjs` — Drift detection between registry and metadata
