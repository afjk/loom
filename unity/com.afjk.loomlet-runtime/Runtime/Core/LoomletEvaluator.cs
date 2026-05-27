using System.Collections.Generic;

namespace Loomlet.Runtime
{
    public sealed class LoomletEvaluator
    {
        private readonly LoomletGraph _graph;
        private readonly LoomletFunctionRegistry _registry;
        private readonly List<LoomletNode> _sortedNodes;
        private readonly Dictionary<string, object> _values = new Dictionary<string, object>();

        public LoomletEvaluator(LoomletGraph graph, LoomletFunctionRegistry registry = null)
        {
            _graph = graph ?? throw new System.ArgumentNullException(nameof(graph));
            _registry = registry ?? LoomletFunctionRegistry.CreateDefault();
            ValidateGraph();
            _sortedNodes = TopologicalSort();
        }

        public LoomletEvaluationResult Evaluate(LoomletEvaluationContext context = null)
        {
            context = context ?? new LoomletEvaluationContext();
            _values.Clear();

            foreach (var node in _sortedNodes)
            {
                var def = GetDefinition(node.Type);
                var inputs = ResolveInputs(node, def);
                var outputs = def.Evaluate(inputs, context) ?? new Dictionary<string, object>();
                foreach (var pair in outputs)
                    _values[node.Id + "." + pair.Key] = pair.Value;
            }

            return new LoomletEvaluationResult(_values);
        }

        public object GetValue(string reference)
        {
            return _values.TryGetValue(reference, out var value) ? value : null;
        }

        private Dictionary<string, object> ResolveInputs(LoomletNode node, LoomletNodeDefinition def)
        {
            var inputs = new Dictionary<string, object>();
            foreach (var inputName in def.Inputs)
            {
                var edge = FindEdgeTo(node.Id + "." + inputName);
                if (edge != null && _values.TryGetValue(edge.From, out var value))
                    inputs[inputName] = value;
                else if (node.Params != null && node.Params.TryGetValue(inputName, out var param))
                    inputs[inputName] = param;
                else
                    inputs[inputName] = null;
            }
            return inputs;
        }

        private LoomletEdge FindEdgeTo(string to)
        {
            foreach (var edge in _graph.Edges)
                if (edge.To == to) return edge;
            return null;
        }

        private void ValidateGraph()
        {
            var ids = new HashSet<string>();
            foreach (var node in _graph.Nodes)
            {
                if (string.IsNullOrEmpty(node.Id)) throw new LoomletException("INVALID_GRAPH", "Node id is required.");
                if (string.IsNullOrEmpty(node.Type)) throw new LoomletException("INVALID_GRAPH", "Node type is required.");
                if (!ids.Add(node.Id)) throw new LoomletException("INVALID_GRAPH", "Duplicate node id: " + node.Id);
                GetDefinition(node.Type);
            }

            foreach (var edge in _graph.Edges)
            {
                if (string.IsNullOrEmpty(edge.From) || string.IsNullOrEmpty(edge.To))
                    throw new LoomletException("INVALID_GRAPH", "Edge from/to references are required.");
            }
        }

        private LoomletNodeDefinition GetDefinition(string type)
        {
            if (!_registry.TryGet(type, out var def))
                throw new LoomletException("UNSUPPORTED_NODE", "Unsupported Loomlet node type: " + type);
            return def;
        }

        private List<LoomletNode> TopologicalSort()
        {
            var byId = new Dictionary<string, LoomletNode>();
            var indegree = new Dictionary<string, int>();
            var outgoing = new Dictionary<string, List<string>>();
            foreach (var node in _graph.Nodes)
            {
                byId[node.Id] = node;
                indegree[node.Id] = 0;
                outgoing[node.Id] = new List<string>();
            }

            foreach (var edge in _graph.Edges)
            {
                var fromId = SplitReference(edge.From);
                var toId = SplitReference(edge.To);
                if (!byId.ContainsKey(fromId) || !byId.ContainsKey(toId))
                    throw new LoomletException("INVALID_GRAPH", "Edge references an unknown node.");
                outgoing[fromId].Add(toId);
                indegree[toId]++;
            }

            var queue = new Queue<string>();
            foreach (var pair in indegree)
                if (pair.Value == 0) queue.Enqueue(pair.Key);

            var sorted = new List<LoomletNode>();
            while (queue.Count > 0)
            {
                var id = queue.Dequeue();
                sorted.Add(byId[id]);
                foreach (var next in outgoing[id])
                {
                    indegree[next]--;
                    if (indegree[next] == 0) queue.Enqueue(next);
                }
            }

            if (sorted.Count != _graph.Nodes.Count)
                throw new LoomletException("CYCLE_DETECTED", "Graph contains a cycle.");
            return sorted;
        }

        private static string SplitReference(string reference)
        {
            var dot = reference == null ? -1 : reference.IndexOf('.');
            if (dot <= 0) throw new LoomletException("INVALID_GRAPH", "Port reference must be node.port.");
            return reference.Substring(0, dot);
        }
    }
}
