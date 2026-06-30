# The Loomlet Tour

Loomlet is a small dataflow language for weaving values, signals, events, and
scene behavior.

Loomlet source files use the `.loom` extension.

## Sample status

- `runnable`: can be executed locally and is covered by CI-safe tests.
- `manual-runnable`: compiles and runs, but meaningful output needs external
  setup such as a linked Scene Sync room or injected input events.
- `draft`: design sketch that needs a missing feature.

## Language

### 01 Hello
- Path: `examples/tour/language/01-hello.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/01-hello.loom`
- Teaches: imports, text transforms, console output

### 02 Values
- Path: `examples/tour/language/02-values.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/02-values.loom`
- Teaches: constants, value routing

### 03 Calls and Named Arguments
- Path: `examples/tour/language/03-calls-and-named-args.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/03-calls-and-named-args.loom`
- Teaches: positional vs named arguments, the first-argument rule

### 04 Pipeline
- Path: `examples/tour/language/04-pipeline.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/04-pipeline.loom`
- Teaches: pipe operator, transform chaining (`map` -> `clamp`)

### 05 Conditions
- Path: `examples/tour/language/05-conditions.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/05-conditions.loom`
- Teaches: declarative condition + selection

### 06 Function Definitions
- Path: `examples/tour/language/06-functions.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/06-functions.loom`
- Teaches: reusable `fn name(params) => expr` definitions, calling functions from functions

## Signals

### 01 Clock
- Path: `examples/tour/signals/01-clock.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/signals/01-clock.loom --time 1.25`
- Teaches: core `clock()` source

### 02 Sine Wave
- Path: `examples/tour/signals/02-sine-wave.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/signals/02-sine-wave.loom --time 0.25`
- Teaches: time-driven oscillation with `sine`

### 03 Integrate
- Path: `examples/tour/signals/03-integrate.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/signals/03-integrate.loom --time 2.0`
- Teaches: accumulating a value over time with the `integrate` state node

## Events

Event samples turn a host event stream into a value with `list.length` and react
to it. Without injected events on the channel they evaluate to the resting state,
so they are marked `manual-runnable`.

### 01 Pointer Click
- Path: `examples/tour/events/01-pointer-click.loom`
- Status: Manual-runnable
- Run: `loomlet run examples/tour/events/01-pointer-click.loom`
- Teaches: `onEvent` -> `list.length` to count events seen this frame

### 02 Click Count
- Path: `examples/tour/events/02-click-count.loom`
- Status: Manual-runnable
- Run: `loomlet run examples/tour/events/02-click-count.loom`
- Teaches: accumulating click activity into a 0..1 charge with `integrate`

### 03 Toggle
- Path: `examples/tour/events/03-toggle.loom`
- Status: Draft
- Run: `loomlet run examples/tour/events/03-toggle.loom`
- Teaches: intended persistent on/off flip on click
- Missing: an integer event counter or a latch/toggle state node

## Scene Sync behaviors

Object-scoped behaviors omit `objectId`; the host applies them to the attached
object. The click behavior is `manual-runnable` because it needs real click
events to do anything visible.

### 01 Click Color
- Path: `examples/tour/scenesync/behaviors/01-click-color.loom`
- Status: Manual-runnable
- Run: `loomlet scenesync dev examples/tour/scenesync/behaviors/01-click-color.loom`
- Teaches: click -> flash color via the `list.length` + `integrate` idiom

### 02 Float Y
- Path: `examples/tour/scenesync/behaviors/02-float-y.loom`
- Status: Runnable
- Run: `loomlet scenesync dev examples/tour/scenesync/behaviors/02-float-y.loom`
- Teaches: continuous vertical floating with a zero-mean `scene.offsetPosition`

### 03 Orbit Offset
- Path: `examples/tour/scenesync/behaviors/03-orbit-offset.loom`
- Status: Runnable
- Run: `loomlet scenesync dev examples/tour/scenesync/behaviors/03-orbit-offset.loom`
- Teaches: circular orbit with `math.cosine` + `math.sine` offsets

### 04 Breathing Scale
- Path: `examples/tour/scenesync/behaviors/04-breathing-scale.loom`
- Status: Runnable
- Run: `loomlet scenesync dev examples/tour/scenesync/behaviors/04-breathing-scale.loom`
- Teaches: pulse scaling with `scene.setScale`

## Scene Sync demos

Demos target an explicit object by `objectId`.

### 01 Move Cube
- Path: `examples/tour/scenesync/demos/01-move-cube.loom`
- Status: Runnable
- Required object IDs: `sample-cube`
- Run: `loomlet scenesync dev examples/tour/scenesync/demos/01-move-cube.loom`
- Teaches: a single `scene.setPosition` command for an existing object

### 02 Lissajous
- Path: `examples/tour/scenesync/demos/02-lissajous.loom`
- Status: Runnable
- Required object IDs: `lissajous-target`
- Run: `loomlet scenesync dev examples/tour/scenesync/demos/02-lissajous.loom`
- Teaches: two-axis choreography with `math.sine`
</content>
