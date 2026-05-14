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

export const loomletMetadata = {
  demo: {
    name: 'demo',
    description: 'Demo package nodes for trusted local package tests.',
    targets: ['cli', 'web', 'scenesync'],
    functions: {
      double: {
        name: 'double',
        signature: 'demo.double(value: 0)',
        description: 'Doubles a numeric value.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: false,
            description: 'Input value.'
          }
        ],
        returns: 'number',
        targets: ['cli', 'web', 'scenesync'],
        examples: [
          'result = demo.double(value: 5)'
        ]
      },
      offset: {
        name: 'offset',
        signature: 'demo.offset(value, amount: 1)',
        description: 'Adds an offset amount to a numeric value.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: true,
            description: 'Input value.'
          },
          {
            name: 'amount',
            type: 'number',
            positional: false,
            description: 'Offset amount.'
          }
        ],
        returns: 'number',
        targets: ['cli', 'web', 'scenesync'],
        examples: [
          'result = demo.offset(5, amount: 3)'
        ]
      }
    }
  }
};
