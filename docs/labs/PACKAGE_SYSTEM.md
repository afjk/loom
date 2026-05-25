# Package System (v0 Foundation)

Loomlet package extension v0 supports trusted local JavaScript modules loaded explicitly by file path, plus explicit directory loading through `loomlet.package.json`. Packages are executable JavaScript and must be trusted.

## v0 Supported Surface

In v0, packages support:

- **Explicit local loading**: `--package <path>` on CLI or `loadTrustedLocalPackage()` at runtime, where `<path>` is a JavaScript module file or a directory containing `loomlet.package.json`
- **Runtime node registration**: Packages register node implementations into a NodeRegistry via `registerLoomletPackage()`
- **Optional metadata registration**: Packages can export metadata for discoverability and target compatibility
- **Package-aware import validation**: Compiler validates imports against metadata targets when available
- **Package-aware CLI / REPL / docs help**: Package metadata appears in `:libs`, `:help <library>`, and `loomlet docs` commands

## v0 Design Principles

- **Trusted source only**: Packages are executable JavaScript with full process capabilities. There is no sandboxing or permission system. Load packages only from sources you trust.
- **Explicit loading**: Packages must be loaded explicitly by file path or directory path. There is no package discovery, catalog, recursive directory scanning, or npm resolution.
- **Runtime-only or metadata-aware**: A package can work with runtime registration alone, or can add optional metadata for better tooling support.

## Runtime Package API

### Creating and Using a NodeRegistry

The v0 package runtime API centers on three functions:

- `createNodeRegistry()`: Create an empty registry
- `registerNodeType(nodeType, definition)`: Register a node type in a registry
- `registerTrustedPackage(registry, packageModule, context?)`: Load a trusted package into a registry

### Package Module Shape

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

The node type definition follows the standard Loomlet node format. See [Node Definition Schema](../NODE_DEFINITION_SCHEMA.md) for full details:

- **category**: One of `source`, `sink`, `state`, `transform`, `effect`, `input`, `special`
- **inputs**: Array of input port definitions `{ name, type, default?, kind? }`
- **params**: Array of parameter definitions `{ name, type, default? }`
- **outputs**: Array of output port definitions `{ name, type, kind? }`
- **evaluate(inputs, params, ctx)**: Function that evaluates the node and returns output values

### Registering a Package at Runtime

Use `registerTrustedPackage()` to load a trusted package:

```js
import { createNodeRegistry } from '../../src/runtime/node-registry.js';
import { registerTrustedPackage } from '../../src/runtime/package-registration.js';
import * as myPackage from './my-package.js';

const registry = createNodeRegistry();
registerTrustedPackage(registry, myPackage);

// Now myPackage nodes are available in the registry
console.log(registry.listNodeTypes()); // ['mylib.node1', 'mylib.node2', ...]
```

## Metadata Role and Registration

Metadata is optional and separate from runtime registration. Metadata enables:

- **:libs and :help commands**: Package libraries appear in REPL help
- **docs generation**: `loomlet docs` can show package documentation
- **import validation**: Compiler can validate imports against package targets
- **Editor support**: VS Code and Node Editor can eventually use package metadata (not yet implemented in v0)

A package can work perfectly as a runtime-only package without metadata, but tooling will know less about it. Metadata is recommended for better discoverability and target compatibility.

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

## Import Validation and Target Compatibility

In v0, packages support optional target compatibility validation through metadata.

### How Packages Become Importable

A package library becomes importable in the DSL when:

1. Its runtime node types are registered in a node registry (always required)
2. Its metadata is optionally registered in a metadata registry (for target validation)

Without metadata, imports are allowed if the node types exist in the registry, but target compatibility is unknown to tooling.

### Target Compatibility

When metadata is available, the compiler can validate that a package library supports the target you're compiling for:

```js
// demo package metadata declares targets: ['cli', 'web', 'scenesync']
const result = compileLoomSource(`
import demo
result = demo.double(value: 5)
`, { target: 'web', metadataRegistry });
// Succeeds because 'web' is in demo's targets
```

If you try to import a package targeting an unsupported platform, the compiler will warn you (if metadata is available).

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

## REPL and CLI with Packages

When a host creates both a node registry and a metadata registry and passes them to `LoomReplSession` or CLI commands, REPL evaluation, import validation, and help all use the same package-aware view. This enables:

- **Evaluation**: Custom package nodes execute through `evaluateSnippet()`
- **Import validation**: Imports are validated against the metadata registry (when provided)
- **Help**: Package metadata appears in `:libs`, `:help <library>`, and `:help <lib.func>`
- **Docs**: `loomlet docs` shows package metadata

```js
import { LoomReplSession } from '../../src/toolchain/repl-session.js';
import { createNodeRegistry } from '../../src/runtime/node-registry.js';
import { createLibraryMetadataRegistry } from '../../src/toolchain/metadata-registry.js';
import { registerBuiltinNodes } from '../../src/nodes/index.js';
import { registerTrustedPackage } from '../../src/runtime/package-registration.js';
import * as demoPackage from '../../examples/packages/demo/index.js';

const nodeRegistry = createNodeRegistry();
const metadataRegistry = createLibraryMetadataRegistry();

registerBuiltinNodes(nodeRegistry);
registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

const session = new LoomReplSession({
  target: 'cli',
  nodeRegistry,
  metadataRegistry
});

// Import and evaluate demo nodes
session.evaluateSnippet('import demo');
session.evaluateSnippet('x = demo.double(value: 5)');

// Help functions use the same metadata
console.log(session.listLibraries()); // Shows 'demo'
console.log(session.getLibraryHelp('demo')); // Shows demo library docs
console.log(session.getFunctionHelp('demo.double')); // Shows demo.double docs
```

The default CLI still shows builtin metadata until a package-loading UX is added. REPL help methods pass the `metadataRegistry` option to formatting functions, enabling custom package metadata to appear in:

- `:libs` command
- `:help <library>` command
- `:help <lib.func>` command

## CLI Usage with Trusted Local Packages

The `loomlet` CLI can load trusted local packages using the `--package` flag **(experimental)**:

```bash
loomlet repl --package ./examples/packages/demo/index.js
loomlet run ./examples/demo.loom --package ./examples/packages/demo/index.js
loomlet inspect ./examples/demo.loom --package ./examples/packages/demo/index.js
loomlet compile ./examples/demo.loom --package ./examples/packages/demo/index.js
loomlet docs --package ./examples/packages/demo/index.js
loomlet docs demo --package ./examples/packages/demo/index.js
loomlet docs demo.double --package ./examples/packages/demo/index.js
```

Directory packages are loaded by pointing `--package` at a directory that contains `loomlet.package.json`:

```bash
loomlet run ./file.loom --package ./path/to/package-dir --get x.out
loomlet docs --package ./path/to/package-dir
```

### Important Notes on Packages

**Packages are executable JavaScript.** They must be trusted code. There is no sandboxing or permission system. Load packages only from sources you trust.

### Package Resolution and Paths

- Package paths must point to a JavaScript module file (e.g., `./examples/packages/demo/index.js`) or to a directory containing `loomlet.package.json`
- Local file paths are resolved relative to `process.cwd()`
- Absolute paths are used as-is
- Directory package loading only checks the exact directory passed to `--package`; recursive discovery is not supported
- **npm resolution is not supported**
- **Remote URL loading is not supported**

### Directory Manifest Shape

`loomlet.package.json` v0 requires `name`, `version`, and `loomlet.entry`. `loomlet.metadata` is optional and, when present, points to a JSON or JavaScript metadata file. Metadata files are treated as a Loomlet library metadata map, matching the existing `loomletMetadata` export shape.

```json
{
  "name": "my-package",
  "version": "0.0.0",
  "loomlet": {
    "entry": "./index.js",
    "metadata": "./metadata.json"
  }
}
```

The entry module must export `registerLoomletPackage(registry, context)`. The metadata path is resolved relative to the package directory and must stay inside that directory.

### Multiple Packages and Load Summaries

Multiple packages can be loaded by repeating the `--package` flag. When a host loads a package, the load summary reports **only the entries added by that package**, not the full registry state. This helps distinguish package contributions from builtin libraries.

For example, after loading the demo package with builtins already present:

```js
const result = await loadTrustedLocalPackage('./demo/index.js', { 
  nodeRegistry, 
  metadataRegistry 
});
// result.libraries = ['demo']  (not including 'math', 'text', etc.)
// result.nodeTypes = ['demo.double', 'demo.offset']
```

However, loading the same package twice will fail with a "Duplicate node type" error.

### Loading Multiple Packages

Load additional packages by repeating the `--package` flag:

```bash
loomlet repl --package ./pkg-a/index.js --package ./pkg-b/index.js
```

### REPL with Packages

Inside the REPL, packages loaded with `--package` are available for import:

```
$ loomlet repl --package ./examples/packages/demo/index.js
Loomlet REPL
Type :help for commands, :quit to exit.
loomlet> import demo
imported demo
loomlet> x = demo.double(value: 21)
loomlet> :vars
x = 42
loomlet> :help demo
demo
Demo package nodes for trusted local package tests.
...
loomlet> :help demo.double
demo.double(value: 0)
Doubles a numeric value.
...
```

### Error Handling

Clear errors are provided for common issues:

- **Package file not found**: Check the path and ensure the file exists
- **Package fails to import**: Check for syntax errors in the package module or its dependencies
- **Invalid package format**: Package must export `registerLoomletPackage` function
- **Duplicate library metadata**: A library name is already registered
- **Duplicate node type**: A node type is already registered

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


## Future Manifest Direction

Future versions may extend the manifest to declare API compatibility, dependencies, and richer compatibility data. A possible extended manifest shape:

```json
{
  "name": "string",
  "version": "string (semver)",
  "description": "string",
  "main": "string (path to entry point)",
  "loomlet": {
    "apiVersion": "string (compatible Loomlet package API version)",
    "targets": ["string[] (e.g., 'cli', 'web', 'scenesync', 'unity')"],
    "entry": "string (path to registerLoomletPackage export)",
    "metadata": "string (optional path to metadata file)"
  },
  "dependencies": {
    "package-name": "semver"
  }
}
```

An extended manifest may eventually enable:
- Declaring compatible Loomlet API versions
- Specifying supported targets (cli, web, scenesync, unity, etc)
- Declaring dependencies on other packages
- Auto-discovering packages from manifest files instead of explicit paths

The current v0 manifest loader does not perform version solving, dependency resolution, npm resolution, publishing, package catalog lookup, remote/CDN loading, sandboxing, or permission checks.

## Versioning Axes

When Loomlet gains package versioning support, understand these independent versioning axes:

- **Package version**: Semver assigned by the package author (e.g., 1.2.3)
- **Loomlet API version**: The compatible Loomlet package API version (e.g., v0, v1)
- **Targets**: Supported host environments (cli, web, scenesync, unity, etc)

A package built for "Loomlet API v0" may not be compatible with future "Loomlet API v1" if the API changes.

## Editor and Tooling Support

### What Editors Eventually Need (Not Yet Implemented in v0)

VS Code and Node Editor eventually should be able to consume from package metadata:

- Library name and description
- Function signatures, parameters, defaults, return types
- Examples and documentation
- Supported targets
- Node categories (transform, source, sink, etc)
- Port shapes / connection compatibility (when available)

### What v0 Provides

Currently, v0 provides the metadata structure and REPL/CLI integration. Editor integration (VS Code completion for package nodes, Node Editor UI for adding package nodes) remains future work. The metadata exists and can be read by tooling; editor features to consume it are deferred.

## Deferred Features (Not v0)

The following are explicitly deferred from v0 and will be addressed in future work:

- **npm package loading**: Load packages from npm registry
- **Remote/URL loading**: Load packages from HTTP(S) URLs or CDNs
- **Directory discovery**: Auto-discover packages from directories or manifest files
- **Package manifest extensions**: Dependency, API-version, and catalog fields beyond the v0 local loader
- **Sandboxing**: Run packages in a restricted execution environment
- **Permission system**: Grant/revoke package capabilities before execution
- **Package catalog / discovery**: Registry or marketplace of available packages
- **Dependency resolution**: Resolve transitive package dependencies
- **Package-aware VS Code completion**: Autocomplete for package node types and arguments
- **Package-aware Node Editor UI**: UI for browsing and adding package nodes to graphs
