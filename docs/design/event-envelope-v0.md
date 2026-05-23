# Event envelope v0 (design note)

Related issues: [afjk/loomlet#204](https://github.com/afjk/loomlet/issues/204), [afjk/loomlet#218](https://github.com/afjk/loomlet/issues/218)

## Event envelope shape

The committed event shape for Loomlet v0:

```ts
type LoomletEventV0 = {
  channel: string;
  timestamp: number;
  id?: string;
  source?: string;
  target?: string;
  payload?: unknown;
  order?: number;
};
```

- `channel` identifies the event stream. Custom channels are allowed without registration.
- `timestamp` uses the same graph-local time basis as `env.time`.
- `id`, `source`, `target`, `payload`, and `order` are all optional.
- `order` is optional; the host should pass `env.events` in committed processing order.

`env.events` is host-provided. The Loomlet runtime does not generate or validate event ordering.

## OnEvent

`onEvent` filters events from `env.events` by exact `channel` match and by target mode.

### Target mode

The `targetMode` parameter controls how the event's `target` field is matched against the
current graph scope:

```text
targetMode = scopeDefault | any | self | explicit
```

Semantics:

```text
scopeDefault:
  scene/unknown scope -> any
  object scope        -> self

any:
  ignore event.target; all channel-matching events pass

self:
  match event.target === env.scope.id
  (untargeted events do not match)

explicit:
  match event.target === params.target
  (untargeted events do not match)
  (requires params.target to be set)
```

Additional rules:

- Untargeted events (no `target` field) match `any` but do **not** match `self` or `explicit`.
- Object-scoped graph `onEvent(channel)` defaults to `self`.
- Scene/unknown-scoped graph `onEvent(channel)` defaults to `any`.

### Examples

```text
// Object-scoped graph, no explicit targetMode
onEvent('pointer.click')
  -> effectiveMode = self
  -> receives only events targeted at env.scope.id

// Scene-scoped graph, no explicit targetMode
onEvent('scene.start')
  -> effectiveMode = any
  -> receives all scene.start events regardless of target

// Explicit targeting
onEvent('custom.enterRange', targetMode='explicit', target='zone-a')
  -> receives only events with target === 'zone-a'
```

## SendEvent

`sendEvent` emits `event.send` effects to the host. It does not mutate `env.events`.

### Effect shape

```ts
type SendEventEffectV0 = {
  kind: 'event.send';
  channel: string;
  payload?: unknown;
  target?: string;
  timestampHint?: number;
};
```

### Host policy boundary

`sendEvent` is intentionally minimal:

- `sendEvent` does **not** assign `id`, `source`, `order`, or a final timestamp.
- `sendEvent` does **not** decide whether the event is local, shared, recorded, or ignored.
- `sendEvent` does **not** implicitly copy `trigger.payload`; payload must be wired explicitly.
- Whether an emitted event is propagated over the network, stored, or discarded is **host policy**.

In static export mode, `event.send` should not imply automatic network propagation.

### Example

```text
lessThan(distance, 1.0)
  -> risingEdge
  -> sendEvent('custom.enterRange')
```

The `risingEdge` node emits an event only when `distance` crosses below `1.0`.
`sendEvent` emits one `event.send` effect per trigger and does nothing else.
The host decides what to do with that effect.

## Behavior-to-Event conversion

`risingEdge` and `fallingEdge` convert boolean behavior signals into event streams.

```text
risingEdge:  false -> true  transition emits { timestamp: env.time }
fallingEdge: true  -> false transition emits { timestamp: env.time }
```

Rules:

- Initial evaluation never emits; the node stores the first value as baseline.
- Edge trigger payload is empty/minimal: `{ timestamp }` only.
- `previous` and `current` are **not** included in the emitted event.
- State (`previous`, `hasPrevious`) is stored via the graph instance state store.

### Stateful determinism

```text
same graph
+ same initial graph instance state
+ same ordered environment/input sequence
+ same evaluation rules
= same output sequence
```

Determinism is guaranteed per graph instance. Two separate `Loom` instances with the same
graph are independent; each starts from a clean state.

`resetState()` clears all instance state, allowing deterministic replay from a known baseline.

## Non-goals

This design note does not define:

- Network propagation protocol for `event.send` effects
- Event deduplication or ordering guarantees across multiple hosts
- Replay file format
- Snapshot/restore
- Previous / Delay
- Hysteresis
- New DSL syntax

## Relationship with SPEC

After implementation and tests stabilize, this design note should be promoted or summarized in `/docs/SPEC.md`.
