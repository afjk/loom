# The Loomlet Tour

Loomlet is a small dataflow language for weaving values, signals, and scene behavior.

Loomlet source files use the `.loom` extension.

## Language

### 01 Hello
- Path: `examples/tour/language/01-hello.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/01-hello.loom`
- Teaches: imports, text transforms, console output
- Missing: none

### 02 Values
- Path: `examples/tour/language/02-values.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/02-values.loom`
- Teaches: constants, numeric values, basic arithmetic wiring
- Missing: none

### 03 Pipeline
- Path: `examples/tour/language/03-pipeline.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/03-pipeline.loom`
- Teaches: pipe operator, transform chaining (`map` -> `clamp`)
- Missing: none

### 04 Text
- Path: `examples/tour/language/04-text.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/04-text.loom`
- Teaches: `text.trim`, `text.replace`, `text.upper`
- Missing: none

### 05 Arithmetic
- Path: `examples/tour/language/05-arithmetic.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/05-arithmetic.loom`
- Teaches: arithmetic composition (`add`, `multiply`)
- Missing: none

### 06 Conditions
- Path: `examples/tour/language/06-conditions.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/06-conditions.loom`
- Teaches: declarative condition + selection
- Missing: none

### 07 FizzBuzz
- Path: `examples/tour/language/07-fizzbuzz.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/07-fizzbuzz.loom`
- Teaches: function values, `list.range`, `list.map`, nested `logic.select`, `text.stringify`, `text.join`
- Missing: none

### 08 List Map Filter
- Path: `examples/tour/language/08-list-map-filter.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/language/08-list-map-filter.loom`
- Teaches: map/filter/reduce collection flow with single-expression function values
- Missing: none for the current sample

### 09 Factorial
- Path: `examples/tour/language/09-factorial.loom`
- Status: Draft
- Run: `loomlet run examples/tour/language/09-factorial.loom`
- Teaches: recursive definition with base case selection
- Missing: recursion

### 10 Quicksort
- Path: `examples/tour/language/10-quicksort.loom`
- Status: Draft
- Run: `loomlet run examples/tour/language/10-quicksort.loom`
- Teaches: recursive partition/sort pattern
- Missing: recursion and additional list partition ergonomics

## Signals

### 01 Clock
- Path: `examples/tour/signals/01-clock.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/signals/01-clock.loom`
- Teaches: core `clock()` source
- Missing: none

### 02 Sine Wave
- Path: `examples/tour/signals/02-sine-wave.loom`
- Status: Runnable
- Run: `loomlet run examples/tour/signals/02-sine-wave.loom`
- Teaches: time-driven oscillation with `sine`
- Missing: none

### 03 LFO / 04 Smooth / 05 Trigger / 06 State
- Status: Draft
- Run: `loomlet run examples/tour/signals/<file>.loom`
- Missing: signal namespace nodes (`signal.lfo`, `signal.smooth`, `signal.trigger`, `signal.state`)

## Scene Sync

### 01 Move Cube
- Path: `examples/tour/scenesync/01-move-cube.loom`
- Status: Runnable
- Required object IDs: `sample-cube`
- Run: `loomlet scenesync dev examples/tour/scenesync/01-move-cube.loom`
- Teaches: direct `scene.setPosition` command for an existing object
- Missing: none

### 02 Lissajous
- Path: `examples/tour/scenesync/02-lissajous.loom`
- Status: Runnable
- Required object IDs: `sample-cube`
- Run: `loomlet scenesync dev examples/tour/scenesync/02-lissajous.loom`
- Teaches: time-driven X/Y choreography with `math.sine`
- Missing: none

### 03 Orbit
- Path: `examples/tour/scenesync/03-orbit.loom`
- Status: Runnable
- Required object IDs: `sample-cube`
- Run: `loomlet scenesync dev examples/tour/scenesync/03-orbit.loom`
- Teaches: circular motion with `math.cosine` + `math.sine`
- Missing: none

### 04 Breathing Scale
- Path: `examples/tour/scenesync/04-breathing-scale.loom`
- Status: Runnable
- Required object IDs: `sample-cube`
- Run: `loomlet scenesync dev examples/tour/scenesync/04-breathing-scale.loom`
- Teaches: pulse scaling with `scene.setScale`
- Missing: none

### 05 Wave Objects
- Path: `examples/tour/scenesync/05-wave-objects.loom`
- Status: Runnable
- Required object IDs: `wave-1`, `wave-2`, `wave-3`, `wave-4`, `wave-5`
- Run: `loomlet scenesync dev examples/tour/scenesync/05-wave-objects.loom`
- Teaches: multi-object phase offsets without dynamic object creation
- Missing: none

### 06 Model Choreography
- Path: `examples/tour/scenesync/06-model-choreography.loom`
- Status: Runnable
- Required object IDs: `dancer`
- Run: `loomlet scenesync dev examples/tour/scenesync/06-model-choreography.loom`
- Teaches: GLB choreography through position/scale/rotation on existing model object
- Missing: none

## Live

### 01 Pulse
- Path: `examples/tour/live/01-pulse.loom`
- Status: Runnable
- Required object IDs: `pulse-target`
- Run: `loomlet scenesync dev examples/tour/live/01-pulse.loom`
- Teaches: high-frequency pulse scale behavior
- Missing: none

### 02 Color Cycle
- Path: `examples/tour/live/02-color-cycle.loom`
- Status: Draft
- Required object IDs: `color-target`
- Run: `loomlet scenesync dev examples/tour/live/02-color-cycle.loom`
- Teaches: RGB color cycling via phase-shifted sine signals
- Missing: `scene.setColor` is not yet available end-to-end for Scene Sync graph target

### 03 Grid Wave
- Path: `examples/tour/live/03-grid-wave.loom`
- Status: Runnable
- Required object IDs: `grid-1` ... `grid-9`
- Run: `loomlet scenesync dev examples/tour/live/03-grid-wave.loom`
- Teaches: explicit multi-object wave choreography for a 3x3 layout
- Missing: none

### 04 Timeline Cues
- Path: `examples/tour/live/04-timeline-cues.loom`
- Status: Draft
- Required object IDs: `intro`, `main`, `outro`
- Run: `loomlet scenesync dev examples/tour/live/04-timeline-cues.loom`
- Teaches: intended show-control structure using timeline windows + visibility
- Missing: `timeline.progress`, `timeline.between`

### 05 Audio Reactive Placeholder
- Path: `examples/tour/live/05-audio-reactive-placeholder.loom`
- Status: Draft
- Required object IDs: `audio-target`
- Run: `loomlet scenesync dev examples/tour/live/05-audio-reactive-placeholder.loom`
- Teaches: intended mapping from audio level to scale
- Missing: `audio.level`
