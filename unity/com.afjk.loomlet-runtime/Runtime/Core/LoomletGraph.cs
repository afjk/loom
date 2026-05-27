using System.Collections.Generic;

namespace Loomlet.Runtime
{
    public sealed class LoomletGraph
    {
        public List<LoomletNode> Nodes { get; set; } = new List<LoomletNode>();
        public List<LoomletEdge> Edges { get; set; } = new List<LoomletEdge>();

        public static LoomletGraph FromJson(string json)
        {
            var parsed = LoomletJson.Parse(json) as Dictionary<string, object>;
            if (parsed == null)
                throw new LoomletException("INVALID_GRAPH", "Graph JSON must be an object.");

            return FromDictionary(parsed);
        }

        public static LoomletGraph FromDictionary(Dictionary<string, object> obj)
        {
            if (!obj.TryGetValue("nodes", out var nodesRaw) || !(nodesRaw is List<object> nodes))
                throw new LoomletException("INVALID_GRAPH", "Graph JSON must contain a nodes array.");
            if (!obj.TryGetValue("edges", out var edgesRaw) || !(edgesRaw is List<object> edges))
                throw new LoomletException("INVALID_GRAPH", "Graph JSON must contain an edges array.");

            var graph = new LoomletGraph();
            foreach (var rawNode in nodes)
            {
                var nodeObj = rawNode as Dictionary<string, object>;
                if (nodeObj == null)
                    throw new LoomletException("INVALID_GRAPH", "Each graph node must be an object.");

                var node = new LoomletNode
                {
                    Id = nodeObj.TryGetValue("id", out var id) ? id?.ToString() : null,
                    Type = nodeObj.TryGetValue("type", out var type) ? type?.ToString() : null,
                    Params = nodeObj.TryGetValue("params", out var p) && p is Dictionary<string, object> pd
                        ? pd
                        : new Dictionary<string, object>()
                };
                graph.Nodes.Add(node);
            }

            foreach (var rawEdge in edges)
            {
                var edgeObj = rawEdge as Dictionary<string, object>;
                if (edgeObj == null)
                    throw new LoomletException("INVALID_GRAPH", "Each graph edge must be an object.");

                graph.Edges.Add(new LoomletEdge
                {
                    From = edgeObj.TryGetValue("from", out var from) ? from?.ToString() : null,
                    To = edgeObj.TryGetValue("to", out var to) ? to?.ToString() : null
                });
            }

            return graph;
        }
    }

    public sealed class LoomletNode
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public Dictionary<string, object> Params { get; set; } = new Dictionary<string, object>();
    }

    public sealed class LoomletEdge
    {
        public string From { get; set; }
        public string To { get; set; }
    }
}
