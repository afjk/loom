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

## Phase 4: REPL MVP

- interactive prompt
- accumulated source session
- `:source`, `:inspect`, `:graph`, `:reset`, `:quit`
- recompile-and-run after each snippet

## Phase 5: REPL follow-up

- multiline input
- watch/live ticking
- command history persistence
- autocomplete
- notebook-style cells
- incremental graph patching

## Phase 6: SceneSync integration

- read-only room probes via `loom scenesync ping`
- read-only room probes via `loom scenesync info`
- read-only room probes via `loom scenesync objects`
- reusable Scene Sync command schema and client layer
- compile DSL and send graph
- target scene scope
- target object scope
- clear graph
- patch graph

## Phase 7: SceneSync follow-up

- compile DSL and send graph
- `loom scenesync run <file.loom>`
- `loom scenesync send-graph <file.json>`
- target scene scope
- target object scope
- clear graph
- patch graph
- `loom repl :connect scenesync`
- `loom repl :objects`

## Phase 8: Web Studio integration

- reuse toolchain modules
- shared diagnostics
- target/import compatibility panel
- inspect panel

## Phase 9: AI/MCP integration

- expose compile/format/inspect as tools
- use inspect summaries to reduce context size
- validate AI-generated DSL before sending to SceneSync

## Toolchain reuse

- `bin/loom.mjs` is only one UI for the toolchain.
- Web Studio should call `src/toolchain/compile.js`, `format.js`, and `inspect.js` directly.
- Scene Sync integrations should compile DSL to GraphJSON with the same toolchain before sending `scene-graph-set` or `scene-graph-patch`.
- MCP/GPTs tools should also call the same toolchain modules instead of re-implementing parsing or compile logic.
