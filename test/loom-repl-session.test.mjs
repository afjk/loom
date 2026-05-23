import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LoomReplSession } from '../src/toolchain/repl-session.js';
import { createLibraryMetadataRegistry } from '../src/toolchain/metadata-registry.js';
import { createNodeRegistry } from '../src/runtime/node-registry.js';
import { registerBuiltinNodes } from '../src/nodes/index.js';
import { registerTrustedPackage } from '../src/runtime/package-registration.js';

test('evaluates assignment snippet', () => {
  const session = new LoomReplSession();
  const result = session.evaluateSnippet('x = constant(value: 1)');

  assert.equal(result.ok, true);
  assert.equal(result.values['x.out'], 1);
  assert.match(session.getSource(), /x = constant/);
});

test('invalid snippet does not pollute source', () => {
  const session = new LoomReplSession();

  let result = session.evaluateSnippet('x = constant(value: 1)');
  assert.equal(result.ok, true);

  result = session.evaluateSnippet('bad =');
  assert.equal(result.ok, false);

  assert.equal(session.getSource().includes('bad ='), false);
  assert.equal(session.getSource().includes('x = constant'), true);
});

test('imports persist', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import text').ok, true);
  const result = session.evaluateSnippet('message = text.upper("hello")');

  assert.equal(result.ok, true);
  assert.equal(result.values['message.out'], 'HELLO');
  assert.match(session.getSource(), /import text/);
  assert.match(session.getSource(), /message = text\.upper/);
});

test('late import is hoisted above existing statements', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import text').ok, true);
  assert.equal(session.evaluateSnippet('message = text.upper("hello")').ok, true);
  assert.equal(session.evaluateSnippet('import console').ok, true);

  assert.equal(
    session.getSource(),
    [
      'import text',
      'import console',
      '',
      'message = text.upper("hello")'
    ].join('\n')
  );
});

test('duplicate imports are not added twice', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import text').ok, true);
  assert.equal(session.evaluateSnippet('message = text.upper("hello")').ok, true);
  assert.equal(session.evaluateSnippet('import text').ok, true);

  const matches = session.getSource().match(/^import text$/gm) || [];
  assert.equal(matches.length, 1);
});

test('console effect works', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import console').ok, true);
  assert.equal(session.evaluateSnippet('message = constant(value: "hello")').ok, true);

  const result = session.evaluateSnippet('console.log(message)');

  assert.equal(result.ok, true);
  assert.equal(result.effects.length, 1);
  assert.equal(result.effects[0].level, 'log');
  assert.equal(result.effects[0].value, 'hello');
  assert.equal(result.effects[0].nodeId, '_effect1');
});

test('previous console effects are not returned again after later snippets', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import console').ok, true);
  assert.equal(session.evaluateSnippet('message = constant(value: "hello")').ok, true);

  const firstEffect = session.evaluateSnippet('console.log(message)');
  assert.equal(firstEffect.ok, true);
  assert.equal(firstEffect.effects.length, 1);
  assert.equal(firstEffect.effects[0].value, 'hello');

  const later = session.evaluateSnippet('x = constant(value: 1)');
  assert.equal(later.ok, true);
  assert.equal(later.values['x.out'], 1);
  assert.equal(later.effects.length, 0);
});

test('new console effect is returned after previous effect', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import console').ok, true);
  assert.equal(session.evaluateSnippet('a = constant(value: "a")').ok, true);
  assert.equal(session.evaluateSnippet('console.log(a)').effects.length, 1);
  assert.equal(session.evaluateSnippet('b = constant(value: "b")').ok, true);

  const result = session.evaluateSnippet('console.log(b)');
  assert.equal(result.ok, true);
  assert.equal(result.effects.length, 1);
  assert.equal(result.effects[0].value, 'b');
});

test('reset clears effect tracking', () => {
  const session = new LoomReplSession();

  assert.equal(session.evaluateSnippet('import console').ok, true);
  assert.equal(session.evaluateSnippet('message = constant(value: "hello")').ok, true);
  assert.equal(session.evaluateSnippet('console.log(message)').effects.length, 1);

  session.reset();

  assert.equal(session.evaluateSnippet('import console').ok, true);
  assert.equal(session.evaluateSnippet('message = constant(value: "hello")').ok, true);

  const result = session.evaluateSnippet('console.log(message)');
  assert.equal(result.ok, true);
  assert.equal(result.effects.length, 1);
});

test('reset clears source and graph', () => {
  const session = new LoomReplSession();

  session.evaluateSnippet('x = constant(value: 1)');
  session.reset();

  assert.equal(session.getSource(), '');
  assert.equal(session.getGraph(), null);
});

test('inspect returns summary', () => {
  const session = new LoomReplSession();

  session.evaluateSnippet('x = constant(value: 1)');
  const inspection = session.inspect();

  assert.equal(inspection.ok, true);
  assert.equal(inspection.summary.nodeCount >= 1, true);
});

test('vars and history are tracked', () => {
  const session = new LoomReplSession();
  session.evaluateSnippet('x = constant(value: 10)');
  session.evaluateSnippet('y = fn(v) => constant(value: v)');
  const vars = session.getVariables();
  assert.equal(vars.some((entry) => entry.name === 'x' && entry.value === 10), true);
  assert.equal(vars.some((entry) => entry.name === 'y'), true);
  const history = session.getHistory();
  assert.equal(history.length, 2);
});

test('load source persists, run source is isolated', async () => {
  const session = new LoomReplSession();
  const fixture = await readFile(new URL('./fixtures/repl-load.loom', import.meta.url), 'utf8');
  const loaded = session.loadSource(fixture);
  assert.equal(loaded.ok, true);
  const value = session.evaluateSnippet('double(base)');
  assert.equal(value.ok, true);
  assert.equal(value.values['_effect1.out'], 20);

  session.reset();
  const runResult = session.runSource(fixture);
  assert.equal(runResult.ok, true);
  const after = session.evaluateSnippet('double(base)');
  assert.equal(after.ok, false);
});

test('session has help methods', () => {
  const session = new LoomReplSession();
  assert.equal(typeof session.listLibraries, 'function');
  assert.equal(typeof session.getLibraryHelp, 'function');
  assert.equal(typeof session.getFunctionHelp, 'function');
});

test('session listLibraries returns library names', () => {
  const session = new LoomReplSession();
  const libs = session.listLibraries();
  assert.ok(libs.includes('Loomlet libraries'));
  assert.ok(libs.includes('text'));
  assert.ok(libs.includes('loomlet docs'));
});

test('session getLibraryHelp returns library text', () => {
  const session = new LoomReplSession();
  const help = session.getLibraryHelp('text');
  assert.ok(help.includes('text'));
  assert.ok(help.includes('text.upper'));
});

test('session getFunctionHelp returns function text', () => {
  const session = new LoomReplSession();
  const help = session.getFunctionHelp('text.upper');
  assert.ok(help.includes('text.upper(value)'));
  assert.ok(help.includes('uppercase'));
});

test('session with metadataRegistry includes custom library in listLibraries', () => {
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

  const registry = createLibraryMetadataRegistry(metadata);
  const session = new LoomReplSession({ metadataRegistry: registry });
  const libs = session.listLibraries();
  assert.ok(libs.includes('demo'));
});

test('session with metadataRegistry includes custom library in getLibraryHelp', () => {
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

  const registry = createLibraryMetadataRegistry(metadata);
  const session = new LoomReplSession({ metadataRegistry: registry });
  const help = session.getLibraryHelp('demo');
  assert.ok(help.includes('demo'));
  assert.ok(help.includes('demo.double'));
});

test('session with metadataRegistry includes custom function in getFunctionHelp', () => {
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

  const registry = createLibraryMetadataRegistry(metadata);
  const session = new LoomReplSession({ metadataRegistry: registry });
  const help = session.getFunctionHelp('demo.double');
  assert.ok(help.includes('demo.double(x)'));
  assert.ok(help.includes('Doubles a number'));
});

test('REPL session with custom nodeRegistry can execute package nodes', async () => {
  const demoPackage = await import('../examples/packages/demo/index.js');

  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);
  registerTrustedPackage(nodeRegistry, demoPackage, { metadataRegistry });

  const session = new LoomReplSession({
    target: 'cli',
    nodeRegistry,
    metadataRegistry
  });

  const importResult = session.evaluateSnippet('import demo');
  assert.equal(importResult.ok, true, 'import demo should succeed');

  const evalResult = session.evaluateSnippet('x = demo.double(value: 21)');
  assert.equal(evalResult.ok, true, 'demo.double execution should succeed');
  assert.equal(evalResult.values['x.out'], 42, 'demo.double(21) should return 42');

  const libs = session.listLibraries();
  assert.ok(libs.includes('demo'), 'listLibraries should include demo');

  const libHelp = session.getLibraryHelp('demo');
  assert.ok(libHelp.includes('demo.double'), 'getLibraryHelp should include demo.double');

  const funcHelp = session.getFunctionHelp('demo.double');
  assert.ok(funcHelp.includes('double'), 'getFunctionHelp should include function description');
});

test('injectEvents passes env.events to onEvent and clears pending queue', () => {
  const session = new LoomReplSession({ time: 1 });
  assert.equal(session.evaluateSnippet('listener = onEvent(channel: "alarm.ring")').ok, true);

  const result = session.injectEvents([
    { channel: 'alarm.ring', timestamp: 1, payload: { label: 'break' } }
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.values['listener.event'], [{ channel: 'alarm.ring', timestamp: 1, payload: { label: 'break' } }]);
  assert.equal(session.getEventPlaygroundState().pendingEvents.length, 0);
  assert.equal(session.getEventPlaygroundState().lastInjectedEvents.length, 1);
});

test('setTime applies env.time to subsequent evaluations', () => {
  const session = new LoomReplSession({ time: 0 });
  session.setTime(10);
  const result = session.evaluateSnippet('clockNow = clock()');
  assert.equal(result.ok, true);
  assert.equal(result.values['clockNow.t'], 10);
});

test('tick advances time and updates dt for current-source evaluation', () => {
  const session = new LoomReplSession({ time: 0, dt: 0 });
  assert.equal(session.evaluateSnippet('smoothed = lowpass(value: 1, tau: 1, initial: 0)').ok, true);
  session.tick(0.5);

  const result = session.evaluateCurrent();
  assert.equal(result.ok, true);
  assert.equal(session.getTime(), 0.5);
  assert.equal(session.getDeltaTime(), 0.5);
  assert.ok(result.values['smoothed.out'] > 0);
});

test('object scope default targeting receives matching self-target events only', () => {
  const session = new LoomReplSession({ time: 0 });
  assert.equal(session.evaluateSnippet('listener = onEvent(channel: "pointer.click")').ok, true);
  session.setObjectScope('cube-01');

  const mismatch = session.injectEvents([
    { channel: 'pointer.click', timestamp: 0, target: 'cube-02' }
  ]);
  assert.equal(mismatch.ok, true);
  assert.deepEqual(mismatch.values['listener.event'], []);

  const match = session.injectEvents([
    { channel: 'pointer.click', timestamp: 0, target: 'cube-01' }
  ]);
  assert.equal(match.ok, true);
  assert.deepEqual(match.values['listener.event'], [{ channel: 'pointer.click', timestamp: 0, target: 'cube-01' }]);
});
