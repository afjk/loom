using System.Collections.Generic;

namespace Loomlet.Runtime
{
    public sealed class LoomletEvaluationContext
    {
        private readonly Dictionary<string, object> _hostInputs = new Dictionary<string, object>();
        private readonly Dictionary<string, List<object>> _hostEvents = new Dictionary<string, List<object>>();

        public double Time { get; private set; }
        public double DeltaTime { get; private set; }
        public bool IsPaused { get; private set; }
        public string Mode { get; private set; } = "local";
        public double Rate { get; private set; } = 1.0;

        public LoomletEvaluationContext WithSceneClock(
            double time,
            double deltaTime,
            bool isPaused = false,
            string mode = "local",
            double rate = 1.0)
        {
            Time = time;
            DeltaTime = deltaTime;
            IsPaused = isPaused;
            Mode = mode ?? "local";
            Rate = rate;
            return this;
        }

        public LoomletEvaluationContext SetHostInput(string name, object value)
        {
            _hostInputs[name] = value;
            return this;
        }

        public bool TryGetHostInput(string name, out object value) => _hostInputs.TryGetValue(name, out value);

        public LoomletEvaluationContext AddHostEvent(string name, object payload)
        {
            if (!_hostEvents.TryGetValue(name, out var events))
            {
                events = new List<object>();
                _hostEvents[name] = events;
            }
            events.Add(payload);
            return this;
        }

        public LoomletEvaluationContext SetHostEvents(string name, IEnumerable<object> events)
        {
            _hostEvents[name] = events == null ? new List<object>() : new List<object>(events);
            return this;
        }

        public LoomletEvaluationContext ClearHostEvents()
        {
            _hostEvents.Clear();
            return this;
        }

        public LoomletEvaluationContext ClearHostEvents(string name)
        {
            _hostEvents.Remove(name);
            return this;
        }

        public IReadOnlyList<object> GetHostEvents(string name)
        {
            return _hostEvents.TryGetValue(name, out var events) ? events : EmptyEvents;
        }

        private static readonly List<object> EmptyEvents = new List<object>();
    }
}
