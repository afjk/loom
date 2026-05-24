# Semantic Component Access v0

## Purpose

This note documents the current v0 foundation for semantic component access in support of afjk/loomlet#208.
It focuses on the currently implemented predicate DSL behavior and intended lowering model, while deferring broader value-model/editor work.

## Public vocabulary (v0)

Loomlet v0 public semantic component names:

- `right`
- `up`
- `front`

Short aliases:

- `r` → `right`
- `u` → `up`
- `f` → `front`

Notes:

- `right/up/front` are the preferred user-facing semantic component names.
- `r/u/f` are equivalent shorthand aliases.
- `x/y/z` are not the preferred user-facing API for this v0 semantic foundation.
- Host adapters map semantic axes to host-native coordinates.
- Loomlet core must not hard-code Unity/Three.js coordinate conversion rules.

## Coordinate-space rule

The coordinate space comes from the value's context.

Examples:

- For a world-space vector, `right/up/front` refer to world axes.
- For a local-space vector, `right/up/front` refer to local axes.
- `self.front` means the object's own direction vector.
- `self.localPosition.front` means the local-position front component.

This v0 note defines component naming and access semantics only.
It does not introduce automatic world/local conversion in core.

## Current v0 implementation status

Current implementation is limited to filter predicate DSL field access on `value`:

- `value.right`
- `value.up`
- `value.front`
- `value.r`
- `value.u`
- `value.f`

This behavior is implemented in `RestrictedDSLEvaluator` and covered by tests in `test/stdlib-baseline.test.mjs`.
For predicate compatibility, `value.x` / `value.y` are still accepted internally today, but they are not the preferred semantic public vocabulary for this v0 direction.

General DSL expression component access is not fully implemented yet and remains future work.

## Virtual node / lowering model

Component access and swizzle are authoring conveniences.
Runtime graph semantics should remain explicit (or be normalizable to explicit nodes).

Intended lowering model:

- `v.right` → `getComponent(v, "right")`
- `v.r` → `getComponent(v, "right")`
- `v.ru` → `swizzle(v, ["right", "up"])`

Node Editor may eventually expose virtual component ports, but compiled/exported graphs must preserve explicit semantics.

## Swizzle direction (future)

Planned semantic shorthand direction:

- `v.r`
- `v.u`
- `v.f`
- `v.ru`
- `v.rf`
- `v.uf`
- `v.ruf`

Multi-component swizzle is future work unless/until implemented in runtime/compiler.

## Explicitly deferred

- General DSL expression component access
- Multi-component swizzle return shape
- Node Editor virtual port UI
- Automatic world/local conversion
- Matrix/quaternion transform integration
- Host-specific `+Z/-Z` mapping in Loomlet core
- Full coordinate-space type system
