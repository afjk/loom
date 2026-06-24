# Graph Capability Metadata and Host Compatibility v0

Status: Experimental (v0). This describes the first minimal slice of the
capability metadata and host compatibility check requested in
[issue #286](https://github.com/afjk/loomlet/issues/286).

## Goal

A Loomlet graph being *valid* and a graph being *runnable on a specific host*
are two different things. This document defines a small, static contract so a
graph can be explained **before** it runs:

- which hosts can run this graph,
- why a graph cannot run on a host,
- which node / capability is responsible,
- whether a host is `full`, `partial`, or `unsupported` for a graph.

This is intentionally not a full effect type system, fallback engine, or graph
rewriter. See the Non-goals section.

## Runtime effect log vs static capability metadata

These are deliberately kept separate:

- **Runtime effect log** (`engine._recordEffect`): what actually happened when a
  graph ran. Already implemented.
- **Static capability metadata** (this document): what a graph *requires*,
  derivable from node definitions without executing the graph.

## Node capability metadata

Node definitions may carry optional, top-level metadata fields. They are all
optional; a node without them is treated conservatively (see *Unclassified
nodes*).

```js
registry.registerNodeType('scene.setPosition', {
  category: 'sink',
  effects: ['SceneWrite'],
  requires: ['scene.object.transform.write@1'],
  writes: ['object.self.position'],
  determinism: 'deterministic-with-env',
  inputs: [...],
  outputs: [],
  evaluate: ...
});
```

Fields:

- `effects`: coarse effect classes the node performs. `[]` for pure nodes.
- `requires`: versioned capability tokens the host must provide.
- `reads`: environment facts the node reads (informational).
- `writes`: targets the node writes (informational, feeds later single-writer work).
- `determinism`: one of `pure`, `deterministic-with-env`, `nondeterministic`.

The node registry validates these fields when present (arrays of non-empty
strings; `determinism` from the known set) and otherwise leaves graph execution
untouched, so existing graphs keep running unchanged.

## Capability vocabulary (v0)

Capability tokens are `name@version` strings. v0 set:

| Capability | Meaning |
|---|---|
| `pure.compute@1` | Pure math / logic / text / list / json / core transforms |
| `env.time.seconds@1` | Host-provided elapsed time (`env.time`) |
| `env.input@1` | Host-provided named input values |
| `env.events@1` | Host-provided committed events (`onEvent`) |
| `event.emit@1` | Emitting events back to the host (`sendEvent`) |
| `scene.object.transform.write@1` | Writing object transform (position/rotation/scale) |
| `scene.object.visibility.write@1` | Writing object visibility (`scene.setVisible`) |
| `scene.object.material.write@1` | Writing object material color (`scene.setColor`) |
| `scene.object.audio.control@1` | Controlling an object AudioSource component |

Effect classes (v0): `TimeRead`, `InputRead`, `EventRead`, `EventWrite`,
`SceneWrite`, `AudioControl`. Pure nodes have `effects: []`.

## Built-in default classification

The MVP-targeted nodes (`clock`, `input`, `onEvent`, `sendEvent`, `scene.*`,
`audioSource.*`) carry explicit metadata on their definitions.

The large pure libraries (`math.*`, `logic.*`, `text.*`, `list.*`, `json.*`, and
pure core transforms) are not annotated one by one. Instead the summarizer
applies a conservative built-in default: a built-in node whose definition has no
explicit `requires` and whose category is `transform` or `source` with no scene
or io effects is classified as `pure.compute@1` / `determinism: pure`. This keeps
graphs from being marked `partial` purely because a pure node lacks hand-written
metadata, while still treating **unknown custom nodes** conservatively.

## Graph requirement summary

`summarizeGraphCapabilities(graph, nodeTypes)` walks the graph nodes and returns
a deduplicated, sorted summary:

```js
{
  effects: ['SceneWrite', 'TimeRead'],
  requires: ['env.time.seconds@1', 'scene.object.transform.write@1'],
  reads: ['env.time.seconds'],
  writes: ['object.self.position'],
  determinism: 'deterministic-with-env', // weakest determinism in the graph
  nodes: [{ nodeId, type, effects, requires, reads, writes, determinism, classified }],
  unclassified: [{ nodeId, type }]
}
```

`determinism` collapses to the weakest present:
`pure` < `deterministic-with-env` < `nondeterministic`.

## Host capabilities

Each host declares the capability tokens it provides. v0 profiles:

| Capability | web-scenesync | unity-runtime | export-viewer | cli |
|---|:--:|:--:|:--:|:--:|
| `pure.compute@1` | ✅ | ✅ | ✅ | ✅ |
| `env.time.seconds@1` | ✅ | ✅ | ✅ | ✅ |
| `env.input@1` | ✅ | – | – | ✅ |
| `env.events@1` | ✅ | – | – | ✅ |
| `event.emit@1` | ✅ | – | – | ✅ |
| `scene.object.transform.write@1` | ✅ | ✅ | ✅ | – |
| `scene.object.visibility.write@1` | ✅ | – | ✅ | – |
| `scene.object.material.write@1` | ✅ | – | ✅ | – |
| `scene.object.audio.control@1` | ✅ | – | ✅ | – |

Notes:

- `cli` has no scene/audio host, so `SceneWrite` / `AudioControl` are meaningless
  there.
- `unity-runtime` is conservative in v0: no live input/events, and no audio or
  material/visibility writes until the Unity runtime implements them. `export-viewer`
  is conservative for live input/events. Promote tokens as those runtimes mature.
- These sets are intentionally editable data, not a frozen contract.

## Compatibility report

`checkHostCompatibility(graph, nodeTypes, host)` returns:

```js
{
  targetHost: 'unity-runtime',
  status: 'partial',
  supported: ['pure.compute@1', 'env.time.seconds@1', 'scene.object.transform.write@1'],
  unsupported: [
    { capability: 'env.events@1', nodes: ['listen1'], message: 'unity-runtime does not provide env.events@1.' }
  ],
  unclassified: [
    { nodeId: 'custom1', type: 'my.customNode', message: 'No capability metadata; cannot verify support on unity-runtime.' }
  ]
}
```

Status rules:

- `full`: every required capability is supported and there are no unclassified nodes.
- `unsupported`: the graph requires at least one capability and none are supported.
- `partial`: anything in between, including the unclassified-only case.

## Acceptance mapping (#286)

- Node definitions accept optional `effects` / `requires` / `reads` / `writes` / `determinism`. ✅
- Key built-in nodes carry minimal metadata. ✅
- Graph summary of effects / requires / reads / writes. ✅
- Host capability set vs graph requirements check. ✅
- Unsupported report includes node ids and reasons. ✅
- Existing graph execution is unchanged. ✅
- Custom nodes without metadata are handled conservatively (`unclassified`). ✅

## Non-goals (v0)

- Complete effect type system.
- Fallback execution or automatic graph rewriting.
- Semantic profile registry, permission/sandbox model.
- WASM node implementation.
- Node Editor / VS Code / CLI surfacing (candidate follow-ups; this slice is the
  library API and metadata only).

## Future extensions

- ✅ `loomlet check-compat <file> [--target <host>]` CLI (implemented; see [CLI guide](../cli.md)).
- ✅ Node Editor compatibility panel (implemented; `describeGraphHostCompatibility` powers the Compatibility tab).
- ✅ VS Code diagnostics for target-host compatibility (implemented; set `loomlet.targetHost`).
- Feed Host Capability Guide ([#290](https://github.com/afjk/loomlet/issues/290)).
- `wasm.call.pure@1` / `wasm.call.component@1`, coordinate/unit semantic profiles.
