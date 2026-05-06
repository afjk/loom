using System;
using System.Collections.Generic;

namespace Afjk.Loom
{
    /// <summary>Evaluation context passed to node evaluate functions.</summary>
    public sealed class LoomEvalContext
    {
        /// <summary>Current simulation time in seconds.</summary>
        public double Time { get; internal set; }

        /// <summary>The engine instance performing this evaluation.</summary>
        public LoomEngine Engine { get; internal set; }
    }

    /// <summary>Definition of a single input or output port.</summary>
    public sealed class LoomPortDef
    {
        public string Name { get; set; }
        public string Type { get; set; }
        /// <summary>"behavior" or "event"</summary>
        public string Kind { get; set; }
        public object Default { get; set; }
    }

    /// <summary>Definition of a static parameter.</summary>
    public sealed class LoomParamDef
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public object Default { get; set; }
    }

    /// <summary>Complete definition of a node type.</summary>
    public sealed class LoomNodeTypeDef
    {
        /// <summary>"source", "transform", "sink", or "input"</summary>
        public string Category { get; set; }

        public List<LoomPortDef> Inputs { get; set; } = new List<LoomPortDef>();
        public List<LoomPortDef> Outputs { get; set; } = new List<LoomPortDef>();
        public List<LoomParamDef> Params { get; set; } = new List<LoomParamDef>();

        /// <summary>
        /// Evaluate function: (inputs, params, ctx) => outputs.
        /// All values are boxed objects. Event ports carry List&lt;object&gt;.
        /// </summary>
        public Func<
            Dictionary<string, object>,  // resolved inputs
            Dictionary<string, object>,  // resolved params
            LoomEvalContext,
            Dictionary<string, object>   // outputs
        > Evaluate { get; set; }
    }

    /// <summary>Shared helper methods used across node implementations.</summary>
    internal static class LoomNodeHelpers
    {
        public static double ToDouble(object val, double defaultVal = 0.0)
        {
            if (val is double d) return d;
            if (val is float f) return f;
            if (val is int i) return i;
            if (val is long l) return l;
            if (val == null) return defaultVal;
            if (double.TryParse(val.ToString(),
                System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var r))
                return r;
            return defaultVal;
        }

        public static bool ToBool(object val, bool defaultVal = false)
        {
            if (val is bool b) return b;
            if (val == null) return defaultVal;
            if (val is double d) return d != 0;
            if (val is string s) return s.Length > 0;
            return defaultVal;
        }

        public static List<object> ToEventList(object val)
        {
            if (val is List<object> list) return list;
            return new List<object>();
        }

        public static string GetParam(Dictionary<string, object> @params, string key, string defaultVal = "")
        {
            return @params.TryGetValue(key, out var v) ? v?.ToString() ?? defaultVal : defaultVal;
        }

        public static double GetParamDouble(Dictionary<string, object> @params, string key, double defaultVal = 0.0)
        {
            return @params.TryGetValue(key, out var v) ? ToDouble(v, defaultVal) : defaultVal;
        }

        public static double GetInput(Dictionary<string, object> inputs, string key, double defaultVal = 0.0)
        {
            return inputs.TryGetValue(key, out var v) ? ToDouble(v, defaultVal) : defaultVal;
        }

        public static bool GetInputBool(Dictionary<string, object> inputs, string key, bool defaultVal = false)
        {
            return inputs.TryGetValue(key, out var v) ? ToBool(v, defaultVal) : defaultVal;
        }
    }
}
