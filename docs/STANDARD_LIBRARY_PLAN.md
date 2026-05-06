# Standard Library Plan (Category-Based)

Each node includes gap metadata: status (implemented/missing/planned/uncertain), source (required-by-sample/recommended-baseline/future-experimental), and priority (high/medium/low).

## core
Purpose: foundational language/dataflow primitives.
Current: `constant`, pipeline `|>`, `import`, assignment.
Used by tour samples: `constant`, `pipe`.
Recommended baseline: `constant`, `identity`, `pipe` plus language-level `function definitions`.
Status summary: Implemented: constant/pipe/import/assignment. Missing: identity as first-class node, function defs. Planned: function defs. Uncertain: macro-like helpers.
Targets: cli, scenesync, unity, web.

## logic
Purpose: boolean ops and branching.
Current: none as library nodes.
Used by tour samples: `logic.equals`, `logic.select`, `logic.and`.
Recommended baseline: `logic.not`, `logic.and`, `logic.or`, `logic.equals`, `logic.notEquals`, `logic.greaterThan`, `logic.lessThan`, `logic.greaterOrEqual`, `logic.lessOrEqual`, `logic.select`, `logic.when`.
Status summary: Missing high-priority baseline for language tour drafts.
Targets: cli, scenesync, unity, web.

## math
Purpose: numeric transforms and shaping.
Current: add/subtract/multiply/divide/mod/abs/floor/ceil/round/min/max/clamp/map/lerp/smoothstep/sine/cosine/tan/sqrt/pow (existing runtime family).
Used by tour samples: `math.add`, `math.multiply`, `math.clamp`, `math.map`, `math.sine`.
Recommended baseline: all listed in task.
Status summary: Mostly implemented; verify parity aliases (`sine` vs `math.sine`) across targets.
Targets: cli, scenesync, unity, web.

## text
Purpose: string shaping and formatting.
Current: `text.upper`, `text.lower`, `text.trim`, `text.replace`.
Used by tour samples: `text.upper`, `text.trim`, `text.replace`, `text.stringify`.
Recommended baseline: add `text.concat`, `text.split`, `text.join`, `text.includes`, `text.startsWith`, `text.endsWith`, `text.length`, `text.isEmpty`, `text.stringify`.
Status summary: partial implementation; stringify/concat are high priority.
Targets: cli, scenesync, unity, web.

## list
Purpose: ordered collection operations.
Current: none.
Used by tour samples: range/map/filter/reduce/sort patterns.
Recommended baseline: `list.of`, `list.range`, `list.length`, `list.at`, `list.first`, `list.last`, `list.map`, `list.filter`, `list.reduce`, `list.join`, `list.reverse`, `list.sort`, `list.take`, `list.drop`.
Status summary: fully missing; foundational for advanced language tours.
Targets: cli, scenesync, unity, web.

## object
Purpose: object and property operations.
Current: none.
Used by tour samples: indirect use in future scene batching.
Recommended baseline: `object.get`, `object.set`, `object.has`, `object.keys`, `object.values`, `object.entries`, `object.merge`, `object.pick`.
Status summary: missing.
Targets: cli, scenesync, unity, web.

## json
Purpose: structured data serialization.
Current: `json.parse`, `json.stringify`.
Used by tour samples: none directly in tour yet.
Recommended baseline: parse/stringify only.
Status summary: implemented.
Targets: cli, scenesync, unity, web.

## time
Purpose: clock and frame timing.
Current: `time.clock`, `time.serverClock`.
Used by tour samples: both.
Recommended baseline: `time.now`, `time.clock`, `time.serverClock`, `time.delta`, `time.elapsed`.
Status summary: partial.
Targets: cli, scenesync, unity, web.

## signal
Purpose: pure time-varying helpers.
Current: partial via math oscillators.
Used by tour samples: draft `signal.lfo` et al.
Recommended baseline: `signal.sine`, `signal.cosine`, `signal.osc`, `signal.lfo`, `signal.pulse`, `signal.saw`, `signal.triangle`, `signal.noise`, `signal.phase`, `signal.loop`, `signal.sample`.
Status summary: mostly missing as dedicated namespace.
Targets: cli, scenesync, unity, web.

## state
Purpose: explicit temporal state.
Current: `state.lowpass`, `state.smoothLerp`, `state.delay1`, `state.integrate`.
Used by tour samples: draft state/control patterns.
Recommended baseline: add `state.hold`, `state.toggle`, `state.counter`.
Status summary: partial.
Targets: cli, scenesync, unity, web.

## console
Purpose: host logging.
Current: `console.log`, `console.warn`, `console.error`.
Used by tour samples: log.
Recommended baseline: add `console.table`.
Status summary: mostly implemented.
Targets: cli, scenesync, unity, web.

## fs
Purpose: file IO (mainly cli/tooling).
Current: none runtime.
Used by tour samples: none.
Recommended baseline: `fs.readText`, `fs.writeText`, `fs.exists`, `fs.list`.
Status summary: planned CLI-first.
Targets: cli primarily.

## scene
Purpose: host scene graph operations.
Current: `scene.setPosition`, `scene.setRotation`, `scene.setScale`.
Used by tour samples: setPosition.
Recommended baseline: add `scene.setColor`, `scene.setVisible`, `scene.setText`, `scene.setMaterial`, `scene.emit`, `scene.find`, `scene.getPosition`.
Status summary: partial with high-priority `scene.find` for choreography.
Targets: scenesync, unity, web.

## input
Purpose: user/device input.
Current: legacy engine inputs exist; loomlet library namespace not standardized.
Used by tour samples: none.
Recommended baseline: `input.keyboard`, `input.pointer`, `input.button`, `input.axis`, `input.event`.
Status summary: uncertain normalization.
Targets: web, unity, scenesync.

## audio
Purpose: audio analysis/control signals.
Current: none.
Used by tour samples: live draft placeholder.
Recommended baseline: `audio.level`, `audio.band`, `audio.beat`, `audio.fft`.
Status summary: missing.
Targets: web, unity, scenesync.

## timeline
Purpose: cue/sequence/choreography control.
Current: none.
Used by tour samples: live/scenesync draft set.
Recommended baseline: `timeline.at`, `timeline.between`, `timeline.sequence`, `timeline.cue`, `timeline.loop`, `timeline.progress`.
Status summary: missing.
Targets: cli (offline eval), scenesync, unity, web.

## random
Purpose: stochastic/seeded generation.
Current: none.
Recommended baseline: `random.value`, `random.range`, `random.int`, `random.choice`, `random.seeded`, `random.noise`.
Status summary: planned.
Targets: cli, scenesync, unity, web.

## debug
Purpose: diagnostics and invariants.
Current: none standardized.
Recommended baseline: `debug.inspect`, `debug.trace`, `debug.assert`.
Status summary: planned.
Targets: cli, scenesync, unity, web.
