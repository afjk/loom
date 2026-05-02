using System;
using System.Collections.Generic;
using NUnit.Framework;

namespace Afjk.Loom.Tests
{
    /// <summary>
    /// Expression DSL tests (Tests 15-18 from the specification).
    /// All pure C# — no Unity types required.
    /// </summary>
    [TestFixture]
    public class LoomExpressionDslTests
    {
        private static object Eval(string expr, object payload) =>
            LoomExpressionDsl.Compile(expr)(payload);

        private static bool EvalBool(string expr, object payload)
        {
            var result = Eval(expr, payload);
            if (result is bool b) return b;
            return result != null;
        }

        // -------------------------------------------------------------------------
        // Test 15: value > 0
        // -------------------------------------------------------------------------
        [Test]
        public void Test15_ValueGreaterThanZero()
        {
            Assert.IsTrue(EvalBool("value > 0", (object)5.0));
            Assert.IsFalse(EvalBool("value > 0", (object)(-1.0)));
            Assert.IsFalse(EvalBool("value > 0", (object)0.0));
        }

        // -------------------------------------------------------------------------
        // Test 16: key == 'Enter'
        // -------------------------------------------------------------------------
        [Test]
        public void Test16_KeyEqualsEnter()
        {
            Assert.IsTrue(EvalBool("key == 'Enter'", (object)"Enter"));
            Assert.IsFalse(EvalBool("key == 'Enter'", (object)"Escape"));
            Assert.IsFalse(EvalBool("key == 'Enter'", (object)"enter")); // case-sensitive
        }

        // -------------------------------------------------------------------------
        // Test 17: value.x >= 10 && value.y < 20
        // -------------------------------------------------------------------------
        [Test]
        public void Test17_FieldAccessWithLogicalAnd()
        {
            var pass = new Dictionary<string, object> { ["x"] = (object)10.0, ["y"] = (object)15.0 };
            var failX = new Dictionary<string, object> { ["x"] = (object)9.0,  ["y"] = (object)15.0 };
            var failY = new Dictionary<string, object> { ["x"] = (object)10.0, ["y"] = (object)25.0 };

            Assert.IsTrue(EvalBool("value.x >= 10 && value.y < 20", pass));
            Assert.IsFalse(EvalBool("value.x >= 10 && value.y < 20", failX));
            Assert.IsFalse(EvalBool("value.x >= 10 && value.y < 20", failY));
        }

        // -------------------------------------------------------------------------
        // Test 18: invalid expression throws EXPRESSION_PARSE_ERROR
        // -------------------------------------------------------------------------
        [Test]
        public void Test18_InvalidExpression_ThrowsParseError()
        {
            var ex = Assert.Throws<LoomException>(() => LoomExpressionDsl.Compile("value @@ foo"));
            Assert.AreEqual("EXPRESSION_PARSE_ERROR", ex.Code);
        }

        // -------------------------------------------------------------------------
        // Additional expression tests
        // -------------------------------------------------------------------------

        [Test]
        public void ExtraTest_Arithmetic()
        {
            Assert.AreEqual(7.0, Eval("3 + 4", null));
            Assert.AreEqual(6.0, Eval("2 * 3", null));
            Assert.AreEqual(5.0, Eval("10 - 5", null));
            Assert.AreEqual(2.5, Eval("5 / 2", null));
        }

        [Test]
        public void ExtraTest_BooleanLiterals()
        {
            Assert.IsTrue(EvalBool("true", null));
            Assert.IsFalse(EvalBool("false", null));
        }

        [Test]
        public void ExtraTest_NotOperator()
        {
            Assert.IsFalse(EvalBool("!true", null));
            Assert.IsTrue(EvalBool("!false", null));
        }

        [Test]
        public void ExtraTest_OrOperator()
        {
            Assert.IsTrue(EvalBool("false || true", null));
            Assert.IsFalse(EvalBool("false || false", null));
        }

        [Test]
        public void ExtraTest_Parentheses()
        {
            Assert.AreEqual(14.0, Eval("(3 + 4) * 2", null));
        }

        [Test]
        public void ExtraTest_StringComparison()
        {
            Assert.IsTrue(EvalBool("value == 'hello'", (object)"hello"));
            Assert.IsFalse(EvalBool("value == 'hello'", (object)"world"));
        }

        [Test]
        public void ExtraTest_ValueFieldZ()
        {
            var payload = new Dictionary<string, object> { ["z"] = (object)5.0 };
            Assert.IsTrue(EvalBool("value.z > 3", payload));
        }

        [Test]
        public void ExtraTest_NumberComparisons()
        {
            Assert.IsTrue(EvalBool("value != 0", (object)1.0));
            Assert.IsFalse(EvalBool("value != 0", (object)0.0));
            Assert.IsTrue(EvalBool("value <= 5", (object)5.0));
            Assert.IsFalse(EvalBool("value < 5", (object)5.0));
        }

        // -------------------------------------------------------------------------
        // Test for incomparable types: string vs number should not produce false
        // positives on >= or <= (previously returned true due to CompareValues → 0)
        // -------------------------------------------------------------------------
        [Test]
        public void ExtraTest_IncomparableTypes_ReturnFalse()
        {
            // A string payload compared with a number must not be >= or <= anything
            Assert.IsFalse(EvalBool("value >= 0", (object)"hello"),
                ">= on incomparable types should be false, not true");
            Assert.IsFalse(EvalBool("value <= 0", (object)"hello"),
                "<= on incomparable types should be false, not true");
            Assert.IsFalse(EvalBool("value > 0", (object)"hello"),
                "> on incomparable types should be false");
            Assert.IsFalse(EvalBool("value < 0", (object)"hello"),
                "< on incomparable types should be false");
        }
    }
}
