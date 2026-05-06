using System;
using System.Collections.Generic;

namespace Afjk.Loom
{
    /// <summary>
    /// The Loom C# dataflow engine.
    /// Evaluates a JSON graph each frame by calling EvaluateAt(time).
    /// Equivalent to the JavaScript Loom class in loom.js.
    /// </summary>
    public sealed class LoomEngine
    {
        // -------------------------------------------------------------------------
        // Static node type registry
        // -------------------------------------------------------------------------

        private static readonly Dictionary<string, LoomNodeTypeDef> _nodeTypes =
            new Dictionary<string, LoomNodeTypeDef>();

        static LoomEngine()
        {
            CoreNodes.Register(_nodeTypes);
            EventNodes.Register(_nodeTypes);
        }

        /// <summary>Register a custom node type. Idempotent: overwrites existing definition.</summary>
        public static void RegisterNodeType(string name, LoomNodeTypeDef def)
        {
            if (name == null) throw new ArgumentNullException(nameof(name));
            if (def == null) throw new ArgumentNullException(nameof(def));
            _nodeTypes[name] = def;
        }

        /// <summary>Internal: access to the node type registry (for SceneSync node registration).</summary>
        internal static Dictionary<string, LoomNodeTypeDef> NodeTypes => _nodeTypes;

        // -------------------------------------------------------------------------
        // Instance state
        // -------------------------------------------------------------------------

        private LoomGraph _currentGraph;
        private LoomGraph _pendingGraph;
        private List<string> _currentSortedIds;
        private List<string> _pendingSortedIds;
        private readonly Dictionary<string, object> _values = new Dictionary<string, object>();
        private readonly List<(string reference, object payload)> _eventQueue =
            new List<(string, object)>();

        // Pointer position state: updated via SetPointerPosition(), read by pointerPosition nodes.
        private double _pointerX;
        private double _pointerY;

        // -------------------------------------------------------------------------
        // Constructor
        // -------------------------------------------------------------------------

        /// <summary>
        /// Create a new engine. If a graph is provided it is loaded immediately.
        /// Pass an empty graph (<c>new LoomGraph()</c>) to start with no nodes.
        /// </summary>
        public LoomEngine(LoomGraph graph = null)
        {
            if (graph != null)
                LoadInternal(graph);
        }

        // -------------------------------------------------------------------------
        // Public API
        // -------------------------------------------------------------------------

        /// <summary>
        /// Schedule a graph for loading. The graph is validated immediately (throws on error).
        /// The switch to the new graph takes effect at the next EvaluateAt() call.
        /// </summary>
        public void Load(LoomGraph graph)
        {
            if (graph == null) throw new ArgumentNullException(nameof(graph));
            ValidateGraph(graph);
            _pendingGraph = graph;
            _pendingSortedIds = TopologicalSort(graph);
        }

        /// <summary>
        /// Evaluate the current graph at the given time.
        /// Steps:
        /// 1. Switch to pending graph if available.
        /// 2. Reset all event-port values to empty.
        /// 3. Flush the event queue into the values map.
        /// 4. Evaluate nodes in topological order.
        /// </summary>
        public void EvaluateAt(double time)
        {
            // Step 1: switch to pending graph
            if (_pendingGraph != null)
            {
                _currentGraph = _pendingGraph;
                _currentSortedIds = _pendingSortedIds;
                _pendingGraph = null;
                _pendingSortedIds = null;
            }

            if (_currentGraph == null) return;

            var ctx = new LoomEvalContext { Time = time, Engine = this };

            // Step 2: reset all event-port values to empty list
            foreach (var node in _currentGraph.Nodes)
            {
                var nodeType = GetNodeTypeSafe(node.Type);
                if (nodeType == null) continue;
                foreach (var output in nodeType.Outputs)
                {
                    if (output.Kind == "event")
                        _values[$"{node.Id}.{output.Name}"] = new List<object>();
                }
            }

            // Step 3: flush event queue
            foreach (var (reference, payload) in _eventQueue)
            {
                if (_values.TryGetValue(reference, out var existing) &&
                    existing is List<object> list)
                {
                    list.Add(payload);
                }
                else
                {
                    _values[reference] = new List<object> { payload };
                }
            }
            _eventQueue.Clear();

            // Step 4: evaluate nodes in topological order
            foreach (var nodeId in _currentSortedIds)
            {
                var node = FindNode(_currentGraph, nodeId);
                if (node == null) continue;

                var nodeType = GetNodeTypeSafe(node.Type);
                if (nodeType == null) continue;

                // Input nodes (event-only outputs) are populated via DispatchEvent; skip evaluation
                if (nodeType.Category == "input" &&
                    nodeType.Outputs.Count > 0 &&
                    nodeType.Outputs.TrueForAll(o => o.Kind == "event"))
                    continue;

                // Resolve input values
                var inputs = new Dictionary<string, object>();
                foreach (var inputDef in nodeType.Inputs)
                {
                    var portRef = $"{nodeId}.{inputDef.Name}";
                    var edge = FindEdgeTo(_currentGraph, portRef);

                    if (edge != null)
                    {
                        if (inputDef.Kind == "event")
                            inputs[inputDef.Name] = _values.TryGetValue(edge.From, out var ev)
                                ? LoomNodeHelpers.ToEventList(ev)
                                : new List<object>();
                        else
                            inputs[inputDef.Name] = _values.TryGetValue(edge.From, out var bv) ? bv : null;
                    }
                    else
                    {
                        // Fallback: node param, then port default
                        if (node.Params != null && node.Params.TryGetValue(inputDef.Name, out var pv))
                            inputs[inputDef.Name] = pv ?? inputDef.Default;
                        else
                            inputs[inputDef.Name] = inputDef.Default;
                    }
                }

                // Resolve static params
                var resolvedParams = new Dictionary<string, object>();
                foreach (var paramDef in nodeType.Params)
                {
                    if (node.Params != null && node.Params.TryGetValue(paramDef.Name, out var pv))
                        resolvedParams[paramDef.Name] = pv ?? paramDef.Default;
                    else
                        resolvedParams[paramDef.Name] = paramDef.Default;
                }

                // Evaluate
                Dictionary<string, object> outputs;
                try
                {
                    outputs = nodeType.Evaluate(inputs, resolvedParams, ctx);
                }
                catch (LoomException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    throw new LoomException("EXPRESSION_EVAL_ERROR",
                        $"Error evaluating node '{nodeId}': {ex.Message}");
                }

                // Store outputs
                if (outputs != null)
                {
                    foreach (var outputDef in nodeType.Outputs)
                    {
                        var portRef = $"{nodeId}.{outputDef.Name}";
                        if (outputs.TryGetValue(outputDef.Name, out var outVal))
                        {
                            _values[portRef] = outputDef.Kind == "event"
                                ? (object)LoomNodeHelpers.ToEventList(outVal)
                                : outVal;
                        }
                    }
                }
            }
        }

        /// <summary>Get the current output value of a port.</summary>
        public object GetValue(string nodeId, string portName)
        {
            if (_currentGraph == null)
                throw new LoomException("UNKNOWN_NODE", "No graph is loaded");

            var node = FindNode(_currentGraph, nodeId);
            if (node == null)
                throw new LoomException("UNKNOWN_NODE", $"Unknown node: '{nodeId}'");

            var nodeType = GetNodeType(node.Type);
            if (nodeType.Outputs.Find(o => o.Name == portName) == null)
                throw new LoomException("UNKNOWN_PORT", $"Unknown output port: '{nodeId}.{portName}'");

            return _values.TryGetValue($"{nodeId}.{portName}", out var val) ? val : null;
        }

        /// <summary>
        /// Update the pointer position that is exposed by <c>pointerPosition</c> nodes.
        /// Call this from your input system whenever the pointer moves.
        /// </summary>
        public void SetPointerPosition(double x, double y)
        {
            _pointerX = x;
            _pointerY = y;
        }

        /// <summary>Returns the current pointer position as a vec2 dictionary (for use by pointerPosition nodes).</summary>
        internal Dictionary<string, object> GetPointerPosition() =>
            new Dictionary<string, object> { ["x"] = _pointerX, ["y"] = _pointerY };

        /// <summary>
        /// Inject an event into an event-type output port. The event is queued and
        /// consumed at the next EvaluateAt() call.
        /// </summary>
        public void DispatchEvent(string reference, object payload = null)
        {
            if (reference == null) throw new ArgumentNullException(nameof(reference));

            var dotIdx = reference.IndexOf('.');
            if (dotIdx < 0 || dotIdx == reference.Length - 1)
                throw new LoomException("INVALID_GRAPH",
                    $"DispatchEvent reference must be 'nodeId.portName': '{reference}'");

            var nodeId = reference.Substring(0, dotIdx);
            var portName = reference.Substring(dotIdx + 1);

            if (_currentGraph == null)
                throw new LoomException("UNKNOWN_NODE", "No graph is loaded");

            var node = FindNode(_currentGraph, nodeId);
            if (node == null)
                throw new LoomException("UNKNOWN_NODE",
                    $"DispatchEvent references unknown node: '{nodeId}'");

            var nodeType = GetNodeType(node.Type);
            var port = nodeType.Outputs.Find(o => o.Name == portName);
            if (port == null)
                throw new LoomException("UNKNOWN_PORT",
                    $"DispatchEvent references unknown output port: '{reference}'");

            if (port.Kind != "event")
                throw new LoomException("TYPE_MISMATCH",
                    $"DispatchEvent target must be an event port: '{reference}'");

            _eventQueue.Add((reference, payload));
        }

        // -------------------------------------------------------------------------
        // Internal graph loading and validation
        // -------------------------------------------------------------------------

        private void LoadInternal(LoomGraph graph)
        {
            ValidateGraph(graph);
            _currentGraph = graph;
            _currentSortedIds = TopologicalSort(graph);
            _pendingGraph = null;
            _pendingSortedIds = null;
        }

        private LoomNodeTypeDef GetNodeType(string type)
        {
            if (!_nodeTypes.TryGetValue(type, out var def))
                throw new LoomException("UNKNOWN_NODE_TYPE", $"Unknown node type: '{type}'");
            return def;
        }

        private LoomNodeTypeDef GetNodeTypeSafe(string type)
        {
            _nodeTypes.TryGetValue(type, out var def);
            return def;
        }

        private static LoomGraphNode FindNode(LoomGraph graph, string nodeId)
        {
            foreach (var n in graph.Nodes)
                if (n.Id == nodeId) return n;
            return null;
        }

        private static LoomGraphEdge FindEdgeTo(LoomGraph graph, string portRef)
        {
            foreach (var e in graph.Edges)
                if (e.To == portRef) return e;
            return null;
        }

        // -------------------------------------------------------------------------
        // Graph validation
        // -------------------------------------------------------------------------

        private void ValidateGraph(LoomGraph graph)
        {
            if (graph.Nodes == null || graph.Edges == null)
                throw new LoomException("INVALID_GRAPH", "Graph must have 'nodes' and 'edges' lists");

            // Collect node IDs and check for duplicates
            var nodeIds = new HashSet<string>();
            foreach (var node in graph.Nodes)
            {
                if (string.IsNullOrEmpty(node.Id))
                    throw new LoomException("INVALID_GRAPH", "Node must have an 'id'");
                if (!nodeIds.Add(node.Id))
                    throw new LoomException("DUPLICATE_NODE_ID",
                        $"Duplicate node id: '{node.Id}'");
            }

            // Check node types
            foreach (var node in graph.Nodes)
            {
                if (!_nodeTypes.ContainsKey(node.Type))
                    throw new LoomException("UNKNOWN_NODE_TYPE",
                        $"Unknown node type: '{node.Type}' (node: '{node.Id}')");
            }

            // Validate edges
            var inputEdges = new HashSet<string>(); // detect duplicate inputs
            foreach (var edge in graph.Edges)
            {
                if (string.IsNullOrEmpty(edge.From) || string.IsNullOrEmpty(edge.To))
                    throw new LoomException("INVALID_GRAPH", "Edge must have 'from' and 'to'");

                var fromDot = edge.From.IndexOf('.');
                var toDot   = edge.To.IndexOf('.');
                if (fromDot <= 0 || toDot <= 0)
                    throw new LoomException("INVALID_GRAPH",
                        "Edge 'from'/'to' must be in 'nodeId.portName' format");

                var fromNodeId  = edge.From.Substring(0, fromDot);
                var fromPort    = edge.From.Substring(fromDot + 1);
                var toNodeId    = edge.To.Substring(0, toDot);
                var toPort      = edge.To.Substring(toDot + 1);

                if (!nodeIds.Contains(fromNodeId))
                    throw new LoomException("UNKNOWN_NODE",
                        $"Edge references unknown node: '{fromNodeId}'");
                if (!nodeIds.Contains(toNodeId))
                    throw new LoomException("UNKNOWN_NODE",
                        $"Edge references unknown node: '{toNodeId}'");

                var fromNodeType = GetNodeType(FindNode(graph, fromNodeId).Type);
                var fromPortDef  = fromNodeType.Outputs.Find(o => o.Name == fromPort);
                if (fromPortDef == null)
                    throw new LoomException("UNKNOWN_PORT",
                        $"Unknown output port: '{edge.From}'");

                var toNodeType = GetNodeType(FindNode(graph, toNodeId).Type);
                var toPortDef  = toNodeType.Inputs.Find(i => i.Name == toPort);
                if (toPortDef == null)
                    throw new LoomException("UNKNOWN_PORT",
                        $"Unknown input port: '{edge.To}'");

                // Kind check (behavior/event mismatch), except sample.value
                var isSampleValueException = FindNode(graph, toNodeId).Type == "sample" && toPort == "value";
                if (fromPortDef.Kind != toPortDef.Kind && !isSampleValueException)
                    throw new LoomException("TYPE_MISMATCH",
                        $"Cannot connect {fromPortDef.Kind} port '{edge.From}' to {toPortDef.Kind} port '{edge.To}'");

                // Duplicate input check
                if (!inputEdges.Add(edge.To))
                    throw new LoomException("DUPLICATE_INPUT_EDGE",
                        $"Multiple edges connected to input port: '{edge.To}'");
            }

            // Cycle detection via topological sort
            if (!TryTopologicalSort(graph, out _))
                throw new LoomException("CYCLE_DETECTED", "Graph contains a cycle");

            // Validate filter predicates
            foreach (var node in graph.Nodes)
            {
                if (node.Type == "filter")
                {
                    var predicate = "true";
                    if (node.Params != null && node.Params.TryGetValue("predicate", out var pv) && pv != null)
                        predicate = pv.ToString();
                    LoomExpressionDsl.Compile(predicate, node.Id); // throws EXPRESSION_PARSE_ERROR if invalid
                }
            }
        }

        // -------------------------------------------------------------------------
        // Topological sort (Kahn's algorithm)
        // -------------------------------------------------------------------------

        private List<string> TopologicalSort(LoomGraph graph)
        {
            TryTopologicalSort(graph, out var sorted);
            return sorted;
        }

        private static bool TryTopologicalSort(LoomGraph graph, out List<string> sorted)
        {
            var inDegree = new Dictionary<string, int>();
            var adj = new Dictionary<string, List<string>>();

            foreach (var node in graph.Nodes)
            {
                inDegree[node.Id] = 0;
                adj[node.Id] = new List<string>();
            }

            foreach (var edge in graph.Edges)
            {
                var fromNodeId = edge.From.Split('.')[0];
                var toNodeId   = edge.To.Split('.')[0];
                if (fromNodeId == toNodeId) continue; // self-loops (shouldn't occur)

                if (!adj.ContainsKey(fromNodeId)) { sorted = null; return false; }
                adj[fromNodeId].Add(toNodeId);
                if (!inDegree.ContainsKey(toNodeId)) { sorted = null; return false; }
                inDegree[toNodeId]++;
            }

            var queue = new Queue<string>();
            foreach (var kv in inDegree)
                if (kv.Value == 0) queue.Enqueue(kv.Key);

            sorted = new List<string>();
            while (queue.Count > 0)
            {
                var nodeId = queue.Dequeue();
                sorted.Add(nodeId);
                foreach (var neighbor in adj[nodeId])
                {
                    inDegree[neighbor]--;
                    if (inDegree[neighbor] == 0)
                        queue.Enqueue(neighbor);
                }
            }

            return sorted.Count == graph.Nodes.Count;
        }
    }
}
