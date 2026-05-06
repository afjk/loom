import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loom.mjs');

test('repl smoke flow works', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'import text',
        'message = text.upper("hello")',
        ':source',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Loom REPL/);
  assert.match(result.stdout, /message\.out = HELLO/);
  assert.match(result.stdout, /import text/);
  assert.match(result.stdout, /message = text\.upper/);
});
