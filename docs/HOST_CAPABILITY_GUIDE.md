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

The #286 profiles are a **coarse, declared capability contract** (the tokens a
host is expected to provide). This guide is **finer-grained and reflects current
implementation maturity**, which is sometimes more conservative than a declared
token — a host can run a capability path that is still being wired up, or expose
a host-specific surface that the JS contract does not model. Where the two
differ, the per-host notes call it out. This guide is the authority on "how
finished is it today"; the profiles are the authority on the coarse machine
check.

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
| Color change | full | planned | planned | full | none |
| Visibility change | full | planned | planned | full | none |
| Object / scene graph scope | full | partial | planned | full | partial |
| Events (`onEvent` / `sendEvent`) | full | partial | planned | partial | full |
| Named input values | full | partial | planned | partial | full |
| Viewer / distance input | planned | planned | planned | planned | none |
| Hover / activate / gaze | planned | planned | planned | planned | none |
| Edit / Interact mode | partial | none | planned | none | none |

## Per-host capability lists

### Scene Sync Web (`web-scenesync`)

- **full**: host-provided time, transform write, audio playback, color change
  (`scene.setColor`), visibility change (`scene.setVisible`), object/scene graph
  scope, events, named inputs.
- **partial**: Edit / Interact mode — selection, edit lock, and `t=0` neutral
  behavior are designed (see [Output Conflict Policy v0](./design/output-conflict-policy-v0.md)),
  but some Scene Sync-side edit-override behavior is still deferred.
- **planned**: viewer/distance input, hover/activate/gaze.
- Note: `scene.setColor` / `scene.setVisible` are portable JS nodes with
  `scene.object.material.write@1` / `scene.object.visibility.write@1` capability
  tokens, so the #286 compatibility check models them. Scene Sync Web and Export
  Viewer grant both tokens; Unity and CLI do not.

### Unity Runtime (`unity-runtime`)

- **full**: host-provided time (`scene.clock`), portable pure subset.
- **experimental**: transform write — the runtime package and parity fixtures
  exist, but full scene-write host integration is still being built. See
  [Unity Runtime Compatibility](./UNITY_RUNTIME_COMPATIBILITY.md).
- **partial**: events and named inputs via the C# read-only host context
  (`host.input`, `host.event` in `unity/com.afjk.loomlet-runtime`); object/scene
  graph scope.
- **planned**: audio playback, color, visibility, interaction inputs.
- **none**: Edit / Interact mode (runtime-only scope).
- Note (contract divergence): the `unity-runtime` profile in `capabilities.js`
  does not grant `env.input@1` / `env.events@1`, so a JS-side compatibility check
  is conservative and reports `onEvent` / `sendEvent` as unsupported, even though
  the Unity package exposes read-only host input/event nodes. The profile also
  no longer grants audio (no Unity AudioSource control exists yet).

### Godot Runtime (experimental)

- Not implemented. Listed in `docs/SPEC.md` as a future host (`loomlet-godot`).
- Everything is **planned**; the host is tracked here so its current position
  (nothing yet) is explicit and so it can graduate to a real capability profile
  once a runtime exists.

### Export Viewer (`export-viewer`)

- **full**: host-provided local clock, transform write playback, color and
  visibility playback (same Scene Sync browser runtime), object/scene graph
  scope. Runs without the afjk.jp presence server.
- **partial**: audio playback (the browser runtime handles AudioSource ops, but
  standalone export audio asset playback is less proven); events/inputs are
  limited to what the export bakes in — live interaction is not provided.
- **planned**: interaction inputs.
- **none**: Edit / Interact mode (viewer is playback, not authoring).

### CLI (`cli`)

- **full**: host-provided time, events, named inputs, pure compute.
- **partial**: object/scene graph scope — graphs evaluate with `--scope`, but
  there is no scene host to mutate.
- **none**: transform, audio, color, visibility, interaction inputs, modes —
  scene/audio writes are meaningless without a scene host.

## Notes on unsupported items

- **Color / Visibility**: `scene.setColor` / `scene.setVisible` are portable JS
  nodes carrying `scene.object.material.write@1` /
  `scene.object.visibility.write@1` capabilities, and run today on Scene Sync Web
  and Export Viewer. Unity is the remaining candidate: it needs host-side
  material/visibility write support before its cells move off `planned`.
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
- Add Unity host-side material/visibility write support so `scene.setColor` /
  `scene.setVisible` (already portable nodes with
  `scene.object.material.write@1` / `scene.object.visibility.write@1`) can move
  off `planned` for Unity, then update this matrix.
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
