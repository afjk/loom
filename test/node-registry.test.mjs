import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createNodeRegistry,
  validateNodeTypeDefinition
} from '../src/runtime/node-registry.js';

test('node registry registers and reads node type', () => {
  const registry = createNodeRegistry();

  const definition = {
    category: 'transform',
    inputs: [{ name: 'a', type: 'number' }],
    params: [{ name: 'a', type: 'number', default: 0 }],
    outputs: [{ name: 'out', type: 'number' }],
    evaluate(inputs) {
      return { out: inputs.a };
    }
  };

  const registered = registry.registerNodeType('test.echo', definition);

  assert.equal(registry.hasNodeType('test.echo'), true);
  assert.deepEqual(registry.getNodeType('test.echo'), registered);
  assert.deepEqual(registry.listNodeTypes(), ['test.echo']);
});

test('node registry initializes from object', () => {
  const registry = createNodeRegistry({
    'test.one': {
      category: 'source',
      inputs: [],
      params: [],
      outputs: [{ name: 'out', type: 'number' }],
      evaluate() {
        return { out: 1 };
      }
    }
  });

  assert.equal(registry.hasNodeType('test.one'), true);
});

test('node registry rejects duplicate node types', () => {
  const registry = createNodeRegistry();
  const definition = {
    category: 'source',
    inputs: [],
    params: [],
    outputs: [],
    evaluate() {
      return {};
    }
  };

  registry.registerNodeType('test.dup', definition);

  assert.throws(
    () => registry.registerNodeType('test.dup', definition),
    /Duplicate node type/
  );
});

test('node registry rejects invalid node type names', () => {
  const registry = createNodeRegistry();
  const validDef = {
    category: 'source',
    inputs: [],
    params: [],
    outputs: [],
    evaluate() {
      return {};
    }
  };

  const invalidNames = ['', '   ', 'math add', '.add', 'math.'];

  for (const name of invalidNames) {
    assert.throws(
      () => registry.registerNodeType(name, validDef),
      TypeError,
      `Should reject invalid name: "${name}"`
    );
  }
});

test('node registry accepts valid node type names', () => {
  const registry = createNodeRegistry();
  const validDef = {
    category: 'source',
    inputs: [],
    params: [],
    outputs: [],
    evaluate() {
      return {};
    }
  };

  const validNames = ['math.add', 'logic.select', 'constant', 'clock', 'function.call'];

  for (const name of validNames) {
    const reg = createNodeRegistry();
    reg.registerNodeType(name, validDef);
    assert.equal(reg.hasNodeType(name), true, `Should accept valid name: "${name}"`);
  }
});

test('node registry validates definition shape', () => {
  const registry = createNodeRegistry();

  assert.throws(
    () => registry.registerNodeType('test.invalid', null),
    TypeError
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {}),
    TypeError
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: '',
      evaluate() {}
    }),
    TypeError
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source'
    }),
    TypeError
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      inputs: 'not-array',
      evaluate() {}
    }),
    TypeError
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      params: 'not-array',
      evaluate() {}
    }),
    TypeError
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      outputs: 'not-array',
      evaluate() {}
    }),
    TypeError
  );
});

test('node registry validates port shapes', () => {
  const registry = createNodeRegistry();

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      inputs: [{}],
      evaluate() {}
    }),
    /input name/
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      inputs: [{ name: 'a' }],
      evaluate() {}
    }),
    /input type/
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      outputs: [{ name: 'out', type: 'number', kind: '' }],
      evaluate() {}
    }),
    /output kind/
  );
});

test('node registry rejects duplicate port names', () => {
  const registry = createNodeRegistry();

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      inputs: [
        { name: 'a', type: 'number' },
        { name: 'a', type: 'number' }
      ],
      evaluate() {}
    }),
    /duplicate input name/
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      params: [
        { name: 'x', type: 'number' },
        { name: 'x', type: 'number' }
      ],
      evaluate() {}
    }),
    /duplicate param name/
  );

  assert.throws(
    () => registry.registerNodeType('test.invalid', {
      category: 'source',
      outputs: [
        { name: 'out', type: 'number' },
        { name: 'out', type: 'number' }
      ],
      evaluate() {}
    }),
    /duplicate output name/
  );
});

test('node registry normalizes missing input param output arrays', () => {
  const registry = createNodeRegistry();

  registry.registerNodeType('test.minimal', {
    category: 'source',
    evaluate() {
      return {};
    }
  });

  const def = registry.getNodeType('test.minimal');

  assert.deepEqual(def.inputs, []);
  assert.deepEqual(def.params, []);
  assert.deepEqual(def.outputs, []);
});

test('node registry toObject returns object copy', () => {
  const registry = createNodeRegistry();
  const def = {
    category: 'source',
    inputs: [],
    params: [],
    outputs: [],
    evaluate() {
      return {};
    }
  };

  registry.registerNodeType('test.node', def);

  const object = registry.toObject();

  assert.deepEqual(object['test.node'], def);

  object['test.other'] = def;
  assert.equal(registry.hasNodeType('test.other'), false);
});

test('node registry size property', () => {
  const registry = createNodeRegistry();
  assert.equal(registry.size, 0);

  const def = {
    category: 'source',
    inputs: [],
    params: [],
    outputs: [],
    evaluate() {
      return {};
    }
  };

  registry.registerNodeType('test.a', def);
  assert.equal(registry.size, 1);

  registry.registerNodeType('test.b', def);
  assert.equal(registry.size, 2);
});

test('node registry preserves definition evaluate function', () => {
  const registry = createNodeRegistry();

  const mockEvaluate = (inputs) => ({ out: inputs.a * 2 });

  registry.registerNodeType('test.double', {
    category: 'transform',
    inputs: [{ name: 'a', type: 'number' }],
    outputs: [{ name: 'out', type: 'number' }],
    evaluate: mockEvaluate
  });

  const def = registry.getNodeType('test.double');
  assert.equal(def.evaluate, mockEvaluate);
});
