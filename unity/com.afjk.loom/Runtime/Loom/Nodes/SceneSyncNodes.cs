using System;
using System.Collections.Generic;

#if UNITY_2019_1_OR_NEWER
using UnityEngine;
#endif

namespace Afjk.Loom
{
    /// <summary>
    /// SceneSync nodes: sceneSetPosition, sceneSetRotation, sceneSetScale,
    /// sceneSetColor, sceneSetVisible.
    ///
    /// Unity-specific operations are wrapped in #if UNITY_2019_1_OR_NEWER so that the
    /// file compiles in non-Unity environments (e.g. unit tests).
    ///
    /// These nodes are NOT registered automatically. They are registered by
    /// LoomSceneSyncAdapter when it is first instantiated.
    /// </summary>
    internal static class SceneSyncNodes
    {
        private static bool _registered;

        internal static void Register(Dictionary<string, LoomNodeTypeDef> registry)
        {
            if (_registered) return;
            _registered = true;

            // ------------------------------------------------------------------
            // sceneSetPosition: set Transform.position
            // inputs: x, y, z (numbers)
            // params: target (string), adapterId (string)
            // ------------------------------------------------------------------
            registry["sceneSetPosition"] = new LoomNodeTypeDef
            {
                Category = "sink",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "x", Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "y", Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "z", Type = "number", Kind = "behavior", Default = (object)0.0 }
                },
                Outputs = new List<LoomPortDef>(),
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "target",    Type = "string", Default = "" },
                    new LoomParamDef { Name = "adapterId", Type = "string", Default = "" }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var target = ResolveTarget(@params);
                    if (target == null) return EmptyOutputs;

                    var x = LoomNodeHelpers.GetInput(inputs, "x");
                    var y = LoomNodeHelpers.GetInput(inputs, "y");
                    var z = LoomNodeHelpers.GetInput(inputs, "z");

#if UNITY_2019_1_OR_NEWER
                    if (target is GameObject go)
                        go.transform.position = new Vector3((float)x, (float)y, (float)z);
#endif
                    return EmptyOutputs;
                }
            };

            // ------------------------------------------------------------------
            // sceneSetRotation: set Transform rotation (input in radians, Unity uses degrees)
            // inputs: x, y, z (radians)
            // ------------------------------------------------------------------
            registry["sceneSetRotation"] = new LoomNodeTypeDef
            {
                Category = "sink",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "x", Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "y", Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "z", Type = "number", Kind = "behavior", Default = (object)0.0 }
                },
                Outputs = new List<LoomPortDef>(),
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "target",    Type = "string", Default = "" },
                    new LoomParamDef { Name = "adapterId", Type = "string", Default = "" }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var target = ResolveTarget(@params);
                    if (target == null) return EmptyOutputs;

                    // Convert radians to degrees for Unity
                    var xRad = LoomNodeHelpers.GetInput(inputs, "x");
                    var yRad = LoomNodeHelpers.GetInput(inputs, "y");
                    var zRad = LoomNodeHelpers.GetInput(inputs, "z");

#if UNITY_2019_1_OR_NEWER
                    const float Rad2Deg = 180.0f / (float)Math.PI;
                    if (target is GameObject go)
                        go.transform.localEulerAngles = new Vector3(
                            (float)xRad * Rad2Deg,
                            (float)yRad * Rad2Deg,
                            (float)zRad * Rad2Deg);
#endif
                    return EmptyOutputs;
                }
            };

            // ------------------------------------------------------------------
            // sceneSetScale: set Transform.localScale
            // ------------------------------------------------------------------
            registry["sceneSetScale"] = new LoomNodeTypeDef
            {
                Category = "sink",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "x", Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "y", Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "z", Type = "number", Kind = "behavior", Default = (object)1.0 }
                },
                Outputs = new List<LoomPortDef>(),
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "target",    Type = "string", Default = "" },
                    new LoomParamDef { Name = "adapterId", Type = "string", Default = "" }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var target = ResolveTarget(@params);
                    if (target == null) return EmptyOutputs;

                    var x = LoomNodeHelpers.GetInput(inputs, "x", 1.0);
                    var y = LoomNodeHelpers.GetInput(inputs, "y", 1.0);
                    var z = LoomNodeHelpers.GetInput(inputs, "z", 1.0);

#if UNITY_2019_1_OR_NEWER
                    if (target is GameObject go)
                        go.transform.localScale = new Vector3((float)x, (float)y, (float)z);
#endif
                    return EmptyOutputs;
                }
            };

            // ------------------------------------------------------------------
            // sceneSetColor: set Renderer.material.color (r, g, b; alpha preserved)
            // ------------------------------------------------------------------
            registry["sceneSetColor"] = new LoomNodeTypeDef
            {
                Category = "sink",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "r", Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "g", Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "b", Type = "number", Kind = "behavior", Default = (object)1.0 }
                },
                Outputs = new List<LoomPortDef>(),
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "target",    Type = "string", Default = "" },
                    new LoomParamDef { Name = "adapterId", Type = "string", Default = "" }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var target = ResolveTarget(@params);
                    if (target == null) return EmptyOutputs;

                    var r = LoomNodeHelpers.GetInput(inputs, "r", 1.0);
                    var g = LoomNodeHelpers.GetInput(inputs, "g", 1.0);
                    var b = LoomNodeHelpers.GetInput(inputs, "b", 1.0);

#if UNITY_2019_1_OR_NEWER
                    if (target is GameObject go)
                    {
                        var renderer = go.GetComponent<Renderer>();
                        if (renderer != null)
                        {
                            var color = renderer.material.color;
                            renderer.material.color = new Color((float)r, (float)g, (float)b, color.a);
                        }
                    }
#endif
                    return EmptyOutputs;
                }
            };

            // ------------------------------------------------------------------
            // sceneSetVisible: set GameObject.SetActive(bool)
            // ------------------------------------------------------------------
            registry["sceneSetVisible"] = new LoomNodeTypeDef
            {
                Category = "sink",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "visible", Type = "boolean", Kind = "behavior", Default = (object)true }
                },
                Outputs = new List<LoomPortDef>(),
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "target",    Type = "string", Default = "" },
                    new LoomParamDef { Name = "adapterId", Type = "string", Default = "" }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var target  = ResolveTarget(@params);
                    if (target == null) return EmptyOutputs;

                    var visible = LoomNodeHelpers.GetInputBool(inputs, "visible", true);

#if UNITY_2019_1_OR_NEWER
                    if (target is GameObject go)
                        go.SetActive(visible);
#endif
                    return EmptyOutputs;
                }
            };
        }

        // -------------------------------------------------------------------------
        // Helpers
        // -------------------------------------------------------------------------

        private static readonly Dictionary<string, object> EmptyOutputs =
            new Dictionary<string, object>();

        private static object ResolveTarget(Dictionary<string, object> @params)
        {
            var adapterId = LoomNodeHelpers.GetParam(@params, "adapterId");
            var adapter   = LoomSceneSyncAdapter.GetById(adapterId);
            if (adapter?.TargetResolver == null) return null;

            var targetId = LoomNodeHelpers.GetParam(@params, "target");
            return adapter.TargetResolver.ResolveTarget(targetId);
        }
    }
}
