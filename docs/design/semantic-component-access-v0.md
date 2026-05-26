# Semantic Component Access v0

## Purpose

This note documents the current v0 foundation for semantic component access in support of afjk/loomlet#208 and afjk/loomlet#256.
It focuses on predicate DSL behavior, general DSL expression access, and the explicit lowering model, while deferring broader value-model/editor work.

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

Filter predicate DSL field access on `value` supports:

- `value.right`
- `value.up`
- `value.front`
- `value.r`
- `value.u`
- `value.f`

This behavior is implemented in `RestrictedDSLEvaluator` and covered by tests in `test/stdlib-baseline.test.mjs`.
For predicate compatibility, `value.x` / `value.y` are still accepted internally today, but they are not the preferred semantic public vocabulary for this v0 direction.

General DSL expressions also support single-component access:

- `expr.right`
- `expr.up`
- `expr.front`
- `expr.r`
- `expr.u`
- `expr.f`

These expressions lower to explicit `getComponent` graph nodes with a normalized `component` parameter.

Multi-component swizzles lower to explicit `swizzle` graph nodes with normalized
`components` parameters:

- `expr.ru`
- `expr.rf`
- `expr.uf`
- `expr.ruf`

Swizzles return arrays preserving requested order:

- `expr.rf` returns `[right, front]`
- `expr.ruf` returns `[right, up, front]`

Repeated components such as `expr.rr` are rejected in this v0 scope.

## Virtual node / lowering model

Component access and swizzle are authoring conveniences.
Runtime graph semantics should remain explicit (or be normalizable to explicit nodes).

Intended lowering model:

- `v.right` → `getComponent(v, "right")`
- `v.r` → `getComponent(v, "right")`
- `v.ru` → `swizzle(v, ["right", "up"])`

Node Editor may eventually expose virtual component ports, but compiled/exported graphs must preserve explicit semantics.

## Swizzle v0

Supported semantic shorthand:

- `v.r`
- `v.u`
- `v.f`
- `v.ru`
- `v.rf`
- `v.uf`
- `v.ruf`

The runtime return shape is an array. Two components produce a 2-item array, and
three components produce a 3-item array.

## Explicitly deferred

- Node Editor virtual port UI
- Automatic world/local conversion
- Matrix/quaternion transform integration
- Host-specific `+Z/-Z` mapping in Loomlet core
- Full coordinate-space type system
