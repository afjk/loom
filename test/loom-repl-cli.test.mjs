import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loomlet.mjs');

test('repl smoke flow works', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'import text',
        'message = text.upper("hello")',
        'import console',
        'console.log(message)',
        ':source',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Loomlet REPL/);
  assert.match(result.stdout, /message\.out = HELLO/);
  assert.match(result.stderr, /\[log\] HELLO/);
  assert.match(result.stdout, /import text/);
  assert.match(result.stdout, /import console/);
  assert.match(result.stdout, /message = text\.upper/);
  assert.match(result.stdout, /import text\s+import console\s+\s*message = text\.upper/s);
});

test('repl does not print previous console effect again after later snippet', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'import console',
        'message = constant(value: "hello")',
        'console.log(message)',
        'x = constant(value: 1)',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  const matches = result.stderr.match(/\[log\] hello/g) || [];
  assert.equal(matches.length, 1);
  assert.match(result.stdout, /x\.out = 1/);
});

test('repl supports libs, help, vars, history, load, run, and reset', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':libs',
        ':help logic',
        ':help logic.select',
        'base = constant(value: 10)',
        ':vars',
        ':history',
        ':load test/fixtures/repl-load.loom',
        'double(base)',
        ':run test/fixtures/repl-load.loom',
        ':reset',
        'math.add(base, 5)',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /math/);
  assert.match(result.stdout, /logic\.select/);
  assert.match(result.stdout, /truthy/i);
  assert.match(result.stdout, /base = 10/);
  assert.match(result.stdout, /1: base = constant\(value: 10\)/);
  assert.match(result.stdout, /session reset/);
  assert.match(result.stderr, /UNKNOWN_IDENTIFIER|Unknown|MISSING/i);
});

test('repl :libs hides planned empty libraries by default', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':libs',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /math/);
  assert.match(result.stdout, /text/);
  assert.ok(!result.stdout.includes('- dom'));
  assert.ok(!result.stdout.includes('- canvas'));
  assert.ok(!result.stdout.includes('- three'));
});

test('repl :libs --all shows planned libraries', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':libs --all',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /math/);
  assert.match(result.stdout, /- dom/);
  assert.match(result.stdout, /planned/);
});
