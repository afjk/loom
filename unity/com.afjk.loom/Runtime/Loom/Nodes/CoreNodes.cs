using System;
using System.Collections.Generic;

namespace Afjk.Loom
{
    /// <summary>
    /// Phase 0 core nodes: clock, constant, sine, add, multiply.
    /// These match the semantics of the JavaScript Loom nodes in loom.js.
    /// </summary>
    internal static class CoreNodes
    {
        private static bool _registered;

        internal static void Register(Dictionary<string, LoomNodeTypeDef> registry)
        {
            if (_registered) return;
            _registered = true;

            // ------------------------------------------------------------------
            // clock: outputs current time as behavior
            // ------------------------------------------------------------------
            registry["clock"] = new LoomNodeTypeDef
            {
                Category = "source",
                Inputs = new List<LoomPortDef>(),
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "t", Type = "number", Kind = "behavior" }
                },
                Params = new List<LoomParamDef>(),
                Evaluate = (inputs, @params, ctx) =>
                    new Dictionary<string, object> { ["t"] = (object)ctx.Time }
            };

            // ------------------------------------------------------------------
            // constant: outputs a fixed value
            // ------------------------------------------------------------------
            registry["constant"] = new LoomNodeTypeDef
            {
                Category = "source",
                Inputs = new List<LoomPortDef>(),
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "out", Type = "any", Kind = "behavior" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "value", Type = "any", Default = (object)0.0 }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var val = @params.TryGetValue("value", out var v) ? v : 0.0;
                    return new Dictionary<string, object> { ["out"] = val };
                }
            };

            // ------------------------------------------------------------------
            // sine: amplitude * sin(t * freq * 2π + phase) + offset
            // Matches exactly the JavaScript sine node calculation.
            // ------------------------------------------------------------------
            registry["sine"] = new LoomNodeTypeDef
            {
                Category = "transform",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "t",         Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "freq",      Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "amplitude", Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "phase",     Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "offset",    Type = "number", Kind = "behavior", Default = (object)0.0 }
                },
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "out", Type = "number", Kind = "behavior" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "freq",      Type = "number", Default = (object)1.0 },
                    new LoomParamDef { Name = "amplitude", Type = "number", Default = (object)1.0 },
                    new LoomParamDef { Name = "phase",     Type = "number", Default = (object)0.0 },
                    new LoomParamDef { Name = "offset",    Type = "number", Default = (object)0.0 }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var t         = LoomNodeHelpers.GetInput(inputs, "t");
                    var freq      = LoomNodeHelpers.GetInput(inputs, "freq",      1.0);
                    var amplitude = LoomNodeHelpers.GetInput(inputs, "amplitude", 1.0);
                    var phase     = LoomNodeHelpers.GetInput(inputs, "phase");
                    var offset    = LoomNodeHelpers.GetInput(inputs, "offset");
                    var result    = Math.Sin(t * freq * 2.0 * Math.PI + phase) * amplitude + offset;
                    return new Dictionary<string, object> { ["out"] = (object)result };
                }
            };

            // ------------------------------------------------------------------
            // add: out = a + b
            // ------------------------------------------------------------------
            registry["add"] = new LoomNodeTypeDef
            {
                Category = "transform",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "a", Type = "number", Kind = "behavior", Default = (object)0.0 },
                    new LoomPortDef { Name = "b", Type = "number", Kind = "behavior", Default = (object)0.0 }
                },
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "out", Type = "number", Kind = "behavior" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "a", Type = "number", Default = (object)0.0 },
                    new LoomParamDef { Name = "b", Type = "number", Default = (object)0.0 }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var a = LoomNodeHelpers.GetInput(inputs, "a");
                    var b = LoomNodeHelpers.GetInput(inputs, "b");
                    return new Dictionary<string, object> { ["out"] = (object)(a + b) };
                }
            };

            // ------------------------------------------------------------------
            // multiply: out = a * b
            // ------------------------------------------------------------------
            registry["multiply"] = new LoomNodeTypeDef
            {
                Category = "transform",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "a", Type = "number", Kind = "behavior", Default = (object)1.0 },
                    new LoomPortDef { Name = "b", Type = "number", Kind = "behavior", Default = (object)1.0 }
                },
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "out", Type = "number", Kind = "behavior" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "a", Type = "number", Default = (object)1.0 },
                    new LoomParamDef { Name = "b", Type = "number", Default = (object)1.0 }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var a = LoomNodeHelpers.GetInput(inputs, "a", 1.0);
                    var b = LoomNodeHelpers.GetInput(inputs, "b", 1.0);
                    return new Dictionary<string, object> { ["out"] = (object)(a * b) };
                }
            };
        }
    }
}
