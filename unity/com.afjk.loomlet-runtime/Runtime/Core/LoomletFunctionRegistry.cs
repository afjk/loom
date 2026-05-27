using System;
using System.Collections.Generic;

namespace Loomlet.Runtime
{
    public sealed class LoomletFunctionRegistry
    {
        private readonly Dictionary<string, LoomletNodeDefinition> _definitions = new Dictionary<string, LoomletNodeDefinition>();

        public LoomletFunctionRegistry Register(string type, string[] inputs, Func<Dictionary<string, object>, LoomletEvaluationContext, Dictionary<string, object>> evaluate)
        {
            _definitions[type] = new LoomletNodeDefinition(type, inputs, evaluate);
            return this;
        }

        public bool TryGet(string type, out LoomletNodeDefinition definition) => _definitions.TryGetValue(type, out definition);

        public static LoomletFunctionRegistry CreateDefault()
        {
            var registry = new LoomletFunctionRegistry();
            PortableNodes.Register(registry);
            HostContextNodes.Register(registry);
            return registry;
        }
    }

    public sealed class LoomletNodeDefinition
    {
        public string Type { get; }
        public string[] Inputs { get; }
        private readonly Func<Dictionary<string, object>, LoomletEvaluationContext, Dictionary<string, object>> _evaluate;

        internal LoomletNodeDefinition(string type, string[] inputs, Func<Dictionary<string, object>, LoomletEvaluationContext, Dictionary<string, object>> evaluate)
        {
            Type = type;
            Inputs = inputs;
            _evaluate = evaluate;
        }

        public Dictionary<string, object> Evaluate(Dictionary<string, object> inputs, LoomletEvaluationContext context)
        {
            return _evaluate(inputs, context);
        }
    }
}
