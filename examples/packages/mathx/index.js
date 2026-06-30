// mathx: an example Loomlet package showing how to author your own functions.
//
// A Loomlet "function" (a node type) is just a JavaScript object with input,
// param, and output port descriptions plus an `evaluate()` implementation.
// Register one or more of them inside `registerLoomletPackage`, and they become
// callable from `.loom` source after `import mathx`.
//
// Load it with the CLI:
//   loomlet run file.loom --package ./examples/packages/mathx --get out.out
// or point --package at this index.js directly.

export function registerLoomletPackage(registry) {
  // mathx.clamp(value, min, max) -> constrain value to the [min, max] range.
  registry.registerNodeType('mathx.clamp', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' },
      { name: 'min', type: 'number', default: 0, kind: 'behavior' },
      { name: 'max', type: 'number', default: 1, kind: 'behavior' }
    ],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 1 }
    ],
    outputs: [
      { name: 'out', type: 'number', kind: 'behavior' }
    ],
    evaluate(inputs) {
      const { value, min, max } = inputs;
      return { out: Math.min(Math.max(value, min), max) };
    }
  });

  // mathx.lerp(a, b, t) -> linear interpolation between a and b by t in [0, 1].
  registry.registerNodeType('mathx.lerp', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' },
      { name: 't', type: 'number', default: 0, kind: 'behavior' }
    ],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 1 },
      { name: 't', type: 'number', default: 0 }
    ],
    outputs: [
      { name: 'out', type: 'number', kind: 'behavior' }
    ],
    evaluate(inputs) {
      const { a, b, t } = inputs;
      return { out: a + (b - a) * t };
    }
  });
}
