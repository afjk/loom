# Node Definition Schema

Node definition metadata describes the available function nodes in Loomlet. This document explains the current intended model, terminology, and constraints.

## Purpose

Node definition metadata is intended to become the shared source for:

- Compiler validation (argument names, types, arity)
- Runtime documentation (signatures, descriptions, examples)
- Editor UI (node palettes, port labels, tooltips)
- VS Code completion and hover information
- Node Editor port generation
- Future external package metadata

However, today the metadata is still **partially descriptive rather than prescriptive**. It documents current behavior but is not yet the single source of truth for the parser, compiler, or runtime. The metadata and runtime implementation can still drift.

A future phase will promote metadata to be the primary source, with tests to ensure that implementation behavior matches the declared metadata at all boundaries.

For details on the current runtime executable node registry, see `docs/RUNTIME_NODE_REGISTRY.md`.

## Terminology

### Library

A namespace that groups related functions.

Examples: `math`, `logic`, `scene`, `text`, `list`, `json`, `console`.

Each library has:
- A name
- A description
- A list of target runtimes (`cli`, `web`, `scenesync`, `unity`)
- A collection of functions

### Function

A callable item inside a library.

Example in DSL:

```loom
value = math.add(a: 1, b: 2)
```

This declares a call to the function `add` in the library `math`.

### Node type

The fully qualified call identity: `${library}.${function}`.

Examples:
- `math.add`
- `logic.select`
- `scene.setPosition`
- `text.upper`

### Argument slot

A declared source-level argument accepted by a function. Argument slots define the shape of the function's call surface.

Example:

```js
{
  name: 'x',
  type: 'number',
  positional: false,
  description: 'X coordinate.'
}
```

Each argument slot has:
- `name`: identifier within the function
- `type`: type hint (e.g., `number`, `string`, `array`, `any`)
- `positional`: whether the source syntax may fill this slot without naming it
- `description`: human-readable explanation

### Positional argument

An argument slot where `positional: true`, meaning the source syntax may fill this slot without explicitly naming it.

**Important clarification:** `positional: true` does not mean "this is a runtime input." It means "the source syntax may fill this slot by position."

Examples that may conceptually target the same positional slot:

```loom
text.upper("hello")
```

and

```loom
text.upper(value: "hello")
```

Both call the same function. The first uses positional syntax, the second uses named syntax.

### Param

A compiled graph value that is literal/static at compile time. Params are constant expressions determined during compilation.

Example:

```loom
value = math.add(a: 1, b: 2)
```

When compiled, the values `1` and `2` become params because they are literal constants.

In the compiled graph, a node instance might have:
- `a.param = 1`
- `b.param = 2`

### Input (edge)

A compiled graph connection from another node's output. Inputs represent runtime data flow between nodes.

Example:

```loom
x = math.add(a: 1, b: 2)
y = math.multiply(a: x, b: 10)
```

When compiled:
- The argument slot `y.a` is filled by an input edge from the output `x.out`.
- The argument slot `y.b` is filled by a param with value `10`.

### Output

A value produced by a node. Most value nodes currently expose a default output named `out`.

Example:

```loom
value = math.add(a: 1, b: 2)
```

The result `value` refers to the node's `out` output.

### Effect

A side effect emitted by a node instead of, or in addition to, a value.

Effects do not produce values that other nodes can consume. Instead, they trigger runtime side effects.

Examples:
- `scene.setPosition(objectId, x, y, z)` sets an object's position.
- `console.log(value)` outputs to the console.
- `debug.trace(value)` outputs debug information.

## Source arguments vs compiled graph

This distinction is fundamental to understanding the schema.

**Argument slots** describe the call surface — the shape of the source syntax.

**Params and inputs** describe how a specific compiled graph instance is wired.

Example:

```loom
x = math.add(a: 1, b: 2)
y = math.add(a: x, b: 10)
```

Both calls use the same argument slots:

```
a: number
b: number
```

But they compile differently:

For node `x`:
```
a.param = 1
b.param = 2
```

For node `y`:
```
a.input = edge from x.out
b.param = 10
```

This is the key distinction: the metadata declares **argument slots**, but the compiled graph instance determines **how each slot is filled** (param, input, or default).

The input/param distinction and graph edge behavior is covered by the `input-param-*` stabilization fixtures.

## Current metadata shape

This section documents the current minimum metadata shape conservatively.

### Metadata structure

```js
{
  name: 'add',
  signature: 'math.add(a: 0, b: 0)',
  description: 'Adds two numbers.',
  args: [
    {
      name: 'a',
      type: 'number',
      positional: false,
      description: 'First number.'
    },
    {
      name: 'b',
      type: 'number',
      positional: false,
      description: 'Second number.'
    }
  ],
  returns: 'number',
  targets: ['cli', 'web', 'scenesync', 'unity'],
  examples: ['result = math.add(a: 5, b: 3)']
}
```

### Metadata fields

#### Library-level fields

- **name**: library identifier (e.g., `math`)
- **description**: human-readable library description
- **targets**: list of runtime targets where this library is available
- **functions**: object mapping function names to function metadata

#### Function-level fields

- **name**: function identifier (e.g., `add`)
- **signature**: human-readable DSL signature for documentation
- **description**: human-readable function description
- **args**: array of argument slot definitions
- **returns**: return type hint (e.g., `number`, `string`, `void`, `any`)
- **targets**: list of runtime targets where this function is available
- **examples**: array of example invocations
- **status** (optional): implementation status (e.g., `implemented`, `experimental`)

#### Argument slot fields

- **name**: argument identifier (e.g., `value`, `x`, `objectId`)
- **type**: type hint (e.g., `number`, `string`, `array`, `any`)
- **positional**: boolean indicating whether positional syntax is allowed
- **description**: human-readable explanation of the argument

### Known limitations

- Some generated metadata entries have empty `args` arrays.
- Metadata is not yet complete or fully accurate for all functions.
- Metadata does not yet fully drive compiler validation (some validation is hard-coded).
- This schema does not yet capture all relevant type information (e.g., union types, generics).
- Node Editor port generation is not fully stabilized and may diverge from this schema.

## Stability rules

The following rules help preserve compatibility and gradual improvement:

### Metadata fields

- New metadata fields should be additive where possible.
- Do not remove or rename existing fields unless absolutely necessary and with clear migration paths.

### Node types

- Do not remove node types without migration documentation.
- Do not rename node types without providing aliases or deprecation warnings.

### Argument slots

- Do not remove argument slots casually; renaming is also disruptive.
- Do not change argument names without migration documentation.
- Do not change `positional` semantics without adding tests.

### Metadata as documentation

- Metadata fields should not be interpreted as runtime guarantees unless explicitly documented.
- Do not use metadata field order as runtime semantics unless explicitly documented.
- Editor-only metadata should be clearly separated from semantic metadata in future versions.

## Known gaps

The following gaps prevent using metadata as the single source of truth:

- Some generated metadata entries (especially from `makeFunctionMetadata`) have empty `args` arrays because argument information is not yet available.
- Metadata for `logic`, `list`, `random`, `debug`, and `output` functions is incomplete.
- Metadata does not yet fully drive compiler validation. Some argument validation is hard-coded in the parser and compiler.
- Runtime implementation and metadata can still drift. There are no drift-detection tests yet.
- Node Editor port generation is not fully stabilized and does not yet use metadata as the authoritative source.
- Canonical DSL generation and source-preserving edits are not yet part of the schema.
- The schema does not yet capture all relevant type information (e.g., union types, optional arguments with semantic defaults).

Before treating metadata as the single source of truth:

- Complete argument metadata for all implemented functions.
- Add metadata-to-runtime drift tests to catch implementation-metadata mismatches.
- Use metadata as the source for Node Editor port generation.
- Use metadata for compiler argument validation and error messages.
- Update `docs/SPEC.md` only after behavior is stable.

## Future promotion path

### Phase 1: Document and test (current)

- Document current intended node definition schema.
- Add conservative metadata shape tests.
- Do not yet make metadata the single source of truth.
- Allow metadata and implementation to coexist as two sources.

### Phase 2: Complete metadata

- Ensure all argument metadata is complete and accurate.
- Add drift-detection tests between metadata and runtime.
- Ensure metadata covers all implemented functions.

### Phase 3: Use metadata for generation

- Generate Node Editor ports from metadata.
- Use metadata for compiler argument validation.
- Use metadata for VS Code completion and hover information.

### Phase 4: Promote to SPEC

- After behavior is stable and fully tested, promote key aspects to `docs/SPEC.md`.
- Treat metadata as the single source of truth for all new features.
