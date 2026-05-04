// Loom DSL パーサ – 依存ゼロの ESM モジュール

import { NODE_TYPES } from './loom.js';

export class LoomDSLError extends Error {
  constructor(message, line, column, code) {
    super(message);
    this.name = 'LoomDSLError';
    this.line = line;
    this.column = column;
    this.code = code;
  }
}

function defaultOutputPort(nodeTypeName) {
  const def = NODE_TYPES[nodeTypeName];
  if (!def || !def.outputs || def.outputs.length === 0) return 'out';
  if (def.outputs.length === 1) return def.outputs[0].name;
  const found = def.outputs.find(o => o.name === 'out');
  return found ? 'out' : def.outputs[0].name;
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

const TT = {
  IDENT: 'IDENT', NUMBER: 'NUMBER', STRING: 'STRING', BOOL: 'BOOL',
  ASSIGN: 'ASSIGN', COLON: 'COLON', COMMA: 'COMMA',
  LPAREN: 'LPAREN', RPAREN: 'RPAREN', PIPE: 'PIPE',
  NEWLINE: 'NEWLINE', EOF: 'EOF',
};

function tokenize(src) {
  const tokens = [];
  let pos = 0, line = 1, lineStart = 0;

  function col() { return pos - lineStart + 1; }
  function peek() { return src[pos]; }
  function advance() {
    const c = src[pos++];
    if (c === '\n') { line++; lineStart = pos; }
    return c;
  }
  function dslErr(msg) {
    throw new LoomDSLError(msg, line, col(), 'UNEXPECTED_TOKEN');
  }

  while (pos < src.length) {
    const sl = line, sc = col();
    const ch = peek();

    if (ch === '#') { while (pos < src.length && peek() !== '\n') pos++; continue; }
    if (ch === '\n') { advance(); tokens.push({ type: TT.NEWLINE, line: sl, col: sc }); continue; }
    if (ch === ' ' || ch === '\t' || ch === '\r') { pos++; continue; }

    // number (positive – unary minus not supported at expression level, handled inline)
    if (/\d/.test(ch)) {
      let num = '';
      while (pos < src.length && /[\d.]/.test(peek())) num += advance();
      if (pos < src.length && /[eE]/.test(peek())) {
        num += advance();
        if (pos < src.length && /[+\-]/.test(peek())) num += advance();
        while (pos < src.length && /\d/.test(peek())) num += advance();
      }
      tokens.push({ type: TT.NUMBER, value: parseFloat(num), line: sl, col: sc });
      continue;
    }

    // negative number
    if (ch === '-' && pos + 1 < src.length && /\d/.test(src[pos + 1])) {
      advance();
      let num = '-';
      while (pos < src.length && /[\d.]/.test(peek())) num += advance();
      if (pos < src.length && /[eE]/.test(peek())) {
        num += advance();
        if (pos < src.length && /[+\-]/.test(peek())) num += advance();
        while (pos < src.length && /\d/.test(peek())) num += advance();
      }
      tokens.push({ type: TT.NUMBER, value: parseFloat(num), line: sl, col: sc });
      continue;
    }

    // string
    if (ch === '"') {
      advance();
      let str = '';
      while (pos < src.length && peek() !== '"') {
        if (peek() === '\n') dslErr('Unterminated string literal');
        str += advance();
      }
      if (pos >= src.length) dslErr('Unterminated string literal');
      advance();
      tokens.push({ type: TT.STRING, value: str, line: sl, col: sc });
      continue;
    }

    // identifier / keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (pos < src.length && /[a-zA-Z0-9_]/.test(peek())) id += advance();
      if (id === 'true')  { tokens.push({ type: TT.BOOL, value: true,  line: sl, col: sc }); continue; }
      if (id === 'false') { tokens.push({ type: TT.BOOL, value: false, line: sl, col: sc }); continue; }
      tokens.push({ type: TT.IDENT, value: id, line: sl, col: sc });
      continue;
    }

    if (ch === '=') { advance(); tokens.push({ type: TT.ASSIGN, line: sl, col: sc }); continue; }
    if (ch === ':') { advance(); tokens.push({ type: TT.COLON,  line: sl, col: sc }); continue; }
    if (ch === ',') { advance(); tokens.push({ type: TT.COMMA,  line: sl, col: sc }); continue; }
    if (ch === '(') { advance(); tokens.push({ type: TT.LPAREN, line: sl, col: sc }); continue; }
    if (ch === ')') { advance(); tokens.push({ type: TT.RPAREN, line: sl, col: sc }); continue; }
    if (ch === '|') {
      advance();
      if (pos >= src.length || peek() !== '>') dslErr("Expected '>' after '|'");
      advance();
      tokens.push({ type: TT.PIPE, line: sl, col: sc });
      continue;
    }

    dslErr(`Unexpected character: ${ch}`);
  }
  tokens.push({ type: TT.EOF, line, col: col() });
  return tokens;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parse(tokens) {
  let pos = 0;

  function peek(off = 0) { return tokens[Math.min(pos + off, tokens.length - 1)]; }
  function consume() { return tokens[pos++]; }
  function pErr(msg, code, tok) {
    const t = tok || peek();
    throw new LoomDSLError(msg, t.line, t.col, code || 'UNEXPECTED_TOKEN');
  }
  function expect(type) {
    const t = peek();
    if (t.type !== type) pErr(`Expected ${type}, got ${t.type}`, 'UNEXPECTED_TOKEN', t);
    return consume();
  }
  function skipNewlines() { while (peek().type === TT.NEWLINE) consume(); }

  const stmts = [];
  while (true) {
    skipNewlines();
    if (peek().type === TT.EOF) break;
    stmts.push(parseStatement());
  }
  return stmts;

  function parseStatement() {
    const t = peek();

    // render statement
    if (t.type === TT.IDENT && t.value === 'render') {
      consume();
      const call = parseCall();
      expectEnd();
      return { type: 'render', call };
    }

    // assignment: IDENT = expr
    if (t.type === TT.IDENT && peek(1).type === TT.ASSIGN) {
      const name = consume().value;
      consume(); // =
      const expr = parsePipe();
      expectEnd();
      return { type: 'assign', name, expr };
    }

    pErr(`Expected assignment or render statement`, 'UNEXPECTED_TOKEN', t);
  }

  function expectEnd() {
    if (peek().type === TT.NEWLINE) { consume(); return; }
    if (peek().type === TT.EOF) return;
    pErr(`Expected newline or EOF, got ${peek().type}`);
  }

  function parsePipe() {
    let expr = parseAtom();

    while (true) {
      if (peek().type === TT.PIPE) {
        consume();
        skipNewlines();
        expr = { type: 'pipe', left: expr, call: parseCall() };
        continue;
      }

      // continuation: single newline followed by |>
      if (peek().type === TT.NEWLINE) {
        let ahead = pos + 1;
        // skip over consecutive NEWLINEs
        let extraNewlines = 0;
        while (ahead < tokens.length && tokens[ahead].type === TT.NEWLINE) {
          extraNewlines++;
          ahead++;
        }
        if (extraNewlines > 0) break; // blank line → chain ends
        if (tokens[ahead] && tokens[ahead].type === TT.PIPE) {
          consume(); // consume NEWLINE
          consume(); // consume PIPE
          skipNewlines();
          expr = { type: 'pipe', left: expr, call: parseCall() };
          continue;
        }
      }

      break;
    }

    return expr;
  }

  function parseAtom() {
    const t = peek();
    if (t.type === TT.NUMBER) { consume(); return { type: 'number', value: t.value, line: t.line, col: t.col }; }
    if (t.type === TT.STRING) { consume(); return { type: 'string', value: t.value, line: t.line, col: t.col }; }
    if (t.type === TT.BOOL)   { consume(); return { type: 'bool',   value: t.value, line: t.line, col: t.col }; }
    if (t.type === TT.IDENT) {
      if (peek(1).type === TT.LPAREN) return parseCall();
      consume();
      return { type: 'ident', name: t.value, line: t.line, col: t.col };
    }
    pErr(`Unexpected token: ${t.type}${t.value !== undefined ? ` (${t.value})` : ''}`, 'UNEXPECTED_TOKEN', t);
  }

  function parseCall() {
    const nt = peek();
    if (nt.type !== TT.IDENT) pErr('Expected function name', 'UNEXPECTED_TOKEN', nt);
    const name = consume().value;
    expect(TT.LPAREN);
    skipNewlines();

    const args = [];
    while (peek().type !== TT.RPAREN && peek().type !== TT.EOF) {
      skipNewlines();
      if (peek().type === TT.RPAREN) break;

      if (peek().type === TT.IDENT && peek(1).type === TT.COLON) {
        const argName = consume().value;
        consume(); // :
        skipNewlines();
        args.push({ named: true, name: argName, value: parseAtom() });
      } else {
        args.push({ named: false, value: parseAtom() });
      }

      skipNewlines();
      if (peek().type === TT.COMMA) { consume(); skipNewlines(); }
    }

    expect(TT.RPAREN);
    return { type: 'call', name, args, line: nt.line, col: nt.col };
  }
}

// ─── Graph Builder ────────────────────────────────────────────────────────────

function buildGraph(stmts) {
  const nodes = [];
  const edges = [];
  let renderConfig = null;
  let anonCounter = 0;
  const scope = {}; // identifier → nodeId

  function anonId() { return `_anon_${++anonCounter}`; }

  function gErr(msg, code, line, col) {
    throw new LoomDSLError(msg, line || 0, col || 0, code || 'UNKNOWN_NODE_TYPE');
  }

  function resolveIdent(name, line, col) {
    if (!(name in scope)) {
      throw new LoomDSLError(`Undefined identifier: ${name}`, line, col, 'UNDEFINED_IDENTIFIER');
    }
    const nodeId = scope[name];
    const node = nodes.find(n => n.id === nodeId);
    return `${nodeId}.${defaultOutputPort(node.type)}`;
  }

  // Build a node from a call AST node.
  // pipeFrom: string ref "nodeId.portName" to wire as the first input (from |>)
  // resultId: desired node ID (for top-level assignments); null for anon
  function buildNode(call, resultId, pipeFrom) {
    const fnName = call.name;
    const typeDef = NODE_TYPES[fnName];
    if (!typeDef) {
      throw new LoomDSLError(`Unknown node type: ${fnName}`, call.line, call.col, 'UNKNOWN_NODE_TYPE');
    }

    const id = resultId || anonId();
    const nodeObj = { id, type: fnName };
    nodes.push(nodeObj);

    const inputNames = typeDef.inputs.map(i => i.name);
    const paramNames = typeDef.params ? typeDef.params.map(p => p.name) : [];
    const isComm = typeDef.commutative === true;

    const positional = call.args.filter(a => !a.named);
    const named      = call.args.filter(a =>  a.named);

    // Validation ──────────────────────────────────────────────────────────────
    // Commutative: explicit args must be ALL positional or ALL named (no mix)
    if (isComm && positional.length > 0 && named.length > 0) {
      throw new LoomDSLError(
        `Node '${fnName}' is commutative: arguments must be all positional or all named`,
        call.line, call.col, 'MISSING_ARGUMENT_NAME'
      );
    }

    // Non-commutative (default rule): at most the first explicit arg may be positional;
    // if pipeFrom is set, that already fills arg[0], so no explicit positional allowed.
    if (!isComm) {
      const allowedPositional = pipeFrom ? 0 : 1;
      if (positional.length > allowedPositional) {
        const bad = positional[allowedPositional].value;
        throw new LoomDSLError(
          `Argument at position ${allowedPositional + (pipeFrom ? 1 : 2)} for '${fnName}' requires a name`,
          bad.line || call.line, bad.col || call.col, 'MISSING_ARGUMENT_NAME'
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    let inputIdx = 0;

    function wire(expr, portName) {
      if (expr.type === 'ident') {
        edges.push({ from: resolveIdent(expr.name, expr.line, expr.col), to: `${id}.${portName}` });
      } else if (expr.type === 'call') {
        const innerId = buildExpr(expr, null, null);
        const innerNode = nodes.find(n => n.id === innerId);
        edges.push({ from: `${innerId}.${defaultOutputPort(innerNode.type)}`, to: `${id}.${portName}` });
      } else {
        if (!nodeObj.params) nodeObj.params = {};
        nodeObj.params[portName] = expr.value;
      }
    }

    // pipeFrom → first input port
    if (pipeFrom) {
      const portName = inputNames[inputIdx++];
      if (!portName) gErr(`Too many arguments for '${fnName}'`, 'UNEXPECTED_TOKEN', call.line, call.col);
      edges.push({ from: pipeFrom, to: `${id}.${portName}` });
    }

    // positional explicit args
    for (const arg of positional) {
      const portName = inputNames[inputIdx++];
      if (!portName) gErr(`Too many positional arguments for '${fnName}'`, 'UNEXPECTED_TOKEN', call.line, call.col);
      wire(arg.value, portName);
    }

    // named explicit args
    for (const arg of named) {
      if (inputNames.includes(arg.name)) {
        wire(arg.value, arg.name);
      } else if (paramNames.includes(arg.name)) {
        if (!nodeObj.params) nodeObj.params = {};
        if (arg.value.type === 'ident' || arg.value.type === 'call') {
          throw new LoomDSLError(
            `Parameter '${arg.name}' for '${fnName}' must be a literal`,
            arg.value.line || call.line,
            arg.value.col || call.col,
            'UNEXPECTED_TOKEN'
          );
        }
        nodeObj.params[arg.name] = arg.value.value;
      } else {
        throw new LoomDSLError(
          `Unknown argument '${arg.name}' for '${fnName}'`,
          call.line,
          call.col,
          'UNKNOWN_ARGUMENT'
        );
      }
    }

    return id;
  }

  // Recursively build an expression, returning the resulting nodeId.
  function buildExpr(expr, resultId, pipeFrom) {
    if (expr.type === 'call') {
      return buildNode(expr, resultId, pipeFrom);
    }
    if (expr.type === 'pipe') {
      // Recursively evaluate the left side
      const leftId = buildExpr(expr.left, null, null);
      const leftNode = nodes.find(n => n.id === leftId);
      const leftRef = `${leftId}.${defaultOutputPort(leftNode.type)}`;
      return buildNode(expr.call, resultId, leftRef);
    }
    if (expr.type === 'ident') {
      if (!(expr.name in scope)) {
        throw new LoomDSLError(`Undefined identifier: ${expr.name}`, expr.line, expr.col, 'UNDEFINED_IDENTIFIER');
      }
      return scope[expr.name];
    }
    throw new LoomDSLError(`Cannot use literal as expression`, expr.line || 0, expr.col || 0, 'UNEXPECTED_TOKEN');
  }

  // render call → config object
  function buildRenderConfig(call) {
    const fnName = call.name;
    if (fnName !== 'point' && fnName !== 'bar') {
      throw new LoomDSLError(`Unknown render function: ${fnName}`, call.line, call.col, 'UNKNOWN_NODE_TYPE');
    }

    const named = {};
    for (const arg of call.args) {
      if (!arg.named) {
        throw new LoomDSLError(`render arguments must be named`, call.line, call.col, 'MISSING_ARGUMENT_NAME');
      }
      named[arg.name] = arg.value;
    }

    function rv(expr) {
      if (!expr) return undefined;
      if (expr.type === 'number') return expr.value;
      if (expr.type === 'string') return expr.value;
      if (expr.type === 'ident')  return resolveIdent(expr.name, expr.line, expr.col);
      throw new LoomDSLError(`Invalid render argument`, expr.line, expr.col, 'UNEXPECTED_TOKEN');
    }

    if (fnName === 'point') {
      const cfg = { type: 'point' };
      if (named.x) cfg.x = rv(named.x);
      if (named.y) cfg.y = rv(named.y);
      cfg.color = named.color ? named.color.value : '#00ff00';
      cfg.trail = named.trail !== undefined ? named.trail.value : 0.1;
      return cfg;
    } else {
      const cfg = { type: 'bar' };
      if (named.width) cfg.width = rv(named.width);
      cfg.color  = named.color  ? named.color.value  : '#00ccff';
      cfg.height = named.height !== undefined ? named.height.value : 40;
      if (named.y !== undefined) cfg.y = rv(named.y);
      return cfg;
    }
  }

  for (const stmt of stmts) {
    if (stmt.type === 'render') {
      renderConfig = buildRenderConfig(stmt.call);
    } else if (stmt.type === 'assign') {
      const nodeId = buildExpr(stmt.expr, stmt.name, null);
      scope[stmt.name] = nodeId;
    }
  }

  const result = { nodes, edges };
  if (renderConfig) result.render = renderConfig;
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseDSL(text) {
  const tokens = tokenize(text);
  const ast = parse(tokens);
  return buildGraph(ast);
}
