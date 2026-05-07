import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LoomReplSession } from '../src/toolchain/repl-session.js';

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
