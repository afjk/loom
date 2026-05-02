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

// ノード型レジストリ
const NODE_TYPES = {
  // Phase 0 ノード
  clock: {
    category: 'source',
    inputs: [],
    outputs: [{ name: 't', type: 'number', kind: 'behavior' }],
    params: [],
    evaluate: (inputs, params, ctx) => ({ t: ctx.time })
  },
  constant: {
    category: 'source',
    inputs: [],
    outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
    params: [{ name: 'value', type: 'number', default: 0 }],
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
  }
};

export class Loom {
  constructor(graph) {
    this._currentGraph = null;
    this._pendingGraph = null;
    this._sortedNodeIds = [];
    this._values = new Map();
    this._eventQueue = [];
    this._rafId = null;
    this._startTime = null;
    this._inputStates = {};

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

  evaluateAt(time) {
    // 保留中グラフがあれば切り替え
    if (this._pendingGraph !== null) {
      // 旧グラフのノードの onStop を呼ぶ
      if (this._currentGraph) {
        for (const node of this._currentGraph.nodes) {
          const nodeType = NODE_TYPES[node.type];
          if (nodeType.onStop) {
            nodeType.onStop(node, this);
          }
        }
      }

      this._currentGraph = this._pendingGraph;
      this._sortedNodeIds = this._pendingNodeIds;
      this._pendingGraph = null;

      // 新グラフのノードの onStart を呼ぶ
      for (const node of this._currentGraph.nodes) {
        const nodeType = NODE_TYPES[node.type];
        if (nodeType.onStart) {
          nodeType.onStart(node, this);
        }
      }
    }

    // グラフが設定されていなければ何もしない
    if (!this._currentGraph) return;

    const ctx = {
      time,
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
      const outputs = nodeType.evaluate(inputs, params, ctx);

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

  getValue(ref) {
    return this._values.get(ref);
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

    this._startTime = performance.now() / 1000;
    const tick = () => {
      const elapsed = (performance.now() / 1000) - this._startTime;
      this.evaluateAt(elapsed);
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
