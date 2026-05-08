import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  ensurePreviewModulesLoaded,
  buildPreviewModelFromDsl
} = require('../extensions/vscode-loomlet/src/preview-model.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const examplesRoot = path.join(projectRoot, 'examples', 'vscode');

function walkLoomFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkLoomFiles(nextPath));
    } else if (entry.isFile() && entry.name.endsWith('.loom')) {
      files.push(nextPath);
    }
  }
  return files;
}

test('VS Code runtime preview examples compile to visible render outputs', async () => {
  await ensurePreviewModulesLoaded();

  const files = walkLoomFiles(examplesRoot);
  assert.ok(files.length > 0, 'Expected VS Code examples to exist');

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const relativeFile = path.relative(projectRoot, file).replace(/\\/g, '/');

    const { graph, errors } = buildPreviewModelFromDsl(source);
    assert.deepEqual(errors, [], `${relativeFile} preview model errors`);

    assert.ok(graph?.render, `${relativeFile} should define graph.render`);
    assert.ok(
      graph.render.type === 'bar' || graph.render.type === 'point' || graph.render.type === 'keys',
      `${relativeFile} render type should be bar, point, or keys, got ${graph.render.type}`
    );
  }
});
