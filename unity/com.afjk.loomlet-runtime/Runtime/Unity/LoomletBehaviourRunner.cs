using System;
using System.Collections.Generic;
using Loomlet.Runtime;
using UnityEngine;

namespace Loomlet.Unity
{
    public sealed class LoomletBehaviourRunner : MonoBehaviour
    {
        [SerializeField] private TextAsset graphJson;
        [SerializeField] private List<LoomletUnityBinding> bindings = new List<LoomletUnityBinding>();

        private LoomletEvaluator _evaluator;
        private readonly LoomletEvaluationContext _context = new LoomletEvaluationContext();
        private double _lastTime;

        public LoomletEvaluationContext Context => _context;

        private void Awake()
        {
            ReloadGraph();
            _lastTime = Time.timeAsDouble;
        }

        public void ReloadGraph()
        {
            if (graphJson == null)
            {
                _evaluator = null;
                return;
            }

            _evaluator = new LoomletEvaluator(LoomletGraph.FromJson(graphJson.text));
        }

        private void Update()
        {
            if (_evaluator == null) return;

            var now = Time.timeAsDouble;
            _context.WithSceneClock(now, now - _lastTime, false, "local", 1.0);
            _lastTime = now;

            var result = _evaluator.Evaluate(_context);
            foreach (var binding in bindings)
                binding.Apply(result, gameObject);
        }
    }

    [Serializable]
    public sealed class LoomletUnityBinding
    {
        public string output;
        public LoomletUnityBindingTarget target = LoomletUnityBindingTarget.Self;
        public Transform transformTarget;
        public Renderer rendererTarget;
        public LoomletUnityProperty property;

        public void Apply(LoomletEvaluationResult result, GameObject fallbackObject)
        {
            if (result == null || string.IsNullOrEmpty(output)) return;
            var value = result.GetValue(output);

            switch (property)
            {
                case LoomletUnityProperty.Position:
                    ResolveTransform(fallbackObject).position = LoomletUnityConversions.Vector3(value, ResolveTransform(fallbackObject).position);
                    break;
                case LoomletUnityProperty.LocalPosition:
                    ResolveTransform(fallbackObject).localPosition = LoomletUnityConversions.Vector3(value, ResolveTransform(fallbackObject).localPosition);
                    break;
                case LoomletUnityProperty.RotationEuler:
                    ResolveTransform(fallbackObject).rotation = Quaternion.Euler(LoomletUnityConversions.Vector3(value, ResolveTransform(fallbackObject).rotation.eulerAngles));
                    break;
                case LoomletUnityProperty.LocalRotationEuler:
                    ResolveTransform(fallbackObject).localRotation = Quaternion.Euler(LoomletUnityConversions.Vector3(value, ResolveTransform(fallbackObject).localRotation.eulerAngles));
                    break;
                case LoomletUnityProperty.Scale:
                    ResolveTransform(fallbackObject).localScale = LoomletUnityConversions.Vector3(value, ResolveTransform(fallbackObject).localScale);
                    break;
                case LoomletUnityProperty.RendererColor:
                    var renderer = ResolveRenderer(fallbackObject);
                    if (renderer != null) LoomletUnityMaterialColor.Apply(renderer, LoomletUnityConversions.Color(value, Color.white));
                    break;
            }
        }

        private Transform ResolveTransform(GameObject fallbackObject)
        {
            if (target == LoomletUnityBindingTarget.Explicit && transformTarget != null) return transformTarget;
            return fallbackObject.transform;
        }

        private Renderer ResolveRenderer(GameObject fallbackObject)
        {
            if (target == LoomletUnityBindingTarget.Explicit && rendererTarget != null) return rendererTarget;
            return fallbackObject.GetComponent<Renderer>();
        }
    }

    public enum LoomletUnityBindingTarget
    {
        Self,
        Explicit
    }

    public enum LoomletUnityProperty
    {
        Position,
        LocalPosition,
        RotationEuler,
        LocalRotationEuler,
        Scale,
        RendererColor
    }
}
