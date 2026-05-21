# Semantic Coordinate System

## Overview

Scene Sync / Loomlet spans multiple runtime environments including Web, Unity, glTF, and XR platforms.
When expressing positions and rotations in public APIs, Loomlet avoids exposing engine-specific axes like `x`, `y`, and `z` directly.
Instead, Loomlet uses **semantic axes** that are meaningful across all platforms:

```
right  = rightward direction
up     = upward direction  
front  = forward direction
```

The host runtime is responsible for mapping these semantic axes to its native coordinate system.

### Space qualification

Semantic axes may be interpreted in different coordinate spaces such as world space or object-local space.
This document focuses on the axis vocabulary and semantic meaning;
exact space qualification (e.g., "is this world-up or local-up?") is typically determined by the context of the operation or defined in follow-up design specifications.

## Motivation

Different engines have different coordinate system conventions:

- Web / Three.js: typically +X (right), +Y (up), +Z (back)
- Unity: typically +X (right), +Y (up), +Z (forward)
- glTF: typically +X (right), +Y (up), +Z (back)
- XR platforms: vary in convention

This difference causes several problems when expressing transforms without semantic abstraction:

1. **Position mismatch**: A scene looks correct in one environment but offset in another
2. **Rotation axis confusion**: `rotation.z` means something different across platforms
3. **Orientation flip**: "forward" or "front" points in different directions
4. **Planar surface ambiguity**: Wall clocks, UI panels, signage, images, and videos may appear upside-down or mirrored in different environments
5. **Hand mismatch**: Left-handed vs. right-handed coordinate systems

## Core Principle

The public interface of Scene Sync / Loomlet **does not assume engine-specific axes**.
Instead, it expresses transforms using semantic meaning that is stable across all runtime environments.

Semantic axes are a **public expression layer**, not a replacement for native engine coordinates.
Internally, hosts continue to use their native coordinate systems and internal APIs; semantic axes only affect how Loomlet graphs express and communicate transforms.

Host runtimes translate semantic axes to native axes:

```
Semantic Axes (public API)
    ↓ (host responsibility)
Native Axes (engine-specific)
```

## Position

### Semantic Vector3

A position in Scene Sync / Loomlet is expressed as a semantic vector with three components:

```ts
type SemanticVector3 = {
  right: number;  // horizontal displacement in the right direction
  up: number;     // vertical displacement in the up direction
  front: number;  // depth displacement in the forward direction
}
```

### Example: Loomlet

```loomlet
object.position.right = 1.0;
object.position.up = 1.5;
object.position.front = 0.0;
```

This unambiguously expresses "move 1.0 units right and 1.5 units up" regardless of the host runtime.

### Host Mapping

Each host runtime defines how semantic axes map to native axes.

The exact mapping depends on the host environment, asset format, importer, and export pipeline.
Different platforms and frameworks may define their mappings differently.

Example mappings (not prescriptive):

```
Web (Three.js):
  right → +X
  up    → +Y
  front → -Z

Unity:
  right → +X
  up    → +Y
  front → +Z
```

The host is responsible for establishing and maintaining these mappings; the Loomlet graph does not need to know about specific coordinate conventions.

## Rotation

### Semantic Rotation

Rather than assuming Euler angles around `x`, `y`, and `z`, rotations in Scene Sync / Loomlet use **axis-angle notation** with semantic axes:

```ts
type SemanticAxis = "right" | "up" | "front";

type SemanticRotation = {
  kind: "axis-angle";
  axis: SemanticAxis;
  angleDeg: number;  // rotation angle in degrees
}
```

This expresses "rotate by N degrees around axis A" without assuming an engine-specific rotation order or convention.

### Example: Loomlet

Instead of:

```loomlet
// ❌ Avoid: engine-specific axis notation
secondHand.rotation.z = second * 6;
```

Use:

```loomlet
// ✅ Preferred: semantic axis
secondHand.rotation = rotateAround("front", second * 6);
```

The host interprets this as "rotate the object by (second * 6) degrees around the `front` axis."

## Wall Clock Example

A wall clock demonstrates the semantic coordinate system principle.

### Scene structure

A wall clock has:
- A clock face (flat plane)
- Hour hand, minute hand, second hand (rotating around the clock center)
- Possibly a bezel or 3D geometry

### Typical Loomlet graph behavior

```loomlet
// Clock face orientation is defined by object placement (host/asset responsibility)
// Hands rotate around the clock's local front axis

hourHand.rotation = rotateAround("front", (hour % 12) * 30);
minuteHand.rotation = rotateAround("front", minute * 6);
secondHand.rotation = rotateAround("front", second * 6);
```

In this example, each hand rotates around the `front` axis of its local coordinate space.
The clock face's orientation in the scene is a separate concern handled by object placement or asset definition, not by Loomlet transforms.

### Host responsibility

The host runtime does NOT need to:

- Know what a "clock" is
- Know what a "second hand" is
- Understand the real-time progression of time
- Apply any domain-specific logic

The host ONLY needs to:

1. Receive `clockFace.position` with semantic axes
2. Map it to native coordinates
3. Receive `hourHand.rotation` with `front` axis and angle
4. Map the rotation to a native rotation representation
5. Apply the result to the scene

If the host is running in a left-handed coordinate system where `front = -Z`, the host automatically maps `rotateAround("front", 30)` to the correct native rotation. The Loomlet graph remains unchanged.

## Host Responsibility

Hosts are responsible for translating semantic axes and rotations to native representations.

### Position Translation

```
Input:  SemanticVector3 { right, up, front }
Output: Vector3 (native coordinates)

Example (Unity):
  native.x = semantic.right
  native.y = semantic.up
  native.z = semantic.front
```

### Rotation Translation

```
Input:  SemanticRotation { axis: "up", angleDeg: 45 }
Output: Quaternion or Matrix4 (native rotation)

Example (Unity):
  axis_vector = Vector3.up          // map "up" to +Y
  quaternion = Quaternion.AngleAxis(45, axis_vector)
```

### Multiple Axis Support

All semantic axes must be supported:

- `rotateAround("right", angle)` — rotation around the rightward axis
- `rotateAround("up", angle)` — rotation around the upward axis
- `rotateAround("front", angle)` — rotation around the forward axis

## Non-goals

This design does NOT require:

- **Host domain knowledge**: The host does not need to understand "wall clocks," "analog hands," "digital displays," or any domain-specific concept.
- **High-level object types**: Scene Sync / Loomlet does not define a `WallClock` primitive or `SecondHand` node type.
- **Host-specific optimizations**: The host does not need special handling for specific use cases.
- **Runtime semantic validation**: The host does not validate whether a rotation "makes sense" for a given object.

The host's job is purely mechanical: translate semantic axes to native axes.

## Relationship with SPEC

After implementation and testing stabilize, this design note should be promoted or summarized in `/docs/SPEC.md` as the definitive guide for public coordinate expression in Scene Sync / Loomlet.
