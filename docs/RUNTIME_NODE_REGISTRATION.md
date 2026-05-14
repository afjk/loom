# Runtime Node Registration API

## Purpose

`registerNodeType()` is the formal API for adding executable node types to a Loomlet runtime registry.

It is the foundation for future package loading.

## Minimal example

```js
import { createNodeRegistry } from '../src/runtime/node-registry.js';

const registry = createNodeRegistry();

registry.registerNodeType('example.double', {
  category: 'transform',
  inputs: [{ name: 'value', type: 'number' }],
  params: [{ name: 'value', type: 'number', default: 0 }],
  outputs: [{ name: 'out', type: 'number' }],
  evaluate(inputs) {
    return { out: inputs.value * 2 };
  }
});
```

## Future package shape

Show non-binding example:

```js
export function registerLoomletPackage(registry) {
  registry.registerNodeType('noise.perlin', {
    category: 'source',
    inputs: [
      { name: 'x', type: 'number' },
      { name: 'y', type: 'number' }
    ],
    params: [
      { name: 'seed', type: 'number', default: 0 }
    ],
    outputs: [
      { name: 'out', type: 'number' }
    ],
    evaluate(inputs, params, ctx) {
      return { out: 0 };
    }
  });
}
```

## Note

This is not package loading yet. It only defines how executable nodes are registered once a package is trusted and loaded.

## API

### `createNodeRegistry(initialNodeTypes = {})`

Create a new runtime node registry.

- **initialNodeTypes**: optional object of `{ nodeTypeName: definition, ... }` to pre-populate the registry
- **returns**: registry object

### `registry.registerNodeType(nodeType, definition)`

Register an executable node type.

- **nodeType**: string name like `'math.add'` or `'constant'`
- **definition**: node type definition object with `category`, `inputs`, `params`, `outputs`, `evaluate`
- **throws**: `TypeError` if node type name or definition is invalid, or if node type already registered
- **returns**: normalized node definition

### `registry.getNodeType(nodeType)`

Get a registered node type definition.

- **nodeType**: string name
- **returns**: node definition object, or `undefined` if not registered

### `registry.hasNodeType(nodeType)`

Check if a node type is registered.

- **nodeType**: string name
- **returns**: boolean

### `registry.listNodeTypes()`

List all registered node type names.

- **returns**: sorted array of node type names

### `registry.toObject()`

Export all registered node types as a plain object.

- **returns**: object of `{ nodeTypeName: definition, ... }`

### `registry.size`

Read-only property giving the number of registered node types.

## Validation rules

### Node type name

Valid names:

- `'math.add'` — library-qualified form preferred for public nodes
- `'logic.select'`
- `'constant'` — unqualified legacy names still allowed
- `'clock'`

Invalid names:

- `''` — empty
- `'   '` — whitespace-only
- `'math add'` — contains whitespace
- `'.add'` — starts with dot
- `'math.'` — ends with dot

### Node type definition

Required fields:

- **category** (string, non-empty): node category for visual organization
- **evaluate** (function): the runtime computation

Optional but standardized:

- **inputs** (array): list of input port definitions
- **params** (array): list of parameter port definitions
- **outputs** (array): list of output port definitions

If `inputs`, `params`, or `outputs` are omitted, they are automatically normalized to empty arrays during registration.

Port definitions must have:

- **name** (string, non-empty): port identifier
- **type** (string, non-empty): Loomlet type name

Port definitions may have:

- **kind** (string, non-empty): `'behavior'` for continuous signals, omitted for discrete values
- **default** (any): default value if not connected or specified

Validation ensures:

- no duplicate names within inputs
- no duplicate names within params
- no duplicate names within outputs

## Target compatibility

Target filtering remains handled outside the registry.

Documentation for target filtering is in `docs/RUNTIME_TARGETS.md`.

## Security note

A package that registers executable nodes is trusted code.

Sandboxing and remote package loading are future work.

---

## See Also

- `src/loom.js` — `DEFAULT_NODE_REGISTRY` runtime registry instance
- `src/runtime/node-registry.js` — registry implementation
- `test/node-registry.test.mjs` — registry API tests
- `docs/RUNTIME_NODE_REGISTRY.md` — registry design and current state
- `docs/NODE_DEFINITION_SCHEMA.md` — detailed node definition schema
