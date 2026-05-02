#if UNITY_2019_1_OR_NEWER
using System.Collections.Generic;
using UnityEngine;
#endif

namespace Afjk.Loom
{
    /// <summary>
    /// Default Unity target resolver.
    /// Caches resolved GameObjects on first lookup so that per-frame evaluation of
    /// sceneSet* sink nodes does not call GameObject.Find() every frame.
    /// Uses Resources.FindObjectsOfTypeAll to locate objects even when they are
    /// inactive (so that sceneSetVisible can toggle them back on).
    /// </summary>
    public sealed class LoomUnityTargetResolver : ILoomTargetResolver
    {
#if UNITY_2019_1_OR_NEWER
        private readonly Dictionary<string, GameObject> _cache =
            new Dictionary<string, GameObject>();

        /// <summary>
        /// Resolve a target by name, returning the cached instance when available.
        /// Falls back to a full scene search (including inactive objects) on cache miss
        /// or when the cached instance has been destroyed.
        /// </summary>
        public object ResolveTarget(string targetId)
        {
            // Validate any previously cached reference (Unity destroys objects at runtime).
            if (_cache.TryGetValue(targetId, out var cached) && cached != null)
                return cached;

            // Search all scene objects including inactive ones so that objects hidden
            // via sceneSetVisible can still be found and made visible again.
            foreach (var go in Resources.FindObjectsOfTypeAll<GameObject>())
            {
                // Skip assets and prefabs (objects not in any open scene).
                if (!go.scene.IsValid()) continue;

                if (go.name == targetId)
                {
                    _cache[targetId] = go;
                    return go;
                }
            }

            return null;
        }
#else
        public object ResolveTarget(string targetId) => null;
#endif
    }
}
