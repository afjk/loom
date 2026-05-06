import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getCompletionContext } = require('../src/completion-context.js');

function withCursor(input) {
  const offset = input.indexOf('|');
  return { text: input.replace('|', ''), offset };
}

{
  const { text, offset } = withCursor('import |');
  const context = getCompletionContext(text, offset);
  assert.equal(context.kind, 'import');
}

{
  const { text, offset } = withCursor('math.|');
  const context = getCompletionContext(text, offset);
  assert.equal(context.kind, 'member');
  assert.equal(context.library, 'math');
}

{
  const { text, offset } = withCursor('scene.|');
  const context = getCompletionContext(text, offset);
  assert.equal(context.kind, 'member');
  assert.equal(context.library, 'scene');
}

{
  const { text, offset } = withCursor('math.sine(t, fre|');
  const context = getCompletionContext(text, offset);
  assert.equal(context.kind, 'callArgs');
  assert.equal(context.library, 'math');
  assert.equal(context.functionName, 'sine');
}

{
  const { text, offset } = withCursor('math.sine(t, freq: 0.5, |');
  const context = getCompletionContext(text, offset);
  assert.ok(context.alreadyUsedArgNames.includes('freq'));
}

{
  const { text, offset } = withCursor('|');
  const context = getCompletionContext(text, offset);
  assert.equal(context.kind, 'topLevel');
}

{
  const { text, offset } = withCursor('foo bar |');
  const context = getCompletionContext(text, offset);
  assert.ok(context.kind === 'topLevel' || context.kind === 'unknown');
}

console.log('completion-context tests passed');
