# Loomlet DSL — AI Authoring Guide

This document is the compact context an AI assistant should use when translating natural-language requests into valid Loomlet DSL (`.loom`).

The important rule is simple: **generate `.loom` source, not graph JSON**. Graph JSON is produced by the Loomlet compiler and then sent to hosts such as Scene Sync.

---

## 1. Mental model

Loomlet is a small dataflow language.

- Each assignment becomes a node.
- Identifier references become edges.
- Literals become node parameters.
- Side effects happen only in `render` directives or sink calls such as `scene.setPosition(...)`.

```loom
import math

t = clock()
wave = math.sine(t, freq: 0.3)
x = map(wave, inMin: -1, inMax: 1, outMin: 100, outMax: 700)

render point(x: x, y: 240, color: "#00ffcc", trail: 0.05)
```

---

## 2. Pick one target

Choose exactly one runtime target for each answer.

| Target | Use when the user wants |
|---|---|
| `web` | a 2D Canvas/editor demo |
| `scenesync` | an existing 3D Scene Sync object to move, rotate, scale, recolor, or hide/show |
| `unity` | future Unity-hosted behavior graphs |
| `cli` | text/JSON transformation, logging, or dry-run inspection |

Never mix `render` and `scene.set*` in one program.

---

## 3. Scene Sync terminology

Scene Sync has two integration paths:

- **Scene Command**: a one-shot operation that immediately changes Scene Sync scene state, such as `scene-delta`, `scene-add`, or `scene-remove`.
- **Behavior Graph**: a persistent graph definition that is evaluated continuously by each Scene Sync client, managed through `scene-graph-set` and `scene-graph-clear`.

For Loomlet AI authoring, generated `.loom` programs that animate or continuously drive existing Scene Sync objects are compiled into **Behavior Graphs**.

Do not use Loomlet to generate per-frame Scene Commands for continuous animation. Send the Behavior Graph definition once and let Scene Sync clients evaluate it locally.

---

## 4. Syntax rules

- Put all `import` statements at the top.
- Use one assignment per line: `id = call(...)`.
- The first argument may be positional. Arguments after the first must be named.
- `math.add` and `math.multiply` may use all positional arguments or all named arguments, but do not mix them.
- Use `|>` for left-to-right pipelines. The piped value becomes the first argument of the next call.
- Do not invent nodes that are not listed in this guide.

```loom
# OK
wave = math.sine(t, freq: 0.3)

# Error: second argument needs a name
wave = math.sine(t, 0.3)

# OK
sum = math.add(a, b)
sum2 = math.add(a: a, b: b)

# Error: mixed positional and named arguments for add
sum3 = math.add(a, b: b)
```

---

## 5. Implemented node set for AI generation

### core / time

- `clock() -> t` — local seconds since engine start.
- `time.serverClock() -> t` — synchronized Scene Sync room clock. Prefer this for shared Scene Sync behavior.
- `constant(value: number|string|bool) -> out` — fixed value.

### math

Use these for generated examples:

- `math.sine(t, freq: number, amplitude?: number, offset?: number) -> out`
- `math.cosine(t, freq: number, amplitude?: number, offset?: number) -> out`
- `math.add(a, b) -> out`
- `math.multiply(a, b) -> out`
- `map(value, inMin: number, inMax: number, outMin: number, outMax: number, clamp?: bool) -> out`

The broader DSL also supports more math nodes, but AI-authored Scene Sync snippets should stay small and conservative.

### state

- `smoothLerp(value, rate: number, initial?: number) -> out`
- `lowpass(value, tau: number, initial?: number) -> out`
- `integrate(value, min?: number, max?: number, initial?: number) -> out`
- `delay1(value) -> out`

When using state nodes, briefly explain why explicit state is needed.

### text / json / console

For CLI or dry-run examples:

- `text.upper(s) -> out`
- `text.lower(s) -> out`
- `text.trim(s) -> out`
- `text.concat(a, b: string) -> out`
- `text.stringify(x) -> out`
- `json.parse(s) -> out`
- `json.stringify(x) -> out`
- `console.log(value)`
- `console.warn(value)`
- `console.error(value)`

### render for web previews

`render` is a Canvas-preview directive, not a Scene Sync operation. Use only one `render` per file.

- `render point(x: number, y: number, color?: string, trail?: number)`
- `render bar(width: number, color?: string, height?: number, y?: number)`

Do not emit `render circle`, `render rect`, `render text`, `render image`, or `render model`.

### scene sinks for Scene Sync

These operate on existing Scene Sync objects. Loomlet does not create or delete objects.

- `scene.setPosition(objectId: string, x: number, y: number, z: number)`
- `scene.setRotation(objectId: string, x: number, y: number, z: number)`
- `scene.setScale(objectId: string, x: number, y: number, z: number)`
- `scene.setColor(objectId: string, r: number, g: number, b: number)`
- `scene.setVisible(objectId: string, visible: bool)`

For the Scene Sync target, these sink calls are authored as part of a Behavior Graph. `scene.setRotation` uses **Euler radians** because Scene Sync currently applies rotation with Three.js `rotation.set(x, y, z)`. Do not generate quaternion `w` for Scene Sync authoring.

The object id may be positional:

```loom
scene.setPosition("sample-cube", x: 0, y: 1, z: 0)
```

---

## 6. Common patterns

### 6.1 Web Lissajous preview

```loom
import math

t = clock()
x = math.sine(t, freq: 0.3) |> map(inMin: -1, inMax: 1, outMin: 100, outMax: 700)
y = math.cosine(t, freq: 0.5) |> map(inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: x, y: y, color: "#00ff00", trail: 0.05)
```

### 6.2 Scene Sync: make an object bounce

```loom
import time
import math
import scene

t = time.serverClock()
y = math.sine(t, freq: 0.6, amplitude: 0.4, offset: 1.2)

scene.setPosition("sample-cube", x: 0, y: y, z: 0)
```

### 6.3 Scene Sync: rotate around Y

```loom
import time
import math
import scene

t = time.serverClock()
y = math.multiply(t, 1.5)

scene.setRotation("sample-cube", x: 0, y: y, z: 0)
```

### 6.4 Scene Sync: pulse scale

```loom
import time
import math
import scene

t = time.serverClock()
s = math.sine(t, freq: 0.7, amplitude: 0.25, offset: 1)

scene.setScale("sample-cube", x: s, y: s, z: s)
```

### 6.5 Scene Sync: move and recolor in one graph

```loom
import time
import math
import scene

t = time.serverClock()
x = math.sine(t, freq: 0.2, amplitude: 2, offset: 0)
g = math.sine(t, freq: 0.5, amplitude: 0.5, offset: 0.5)

scene.setPosition("sample-cube", x: x, y: 0.5, z: 0)
scene.setColor("sample-cube", r: 0, g: g, b: 1)
```

### 6.6 CLI text transform

```loom
import text
import console

greeting = constant(value: "hello loomlet")
shout = text.upper(greeting)
console.log(shout)
```

---

## 7. Scene Sync authoring rules

- Prefer `time.serverClock()` over `clock()` for shared room animations.
- Use small amplitudes first, usually `0.2` to `3.0`.
- Set fixed values for axes that are not animated.
- Keep each generated program small, typically 5–20 lines.
- If several effects should remain active on the same object, combine them in one `.loom` program. Scene Sync stores one Object Behavior Graph per object, so a later Behavior Graph replaces the previous one.
- Do not create Scene Sync objects from Loomlet. Object creation is Scene Sync's responsibility.
- Do not generate graph JSON unless explicitly asked to debug the compiler output.

---

## 8. Unsupported requests

If the user asks for one of these, do not invent nodes:

- Audio reactive behavior (`audio.level`, FFT, beat detection): offer a clock-driven approximation.
- New 2D shapes beyond `point` and `bar`: say they are not implemented yet.
- Direct DOM manipulation: wait for a DOM extension pack.
- Scene object creation/deletion: use Scene Sync tooling first, then Loomlet can control the existing object.
- Loops and general function definitions: express simple behavior with dataflow nodes instead.

---

## 9. Response format for AI assistants

When answering a natural-language request, respond with:

1. One short sentence describing the behavior.
2. The `.loom` source in a fenced `loom` code block.
3. Optional run instruction.
4. Optional clarification question if the request is ambiguous.

Example:

```loom
import time
import math
import scene

t = time.serverClock()
y = math.sine(t, freq: 0.6, amplitude: 0.4, offset: 1.2)

scene.setPosition("sample-cube", x: 0, y: y, z: 0)
```
