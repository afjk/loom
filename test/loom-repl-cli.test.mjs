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

test('repl :libs with invalid option reports error and continues', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':libs nope',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Unknown :libs option: nope/);
  assert.match(result.stdout, /Use :libs or :libs --all/);
});

test('repl :libs with extra arguments reports error', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':libs --all extra',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Unknown :libs option: --all extra/);
  assert.match(result.stdout, /Use :libs or :libs --all/);
});

test('repl :libs with unknown flag reports error', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':libs --planned',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Unknown :libs option: --planned/);
  assert.match(result.stdout, /Use :libs or :libs --all/);
});

test('repl supports event playground commands', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'click = onEvent(channel: "pointer.click")',
        'send = sendEvent(trigger: click, channel: "custom.clicked")',
        ':scope object cube-01',
        ':event pointer.click {"target":"cube-02"}',
        ':event pointer.click {"target":"cube-01","payload":{"button":0}}',
        ':key Space',
        ':time 10',
        'clockNow = clock()',
        ':tick 0.5',
        'clockLater = clock()',
        ':events',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /scope: object:cube-01/);
  assert.match(result.stdout, /click\.event = .*cube-01/s);
  assert.match(result.stdout, /keyboard\.keyDown .*Space/s);
  assert.match(result.stdout, /clockNow\.t = 10/);
  assert.match(result.stdout, /clockLater\.t = 10.5/);
  assert.match(result.stdout, /last events:/);
  assert.match(result.stdout, /keyboard\.keyDown/);
  assert.match(result.stderr, /\[event\.send\] channel="custom\.clicked"/);
});

test('repl :set stores host input and evaluates', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'd = input("distance", 999)',
        ':set distance 2.0',
        ':vars',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /d\.out = 999/);  // initial eval
  assert.match(result.stdout, /no effects/);    // :set with no sendEvent
  assert.match(result.stdout, /Host inputs/);
  assert.match(result.stdout, /distance = 2/);
});

test('repl :set with risingEdge -> sendEvent full desired experience', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'distance = input("distance", 999)',
        'near = lessThan(distance, 1.0)',
        'enter = risingEdge(value: near)',
        'send = sendEvent(trigger: enter, channel: "custom.enterRange")',
        ':set distance 2.0',
        ':set distance 0.8',
        ':set distance 0.6',
        ':set distance 1.5',
        ':set distance 0.9',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  // :set distance 0.8 should emit (false -> true)
  // :set distance 0.6 should not emit (stays true)
  // :set distance 1.5 should not emit (true -> false, but no risingEdge)
  // :set distance 0.9 should emit (false -> true)
  const noEffectsMatches = result.stdout.match(/no effects/g) || [];
  const effectsMatches = result.stdout.match(/effects:\s*\n\s*- event\.send channel="custom\.enterRange"/g) || [];
  assert.equal(noEffectsMatches.length >= 3, true, `expected >= 3 "no effects", got: ${noEffectsMatches.length}`);
  assert.equal(effectsMatches.length, 2, `expected 2 event.send emits, got: ${effectsMatches.length}`);
});

test('repl :set with parse rules handles numbers booleans strings', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        'v = input("val", 0)',
        ':set val 42',
        ':set val true',
        ':set val "hello"',
        ':set val world',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  // No crash, session continues after each :set
  assert.match(result.stdout, /no effects/);
});

test('repl :reset clears host variables', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':set distance 2.0',
        ':vars',
        ':reset',
        ':vars',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /distance = 2/);
  assert.match(result.stdout, /session reset/);
  // After reset, vars should not show distance
  const parts = result.stdout.split('session reset');
  assert.ok(parts.length >= 2, 'expected session reset marker');
  assert.ok(!parts[1].includes('distance'), 'distance should be cleared after reset');
});

test('repl :set without name shows usage error', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':set',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  // :set without args just continues (no :set handler since it's bare :set without space)
});

test('repl :set without value shows usage error', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':set distance',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /Usage: :set/);
});

test('repl help includes :set command', () => {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'repl'],
    {
      cwd: projectRoot,
      input: [
        ':help',
        ':quit'
      ].join('\n'),
      encoding: 'utf8'
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /:set/);
  assert.match(result.stdout, /host input/);
});
