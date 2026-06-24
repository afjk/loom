import { graphToCanonicalDSL } from './canonical-dsl.js';
import { parseDSLToAST, compileToGraph } from './loom-dsl.js';
import { NODE_TYPES } from './loom.js';

export function patchDslSourceForEditorOperation(source, operation, graph) {
  const text = String(source ?? '');
  const parsed = parseDSLToAST(text);
  if (parsed.errors.length || !parsed.ast) {
    return fail('SOURCE_PARSE_ERROR');
  }

  const ast = parsed.ast;
  const result = patchAstSource(text, ast, operation);
  if (!result.ok) return result;

  const validation = validatePatchedSource(result.source, graph);
  if (!validation.ok) return validation;

  return {
    ok: true,
    source: result.source,
    strategy: result.strategy
  };
}

export function patchOrCanonicalDslSource(source, operation, graph) {
  const patched = patchDslSourceForEditorOperation(source, operation, graph);
  if (patched.ok) return patched;

  return {
    ok: true,
    source: graphToCanonicalDSL(graph),
    strategy: 'canonical',
    fallbackReason: patched.reason
  };
}

function patchAstSource(source, ast, operation) {
  if (!operation || !operation.type) return fail('MISSING_OPERATION');

  if (operation.type === 'updateParam') {
    return patchUpdateParam(source, ast, operation);
  }

  if (operation.type === 'renameNode') {
    return patchRenameNode(source, ast, operation);
  }

  if (operation.type === 'addEdge') {
    return patchAddEdge(source, ast, operation);
  }

  if (operation.type === 'removeEdge') {
    return patchRemoveEdge(source, ast, operation);
  }

  if (operation.type === 'addNode') {
    return patchAddNode(source, operation);
  }

  if (operation.type === 'removeNode') {
    return patchRemoveNode(source, ast, operation);
  }

  if (operation.type === 'removeNodes') {
    return patchRemoveNodes(source, ast, operation);
  }

  return fail('UNSUPPORTED_OPERATION');
}

function patchUpdateParam(source, ast, operation) {
  const stmt = findAssignment(ast, operation.id);
  const call = getDirectCall(stmt);
  if (!call) return fail('UNSUPPORTED_NODE_EXPRESSION');

  const edit = makeArgValueEditOrInsert(source, call, operation.key, operation.value);
  if (!edit) return fail('ARG_PATCH_FAILED');

  return ok(applyTextEdits(source, [edit]), 'source-patch');
}

function patchRenameNode(source, ast, operation) {
  const oldId = operation.id;
  const newId = String(operation.newId ?? '').trim();
  if (!oldId || !newId || oldId === newId) return fail('INVALID_RENAME');

  const edits = [];
  walkAst(ast, (node, parent, ancestors) => {
    if (node.type !== 'Identifier' || node.name !== oldId) return;
    if (isFunctionLocalIdentifier(oldId, ancestors)) return;
    if (parent?.type === 'CallExpression' && parent.callee === node) return;
    if (parent?.type === 'NamedArg' && parent.name === node) return;
    if (parent?.type === 'ObjectEntry' && parent.key === node) return;
    if (parent?.type === 'FunctionDefinition' && parent.name === node) return;
    if (parent?.type === 'FunctionDefinition' && parent.params?.includes(node)) return;
    if (parent?.type === 'FunctionLiteral' && parent.params?.includes(node)) return;
    edits.push(replaceSpan(node.span, newId));
  });

  if (!edits.length) return fail('RENAME_TARGET_NOT_FOUND');
  return ok(applyTextEdits(source, dedupeEdits(edits)), 'source-patch');
}

function isFunctionLocalIdentifier(name, ancestors) {
  return ancestors.some((ancestor) =>
    (ancestor.type === 'FunctionDefinition' || ancestor.type === 'FunctionLiteral') &&
    ancestor.params?.some((param) => param.name === name)
  );
}

function patchAddEdge(source, ast, operation) {
  const edge = operation.edge;
  if (!edge) return fail('MISSING_EDGE');

  const stmt = findAssignment(ast, edge.toNodeId);
  const call = getDirectCall(stmt);
  if (!call) return fail('UNSUPPORTED_EDGE_TARGET');

  const edit = makeArgValueEditOrInsert(source, call, edge.toPort, identifierRef(edge.fromNodeId));
  if (!edit) return fail('EDGE_ARG_PATCH_FAILED');

  return ok(applyTextEdits(source, [edit]), 'source-patch');
}

function patchRemoveEdge(source, ast, operation) {
  const parsed = parseEdgeId(operation.edgeId);
  if (!parsed) return fail('INVALID_EDGE_ID');

  const stmt = findAssignment(ast, parsed.toNodeId);
  const call = getDirectCall(stmt);
  if (!call) return fail('UNSUPPORTED_EDGE_TARGET');

  const arg = findNamedArg(call, parsed.toPort);
  if (!arg) return fail('EDGE_ARG_NOT_FOUND');

  const edit = makeRemoveArgEdit(source, call, arg);
  if (!edit) return fail('REMOVE_ARG_FAILED');

  return ok(applyTextEdits(source, [edit]), 'source-patch');
}

function patchAddNode(source, operation) {
  const node = operation.node;
  if (!node?.id || !node?.type) return fail('INVALID_NODE');
  const line = `${node.id} = ${formatCallForNode(node)}`;
  const prefix = source.endsWith('\n') || source.length === 0 ? '' : '\n';
  return ok(`${source}${prefix}${line}\n`, 'source-patch');
}

function patchRemoveNode(source, ast, operation) {
  const stmt = findAssignment(ast, operation.id);
  if (!stmt) return fail('REMOVE_TARGET_NOT_FOUND');

  const range = lineRangeForSpan(source, stmt.span);
  return ok(`${source.slice(0, range.start)}${source.slice(range.end)}`, 'source-patch');
}

function patchRemoveNodes(source, ast, operation) {
  const ids = operation.ids || [];
  if (!ids.length) return fail('MISSING_REMOVE_IDS');

  let currentSource = source;
  let currentAst = ast;

  for (const id of ids) {
    const result = patchRemoveNode(currentSource, currentAst, { id });
    if (!result.ok) return result;

    currentSource = result.source;
    const parsed = parseDSLToAST(currentSource);
    if (parsed.errors.length || !parsed.ast) return fail('PATCHED_SOURCE_PARSE_ERROR');
    currentAst = parsed.ast;
  }

  return ok(currentSource, 'source-patch');
}

function validatePatchedSource(source, expectedGraph) {
  const parsed = parseDSLToAST(source);
  if (parsed.errors.length || !parsed.ast) return fail('PATCHED_SOURCE_PARSE_ERROR');

  const compiled = compileToGraph(parsed.ast);
  if (compiled.errors.length) return fail('PATCHED_SOURCE_COMPILE_ERROR');

  if (expectedGraph && !sameSemanticGraph(compiled.graph, expectedGraph)) {
    return fail('PATCHED_SOURCE_GRAPH_MISMATCH');
  }

  return { ok: true };
}

function sameSemanticGraph(a, b) {
  return JSON.stringify(normalizeGraph(a)) === JSON.stringify(normalizeGraph(b));
}

function normalizeGraph(graph) {
  return {
    imports: graph.imports || [],
    nodes: (graph.nodes || [])
      .map((node) => ({
        id: node.id,
        type: node.type,
        params: normalizeValue(node.params || {})
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    edges: (graph.edges || [])
      .map((edge) => ({ from: edge.from, to: edge.to }))
      .sort((a, b) => `${a.from}->${a.to}`.localeCompare(`${b.from}->${b.to}`)),
    render: normalizeValue(graph.render || null),
    subgraphs: normalizeValue(graph.subgraphs || null)
  };
}

function normalizeValue(value) {
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (key === 'meta') continue;
      out[key] = normalizeValue(value[key]);
    }
    return out;
  }
  return value;
}

function findAssignment(ast, id) {
  return (ast.body || []).find((stmt) =>
    stmt.type === 'AssignmentStatement' &&
    stmt.target?.name === id
  );
}

function getDirectCall(stmt) {
  if (!stmt || stmt.type !== 'AssignmentStatement') return null;
  return stmt.value?.type === 'CallExpression' ? stmt.value : null;
}

function findNamedArg(call, name) {
  return (call.args || []).find((arg) =>
    arg.type === 'NamedArg' &&
    arg.name?.name === name
  );
}

function makeArgValueEditOrInsert(source, call, name, value) {
  const existing = findNamedArg(call, name);
  const formattedValue = formatValue(value);

  if (existing) {
    return replaceSpan(existing.value.span, formattedValue);
  }

  const closeParen = source.indexOf(')', call.span.end.offset - 1);
  if (closeParen < 0) return null;

  const args = call.args || [];
  if (args.length === 0) {
    return { start: closeParen, end: closeParen, text: `${name}: ${formattedValue}` };
  }

  const lastArg = args[args.length - 1];
  return { start: lastArg.span.end.offset, end: lastArg.span.end.offset, text: `, ${name}: ${formattedValue}` };
}

function makeRemoveArgEdit(source, call, arg) {
  const args = call.args || [];
  const index = args.indexOf(arg);
  if (index < 0) return null;

  if (args.length === 1) {
    return { start: arg.span.start.offset, end: arg.span.end.offset, text: '' };
  }

  if (index < args.length - 1) {
    const next = args[index + 1];
    return { start: arg.span.start.offset, end: next.span.start.offset, text: '' };
  }

  const previous = args[index - 1];
  return { start: previous.span.end.offset, end: arg.span.end.offset, text: '' };
}

function parseEdgeId(edgeId) {
  if (typeof edgeId !== 'string') return null;
  const match = edgeId.match(/^([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)->([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)$/);
  if (!match) return null;
  return {
    fromNodeId: match[1],
    fromPort: match[2],
    toNodeId: match[3],
    toPort: match[4]
  };
}

function lineRangeForSpan(source, span) {
  let start = span.start.offset;
  while (start > 0 && source[start - 1] !== '\n') start--;

  let end = span.end.offset;
  while (end < source.length && source[end] !== '\n') end++;
  if (end < source.length && source[end] === '\n') end++;

  return { start, end };
}

function formatCallForNode(node) {
  const nodeType = NODE_TYPES[node.type];
  const args = [];
  const params = node.params || {};
  const paramNames = new Set((nodeType?.params || []).map((param) => param.name || param));
  const inputNames = new Set((nodeType?.inputs || []).map((input) => input.name || input));

  for (const [key, value] of Object.entries(params)) {
    if (paramNames.has(key) || inputNames.has(key)) {
      args.push(`${key}: ${formatValue(value)}`);
    }
  }

  return `${node.type}(${args.join(', ')})`;
}

function identifierRef(id) {
  return { __loomletIdentifier: id };
}

function formatValue(value) {
  if (value && typeof value === 'object' && value.__loomletIdentifier) {
    return value.__loomletIdentifier;
  }

  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  return JSON.stringify(value);
}

function walkAst(node, visit, parent = null, ancestors = []) {
  if (!node || typeof node !== 'object') return;
  visit(node, parent, ancestors);
  const childAncestors = [...ancestors, node];
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) walkAst(child, visit, node, childAncestors);
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      walkAst(value, visit, node, childAncestors);
    }
  }
}

function replaceSpan(span, text) {
  return {
    start: span.start.offset,
    end: span.end.offset,
    text
  };
}

function dedupeEdits(edits) {
  const seen = new Set();
  const result = [];
  for (const edit of edits) {
    const key = `${edit.start}:${edit.end}:${edit.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(edit);
  }
  return result;
}

function applyTextEdits(source, edits) {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce((text, edit) => `${text.slice(0, edit.start)}${edit.text}${text.slice(edit.end)}`, source);
}

function ok(source, strategy) {
  return { ok: true, source, strategy };
}

function fail(reason) {
  return { ok: false, reason };
}
