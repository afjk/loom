# Loomlet Examples

This directory contains small examples for the Loomlet DSL, CLI, browser runtime, and integrations.

> Note: these examples are part of the GitHub repository. They are not included in the npm package tarball.

## CLI / DSL examples

- [cli-basic.loom](cli-basic.loom) - minimal compile example
- [cli-console.loom](cli-console.loom)
- [cli-json.loom](cli-json.loom) - JSON parse/stringify example
- [cli-text.loom](cli-text.loom) - text processing example
- [log-output.loom](log-output.loom)

Run from the repository root:

```bash
node bin/loomlet.mjs compile examples/cli-basic.loom
```

Or with the published package:

```bash
npx -p @afjk/loomlet loomlet compile examples/cli-basic.loom
```

## Browser examples

- [01-basic.html](01-basic.html) - basic browser example
- [02-moving-box.html](02-moving-box.html)
- [03-pointer.html](03-pointer.html)
- [04-keydown.html](04-keydown.html)
- [05-sink-box.html](05-sink-box.html)
- [06-three-cube.html](06-three-cube.html)
- [07-scenesync-mock.html](07-scenesync-mock.html)
- [08-lissajous.html](08-lissajous.html)
- [09-lerp-tween.html](09-lerp-tween.html)
- [10-multi-phase.html](10-multi-phase.html)
- [11-color-cycle.html](11-color-cycle.html)
- [12-circular-motion.html](12-circular-motion.html)
- [13-clamp-map.html](13-clamp-map.html)
- [14-dom-transform-sink.html](14-dom-transform-sink.html)
- [15-threshold-class-sink.html](15-threshold-class-sink.html)
- [16-smooth-pointer.html](16-smooth-pointer.html)
- [17-jitter-free-trail.html](17-jitter-free-trail.html)
- [18-charge-gauge.html](18-charge-gauge.html)

## Scene Sync examples

- [lissajous.loom](lissajous.loom) - Scene Sync behavior graph example
- [scene-effects.loom](scene-effects.loom) - Scene Sync effect example
- [scene-offset-position.loom](scene-offset-position.loom) - object offset behavior example
- [scene-offset-circle.loom](scene-offset-circle.loom) - circular offset behavior example
- [scene-graphs/lissajous.json](scene-graphs/lissajous.json)
- [scene-graphs/move-x.json](scene-graphs/move-x.json)
- [scene-graphs/rotate-y.json](scene-graphs/rotate-y.json)
- [tour/scenesync/01-move-cube.loom](tour/scenesync/01-move-cube.loom)
- [tour/scenesync/02-lissajous.loom](tour/scenesync/02-lissajous.loom)
- [tour/scenesync/03-orbit.loom](tour/scenesync/03-orbit.loom)
- [tour/scenesync/04-breathing-scale.loom](tour/scenesync/04-breathing-scale.loom)
- [tour/scenesync/05-wave-objects.loom](tour/scenesync/05-wave-objects.loom)
- [tour/scenesync/06-model-choreography.loom](tour/scenesync/06-model-choreography.loom)

## Tour examples

### Language (`tour/language`)

- [tour/language/01-hello.loom](tour/language/01-hello.loom)
- [tour/language/02-values.loom](tour/language/02-values.loom)
- [tour/language/03-pipeline.loom](tour/language/03-pipeline.loom)
- [tour/language/04-text.loom](tour/language/04-text.loom)
- [tour/language/05-arithmetic.loom](tour/language/05-arithmetic.loom)
- [tour/language/06-conditions.loom](tour/language/06-conditions.loom)
- [tour/language/07-fizzbuzz.loom](tour/language/07-fizzbuzz.loom)
- [tour/language/08-list-map-filter.loom](tour/language/08-list-map-filter.loom)
- [tour/language/09-factorial.loom](tour/language/09-factorial.loom)
- [tour/language/10-quicksort.loom](tour/language/10-quicksort.loom)

### Signals (`tour/signals`)

- [tour/signals/01-clock.loom](tour/signals/01-clock.loom)
- [tour/signals/02-sine-wave.loom](tour/signals/02-sine-wave.loom)
- [tour/signals/03-lfo.loom](tour/signals/03-lfo.loom)
- [tour/signals/04-smooth.loom](tour/signals/04-smooth.loom)
- [tour/signals/05-trigger.loom](tour/signals/05-trigger.loom)
- [tour/signals/06-state.loom](tour/signals/06-state.loom)

### Live (`tour/live`)

- [tour/live/01-pulse.loom](tour/live/01-pulse.loom)
- [tour/live/02-color-cycle.loom](tour/live/02-color-cycle.loom)
- [tour/live/03-grid-wave.loom](tour/live/03-grid-wave.loom)
- [tour/live/04-timeline-cues.loom](tour/live/04-timeline-cues.loom)
- [tour/live/05-audio-reactive-placeholder.loom](tour/live/05-audio-reactive-placeholder.loom)

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

## Notes

The examples directory is currently mixed. A future cleanup may reorganize files into subdirectories such as:

- `examples/cli/`
- `examples/browser/`
- `examples/scenesync/`
