# Standard Library Plan (Category-Based)

Source of truth for **Current** sections: `loomlet docs` output as of this PR.

## core
Purpose: language/dataflow fundamentals.
Current:
- `constant`
- `clock`
- pipeline `|>`
- `import`, assignment, comments
Used by tour samples:
- `constant`, `clock`, `|>`
Recommended baseline:
- `identity`
- function definitions
Status summary:
- Implemented: constant/clock/pipe/import/assignment/comments
- Missing: identity, function definitions
- Planned: function definitions
- Uncertain: module system extensions
Targets: cli, scenesync, unity, web

## logic
Purpose: boolean algebra and branching.
Current:
- none (no `logic` library today)
Used by tour samples:
- `logic.equals`, `logic.select`, `logic.and`, `logic.greaterThan`, `logic.lessOrEqual`, `logic.lessThan`, `logic.greaterOrEqual`
Recommended baseline:
- `logic.not`, `logic.and`, `logic.or`, `logic.equals`, `logic.notEquals`, `logic.greaterThan`, `logic.lessThan`, `logic.greaterOrEqual`, `logic.lessOrEqual`, `logic.select`, `logic.when`
Status summary: Implemented: none / Missing: baseline set / Planned: full baseline / Uncertain: event-gated forms
Targets: cli, scenesync, unity, web

## math
Purpose: numeric transforms.
Current:
- `abs`, `add`, `clamp`, `cosine`, `divide`, `greaterThan`, `lerp`, `lessThan`, `map`, `mod`, `multiply`, `negate`, `math.sine`, `smoothstep`, `subtract`
Used by tour samples:
- `add`, `multiply`, `map`, `clamp`, `math.sine`, `mod`
Recommended baseline:
- add missing candidates: `floor`, `ceil`, `round`, `min`, `max`, `tan`, `sqrt`, `pow`
Status summary: Implemented: current set above / Missing: baseline expansion / Planned: portability review / Uncertain: naming unification (`sine` vs `math.sine`)
Targets: cli, scenesync, unity, web

## text
Purpose: string processing.
Current:
- `text.upper`, `text.lower`, `text.trim`, `text.replace`
Used by tour samples:
- `text.upper`, `text.trim`, `text.replace`, `text.stringify` (draft)
Recommended baseline:
- `text.concat`, `text.split`, `text.join`, `text.includes`, `text.startsWith`, `text.endsWith`, `text.length`, `text.isEmpty`, `text.stringify`
Status summary: Implemented: 4 core ops / Missing: stringify and composition helpers / Planned: baseline completion / Uncertain: locale-specific transforms
Targets: cli, scenesync, unity, web

## list
Purpose: ordered collection processing.
Current: none
Used by tour samples: `list.of`, `list.range`, `list.map`, `list.filter`, `list.reduce`, `list.first`, `list.drop`, `list.concat`, `list.length`, `list.of`
Recommended baseline: `list.of`, `list.range`, `list.length`, `list.at`, `list.first`, `list.last`, `list.map`, `list.filter`, `list.reduce`, `list.join`, `list.reverse`, `list.sort`, `list.take`, `list.drop`, `list.concat`
Status summary: Implemented none / Missing foundational set / Planned high priority
Targets: cli, scenesync, unity, web

## object
Purpose: object/property operations.
Current: none
Used by tour samples: none directly
Recommended baseline: `object.get`, `object.set`, `object.has`, `object.keys`, `object.values`, `object.entries`, `object.merge`, `object.pick`
Status summary: Missing baseline
Targets: cli, scenesync, unity, web

## json
Purpose: structured serialization.
Current:
- `json.parse`, `json.stringify`
Used by tour samples: none
Recommended baseline: parse/stringify
Status summary: Implemented
Targets: cli, scenesync, unity, web

## time
Purpose: host and synchronized clocks.
Current:
- core source: `clock()`
- library: `time.serverClock()`
Used by tour samples:
- `clock()`, `time.serverClock()`
Recommended baseline:
- `time.now`, `time.delta`, `time.elapsed`
Status summary: Implemented partial / Missing frame/time helpers
Targets: cli, scenesync, unity, web

## signal
Purpose: signal-focused oscillator/modulation utilities.
Current:
- no `signal` namespace
- partial capability via math oscillators (`math.sine`, `cosine`)
Used by tour samples:
- `signal.lfo`, `signal.smooth`, `signal.trigger`, `signal.state`
Recommended baseline:
- `signal.sine`, `signal.cosine`, `signal.osc`, `signal.lfo`, `signal.pulse`, `signal.saw`, `signal.triangle`, `signal.noise`, `signal.phase`, `signal.loop`, `signal.sample`
Status summary: Missing namespace; planned as API layer over core math/time
Targets: cli, scenesync, unity, web

## state
Purpose: explicit temporal integration and memory.
Current:
- `state.lowpass`, `state.smoothLerp`, `state.delay1`, `state.integrate`
Used by tour samples:
- future smoothing/toggle patterns
Recommended baseline:
- `state.hold`, `state.toggle`, `state.counter`
Status summary: partial
Targets: cli, scenesync, unity, web

## console
Purpose: host logging and diagnostics sink.
Current:
- `console.log`, `console.warn`, `console.error`
Used by tour samples: `console.log`
Recommended baseline: `console.table`
Status summary: mostly implemented
Targets: cli, scenesync, unity, web

## fs
Purpose: file IO.
Current: none (`fs` library is planned)
Used by tour samples: none
Recommended baseline: `fs.readText`, `fs.writeText`, `fs.exists`, `fs.list`
Status summary: missing/planned
Targets: cli

## scene
Purpose: scene graph output control.
Current:
- `scene.setPosition`, `scene.setRotation`, `scene.setScale`
Used by tour samples:
- `scene.setPosition`; drafts need `scene.find`
Recommended baseline:
- `scene.setColor`, `scene.setVisible`, `scene.setText`, `scene.setMaterial`, `scene.emit`, `scene.find`, `scene.getPosition`
Status summary: partial; discovery helpers missing
Targets: scenesync, unity, web

## input
Purpose: user input abstraction.
Current: none in standard `input` library namespace
Used by tour samples: none
Recommended baseline: `input.keyboard`, `input.pointer`, `input.button`, `input.axis`, `input.event`
Status summary: planned
Targets: web, unity, scenesync

## audio
Purpose: audio-reactive analysis inputs.
Current: none
Used by tour samples: `audio.level` (live draft)
Recommended baseline: `audio.level`, `audio.band`, `audio.beat`, `audio.fft`
Status summary: planned
Targets: web, unity, scenesync

## timeline
Purpose: cue/sequence/choreography control.
Current: none
Used by tour samples: `timeline.sequence`, `timeline.cue`
Recommended baseline: `timeline.at`, `timeline.between`, `timeline.sequence`, `timeline.cue`, `timeline.loop`, `timeline.progress`
Status summary: planned high-priority for live/scenesync drafts
Targets: cli, scenesync, unity, web

## random
Purpose: controlled randomness.
Current: none
Used by tour samples: none
Recommended baseline: `random.value`, `random.range`, `random.int`, `random.choice`, `random.seeded`, `random.noise`
Status summary: planned
Targets: cli, scenesync, unity, web

## debug
Purpose: graph-level diagnostics.
Current: none
Used by tour samples: none
Recommended baseline: `debug.inspect`, `debug.trace`, `debug.assert`
Status summary: planned
Targets: cli, scenesync, unity, web
