# Host-provided time (design note)

Related issues: [afjk/loomlet#203](https://github.com/afjk/loomlet/issues/203), [afjk/loomlet#213](https://github.com/afjk/loomlet/issues/213)

## Core principle

Loomlet does not own the clock. Loomlet does not fetch server time. The host owns time.

Loomlet graphs are evaluated with host-provided `env.time`.
`env.time` represents graph-local elapsed time in seconds.
A host may compute this value from local playback time, server-synchronized time, recorded timeline time, or any other clock source.
The graph itself does not depend on the underlying clock source.

Hosts may freely control `env.time` for use cases such as replay, seek, scrub, or export playback.
The Loomlet runtime treats every evaluation as stateless with respect to wall-clock time.

## Time environment v0

```ts
type LoomletTimeEnvironmentV0 = {
  time: number;
  deltaTime?: number;
  tick?: number;
};
```

- `time` is required and means graph-local elapsed seconds.
- `deltaTime` is optional.
- `tick` is optional.

## Clock node behavior (stable v0 semantics)

```text
clock node output = env.time
```

The `clock` node must not depend on wall-clock time or any specific server clock source.
Loomlet runtime behavior must not depend on afjk.jp server time.

## Host modes

```text
Local / standalone:
  env.time = local graph playback elapsed seconds

Scene Sync:
  env.time = graph-local elapsed seconds calculated from synchronized room/server time

Exported Scene Sync scene:
  env.time = exported scene local playback elapsed seconds

Self-hosted Scene Sync:
  env.time = graph-local elapsed seconds calculated by the self-host environment
```

## Non-goals

This design note does not define:

- Scene Sync server time sync algorithm
- NTP-style offset estimation
- Event envelope
- OnStart semantics
- Timer node semantics
- Export package format
- Unity runtime implementation

## Relationship with SPEC

After implementation and tests stabilize, this design note should be promoted or summarized in `/docs/SPEC.md`.
