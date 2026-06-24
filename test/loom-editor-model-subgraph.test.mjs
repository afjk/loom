import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDSLToAST, compileToGraph, subgraphBodyToEditorModel } from '../src/index.js';

function compileSubgraph(src) {
  const { ast, errors } = parseDSLToAST(src);
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const { graph, errors: compileErrors } = compileToGraph(ast, { functionLowering: 'subgraph' });
  assert.equal(compileErrors.length, 0, JSON.stringify(compileErrors));
  return graph;
}

test('subgraphBodyToEditorModel renders a function body with a labeled param input', () => {
  const graph = compileSubgraph('fn double(x) => add(x, x)\na = double(5)');
  const model = subgraphBodyToEditorModel(graph, 'double');
  assert.ok(model, 'expected a model for double');

  const nodes = Object.values(model.nodesById);
  const paramNode = nodes.find((n) => n.type === 'subgraph.param');
  assert.ok(paramNode, 'param node present');
  assert.equal(paramNode.category, 'input');
  assert.equal(paramNode.label, 'x');
  // Param exposes an `out` output so the subview can draw its connections.
  assert.deepEqual(paramNode.outputPorts, ['out']);

  assert.ok(nodes.some((n) => n.type === 'add'), 'add node present');

  // Param feeds both inputs of the add node.
  const edges = Object.values(model.edgesById);
  const fromParam = edges.filter((e) => e.fromNodeId === paramNode.id);
  assert.equal(fromParam.length, 2);
});

test('subgraphBodyToEditorModel labels nested subgraph.call nodes', () => {
  const graph = compileSubgraph('fn double(x) => add(x, x)\nfn quadruple(x) => double(double(x))\nv = quadruple(3)');
  const model = subgraphBodyToEditorModel(graph, 'quadruple');
  assert.ok(model);
  const calls = Object.values(model.nodesById).filter((n) => n.type === 'subgraph.call');
  assert.ok(calls.length >= 1, 'nested subgraph.call present');
  assert.ok(calls.every((n) => n.label === 'ƒ double'));
});

test('subgraphBodyToEditorModel returns null for unknown name or no subgraphs', () => {
  const graph = compileSubgraph('fn double(x) => add(x, x)\na = double(5)');
  assert.equal(subgraphBodyToEditorModel(graph, 'missing'), null);

  const { ast } = parseDSLToAST('a = add(1, 2)');
  const { graph: inlineGraph } = compileToGraph(ast);
  assert.equal(subgraphBodyToEditorModel(inlineGraph, 'double'), null);
});
