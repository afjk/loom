import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NODE_TYPES,
  DEFAULT_NODE_REGISTRY,
  createDefaultNodeRegistry
} from '../src/loom.js';

function assertNonEmptyString(value, label) {
  assert.equal(typeof value, 'string', `${label} should be a string`);
  assert.ok(value.length > 0, `${label} should not be empty`);
}

function assertUniqueNames(entries, label) {
  const names = entries.map((entry) => entry.name);
  assert.deepEqual(
    names,
    [...new Set(names)],
    `${label} should not contain duplicate names`
  );
}

function assertPortShape(port, label) {
  assertNonEmptyString(port.name, `${label}.name`);
  assertNonEmptyString(port.type, `${label}.type`);

  if ('kind' in port) {
    assertNonEmptyString(port.kind, `${label}.kind`);
  }
}

test('runtime registry: NODE_TYPES exists and is non-empty', () => {
  assert(typeof NODE_TYPES === 'object', 'NODE_TYPES should be an object');
  assert(NODE_TYPES !== null, 'NODE_TYPES should not be null');
  assert(Object.keys(NODE_TYPES).length > 0, 'NODE_TYPES should have at least one key');
});

test('runtime registry: important nodes are present', () => {
  const requiredNodes = [
    'constant',
    'clock',
    'math.add',
    'math.multiply',
    'logic.select',
    'scene.setPosition',
    'text.upper'
  ];

  for (const nodeType of requiredNodes) {
    assert(NODE_TYPES[nodeType], `NODE_TYPES should include "${nodeType}"`);
  }
});

test('runtime registry: every node has minimum shape', () => {
  const KNOWN_NO_EVALUATE_NODE_TYPES = new Set([
    // Keep empty if possible.
  ]);

  for (const [nodeType, def] of Object.entries(NODE_TYPES)) {
    assertNonEmptyString(def.category, `${nodeType}.category`);

    assert(Array.isArray(def.inputs) || def.inputs === undefined, `${nodeType}.inputs should be an array or undefined`);
    assert(Array.isArray(def.outputs) || def.outputs === undefined, `${nodeType}.outputs should be an array or undefined`);
    assert(Array.isArray(def.params) || def.params === undefined, `${nodeType}.params should be an array or undefined`);

    if (!KNOWN_NO_EVALUATE_NODE_TYPES.has(nodeType)) {
      assert.equal(typeof def.evaluate, 'function', `${nodeType}.evaluate should be a function`);
    }
  }
});

test('runtime registry: input/param/output entries have stable shape', () => {
  for (const [nodeType, def] of Object.entries(NODE_TYPES)) {
    const inputs = def.inputs ?? [];
    const params = def.params ?? [];
    const outputs = def.outputs ?? [];

    for (const input of inputs) {
      assertPortShape(input, `${nodeType}.input`);
    }

    for (const param of params) {
      assertPortShape(param, `${nodeType}.param`);
    }

    for (const output of outputs) {
      assertPortShape(output, `${nodeType}.output`);
    }

    assertUniqueNames(inputs, `${nodeType}.inputs`);
    assertUniqueNames(params, `${nodeType}.params`);
    assertUniqueNames(outputs, `${nodeType}.outputs`);
  }
});

test('runtime registry: namespaced node types use library.function shape', () => {
  for (const nodeType of Object.keys(NODE_TYPES)) {
    if (nodeType.includes('.')) {
      const parts = nodeType.split('.');
      assert.equal(parts.length, 2, `${nodeType} should have exactly two parts separated by a dot`);
      assert(parts[0].length > 0, `${nodeType} library part should not be empty`);
      assert(parts[1].length > 0, `${nodeType} function part should not be empty`);
    }
  }
});

test('runtime registry: math.add shape is stable', () => {
  const add = NODE_TYPES['math.add'];
  assert.deepEqual(add.inputs.map((input) => input.name), ['a', 'b']);
  assert.deepEqual(add.params.map((param) => param.name), ['a', 'b']);
  assert.deepEqual(add.outputs.map((output) => output.name), ['out']);
  assert.equal(typeof add.evaluate, 'function');
});

test('runtime registry: scene.setPosition shape is stable', () => {
  const setPosition = NODE_TYPES['scene.setPosition'];
  assert.deepEqual(setPosition.inputs.map((input) => input.name), ['objectId', 'x', 'y', 'z']);
  assert.deepEqual(setPosition.params.map((param) => param.name), ['objectId', 'x', 'y', 'z']);
  assert.deepEqual(setPosition.outputs.map((output) => output.name), []);
  assert.equal(typeof setPosition.evaluate, 'function');
});

test('runtime registry: default registry matches NODE_TYPES export', () => {
  assert.deepEqual(
    DEFAULT_NODE_REGISTRY.listNodeTypes(),
    Object.keys(NODE_TYPES).sort()
  );
});

test('runtime registry: DEFAULT_NODE_REGISTRY exposes all node types from NODE_TYPES', () => {
  const registryNodeTypes = DEFAULT_NODE_REGISTRY.toObject();
  assert.deepEqual(registryNodeTypes, NODE_TYPES);
});

test('runtime registry: createDefaultNodeRegistry returns fresh registry', () => {
  const a = createDefaultNodeRegistry();
  const b = createDefaultNodeRegistry();

  assert.notEqual(a, b);
  assert.deepEqual(a.listNodeTypes(), b.listNodeTypes());
});

test('runtime registry: createDefaultNodeRegistry has correct node types', () => {
  const registry = createDefaultNodeRegistry();
  assert.ok(registry.hasNodeType('math.add'));
  assert.ok(registry.hasNodeType('logic.select'));
  assert.ok(registry.hasNodeType('constant'));
});

test('runtime registry: registry preserves node definitions', () => {
  const mathAdd = DEFAULT_NODE_REGISTRY.getNodeType('math.add');
  assert.ok(mathAdd);
  assert.equal(mathAdd.category, 'transform');
  assert.equal(typeof mathAdd.evaluate, 'function');
  assert.ok(Array.isArray(mathAdd.inputs));
  assert.ok(Array.isArray(mathAdd.params));
  assert.ok(Array.isArray(mathAdd.outputs));
});
