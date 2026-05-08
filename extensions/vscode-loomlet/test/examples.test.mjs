import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { VSCODE_EXAMPLES } = require('../src/examples.js');
const { ensurePreviewModulesLoaded, buildPreviewModelFromDsl } = require('../src/preview-model.js');

await ensurePreviewModulesLoaded();

assert.ok(Array.isArray(VSCODE_EXAMPLES), 'VSCODE_EXAMPLES should be an array');
assert.ok(VSCODE_EXAMPLES.length > 0, 'Expected at least one insertable example');

for (const example of VSCODE_EXAMPLES) {
  assert.ok(example.id, 'Example should have an id');
  assert.ok(example.label, `${example.id} should have a label`);
  assert.ok(example.source, `${example.id} should have source`);

  const result = buildPreviewModelFromDsl(example.source);
  assert.equal(result.errors.length, 0, `${example.id} should parse and compile without errors`);
  assert.ok(result.graph, `${example.id} should produce a graph`);
  assert.ok(
    result.graph.render || result.graph.nodes.some((node) => String(node.type).startsWith('console.')),
    `${example.id} should produce a visible render or console output`
  );
}

console.log('All insertable example tests passed!');
