import test from 'node:test';
import assert from 'node:assert/strict';
import { Loom, NODE_TYPES } from '../src/loom.js';
import { parseDSL, parseDSLToAST, compileToGraph } from '../src/loom-dsl.js';
import { compileLoomSource } from '../src/toolchain/compile.js';
import { createNodeRegistry } from '../src/runtime/node-registry.js';
import { createLibraryMetadataRegistry } from '../src/toolchain/metadata-registry.js';
import { registerBuiltinNodes } from '../src/nodes/index.js';
import { registerTrustedPackage } from '../src/runtime/package-registration.js';
import * as demoPackage from '../examples/packages/demo/index.js';

function createDemoRegistry() {
  const registry = createNodeRegistry();
  registerBuiltinNodes(registry);
  registerTrustedPackage(registry, demoPackage);
  return registry;
}

test('package registry flow: demo nodes are not global by default', () => {
  assert.equal(NODE_TYPES['demo.double'], undefined);
});

test('package registry flow: compile fails without package registry', () => {
  const { ast, errors } = parseDSLToAST(`
import demo

result = demo.double(value: 5)
`);

  assert.deepEqual(errors, []);

  const compiled = compileToGraph(ast);

  assert.equal(compiled.errors.length, 1);
  assert.equal(compiled.errors[0].code, 'UNKNOWN_NODE_TYPE');
});

test('package registry flow: compile succeeds with package registry', () => {
  const registry = createDemoRegistry();

  const graph = parseDSL(`
import demo

result = demo.double(value: 5)
`, { nodeRegistry: registry });

  assert.equal(graph.nodes.some((node) => node.type === 'demo.double'), true);
});

test('package registry flow: runtime executes package node with custom registry', () => {
  const registry = createDemoRegistry();

  const graph = parseDSL(`
import demo

result = demo.double(value: 5)
`, { nodeRegistry: registry });

  const loom = new Loom(graph, { nodeRegistry: registry });
  loom.evaluateOnce();

  assert.equal(loom.getValue('result.out'), 10);
});

test('package registry flow: runtime rejects package node without custom registry', () => {
  const registry = createDemoRegistry();

  const graph = parseDSL(`
import demo

result = demo.double(value: 5)
`, { nodeRegistry: registry });

  assert.throws(
    () => new Loom(graph),
    /Unknown node type/
  );
});

test('package registry flow: package node composes with built-in nodes', () => {
  const registry = createDemoRegistry();

  const graph = parseDSL(`
import demo
import math

x = demo.double(value: 5)
result = math.add(a: x, b: 3)
`, { nodeRegistry: registry });

  const loom = new Loom(graph, { nodeRegistry: registry });
  loom.evaluateOnce();

  assert.equal(loom.getValue('result.out'), 13);
});

test('package registry flow: compile and runtime work with both node and metadata registries', () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);
  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  assert.equal(nodeRegistry.hasNodeType('demo.double'), true);
  assert.equal(metadataRegistry.hasLibraryMetadata('demo'), true);

  const graph = parseDSL(`
import demo
import math

x = demo.offset(value: 5, amount: 2)
result = math.add(a: x, b: 1)
`, { nodeRegistry });

  const loom = new Loom(graph, { nodeRegistry });
  loom.evaluateOnce();

  assert.equal(loom.getValue('result.out'), 8);
});

test('package registry flow: compileLoomSource compiles package node with registries', () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);
  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  const result = compileLoomSource(`
import demo

result = demo.double(value: 5)
`, {
    nodeRegistry,
    metadataRegistry
  });

  assert.equal(result.ok, true);

  const loom = new Loom(result.graph, { nodeRegistry });
  loom.evaluateOnce();

  assert.equal(loom.getValue('result.out'), 10);
});
