# Unity Runtime Compatibility

This document defines the current compatibility baseline between the JavaScript Loomlet runtime and a future Unity runtime.

**It does not mean a Unity runtime is fully implemented yet.**

It defines which node semantics should be preserved when Unity support is implemented. This baseline makes future Unity implementation decisions explicit, enables early metadata consistency testing, and guides porting priorities.

## Compatibility levels

- **portable**
  - Pure or deterministic behavior that should match JS and Unity as closely as practical.
  - Examples: math, logic, text, json, list basics.
  - These libraries should work the same way on any target.

- **host-adapter**
  - Behavior depends on the host environment but should expose the same Loomlet-facing contract.
  - Examples: scene, console, output, scenesync.
  - These libraries define semantic boundaries; implementations vary by host.

- **js-only**
  - Depends on JS/Node/Web APIs and should not be expected to work in Unity.
  - Examples: fs, dom, canvas, three, random if non-deterministic behavior is not stabilized.
  - These libraries are intentionally not ported.

- **future**
  - Target exists as a placeholder, but behavior is not implemented or not yet specified.
  - Examples: the `unity` adapter namespace itself.
  - These are reserved for future expansion.

## Current baseline

| Library | Unity target | Compatibility level | Notes |
|---|---:|---|---|
| math | yes | portable | Numeric behavior should match JS where practical. Core functions: add, subtract, multiply, divide, sine, cosine, etc. |
| logic | yes | portable | Truthiness semantics need explicit definition before Unity implementation. Core functions: not, and, or, equals, select, etc. |
| list | yes | portable | Basic list operations should be deterministic. Function-valued operations (map, filter, reduce) may be limited. |
| text | yes | portable | String conversion rules should be documented before porting. Functions: upper, lower, trim, split, join, etc. |
| json | yes | portable | JSON parse/stringify behavior may differ slightly by host due to number precision and special value handling. |
| time | yes | portable | Time/clock sources should be deterministic and measurable within both runtimes. |
| state | yes | portable | Explicit state nodes with discrete time steps should work similarly on both runtimes. |
| console | yes | host-adapter | Maps to Unity Debug logging; signature and output format may vary. |
| output | yes | host-adapter | Maps to host editor output surface (editor console in Unity). |
| scene | yes | host-adapter | Maps to Unity scene object adapter; requires a bridge to gameobject/transform hierarchy. |
| unity | yes | future | Unity-specific adapter namespace; not yet implemented. Reserved for future use. |
| scenesync | partial | host-adapter | Depends on Scene Sync bridge availability. Both JS and Unity versions share graph semantics but may differ in message transport. |
| debug | yes | portable | Debug inspection and tracing should be portable; assertion behavior consistent across runtimes. |
| random | no | js-only | Non-deterministic random value generation via Math.random(). Not portable without deterministic random source. |
| fs | no | js-only | Node.js/CLI file system access only. Not applicable to Unity runtime. |
| dom | no | js-only | Browser DOM only. Not applicable to Unity runtime. |
| canvas | no | js-only | Browser canvas only. Not applicable to Unity runtime. |
| three | no | js-only | Three.js only. Not applicable to Unity runtime. |

## Porting priorities

When implementing Unity support, prioritize in this order:

1. Pure numeric/math nodes (portable foundation)
2. Logic nodes (conditional semantics)
3. Text/json nodes (data processing)
4. Time/state nodes (temporal semantics)
5. Basic list nodes (array/collection operations)
6. List function-valued operations (map, filter, reduce if supported)
7. Debug nodes (inspection, assertions)
8. Scene adapter nodes (3D transforms)
9. Console/output adapter nodes (logging)
10. Scene Sync bridge nodes (multiplayer integration)
11. Unity-specific adapter nodes (future expansion)

## Explicit non-goals

- **Floating-point equivalence**: Do not require exact floating-point equality for every math edge case. Target semantic equivalence within typical numerical tolerances.
- **DOM/Canvas/Three**: Do not implement DOM, canvas, or Three.js in Unity. Keep these as js-only.
- **Node.js fs**: Do not guarantee Node.js `fs` behavior in Unity. File I/O should use Unity-native APIs if needed.
- **Metadata as proof**: Do not treat metadata target support as proof that Unity runtime implementation exists. This document defines what *should* be portable, not what *is* implemented.
- **Deterministic non-determinism**: Do not require non-deterministic libraries (random) to behave the same. If deterministic random is needed, that's a separate feature, not part of baseline compatibility.

## Constraints and assumptions

- **Host environment differences**: Unity and JavaScript runtimes will have different garbage collection, number representation (doubles vs floats in some cases), and library availability. Portable code should account for these.
- **Function-valued operations**: Functional programming constructs (list.map, list.filter, list.reduce) may have limitations in some Unity/C# contexts. The baseline assumes they work but reserves the right to document special cases.
- **Numeric precision**: JSON number parsing and math edge cases may differ between JavaScript and Unity. Portable code should avoid brittle floating-point assertions.
- **Error handling**: Both runtimes should support assertions and trace/debug operations, but error propagation models may differ. The baseline captures present behavior only.

## Reference

See also:
- `docs/RUNTIME_TARGETS.md` - Overview of runtime target metadata
- `src/toolchain/runtime-targets.js` - Current LIBRARY_COMPATIBILITY definitions
- `src/toolchain/library-metadata.js` - Per-library function documentation
- `test/unity-runtime-compatibility.test.mjs` - Automated compatibility checks
