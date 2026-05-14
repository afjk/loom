export function normalizeGraph(graph) {
  if (!graph) return null;

  const nodes = (graph.nodes ?? [])
    .map((node) => {
      const normalized = {
        id: node.id,
        type: node.type
      };
      if (node.params !== undefined && node.params !== null) {
        normalized.params = node.params;
      }
      return normalized;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const edges = (graph.edges ?? [])
    .map((edge) => ({
      from: edge.from,
      to: edge.to
    }))
    .sort((a, b) => {
      const aKey = `${a.from}->${a.to}`;
      const bKey = `${b.from}->${b.to}`;
      return aKey.localeCompare(bKey);
    });

  const normalized = {
    nodes,
    edges
  };

  if (graph.imports !== undefined && graph.imports !== null && graph.imports.length > 0) {
    normalized.imports = graph.imports;
  }

  if (graph.render !== undefined && graph.render !== null) {
    normalized.render = graph.render;
  }

  return normalized;
}

export function findNode(graph, nodeId) {
  return (graph.nodes ?? []).find((n) => n.id === nodeId);
}
