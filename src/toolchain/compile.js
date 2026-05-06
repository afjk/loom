import { parseDSLToAST, compileToGraph } from '../loom-dsl.js';
import { normalizeLoomError } from './errors.js';

export function compileLoomSource(source, options = {}) {
  const { ast, errors: parseErrors } = parseDSLToAST(source);
  if (parseErrors.length > 0) {
    return {
      ok: false,
      ast,
      graph: null,
      errors: parseErrors.map(normalizeLoomError)
    };
  }

  const { graph, errors: compileErrors } = compileToGraph(ast);
  if (compileErrors.length > 0) {
    return {
      ok: false,
      ast,
      graph: null,
      errors: compileErrors.map(normalizeLoomError)
    };
  }

  return {
    ok: true,
    ast,
    graph,
    errors: []
  };
}
