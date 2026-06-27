import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDSLToAST, compileToGraph, formatDSL } from '../src/loom-dsl.js';
import { graphToCanonicalDSL } from '../src/canonical-dsl.js';
import { Loom } from '../src/loom.js';
import { extractFormulaVars } from '../src/nodes/math.js';

function compile(src) {
  const { ast, errors } = parseDSLToAST(src);
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const { graph, errors: ce } = compileToGraph(ast);
  assert.equal(ce.length, 0, JSON.stringify(ce));
  return graph;
}

function evalRef(graph, ref, env = { time: 0 }) {
  const engine = new Loom(graph);
  engine.evaluateOnce({ env });
  return engine.getValue(ref);
}

function evalSrc(src, ref, env) {
  return evalRef(compile(src), ref, env);
}

test('x = y + z lowers to formula node', () => {
  const graph = compile('a = 1 + 2');
  const node = graph.nodes.find(n => n.id === 'a');
  assert.equal(node.type, 'formula');
  assert.equal(node.params.formula, '(1 + 2)');
  assert.equal(evalRef(graph, 'a.out'), 3);
});

test('x = y - z lowers to math.subtract', () => {
  assert.equal(evalSrc('a = 10 - 3', 'a.out'), 7);
});

test('x = y * z lowers to math.multiply', () => {
  assert.equal(evalSrc('a = 4 * 5', 'a.out'), 20);
});

test('x = y / z lowers to math.divide', () => {
  assert.equal(evalSrc('a = 20 / 4', 'a.out'), 5);
});

test('x = y % z lowers to math.mod', () => {
  assert.equal(evalSrc('a = 7 % 3', 'a.out'), 1);
});

test('operator precedence: * before +', () => {
  assert.equal(evalSrc('a = 1 + 2 * 3', 'a.out'), 7);
});

test('operator precedence: / before -', () => {
  assert.equal(evalSrc('a = 10 - 6 / 2', 'a.out'), 7);
});

test('grouping with parentheses', () => {
  assert.equal(evalSrc('a = (1 + 2) * 3', 'a.out'), 9);
});

test('unary minus on identifier', () => {
  assert.equal(evalSrc('a = 5\nb = -a', 'b.out'), -5);
});

test('unary minus folds into number literal', () => {
  const { ast } = parseDSLToAST('a = -3');
  const value = ast.body[0].value;
  assert.equal(value.type, 'NumberLiteral');
  assert.equal(value.value, -3);
});

test('negative literal in named arg still works', () => {
  assert.equal(evalSrc('a = math.add(a: -1, b: 2)', 'a.out'), 1);
});

test('operators with identifiers', () => {
  const graph = compile('a = 10\nb = 3\nc = a + b');
  const node = graph.nodes.find(n => n.id === 'c');
  assert.deepEqual(node.inputs, [
    { name: 'a', type: 'number', kind: 'behavior' },
    { name: 'b', type: 'number', kind: 'behavior' },
  ]);
  assert.equal(evalRef(graph, 'c.out'), 13);
});

test('chained addition', () => {
  assert.equal(evalSrc('a = 1 + 2 + 3', 'a.out'), 6);
});

test('mixed operators and function calls', () => {
  assert.equal(evalSrc('a = math.add(2, 3) + 1', 'a.out'), 6);
});

test('operator in function body', () => {
  assert.equal(evalSrc('fn double(x) => x + x\na = double(5)', 'a.out'), 10);
});

test('operator in pipe input', () => {
  assert.equal(evalSrc('a = 1 + 2 |> math.multiply(b: 3)', 'a.out'), 9);
});

test('formatDSL preserves operator syntax', () => {
  const { ast } = parseDSLToAST('a = 1 + 2\n');
  const out = formatDSL(ast);
  assert.match(out, /a = 1 \+ 2/);
});

test('formatDSL preserves precedence via parens', () => {
  const { ast } = parseDSLToAST('a = (1 + 2) * 3\n');
  const out = formatDSL(ast);
  assert.match(out, /\(1 \+ 2\) \* 3/);
});

test('formatDSL omits unnecessary parens', () => {
  const { ast } = parseDSLToAST('a = 1 + 2 * 3\n');
  const out = formatDSL(ast);
  assert.match(out, /a = 1 \+ 2 \* 3/);
});

test('operator fixture compiles and evaluates', () => {
  const graph = compile(
    'import math\na = 1 + 2\nb = 10 - 3\nc = 4 * 5\nd = 20 / 4\ne = 7 % 3\nf = a + b * c'
  );
  assert.equal(evalRef(graph, 'a.out'), 3);
  assert.equal(evalRef(graph, 'b.out'), 7);
  assert.equal(evalRef(graph, 'c.out'), 20);
  assert.equal(evalRef(graph, 'd.out'), 5);
  assert.equal(evalRef(graph, 'e.out'), 1);
  assert.equal(evalRef(graph, 'f.out'), 143);
});

test('extractFormulaVars extracts variable names from formula', () => {
  assert.deepEqual(extractFormulaVars('(x + y)'), ['x', 'y']);
  assert.deepEqual(extractFormulaVars('(a + (b * 10))'), ['a', 'b']);
  assert.deepEqual(extractFormulaVars('(-x)'), ['x']);
  assert.deepEqual(extractFormulaVars('42'), []);
});

test('canonical DSL renders constant as literal', () => {
  const graph = compile('x = 1');
  const dsl = graphToCanonicalDSL(graph);
  assert.match(dsl, /x = 1/);
  assert.ok(!dsl.includes('constant'));
});

test('canonical DSL renders formula as operator syntax', () => {
  const graph = compile('x = 1\ny = 2\nz = x + y');
  const dsl = graphToCanonicalDSL(graph);
  assert.match(dsl, /z = x \+ y/);
  assert.ok(!dsl.includes('formula'));
});

test('canonical DSL round-trips operator expression', () => {
  const src = 'a = 10\nb = 3\nc = a + b * 10';
  const graph = compile(src);
  const dsl = graphToCanonicalDSL(graph);
  assert.match(dsl, /c = a \+ \(b \* 10\)/);
  const graph2 = compile(dsl.trim());
  assert.equal(evalRef(graph2, 'c.out'), 40);
});

test('canonical DSL uses explicit syntax when formula vars differ from node IDs', () => {
  const graph = {
    nodes: [
      { id: 'x', type: 'constant', params: { value: 1 } },
      { id: 'y', type: 'constant', params: { value: 2 } },
      { id: 'z', type: 'formula', params: { formula: '(a + b)' }, inputs: [{ name: 'a' }, { name: 'b' }] },
    ],
    edges: [
      { from: 'x.out', to: 'z.a' },
      { from: 'y.out', to: 'z.b' },
    ],
  };
  const dsl = graphToCanonicalDSL(graph);
  assert.match(dsl, /z = formula\(formula: "\(a \+ b\)", a: x, b: y\)/);
});

test('canonical DSL uses explicit syntax when formula has disconnected vars', () => {
  const graph = {
    nodes: [
      { id: 'x', type: 'constant', params: { value: 1 } },
      { id: 'z', type: 'formula', params: { formula: '(x + y)' }, inputs: [{ name: 'x' }, { name: 'y' }] },
    ],
    edges: [
      { from: 'x.out', to: 'z.x' },
    ],
  };
  const dsl = graphToCanonicalDSL(graph);
  assert.match(dsl, /z = formula\(formula: "\(x \+ y\)", x: x\)/);
  assert.ok(!dsl.match(/z = x \+ y/));
});
