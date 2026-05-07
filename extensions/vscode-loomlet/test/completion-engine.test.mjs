import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getCompletionContext } = require('../src/completion-context.js');
const { buildCompletions } = require('../src/completion-engine.js');

function labels(source) {
  const ctx = getCompletionContext(source, source.length);
  return buildCompletions(ctx, false).map((item) => item.label);
}

test('import completion includes implemented libraries', () => {
  const got = labels('import ');
  for (const name of ['math', 'logic', 'list', 'scene']) {
    assert.ok(got.includes(name));
  }
});

test('member completion includes logic/list/scene functions', () => {
  assert.ok(labels('logic.').includes('select'));
  assert.ok(labels('logic.').includes('equals'));
  assert.ok(labels('logic.').includes('and'));
  assert.ok(labels('logic.').includes('or'));

  assert.ok(labels('list.').includes('range'));
  assert.ok(labels('list.').includes('map'));
  assert.ok(labels('list.').includes('filter'));
  assert.ok(labels('list.').includes('reduce'));

  assert.ok(labels('scene.').includes('setPosition'));
  assert.ok(labels('scene.').includes('setRotation'));
  assert.ok(labels('scene.').includes('setScale'));
});

test('argument completion excludes already-used names', () => {
  const got = labels('scene.setPosition(objectId: "sample-cube", ');
  assert.ok(got.includes('x:'));
  assert.ok(got.includes('y:'));
  assert.ok(got.includes('z:'));
  assert.ok(!got.includes('objectId:'));
});

test('planned items excluded by default and shown when enabled', () => {
  const defaultItems = buildCompletions(getCompletionContext('random.', 'random.'.length), false).map((i) => i.label);
  assert.ok(!defaultItems.includes('seeded'));

  const plannedItems = buildCompletions(getCompletionContext('random.', 'random.'.length), true).map((i) => i.label);
  assert.ok(plannedItems.includes('seeded'));
});
