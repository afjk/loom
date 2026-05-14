import test from 'node:test';
import assert from 'node:assert/strict';
import { createNodeRegistry } from '../src/runtime/node-registry.js';
import { registerBuiltinNodes } from '../src/nodes/index.js';
import { NODE_TYPES, createDefaultNodeRegistry, DEFAULT_NODE_REGISTRY } from '../src/loom.js';

test('registerBuiltinNodes registers the same node names as NODE_TYPES', () => {
  const registry = createNodeRegistry();
  registerBuiltinNodes(registry);

  const registryNodeTypes = registry.listNodeTypes();
  const nodeTypesKeys = Object.keys(NODE_TYPES).sort();

  assert.deepEqual(
    registryNodeTypes,
    nodeTypesKeys,
    'Registry node types should match NODE_TYPES keys'
  );
});

test('createDefaultNodeRegistry exposes built-in node types', () => {
  const registry = createDefaultNodeRegistry();

  const registryNodeTypes = registry.listNodeTypes();
  const nodeTypesKeys = Object.keys(NODE_TYPES).sort();

  assert.deepEqual(
    registryNodeTypes,
    nodeTypesKeys,
    'Default registry node types should match NODE_TYPES keys'
  );
});

test('built-in registration includes representative nodes', () => {
  const registry = createDefaultNodeRegistry();

  const representativeNodes = [
    'constant',
    'clock',
    'math.add',
    'logic.select',
    'text.upper',
    'scene.setPosition',
    'function.literal',
    'function.call'
  ];

  for (const nodeType of representativeNodes) {
    assert.equal(
      registry.hasNodeType(nodeType),
      true,
      `${nodeType} should be registered`
    );
  }
});

test('DEFAULT_NODE_REGISTRY is properly initialized', () => {
  assert(DEFAULT_NODE_REGISTRY, 'DEFAULT_NODE_REGISTRY should exist');

  const nodeTypes = DEFAULT_NODE_REGISTRY.listNodeTypes();
  assert(nodeTypes.length > 100, 'Should have more than 100 built-in nodes');

  // Check that key categories are present
  const hasCore = nodeTypes.some(n => ['constant', 'clock', 'filter', 'sample'].includes(n));
  const hasMath = nodeTypes.some(n => n.startsWith('math.'));
  const hasLogic = nodeTypes.some(n => n.startsWith('logic.'));
  const hasText = nodeTypes.some(n => n.startsWith('text.'));

  assert(hasCore, 'Should have core nodes');
  assert(hasMath, 'Should have math nodes');
  assert(hasLogic, 'Should have logic nodes');
  assert(hasText, 'Should have text nodes');
});
