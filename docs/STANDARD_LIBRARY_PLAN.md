# Standard Library Plan (Category-Based)

Source of truth for **Current** sections: `loomlet docs` output as of this PR.

## core
Purpose: language/dataflow fundamentals.
Current:
- `constant`
- `clock`
- pipeline `|>`
- `import`, assignment, comments
- single-expression function values: `fn(...) => expression`
- positional binary nodes are supported in function bodies (currently: `math.add`, `math.subtract`, `math.multiply`, `math.divide`, `math.mod`, `math.min`, `math.max`, `logic.and`, `logic.or`)
Used by tour samples:
- `constant`, `clock`, `|>`
Recommended baseline:
- `identity`
- block function bodies and recursion
Status summary:
- Implemented: constant/clock/pipe/import/assignment/comments/function values
- Missing: identity, block function bodies, recursion
- Planned: block function bodies and recursion
- Uncertain: module system extensions
Targets: cli, scenesync, unity, web

## logic
Purpose: boolean algebra and branching.
Current:
- `logic.not`, `logic.and`, `logic.or`, `logic.equals`, `logic.notEquals`
- `logic.greaterThan`, `logic.lessThan`, `logic.greaterOrEqual`, `logic.lessOrEqual`
- `logic.select`, `logic.when`
Used by tour samples:
- `logic.equals`, `logic.select`, `logic.and`, `logic.greaterThan`, `logic.lessOrEqual`, `logic.lessThan`, `logic.greaterOrEqual`
Recommended baseline:
- `logic.not`, `logic.and`, `logic.or`, `logic.equals`, `logic.notEquals`, `logic.greaterThan`, `logic.lessThan`, `logic.greaterOrEqual`, `logic.lessOrEqual`, `logic.select`, `logic.when`
Status summary: Implemented: baseline set / Missing: event-gated forms / Planned: portability polish / Uncertain: event-gated forms
Targets: cli, scenesync, unity, web

## math
Purpose: numeric transforms.
Current:
- `abs`, `add`, `clamp`, `cosine`, `divide`, `greaterThan`, `lerp`, `lessThan`, `map`, `mod`, `multiply`, `negate`, `math.sine`, `smoothstep`, `subtract`
- `math.add`, `math.subtract`, `math.multiply`, `math.divide`, `math.mod`, `math.abs`
- `math.floor`, `math.ceil`, `math.round`, `math.min`, `math.max`, `math.tan`, `math.sqrt`, `math.pow`
Used by tour samples:
- `add`, `multiply`, `map`, `clamp`, `math.sine`, `mod`
Recommended baseline:
- add missing candidates: `floor`, `ceil`, `round`, `min`, `max`, `tan`, `sqrt`, `pow`
Status summary: Implemented: current set above plus baseline expansion and namespace aliases / Missing: none for pure baseline / Planned: portability review / Uncertain: legacy unqualified aliases
Targets: cli, scenesync, unity, web

## text
Purpose: string processing.
Current:
- `text.upper`, `text.lower`, `text.trim`, `text.replace`
- `text.concat`, `text.split`, `text.join`, `text.includes`, `text.startsWith`, `text.endsWith`, `text.length`, `text.isEmpty`, `text.stringify`
Used by tour samples:
- `text.upper`, `text.trim`, `text.replace`, `text.stringify` (draft)
Recommended baseline:
- `text.concat`, `text.split`, `text.join`, `text.includes`, `text.startsWith`, `text.endsWith`, `text.length`, `text.isEmpty`, `text.stringify`
Status summary: Implemented: core ops plus baseline additions / Missing: locale-specific transforms / Planned: portability polish / Uncertain: locale-specific transforms
Targets: cli, scenesync, unity, web

## list
Purpose: ordered collection processing.
Current:
- `list.of`, `list.range`, `list.length`, `list.at`, `list.first`, `list.last`, `list.map`, `list.filter`, `list.reduce`, `list.join`, `list.reverse`, `list.sort`, `list.take`, `list.drop`, `list.concat`
Used by tour samples: `list.of`, `list.range`, `list.map`, `list.filter`, `list.reduce`, `list.first`, `list.drop`, `list.concat`, `list.length`, `list.of`
Recommended baseline: `list.of`, `list.range`, `list.length`, `list.at`, `list.first`, `list.last`, `list.map`, `list.filter`, `list.reduce`, `list.join`, `list.reverse`, `list.sort`, `list.take`, `list.drop`, `list.concat`
Status summary: Implemented baseline pure list set including function-value map/filter/reduce / Missing advanced collection helpers / Planned portability polish
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
- `console.log`, `console.warn`, `console.error`, `console.table`
Used by tour samples: `console.log`
Recommended baseline: `console.table`
Status summary: baseline implemented
Targets: cli, scenesync, unity, web

## fs
Purpose: file IO.
Current:
- CLI-only `fs.readText`, `fs.writeText`, `fs.exists`, `fs.list`
Used by tour samples: none
Recommended baseline: `fs.readText`, `fs.writeText`, `fs.exists`, `fs.list`
Status summary: minimal CLI-only baseline implemented; no browser/web/scenesync/unity support and no sandboxing yet
Targets: cli

## scene
Purpose: scene graph output control.
Current:
- `scene.setPosition`, `scene.setRotation`, `scene.setScale`
Used by tour samples:
- runnable: `scene.setPosition`, `scene.setRotation`, `scene.setScale`
- draft (pending end-to-end target support): `scene.setColor`, `scene.setVisible`
Recommended baseline:
- extend runnable sinks with `scene.setColor`, `scene.setVisible`
- plus `scene.find`, `scene.getPosition`, `scene.emit`, `scene.setMaterial`, `scene.setAsset`
- `scene.setText` is intentionally deferred
Status summary: transform sinks are implemented end-to-end; color/visibility and discovery/timeline/audio-linked helpers remain planned for full Scene Sync graph parity.
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
Current:
- `random.value`, `random.range`, `random.int`, `random.choice`
- `random.seeded`, `random.noise` are planned metadata only
Used by tour samples: none
Recommended baseline: `random.value`, `random.range`, `random.int`, `random.choice`, `random.seeded`, `random.noise`
Status summary: unseeded baseline implemented; seeded/noise planned
Targets: cli, web

## debug
Purpose: graph-level diagnostics.
Current:
- `debug.inspect`, `debug.trace`, `debug.assert`
Used by tour samples: none
Recommended baseline: `debug.inspect`, `debug.trace`, `debug.assert`
Status summary: baseline implemented
Targets: cli, unity, web
