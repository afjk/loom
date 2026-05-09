# Scoped Reactive Host Notes

This is a short design memo for ideas that sit above the Loomlet core.

Loomlet itself can remain a small dataflow / FRP graph language. Hosts such as Scene Sync, a future Grid host, or a future Agent/Boids host may manage many scopes and evaluate Loomlet graphs inside those scopes.

This document is not a core language specification. It is a planning note for future host contracts.

## Scope

A scope is a host-defined unit where a Loomlet graph is evaluated.

Examples:

- `scene`: a whole Scene Sync scene
- `object`: a Scene Sync object
- `cell`: a grid cell
- `agent`: a boid / particle / entity
- another host-defined unit

A host owns scope lifecycle, scope context, input resources, output application, and batching.

## Core execution rule

Graphs do not communicate by directly reading each other’s live outputs.

Instead, each turn follows a snapshot / command / commit model:

```text
turn start:
  Host freezes an environment snapshot

evaluate:
  each scope graph reads snapshot + scope context + host resources
  each graph emits output commands

commit:
  Host collects commands
  Host resolves conflicts deterministically
  Host commits the next environment
```

The committed environment becomes readable by later turns.

In other words, reading another object, cell, or agent means reading the host-provided environment snapshot, not directly reading another graph.

## Double-buffered environment

The shared environment should be treated as double-buffered:

- reads come from the turn-start snapshot
- writes are emitted as commands or next-buffer writes
- writes do not become readable during the same turn
- all writes are committed after evaluation

This keeps evaluation order-independent and avoids immediate cyclic dependencies.

This model also matches the Grid Rule Host idea: a cell reads previous grid values and emits its next value. Scene Sync object rules can use the same discipline: an object reads the previous scene snapshot and emits its next transform/state.

## Self-write by default

Scope-local graphs should be self-write only by default.

Examples:

```text
object scope:
  writes its own object state

cell scope:
  writes its own cell state

agent scope:
  writes its own agent state
```

This avoids most write conflicts and makes parallel execution straightforward.

If one scope needs to affect another scope, prefer an intent / event / request written into the environment, then handle it in a later turn through the target scope, a scene scope, or a host-level resolver.

Scene-level or global scopes may have broader write authority, but that should be an explicit host capability.

## Scene Sync mapping

Scene Sync can be viewed as a scoped host:

- scene-level Loomlet graph: scene scope behavior
- object-level Loomlet graph: object scope behavior
- scene snapshot: shared environment
- scene-batch / scene-delta: committed output commands

A future shared-rule mode could apply one compiled graph to many selected Scene Sync objects each turn.

This is different from attaching a unique graph to each object, but both use the same scope model.

## Grid and Agent mapping

The same pattern generalizes:

```text
Grid Rule Host:
  scope = cell
  environment = grid snapshot
  output = next cell value/color

Agent / Boids Host:
  scope = agent
  environment = agent collection snapshot
  output = next position/velocity/state

Scene Sync Object Rule Host:
  scope = object
  environment = scene snapshot
  output = next transform/component commands
```

The host provides context for the current scope and may provide aggregate inputs such as neighbor counts, nearby object summaries, or spatial query results.

## Parallel-friendly implementation notes

The model should allow a host to start single-threaded and later scale without changing semantics.

Useful implementation directions:

- compile each graph shape once
- instantiate per-scope context/state separately
- store scope-local state in Structure-of-Arrays buffers where useful
- batch scopes with the same graph shape as an archetype
- read from immutable snapshots
- write to command buffers or next buffers
- resolve commands using stable metadata, not worker completion order
- provide time/random/query inputs from the host so they are deterministic per turn

Possible scale path:

```text
1. single-thread reference implementation
2. compile-once + per-scope state buffers
3. archetype-style batch evaluation
4. Web Worker / Worker pool evaluation
5. optional GPU/WebGPU backend for grid-like workloads
```

The important part is not parallelism first. The important part is deterministic semantics that remain valid when parallelism is introduced later.

## Conflict resolution

Hosts should define deterministic conflict resolution before allowing multiple commands to write the same target field in the same turn.

Recommended default:

- scope-local graphs are self-write only
- cross-scope effects are intents/events/requests by default
- global writes are limited to explicitly authorized scopes
- if conflicts are still possible, resolve by stable priority and stable source order

Never use worker completion order as semantic order.

## AI generation implications

AI-generated DSL should know the target scope.

Useful target comments until formal metadata exists:

```text
# Target: scenesync-object-scope
# Scope: object
```

```text
# Target: future-grid-rule-host
# Scope: cell
# Sketch only: not currently runnable
```

```text
# Target: future-agent-rule-host
# Scope: agent
# Sketch only: not currently runnable
```

Without a target/scope, AI may mix portable Loomlet DSL, VS Code Preview helpers, Scene Sync object logic, and future grid/agent APIs.

## Summary

A useful mental model is:

```text
Loomlet Core:
  evaluates a dataflow graph

Scoped Host:
  manages many scopes
  provides environment snapshots and scope context
  collects output commands
  commits the next environment
```

This keeps Loomlet small while leaving room for Scene Sync object behaviors, grid/cellular automata, boids, and other emergent systems.
