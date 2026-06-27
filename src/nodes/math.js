import { coerceFiniteNumber, resolveStateInputValue, sanitizeStateValue } from './helpers.js';

export function evaluateFormula(formula, vars) {
  let pos = 0;
  const len = formula.length;
  const skip = () => { while (pos < len && (formula[pos] === ' ' || formula[pos] === '\t')) pos++; };
  const parseExpr = () => parseAdd();

  function parseAdd() {
    let left = parseMul();
    while (pos < len) {
      skip();
      const ch = formula[pos];
      if (ch === '+') { pos++; left = left + parseMul(); }
      else if (ch === '-') { pos++; left = left - parseMul(); }
      else break;
    }
    return left;
  }

  function parseMul() {
    let left = parseUnary();
    while (pos < len) {
      skip();
      const ch = formula[pos];
      if (ch === '*') { pos++; left = left * parseUnary(); }
      else if (ch === '/') { pos++; const r = parseUnary(); left = r === 0 ? 0 : left / r; }
      else if (ch === '%') { pos++; const r = parseUnary(); left = r === 0 ? 0 : ((left % r) + r) % r; }
      else break;
    }
    return left;
  }

  function parseUnary() {
    skip();
    if (formula[pos] === '-') { pos++; return -parseUnary(); }
    return parsePrimary();
  }

  function parsePrimary() {
    skip();
    if (formula[pos] === '(') {
      pos++;
      const val = parseExpr();
      skip();
      if (formula[pos] === ')') pos++;
      return val;
    }
    if (/\d/.test(formula[pos]) || (formula[pos] === '.' && pos + 1 < len && /\d/.test(formula[pos + 1]))) {
      let num = '';
      while (pos < len && /[\d.]/.test(formula[pos])) num += formula[pos++];
      if (pos < len && /[eE]/.test(formula[pos])) {
        num += formula[pos++];
        if (pos < len && /[+-]/.test(formula[pos])) num += formula[pos++];
        while (pos < len && /\d/.test(formula[pos])) num += formula[pos++];
      }
      return parseFloat(num);
    }
    if (/[a-zA-Z_]/.test(formula[pos])) {
      let name = '';
      while (pos < len && /[a-zA-Z0-9_]/.test(formula[pos])) name += formula[pos++];
      const v = vars[name];
      return typeof v === 'number' ? v : 0;
    }
    return 0;
  }

  return parseExpr();
}

export function registerMathNodes(registry) {
  registry.registerNodeType('abs', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: Math.abs(inputs.a) })
  });
  registry.registerNodeType('add', {
    category: 'transform',
    commutative: true,
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' },
      { name: 'b', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.a + inputs.b })
  });
  registry.registerNodeType('clamp', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' },
      { name: 'min', type: 'number', default: 0, kind: 'behavior' },
      { name: 'max', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'min', type: 'number', default: 0 },
      { name: 'max', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => ({
      out: inputs.min > inputs.max ? inputs.min : Math.max(inputs.min, Math.min(inputs.max, inputs.value))
    })
  });
  registry.registerNodeType('cosine', {
    category: 'transform',
    inputs: [
      { name: 't', type: 'number', default: 0, kind: 'behavior' },
      { name: 'freq', type: 'number', default: 1, kind: 'behavior' },
      { name: 'amplitude', type: 'number', default: 1, kind: 'behavior' },
      { name: 'phase', type: 'number', default: 0, kind: 'behavior' },
      { name: 'offset', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'freq', type: 'number', default: 1 },
      { name: 'amplitude', type: 'number', default: 1 },
      { name: 'phase', type: 'number', default: 0 },
      { name: 'offset', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const t = inputs.t;
      const freq = inputs.freq;
      const amplitude = inputs.amplitude;
      const phase = inputs.phase;
      const offset = inputs.offset;
      return { out: Math.cos(t * freq * 2 * Math.PI + phase) * amplitude + offset };
    }
  });
  registry.registerNodeType('divide', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.b === 0 ? 0 : inputs.a / inputs.b })
  });
  registry.registerNodeType('greaterThan', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' },
      { name: 'threshold', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'threshold', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.value > inputs.threshold })
  });
  registry.registerNodeType('lerp', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' },
      { name: 't', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 1 },
      { name: 't', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.a + (inputs.b - inputs.a) * inputs.t })
  });
  registry.registerNodeType('lessThan', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' },
      { name: 'threshold', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'threshold', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.value < inputs.threshold })
  });
  registry.registerNodeType('map', {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' },
      { name: 'inMin', type: 'number', default: 0, kind: 'behavior' },
      { name: 'inMax', type: 'number', default: 1, kind: 'behavior' },
      { name: 'outMin', type: 'number', default: 0, kind: 'behavior' },
      { name: 'outMax', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'inMin', type: 'number', default: 0 },
      { name: 'inMax', type: 'number', default: 1 },
      { name: 'outMin', type: 'number', default: 0 },
      { name: 'outMax', type: 'number', default: 1 },
      { name: 'clamp', type: 'boolean', default: false }
    ],
    evaluate: (inputs, params, ctx) => {
      const { value, inMin, inMax, outMin, outMax } = inputs;
      if (inMax === inMin) {
        return { out: outMin };
      }
      let t = (value - inMin) / (inMax - inMin);
      if (params.clamp === true) {
        t = Math.max(0, Math.min(1, t));
      }
      return { out: outMin + (outMax - outMin) * t };
    }
  });
  registry.registerNodeType('math.abs', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.abs(inputs.value) }) });
  registry.registerNodeType('math.add', { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.a + inputs.b }) });
  registry.registerNodeType('math.ceil', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.ceil(inputs.value) }) });
  registry.registerNodeType('math.clamp', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'min', type: 'number', default: 0, kind: 'behavior' }, { name: 'max', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'min', type: 'number', default: 0 }, { name: 'max', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.min > inputs.max ? inputs.min : Math.max(inputs.min, Math.min(inputs.max, inputs.value)) }) });
  registry.registerNodeType('math.cosine', { category: 'transform', inputs: [{ name: 't', type: 'number', default: 0, kind: 'behavior' }, { name: 'freq', type: 'number', default: 1, kind: 'behavior' }, { name: 'amplitude', type: 'number', default: 1, kind: 'behavior' }, { name: 'phase', type: 'number', default: 0, kind: 'behavior' }, { name: 'offset', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'freq', type: 'number', default: 1 }, { name: 'amplitude', type: 'number', default: 1 }, { name: 'phase', type: 'number', default: 0 }, { name: 'offset', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.cos(inputs.t * inputs.freq * 2 * Math.PI + inputs.phase) * inputs.amplitude + inputs.offset }) });
  registry.registerNodeType('math.divide', { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.b === 0 ? 0 : inputs.a / inputs.b }) });
  registry.registerNodeType('math.floor', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.floor(inputs.value) }) });
  registry.registerNodeType('math.lerp', { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }, { name: 't', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 1 }, { name: 't', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.a + (inputs.b - inputs.a) * inputs.t }) });
  registry.registerNodeType('math.map', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'inMin', type: 'number', default: 0, kind: 'behavior' }, { name: 'inMax', type: 'number', default: 1, kind: 'behavior' }, { name: 'outMin', type: 'number', default: 0, kind: 'behavior' }, { name: 'outMax', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'inMin', type: 'number', default: 0 }, { name: 'inMax', type: 'number', default: 1 }, { name: 'outMin', type: 'number', default: 0 }, { name: 'outMax', type: 'number', default: 1 }, { name: 'clamp', type: 'boolean', default: false }], evaluate: (inputs, params) => { if (inputs.inMax === inputs.inMin) return { out: inputs.outMin }; let t = (inputs.value - inputs.inMin) / (inputs.inMax - inputs.inMin); if (params.clamp === true) t = Math.max(0, Math.min(1, t)); return { out: inputs.outMin + (inputs.outMax - inputs.outMin) * t }; } });
  registry.registerNodeType('math.max', { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.max(inputs.a, inputs.b) }) });
  registry.registerNodeType('math.min', { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.min(inputs.a, inputs.b) }) });
  registry.registerNodeType('math.mod', { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.b === 0 ? 0 : ((inputs.a % inputs.b) + inputs.b) % inputs.b }) });
  registry.registerNodeType('math.multiply', { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 1, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 1 }, { name: 'b', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.a * inputs.b }) });
  registry.registerNodeType('math.pow', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'exponent', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'exponent', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: Math.pow(inputs.value, inputs.exponent) }) });
  registry.registerNodeType('math.round', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.round(inputs.value) }) });
  registry.registerNodeType('math.sine', {
    category: 'transform',
    inputs: [
      { name: 't', type: 'number', default: 0, kind: 'behavior' },
      { name: 'freq', type: 'number', default: 1, kind: 'behavior' },
      { name: 'amplitude', type: 'number', default: 1, kind: 'behavior' },
      { name: 'offset', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'freq', type: 'number', default: 1 },
      { name: 'amplitude', type: 'number', default: 1 },
      { name: 'offset', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const t = inputs.t;
      const freq = inputs.freq;
      const amplitude = inputs.amplitude;
      const offset = inputs.offset;
      return { out: Math.sin(t * freq * 2 * Math.PI) * amplitude + offset };
    }
  });
  registry.registerNodeType('math.smoothstep', { category: 'transform', inputs: [{ name: 'x', type: 'number', default: 0, kind: 'behavior' }, { name: 'edge0', type: 'number', default: 0, kind: 'behavior' }, { name: 'edge1', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'x', type: 'number', default: 0 }, { name: 'edge0', type: 'number', default: 0 }, { name: 'edge1', type: 'number', default: 1 }], evaluate: (inputs) => { if (inputs.edge0 === inputs.edge1) return { out: inputs.x < inputs.edge0 ? 0 : 1 }; let t = (inputs.x - inputs.edge0) / (inputs.edge1 - inputs.edge0); t = Math.max(0, Math.min(1, t)); return { out: t * t * (3 - 2 * t) }; } });
  registry.registerNodeType('math.sqrt', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.sqrt(inputs.value) }) });
  registry.registerNodeType('math.subtract', { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.a - inputs.b }) });
  registry.registerNodeType('math.tan', { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.tan(inputs.value) }) });
  registry.registerNodeType('mod', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.b === 0 ? 0 : ((inputs.a % inputs.b) + inputs.b) % inputs.b })
  });
  registry.registerNodeType('multiply', {
    category: 'transform',
    commutative: true,
    inputs: [
      { name: 'a', type: 'number', default: 1, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 1 },
      { name: 'b', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.a * inputs.b })
  });
  registry.registerNodeType('negate', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: -inputs.a })
  });
  registry.registerNodeType('sine', {
    category: 'transform',
    inputs: [
      { name: 't', type: 'number', default: 0, kind: 'behavior' },
      { name: 'freq', type: 'number', default: 1, kind: 'behavior' },
      { name: 'amplitude', type: 'number', default: 1, kind: 'behavior' },
      { name: 'phase', type: 'number', default: 0, kind: 'behavior' },
      { name: 'offset', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'freq', type: 'number', default: 1 },
      { name: 'amplitude', type: 'number', default: 1 },
      { name: 'phase', type: 'number', default: 0 },
      { name: 'offset', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const t = inputs.t;
      const freq = inputs.freq;
      const amplitude = inputs.amplitude;
      const phase = inputs.phase;
      const offset = inputs.offset;
      return { out: Math.sin(t * freq * 2 * Math.PI + phase) * amplitude + offset };
    }
  });
  registry.registerNodeType('smoothLerp', {
    category: 'state',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'rate', type: 'number', default: 5 },
      { name: 'initial', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
      const value = resolveStateInputValue(inputs.value, params.initial);
      const rate = coerceFiniteNumber(params.rate, 5);
      const factor = 1 - Math.exp(-rate * ctx.dt);
      return { out: prevOut + (value - prevOut) * factor };
    }
  });
  registry.registerNodeType('smoothstep', {
    category: 'transform',
    inputs: [
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'edge0', type: 'number', default: 0, kind: 'behavior' },
      { name: 'edge1', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'x', type: 'number', default: 0 },
      { name: 'edge0', type: 'number', default: 0 },
      { name: 'edge1', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => {
      const { x, edge0, edge1 } = inputs;
      if (edge0 === edge1) {
        return { out: x < edge0 ? 0 : 1 };
      }
      let t = (x - edge0) / (edge1 - edge0);
      t = Math.max(0, Math.min(1, t));
      return { out: t * t * (3 - 2 * t) };
    }
  });
  registry.registerNodeType('subtract', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' },
      { name: 'b', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.a - inputs.b })
  });
  registry.registerNodeType('formula', {
    category: 'transform',
    dynamicInputs: true,
    inputs: [],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [{ name: 'formula', type: 'string', default: '0' }],
    evaluate: (inputs, params) => ({ out: evaluateFormula(params.formula, inputs) })
  });
}