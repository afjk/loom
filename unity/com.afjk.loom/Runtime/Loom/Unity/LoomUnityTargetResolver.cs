#if UNITY_2019_1_OR_NEWER
using System.Collections.Generic;
using UnityEngine;
#endif

namespace Afjk.Loom
{
    /// <summary>
    /// Default Unity target resolver.
    ///
    /// Caches resolved GameObjects on first lookup so that per-frame evaluation of
    /// sceneSet* sink nodes does not repeat the full scene search every frame.
    ///
    /// On a cache miss (or after the cached reference is destroyed) the resolver
    /// uses <c>Resources.FindObjectsOfTypeAll</c> to search all loaded objects
    /// including inactive ones, which allows <c>sceneSetVisible</c> to toggle
    /// objects back on after hiding them.
    ///
    /// <para>
    /// <b>Name uniqueness:</b> Unity does not enforce unique GameObject names.
    /// When multiple objects share the same name this resolver will cache and
    /// return the first one found.  For scenes that require unique targeting,
    /// implement <see cref="ILoomTargetResolver"/> with your own ID scheme
    /// (e.g., object tags, instance IDs, or a registry component).
    /// </para>
    /// </summary>
    public sealed class LoomUnityTargetResolver : ILoomTargetResolver
    {
#if UNITY_2019_1_OR_NEWER
        private readonly Dictionary<string, GameObject> _cache =
            new Dictionary<string, GameObject>();

        /// <summary>
        /// Resolve a target by name.
        /// Returns the cached instance when available and not yet destroyed.
        /// Falls back to a full scene search (including inactive objects) on
        /// cache miss, then caches the result for future frames.
        /// </summary>
        public object ResolveTarget(string targetId)
        {
            // Validate any previously cached reference (Unity destroys objects at runtime).
            if (_cache.TryGetValue(targetId, out var cached) && cached != null)
                return cached;

            // Search all loaded objects including inactive ones so that objects hidden
            // via sceneSetVisible can still be found and made visible again.
            // This path runs only once per unique targetId (result is then cached).
            foreach (var go in Resources.FindObjectsOfTypeAll<GameObject>())
            {
                // Skip assets and prefabs (objects not placed in any open scene).
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
