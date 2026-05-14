import test from 'node:test';
import assert from 'node:assert/strict';
import { NODE_TYPES } from '../src/loom.js';

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

const KNOWN_NO_EVALUATE_NODE_TYPES = new Set([
  // Keep empty if possible.
]);

test('runtime registry: NODE_TYPES exists', () => {
  assert.equal(typeof NODE_TYPES, 'object', 'NODE_TYPES should be an object');
  assert.ok(NODE_TYPES !== null, 'NODE_TYPES should not be null');
  assert.ok(Object.keys(NODE_TYPES).length > 0, 'NODE_TYPES should have at least one entry');

  // Check important existing nodes
  const importantNodes = [
    'constant',
    'clock',
    'math.add',
    'math.multiply',
    'logic.select',
    'scene.setPosition',
    'text.upper'
  ];

  for (const nodeName of importantNodes) {
    assert.ok(NODE_TYPES[nodeName], `NODE_TYPES should define "${nodeName}"`);
  }
});

test('runtime registry: every runtime node has minimum shape', () => {
  for (const [nodeType, def] of Object.entries(NODE_TYPES)) {
    assertNonEmptyString(def.category, `${nodeType}.category`);

    assert.ok(
      Array.isArray(def.inputs) || def.inputs === undefined,
      `${nodeType}.inputs should be an array or undefined`
    );
    const inputs = def.inputs ?? [];
    assert.ok(Array.isArray(inputs), `${nodeType}.inputs should be an array`);

    assert.ok(
      Array.isArray(def.outputs) || def.outputs === undefined,
      `${nodeType}.outputs should be an array or undefined`
    );
    const outputs = def.outputs ?? [];
    assert.ok(Array.isArray(outputs), `${nodeType}.outputs should be an array`);

    assert.ok(
      Array.isArray(def.params) || def.params === undefined,
      `${nodeType}.params should be an array or undefined`
    );
    const params = def.params ?? [];
    assert.ok(Array.isArray(params), `${nodeType}.params should be an array`);

    if (!KNOWN_NO_EVALUATE_NODE_TYPES.has(nodeType)) {
      assert.equal(
        typeof def.evaluate,
        'function',
        `${nodeType}.evaluate should be a function`
      );
    }
  }
});

test('runtime registry: input / param / output entries have stable shape', () => {
  for (const [nodeType, def] of Object.entries(NODE_TYPES)) {
    const inputs = def.inputs ?? [];
    const params = def.params ?? [];
    const outputs = def.outputs ?? [];

    for (const input of inputs) {
      assertPortShape(input, `${nodeType}.inputs[${input.name}]`);
    }
    assertUniqueNames(inputs, `${nodeType}.inputs`);

    for (const param of params) {
      assertPortShape(param, `${nodeType}.params[${param.name}]`);
    }
    assertUniqueNames(params, `${nodeType}.params`);

    for (const output of outputs) {
      assertPortShape(output, `${nodeType}.outputs[${output.name}]`);
    }
    assertUniqueNames(outputs, `${nodeType}.outputs`);
  }
});

test('runtime registry: namespaced node types use library.function shape', () => {
  for (const nodeType of Object.keys(NODE_TYPES)) {
    if (nodeType.includes('.')) {
      const [library, functionName] = nodeType.split('.');
      assert.equal(
        nodeType.split('.').length,
        2,
        `${nodeType} should have exactly one dot`
      );
      assertNonEmptyString(library, `${nodeType} library part`);
      assertNonEmptyString(functionName, `${nodeType} function part`);
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
