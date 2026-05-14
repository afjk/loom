# Release Notes Draft

## Next release: 0.1.2

Tentative theme:

Package, metadata, documentation, and runtime compatibility groundwork.

## Highlights

- Runtime node registration API groundwork
- Trusted local package registration flow
- Package metadata registry
- Package import validation with custom node/metadata registries
- VS Code completion, hover, and library reference now use shared generated metadata
- Standard library reference docs are generated from shared metadata
- Generated VS Code metadata and docs are freshness-tested
- Unity runtime compatibility baseline documented
- Portable runtime parity fixtures added for future runtime reuse
- CLI/REPL library help now hides planned empty placeholder libraries by default; use `loom docs --include-planned` or REPL `:libs --all` to inspect them

## Notes

This release does not mean the Unity/C# runtime is implemented.
It establishes compatibility baseline and reusable fixtures for future implementation.

Remote/npm package loading remains future work.
