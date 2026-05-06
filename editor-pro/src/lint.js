import { linter } from '@codemirror/lint';
import { parseDSL, LoomDSLError } from '../../src/loom-dsl.js';

export const dslLint = linter(view => {
  const diagnostics = [];
  const text = view.state.doc.toString();
  if (!text.trim()) return diagnostics;

  try {
    parseDSL(text);
  } catch (e) {
    if (e instanceof LoomDSLError || (e.line && e.column)) {
      const lineNum = Math.max(1, Math.min(e.line || 1, view.state.doc.lines));
      const line = view.state.doc.line(lineNum);
      const from = line.from + Math.max(0, (e.column || 1) - 1);
      const to = Math.min(from + 1, line.to);
      diagnostics.push({
        from,
        to,
        severity: 'error',
        message: `${e.code || 'ERROR'}: ${e.message}`
      });
    }
  }

  return diagnostics;
});

export const jsonLint = linter(view => {
  const diagnostics = [];
  const text = view.state.doc.toString();
  if (!text.trim()) return diagnostics;

  try {
    JSON.parse(text);
  } catch (e) {
    diagnostics.push({
      from: 0,
      to: text.length,
      severity: 'error',
      message: e.message
    });
  }

  return diagnostics;
});
