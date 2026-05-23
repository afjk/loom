// Loom: ブラウザで動くステートレスなデータフロー実行エンジン

import { createNodeRegistry } from './runtime/node-registry.js';
import { registerBuiltinNodes } from './nodes/index.js';

export class LoomError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LoomError';
    this.code = code;
    this.details = details;
  }
}

// 制限式 DSL パーサ・インタプリタ
export class RestrictedDSLEvaluator {
  static #SEMANTIC_COMPONENT_ALIASES = {
    r: 'right',
    u: 'up',
    f: 'front'
  };

  static #ALLOWED_VALUE_FIELDS = new Set([
    'x',
    'y',
    'right',
    'up',
    'front',
    ...Object.keys(RestrictedDSLEvaluator.#SEMANTIC_COMPONENT_ALIASES)
  ]);

  constructor(dslString, nodeId) {
    this.input = dslString;
    this.pos = 0;
    this.nodeId = nodeId;
  }

  error(msg) {
    throw new LoomError('INVALID_GRAPH', `DSL parse error: ${msg}`, {
      reason: 'filter.predicate',
      nodeId: this.nodeId,
      error: msg
    });
  }

  peek() {
    return this.input[this.pos];
  }

  advance() {
    this.pos++;
  }

  skipWhitespace() {
    while (this.pos < this.input.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  tokenize() {
    const tokens = [];
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.peek();

      // 数値
      if (/\d/.test(ch) || (ch === '-' && /\d/.test(this.input[this.pos + 1]))) {
        let num = '';
        if (ch === '-') {
          num += '-';
          this.advance();
        }
        while (this.pos < this.input.length && /[\d.]/.test(this.peek())) {
          num += this.peek();
          this.advance();
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(num) });
      }
      // 文字列（シングルクォート）
      else if (ch === "'") {
        this.advance();
        let str = '';
        while (this.pos < this.input.length && this.peek() !== "'") {
          str += this.peek();
          this.advance();
        }
        if (this.peek() !== "'") this.error('Unterminated string');
        this.advance();
        tokens.push({ type: 'STRING', value: str });
      }
      // 識別子・キーワード
      else if (/[a-zA-Z_]/.test(ch)) {
        let ident = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9_.]/.test(this.peek())) {
          ident += this.peek();
          this.advance();
        }
        if (ident === 'true') tokens.push({ type: 'BOOL', value: true });
        else if (ident === 'false') tokens.push({ type: 'BOOL', value: false });
        else tokens.push({ type: 'IDENT', value: ident });
      }
      // 演算子・括弧
      else if (ch === '(') {
        tokens.push({ type: 'LPAREN' });
        this.advance();
      } else if (ch === ')') {
        tokens.push({ type: 'RPAREN' });
        this.advance();
      } else if (ch === '!' && this.input[this.pos + 1] === '=') {
        tokens.push({ type: 'NE' });
        this.advance();
        this.advance();
      } else if (ch === '!') {
        tokens.push({ type: 'NOT' });
        this.advance();
      } else if (ch === '=' && this.input[this.pos + 1] === '=') {
        tokens.push({ type: 'EQ' });
        this.advance();
        this.advance();
      } else if (ch === '<' && this.input[this.pos + 1] === '=') {
        tokens.push({ type: 'LE' });
        this.advance();
        this.advance();
      } else if (ch === '<') {
        tokens.push({ type: 'LT' });
        this.advance();
      } else if (ch === '>' && this.input[this.pos + 1] === '=') {
        tokens.push({ type: 'GE' });
        this.advance();
        this.advance();
      } else if (ch === '>') {
        tokens.push({ type: 'GT' });
        this.advance();
      } else if (ch === '&' && this.input[this.pos + 1] === '&') {
        tokens.push({ type: 'AND' });
        this.advance();
        this.advance();
      } else if (ch === '|' && this.input[this.pos + 1] === '|') {
        tokens.push({ type: 'OR' });
        this.advance();
        this.advance();
      } else if (ch === '+') {
        tokens.push({ type: 'PLUS' });
        this.advance();
      } else if (ch === '-' && !/\d/.test(this.input[this.pos + 1])) {
        tokens.push({ type: 'MINUS' });
        this.advance();
      } else if (ch === '*') {
        tokens.push({ type: 'MUL' });
        this.advance();
      } else if (ch === '/') {
        tokens.push({ type: 'DIV' });
        this.advance();
      } else {
        this.error(`Unexpected character: ${ch}`);
      }
    }
    return tokens;
  }

  parse() {
    const tokens = this.tokenize();
    this.tokens = tokens;
    this.tokenPos = 0;
    return this.parseExpression();
  }

  currentToken() {
    return this.tokens[this.tokenPos];
  }

  consumeToken() {
    this.tokenPos++;
  }

  expect(type) {
    const tok = this.currentToken();
    if (!tok || tok.type !== type) {
      this.error(`Expected ${type}, got ${tok ? tok.type : 'EOF'}`);
    }
    this.consumeToken();
  }

  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.currentToken() && this.currentToken().type === 'OR') {
      this.consumeToken();
      const right = this.parseAnd();
      left = { type: 'binary', op: '||', left, right };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseComparison();
    while (this.currentToken() && this.currentToken().type === 'AND') {
      this.consumeToken();
      const right = this.parseComparison();
      left = { type: 'binary', op: '&&', left, right };
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAdditive();
    const tok = this.currentToken();
    if (tok && ['EQ', 'NE', 'LT', 'LE', 'GT', 'GE'].includes(tok.type)) {
      const opMap = { EQ: '==', NE: '!=', LT: '<', LE: '<=', GT: '>', GE: '>=' };
      const op = opMap[tok.type];
      this.consumeToken();
      const right = this.parseAdditive();
      return { type: 'binary', op, left, right };
    }
    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.currentToken() && ['PLUS', 'MINUS'].includes(this.currentToken().type)) {
      const op = this.currentToken().type === 'PLUS' ? '+' : '-';
      this.consumeToken();
      const right = this.parseMultiplicative();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();
    while (this.currentToken() && ['MUL', 'DIV'].includes(this.currentToken().type)) {
      const op = this.currentToken().type === 'MUL' ? '*' : '/';
      this.consumeToken();
      const right = this.parseUnary();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  parseUnary() {
    const tok = this.currentToken();
    if (tok && tok.type === 'NOT') {
      this.consumeToken();
      const operand = this.parseUnary();
      return { type: 'unary', op: '!', operand };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const tok = this.currentToken();
    if (!tok) this.error('Unexpected end of input');

    if (tok.type === 'NUMBER') {
      this.consumeToken();
      return { type: 'literal', value: tok.value };
    }
    if (tok.type === 'STRING') {
      this.consumeToken();
      return { type: 'literal', value: tok.value };
    }
    if (tok.type === 'BOOL') {
      this.consumeToken();
      return { type: 'literal', value: tok.value };
    }
    if (tok.type === 'IDENT') {
      const ident = tok.value;
      this.consumeToken();
      if (ident.includes('.')) {
        const parts = ident.split('.');
        if (parts.length === 2 && parts[0] === 'value' && RestrictedDSLEvaluator.#ALLOWED_VALUE_FIELDS.has(parts[1])) {
          const normalizedField = RestrictedDSLEvaluator.#SEMANTIC_COMPONENT_ALIASES[parts[1]] || parts[1];
          return { type: 'fieldAccess', object: 'value', field: normalizedField };
        }
        this.error(`Invalid field access: ${ident}`);
      }
      return { type: 'identifier', name: ident };
    }
    if (tok.type === 'LPAREN') {
      this.consumeToken();
      const expr = this.parseExpression();
      this.expect('RPAREN');
      return expr;
    }
    this.error(`Unexpected token: ${tok.type}`);
  }

  evaluate() {
    const ast = this.parse();
    return this.createEvaluator(ast);
  }

  createEvaluator(ast) {
    return (payload) => {
      return this.evalAst(ast, payload);
    };
  }

  evalAst(ast, payload) {
    if (ast.type === 'literal') {
      return ast.value;
    }
    if (ast.type === 'identifier') {
      if (ast.name === 'value') return payload;
      if (ast.name === 'key') return typeof payload === 'string' ? payload : undefined;
      return undefined;
    }
    if (ast.type === 'fieldAccess') {
      const obj = this.evalAst({ type: 'identifier', name: ast.object }, payload);
      if (obj != null && typeof obj === 'object') {
        return obj[ast.field];
      }
      return undefined;
    }
    if (ast.type === 'binary') {
      const left = this.evalAst(ast.left, payload);
      const right = this.evalAst(ast.right, payload);

      switch (ast.op) {
        case '==': return left === right;
        case '!=': return left !== right;
        case '<': return left < right;
        case '<=': return left <= right;
        case '>': return left > right;
        case '>=': return left >= right;
        case '&&': return this.isTruthy(left) && this.isTruthy(right);
        case '||': return this.isTruthy(left) || this.isTruthy(right);
        case '+':
          if (typeof left === 'number' && typeof right === 'number') return left + right;
          return undefined;
        case '-':
          if (typeof left === 'number' && typeof right === 'number') return left - right;
          return undefined;
        case '*':
          if (typeof left === 'number' && typeof right === 'number') return left * right;
          return undefined;
        case '/':
          if (typeof left === 'number' && typeof right === 'number' && right !== 0) {
            return left / right;
          }
          return undefined;
        default: return undefined;
      }
    }
    if (ast.type === 'unary') {
      const operand = this.evalAst(ast.operand, payload);
      if (ast.op === '!') return !this.isTruthy(operand);
      return undefined;
    }
    return undefined;
  }

  isTruthy(value) {
    return !(!value || value === 0 || value === '' || value === false || value === null || value === undefined);
  }
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function coerceFiniteNumber(value, fallback = 0) {
  return isFiniteNumber(value) ? value : fallback;
}

function resolveStateInputValue(value, fallback) {
  if (value === null || value === undefined) return fallback;
  return coerceFiniteNumber(value, 0);
}

function sanitizeStateValue(value, initial) {
  return isFiniteNumber(value) ? value : initial;
}

function stringifyJsonValue(value, pretty = false) {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}


function stringifyTextValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const json = JSON.stringify(value);
  return json === undefined ? '' : json;
}

function inspectValue(value) {
  const json = JSON.stringify(value, null, 2);
  return json === undefined ? String(value) : json;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectInputs(inputs, names) {
  return names.map((name) => inputs[name]).filter((value) => value !== undefined);
}

function unsupportedFunctionValueNode(name, outputType = 'array') {
  return {
    category: 'transform',
    inputs: [
      { name: 'list', type: 'array', default: [], kind: 'behavior' },
      { name: 'fn', type: 'function', default: null, kind: 'behavior' },
      { name: 'initial', type: 'any', default: null, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: outputType, kind: 'behavior' }],
    params: [
      { name: 'fn', type: 'function', default: null },
      { name: 'initial', type: 'any', default: null }
    ],
    evaluate: () => {
      throw new LoomError('UNSUPPORTED_FUNCTION_VALUE', `${name} requires function values, which are not implemented yet`);
    }
  };
}

function isLoomletCallable(value) {
  return Boolean(value && value.__loomletCallable === true && typeof value.call === 'function');
}

function assertLoomletCallable(value, nodeName) {
  if (!isLoomletCallable(value)) {
    throw new LoomError('INVALID_FUNCTION_VALUE', `${nodeName} expected fn to be a Loomlet function value`);
  }
  return value;
}

function isLoomletTruthy(value) {
  return Boolean(value);
}

export const POSITIONAL_BINARY_NODE_TYPES = new Set([
  'math.add',
  'math.subtract',
  'math.multiply',
  'math.divide',
  'math.mod',
  'math.min',
  'math.max',
  'logic.and',
  'logic.or'
]);

export function canUseTwoPositionalArgs(nodeName, nodeType) {
  return Boolean(nodeType.commutative || POSITIONAL_BINARY_NODE_TYPES.has(nodeName));
}

function evaluateLegacyFunctionExpr(expr, env, ctx) {
  if (!expr) return null;
  if (expr.type === 'number' || expr.type === 'string' || expr.type === 'bool' || expr.type === 'null' || expr.type === 'array' || expr.type === 'object') {
    return expr.value;
  }
  if (expr.type === 'ident') {
    if (Object.prototype.hasOwnProperty.call(env, expr.name)) return env[expr.name];
    throw new LoomError('UNDEFINED_IDENTIFIER', `Undefined identifier in function body: ${expr.name}`);
  }
  if (expr.type === 'call') {
    if (Object.prototype.hasOwnProperty.call(env, expr.name) && isLoomletCallable(env[expr.name])) {
      const args = expr.args.map((arg) => {
        if (arg.named) throw new LoomError('MISSING_ARGUMENT_NAME', `User-defined function '${expr.name}' only accepts positional arguments`);
        return evaluateLegacyFunctionExpr(arg.value, env, ctx);
      });
      return env[expr.name].call(args, ctx);
    }

    const nodeTypes = ctx.nodeTypes ?? NODE_TYPES;
    const nodeType = nodeTypes[expr.name];
    if (!nodeType) throw new LoomError('UNKNOWN_NODE_TYPE', `Unknown node type in function body: ${expr.name}`);

    const positionalArgs = expr.args.filter((arg) => !arg.named);
    const namedArgs = expr.args.filter((arg) => arg.named);
    const inputNames = new Set((nodeType.inputs || []).map((input) => input.name));
    const paramNames = new Set((nodeType.params || []).map((param) => param.name));
    const hasUnknownNamed = namedArgs.some((arg) => !inputNames.has(arg.name) && !paramNames.has(arg.name));
    if (nodeType.commutative && positionalArgs.length > 0 && namedArgs.length > 0 && !hasUnknownNamed) {
      throw new LoomError('MISSING_ARGUMENT_NAME', `Node '${expr.name}' is commutative: arguments must be all positional or all named`);
    }
    if (!canUseTwoPositionalArgs(expr.name, nodeType) && positionalArgs.length > 1) {
      throw new LoomError('MISSING_ARGUMENT_NAME', `Argument at position 2 for '${expr.name}' requires a name`);
    }

    const inputs = {};
    const params = {};
    for (const input of nodeType.inputs || []) inputs[input.name] = input.default;
    for (const param of nodeType.params || []) params[param.name] = param.default;

    let positionalIndex = 0;
    for (const arg of positionalArgs) {
      const input = nodeType.inputs[positionalIndex++];
      if (!input) throw new LoomError('MISSING_ARGUMENT_NAME', `Too many positional arguments for '${expr.name}'`);
      const value = evaluateLegacyFunctionExpr(arg.value, env, ctx);
      inputs[input.name] = value;
      if (paramNames.has(input.name)) params[input.name] = value;
    }

    for (const arg of namedArgs) {
      const value = evaluateLegacyFunctionExpr(arg.value, env, ctx);
      if (inputNames.has(arg.name)) {
        inputs[arg.name] = value;
        if (paramNames.has(arg.name)) params[arg.name] = value;
      } else if (paramNames.has(arg.name)) {
        params[arg.name] = value;
      } else {
        throw new LoomError('UNKNOWN_ARGUMENT', `Unknown argument '${arg.name}' for '${expr.name}'`);
      }
    }

    const outputs = nodeType.evaluate(inputs, params, ctx);
    const outputDef = nodeType.outputs?.length === 1
      ? nodeType.outputs[0]
      : nodeType.outputs?.find((output) => output.name === 'out') ?? nodeType.outputs?.[0];
    return outputDef ? outputs[outputDef.name] : null;
  }
  if (expr.type === 'pipe') {
    const value = evaluateLegacyFunctionExpr(expr.left, env, ctx);
    return evaluateLegacyFunctionExpr({ ...expr.call, args: [{ named: false, value: { type: 'object', value } }, ...expr.call.args] }, env, ctx);
  }
  throw new LoomError('UNEXPECTED_TOKEN', `Unsupported expression in function body: ${expr.type}`);
}

function createLoomletFunction(params, body, closureRefs, ctx) {
  const closure = {};
  for (const [name, ref] of Object.entries(closureRefs || {})) {
    closure[name] = ctx.engine?.getValue(ref);
  }
  return {
    __loomletCallable: true,
    params: [...params],
    call(args, callCtx = ctx) {
      const env = { ...closure };
      params.forEach((name, index) => { env[name] = args[index]; });
      return evaluateLegacyFunctionExpr(body, env, callCtx);
    }
  };
}

function mapFunctionValueNode(name, reducer) {
  return {
    category: 'transform',
    inputs: [
      { name: 'list', type: 'array', default: [], kind: 'behavior' },
      { name: 'fn', type: 'function', default: null, kind: 'behavior' },
      { name: 'initial', type: 'any', default: null, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: name === 'list.reduce' ? 'any' : 'array', kind: 'behavior' }],
    params: [
      { name: 'fn', type: 'function', default: null },
      { name: 'initial', type: 'any', default: null }
    ],
    evaluate: (inputs, params, ctx) => reducer(toArray(inputs.list), assertLoomletCallable(inputs.fn, name), inputs.initial, ctx)
  };
}

function getNodeFs() {
  const getBuiltinModule = globalThis.process?.getBuiltinModule;
  if (typeof getBuiltinModule !== 'function') {
    throw new LoomError('UNSUPPORTED_RUNTIME_NODE', 'fs nodes are only available in the Node.js CLI runtime');
  }
  return getBuiltinModule('fs');
}

function getNodePath() {
  return globalThis.process.getBuiltinModule('path');
}

// Export helper functions for node modules
export {
  isFiniteNumber,
  coerceFiniteNumber,
  resolveStateInputValue,
  sanitizeStateValue,
  stringifyJsonValue,
  stringifyTextValue,
  inspectValue,
  toArray,
  collectInputs,
  unsupportedFunctionValueNode,
  isLoomletCallable,
  assertLoomletCallable,
  isLoomletTruthy,
  evaluateLegacyFunctionExpr,
  createLoomletFunction,
  mapFunctionValueNode,
  getNodeFs,
  getNodePath
};

// ノード型レジストリ

function resolveNodeTypesOption(options = {}) {
  if (options.nodeRegistry && typeof options.nodeRegistry.toObject === 'function') {
    return options.nodeRegistry.toObject();
  }

  if (options.nodeTypes && typeof options.nodeTypes === 'object') {
    return options.nodeTypes;
  }

  return NODE_TYPES;
}

function normalizeTimeEnvironment(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { events: [] };
  }

  const env = {};
  if (Number.isFinite(value.time)) {
    env.time = value.time;
  }
  if (Number.isFinite(value.deltaTime)) {
    env.deltaTime = Math.max(0, value.deltaTime);
  }
  if (Number.isFinite(value.tick)) {
    env.tick = value.tick;
  }
  if (value.scope !== undefined && value.scope !== null && typeof value.scope === 'object' && !Array.isArray(value.scope)) {
    env.scope = value.scope;
  }
  if (value.events === undefined) {
    env.events = [];
  } else {
    if (!Array.isArray(value.events)) {
      throw new LoomError('INVALID_ENV_EVENTS', 'env.events must be an array when provided', {
        reason: 'env.events'
      });
    }

    env.events = value.events.map((event, index) => {
      if (!event || typeof event !== 'object' || Array.isArray(event)) {
        throw new LoomError('INVALID_ENV_EVENTS', `env.events[${index}] must be an object`, {
          reason: 'env.events',
          index
        });
      }
      if (typeof event.channel !== 'string') {
        throw new LoomError('INVALID_ENV_EVENTS', `env.events[${index}].channel must be a string`, {
          reason: 'env.events.channel',
          index
        });
      }
      if (!Number.isFinite(event.timestamp)) {
        throw new LoomError('INVALID_ENV_EVENTS', `env.events[${index}].timestamp must be a finite number`, {
          reason: 'env.events.timestamp',
          index
        });
      }
      return event;
    });
  }
  return env;
}

export class Loom {
  constructor(graph, options = {}) {
    this._nodeTypes = resolveNodeTypesOption(options);
    this._currentGraph = null;
    this._pendingGraph = null;
    this._sortedNodeIds = [];
    this._values = new Map();
    this._prevOuts = new Map();
    this._stateSlots = new Map();
    this._eventQueue = [];
    this._rafId = null;
    this._startTime = null;
    this._lastTimestamp = null;
    this._envProvider = null;
    this._inputStates = {};
    this._effects = [];

    // グラフの検証とソートを実行
    this._loadGraphInternal(graph);
  }

  // 外部からノード型を追加するための静的メソッド（アダプタ層向け）
  static registerNodeType(name, definition) {
    if (NODE_TYPES[name]) {
      throw new LoomError('DUPLICATE_NODE_TYPE', `Node type already registered: ${name}`, { name });
    }
    NODE_TYPES[name] = definition;
  }

  _activatePendingGraph(runLifecycle = true) {
    if (this._pendingGraph === null) {
      return;
    }

    if (runLifecycle && this._currentGraph) {
      for (const node of this._currentGraph.nodes) {
        const nodeType = this._nodeTypes[node.type];
        if (nodeType.onStop) {
          nodeType.onStop(node, this);
        }
      }
    }

    this._reconcileStateForGraph(this._pendingGraph);
    this._currentGraph = this._pendingGraph;
    this._sortedNodeIds = this._pendingNodeIds;
    this._pendingGraph = null;

    if (runLifecycle && this._currentGraph) {
      for (const node of this._currentGraph.nodes) {
        const nodeType = this._nodeTypes[node.type];
        if (nodeType.onStart) {
          nodeType.onStart(node, this);
        }
      }
    }
  }

  evaluateAt(env, frameTimestamp) {
    this._activatePendingGraph(true);

    // グラフが設定されていなければ何もしない
    if (!this._currentGraph) return;

    this._effects = [];

    const resolvedEnvInput = normalizeTimeEnvironment(env);
    const resolvedTime = Number.isFinite(resolvedEnvInput.time) ? resolvedEnvInput.time : undefined;
    const resolvedFrameTimestamp = Number.isFinite(frameTimestamp)
      ? frameTimestamp
      : Number.isFinite(resolvedTime)
        ? resolvedTime * 1000
        : undefined;
    const explicitDt = Number.isFinite(resolvedEnvInput.deltaTime) ? resolvedEnvInput.deltaTime : undefined;
    const dt = explicitDt !== undefined ? explicitDt : this._computeDeltaTime(resolvedFrameTimestamp);
    if (explicitDt !== undefined && Number.isFinite(resolvedFrameTimestamp)) {
      this._lastTimestamp = resolvedFrameTimestamp;
    }
    const resolvedEnv = {
      ...resolvedEnvInput,
      ...(Number.isFinite(dt) ? { deltaTime: dt } : {})
    };

    const ctx = {
      env: resolvedEnv,
      time: resolvedTime,
      dt,
      deltaTime: dt,
      tick: resolvedEnv.tick,
      engine: this,
      nodeTypes: this._nodeTypes,
      nodePredicates: new Map()
    };

    // Step 3: 全 Event ポートを [] にリセット（this._values に直接書く）
    for (const node of this._currentGraph.nodes) {
      const nodeType = this._nodeTypes[node.type];
      for (const output of nodeType.outputs) {
        if (output.kind === 'event') {
          this._values.set(`${node.id}.${output.name}`, []);
        }
      }
    }

    // Step 4: dispatchEvent で積まれたイベントを this._values に反映してキューをクリア
    for (const { ref, payload } of this._eventQueue) {
      const current = this._values.get(ref) || [];
      current.push(payload);
      this._values.set(ref, current);
    }
    this._eventQueue = [];

    // Step 5: トポロジカルソート順に各ノードを評価
    for (const nodeId of this._sortedNodeIds) {
      const node = this._currentGraph.nodes.find(n => n.id === nodeId);
      const nodeType = this._nodeTypes[node.type];
      const nodeState = this._createNodeState(nodeId);

      // input カテゴリかつ全出力が Event のノード（pointerClick, keyDown, keyUp）は
      // Step 4 で this._values に設定済みなのでスキップ
      if (nodeType.category === 'input' &&
          nodeType.outputs.length > 0 &&
          nodeType.outputs.every(o => o.kind === 'event')) {
        continue;
      }

      // 入力値の解決
      const inputs = {};
      for (const inputDef of nodeType.inputs) {
        const portName = inputDef.name;
        const ref = `${nodeId}.${portName}`;

        const edge = this._currentGraph.edges.find(e => e.to === ref);
        if (edge) {
          if (inputDef.kind === 'event') {
            inputs[portName] = this._values.get(edge.from) || [];
          } else {
            inputs[portName] = this._values.get(edge.from);
          }
        } else {
          const paramValue = node.params && node.params[portName];
          if (paramValue !== undefined) {
            inputs[portName] = paramValue;
          } else {
            inputs[portName] = inputDef.default;
          }
        }
      }

      // パラメータ値の解決
      const params = {};
      for (const paramDef of nodeType.params) {
        const paramName = paramDef.name;
        const paramValue = node.params && node.params[paramName];
        if (paramValue !== undefined) {
          params[paramName] = paramValue;
        } else {
          params[paramName] = paramDef.default;
        }
      }

      // ノードを評価
      let outputs;
      if (nodeType.category === 'state') {
        const initial = coerceFiniteNumber(params.initial, 0);
        const prevOut = nodeState.get('prevOut', initial);
        const stateCtx = {
          ...ctx,
          currentNodeId: nodeId,
          state: nodeState,
          prevOut: sanitizeStateValue(prevOut, initial)
        };

        try {
          outputs = nodeType.evaluate(inputs, params, stateCtx);
          const rawOut = outputs?.out;
          const rawNewState = outputs?._newState !== undefined ? outputs._newState : rawOut;
          const safeOut = sanitizeStateValue(rawOut, initial);
          const safeNewState = sanitizeStateValue(rawNewState, initial);
          outputs = { ...outputs, out: safeOut };
          nodeState.set('prevOut', safeNewState);
          this._prevOuts.set(nodeId, safeNewState);
        } catch (error) {
          console.error(`State node evaluation failed: ${nodeId}`, error);
          outputs = { out: stateCtx.prevOut };
        }
      } else {
        outputs = nodeType.evaluate(inputs, params, {
          ...ctx,
          currentNodeId: nodeId,
          state: nodeState
        });
      }

      // 出力値を保存
      for (const outputDef of nodeType.outputs) {
        const portName = outputDef.name;
        const ref = `${nodeId}.${portName}`;
        if (outputDef.kind === 'event') {
          this._values.set(ref, outputs[portName] || []);
        } else {
          this._values.set(ref, outputs[portName]);
        }
      }
    }
  }

  evaluateOnce({ env } = {}) {
    const resolvedEnv = normalizeTimeEnvironment(env);
    const frameTimestamp = Number.isFinite(resolvedEnv.time) ? resolvedEnv.time * 1000 : undefined;

    this._activatePendingGraph(false);
    this.evaluateAt(resolvedEnv, frameTimestamp);
  }

  getValue(ref) {
    return this._values.get(ref);
  }

  getEffects() {
    return [...this._effects];
  }

  _recordEffect(effect) {
    this._effects.push(effect);
  }

  _createNodeState(nodeId) {
    return {
      get: (slotName, defaultValue) => {
        const slotKey = String(slotName);
        const nodeSlots = this._stateSlots.get(nodeId);
        if (!nodeSlots || !nodeSlots.has(slotKey)) {
          return defaultValue;
        }
        return nodeSlots.get(slotKey);
      },
      set: (slotName, value) => {
        const slotKey = String(slotName);
        let nodeSlots = this._stateSlots.get(nodeId);
        if (!nodeSlots) {
          nodeSlots = new Map();
          this._stateSlots.set(nodeId, nodeSlots);
        }
        nodeSlots.set(slotKey, value);
      }
    };
  }

  resetState() {
    this._stateSlots.clear();
    this._prevOuts.clear();
  }

  dispatchEvent(ref, payload) {
    // ref の検証（即座に行う）
    const [nodeId, portName] = ref.split('.');
    if (!nodeId || !portName) {
      throw new LoomError('INVALID_GRAPH', 'dispatchEvent ref must be in format "nodeId.portName"',
        { reason: 'invalid ref format' });
    }

    if (!this._currentGraph) {
      throw new LoomError('UNKNOWN_NODE', `dispatchEvent references non-existent node: ${nodeId}`, { nodeId });
    }

    const node = this._currentGraph.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new LoomError('UNKNOWN_NODE', `dispatchEvent references non-existent node: ${nodeId}`, { nodeId });
    }

    const nodeType = this._nodeTypes[node.type];
    const outputPort = nodeType.outputs.find(o => o.name === portName);
    if (!outputPort) {
      throw new LoomError('UNKNOWN_PORT', `dispatchEvent references non-existent port: ${ref}`,
        { nodeId, port: portName, side: 'output' });
    }

    if (outputPort.kind !== 'event') {
      throw new LoomError('TYPE_MISMATCH', `dispatchEvent target must be Event port`,
        { from: ref, to: ref, fromType: outputPort.kind, toType: 'event' });
    }

    // キューに積む（次の evaluateAt で消費）
    this._eventQueue.push({ ref, payload });
  }

  load(graph) {
    // グラフを検証（エラーなら LoomError をスロー）
    this._validateGraph(graph);

    if (this._rafId !== null && !this._envProvider && this._graphUsesNodeType('clock', graph)) {
      throw new LoomError('MISSING_ENV_TIME', 'load() requires options.getEnv for graphs that use clock while the runtime is started', { reason: 'env.time' });
    }

    // トポロジカルソートを実行（サイクルチェック含む）
    const sortedNodeIds = this._topologicalSort(graph);

    // 保留状態で保持
    this._pendingGraph = graph;
    this._pendingNodeIds = sortedNodeIds;
  }

  start(options = {}) {
    if (this._rafId !== null) return; // 既に実行中なら何もしない

    const getEnv = typeof options.getEnv === 'function' ? options.getEnv : null;
    const nextGraph = this._pendingGraph || this._currentGraph;
    if (!getEnv && this._graphUsesNodeType('clock', nextGraph)) {
      throw new LoomError('MISSING_ENV_TIME', 'start() requires options.getEnv when graph uses clock', { reason: 'env.time' });
    }
    this._envProvider = getEnv;

    // 初回: 新グラフの onStart を呼ぶ
    if (this._currentGraph) {
      for (const node of this._currentGraph.nodes) {
        const nodeType = this._nodeTypes[node.type];
        if (nodeType.onStart) {
          nodeType.onStart(node, this);
        }
      }
    }

    this._lastTimestamp = null;
    this._startTime = performance.now() / 1000;
    const tick = (timestamp) => {
      const elapsed = (timestamp / 1000) - this._startTime;
      const env = this._envProvider
        ? normalizeTimeEnvironment(this._envProvider({ elapsed, timestamp, engine: this }))
        : {};
      this.evaluateAt(env, timestamp);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._envProvider = null;

    // グラフのノードの onStop を呼ぶ
    if (this._currentGraph) {
      for (const node of this._currentGraph.nodes) {
        const nodeType = this._nodeTypes[node.type];
        if (nodeType.onStop) {
          nodeType.onStop(node, this);
        }
      }
    }
  }

  _computeDeltaTime(frameTimestamp) {
    if (!Number.isFinite(frameTimestamp)) {
      return 0;
    }

    if (this._lastTimestamp === null) {
      this._lastTimestamp = frameTimestamp;
      return 0;
    }

    const dt = Math.max(0, (frameTimestamp - this._lastTimestamp) / 1000);
    this._lastTimestamp = frameTimestamp;
    return dt;
  }

  _graphUsesNodeType(type, graph = this._currentGraph) {
    return Array.isArray(graph?.nodes) && graph.nodes.some((node) => node?.type === type);
  }

  _reconcileStateForGraph(graph) {
    const nextNodeIds = new Set(graph.nodes.map(node => node.id));
    for (const nodeId of Array.from(this._stateSlots.keys())) {
      if (!nextNodeIds.has(nodeId)) {
        this._stateSlots.delete(nodeId);
      }
    }

    const nextStateIds = new Set(
      graph.nodes
        .filter(node => this._nodeTypes[node.type]?.category === 'state')
        .map(node => node.id)
    );

    for (const nodeId of Array.from(this._prevOuts.keys())) {
      if (!nextStateIds.has(nodeId)) {
        this._prevOuts.delete(nodeId);
      }
    }
  }

  // 内部メソッド：グラフの検証とソート
  _loadGraphInternal(graph) {
    // グラフを検証
    this._validateGraph(graph);

    // トポロジカルソートを実行
    const sortedNodeIds = this._topologicalSort(graph);

    // 現行グラフに設定
    this._currentGraph = graph;
    this._sortedNodeIds = sortedNodeIds;
    this._pendingGraph = null;
    this._reconcileStateForGraph(graph);
  }

  // グラフの検証
  _validateGraph(graph) {
    // 1. graph がオブジェクトで、nodes と edges が配列か
    if (!graph || typeof graph !== 'object') {
      throw new LoomError('INVALID_GRAPH', 'Graph must be an object', { reason: 'not an object' });
    }
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new LoomError('INVALID_GRAPH', 'Graph must have nodes and edges arrays', { reason: 'nodes or edges not an array' });
    }

    // 2. ノードの ID が重複していないか
    const nodeIds = new Set();
    for (const node of graph.nodes) {
      if (nodeIds.has(node.id)) {
        throw new LoomError('DUPLICATE_NODE_ID', `Duplicate node id: ${node.id}`, { nodeId: node.id });
      }
      nodeIds.add(node.id);
    }

    // 3. 各ノードの type が NODE_TYPES に存在するか
    for (const node of graph.nodes) {
      if (!this._nodeTypes[node.type]) {
        throw new LoomError('UNKNOWN_NODE_TYPE', `Unknown node type: ${node.type}`, { nodeId: node.id, type: node.type });
      }
    }

    // 4. 各エッジの from/to が "nodeId.portName" 形式かつ参照先のノードが存在するか
    for (const edge of graph.edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');

      if (fromParts.length !== 2) {
        throw new LoomError('INVALID_GRAPH', 'Edge from must be in format "nodeId.portName"', { reason: 'invalid edge format' });
      }
      if (toParts.length !== 2) {
        throw new LoomError('INVALID_GRAPH', 'Edge to must be in format "nodeId.portName"', { reason: 'invalid edge format' });
      }

      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];

      if (!nodeIds.has(fromNodeId)) {
        throw new LoomError('UNKNOWN_NODE', `Edge references non-existent node: ${fromNodeId}`, { nodeId: fromNodeId });
      }
      if (!nodeIds.has(toNodeId)) {
        throw new LoomError('UNKNOWN_NODE', `Edge references non-existent node: ${toNodeId}`, { nodeId: toNodeId });
      }

      // 5. 参照先のポートがノード型のメタデータに存在するか
      const fromPortName = fromParts[1];
      const toPortName = toParts[1];

      const fromNode = graph.nodes.find(n => n.id === fromNodeId);
      const fromNodeType = this._nodeTypes[fromNode.type];
      const fromPort = fromNodeType.outputs.find(o => o.name === fromPortName);
      if (!fromPort) {
        throw new LoomError('UNKNOWN_PORT', `Unknown port: ${fromNodeId}.${fromPortName}`, { nodeId: fromNodeId, port: fromPortName, side: 'output' });
      }

      const toNode = graph.nodes.find(n => n.id === toNodeId);
      const toNodeType = this._nodeTypes[toNode.type];
      const toPort = toNodeType.inputs.find(i => i.name === toPortName);
      if (!toPort) {
        throw new LoomError('UNKNOWN_PORT', `Unknown port: ${toNodeId}.${toPortName}`, { nodeId: toNodeId, port: toPortName, side: 'input' });
      }

      // 6. 型チェック（Behavior/Event の混在禁止、ただし sample.value は例外）
      const fromKind = fromPort.kind;
      const toKind = toPort.kind;
      const isSampleValueException = toNode.type === 'sample' && toPortName === 'value';

      if (fromKind !== toKind && !isSampleValueException) {
        throw new LoomError('TYPE_MISMATCH',
          `Cannot connect ${fromKind} port to ${toKind} port`,
          { from: edge.from, to: edge.to, fromType: fromKind, toType: toKind });
      }
    }

    // 7. 同じ入力ポートに2本以上のエッジが向かっていないか
    const inputEdges = new Map();
    for (const edge of graph.edges) {
      const to = edge.to;
      if (inputEdges.has(to)) {
        const toParts = to.split('.');
        throw new LoomError('DUPLICATE_INPUT_EDGE', `Multiple edges connected to input port: ${to}`, { nodeId: toParts[0], port: toParts[1] });
      }
      inputEdges.set(to, edge);
    }

    // 8. グラフにサイクルがないか
    const hasCycle = this._hasCycle(graph);
    if (hasCycle) {
      const cycleNodeIds = this._findCycleNodeIds(graph);
      throw new LoomError('CYCLE', 'Graph contains a cycle', { nodeIds: cycleNodeIds });
    }

    // 9. filter ノードの predicate を load 時にパース検証
    for (const node of graph.nodes) {
      if (node.type === 'filter') {
        const predicate = (node.params && node.params.predicate) ?? 'true';
        const dslEval = new RestrictedDSLEvaluator(predicate, node.id);
        dslEval.evaluate();
      }
    }
  }

  // トポロジカルソート（Kahn のアルゴリズム）
  _topologicalSort(graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // 入度マップを構築
    const inDegree = new Map();
    const adjList = new Map();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');
      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];

      adjList.get(fromNodeId).push(toNodeId);
      inDegree.set(toNodeId, inDegree.get(toNodeId) + 1);
    }

    // 入度が 0 のノードをキューに追加
    const queue = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sorted = [];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      sorted.push(nodeId);

      for (const neighbor of adjList.get(nodeId)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return sorted;
  }

  // サイクル検出（DFS）
  _hasCycle(graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // 隣接リストを構築
    const adjList = new Map();
    for (const node of nodes) {
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');
      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];
      adjList.get(fromNodeId).push(toNodeId);
    }

    // 状態：0 = 未訪問、1 = 訪問中、2 = 訪問済み
    const state = new Map();
    for (const node of nodes) {
      state.set(node.id, 0);
    }

    for (const node of nodes) {
      if (state.get(node.id) === 0) {
        if (this._hasCycleDFS(node.id, adjList, state)) {
          return true;
        }
      }
    }

    return false;
  }

  // DFS ヘルパー
  _hasCycleDFS(nodeId, adjList, state) {
    state.set(nodeId, 1);

    for (const neighbor of adjList.get(nodeId)) {
      const neighborState = state.get(neighbor);
      if (neighborState === 1) {
        return true; // サイクル検出
      }
      if (neighborState === 0) {
        if (this._hasCycleDFS(neighbor, adjList, state)) {
          return true;
        }
      }
    }

    state.set(nodeId, 2);
    return false;
  }

  // サイクルに含まれるノード ID を見つける
  _findCycleNodeIds(graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // 隣接リストを構築
    const adjList = new Map();
    for (const node of nodes) {
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');
      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];
      adjList.get(fromNodeId).push(toNodeId);
    }

    const visited = new Set();
    const recStack = new Set();
    const cycleNodes = new Set();

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      for (const neighbor of adjList.get(nodeId)) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            cycleNodes.add(nodeId);
            return true;
          }
        } else if (recStack.has(neighbor)) {
          cycleNodes.add(nodeId);
          cycleNodes.add(neighbor);
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return Array.from(cycleNodes);
  }
}

export function createDefaultNodeRegistry() {
  const registry = createNodeRegistry();
  registerBuiltinNodes(registry);
  return registry;
}

export const DEFAULT_NODE_REGISTRY = createDefaultNodeRegistry();

export const NODE_TYPES = DEFAULT_NODE_REGISTRY.toObject();
