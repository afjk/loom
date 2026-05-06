import { parseDSLToAST, compileToGraph } from '../loom-dsl.js';
import { normalizeLoomError } from './errors.js';

export function compileLoomSource(source, options = {}) {
  let ast = null;

  try {
    const parsed = parseDSLToAST(source);
    ast = parsed.ast;

    if (parsed.errors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: parsed.errors.map(normalizeLoomError)
      };
    }

    const compiled = compileToGraph(ast);
    if (compiled.errors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: compiled.errors.map(normalizeLoomError)
      };
    }

    return {
      ok: true,
      ast,
      graph: compiled.graph,
      errors: []
    };
  } catch (error) {
    return {
      ok: false,
      ast,
      graph: null,
      errors: [normalizeLoomError(error)]
    };
  }
}
