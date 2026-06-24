# Function Definitions v0

Function definitions are an experimental Loomlet DSL feature for reusing pure same-file expressions.

```loomlet
fn double(x) => add(x, x)

value = double(21)
```

The compiler lowers calls by deterministic inline expansion by default. This
avoids a graph schema change, but it also means repeated calls duplicate the
lowered graph nodes instead of sharing a subgraph object.

## Opt-in subgraph lowering (Phase 1)

`compileToGraph(ast, { functionLowering: 'subgraph' })` lowers each function to a
single shared definition under a new optional `graph.subgraphs` map, and each
call site to a `subgraph.call` node that references it by name:

```text
graph.subgraphs = { double: { params: ['x'], nodes, edges, output: 'nodeId.port' } }
```

Inside a definition, parameters appear as `subgraph.param` source nodes. Repeated
calls share one definition instead of duplicating body nodes. The default lowering
remains `'inline'`, so existing graphs and behavior are unchanged.

The runtime expands subgraphs back into an equivalent flat graph on load
(`expandSubgraphs`, exported from the package index), so evaluation is identical
to inline mode. Scene Sync also flattens compact graphs before evaluation.

Known Phase 1 limitation: a pure passthrough/projection function whose result is a
dynamic node reference (not a literal) and is read directly by its own binding
name — e.g. `fn id(x) => x` then `v = id(clock())` read as `v.t` — does not
materialize a node named `v` in subgraph mode. Literal passthroughs
(`v = first(3, 9)`) and passthroughs feeding a downstream consumer behave
identically to inline mode. Node Editor collapsible-group rendering, canonical-DSL
rendering of `graph.subgraphs`, and making subgraph the default lowering are
tracked as follow-ups under issue #306.

## Supported

- Same-file definitions with `fn name(param, ...) => expression`
- Minimal block bodies with a single expression: `fn name(x) { add(x, x) }`
- Positional parameters and positional calls
- Nested calls between same-file function definitions

## Not Supported

- Closures over outer assignments
- Recursion
- Higher-order function definitions
- Named arguments for function calls
- Imports, packages, exports, or overloads for functions
- Node Editor UI for function subgraphs
- Source-preserving function round-trip behavior

Unsupported cases compile with explicit diagnostics such as `DUPLICATE_FUNCTION`, `UNKNOWN_FUNCTION`, `WRONG_ARITY`, `RECURSIVE_FUNCTION`, or `UNSUPPORTED_FUNCTION_BODY`.
