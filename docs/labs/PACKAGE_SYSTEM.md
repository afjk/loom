# Package System (Experimental)

This document describes the current experimental package system for Loomlet.

## Current Supported Model

- Trusted local packages only
- No dynamic loading
- No npm resolution
- No sandboxing
- No permission system

## Package Shape

A package must export a `registerLoomletPackage` function that receives a node registry and context:

```js
export function registerLoomletPackage(registry, context) {
  registry.registerNodeType('demo.double', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }],
    params: [{ name: 'value', type: 'number', default: 0 }],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    evaluate(inputs) {
      return { out: inputs.value * 2 };
    }
  });
}
```

The node type definition follows the standard Loomlet node format:

- **category**: One of `source`, `sink`, `state`, `transform`, `effect`, `input`, `special`
- **inputs**: Array of input port definitions `{ name, type, default?, kind? }`
- **params**: Array of parameter definitions `{ name, type, default? }`
- **outputs**: Array of output port definitions `{ name, type, kind? }`
- **evaluate(inputs, params, ctx)**: Function that evaluates the node and returns output values

## Runtime Flow

### Register a Package

```js
import { createNodeRegistry } from '../../src/runtime/node-registry.js';
import { registerBuiltinNodes } from '../../src/nodes/index.js';
import { registerTrustedPackage } from '../../src/runtime/package-registration.js';
import * as demoPackage from '../../examples/packages/demo/index.js';

const registry = createNodeRegistry();
registerBuiltinNodes(registry);
registerTrustedPackage(registry, demoPackage);
```

### Compile and Execute

```js
import { parseDSL } from '../../src/loom-dsl.js';
import { Loom } from '../../src/loom.js';

const graph = parseDSL(source, { nodeRegistry: registry });
const loom = new Loom(graph, { nodeRegistry: registry });
loom.evaluateOnce();
```

The `nodeRegistry` option can be passed to both the DSL compiler and runtime to enable package nodes.

## Example

See `examples/packages/demo/` for a working example with two nodes:
- `demo.double(value)` - multiplies a number by 2
- `demo.offset(value, amount)` - adds an amount to a number

Example DSL:

```loom
import demo

x = demo.double(value: 5)
y = demo.offset(x, amount: 3)
```

## Security Note

**A trusted package is executable JavaScript.**

Packages must be treated as trusted code. Do not load packages from untrusted sources without sandboxing and permission checks. Sandboxing and permission systems are future work.

## Future Work

The following are planned but not yet implemented:

- **Metadata registration**: Package manifests with node metadata
- **Package manifest**: version, dependencies, targets
- **Target compatibility**: Node Editor, VS Code, Unity, web
- **npm package loading**: Load packages from npm
- **Web/CDN loading**: Load packages from remote URLs
- **Sandboxing and permissions**: Restrict package capabilities
- **Package-aware VS Code completion**: Autocomplete for package nodes
- **Package-aware Node Editor**: UI for adding package nodes
- **Package discovery**: Registry or catalog of available packages
- **Package versioning**: Semver support and compatibility checks
