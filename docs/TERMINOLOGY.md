# Loomlet Terminology

This glossary defines shared Loomlet terms used across docs, runtime, and tooling.

## Core terms

- **Loomlet**: A small reactive DSL and node graph toolkit for interactive scenes.
- **DSL**: The human/AI-authored `.loom` source language.
- **Source AST**: Syntax-preserving structure derived from DSL source.
- **Graph AST**: Editor-friendly graph structure with nodes, ports, edges, and params.
- **Runtime Graph**: Minimal executable graph representation used by runtimes.
- **Target Graph**: Host-adapted graph form for specific integrations (web, Scene Sync, Unity, etc.).
- **Graph**: A connected dataflow representation of behavior using nodes and edges.
- **Node**: A graph element that computes values, keeps explicit state, reads inputs, or emits side effects.
- **Port**: A typed endpoint on a node used for dataflow connections.
- **Input**: A connectable node input slot. It can receive another node output, a local constant, or a node default.
- **Output**: A node port that emits a value or event to downstream inputs.
- **Param**: Static node configuration, generally not connected by edges.
- **Value**: Data carried through behavior ports or used as params/defaults.
- **Behavior**: A current-value signal over time, evaluated each tick on `behavior` ports. See formal semantics in `docs/SPEC.md`.
- **Event**: A discrete signal that can carry zero or more payloads within an evaluation tick on `event` ports. See formal semantics in `docs/SPEC.md`.
- **Behavior Graph**: A graph describing object or scene behavior (distinct from a `behavior` port kind). See formal semantics in `docs/SPEC.md`.
- **Port kind**: The signal category of a port (currently `behavior` or `event`), independent from payload type. See formal semantics in `docs/SPEC.md`.
- **Type**: The data type associated with a value or port.
- **Adapter**: Integration layer that maps Loomlet runtime outputs to a host/runtime API.
- **Package / Library**: A reusable set of nodes, helpers, and metadata distributed for Loomlet usage.
- **Capability**: A declared feature set available in a runtime/target context.

## Behavior port vs Behavior Graph

- A **behavior port** means a current-value signal evaluated each tick.
- A **Behavior Graph** means a graph describing object or scene behavior.
- These are related but not the same concept.
- Formal `behavior` / `event` semantics and connection rules are defined in `docs/SPEC.md`.

## Input vs Param

- **Input** is connectable and can resolve from:
  1. an upstream node output,
  2. a local constant, or
  3. a node default.
- **Param** is static configuration for the node and is generally not connected by edges.

## Round-trip and test terms

- **Canonical DSL**: Generated `.loom` text produced from a graph. It should be parseable and deterministic, but it does not necessarily preserve comments, formatting, pipe syntax, or argument style from the source text.
- **Round-trip**: A conversion between representations and back. Examples include DSL to graph to canonical DSL to graph, or graph to editor model to graph. Different round-trips can have different stability goals.
- **Golden test**: A test that compares current output to an expected fixture or snapshot. Golden tests should only be applied to outputs that are intended to be stable.
- **Semantic graph equivalence**: Comparing the meaning of a graph rather than exact raw JSON. Visual metadata, node layout, timestamps, or generated implementation details should not affect semantic equivalence unless intentionally part of the test.

## Future value categories

Loomlet terminology and metadata should stay compatible with future value categories:

- `number`
- `string`
- `boolean`
- `vec2`
- `vec3`
- `vec4`
- `record`
- `list`
