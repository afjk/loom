using System.Collections.Generic;

namespace Loomlet.Runtime
{
    public sealed class LoomletEvaluationResult
    {
        private readonly Dictionary<string, object> _values;

        internal LoomletEvaluationResult(Dictionary<string, object> values)
        {
            _values = new Dictionary<string, object>(values);
        }

        public object GetValue(string reference)
        {
            return _values.TryGetValue(reference, out var value) ? value : null;
        }

        public object GetValue(string nodeId, string outputName)
        {
            return GetValue(nodeId + "." + outputName);
        }
    }
}
