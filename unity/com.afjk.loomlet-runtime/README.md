# Loomlet Runtime for Unity

This package is runtime-only. Unity consumes compiled Loomlet Graph JSON produced by the JavaScript CLI, VS Code extension, Node Editor, or another authoring tool. It does not parse `.loomlet` DSL source and does not compile DSL in Unity.

The package is split into:

- `Loomlet.Runtime`: pure C# graph model, evaluator, portable node registry, host input/event/clock context.
- `Loomlet.Unity`: a thin Unity adapter that applies evaluated outputs to `Transform` and `Renderer` color.

`Loomlet.Runtime` does not reference `UnityEngine`. Host authority remains outside user behavior graphs: Scene Clock values are read-only, and pause/seek/resume/reset/follow-server controls are host-side operations rather than Loomlet effects.

## Fixture parity

EditMode tests use `Tests/Fixtures/portable-node-cases.json`, copied from `test/fixtures/runtime-parity/portable-node-cases.json`. Run `npm test` from the repository root to detect fixture drift.

## Scene Sync

Scene Sync Unity integration is a later bridge layer. This package provides the runtime and minimal object adapter needed before binding Scene Sync objects to behavior graphs.
