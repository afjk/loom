import test from 'node:test';
import assert from 'node:assert/strict';

import { parseDSLToAST, compileToGraph } from '../src/loom-dsl.js';
import { graphToEditorModel } from '../src/loom-editor-model.js';
import { applyNodeEditorOperationState } from '../src/node-editor-session.js';
import {
  patchDslSourceForEditorOperation,
  patchOrCanonicalDslSource
} from '../src/source-dsl-patch.js';

function compileSource(source) {
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, parsed.errors.map((error) => error.message).join('\n'));
  const compiled = compileToGraph(parsed.ast);
  assert.equal(compiled.errors.length, 0, compiled.errors.map((error) => error.message).join('\n'));
  return compiled.graph;
}

function applyOperation(source, operation) {
  const graph = compileSource(source);
  const result = applyNodeEditorOperationState({
    graph,
    editorModel: graphToEditorModel(graph),
    errors: []
  }, operation);
  if (result.error) throw result.error;

  const patched = patchDslSourceForEditorOperation(source, operation, result.state.graph);
  assert.equal(patched.ok, true, patched.reason);
  return patched.source;
}

test('source patch: updateParam preserves comments and surrounding source style', () => {
  const source = [
    '# oscillator',
    'wave = sine(freq: 0.35, amplitude: 2)  # trailing',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'updateParam',
    id: 'wave',
    key: 'freq',
    value: 0.5
  });

  assert.match(patched, /^# oscillator\n/);
  assert.match(patched, /wave = sine\(freq: 0.5, amplitude: 2\)  # trailing/);
});

test('source patch: updateParam inserts a missing named argument', () => {
  const patched = applyOperation('wave = sine()\n', {
    type: 'updateParam',
    id: 'wave',
    key: 'freq',
    value: 0.25
  });

  assert.equal(patched, 'wave = sine(freq: 0.25)\n');
});

test('source patch: updateParam preserves imports while patching source', () => {
  const source = [
    'import math',
    '',
    '# oscillator',
    'wave = sine(freq: 0.35, amplitude: 2)',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'updateParam',
    id: 'wave',
    key: 'freq',
    value: 0.5
  });

  assert.match(patched, /^import math\n\n# oscillator\n/);
  assert.match(patched, /wave = sine\(freq: 0.5, amplitude: 2\)/);
});

test('source patch: renameNode updates assignment targets and references without canonicalizing', () => {
  const source = [
    '# keep this comment',
    'clk = clock()',
    'width = map(value: clk, inMin: 0, inMax: 1, outMin: 10, outMax: 20)',
    '',
    'render bar(width: width, color: "#80ed99")',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'renameNode',
    id: 'width',
    newId: 'barWidth'
  });

  assert.match(patched, /^# keep this comment\n/);
  assert.match(patched, /barWidth = map/);
  assert.match(patched, /render bar\(width: barWidth, color: "#80ed99"\)/);
  assert.doesNotMatch(patched, /\bwidth = map/);
});

test('source patch: renameNode preserves function-local identifiers with the same name', () => {
  const source = [
    'items = list.map(list: [1, 2], fn: fn(width) => math.add(width, 1))',
    'width = sine()',
    'render bar(width: width)',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'renameNode',
    id: 'width',
    newId: 'barWidth'
  });

  assert.match(patched, /fn\(width\) => math.add\(width, 1\)/);
  assert.match(patched, /barWidth = sine\(\)/);
  assert.match(patched, /render bar\(width: barWidth\)/);
});

test('source patch: addEdge inserts a named input reference', () => {
  const source = [
    'clk = clock()',
    'wave = sine(freq: 0.3)',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'addEdge',
    edge: {
      id: 'clk.t->wave.t',
      fromNodeId: 'clk',
      fromPort: 't',
      toNodeId: 'wave',
      toPort: 't'
    }
  });

  assert.equal(patched, 'clk = clock()\nwave = sine(freq: 0.3, t: clk)\n');
});

test('source patch: removeEdge removes a named input argument', () => {
  const source = [
    'clk = clock()',
    'wave = sine(t: clk, freq: 0.3)',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'removeEdge',
    edgeId: 'clk.t->wave.t'
  });

  assert.equal(patched, 'clk = clock()\nwave = sine(freq: 0.3)\n');
});

test('source patch: addNode appends a node without rewriting existing source', () => {
  const source = '# intro\nclk = clock()\n';
  const patched = applyOperation(source, {
    type: 'addNode',
    node: {
      id: 'wave',
      type: 'sine',
      category: 'transform',
      params: { freq: 0.2 },
      position: { x: 100, y: 100 }
    }
  });

  assert.equal(patched, '# intro\nclk = clock()\nwave = sine(freq: 0.2)\n');
});

test('source patch: removeNode removes only the assignment line', () => {
  const source = [
    '# keep this standalone comment',
    'clk = clock()',
    'unused = sine(freq: 0.3)',
    'wave = sine(freq: 0.5)',
    ''
  ].join('\n');

  const patched = applyOperation(source, {
    type: 'removeNode',
    id: 'unused'
  });

  assert.equal(patched, '# keep this standalone comment\nclk = clock()\nwave = sine(freq: 0.5)\n');
});

test('source patch: removeNode with connected references falls back to canonical DSL', () => {
  const source = [
    'import math',
    '',
    'clk = clock()',
    'wave = sine(t: clk, freq: 0.3)',
    ''
  ].join('\n');
  const graph = compileSource(source);
  const result = applyNodeEditorOperationState({
    graph,
    editorModel: graphToEditorModel(graph),
    errors: []
  }, {
    type: 'removeNode',
    id: 'clk'
  });
  if (result.error) throw result.error;

  const patched = patchDslSourceForEditorOperation(source, result.change.operation, result.state.graph);
  assert.equal(patched.ok, false);

  const fallback = patchOrCanonicalDslSource(source, result.change.operation, result.state.graph);
  assert.equal(fallback.ok, true);
  assert.equal(fallback.strategy, 'canonical');
  assert.match(fallback.source, /^import math\n\n/);
  assert.match(fallback.source, /wave = sine\(freq: 0.3\)/);
});

test('source patch: unsupported structures fall back to canonical DSL', () => {
  const source = 'import math\n\nclk = clock()\nwave = clk |> sine(freq: 0.3)\n';
  const graph = compileSource(source);
  const result = applyNodeEditorOperationState({
    graph,
    editorModel: graphToEditorModel(graph),
    errors: []
  }, {
    type: 'updateParam',
    id: 'wave',
    key: 'freq',
    value: 0.7
  });
  if (result.error) throw result.error;

  const patched = patchDslSourceForEditorOperation(source, result.change.operation, result.state.graph);
  assert.equal(patched.ok, false);

  const fallback = patchOrCanonicalDslSource(source, result.change.operation, result.state.graph);
  assert.equal(fallback.ok, true);
  assert.equal(fallback.strategy, 'canonical');
  assert.match(fallback.source, /^import math\n\n/);
  assert.match(fallback.source, /wave = sine\(t: clk, freq: 0.7\)/);
});
