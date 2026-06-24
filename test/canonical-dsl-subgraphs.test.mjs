import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDSLToAST, compileToGraph, graphToCanonicalDSL, subgraphsToFnDefinitions, Loom } from '../src/index.js';

function compileSubgraph(src) {
  const { ast, errors } = parseDSLToAST(src);
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const { graph, errors: compileErrors } = compileToGraph(ast, { functionLowering: 'subgraph' });
  assert.equal(compileErrors.length, 0, JSON.stringify(compileErrors));
  return graph;
}

function evalRef(graph, ref, env = { time: 5 }) {
  const engine = new Loom(graph);
  engine.evaluateOnce({ env });
  return engine.getValue(ref);
}

test('subgraphsToFnDefinitions lists each function as a reusable unit', () => {
  const defs = subgraphsToFnDefinitions(compileSubgraph('fn double(x) => add(x, x)\na = double(5)'));
  assert.equal(defs.length, 1);
  assert.equal(defs[0].name, 'double');
  assert.deepEqual(defs[0].params, ['x']);
  assert.match(defs[0].signature, /^fn double\(x\) => add\(/);
});

test('subgraphsToFnDefinitions covers nested function references', () => {
  const defs = subgraphsToFnDefinitions(
    compileSubgraph('fn double(x) => add(x, x)\nfn quadruple(x) => double(double(x))\nv = quadruple(3)')
  );
  const names = defs.map((d) => d.name).sort();
  assert.deepEqual(names, ['double', 'quadruple']);
  const quad = defs.find((d) => d.name === 'quadruple');
  assert.match(quad.body, /double\(double\(x\)\)/);
});

test('subgraphsToFnDefinitions returns [] for a graph with no functions', () => {
  const { ast } = parseDSLToAST('a = add(1, 2)');
  const { graph } = compileToGraph(ast);
  assert.deepEqual(subgraphsToFnDefinitions(graph), []);
});

test('canonical DSL renders subgraphs as fn definitions', () => {
  const dsl = graphToCanonicalDSL(compileSubgraph('fn double(x) => add(x, x)\na = double(5)'));
  assert.match(dsl, /fn double\(x\) =>/);
  assert.match(dsl, /a = double\(5\)/);
});

test('subgraph canonical DSL round-trips with identical evaluation', () => {
  const cases = [
    ['fn double(x) => add(x, x)\na = double(5)\nb = add(double(3), 1)', 'b.out'],
    ['fn double(x) => add(x, x)\nfn quadruple(x) => double(double(x))\nv = quadruple(3)', 'v.out'],
    ['fn scale(x) => math.multiply(x, 2)\nv = clock() |> scale()', 'v.out'],
    ['fn first(a, b) => a\nv = first(7, 9)', 'v.out']
  ];
  for (const [src, ref] of cases) {
    const original = evalRef(compileToGraph(parseDSLToAST(src).ast).graph, ref);

    const dsl = graphToCanonicalDSL(compileSubgraph(src));
    const reparsed = parseDSLToAST(dsl);
    assert.equal(reparsed.errors.length, 0, `reparse failed for ${src}: ${JSON.stringify(reparsed.errors)}`);
    const recompiled = compileToGraph(reparsed.ast);
    assert.equal(recompiled.errors.length, 0, `recompile failed for ${src}: ${JSON.stringify(recompiled.errors)}`);

    assert.deepEqual(evalRef(recompiled.graph, ref), original, `round-trip mismatch for ${src}`);
  }
});

test('nested function definitions both render and round-trip', () => {
  const dsl = graphToCanonicalDSL(compileSubgraph('fn double(x) => add(x, x)\nfn quadruple(x) => double(double(x))\nv = quadruple(3)'));
  assert.match(dsl, /fn double\(/);
  assert.match(dsl, /fn quadruple\(/);
  assert.match(dsl, /quadruple\(3\)/);
});

test('dependency ordering: nested anonymous subexpressions round-trip (also fixes inline)', () => {
  // Previously canonical DSL emitted consumers before their anonymous producers,
  // which failed definition-before-use on reparse. Verify both inline and subgraph.
  for (const lowering of [undefined, 'subgraph']) {
    const { ast } = parseDSLToAST('a = add(add(3, 3), 1)');
    const graph = compileToGraph(ast, lowering ? { functionLowering: lowering } : {}).graph;
    const dsl = graphToCanonicalDSL(graph);
    const recompiled = compileToGraph(parseDSLToAST(dsl).ast);
    assert.equal(recompiled.errors.length, 0, `${lowering || 'inline'}: ${JSON.stringify(recompiled.errors)}`);
    assert.equal(evalRef(recompiled.graph, 'a.out'), 7);
  }
});

test('graphs without subgraphs render unchanged (no fn lines)', () => {
  const dsl = graphToCanonicalDSL(compileToGraph(parseDSLToAST('a = add(1, 2)').ast).graph);
  assert.doesNotMatch(dsl, /\bfn /);
  assert.match(dsl, /a = add\(/);
});
