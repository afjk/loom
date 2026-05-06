import { RUNTIME_TARGETS } from './runtime-targets.js';
import { compileLoomSource, getCompatibleTargetsForImports } from './compile.js';

function summarizeGraph(graph) {
  const imports = Array.isArray(graph.imports) ? graph.imports : [];
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    renderType: graph.render?.type || 'none',
    nodes: graph.nodes.map((node) => ({ id: node.id, type: node.type })),
    imports,
    requiredCapabilities: [...imports],
    compatibleTargets: imports.length > 0
      ? getCompatibleTargetsForImports(imports)
      : RUNTIME_TARGETS.filter((target) => target !== 'any')
  };
}

export function inspectLoomGraph(graph, options = {}) {
  return {
    ok: true,
    ast: options.ast || null,
    graph,
    summary: summarizeGraph(graph),
    errors: []
  };
}

export function inspectLoomSource(source, options = {}) {
  const compiled = compileLoomSource(source, options);
  if (!compiled.ok || !compiled.graph) {
    return {
      ok: false,
      ast: compiled.ast,
      graph: null,
      summary: null,
      errors: compiled.errors
    };
  }

  return inspectLoomGraph(compiled.graph, { ast: compiled.ast });
}

export function formatInspectionSummary(summary) {
  const importLines = summary.imports.length > 0
    ? summary.imports.map((entry) => `- ${entry}`)
    : ['Imports: none'];
  const compatibleTargetLines = summary.compatibleTargets.length > 0
    ? summary.compatibleTargets.map((entry) => `- ${entry}`)
    : ['- none'];
  const lines = [
    `Nodes: ${summary.nodeCount}`,
    `Edges: ${summary.edgeCount}`,
    `Render: ${summary.renderType}`,
    '',
    summary.imports.length > 0 ? 'Imports:' : importLines[0],
    ...(summary.imports.length > 0 ? importLines : []),
    '',
    'Compatible targets:',
    ...compatibleTargetLines,
    '',
    'Node list:'
  ];

  for (const node of summary.nodes) {
    lines.push(`- ${node.id}: ${node.type}`);
  }

  return lines.join('\n');
}
