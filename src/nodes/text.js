import { collectInputs, stringifyTextValue, toArray } from './helpers.js';

export function registerTextNodes(registry) {
  registry.registerNodeType('text.concat', {
    category: 'transform',
    inputs: Array.from({ length: 8 }, (_, i) => ({ name: `value${i + 1}`, type: 'any', default: undefined, kind: 'behavior' })),
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: Array.from({ length: 8 }, (_, i) => ({ name: `value${i + 1}`, type: 'any', default: undefined })),
    evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 8 }, (_, i) => `value${i + 1}`)).map((value) => stringifyTextValue(value)).join('') })
  });
  registry.registerNodeType('text.endsWith', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }, { name: 'search', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'search', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).endsWith(stringifyTextValue(inputs.search)) })
  });
  registry.registerNodeType('text.includes', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }, { name: 'search', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'search', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).includes(stringifyTextValue(inputs.search)) })
  });
  registry.registerNodeType('text.isEmpty', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).length === 0 })
  });
  registry.registerNodeType('text.join', {
    category: 'transform',
    inputs: [
      { name: 'list', type: 'array', default: [], kind: 'behavior' },
      { name: 'separator', type: 'any', default: ',', kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'list', type: 'array', default: [] }, { name: 'separator', type: 'any', default: ',' }],
    evaluate: (inputs) => ({ out: toArray(inputs.list).map((value) => stringifyTextValue(value)).join(stringifyTextValue(inputs.separator)) })
  });
  registry.registerNodeType('text.length', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).length })
  });
  registry.registerNodeType('text.lower', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: String(inputs.value ?? '').toLowerCase() })
  });
  registry.registerNodeType('text.replace', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' },
      { name: 'search', type: 'any', default: '', kind: 'behavior' },
      { name: 'replacement', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'any', default: '' },
      { name: 'search', type: 'any', default: '' },
      { name: 'replacement', type: 'any', default: '' }
    ],
    evaluate: (inputs) => ({
      out: String(inputs.value ?? '').replaceAll(String(inputs.search ?? ''), String(inputs.replacement ?? ''))
    })
  });
  registry.registerNodeType('text.split', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' },
      { name: 'separator', type: 'any', default: ',', kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'array', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'separator', type: 'any', default: ',' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).split(stringifyTextValue(inputs.separator)) })
  });
  registry.registerNodeType('text.startsWith', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }, { name: 'search', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'search', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).startsWith(stringifyTextValue(inputs.search)) })
  });
  registry.registerNodeType('text.stringify', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: null }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value) })
  });
  registry.registerNodeType('text.trim', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: String(inputs.value ?? '').trim() })
  });
  registry.registerNodeType('text.upper', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: String(inputs.value ?? '').toUpperCase() })
  });
}