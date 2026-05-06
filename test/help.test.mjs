import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listLibraries,
  getLibraryHelp,
  getFunctionHelp,
  formatLibrariesText,
  formatLibraryHelpText,
  formatFunctionHelpText,
  formatHelpJson
} from '../src/toolchain/help.js';

test('listLibraries returns all libraries', () => {
  const libs = listLibraries();
  assert.ok(libs.includes('text'));
  assert.ok(libs.includes('json'));
  assert.ok(libs.includes('console'));
  assert.ok(libs.includes('scene'));
  assert.ok(libs.includes('time'));
  assert.ok(libs.includes('math'));
  assert.equal(libs.length, 6);
});

test('getLibraryHelp returns library metadata', () => {
  const lib = getLibraryHelp('text');
  assert.equal(lib.name, 'text');
  assert.ok(lib.description);
  assert.ok(lib.targets);
  assert.ok(lib.functions);
  assert.ok(lib.functions.upper);
});

test('getLibraryHelp throws for unknown library', () => {
  assert.throws(
    () => getLibraryHelp('unknown'),
    (err) => err.code === 'UNKNOWN_LIBRARY'
  );
});

test('getFunctionHelp returns function metadata', () => {
  const func = getFunctionHelp('text.upper');
  assert.equal(func.name, 'upper');
  assert.ok(func.signature);
  assert.ok(func.description);
  assert.ok(func.args);
  assert.ok(func.returns);
  assert.ok(func.examples);
});

test('getFunctionHelp throws for unknown function', () => {
  assert.throws(
    () => getFunctionHelp('text.unknown'),
    (err) => err.code === 'UNKNOWN_FUNCTION'
  );
});

test('getFunctionHelp throws for unknown library', () => {
  assert.throws(
    () => getFunctionHelp('unknown.func'),
    (err) => err.code === 'UNKNOWN_LIBRARY'
  );
});

test('formatLibrariesText contains library names', () => {
  const text = formatLibrariesText();
  assert.ok(text.includes('text'));
  assert.ok(text.includes('json'));
  assert.ok(text.includes('console'));
  assert.ok(text.includes('scene'));
  assert.ok(text.includes('time'));
  assert.ok(text.includes('math'));
  assert.ok(text.includes('loom docs'));
});

test('formatLibraryHelpText contains function list', () => {
  const text = formatLibraryHelpText('text');
  assert.ok(text.includes('text'));
  assert.ok(text.includes('text.upper'));
  assert.ok(text.includes('text.lower'));
  assert.ok(text.includes('text.trim'));
  assert.ok(text.includes('text.replace'));
});

test('formatFunctionHelpText contains signature and example', () => {
  const text = formatFunctionHelpText('text.upper');
  assert.ok(text.includes('text.upper(value)'));
  assert.ok(text.includes('uppercase'));
  assert.ok(text.includes('Arguments:'));
  assert.ok(text.includes('Example:'));
  assert.ok(text.includes('hello loom'));
});

test('formatFunctionHelpText has args section', () => {
  const text = formatFunctionHelpText('text.replace');
  assert.ok(text.includes('Arguments:'));
  assert.ok(text.includes('search'));
  assert.ok(text.includes('replacement'));
});

test('formatFunctionHelpText has returns section', () => {
  const text = formatFunctionHelpText('text.upper');
  assert.ok(text.includes('Returns:'));
  assert.ok(text.includes('string'));
});

test('formatFunctionHelpText has targets section', () => {
  const text = formatFunctionHelpText('text.upper');
  assert.ok(text.includes('Targets:'));
});

test('formatHelpJson returns libraries by default', () => {
  const json = formatHelpJson('');
  assert.equal(json.type, 'libraries');
  assert.ok(json.libraries);
  assert.ok(Array.isArray(json.libraries));
  assert.ok(json.libraries.length > 0);
});

test('formatHelpJson returns library details', () => {
  const json = formatHelpJson('text');
  assert.equal(json.type, 'library');
  assert.equal(json.library.name, 'text');
  assert.ok(json.library.functions);
  assert.ok(Array.isArray(json.library.functions));
  assert.ok(json.library.functions.some(f => f.name === 'upper'));
});

test('formatHelpJson returns function details', () => {
  const json = formatHelpJson('text.upper');
  assert.equal(json.type, 'function');
  assert.equal(json.function.name, 'upper');
  assert.ok(json.function.signature);
  assert.ok(json.function.args);
  assert.ok(json.function.returns);
  assert.ok(json.function.targets);
  assert.ok(json.function.examples);
});

test('formatHelpJson includes args in function details', () => {
  const json = formatHelpJson('text.replace');
  assert.ok(json.function.args);
  assert.ok(json.function.args.length > 0);
  assert.ok(json.function.args.some(a => a.name === 'search'));
});

test('math.sine is documented', () => {
  const func = getFunctionHelp('math.sine');
  assert.equal(func.name, 'sine');
  assert.ok(func.description);
});

test('math.add is documented', () => {
  const func = getFunctionHelp('math.add');
  assert.equal(func.name, 'add');
});

test('json.parse is documented', () => {
  const func = getFunctionHelp('json.parse');
  assert.equal(func.name, 'parse');
});

test('scene.setPosition is documented', () => {
  const func = getFunctionHelp('scene.setPosition');
  assert.equal(func.name, 'setPosition');
});

test('time.serverClock is documented', () => {
  const func = getFunctionHelp('time.serverClock');
  assert.equal(func.name, 'serverClock');
});

test('console.log is documented', () => {
  const func = getFunctionHelp('console.log');
  assert.equal(func.name, 'log');
});
