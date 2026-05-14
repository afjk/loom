import { assertLoomletCallable, collectInputs, createLoomletFunction } from './helpers.js';

export function registerFunctionNodes(registry) {
  registry.registerNodeType('function.call', {
    category: 'transform',
    inputs: [
      { name: 'fn', type: 'function', default: null, kind: 'behavior' },
      ...Array.from({ length: 8 }, (_, i) => ({ name: `arg${i + 1}`, type: 'any', default: undefined, kind: 'behavior' }))
    ],
    outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
    params: [],
    evaluate: (inputs, params, ctx) => {
      const fn = assertLoomletCallable(inputs.fn, 'function.call');
      return { out: fn.call(collectInputs(inputs, Array.from({ length: 8 }, (_, i) => `arg${i + 1}`)), ctx) };
    }
  });
  registry.registerNodeType('function.literal', {
    category: 'source',
    inputs: [],
    outputs: [{ name: 'out', type: 'function', kind: 'behavior' }],
    params: [
      { name: 'params', type: 'array', default: [] },
      { name: 'body', type: 'any', default: null },
      { name: 'closureRefs', type: 'object', default: {} }
    ],
    evaluate: (inputs, params, ctx) => ({ out: createLoomletFunction(params.params || [], params.body, params.closureRefs, ctx) })
  });
}