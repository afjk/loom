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

const TT = {
  IDENT: 'IDENT', NUMBER: 'NUMBER', STRING: 'STRING', BOOL: 'BOOL', NULL: 'NULL',
  ASSIGN: 'ASSIGN', COLON: 'COLON', COMMA: 'COMMA', DOT: 'DOT',
  LPAREN: 'LPAREN', RPAREN: 'RPAREN', LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  LBRACE: 'LBRACE', RBRACE: 'RBRACE', PIPE: 'PIPE', ARROW: 'ARROW', COMMENT: 'COMMENT', NEWLINE: 'NEWLINE', EOF: 'EOF',
};

const posFrom = (line, column, offset) => ({ line, column, offset });
const spanFrom = (s, e) => ({ start: s, end: e });
const mkIdent = (tok) => ({ type: 'Identifier', name: tok.value, span: tok.span });

function tokenize(src) {
  const tokens = [];
  let i = 0, line = 1, col = 1;
  const cur = () => src[i];
  const adv = () => {
    const c = src[i++];
    if (c === '\n') { line++; col = 1; } else col++;
    return c;
  };
  const tok = (type, value, sLine, sCol, sOff, eLine = line, eCol = col, eOff = i) => tokens.push({ type, value, span: spanFrom(posFrom(sLine, sCol, sOff), posFrom(eLine, eCol, eOff)) });

  while (i < src.length) {
    const sLine = line, sCol = col, sOff = i;
    const ch = cur();
    if (ch === ' ' || ch === '\t' || ch === '\r') { adv(); continue; }
    if (ch === '\n') { adv(); tok(TT.NEWLINE, undefined, sLine, sCol, sOff); continue; }
    if (ch === '#') {
      adv(); let text = '';
      while (i < src.length && cur() !== '\n') text += adv();
      tok(TT.COMMENT, text, sLine, sCol, sOff);
      continue;
    }
    if (/\d/.test(ch) || (ch === '-' && /\d/.test(src[i + 1]))) {
      let raw = '';
      raw += adv();
      while (i < src.length && /[\d.]/.test(cur())) raw += adv();
      if (i < src.length && /[eE]/.test(cur())) { raw += adv(); if (/[+\-]/.test(cur())) raw += adv(); while (i < src.length && /\d/.test(cur())) raw += adv(); }
      tok(TT.NUMBER, { value: parseFloat(raw), raw }, sLine, sCol, sOff);
      continue;
    }
    if (ch === '"' || ch === "'") {
      const q = adv();
      let text = '';
      while (i < src.length && cur() !== q) {
        if (cur() === '\n') throw new LoomDSLError('Unterminated string literal', sLine, sCol, 'UNEXPECTED_TOKEN');
        text += adv();
      }
      if (i >= src.length) throw new LoomDSLError('Unterminated string literal', sLine, sCol, 'UNEXPECTED_TOKEN');
      adv();
      tok(TT.STRING, { value: text, raw: `${q}${text}${q}` }, sLine, sCol, sOff);
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < src.length && /[a-zA-Z0-9_]/.test(cur())) id += adv();
      if (id === 'true' || id === 'false') { tok(TT.BOOL, id === 'true', sLine, sCol, sOff); continue; }
      if (id === 'null') { tok(TT.NULL, null, sLine, sCol, sOff); continue; }
      tok(TT.IDENT, id, sLine, sCol, sOff);
      continue;
    }
    const map = { '=': TT.ASSIGN, ':': TT.COLON, ',': TT.COMMA, '.': TT.DOT, '(': TT.LPAREN, ')': TT.RPAREN, '[': TT.LBRACKET, ']': TT.RBRACKET, '{': TT.LBRACE, '}': TT.RBRACE };
    if (ch === '=' && src[i + 1] === '>') { adv(); adv(); tok(TT.ARROW, undefined, sLine, sCol, sOff); continue; }
    if (ch === '|') { adv(); if (cur() !== '>') throw new LoomDSLError("Expected '>' after '|'", sLine, sCol, 'UNEXPECTED_TOKEN'); adv(); tok(TT.PIPE, undefined, sLine, sCol, sOff); continue; }
    if (map[ch]) { adv(); tok(map[ch], undefined, sLine, sCol, sOff); continue; }
    throw new LoomDSLError(`Unexpected character: ${ch}`, sLine, sCol, 'UNEXPECTED_TOKEN');
  }
  tok(TT.EOF, undefined, line, col, i);
  return tokens;
}

export function parseDSLToAST(source) {
  const errors = [];
  try {
    const tokens = tokenize(source);
    let p = 0;
    const body = [];
    const imports = [];
    let pendingComments = [];
    const peek = (o = 0) => tokens[Math.min(p + o, tokens.length - 1)];
    const take = () => tokens[p++];
    const expect = (tt) => { const t = peek(); if (t.type !== tt) throw new LoomDSLError(`Expected ${tt}, got ${t.type}`, t.span.start.line, t.span.start.column, 'UNEXPECTED_TOKEN'); return take(); };
    const skipNL = () => { while (peek().type === TT.NEWLINE) take(); };
    function parseQualifiedIdentifier() {
      const first = expect(TT.IDENT);
      const parts = [first.value];
      let end = first.span.end;
      while (peek().type === TT.DOT) {
        take();
        const next = expect(TT.IDENT);
        parts.push(next.value);
        end = next.span.end;
      }
      return { type: 'Identifier', name: parts.join('.'), span: spanFrom(first.span.start, end) };
    }

    function parseExpr() { return parseFunctionLiteral(); }
    function parseFunctionLiteral() {
      const t = peek();
      if (t.type === TT.IDENT && t.value === 'fn' && peek(1).type === TT.LPAREN) {
        take();
        expect(TT.LPAREN);
        const params = [];
        while (peek().type !== TT.RPAREN && peek().type !== TT.EOF) {
          const param = expect(TT.IDENT);
          params.push({ type: 'Identifier', name: param.value, span: param.span });
          if (peek().type === TT.COMMA) take();
          else break;
        }
        expect(TT.RPAREN);
        expect(TT.ARROW);
        const body = parseExpr();
        return { type: 'FunctionLiteral', params, body, span: spanFrom(t.span.start, body.span.end) };
      }
      return parsePipe();
    }
    function parsePipe() { let left = parseAtom(); while (true) { if (peek().type === TT.PIPE || (peek().type === TT.NEWLINE && peek(1).type === TT.PIPE)) { if (peek().type === TT.NEWLINE) take(); const pt = take(); const right = parseCall(); left = { type: 'PipeExpression', left, right, span: spanFrom(left.span.start, right.span.end) }; } else break; } return left; }
    function parseAtom() {
      const t = peek();
      if (t.type === TT.NUMBER) { take(); return { type: 'NumberLiteral', value: t.value.value, raw: t.value.raw, span: t.span }; }
      if (t.type === TT.STRING) { take(); return { type: 'StringLiteral', value: t.value.value, raw: t.value.raw, span: t.span }; }
      if (t.type === TT.BOOL) { take(); return { type: 'BooleanLiteral', value: t.value, span: t.span }; }
      if (t.type === TT.NULL) { take(); return { type: 'NullLiteral', span: t.span }; }
      if (t.type === TT.LBRACKET) return parseArray();
      if (t.type === TT.LBRACE) return parseObject();
      if (t.type === TT.IDENT) { if (peek(1).type === TT.LPAREN || peek(1).type === TT.DOT) return parseCall(); take(); return mkIdent(t); }
      throw new LoomDSLError(`Unexpected token: ${t.type}`, t.span.start.line, t.span.start.column, 'UNEXPECTED_TOKEN');
    }
    function parseArray() { const st = expect(TT.LBRACKET); const elements = []; while (peek().type !== TT.RBRACKET && peek().type !== TT.EOF) { elements.push(parseExpr()); if (peek().type === TT.COMMA) take(); else break; } const ed = expect(TT.RBRACKET); return { type: 'ArrayLiteral', elements, span: spanFrom(st.span.start, ed.span.end) }; }
    function parseObject() { const st = expect(TT.LBRACE); const entries = []; while (peek().type !== TT.RBRACE && peek().type !== TT.EOF) { const kt = peek(); let key; if (kt.type === TT.IDENT) { take(); key = mkIdent(kt); } else if (kt.type === TT.STRING) { take(); key = { type: 'StringLiteral', value: kt.value.value, raw: kt.value.raw, span: kt.span }; } else throw new LoomDSLError('Expected object key', kt.span.start.line, kt.span.start.column, 'UNEXPECTED_TOKEN'); expect(TT.COLON); const value = parseExpr(); entries.push({ type: 'ObjectEntry', key, value, span: spanFrom(key.span.start, value.span.end) }); if (peek().type === TT.COMMA) take(); else break; } const ed = expect(TT.RBRACE); return { type: 'ObjectLiteral', entries, span: spanFrom(st.span.start, ed.span.end) }; }
    function parseCall() { const callee = parseQualifiedIdentifier(); expect(TT.LPAREN); skipNL(); const args = []; while (peek().type !== TT.RPAREN && peek().type !== TT.EOF) { skipNL(); const at = peek(); if (at.type === TT.IDENT && peek(1).type === TT.COLON) { const n = mkIdent(take()); take(); skipNL(); const v = parseExpr(); args.push({ type: 'NamedArg', name: n, value: v, span: spanFrom(n.span.start, v.span.end) }); } else { const v = parseExpr(); args.push({ type: 'PositionalArg', value: v, span: v.span }); } skipNL(); if (peek().type === TT.COMMA) take(); skipNL(); }
      const end = expect(TT.RPAREN); return { type: 'CallExpression', callee, args, span: spanFrom(callee.span.start, end.span.end) }; }

    let blankLines = 0;
    let seenNonImportStatement = false;
    function flushPendingAsStandalone() {
      if (!pendingComments.length) return;
      for (const c of pendingComments) body.push({ type: 'CommentStatement', comment: c, span: c.span });
      pendingComments = [];
    }
    while (peek().type !== TT.EOF) {
      if (peek().type === TT.NEWLINE) {
        take();
        blankLines++;
        if (blankLines > 1) flushPendingAsStandalone();
        continue;
      }
      if (peek().type === TT.COMMENT) {
        const ct = take(); const c = { type: 'Comment', text: ct.value, variant: 'line', span: ct.span };
        pendingComments.push(c);
        if (peek().type === TT.NEWLINE) take();
        blankLines = 0;
        continue;
      }
      blankLines = 0;
      const stTok = peek();
      if (stTok.type === TT.IDENT && stTok.value === 'import') {
        if (seenNonImportStatement) {
          throw new LoomDSLError('Import statements must appear before other statements', stTok.span.start.line, stTok.span.start.column, 'IMPORT_MUST_BE_TOP_LEVEL');
        }
        take();
        const libTok = peek();
        if (libTok.type !== TT.IDENT) {
          throw new LoomDSLError('Expected library name after import', stTok.span.end.line, stTok.span.end.column, 'UNEXPECTED_TOKEN');
        }
        take();
        if (peek().type !== TT.NEWLINE && peek().type !== TT.EOF && peek().type !== TT.COMMENT) {
          throw new LoomDSLError('Import names must be simple identifiers', peek().span.start.line, peek().span.start.column, 'UNEXPECTED_TOKEN');
        }
        const importDecl = {
          type: 'ImportDeclaration',
          name: libTok.value,
          line: stTok.span.start.line,
          column: stTok.span.start.column,
          span: spanFrom(stTok.span.start, libTok.span.end)
        };
        if (pendingComments.length) {
          importDecl.leadingComments = pendingComments;
          pendingComments = [];
        }
        if (peek().type === TT.COMMENT) {
          const ct = take();
          importDecl.trailingComment = { type: 'Comment', text: ct.value, variant: 'line', span: ct.span };
        }
        if (peek().type === TT.NEWLINE) take();
        imports.push(importDecl);
        continue;
      }
      let stmt;
      if (stTok.type === TT.IDENT && stTok.value === 'render') { take(); const call = parseCall(); stmt = { type: 'RenderStatement', call, span: spanFrom(stTok.span.start, call.span.end) }; }
      else if (stTok.type === TT.IDENT && peek(1).type === TT.ASSIGN) { const target = mkIdent(take()); take(); const value = parseExpr(); stmt = { type: 'AssignmentStatement', target, value, span: spanFrom(target.span.start, value.span.end) }; }
      else if (stTok.type === TT.IDENT && (peek(1).type === TT.LPAREN || peek(1).type === TT.DOT)) { const expression = parseCall(); stmt = { type: 'ExpressionStatement', expression, span: expression.span }; }
      else throw new LoomDSLError('Expected assignment or render statement', stTok.span.start.line, stTok.span.start.column, 'UNEXPECTED_TOKEN');
      seenNonImportStatement = true;
      if (pendingComments.length) { stmt.leadingComments = pendingComments; pendingComments = []; }
      if (peek().type === TT.COMMENT) { const ct = take(); stmt.trailingComment = { type: 'Comment', text: ct.value, variant: 'line', span: ct.span }; }
      if (peek().type === TT.NEWLINE) take();
      body.push(stmt);
    }
    flushPendingAsStandalone();
    const end = tokens[tokens.length - 1].span.end;
    return { ast: { type: 'Program', imports, body, span: spanFrom(posFrom(1, 1, 0), end) }, errors };
  } catch (e) {
    // TODO: support error recovery to collect multiple errors
    errors.push({ type: 'ParseError', message: e.message, code: e.code || 'UNEXPECTED_TOKEN', span: { start: { line: e.line || 1, column: e.column || 1, offset: 0 }, end: { line: e.line || 1, column: e.column || 1, offset: 0 } } });
    return { ast: null, errors };
  }
}

function defaultOutputPort(nodeTypeName) {
  if (nodeTypeName === 'clock') return 't';
  if (nodeTypeName === 'pointerPosition') return 'pos';
  const def = NODE_TYPES[nodeTypeName];
  if (!def || !def.outputs || def.outputs.length === 0) return 'out';
  if (def.outputs.length === 1) return def.outputs[0].name;
  return def.outputs.find(o => o.name === 'out') ? 'out' : def.outputs[0].name;
}

export function compileToGraph(ast) { /* bridge via existing shape */
  const errors = []; if (!ast) return { graph: { nodes: [], edges: [] }, errors };
  try {
    const textAst = astToLegacy(ast);
    const graph = buildGraph(textAst.statements);
    if (textAst.imports.length > 0) {
      graph.imports = textAst.imports;
    }
    return { graph, errors };
  } catch (e) {
    const span = (typeof e.line === 'number' && typeof e.column === 'number')
      ? { start: { line: e.line, column: e.column, offset: 0 }, end: { line: e.line, column: e.column, offset: 0 } }
      : null;
    errors.push({ type: 'CompileError', message: e.message, code: e.code || 'UNKNOWN_NODE_TYPE', span });
    return { graph: { nodes: [], edges: [] }, errors };
  }
}

function astToLegacy(program) {
  function convExpr(e) {
    if (e.type === 'CallExpression') return { type: 'call', name: e.callee.name, args: e.args.map(a => a.type === 'NamedArg' ? { named: true, name: a.name.name, value: convExpr(a.value) } : { named: false, value: convExpr(a.value) }), line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'FunctionLiteral') return { type: 'fn', params: e.params.map((p) => p.name), body: convExpr(e.body), line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'PipeExpression') return { type: 'pipe', left: convExpr(e.left), call: convExpr(e.right) };
    if (e.type === 'Identifier') return { type: 'ident', name: e.name, line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'NumberLiteral') return { type: 'number', value: e.value, line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'StringLiteral') return { type: 'string', value: e.value, line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'BooleanLiteral') return { type: 'bool', value: e.value, line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'NullLiteral') return { type: 'null', value: null, line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'ArrayLiteral') return { type: 'array', value: convJsonLiteral(e, e.span.start.line, e.span.start.column), line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'ObjectLiteral') return { type: 'object', value: convJsonLiteral(e, e.span.start.line, e.span.start.column), line: e.span.start.line, col: e.span.start.column };
    throw new LoomDSLError('Unsupported expression in compileToGraph', e.span.start.line, e.span.start.column, 'UNEXPECTED_TOKEN');
  }
  function convJsonLiteral(node, line, col) {
    if (node.type === 'NumberLiteral' || node.type === 'StringLiteral' || node.type === 'BooleanLiteral') return node.value;
    if (node.type === 'NullLiteral') return null;
    if (node.type === 'ArrayLiteral') return node.elements.map((e) => {
      if (['Identifier', 'CallExpression', 'PipeExpression'].includes(e.type)) throw new LoomDSLError('Nested non-literal in array is not supported', e.span.start.line, e.span.start.column, 'UNEXPECTED_TOKEN');
      return convJsonLiteral(e, line, col);
    });
    if (node.type === 'ObjectLiteral') {
      const out = {};
      for (const en of node.entries) {
        if (['Identifier', 'CallExpression', 'PipeExpression'].includes(en.value.type)) throw new LoomDSLError('Nested non-literal in object is not supported', en.value.span.start.line, en.value.span.start.column, 'UNEXPECTED_TOKEN');
        out[en.key.type === 'Identifier' ? en.key.name : en.key.value] = convJsonLiteral(en.value, line, col);
      }
      return out;
    }
    throw new LoomDSLError('Unsupported JSON literal', line, col, 'UNEXPECTED_TOKEN');
  }
  return {
    imports: (program.imports || []).map((entry) => entry.name),
    statements: program.body
      .filter(s => s.type !== 'CommentStatement')
      .map((s) => {
        if (s.type === 'RenderStatement') return { type: 'render', call: convExpr(s.call) };
        if (s.type === 'ExpressionStatement') return { type: 'effect', expr: convExpr(s.expression) };
        return { type: 'assign', name: s.target.name, expr: convExpr(s.value) };
      })
  };
}

function buildGraph(stmts) { /* mostly original */
  const nodes = []; const edges = []; let renderConfig = null; let anonCounter = 0; let effectCounter = 0; const scope = {};
  const anonId = () => `_anon_${++anonCounter}`;
  const resolveIdent = (name, line, col) => { if (!(name in scope)) throw new LoomDSLError(`Undefined identifier: ${name}`, line, col, 'UNDEFINED_IDENTIFIER'); const node = nodes.find(n => n.id === scope[name]); return `${scope[name]}.${defaultOutputPort(node.type)}`; };
  const scopedRefs = () => {
    const refs = {};
    for (const [name, nodeId] of Object.entries(scope)) {
      const node = nodes.find(n => n.id === nodeId);
      refs[name] = `${nodeId}.${defaultOutputPort(node.type)}`;
    }
    return refs;
  };
  function buildFunctionLiteral(fn, resultId) {
    const id = resultId || anonId();
    nodes.push({ id, type: 'function.literal', params: { params: fn.params, body: fn.body, closureRefs: scopedRefs() } });
    return id;
  }
  function buildLiteral(expr, resultId) {
    const id = resultId || anonId();
    nodes.push({ id, type: 'constant', params: { value: expr.value } });
    return id;
  }
  function buildUserCall(call, resultId) {
    const id = resultId || anonId();
    nodes.push({ id, type: 'function.call' });
    edges.push({ from: resolveIdent(call.name, call.line, call.col), to: `${id}.fn` });
    call.args.forEach((arg, index) => {
      if (arg.named) throw new LoomDSLError(`User-defined function '${call.name}' only accepts positional arguments`, call.line, call.col, 'MISSING_ARGUMENT_NAME');
      wireToNode(arg.value, id, `arg${index + 1}`);
    });
    return id;
  }
  function wireToNode(expr, id, port) {
    if (expr.type === 'ident') edges.push({ from: resolveIdent(expr.name, expr.line, expr.col), to: `${id}.${port}` });
    else if (expr.type === 'call' || expr.type === 'pipe' || expr.type === 'fn') { const inId = buildExpr(expr, null, null); const inNode = nodes.find(n => n.id === inId); edges.push({ from: `${inId}.${defaultOutputPort(inNode.type)}`, to: `${id}.${port}` }); }
    else { const nodeObj = nodes.find(n => n.id === id); nodeObj.params ||= {}; nodeObj.params[port] = expr.value; }
  }
  function buildNode(call, resultId, pipeFrom) { const fnName = call.name; if (!NODE_TYPES[fnName]) { if (scope[fnName]) return buildUserCall(call, resultId); throw new LoomDSLError(`Unknown node type: ${fnName}`, call.line, call.col, 'UNKNOWN_NODE_TYPE'); } const typeDef = NODE_TYPES[fnName]; const id = resultId || anonId(); const nodeObj = { id, type: fnName }; nodes.push(nodeObj); const inputNames = typeDef.inputs.map(i => i.name); const paramNames = (typeDef.params || []).map(p => p.name); const pos = call.args.filter(a => !a.named); const named = call.args.filter(a => a.named); if (typeDef.commutative && pos.length && named.length) throw new LoomDSLError(`Node '${fnName}' is commutative: arguments must be all positional or all named`, call.line, call.col, 'MISSING_ARGUMENT_NAME'); if (!typeDef.commutative && pos.length > (pipeFrom ? 0 : 1)) throw new LoomDSLError(`Argument at position 2 for '${fnName}' requires a name`, call.line, call.col, 'MISSING_ARGUMENT_NAME'); let idx = 0;
    const wire = (expr, port) => wireToNode(expr, id, port);
    if (pipeFrom) edges.push({ from: pipeFrom, to: `${id}.${inputNames[idx++]}` });
    for (const a of pos) wire(a.value, inputNames[idx++]);
    for (const a of named) { if (inputNames.includes(a.name)) wire(a.value, a.name); else if (paramNames.includes(a.name)) { if (a.value.type === 'ident' || a.value.type === 'call' || a.value.type === 'fn') throw new LoomDSLError(`Parameter '${a.name}' for '${fnName}' must be a literal`, call.line, call.col, 'UNEXPECTED_TOKEN'); nodeObj.params ||= {}; nodeObj.params[a.name] = a.value.value; } else throw new LoomDSLError(`Unknown argument '${a.name}' for '${fnName}'`, call.line, call.col, 'UNKNOWN_ARGUMENT'); }
    return id; };
  const buildExpr = (expr, resultId, pipeFrom) => expr.type === 'call' ? buildNode(expr, resultId, pipeFrom) : expr.type === 'fn' ? buildFunctionLiteral(expr, resultId) : ['number', 'string', 'bool', 'null', 'array', 'object'].includes(expr.type) ? buildLiteral(expr, resultId) : expr.type === 'pipe' ? (() => { const lId = buildExpr(expr.left, null, null); const ln = nodes.find(n => n.id === lId); return buildNode(expr.call, resultId, `${lId}.${defaultOutputPort(ln.type)}`); })() : expr.type === 'ident' ? scope[expr.name] || (()=>{throw new LoomDSLError(`Undefined identifier: ${expr.name}`, expr.line, expr.col, 'UNDEFINED_IDENTIFIER');})() : (()=>{throw new LoomDSLError('Cannot use literal as expression', expr.line, expr.col, 'UNEXPECTED_TOKEN');})();
  const buildRender = (call) => { const named = {}; for (const a of call.args) { if (!a.named) throw new LoomDSLError('render arguments must be named', call.line, call.col, 'MISSING_ARGUMENT_NAME'); named[a.name] = a.value; } const rv = (e) => e.type === 'ident' ? resolveIdent(e.name, e.line, e.col) : e.value; if (call.name === 'point') return { type: 'point', x: named.x ? rv(named.x) : undefined, y: named.y ? rv(named.y) : undefined, color: named.color ? named.color.value : '#00ff00', trail: named.trail ? named.trail.value : 0.1 }; if (call.name === 'bar') return { type: 'bar', width: named.width ? rv(named.width) : undefined, color: named.color ? named.color.value : '#00ccff', height: named.height ? named.height.value : 40, y: named.y ? rv(named.y) : undefined }; throw new LoomDSLError(`Unknown render function: ${call.name}`, call.line, call.col, 'UNKNOWN_NODE_TYPE'); };
  for (const s of stmts) {
    if (s.type === 'render') renderConfig = buildRender(s.call);
    else if (s.type === 'effect') buildExpr(s.expr, `_effect${++effectCounter}`, null);
    else { const id = buildExpr(s.expr, s.name, null); scope[s.name] = id; }
  }
  const r = { nodes, edges }; if (renderConfig) r.render = renderConfig; return r;
}

export function formatDSL(ast, options = {}) {
  const indentSize = options.indent ?? 2;
  const indent = (n) => ' '.repeat(n * indentSize);
  const maxInlineParams = options.maxInlineParams ?? 2;
  const maxWidth = options.maxLineWidth ?? 80;

  function fmtExpr(e, level = 0) {
    if (e.type === 'PipeExpression') {
      const chain = [];
      let cur = e;
      while (cur && cur.type === 'PipeExpression') {
        chain.push(cur.right);
        cur = cur.left;
      }
      chain.reverse();
      const head = fmtExpr(cur, level);
      const multiline = chain.length >= 2 || chain.some((c) => shouldMultilineCall(c, level));
      if (!multiline) return `${head} |> ${chain.map((c) => fmtExpr(c, level)).join(' |> ')}`;
      const lines = [head];
      for (const c of chain) lines.push(`${indent(level + 1)}|> ${fmtExpr(c, level + 1)}`);
      return lines.join('\n');
    }
    if (e.type === 'CallExpression') return fmtCall(e, level);
    if (e.type === 'Identifier') return e.name;
    if (e.type === 'NumberLiteral' || e.type === 'StringLiteral') return e.raw;
    if (e.type === 'BooleanLiteral') return e.value ? 'true' : 'false';
    if (e.type === 'NullLiteral') return 'null';
    if (e.type === 'FunctionLiteral') return `fn(${e.params.map((p) => p.name).join(', ')}) => ${fmtExpr(e.body, level)}`;
    if (e.type === 'ArrayLiteral') return `[${e.elements.map(fmtExpr).join(', ')}]`;
    if (e.type === 'ObjectLiteral') return `{ ${e.entries.map(en => `${en.key.type === 'Identifier' ? en.key.name : en.key.raw}: ${fmtExpr(en.value)}`).join(', ')} }`;
    return '';
  }

  function shouldMultilineCall(call, level) {
    if (call.args.length > maxInlineParams) return true;
    const inline = fmtCallInline(call, level);
    return inline.length > Math.max(20, maxWidth - indent(level).length);
  }

  function fmtCallInline(call, level) {
    const args = call.args.map((a) => a.type === 'NamedArg' ? `${a.name.name}: ${fmtExpr(a.value, level)}` : fmtExpr(a.value, level));
    return `${call.callee.name}(${args.join(', ')})`;
  }

  function fmtCall(call, level) {
    if (!shouldMultilineCall(call, level)) return fmtCallInline(call, level);
    const args = call.args.map((a) => a.type === 'NamedArg' ? `${a.name.name}: ${fmtExpr(a.value, level + 1)}` : fmtExpr(a.value, level + 1));
    const body = args.map((a) => `${indent(level + 1)}${a}`).join(',\n');
    return `${call.callee.name}(\n${body}\n${indent(level)})`;
  }

  const importLines = [];
  for (const entry of ast.imports || []) {
    if (entry.leadingComments) for (const c of entry.leadingComments) importLines.push(`#${c.text}`);
    let line = `import ${entry.name}`;
    if (entry.trailingComment) line += `  #${entry.trailingComment.text}`;
    importLines.push(line);
  }
  const lines = [];
  for (const s of ast.body) {
    if (s.type === 'CommentStatement') { lines.push(`#${s.comment.text}`); continue; }
    if (s.leadingComments) for (const c of s.leadingComments) lines.push(`#${c.text}`);
    const expr = s.type === 'AssignmentStatement'
      ? `${s.target.name} = ${fmtExpr(s.value, 0)}`
      : s.type === 'ExpressionStatement'
        ? `${fmtExpr(s.expression, 0)}`
        : `render ${fmtExpr(s.call, 0)}`;
    let line = expr;
    if (s.trailingComment) line += `  #${s.trailingComment.text}`;
    lines.push(line);
  }
  const sections = [];
  if (importLines.length > 0) sections.push(importLines.join('\n'));
  if (lines.length > 0) sections.push(lines.join('\n'));
  return `${sections.join('\n\n')}\n`;
}

export function parseDSL(text) {
  const { ast, errors: p } = parseDSLToAST(text);
  if (p.length) throw new LoomDSLError(p[0].message, p[0].span.start.line, p[0].span.start.column, p[0].code);
  const { graph, errors: c } = compileToGraph(ast);
  if (c.length) throw new LoomDSLError(c[0].message, c[0].span?.start?.line || 1, c[0].span?.start?.column || 1, c[0].code);
  return graph;
}
