# Loomlet Stabilization Roadmap

This roadmap keeps core Loomlet behavior stable while still allowing focused experiments.

## Relationship with SPEC

`docs/SPEC.md` describes Loomlet's intended semantics, design principles, and current implementation model. This roadmap describes the order for stabilizing the implementation, tests, metadata, and labs work.

When the two documents overlap, treat `docs/SPEC.md` as the source for stable semantics and this roadmap as the source for execution order. Lab ideas should remain here or in linked design notes until they are mature enough to be promoted into `docs/SPEC.md`.

## Status Legend

- **Done**: completed for the current roadmap scope. Follow-up work may still exist, but the item no longer blocks the next planning step.
- **Partial**: a baseline exists, but important follow-up work remains.
- **Planned**: intended next work.
- **Future**: intentionally deferred.
- **Experimental**: allowed to change; do not treat as stable API or frozen behavior.

## Next Release Planning Draft

**Status: Planned**

The next release should focus on making Loomlet usable as a host-integrated behavior system without making exported Scene Sync scenes depend on afjk.jp infrastructure.

### Core release theme

```text
Scene Sync / Loomlet shared time and event foundation
```

This release should connect Loomlet, Scene Sync, the Node Editor, packages, and export workflows through a smaller set of stable boundaries:

- Loomlet evaluates graphs against a host-provided environment.
- Scene Sync provides synchronized time and committed events when running live multi-client rooms.
- Scene Sync Export provides local playback time so exported scenes can run without afjk.jp presence servers.
- Node Editor and DSL workflows stabilize around semantic round-trips before attempting complete source-preserving round-trips.

### P0: release foundations

These items should be prioritized before larger authoring features.

1. **Planned**: Host-provided time / Scene Sync server time sync
   - Loomlet must not own the clock or call afjk.jp directly.
   - Loomlet should evaluate against `env.time`, `env.deltaTime`, and related host-provided time values.
   - Scene Sync live rooms may provide server-synchronized time as the host clock.
   - Scene Sync Export / standalone playback must be able to provide a local playback clock instead.
   - Self-hosted Scene Sync should be able to provide its own synchronized clock.

2. **Planned**: Event envelope v0
   - Define a minimal event envelope for committed environment events.
   - The envelope should cover `id`, `channel`, `timestamp`, `source`, `target`, and `payload` where applicable.
   - Event order and timestamp semantics should be explicit enough for Scene Sync, replay, timer, and `OnStart` behavior.
   - Local feedback and committed shared events should remain separate concepts.

3. **Planned**: Canonical DSL round-trip v1
   - Stabilize semantic equivalence for `Graph -> Canonical DSL -> Graph`.
   - Generated DSL must be parseable and compile back to a semantically equivalent graph.
   - Do not require exact preservation of original formatting, comments, pipe style, import order, or named-vs-positional style.
   - Treat this as a semantic round-trip, not a complete source-preserving editor round-trip.

4. **Planned**: Scene Sync Export v0 compatibility
   - Exported scenes should not require the afjk.jp presence server.
   - Export should preserve scene data, object transforms, assets, behavior graphs, runtime/animation state, and playback clock configuration where practical.
   - Export playback should use a host-provided local clock by default.
   - Live Scene Sync, self-hosted Scene Sync, and exported standalone playback should differ by host environment, not by Loomlet graph semantics.

### P1: high-value next-release items

These are valuable if the P0 foundations are clear enough.

1. **Done**: Scene Sync graph attach / clear / run workflow
   - ✅ [Scene Sync Workflow Guide](./SCENESYNC_WORKFLOW.md) documents scene-level vs object-level graph attachment.
   - ✅ Graph evaluation is separate from host mutation; `behavior set`, `behavior clear`, `run`, and `dev` workflows are documented.
   - ✅ CLI operations are tested and easy to use. See [Scene Sync Workflow Guide](./SCENESYNC_WORKFLOW.md) for examples.

2. **Done (v0 foundation)**: Swizzle / component access / virtual node foundation
   - ✅ Semantic component vocabulary and coordinate-space rule are documented in [Semantic Component Access v0](./design/semantic-component-access-v0.md).
   - ✅ Current implementation scope is documented: filter predicate DSL supports `value.right/up/front` and `value.r/u/f`.
   - ✅ Lowering direction is documented (`getComponent` / `swizzle`) while keeping runtime/export semantics explicit.
   - ➡️ General expression component access, multi-component swizzle runtime shape, and Node Editor virtual port UI remain planned/future work.

3. **Partial**: Package extension foundation stabilization
   - Trusted local package loading, runtime node registration, package metadata registration, CLI/REPL `--package`, docs/help integration, and import validation have a working baseline.
   - Current next scope remains trusted local packages.
   - Stabilize package manifests, target compatibility, metadata usage, and generated docs before npm/remote loading.
   - Package nodes should become usable by CLI/REPL/docs first, then VS Code and Node Editor.

4. **Planned**: Output conflict / single-writer warnings
   - Warn when multiple graphs or sources attempt to write the same object property.
   - Prefer a single-writer rule for deterministic behavior.
   - Route cross-object effects through events, commands, or scene-level graphs rather than direct object mutation.

5. **Partial**: Portable runtime subset for Scene Sync / Unity
   - Unity compatibility baseline and portable runtime parity fixtures exist.
   - Clarify which nodes are portable across JS and future Unity/C# runtimes.
   - Keep host-adapter nodes separate from portable pure nodes.
   - Use runtime parity fixtures to avoid Scene Sync behavior diverging by host.
   - Unity/C# runtime implementation remains future work.

### P2: stretch goals / later stabilization

These are important, but should not block the next release if P0/P1 work is not stable yet.

- **Future**: Function definition as subgraph
  - DSL functions should eventually lower to reusable subgraphs.
  - Function calls should become subgraph references or expanded graph fragments.
  - Node Editor should represent functions as collapsible groups or reusable graph units.
  - This should come after canonical DSL round-trip v1 is stable enough.
- **Future**: Full DSL <-> Node Editor source-preserving round-trip
  - Preserve comments, formatting, pipe syntax, import order, editor layout metadata, and source patches only after semantic round-trip behavior is stable.
- **Future**: npm / remote package loading
  - Defer until trusted local packages, manifests, target compatibility, and security model are stable.
- **Future**: Package sandboxing and permissions
  - Required before untrusted package loading.
- **Future**: Package-aware Node Editor UI
  - Useful after package metadata and target compatibility are stable.

### Release wording guidance

Avoid describing the next release as a complete DSL <-> Node Graph round-trip release unless source-preserving behavior is actually guaranteed.

Prefer:

```text
Canonical DSL round-trip v1
DSL / Node Editor semantic round-trip foundation
Package extension foundation stabilization
Host-provided time and event foundation
```

Avoid:

```text
Complete DSL <-> Node Graph round-trip
General-purpose package ecosystem
Server-time-dependent Loomlet runtime
```

## Track A: Stabilization

Purpose: make the core reliable and easier to extend.

Recommended order:

1. **Partial**: Clarify terminology
   - Core terminology is documented in `docs/SPEC.md` and related docs.
   - Continue tightening user-facing wording as features mature.
2. **Partial**: Formalize behavior/event semantics in `docs/SPEC.md`
   - Behavior/event port kinds and basic connection rules are documented.
   - Event envelope, timestamp, ordering, replay, and host authority semantics remain next work.
3. **Partial**: Add golden tests for examples
   - Parse/compile and stabilization fixtures exist for current areas.
   - Canonical DSL round-trip v1 semantic fixtures are covered in `test/stabilization-fixtures.test.mjs` (for example `event-on-event-basic.loom`, `event-on-event-self.loom`, `event-on-event-explicit.loom`, `event-edge-send.loom` for `onEvent` / `sendEvent` / `risingEdge` / `fallingEdge`).
   - Source-preserving DSL <-> Node Editor round-trip remains future work.
4. **Done**: Stabilize node definition schema
   - Document current node definition schema in `docs/NODE_DEFINITION_SCHEMA.md`
   - Add conservative metadata shape tests in `test/library-metadata-schema.test.mjs`
   - Document runtime node registry in `docs/RUNTIME_NODE_REGISTRY.md`
   - Add runtime registry shape tests in `test/runtime-node-registry.test.mjs`
   - Add metadata/runtime drift tests in `test/runtime-metadata-drift.test.mjs`
   - Remove metadata-only public nodes; experimental nodes should stay in design docs until executable
   - Runtime/metadata drift allowlists are now self-audited so stale entries fail tests
   - Do not yet make metadata the single runtime/compiler source of truth
5. **Done**: Clarify input vs param
   - Covered by `input-param-*` stabilization fixtures.
6. **Done**: Clarify runtime registration API
   - Minimal `createNodeRegistry()` and `registerNodeType()` API available
   - Built-in node types are constructed through the default registry
   - Trusted local packages now supported via `registerTrustedPackage()`
   - Compile/runtime can accept custom node registries
   - A demo package proves end-to-end compile/runtime flow with package nodes
   - Package metadata registry added (`createLibraryMetadataRegistry`)
   - Packages can register both runtime nodes and metadata
   - Metadata is optional; runtime-only packages still work
   - Package imports are now validated against custom node/metadata registries
   - `compileLoomSource()` forwards registry options into graph compilation
   - Package metadata provides target compatibility for package imports
   - CLI/REPL can load trusted local packages explicitly with `--package`
   - Remote/npm package loading remains future work
7. **Done**: Clarify metadata as shared source for editor/docs/completion
   - VS Code completion, hover, and library reference now share generated library metadata as their default source
   - Standard library reference docs are generated from shared library metadata
   - Generated VS Code metadata is freshness-tested against shared library metadata
   - manual overrides remain only for examples, aliases, render syntax, and preview-host-specific notes
8. **Partial**: Improve compatibility between JS runtime and Unity runtime where practical
   - Unity compatibility baseline documented in `docs/UNITY_RUNTIME_COMPATIBILITY.md`
   - Compatibility levels defined: portable, host-adapter, js-only, future
   - Current library baseline established with porting priorities
   - Metadata/runtime target consistency for Unity is covered by tests in `test/unity-runtime-compatibility.test.mjs`
   - Portable runtime parity fixtures added for JS runtime now and future Unity runtime reuse
   - Unity/C# runtime implementation remains future work

## Track B: Labs

Purpose: try ideas without destabilizing main.

Candidate experiments:

- **Planned / Experimental**: [`labs/temporal-environment`](labs/temporal-environment.md)
  - temporal environment facts for Scene Sync / Loomlet
  - room clock and server time offset
  - pending / confirmed interaction states
  - hybrid Temporal Fact / State Sync / Local-only model
  - LBE-oriented multiplayer and art experiments
- **Planned / Experimental**: `labs/value-model`
  - vec2 / vec3 / vec4 / record / list
  - `.x`, `.xy`, `.xz` component access / swizzle
- **Future / Experimental**: `labs/input-slot`
  - connection value
  - local constant
  - node default
  - priority order
- **Planned / Experimental**: `labs/node-editor-virtual-ports`
  - collapsible virtual component ports
  - implicit swizzle/get nodes
- **Future / Experimental**: `labs/function-subgraph`
  - DSL function definitions as reusable subgraphs
  - function calls as subgraph references or graph expansion
  - function inputs/outputs as node ports
  - Node Editor representation for collapsible function groups
- **Partial / Experimental**: `labs/package`
  - trusted local package baseline exists
  - package manifest
  - package versioning
  - npm/catalog support
  - sandboxing and permissions
- **Future / Experimental**: `labs/ui-graph`
  - UI values/events as Loomlet graph inputs/outputs
- **Future / Experimental**: `labs/shader-graph`
  - shader-safe subset exploration

## Promotion rule from labs to main

A lab idea can move into main only when:

- the behavior is described in `docs/SPEC.md` or a linked design doc
- runtime tests exist
- DSL or graph examples exist
- editor impact is documented
- compatibility impact is documented

## Round-trip and Golden Test Strategy

Loomlet has multiple representations: `.loom` source, Source AST, compiled graphs, runtime graphs, editor models, canonical DSL, and editor metadata. Each boundary should be stabilized separately instead of treating the entire authoring pipeline as one fully stable round-trip.

### Stabilize first

Near-term tests should focus on semantic stability for the compiler and runtime boundaries:

```text
DSL Source -> Source AST
DSL Source -> Source AST -> Graph
DSL fixture -> compile -> graph semantic snapshot
Runtime graph -> evaluation result for deterministic examples
```

These tests should verify that examples parse, compile, and evaluate as intended. They should not require preserving the author's original whitespace, comments, pipe style, argument style, or editor layout.

### Canonical DSL round-trip v1 (semantic boundary)

Canonical DSL round-trip v1 is the semantic boundary:

```text
Graph -> Canonical DSL -> Graph
```

In current test helpers this is exercised as:

```text
Graph -> Canonical DSL -> Source AST -> Graph
```

and compared after graph normalization for semantic equivalence.

Generated canonical DSL may use a normalized style rather than the user's original source style. v1 goals are:

- generated DSL is parseable
- generated DSL compiles back to a semantically equivalent graph
- exact text equality with the original source is not required
- comments, formatting, pipe syntax, import order, and named-vs-positional argument style are not guaranteed to be preserved
- editor layout metadata and hidden metadata exact shape are not guaranteed to be preserved

Semantic comparison may normalize or ignore:

- node ordering when semantically irrelevant
- edge ordering when semantically irrelevant
- formatting/source representation differences
- editor-only layout metadata
- hidden metadata exact format

### Do not freeze yet

Avoid strict golden snapshots for areas that are still experimental or visual-only:

- Node Editor real-time synchronization
- complete DSL <-> Node Editor bidirectional editing
- comment-preserving source patches
- original formatting preservation
- pipe syntax preservation
- named vs positional argument preservation
- import ordering preservation
- editor layout metadata round-trip
- hidden editor metadata exact format
- bidirectional patching between edited DSL text and existing node layout
- full function/subgraph source preservation
- package-aware source preservation
- node coordinates and visual layout
- generated canonical DSL exact text layout, unless intentionally testing canonical formatting

### Golden test levels

Use levels so tests can be added without accidentally freezing unstable behavior.

#### Level 1: Parse fixtures — **Done / ongoing**

A `.loom` fixture parses without errors.

#### Level 2: Compile fixtures — **Done / ongoing**

A `.loom` fixture compiles without errors and the graph contains expected semantic nodes and edges.

#### Level 3: Graph semantic snapshots — **Partial**

A normalized graph output is compared against an expected snapshot.

Normalization should avoid unstable fields such as editor positions, generated IDs where possible, timestamps, and visual-only metadata.

Test helpers like `test/helpers/normalize-graph.mjs` provide reusable normalization for semantic snapshots. See stabilization fixture tests for examples.

#### Level 4: Canonical DSL round-trip v1 — **Partial**

Compile a graph to canonical DSL, parse it again, compile it again, and compare semantic graph equivalence.

Coverage exists in stabilization fixtures; this level remains partial while normalization/helper details are still being tightened.

#### Level 5: Editor round-trip — **Future**

Round-trip through the editor model:

```text
Node Editor model -> Graph -> Canonical DSL -> Graph -> Editor model
```

This is future work and should not be treated as stable yet.

### Recommended next steps

1. **Planned**: Define host-provided time requirements and update `docs/SPEC.md` if needed.
2. **Planned**: Define Event envelope v0 and timestamp/order semantics.
3. **Planned**: Add or update Scene Sync design notes for server-synchronized time and export-local playback clock compatibility.
4. **Planned**: Continue documenting and tightening graph normalization intent for semantic round-trip tests without over-freezing implementation details.
5. **Partial**: Continue expanding Canonical DSL round-trip v1 semantic fixtures where new node families are stabilized.
6. **Planned**: Add fixtures for Scene Sync graph attach / clear / run workflows where practical.
7. **Planned**: Define value-model and swizzle lowering rules before exposing swizzle broadly in DSL or Node Editor.
8. **Future**: Define function-as-subgraph semantics in labs before promoting it into main.
9. **Planned**: Continue stabilizing package manifests, metadata, and target compatibility before npm/remote package loading.
