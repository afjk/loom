function getSpanLocation(error) {
  if (typeof error?.line === 'number' || typeof error?.column === 'number') {
    return {
      line: typeof error.line === 'number' ? error.line : null,
      column: typeof error.column === 'number' ? error.column : null
    };
  }

  const start = error?.span?.start;
  if (start && (typeof start.line === 'number' || typeof start.column === 'number')) {
    return {
      line: typeof start.line === 'number' ? start.line : null,
      column: typeof start.column === 'number' ? start.column : null
    };
  }

  return { line: null, column: null };
}

function inferErrorSource(error) {
  if (typeof error?.source === 'string' && ['parse', 'compile', 'runtime', 'unknown'].includes(error.source)) {
    return error.source;
  }
  const type = error?.type;
  const name = error?.name;

  if (type === 'ParseError' || name === 'LoomDSLError') {
    return 'parse';
  }
  if (type === 'CompileError') {
    return 'compile';
  }
  if (name === 'LoomError' || error?.source === 'runtime') {
    return 'runtime';
  }
  return 'unknown';
}

export function normalizeLoomError(error) {
  const location = getSpanLocation(error);
  return {
    code: error?.code || 'UNKNOWN_ERROR',
    message: error?.message || 'Unknown Loom error',
    line: location.line,
    column: location.column,
    source: inferErrorSource(error)
  };
}

export function formatLoomError(error) {
  const normalized = normalizeLoomError(error);
  if (typeof normalized.line === 'number' && typeof normalized.column === 'number') {
    return `${normalized.code} at ${normalized.line}:${normalized.column} - ${normalized.message}`;
  }
  return `${normalized.code} - ${normalized.message}`;
}
