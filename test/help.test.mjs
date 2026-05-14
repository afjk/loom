import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listLibraries,
  getLibraryHelp,
  getFunctionHelp,
  formatLibrariesText,
  formatLibraryHelpText,
  formatFunctionHelpText,
  formatHelpJson,
  shouldIncludeLibrary
} from '../src/toolchain/help.js';
import { LIBRARY_COMPATIBILITY } from '../src/toolchain/runtime-targets.js';

test('listLibraries returns implemented libraries by default', () => {
  const libs = listLibraries();
  assert.ok(libs.includes('text'));
  assert.ok(libs.includes('json'));
  assert.ok(libs.includes('console'));
  assert.ok(libs.includes('scene'));
  assert.ok(libs.includes('time'));
  assert.ok(libs.includes('math'));
  assert.ok(libs.includes('fs'));
  // planned empty libraries are hidden by default
  assert.ok(!libs.includes('dom'));
  assert.ok(!libs.includes('canvas'));
  assert.ok(!libs.includes('three'));
  assert.ok(!libs.includes('unity'));
  assert.ok(!libs.includes('scenesync'));
  assert.equal(libs.length, 11);
});

test('listLibraries can include planned libraries', () => {
  const libs = listLibraries({ includePlanned: true });
  assert.ok(libs.includes('text'));
  assert.ok(libs.includes('dom'));
  assert.ok(libs.includes('canvas'));
  assert.ok(libs.includes('three'));
  assert.ok(libs.includes('unity'));
  assert.ok(libs.includes('scenesync'));
  assert.equal(libs.length, 16);
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
  assert.ok(text.includes('loomlet docs'));
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

test('documented libraries in metadata match LIBRARY_COMPATIBILITY', () => {
  const libs = listLibraries({ includePlanned: true });
  for (const libName of Object.keys(LIBRARY_COMPATIBILITY)) {
    // state and output are in LIBRARY_COMPATIBILITY but not documented in metadata
    if (libName === 'state' || libName === 'output') continue;
    assert.ok(libs.includes(libName), `Missing library: ${libName}`);
  }
});

test('library targets match LIBRARY_COMPATIBILITY', () => {
  for (const [libName, compat] of Object.entries(LIBRARY_COMPATIBILITY)) {
    // state and output are in LIBRARY_COMPATIBILITY but not documented in metadata
    if (libName === 'state' || libName === 'output') continue;
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
  const mathFuncs = ['sine', 'cosine', 'add', 'multiply', 'subtract', 'divide', 'mod', 'clamp', 'map', 'abs', 'lerp', 'smoothstep'];
  const mathLib = getLibraryHelp('math');
  for (const func of mathFuncs) {
    assert.ok(mathLib.functions[func], `Missing math function: ${func}`);
  }
});

test('random library exists', () => {
  const randomLib = getLibraryHelp('random');
  assert.ok(randomLib);
  assert.ok(randomLib.description);
});

test('formatLibrariesText includes all libraries', () => {
  const text = formatLibrariesText();
  const libs = listLibraries();
  for (const libName of libs) {
    assert.ok(text.includes(libName), `Missing library in text: ${libName}`);
  }
});

test('formatLibrariesText hides planned empty libraries by default', () => {
  const text = formatLibrariesText();
  assert.ok(!text.includes('- dom'));
  assert.ok(!text.includes('- canvas'));
  assert.ok(!text.includes('- three'));
  assert.ok(!text.includes('- unity'));
  assert.ok(!text.includes('- scenesync'));
});

test('formatLibrariesText shows planned status with includePlanned', () => {
  const text = formatLibrariesText({ includePlanned: true });
  assert.ok(text.includes('(planned)'), 'Should indicate planned libraries');
  assert.ok(text.includes('dom'));
});

test('fs library shows implemented status with functions', () => {
  const text = formatLibraryHelpText('fs');
  assert.ok(text.includes('fs'));
  assert.ok(text.includes('Status: implemented'));
  assert.ok(text.includes('fs.readText'));
});

test('dom library is planned and empty', () => {
  const domLib = getLibraryHelp('dom');
  assert.equal(Object.keys(domLib.functions).length, 0);
  assert.equal(domLib.status, 'planned');
});

test('formatHelpJson hides planned empty libraries by default', () => {
  const json = formatHelpJson(null);
  assert.equal(json.type, 'libraries');
  assert.ok(!json.libraries.some(lib => lib.name === 'dom'));
  assert.ok(!json.libraries.some(lib => lib.name === 'canvas'));
  assert.ok(!json.libraries.some(lib => lib.name === 'three'));
  assert.ok(!json.libraries.some(lib => lib.name === 'unity'));
  assert.ok(!json.libraries.some(lib => lib.name === 'scenesync'));
});

test('formatHelpJson includes planned libraries with includePlanned', () => {
  const json = formatHelpJson(null, { includePlanned: true });
  assert.equal(json.type, 'libraries');
  assert.ok(json.libraries.some(lib => lib.name === 'dom'));
  assert.ok(json.libraries.some(lib => lib.name === 'canvas'));
});

test('direct library lookup still works for hidden planned libraries', () => {
  const lib = getLibraryHelp('dom');
  assert.equal(lib.name, 'dom');
  assert.equal(lib.status, 'planned');
});

test('formatLibraryHelpText works for hidden planned libraries', () => {
  const text = formatLibraryHelpText('dom');
  assert.ok(text.includes('dom'));
  assert.ok(text.includes('Status: planned'));
});

test('formatLibrariesText with metadata option includes custom metadata', () => {
  const metadata = {
    demo: {
      name: 'demo',
      description: 'Demo package nodes.',
      targets: ['cli'],
      status: 'implemented',
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(x)',
          description: 'Doubles a number.',
          args: [
            {
              name: 'x',
              type: 'number',
              positional: true,
              description: 'Input value.'
            }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['y = demo.double(21)']
        }
      }
    }
  };

  const text = formatLibrariesText({ metadata });
  assert.ok(text.includes('demo'));
  assert.ok(text.includes('Demo package nodes'));
});

test('formatLibraryHelpText with metadata option includes custom library', () => {
  const metadata = {
    demo: {
      name: 'demo',
      description: 'Demo package nodes.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(x)',
          description: 'Doubles a number.',
          args: [
            {
              name: 'x',
              type: 'number',
              positional: true,
              description: 'Input value.'
            }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['y = demo.double(21)']
        }
      }
    }
  };

  const text = formatLibraryHelpText('demo', { metadata });
  assert.ok(text.includes('demo'));
  assert.ok(text.includes('demo.double'));
  assert.ok(text.includes('Demo package nodes'));
});

test('formatFunctionHelpText with metadata option includes custom function', () => {
  const metadata = {
    demo: {
      name: 'demo',
      description: 'Demo package nodes.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(x)',
          description: 'Doubles a number.',
          args: [
            {
              name: 'x',
              type: 'number',
              positional: true,
              description: 'Input value.'
            }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['y = demo.double(21)']
        }
      }
    }
  };

  const text = formatFunctionHelpText('demo.double', { metadata });
  assert.ok(text.includes('demo.double(x)'));
  assert.ok(text.includes('Doubles a number'));
  assert.ok(text.includes('x: number'));
  assert.ok(text.includes('Input value'));
  assert.ok(text.includes('Returns:'));
  assert.ok(text.includes('number'));
  assert.ok(text.includes('Example:'));
  assert.ok(text.includes('y = demo.double(21)'));
});

test('formatHelpJson with metadata option includes custom libraries', () => {
  const metadata = {
    demo: {
      name: 'demo',
      description: 'Demo package nodes.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(x)',
          description: 'Doubles a number.',
          args: [
            {
              name: 'x',
              type: 'number',
              positional: true,
              description: 'Input value.'
            }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['y = demo.double(21)']
        }
      }
    }
  };

  const json = formatHelpJson(null, { metadata });
  assert.equal(json.type, 'libraries');
  assert.ok(json.libraries.some(lib => lib.name === 'demo'));
});

test('formatHelpJson with metadata option and library query', () => {
  const metadata = {
    demo: {
      name: 'demo',
      description: 'Demo package nodes.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(x)',
          description: 'Doubles a number.',
          args: [
            {
              name: 'x',
              type: 'number',
              positional: true,
              description: 'Input value.'
            }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['y = demo.double(21)']
        }
      }
    }
  };

  const json = formatHelpJson('demo', { metadata });
  assert.equal(json.type, 'library');
  assert.equal(json.library.name, 'demo');
  assert.ok(json.library.functions.some(f => f.name === 'double'));
});

test('formatHelpJson with metadata option and function query', () => {
  const metadata = {
    demo: {
      name: 'demo',
      description: 'Demo package nodes.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(x)',
          description: 'Doubles a number.',
          args: [
            {
              name: 'x',
              type: 'number',
              positional: true,
              description: 'Input value.'
            }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['y = demo.double(21)']
        }
      }
    }
  };

  const json = formatHelpJson('demo.double', { metadata });
  assert.equal(json.type, 'function');
  assert.equal(json.function.name, 'double');
  assert.equal(json.function.signature, 'demo.double(x)');
  assert.ok(json.function.args.some(a => a.name === 'x'));
});
