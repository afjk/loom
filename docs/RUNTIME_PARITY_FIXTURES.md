# Runtime Parity Fixtures

Runtime parity fixtures are data-driven graph cases used to verify that different Loomlet runtimes produce compatible results for portable nodes.

The first consumer is the JavaScript runtime test suite (`test/runtime-parity-fixtures.test.mjs`). The Unity runtime package also copies this fixture set to `unity/com.afjk.loomlet-runtime/Tests/Fixtures/portable-node-cases.json` for EditMode tests.

## Fixture Format

Fixtures are defined in JSON format with a stable schema:

```json
{
  "version": 1,
  "description": "...",
  "cases": [
    {
      "id": "math.add.basic",
      "library": "math",
      "level": "portable",
      "graph": {
        "nodes": [
          {
            "id": "n",
            "type": "math.add",
            "params": {
              "a": 2,
              "b": 3
            }
          }
        ],
        "edges": []
      },
      "evaluate": {
        "time": 0,
        "dt": 0
      },
      "get": "n.out",
      "expected": 5
    }
  ]
}
```

## Case Fields

- **id**: Unique case identifier (e.g., `math.add.basic`)
- **library**: Portable library name (math, logic, list, text, json, time, state, debug)
- **level**: Always `"portable"` for this fixture set
- **graph**: Node graph definition with `nodes` and `edges` arrays. Uses graph JSON, not DSL source.
- **evaluate**: Optional evaluation options (time, dt). Defaults to empty object.
- **get**: Reference to the output value (format: `node_id.output_name`)
- **expected**: Expected output value
- **tolerance**: Optional tolerance for floating-point comparisons (e.g., `1e-9`)

## Constraints

- No host-adapter nodes (console, output, scene, scenesync)
- No random nodes (random.value, random.range, etc.)
- No DOM or Three.js nodes
- No file system nodes
- No Scene Sync nodes
- Avoid fragile floating-point edge cases
- Use tolerance for trigonometric and floating-point results
- Simple objects and arrays only in JSON fixtures

## Running Tests

```bash
npm test
```

The runtime parity tests run as part of the unit test suite. `npm test` also runs `scripts/check-unity-runtime-fixtures.mjs`, which fails if the Unity fixture copy drifts from the JS source fixture.

## Adding New Cases

When adding new portable nodes to Loomlet:

1. Add corresponding test cases to `test/fixtures/runtime-parity/portable-node-cases.json`
2. Use hand-readable JSON and descriptive case IDs
3. Include tolerance for any floating-point results
4. Run `npm test` to verify all cases pass
5. Consider adding separate fixture files for advanced features (e.g., list.map, list.filter with function values)

See [`docs/PORTABLE_RUNTIME_SUBSET.md`](PORTABLE_RUNTIME_SUBSET.md) §6 for the full parity fixture policy, including when coverage is required and what node categories are excluded from portable fixtures.

## Future: Higher-Order Functions

Future fixture sets will cover:

- `list.map`, `list.filter`, `list.reduce` (requires function value serialization)
- `time` library with stateful behavior (requires time evaluation semantics)
- `state` library (requires mutable reference semantics)

These are deferred to allow stable parity testing on pure, deterministic portable nodes first.
