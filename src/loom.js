// Loom: ブラウザで動くステートレスなデータフロー実行エンジン

export class LoomError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LoomError';
    this.code = code;
    this.details = details;
  }
}

// 制限式 DSL パーサ・インタプリタ
class RestrictedDSLEvaluator {
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
        if (parts.length === 2 && parts[0] === 'value' && ['x', 'y'].includes(parts[1])) {
          return { type: 'fieldAccess', object: 'value', field: parts[1] };
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
  if (typeof value === 'string') return value;
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

// Positional binary nodes are common enough to support with two positional
// arguments in function bodies, even when they are not commutative.
const POSITIONAL_BINARY_NODE_TYPES = new Set(['math.mod', 'math.add', 'math.subtract', 'math.multiply', 'math.divide', 'math.min', 'math.max', 'logic.and', 'logic.or']);

function canUsePositionalBinaryArgsInFunctionBody(nodeName, nodeType) {
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

    const nodeType = NODE_TYPES[expr.name];
    if (!nodeType) throw new LoomError('UNKNOWN_NODE_TYPE', `Unknown node type in function body: ${expr.name}`);

    const positionalArgs = expr.args.filter((arg) => !arg.named);
    const namedArgs = expr.args.filter((arg) => arg.named);
    if (nodeType.commutative && positionalArgs.length > 0 && namedArgs.length > 0) {
      throw new LoomError('MISSING_ARGUMENT_NAME', `Node '${expr.name}' is commutative: arguments must be all positional or all named`);
    }
    if (!canUsePositionalBinaryArgsInFunctionBody(expr.name, nodeType) && positionalArgs.length > 1) {
      throw new LoomError('MISSING_ARGUMENT_NAME', `Argument at position 2 for '${expr.name}' requires a name`);
    }

    const inputs = {};
    const params = {};
    const inputNames = new Set((nodeType.inputs || []).map((input) => input.name));
    const paramNames = new Set((nodeType.params || []).map((param) => param.name));
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


// ノード型レジストリ
export const NODE_TYPES = {
  // Phase 0 ノード
  clock: {
    category: 'source',
    inputs: [],
    outputs: [{ name: 't', type: 'number', kind: 'behavior' }],
    params: [],
    evaluate: (inputs, params, ctx) => ({ t: ctx.time })
  },
  'function.literal': {
    category: 'source',
    inputs: [],
    outputs: [{ name: 'out', type: 'function', kind: 'behavior' }],
    params: [
      { name: 'params', type: 'array', default: [] },
      { name: 'body', type: 'any', default: null },
      { name: 'closureRefs', type: 'object', default: {} }
    ],
    evaluate: (inputs, params, ctx) => ({ out: createLoomletFunction(params.params || [], params.body, params.closureRefs, ctx) })
  },
  'function.call': {
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
  },
  constant: {
    category: 'source',
    inputs: [],
    outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: 0 }],
    evaluate: (inputs, params, ctx) => ({ out: params.value })
  },
  sine: {
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
  },
  add: {
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
  },
  multiply: {
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
  },

  // 第1陣: 基本演算系
  subtract: {
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
  },
  divide: {
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
  },
  mod: {
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
  },
  negate: {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: -inputs.a })
  },
  abs: {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [
      { name: 'a', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: Math.abs(inputs.a) })
  },

  // 第2陣: 範囲操作系＋コサイン
  clamp: {
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
  },
  lerp: {
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
  },
  smoothstep: {
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
  },
  map: {
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
  },
  cosine: {
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
  },
  greaterThan: {
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
  },
  lessThan: {
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
  },
  smoothLerp: {
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
  },
  lowpass: {
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
  },
  delay1: {
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
  },
  integrate: {
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
  },

  // Phase 1 入力ノード
  pointerClick: {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<vec2>', kind: 'event' }],
    params: [{ name: 'target', type: 'string', default: 'window' }],
    evaluate: (inputs, params, ctx) => {
      // dispatchEvent 経由で this._values に設定済みのため、evaluate は呼ばれない
      return { event: [] };
    },
    onStart: (node, engine) => {
      const targetSelector = node.params?.target || 'window';
      const target = targetSelector === 'window' ? window : document.querySelector(targetSelector);
      if (!target) return;

      const handler = (e) => {
        engine.dispatchEvent(node.id + '.event', { x: e.clientX, y: e.clientY });
      };
      target.addEventListener('pointerdown', handler);
      node._eventHandler = handler;
      node._eventTarget = target;
    },
    onStop: (node, engine) => {
      if (node._eventTarget && node._eventHandler) {
        node._eventTarget.removeEventListener('pointerdown', node._eventHandler);
        delete node._eventHandler;
        delete node._eventTarget;
      }
    }
  },

  pointerPosition: {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'pos', type: 'vec2', kind: 'behavior' }],
    params: [{ name: 'target', type: 'string', default: 'window' }],
    evaluate: (inputs, params, ctx) => {
      if (!ctx.engine || !ctx.engine._inputStates) {
        ctx.engine._inputStates = {};
      }
      const lastPos = ctx.engine._inputStates.lastPos || { x: 0, y: 0 };
      return { pos: lastPos };
    },
    onStart: (node, engine) => {
      const targetSelector = node.params?.target || 'window';
      const target = targetSelector === 'window' ? window : document.querySelector(targetSelector);
      if (!target) return;

      if (!engine._inputStates) {
        engine._inputStates = {};
      }

      const handler = (e) => {
        engine._inputStates.lastPos = { x: e.clientX, y: e.clientY };
      };
      target.addEventListener('pointermove', handler);
      node._eventHandler = handler;
      node._eventTarget = target;
    },
    onStop: (node, engine) => {
      if (node._eventTarget && node._eventHandler) {
        node._eventTarget.removeEventListener('pointermove', node._eventHandler);
        delete node._eventHandler;
        delete node._eventTarget;
      }
    }
  },

  keyDown: {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<string>', kind: 'event' }],
    params: [{ name: 'key', type: 'string', default: null }],
    evaluate: (inputs, params, ctx) => {
      // dispatchEvent 経由で this._values に設定済みのため、evaluate は呼ばれない
      return { event: [] };
    },
    onStart: (node, engine) => {
      const filterKey = node.params?.key || null;
      const handler = (e) => {
        if (!filterKey || e.key === filterKey) {
          engine.dispatchEvent(node.id + '.event', e.key);
        }
      };
      window.addEventListener('keydown', handler);
      node._eventHandler = handler;
    },
    onStop: (node, engine) => {
      if (node._eventHandler) {
        window.removeEventListener('keydown', node._eventHandler);
        delete node._eventHandler;
      }
    }
  },

  keyUp: {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<string>', kind: 'event' }],
    params: [{ name: 'key', type: 'string', default: null }],
    evaluate: (inputs, params, ctx) => {
      // dispatchEvent 経由で this._values に設定済みのため、evaluate は呼ばれない
      return { event: [] };
    },
    onStart: (node, engine) => {
      const filterKey = node.params?.key || null;
      const handler = (e) => {
        if (!filterKey || e.key === filterKey) {
          engine.dispatchEvent(node.id + '.event', e.key);
        }
      };
      window.addEventListener('keyup', handler);
      node._eventHandler = handler;
    },
    onStop: (node, engine) => {
      if (node._eventHandler) {
        window.removeEventListener('keyup', node._eventHandler);
        delete node._eventHandler;
      }
    }
  },

  // Phase 1 イベント変換ノード
  filter: {
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
  },

  sample: {
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
  },

  merge: {
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
  },

  'text.upper': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: String(inputs.value ?? '').toUpperCase() })
  },
  'text.lower': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: String(inputs.value ?? '').toLowerCase() })
  },
  'text.trim': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: String(inputs.value ?? '').trim() })
  },
  'text.replace': {
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
  },

  'text.concat': {
    category: 'transform',
    inputs: Array.from({ length: 8 }, (_, i) => ({ name: `value${i + 1}`, type: 'any', default: undefined, kind: 'behavior' })),
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: Array.from({ length: 8 }, (_, i) => ({ name: `value${i + 1}`, type: 'any', default: undefined })),
    evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 8 }, (_, i) => `value${i + 1}`)).map((value) => stringifyTextValue(value)).join('') })
  },
  'text.split': {
    category: 'transform',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' },
      { name: 'separator', type: 'any', default: ',', kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'array', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'separator', type: 'any', default: ',' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).split(stringifyTextValue(inputs.separator)) })
  },
  'text.join': {
    category: 'transform',
    inputs: [
      { name: 'list', type: 'array', default: [], kind: 'behavior' },
      { name: 'separator', type: 'any', default: ',', kind: 'behavior' }
    ],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'list', type: 'array', default: [] }, { name: 'separator', type: 'any', default: ',' }],
    evaluate: (inputs) => ({ out: toArray(inputs.list).map((value) => stringifyTextValue(value)).join(stringifyTextValue(inputs.separator)) })
  },
  'text.includes': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }, { name: 'search', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'search', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).includes(stringifyTextValue(inputs.search)) })
  },
  'text.startsWith': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }, { name: 'search', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'search', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).startsWith(stringifyTextValue(inputs.search)) })
  },
  'text.endsWith': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }, { name: 'search', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }, { name: 'search', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).endsWith(stringifyTextValue(inputs.search)) })
  },
  'text.length': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).length })
  },
  'text.isEmpty': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: '', kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: '' }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).length === 0 })
  },
  'text.stringify': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [{ name: 'value', type: 'any', default: null }],
    evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value) })
  },
  'json.parse': {
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
  },
  'json.stringify': {
    category: 'transform',
    inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }],
    outputs: [{ name: 'out', type: 'string', kind: 'behavior' }],
    params: [
      { name: 'value', type: 'any', default: null },
      { name: 'pretty', type: 'boolean', default: false }
    ],
    evaluate: (inputs, params) => ({ out: stringifyJsonValue(inputs.value, params.pretty === true) })
  },
  'console.log': {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.log', level: 'log', value: inputs.value, nodeId: ctx.currentNodeId });
      return {};
    }
  },
  'console.warn': {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.warn', level: 'warn', value: inputs.value, nodeId: ctx.currentNodeId });
      return {};
    }
  },
  'console.error': {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.error', level: 'error', value: inputs.value, nodeId: ctx.currentNodeId });
      return {};
    }
  },


  'console.table': {
    category: 'sink',
    inputs: [{ name: 'value', type: 'any', default: undefined, kind: 'behavior' }],
    outputs: [],
    params: [],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: 'console.table', level: 'table', value: inputs.value, nodeId: ctx.currentNodeId });
      if (typeof console.table === 'function' && ctx.emitConsole === true) console.table(inputs.value);
      return {};
    }
  },

  'logic.not': { category: 'transform', inputs: [{ name: 'value', type: 'any', default: false, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: false }], evaluate: (inputs) => ({ out: !inputs.value }) },
  'logic.and': { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'any', default: false, kind: 'behavior' }, { name: 'b', type: 'any', default: false, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'a', type: 'any', default: false }, { name: 'b', type: 'any', default: false }], evaluate: (inputs) => ({ out: Boolean(inputs.a && inputs.b) }) },
  'logic.or': { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'any', default: false, kind: 'behavior' }, { name: 'b', type: 'any', default: false, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'a', type: 'any', default: false }, { name: 'b', type: 'any', default: false }], evaluate: (inputs) => ({ out: Boolean(inputs.a || inputs.b) }) },
  'logic.equals': { category: 'transform', inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }, { name: 'other', type: 'any', default: null, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: null }, { name: 'other', type: 'any', default: null }], evaluate: (inputs) => ({ out: Object.is(inputs.value, inputs.other) }) },
  'logic.notEquals': { category: 'transform', inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }, { name: 'other', type: 'any', default: null, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: null }, { name: 'other', type: 'any', default: null }], evaluate: (inputs) => ({ out: !Object.is(inputs.value, inputs.other) }) },
  'logic.greaterThan': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'other', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'other', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.value > inputs.other }) },
  'logic.lessThan': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'other', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'other', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.value < inputs.other }) },
  'logic.greaterOrEqual': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'other', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'other', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.value >= inputs.other }) },
  'logic.lessOrEqual': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'other', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'other', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.value <= inputs.other }) },
  'logic.select': { category: 'transform', inputs: [{ name: 'condition', type: 'any', default: false, kind: 'behavior' }, { name: 'whenTrue', type: 'any', default: null, kind: 'behavior' }, { name: 'whenFalse', type: 'any', default: null, kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'condition', type: 'any', default: false }, { name: 'whenTrue', type: 'any', default: null }, { name: 'whenFalse', type: 'any', default: null }], evaluate: (inputs) => ({ out: inputs.condition ? inputs.whenTrue : inputs.whenFalse }) },
  'logic.when': { category: 'transform', inputs: [{ name: 'condition', type: 'any', default: false, kind: 'behavior' }, { name: 'value', type: 'any', default: null, kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'condition', type: 'any', default: false }, { name: 'value', type: 'any', default: null }], evaluate: (inputs) => ({ out: inputs.condition ? inputs.value : null }) },

  'list.of': { category: 'transform', inputs: Array.from({ length: 8 }, (_, i) => ({ name: `value${i + 1}`, type: 'any', default: undefined, kind: 'behavior' })), outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: Array.from({ length: 8 }, (_, i) => ({ name: `value${i + 1}`, type: 'any', default: undefined })), evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 8 }, (_, i) => `value${i + 1}`)) }) },
  'list.range': { category: 'transform', inputs: [{ name: 'start', type: 'number', default: 0, kind: 'behavior' }, { name: 'end', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'start', type: 'number', default: 0 }, { name: 'end', type: 'number', default: 0 }], evaluate: (inputs) => { const start = Math.trunc(inputs.start); const end = Math.trunc(inputs.end); const step = start <= end ? 1 : -1; const out = []; for (let n = start; step > 0 ? n <= end : n >= end; n += step) out.push(n); return { out }; } },
  'list.length': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => ({ out: toArray(inputs.list).length }) },
  'list.at': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }, { name: 'index', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }, { name: 'index', type: 'number', default: 0 }], evaluate: (inputs) => { const list = toArray(inputs.list); const raw = Math.trunc(inputs.index); const index = raw < 0 ? list.length + raw : raw; return { out: index >= 0 && index < list.length ? list[index] : null }; } },
  'list.first': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => ({ out: toArray(inputs.list)[0] ?? null }) },
  'list.last': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => { const list = toArray(inputs.list); return { out: list.length ? list[list.length - 1] : null }; } },
  'list.map': mapFunctionValueNode('list.map', (list, fn, initial, ctx) => ({ out: list.map((item) => fn.call([item], ctx)) })),
  'list.filter': mapFunctionValueNode('list.filter', (list, fn, initial, ctx) => ({ out: list.filter((item) => isLoomletTruthy(fn.call([item], ctx))) })),
  'list.reduce': mapFunctionValueNode('list.reduce', (list, fn, initial, ctx) => ({ out: list.reduce((acc, item) => fn.call([acc, item], ctx), initial) })),
  'list.join': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }, { name: 'separator', type: 'any', default: ',', kind: 'behavior' }], outputs: [{ name: 'out', type: 'string', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }, { name: 'separator', type: 'any', default: ',' }], evaluate: (inputs) => ({ out: toArray(inputs.list).map((value) => stringifyTextValue(value)).join(stringifyTextValue(inputs.separator)) }) },
  'list.reverse': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => ({ out: [...toArray(inputs.list)].reverse() }) },
  'list.sort': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => { const list = [...toArray(inputs.list)]; if (list.every((value) => typeof value === 'number')) list.sort((a, b) => a - b); else list.sort((a, b) => String(a).localeCompare(String(b))); return { out: list }; } },
  'list.take': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }, { name: 'count', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }, { name: 'count', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: toArray(inputs.list).slice(0, Math.max(0, Math.trunc(inputs.count))) }) },
  'list.drop': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }, { name: 'count', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }, { name: 'count', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: toArray(inputs.list).slice(Math.max(0, Math.trunc(inputs.count))) }) },
  'list.concat': { category: 'transform', inputs: Array.from({ length: 4 }, (_, i) => ({ name: `list${i + 1}`, type: 'array', default: undefined, kind: 'behavior' })), outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: Array.from({ length: 4 }, (_, i) => ({ name: `list${i + 1}`, type: 'array', default: undefined })), evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 4 }, (_, i) => `list${i + 1}`)).flatMap((value) => toArray(value)) }) },

  'math.add': { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.a + inputs.b }) },
  'math.subtract': { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.a - inputs.b }) },
  'math.multiply': { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 1, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 1 }, { name: 'b', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.a * inputs.b }) },
  'math.divide': { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.b === 0 ? 0 : inputs.a / inputs.b }) },
  'math.mod': { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.b === 0 ? 0 : ((inputs.a % inputs.b) + inputs.b) % inputs.b }) },
  'math.abs': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.abs(inputs.value) }) },
  'math.clamp': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'min', type: 'number', default: 0, kind: 'behavior' }, { name: 'max', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'min', type: 'number', default: 0 }, { name: 'max', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.min > inputs.max ? inputs.min : Math.max(inputs.min, Math.min(inputs.max, inputs.value)) }) },
  'math.map': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'inMin', type: 'number', default: 0, kind: 'behavior' }, { name: 'inMax', type: 'number', default: 1, kind: 'behavior' }, { name: 'outMin', type: 'number', default: 0, kind: 'behavior' }, { name: 'outMax', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'inMin', type: 'number', default: 0 }, { name: 'inMax', type: 'number', default: 1 }, { name: 'outMin', type: 'number', default: 0 }, { name: 'outMax', type: 'number', default: 1 }, { name: 'clamp', type: 'boolean', default: false }], evaluate: (inputs, params) => { if (inputs.inMax === inputs.inMin) return { out: inputs.outMin }; let t = (inputs.value - inputs.inMin) / (inputs.inMax - inputs.inMin); if (params.clamp === true) t = Math.max(0, Math.min(1, t)); return { out: inputs.outMin + (inputs.outMax - inputs.outMin) * t }; } },
  'math.lerp': { category: 'transform', inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 1, kind: 'behavior' }, { name: 't', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 1 }, { name: 't', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: inputs.a + (inputs.b - inputs.a) * inputs.t }) },
  'math.smoothstep': { category: 'transform', inputs: [{ name: 'x', type: 'number', default: 0, kind: 'behavior' }, { name: 'edge0', type: 'number', default: 0, kind: 'behavior' }, { name: 'edge1', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'x', type: 'number', default: 0 }, { name: 'edge0', type: 'number', default: 0 }, { name: 'edge1', type: 'number', default: 1 }], evaluate: (inputs) => { if (inputs.edge0 === inputs.edge1) return { out: inputs.x < inputs.edge0 ? 0 : 1 }; let t = (inputs.x - inputs.edge0) / (inputs.edge1 - inputs.edge0); t = Math.max(0, Math.min(1, t)); return { out: t * t * (3 - 2 * t) }; } },
  'math.cosine': { category: 'transform', inputs: [{ name: 't', type: 'number', default: 0, kind: 'behavior' }, { name: 'freq', type: 'number', default: 1, kind: 'behavior' }, { name: 'amplitude', type: 'number', default: 1, kind: 'behavior' }, { name: 'phase', type: 'number', default: 0, kind: 'behavior' }, { name: 'offset', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'freq', type: 'number', default: 1 }, { name: 'amplitude', type: 'number', default: 1 }, { name: 'phase', type: 'number', default: 0 }, { name: 'offset', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.cos(inputs.t * inputs.freq * 2 * Math.PI + inputs.phase) * inputs.amplitude + inputs.offset }) },
  'math.floor': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.floor(inputs.value) }) },
  'math.ceil': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.ceil(inputs.value) }) },
  'math.round': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.round(inputs.value) }) },
  'math.min': { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.min(inputs.a, inputs.b) }) },
  'math.max': { category: 'transform', commutative: true, inputs: [{ name: 'a', type: 'number', default: 0, kind: 'behavior' }, { name: 'b', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'a', type: 'number', default: 0 }, { name: 'b', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.max(inputs.a, inputs.b) }) },
  'math.tan': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.tan(inputs.value) }) },
  'math.sqrt': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }], evaluate: (inputs) => ({ out: Math.sqrt(inputs.value) }) },
  'math.pow': { category: 'transform', inputs: [{ name: 'value', type: 'number', default: 0, kind: 'behavior' }, { name: 'exponent', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'value', type: 'number', default: 0 }, { name: 'exponent', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: Math.pow(inputs.value, inputs.exponent) }) },

  'random.value': { category: 'source', inputs: [], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [], evaluate: () => ({ out: Math.random() }) },
  'random.range': { category: 'transform', inputs: [{ name: 'min', type: 'number', default: 0, kind: 'behavior' }, { name: 'max', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'min', type: 'number', default: 0 }, { name: 'max', type: 'number', default: 1 }], evaluate: (inputs) => ({ out: inputs.min + Math.random() * (inputs.max - inputs.min) }) },
  'random.int': { category: 'transform', inputs: [{ name: 'min', type: 'number', default: 0, kind: 'behavior' }, { name: 'max', type: 'number', default: 1, kind: 'behavior' }], outputs: [{ name: 'out', type: 'number', kind: 'behavior' }], params: [{ name: 'min', type: 'number', default: 0 }, { name: 'max', type: 'number', default: 1 }], evaluate: (inputs) => { const min = Math.ceil(Math.min(inputs.min, inputs.max)); const max = Math.floor(Math.max(inputs.min, inputs.max)); return { out: Math.floor(Math.random() * (max - min + 1)) + min }; } },
  'random.choice': { category: 'transform', inputs: [{ name: 'list', type: 'array', default: [], kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'list', type: 'array', default: [] }], evaluate: (inputs) => { const list = toArray(inputs.list); return { out: list.length ? list[Math.floor(Math.random() * list.length)] : null }; } },

  'debug.inspect': { category: 'transform', inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }], outputs: [{ name: 'out', type: 'string', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: null }], evaluate: (inputs) => ({ out: inspectValue(inputs.value) }) },
  'debug.trace': { category: 'transform', inputs: [{ name: 'value', type: 'any', default: null, kind: 'behavior' }, { name: 'label', type: 'string', default: 'trace', kind: 'behavior' }], outputs: [{ name: 'out', type: 'any', kind: 'behavior' }], params: [{ name: 'value', type: 'any', default: null }, { name: 'label', type: 'string', default: 'trace' }], evaluate: (inputs, params, ctx) => { ctx.engine?._recordEffect({ type: 'debug.trace', label: inputs.label, value: inputs.value, nodeId: ctx.currentNodeId }); return { out: inputs.value }; } },
  'debug.assert': { category: 'transform', inputs: [{ name: 'condition', type: 'any', default: false, kind: 'behavior' }, { name: 'message', type: 'string', default: 'Assertion failed', kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'condition', type: 'any', default: false }, { name: 'message', type: 'string', default: 'Assertion failed' }], evaluate: (inputs) => { if (!inputs.condition) throw new LoomError('ASSERTION_FAILED', stringifyTextValue(inputs.message) || 'Assertion failed'); return { out: true }; } },

  'fs.readText': { category: 'source', inputs: [{ name: 'path', type: 'string', default: '', kind: 'behavior' }], outputs: [{ name: 'out', type: 'string', kind: 'behavior' }], params: [{ name: 'path', type: 'string', default: '' }], evaluate: (inputs) => ({ out: getNodeFs().readFileSync(String(inputs.path), 'utf8') }) },
  'fs.writeText': { category: 'sink', inputs: [{ name: 'path', type: 'string', default: '', kind: 'behavior' }, { name: 'value', type: 'any', default: '', kind: 'behavior' }], outputs: [], params: [{ name: 'path', type: 'string', default: '' }, { name: 'value', type: 'any', default: '' }], evaluate: (inputs) => { const fs = getNodeFs(); const path = getNodePath(); fs.mkdirSync(path.dirname(String(inputs.path)), { recursive: true }); fs.writeFileSync(String(inputs.path), stringifyTextValue(inputs.value), 'utf8'); return {}; } },
  'fs.exists': { category: 'source', inputs: [{ name: 'path', type: 'string', default: '', kind: 'behavior' }], outputs: [{ name: 'out', type: 'boolean', kind: 'behavior' }], params: [{ name: 'path', type: 'string', default: '' }], evaluate: (inputs) => ({ out: getNodeFs().existsSync(String(inputs.path)) }) },
  'fs.list': { category: 'source', inputs: [{ name: 'path', type: 'string', default: '.', kind: 'behavior' }], outputs: [{ name: 'out', type: 'array', kind: 'behavior' }], params: [{ name: 'path', type: 'string', default: '.' }], evaluate: (inputs) => ({ out: getNodeFs().readdirSync(String(inputs.path)) }) },

  // Scene Sync effect nodes
  'scene.setPosition': {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 0 },
      { name: 'y', type: 'number', default: 0 },
      { name: 'z', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setPosition',
        objectId: inputs.objectId,
        position: [inputs.x, inputs.y, inputs.z],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  },

  'scene.setRotation': {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' },
      { name: 'w', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 0 },
      { name: 'y', type: 'number', default: 0 },
      { name: 'z', type: 'number', default: 0 },
      { name: 'w', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setRotation',
        objectId: inputs.objectId,
        rotation: [inputs.x, inputs.y, inputs.z, inputs.w],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  },

  'scene.setScale': {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 1, kind: 'behavior' },
      { name: 'y', type: 'number', default: 1, kind: 'behavior' },
      { name: 'z', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 1 },
      { name: 'y', type: 'number', default: 1 },
      { name: 'z', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setScale',
        objectId: inputs.objectId,
        scale: [inputs.x, inputs.y, inputs.z],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  },

  // DOM シンクノード
  setText: {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target) return {};
      const el = document.querySelector(params.target);
      if (el) el.textContent = String(inputs.value);
      return {};
    }
  },

  setStyle: {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'property', type: 'string', default: '' },
      { name: 'unit', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.property) return {};
      const el = document.querySelector(params.target);
      if (el) el.style[params.property] = String(inputs.value) + params.unit;
      return {};
    }
  },
  setClass: {
    category: 'sink',
    inputs: [
      { name: 'enabled', type: 'boolean', default: true, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'className', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.className) return {};
      const el = document.querySelector(params.target);
      if (!el) return {};
      el.classList.toggle(params.className, Boolean(inputs.enabled));
      return {};
    }
  },
  setCssVar: {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'name', type: 'string', default: '' },
      { name: 'unit', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.name) return {};
      if (inputs.value === null || inputs.value === undefined) return {};
      const el = document.querySelector(params.target);
      if (!el) return {};
      const cssVarName = params.name.startsWith('--') ? params.name : `--${params.name}`;
      el.style.setProperty(cssVarName, String(inputs.value) + params.unit);
      return {};
    }
  },
  setTransform2D: {
    category: 'sink',
    inputs: [
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'scale', type: 'number', default: 1, kind: 'behavior' },
      { name: 'rotate', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'unit', type: 'string', default: 'px' },
      { name: 'rotateUnit', type: 'string', default: 'deg' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target) return {};
      const el = document.querySelector(params.target);
      if (!el) return {};
      el.style.transform = `translate(${inputs.x}${params.unit}, ${inputs.y}${params.unit}) scale(${inputs.scale}) rotate(${inputs.rotate}${params.rotateUnit})`;
      return {};
    }
  },

  setAttr: {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'name', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.name) return {};
      const el = document.querySelector(params.target);
      if (el) el.setAttribute(params.name, String(inputs.value));
      return {};
    }
  },

  log: {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: undefined, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'label', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      console.log(params.label || 'log', inputs.value);
      return {};
    }
  },

  'time.serverClock': {
    category: 'source',
    inputs: [],
    outputs: [{ name: 't', type: 'number', kind: 'behavior' }],
    params: [],
    evaluate: (inputs, params, ctx) => ({ t: ctx.time })
  },

  'math.sine': {
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
  }
};

export class Loom {
  constructor(graph) {
    this._currentGraph = null;
    this._pendingGraph = null;
    this._sortedNodeIds = [];
    this._values = new Map();
    this._prevOuts = new Map();
    this._eventQueue = [];
    this._rafId = null;
    this._startTime = null;
    this._lastTimestamp = null;
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
        const nodeType = NODE_TYPES[node.type];
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
        const nodeType = NODE_TYPES[node.type];
        if (nodeType.onStart) {
          nodeType.onStart(node, this);
        }
      }
    }
  }

  evaluateAt(time, frameTimestamp = time * 1000) {
    this._activatePendingGraph(true);

    // グラフが設定されていなければ何もしない
    if (!this._currentGraph) return;

    this._effects = [];

    const dt = this._computeDeltaTime(frameTimestamp);

    const ctx = {
      time,
      dt,
      engine: this,
      nodePredicates: new Map()
    };

    // Step 3: 全 Event ポートを [] にリセット（this._values に直接書く）
    for (const node of this._currentGraph.nodes) {
      const nodeType = NODE_TYPES[node.type];
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
      const nodeType = NODE_TYPES[node.type];

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
        const prevOut = this._prevOuts.has(nodeId)
          ? this._prevOuts.get(nodeId)
          : initial;
        const stateCtx = { ...ctx, prevOut: sanitizeStateValue(prevOut, initial) };

        try {
          outputs = nodeType.evaluate(inputs, params, stateCtx);
          const rawOut = outputs?.out;
          const rawNewState = outputs?._newState !== undefined ? outputs._newState : rawOut;
          const safeOut = sanitizeStateValue(rawOut, initial);
          const safeNewState = sanitizeStateValue(rawNewState, initial);
          outputs = { ...outputs, out: safeOut };
          this._prevOuts.set(nodeId, safeNewState);
        } catch (error) {
          console.error(`State node evaluation failed: ${nodeId}`, error);
          outputs = { out: stateCtx.prevOut };
        }
      } else {
        outputs = nodeType.evaluate(inputs, params, { ...ctx, currentNodeId: nodeId });
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

  evaluateOnce({ time = 0, dt = 0 } = {}) {
    const safeTime = Number.isFinite(time) ? time : 0;
    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    const frameTimestamp = safeTime * 1000;

    this._activatePendingGraph(false);
    this._lastTimestamp = frameTimestamp - (safeDt * 1000);
    this.evaluateAt(safeTime, frameTimestamp);
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

    const nodeType = NODE_TYPES[node.type];
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

    // トポロジカルソートを実行（サイクルチェック含む）
    const sortedNodeIds = this._topologicalSort(graph);

    // 保留状態で保持
    this._pendingGraph = graph;
    this._pendingNodeIds = sortedNodeIds;
  }

  start() {
    if (this._rafId !== null) return; // 既に実行中なら何もしない

    // 初回: 新グラフの onStart を呼ぶ
    if (this._currentGraph) {
      for (const node of this._currentGraph.nodes) {
        const nodeType = NODE_TYPES[node.type];
        if (nodeType.onStart) {
          nodeType.onStart(node, this);
        }
      }
    }

    this._lastTimestamp = null;
    this._startTime = performance.now() / 1000;
    const tick = (timestamp) => {
      const elapsed = (timestamp / 1000) - this._startTime;
      this.evaluateAt(elapsed, timestamp);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // グラフのノードの onStop を呼ぶ
    if (this._currentGraph) {
      for (const node of this._currentGraph.nodes) {
        const nodeType = NODE_TYPES[node.type];
        if (nodeType.onStop) {
          nodeType.onStop(node, this);
        }
      }
    }
  }

  _computeDeltaTime(frameTimestamp) {
    if (this._lastTimestamp === null) {
      this._lastTimestamp = frameTimestamp;
      return 0;
    }

    const dt = Math.max(0, (frameTimestamp - this._lastTimestamp) / 1000);
    this._lastTimestamp = frameTimestamp;
    return Math.min(dt, 0.1);
  }

  _reconcileStateForGraph(graph) {
    const nextStateIds = new Set(
      graph.nodes
        .filter(node => NODE_TYPES[node.type]?.category === 'state')
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
      if (!NODE_TYPES[node.type]) {
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
      const fromNodeType = NODE_TYPES[fromNode.type];
      const fromPort = fromNodeType.outputs.find(o => o.name === fromPortName);
      if (!fromPort) {
        throw new LoomError('UNKNOWN_PORT', `Unknown port: ${fromNodeId}.${fromPortName}`, { nodeId: fromNodeId, port: fromPortName, side: 'output' });
      }

      const toNode = graph.nodes.find(n => n.id === toNodeId);
      const toNodeType = NODE_TYPES[toNode.type];
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
