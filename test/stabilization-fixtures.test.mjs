import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDSLToAST } from '../src/loom-dsl.js';
import { compileLoomSource } from '../src/toolchain/compile.js';
import { runLoomSource } from '../src/toolchain/run.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, 'fixtures', 'stabilization');

function normalizeGraph(graph) {
  if (!graph) return null;

  const nodes = (graph.nodes ?? [])
    .map((node) => {
      const normalized = {
        id: node.id,
        type: node.type
      };
      if (node.params !== undefined && node.params !== null) {
        normalized.params = node.params;
      }
      return normalized;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const edges = (graph.edges ?? [])
    .map((edge) => ({
      from: edge.from,
      to: edge.to
    }))
    .sort((a, b) => {
      const aKey = `${a.from}->${a.to}`;
      const bKey = `${b.from}->${b.to}`;
      return aKey.localeCompare(bKey);
    });

  const normalized = {
    nodes,
    edges
  };

  if (graph.imports !== undefined && graph.imports !== null && graph.imports.length > 0) {
    normalized.imports = graph.imports;
  }

  if (graph.render !== undefined && graph.render !== null) {
    normalized.render = graph.render;
  }

  return normalized;
}

function findNode(graph, nodeId) {
  return (graph.nodes ?? []).find((n) => n.id === nodeId);
}

test('basic-math: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'basic-math.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('basic-math: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'basic-math.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('basic-math: semantic expectations', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'basic-math.loom'), 'utf8');
  const compiled = compileLoomSource(source, { target: 'cli' });
  assert.equal(compiled.ok, true);

  const graph = compiled.graph;
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');

  const valueNode = findNode(graph, 'value');
  assert.ok(valueNode, 'Graph should have value node');
  assert.equal(valueNode.type, 'math.add', 'value node should be math.add');

  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true);
  assert.equal(run.values['value.out'], 3, 'value should be 3');
});

test('pipe-map-render: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'pipe-map-render.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('pipe-map-render: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'pipe-map-render.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('pipe-map-render: semantic expectations', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'pipe-map-render.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true);

  const graph = compiled.graph;
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');
  assert.ok(graph.render, 'Graph should have render config');

  const valueNode = findNode(graph, 'value');
  assert.ok(valueNode, 'Graph should have value node');

  const normalized = normalizeGraph(graph);
  assert.ok(normalized.render, 'Normalized graph should preserve render config');
});

test('function-capture: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'function-capture.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('function-capture: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'function-capture.loom'), 'utf8');
  const compiled = compileLoomSource(source, { target: 'cli' });
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('function-capture: semantic expectations', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'function-capture.loom'), 'utf8');
  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true, `Runtime errors: ${JSON.stringify(run.errors)}`);
  assert.equal(run.values['value.out'], 15, 'value should be 15 (base=10, addBase(5) = 10+5)');
});
