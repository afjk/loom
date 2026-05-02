using System;
using System.Collections.Generic;
using NUnit.Framework;

namespace Afjk.Loom.Tests
{
    /// <summary>
    /// LoomEngine tests: core nodes (Phase 0), event nodes (Phase 1), graph lifecycle.
    /// Tests 1-14 from the specification.
    /// These tests do NOT require Unity-specific types and can be validated with dotnet.
    /// </summary>
    [TestFixture]
    public class LoomEngineTests
    {
        // -------------------------------------------------------------------------
        // Helpers
        // -------------------------------------------------------------------------

        private static LoomGraph SimpleGraph(params (string id, string type, Dictionary<string, object> @params)[] nodes) =>
            SimpleGraph(nodes, Array.Empty<(string, string)>());

        private static LoomGraph SimpleGraph(
            (string id, string type, Dictionary<string, object> @params)[] nodes,
            (string from, string to)[] edges)
        {
            var g = new LoomGraph
            {
                Nodes = new List<LoomGraphNode>(),
                Edges = new List<LoomGraphEdge>()
            };
            foreach (var (id, type, prms) in nodes)
                g.Nodes.Add(new LoomGraphNode { Id = id, Type = type, Params = prms ?? new Dictionary<string, object>() });
            foreach (var (from, to) in edges)
                g.Edges.Add(new LoomGraphEdge { From = from, To = to });
            return g;
        }

        // -------------------------------------------------------------------------
        // Test 1: constant outputs value
        // -------------------------------------------------------------------------
        [Test]
        public void Test01_Constant_OutputsValue()
        {
            var graph = SimpleGraph(new[]
            {
                ("c", "constant", new Dictionary<string, object> { ["value"] = (object)42.0 })
            });
            var engine = new LoomEngine(graph);
            engine.EvaluateAt(0.0);
            var val = engine.GetValue("c", "out");
            Assert.AreEqual(42.0, val);
        }

        // -------------------------------------------------------------------------
        // Test 2: clock outputs EvaluateAt(time)
        // -------------------------------------------------------------------------
        [Test]
        public void Test02_Clock_OutputsTime()
        {
            var graph = SimpleGraph(new[] { ("clk", "clock", (Dictionary<string, object>)null) });
            var engine = new LoomEngine(graph);
            engine.EvaluateAt(3.14);
            Assert.AreEqual(3.14, engine.GetValue("clk", "t"));
            engine.EvaluateAt(7.0);
            Assert.AreEqual(7.0, engine.GetValue("clk", "t"));
        }

        // -------------------------------------------------------------------------
        // Test 3: sine produces same result as JavaScript version
        // JS: Math.sin(t * freq * 2 * Math.PI + phase) * amplitude + offset
        // -------------------------------------------------------------------------
        [Test]
        public void Test03_Sine_MatchesJsFormula()
        {
            var graph = SimpleGraph(
                new[]
                {
                    ("clk",  "clock", (Dictionary<string, object>)null),
                    ("sine", "sine",  new Dictionary<string, object>
                    {
                        ["freq"]      = (object)1.0,
                        ["amplitude"] = (object)2.0,
                        ["phase"]     = (object)0.0,
                        ["offset"]    = (object)0.0
                    })
                },
                new[] { ("clk.t", "sine.t") }
            );
            var engine = new LoomEngine(graph);

            const double t = 0.25; // expected: 2 * sin(0.25 * 1 * 2π) = 2 * sin(π/2) = 2.0
            engine.EvaluateAt(t);

            var expected = Math.Sin(t * 1.0 * 2.0 * Math.PI + 0.0) * 2.0 + 0.0;
            Assert.AreEqual(expected, (double)engine.GetValue("sine", "out"), 1e-10);
        }

        // -------------------------------------------------------------------------
        // Test 4: add outputs a + b
        // -------------------------------------------------------------------------
        [Test]
        public void Test04_Add_OutputsSum()
        {
            var graph = SimpleGraph(new[]
            {
                ("a1", "constant", new Dictionary<string, object> { ["value"] = (object)3.0 }),
                ("b1", "constant", new Dictionary<string, object> { ["value"] = (object)4.0 }),
                ("r",  "add",      (Dictionary<string, object>)null)
            },
            new[] { ("a1.out", "r.a"), ("b1.out", "r.b") });

            var engine = new LoomEngine(graph);
            engine.EvaluateAt(0.0);
            Assert.AreEqual(7.0, engine.GetValue("r", "out"));
        }

        // -------------------------------------------------------------------------
        // Test 5: multiply outputs a * b
        // -------------------------------------------------------------------------
        [Test]
        public void Test05_Multiply_OutputsProduct()
        {
            var graph = SimpleGraph(new[]
            {
                ("a1", "constant", new Dictionary<string, object> { ["value"] = (object)3.0 }),
                ("b1", "constant", new Dictionary<string, object> { ["value"] = (object)5.0 }),
                ("r",  "multiply", (Dictionary<string, object>)null)
            },
            new[] { ("a1.out", "r.a"), ("b1.out", "r.b") });

            var engine = new LoomEngine(graph);
            engine.EvaluateAt(0.0);
            Assert.AreEqual(15.0, engine.GetValue("r", "out"));
        }

        // -------------------------------------------------------------------------
        // Test 6: Load() defers graph switch to next EvaluateAt()
        // -------------------------------------------------------------------------
        [Test]
        public void Test06_Load_DeferredGraphSwitch()
        {
            var graph1 = SimpleGraph(new[]
            {
                ("c", "constant", new Dictionary<string, object> { ["value"] = (object)1.0 })
            });
            var graph2 = SimpleGraph(new[]
            {
                ("c", "constant", new Dictionary<string, object> { ["value"] = (object)99.0 })
            });

            var engine = new LoomEngine(graph1);
            engine.EvaluateAt(0.0);
            Assert.AreEqual(1.0, engine.GetValue("c", "out"), "Should be graph1 value before Load");

            engine.Load(graph2);
            // Value not yet changed (pending)
            Assert.AreEqual(1.0, engine.GetValue("c", "out"), "Should still be graph1 before EvaluateAt");

            engine.EvaluateAt(0.0);
            Assert.AreEqual(99.0, engine.GetValue("c", "out"), "Should be graph2 value after EvaluateAt");
        }

        // -------------------------------------------------------------------------
        // Test 7: Cycle graph throws CYCLE_DETECTED
        // -------------------------------------------------------------------------
        [Test]
        public void Test07_CycleGraph_ThrowsCycleDetected()
        {
            var graph = new LoomGraph
            {
                Nodes = new List<LoomGraphNode>
                {
                    new LoomGraphNode { Id = "a", Type = "add" },
                    new LoomGraphNode { Id = "b", Type = "add" }
                },
                Edges = new List<LoomGraphEdge>
                {
                    new LoomGraphEdge { From = "a.out", To = "b.a" },
                    new LoomGraphEdge { From = "b.out", To = "a.a" }
                }
            };
            var ex = Assert.Throws<LoomException>(() => new LoomEngine(graph));
            Assert.AreEqual("CYCLE_DETECTED", ex.Code);
        }

        // -------------------------------------------------------------------------
        // Test 8: Unknown node type throws UNKNOWN_NODE_TYPE
        // -------------------------------------------------------------------------
        [Test]
        public void Test08_UnknownNodeType_Throws()
        {
            var graph = SimpleGraph(new[]
            {
                ("n", "nonexistentNodeType1234", (Dictionary<string, object>)null)
            });
            var ex = Assert.Throws<LoomException>(() => new LoomEngine(graph));
            Assert.AreEqual("UNKNOWN_NODE_TYPE", ex.Code);
        }

        // -------------------------------------------------------------------------
        // Test 9: DispatchEvent injects event into pointerClick.event
        // -------------------------------------------------------------------------
        [Test]
        public void Test09_DispatchEvent_InjectsEventToPointerClick()
        {
            var graph = SimpleGraph(new[]
            {
                ("click", "pointerClick", (Dictionary<string, object>)null)
            });
            var engine = new LoomEngine(graph);
            engine.EvaluateAt(0.0); // initialise

            var payload = new Dictionary<string, object> { ["x"] = (object)100.0, ["y"] = (object)200.0 };
            engine.DispatchEvent("click.event", payload);
            engine.EvaluateAt(1.0);

            var events = engine.GetValue("click", "event") as List<object>;
            Assert.IsNotNull(events);
            Assert.AreEqual(1, events.Count);
            Assert.AreSame(payload, events[0]);
        }

        // -------------------------------------------------------------------------
        // Test 10: Events are not carried over to the next frame
        // -------------------------------------------------------------------------
        [Test]
        public void Test10_Event_NotCarriedOverToNextFrame()
        {
            var graph = SimpleGraph(new[]
            {
                ("click", "pointerClick", (Dictionary<string, object>)null)
            });
            var engine = new LoomEngine(graph);

            engine.DispatchEvent("click.event", "payload");
            engine.EvaluateAt(0.0); // event consumed here

            engine.EvaluateAt(1.0); // next frame — no dispatch
            var events = engine.GetValue("click", "event") as List<object>;
            Assert.IsNotNull(events);
            Assert.AreEqual(0, events.Count, "Event must not persist to next frame");
        }

        // -------------------------------------------------------------------------
        // Test 11: filter passes events matching predicate == true
        // -------------------------------------------------------------------------
        [Test]
        public void Test11_Filter_PassesTruePredicate()
        {
            var graph = SimpleGraph(
                new[]
                {
                    ("click",  "pointerClick", (Dictionary<string, object>)null),
                    ("filt",   "filter",       new Dictionary<string, object> { ["predicate"] = (object)"value > 50" })
                },
                new[] { ("click.event", "filt.event") }
            );
            var engine = new LoomEngine(graph);

            engine.DispatchEvent("click.event", 100.0);
            engine.EvaluateAt(0.0);

            var events = engine.GetValue("filt", "event") as List<object>;
            Assert.IsNotNull(events);
            Assert.AreEqual(1, events.Count, "Event matching predicate should pass through");
        }

        // -------------------------------------------------------------------------
        // Test 12: filter drops events where predicate is false
        // -------------------------------------------------------------------------
        [Test]
        public void Test12_Filter_BlocksFalsePredicate()
        {
            var graph = SimpleGraph(
                new[]
                {
                    ("click",  "pointerClick", (Dictionary<string, object>)null),
                    ("filt",   "filter",       new Dictionary<string, object> { ["predicate"] = (object)"value > 50" })
                },
                new[] { ("click.event", "filt.event") }
            );
            var engine = new LoomEngine(graph);

            engine.DispatchEvent("click.event", 10.0);
            engine.EvaluateAt(0.0);

            var events = engine.GetValue("filt", "event") as List<object>;
            Assert.IsNotNull(events);
            Assert.AreEqual(0, events.Count, "Event not matching predicate should be dropped");
        }

        // -------------------------------------------------------------------------
        // Test 13: sample captures behavior value when trigger fires
        // -------------------------------------------------------------------------
        [Test]
        public void Test13_Sample_CapturesBehaviorOnTrigger()
        {
            var graph = SimpleGraph(
                new[]
                {
                    ("click", "pointerClick", (Dictionary<string, object>)null),
                    ("val",   "constant",     new Dictionary<string, object> { ["value"] = (object)77.0 }),
                    ("samp",  "sample",       (Dictionary<string, object>)null)
                },
                new[] { ("click.event", "samp.trigger"), ("val.out", "samp.value") }
            );
            var engine = new LoomEngine(graph);
            engine.DispatchEvent("click.event", null);
            engine.EvaluateAt(0.0);

            var events = engine.GetValue("samp", "event") as List<object>;
            Assert.IsNotNull(events);
            Assert.AreEqual(1, events.Count);
            Assert.AreEqual(77.0, events[0]);
        }

        // -------------------------------------------------------------------------
        // Test 14: merge combines events from same frame
        // -------------------------------------------------------------------------
        [Test]
        public void Test14_Merge_CombinesSameFrameEvents()
        {
            var graph = SimpleGraph(
                new[]
                {
                    ("ka", "keyDown", (Dictionary<string, object>)null),
                    ("kb", "keyDown", (Dictionary<string, object>)null),
                    ("m",  "merge",   (Dictionary<string, object>)null)
                },
                new[] { ("ka.event", "m.a"), ("kb.event", "m.b") }
            );
            var engine = new LoomEngine(graph);

            engine.DispatchEvent("ka.event", "A");
            engine.DispatchEvent("kb.event", "B");
            engine.EvaluateAt(0.0);

            var events = engine.GetValue("m", "event") as List<object>;
            Assert.IsNotNull(events);
            Assert.AreEqual(2, events.Count);
            Assert.AreEqual("A", events[0]);
            Assert.AreEqual("B", events[1]);
        }

        // -------------------------------------------------------------------------
        // Test 29: pointerPosition returns initial {x:0, y:0}
        // -------------------------------------------------------------------------
        [Test]
        public void Test29_PointerPosition_ReturnsInitialZero()
        {
            var graph = SimpleGraph(new[]
            {
                ("pos", "pointerPosition", (Dictionary<string, object>)null)
            });
            var engine = new LoomEngine(graph);
            engine.EvaluateAt(0.0);

            var pos = engine.GetValue("pos", "pos") as Dictionary<string, object>;
            Assert.IsNotNull(pos, "pos output should be a Dictionary<string,object>");
            Assert.AreEqual(0.0, pos["x"], "Initial x should be 0");
            Assert.AreEqual(0.0, pos["y"], "Initial y should be 0");
        }

        // -------------------------------------------------------------------------
        // Test 30: pointerPosition reflects SetPointerPosition()
        // -------------------------------------------------------------------------
        [Test]
        public void Test30_PointerPosition_ReturnsUpdatedPosition()
        {
            var graph = SimpleGraph(new[]
            {
                ("pos", "pointerPosition", (Dictionary<string, object>)null)
            });
            var engine = new LoomEngine(graph);
            engine.SetPointerPosition(10.0, 20.0);
            engine.EvaluateAt(0.0);

            var pos = engine.GetValue("pos", "pos") as Dictionary<string, object>;
            Assert.IsNotNull(pos);
            Assert.AreEqual(10.0, pos["x"], "x should be updated to 10");
            Assert.AreEqual(20.0, pos["y"], "y should be updated to 20");
        }
    }
}
