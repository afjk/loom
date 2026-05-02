#if UNITY_2019_1_OR_NEWER
using UnityEngine;
#endif

namespace Afjk.Loom
{
    /// <summary>
    /// Default Unity target resolver that uses GameObject.Find(name) to locate objects.
    /// </summary>
    public sealed class LoomUnityTargetResolver : ILoomTargetResolver
    {
        /// <summary>
        /// Finds a GameObject by name using UnityEngine.GameObject.Find.
        /// Returns null if the target is not found or not running in Unity.
        /// </summary>
        public object ResolveTarget(string targetId)
        {
#if UNITY_2019_1_OR_NEWER
            return GameObject.Find(targetId);
#else
            return null;
#endif
        }
    }
}
