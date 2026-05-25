# Function Definitions v0

Function definitions are an experimental Loomlet DSL feature for reusing pure same-file expressions.

```loomlet
fn double(x) => add(x, x)

value = double(21)
```

The compiler currently lowers calls by deterministic inline expansion. This avoids a graph schema change in v0, but it also means repeated calls duplicate the lowered graph nodes instead of sharing a runtime subgraph object.

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
