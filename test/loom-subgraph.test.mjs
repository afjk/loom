import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDSLToAST, compileToGraph, expandSubgraphs, Loom } from '../src/index.js';

function compile(src, functionLowering) {
  const { ast, errors: parseErrors } = parseDSLToAST(src);
  assert.equal(parseErrors.length, 0, JSON.stringify(parseErrors));
  const { graph, errors } = compileToGraph(ast, functionLowering ? { functionLowering } : {});
  assert.equal(errors.length, 0, JSON.stringify(errors));
  return graph;
}

function evalValue(graph, ref, env = { time: 0 }) {
  const engine = new Loom(graph);
  engine.evaluateOnce({ env });
  return engine.getValue(ref);
}

test('default lowering is still inline (unchanged behavior)', () => {
  const graph = compile('fn double(x) => add(x, x)\na = double(1)\nb = double(2)');
  assert.equal(graph.subgraphs, undefined);
  assert.deepEqual(graph.nodes.map((n) => n.type), ['add', 'add']);
});

test('subgraph lowering shares one definition across repeated calls', () => {
  const graph = compile('fn double(x) => add(x, x)\na = double(1)\nb = double(2)\nc = double(3)', 'subgraph');
  assert.ok(graph.subgraphs && graph.subgraphs.double, 'expected a shared double definition');
  assert.equal(Object.keys(graph.subgraphs).length, 1);
  const callNodes = graph.nodes.filter((n) => n.type === 'subgraph.call');
  assert.equal(callNodes.length, 3, 'one subgraph.call per call site, not duplicated bodies');
  assert.equal(graph.nodes.filter((n) => n.type === 'add').length, 0, 'body nodes are not duplicated into the graph');
});

test('expandSubgraphs flattens back to a graph with no subgraph nodes', () => {
  const compact = compile('fn double(x) => add(x, x)\nc = add(double(5), 1)', 'subgraph');
  const flat = expandSubgraphs(compact);
  assert.equal(flat.subgraphs, undefined);
  assert.equal(flat.nodes.some((n) => n.type === 'subgraph.call' || n.type === 'subgraph.param'), false);
});

test('subgraph mode evaluates identically to inline mode', () => {
  const cases = [
    ['fn double(x) => add(x, x)\nv = double(5)', 'v.out'],
    ['fn plusOne(x) => add(x, 1)\na = plusOne(1)\nb = plusOne(2)\nv = add(a, b)', 'v.out'],
    ['fn double(x) => add(x, x)\nfn quadruple(x) => double(double(x))\nv = quadruple(3)', 'v.out'],
    ['fn id(x) => x\nv = add(id(4), 10)', 'v.out'],
    ['fn sq(x) => math.multiply(x, x)\nv = sq(7) |> add(1)', 'v.out'],
    ['fn scale(x) => math.multiply(x, 2)\nv = clock() |> scale()', 'v.out'],
    // Literal passthrough / projection read by the binding name (constant materialization).
    ['fn first(a, b) => a\nv = first(3, 9)', 'v.out'],
    ['fn second(a, b) => b\nv = second(3, 9)', 'v.out'],
    ['fn id(x) => x\nv = id(7)', 'v.out'],
    // Passthrough feeding a downstream consumer.
    ['fn id(x) => x\nt = id(7)\nv = add(t, 1)', 'v.out']
  ];
  for (const [src, ref] of cases) {
    const inline = evalValue(compile(src), ref, { time: 4 });
    const sub = evalValue(compile(src, 'subgraph'), ref, { time: 4 });
    assert.deepEqual(sub, inline, `mismatch for: ${src}`);
  }
});

test('trivial projection functions are inlined, matching inline reads by name', () => {
  // A projection bound to a name and read by that name must resolve identically
  // to inline mode (previously diverged for dynamic ref passthroughs).
  const cases = [
    ['fn id(x) => x\nv = id(clock())', 'v.t'],
    ['fn first(a, b) => a\nv = first(3, 9)', 'v.out'],
    ['fn second(a, b) => b\nv = second(3, 9)', 'v.out']
  ];
  for (const [src, ref] of cases) {
    const inline = evalValue(compile(src), ref, { time: 5 });
    const sub = evalValue(compile(src, 'subgraph'), ref, { time: 5 });
    assert.deepEqual(sub, inline, `mismatch for: ${src}`);
  }
  // A trivial projection has no shareable body, so it is not emitted as a subgraph.
  const graph = compile('fn id(x) => x\nfn double(x) => add(x, x)\na = id(double(3))', 'subgraph');
  assert.deepEqual(Object.keys(graph.subgraphs || {}), ['double']);
});

test('subgraph graph survives JSON round-trip and runs', () => {
  const compact = compile('fn double(x) => add(x, x)\nv = double(21)', 'subgraph');
  const roundTripped = JSON.parse(JSON.stringify(compact));
  assert.equal(evalValue(roundTripped, 'v.out'), 42);
});

test('unknown function still errors in subgraph mode', () => {
  const { ast } = parseDSLToAST('v = missing(1)');
  const { errors } = compileToGraph(ast, { functionLowering: 'subgraph' });
  assert.ok(errors.length > 0);
});

test('subgraph graphs flatten correctly when they feed scene sinks', () => {
  // Pure subgraph calls feeding a scene sink must expand to a flat graph.
  const compact = compile('fn double(x) => add(x, x)\nscene.setPosition("box", x: double(2))', 'subgraph');
  const flat = expandSubgraphs(compact);
  assert.equal(flat.nodes.some((n) => n.type.startsWith('subgraph.')), false);
  assert.ok(flat.nodes.some((n) => n.type === 'scene.setPosition'));
});

test('arity errors are preserved in subgraph mode', () => {
  const { ast } = parseDSLToAST('fn id(x) => x\nv = id()');
  const { errors } = compileToGraph(ast, { functionLowering: 'subgraph' });
  assert.ok(errors.some((e) => e.code === 'WRONG_ARITY'));
});
