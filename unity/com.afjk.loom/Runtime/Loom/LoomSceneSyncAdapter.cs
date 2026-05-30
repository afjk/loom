using System;
using System.Collections.Generic;

namespace Afjk.Loom
{
    /// <summary>
    /// C# equivalent of the JavaScript LoomSceneSync adapter in loom-scenesync.js.
    ///
    /// Handles scene-graph-set / clear / patch / input messages and drives one
    /// scene-level LoomEngine plus per-object LoomEngine instances.
    ///
    /// Call Update(time) from MonoBehaviour.Update() or a game loop.
    /// </summary>
    public sealed class LoomSceneSyncAdapter : IDisposable
    {
        // -------------------------------------------------------------------------
        // Static adapter registry (SceneSync nodes look up adapters by ID)
        // -------------------------------------------------------------------------

        private static readonly Dictionary<string, LoomSceneSyncAdapter> _registry =
            new Dictionary<string, LoomSceneSyncAdapter>();

        private static int _nextId;
        private static bool _sceneSyncNodesRegistered;

        /// <summary>Look up a registered adapter by its ID string.</summary>
        public static LoomSceneSyncAdapter GetById(string id)
        {
            if (id == null) return null;
            return _registry.TryGetValue(id, out var adapter) ? adapter : null;
        }

        // -------------------------------------------------------------------------
        // Instance state
        // -------------------------------------------------------------------------

        private readonly string _id;
        private readonly Func<object, bool> _send;

        private LoomEngine _sceneEngine;
        private readonly Dictionary<string, LoomEngine> _objectEngines =
            new Dictionary<string, LoomEngine>();

        private bool _disposed;

        /// <summary>The target resolver used to locate Unity objects by name.</summary>
        public ILoomTargetResolver TargetResolver { get; }

        // -------------------------------------------------------------------------
        // Constructor
        // -------------------------------------------------------------------------

        /// <summary>
        /// Create a new SceneSync adapter.
        /// </summary>
        /// <param name="send">Callback for sending messages (may be a no-op).</param>
        /// <param name="targetResolver">Resolves target identifiers to Unity objects.</param>
        public LoomSceneSyncAdapter(
            Func<object, bool> send,
            ILoomTargetResolver targetResolver)
        {
            _id = $"adapter-{_nextId++}";
            _send = send ?? (_ => false);
            TargetResolver = targetResolver;

            _sceneEngine = CreateEmptyEngine();
            _registry[_id] = this;

            EnsureSceneSyncNodesRegistered();
        }

        // -------------------------------------------------------------------------
        // Public API
        // -------------------------------------------------------------------------

        /// <summary>
        /// Handle an incoming SceneSync message.
        /// Supported types: scene-graph-set, scene-graph-clear, scene-graph-patch, scene-graph-input.
        /// </summary>
        public void HandleMessage(SceneGraphMessage message)
        {
            if (message == null)
                throw new LoomException("INVALID_MESSAGE", "Message must not be null");

            switch (message.Type)
            {
                case "scene-graph-set":   HandleGraphSet(message);   break;
                case "scene-graph-clear": HandleGraphClear(message); break;
                case "scene-graph-patch": HandleGraphPatch(message); break;
                case "scene-graph-input": HandleGraphInput(message); break;
                default:
                    throw new LoomException("INVALID_MESSAGE",
                        $"Unknown message type: '{message.Type}'");
            }
        }

        /// <summary>
        /// Evaluate all active engines for the given time.
        /// Call this every frame (e.g. from MonoBehaviour.Update).
        /// </summary>
        public void Update(double time)
        {
            if (_disposed) return;
            _sceneEngine?.EvaluateAt(time);
            foreach (var engine in _objectEngines.Values)
                engine.EvaluateAt(time);
        }

        /// <summary>
        /// Start continuous evaluation (MonoBehaviour lifecycle).
        /// In the C# runtime, evaluation is driven by Update(time) calls, so this is
        /// provided for API parity with the JavaScript adapter.
        /// </summary>
        public void Start() { /* evaluation driven by Update() */ }

        /// <summary>Stop continuous evaluation.</summary>
        public void Stop() { /* evaluation driven by Update() */ }

        /// <summary>Remove this adapter from the global registry.</summary>
        public void Dispose()
        {
            if (_disposed) return;
            _disposed = true;
            _registry.Remove(_id);
            _sceneEngine = null;
            _objectEngines.Clear();
        }

        // -------------------------------------------------------------------------
        // Message handlers
        // -------------------------------------------------------------------------

        private void HandleGraphSet(SceneGraphMessage msg)
        {
            ValidateScope(msg);
            if (msg.Graph == null)
                throw new LoomException("INVALID_GRAPH", "scene-graph-set requires a 'graph' field");

            ApplyGraph(msg.Graph, msg.IsScopeScene, msg.ScopeObjectId);
        }

        private void HandleGraphClear(SceneGraphMessage msg)
        {
            ValidateScope(msg);
            if (msg.IsScopeScene)
            {
                _sceneEngine = CreateEmptyEngine();
            }
            else
            {
                _objectEngines.Remove(msg.ScopeObjectId);
            }
        }

        private void HandleGraphPatch(SceneGraphMessage msg)
        {
            ValidateScope(msg);
            if (msg.Graph != null)
            {
                // Phase 1: graph present → treat as set
                ApplyGraph(msg.Graph, msg.IsScopeScene, msg.ScopeObjectId);
            }
            else
            {
                throw new LoomException("INVALID_GRAPH",
                    "scene-graph-patch requires a 'graph' field in Phase 1");
            }
        }

        private void HandleGraphInput(SceneGraphMessage msg)
        {
            // Phase 1: no-op. Log and ignore.
            UnityLog("scene-graph-input is not yet supported (Phase 2).");
        }

        private void ApplyGraph(LoomGraph graph, bool isScopeScene, string scopeObjectId)
        {
            if (!isScopeScene && scopeObjectId == null)
                throw new LoomException("INVALID_SCOPE",
                    "scope must be 'scene' or { object: targetId }");
            var injected = InjectAdapterId(graph);
            if (isScopeScene)
                _sceneEngine = new LoomEngine(injected);
            else
                _objectEngines[scopeObjectId] = new LoomEngine(injected);
        }

        private static void ValidateScope(SceneGraphMessage msg)
        {
            if (!msg.IsScopeScene && msg.ScopeObjectId == null)
                throw new LoomException("INVALID_SCOPE",
                    "scope must be 'scene' or { object: targetId }");
        }

        // -------------------------------------------------------------------------
        // Helpers
        // -------------------------------------------------------------------------

        private LoomGraph InjectAdapterId(LoomGraph graph)
        {
            var injectedNodes = new List<LoomGraphNode>(graph.Nodes.Count);
            foreach (var node in graph.Nodes)
            {
                if (IsSceneSyncNode(node.Type))
                {
                    var newParams = new Dictionary<string, object>(
                        node.Params ?? new Dictionary<string, object>())
                    {
                        ["adapterId"] = _id
                    };
                    injectedNodes.Add(new LoomGraphNode
                    {
                        Id     = node.Id,
                        Type   = node.Type,
                        Params = newParams
                    });
                }
                else
                {
                    injectedNodes.Add(node);
                }
            }

            return new LoomGraph
            {
                Nodes = injectedNodes,
                Edges = graph.Edges
            };
        }

        private static bool IsSceneSyncNode(string type)
        {
            switch (type)
            {
                case "serverClock":
                case "sceneSetPosition":
                case "sceneSetRotation":
                case "sceneSetScale":
                case "sceneSetColor":
                case "sceneSetVisible":
                    return true;
                default:
                    return false;
            }
        }

        private static LoomEngine CreateEmptyEngine() =>
            new LoomEngine(new LoomGraph
            {
                Nodes = new List<LoomGraphNode>(),
                Edges = new List<LoomGraphEdge>()
            });

        private static void EnsureSceneSyncNodesRegistered()
        {
            if (_sceneSyncNodesRegistered) return;
            _sceneSyncNodesRegistered = true;
            SceneSyncNodes.Register(LoomEngine.NodeTypes);
        }

        private static void UnityLog(string message)
        {
#if UNITY_2019_1_OR_NEWER
            UnityEngine.Debug.LogWarning("[Loom] " + message);
#else
            System.Console.WriteLine("[Loom] " + message);
#endif
        }

    }
}
