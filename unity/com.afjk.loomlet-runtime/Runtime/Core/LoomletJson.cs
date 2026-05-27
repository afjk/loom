using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Loomlet.Runtime
{
    public sealed class LoomletJson
    {
        private readonly string _input;
        private int _pos;

        private LoomletJson(string input)
        {
            _input = input;
        }

        public static object Parse(string json)
        {
            if (json == null) throw new LoomletException("INVALID_JSON", "JSON must not be null.");
            var parser = new LoomletJson(json);
            var value = parser.ParseValue();
            parser.SkipWhitespace();
            if (parser._pos != parser._input.Length)
                throw new LoomletException("INVALID_JSON", "Unexpected trailing JSON characters.");
            return value;
        }

        public static string Stringify(object value)
        {
            if (value == null) return "null";
            if (value is string s) return "\"" + Escape(s) + "\"";
            if (value is bool b) return b ? "true" : "false";
            if (value is int || value is long || value is float || value is double || value is decimal)
                return Convert.ToDouble(value, CultureInfo.InvariantCulture).ToString("G17", CultureInfo.InvariantCulture);
            if (value is Dictionary<string, object> dict)
            {
                var parts = new List<string>();
                foreach (var key in dict.Keys)
                    parts.Add(Stringify(key) + ":" + Stringify(dict[key]));
                return "{" + string.Join(",", parts) + "}";
            }
            if (value is IList<object> list)
            {
                var parts = new List<string>();
                foreach (var item in list) parts.Add(Stringify(item));
                return "[" + string.Join(",", parts) + "]";
            }
            return Stringify(value.ToString());
        }

        private static string Escape(string value)
        {
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
        }

        private object ParseValue()
        {
            SkipWhitespace();
            var ch = Peek();
            if (ch == '{') return ParseObject();
            if (ch == '[') return ParseArray();
            if (ch == '"') return ParseString();
            if (ch == 't') return ParseKeyword("true", true);
            if (ch == 'f') return ParseKeyword("false", false);
            if (ch == 'n') return ParseKeyword("null", null);
            if (ch == '-' || char.IsDigit(ch)) return ParseNumber();
            throw new LoomletException("INVALID_JSON", "Unexpected JSON token.");
        }

        private Dictionary<string, object> ParseObject()
        {
            Consume('{');
            var result = new Dictionary<string, object>();
            SkipWhitespace();
            if (Peek() == '}')
            {
                _pos++;
                return result;
            }
            while (true)
            {
                var key = ParseString();
                SkipWhitespace();
                Consume(':');
                result[key] = ParseValue();
                SkipWhitespace();
                var ch = Next();
                if (ch == '}') return result;
                if (ch != ',') throw new LoomletException("INVALID_JSON", "Expected object separator.");
            }
        }

        private List<object> ParseArray()
        {
            Consume('[');
            var result = new List<object>();
            SkipWhitespace();
            if (Peek() == ']')
            {
                _pos++;
                return result;
            }
            while (true)
            {
                result.Add(ParseValue());
                SkipWhitespace();
                var ch = Next();
                if (ch == ']') return result;
                if (ch != ',') throw new LoomletException("INVALID_JSON", "Expected array separator.");
            }
        }

        private string ParseString()
        {
            Consume('"');
            var sb = new StringBuilder();
            while (_pos < _input.Length)
            {
                var ch = Next();
                if (ch == '"') return sb.ToString();
                if (ch != '\\')
                {
                    sb.Append(ch);
                    continue;
                }
                var esc = Next();
                switch (esc)
                {
                    case '"': sb.Append('"'); break;
                    case '\\': sb.Append('\\'); break;
                    case '/': sb.Append('/'); break;
                    case 'b': sb.Append('\b'); break;
                    case 'f': sb.Append('\f'); break;
                    case 'n': sb.Append('\n'); break;
                    case 'r': sb.Append('\r'); break;
                    case 't': sb.Append('\t'); break;
                    case 'u':
                        var hex = new string(new[] { Next(), Next(), Next(), Next() });
                        sb.Append((char)Convert.ToInt32(hex, 16));
                        break;
                    default:
                        throw new LoomletException("INVALID_JSON", "Invalid JSON escape.");
                }
            }
            throw new LoomletException("INVALID_JSON", "Unterminated JSON string.");
        }

        private object ParseKeyword(string keyword, object value)
        {
            for (var i = 0; i < keyword.Length; i++)
                if (Next() != keyword[i]) throw new LoomletException("INVALID_JSON", "Invalid JSON keyword.");
            return value;
        }

        private double ParseNumber()
        {
            var start = _pos;
            if (Peek() == '-') _pos++;
            while (_pos < _input.Length && char.IsDigit(_input[_pos])) _pos++;
            if (_pos < _input.Length && _input[_pos] == '.')
            {
                _pos++;
                while (_pos < _input.Length && char.IsDigit(_input[_pos])) _pos++;
            }
            if (_pos < _input.Length && (_input[_pos] == 'e' || _input[_pos] == 'E'))
            {
                _pos++;
                if (_pos < _input.Length && (_input[_pos] == '+' || _input[_pos] == '-')) _pos++;
                while (_pos < _input.Length && char.IsDigit(_input[_pos])) _pos++;
            }
            return double.Parse(_input.Substring(start, _pos - start), CultureInfo.InvariantCulture);
        }

        private void SkipWhitespace()
        {
            while (_pos < _input.Length && char.IsWhiteSpace(_input[_pos])) _pos++;
        }

        private char Peek() => _pos < _input.Length ? _input[_pos] : '\0';

        private char Next()
        {
            if (_pos >= _input.Length) throw new LoomletException("INVALID_JSON", "Unexpected end of JSON.");
            return _input[_pos++];
        }

        private void Consume(char expected)
        {
            SkipWhitespace();
            var actual = Next();
            if (actual != expected)
                throw new LoomletException("INVALID_JSON", "Unexpected JSON character.");
        }
    }
}
