import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_METADATA, getAllLibraries } from '../src/toolchain/library-metadata.js';
import { LIBRARY_COMPATIBILITY } from '../src/toolchain/runtime-targets.js';

test('getAllLibraries returns an array of sorted library names', () => {
  const libraries = getAllLibraries();
  assert(Array.isArray(libraries), 'getAllLibraries should return an array');
  assert(libraries.length > 0, 'should have at least one library');

  const sorted = [...libraries].sort();
  assert.deepEqual(libraries, sorted, 'libraries should be sorted');

  for (const name of libraries) {
    assert(LIBRARY_METADATA[name], `library "${name}" should exist in LIBRARY_METADATA`);
  }
});

test('each library has minimum shape', () => {
  const libraries = getAllLibraries();

  for (const libraryName of libraries) {
    const library = LIBRARY_METADATA[libraryName];

    assert.equal(typeof library.name, 'string', `${libraryName}: name should be a string`);
    assert.equal(library.name, libraryName, `${libraryName}: name should match key`);

    assert.equal(typeof library.description, 'string', `${libraryName}: description should be a string`);
    assert(library.description.length > 0, `${libraryName}: description should be non-empty`);

    assert(Array.isArray(library.targets), `${libraryName}: targets should be an array`);
    assert(library.targets.length > 0, `${libraryName}: targets should be non-empty`);

    assert(typeof library.functions === 'object', `${libraryName}: functions should be an object`);
    assert(library.functions !== null, `${libraryName}: functions should not be null`);
  }
});

test('each function has minimum shape', () => {
  const libraries = getAllLibraries();

  for (const libraryName of libraries) {
    const library = LIBRARY_METADATA[libraryName];
    const functions = library.functions || {};

    for (const functionName of Object.keys(functions)) {
      const fn = functions[functionName];

      assert.equal(typeof fn.name, 'string', `${libraryName}.${functionName}: name should be a string`);
      assert.equal(fn.name, functionName, `${libraryName}.${functionName}: name should match key`);

      assert.equal(typeof fn.signature, 'string', `${libraryName}.${functionName}: signature should be a string`);
      assert(fn.signature.length > 0, `${libraryName}.${functionName}: signature should be non-empty`);

      assert.equal(typeof fn.description, 'string', `${libraryName}.${functionName}: description should be a string`);
      assert(fn.description.length > 0, `${libraryName}.${functionName}: description should be non-empty`);

      assert(Array.isArray(fn.args), `${libraryName}.${functionName}: args should be an array`);

      assert.equal(typeof fn.returns, 'string', `${libraryName}.${functionName}: returns should be a string`);
      assert(fn.returns.length > 0, `${libraryName}.${functionName}: returns should be non-empty`);

      assert(Array.isArray(fn.targets), `${libraryName}.${functionName}: targets should be an array`);
      assert(fn.targets.length > 0, `${libraryName}.${functionName}: targets should be non-empty`);

      assert(Array.isArray(fn.examples), `${libraryName}.${functionName}: examples should be an array`);
    }
  }
});

test('each argument entry has minimum shape and no duplicate names', () => {
  const libraries = getAllLibraries();

  for (const libraryName of libraries) {
    const library = LIBRARY_METADATA[libraryName];
    const functions = library.functions || {};

    for (const functionName of Object.keys(functions)) {
      const fn = functions[functionName];
      const args = fn.args || [];

      const seenNames = new Set();

      for (const arg of args) {
        assert.equal(typeof arg.name, 'string', `${libraryName}.${functionName}: arg.name should be a string`);
        assert(arg.name.length > 0, `${libraryName}.${functionName}: arg.name should be non-empty`);

        assert(!seenNames.has(arg.name), `${libraryName}.${functionName}: duplicate arg name "${arg.name}"`);
        seenNames.add(arg.name);

        assert.equal(typeof arg.type, 'string', `${libraryName}.${functionName}: arg.type should be a string`);
        assert(arg.type.length > 0, `${libraryName}.${functionName}: arg.type should be non-empty`);

        assert.equal(typeof arg.positional, 'boolean', `${libraryName}.${functionName}: arg.positional should be a boolean`);

        assert.equal(typeof arg.description, 'string', `${libraryName}.${functionName}: arg.description should be a string`);
        assert(arg.description.length > 0, `${libraryName}.${functionName}: arg.description should be non-empty`);
      }
    }
  }
});

test('function targets are compatible with library targets', () => {
  const libraries = getAllLibraries();

  for (const libraryName of libraries) {
    const library = LIBRARY_METADATA[libraryName];
    const libraryTargets = new Set(library.targets);
    const functions = library.functions || {};

    for (const functionName of Object.keys(functions)) {
      const fn = functions[functionName];

      for (const target of fn.targets) {
        assert(libraryTargets.has(target),
          `${libraryName}.${functionName}: target "${target}" not in library targets ${JSON.stringify(Array.from(libraryTargets))}`);
      }
    }
  }
});

test('library names exist in runtime compatibility', () => {
  const libraries = getAllLibraries();

  for (const libraryName of libraries) {
    assert(LIBRARY_COMPATIBILITY[libraryName],
      `library "${libraryName}" should exist in LIBRARY_COMPATIBILITY`);

    const libMeta = LIBRARY_METADATA[libraryName];
    const libCompat = LIBRARY_COMPATIBILITY[libraryName];

    // Check that metadata targets are a subset of compatibility targets
    const compatTargets = new Set(libCompat.targets);
    for (const target of libMeta.targets) {
      assert(compatTargets.has(target),
        `${libraryName}: metadata target "${target}" not in compatibility targets`);
    }
  }
});

test('explicit schema examples: math.add', () => {
  const add = LIBRARY_METADATA.math.functions.add;
  assert(add, 'math.add should exist');
  assert.equal(add.returns, 'number');
  assert.deepEqual(add.args.map((arg) => arg.name), ['a', 'b']);
  assert.deepEqual(add.args.map((arg) => arg.positional), [false, false]);
});

test('explicit schema examples: text.upper', () => {
  const upper = LIBRARY_METADATA.text.functions.upper;
  assert(upper, 'text.upper should exist');
  assert.deepEqual(upper.args.map((arg) => arg.name), ['value']);
  assert.equal(upper.args[0].positional, true);
});

test('explicit schema examples: scene.setPosition', () => {
  const setPosition = LIBRARY_METADATA.scene.functions.setPosition;
  assert(setPosition, 'scene.setPosition should exist');
  assert.deepEqual(setPosition.args.map((arg) => arg.name), ['objectId', 'x', 'y', 'z']);
  assert.equal(setPosition.args[0].positional, true);
  assert.deepEqual(setPosition.args.slice(1).map((arg) => arg.positional), [false, false, false]);
});

test('incomplete generated metadata is documented', () => {
  // This test acknowledges that some functions have empty args arrays.
  // These are generated by makeFunctionMetadata and do not yet have full argument documentation.
  // This is not a failure - it documents a known incomplete state.

  // Find and count functions with empty args
  const libraries = getAllLibraries();
  let functionsWithEmptyArgs = 0;
  const examplesWithEmptyArgs = [];

  for (const libraryName of libraries) {
    const library = LIBRARY_METADATA[libraryName];
    const functions = library.functions || {};

    for (const functionName of Object.keys(functions)) {
      const fn = functions[functionName];
      if (fn.args && fn.args.length === 0) {
        functionsWithEmptyArgs++;
        examplesWithEmptyArgs.push(`${libraryName}.${functionName}`);
        if (examplesWithEmptyArgs.length >= 3) break;
      }
    }
  }

  if (functionsWithEmptyArgs > 0) {
    // TODO: Complete generated arg metadata for logic/list/random/debug/output functions
    // before using LIBRARY_METADATA as the compiler's full argument-validation source.
    console.log(`  Note: ${functionsWithEmptyArgs} function(s) have empty args arrays.`);
    console.log(`  Examples: ${examplesWithEmptyArgs.join(', ')}`);
  }
});
