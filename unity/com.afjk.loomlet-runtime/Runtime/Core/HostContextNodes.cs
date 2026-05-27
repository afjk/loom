using System.Collections.Generic;

namespace Loomlet.Runtime
{
    internal static class HostContextNodes
    {
        public static void Register(LoomletFunctionRegistry r)
        {
            r.Register("host.input", new[] { "name", "fallback" }, (i, c) =>
            {
                var name = LoomletValues.Text(i["name"]);
                return new Dictionary<string, object>
                {
                    ["out"] = c.TryGetHostInput(name, out var value) ? value : i["fallback"]
                };
            });

            r.Register("host.event", new[] { "name" }, (i, c) =>
            {
                return new Dictionary<string, object>
                {
                    ["events"] = new List<object>(c.GetHostEvents(LoomletValues.Text(i["name"])))
                };
            });

            r.Register("scene.clock", new string[0], (i, c) =>
            {
                return new Dictionary<string, object>
                {
                    ["t"] = c.Time,
                    ["delta"] = c.DeltaTime,
                    ["isPaused"] = c.IsPaused,
                    ["mode"] = c.Mode,
                    ["rate"] = c.Rate
                };
            });
        }
    }
}
