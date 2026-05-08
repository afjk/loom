import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { LIBRARY_REFERENCE, getLibraryReference } = require('../src/library-reference.js');

assert.ok(Array.isArray(LIBRARY_REFERENCE), 'LIBRARY_REFERENCE should be an array');
assert.ok(LIBRARY_REFERENCE.length > 0, 'Expected library reference entries');

for (const entry of LIBRARY_REFERENCE) {
  assert.ok(entry.label, 'Reference entry should have a label');
  assert.ok(entry.signature, `${entry.label} should have a signature`);
  assert.ok(entry.description, `${entry.label} should have a description`);
  assert.ok(Array.isArray(entry.names), `${entry.label} should have names`);
  assert.ok(entry.names.length > 0, `${entry.label} should have at least one name`);

  for (const name of entry.names) {
    assert.equal(getLibraryReference(name), entry, `${name} should resolve to its reference entry`);
  }
}

assert.equal(getLibraryReference('__missing__'), null, 'missing reference should return null');

console.log('All library reference tests passed!');
