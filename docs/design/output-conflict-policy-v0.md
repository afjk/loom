# Output Conflict / Single-Writer Policy v0 (design note)

Related issues: [afjk/loomlet#210](https://github.com/afjk/loomlet/issues/210), [afjk/loomlet#232](https://github.com/afjk/loomlet/issues/232)

## Purpose

This document closes the design gap for output conflict and single-writer warning policy at v0.

The goal is to document clear semantics and preferred warnings. v0 prefers warnings and clear
semantics over blocking experimentation. A full conflict resolver is out of scope here.

## Vocabulary

### Output targets

An output target is a scene property path that a writer can set on each evaluation:

```text
object:<id>.position
object:<id>.rotation
object:<id>.scale
object:<id>.material.color
scene.skybox
```

### Writers

A writer is any source that can produce a value for an output target during scene evaluation:

```text
object-level behavior graph    — scoped to one object; evaluated per-client each frame
scene-level behavior graph     — scoped to the whole scene; evaluated per-client each frame
one-shot scene command         — a single value written at a point in time (e.g. AI command)
AI command                     — one-shot or repeated override from an AI authoring source
manual edit                    — a direct transform/state edit made by a user in the editor
```

## Single-writer policy

Each output target should have at most one active writer at a time. When more than one writer
targets the same output path, this is an output conflict.

v0 policy: **warn, do not block**.

- Conflicts should emit a warning (see [Warning shape](#warning-shape)) rather than refusing to
  attach or halting evaluation.
- Deterministic precedence rules (see [Conflict categories](#conflict-categories)) apply when a
  tie-break is needed, but the system does not prevent authors from creating conflicts while
  experimenting.

## Manual edit policy

Manual edit vs. manual edit conflicts are already handled by Scene Sync's existing edit lock
mechanism. **Do not redesign that mechanism here.**

Terminology:

```text
selection       = local UI state — which object the local client has focused in the editor
edit lock       = shared collaborative editing state — which client holds the right to commit edits
manual edit     = the committed transform/state update produced when a client releases the edit lock
```

- `selection` is local and invisible to other clients.
- `edit lock` is shared; it prevents two clients from committing conflicting manual edits to the
  same object at the same time.
- `manual edit result` is the committed base transform or state update that all clients receive
  after the editing client releases the lock.

## Selection / edit override policy

When a client selects or edits an object, only that client applies local edit override behavior.
Other clients continue evaluating behavior graphs normally.

Local edit override behavior on the editing client may include:

```text
- selected object behavior time is treated as t=0 / neutral
- behavior outputs for editable properties are suppressed locally
- manual edit is the active writer on that client for the duration of the edit
```

This matches the existing animation behavior where selected objects are effectively evaluated at
time 0, preventing the behavior graph from fighting the user's drag.

## Base transform policy

On edit commit, the manual edit updates the object's base transform/state. Behavior graphs then
resume relative to the updated base state.

```text
before edit: base_transform + behavior_offset = rendered_transform
during edit: manual_edit override (behavior suppressed locally)
after commit: new_base_transform = committed_edit_result
             behavior resumes: new_base_transform + behavior_offset = rendered_transform
```

## Behavior authoring convention

Behavior graphs that are intended to be edited at runtime should prefer neutral output at t=0:

```text
position offset  -> zero   (0, 0, 0)
rotation offset  -> identity quaternion / zero Euler
scale offset     -> identity (1, 1, 1)
```

This means that when edit override treats the behavior as t=0, the object sits at its base
transform with no unintended displacement.

**Important:** t=0 neutral output is an authoring convention plus host/edit-mode policy. It is
not a runtime guarantee for arbitrary graphs. Graphs that produce non-neutral output at t=0
will appear to jump when the edit override kicks in.

## Conflict categories

### manual edit vs manual edit

Handled by the existing Scene Sync edit lock mechanism (see [Manual edit policy](#manual-edit-policy)).
No additional conflict resolution is needed here.

### manual edit vs behavior graph

Handled by local edit override while the client is selecting or editing (see
[Selection / edit override policy](#selection--edit-override-policy)).

- While a client holds the edit lock, the behavior graph's output for that object's editable
  properties is suppressed locally on that client.
- Other clients continue evaluating the behavior graph normally.
- On edit commit, the base transform is updated and behavior resumes from the new base.

### object-level behavior vs scene-level behavior

**v0 policy:** emit a warning. If a deterministic tie-break is needed, prefer:

```text
object-level behavior graph > scene-level behavior graph
```

Rationale: object-level graphs are more specific. Scene-level graphs are typically intended for
effects that are not already owned by an object-level graph.

### behavior graph vs one-shot scene command / AI command

**v0 policy:** emit a warning.

Note that a behavior graph evaluates every frame, while a one-shot command writes once. Unless
the behavior graph is paused or cleared, it will overwrite the command result on the next
evaluation tick.

Authors should be aware of this: if a behavior graph owns an output target, one-shot commands
to that target will be overwritten until the graph is paused or cleared.

### graph vs graph (any two behavior graphs targeting the same output)

**v0 policy:** emit a warning. Single-writer convention applies.

If two graphs target the same output and neither is an object-level vs scene-level pair, the
host or authoring tool should warn and the author should restructure to remove the conflict.

## Detection timing

Conflict detection can happen at three points:

```text
compile-time   — within one graph, if the same output target is driven by two separate sink
                 nodes. The compiler can detect this statically.

attach-time    — when a newly attached graph's declared output targets overlap with an existing
                 graph's output targets. Can be checked against graph metadata at attach time.

runtime        — when the same output target receives writes from two different active writers
                 during the same evaluation tick. Requires runtime tracking of writes per tick.
```

v0 implementations may focus on compile-time or attach-time detection as the lowest-cost
starting point. Runtime detection provides the most complete coverage but requires a per-tick
write tracker.

## Warning shape

A conflict warning should have at minimum:

```ts
type OutputConflictWarning = {
  code: string;       // machine-readable warning code
  target: string;     // the output target path that is in conflict
  writers: string[];  // identifiers of the conflicting writers
  severity: 'info' | 'warning' | 'error';
  message: string;    // human-readable description
};
```

### Suggested codes

```text
OUTPUT_CONFLICT
  — Two or more writers are targeting the same output path.
  — severity: warning (v0 does not block)

BEHAVIOR_PAUSED_FOR_EDIT
  — A behavior graph's outputs are locally suppressed because the user is editing the target.
  — severity: info (expected local edit override behavior, not an error condition)
```

### Example warning

```json
{
  "code": "OUTPUT_CONFLICT",
  "target": "object:cube1.position",
  "writers": ["scene-graph:main", "object-graph:cube1"],
  "severity": "warning",
  "message": "object:cube1.position is targeted by both scene-graph:main and object-graph:cube1. object-level graph takes precedence."
}
```

## Non-goals

This design note does not define or implement:

```text
- Full conflict resolver
- Permission system
- Edit lock redesign
- Shared selection state
- Hard blocking on behavior graph attach
- Scene Sync server changes
```

## Relationship with SPEC and other docs

After implementation and runtime tests stabilize, relevant policies from this note should be
promoted or summarized in `/docs/SPEC.md`.

Scene Sync's existing integration responsibility boundary is documented in
[`docs/SCENESYNC.md`](../SCENESYNC.md) (section 6: 統合責務と source of truth).
