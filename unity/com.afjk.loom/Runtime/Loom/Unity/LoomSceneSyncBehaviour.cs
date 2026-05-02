#if UNITY_2019_1_OR_NEWER
using UnityEngine;

namespace Afjk.Loom
{
    /// <summary>
    /// A Unity MonoBehaviour that drives a LoomSceneSyncAdapter.
    ///
    /// Usage:
    ///   1. Attach this component to a GameObject in your scene.
    ///   2. Call HandleJsonMessage(json) whenever a scene-graph-* message arrives
    ///      (e.g. from a WebSocket).
    ///   3. The adapter evaluates the graph every frame via Update().
    ///
    /// Example scene-graph-set message:
    /// <code>
    /// {
    ///   "type": "scene-graph-set",
    ///   "scope": "scene",
    ///   "graph": {
    ///     "nodes": [
    ///       { "id": "clock", "type": "serverClock" },
    ///       { "id": "wave",  "type": "sine", "params": { "freq": 1, "amplitude": 2 } },
    ///       { "id": "move",  "type": "sceneSetPosition", "params": { "target": "Cube" } }
    ///     ],
    ///     "edges": [
    ///       { "from": "clock.t", "to": "wave.t" },
    ///       { "from": "wave.out", "to": "move.x" }
    ///     ]
    ///   }
    /// }
    /// </code>
    /// </summary>
    public sealed class LoomSceneSyncBehaviour : MonoBehaviour
    {
        private LoomSceneSyncAdapter _adapter;

        private void Awake()
        {
            _adapter = new LoomSceneSyncAdapter(
                send: _ => true,
                getServerTime: () => (double)Time.time,
                targetResolver: new LoomUnityTargetResolver()
            );
        }

        private void OnDestroy()
        {
            _adapter?.Dispose();
            _adapter = null;
        }

        /// <summary>
        /// Handle a JSON-encoded SceneSync message. Call this from your
        /// WebSocket receive handler or other message source.
        /// </summary>
        public void HandleJsonMessage(string json)
        {
            if (_adapter == null) return;
            var msg = SceneGraphMessage.FromJson(json);
            _adapter.HandleMessage(msg);
        }

        private void Update()
        {
            _adapter?.Update((double)Time.time);
        }
    }
}
#endif
