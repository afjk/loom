import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { LIBRARY_REFERENCE, getLibraryReference } = require('../src/library-reference.js');
const { buildFunctionReferenceEntries } = require('../src/library-metadata-model.js');

test('LIBRARY_REFERENCE is a non-empty array', () => {
  assert.ok(Array.isArray(LIBRARY_REFERENCE), 'LIBRARY_REFERENCE should be an array');
  assert.ok(LIBRARY_REFERENCE.length > 0, 'Expected library reference entries');
});

test('each reference entry has required fields', () => {
  for (const entry of LIBRARY_REFERENCE) {
    assert.ok(entry.label, 'Reference entry should have a label');
    assert.ok(entry.signature, `${entry.label} should have a signature`);
    assert.ok(entry.description, `${entry.label} should have a description`);
    assert.ok(Array.isArray(entry.names), `${entry.label} should have names`);
    assert.ok(entry.names.length > 0, `${entry.label} should have at least one name`);
  }
});

test('each name resolves to its reference entry', () => {
  for (const entry of LIBRARY_REFERENCE) {
    for (const name of entry.names) {
      assert.equal(getLibraryReference(name), entry, `${name} should resolve to its reference entry`);
    }
  }
});

test('LIBRARY_REFERENCE has no duplicate names', () => {
  const allNames = new Set();
  for (const entry of LIBRARY_REFERENCE) {
    for (const name of entry.names) {
      assert.ok(!allNames.has(name), `Duplicate name: ${name}`);
      allNames.add(name);
    }
  }
});

test('missing references return null', () => {
  assert.equal(getLibraryReference('__missing__'), null, 'missing reference should return null');
});

test('getLibraryReference returns generated metadata for math.add', () => {
  const ref = getLibraryReference('math.add');
  assert.ok(ref, 'math.add should have a reference');
  assert.ok(ref.signature.includes('add'), 'signature should include add');
  assert.ok(ref.description, 'description should be present');
});

test('getLibraryReference returns generated metadata for scene.setPosition', () => {
  const ref = getLibraryReference('scene.setPosition');
  assert.ok(ref, 'scene.setPosition should have a reference');
  assert.ok(ref.signature.includes('setPosition'), 'signature should include setPosition');
  assert.ok(ref.description, 'description should be present');
});

test('getLibraryReference returns override entry for console.log', () => {
  const ref = getLibraryReference('console.log');
  assert.ok(ref, 'console.log should have a reference');
  assert.equal(ref.label, 'console.log', 'label should be console.log');
  assert.ok(ref.example, 'console.log should have an example from override');
});

test('getLibraryReference works for render point', () => {
  const ref = getLibraryReference('render point');
  assert.ok(ref, 'render point should have a reference');
  assert.equal(ref.label, 'render point', 'label should be render point');
  assert.ok(ref.example, 'render point should have an example');
});

test('getLibraryReference works for render point alias', () => {
  const ref = getLibraryReference('point');
  assert.ok(ref, 'point alias should have a reference');
  assert.equal(ref.label, 'render point', 'label should be render point');
});

test('getLibraryReference works for math.sine with alias', () => {
  const refFull = getLibraryReference('math.sine');
  const refAlias = getLibraryReference('sine');
  assert.ok(refFull, 'math.sine should have a reference');
  assert.ok(refAlias, 'sine alias should have a reference');
  assert.equal(refFull, refAlias, 'both names should resolve to the same entry');
});

test('manual-only entry: clock is available', () => {
  const ref = getLibraryReference('clock');
  assert.ok(ref, 'clock should have a reference');
  assert.equal(ref.label, 'clock', 'clock label should be clock');
  assert.equal(ref.signature, 'clock() -> number', 'clock should have correct signature');
  assert.ok(ref.example, 'clock should have an example');
});

test('manual-only entry: input.mouseX is available', () => {
  const ref = getLibraryReference('input.mouseX');
  assert.ok(ref, 'input.mouseX should have a reference');
  assert.equal(ref.label, 'input.mouseX', 'label should be input.mouseX');
  assert.ok(ref.example, 'should have an example');
});

test('manual-only entry: mouseX alias works', () => {
  const refFull = getLibraryReference('input.mouseX');
  const refAlias = getLibraryReference('mouseX');
  assert.ok(refFull && refAlias, 'both should resolve');
  assert.equal(refFull, refAlias, 'both names should resolve to the same entry');
});

test('manual-only entry: input.mouseY is available', () => {
  const ref = getLibraryReference('input.mouseY');
  assert.ok(ref, 'input.mouseY should have a reference');
});

test('manual-only entry: mouseY alias works', () => {
  const refFull = getLibraryReference('input.mouseY');
  const refAlias = getLibraryReference('mouseY');
  assert.ok(refFull && refAlias, 'both should resolve');
  assert.equal(refFull, refAlias, 'both names should resolve to the same entry');
});

test('manual-only entry: input.mouseDown is available', () => {
  const ref = getLibraryReference('input.mouseDown');
  assert.ok(ref, 'input.mouseDown should have a reference');
});

test('manual-only entry: mouseDown alias works', () => {
  const refFull = getLibraryReference('input.mouseDown');
  const refAlias = getLibraryReference('mouseDown');
  assert.ok(refFull && refAlias, 'both should resolve');
  assert.equal(refFull, refAlias, 'both names should resolve to the same entry');
});

test('manual-only entry: input.key is available', () => {
  const ref = getLibraryReference('input.key');
  assert.ok(ref, 'input.key should have a reference');
});

test('manual-only entry: key alias works', () => {
  const refFull = getLibraryReference('input.key');
  const refAlias = getLibraryReference('key');
  assert.ok(refFull && refAlias, 'both should resolve');
  assert.equal(refFull, refAlias, 'both names should resolve to the same entry');
});

test('planned functions are excluded by default', () => {
  const generatedDefault = buildFunctionReferenceEntries(false);
  const generatedPlanned = buildFunctionReferenceEntries(true);

  assert.ok(generatedPlanned.length >= generatedDefault.length, 'includePlanned should include at least as many items');

  const hasTextDefault = generatedDefault.some(e => e.names.some(n => n.includes('text.')));
  const hasTextPlanned = generatedPlanned.some(e => e.names.some(n => n.includes('text.')));
  assert.ok(hasTextDefault && hasTextPlanned, 'implemented libraries should appear in both');
});
