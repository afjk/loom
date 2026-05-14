# Runtime Node Registry

## Purpose

`NODE_TYPES` is the runtime/compiler registry that defines which node types can be executed by the Loomlet engine. It is the authoritative source for:

- Node type name (identity)
- Category (source, transform, sink)
- Input port list (behavior-connected inputs)
- Parameter list (compile-time or static inputs)
- Output port list (behavior-connected outputs)
- Runtime evaluation behavior (`evaluate` function)
- Optional lifecycle hooks (`onStart` / `onStop`)

## Current Relationship to Metadata

Today, metadata is **not yet the single source of truth**. Two sources exist:

```
NODE_TYPES → what can actually run (runtime/compiler)
LIBRARY_METADATA → how nodes are documented, completed, and shown in editors
```

These sources should remain loosely synchronized:

- Metadata functions should map to executable runtime nodes unless explicitly marked otherwise
- Runtime node input/param names should not casually drift from metadata arg names
- Runtime-only legacy nodes are allowed for now but should be documented

A future phase will make metadata the primary source of truth, with formal registration APIs.

## Node Type Naming

Loomlet currently uses two naming conventions:

### Legacy / Unqualified Names

Single-word node type names without a library prefix:

- `add`
- `multiply`
- `sine`
- `clock`
- `constant`

These are retained for backward compatibility. The runtime evaluates them, but new public library nodes should not use this style.

### Library-Qualified Names

Two-part names with a library prefix: `${library}.${function}`

Examples:

- `math.add` (binary addition)
- `logic.select` (conditional branching)
- `scene.setPosition` (3D scene interaction)
- `text.upper` (string transformation)
- `json.parse` (data conversion)

New public nodes should use library-qualified names.

## Expected Runtime Node Shape

The minimum shape of a runtime node definition is:

```js
{
  category: 'transform',              // 'source', 'transform', 'sink'
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

### Field Meanings

- `category`: Classification of the node (`source`, `transform`, `sink`)
  - `source`: produces outputs without consuming inputs
  - `transform`: consumes inputs and produces outputs
  - `sink`: consumes inputs and produces no outputs (side effects only)

- `inputs`: Array of input port definitions
  - `name`: port identifier
  - `type`: expected value type
  - `default`: optional default value
  - `kind`: typically `'behavior'` for reactive ports

- `params`: Array of parameter definitions
  - Similar structure to inputs but represents static/compile-time values

- `outputs`: Array of output port definitions
  - `name`: port identifier
  - `type`: output value type
  - `kind`: typically `'behavior'` for reactive ports

- `evaluate`: Function that performs runtime computation or effects
  - Signature: `(inputs, params, ctx) => outputs`
  - `inputs`: object with input values
  - `params`: object with parameter values
  - `ctx`: runtime context (time, engine, nodeId, etc.)
  - Returns: object with output values (keys match `outputs[].name`)

### Optional Fields

- `commutative`: boolean indicating if input order doesn't matter (e.g., addition)
- `onStart`: optional lifecycle hook called when the node's graph starts execution
- `onStop`: optional lifecycle hook called when the node's graph stops execution

### Missing Inputs/Outputs/Params

- If a node definition omits `inputs`, treat as empty array
- If a node definition omits `outputs`, treat as empty array
- If a node definition omits `params`, treat as empty array
- If a node definition omits `evaluate`, it is an error in this registry

## Drift Policy

The following rules prevent unintentional divergence between metadata and runtime:

1. **Metadata functions should map to runtime nodes**
   - Every function advertised in `LIBRARY_METADATA` should have a corresponding executable `NODE_TYPES` entry
   - Use narrow allowlists for known metadata-only nodes (not yet implemented)

2. **Runtime slot names should match metadata arg names**
   - Input and param names in the runtime should match metadata argument names
   - Use narrow allowlists for known compatibility-only params (internal details)

3. **Non-void functions should have runtime outputs**
   - If metadata declares `returns !== 'void'`, the runtime node should produce at least one output
   - If metadata declares `returns === 'void'`, the runtime node may have zero outputs

4. **Runtime-only legacy nodes are allowed**
   - Unqualified names like `add`, `multiply`, `clock`, `constant` are legacy and need not have metadata yet
   - New public nodes should be library-qualified and have corresponding metadata entries

5. **New public library nodes should be library-qualified**
   - Avoid adding unqualified names to the registry
   - Use `${library}.${function}` format for new nodes

## Known Gaps

As of this documentation:

- Legacy unqualified nodes still exist without full metadata coverage
- Metadata is not yet generated from runtime definitions
- Runtime definitions are not yet generated from metadata
- Some runtime nodes may not yet have complete metadata entries
- Node Editor port generation is not yet fully driven by the registry

A future phase will:

- Introduce a formal `registerNodeType()` API
- Make metadata the primary source of truth
- Generate runtime definitions from metadata or vice versa
- Enforce strict alignment between the two sources
