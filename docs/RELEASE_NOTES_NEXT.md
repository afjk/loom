# Release Notes Draft — Next Loomlet Release

This draft summarizes the next Loomlet release focused on the shared time and event foundation for Loomlet, Scene Sync, export workflows, and future portable runtimes.

## Theme

```text
Scene Sync / Loomlet shared time and event foundation
```

This release makes Loomlet more usable as a host-integrated behavior system while keeping Scene Sync Export independent from afjk.jp infrastructure at runtime.

## Highlights

### Host-provided time and event foundation

Loomlet graphs now have a clearer host boundary for time and events.

- Loomlet evaluates against host-provided environment values.
- `env.time`, `env.deltaTime`, and `env.events` are owned by the host, not by Loomlet itself.
- Scene Sync live may provide synchronized live room time and committed shared events.
- Scene Sync Export uses local playback time and remains independent from afjk.jp, CDN, and the presence server at runtime.
- Self-hosted or compatible Scene Sync live hosts can provide their own synchronized clock.

### Event system and REPL playground

The event model has been clarified and made easier to try from the REPL.

- Event envelope v0 is documented.
- `onEvent` and `sendEvent` semantics are stabilized for the current foundation.
- `event.timestamp` uses graph-local elapsed time semantics.
- REPL playground commands support event and time experiments:
  - `:event`
  - `:key`
  - `:time`
  - `:tick`
  - `:scope`
  - `:set`
- `input(name, defaultValue)` and persistent evaluation state make `risingEdge` / `fallingEdge` examples easier to test.

### Canonical DSL round-trip v1

Canonical DSL round-trip v1 is now defined as a semantic round-trip boundary.

```text
Graph -> Canonical DSL -> Graph
```

This means generated DSL should be parseable and compile back to a semantically equivalent graph.

This is **not** a full source-preserving editor round-trip. The following remain future work:

- comments
- original formatting
- pipe style
- import order
- named-vs-positional authoring style
- exact editor layout metadata
- hidden metadata exact shape

### Scene Sync workflow

Scene Sync CLI workflow wording is now clearer.

- `scenesync run` is a one-shot scene command workflow.
- `behavior set` attaches a persistent behavior graph.
- `behavior clear` clears a persistent behavior graph.
- `dev` is an iterative behavior graph update workflow.
- Scene-level and object-level graph attachment are documented separately.

### Semantic component access foundation

The semantic axis vocabulary is now documented.

- `right`, `up`, and `front` are the public semantic axis names.
- `r`, `u`, and `f` are short aliases.
- The current v0 implementation is limited to filter predicate DSL component access, such as `value.right`, `value.up`, and `value.front`.
- General expression component access and multi-component swizzle remain future work.

### Package extension foundation

Trusted local package extension support has a stable v0 boundary.

- Packages can be loaded explicitly with `--package <path>`.
- Runtime nodes can be registered through `registerLoomletPackage()`.
- Package metadata registration is optional but useful for docs, help, and target validation.
- CLI / REPL / docs help integration is available for package metadata.
- Package-aware import validation is supported.

Deferred:

- npm loading
- remote URL / CDN loading
- untrusted package loading
- sandboxing and permissions
- package discovery / catalog
- dependency resolution
- richer editor UI

### Output conflict / single-writer policy

The v0 design for output conflicts is documented.

- Output target and writer vocabulary is defined.
- The v0 policy is warning-first rather than blocking experimentation.
- Manual edit vs manual edit is handled by Scene Sync's existing edit lock mechanism.
- Selection is local UI state, not an authoritative shared lock.
- Local edit override and `t=0` neutral behavior are documented.
- Base transform rebase policy is documented.

Deferred:

- full conflict resolver
- permission system
- runtime write tracker
- Scene Sync server changes

### Portable runtime subset and distribution policy

The portable runtime boundary is now documented for Scene Sync Export and future Unity/C# runtime support.

- Node categories are documented:
  - portable pure
  - host-adapter
  - JS-only
- Loomlet evaluates against host-provided env/time/events.
- Loomlet must not call afjk.jp or own the clock.
- Scene Sync Export must include the runtime bundle and remain self-contained.
- The current Scene Sync embedded Loomlet runtime copy is treated as transitional.
- The Loomlet repository is the source of truth for future browser runtime bundles.
- Unity/C# runtime remains future work.
- Portable parity fixture policy and non-portable marking policy are documented.

## Deferred / experimental work

The following are intentionally not part of the stable next-release promise:

- full source-preserving DSL <-> Node Editor round-trip
- general expression component access
- multi-component swizzle
- function definition as subgraph
- npm / remote package loading
- package sandboxing and permissions
- Unity/C# runtime implementation
- browser runtime bundle build and vendoring automation
- full conflict resolver
- real-time watch/play mode
- richer event replay tooling
- deterministic random
- Scene Sync embedded runtime replacement

## Suggested release wording

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
Source-preserving editor round-trip
General-purpose package ecosystem
Server-time-dependent Loomlet runtime
Runtime dependency on afjk.jp for exported scenes
```
