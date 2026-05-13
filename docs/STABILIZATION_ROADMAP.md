# Loomlet Stabilization Roadmap

This roadmap keeps core Loomlet behavior stable while still allowing focused experiments.

## Track A: Stabilization

Purpose: make the core reliable and easier to extend.

Recommended order:

1. Clarify terminology
2. Formalize behavior/event semantics in `docs/SPEC.md`
3. Add golden tests for examples
4. Stabilize node definition schema
5. Clarify input vs param
6. Clarify runtime registration API
7. Clarify metadata as shared source for editor/docs/completion
8. Improve compatibility between JS runtime and Unity runtime where practical

## Track B: Labs

Purpose: try ideas without destabilizing main.

Candidate experiments:

- `labs/value-model`
  - vec2 / vec3 / vec4 / record / list
  - `.x`, `.xy`, `.xz` component access / swizzle
- `labs/input-slot`
  - connection value
  - local constant
  - node default
  - priority order
- `labs/node-editor-virtual-ports`
  - collapsible virtual component ports
  - implicit swizzle/get nodes
- `labs/package`
  - package manifest
  - local package loading
  - future npm/catalog support
- `labs/ui-graph`
  - UI values/events as Loomlet graph inputs/outputs
- `labs/shader-graph`
  - shader-safe subset exploration

## Promotion rule from labs to main

A lab idea can move into main only when:

- the behavior is described in `docs/SPEC.md` or a linked design doc
- runtime tests exist
- DSL or graph examples exist
- editor impact is documented
- compatibility impact is documented
