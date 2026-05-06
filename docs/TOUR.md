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
- Status: Draft
- Run: `loomlet run examples/tour/language/06-conditions.loom`
- Teaches: declarative condition + selection
- Missing: `logic.equals`, `logic.select`

### 07 FizzBuzz
- Path: `examples/tour/language/07-fizzbuzz.loom`
- Status: Draft
- Run: `loomlet run examples/tour/language/07-fizzbuzz.loom`
- Teaches: range generation, mapping, nested branching
- Missing: `list.range`, `list.map`, `logic.equals`, `logic.and`, `logic.select`, `text.stringify`, function definitions

### 08 List Map Filter
- Path: `examples/tour/language/08-list-map-filter.loom`
- Status: Draft
- Run: `loomlet run examples/tour/language/08-list-map-filter.loom`
- Teaches: map/filter/reduce collection flow
- Missing: `list.of`, `list.map`, `list.filter`, `list.reduce`, `logic.greaterThan`, function definitions

### 09 Factorial
- Path: `examples/tour/language/09-factorial.loom`
- Status: Draft
- Run: `loomlet run examples/tour/language/09-factorial.loom`
- Teaches: recursive definition with base case selection
- Missing: `logic.lessOrEqual`, `logic.select`, function definitions, recursion

### 10 Quicksort
- Path: `examples/tour/language/10-quicksort.loom`
- Status: Draft
- Run: `loomlet run examples/tour/language/10-quicksort.loom`
- Teaches: recursive partition/sort pattern
- Missing: `list.first`, `list.drop`, `list.filter`, `list.concat`, `list.length`, `list.of`, `logic.lessThan`, `logic.greaterOrEqual`, `logic.lessOrEqual`, `logic.select`, function definitions, recursion

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
- Run: `loomlet scenesync dev examples/tour/scenesync/01-move-cube.loom`
- Teaches: `time.serverClock` + `math.sine` + `scene.setPosition`
- Missing: none

### 02 Lissajous
- Path: `examples/tour/scenesync/02-lissajous.loom`
- Status: Runnable
- Run: `loomlet scenesync dev examples/tour/scenesync/02-lissajous.loom`
- Teaches: multi-axis sine choreography
- Missing: none

### 03 Orbit
- Path: `examples/tour/scenesync/03-orbit.loom`
- Status: Draft
- Run: `loomlet scenesync dev examples/tour/scenesync/03-orbit.loom`
- Missing: `timeline.sequence`, `scene.find`

### 04 Breathing Scale
- Path: `examples/tour/scenesync/04-breathing-scale.loom`
- Status: Draft
- Run: `loomlet scenesync dev examples/tour/scenesync/04-breathing-scale.loom`
- Missing: `timeline.sequence`, `scene.find`

### 05 Wave Objects
- Path: `examples/tour/scenesync/05-wave-objects.loom`
- Status: Draft
- Run: `loomlet scenesync dev examples/tour/scenesync/05-wave-objects.loom`
- Missing: `timeline.sequence`, `scene.find`

### 06 Model Choreography
- Path: `examples/tour/scenesync/06-model-choreography.loom`
- Status: Draft
- Run: `loomlet scenesync dev examples/tour/scenesync/06-model-choreography.loom`
- Missing: `timeline.sequence`, `scene.find`

## Live

All live samples are Draft and use:
`loomlet scenesync dev examples/tour/live/<file>.loom`

- 01 Pulse: missing `timeline.cue`, `audio.level`
- 02 Color Cycle: missing `timeline.cue`, `audio.level`
- 03 Grid Wave: missing `timeline.cue`, `audio.level`
- 04 Timeline Cues: missing `timeline.cue`, `audio.level`
- 05 Audio Reactive Placeholder: missing `timeline.cue`, `audio.level`
