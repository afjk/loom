# Host Capability Guide v0

Status: Experimental (v0). First slice of the Host Capability Guide requested in
[issue #290](https://github.com/afjk/loomlet/issues/290).

## Purpose

Show, for each Loomlet execution environment, **what you can actually do today**.
This is not a strict capability type system or an automatic detector — it is a
hand-maintained snapshot of the current implementation status so you (and other
authors) can see at a glance:

- which features a host already runs,
- which are partial or experimental,
- which are still planned or unsupported,
- and therefore what is worth trying or implementing next.

For the machine-checkable, per-graph version of "will this run here", see the
capability metadata and `checkHostCompatibility()` from
[Graph Capability Metadata v0](./design/graph-capability-metadata-v0.md) (#286).
That contract currently covers the time / transform / audio / event / input
rows below; this guide is broader and includes features that have no executable
nodes yet.

## Hosts

- **Scene Sync Web** — the primary live host (`web-scenesync` capability profile).
- **Unity Runtime** — runtime-only package `unity/com.afjk.loomlet-runtime`
  (`unity-runtime` profile). Consumes compiled Graph JSON; read-only host
  context (`host.input`, `host.event`, `scene.clock`).
- **Godot Runtime** — **experimental / aspirational.** Named in `docs/SPEC.md` as
  a target host, but not yet implemented. It has no capability profile in
  `src/runtime/capabilities.js` precisely because nothing runs there yet.
- **Export Viewer** — self-contained Scene Sync export playback with a
  host-provided local clock (`export-viewer` profile). Playback, not authoring.
- **CLI** — `loomlet` command-line evaluation (`cli` profile). No scene host;
  scene mutation is meaningless here.

## Status legend

- **full** — usable today.
- **partial** — some of it works; important pieces are missing.
- **experimental** — present but allowed to change; do not rely on it.
- **planned** — intended, not implemented yet.
- **none** — not applicable / not supported on this host.

## Feature × Host matrix

| Feature | Scene Sync Web | Unity Runtime | Godot Runtime | Export Viewer | CLI |
|---|:--:|:--:|:--:|:--:|:--:|
| Host-provided time | full | full | planned | full | full |
| Transform write (position/rotation/scale) | full | experimental | planned | full | none |
| Audio playback (AudioSource) | full | planned | planned | partial | none |
| Color change | planned | planned | planned | planned | none |
| Visibility change | planned | planned | planned | planned | none |
| Object / scene graph scope | full | partial | planned | full | partial |
| Events (`onEvent` / `sendEvent`) | full | partial | planned | partial | full |
| Named input values | full | partial | planned | partial | full |
| Viewer / distance input | planned | planned | planned | planned | none |
| Hover / activate / gaze | planned | planned | planned | planned | none |
| Edit / Interact mode | partial | none | planned | none | none |

## Per-host capability lists

### Scene Sync Web (`web-scenesync`)

- **full**: host-provided time, transform write, audio playback, object/scene
  graph scope, events, named inputs.
- **partial**: Edit / Interact mode — selection, edit lock, and `t=0` neutral
  behavior are designed (see [Output Conflict Policy v0](./design/output-conflict-policy-v0.md)),
  but some Scene Sync-side edit-override behavior is still deferred.
- **planned**: color, visibility, viewer/distance input, hover/activate/gaze.

### Unity Runtime (`unity-runtime`)

- **full**: host-provided time (`scene.clock`), portable pure subset.
- **experimental**: transform write — the runtime package and parity fixtures
  exist, but full scene-write host integration is still being built. See
  [Unity Runtime Compatibility](./UNITY_RUNTIME_COMPATIBILITY.md).
- **partial**: events and named inputs via read-only host context
  (`host.input`, `host.event`); object/scene graph scope.
- **planned**: audio playback, color, visibility, interaction inputs.
- **none**: Edit / Interact mode (runtime-only scope).

### Godot Runtime (experimental)

- Not implemented. Listed in `docs/SPEC.md` as a future host (`loomlet-godot`).
- Everything is **planned**; the host is tracked here so its current position
  (nothing yet) is explicit and so it can graduate to a real capability profile
  once a runtime exists.

### Export Viewer (`export-viewer`)

- **full**: host-provided local clock, transform write playback, object/scene
  graph scope. Runs without the afjk.jp presence server.
- **partial**: audio playback (depends on the exported host's audio surface);
  events/inputs are limited to what the export bakes in — live interaction is
  not provided.
- **planned**: color, visibility, interaction inputs.
- **none**: Edit / Interact mode (viewer is playback, not authoring).

### CLI (`cli`)

- **full**: host-provided time, events, named inputs, pure compute.
- **partial**: object/scene graph scope — graphs evaluate with `--scope`, but
  there is no scene host to mutate.
- **none**: transform, audio, color, visibility, interaction inputs, modes —
  scene/audio writes are meaningless without a scene host.

## Notes on unsupported items

- **Color / Visibility**: no `scene.setColor` / `scene.setVisible` nodes exist
  yet. Once added, hosts with a material/renderer adapter (Scene Sync Web,
  Unity, Export) become candidates for `full`. Tracked under the scene node gap
  work (see `docs/NODE_GAPS.md`).
- **Viewer / distance input** and **Hover / activate / gaze**: these are host
  interaction facts. There are DOM `pointerClick` / `pointerPosition` nodes for
  the simple web editor, but no portable viewer/interaction input vocabulary in
  the Loomlet runtime yet.
- **Edit / Interact mode**: only Scene Sync Web has a partial story today, via
  the documented output-conflict / edit-lock policy. Other hosts have no mode
  concept yet.
- **Unity transform** is `experimental` rather than `full`: the runtime exists
  and parity fixtures pass, but it consumes compiled graphs and the host-side
  scene write path is still maturing.

## Candidate next issues / tasks

- Add `godot-runtime` as a real (initially minimal) host once a runtime exists,
  and give it a capability profile in `src/runtime/capabilities.js`.
- Add `scene.setColor` / `scene.setVisible` nodes with `scene.object.material.write@1`
  / `scene.object.visibility.write@1` capabilities, then update this matrix.
- Define a portable viewer/distance and hover/activate/gaze input vocabulary,
  then map it onto host capabilities.
- Promote Unity transform write from `experimental` to `full` after host-side
  scene write integration lands.
- Feed this matrix into the later Sample Catalog / Try Guide so each sample can
  say which hosts can run it.

## Maintenance

This guide is hand-maintained. When you add or change a host adapter or a
capability-bearing node:

1. Update the matrix and the affected per-host list here.
2. If the feature is one of the machine-checked capabilities, also update the
   host profile in `src/runtime/capabilities.js` and its tests.
3. Keep the status honest: prefer `partial` / `experimental` over `full` until
   the host-side path is actually complete.
