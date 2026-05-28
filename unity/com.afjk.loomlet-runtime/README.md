# Loomlet Runtime for Unity

This package is runtime-only. Unity consumes compiled Loomlet Graph JSON produced by the JavaScript CLI, VS Code extension, Node Editor, or another authoring tool. It does not parse `.loomlet` DSL source and does not compile DSL in Unity.

The package is split into:

- `Loomlet.Runtime`: pure C# graph model, evaluator, portable node registry, host input/event/clock context.
- `Loomlet.Unity`: a thin Unity adapter that applies evaluated outputs to `Transform` and `Renderer` color.

`Loomlet.Runtime` does not reference `UnityEngine`. Host authority remains outside user behavior graphs: Scene Clock values are read-only, and pause/seek/resume/reset/follow-server controls are host-side operations rather than Loomlet effects.

## Installation

Add the afjk scoped registry and the package dependency to `Packages/manifest.json`:

```json
{
  "scopedRegistries": [
    {
      "name": "afjk UPM Registry",
      "url": "https://upm.afjk.jp",
      "scopes": ["com.afjk"]
    }
  ],
  "dependencies": {
    "com.afjk.loomlet-runtime": "0.3.0"
  }
}
```

The package version follows the Loomlet GitHub Release tag without the leading `v`. For example, release tag `v0.3.0` publishes `com.afjk.loomlet-runtime@0.3.0`. Replace `0.3.0` with the version you want to install.

## Runtime model

Loomlet authoring and compilation happen outside Unity. Use the JavaScript CLI, VS Code extension, Node Editor, or another host tool to produce Loomlet Graph JSON, then load that Graph JSON in Unity. Unity does not parse `.loomlet` DSL source and does not compile DSL files.

Out of scope for this runtime package: Unity-side DSL parser/compiler, Node Editor integration, Scene Sync-specific bridge binding, and package resolver/remote package loading.

Scene Sync Unity packages can depend on this package for graph evaluation and Unity object adapters. This runtime package does not depend on Scene Sync.

## Fixture parity for repository development

In this repository, EditMode tests use `Tests/Fixtures/portable-node-cases.json`, copied from `test/fixtures/runtime-parity/portable-node-cases.json`. Run `npm test` from the repository root to detect fixture drift. These tests are not included in the published UPM package.

## Scene Sync

Scene Sync Unity integration is a later bridge layer. This package provides the runtime and minimal object adapter needed before binding Scene Sync objects to behavior graphs.
