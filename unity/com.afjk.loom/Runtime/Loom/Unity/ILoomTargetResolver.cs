namespace Afjk.Loom
{
    /// <summary>
    /// Resolves a target identifier string to a Unity object.
    /// The returned object is cast to UnityEngine.GameObject in SceneSync sink nodes.
    /// Returns null if the target is not found.
    /// </summary>
    public interface ILoomTargetResolver
    {
        /// <summary>
        /// Resolve a target by its identifier (typically the GameObject name or path).
        /// Returns a UnityEngine.GameObject when running in Unity, or a mock object in tests.
        /// </summary>
        object ResolveTarget(string targetId);
    }
}
