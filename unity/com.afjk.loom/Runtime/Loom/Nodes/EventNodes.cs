using System;
using System.Collections.Generic;

namespace Afjk.Loom
{
    /// <summary>
    /// Phase 1 event nodes: filter, sample, merge, pointerClick, keyDown, keyUp.
    /// These match the semantics of the JavaScript Phase 1 nodes in loom.js.
    /// </summary>
    internal static class EventNodes
    {
        private static bool _registered;

        internal static void Register(Dictionary<string, LoomNodeTypeDef> registry)
        {
            if (_registered) return;
            _registered = true;

            // ------------------------------------------------------------------
            // pointerClick: event<{x,y}> input node (populated via DispatchEvent)
            // ------------------------------------------------------------------
            registry["pointerClick"] = new LoomNodeTypeDef
            {
                Category = "input",
                Inputs = new List<LoomPortDef>(),
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<vec2>", Kind = "event" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "target", Type = "string", Default = "window" }
                },
                Evaluate = (inputs, @params, ctx) =>
                    new Dictionary<string, object> { ["event"] = new List<object>() }
            };

            // ------------------------------------------------------------------
            // keyDown: event<string> input node
            // ------------------------------------------------------------------
            registry["keyDown"] = new LoomNodeTypeDef
            {
                Category = "input",
                Inputs = new List<LoomPortDef>(),
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<string>", Kind = "event" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "key", Type = "string", Default = null }
                },
                Evaluate = (inputs, @params, ctx) =>
                    new Dictionary<string, object> { ["event"] = new List<object>() }
            };

            // ------------------------------------------------------------------
            // keyUp: event<string> input node
            // ------------------------------------------------------------------
            registry["keyUp"] = new LoomNodeTypeDef
            {
                Category = "input",
                Inputs = new List<LoomPortDef>(),
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<string>", Kind = "event" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "key", Type = "string", Default = null }
                },
                Evaluate = (inputs, @params, ctx) =>
                    new Dictionary<string, object> { ["event"] = new List<object>() }
            };

            // ------------------------------------------------------------------
            // filter: pass through events that satisfy predicate
            // ------------------------------------------------------------------
            registry["filter"] = new LoomNodeTypeDef
            {
                Category = "transform",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<any>", Kind = "event" }
                },
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<any>", Kind = "event" }
                },
                Params = new List<LoomParamDef>
                {
                    new LoomParamDef { Name = "predicate", Type = "string", Default = "true" }
                },
                Evaluate = (inputs, @params, ctx) =>
                {
                    var events = LoomNodeHelpers.ToEventList(
                        inputs.TryGetValue("event", out var ev) ? ev : null);

                    var predicateStr = @params.TryGetValue("predicate", out var pv) && pv != null
                        ? pv.ToString()
                        : "true";

                    Func<object, object> evaluator;
                    try
                    {
                        evaluator = LoomExpressionDsl.Compile(predicateStr);
                    }
                    catch (LoomException)
                    {
                        throw;
                    }

                    var filtered = new List<object>();
                    foreach (var payload in events)
                    {
                        try
                        {
                            var result = evaluator(payload);
                            if (IsTruthy(result))
                                filtered.Add(payload);
                        }
                        catch
                        {
                            // Evaluation errors silently drop the event (same as JS)
                        }
                    }

                    return new Dictionary<string, object> { ["event"] = filtered };
                }
            };

            // ------------------------------------------------------------------
            // sample: when trigger fires, emit the current value of 'value' port
            // ------------------------------------------------------------------
            registry["sample"] = new LoomNodeTypeDef
            {
                Category = "transform",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "trigger", Type = "event<void>", Kind = "event" },
                    new LoomPortDef { Name = "value",   Type = "any",         Kind = "behavior", Default = null }
                },
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<any>", Kind = "event" }
                },
                Params = new List<LoomParamDef>(),
                Evaluate = (inputs, @params, ctx) =>
                {
                    var triggers = LoomNodeHelpers.ToEventList(
                        inputs.TryGetValue("trigger", out var tv) ? tv : null);
                    var value = inputs.TryGetValue("value", out var vv) ? vv : null;

                    // For each trigger firing, emit value as the payload
                    var result = new List<object>(triggers.Count);
                    foreach (var _ in triggers)
                        result.Add(value);

                    return new Dictionary<string, object> { ["event"] = result };
                }
            };

            // ------------------------------------------------------------------
            // merge: combine two event streams, preserving order (a then b)
            // ------------------------------------------------------------------
            registry["merge"] = new LoomNodeTypeDef
            {
                Category = "transform",
                Inputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "a", Type = "event<any>", Kind = "event" },
                    new LoomPortDef { Name = "b", Type = "event<any>", Kind = "event" }
                },
                Outputs = new List<LoomPortDef>
                {
                    new LoomPortDef { Name = "event", Type = "event<any>", Kind = "event" }
                },
                Params = new List<LoomParamDef>(),
                Evaluate = (inputs, @params, ctx) =>
                {
                    var a = LoomNodeHelpers.ToEventList(inputs.TryGetValue("a", out var av) ? av : null);
                    var b = LoomNodeHelpers.ToEventList(inputs.TryGetValue("b", out var bv) ? bv : null);

                    var merged = new List<object>(a.Count + b.Count);
                    merged.AddRange(a);
                    merged.AddRange(b);

                    return new Dictionary<string, object> { ["event"] = merged };
                }
            };
        }

        private static bool IsTruthy(object value)
        {
            if (value == null) return false;
            if (value is bool b) return b;
            if (value is double d) return d != 0;
            if (value is string s) return s.Length > 0;
            return true;
        }
    }
}
