import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Loom } from '../src/loom.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, 'fixtures', 'runtime-parity', 'portable-node-cases.json');

const fixtureData = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

function assertValueMatches(actual, expected, tolerance, caseId) {
  if (typeof expected === 'number' && typeof tolerance === 'number') {
    assert.ok(
      Math.abs(actual - expected) <= tolerance,
      `${caseId}: expected value within ${tolerance} of ${expected}, got ${actual}`
    );
    return;
  }

  assert.deepEqual(actual, expected, `${caseId}: output mismatch`);
}

test('runtime parity fixtures: valid fixture structure', () => {
  assert.ok(fixtureData.version, 'fixtures should have version');
  assert.ok(Array.isArray(fixtureData.cases), 'fixtures should have cases array');
  assert.ok(fixtureData.cases.length > 0, 'fixtures should have at least one case');
});

test('runtime parity fixtures: unique case IDs', () => {
  const ids = fixtureData.cases.map(c => c.id);
  const uniqueIds = new Set(ids);
  assert.equal(
    uniqueIds.size,
    ids.length,
    `all case IDs should be unique; duplicates found: ${ids.filter((id, idx) => ids.indexOf(id) !== idx).join(', ')}`
  );
});

test('runtime parity fixtures: case validation', () => {
  for (const cas of fixtureData.cases) {
    assert.ok(cas.id, `case should have id: ${JSON.stringify(cas)}`);
    assert.ok(cas.library, `case ${cas.id} should have library`);
    assert.ok(cas.graph, `case ${cas.id} should have graph`);
    assert.ok(Array.isArray(cas.graph.nodes), `case ${cas.id} should have graph.nodes array`);
    assert.ok(cas.get, `case ${cas.id} should have get`);
    assert.ok(cas.expected !== undefined, `case ${cas.id} should have expected`);
    assert.equal(cas.level, 'portable', `case ${cas.id} should have level='portable'`);
  }
});

test('runtime parity fixtures: all portable nodes produce expected output', async (t) => {
  for (const cas of fixtureData.cases) {
    await t.test(`${cas.library}: ${cas.id}`, () => {
      try {
        const engine = new Loom(cas.graph);
        const evalOpts = cas.evaluate ?? {};
        engine.evaluateOnce(evalOpts);
        const actual = engine.getValue(cas.get);
        assertValueMatches(actual, cas.expected, cas.tolerance, cas.id);
      } catch (error) {
        throw new Error(`${cas.id} failed: ${error.message}`);
      }
    });
  }
});
