using System.Collections.Generic;
using NUnit.Framework;

#if UNITY_2019_1_OR_NEWER
using UnityEngine;
#endif

namespace Afjk.Loom.Tests
{
    /// <summary>
    /// Tests for LoomUnityTargetResolver — registration, unregistration, cache clearing,
    /// and resolution of inactive GameObjects.
    ///
    /// Tests that create real GameObjects require Unity and are wrapped in
    /// #if UNITY_2019_1_OR_NEWER.  The API-existence smoke tests run without Unity.
    /// </summary>
    [TestFixture]
    public class LoomUnityTargetResolverTests
    {
        // -------------------------------------------------------------------------
        // API smoke tests (pure C# — no Unity required)
        // -------------------------------------------------------------------------

        [Test]
        public void ApiSmoke_RegisterUnregisterClear_DoNotThrow()
        {
            var resolver = new LoomUnityTargetResolver();
            // Verify the three new methods exist and do not throw on the non-Unity stub.
#if !UNITY_2019_1_OR_NEWER
            Assert.DoesNotThrow(() => resolver.RegisterTarget("obj", null));
            Assert.DoesNotThrow(() => resolver.UnregisterTarget("obj"));
            Assert.DoesNotThrow(() => resolver.ClearCache());
            Assert.IsNull(resolver.ResolveTarget("obj"));
#else
            // In Unity context we do a quick round-trip without a real GameObject.
            Assert.DoesNotThrow(() => resolver.RegisterTarget("obj", null));
            Assert.DoesNotThrow(() => resolver.UnregisterTarget("obj"));
            Assert.DoesNotThrow(() => resolver.ClearCache());
#endif
        }

#if UNITY_2019_1_OR_NEWER

        // -------------------------------------------------------------------------
        // RegisterTarget — inactive GameObject can be resolved
        // -------------------------------------------------------------------------

        [Test]
        public void RegisterTarget_InactiveGameObject_IsResolved()
        {
            var go = new GameObject("InactiveTarget");
            go.SetActive(false); // inactive — would be missed by GameObject.Find()
            try
            {
                var resolver = new LoomUnityTargetResolver();
                resolver.RegisterTarget("InactiveTarget", go);

                var result = resolver.ResolveTarget("InactiveTarget");
                Assert.AreSame(go, result, "Explicitly registered inactive object must be resolvable");
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        // -------------------------------------------------------------------------
        // RegisterTarget — takes priority over fallback scene search
        // -------------------------------------------------------------------------

        [Test]
        public void RegisterTarget_TakesPriorityOverFallback()
        {
            var go1 = new GameObject("PriorityTarget");
            var go2 = new GameObject("PriorityTarget"); // same name, different instance
            try
            {
                var resolver = new LoomUnityTargetResolver();
                // Explicitly register go1 — must win over any fallback that might find go2.
                resolver.RegisterTarget("PriorityTarget", go1);

                var result = resolver.ResolveTarget("PriorityTarget");
                Assert.AreSame(go1, result, "Explicitly registered target must be returned, not the fallback result");
            }
            finally
            {
                GameObject.DestroyImmediate(go1);
                GameObject.DestroyImmediate(go2);
            }
        }

        // -------------------------------------------------------------------------
        // UnregisterTarget — removes registered target
        // -------------------------------------------------------------------------

        [Test]
        public void UnregisterTarget_RemovesRegisteredTarget()
        {
            var go = new GameObject("RegisteredThenRemoved");
            go.SetActive(false); // inactive so fallback search won't find it either
            try
            {
                var resolver = new LoomUnityTargetResolver();
                resolver.RegisterTarget("RegisteredThenRemoved", go);

                // Sanity: resolvable before unregister
                Assert.IsNotNull(resolver.ResolveTarget("RegisteredThenRemoved"));

                resolver.UnregisterTarget("RegisteredThenRemoved");

                // After unregister, inactive object must not be found (fallback skips inactive scene objects
                // found via Resources only — but here the object is not in a scene if just created in test).
                // The registered entry must be gone.
                var result = resolver.ResolveTarget("RegisteredThenRemoved");
                Assert.IsNull(result, "After UnregisterTarget, explicitly registered target must no longer be returned");
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        // -------------------------------------------------------------------------
        // ClearCache — removes all registered/cached targets
        // -------------------------------------------------------------------------

        [Test]
        public void ClearCache_ClearsAllRegisteredTargets()
        {
            var go1 = new GameObject("CachedA");
            var go2 = new GameObject("CachedB");
            go1.SetActive(false);
            go2.SetActive(false);
            try
            {
                var resolver = new LoomUnityTargetResolver();
                resolver.RegisterTarget("CachedA", go1);
                resolver.RegisterTarget("CachedB", go2);

                resolver.ClearCache();

                Assert.IsNull(resolver.ResolveTarget("CachedA"),
                    "ClearCache must remove all registered entries");
                Assert.IsNull(resolver.ResolveTarget("CachedB"),
                    "ClearCache must remove all registered entries");
            }
            finally
            {
                GameObject.DestroyImmediate(go1);
                GameObject.DestroyImmediate(go2);
            }
        }

        // -------------------------------------------------------------------------
        // sceneSetVisible integration: registered target can be made visible again
        // after being hidden.
        // -------------------------------------------------------------------------

        [Test]
        public void RegisteredTarget_CanBeResolvedAfterSetActiveFalse()
        {
            var go = new GameObject("VisibilityTarget");
            try
            {
                var resolver = new LoomUnityTargetResolver();
                resolver.RegisterTarget("VisibilityTarget", go);

                // Simulate sceneSetVisible(false)
                go.SetActive(false);

                // The resolver must still find the object because it was explicitly registered.
                var result = resolver.ResolveTarget("VisibilityTarget") as GameObject;
                Assert.IsNotNull(result, "Registered target must still be resolvable after SetActive(false)");

                // And we can set it active again via the resolver — simulates sceneSetVisible(true)
                result.SetActive(true);
                Assert.IsTrue(go.activeSelf, "Object must be re-activatable after being found by the resolver");
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

#endif // UNITY_2019_1_OR_NEWER
    }
}
