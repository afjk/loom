import test from 'node:test';
import assert from 'node:assert/strict';
import { createNodeRegistry } from '../src/runtime/node-registry.js';
import { createLibraryMetadataRegistry } from '../src/toolchain/metadata-registry.js';
import { registerTrustedPackage } from '../src/runtime/package-registration.js';
import * as demoPackage from '../examples/packages/demo/index.js';

test('registerTrustedPackage registers package metadata when metadata registry is provided', () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  assert.equal(nodeRegistry.hasNodeType('demo.double'), true);
  assert.equal(nodeRegistry.hasNodeType('demo.offset'), true);

  assert.equal(metadataRegistry.hasLibraryMetadata('demo'), true);

  const demo = metadataRegistry.getLibraryMetadata('demo');
  assert.equal(demo.functions.double.name, 'double');
  assert.equal(demo.functions.offset.name, 'offset');
});

test('registerTrustedPackage does not require metadata registry', () => {
  const nodeRegistry = createNodeRegistry();

  registerTrustedPackage(nodeRegistry, demoPackage);

  assert.equal(nodeRegistry.hasNodeType('demo.double'), true);
  assert.equal(nodeRegistry.hasNodeType('demo.offset'), true);
});

test('registerTrustedPackage rejects invalid metadata registry', () => {
  const nodeRegistry = createNodeRegistry();

  assert.throws(
    () => registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry: {} }),
    /metadataRegistry/
  );
});

test('registerTrustedPackage supports registerLoomletMetadata function', () => {
  const packageWithMetadataFunction = {
    registerLoomletPackage(registry) {
      registry.registerNodeType('custom.value', {
        category: 'source',
        outputs: [{ name: 'out', type: 'number' }],
        evaluate() {
          return { out: 1 };
        }
      });
    },
    registerLoomletMetadata(metadataRegistry) {
      metadataRegistry.registerLibraryMetadata('custom', {
        name: 'custom',
        description: 'Custom test metadata.',
        targets: ['cli'],
        functions: {
          value: {
            name: 'value',
            signature: 'custom.value()',
            description: 'Returns a test value.',
            args: [],
            returns: 'number',
            targets: ['cli'],
            examples: ['x = custom.value()']
          }
        }
      });
    }
  };

  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerTrustedPackage(nodeRegistry, packageWithMetadataFunction, { metadataRegistry });

  assert.equal(nodeRegistry.hasNodeType('custom.value'), true);
  assert.equal(metadataRegistry.hasLibraryMetadata('custom'), true);
});

test('registerTrustedPackage duplicate metadata fails', () => {
  const nodeRegistry1 = createNodeRegistry();
  const nodeRegistry2 = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerTrustedPackage(nodeRegistry1, demoPackage, { metadataRegistry });

  assert.throws(
    () => registerTrustedPackage(nodeRegistry2, demoPackage, { metadataRegistry }),
    /Duplicate library metadata/
  );
});

test('registerTrustedPackage metadata drift - runtime nodes exist for metadata functions', () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  const demo = metadataRegistry.getLibraryMetadata('demo');

  for (const [functionName, fn] of Object.entries(demo.functions)) {
    const nodeType = `demo.${functionName}`;
    assert.equal(nodeRegistry.hasNodeType(nodeType), true, `Missing node type: ${nodeType}`);
  }
});

test('registerTrustedPackage metadata drift - metadata args exist in runtime', () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  const demo = metadataRegistry.getLibraryMetadata('demo');

  for (const [functionName, fn] of Object.entries(demo.functions)) {
    const nodeType = `demo.${functionName}`;
    const nodeDef = nodeRegistry.getNodeType(nodeType);

    const runtimeSlots = new Set([
      ...(nodeDef.inputs ?? []).map((input) => input.name),
      ...(nodeDef.params ?? []).map((param) => param.name)
    ]);

    for (const arg of fn.args) {
      assert.equal(
        runtimeSlots.has(arg.name),
        true,
        `Missing runtime slot for metadata arg: ${nodeType}.${arg.name}`
      );
    }
  }
});

test('registerTrustedPackage metadata drift - metadata functions have outputs', () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  const demo = metadataRegistry.getLibraryMetadata('demo');

  for (const [functionName, fn] of Object.entries(demo.functions)) {
    const nodeType = `demo.${functionName}`;
    if (fn.returns !== 'void') {
      const nodeDef = nodeRegistry.getNodeType(nodeType);
      assert.equal(
        (nodeDef.outputs ?? []).length > 0,
        true,
        `Missing outputs for non-void function: ${nodeType}`
      );
    }
  }
});
