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
- **Behavior**: A current-value signal over time, evaluated each tick.
- **Event**: A discrete occurrence at a point in time (not a continuous current-value signal).
- **Behavior Graph**: A graph describing object or scene behavior.
- **Port kind**: The signal category of a port, such as `behavior` or `event`.
- **Type**: The data type associated with a value or port.
- **Adapter**: Integration layer that maps Loomlet runtime outputs to a host/runtime API.
- **Package / Library**: A reusable set of nodes, helpers, and metadata distributed for Loomlet usage.
- **Capability**: A declared feature set available in a runtime/target context.

## Behavior port vs Behavior Graph

- A **behavior port** means a current-value signal evaluated each tick.
- A **Behavior Graph** means a graph describing object or scene behavior.
- These are related but not the same concept.

## Input vs Param

- **Input** is connectable and can resolve from:
  1. an upstream node output,
  2. a local constant, or
  3. a node default.
- **Param** is static configuration for the node and is generally not connected by edges.

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
