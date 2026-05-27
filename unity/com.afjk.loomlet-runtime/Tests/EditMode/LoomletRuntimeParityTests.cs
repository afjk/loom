using System;
using System.Collections.Generic;
using System.IO;
using NUnit.Framework;
using Loomlet.Runtime;

namespace Loomlet.Runtime.Tests
{
    public sealed class LoomletRuntimeParityTests
    {
        [Test]
        public void PortableFixtureSubsetMatchesExpectedValues()
        {
            var fixtures = LoadFixtureCases();
            Assert.Greater(fixtures.Count, 0);

            foreach (var fixture in fixtures)
            {
                var graph = LoomletGraph.FromJson(LoomletJson.Stringify(fixture["graph"]));
                var evaluator = new LoomletEvaluator(graph);
                var context = new LoomletEvaluationContext();

                if (fixture.TryGetValue("evaluate", out var evaluateRaw) && evaluateRaw is Dictionary<string, object> evaluate &&
                    evaluate.TryGetValue("env", out var envRaw) && envRaw is Dictionary<string, object> env)
                {
                    context.WithSceneClock(
                        env.TryGetValue("time", out var time) ? Convert.ToDouble(time) : 0,
                        env.TryGetValue("deltaTime", out var deltaTime) ? Convert.ToDouble(deltaTime) : 0
                    );
                }

                var result = evaluator.Evaluate(context);
                var actual = result.GetValue((string)fixture["get"]);
                AssertValueMatches(actual, fixture["expected"], fixture.TryGetValue("tolerance", out var tolerance) ? tolerance : null, (string)fixture["id"]);
            }
        }

        [Test]
        public void HostContextIsReadOnlyAndQueryable()
        {
            var graph = LoomletGraph.FromJson("{\"nodes\":[{\"id\":\"clock\",\"type\":\"scene.clock\"},{\"id\":\"input\",\"type\":\"host.input\",\"params\":{\"name\":\"viewer.distance\",\"fallback\":99}},{\"id\":\"event\",\"type\":\"host.event\",\"params\":{\"name\":\"object.activate\"}}],\"edges\":[]}");
            var evaluator = new LoomletEvaluator(graph);
            var context = new LoomletEvaluationContext()
                .WithSceneClock(12.5, 0.25, true, "server", 0.5)
                .SetHostInput("viewer.distance", 3.0)
                .AddHostEvent("object.activate", "tap");

            var result = evaluator.Evaluate(context);

            Assert.AreEqual(12.5, result.GetValue("clock.t"));
            Assert.AreEqual(0.25, result.GetValue("clock.delta"));
            Assert.AreEqual(true, result.GetValue("clock.isPaused"));
            Assert.AreEqual("server", result.GetValue("clock.mode"));
            Assert.AreEqual(0.5, result.GetValue("clock.rate"));
            Assert.AreEqual(3.0, result.GetValue("input.out"));
            Assert.AreEqual(1, ((List<object>)result.GetValue("event.events")).Count);
        }

        [Test]
        public void HostEventsCanBeClearedBetweenFrames()
        {
            var graph = LoomletGraph.FromJson("{\"nodes\":[{\"id\":\"event\",\"type\":\"host.event\",\"params\":{\"name\":\"object.activate\"}}],\"edges\":[]}");
            var evaluator = new LoomletEvaluator(graph);
            var context = new LoomletEvaluationContext().AddHostEvent("object.activate", "tap");

            var first = evaluator.Evaluate(context);
            context.ClearHostEvents();
            var second = evaluator.Evaluate(context);

            Assert.AreEqual(1, ((List<object>)first.GetValue("event.events")).Count);
            Assert.AreEqual(0, ((List<object>)second.GetValue("event.events")).Count);
        }

        [Test]
        public void ListReverseAndSortDoNotMutateInputLists()
        {
            var reverseGraph = LoomletGraph.FromJson("{\"nodes\":[{\"id\":\"src\",\"type\":\"host.input\",\"params\":{\"name\":\"list\"}},{\"id\":\"rev\",\"type\":\"list.reverse\"}],\"edges\":[{\"from\":\"src.out\",\"to\":\"rev.list\"}]}");
            var sortGraph = LoomletGraph.FromJson("{\"nodes\":[{\"id\":\"src\",\"type\":\"host.input\",\"params\":{\"name\":\"list\"}},{\"id\":\"sort\",\"type\":\"list.sort\"}],\"edges\":[{\"from\":\"src.out\",\"to\":\"sort.list\"}]}");
            var input = new List<object> { 3.0, 1.0, 2.0 };

            new LoomletEvaluator(reverseGraph).Evaluate(new LoomletEvaluationContext().SetHostInput("list", input));
            Assert.AreEqual("[3,1,2]", LoomletJson.Stringify(input));

            new LoomletEvaluator(sortGraph).Evaluate(new LoomletEvaluationContext().SetHostInput("list", input));
            Assert.AreEqual("[3,1,2]", LoomletJson.Stringify(input));
        }

        private static List<Dictionary<string, object>> LoadFixtureCases()
        {
            var path = FindFixturePath();
            var root = (Dictionary<string, object>)LoomletJson.Parse(File.ReadAllText(path));
            var cases = (List<object>)root["cases"];
            var result = new List<Dictionary<string, object>>();
            foreach (var item in cases)
                result.Add((Dictionary<string, object>)item);
            return result;
        }

        private static string FindFixturePath()
        {
            var relative = Path.Combine("unity", "com.afjk.loomlet-runtime", "Tests", "Fixtures", "portable-node-cases.json");
            var candidates = new List<string>
            {
                Path.Combine(Directory.GetCurrentDirectory(), relative),
                Path.Combine(TestContext.CurrentContext.TestDirectory, "portable-node-cases.json"),
                Path.GetFullPath(Path.Combine(TestContext.CurrentContext.TestDirectory, "..", "..", "Tests", "Fixtures", "portable-node-cases.json"))
            };

            var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (dir != null)
            {
                candidates.Add(Path.Combine(dir.FullName, relative));
                candidates.Add(Path.Combine(dir.FullName, "Packages", "com.afjk.loomlet-runtime", "Tests", "Fixtures", "portable-node-cases.json"));
                dir = dir.Parent;
            }

            foreach (var candidate in candidates)
                if (File.Exists(candidate)) return candidate;

            throw new FileNotFoundException("Could not find Unity runtime parity fixtures.");
        }

        private static void AssertValueMatches(object actual, object expected, object tolerance, string caseId)
        {
            if (expected is double expectedNumber && tolerance is double toleranceNumber)
            {
                Assert.LessOrEqual(Math.Abs(Convert.ToDouble(actual) - expectedNumber), toleranceNumber, caseId);
                return;
            }

            Assert.AreEqual(Normalize(expected), Normalize(actual), caseId);
        }

        private static string Normalize(object value) => LoomletJson.Stringify(value);
    }
}
