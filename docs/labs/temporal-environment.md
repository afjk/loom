# Temporal Environment Lab Note

Status: experimental lab note. This is not stable Loomlet semantics yet.

This note captures an experimental synchronization model for Scene Sync and Loomlet. It should remain in Labs until the model has a small working prototype, examples, runtime tests, and documented compatibility impact.

## Summary

The idea is to treat a shared world as a temporal environment rather than as only a set of current values.

Instead of synchronizing only the current result, the room synchronizes time-stamped environment facts:

```text
current state = projection(temporal environment facts, room time)
```

For example, a cube color change does not need to synchronize the color every frame. It can synchronize the fact that a color transition started at a specific room time.

```json
{
  "kind": "env-fact",
  "seq": 101,
  "at": 12345.67,
  "type": "object.color.transition",
  "objectId": "sample-cube",
  "value": {
    "from": "#ffffff",
    "to": "#ff0000",
    "duration": 2.0,
    "easing": "linear"
  }
}
```

Each client evaluates the current color locally:

```text
progress = clamp((room.time() - fact.at) / duration, 0, 1)
color = lerp(from, to, progress)
```

This keeps Loomlet running on each device while giving every runtime the same temporal input.

## Motivation

Most multiplayer systems cannot synchronize the whole world. They choose a practical cut:

- synchronize current state and interpolate it
- synchronize player input and run deterministic simulation
- synchronize authoritative corrections
- keep local-only effects outside the shared world

Temporal Environment is a different cut. It synchronizes meaningful time-stamped changes that explain why the current state is what it is.

This is useful for:

- LBE interactions and shared room-scale experiences
- synchronized effects, sounds, doors, switches, and rituals
- replay and debugging
- AI-readable scene history
- Loomlet/FRP-style evaluation where outputs are derived from inputs and time

It is not intended to replace all traditional state sync.

## Core concepts

### Env Fact

An env fact is a time-stamped fact that belongs to the shared room timeline.

Examples:

- `object.touched`
- `object.color.transition`
- `object.position.transition`
- `ownership.assigned`
- `score.added`
- `sound.started`
- `game.phase.changed`

The fact is the shared cause. The current rendered state is derived locally.

### Room Time

Clients should evaluate temporal facts against a room clock.

```text
roomTime = localMonotonicTime + serverTimeOffset
```

The offset can be estimated periodically with a PTP/NTP-like protocol. For a first experiment, sync every 10 seconds and resync more aggressively during startup. The client should not change the OS clock.

### Projection

Projection is the deterministic operation that derives the current environment from temporal facts.

```text
materialized environment = project(facts up to roomTime)
derived render state = evaluate(materialized environment, roomTime)
```

The materialized environment can be cached. It is an optimization, not the conceptual source of truth.

### Snapshot

A snapshot is needed for late join, reconnect, and correction.

```text
snapshot at T + facts after T => current environment
```

The full fact log does not need to be replayed from the beginning every time.

## Relationship to Loomlet

Loomlet should still run on each client.

Scene Sync provides:

- room membership
- room clock
- env fact ordering
- env fact distribution
- snapshots
- optional correction facts

Loomlet provides:

- local evaluation of shared temporal inputs
- deterministic behavior graphs where practical
- local rendering and side effects through sinks
- host-specific adapters for Unity, WebXR, web, etc.

The desired direction is:

```text
Temporal Facts -> Loomlet Runtime -> Derived State / Host Effects
```

This is close to FRP: the runtime receives environment inputs and time, then derives the current output.

## Pending and confirmed states

A local client may show an interaction before it is confirmed by the shared timeline.

```text
confirmed world = projection(shared env facts, room time)
display world = confirmed world + pending local overlay
```

Example: grabbing an object.

1. Client emits a local `grab.intent` with `requestId`.
2. The object can be shown as a pending ghost or semi-transparent overlay.
3. The room sequencer later emits `ownership.assigned` or `grab.rejected` with the same `requestId`.
4. The client reconciles the pending overlay with the confirmed timeline.

This pending state can be hidden for ordinary UX, or intentionally exposed as a game/art mechanic.

## Delayed confirmation as a mechanic

Confirmation does not always have to be immediate.

For some LBE interactions, it may be interesting to intentionally delay confirmation:

- contested object pickup
- ritual switches
- charging interactions
- territory capture
- two-person cooperative actions
- telematic or remote-presence art

Example:

```text
grab.intent at 120.0
object remains pending until 120.5
ownership.assigned at 120.5
```

The pending interval becomes part of the experience instead of a network artifact to hide.

## Physics as prediction

Local physics can be treated as prediction against the confirmed timeline.

A throw can be represented as a temporal fact:

```json
{
  "kind": "env-fact",
  "seq": 300,
  "at": 120.0,
  "type": "object.thrown",
  "objectId": "ball-1",
  "actorId": "player-a",
  "value": {
    "position": [0, 1.2, 0],
    "velocity": [2.0, 3.5, -1.0],
    "angularVelocity": [0, 4.0, 0]
  }
}
```

Each client can run local physics from that fact. Because general-purpose physics engines are not reliably deterministic across devices, the local result should be considered predicted state, not confirmed state.

Important physical events or corrections can be emitted as facts:

- `object.hit`
- `object.stopped`
- `object.enteredZone`
- `object.motion.corrected`

This keeps the model compatible with traditional correction-based sync.

## Hybrid sync modes

Temporal Environment should be mixed with existing sync approaches.

Suggested cut:

### Temporal Fact

Use for meaningful shared changes:

- gameplay events
- scoring
- doors, switches, effects, sounds
- phase changes
- ownership changes
- authored transitions

### State Sync

Use for high-frequency current values:

- head and hand poses
- player presence
- grabbed object transforms
- shared cursors or lasers
- physics correction snapshots

### Local-only

Use for effects that do not need shared confirmation:

- hover highlights
- local haptics
- UI press feedback
- immediate personal feedback
- cosmetic particles

The value of the lab is not to make everything temporal. The value is to let content choose the right synchronization cut.

## Authority and sequencing

This model still needs a sequencer or host for shared facts.

The host does not have to run all Loomlet behavior centrally, but it should be able to:

- assign `seq`
- assign `at` / `effectiveAt`
- reject invalid requests
- resolve conflicts
- emit confirmed facts
- provide snapshots

For Loomlet, this means the host is closer to a timeline authority than a full world-state authority.

## First prototype scope

A good v0 experiment:

1. Two browser tabs join the same room.
2. Each tab estimates room clock offset from the server.
3. Clicking/touching the sample cube emits an `object.color.transition` env fact.
4. Both tabs evaluate the color from `room.time() - fact.at`.
5. If one tab receives the fact late, it starts rendering at the correct progress rather than replaying from the beginning.

Success criteria:

- the current color is not synchronized every frame
- the transition fact is synchronized once
- both tabs converge to the same visual result
- delayed delivery displays the correct in-progress state
- the experiment does not change stable Loomlet semantics

## Non-goals for v0

Do not attempt these in the first prototype:

- full physics lockstep
- rollback netcode
- complete deterministic Unity physics
- persistent event sourcing
- complete late-join reconstruction
- generic timeline editor
- promotion into `docs/SPEC.md`

## Promotion path

Before promoting this out of Labs:

- define formal terms in `docs/TERMINOLOGY.md`
- document stable semantics in `docs/SPEC.md`
- add at least one `.loom` or graph example
- add runtime tests for projection behavior
- document Scene Sync adapter behavior
- document editor impact
- document compatibility risks
