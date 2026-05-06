#if UNITY_2019_1_OR_NEWER
using System.Collections.Generic;
using UnityEngine;
#endif

namespace Afjk.Loom
{
    /// <summary>
    /// Default Unity target resolver.
    ///
    /// Targets can be registered explicitly via <see cref="RegisterTarget"/> so that
    /// inactive GameObjects (e.g. hidden by <c>sceneSetVisible</c>) are still resolvable.
    /// Explicitly registered targets take priority over the fallback scene search.
    ///
    /// On a cache miss the resolver uses <c>Resources.FindObjectsOfTypeAll</c> to
    /// search all loaded objects including inactive ones, then caches the result.
    ///
    /// <para>
    /// <b>Name uniqueness:</b> Unity does not enforce unique GameObject names.
    /// When multiple objects share the same name this resolver will cache and
    /// return the first one found.  For scenes that require unique targeting,
    /// prefer explicit <see cref="RegisterTarget"/> calls or implement
    /// <see cref="ILoomTargetResolver"/> with your own ID scheme.
    /// </para>
    /// </summary>
    public sealed class LoomUnityTargetResolver : ILoomTargetResolver
    {
#if UNITY_2019_1_OR_NEWER
        // Explicitly registered targets (take priority over fallback search).
        private readonly Dictionary<string, GameObject> _registered =
            new Dictionary<string, GameObject>();

        // Auto-populated cache for targets resolved via fallback scene search.
        private readonly Dictionary<string, GameObject> _cache =
            new Dictionary<string, GameObject>();

        /// <summary>
        /// Explicitly register a <see cref="GameObject"/> for a given <paramref name="targetId"/>.
        /// Registered targets take priority over the fallback scene search and are
        /// resolvable even when the object is inactive.
        /// </summary>
        public void RegisterTarget(string targetId, GameObject target)
        {
            _registered[targetId] = target;
            // Also update the cache so any in-flight resolve benefits immediately.
            _cache[targetId] = target;
        }

        /// <summary>
        /// Remove the explicitly registered target for <paramref name="targetId"/>.
        /// The fallback scene search will be used on the next <see cref="ResolveTarget"/> call.
        /// </summary>
        public void UnregisterTarget(string targetId)
        {
            _registered.Remove(targetId);
            _cache.Remove(targetId);
        }

        /// <summary>
        /// Clear all registered and cached targets.
        /// </summary>
        public void ClearCache()
        {
            _registered.Clear();
            _cache.Clear();
        }

        /// <summary>
        /// Resolve a target by id.
        /// Priority: explicit registration → auto cache → fallback scene search.
        /// Returns <c>null</c> if not found.
        /// </summary>
        public object ResolveTarget(string targetId)
        {
            // 1. Explicitly registered targets take priority and work even when inactive.
            if (_registered.TryGetValue(targetId, out var reg) && reg != null)
                return reg;

            // 2. Validate any previously auto-cached reference (objects can be destroyed).
            if (_cache.TryGetValue(targetId, out var cached) && cached != null)
                return cached;

            // 3. Fallback: search all loaded objects including inactive ones.
            //    This path runs at most once per unique targetId (result is cached).
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
        public void RegisterTarget(string targetId, object target) { }
        public void UnregisterTarget(string targetId) { }
        public void ClearCache() { }
        public object ResolveTarget(string targetId) => null;
#endif
    }
}
