using System;
using System.Collections.Generic;
using System.Text;

namespace Afjk.Loom
{
    /// <summary>
    /// Minimal JSON parser that handles the subset of JSON used by Loom graphs.
    /// Returns Dictionary&lt;string, object&gt; for objects, List&lt;object&gt; for arrays,
    /// string for strings, double for numbers, bool for booleans, and null for null.
    /// </summary>
    internal sealed class LoomJsonParser
    {
        private readonly string _input;
        private int _pos;

        private LoomJsonParser(string input)
        {
            _input = input;
            _pos = 0;
        }

        public static object Parse(string json)
        {
            if (json == null) throw new LoomException("INVALID_GRAPH", "JSON must not be null");
            var parser = new LoomJsonParser(json.Trim());
            var result = parser.ParseValue();
            parser.SkipWhitespace();
            if (parser._pos != parser._input.Length)
                throw new LoomException("INVALID_GRAPH", $"Unexpected characters after JSON at position {parser._pos}");
            return result;
        }

        private void SkipWhitespace()
        {
            while (_pos < _input.Length && (_input[_pos] == ' ' || _input[_pos] == '\t' ||
                                             _input[_pos] == '\r' || _input[_pos] == '\n'))
                _pos++;
        }

        private char Peek() => _pos < _input.Length ? _input[_pos] : '\0';

        private char Consume()
        {
            if (_pos >= _input.Length)
                throw new LoomException("INVALID_GRAPH", "Unexpected end of JSON input");
            return _input[_pos++];
        }

        private object ParseValue()
        {
            SkipWhitespace();
            var ch = Peek();

            if (ch == '{') return ParseObject();
            if (ch == '[') return ParseArray();
            if (ch == '"') return ParseString();
            if (ch == 't') return ParseKeyword("true", (object)true);
            if (ch == 'f') return ParseKeyword("false", (object)false);
            if (ch == 'n') return ParseKeyword("null", null);
            if (ch == '-' || (ch >= '0' && ch <= '9')) return ParseNumber();

            throw new LoomException("INVALID_GRAPH", $"Unexpected character '{ch}' at position {_pos}");
        }

        private Dictionary<string, object> ParseObject()
        {
            Consume(); // '{'
            var result = new Dictionary<string, object>();
            SkipWhitespace();

            if (Peek() == '}') { Consume(); return result; }

            while (true)
            {
                SkipWhitespace();
                var key = ParseString();
                SkipWhitespace();
                var colon = Consume();
                if (colon != ':')
                    throw new LoomException("INVALID_GRAPH", $"Expected ':' in object at position {_pos}, got '{colon}'");
                SkipWhitespace();
                result[key] = ParseValue();
                SkipWhitespace();
                var sep = Consume();
                if (sep == '}') break;
                if (sep != ',')
                    throw new LoomException("INVALID_GRAPH", $"Expected ',' or '}}' in object at position {_pos}, got '{sep}'");
            }

            return result;
        }

        private List<object> ParseArray()
        {
            Consume(); // '['
            var result = new List<object>();
            SkipWhitespace();

            if (Peek() == ']') { Consume(); return result; }

            while (true)
            {
                SkipWhitespace();
                result.Add(ParseValue());
                SkipWhitespace();
                var sep = Consume();
                if (sep == ']') break;
                if (sep != ',')
                    throw new LoomException("INVALID_GRAPH", $"Expected ',' or ']' in array at position {_pos}, got '{sep}'");
            }

            return result;
        }

        private string ParseString()
        {
            if (Consume() != '"')
                throw new LoomException("INVALID_GRAPH", $"Expected '\"' at position {_pos - 1}");
            var sb = new StringBuilder();

            while (_pos < _input.Length && _input[_pos] != '"')
            {
                var ch = Consume();
                if (ch == '\\')
                {
                    var esc = Consume();
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
                            var hex = new string(new[] { Consume(), Consume(), Consume(), Consume() });
                            sb.Append((char)Convert.ToInt32(hex, 16));
                            break;
                        default: sb.Append(esc); break;
                    }
                }
                else
                {
                    sb.Append(ch);
                }
            }

            if (_pos >= _input.Length)
                throw new LoomException("INVALID_GRAPH", "Unterminated string in JSON");
            Consume(); // closing '"'
            return sb.ToString();
        }

        private object ParseKeyword(string keyword, object value)
        {
            foreach (var c in keyword)
            {
                if (_pos >= _input.Length || _input[_pos] != c)
                    throw new LoomException("INVALID_GRAPH", $"Expected '{keyword}' at position {_pos}");
                _pos++;
            }
            return value;
        }

        private double ParseNumber()
        {
            var start = _pos;
            if (Peek() == '-') _pos++;
            while (_pos < _input.Length && _input[_pos] >= '0' && _input[_pos] <= '9') _pos++;
            if (_pos < _input.Length && _input[_pos] == '.')
            {
                _pos++;
                while (_pos < _input.Length && _input[_pos] >= '0' && _input[_pos] <= '9') _pos++;
            }
            if (_pos < _input.Length && (_input[_pos] == 'e' || _input[_pos] == 'E'))
            {
                _pos++;
                if (_pos < _input.Length && (_input[_pos] == '+' || _input[_pos] == '-')) _pos++;
                while (_pos < _input.Length && _input[_pos] >= '0' && _input[_pos] <= '9') _pos++;
            }

            var numStr = _input.Substring(start, _pos - start);
            if (double.TryParse(numStr, System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var result))
                return result;

            throw new LoomException("INVALID_GRAPH", $"Invalid number: {numStr}");
        }
    }

    // -------------------------------------------------------------------------
    // Graph model
    // -------------------------------------------------------------------------

    /// <summary>Loom graph definition (nodes + edges).</summary>
    public sealed class LoomGraph
    {
        public List<LoomGraphNode> Nodes { get; set; } = new List<LoomGraphNode>();
        public List<LoomGraphEdge> Edges { get; set; } = new List<LoomGraphEdge>();

        /// <summary>Parse a graph from JSON string.</summary>
        public static LoomGraph FromJson(string json)
        {
            var parsed = LoomJsonParser.Parse(json);
            if (!(parsed is Dictionary<string, object> obj))
                throw new LoomException("INVALID_GRAPH", "Graph JSON must be an object");
            return FromDictionary(obj);
        }

        internal static LoomGraph FromDictionary(Dictionary<string, object> obj)
        {
            if (!obj.TryGetValue("nodes", out var nodesRaw) || !(nodesRaw is List<object> nodesList))
                throw new LoomException("INVALID_GRAPH", "Graph must have a 'nodes' array");
            if (!obj.TryGetValue("edges", out var edgesRaw) || !(edgesRaw is List<object> edgesList))
                throw new LoomException("INVALID_GRAPH", "Graph must have an 'edges' array");

            var graph = new LoomGraph();

            foreach (var nodeRaw in nodesList)
            {
                if (!(nodeRaw is Dictionary<string, object> nodeObj))
                    throw new LoomException("INVALID_GRAPH", "Each node must be a JSON object");

                var node = new LoomGraphNode
                {
                    Id = nodeObj.TryGetValue("id", out var id) ? id?.ToString() : null,
                    Type = nodeObj.TryGetValue("type", out var type) ? type?.ToString() : null,
                    Params = new Dictionary<string, object>()
                };

                if (nodeObj.TryGetValue("params", out var paramsRaw) &&
                    paramsRaw is Dictionary<string, object> paramsObj)
                {
                    node.Params = paramsObj;
                }

                graph.Nodes.Add(node);
            }

            foreach (var edgeRaw in edgesList)
            {
                if (!(edgeRaw is Dictionary<string, object> edgeObj))
                    throw new LoomException("INVALID_GRAPH", "Each edge must be a JSON object");

                var edge = new LoomGraphEdge
                {
                    From = edgeObj.TryGetValue("from", out var from) ? from?.ToString() : null,
                    To = edgeObj.TryGetValue("to", out var to) ? to?.ToString() : null
                };

                graph.Edges.Add(edge);
            }

            return graph;
        }
    }

    /// <summary>A single node in a Loom graph.</summary>
    public sealed class LoomGraphNode
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public Dictionary<string, object> Params { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>A directed edge connecting two ports in a Loom graph.</summary>
    public sealed class LoomGraphEdge
    {
        /// <summary>Source port reference, e.g. "clock.t".</summary>
        public string From { get; set; }
        /// <summary>Destination port reference, e.g. "sine.t".</summary>
        public string To { get; set; }
    }

    // -------------------------------------------------------------------------
    // SceneSync message model
    // -------------------------------------------------------------------------

    /// <summary>A SceneSync protocol message (scene-graph-set, clear, patch, input).</summary>
    public sealed class SceneGraphMessage
    {
        public string Type { get; private set; }
        public bool IsScopeScene { get; private set; }
        public string ScopeObjectId { get; private set; }
        public LoomGraph Graph { get; private set; }

        public static SceneGraphMessage FromJson(string json)
        {
            var parsed = LoomJsonParser.Parse(json);
            if (!(parsed is Dictionary<string, object> obj))
                throw new LoomException("INVALID_MESSAGE", "Message JSON must be an object");
            return FromDictionary(obj);
        }

        internal static SceneGraphMessage FromDictionary(Dictionary<string, object> obj)
        {
            var msg = new SceneGraphMessage();

            if (!obj.TryGetValue("type", out var typeRaw) || !(typeRaw is string msgType))
                throw new LoomException("INVALID_MESSAGE", "Message must have a 'type' string field");
            msg.Type = msgType;

            // Parse scope
            if (obj.TryGetValue("scope", out var scopeRaw))
            {
                if (scopeRaw is string scopeStr)
                {
                    if (scopeStr != "scene")
                        throw new LoomException("INVALID_SCOPE",
                            $"scope string must be 'scene', got '{scopeStr}'");
                    msg.IsScopeScene = true;
                }
                else if (scopeRaw is Dictionary<string, object> scopeObj)
                {
                    if (!scopeObj.TryGetValue("object", out var targetRaw) || !(targetRaw is string targetId))
                        throw new LoomException("INVALID_SCOPE",
                            "scope object must have an 'object' string field");
                    msg.IsScopeScene = false;
                    msg.ScopeObjectId = targetId;
                }
                else
                {
                    throw new LoomException("INVALID_SCOPE",
                        "scope must be 'scene' or { object: targetId }");
                }
            }

            // Parse graph (optional)
            if (obj.TryGetValue("graph", out var graphRaw))
            {
                if (!(graphRaw is Dictionary<string, object> graphObj))
                    throw new LoomException("INVALID_GRAPH", "graph field must be a JSON object");
                msg.Graph = LoomGraph.FromDictionary(graphObj);
            }

            return msg;
        }
    }
}
