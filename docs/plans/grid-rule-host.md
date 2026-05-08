# Grid Rule Host Plan

This is a deferred design note for adding grid-based, emergent programming experiments to Loomlet.

The goal is to make it possible to write a small rule once and let a host apply it across many cells, enabling cellular automata, maze experiments, particle-like behavior, and other complex systems without adding mutable state to the Loomlet core.

## Motivation

The VS Code Runtime Preview already supports playful input/output examples such as mouse following, mouse painting, and key visualization. The next step is to make Loomlet feel like a small laboratory for emergent behavior.

The desired authoring style is:

- The user writes logic for one cell.
- The host applies the same logic to every cell in a grid.
- Each cell can read its own value and neighboring values from the previous frame.
- Each cell writes its next value/color to the next frame.
- The result is committed as a batch after the frame finishes.

This allows examples like Conway's Game of Life, diffusion-like patterns, maze growth, or simple agent fields while keeping the Loomlet graph itself mostly pure.

## Core Principle

Do not make Loomlet own mutable grid state.

Instead:

```text
Loomlet graph:
  describes a rule
  reads host-provided cell inputs
  emits next-cell outputs/effects

Grid host:
  owns grid state
  provides previous-frame snapshot values as inputs
  evaluates the rule for each cell
  batch-applies writes to the next buffer
  renders the grid
```

This keeps stateful concerns inside the host/runtime environment and avoids introducing general mutable state into the language too early.

## Mental Model

A grid rule program is written as if it is running for a single current cell.

The host supplies implicit per-cell inputs:

```text
cell.x
cell.y
cell.value
neighbor values
frame/time values
pointer/key inputs when available
```

The same graph is evaluated repeatedly by the host:

```text
for each cell in grid snapshot:
  bind current cell context
  evaluate Loomlet graph
  collect writes into next buffer
commit next buffer
render grid
```

The user does not write loops. The host is the iterator.

## Snapshot / Double Buffer Rule

Grid reads and writes must be deterministic and order-independent.

Recommended rule:

```text
grid.self / grid.get / grid.countNeighbors
  read from the frame-start snapshot

grid.write / grid.set
  write to a next buffer

frame end
  commit next buffer as the new current state
```

Within a single frame, reads never see writes from the same frame.

This is important for cellular automata and complex systems because otherwise results depend on evaluation order.

## Initial API Sketch

Names are intentionally provisional.

### Grid declaration / rendering

```loom
render grid(
  id: "life",
  cols: 64,
  rows: 64,
  cellSize: 10
)
```

The host creates or displays a named grid.

### Reading values

```loom
alive = grid.self("life")
left = grid.get("life", dx: -1, dy: 0)
right = grid.get("life", dx: 1, dy: 0)
neighbors = grid.countNeighbors("life")
```

Open question: whether `grid.get` should use `dx/dy` offsets by default, or absolute `x/y` coordinates.

For rule execution, relative offsets are usually friendlier.

### Writing values

```loom
grid.write(id: "life", value: next)
```

The write targets the current cell in the next buffer.

A lower-level absolute form may also be useful for painting/editing tools:

```loom
grid.set(id: "paint", x: gx, y: gy, value: 1, color: "#ff70a6", enabled: down)
```

### Logic helpers

A minimal logic/select library may be needed:

```loom
isDead = eq(alive, 0)
isAlive = eq(alive, 1)
born = and(isDead, eq(neighbors, 3))
survive = and(isAlive, or(eq(neighbors, 2), eq(neighbors, 3)))
next = select(or(born, survive), 1, 0)
```

`select(condition, thenValue, elseValue)` may fit Loomlet better than introducing statement-like `if` syntax.

## Example: Life Rule Sketch

```loom
import grid
import logic

alive = grid.self("life")
neighbors = grid.countNeighbors("life")

born = logic.and(logic.eq(alive, 0), logic.eq(neighbors, 3))
survive = logic.and(
  logic.eq(alive, 1),
  logic.or(logic.eq(neighbors, 2), logic.eq(neighbors, 3))
)

next = logic.select(logic.or(born, survive), 1, 0)

grid.write(id: "life", value: next)
render grid(id: "life", cols: 64, rows: 64, cellSize: 10)
```

This program describes one cell. The host applies it to every cell.

## Multiple Grids

Multiple grids should be supported by `id`.

Possible uses:

- main simulation grid
- minimap/debug grid
- obstacle map
- paint/input grid
- scalar field plus color output grid

Sketch:

```loom
terrain = grid.get("terrain", dx: 0, dy: 0)
heat = grid.get("heat", dx: 0, dy: 0)

nextHeat = computeNextHeat(heat, terrain)

grid.write(id: "heat", value: nextHeat)
render grid(id: "heat", cols: 64, rows: 64, cellSize: 10)
```

## Mouse Editing vs Rule Simulation

There are two related but different modes:

### 1. Paint/edit mode

Used to set up initial conditions.

```loom
x = input.mouseX()
y = input.mouseY()
down = input.mouseDown()

gx = grid.toCellX("life", x)
gy = grid.toCellY("life", y)

grid.set(id: "life", x: gx, y: gy, value: 1, enabled: down)
render grid(id: "life", cols: 64, rows: 64, cellSize: 10)
```

### 2. Rule mode

Used to advance the simulation by applying the same rule to all cells.

```loom
alive = grid.self("life")
neighbors = grid.countNeighbors("life")
next = ...
grid.write(id: "life", value: next)
```

Open question: whether VS Code Preview should allow switching between these modes from the toolbar, or whether they should be separate examples/files.

## Proposed Implementation Phases

### Phase 1: Planning and contract only

- Keep this document as the design note.
- Do not implement grid runtime yet.
- Use this to guide later implementation instructions.

### Phase 2: Minimal VS Code Preview grid state

Scope:

- Host-owned named grid state in the VS Code WebView.
- Reset clears grid state.
- `render grid(...)` draws one named grid.
- Simple value-to-color mapping.
- A direct paint example using mouse input and `grid.set`.

Suggested first example:

```loom
# Mouse Grid Paint
import input
import grid

x = input.mouseX()
y = input.mouseY()
down = input.mouseDown()

gx = grid.toCellX("paint", x)
gy = grid.toCellY("paint", y)

grid.set(id: "paint", x: gx, y: gy, value: 1, color: "#70d6ff", enabled: down)
render grid(id: "paint", cols: 64, rows: 64, cellSize: 10)
```

### Phase 3: Rule host mode

Scope:

- Evaluate the same graph once per cell.
- Provide per-cell context to `grid.self`, `grid.get`, and `grid.countNeighbors`.
- Collect `grid.write` outputs in next buffer.
- Commit after evaluating all cells.

Suggested first rule examples:

- Conway's Game of Life
- one-dimensional ripple/diffusion-like rule
- simple maze growth rule

### Phase 4: Multiple grids and overlays

Scope:

- Multiple named grids.
- Grid origin/scale/layout parameters.
- Optional overlay/debug rendering.
- Potential minimap pattern.

### Phase 5: Shared host contract

After the VS Code Preview version proves useful, promote stable pieces into a shared host capability contract.

Candidate contract areas:

- `grid.*` read APIs
- `grid.*` write/effect APIs
- double-buffer timing
- value/color representation
- reset/seed behavior
- serialization/export behavior

## Open Questions

1. Should `grid.get` default to relative offsets (`dx/dy`) or absolute coordinates (`x/y`)?
2. Should `grid.self(id)` be shorthand for `grid.get(id, dx: 0, dy: 0)`?
3. Should colors be stored in grid state, or derived from numeric values at render time?
4. Should `grid.write` write only `value`, or also `color`?
5. How should multiple writes to the same cell in the same frame resolve?
   - last writer wins
   - max priority wins
   - blend/combine function
6. How should initial state be created?
   - mouse paint
   - random seed host command
   - example metadata
   - serialized grid state
7. Should the rule run every animation frame, or only when the user presses Step/Run?
8. Should large grids run on the main WebView thread initially, or move to a Worker later?

## Non-goals for the first implementation

- No general mutable variables in Loomlet.
- No full game engine.
- No GPU/shader implementation yet.
- No Scene Sync synchronization of grid state yet.
- No persistent save format until the runtime model feels right.

## Why this matters

This keeps Loomlet approachable while opening a path toward complex, emergent programming.

The user can start with direct manipulation:

```text
move mouse -> paint cells
```

Then discover rule-based behavior:

```text
each cell reads neighbors -> decides next state
```

That progression can make programming feel playful without forcing users to start with loops, classes, or state management.
