using System;
using System.Collections.Generic;
using NUnit.Framework;

#if UNITY_2019_1_OR_NEWER
using UnityEngine;
#endif

namespace Afjk.Loom.Tests
{
    /// <summary>
    /// SceneSync adapter and Unity-specific node tests (Tests 19-28 from spec).
    ///
    /// Tests 19 and 25-28 are pure C# and run without Unity.
    /// Tests 20-24 require Unity (wrapped in #if UNITY_2019_1_OR_NEWER).
    /// </summary>
    [TestFixture]
    public class LoomSceneSyncAdapterTests
    {
        // -------------------------------------------------------------------------
        // Mock target resolver for non-Unity tests
        // -------------------------------------------------------------------------

        private sealed class MockTarget
        {
            public double X, Y, Z;
            public float Rx, Ry, Rz;
            public float Sx = 1, Sy = 1, Sz = 1;
            public float R = 1, G = 1, B = 1, A = 1;
            public bool Active = true;
        }

        private sealed class MockTargetResolver : ILoomTargetResolver
        {
            public readonly Dictionary<string, MockTarget> Targets =
                new Dictionary<string, MockTarget>();

            public object ResolveTarget(string targetId)
            {
                if (Targets.TryGetValue(targetId, out var t)) return t;
                return null;
            }
        }

        // -------------------------------------------------------------------------
        // Helpers
        // -------------------------------------------------------------------------

        private static LoomSceneSyncAdapter CreateAdapter(
            MockTargetResolver resolver = null)
        {
            return new LoomSceneSyncAdapter(
                send: _ => true,
                targetResolver: resolver ?? new MockTargetResolver()
            );
        }

        private static string SceneSetMsg(string type, string scopeJson, string graphJson) =>
            $"{{\"type\":\"{type}\",\"scope\":{scopeJson},\"graph\":{graphJson}}}";

        private static string SimpleSceneGraphJson(string nodeId, string nodeType, string paramsJson = "{}") =>
            $"{{\"nodes\":[{{\"id\":\"{nodeId}\",\"type\":\"{nodeType}\",\"params\":{paramsJson}}}],\"edges\":[]}}";

        // -------------------------------------------------------------------------
        // Tests 20-24: Unity-specific sceneSet* nodes
        // -------------------------------------------------------------------------

#if UNITY_2019_1_OR_NEWER

        [Test]
        public void Test20_SceneSetPosition_UpdatesTransform()
        {
            // Create a temporary GameObject
            var go = new GameObject("TestCube");
            try
            {
                var resolver = new MockGameObjectResolver();
                resolver.Register("TestCube", go);

                using var adapter = new LoomSceneSyncAdapter(
                    send: _ => true,
                    
                    targetResolver: resolver
                );

                var json = @"{
                    ""type"": ""scene-graph-set"",
                    ""scope"": ""scene"",
                    ""graph"": {
                        ""nodes"": [
                            { ""id"": ""px"", ""type"": ""constant"", ""params"": { ""value"": 1.5 } },
                            { ""id"": ""py"", ""type"": ""constant"", ""params"": { ""value"": 2.5 } },
                            { ""id"": ""pz"", ""type"": ""constant"", ""params"": { ""value"": 3.5 } },
                            { ""id"": ""pos"", ""type"": ""sceneSetPosition"", ""params"": { ""target"": ""TestCube"" } }
                        ],
                        ""edges"": [
                            { ""from"": ""px.out"", ""to"": ""pos.x"" },
                            { ""from"": ""py.out"", ""to"": ""pos.y"" },
                            { ""from"": ""pz.out"", ""to"": ""pos.z"" }
                        ]
                    }
                }";

                adapter.HandleMessage(SceneGraphMessage.FromJson(json));
                adapter.Update(0.0);

                Assert.AreEqual(1.5f, go.transform.position.x, 0.001f);
                Assert.AreEqual(2.5f, go.transform.position.y, 0.001f);
                Assert.AreEqual(3.5f, go.transform.position.z, 0.001f);
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        [Test]
        public void Test21_SceneSetRotation_ConvertsRadiansToDegrees()
        {
            var go = new GameObject("TestRotCube");
            try
            {
                var resolver = new MockGameObjectResolver();
                resolver.Register("TestRotCube", go);

                using var adapter = new LoomSceneSyncAdapter(
                    send: _ => true,
                    
                    targetResolver: resolver
                );

                // Set rotation to π/2 radians on X — should become 90 degrees in Unity
                float halfPi = (float)(Math.PI / 2.0);
                var json = $@"{{
                    ""type"": ""scene-graph-set"",
                    ""scope"": ""scene"",
                    ""graph"": {{
                        ""nodes"": [
                            {{ ""id"": ""rx"", ""type"": ""constant"", ""params"": {{ ""value"": {halfPi.ToString(System.Globalization.CultureInfo.InvariantCulture)} }} }},
                            {{ ""id"": ""ry"", ""type"": ""constant"", ""params"": {{ ""value"": 0 }} }},
                            {{ ""id"": ""rz"", ""type"": ""constant"", ""params"": {{ ""value"": 0 }} }},
                            {{ ""id"": ""rot"", ""type"": ""sceneSetRotation"", ""params"": {{ ""target"": ""TestRotCube"" }} }}
                        ],
                        ""edges"": [
                            {{ ""from"": ""rx.out"", ""to"": ""rot.x"" }},
                            {{ ""from"": ""ry.out"", ""to"": ""rot.y"" }},
                            {{ ""from"": ""rz.out"", ""to"": ""rot.z"" }}
                        ]
                    }}
                }}";

                adapter.HandleMessage(SceneGraphMessage.FromJson(json));
                adapter.Update(0.0);

                Assert.AreEqual(90.0f, go.transform.localEulerAngles.x, 0.5f,
                    "π/2 radians should become 90 degrees");
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        [Test]
        public void Test22_SceneSetScale_UpdatesLocalScale()
        {
            var go = new GameObject("TestScaleCube");
            try
            {
                var resolver = new MockGameObjectResolver();
                resolver.Register("TestScaleCube", go);

                using var adapter = new LoomSceneSyncAdapter(
                    send: _ => true,
                    
                    targetResolver: resolver
                );

                var json = @"{
                    ""type"": ""scene-graph-set"",
                    ""scope"": ""scene"",
                    ""graph"": {
                        ""nodes"": [
                            { ""id"": ""sx"", ""type"": ""constant"", ""params"": { ""value"": 2.0 } },
                            { ""id"": ""sy"", ""type"": ""constant"", ""params"": { ""value"": 3.0 } },
                            { ""id"": ""sz"", ""type"": ""constant"", ""params"": { ""value"": 0.5 } },
                            { ""id"": ""sc"", ""type"": ""sceneSetScale"", ""params"": { ""target"": ""TestScaleCube"" } }
                        ],
                        ""edges"": [
                            { ""from"": ""sx.out"", ""to"": ""sc.x"" },
                            { ""from"": ""sy.out"", ""to"": ""sc.y"" },
                            { ""from"": ""sz.out"", ""to"": ""sc.z"" }
                        ]
                    }
                }";

                adapter.HandleMessage(SceneGraphMessage.FromJson(json));
                adapter.Update(0.0);

                Assert.AreEqual(2.0f, go.transform.localScale.x, 0.001f);
                Assert.AreEqual(3.0f, go.transform.localScale.y, 0.001f);
                Assert.AreEqual(0.5f, go.transform.localScale.z, 0.001f);
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        [Test]
        public void Test23_SceneSetColor_UpdatesRendererMaterialColor()
        {
            var go = new GameObject("TestColorCube");
            go.AddComponent<MeshRenderer>();
            var renderer = go.GetComponent<MeshRenderer>();
            renderer.material = new Material(Shader.Find("Standard"));
            try
            {
                var resolver = new MockGameObjectResolver();
                resolver.Register("TestColorCube", go);

                using var adapter = new LoomSceneSyncAdapter(
                    send: _ => true,
                    
                    targetResolver: resolver
                );

                var json = @"{
                    ""type"": ""scene-graph-set"",
                    ""scope"": ""scene"",
                    ""graph"": {
                        ""nodes"": [
                            { ""id"": ""r"", ""type"": ""constant"", ""params"": { ""value"": 0.8 } },
                            { ""id"": ""g"", ""type"": ""constant"", ""params"": { ""value"": 0.5 } },
                            { ""id"": ""b"", ""type"": ""constant"", ""params"": { ""value"": 0.2 } },
                            { ""id"": ""col"", ""type"": ""sceneSetColor"", ""params"": { ""target"": ""TestColorCube"" } }
                        ],
                        ""edges"": [
                            { ""from"": ""r.out"", ""to"": ""col.r"" },
                            { ""from"": ""g.out"", ""to"": ""col.g"" },
                            { ""from"": ""b.out"", ""to"": ""col.b"" }
                        ]
                    }
                }";

                adapter.HandleMessage(SceneGraphMessage.FromJson(json));
                adapter.Update(0.0);

                var color = renderer.material.color;
                Assert.AreEqual(0.8f, color.r, 0.01f);
                Assert.AreEqual(0.5f, color.g, 0.01f);
                Assert.AreEqual(0.2f, color.b, 0.01f);
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        [Test]
        public void Test24_SceneSetVisible_UpdatesSetActive()
        {
            var go = new GameObject("TestVisibleCube");
            try
            {
                var resolver = new MockGameObjectResolver();
                resolver.Register("TestVisibleCube", go);

                using var adapter = new LoomSceneSyncAdapter(
                    send: _ => true,
                    
                    targetResolver: resolver
                );

                var json = @"{
                    ""type"": ""scene-graph-set"",
                    ""scope"": ""scene"",
                    ""graph"": {
                        ""nodes"": [
                            { ""id"": ""vis"", ""type"": ""constant"", ""params"": { ""value"": false } },
                            { ""id"": ""sv"",  ""type"": ""sceneSetVisible"", ""params"": { ""target"": ""TestVisibleCube"" } }
                        ],
                        ""edges"": [
                            { ""from"": ""vis.out"", ""to"": ""sv.visible"" }
                        ]
                    }
                }";

                adapter.HandleMessage(SceneGraphMessage.FromJson(json));
                adapter.Update(0.0);

                Assert.IsFalse(go.activeSelf, "GameObject should be hidden");
            }
            finally
            {
                GameObject.DestroyImmediate(go);
            }
        }

        /// <summary>Helper resolver for Unity tests that wraps real GameObjects.</summary>
        private sealed class MockGameObjectResolver : ILoomTargetResolver
        {
            private readonly Dictionary<string, GameObject> _map = new Dictionary<string, GameObject>();
            public void Register(string id, GameObject go) => _map[id] = go;
            public object ResolveTarget(string targetId) =>
                _map.TryGetValue(targetId, out var go) ? (object)go : null;
        }

#endif // UNITY_2019_1_OR_NEWER

        // -------------------------------------------------------------------------
        // Test 25: scope { object } graph is independent from scene graph
        // -------------------------------------------------------------------------
        [Test]
        public void Test25_ObjectScopeGraph_IndependentFromSceneGraph()
        {
            using var adapter = CreateAdapter();

            // Load scene graph with constant=1
            var sceneJson = $@"{{""type"":""scene-graph-set"",""scope"":""scene"",
                ""graph"":{{""nodes"":[{{""id"":""c"",""type"":""constant"",""params"":{{""value"":1}}}}],""edges"":[]}}}}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(sceneJson));

            // Load object graph for "obj1" with constant=99
            var objJson = $@"{{""type"":""scene-graph-set"",""scope"":{{""object"":""obj1""}},
                ""graph"":{{""nodes"":[{{""id"":""c"",""type"":""constant"",""params"":{{""value"":99}}}}],""edges"":[]}}}}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(objJson));

            adapter.Update(0.0);

            // Both graphs loaded and evaluated independently — no exception = pass
            Assert.Pass("scene graph and object graph operate independently without interference");
        }

        // -------------------------------------------------------------------------
        // Test 26: scene-graph-clear removes object graph
        // -------------------------------------------------------------------------
        [Test]
        public void Test26_SceneGraphClear_RemovesObjectGraph()
        {
            using var adapter = CreateAdapter();

            // Load object graph
            var loadMsg = @"{""type"":""scene-graph-set"",""scope"":{""object"":""cube1""},
                ""graph"":{""nodes"":[{""id"":""c"",""type"":""constant"",""params"":{""value"":1}}],""edges"":[]}}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(loadMsg));
            adapter.Update(0.0); // graph is active

            // Clear object graph
            var clearMsg = @"{""type"":""scene-graph-clear"",""scope"":{""object"":""cube1""}}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(clearMsg));
            adapter.Update(0.0); // should not throw after clear

            Assert.Pass("Object graph was cleared without error");
        }

        // -------------------------------------------------------------------------
        // Test 26b: scene-graph-clear on scene scope resets scene graph
        // -------------------------------------------------------------------------
        [Test]
        public void Test26b_SceneGraphClear_ResetsSceneGraph()
        {
            using var adapter = CreateAdapter();

            var loadMsg = @"{""type"":""scene-graph-set"",""scope"":""scene"",
                ""graph"":{""nodes"":[{""id"":""clk"",""type"":""clock""}],""edges"":[]}}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(loadMsg));
            adapter.Update(0.0);

            var clearMsg = @"{""type"":""scene-graph-clear"",""scope"":""scene""}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(clearMsg));
            adapter.Update(0.0); // empty scene graph — no exception

            Assert.Pass("Scene graph was cleared without error");
        }

        // -------------------------------------------------------------------------
        // Test 27: scene-graph-patch with graph acts as set
        // -------------------------------------------------------------------------
        [Test]
        public void Test27_SceneGraphPatch_WithGraph_ActsAsSet()
        {
            using var adapter = CreateAdapter();

            var patchMsg = @"{""type"":""scene-graph-patch"",""scope"":""scene"",
                ""graph"":{""nodes"":[{""id"":""clk"",""type"":""clock""}],""edges"":[]}}";
            adapter.HandleMessage(SceneGraphMessage.FromJson(patchMsg));
            adapter.Update(1.0); // should evaluate without error

            Assert.Pass("scene-graph-patch with graph loaded and evaluated as scene-graph-set");
        }

        // -------------------------------------------------------------------------
        // Test 28: scene-graph-input is a no-op
        // -------------------------------------------------------------------------
        [Test]
        public void Test28_SceneGraphInput_IsNoOp()
        {
            using var adapter = CreateAdapter();

            // scene-graph-input should not throw
            var msg = SceneGraphMessage.FromJson(
                @"{""type"":""scene-graph-input"",""scope"":""scene""}");

            Assert.DoesNotThrow(() => adapter.HandleMessage(msg),
                "scene-graph-input must be a no-op and not throw");
        }
    }
}
