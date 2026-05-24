# Portable Runtime Subset — v0

This document defines the v0 portable subset boundary for Loomlet and the runtime distribution policy for Scene Sync and future Unity/C# runtime support.

It closes the design gap described in [afjk/loomlet#211](https://github.com/afjk/loomlet/issues/211).

See also:
- [`docs/UNITY_RUNTIME_COMPATIBILITY.md`](UNITY_RUNTIME_COMPATIBILITY.md) — per-library Unity compatibility baseline
- [`docs/RUNTIME_PARITY_FIXTURES.md`](RUNTIME_PARITY_FIXTURES.md) — data-driven portable test cases
- [`docs/RUNTIME_TARGETS.md`](RUNTIME_TARGETS.md) — target metadata overview

---

## 1. Portable subset categories

Loomlet nodes are grouped into three portability categories:

### portable pure

Deterministic graph semantics that should match across JS, Scene Sync Export, and future Unity/C# runtime.

These nodes depend only on their inputs and the host-provided environment (`env.time`, `env.deltaTime`, `env.events`). They do not call external services, access the DOM, or require a specific JavaScript runtime.

Examples: `math`, `logic`, `text`, `json`, `list` basics, `time`/`state` (when env is host-provided and deterministic), `debug`

### host-adapter

Same Loomlet-facing contract, but implementation depends on the host environment.

These nodes define a semantic boundary. The contract (inputs, outputs, evaluation semantics) is the same regardless of host, but the backing implementation differs. A `console.log` node in JS writes to stdout; in Unity it calls `Debug.Log`; in Scene Sync Export it may write to a local log buffer.

Examples: `scene`, `console`, `output`, `scenesync`, `unity`

### JS-only

Depends on JavaScript, Node.js, the browser environment, or specific JS libraries and is not expected to run in Unity/export portable contexts.

These nodes are intentionally not ported. Do not add them to portable parity fixture sets.

Examples: `fs`, `dom`, `canvas`, `three`, `random` (unless a deterministic source is introduced)

---

## 2. Scene Sync live / export expectations

Scene Sync live and Scene Sync Export should differ by host-provided environment, not by graph semantics.

### Scene Sync live

- May provide server-synchronized room time as `env.time` / `env.deltaTime`.
- May provide committed shared events via `env.events`.
- Requires the afjk.jp presence server at runtime.

### Scene Sync Export

- Must **not** require afjk.jp server time.
- Must **not** require afjk.jp, CDN, or the presence server at runtime.
- Must provide local playback time via a host-provided clock.
- Should provide exported/local event sources where applicable.
- Must include the Loomlet runtime bundle in the exported package (see §3).

### Loomlet graph contract

The Loomlet graph evaluates against `env.time`, `env.deltaTime`, and `env.events` supplied by the host.

```
Loomlet graph:
  evaluates against env.time / env.deltaTime / env.events supplied by the host.
  must not call afjk.jp or own the clock.
```

This rule applies across all host environments. It is what makes the graph portable between Scene Sync live, Scene Sync Export, and future Unity runtime.

---

## 3. Runtime distribution policy

### Source of truth

The Loomlet repository is the source of truth for browser runtime bundles.

Scene Sync should not keep manually edited runtime copies long-term. The current embedded copy under `html/assets/js/scenesync/loom/` is **transitional** (see §3.3).

### Distribution mechanisms

- CDN delivery may be used as a distribution mechanism for demos or pinned live usage.
- Scene Sync live should load a **pinned** runtime version. Prefer vendoring the pinned runtime under afjk.jp rather than using `latest` CDN URLs.
- Scene Sync Export must include the runtime bundle in the exported package.
- Scene Sync Export must **not** depend on CDN, afjk.jp, or the presence server at runtime.
- Exported scene metadata should record the Loomlet runtime version / graph version when available.

### Recommended future layout

```text
Loomlet repo:
  dist/loomlet-scenesync-runtime.browser.js

Source-controlled / deployed afjk.jp vendor copy:
  html/assets/vendor/loomlet/<version>/loomlet-scenesync-runtime.browser.js

Scene Sync Export package:
  viewer/loomlet/loomlet-scenesync-runtime.browser.js
```

### Transitional embedded runtime

The current `html/assets/js/scenesync/loom/` files in afjk.jp are an embedded runtime copy. They should be treated as transitional until replaced by versioned vendored runtime updates following the layout above.

Scene Sync Export already includes the embedded Loomlet runtime files in exported viewer packages. This satisfies the self-containment requirement for now; the path and versioning scheme should be updated when the vendor layout is adopted.

---

## 4. Unity/C# runtime

Unity/C# runtime is **future work**.

Portable parity fixtures define expected behavior before implementation. A future Unity implementation can consume the graph JSON fixtures directly without requiring DSL compiler support. This makes parity verifiable before any Unity-specific runtime code is written.

**Important**: metadata target support (`unity: yes` in `docs/RUNTIME_TARGETS.md`) does **not** prove that a Unity runtime is implemented. It documents what *should* be portable when implementation happens.

See [`docs/UNITY_RUNTIME_COMPATIBILITY.md`](UNITY_RUNTIME_COMPATIBILITY.md) for the current compatibility baseline and porting priorities.

---

## 5. Safe portable node baseline

The following is the current safe baseline for portable contexts, consistent with `docs/UNITY_RUNTIME_COMPATIBILITY.md` and `docs/RUNTIME_TARGETS.md`.

### Portable pure (safe for Scene Sync Export, future Unity runtime, parity fixtures)

| Library | Notes |
|---|---|
| math | Pure numeric operations. Semantic equivalence is target. Exact float equality is not required. |
| logic | Conditional semantics. Truthiness rules should be documented before porting. |
| text | String conversion and processing. Encoding edge cases should be documented. |
| json | JSON parse/stringify. Number precision and special value behavior may differ slightly by host. |
| list | Basic list operations. Function-valued operations (map, filter, reduce) may be limited in some runtimes. |
| time | When env is host-provided and deterministic. Host clock semantics differ by environment; this is expected. |
| state | Explicit state nodes with discrete time steps. Host must drive evaluation steps. |
| debug | Debug inspection and tracing. Assertion behavior should be consistent across runtimes. |

### Host-adapter (same contract, different implementation)

| Library | Notes |
|---|---|
| scene | Maps to scene object adapter. Requires bridge to gameobject/transform in Unity. |
| console | Maps to host logging surface (stdout, Unity Debug.Log, etc.). |
| output | Maps to host editor output surface. |
| scenesync | Depends on Scene Sync bridge availability. Graph semantics shared; transport differs by host. |
| unity | Unity-specific adapter namespace. Reserved for future use. |

### JS-only (not portable, not expected in Unity/export)

| Library | Notes |
|---|---|
| fs | Node.js/CLI file system access only. |
| dom | Browser DOM only. |
| canvas | Browser canvas only. |
| three | Three.js only. |
| random | Non-deterministic via Math.random(). Not portable without a deterministic random source. |

---

## 6. Parity fixture policy

If a node is **portable and stable enough** to be used in Scene Sync Export or a future Unity runtime, it should have runtime parity fixture coverage.

### Fixture constraints

- Use **graph JSON**, not DSL source.
- No host-adapter nodes (scene, console, output, scenesync, unity).
- No fs, dom, canvas, three.
- No non-deterministic random.
- Use `tolerance` for floating-point results.
- Simple objects and arrays only.

### When to add fixture coverage

Add parity fixture coverage when:
- A new node is classified as `portable` in the compatibility baseline.
- An existing node's behavior is stabilized enough to pin in a cross-runtime fixture.
- A bug is fixed in a portable node and the fix should be verified across runtimes.

Fixture files live in `test/fixtures/runtime-parity/`. See [`docs/RUNTIME_PARITY_FIXTURES.md`](RUNTIME_PARITY_FIXTURES.md) for the fixture format and constraints.

---

## 7. Non-portable marking policy

Non-portable nodes should be marked via target compatibility metadata or excluded from portable target validation.

- Use `docs/UNITY_RUNTIME_COMPATIBILITY.md` as the per-library compatibility record.
- Use `docs/RUNTIME_TARGETS.md` for target-level import validation metadata.
- JS-only nodes should have `unity: no` in target metadata and should not appear in portable parity fixtures.
- Host-adapter nodes should have `unity: yes` (or `partial`) in target metadata but should not appear in portable parity fixtures either — their behavior is verified via integration tests with the adapter bridge, not via portable fixtures.

Runtime-specific experiments are allowed if clearly marked as `js-only` or `experimental` in metadata and documentation.

---

## 8. Deferred work

The following items are **explicitly out of scope** for this v0 design document. They are deferred to future work:

- Unity/C# runtime implementation
- Unity DSL compiler
- Browser runtime bundle build implementation (e.g., `dist/loomlet-scenesync-runtime.browser.js`)
- Replacing the Scene Sync embedded runtime copy (`html/assets/js/scenesync/loom/`)
- CDN URL integration for live runtime delivery
- Export package structure changes (adopting the recommended vendor layout)
- Export runtime version metadata implementation
- Full floating-point equivalence across JS and Unity
- DOM/canvas/three support in Unity
- Deterministic random
- Scene Sync server changes
- Portable permissions/sandbox model
- Full host adapter parity verification
