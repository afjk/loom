using System.Collections.Generic;
using Loomlet.Runtime;
using UnityEngine;

namespace Loomlet.Unity
{
    public static class LoomletUnityConversions
    {
        public static Vector3 Vector3(object value, Vector3 fallback)
        {
            if (value is Dictionary<string, object> dict)
            {
                return new Vector3(
                    Float(dict.TryGetValue("x", out var x) ? x : null, fallback.x),
                    Float(dict.TryGetValue("y", out var y) ? y : null, fallback.y),
                    Float(dict.TryGetValue("z", out var z) ? z : null, fallback.z)
                );
            }

            var list = value as List<object>;
            if (list != null)
            {
                return new Vector3(
                    list.Count > 0 ? Float(list[0], fallback.x) : fallback.x,
                    list.Count > 1 ? Float(list[1], fallback.y) : fallback.y,
                    list.Count > 2 ? Float(list[2], fallback.z) : fallback.z
                );
            }

            var scalar = Float(value, float.NaN);
            return float.IsNaN(scalar) ? fallback : new Vector3(scalar, scalar, scalar);
        }

        public static Color Color(object value, Color fallback)
        {
            if (value is Dictionary<string, object> dict)
            {
                return new Color(
                    Float(dict.TryGetValue("r", out var r) ? r : null, fallback.r),
                    Float(dict.TryGetValue("g", out var g) ? g : null, fallback.g),
                    Float(dict.TryGetValue("b", out var b) ? b : null, fallback.b),
                    Float(dict.TryGetValue("a", out var a) ? a : null, fallback.a)
                );
            }

            var list = value as List<object>;
            if (list != null)
            {
                return new Color(
                    list.Count > 0 ? Float(list[0], fallback.r) : fallback.r,
                    list.Count > 1 ? Float(list[1], fallback.g) : fallback.g,
                    list.Count > 2 ? Float(list[2], fallback.b) : fallback.b,
                    list.Count > 3 ? Float(list[3], fallback.a) : fallback.a
                );
            }

            return fallback;
        }

        private static float Float(object value, float fallback)
        {
            if (value == null) return fallback;
            if (value is float f) return f;
            if (value is double d) return (float)d;
            if (value is int i) return i;
            return float.TryParse(value.ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var parsed)
                ? parsed
                : fallback;
        }
    }
}
