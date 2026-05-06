# Loom CLI Roadmap

## Phase 1: CLI MVP

- compile
- format
- inspect
- run pure graphs

## Phase 2: Import syntax

- minimal `import math` / `import fs` / `import scene`
- runtime target validation
- import math
- import scene
- import fs
- target compatibility validation

## Phase 3: CLI libraries

- fs.readText
- fs.writeText
- expand beyond initial `console.*`
- expand beyond initial `json.parse` / `json.stringify`
- expand beyond initial `text.upper` / `lower` / `trim` / `replace`

## Phase 4: REPL

- interactive prompt
- incremental graph patching
- inspect current graph
- watch values

## Phase 5: SceneSync integration

- compile DSL and send graph
- target scene scope
- target object scope
- clear graph
- patch graph

## Phase 6: Web Studio integration

- reuse toolchain modules
- shared diagnostics
- target/import compatibility panel
- inspect panel

## Phase 7: AI/MCP integration

- expose compile/format/inspect as tools
- use inspect summaries to reduce context size
- validate AI-generated DSL before sending to SceneSync

## Toolchain reuse

- `bin/loom.mjs` is only one UI for the toolchain.
- Web Studio should call `src/toolchain/compile.js`, `format.js`, and `inspect.js` directly.
- Scene Sync integrations should compile DSL to GraphJSON with the same toolchain before sending `scene-graph-set` or `scene-graph-patch`.
- MCP/GPTs tools should also call the same toolchain modules instead of re-implementing parsing or compile logic.
