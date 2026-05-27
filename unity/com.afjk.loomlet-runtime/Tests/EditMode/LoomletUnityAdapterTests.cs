using System.Collections.Generic;
using NUnit.Framework;
using Loomlet.Runtime;
using Loomlet.Unity;
using UnityEngine;

namespace Loomlet.Runtime.Tests
{
    public sealed class LoomletUnityAdapterTests
    {
        [Test]
        public void BindingAppliesTransformScale()
        {
            var go = new GameObject("loomlet-scale-test");
            try
            {
                var graph = LoomletGraph.FromJson("{\"nodes\":[{\"id\":\"n\",\"type\":\"list.range\",\"params\":{\"start\":2,\"end\":4}}],\"edges\":[]}");
                var result = new LoomletEvaluator(graph).Evaluate();
                var binding = new LoomletUnityBinding
                {
                    output = "n.out",
                    property = LoomletUnityProperty.Scale
                };

                binding.Apply(result, go);

                Assert.AreEqual(new Vector3(2, 3, 4), go.transform.localScale);
            }
            finally
            {
                Object.DestroyImmediate(go);
            }
        }

        [Test]
        public void BindingAppliesRendererColorWithPropertyBlock()
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            try
            {
                var result = CreateHostInputResult(new Dictionary<string, object>
                {
                    ["r"] = 0.25,
                    ["g"] = 0.5,
                    ["b"] = 0.75,
                    ["a"] = 1.0
                });
                var binding = new LoomletUnityBinding
                {
                    output = "color.out",
                    property = LoomletUnityProperty.RendererColor
                };

                binding.Apply(result, go);
                var block = new MaterialPropertyBlock();
                go.GetComponent<Renderer>().GetPropertyBlock(block);

                Assert.AreEqual(new Color(0.25f, 0.5f, 0.75f, 1f), block.GetColor("_Color"));
            }
            finally
            {
                Object.DestroyImmediate(go);
            }
        }

        private static LoomletEvaluationResult CreateHostInputResult(object value)
        {
            var graph = LoomletGraph.FromJson("{\"nodes\":[{\"id\":\"color\",\"type\":\"host.input\",\"params\":{\"name\":\"color\"}}],\"edges\":[]}");
            var context = new LoomletEvaluationContext().SetHostInput("color", value);
            return new LoomletEvaluator(graph).Evaluate(context);
        }
    }
}
