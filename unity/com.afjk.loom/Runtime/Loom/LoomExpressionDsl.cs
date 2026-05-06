using System;
using System.Collections.Generic;
using System.Text;

namespace Afjk.Loom
{
    /// <summary>
    /// A minimal tokenizer / parser / evaluator for the Loom filter predicate DSL.
    /// Supports: numbers, strings (single-quoted), booleans, value, key, value.x, value.y,
    /// comparison operators (== != &lt; &lt;= &gt; &gt;=), logical operators (&amp;&amp; || !),
    /// arithmetic operators (+ - * /), and parentheses.
    ///
    /// This is a C# port of the JavaScript RestrictedDSLEvaluator in loom.js.
    /// </summary>
    public static class LoomExpressionDsl
    {
        // Token types
        private enum TokenType
        {
            Number, String, Bool,
            Ident,
            LParen, RParen,
            EQ, NE, LT, LE, GT, GE,
            AND, OR, NOT,
            Plus, Minus, Mul, Div,
            EOF
        }

        private struct Token
        {
            public TokenType Type;
            public object Value; // double for Number, string for String/Ident, bool for Bool
        }

        // AST node types
        private abstract class Expr { }
        private sealed class LiteralExpr : Expr { public object Value; }
        private sealed class IdentExpr : Expr { public string Name; }
        private sealed class FieldAccessExpr : Expr { public string Object; public string Field; }
        private sealed class BinaryExpr : Expr { public string Op; public Expr Left; public Expr Right; }
        private sealed class UnaryExpr : Expr { public string Op; public Expr Operand; }

        // -------------------------------------------------------------------------
        // Public API
        // -------------------------------------------------------------------------

        /// <summary>
        /// Compile a predicate expression string into an evaluator function.
        /// The evaluator accepts an event payload (object) and returns the result (object).
        /// Throws LoomException with code EXPRESSION_PARSE_ERROR on invalid syntax.
        /// </summary>
        public static Func<object, object> Compile(string expression, string nodeId = null)
        {
            if (expression == null) throw new ArgumentNullException(nameof(expression));
            var tokens = Tokenize(expression, nodeId);
            var ast = Parse(tokens, expression, nodeId);
            return payload => EvalAst(ast, payload);
        }

        // -------------------------------------------------------------------------
        // Tokenizer
        // -------------------------------------------------------------------------

        private static List<Token> Tokenize(string input, string nodeId)
        {
            var tokens = new List<Token>();
            var pos = 0;

            while (pos < input.Length)
            {
                // Skip whitespace
                while (pos < input.Length && (input[pos] == ' ' || input[pos] == '\t' ||
                                               input[pos] == '\r' || input[pos] == '\n'))
                    pos++;
                if (pos >= input.Length) break;

                var ch = input[pos];

                // Number (including negative literals handled in parser via unary minus)
                if (ch >= '0' && ch <= '9')
                {
                    var start = pos;
                    while (pos < input.Length && (input[pos] >= '0' && input[pos] <= '9' || input[pos] == '.'))
                        pos++;
                    var numStr = input.Substring(start, pos - start);
                    if (!double.TryParse(numStr, System.Globalization.NumberStyles.Float,
                        System.Globalization.CultureInfo.InvariantCulture, out var num))
                        ParseError($"Invalid number: {numStr}", nodeId);
                    tokens.Add(new Token { Type = TokenType.Number, Value = num });
                    continue;
                }

                // Single-quoted string
                if (ch == '\'')
                {
                    pos++; // consume opening quote
                    var sb = new StringBuilder();
                    while (pos < input.Length && input[pos] != '\'')
                        sb.Append(input[pos++]);
                    if (pos >= input.Length) ParseError("Unterminated string", nodeId);
                    pos++; // consume closing quote
                    tokens.Add(new Token { Type = TokenType.String, Value = sb.ToString() });
                    continue;
                }

                // Identifier or keyword
                if (ch == '_' || (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))
                {
                    var start = pos;
                    while (pos < input.Length &&
                           (input[pos] == '_' || input[pos] == '.' ||
                            (input[pos] >= 'a' && input[pos] <= 'z') ||
                            (input[pos] >= 'A' && input[pos] <= 'Z') ||
                            (input[pos] >= '0' && input[pos] <= '9')))
                        pos++;
                    var ident = input.Substring(start, pos - start);
                    if (ident == "true") tokens.Add(new Token { Type = TokenType.Bool, Value = (object)true });
                    else if (ident == "false") tokens.Add(new Token { Type = TokenType.Bool, Value = (object)false });
                    else tokens.Add(new Token { Type = TokenType.Ident, Value = ident });
                    continue;
                }

                // Two-character operators
                if (pos + 1 < input.Length)
                {
                    var two = input.Substring(pos, 2);
                    if (two == "==") { tokens.Add(new Token { Type = TokenType.EQ }); pos += 2; continue; }
                    if (two == "!=") { tokens.Add(new Token { Type = TokenType.NE }); pos += 2; continue; }
                    if (two == "<=") { tokens.Add(new Token { Type = TokenType.LE }); pos += 2; continue; }
                    if (two == ">=") { tokens.Add(new Token { Type = TokenType.GE }); pos += 2; continue; }
                    if (two == "&&") { tokens.Add(new Token { Type = TokenType.AND }); pos += 2; continue; }
                    if (two == "||") { tokens.Add(new Token { Type = TokenType.OR }); pos += 2; continue; }
                }

                // Single-character operators / punctuation
                switch (ch)
                {
                    case '(': tokens.Add(new Token { Type = TokenType.LParen }); pos++; break;
                    case ')': tokens.Add(new Token { Type = TokenType.RParen }); pos++; break;
                    case '!': tokens.Add(new Token { Type = TokenType.NOT }); pos++; break;
                    case '<': tokens.Add(new Token { Type = TokenType.LT }); pos++; break;
                    case '>': tokens.Add(new Token { Type = TokenType.GT }); pos++; break;
                    case '+': tokens.Add(new Token { Type = TokenType.Plus }); pos++; break;
                    case '-': tokens.Add(new Token { Type = TokenType.Minus }); pos++; break;
                    case '*': tokens.Add(new Token { Type = TokenType.Mul }); pos++; break;
                    case '/': tokens.Add(new Token { Type = TokenType.Div }); pos++; break;
                    default:
                        ParseError($"Unexpected character: '{ch}'", nodeId);
                        break;
                }
            }

            tokens.Add(new Token { Type = TokenType.EOF });
            return tokens;
        }

        // -------------------------------------------------------------------------
        // Parser (recursive descent)
        // -------------------------------------------------------------------------

        private sealed class Parser
        {
            private readonly List<Token> _tokens;
            private int _pos;
            private readonly string _nodeId;

            public Parser(List<Token> tokens, string nodeId)
            {
                _tokens = tokens;
                _pos = 0;
                _nodeId = nodeId;
            }

            private Token Current() => _tokens[_pos];
            private Token Consume() => _tokens[_pos++];

            private Token Expect(TokenType type)
            {
                var tok = Current();
                if (tok.Type != type)
                    ParseError($"Expected {type}, got {tok.Type}", _nodeId);
                return Consume();
            }

            public Expr ParseExpression() => ParseOr();

            private Expr ParseOr()
            {
                var left = ParseAnd();
                while (Current().Type == TokenType.OR)
                {
                    Consume();
                    var right = ParseAnd();
                    left = new BinaryExpr { Op = "||", Left = left, Right = right };
                }
                return left;
            }

            private Expr ParseAnd()
            {
                var left = ParseComparison();
                while (Current().Type == TokenType.AND)
                {
                    Consume();
                    var right = ParseComparison();
                    left = new BinaryExpr { Op = "&&", Left = left, Right = right };
                }
                return left;
            }

            private Expr ParseComparison()
            {
                var left = ParseAdditive();
                var tok = Current();
                string op = null;
                if (tok.Type == TokenType.EQ) op = "==";
                else if (tok.Type == TokenType.NE) op = "!=";
                else if (tok.Type == TokenType.LT) op = "<";
                else if (tok.Type == TokenType.LE) op = "<=";
                else if (tok.Type == TokenType.GT) op = ">";
                else if (tok.Type == TokenType.GE) op = ">=";

                if (op != null)
                {
                    Consume();
                    var right = ParseAdditive();
                    return new BinaryExpr { Op = op, Left = left, Right = right };
                }
                return left;
            }

            private Expr ParseAdditive()
            {
                var left = ParseMultiplicative();
                while (Current().Type == TokenType.Plus || Current().Type == TokenType.Minus)
                {
                    var op = Current().Type == TokenType.Plus ? "+" : "-";
                    Consume();
                    var right = ParseMultiplicative();
                    left = new BinaryExpr { Op = op, Left = left, Right = right };
                }
                return left;
            }

            private Expr ParseMultiplicative()
            {
                var left = ParseUnary();
                while (Current().Type == TokenType.Mul || Current().Type == TokenType.Div)
                {
                    var op = Current().Type == TokenType.Mul ? "*" : "/";
                    Consume();
                    var right = ParseUnary();
                    left = new BinaryExpr { Op = op, Left = left, Right = right };
                }
                return left;
            }

            private Expr ParseUnary()
            {
                if (Current().Type == TokenType.NOT)
                {
                    Consume();
                    return new UnaryExpr { Op = "!", Operand = ParseUnary() };
                }
                if (Current().Type == TokenType.Minus)
                {
                    Consume();
                    var operand = ParseUnary();
                    return new UnaryExpr { Op = "-", Operand = operand };
                }
                return ParsePrimary();
            }

            private Expr ParsePrimary()
            {
                var tok = Current();

                if (tok.Type == TokenType.Number)
                { Consume(); return new LiteralExpr { Value = tok.Value }; }

                if (tok.Type == TokenType.String)
                { Consume(); return new LiteralExpr { Value = tok.Value }; }

                if (tok.Type == TokenType.Bool)
                { Consume(); return new LiteralExpr { Value = tok.Value }; }

                if (tok.Type == TokenType.Ident)
                {
                    var ident = tok.Value as string;
                    Consume();
                    if (ident.Contains("."))
                    {
                        var dotIdx = ident.IndexOf('.');
                        var obj = ident.Substring(0, dotIdx);
                        var field = ident.Substring(dotIdx + 1);
                        if (obj == "value" && (field == "x" || field == "y"))
                            return new FieldAccessExpr { Object = "value", Field = field };
                        ParseError($"Invalid field access: '{ident}'", _nodeId);
                    }
                    return new IdentExpr { Name = ident };
                }

                if (tok.Type == TokenType.LParen)
                {
                    Consume();
                    var expr = ParseExpression();
                    Expect(TokenType.RParen);
                    return expr;
                }

                ParseError($"Unexpected token: {tok.Type}", _nodeId);
                return null; // unreachable
            }
        }

        private static Expr Parse(List<Token> tokens, string input, string nodeId)
        {
            var parser = new Parser(tokens, nodeId);
            var ast = parser.ParseExpression();
            return ast;
        }

        // -------------------------------------------------------------------------
        // Evaluator
        // -------------------------------------------------------------------------

        private static object EvalAst(Expr ast, object payload)
        {
            if (ast is LiteralExpr lit)
                return lit.Value;

            if (ast is IdentExpr ident)
            {
                if (ident.Name == "value") return payload;
                if (ident.Name == "key") return payload is string s ? (object)s : null;
                return null;
            }

            if (ast is FieldAccessExpr fieldAccess)
            {
                if (fieldAccess.Object == "value" && payload is IDictionary<string, object> dict)
                    return dict.TryGetValue(fieldAccess.Field, out var v) ? v : null;
                // Try anonymous type or dictionary-like access via dynamic field names
                if (fieldAccess.Object == "value" && payload != null)
                {
                    // Support System.Collections.Generic.Dictionary<string, object>
                    var payloadType = payload.GetType();
                    var prop = payloadType.GetProperty(fieldAccess.Field);
                    if (prop != null) return prop.GetValue(payload);
                }
                return null;
            }

            if (ast is UnaryExpr unary)
            {
                var operand = EvalAst(unary.Operand, payload);
                if (unary.Op == "!") return !IsTruthy(operand);
                if (unary.Op == "-")
                {
                    if (operand is double d) return -d;
                    return null;
                }
                return null;
            }

            if (ast is BinaryExpr binary)
            {
                var left = EvalAst(binary.Left, payload);
                var right = EvalAst(binary.Right, payload);

                switch (binary.Op)
                {
                    case "==": return Equals(left, right);
                    case "!=": return !Equals(left, right);
                    case "<":  { var c = CompareValues(left, right); return c.HasValue && c.Value <  0; }
                    case "<=": { var c = CompareValues(left, right); return c.HasValue && c.Value <= 0; }
                    case ">":  { var c = CompareValues(left, right); return c.HasValue && c.Value >  0; }
                    case ">=": { var c = CompareValues(left, right); return c.HasValue && c.Value >= 0; }
                    case "&&": return IsTruthy(left) && IsTruthy(right);
                    case "||": return IsTruthy(left) || IsTruthy(right);
                    case "+":
                        if (left is double la && right is double ra) return la + ra;
                        return null;
                    case "-":
                        if (left is double lb && right is double rb) return lb - rb;
                        return null;
                    case "*":
                        if (left is double lc && right is double rc) return lc * rc;
                        return null;
                    case "/":
                        if (left is double ld && right is double rd && rd != 0) return ld / rd;
                        return null;
                }
            }

            return null;
        }

        private static bool IsTruthy(object value)
        {
            if (value == null) return false;
            if (value is bool b) return b;
            if (value is double d) return d != 0;
            if (value is string s) return s.Length > 0;
            return true;
        }

        private static int? CompareValues(object left, object right)
        {
            if (left is double ld && right is double rd)
                return ld.CompareTo(rd);
            if (left is string ls && right is string rs)
                return string.Compare(ls, rs, StringComparison.Ordinal);
            return null; // incomparable types → callers should treat as false
        }

        private static void ParseError(string message, string nodeId)
        {
            var details = nodeId != null ? (object)new { nodeId, reason = message } : null;
            throw new LoomException("EXPRESSION_PARSE_ERROR",
                $"Expression parse error: {message}" + (nodeId != null ? $" (node: {nodeId})" : ""),
                details);
        }
    }
}
