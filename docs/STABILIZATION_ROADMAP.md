# Loomlet Stabilization Roadmap

This roadmap keeps core Loomlet behavior stable while still allowing focused experiments.

## Relationship with SPEC

`docs/SPEC.md` describes Loomlet's intended semantics, design principles, and current implementation model. This roadmap describes the order for stabilizing the implementation, tests, metadata, and labs work.

When the two documents overlap, treat `docs/SPEC.md` as the source for stable semantics and this roadmap as the source for execution order. Lab ideas should remain here or in linked design notes until they are mature enough to be promoted into `docs/SPEC.md`.

## Track A: Stabilization

Purpose: make the core reliable and easier to extend.

Recommended order:

1. Clarify terminology
2. Formalize behavior/event semantics in `docs/SPEC.md`
3. Add golden tests for examples
4. Stabilize node definition schema
5. Clarify input vs param
6. Clarify runtime registration API
7. Clarify metadata as shared source for editor/docs/completion
8. Improve compatibility between JS runtime and Unity runtime where practical

## Track B: Labs

Purpose: try ideas without destabilizing main.

Candidate experiments:

- `labs/value-model`
  - vec2 / vec3 / vec4 / record / list
  - `.x`, `.xy`, `.xz` component access / swizzle
- `labs/input-slot`
  - connection value
  - local constant
  - node default
  - priority order
- `labs/node-editor-virtual-ports`
  - collapsible virtual component ports
  - implicit swizzle/get nodes
- `labs/package`
  - package manifest
  - local package loading
  - future npm/catalog support
- `labs/ui-graph`
  - UI values/events as Loomlet graph inputs/outputs
- `labs/shader-graph`
  - shader-safe subset exploration

## Promotion rule from labs to main

A lab idea can move into main only when:

- the behavior is described in `docs/SPEC.md` or a linked design doc
- runtime tests exist
- DSL or graph examples exist
- editor impact is documented
- compatibility impact is documented

## Round-trip and Golden Test Strategy

Loomlet has multiple representations: `.loom` source, Source AST, compiled graphs, runtime graphs, editor models, canonical DSL, and editor metadata. Each boundary should be stabilized separately instead of treating the entire authoring pipeline as one fully stable round-trip.

### Stabilize first

Near-term tests should focus on semantic stability for the compiler and runtime boundaries:

```text
DSL Source -> Source AST
DSL Source -> Source AST -> Graph
DSL fixture -> compile -> graph semantic snapshot
Runtime graph -> evaluation result for deterministic examples
```

These tests should verify that examples parse, compile, and evaluate as intended. They should not require preserving the author's original whitespace, comments, pipe style, argument style, or editor layout.

### Stabilize later

The canonicalization path is valuable but should be stabilized only after its intended behavior is defined:

```text
Graph -> Canonical DSL -> Source AST -> Graph
```

Generated canonical DSL may use a normalized style rather than the user's original source style. The important goals are:

- generated DSL is parseable
- generated DSL compiles back to a semantically equivalent graph
- exact text equality with the original source is not required
- comments, formatting, pipe syntax, and named-vs-positional argument style are not guaranteed to be preserved

### Do not freeze yet

Avoid strict golden snapshots for areas that are still experimental or visual-only:

- Node Editor real-time synchronization
- complete DSL <-> Node Editor bidirectional editing
- comment-preserving source patches
- original formatting preservation
- pipe syntax preservation
- named vs positional argument preservation
- import ordering preservation
- editor layout metadata round-trip
- hidden editor metadata exact format
- node coordinates and visual layout
- generated canonical DSL exact text layout, unless intentionally testing canonical formatting

### Golden test levels

Use levels so tests can be added without accidentally freezing unstable behavior.

#### Level 1: Parse fixtures

A `.loom` fixture parses without errors.

#### Level 2: Compile fixtures

A `.loom` fixture compiles without errors and the graph contains expected semantic nodes and edges.

#### Level 3: Graph semantic snapshots

A normalized graph output is compared against an expected snapshot.

Normalization should avoid unstable fields such as editor positions, generated IDs where possible, timestamps, and visual-only metadata.

#### Level 4: Canonical DSL round-trip

Compile a graph to canonical DSL, parse it again, compile it again, and compare semantic graph equivalence.

This is desirable, but it should be introduced after canonical DSL behavior is intentionally defined.

#### Level 5: Editor round-trip

Round-trip through the editor model:

```text
Node Editor model -> Graph -> Canonical DSL -> Graph -> Editor model
```

This is future work and should not be treated as stable yet.

### Recommended next steps

1. Add a small set of parse/compile fixtures.
2. Define graph normalization rules for tests.
3. Add semantic graph snapshot tests.
4. Later, stabilize `graphToCanonicalDSL`.
5. Later, add editor round-trip tests.
