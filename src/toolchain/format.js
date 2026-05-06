import { parseDSLToAST, formatDSL } from '../loom-dsl.js';
import { normalizeLoomError } from './errors.js';

export function formatLoomSource(source, options = {}) {
  try {
    const { ast, errors } = parseDSLToAST(source);
    if (errors.length > 0 || !ast) {
      return {
        ok: false,
        formatted: null,
        ast: ast || null,
        errors: errors.map(normalizeLoomError)
      };
    }

    return {
      ok: true,
      formatted: formatDSL(ast, options.formatOptions || {}),
      ast,
      errors: []
    };
  } catch (error) {
    return {
      ok: false,
      formatted: null,
      ast: null,
      errors: [normalizeLoomError(error)]
    };
  }
}
