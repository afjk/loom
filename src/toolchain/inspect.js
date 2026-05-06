import { compileLoomSource } from './compile.js';

function summarizeGraph(graph) {
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    renderType: graph.render?.type || 'none',
    nodes: graph.nodes.map((node) => ({ id: node.id, type: node.type })),
    imports: [],
    requiredCapabilities: [],
    compatibleTargets: []
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
  const lines = [
    `Nodes: ${summary.nodeCount}`,
    `Edges: ${summary.edgeCount}`,
    `Render: ${summary.renderType}`,
    '',
    'Node list:'
  ];

  for (const node of summary.nodes) {
    lines.push(`- ${node.id}: ${node.type}`);
  }

  return lines.join('\n');
}
