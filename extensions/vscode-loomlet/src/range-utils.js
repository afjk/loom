function clampCoordinates(startLine, startColumn, endLine, endColumn, document) {
  const lineCount = Math.max(1, document.lineCount);

  const clampedStartLine = Math.max(0, Math.min(startLine, lineCount - 1));
  const startLineLength = document.lineAt(clampedStartLine).text.length;
  const clampedStartColumn = Math.max(0, Math.min(startColumn, startLineLength));

  const clampedEndLine = Math.max(clampedStartLine, Math.min(endLine, lineCount - 1));
  const endLineLength = document.lineAt(clampedEndLine).text.length;

  let clampedEndColumn = Math.max(0, Math.min(endColumn, endLineLength));

  if (clampedEndLine === clampedStartLine) {
    // For single-line ranges, ensure end column is at least start column + 1
    clampedEndColumn = Math.max(clampedStartColumn + 1, clampedEndColumn);
    clampedEndColumn = Math.min(clampedEndColumn, endLineLength);
  }

  return {
    startLine: clampedStartLine,
    startColumn: clampedStartColumn,
    endLine: clampedEndLine,
    endColumn: clampedEndColumn
  };
}

module.exports = { clampCoordinates };
