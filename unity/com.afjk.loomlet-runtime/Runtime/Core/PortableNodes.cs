using System;
using System.Collections.Generic;
using System.Linq;

namespace Loomlet.Runtime
{
    internal static class PortableNodes
    {
        public static void Register(LoomletFunctionRegistry r)
        {
            RegisterMath(r);
            RegisterLogic(r);
            RegisterList(r);
            RegisterText(r);
            RegisterJson(r);
        }

        private static void RegisterMath(LoomletFunctionRegistry r)
        {
            r.Register("math.add", new[] { "a", "b" }, (i, c) => Out(LoomletValues.Number(i["a"]) + LoomletValues.Number(i["b"])));
            r.Register("math.subtract", new[] { "a", "b" }, (i, c) => Out(LoomletValues.Number(i["a"]) - LoomletValues.Number(i["b"])));
            r.Register("math.multiply", new[] { "a", "b" }, (i, c) => Out(LoomletValues.Number(i["a"], 1) * LoomletValues.Number(i["b"], 1)));
            r.Register("math.divide", new[] { "a", "b" }, (i, c) => { var b = LoomletValues.Number(i["b"], 1); return Out(b == 0 ? 0 : LoomletValues.Number(i["a"]) / b); });
            r.Register("math.mod", new[] { "a", "b" }, (i, c) => { var b = LoomletValues.Number(i["b"], 1); return Out(b == 0 ? 0 : ((LoomletValues.Number(i["a"]) % b) + b) % b); });
            r.Register("math.min", new[] { "a", "b" }, (i, c) => Out(Math.Min(LoomletValues.Number(i["a"]), LoomletValues.Number(i["b"]))));
            r.Register("math.max", new[] { "a", "b" }, (i, c) => Out(Math.Max(LoomletValues.Number(i["a"]), LoomletValues.Number(i["b"]))));
            r.Register("math.clamp", new[] { "value", "min", "max" }, (i, c) => { var min = LoomletValues.Number(i["min"]); var max = LoomletValues.Number(i["max"], 1); var value = LoomletValues.Number(i["value"]); return Out(min > max ? min : Math.Max(min, Math.Min(max, value))); });
            r.Register("math.lerp", new[] { "a", "b", "t" }, (i, c) => { var a = LoomletValues.Number(i["a"]); var b = LoomletValues.Number(i["b"], 1); return Out(a + (b - a) * LoomletValues.Number(i["t"])); });
            r.Register("math.map", new[] { "value", "inMin", "inMax", "outMin", "outMax", "clamp" }, (i, c) =>
            {
                var inMin = LoomletValues.Number(i["inMin"]);
                var inMax = LoomletValues.Number(i["inMax"], 1);
                var outMin = LoomletValues.Number(i["outMin"]);
                var outMax = LoomletValues.Number(i["outMax"], 1);
                if (inMax == inMin) return Out(outMin);
                var t = (LoomletValues.Number(i["value"]) - inMin) / (inMax - inMin);
                if (i.TryGetValue("clamp", out var clamp) && clamp is bool b && b) t = Math.Max(0, Math.Min(1, t));
                return Out(outMin + (outMax - outMin) * t);
            });
            r.Register("math.floor", new[] { "value" }, (i, c) => Out(Math.Floor(LoomletValues.Number(i["value"]))));
            r.Register("math.ceil", new[] { "value" }, (i, c) => Out(Math.Ceiling(LoomletValues.Number(i["value"]))));
            r.Register("math.round", new[] { "value" }, (i, c) => Out(Math.Floor(LoomletValues.Number(i["value"]) + 0.5)));
            r.Register("math.sqrt", new[] { "value" }, (i, c) => Out(Math.Sqrt(LoomletValues.Number(i["value"]))));
            r.Register("math.pow", new[] { "value", "exponent" }, (i, c) => Out(Math.Pow(LoomletValues.Number(i["value"]), LoomletValues.Number(i["exponent"], 1))));
            r.Register("math.sine", new[] { "t", "freq", "amplitude", "phase", "offset" }, (i, c) => Out(Math.Sin(LoomletValues.Number(i["t"]) * LoomletValues.Number(i["freq"], 1) * 2 * Math.PI + LoomletValues.Number(i["phase"])) * LoomletValues.Number(i["amplitude"], 1) + LoomletValues.Number(i["offset"])));
            r.Register("math.cosine", new[] { "t", "freq", "amplitude", "phase", "offset" }, (i, c) => Out(Math.Cos(LoomletValues.Number(i["t"]) * LoomletValues.Number(i["freq"], 1) * 2 * Math.PI + LoomletValues.Number(i["phase"])) * LoomletValues.Number(i["amplitude"], 1) + LoomletValues.Number(i["offset"])));
        }

        private static void RegisterLogic(LoomletFunctionRegistry r)
        {
            r.Register("logic.equals", new[] { "value", "other" }, (i, c) => Out(LoomletValues.SameValue(i["value"], i["other"])));
            r.Register("logic.notEquals", new[] { "value", "other" }, (i, c) => Out(!LoomletValues.SameValue(i["value"], i["other"])));
            r.Register("logic.greaterThan", new[] { "value", "other" }, (i, c) => Out(LoomletValues.Number(i["value"]) > LoomletValues.Number(i["other"])));
            r.Register("logic.lessThan", new[] { "value", "other" }, (i, c) => Out(LoomletValues.Number(i["value"]) < LoomletValues.Number(i["other"])));
            r.Register("logic.greaterOrEqual", new[] { "value", "other" }, (i, c) => Out(LoomletValues.Number(i["value"]) >= LoomletValues.Number(i["other"])));
            r.Register("logic.lessOrEqual", new[] { "value", "other" }, (i, c) => Out(LoomletValues.Number(i["value"]) <= LoomletValues.Number(i["other"])));
            r.Register("logic.and", new[] { "a", "b" }, (i, c) => Out(LoomletValues.Truthy(i["a"]) && LoomletValues.Truthy(i["b"])));
            r.Register("logic.or", new[] { "a", "b" }, (i, c) => Out(LoomletValues.Truthy(i["a"]) || LoomletValues.Truthy(i["b"])));
            r.Register("logic.not", new[] { "value" }, (i, c) => Out(!LoomletValues.Truthy(i["value"])));
            r.Register("logic.select", new[] { "condition", "whenTrue", "whenFalse" }, (i, c) => Out(LoomletValues.Truthy(i["condition"]) ? i["whenTrue"] : i["whenFalse"]));
            r.Register("logic.when", new[] { "condition", "value" }, (i, c) => Out(LoomletValues.Truthy(i["condition"]) ? i["value"] : null));
        }

        private static void RegisterList(LoomletFunctionRegistry r)
        {
            r.Register("list.range", new[] { "start", "end" }, (i, c) => { var start = LoomletValues.Integer(i["start"]); var end = LoomletValues.Integer(i["end"]); var step = start <= end ? 1 : -1; var list = new List<object>(); for (var n = start; step > 0 ? n <= end : n >= end; n += step) list.Add((double)n); return Out(list); });
            r.Register("list.length", new[] { "list" }, (i, c) => Out((double)LoomletValues.ToList(i["list"]).Count));
            r.Register("list.first", new[] { "list" }, (i, c) => { var list = LoomletValues.ToList(i["list"]); return Out(list.Count > 0 ? list[0] : null); });
            r.Register("list.last", new[] { "list" }, (i, c) => { var list = LoomletValues.ToList(i["list"]); return Out(list.Count > 0 ? list[list.Count - 1] : null); });
            r.Register("list.at", new[] { "list", "index" }, (i, c) => { var list = LoomletValues.ToList(i["list"]); var index = LoomletValues.Integer(i["index"]); if (index < 0) index = list.Count + index; return Out(index >= 0 && index < list.Count ? list[index] : null); });
            r.Register("list.join", new[] { "list", "separator" }, (i, c) => Out(string.Join(LoomletValues.Text(i["separator"] ?? ","), LoomletValues.ToList(i["list"]).Select(LoomletValues.Text).ToArray())));
            r.Register("list.reverse", new[] { "list" }, (i, c) => { var list = new List<object>(LoomletValues.ToList(i["list"])); list.Reverse(); return Out(list); });
            r.Register("list.sort", new[] { "list" }, (i, c) => { var list = new List<object>(LoomletValues.ToList(i["list"])); if (list.All(v => v is double || v is int || v is long || v is float)) list.Sort((a, b) => LoomletValues.Number(a).CompareTo(LoomletValues.Number(b))); else list.Sort((a, b) => string.Compare(LoomletValues.Text(a), LoomletValues.Text(b), StringComparison.Ordinal)); return Out(list); });
            r.Register("list.take", new[] { "list", "count" }, (i, c) => Out(LoomletValues.ToList(i["list"]).Take(Math.Max(0, LoomletValues.Integer(i["count"]))).ToList<object>()));
            r.Register("list.drop", new[] { "list", "count" }, (i, c) => Out(LoomletValues.ToList(i["list"]).Skip(Math.Max(0, LoomletValues.Integer(i["count"]))).ToList<object>()));
            r.Register("list.concat", new[] { "list1", "list2", "list3", "list4" }, (i, c) => { var list = new List<object>(); for (var n = 1; n <= 4; n++) if (i["list" + n] != null) list.AddRange(LoomletValues.ToList(i["list" + n])); return Out(list); });
        }

        private static void RegisterText(LoomletFunctionRegistry r)
        {
            r.Register("text.concat", Enumerable.Range(1, 8).Select(n => "value" + n).ToArray(), (i, c) =>
            {
                var parts = new List<string>();
                for (var n = 1; n <= 8; n++)
                    if (i["value" + n] != null) parts.Add(LoomletValues.Text(i["value" + n]));
                return Out(string.Concat(parts.ToArray()));
            });
            r.Register("text.split", new[] { "value", "separator" }, (i, c) => Out(LoomletValues.Text(i["value"]).Split(new[] { LoomletValues.Text(i["separator"] ?? ",") }, StringSplitOptions.None).Cast<object>().ToList()));
            r.Register("text.join", new[] { "list", "separator" }, (i, c) => Out(string.Join(LoomletValues.Text(i["separator"] ?? ","), LoomletValues.ToList(i["list"]).Select(LoomletValues.Text).ToArray())));
            r.Register("text.includes", new[] { "value", "search" }, (i, c) => Out(LoomletValues.Text(i["value"]).Contains(LoomletValues.Text(i["search"]))));
            r.Register("text.startsWith", new[] { "value", "search" }, (i, c) => Out(LoomletValues.Text(i["value"]).StartsWith(LoomletValues.Text(i["search"]), StringComparison.Ordinal)));
            r.Register("text.endsWith", new[] { "value", "search" }, (i, c) => Out(LoomletValues.Text(i["value"]).EndsWith(LoomletValues.Text(i["search"]), StringComparison.Ordinal)));
            r.Register("text.length", new[] { "value" }, (i, c) => Out((double)LoomletValues.Text(i["value"]).Length));
            r.Register("text.isEmpty", new[] { "value" }, (i, c) => Out(LoomletValues.Text(i["value"]).Length == 0));
            r.Register("text.stringify", new[] { "value" }, (i, c) => Out(LoomletValues.Text(i["value"])));
        }

        private static void RegisterJson(LoomletFunctionRegistry r)
        {
            r.Register("json.stringify", new[] { "value" }, (i, c) => Out(LoomletJson.Stringify(i["value"])));
            r.Register("json.parse", new[] { "value" }, (i, c) => Out(LoomletJson.Parse(LoomletValues.Text(i["value"]))));
        }

        private static Dictionary<string, object> Out(object value) => new Dictionary<string, object> { ["out"] = value };
    }
}
