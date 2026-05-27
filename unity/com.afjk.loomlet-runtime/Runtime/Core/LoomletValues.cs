using System;
using System.Collections.Generic;
using System.Globalization;

namespace Loomlet.Runtime
{
    internal static class LoomletValues
    {
        public static double Number(object value, double fallback = 0)
        {
            if (value == null) return fallback;
            if (value is double d) return d;
            if (value is float f) return f;
            if (value is int i) return i;
            if (value is long l) return l;
            if (value is bool b) return b ? 1 : 0;
            return double.TryParse(value.ToString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed)
                ? parsed
                : fallback;
        }

        public static int Integer(object value, int fallback = 0) => (int)Math.Truncate(Number(value, fallback));

        public static bool Truthy(object value)
        {
            if (value == null) return false;
            if (value is bool b) return b;
            if (value is string s) return s.Length > 0;
            if (value is double d) return d != 0 && !double.IsNaN(d);
            if (value is float f) return f != 0 && !float.IsNaN(f);
            if (value is int i) return i != 0;
            if (value is long l) return l != 0;
            return true;
        }

        public static List<object> ToList(object value)
        {
            if (value == null) return new List<object>();
            if (value is List<object> list) return list;
            if (value is object[] array) return new List<object>(array);
            return new List<object>();
        }

        public static string Text(object value)
        {
            if (value == null) return "";
            if (value is string s) return s;
            if (value is bool b) return b ? "true" : "false";
            if (value is double d) return d.ToString("G15", CultureInfo.InvariantCulture);
            if (value is int i) return i.ToString(CultureInfo.InvariantCulture);
            if (value is IList<object> || value is Dictionary<string, object>) return LoomletJson.Stringify(value);
            return value.ToString();
        }

        public static bool SameValue(object a, object b)
        {
            if (a == null || b == null) return a == null && b == null;
            if (IsNumberLike(a) && IsNumberLike(b)) return Number(a).Equals(Number(b));
            return Equals(a, b);
        }

        private static bool IsNumberLike(object value)
        {
            return value is double || value is float || value is int || value is long || value is decimal;
        }

        public static object CloneJsonLike(object value)
        {
            if (value is Dictionary<string, object> dict)
            {
                var clone = new Dictionary<string, object>();
                foreach (var pair in dict) clone[pair.Key] = CloneJsonLike(pair.Value);
                return clone;
            }
            if (value is List<object> list)
            {
                var clone = new List<object>();
                foreach (var item in list) clone.Add(CloneJsonLike(item));
                return clone;
            }
            return value;
        }
    }
}
