# Loomlet Examples

This directory contains small examples for the Loomlet DSL, CLI, and integrations.

> Note: these examples are part of the GitHub repository. They are not included in the npm package tarball.

## CLI / DSL examples

- [cli-basic.loom](cli-basic.loom) - minimal compile example
- [cli-console.loom](cli-console.loom)
- [cli-json.loom](cli-json.loom) - JSON parse/stringify example
- [cli-text.loom](cli-text.loom) - text processing example

Run from the repository root:

```bash
node bin/loomlet.mjs compile examples/cli-basic.loom
```

For `loomlet run`, graphs that use `clock()` must receive host time explicitly:

```bash
node bin/loomlet.mjs run examples/cli-basic.loom --get x.out --time 0.25
```

Or with the published package:

```bash
npx -p @afjk/loomlet loomlet compile examples/cli-basic.loom
```

## Scene Sync examples

- [lissajous.loom](lissajous.loom) - Scene Sync behavior graph example
- [scene-effects.loom](scene-effects.loom) - Scene Sync effect example
- [scene-offset-position.loom](scene-offset-position.loom) - object offset behavior example
- [scene-offset-circle.loom](scene-offset-circle.loom) - circular offset behavior example

## Tour examples

A curated, copy-paste-runnable tour. See [docs/TOUR.md](../docs/TOUR.md) for the
status and teaching focus of each sample.

### Language (`tour/language`)

- [tour/language/01-hello.loom](tour/language/01-hello.loom)
- [tour/language/02-values.loom](tour/language/02-values.loom)
- [tour/language/03-calls-and-named-args.loom](tour/language/03-calls-and-named-args.loom)
- [tour/language/04-pipeline.loom](tour/language/04-pipeline.loom)
- [tour/language/05-conditions.loom](tour/language/05-conditions.loom)
- [tour/language/06-functions.loom](tour/language/06-functions.loom) - reusable `fn` definitions

### Signals (`tour/signals`)

- [tour/signals/01-clock.loom](tour/signals/01-clock.loom)
- [tour/signals/02-sine-wave.loom](tour/signals/02-sine-wave.loom)
- [tour/signals/03-integrate.loom](tour/signals/03-integrate.loom)

### Events (`tour/events`)

- [tour/events/01-pointer-click.loom](tour/events/01-pointer-click.loom)
- [tour/events/02-click-count.loom](tour/events/02-click-count.loom)
- [tour/events/03-toggle.loom](tour/events/03-toggle.loom) (draft)

### Canvas (`tour/canvas`)

Time-driven `render` samples for the Canvas Preview (bar / point). Run them with
an explicit `--time`, e.g. `loomlet run examples/tour/canvas/01-bouncing-bar.loom --time 0.5`.

- [tour/canvas/01-bouncing-bar.loom](tour/canvas/01-bouncing-bar.loom)
- [tour/canvas/02-pulse-bar.loom](tour/canvas/02-pulse-bar.loom)
- [tour/canvas/03-orbit-point.loom](tour/canvas/03-orbit-point.loom)
- [tour/canvas/04-lissajous-point.loom](tour/canvas/04-lissajous-point.loom)
- [tour/canvas/05-console-bar.loom](tour/canvas/05-console-bar.loom)

### Scene Sync behaviors (`tour/scenesync/behaviors`)

Object-scoped behaviors omit `objectId`; the host applies them to the attached object.

- [tour/scenesync/behaviors/01-click-color.loom](tour/scenesync/behaviors/01-click-color.loom)
- [tour/scenesync/behaviors/02-float-y.loom](tour/scenesync/behaviors/02-float-y.loom)
- [tour/scenesync/behaviors/03-orbit-offset.loom](tour/scenesync/behaviors/03-orbit-offset.loom)
- [tour/scenesync/behaviors/04-breathing-scale.loom](tour/scenesync/behaviors/04-breathing-scale.loom)

### Scene Sync demos (`tour/scenesync/demos`)

Demos target an explicit object by `objectId`.

- [tour/scenesync/demos/01-move-cube.loom](tour/scenesync/demos/01-move-cube.loom)
- [tour/scenesync/demos/02-lissajous.loom](tour/scenesync/demos/02-lissajous.loom)

## VS Code examples

These use the `input` library (mouse / keyboard), which is provided by the VS Code
runtime preview host and is not available in the CLI or web node editor. Time-driven
canvas samples now live under [Canvas (`tour/canvas`)](#canvas-tourcanvas).

- [vscode/README.md](vscode/README.md)
- [vscode/03-mouse-follower.loom](vscode/03-mouse-follower.loom)
- [vscode/04-mouse-paint.loom](vscode/04-mouse-paint.loom)
- [vscode/05-key-visualizer.loom](vscode/05-key-visualizer.loom)
</content>
