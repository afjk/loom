import { LoomError, RestrictedDSLEvaluator, coerceFiniteNumber, getNodeFs, getNodePath, inspectValue, resolveStateInputValue, sanitizeStateValue, stringifyJsonValue, stringifyTextValue, toArray } from './helpers.js';

const SEMANTIC_COMPONENTS = new Set(['right', 'up', 'front']);

function readSemanticComponent(value, component) {
  if (!SEMANTIC_COMPONENTS.has(component)) {
    return undefined;
  }
  if (value != null && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, component)) {
    return value[component];
  }
  return undefined;
}

export function registerCoreNodes(registry) {
  registry.registerNodeType('input', {
    category: 'source',
    effects: ['InputRead'],
    requires: ['env.input@1'],
    reads: ['env.input'],
    determinism: 'deterministic-with-env',
    inputs: [
      { name: 'name', type: 'string', default: '', kind: 'behavior' },
      { name: 'default', type: 'any', default: null, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
    params: [],
    evaluate: (inputs, params, ctx) => {
      const inputsMap = ctx.env?.inputs;
      const name = String(inputs.name ?? '');
      if (inputsMap && typeof inputsMap === 'object' &&
          Object.prototype.hasOwnProperty.call(inputsMap, name)) {
        return { out: inputsMap[name] };
      }
      return { out: inputs.default };
    }
  });
  registry.registerNodeType('clock', {
    category: 'source',
    effects: ['TimeRead'],
    requires: ['env.time.seconds@1'],
    reads: ['env.time.seconds'],
    determinism: 'deterministic-with-env',
    inputs: [],
    outputs: [{ name: 't', type: 'number', kind: 'behavior' }],
    params: [],
    evaluate: (inputs, params, ctx) => {
      if (!Number.isFinite(ctx.env?.time)) {
        throw new LoomError('MISSING_ENV_TIME', 'clock requires env.time in the evaluation environment', { reason: 'env.time' });
      }
      return { t: ctx.env.time };
    }
  });
  registry.registerNodeType('onEvent', {
    category: 'source',
    effects: ['EventRead'],
    requires: ['env.events@1'],
    reads: ['env.events'],
    determinism: 'deterministic-with-env',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<any>', kind: 'event' }],
    params: [
      { name: 'channel', type: 'string', default: '' },
      { name: 'targetMode', type: 'string', default: 'scopeDefault' },
      { name: 'target', type: 'string', default: undefined }
    ],
    evaluate: (inputs, params, ctx) => {
      const events = Array.isArray(ctx.env?.events) ? ctx.env.events : [];
      const targetMode = params.targetMode ?? 'scopeDefault';

      if (targetMode === 'explicit' && (params.target === undefined || params.target === null)) {
        throw new LoomError('INVALID_ONEVENT_PARAMS', 'onEvent: targetMode="explicit" requires params.target to be set', {
          reason: 'onEvent.targetMode.explicit.missingTarget'
        });
      }

      const scope = ctx.env?.scope;
      const scopeType = scope?.type;
      const scopeId = scope?.id;

      let effectiveMode = targetMode;
      if (targetMode === 'scopeDefault') {
        if (scopeType === 'object') {
          effectiveMode = 'self';
        } else {
          effectiveMode = 'any';
        }
      }

      return {
        event: events.filter((event) => {
          if (event.channel !== params.channel) return false;
          if (effectiveMode === 'any') return true;
          if (effectiveMode === 'self') {
            if (scopeId === undefined || scopeId === null) return false;
            return event.target === scopeId;
          }
          if (effectiveMode === 'explicit') {
            return event.target === params.target;
          }
          return true;
        })
      };
    }
  });
  registry.registerNodeType('risingEdge', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'boolean', default: false, kind: 'behavior' }],
    outputs: [{ name: 'event', type: 'event<void>', kind: 'event' }],
    params: [{ name: 'value', type: 'boolean', default: false }],
    evaluate: (inputs, params, ctx) => {
      const hasPrevious = ctx.state.get('hasPrevious', false);
      const previous = ctx.state.get('previous', undefined);
      const current = Boolean(inputs.value);
      const shouldEmit = hasPrevious && previous === false && current === true;

      ctx.state.set('previous', current);
      ctx.state.set('hasPrevious', true);

      return shouldEmit ? { event: [{ timestamp: ctx.env?.time }] } : { event: [] };
    }
  });
  registry.registerNodeType('fallingEdge', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'boolean', default: false, kind: 'behavior' }],
    outputs: [{ name: 'event', type: 'event<void>', kind: 'event' }],
    params: [{ name: 'value', type: 'boolean', default: false }],
    evaluate: (inputs, params, ctx) => {
      const hasPrevious = ctx.state.get('hasPrevious', false);
      const previous = ctx.state.get('previous', undefined);
      const current = Boolean(inputs.value);
      const shouldEmit = hasPrevious && previous === true && current === false;

      ctx.state.set('previous', current);
      ctx.state.set('hasPrevious', true);

      return shouldEmit ? { event: [{ timestamp: ctx.env?.time }] } : { event: [] };
    }
  });
  registry.registerNodeType('sendEvent', {
    category: 'sink',
    effects: ['EventWrite'],
    requires: ['event.emit@1'],
    writes: ['event.outbound'],
    determinism: 'deterministic-with-env',
    inputs: [
      { name: 'trigger', type: 'event<any>', kind: 'event' },
      { name: 'payload', type: 'any', default: undefined, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'channel', type: 'string', default: '' },
      { name: 'target', type: 'string', default: undefined }
    ],
    evaluate: (inputs, params, ctx) => {
      const triggers = Array.isArray(inputs.trigger) ? inputs.trigger : [];
      const hasPayload = inputs.payload !== undefined;
      const hasTarget = params.target !== undefined;
      const hasTimestampHint = Number.isFinite(ctx.env?.time);
      for (let i = 0; i < triggers.length; i += 1) {
        ctx.engine?._recordEffect({
          kind: 'event.send',
          channel: params.channel,
          ...(hasPayload ? { payload: inputs.payload } : {}),
          ...(hasTarget ? { target: params.target } : {}),
          ...(hasTimestampHint ? { timestampHint: ctx.env.time } : {})
        });
      }
      return {};
    }
  });
  registry.registerNodeType('console.error', {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.error', level: 'error', value: inputs.value, nodeId: ctx.currentNodeId });
      return {};
    }
  });
  registry.registerNodeType('console.log', {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.log', level: 'log', value: inputs.value, nodeId: ctx.currentNodeId });
      return {};
    }
  });
  registry.registerNodeType('console.table', {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.table', level: 'table', value: inputs.value, nodeId: ctx.currentNodeId });
      if (typeof console.table === 'function' && ctx.emitConsole === true) console.table(inputs.value);
      return {};
    }
  });
  registry.registerNodeType('console.warn', {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.warn', level: 'warn', value: inputs.value, nodeId: ctx.currentNodeId });
      return {};
    }
  });
  registry.registerNodeType('constant', {
    category: 'source',
    inputs: [],
    outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: 0 }],
    evaluate: (inputs, params, ctx) => ({ out: params.value })
  });
  registry.registerNodeType('debug.assert', { category: 'transform', inputs: [{ name: 'condition', type: 'any', default: false, kind: 'behavior' }, { name: 'message', type: 'string', default: 'Assertion failed', kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'condition', type: 'any', default: false }, { name: 'message', type: 'string', default: 'Assertion failed' }], evaluate: (inputs) => { if (!inputs.condition) throw new LoomError('ASSERTION_FAILED', stringifyTextValue(inputs.message) || 'Assertion failed'); return { out: true }; } });
  registry.registerNodeType('debug.inspect', { category: 'transform', inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }], outputs: [{ name: 'out', type: 'string', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: null }], evaluate: (inputs) => ({ out: inspectValue(inputs.value) }) });
  registry.registerNodeType('debug.trace', { category: 'transform', inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }, { name: 'label', type: 'string', default: 'trace', kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: null }, { name: 'label', type: 'string', default: 'trace' }], evaluate: (inputs, params, ctx) => { ctx.engine?._recordEffect({ type: 'debug.trace', label: inputs.label, value: inputs.value, nodeId: ctx.currentNodeId }); return { out: inputs.value }; } });
  registry.registerNodeType('getComponent', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
    params: [{ name: 'component', type: 'string', default: 'right' }],
    evaluate: (inputs, params) => {
      const component = String(params.component ?? '');
      return { out: readSemanticComponent(inputs.value, component) };
    }
  });
  registry.registerNodeType('swizzle', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'array', kind: 'behavior' }],
    params: [{ name: 'components', type: 'array', default: [] }],
    evaluate: (inputs, params) => {
      const components = Array.isArray(params.components) ? params.components : [];
      return {
        out: components.map((component) => readSemanticComponent(inputs.value, String(component ?? '')))
      };
    }
  });
  registry.registerNodeType('delay1', {
    category: 'state',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'initial', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
      const value = resolveStateInputValue(inputs.value, params.initial);
      return { out: prevOut, _newState: value };
    }
  });
  registry.registerNodeType('filter', {
    category: 'transform',
    inputs: [{ name: 'event', type: 'event<any>', kind: 'event' }],
    outputs: [{ name: 'event', type: 'event<any>', kind: 'event' }],
    params: [{ name: 'predicate', type: 'string', default: 'true' }],
    evaluate: (inputs, params, ctx) => {
      const eventPayloads = inputs.event || [];
      if (!Array.isArray(eventPayloads)) {
        return { event: [] };
      }

      // predicate をパース・キャッシュ
      if (!ctx.nodePredicates) ctx.nodePredicates = new Map();
      const cacheKey = params.predicate;
      let evaluator = ctx.nodePredicates.get(cacheKey);
      if (!evaluator) {
        try {
          const dslEval = new RestrictedDSLEvaluator(params.predicate);
          evaluator = dslEval.evaluate();
          ctx.nodePredicates.set(cacheKey, evaluator);
        } catch (e) {
          throw e; // DSL パースエラーは LoomError で既にラップされている
        }
      }

      const filtered = eventPayloads.filter(payload => {
        try {
          return evaluator(payload);
        } catch (e) {
          return false;
        }
      });

      return { event: filtered };
    }
  });
  registry.registerNodeType('fs.exists', { category: 'source', inputs: [{ name: 'path', type: 'string', default: '', kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'path', type: 'string', default: '' }], evaluate: (inputs) => ({ out: getNodeFs().existsSync(String(inputs.path)) }) });
  registry.registerNodeType('fs.list', { category: 'source', inputs: [{ name: 'path', type: 'string', default: '.', kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'path', type: 'string', default: '.' }], evaluate: (inputs) => ({ out: getNodeFs().readdirSync(String(inputs.path)) }) });
  registry.registerNodeType('fs.readText', { category: 'source', inputs: [{ name: 'path', type: 'string', default: '', kind: 'behavior' }], outputs: [{ name: 'out', type: 'string', kind: 'behavior' }], params: [{ name: 'path', type: 'string', default: '' }], evaluate: (inputs) => ({ out: getNodeFs().readFileSync(String(inputs.path), 'utf8') }) });
  registry.registerNodeType('fs.writeText', { category: 'sink', inputs: [{ name: 'path', type: 'string', default: '', kind: 'behavior' }, { name: 'value', type: 'any', default: '', kind: 'behavior' }], outputs: [], params: [{ name: 'path', type: 'string', default: '' }, { name: 'value', type: 'any', default: '' }], evaluate: (inputs) => { const fs = getNodeFs(); const path = getNodePath(); fs.mkdirSync(path.dirname(String(inputs.path)), { recursive: true }); fs.writeFileSync(String(inputs.path), stringifyTextValue(inputs.value), 'utf8'); return {}; } });
  registry.registerNodeType('integrate', {
    category: 'state',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'initial', type: 'number', default: 0 },
      { name: 'min', type: 'number|null', default: null },
      { name: 'max', type: 'number|null', default: null }
    ],
    evaluate: (inputs, params, ctx) => {
      const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
      const value = resolveStateInputValue(inputs.value, 0);
      const min = params.min === null ? null : coerceFiniteNumber(params.min, null);
      const max = params.max === null ? null : coerceFiniteNumber(params.max, null);
      let out = prevOut + value * ctx.dt;
      if (min !== null && out < min) out = min;
      if (max !== null && out > max) out = max;
      return { out };
    }
  });
  registry.registerNodeType('json.parse', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => {
      try {
        return { out: JSON.parse(String(inputs.value ?? '')) };
      } catch (error) {
        throw new LoomError('INVALID_JSON', `JSON parse failed: ${error.message}`);
      }
    }
  });
  registry.registerNodeType('json.stringify', {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'any', default: null },
      { name: 'pretty', type: 'boolean', default: false }
    ],
    evaluate: (inputs, params) => ({ out: stringifyJsonValue(inputs.value, params.pretty === true) })
  });
  registry.registerNodeType('log', {
    category: 'output',
    inputs: [
      { name: 'value', type: 'any', default: undefined, kind: 'behavior' }
    ],
    outputs: [
      { name: 'value', type: 'any', kind: 'behavior' }
    ],
    params: [
      { name: 'label', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      const label = params.label ?? '';
      const message = label ? `${label}: ${inspectValue(inputs.value)}` : inspectValue(inputs.value);
      ctx.engine?._recordEffect({ type: 'log', message, nodeId: ctx.currentNodeId });
      return { value: inputs.value };
    }
  });
  registry.registerNodeType('lowpass', {
    category: 'state',
    inputs: [
      { name: 'value', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'number', default: 0 },
      { name: 'tau', type: 'number', default: 0.2 },
      { name: 'initial', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
      const value = resolveStateInputValue(inputs.value, params.initial);
      const tau = coerceFiniteNumber(params.tau, 0.2);
      const factor = tau <= 0 ? 1 : ctx.dt / (tau + ctx.dt);
      return { out: prevOut + (value - prevOut) * factor };
    }
  });
  registry.registerNodeType('merge', {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'event<any>', kind: 'event' },
      { name: 'b', type: 'event<any>', kind: 'event' }
    ],
    outputs: [{ name: 'event', type: 'event<any>', kind: 'event' }],
    params: [],
    evaluate: (inputs, params, ctx) => {
      const aPayloads = inputs.a || [];
      const bPayloads = inputs.b || [];

      const merged = [
        ...(Array.isArray(aPayloads) ? aPayloads : []),
        ...(Array.isArray(bPayloads) ? bPayloads : [])
      ];

      return { event: merged };
    }
  });
  registry.registerNodeType('random.choice', { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => { const list = toArray(inputs.list); return { out: list.length ? list[Math.floor(Math.random() * list.length)] : null }; } });
  registry.registerNodeType('random.int', { category: 'transform', inputs: [{ name: 'min', type: 'number', default: 0, kind: 'behavior' }, { name: 'max', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'min', type: 'number', default: 0 }, { name: 'max', type: 'number', default: 1 }], evaluate: (inputs) => { const min = Math.ceil(Math.min(inputs.min, inputs.max)); const max = Math.floor(Math.max(inputs.min, inputs.max)); return { out: Math.floor(Math.random() * (max - min + 1)) + min }; } });
  registry.registerNodeType('random.range', { category: 'transform', inputs: [{ name: 'min', type: 'number', default: 0, kind: 'behavior' }, { name: 'max', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'min', type: 'number', default: 0 }, { name: 'max', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.min + Math.random() * (inputs.max - inputs.min) }) });
  registry.registerNodeType('random.value', { category: 'source', inputs: [], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [], evaluate: () => ({ out: Math.random() }) });
  registry.registerNodeType('sample', {
    category: 'transform',
    inputs: [
      { name: 'trigger', type: 'event<void>', kind: 'event' },
      { name: 'value', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'event', type: 'event<number>', kind: 'event' }],
    params: [],
    evaluate: (inputs, params, ctx) => {
      const triggers = inputs.trigger || [];
      const value = inputs.value;

      if (!Array.isArray(triggers)) {
        return { event: [] };
      }

      // trigger が複数回発火した場合、その回数分 value をペイロードに積む
      const sampled = triggers.map(() => value);
      return { event: sampled };
    }
  });
}
