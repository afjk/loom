# Unity Runtime Implementation Plan

This plan tracks the runtime-only Unity implementation foundation delivered in Loomlet v0.3.0 and its follow-up work.

## Scope

Unity consumes compiled Graph JSON. It does not parse `.loomlet` DSL source, compile DSL, resolve packages, or provide authoring UI. The JavaScript runtime remains the reference implementation for Graph JSON semantics and runtime parity fixtures.

Dependency direction: Scene Sync Unity packages may depend on Loomlet Runtime, and Loomlet Runtime must not depend on Scene Sync.

## Package layout

- `unity/com.afjk.loomlet-runtime/Runtime/Core`
  - Pure C# runtime.
  - No `UnityEngine` dependency.
  - Loads Graph JSON into C# models.
  - Evaluates portable nodes and read-only host context.
- `unity/com.afjk.loomlet-runtime/Runtime/Unity`
  - Thin Unity adapter.
  - Applies output values to `Transform` and `Renderer` color.
  - Uses `MaterialPropertyBlock`; it does not mutate `sharedMaterial`.
- `unity/com.afjk.loomlet-runtime/Tests`
  - EditMode parity and adapter tests.
  - Fixture subset copied from `test/fixtures/runtime-parity/portable-node-cases.json`.

## Implemented in v0.3.0 work

- Initial package skeleton.
- Graph JSON parser/model.
- Basic evaluator and `nodeId.out` value lookup.
- Portable math, logic, list basics, text, and json nodes covered by current parity fixtures.
- Read-only host input, host event, and Scene Clock context nodes:
  - `host.input`
  - `host.event`
  - `scene.clock`
- Minimal Unity binding for:
  - position
  - local position
  - rotation euler
  - local rotation euler
  - scale
  - renderer color
- Fixture drift check in `npm test`.

## Security and authority boundary

User Behavior Graphs can read host-provided values and emit object-level behavior outputs. They cannot mutate host authority.

Host-controlled operations remain outside Loomlet effects:

- pause
- seek
- resume
- reset
- follow server
- input routing
- room authority
- Scene Sync transport control

The current runtime exposes Scene Clock as read-only evaluation context. There is no API that lets a graph change clock state.

## Host Graph design note

Privileged Host Graphs are reserved for future trusted host-side policies. They are not user-attached behavior graphs and are not implemented in v0.3.0.

Potential future uses:

- gaze dwell detection
- hover enter/leave detection
- activation source mapping
- input routing policy
- selection highlight policy
- interaction cooldowns
- proximity threshold handling

If implemented later, Host Graphs must run in a separate trusted context with an explicit authority boundary. Untrusted behavior graphs must not gain clock, input-routing, room, or Scene Sync transport authority.

## Not in v0.3.0

- Unity-side DSL parser/compiler.
- Node Editor or authoring UI inside Unity.
- Scene Sync Unity bridge integration.
- Package resolver or remote package loading.
- Complex shader binding.
- Animation system integration.
- Physics or FixedUpdate-specific scheduling.
- Host Graph execution.
