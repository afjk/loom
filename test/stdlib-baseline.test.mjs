import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Loom, LoomError } from '../src/loom.js';
import { runLoomSource } from '../src/toolchain/run.js';
import { isLibraryAvailableInTarget } from '../src/toolchain/runtime-targets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loom.mjs');

function evalNode(type, params = {}, id = 'n') {
  const engine = new Loom({ nodes: [{ id, type, params }], edges: [] });
  engine.evaluateOnce();
  return engine.getValue(`${id}.out`);
}

function evalGraph(nodes, edges, ref) {
  const engine = new Loom({ nodes, edges });
  engine.evaluateOnce();
  return { value: ref ? engine.getValue(ref) : undefined, effects: engine.getEffects() };
}

test('logic baseline nodes', () => {
  assert.equal(evalNode('logic.equals', { value: 1, other: 1 }), true);
  assert.equal(evalNode('logic.equals', { value: 1, other: 2 }), false);
  assert.equal(evalNode('logic.notEquals', { value: 1, other: 2 }), true);
  assert.equal(evalNode('logic.select', { condition: true, whenTrue: 'yes', whenFalse: 'no' }), 'yes');
  assert.equal(evalNode('logic.select', { condition: false, whenTrue: 'yes', whenFalse: 'no' }), 'no');
  assert.equal(evalNode('logic.greaterThan', { value: 3, other: 2 }), true);
  assert.equal(evalNode('logic.lessThan', { value: 3, other: 2 }), false);
  assert.equal(evalNode('logic.greaterOrEqual', { value: 2, other: 2 }), true);
  assert.equal(evalNode('logic.lessOrEqual', { value: 2, other: 2 }), true);
  assert.equal(evalNode('logic.and', { a: 1, b: 'x' }), true);
  assert.equal(evalNode('logic.or', { a: 0, b: 'x' }), true);
  assert.equal(evalNode('logic.not', { value: 0 }), true);
  assert.equal(evalNode('logic.when', { condition: false, value: 'hidden' }), null);
});

test('list baseline nodes', () => {
  assert.deepEqual(evalNode('list.range', { start: 1, end: 5 }), [1, 2, 3, 4, 5]);
  assert.deepEqual(evalNode('list.range', { start: 5, end: 1 }), [5, 4, 3, 2, 1]);
  assert.equal(evalNode('list.length', { list: [1, 2, 3] }), 3);
  assert.equal(evalNode('list.first', { list: [1, 2, 3] }), 1);
  assert.equal(evalNode('list.last', { list: [1, 2, 3] }), 3);
  assert.equal(evalNode('list.at', { list: ['a', 'b'], index: 1 }), 'b');
  assert.equal(evalNode('list.at', { list: ['a', 'b'], index: -1 }), 'b');
  assert.equal(evalNode('list.join', { list: [1, 2, 3], separator: '-' }), '1-2-3');
  const original = [3, 1, 2];
  assert.deepEqual(evalNode('list.reverse', { list: original }), [2, 1, 3]);
  assert.deepEqual(original, [3, 1, 2]);
  assert.deepEqual(evalNode('list.sort', { list: original }), [1, 2, 3]);
  assert.deepEqual(evalNode('list.take', { list: [1, 2, 3], count: 2 }), [1, 2]);
  assert.deepEqual(evalNode('list.drop', { list: [1, 2, 3], count: 2 }), [3]);
  assert.deepEqual(evalNode('list.concat', { list1: [1], list2: [2, 3] }), [1, 2, 3]);
  assert.throws(() => evalNode('list.map', { list: [1], fn: null }), (error) => error instanceof LoomError && error.code === 'UNSUPPORTED_FUNCTION_VALUE');
  assert.throws(() => evalNode('list.filter', { list: [1], fn: null }), /function values/);
  assert.throws(() => evalNode('list.reduce', { list: [1], fn: null, initial: 0 }), /function values/);
});

test('text baseline additions', () => {
  assert.equal(evalNode('text.concat', { value1: 'a', value2: 2, value3: true }), 'a2true');
  assert.deepEqual(evalNode('text.split', { value: 'a,b', separator: ',' }), ['a', 'b']);
  assert.equal(evalNode('text.join', { list: ['a', 'b'], separator: ':' }), 'a:b');
  assert.equal(evalNode('text.includes', { value: 'loomlet', search: 'loom' }), true);
  assert.equal(evalNode('text.startsWith', { value: 'loomlet', search: 'loom' }), true);
  assert.equal(evalNode('text.endsWith', { value: 'loomlet', search: 'let' }), true);
  assert.equal(evalNode('text.length', { value: 'abc' }), 3);
  assert.equal(evalNode('text.isEmpty', { value: '' }), true);
  assert.equal(evalNode('text.stringify', { value: 3 }), '3');
  assert.equal(evalNode('text.stringify', { value: 'x' }), 'x');
  assert.equal(evalNode('text.stringify', { value: [1, 2] }), '[1,2]');
  assert.equal(evalNode('text.stringify', { value: { a: 1 } }), '{"a":1}');
  assert.equal(evalNode('text.stringify', { value: null }), '');
});

test('math baseline additions', () => {
  assert.equal(evalNode('math.floor', { value: 1.8 }), 1);
  assert.equal(evalNode('math.ceil', { value: 1.2 }), 2);
  assert.equal(evalNode('math.round', { value: 1.5 }), 2);
  assert.equal(evalNode('math.min', { a: 1, b: 2 }), 1);
  assert.equal(evalNode('math.max', { a: 1, b: 2 }), 2);
  assert.equal(evalNode('math.tan', { value: 0 }), 0);
  assert.equal(evalNode('math.sqrt', { value: 9 }), 3);
  assert.equal(evalNode('math.pow', { value: 2, exponent: 3 }), 8);
  assert.equal(evalNode('math.clamp', { value: 2, min: 0, max: 1 }), 1);
  assert.equal(evalNode('math.map', { value: 5, inMin: 0, inMax: 10, outMin: 0, outMax: 1 }), 0.5);
  assert.equal(evalNode('math.lerp', { a: 0, b: 10, t: 0.25 }), 2.5);
  assert.equal(evalNode('math.smoothstep', { x: 0.5, edge0: 0, edge1: 1 }), 0.5);
  assert.equal(evalNode('math.cosine', { t: 0, freq: 1, amplitude: 1, phase: 0, offset: 0 }), 1);
});

test('random baseline nodes', () => {
  const value = evalNode('random.value');
  assert.ok(value >= 0 && value < 1);
  const ranged = evalNode('random.range', { min: 10, max: 11 });
  assert.ok(ranged >= 10 && ranged < 11);
  const int = evalNode('random.int', { min: 2, max: 4 });
  assert.ok(Number.isInteger(int) && int >= 2 && int <= 4);
  assert.ok(['a', 'b'].includes(evalNode('random.choice', { list: ['a', 'b'] })));
  assert.equal(evalNode('random.choice', { list: [] }), null);
});

test('debug baseline nodes', () => {
  assert.equal(typeof evalNode('debug.inspect', { value: { a: 1 } }), 'string');
  const traced = evalGraph([{ id: 'trace', type: 'debug.trace', params: { value: 7, label: 'seven' } }], [], 'trace.out');
  assert.equal(traced.value, 7);
  assert.deepEqual(traced.effects[0], { type: 'debug.trace', label: 'seven', value: 7, nodeId: 'trace' });
  assert.equal(evalNode('debug.assert', { condition: true, message: 'ok' }), true);
  assert.throws(() => evalNode('debug.assert', { condition: false, message: 'bad' }), (error) => error instanceof LoomError && error.code === 'ASSERTION_FAILED' && /bad/.test(error.message));
});

test('console.table records table effect', () => {
  const { effects } = evalGraph([{ id: 'table', type: 'console.table', params: { value: [{ a: 1 }] } }], [], null);
  assert.equal(effects[0].type, 'console.table');
});

test('fs baseline nodes are CLI-only and access local files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loomlet-fs-'));
  const file = path.join(tmpDir, 'sample.txt');
  evalGraph([{ id: 'write', type: 'fs.writeText', params: { path: file, value: 'hello' } }], []);
  assert.equal(fs.readFileSync(file, 'utf8'), 'hello');
  assert.equal(evalNode('fs.readText', { path: file }), 'hello');
  assert.equal(evalNode('fs.exists', { path: file }), true);
  assert.equal(evalNode('fs.exists', { path: path.join(tmpDir, 'missing.txt') }), false);
  assert.ok(evalNode('fs.list', { path: tmpDir }).includes('sample.txt'));
  assert.equal(isLibraryAvailableInTarget('fs', 'cli'), true);
  assert.equal(isLibraryAvailableInTarget('fs', 'web'), false);
});

test('CLI docs and conditions smoke tests', () => {
  for (const args of [
    ['docs', 'logic'],
    ['docs', 'list'],
    ['docs', 'text.stringify'],
    ['docs', 'random.value'],
    ['docs', 'debug.trace'],
    ['docs', 'logic.select'],
    ['docs', 'list.range']
  ]) {
    const result = spawnSync(process.execPath, [cliPath, ...args], { cwd: projectRoot, encoding: 'utf8' });
    assert.equal(result.status, 0, `${args.join(' ')}\n${result.stderr}`);
  }

  const sample = runLoomSource('import logic\nvalue = logic.select(constant(value: true), whenTrue: "three", whenFalse: "other")', { target: 'cli', get: 'value.out' });
  assert.equal(sample.ok, true, JSON.stringify(sample.errors));
  assert.equal(sample.values['value.out'], 'three');
});
