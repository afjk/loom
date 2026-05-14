export function registerLoomletPackage(registry) {
  registry.registerNodeType('demo.double', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' }
    ],
    params: [
      { name: 'value', type: 'number', default: 0 }
    ],
    outputs: [
      { name: 'out', type: 'number', kind: 'behavior' }
    ],
    evaluate(inputs) {
      return { out: inputs.value * 2 };
    }
  });

  registry.registerNodeType('demo.offset', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' },
      { name: 'amount', type: 'number', default: 1, kind: 'behavior' }
    ],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'amount', type: 'number', default: 1 }
    ],
    outputs: [
      { name: 'out', type: 'number', kind: 'behavior' }
    ],
    evaluate(inputs) {
      return { out: inputs.value + inputs.amount };
    }
  });
}
