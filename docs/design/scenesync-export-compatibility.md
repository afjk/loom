# Scene Sync Export compatibility (design note)

Related issue: [afjk/loomlet#206](https://github.com/afjk/loomlet/issues/206)

## Core principle

Scene Sync Export should treat Loomlet as a **local runtime dependency**, not as a live
Scene Sync service dependency.

Exported playback does **not** require the live afjk.jp Scene Sync presence server.

## Export viewer as host

In an exported scene, the export viewer is the host. The export viewer is responsible for
providing all required environment values to the Loomlet runtime:

```ts
// Minimum environment for exported playback
env.time    // local playback elapsed seconds
env.events  // playback-time event stream (may be empty or replayed from recording)
env.scope   // scope of the graph being evaluated
```

The Loomlet runtime itself has no dependency on any network service.

### Static export playback

```text
Static export playback uses local playback elapsed time.
  env.time = local playback elapsed seconds

Loomlet does not depend on afjk.jp presence server for exported playback.
```

## env.scope in object-scoped graphs

For a graph attached to a specific object in the scene, the host sets:

```ts
env.scope = { type: 'object', id: objectId }
```

This allows object-scoped `onEvent` to default to `self` targeting:

```text
// Object-scoped graph
onEvent('pointer.click')
  -> targetMode defaults to self
  -> receives only pointer.click events targeted at objectId
```

## sendEvent in static export mode

`sendEvent` emits `event.send` effects to the host. In static export mode:

- `event.send` effects **do not** imply automatic network propagation.
- The export viewer host policy determines whether to replay, discard, or handle effects locally.
- The Loomlet graph itself is unaware of whether it is running in live or export mode.

## Example: object interaction in exported scene

```text
Export viewer sets:
  env.scope = { type: 'object', id: 'cube-01' }
  env.time  = local playback elapsed seconds
  env.events = [
    { channel: 'pointer.click', timestamp: 3.5, target: 'cube-01' }
  ]

Graph:
  onEvent('pointer.click')         // effectiveMode = self (object scope)
    -> receives the click event

  lessThan(distance, 1.0)
    -> risingEdge
    -> sendEvent('custom.enterRange')
    -> export viewer receives event.send effect and handles it locally
```

## Non-goals

This design note does not define:

- Scene Sync network protocol
- Live Scene Sync server implementation
- Export package file format
- Snapshot/restore
- New DSL syntax or Node Editor UI changes

## Relationship with SPEC

After implementation and testing stabilize, this design note should be promoted or summarized in `/docs/SPEC.md` as the definitive guide for export playback behavior.
