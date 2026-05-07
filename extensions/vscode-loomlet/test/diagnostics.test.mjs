import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);
const { isLoomletDocument, normalizeLoomletErrorLocation, collectLoomletDiagnosticItems, ensureModulesLoaded } = require('../src/diagnostics.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure modules are loaded before running tests
await ensureModulesLoaded();

// Test 1: isLoomletDocument
{
  const mockDoc = { languageId: 'loomlet' };
  assert.ok(isLoomletDocument(mockDoc), 'Should identify loomlet documents by languageId');
}

{
  const mockDoc = { languageId: 'other', fileName: '/path/to/file.loom' };
  assert.ok(isLoomletDocument(mockDoc), 'Should identify .loom files by extension');
}

{
  const mockDoc = { languageId: 'javascript', fileName: '/path/to/file.js' };
  assert.ok(!isLoomletDocument(mockDoc), 'Should reject non-loomlet files');
}

{
  const mockDoc = null;
  assert.ok(!isLoomletDocument(mockDoc), 'Should handle null documents');
}

// Test 2: normalizeLoomletErrorLocation with span format
{
  const error = {
    message: 'Test error',
    code: 'TEST_ERROR',
    span: {
      start: { line: 2, column: 5 },
      end: { line: 2, column: 10 }
    }
  };
  const normalized = normalizeLoomletErrorLocation(error);
  assert.equal(normalized.startLine, 1, 'Should convert 1-based line to 0-based');
  assert.equal(normalized.startColumn, 4, 'Should convert 1-based column to 0-based');
  assert.equal(normalized.endLine, 1, 'Should convert end line');
  assert.equal(normalized.endColumn, 9, 'Should convert end column');
  assert.equal(normalized.message, 'Test error', 'Should preserve message');
  assert.equal(normalized.code, 'TEST_ERROR', 'Should preserve code');
}

// Test 3: normalizeLoomletErrorLocation with direct line/column
{
  const error = {
    message: 'Direct error',
    code: 'DIRECT_ERROR',
    line: 1,
    column: 1
  };
  const normalized = normalizeLoomletErrorLocation(error);
  assert.equal(normalized.startLine, 0, 'Should convert direct line');
  assert.equal(normalized.startColumn, 0, 'Should convert direct column');
}

// Test 4: normalizeLoomletErrorLocation with missing fields
{
  const error = {
    message: 'Minimal error'
  };
  const normalized = normalizeLoomletErrorLocation(error);
  assert.equal(normalized.startLine, 0, 'Should default to line 0');
  assert.equal(normalized.startColumn, 0, 'Should default to column 0');
  assert.equal(normalized.message, 'Minimal error', 'Should preserve message');
}

// Test 5: Valid DSL returns no diagnostics
{
  const validDsl = 'x = 1';
  const diagnostics = collectLoomletDiagnosticItems(validDsl);
  assert.equal(diagnostics.length, 0, 'Valid DSL should produce no diagnostics');
}

// Test 6: Invalid syntax returns at least one diagnostic
{
  const invalidDsl = 'x = math.sine(t, frequency:';
  const diagnostics = collectLoomletDiagnosticItems(invalidDsl);
  assert.ok(diagnostics.length > 0, 'Invalid syntax should produce diagnostics');
  assert.ok(diagnostics[0].message, 'Diagnostics should have message');
}

// Test 7: Undefined identifier produces compile error
{
  const invalidCompile = 'a = 1\nb = add(a, undefined_var)';
  const diagnostics = collectLoomletDiagnosticItems(invalidCompile);
  assert.ok(diagnostics.length > 0, 'Undefined identifier should produce diagnostics');
  assert.ok(diagnostics[0].message.includes('Undefined') || diagnostics[0].code === 'UNDEFINED_IDENTIFIER', 'Should indicate undefined variable');
}

// Test 8: Empty string returns no diagnostics
{
  const empty = '';
  const diagnostics = collectLoomletDiagnosticItems(empty);
  assert.equal(diagnostics.length, 0, 'Empty string should produce no diagnostics');
}

// Test 9: Whitespace only returns no diagnostics
{
  const whitespace = '   \n\t\n  ';
  const diagnostics = collectLoomletDiagnosticItems(whitespace);
  assert.equal(diagnostics.length, 0, 'Whitespace-only string should produce no diagnostics');
}

// Test 10: Valid DSL with metadata should strip metadata and return no diagnostics
{
  const validWithMetadata = `x = 1

# @loomlet.editor {"version":1,"layout":{"nodes":{}}}`;
  const diagnostics = collectLoomletDiagnosticItems(validWithMetadata);
  assert.equal(diagnostics.length, 0, 'Valid DSL with metadata should produce no diagnostics');
}

// Test 11: Invalid DSL with metadata should still report parse error, not metadata error
{
  const invalidWithMetadata = `x = math.sine(t, frequency:

# @loomlet.editor {"version":1,"layout":{"nodes":{}}}`;
  const diagnostics = collectLoomletDiagnosticItems(invalidWithMetadata);
  assert.ok(diagnostics.length > 0, 'Invalid DSL with metadata should still report error');
  // The error should be about the DSL, not the metadata
  assert.ok(diagnostics[0].type || diagnostics[0].code, 'Should have error type or code');
}

// Test range clamping for multi-line ranges
{
  const createMockDocument = (lines) => ({
    lineCount: lines.length,
    lineAt: (index) => ({ text: lines[index] || '' })
  });

  const { clampCoordinates } = require('../src/range-utils.js');

  // Test: Multi-line range with short end line
  {
    const doc = createMockDocument(['very long start line', 'short', 'end']);
    // Range from column 0 on line 0 to column 100 on line 1 (end line is only 5 chars)
    const clamped = clampCoordinates(0, 0, 1, 100, doc);
    assert.equal(clamped.startLine, 0, 'Start line should be 0');
    assert.equal(clamped.startColumn, 0, 'Start column should be 0');
    assert.equal(clamped.endLine, 1, 'End line should be 1');
    assert.equal(clamped.endColumn, 5, 'End column should be clamped to end line length (5)');
  }

  // Test: Single-line range ensures minimum width
  {
    const doc = createMockDocument(['hello world']);
    // Range from column 2 to column 2 (zero-width)
    const clamped = clampCoordinates(0, 2, 0, 2, doc);
    assert.equal(clamped.startLine, 0, 'Start line should be 0');
    assert.equal(clamped.startColumn, 2, 'Start column should be 2');
    assert.equal(clamped.endLine, 0, 'End line should be 0 (same line)');
    assert.equal(clamped.endColumn, 3, 'End column should be at least start + 1');
  }

  // Test: Single-line range at end of document
  {
    const doc = createMockDocument(['line']);
    // Range from column 0 to column 100 on same line (document only has 4 chars)
    const clamped = clampCoordinates(0, 0, 0, 100, doc);
    assert.equal(clamped.startLine, 0, 'Start line should be 0');
    assert.equal(clamped.startColumn, 0, 'Start column should be 0');
    assert.equal(clamped.endLine, 0, 'End line should be 0');
    assert.equal(clamped.endColumn, 4, 'End column should be clamped to line length (4)');
  }

  // Test: Multi-line range within document bounds
  {
    const doc = createMockDocument(['first', 'middle', 'last']);
    // Normal range from column 0 on line 0 to column 2 on line 2
    const clamped = clampCoordinates(0, 0, 2, 2, doc);
    assert.equal(clamped.startLine, 0, 'Start line should be 0');
    assert.equal(clamped.startColumn, 0, 'Start column should be 0');
    assert.equal(clamped.endLine, 2, 'End line should be 2');
    assert.equal(clamped.endColumn, 2, 'End column should be preserved');
  }

  // Test: Range exceeds document bounds
  {
    const doc = createMockDocument(['short']);
    // Range from column 0 on line 0 to column 10 on line 100
    const clamped = clampCoordinates(0, 0, 100, 10, doc);
    assert.equal(clamped.startLine, 0, 'Start line should be 0');
    assert.equal(clamped.endLine, 0, 'End line should be clamped to last line (0)');
  }
}

console.log('All diagnostics tests passed!');
