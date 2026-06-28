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

### Signals (`tour/signals`)

- [tour/signals/01-clock.loom](tour/signals/01-clock.loom)
- [tour/signals/02-sine-wave.loom](tour/signals/02-sine-wave.loom)
- [tour/signals/03-integrate.loom](tour/signals/03-integrate.loom)

### Events (`tour/events`)

- [tour/events/01-pointer-click.loom](tour/events/01-pointer-click.loom)
- [tour/events/02-click-count.loom](tour/events/02-click-count.loom)
- [tour/events/03-toggle.loom](tour/events/03-toggle.loom) (draft)

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

- [vscode/README.md](vscode/README.md)
- [vscode/01-bouncing-bar.loom](vscode/01-bouncing-bar.loom)
- [vscode/02-orbit-point.loom](vscode/02-orbit-point.loom)
- [vscode/03-lissajous-point.loom](vscode/03-lissajous-point.loom)
- [vscode/03-mouse-follower.loom](vscode/03-mouse-follower.loom)
- [vscode/04-mouse-paint.loom](vscode/04-mouse-paint.loom)
- [vscode/04-pulse-bar.loom](vscode/04-pulse-bar.loom)
- [vscode/05-key-visualizer.loom](vscode/05-key-visualizer.loom)
- [vscode/console-log.loom](vscode/console-log.loom)
</content>
