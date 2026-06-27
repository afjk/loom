import { NODE_TYPES, canUseTwoPositionalArgs } from './loom.js';

function resolveNodeTypesOption(options = {}) {
  if (options.nodeRegistry && typeof options.nodeRegistry.toObject === 'function') {
    return options.nodeRegistry.toObject();
  }

  if (options.nodeTypes && typeof options.nodeTypes === 'object') {
    return options.nodeTypes;
  }

  return NODE_TYPES;
}

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
  PLUS: 'PLUS', MINUS: 'MINUS', STAR: 'STAR', SLASH: 'SLASH', PERCENT: 'PERCENT',
};

const posFrom = (line, column, offset) => ({ line, column, offset });
const spanFrom = (s, e) => ({ start: s, end: e });
const mkIdent = (tok) => ({ type: 'Identifier', name: tok.value, span: tok.span });
const SEMANTIC_COMPONENT_ALIASES = {
  r: 'right',
  u: 'up',
  f: 'front'
};
const SEMANTIC_COMPONENTS = new Set(['right', 'up', 'front', ...Object.keys(SEMANTIC_COMPONENT_ALIASES)]);
const SEMANTIC_SWIZZLES = new Set(['ru', 'rf', 'uf', 'ruf']);
const normalizeSemanticComponent = (component) => SEMANTIC_COMPONENT_ALIASES[component] || component;
const isSemanticSwizzleCandidate = (property) => /^[ruf]+$/.test(property) && property.length > 1;
const normalizeSemanticSwizzle = (property) => [...property].map(normalizeSemanticComponent);

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
    if (/\d/.test(ch)) {
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
    const map = { '=': TT.ASSIGN, ':': TT.COLON, ',': TT.COMMA, '.': TT.DOT, '(': TT.LPAREN, ')': TT.RPAREN, '[': TT.LBRACKET, ']': TT.RBRACKET, '{': TT.LBRACE, '}': TT.RBRACE, '+': TT.PLUS, '-': TT.MINUS, '*': TT.STAR, '/': TT.SLASH, '%': TT.PERCENT };
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
    function parseParamList() {
      expect(TT.LPAREN);
      const params = [];
      while (peek().type !== TT.RPAREN && peek().type !== TT.EOF) {
        const param = expect(TT.IDENT);
        params.push({ type: 'Identifier', name: param.value, span: param.span });
        if (peek().type === TT.COMMA) take();
        else break;
      }
      expect(TT.RPAREN);
      return params;
    }
    function parseFunctionLiteral() {
      const t = peek();
      if (t.type === TT.IDENT && t.value === 'fn' && peek(1).type === TT.LPAREN) {
        take();
        const params = parseParamList();
        expect(TT.ARROW);
        const body = parseExpr();
        return { type: 'FunctionLiteral', params, body, span: spanFrom(t.span.start, body.span.end) };
      }
      return parsePipe();
    }
    function parseFunctionDefinition() {
      const start = expect(TT.IDENT);
      const name = expect(TT.IDENT);
      const params = parseParamList();
      skipNL();
      let body;
      let end;
      if (peek().type === TT.ARROW) {
        take();
        skipNL();
        body = parseExpr();
        end = body.span.end;
      } else if (peek().type === TT.LBRACE) {
        take();
        skipNL();
        body = parseExpr();
        skipNL();
        end = expect(TT.RBRACE).span.end;
      } else {
        const t = peek();
        throw new LoomDSLError("Expected '=>' or function body block", t.span.start.line, t.span.start.column, 'UNEXPECTED_TOKEN');
      }
      return { type: 'FunctionDefinition', name: mkIdent(name), params, body, span: spanFrom(start.span.start, end) };
    }
    function parsePipe() { let left = parseAdditive(); while (true) { if (peek().type === TT.PIPE || (peek().type === TT.NEWLINE && peek(1).type === TT.PIPE)) { if (peek().type === TT.NEWLINE) take(); const pt = take(); const right = parseCall(); left = { type: 'PipeExpression', left, right, span: spanFrom(left.span.start, right.span.end) }; } else break; } return left; }
    function parseAdditive() {
      let left = parseMultiplicative();
      while (peek().type === TT.PLUS || peek().type === TT.MINUS) {
        const op = take();
        const right = parseMultiplicative();
        left = { type: 'BinaryExpression', operator: op.type === TT.PLUS ? '+' : '-', left, right, span: spanFrom(left.span.start, right.span.end) };
      }
      return left;
    }
    function parseMultiplicative() {
      let left = parseUnary();
      while (peek().type === TT.STAR || peek().type === TT.SLASH || peek().type === TT.PERCENT) {
        const op = take();
        const opChar = op.type === TT.STAR ? '*' : op.type === TT.SLASH ? '/' : '%';
        const right = parseUnary();
        left = { type: 'BinaryExpression', operator: opChar, left, right, span: spanFrom(left.span.start, right.span.end) };
      }
      return left;
    }
    function parseUnary() {
      if (peek().type === TT.MINUS) {
        const op = take();
        const operand = parseUnary();
        if (operand.type === 'NumberLiteral') {
          return { type: 'NumberLiteral', value: -operand.value, raw: `-${operand.raw}`, span: spanFrom(op.span.start, operand.span.end) };
        }
        return { type: 'UnaryExpression', operator: '-', operand, span: spanFrom(op.span.start, operand.span.end) };
      }
      return parseAtom();
    }
    function isCallStart() {
      if (peek().type !== TT.IDENT) return false;
      let lookahead = 1;
      while (peek(lookahead).type === TT.DOT && peek(lookahead + 1).type === TT.IDENT) lookahead += 2;
      return peek(lookahead).type === TT.LPAREN;
    }
    function parseMemberPostfix(object) {
      let expr = object;
      while (peek().type === TT.DOT) {
        take();
        const property = expect(TT.IDENT);
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: mkIdent(property),
          span: spanFrom(expr.span.start, property.span.end)
        };
      }
      return expr;
    }
    function parseAtom() {
      const t = peek();
      if (t.type === TT.NUMBER) { take(); return { type: 'NumberLiteral', value: t.value.value, raw: t.value.raw, span: t.span }; }
      if (t.type === TT.STRING) { take(); return { type: 'StringLiteral', value: t.value.value, raw: t.value.raw, span: t.span }; }
      if (t.type === TT.BOOL) { take(); return { type: 'BooleanLiteral', value: t.value, span: t.span }; }
      if (t.type === TT.NULL) { take(); return { type: 'NullLiteral', span: t.span }; }
      if (t.type === TT.LBRACKET) return parseMemberPostfix(parseArray());
      if (t.type === TT.LBRACE) return parseMemberPostfix(parseObject());
      if (t.type === TT.LPAREN) {
        take();
        const expr = parseExpr();
        expect(TT.RPAREN);
        return expr;
      }
      if (t.type === TT.IDENT) {
        if (isCallStart()) return parseMemberPostfix(parseCall());
        take();
        return parseMemberPostfix(mkIdent(t));
      }
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
      if (stTok.type === TT.IDENT && stTok.value === 'fn' && peek(1).type === TT.IDENT) stmt = parseFunctionDefinition();
      else if (stTok.type === TT.IDENT && stTok.value === 'render') { take(); const call = parseCall(); stmt = { type: 'RenderStatement', call, span: spanFrom(stTok.span.start, call.span.end) }; }
      else if (stTok.type === TT.IDENT && peek(1).type === TT.ASSIGN) { const target = mkIdent(take()); take(); const value = parseExpr(); stmt = { type: 'AssignmentStatement', target, value, span: spanFrom(target.span.start, value.span.end) }; }
      else if (stTok.type === TT.IDENT && (peek(1).type === TT.LPAREN || peek(1).type === TT.DOT)) { const expression = parseExpr(); stmt = { type: 'ExpressionStatement', expression, span: expression.span }; }
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

function defaultOutputPort(nodeTypeName, nodeTypes = NODE_TYPES) {
  if (nodeTypeName === 'clock') return 't';
  if (nodeTypeName === 'pointerPosition') return 'pos';
  const def = nodeTypes[nodeTypeName];
  if (!def || !def.outputs || def.outputs.length === 0) return 'out';
  if (def.outputs.length === 1) return def.outputs[0].name;
  return def.outputs.find(o => o.name === 'out') ? 'out' : def.outputs[0].name;
}

// A trivial projection returns one of its parameters unchanged (body is a bare
// parameter identifier). It has no shareable body, so subgraph lowering inlines
// it like inline mode does.
function isTrivialProjection(fn) {
  return Boolean(fn && fn.body && fn.body.type === 'ident' && fn.params.some((p) => p.name === fn.body.name));
}

export function compileToGraph(ast, options = {}) { /* bridge via existing shape */
  const errors = []; if (!ast) return { graph: { nodes: [], edges: [] }, errors };
  try {
    const nodeTypes = resolveNodeTypesOption(options);
    const textAst = astToLegacy(ast);
    const graph = buildGraph(textAst.statements, { nodeTypes, functions: textAst.functions, functionLowering: options.functionLowering });
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
    if (e.type === 'BinaryExpression') {
      const opToNode = { '+': 'math.add', '-': 'math.subtract', '*': 'math.multiply', '/': 'math.divide', '%': 'math.mod' };
      return { type: 'call', name: opToNode[e.operator], args: [{ named: false, value: convExpr(e.left) }, { named: false, value: convExpr(e.right) }], line: e.span.start.line, col: e.span.start.column };
    }
    if (e.type === 'UnaryExpression' && e.operator === '-') return { type: 'call', name: 'negate', args: [{ named: false, value: convExpr(e.operand) }], line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'CallExpression') return { type: 'call', name: e.callee.name, args: e.args.map(a => a.type === 'NamedArg' ? { named: true, name: a.name.name, value: convExpr(a.value) } : { named: false, value: convExpr(a.value) }), line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'FunctionLiteral') return { type: 'fn', params: e.params.map((p) => p.name), body: convExpr(e.body), line: e.span.start.line, col: e.span.start.column };
    if (e.type === 'PipeExpression') return { type: 'pipe', left: convExpr(e.left), call: convExpr(e.right) };
    if (e.type === 'MemberExpression') return { type: 'member', object: convExpr(e.object), property: e.property.name, line: e.span.start.line, col: e.span.start.column };
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
      if (['Identifier', 'CallExpression', 'PipeExpression', 'BinaryExpression', 'UnaryExpression'].includes(e.type)) throw new LoomDSLError('Nested non-literal in array is not supported', e.span.start.line, e.span.start.column, 'UNEXPECTED_TOKEN');
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
    functions: program.body
      .filter(s => s.type === 'FunctionDefinition')
      .map((s) => ({
        type: 'functionDef',
        name: s.name.name,
        params: s.params.map((p) => ({ name: p.name, line: p.span.start.line, col: p.span.start.column })),
        body: convExpr(s.body),
        line: s.span.start.line,
        col: s.span.start.column
      })),
    statements: program.body
      .filter(s => s.type !== 'CommentStatement')
      .filter(s => s.type !== 'FunctionDefinition')
      .map((s) => {
        if (s.type === 'RenderStatement') return { type: 'render', call: convExpr(s.call) };
        if (s.type === 'ExpressionStatement') return { type: 'effect', expr: convExpr(s.expression) };
        return { type: 'assign', name: s.target.name, expr: convExpr(s.value) };
      })
  };
}

function buildGraph(stmts, options = {}) { /* mostly original */
  const nodeTypes = options.nodeTypes ?? NODE_TYPES;
  const functionLowering = options.functionLowering ?? 'inline';
  const subgraphs = options.subgraphs ?? new Map();
  const isTopLevel = !options.subgraphs;
  const functionDefs = new Map();
  const nodes = []; const edges = []; let renderConfig = null; let anonCounter = 0; let effectCounter = 0; const scope = {};
  const anonId = () => `_anon_${++anonCounter}`;
  for (const fn of options.functions || []) {
    if (functionDefs.has(fn.name)) throw new LoomDSLError(`Duplicate function definition: ${fn.name}`, fn.line, fn.col, 'DUPLICATE_FUNCTION');
    if (nodeTypes[fn.name]) throw new LoomDSLError(`Function '${fn.name}' conflicts with a node type`, fn.line, fn.col, 'DUPLICATE_FUNCTION');
    const seenParams = new Set();
    for (const param of fn.params) {
      if (seenParams.has(param.name)) throw new LoomDSLError(`Duplicate parameter '${param.name}' in function '${fn.name}'`, param.line, param.col, 'DUPLICATE_FUNCTION_PARAM');
      seenParams.add(param.name);
    }
    functionDefs.set(fn.name, fn);
  }
  const hasFunctionDefinitions = functionDefs.size > 0;
  // Subgraph mode: seed each function parameter as a `subgraph.param` source node
  // so the reused builder resolves param identifiers to those nodes via `scope`.
  for (const param of options.params || []) {
    const pid = `_param_${param.name}`;
    nodes.push({ id: pid, type: 'subgraph.param', params: { name: param.name } });
    scope[param.name] = pid;
  }
  const resolveIdent = (name, line, col, locals = null) => {
    if (locals?.has(name)) {
      const expr = locals.get(name);
      if (expr.type === 'binding' && expr.expr.type === 'ident') return resolveIdent(expr.expr.name, expr.expr.line, expr.expr.col, expr.locals);
      if (expr.type === 'ident') return resolveIdent(expr.name, expr.line, expr.col, locals);
      const id = expr.type === 'binding' ? buildExpr(expr.expr, null, null, expr.locals) : buildExpr(expr, null, null, locals);
      const node = nodes.find(n => n.id === id);
      return `${id}.${defaultOutputPort(node.type, nodeTypes)}`;
    }
    if (!(name in scope)) throw new LoomDSLError(`Undefined identifier: ${name}`, line, col, 'UNDEFINED_IDENTIFIER');
    const node = nodes.find(n => n.id === scope[name]);
    return `${scope[name]}.${defaultOutputPort(node.type, nodeTypes)}`;
  };
  const scopedRefs = () => {
    const refs = {};
    for (const [name, nodeId] of Object.entries(scope)) {
      const node = nodes.find(n => n.id === nodeId);
      refs[name] = `${nodeId}.${defaultOutputPort(node.type, nodeTypes)}`;
    }
    return refs;
  };
  function validateFunctionExpr(expr, fn, seenCalls = new Set()) {
    if (expr.type === 'fn') {
      throw new LoomDSLError(`Function '${fn.name}' body cannot contain function literals`, expr.line, expr.col, 'UNSUPPORTED_FUNCTION_BODY');
    }
    if (expr.type === 'ident') {
      if (!fn.params.some((param) => param.name === expr.name)) {
        throw new LoomDSLError(`Function '${fn.name}' cannot close over '${expr.name}'`, expr.line, expr.col, 'UNSUPPORTED_FUNCTION_BODY');
      }
      return;
    }
    if (expr.type === 'call') {
      if (functionDefs.has(expr.name)) {
        if (expr.name === fn.name) throw new LoomDSLError(`Recursive function '${fn.name}' is not supported`, expr.line, expr.col, 'RECURSIVE_FUNCTION');
        if (seenCalls.has(expr.name)) throw new LoomDSLError(`Recursive function call involving '${expr.name}' is not supported`, expr.line, expr.col, 'RECURSIVE_FUNCTION');
        const nextSeen = new Set(seenCalls);
        nextSeen.add(fn.name);
        validateFunctionExpr(functionDefs.get(expr.name).body, functionDefs.get(expr.name), nextSeen);
      } else {
        const typeDef = nodeTypes[expr.name];
        const statefulNodeNames = new Set(['risingEdge', 'fallingEdge']);
        if (typeDef?.category === 'state' || statefulNodeNames.has(expr.name)) {
          throw new LoomDSLError(`Function '${fn.name}' body cannot contain stateful node '${expr.name}'`, expr.line, expr.col, 'UNSUPPORTED_FUNCTION_BODY');
        }
      }
      for (const arg of expr.args) validateFunctionExpr(arg.value, fn, seenCalls);
      return;
    }
    if (expr.type === 'pipe') {
      validateFunctionExpr(expr.left, fn, seenCalls);
      validateFunctionExpr(expr.call, fn, seenCalls);
      return;
    }
  }
  if (isTopLevel) for (const fn of functionDefs.values()) validateFunctionExpr(fn.body, fn, new Set([fn.name]));
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
  function buildMember(expr, resultId) {
    if (SEMANTIC_COMPONENTS.has(expr.property)) {
      const id = resultId || anonId();
      nodes.push({ id, type: 'getComponent', params: { component: normalizeSemanticComponent(expr.property) } });
      wireToNode(expr.object, id, 'value');
      return id;
    }
    if (SEMANTIC_SWIZZLES.has(expr.property)) {
      const id = resultId || anonId();
      nodes.push({ id, type: 'swizzle', params: { components: normalizeSemanticSwizzle(expr.property) } });
      wireToNode(expr.object, id, 'value');
      return id;
    }
    if (isSemanticSwizzleCandidate(expr.property)) {
      throw new LoomDSLError(`Unsupported semantic swizzle: ${expr.property}`, expr.line, expr.col, 'UNKNOWN_ARGUMENT');
    }
    throw new LoomDSLError(`Unsupported semantic component access: ${expr.property}`, expr.line, expr.col, 'UNKNOWN_ARGUMENT');
  }
  function ensureSubgraph(name) {
    if (subgraphs.has(name)) return;
    const fn = functionDefs.get(name);
    subgraphs.set(name, null); // reserve before recursing (non-recursive by validation)
    const sub = buildGraph(
      [{ type: 'assign', name: '__out', expr: fn.body }],
      { nodeTypes, functions: options.functions, functionLowering: 'subgraph', params: fn.params, subgraphs, captureOutput: '__out' }
    );
    subgraphs.set(name, { params: fn.params.map((p) => p.name), nodes: sub.nodes, edges: sub.edges, output: sub.output });
  }
  function buildSubgraphCall(call, resultId, pipeFrom, locals) {
    const fn = functionDefs.get(call.name);
    const pos = call.args.filter(a => !a.named);
    if (call.args.length !== pos.length) throw new LoomDSLError(`Function '${call.name}' only accepts positional arguments`, call.line, call.col, 'MISSING_ARGUMENT_NAME');
    const suppliedArity = pos.length + (pipeFrom ? 1 : 0);
    if (suppliedArity !== fn.params.length) {
      throw new LoomDSLError(`Function '${call.name}' expected ${fn.params.length} argument(s), got ${suppliedArity}`, call.line, call.col, 'WRONG_ARITY');
    }
    ensureSubgraph(call.name);
    const id = resultId || anonId();
    nodes.push({ id, type: 'subgraph.call', params: { subgraph: call.name } });
    let k = 0;
    if (pipeFrom) edges.push({ from: pipeFrom, to: `${id}.arg${++k}` });
    for (const a of pos) wireToNode(a.value, id, `arg${++k}`, locals);
    return id;
  }
  function buildFunctionDefinitionCall(call, resultId, pipeFrom, locals) {
    const fn = functionDefs.get(call.name);
    // Trivial projections (body is just a parameter, e.g. `fn id(x) => x` or
    // `fn first(a, b) => a`) have no shareable body, so inline them even in
    // subgraph mode. This matches inline semantics exactly and avoids the
    // passthrough-read-by-name divergence (a projection bound to a name and read
    // by that name now materializes the same node inline mode would).
    if (functionLowering === 'subgraph' && !isTrivialProjection(fn)) {
      return buildSubgraphCall(call, resultId, pipeFrom, locals);
    }
    const pos = call.args.filter(a => !a.named);
    if (call.args.length !== pos.length) throw new LoomDSLError(`Function '${call.name}' only accepts positional arguments`, call.line, call.col, 'MISSING_ARGUMENT_NAME');
    const suppliedArity = pos.length + (pipeFrom ? 1 : 0);
    if (suppliedArity !== fn.params.length) {
      throw new LoomDSLError(`Function '${call.name}' expected ${fn.params.length} argument(s), got ${suppliedArity}`, call.line, call.col, 'WRONG_ARITY');
    }
    const nextLocals = new Map(locals || []);
    let argIndex = 0;
    if (pipeFrom) {
      nextLocals.set(fn.params[argIndex++].name, { type: 'ref', ref: pipeFrom, line: call.line, col: call.col });
    }
    for (const arg of pos) nextLocals.set(fn.params[argIndex++].name, { type: 'binding', expr: arg.value, locals, line: arg.value.line, col: arg.value.col });
    return buildExpr(fn.body, resultId, null, nextLocals);
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
  function wireToNode(expr, id, port, locals = null) {
    if (expr.type === 'binding') wireToNode(expr.expr, id, port, expr.locals);
    else if (expr.type === 'ref') edges.push({ from: expr.ref, to: `${id}.${port}` });
    else if (expr.type === 'ident' && locals?.has(expr.name)) wireToNode(locals.get(expr.name), id, port, locals);
    else if (expr.type === 'ident') edges.push({ from: resolveIdent(expr.name, expr.line, expr.col, locals), to: `${id}.${port}` });
    else if (expr.type === 'call' || expr.type === 'pipe' || expr.type === 'fn' || expr.type === 'member') { const inId = buildExpr(expr, null, null, locals); const inNode = nodes.find(n => n.id === inId); edges.push({ from: `${inId}.${defaultOutputPort(inNode.type, nodeTypes)}`, to: `${id}.${port}` }); }
    else { const nodeObj = nodes.find(n => n.id === id); nodeObj.params ||= {}; nodeObj.params[port] = expr.value; }
  }
  function buildNode(call, resultId, pipeFrom, locals = null) { const fnName = call.name; if (functionDefs.has(fnName)) return buildFunctionDefinitionCall(call, resultId, pipeFrom, locals); if (!nodeTypes[fnName]) { if (scope[fnName]) return buildUserCall(call, resultId); if (hasFunctionDefinitions && !fnName.includes('.')) throw new LoomDSLError(`Unknown function: ${fnName}`, call.line, call.col, 'UNKNOWN_FUNCTION'); throw new LoomDSLError(`Unknown node type: ${fnName}`, call.line, call.col, 'UNKNOWN_NODE_TYPE'); } const typeDef = nodeTypes[fnName]; const id = resultId || anonId(); const nodeObj = { id, type: fnName }; nodes.push(nodeObj); const inputNames = typeDef.inputs.map(i => i.name); const paramNames = (typeDef.params || []).map(p => p.name); const pos = call.args.filter(a => !a.named); const named = call.args.filter(a => a.named); const hasUnknownNamed = named.some(a => !inputNames.includes(a.name) && !paramNames.includes(a.name)); if (typeDef.commutative && pos.length && named.length && !hasUnknownNamed) throw new LoomDSLError(`Node '${fnName}' is commutative: arguments must be all positional or all named`, call.line, call.col, 'MISSING_ARGUMENT_NAME'); if (!canUseTwoPositionalArgs(fnName, typeDef) && pos.length > (pipeFrom ? 0 : 1)) throw new LoomDSLError(`Argument at position 2 for '${fnName}' requires a name`, call.line, call.col, 'MISSING_ARGUMENT_NAME'); let idx = 0;
    const wire = (expr, port) => wireToNode(expr, id, port, locals);
    if (pipeFrom) edges.push({ from: pipeFrom, to: `${id}.${inputNames[idx++]}` });
    for (const a of pos) wire(a.value, inputNames[idx++]);
    for (const a of named) { if (inputNames.includes(a.name)) wire(a.value, a.name); else if (paramNames.includes(a.name)) { if (a.value.type === 'ident' || a.value.type === 'call' || a.value.type === 'fn' || a.value.type === 'member') throw new LoomDSLError(`Parameter '${a.name}' for '${fnName}' must be a literal`, call.line, call.col, 'UNEXPECTED_TOKEN'); nodeObj.params ||= {}; nodeObj.params[a.name] = a.value.value; } else throw new LoomDSLError(`Unknown argument '${a.name}' for '${fnName}'`, call.line, call.col, 'UNKNOWN_ARGUMENT'); }
    return id; };
  const buildExpr = (expr, resultId, pipeFrom, locals = null) => expr.type === 'binding' ? buildExpr(expr.expr, resultId, null, expr.locals) : expr.type === 'call' ? buildNode(expr, resultId, pipeFrom, locals) : expr.type === 'fn' ? buildFunctionLiteral(expr, resultId) : ['number', 'string', 'bool', 'null', 'array', 'object'].includes(expr.type) ? buildLiteral(expr, resultId) : expr.type === 'member' ? buildMember(expr, resultId) : expr.type === 'pipe' ? (() => { const lId = buildExpr(expr.left, null, null, locals); const ln = nodes.find(n => n.id === lId); return buildNode(expr.call, resultId, `${lId}.${defaultOutputPort(ln.type, nodeTypes)}`, locals); })() : expr.type === 'ref' ? expr.ref.split('.')[0] : expr.type === 'ident' ? (locals?.has(expr.name) ? buildExpr(locals.get(expr.name), resultId, null, locals) : scope[expr.name] || (()=>{throw new LoomDSLError(`Undefined identifier: ${expr.name}`, expr.line, expr.col, 'UNDEFINED_IDENTIFIER');})()) : (()=>{throw new LoomDSLError('Cannot use literal as expression', expr.line, expr.col, 'UNEXPECTED_TOKEN');})();
  const buildRender = (call) => { const named = {}; for (const a of call.args) { if (!a.named) throw new LoomDSLError('render arguments must be named', call.line, call.col, 'MISSING_ARGUMENT_NAME'); named[a.name] = a.value; } const rv = (e) => { if (e.type === 'ident') return resolveIdent(e.name, e.line, e.col); if (e.type === 'member' || e.type === 'call' || e.type === 'pipe') { const id = buildExpr(e, null, null); const node = nodes.find(n => n.id === id); return `${id}.${defaultOutputPort(node.type, nodeTypes)}`; } return e.value; }; if (call.name === 'point') return { type: 'point', x: named.x ? rv(named.x) : undefined, y: named.y ? rv(named.y) : undefined, color: named.color ? named.color.value : '#00ff00', trail: named.trail ? named.trail.value : 0.1 }; if (call.name === 'bar') return { type: 'bar', width: named.width ? rv(named.width) : undefined, color: named.color ? named.color.value : '#00ccff', height: named.height ? named.height.value : 40, y: named.y ? rv(named.y) : undefined }; throw new LoomDSLError(`Unknown render function: ${call.name}`, call.line, call.col, 'UNKNOWN_NODE_TYPE'); };
  for (const s of stmts) {
    if (s.type === 'render') renderConfig = buildRender(s.call);
    else if (s.type === 'effect') buildExpr(s.expr, `_effect${++effectCounter}`, null);
    else { const id = buildExpr(s.expr, s.name, null); scope[s.name] = id; }
  }
  const r = { nodes, edges }; if (renderConfig) r.render = renderConfig;
  if (options.captureOutput && scope[options.captureOutput] !== undefined) {
    const outNode = nodes.find((n) => n.id === scope[options.captureOutput]);
    r.output = `${scope[options.captureOutput]}.${defaultOutputPort(outNode.type, nodeTypes)}`;
  }
  if (isTopLevel && subgraphs.size > 0) r.subgraphs = Object.fromEntries(subgraphs);
  return r;
}

export function formatDSL(ast, options = {}) {
  const indentSize = options.indent ?? 2;
  const indent = (n) => ' '.repeat(n * indentSize);
  const maxInlineParams = options.maxInlineParams ?? 2;
  const maxWidth = options.maxLineWidth ?? 80;

  function opPrec(op) { return (op === '*' || op === '/' || op === '%') ? 2 : 1; }
  function fmtBinaryChild(child, parentOp, side, level) {
    const s = fmtExpr(child, level);
    if (child.type === 'PipeExpression') return `(${s})`;
    if (child.type !== 'BinaryExpression') return s;
    const cp = opPrec(child.operator), pp = opPrec(parentOp);
    if (cp < pp) return `(${s})`;
    if (cp === pp && side === 'right' && (parentOp === '-' || parentOp === '/' || parentOp === '%')) return `(${s})`;
    return s;
  }
  function fmtExpr(e, level = 0) {
    if (e.type === 'BinaryExpression') return `${fmtBinaryChild(e.left, e.operator, 'left', level)} ${e.operator} ${fmtBinaryChild(e.right, e.operator, 'right', level)}`;
    if (e.type === 'UnaryExpression' && e.operator === '-') {
      const s = fmtExpr(e.operand, level);
      return (e.operand.type === 'BinaryExpression' || e.operand.type === 'PipeExpression') ? `-(${s})` : `-${s}`;
    }
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
    if (e.type === 'MemberExpression') return `${fmtExpr(e.object, level)}.${e.property.name}`;
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
    const expr = s.type === 'FunctionDefinition'
      ? `fn ${s.name.name}(${s.params.map((p) => p.name).join(', ')}) => ${fmtExpr(s.body, 0)}`
      : s.type === 'AssignmentStatement'
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

export function parseDSL(text, options = {}) {
  const { ast, errors: p } = parseDSLToAST(text);
  if (p.length) throw new LoomDSLError(p[0].message, p[0].span.start.line, p[0].span.start.column, p[0].code);
  const { graph, errors: c } = compileToGraph(ast, options);
  if (c.length) throw new LoomDSLError(c[0].message, c[0].span?.start?.line || 1, c[0].span?.start?.column || 1, c[0].code);
  return graph;
}
