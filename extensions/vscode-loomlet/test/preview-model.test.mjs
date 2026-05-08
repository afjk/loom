import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ensurePreviewModulesLoaded, buildPreviewModelFromDsl } = require('../src/preview-model.js');

await ensurePreviewModulesLoaded();

// Test 1: Valid DSL returns editorModel with no errors
{
  const result = buildPreviewModelFromDsl('x = 1');
  assert.equal(result.errors.length, 0, 'Valid DSL should produce no errors');
  assert.ok(result.editorModel, 'Valid DSL should produce an editorModel');
  assert.ok(result.editorModel.nodesById, 'editorModel should have nodesById');
  assert.ok(result.editorModel.edgesById, 'editorModel should have edgesById');
  assert.ok(Array.isArray(result.editorModel.order), 'editorModel should have order array');
}

// Test 2: Invalid DSL (parse error) returns errors with no editorModel
{
  const result = buildPreviewModelFromDsl('x = math.sine(t, frequency:');
  assert.ok(result.errors.length > 0, 'Invalid syntax should produce errors');
  assert.equal(result.editorModel, null, 'Parse error should produce null editorModel');
  assert.ok(result.errors[0].message, 'Errors should have message field');
}

// Test 3: Undefined identifier (compile error) returns errors
{
  const result = buildPreviewModelFromDsl('a = 1\nb = add(a, undefined_var)');
  assert.ok(result.errors.length > 0, 'Undefined identifier should produce errors');
  assert.equal(result.editorModel, null, 'Compile error should produce null editorModel');
}

// Test 4: Empty string returns null editorModel with no errors
{
  const result = buildPreviewModelFromDsl('');
  assert.equal(result.errors.length, 0, 'Empty DSL should produce no errors');
  assert.equal(result.editorModel, null, 'Empty DSL should produce null editorModel');
}

// Test 5: Whitespace-only returns null editorModel with no errors
{
  const result = buildPreviewModelFromDsl('   \n\t\n  ');
  assert.equal(result.errors.length, 0, 'Whitespace-only DSL should produce no errors');
  assert.equal(result.editorModel, null, 'Whitespace-only DSL should produce null editorModel');
}

// Test 6: DSL with metadata comment is parsed correctly (metadata stripped)
{
  const dslWithMetadata = `x = 1

# @loomlet.editor {"version":1,"layout":{"nodes":{}}}`;
  const result = buildPreviewModelFromDsl(dslWithMetadata);
  assert.equal(result.errors.length, 0, 'DSL with metadata should produce no errors');
  assert.ok(result.editorModel, 'DSL with metadata should produce an editorModel');
}

// Test 7: preserveEditorModelLayout is applied when previousEditorModel provided
{
  const first = buildPreviewModelFromDsl('x = 1');
  assert.ok(first.editorModel, 'First parse should succeed');

  // Manually set a position on a node in the first model
  const nodeIds = first.editorModel.order;
  if (nodeIds.length > 0) {
    const nodeId = nodeIds[0];
    first.editorModel.nodesById[nodeId].position = { x: 999, y: 888 };
  }

  const second = buildPreviewModelFromDsl('x = 1', first.editorModel);
  assert.ok(second.editorModel, 'Second parse with previousModel should succeed');
  assert.equal(second.errors.length, 0, 'No errors expected');

  // The position should be preserved from previous model
  if (nodeIds.length > 0) {
    const nodeId = nodeIds[0];
    const pos = second.editorModel.nodesById[nodeId]?.position;
    assert.equal(pos?.x, 999, 'X position should be preserved from previous model');
    assert.equal(pos?.y, 888, 'Y position should be preserved from previous model');
  }
}

// Test 8: Invalid DSL with metadata comment still reports DSL error
{
  const invalidWithMetadata = `x = math.sine(t, frequency:

# @loomlet.editor {"version":1,"layout":{"nodes":{}}}`;
  const result = buildPreviewModelFromDsl(invalidWithMetadata);
  assert.ok(result.errors.length > 0, 'Invalid DSL with metadata should still report error');
  assert.equal(result.editorModel, null, 'Invalid DSL with metadata should produce null editorModel');
}

// Test 9: Multi-node DSL produces multiple nodes in editorModel
{
  const multiNode = 'a = 1\nb = add(a, a)';
  const result = buildPreviewModelFromDsl(multiNode);
  assert.equal(result.errors.length, 0, 'Multi-node DSL should have no errors');
  assert.ok(result.editorModel, 'Multi-node DSL should produce editorModel');
  assert.ok(result.editorModel.order.length >= 1, 'Should have at least one node');
}

// Test 10: null input treated as empty
{
  const result = buildPreviewModelFromDsl(null);
  assert.equal(result.errors.length, 0, 'null input should produce no errors');
  assert.equal(result.editorModel, null, 'null input should produce null editorModel');
}

console.log('All preview-model tests passed!');
