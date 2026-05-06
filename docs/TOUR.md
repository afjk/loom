# The Loomlet Tour

Loomlet is a small dataflow language for weaving values, signals, and scene behavior.

Loomlet source files use the `.loom` extension.

## Language

### 01 Hello
Path: `examples/tour/language/01-hello.loom`  
Status: Runnable  
Run: `loomlet run examples/tour/language/01-hello.loom`  
Teaches: imports, text transforms, console output  
Missing: none

### 02 Values
Path: `examples/tour/language/02-values.loom`  
Status: Runnable  
Run: `loomlet run examples/tour/language/02-values.loom`  
Teaches: constants, value wiring, stringify  
Missing: none

### 03 Pipeline
Path: `examples/tour/language/03-pipeline.loom` / Runnable / `loomlet run examples/tour/language/03-pipeline.loom`  
Teaches: pipe operator, chained transforms  
Missing: none

### 04 Text
Path: `examples/tour/language/04-text.loom` / Runnable / `loomlet run examples/tour/language/04-text.loom`  
Teaches: trim/replace/upper sequence  
Missing: none

### 05 Arithmetic
Path: `examples/tour/language/05-arithmetic.loom` / Runnable / `loomlet run examples/tour/language/05-arithmetic.loom`  
Teaches: add and multiply  
Missing: none

### 06 Conditions
Path: `examples/tour/language/06-conditions.loom` / Draft / `loomlet run examples/tour/language/06-conditions.loom`  
Teaches: declarative branching shape  
Missing: `logic.equals`, `logic.select`

### 07 FizzBuzz
Path: `examples/tour/language/07-fizzbuzz.loom` / Draft / `loomlet run examples/tour/language/07-fizzbuzz.loom`  
Teaches: list mapping + nested selection  
Missing: list/logic nodes and function definitions

### 08 List Map Filter
Path: `examples/tour/language/08-list-map-filter.loom` / Draft / `loomlet run examples/tour/language/08-list-map-filter.loom`  
Teaches: collection transforms  
Missing: list runtime + lambdas

### 09 Factorial
Path: `examples/tour/language/09-factorial.loom` / Draft / `loomlet run examples/tour/language/09-factorial.loom`  
Teaches: recursion pattern  
Missing: recursion + function definitions

### 10 Quicksort
Path: `examples/tour/language/10-quicksort.loom` / Draft / `loomlet run examples/tour/language/10-quicksort.loom`  
Teaches: recursive divide-and-conquer expression  
Missing: recursion + list ops

## Signals
- 01 Clock — Runnable — `loomlet run examples/tour/signals/01-clock.loom` — Missing: none
- 02 Sine Wave — Runnable — `loomlet run examples/tour/signals/02-sine-wave.loom` — Missing: none
- 03 LFO — Draft — `loomlet run examples/tour/signals/03-lfo.loom` — Missing: `signal.lfo`
- 04 Smooth — Draft — `loomlet run examples/tour/signals/04-smooth.loom` — Missing: signal/state smoothing helpers
- 05 Trigger — Draft — `loomlet run examples/tour/signals/05-trigger.loom` — Missing: trigger helpers
- 06 State — Draft — `loomlet run examples/tour/signals/06-state.loom` — Missing: state composition helpers

## Scene Sync
- 01 Move Cube — Runnable — `loomlet scenesync dev examples/tour/scenesync/01-move-cube.loom` — Missing: none
- 02 Lissajous — Runnable — `loomlet scenesync dev examples/tour/scenesync/02-lissajous.loom` — Missing: none
- 03 Orbit — Draft — Missing: timeline sequencing + object queries
- 04 Breathing Scale — Draft — Missing: timeline and scene utility nodes
- 05 Wave Objects — Draft — Missing: `scene.find`, bulk ops
- 06 Model Choreography — Draft — Missing: choreography primitives

## Live
- 01 Pulse — Draft — missing live/timeline set
- 02 Color Cycle — Draft — missing color palette and timeline set
- 03 Grid Wave — Draft — missing list/object iteration + scene batching
- 04 Timeline Cues — Draft — missing cue/sequence nodes
- 05 Audio Reactive Placeholder — Draft — missing audio input and analysis nodes
