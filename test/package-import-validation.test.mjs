import test from 'node:test';
import assert from 'node:assert/strict';

import { compileLoomSource, getCompatibleTargetsForImports } from '../src/toolchain/compile.js';
import { createNodeRegistry } from '../src/runtime/node-registry.js';
import { registerBuiltinNodes } from '../src/nodes/index.js';
import { registerTrustedPackage } from '../src/runtime/package-registration.js';
import { createLibraryMetadataRegistry } from '../src/toolchain/metadata-registry.js';
import * as demoPackage from '../examples/packages/demo/index.js';

function createDemoRegistries() {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);
  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  return { nodeRegistry, metadataRegistry };
}

test('compileLoomSource rejects package import without registries', () => {
  const result = compileLoomSource(`
import demo

result = demo.double(value: 5)
`);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'UNKNOWN_IMPORT'));
});

test('compileLoomSource accepts package import with package registries', () => {
  const { nodeRegistry, metadataRegistry } = createDemoRegistries();

  const result = compileLoomSource(`
import demo

result = demo.double(value: 5)
`, {
    nodeRegistry,
    metadataRegistry
  });

  assert.equal(result.ok, true);
  assert.ok(result.graph.nodes.some((node) => node.type === 'demo.double'));
});

test('compileLoomSource accepts package import for supported target', () => {
  const { nodeRegistry, metadataRegistry } = createDemoRegistries();

  const result = compileLoomSource(`
import demo

result = demo.double(value: 5)
`, {
    target: 'cli',
    nodeRegistry,
    metadataRegistry
  });

  assert.equal(result.ok, true);
});

test('compileLoomSource rejects package import for unsupported target', () => {
  const { nodeRegistry, metadataRegistry } = createDemoRegistries();

  const result = compileLoomSource(`
import demo

result = demo.double(value: 5)
`, {
    target: 'unity',
    nodeRegistry,
    metadataRegistry
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'UNSUPPORTED_IMPORT'));
});

test('compileLoomSource accepts runtime-only package import with node registry', () => {
  const runtimeOnlyPackage = {
    registerLoomletPackage(registry) {
      registry.registerNodeType('runtimeOnly.value', {
        category: 'source',
        outputs: [{ name: 'out', type: 'number' }],
        evaluate() {
          return { out: 1 };
        }
      });
    }
  };

  const nodeRegistry = createNodeRegistry();
  registerBuiltinNodes(nodeRegistry);
  registerTrustedPackage(nodeRegistry, runtimeOnlyPackage);

  const result = compileLoomSource(`
import runtimeOnly

result = runtimeOnly.value()
`, {
    nodeRegistry
  });

  assert.equal(result.ok, true);
});

test('getCompatibleTargetsForImports uses package metadata registry', () => {
  const { metadataRegistry } = createDemoRegistries();

  const targets = getCompatibleTargetsForImports(['demo'], { metadataRegistry });

  assert.deepEqual(targets.sort(), ['cli', 'scenesync', 'web'].sort());
});

test('getCompatibleTargetsForImports intersects built-in and package targets', () => {
  const { metadataRegistry } = createDemoRegistries();

  const targets = getCompatibleTargetsForImports(['demo', 'math'], { metadataRegistry });

  assert.deepEqual(targets.sort(), ['cli', 'scenesync', 'web'].sort());
});

test('builtin import still works without registries', () => {
  const result = compileLoomSource(`
import math

result = math.add(a: 1, b: 2)
`);

  assert.equal(result.ok, true);
});

test('builtin import works with target', () => {
  const result = compileLoomSource(`
import math

result = math.add(a: 1, b: 2)
`, { target: 'cli' });

  assert.equal(result.ok, true);
});

test('unknown builtin-like import fails without registries', () => {
  const result = compileLoomSource(`
import madeup

result = madeup.node()
`);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'UNKNOWN_IMPORT'));
});
