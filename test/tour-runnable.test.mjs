import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loomlet.mjs');
const tourRoot = path.join(projectRoot, 'examples', 'tour');

const BLOCKED_RUN_TOKENS = ['--send', 'redeem', 'session', 'objects', 'curl', 'https://'];

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8'
  });
}

function walkLoomFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkLoomFiles(nextPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.loom')) {
      files.push(nextPath);
    }
  }
  return files;
}

function extractMetadata(source) {
  const statusMatch = source.match(/^#\s*Status\s*:\s*(.+)$/im);
  const status = statusMatch ? statusMatch[1].trim().toLowerCase() : null;

  const runLines = [];
  const lines = source.split(/\r?\n/);
  let inRunBlock = false;
  for (const line of lines) {
    if (!inRunBlock) {
      if (/^#\s*Run\s*:\s*$/i.test(line)) {
        inRunBlock = true;
      }
      continue;
    }

    if (/^#\s{2,}/.test(line)) {
      runLines.push(line.replace(/^#\s+/, '').trim());
      continue;
    }

    if (/^#\s*$/.test(line)) {
      continue;
    }

    break;
  }

  return {
    status,
    runCommand: runLines.join(' ').trim() || null
  };
}

function categoryFor(relativeFile) {
  const normalized = relativeFile.replace(/\\/g, '/');
  if (normalized.startsWith('examples/tour/language/')) return 'language';
  if (normalized.startsWith('examples/tour/signals/')) return 'signals';
  if (normalized.startsWith('examples/tour/events/')) return 'events';
  if (normalized.startsWith('examples/tour/scenesync/')) return 'scenesync';
  if (normalized.startsWith('examples/tour/live/')) return 'live';
  return 'unknown';
}

function isSafeExplicitRun(command) {
  if (!command) return false;
  const lowered = command.toLowerCase();
  if (BLOCKED_RUN_TOKENS.some((token) => lowered.includes(token))) {
    return false;
  }
  return lowered.startsWith('loomlet run ') || lowered.includes(' --dry-run');
}

function buildSafeCommand(sample) {
  const { category, runCommand, relativeFile } = sample;

  if (isSafeExplicitRun(runCommand)) {
    const args = runCommand.split(/\s+/).slice(1);
    return [process.execPath, [cliPath, ...args]];
  }

  if (category === 'language' || category === 'signals' || category === 'events') {
    return [process.execPath, [cliPath, 'run', relativeFile]];
  }

  if (category === 'scenesync' || category === 'live') {
    // Object-scoped behaviors omit objectId, so compile them at scene scope.
    return [process.execPath, [cliPath, 'scenesync', 'graph-compile', relativeFile, '--scene']];
  }

  return null;
}

function discoverRunnableSamples() {
  const files = walkLoomFiles(tourRoot);
  return files
    .map((absFile) => {
      const source = fs.readFileSync(absFile, 'utf8');
      const relativeFile = path.relative(projectRoot, absFile).replace(/\\/g, '/');
      const { status, runCommand } = extractMetadata(source);
      return {
        absFile,
        relativeFile,
        status,
        runCommand,
        category: categoryFor(relativeFile)
      };
    })
    .filter((sample) => sample.status === 'runnable');
}

test('runnable tour samples execute through a CI-safe path', () => {
  const runnableSamples = discoverRunnableSamples();
  assert.ok(runnableSamples.length > 0, 'Expected at least one runnable tour sample');

  for (const sample of runnableSamples) {
    const command = buildSafeCommand(sample);
    assert.ok(command, `No CI-safe command available for runnable sample: ${sample.relativeFile}`);

    const [exec, args] = command;
    const result = spawnSync(exec, args, {
      cwd: projectRoot,
      encoding: 'utf8'
    });

    if (result.status !== 0) {
      const rendered = `${exec} ${args.join(' ')}`;
      assert.fail(`Runnable tour sample failed:\n${sample.relativeFile}\n\nCommand:\n${rendered}\n\nError:\n${result.stderr || result.stdout}`);
    }
  }
});
