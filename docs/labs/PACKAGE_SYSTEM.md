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

## Package Metadata

A package may optionally export library metadata to make nodes discoverable to editors, documentation tools, and AI authoring systems. Metadata is separate from runtime registration and not required for execution.

### Exporting Metadata with `loomletMetadata`

```js
export const loomletMetadata = {
  demo: {
    name: 'demo',
    description: 'Demo package nodes for trusted local package tests.',
    targets: ['cli', 'web', 'scenesync'],
    functions: {
      double: {
        name: 'double',
        signature: 'demo.double(value: 0)',
        description: 'Doubles a numeric value.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: false,
            description: 'Input value.'
          }
        ],
        returns: 'number',
        targets: ['cli', 'web', 'scenesync'],
        examples: ['result = demo.double(value: 5)']
      }
    }
  }
};
```

### Exporting Metadata with `registerLoomletMetadata`

Alternatively, use a function:

```js
export function registerLoomletMetadata(metadataRegistry, context) {
  metadataRegistry.registerLibraryMetadata('demo', {
    name: 'demo',
    description: 'Demo package nodes...',
    targets: ['cli', 'web', 'scenesync'],
    functions: { ... }
  });
}
```

### Registering Package Metadata

When registering a package, pass a `metadataRegistry` in the context:

```js
import { createLibraryMetadataRegistry } from '../src/toolchain/metadata-registry.js';

const nodeRegistry = createNodeRegistry();
const metadataRegistry = createLibraryMetadataRegistry();

registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });
```

The registry will:

1. Call `registerLoomletPackage` to register runtime node definitions
2. If `registerLoomletMetadata` exists, call it with the metadata registry
3. Else if `loomletMetadata` exists, register each library automatically

Runtime-only packages are still supported—metadata is optional.

## Import Validation

A package library becomes importable when:

- Its metadata is registered in a metadata registry, or
- Its runtime node types are registered in a node registry using the `library.function` prefix.

Metadata is used for target compatibility validation during compilation. Runtime-only packages are currently allowed, but target compatibility is unknown until metadata or a manifest exists.

### With Built-in Libraries

Built-in libraries like `math` and `time` are validated against the static runtime-targets table:

```js
const result = compileLoomSource(`
import math
result = math.add(a: 1, b: 2)
`, { target: 'cli' });

assert.equal(result.ok, true);
```

### With Package Metadata

Package imports are validated against metadata when a metadata registry is provided:

```js
const nodeRegistry = createNodeRegistry();
const metadataRegistry = createLibraryMetadataRegistry();

registerBuiltinNodes(nodeRegistry);
registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

const result = compileLoomSource(`
import demo
result = demo.double(value: 5)
`, {
  target: 'web',
  nodeRegistry,
  metadataRegistry
});

assert.equal(result.ok, true);
```

### Runtime-Only Packages

Packages without metadata are still allowed if their node types are registered in the node registry:

```js
const nodeRegistry = createNodeRegistry();
registerTrustedPackage(nodeRegistry, runtimeOnlyPackage);

const result = compileLoomSource(`
import runtimeOnly
result = runtimeOnly.value()
`, {
  nodeRegistry
});

assert.equal(result.ok, true);
```

Without registries, unknown imports are rejected with `UNKNOWN_IMPORT`.

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

- **Package manifest**: version, dependencies, targets
- **Metadata-driven validation**: Compiler and runtime validation using package metadata
- **Target compatibility**: Node Editor, VS Code, Unity, web
- **npm package loading**: Load packages from npm
- **Web/CDN loading**: Load packages from remote URLs
- **Sandboxing and permissions**: Restrict package capabilities
- **Package-aware VS Code completion**: Autocomplete for package nodes
- **Package-aware Node Editor**: UI for adding package nodes
- **Generated documentation**: Docs from package metadata
- **Package discovery**: Registry or catalog of available packages
- **Package versioning**: Semver support and compatibility checks
