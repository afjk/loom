# Concepts and design notes

This document captures the longer design context moved out of the root README.

## Why Loomlet exists

Interactive scenes (visual, audio, 3D, and multiplayer) often become hard to debug when state is spread across many systems.
Loomlet uses a dataflow model where behavior is explicit, and temporal state is isolated to dedicated state nodes.

## Core principles

1. Stateless flow by default.
2. Temporal state is explicit and localized (`state` category).
3. Side effects are isolated to sink nodes.
4. Text (`.loom`) and graph/editor representations are both first-class.

## Representation layers

Loomlet separates authoring and execution layers instead of forcing one universal format:

```text
DSL Source -> Source AST -> Graph AST -> Runtime Graph -> Target Graph
```

- **DSL Source**: human/AI authored source of truth.
- **Source AST**: syntax-preserving structure for safe edits and formatting.
- **Graph AST**: editor-friendly graph structure with ports/edges/params.
- **Runtime Graph**: minimal executable graph.
- **Target Graph**: host-adapted graph (for web/runtime/integration targets).

The web node editor keeps UI state (position/zoom/selection) separate from program semantics.

## Node categories

- `source`: emits values with no inputs.
- `input`: receives external values/events.
- `transform`: pure stateless transforms.
- `state`: explicit temporal state.
- `sink`: side effects to the host environment.

## DSL and graph relationship

`.loom` source and node-graph editing are two views over the same behavior:

- edit text for reviewability and Git-friendly diffs
- edit graph for structural operations and visual authoring
- compile to runtime graph for execution

## Future direction

- keep cross-platform evaluation semantics stable
- expand editor and AI-assisted authoring flows around AST/graph APIs
- continue Scene Sync and host integrations as adapters on top of core graph semantics

## Related references

- [Specification](SPEC.md)
- [DSL details](DSL.md)
- [Tour](TOUR.md)
- [Standard library plan](STANDARD_LIBRARY_PLAN.md)
