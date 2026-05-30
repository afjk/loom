# Loomlet Stabilization Roadmap

This roadmap keeps core Loomlet behavior stable while still allowing focused experiments.

## Relationship with SPEC

`docs/SPEC.md` describes Loomlet's intended semantics, design principles, and current implementation model. This roadmap describes the order for stabilizing implementation, tests, metadata, and labs work.

When the two documents overlap, treat `docs/SPEC.md` as the source for stable semantics and this roadmap as the source for execution order. Lab ideas should remain here or in linked design notes until they are mature enough to be promoted into `docs/SPEC.md`.

## Status Legend

- **Done**: completed for the current roadmap scope. Follow-up work may still exist, but the item no longer blocks the next planning step.
- **Partial**: a baseline exists, but important follow-up work remains.
- **Planned**: intended next work.
- **Future**: intentionally deferred.
- **Experimental**: allowed to change; do not treat as stable API or frozen behavior.

## Next Release: Shared time and event foundation

**Status: Completed for P0/P1 foundation**

The next release focuses on making Loomlet usable as a host-integrated behavior system without making exported Scene Sync scenes depend on afjk.jp infrastructure.

Core release theme:

```text
Scene Sync / Loomlet shared time and event foundation
```

This release connects Loomlet, Scene Sync, the Node Editor, packages, and export workflows through a smaller set of stable boundaries:

- Loomlet evaluates graphs against a host-provided environment.
- Scene Sync live rooms may provide synchronized room time and committed shared events.
- Scene Sync Export provides local playback time so exported scenes can run without afjk.jp, CDN, or the presence server at runtime.
- Node Editor and DSL workflows stabilize around semantic round-trips with safe source-preserving patches for common top-level edits before attempting complete arbitrary source-preserving round-trips.

See [`docs/RELEASE_NOTES_NEXT.md`](RELEASE_NOTES_NEXT.md) for the release-note draft.

### P0: release foundations

1. **Done (v0 foundation)**: Host-provided time (no Loomlet time sync)
   - Loomlet does not own the clock or call afjk.jp directly.
   - Loomlet evaluates against `env.time`, `env.deltaTime`, and host-provided time values.
   - Scene Sync live rooms may provide time as the host clock (synchronized or not by the host).
   - Scene Sync Export / standalone playback can provide a local playback clock instead.
   - Self-hosted or compatible Scene Sync live hosts can provide their own clock.

2. **Done (v0 foundation)**: Event envelope v0
   - Minimal event envelope semantics are documented for committed environment events.
   - The envelope covers `id`, `channel`, `timestamp`, `source`, `target`, and `payload` where applicable.
   - `event.timestamp` uses graph-local elapsed time semantics.
   - Local feedback and committed shared events remain separate concepts.
   - `onEvent` / `sendEvent` semantics are covered by fixtures and REPL playground workflows.

3. **Done (v1 semantic foundation)**: Canonical DSL round-trip v1
   - Semantic equivalence is stabilized for `Graph -> Canonical DSL -> Graph`.
   - Generated DSL is parseable and compiles back to a semantically equivalent graph.
   - Exact preservation of original formatting, comments, pipe style, import order, or named-vs-positional style is not guaranteed.
   - Editor Studio additionally applies safe source-preserving patches for common top-level Node Editor edits, falling back to canonical DSL when patching would be ambiguous.
   - This is still not a complete arbitrary source-preserving editor round-trip.

4. **Done (v0 compatibility foundation)**: Scene Sync Export v0 compatibility
   - Exported scenes do not require the afjk.jp presence server at runtime.
   - Export playback uses a host-provided local clock by default.
   - Live Scene Sync, self-hosted Scene Sync, and exported standalone playback differ by host environment, not by Loomlet graph semantics.
   - Runtime distribution policy is documented in [`docs/PORTABLE_RUNTIME_SUBSET.md`](PORTABLE_RUNTIME_SUBSET.md): Export should include its runtime bundle and remain self-contained.

### P1: high-value next-release items

1. **Done**: Scene Sync graph attach / clear / run workflow
   - ✅ [Scene Sync Workflow Guide](./SCENESYNC_WORKFLOW.md) documents scene-level vs object-level graph attachment.
   - ✅ Graph evaluation is separate from host mutation; `behavior set`, `behavior clear`, `run`, and `dev` workflows are documented.
   - ✅ CLI operations are tested and easy to use.

2. **Done (v0 foundation)**: Swizzle / component access / virtual node foundation
   - ✅ Semantic component vocabulary and coordinate-space rule are documented in [Semantic Component Access v0](./design/semantic-component-access-v0.md).
   - ✅ Current implementation scope is documented: filter predicate DSL and general expressions support semantic component access.
   - ✅ Lowering direction is implemented (`getComponent` / `swizzle`) while keeping runtime/export semantics explicit.
   - ➡️ Node Editor virtual port UI remains planned/future work.

3. **Done (v0 foundation)**: Package extension foundation stabilization
   - ✅ Trusted local package loading with explicit file path (`--package`).
   - ✅ Runtime node registration via `registerLoomletPackage()` and optional metadata registration.
   - ✅ CLI/REPL `--package` flag for loading trusted packages.
   - ✅ Docs/help integration (`:libs`, `:help`, `loomlet docs`) with package metadata.
   - ✅ Package-aware import validation against metadata targets.
   - ✅ Tests covering package registration, metadata drift, import validation, and CLI loading.
   - ➡️ **Deferred**: npm/remote loading, sandboxing, permissions, package discovery, manifest files, editor UI.
   - ➡️ See [`docs/labs/PACKAGE_SYSTEM.md`](./labs/PACKAGE_SYSTEM.md) for v0 boundaries and deferred features.

4. **Done (v0 design)**: Output conflict / single-writer warnings
   - ✅ Output target / writer vocabulary is documented in [Output Conflict Policy v0](./design/output-conflict-policy-v0.md).
   - ✅ Single-writer warning policy is warn-first and does not block experimentation.
   - ✅ Manual edit vs manual edit is delegated to the existing Scene Sync edit lock mechanism.
   - ✅ Selection is documented as local UI state; edit override and `t=0` neutral behavior are documented.
   - ✅ Base transform rebase policy is documented.
   - ✅ Conflict categories, detection timing, and warning shape are documented.
   - ➡️ **Deferred**: full conflict resolver, permission system, runtime write tracker, Scene Sync server changes.

5. **Done (v0 portable subset and runtime distribution design)**: Portable runtime subset for Scene Sync / Unity
   - ✅ Portable pure / host-adapter / JS-only categories are defined in [`docs/PORTABLE_RUNTIME_SUBSET.md`](PORTABLE_RUNTIME_SUBSET.md).
   - ✅ Scene Sync live/export expectations are documented with host-provided env/time/events and no afjk.jp clock dependency.
   - ✅ Runtime distribution policy is documented: Loomlet repo as source of truth, Scene Sync Export self-containment, vendored pinned runtime direction.
   - ✅ Current `html/assets/js/scenesync/loom/` embedded runtime is documented as transitional.
   - ✅ Unity/C# runtime remains future work; portable parity fixtures define expected behavior before implementation.
   - ✅ Safe portable node baseline, host-adapter examples, JS-only examples, parity fixture policy, and non-portable marking policy are documented.
   - ➡️ **Deferred**: Unity/C# runtime implementation, browser bundle build, Scene Sync embedded runtime replacement, CDN integration, export version metadata, deterministic random.

### P2: stretch goals / later stabilization

These remain future work and should not block the next release.

- **Future**: Function definition as subgraph
  - DSL functions should eventually lower to reusable subgraphs.
  - Function calls should become subgraph references or expanded graph fragments.
  - Node Editor should represent functions as collapsible groups or reusable graph units.
- **Partial**: DSL <-> Node Editor source-preserving round-trip
  - Safe top-level patches are available for common Node Editor operations such as param edits, renames, simple node insertion/removal, and simple edge argument edits.
  - Arbitrary source-preserving edits remain future work, especially pipe-style preservation, package-aware source edits, function/subgraph source edits, and complex cross-scope rewrites.
- **Future**: npm / remote package loading
  - Defer until trusted local packages, manifests, target compatibility, and security model are stable.
- **Future**: Package sandboxing and permissions
  - Required before untrusted package loading.
- **Future**: Package-aware Node Editor UI
  - Useful after package metadata and target compatibility are stable.
- **Future**: Real-time watch/play mode and richer event playback tooling.
- **Future**: Browser runtime bundle build and automated vendoring into Scene Sync.

### Release wording guidance

Prefer:

```text
Canonical DSL round-trip v1
DSL / Node Editor semantic round-trip foundation
Package extension foundation stabilization
Host-provided time and event foundation
Scene Sync Export self-contained playback foundation
```

Avoid:

```text
Complete DSL <-> Node Graph round-trip
General-purpose package ecosystem
Server-time-dependent Loomlet runtime
Source-preserving editor round-trip
```

## Track A: Stabilization

Purpose: make the core reliable and easier to extend.

Recommended order:

1. **Partial**: Clarify terminology
   - Core terminology is documented in `docs/SPEC.md` and related docs.
   - Continue tightening user-facing wording as features mature.
2. **Done (v0 foundation)**: Formalize behavior/event semantics
   - Behavior/event port kinds and basic connection rules are documented.
   - Event envelope, timestamp, host authority, `onEvent`, and `sendEvent` are covered by the next-release foundation.
   - Replay and richer event ordering remain future work.
3. **Partial**: Add golden tests for examples
   - Parse/compile and stabilization fixtures exist for current areas.
   - Canonical DSL round-trip v1 semantic fixtures are covered in stabilization tests.
   - Source-preserving DSL <-> Node Editor round-trip remains future work.
4. **Done**: Stabilize node definition schema
   - Current node definition schema is documented in `docs/NODE_DEFINITION_SCHEMA.md`.
   - Runtime node registry is documented in `docs/RUNTIME_NODE_REGISTRY.md`.
   - Runtime/metadata drift tests and library metadata schema tests cover conservative compatibility.
   - Metadata-only public nodes were removed; experimental nodes should stay in design docs until executable.
5. **Done**: Clarify input vs param
   - Covered by `input-param-*` stabilization fixtures.
6. **Done**: Clarify runtime registration API
   - `createNodeRegistry()`, `registerNodeType()`, and trusted local packages are available.
   - Compile/runtime can accept custom node registries.
   - Package metadata is optional but improves tooling, docs, and target validation.
   - Remote/npm package loading remains future work.
7. **Done**: Clarify metadata as shared source for editor/docs/completion
   - VS Code completion, hover, and library reference docs share generated library metadata as their default source.
   - Generated VS Code metadata is freshness-tested against shared library metadata.
8. **Partial**: Improve compatibility between JS runtime and Unity runtime where practical
   - Unity compatibility baseline is documented in `docs/UNITY_RUNTIME_COMPATIBILITY.md`.
   - Portable runtime subset and parity fixture policy are documented in `docs/PORTABLE_RUNTIME_SUBSET.md` and `docs/RUNTIME_PARITY_FIXTURES.md`.
   - Unity/C# runtime implementation remains future work.

## Track B: Labs

Purpose: try ideas without destabilizing main.

Candidate experiments:

- **Planned / Experimental**: [`labs/temporal-environment`](labs/temporal-environment.md)
  - temporal environment facts for Scene Sync / Loomlet
  - room clock and server time offset
  - pending / confirmed interaction states
  - hybrid Temporal Fact / State Sync / Local-only model
- **Planned / Experimental**: `labs/value-model`
  - vec2 / vec3 / vec4 / record / list
  - semantic `right/up/front` component access and swizzle direction
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
- **Done (v0 foundation) / Experimental**: `labs/package`
  - v0 foundation: trusted local packages, runtime registration, optional metadata, CLI/REPL integration
  - deferred: package manifest, versioning, npm/catalog support, sandboxing, permissions
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

Generated canonical DSL may use a normalized style rather than the user's original source style. v1 goals are:

- generated DSL is parseable
- generated DSL compiles back to a semantically equivalent graph
- exact text equality with the original source is not required
- comments, formatting, pipe syntax, import order, and named-vs-positional argument style are not guaranteed to be preserved
- editor layout metadata and hidden metadata exact shape are not guaranteed to be preserved

### Do not freeze yet

Avoid strict golden snapshots for areas that are still experimental or visual-only:

- complete arbitrary DSL <-> Node Editor bidirectional editing
- source patches outside supported top-level edit shapes
- full original formatting preservation
- pipe syntax preservation beyond canonical fallback cases
- named vs positional argument preservation beyond patched top-level args
- import ordering preservation
- editor layout metadata round-trip
- hidden editor metadata exact format
- arbitrary bidirectional patching between edited DSL text and existing node layout
- full function/subgraph source preservation
- package-aware source preservation
- node coordinates and visual layout
- generated canonical DSL exact text layout, unless intentionally testing canonical formatting

### Golden test levels

Use levels so tests can be added without accidentally freezing unstable behavior.

1. **Level 1: Parse fixtures — Done / ongoing**
2. **Level 2: Compile fixtures — Done / ongoing**
3. **Level 3: Graph semantic snapshots — Partial**
4. **Level 4: Canonical DSL round-trip v1 — Partial**
5. **Level 5: Editor round-trip — Future**

## Recommended next steps after this release

1. Implement Scene Sync-side Loomlet edit override / `t=0` / base rebase behavior where needed.
2. Promote general DSL semantic component access after the v0 filter-predicate form proves stable.
3. Add compile-time single-writer warnings where target paths are statically visible.
4. Add `run --events` / `--events-file` or equivalent playback tooling if it proves useful beyond REPL.
5. Plan browser runtime bundle generation and versioned vendoring into Scene Sync.
6. Continue tracking stretch goals in #212.
