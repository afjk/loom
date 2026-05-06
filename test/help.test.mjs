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
import { LIBRARY_COMPATIBILITY } from '../src/toolchain/runtime-targets.js';

test('listLibraries returns all libraries', () => {
  const libs = listLibraries();
  assert.ok(libs.includes('text'));
  assert.ok(libs.includes('json'));
  assert.ok(libs.includes('console'));
  assert.ok(libs.includes('scene'));
  assert.ok(libs.includes('time'));
  assert.ok(libs.includes('math'));
  assert.ok(libs.includes('state'));
  assert.ok(libs.includes('fs'));
  assert.ok(libs.includes('dom'));
  assert.ok(libs.includes('canvas'));
  assert.ok(libs.includes('three'));
  assert.ok(libs.includes('unity'));
  assert.ok(libs.includes('scenesync'));
  assert.equal(libs.length, 13);
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

test('getFunctionHelp rejects unqualified name', () => {
  assert.throws(
    () => getFunctionHelp('upper'),
    (err) => err.code === 'INVALID_FUNCTION_NAME'
  );
});

test('getFunctionHelp rejects triple-qualified name', () => {
  assert.throws(
    () => getFunctionHelp('text.upper.extra'),
    (err) => err.code === 'INVALID_FUNCTION_NAME'
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

test('all known libraries from LIBRARY_COMPATIBILITY are in metadata', () => {
  const libs = listLibraries();
  for (const libName of Object.keys(LIBRARY_COMPATIBILITY)) {
    assert.ok(libs.includes(libName), `Missing library: ${libName}`);
  }
});

test('library targets match LIBRARY_COMPATIBILITY', () => {
  for (const [libName, compat] of Object.entries(LIBRARY_COMPATIBILITY)) {
    const lib = getLibraryHelp(libName);
    assert.deepEqual(
      lib.targets.sort(),
      compat.targets.sort(),
      `Targets mismatch for ${libName}`
    );
  }
});

test('function targets match library targets', () => {
  const textLib = getLibraryHelp('text');
  for (const func of Object.values(textLib.functions)) {
    if (func && func.targets) {
      assert.ok(Array.isArray(func.targets), 'Function targets should be array');
      assert.deepEqual(func.targets, textLib.targets, 'Function targets should match library targets');
    }
  }
});

test('all documented libraries have descriptions', () => {
  const libs = listLibraries();
  for (const libName of libs) {
    const lib = getLibraryHelp(libName);
    assert.ok(lib.description, `Missing description for ${libName}`);
  }
});

test('math functions all documented', () => {
  const mathFuncs = ['sine', 'cosine', 'add', 'multiply', 'subtract', 'divide', 'mod', 'clamp', 'map', 'negate', 'abs', 'lerp', 'smoothstep', 'greaterThan', 'lessThan'];
  const mathLib = getLibraryHelp('math');
  for (const func of mathFuncs) {
    assert.ok(mathLib.functions[func], `Missing math function: ${func}`);
  }
});

test('state functions all documented', () => {
  const stateFuncs = ['lowpass', 'delay1', 'integrate', 'smoothLerp'];
  const stateLib = getLibraryHelp('state');
  for (const func of stateFuncs) {
    assert.ok(stateLib.functions[func], `Missing state function: ${func}`);
  }
});

test('state.smoothLerp is documented', () => {
  const func = getFunctionHelp('state.smoothLerp');
  assert.equal(func.name, 'smoothLerp');
  assert.ok(func.description);
  assert.ok(func.signature);
});

test('formatLibrariesText includes all libraries', () => {
  const text = formatLibrariesText();
  const libs = listLibraries();
  for (const libName of libs) {
    assert.ok(text.includes(libName), `Missing library in text: ${libName}`);
  }
});

test('formatLibrariesText shows planned status', () => {
  const text = formatLibrariesText();
  assert.ok(text.includes('(planned)'), 'Should indicate planned libraries');
});

test('formatLibraryHelpText shows planned status', () => {
  const text = formatLibraryHelpText('fs');
  assert.ok(text.includes('Status: planned'));
});

test('planned library has empty functions', () => {
  const fsLib = getLibraryHelp('fs');
  assert.equal(Object.keys(fsLib.functions).length, 0);
  assert.equal(fsLib.status, 'planned');
});
