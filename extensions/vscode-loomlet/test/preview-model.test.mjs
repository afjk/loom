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

// Test 11: render circle with literal args produces renderPreview item
{
  const result = buildPreviewModelFromDsl('render circle(x: 160, y: 120, r: 32, color: "#80ed99")');
  assert.equal(result.errors.length, 0, 'Valid render should produce no errors');
  assert.ok(result.renderPreview, 'Should have renderPreview');
  assert.equal(result.renderPreview.items.length, 1, 'Should have one render item');
  assert.equal(result.renderPreview.items[0].kind, 'circle', 'Item should be a circle');
  assert.equal(result.renderPreview.items[0].x, 160, 'Circle x should be 160');
  assert.equal(result.renderPreview.items[0].y, 120, 'Circle y should be 120');
  assert.equal(result.renderPreview.items[0].r, 32, 'Circle r should be 32');
  assert.equal(result.renderPreview.items[0].color, '#80ed99', 'Circle color should match');
}

// Test 12: render rect with literal args produces renderPreview item
{
  const result = buildPreviewModelFromDsl('render rect(x: 40, y: 180, width: 180, height: 48, color: "#70d6ff")');
  assert.equal(result.errors.length, 0, 'Valid render should produce no errors');
  assert.equal(result.renderPreview.items.length, 1, 'Should have one render item');
  assert.equal(result.renderPreview.items[0].kind, 'rect', 'Item should be a rect');
  assert.equal(result.renderPreview.items[0].x, 40, 'Rect x should be 40');
  assert.equal(result.renderPreview.items[0].width, 180, 'Rect width should be 180');
  assert.equal(result.renderPreview.items[0].height, 48, 'Rect height should be 48');
}

// Test 13: render bar with value clamps to 0-1
{
  const result1 = buildPreviewModelFromDsl('render bar(value: 1.5)');
  assert.equal(result1.renderPreview.items[0].value, 1, 'Value > 1 should be clamped to 1');

  const result2 = buildPreviewModelFromDsl('render bar(value: -0.5)');
  assert.equal(result2.renderPreview.items[0].value, 0, 'Value < 0 should be clamped to 0');

  const result3 = buildPreviewModelFromDsl('render bar(value: 0.7)');
  assert.equal(result3.renderPreview.items[0].value, 0.7, 'Value 0.7 should be 0.7');
}

// Test 14: render text extracts text string
{
  const result = buildPreviewModelFromDsl('render text(x: 40, y: 70, text: "Hello Loomlet", color: "#ffffff")');
  assert.equal(result.errors.length, 0, 'Valid render should produce no errors');
  assert.equal(result.renderPreview.items.length, 1, 'Should have one render item');
  assert.equal(result.renderPreview.items[0].kind, 'text', 'Item should be text');
  assert.equal(result.renderPreview.items[0].text, 'Hello Loomlet', 'Text should match');
  assert.equal(result.renderPreview.items[0].color, '#ffffff', 'Color should match');
}

// Test 15: render with identifier arg becomes unsupported
{
  const result = buildPreviewModelFromDsl('x = 160\nrender circle(x: x, y: 120, r: 32)');
  assert.equal(result.errors.length, 0, 'Valid DSL should produce no errors');
  assert.equal(result.renderPreview.items.length, 0, 'Circle with identifier x should not be in items');
  assert.equal(result.renderPreview.unsupported.length, 1, 'Should have one unsupported item');
  assert.equal(result.renderPreview.unsupported[0].kind, 'circle', 'Unsupported kind should be circle');
  assert.ok(result.renderPreview.unsupported[0].reason.includes('x'), 'Reason should mention x');
}

// Test 16: invalid DSL returns errors and no renderPreview items
{
  const result = buildPreviewModelFromDsl('invalid syntax here');
  assert.ok(result.errors.length > 0, 'Should have parse errors');
  assert.equal(result.renderPreview.items.length, 0, 'Should have no render items on error');
}

// Test 17: empty DSL returns empty renderPreview
{
  const result = buildPreviewModelFromDsl('');
  assert.equal(result.errors.length, 0, 'Empty DSL should have no errors');
  assert.equal(result.renderPreview.items.length, 0, 'Should have no render items');
  assert.equal(result.renderPreview.unsupported.length, 0, 'Should have no unsupported items');
}

// Test 18: multiple render statements produce multiple items
{
  const result = buildPreviewModelFromDsl(`
    render circle(x: 100, y: 100)
    render rect(x: 200, y: 200)
    render text(text: "hi")
  `);
  assert.equal(result.errors.length, 0, 'Valid DSL should have no errors');
  assert.equal(result.renderPreview.items.length, 3, 'Should have three render items');
  assert.equal(result.renderPreview.items[0].kind, 'circle', 'First item should be circle');
  assert.equal(result.renderPreview.items[1].kind, 'rect', 'Second item should be rect');
  assert.equal(result.renderPreview.items[2].kind, 'text', 'Third item should be text');
}

// Test 19: metadata comment付きDSLでも renderPreview が抽出できる
{
  const result = buildPreviewModelFromDsl(`
    render circle(x: 100, y: 100, r: 50)

    # @loomlet.editor {"version":1,"layout":{"nodes":{}}}
  `);
  assert.equal(result.errors.length, 0, 'Valid render with metadata should have no errors');
  assert.equal(result.renderPreview.items.length, 1, 'Should extract render item from DSL with metadata');
  assert.equal(result.renderPreview.items[0].kind, 'circle', 'Should be a circle');
}

// Test 20: render with partially literal args
{
  const result = buildPreviewModelFromDsl('x = 160\nrender circle(x: x, y: 120, r: 32, color: "#fff")');
  assert.equal(result.renderPreview.items.length, 0, 'Circle with one non-literal arg should not render');
  assert.equal(result.renderPreview.unsupported.length, 1, 'Should have one unsupported item');
}

console.log('All preview-model tests passed!');
