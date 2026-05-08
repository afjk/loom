var LoomletPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (let key of __getOwnPropNames(from2))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@babel/runtime/helpers/OverloadYield.js
  var require_OverloadYield = __commonJS({
    "node_modules/@babel/runtime/helpers/OverloadYield.js"(exports, module) {
      function _OverloadYield(e, d2) {
        this.v = e, this.k = d2;
      }
      module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorDefine.js
  var require_regeneratorDefine = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorDefine.js"(exports, module) {
      function _regeneratorDefine(e, r2, n2, t2) {
        var i2 = Object.defineProperty;
        try {
          i2({}, "", {});
        } catch (e2) {
          i2 = 0;
        }
        module.exports = _regeneratorDefine = function regeneratorDefine(e2, r3, n3, t3) {
          function o(r4, n4) {
            _regeneratorDefine(e2, r4, function(e3) {
              return this._invoke(r4, n4, e3);
            });
          }
          r3 ? i2 ? i2(e2, r3, {
            value: n3,
            enumerable: !t3,
            configurable: !t3,
            writable: !t3
          }) : e2[r3] = n3 : (o("next", 0), o("throw", 1), o("return", 2));
        }, module.exports.__esModule = true, module.exports["default"] = module.exports, _regeneratorDefine(e, r2, n2, t2);
      }
      module.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regenerator.js
  var require_regenerator = __commonJS({
    "node_modules/@babel/runtime/helpers/regenerator.js"(exports, module) {
      var regeneratorDefine = require_regeneratorDefine();
      function _regenerator() {
        var e, t2, r2 = "function" == typeof Symbol ? Symbol : {}, n2 = r2.iterator || "@@iterator", o = r2.toStringTag || "@@toStringTag";
        function i2(r3, n3, o2, i3) {
          var c3 = n3 && n3.prototype instanceof Generator ? n3 : Generator, u3 = Object.create(c3.prototype);
          return regeneratorDefine(u3, "_invoke", function(r4, n4, o3) {
            var i4, c4, u4, f3 = 0, p2 = o3 || [], y = false, G2 = {
              p: 0,
              n: 0,
              v: e,
              a: d2,
              f: d2.bind(e, 4),
              d: function d3(t3, r5) {
                return i4 = t3, c4 = 0, u4 = e, G2.n = r5, a2;
              }
            };
            function d2(r5, n5) {
              for (c4 = r5, u4 = n5, t2 = 0; !y && f3 && !o4 && t2 < p2.length; t2++) {
                var o4, i5 = p2[t2], d3 = G2.p, l2 = i5[2];
                r5 > 3 ? (o4 = l2 === n5) && (u4 = i5[(c4 = i5[4]) ? 5 : (c4 = 3, 3)], i5[4] = i5[5] = e) : i5[0] <= d3 && ((o4 = r5 < 2 && d3 < i5[1]) ? (c4 = 0, G2.v = n5, G2.n = i5[1]) : d3 < l2 && (o4 = r5 < 3 || i5[0] > n5 || n5 > l2) && (i5[4] = r5, i5[5] = n5, G2.n = l2, c4 = 0));
              }
              if (o4 || r5 > 1) return a2;
              throw y = true, n5;
            }
            return function(o4, p3, l2) {
              if (f3 > 1) throw TypeError("Generator is already running");
              for (y && 1 === p3 && d2(p3, l2), c4 = p3, u4 = l2; (t2 = c4 < 2 ? e : u4) || !y; ) {
                i4 || (c4 ? c4 < 3 ? (c4 > 1 && (G2.n = -1), d2(c4, u4)) : G2.n = u4 : G2.v = u4);
                try {
                  if (f3 = 2, i4) {
                    if (c4 || (o4 = "next"), t2 = i4[o4]) {
                      if (!(t2 = t2.call(i4, u4))) throw TypeError("iterator result is not an object");
                      if (!t2.done) return t2;
                      u4 = t2.value, c4 < 2 && (c4 = 0);
                    } else 1 === c4 && (t2 = i4["return"]) && t2.call(i4), c4 < 2 && (u4 = TypeError("The iterator does not provide a '" + o4 + "' method"), c4 = 1);
                    i4 = e;
                  } else if ((t2 = (y = G2.n < 0) ? u4 : r4.call(n4, G2)) !== a2) break;
                } catch (t3) {
                  i4 = e, c4 = 1, u4 = t3;
                } finally {
                  f3 = 1;
                }
              }
              return {
                value: t2,
                done: y
              };
            };
          }(r3, o2, i3), true), u3;
        }
        var a2 = {};
        function Generator() {
        }
        function GeneratorFunction() {
        }
        function GeneratorFunctionPrototype() {
        }
        t2 = Object.getPrototypeOf;
        var c2 = [][n2] ? t2(t2([][n2]())) : (regeneratorDefine(t2 = {}, n2, function() {
          return this;
        }), t2), u2 = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c2);
        function f2(e2) {
          return Object.setPrototypeOf ? Object.setPrototypeOf(e2, GeneratorFunctionPrototype) : (e2.__proto__ = GeneratorFunctionPrototype, regeneratorDefine(e2, o, "GeneratorFunction")), e2.prototype = Object.create(u2), e2;
        }
        return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine(u2, "constructor", GeneratorFunctionPrototype), regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), regeneratorDefine(u2), regeneratorDefine(u2, o, "Generator"), regeneratorDefine(u2, n2, function() {
          return this;
        }), regeneratorDefine(u2, "toString", function() {
          return "[object Generator]";
        }), (module.exports = _regenerator = function _regenerator2() {
          return {
            w: i2,
            m: f2
          };
        }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
      }
      module.exports = _regenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js
  var require_regeneratorAsyncIterator = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js"(exports, module) {
      var OverloadYield = require_OverloadYield();
      var regeneratorDefine = require_regeneratorDefine();
      function AsyncIterator(t2, e) {
        function n2(r3, o, i2, f2) {
          try {
            var c2 = t2[r3](o), u2 = c2.value;
            return u2 instanceof OverloadYield ? e.resolve(u2.v).then(function(t3) {
              n2("next", t3, i2, f2);
            }, function(t3) {
              n2("throw", t3, i2, f2);
            }) : e.resolve(u2).then(function(t3) {
              c2.value = t3, i2(c2);
            }, function(t3) {
              return n2("throw", t3, i2, f2);
            });
          } catch (t3) {
            f2(t3);
          }
        }
        var r2;
        this.next || (regeneratorDefine(AsyncIterator.prototype), regeneratorDefine(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function() {
          return this;
        })), regeneratorDefine(this, "_invoke", function(t3, o, i2) {
          function f2() {
            return new e(function(e2, r3) {
              n2(t3, i2, e2, r3);
            });
          }
          return r2 = r2 ? r2.then(f2, f2) : f2();
        }, true);
      }
      module.exports = AsyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js
  var require_regeneratorAsyncGen = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js"(exports, module) {
      var regenerator = require_regenerator();
      var regeneratorAsyncIterator = require_regeneratorAsyncIterator();
      function _regeneratorAsyncGen(r2, e, t2, o, n2) {
        return new regeneratorAsyncIterator(regenerator().w(r2, e, t2, o), n2 || Promise);
      }
      module.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorAsync.js
  var require_regeneratorAsync = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorAsync.js"(exports, module) {
      var regeneratorAsyncGen = require_regeneratorAsyncGen();
      function _regeneratorAsync(n2, e, r2, t2, o) {
        var a2 = regeneratorAsyncGen(n2, e, r2, t2, o);
        return a2.next().then(function(n3) {
          return n3.done ? n3.value : a2.next();
        });
      }
      module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorKeys.js
  var require_regeneratorKeys = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorKeys.js"(exports, module) {
      function _regeneratorKeys(e) {
        var n2 = Object(e), r2 = [];
        for (var t2 in n2) r2.unshift(t2);
        return function e2() {
          for (; r2.length; ) if ((t2 = r2.pop()) in n2) return e2.value = t2, e2.done = false, e2;
          return e2.done = true, e2;
        };
      }
      module.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/typeof.js
  var require_typeof = __commonJS({
    "node_modules/@babel/runtime/helpers/typeof.js"(exports, module) {
      function _typeof2(o) {
        "@babel/helpers - typeof";
        return module.exports = _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof2(o);
      }
      module.exports = _typeof2, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorValues.js
  var require_regeneratorValues = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorValues.js"(exports, module) {
      var _typeof2 = require_typeof()["default"];
      function _regeneratorValues(e) {
        if (null != e) {
          var t2 = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r2 = 0;
          if (t2) return t2.call(e);
          if ("function" == typeof e.next) return e;
          if (!isNaN(e.length)) return {
            next: function next2() {
              return e && r2 >= e.length && (e = void 0), {
                value: e && e[r2++],
                done: !e
              };
            }
          };
        }
        throw new TypeError(_typeof2(e) + " is not iterable");
      }
      module.exports = _regeneratorValues, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/helpers/regeneratorRuntime.js
  var require_regeneratorRuntime = __commonJS({
    "node_modules/@babel/runtime/helpers/regeneratorRuntime.js"(exports, module) {
      var OverloadYield = require_OverloadYield();
      var regenerator = require_regenerator();
      var regeneratorAsync = require_regeneratorAsync();
      var regeneratorAsyncGen = require_regeneratorAsyncGen();
      var regeneratorAsyncIterator = require_regeneratorAsyncIterator();
      var regeneratorKeys = require_regeneratorKeys();
      var regeneratorValues = require_regeneratorValues();
      function _regeneratorRuntime6() {
        "use strict";
        var r2 = regenerator(), e = r2.m(_regeneratorRuntime6), t2 = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;
        function n2(r3) {
          var e2 = "function" == typeof r3 && r3.constructor;
          return !!e2 && (e2 === t2 || "GeneratorFunction" === (e2.displayName || e2.name));
        }
        var o = {
          "throw": 1,
          "return": 2,
          "break": 3,
          "continue": 3
        };
        function a2(r3) {
          var e2, t3;
          return function(n3) {
            e2 || (e2 = {
              stop: function stop() {
                return t3(n3.a, 2);
              },
              "catch": function _catch() {
                return n3.v;
              },
              abrupt: function abrupt(r4, e3) {
                return t3(n3.a, o[r4], e3);
              },
              delegateYield: function delegateYield(r4, o2, a3) {
                return e2.resultName = o2, t3(n3.d, regeneratorValues(r4), a3);
              },
              finish: function finish(r4) {
                return t3(n3.f, r4);
              }
            }, t3 = function t4(r4, _t2, o2) {
              n3.p = e2.prev, n3.n = e2.next;
              try {
                return r4(_t2, o2);
              } finally {
                e2.next = n3.n;
              }
            }), e2.resultName && (e2[e2.resultName] = n3.v, e2.resultName = void 0), e2.sent = n3.v, e2.next = n3.n;
            try {
              return r3.call(this, e2);
            } finally {
              n3.p = e2.prev, n3.n = e2.next;
            }
          };
        }
        return (module.exports = _regeneratorRuntime6 = function _regeneratorRuntime7() {
          return {
            wrap: function wrap(e2, t3, n3, o2) {
              return r2.w(a2(e2), t3, n3, o2 && o2.reverse());
            },
            isGeneratorFunction: n2,
            mark: r2.m,
            awrap: function awrap(r3, e2) {
              return new OverloadYield(r3, e2);
            },
            AsyncIterator: regeneratorAsyncIterator,
            async: function async(r3, e2, t3, o2, u2) {
              return (n2(e2) ? regeneratorAsyncGen : regeneratorAsync)(a2(r3), e2, t3, o2, u2);
            },
            keys: regeneratorKeys,
            values: regeneratorValues
          };
        }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
      }
      module.exports = _regeneratorRuntime6, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }
  });

  // node_modules/@babel/runtime/regenerator/index.js
  var require_regenerator2 = __commonJS({
    "node_modules/@babel/runtime/regenerator/index.js"(exports, module) {
      var runtime = require_regeneratorRuntime()();
      module.exports = runtime;
      try {
        regeneratorRuntime = runtime;
      } catch (accidentalStrictMode) {
        if (typeof globalThis === "object") {
          globalThis.regeneratorRuntime = runtime;
        } else {
          Function("r", "regeneratorRuntime = r")(runtime);
        }
      }
    }
  });

  // node_modules/react/cjs/react.production.min.js
  var require_react_production_min = __commonJS({
    "node_modules/react/cjs/react.production.min.js"(exports) {
      "use strict";
      var l2 = Symbol.for("react.element");
      var n2 = Symbol.for("react.portal");
      var p2 = Symbol.for("react.fragment");
      var q2 = Symbol.for("react.strict_mode");
      var r2 = Symbol.for("react.profiler");
      var t2 = Symbol.for("react.provider");
      var u2 = Symbol.for("react.context");
      var v2 = Symbol.for("react.forward_ref");
      var w2 = Symbol.for("react.suspense");
      var x2 = Symbol.for("react.memo");
      var y = Symbol.for("react.lazy");
      var z2 = Symbol.iterator;
      function A(a2) {
        if (null === a2 || "object" !== typeof a2) return null;
        a2 = z2 && a2[z2] || a2["@@iterator"];
        return "function" === typeof a2 ? a2 : null;
      }
      var B2 = { isMounted: function() {
        return false;
      }, enqueueForceUpdate: function() {
      }, enqueueReplaceState: function() {
      }, enqueueSetState: function() {
      } };
      var C2 = Object.assign;
      var D2 = {};
      function E2(a2, b2, e) {
        this.props = a2;
        this.context = b2;
        this.refs = D2;
        this.updater = e || B2;
      }
      E2.prototype.isReactComponent = {};
      E2.prototype.setState = function(a2, b2) {
        if ("object" !== typeof a2 && "function" !== typeof a2 && null != a2) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, a2, b2, "setState");
      };
      E2.prototype.forceUpdate = function(a2) {
        this.updater.enqueueForceUpdate(this, a2, "forceUpdate");
      };
      function F2() {
      }
      F2.prototype = E2.prototype;
      function G2(a2, b2, e) {
        this.props = a2;
        this.context = b2;
        this.refs = D2;
        this.updater = e || B2;
      }
      var H2 = G2.prototype = new F2();
      H2.constructor = G2;
      C2(H2, E2.prototype);
      H2.isPureReactComponent = true;
      var I2 = Array.isArray;
      var J2 = Object.prototype.hasOwnProperty;
      var K2 = { current: null };
      var L2 = { key: true, ref: true, __self: true, __source: true };
      function M2(a2, b2, e) {
        var d2, c2 = {}, k2 = null, h2 = null;
        if (null != b2) for (d2 in void 0 !== b2.ref && (h2 = b2.ref), void 0 !== b2.key && (k2 = "" + b2.key), b2) J2.call(b2, d2) && !L2.hasOwnProperty(d2) && (c2[d2] = b2[d2]);
        var g = arguments.length - 2;
        if (1 === g) c2.children = e;
        else if (1 < g) {
          for (var f2 = Array(g), m2 = 0; m2 < g; m2++) f2[m2] = arguments[m2 + 2];
          c2.children = f2;
        }
        if (a2 && a2.defaultProps) for (d2 in g = a2.defaultProps, g) void 0 === c2[d2] && (c2[d2] = g[d2]);
        return { $$typeof: l2, type: a2, key: k2, ref: h2, props: c2, _owner: K2.current };
      }
      function N2(a2, b2) {
        return { $$typeof: l2, type: a2.type, key: b2, ref: a2.ref, props: a2.props, _owner: a2._owner };
      }
      function O2(a2) {
        return "object" === typeof a2 && null !== a2 && a2.$$typeof === l2;
      }
      function escape(a2) {
        var b2 = { "=": "=0", ":": "=2" };
        return "$" + a2.replace(/[=:]/g, function(a3) {
          return b2[a3];
        });
      }
      var P = /\/+/g;
      function Q2(a2, b2) {
        return "object" === typeof a2 && null !== a2 && null != a2.key ? escape("" + a2.key) : b2.toString(36);
      }
      function R2(a2, b2, e, d2, c2) {
        var k2 = typeof a2;
        if ("undefined" === k2 || "boolean" === k2) a2 = null;
        var h2 = false;
        if (null === a2) h2 = true;
        else switch (k2) {
          case "string":
          case "number":
            h2 = true;
            break;
          case "object":
            switch (a2.$$typeof) {
              case l2:
              case n2:
                h2 = true;
            }
        }
        if (h2) return h2 = a2, c2 = c2(h2), a2 = "" === d2 ? "." + Q2(h2, 0) : d2, I2(c2) ? (e = "", null != a2 && (e = a2.replace(P, "$&/") + "/"), R2(c2, b2, e, "", function(a3) {
          return a3;
        })) : null != c2 && (O2(c2) && (c2 = N2(c2, e + (!c2.key || h2 && h2.key === c2.key ? "" : ("" + c2.key).replace(P, "$&/") + "/") + a2)), b2.push(c2)), 1;
        h2 = 0;
        d2 = "" === d2 ? "." : d2 + ":";
        if (I2(a2)) for (var g = 0; g < a2.length; g++) {
          k2 = a2[g];
          var f2 = d2 + Q2(k2, g);
          h2 += R2(k2, b2, e, f2, c2);
        }
        else if (f2 = A(a2), "function" === typeof f2) for (a2 = f2.call(a2), g = 0; !(k2 = a2.next()).done; ) k2 = k2.value, f2 = d2 + Q2(k2, g++), h2 += R2(k2, b2, e, f2, c2);
        else if ("object" === k2) throw b2 = String(a2), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b2 ? "object with keys {" + Object.keys(a2).join(", ") + "}" : b2) + "). If you meant to render a collection of children, use an array instead.");
        return h2;
      }
      function S2(a2, b2, e) {
        if (null == a2) return a2;
        var d2 = [], c2 = 0;
        R2(a2, d2, "", "", function(a3) {
          return b2.call(e, a3, c2++);
        });
        return d2;
      }
      function T2(a2) {
        if (-1 === a2._status) {
          var b2 = a2._result;
          b2 = b2();
          b2.then(function(b3) {
            if (0 === a2._status || -1 === a2._status) a2._status = 1, a2._result = b3;
          }, function(b3) {
            if (0 === a2._status || -1 === a2._status) a2._status = 2, a2._result = b3;
          });
          -1 === a2._status && (a2._status = 0, a2._result = b2);
        }
        if (1 === a2._status) return a2._result.default;
        throw a2._result;
      }
      var U2 = { current: null };
      var V2 = { transition: null };
      var W2 = { ReactCurrentDispatcher: U2, ReactCurrentBatchConfig: V2, ReactCurrentOwner: K2 };
      exports.Children = { map: S2, forEach: function(a2, b2, e) {
        S2(a2, function() {
          b2.apply(this, arguments);
        }, e);
      }, count: function(a2) {
        var b2 = 0;
        S2(a2, function() {
          b2++;
        });
        return b2;
      }, toArray: function(a2) {
        return S2(a2, function(a3) {
          return a3;
        }) || [];
      }, only: function(a2) {
        if (!O2(a2)) throw Error("React.Children.only expected to receive a single React element child.");
        return a2;
      } };
      exports.Component = E2;
      exports.Fragment = p2;
      exports.Profiler = r2;
      exports.PureComponent = G2;
      exports.StrictMode = q2;
      exports.Suspense = w2;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W2;
      exports.cloneElement = function(a2, b2, e) {
        if (null === a2 || void 0 === a2) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a2 + ".");
        var d2 = C2({}, a2.props), c2 = a2.key, k2 = a2.ref, h2 = a2._owner;
        if (null != b2) {
          void 0 !== b2.ref && (k2 = b2.ref, h2 = K2.current);
          void 0 !== b2.key && (c2 = "" + b2.key);
          if (a2.type && a2.type.defaultProps) var g = a2.type.defaultProps;
          for (f2 in b2) J2.call(b2, f2) && !L2.hasOwnProperty(f2) && (d2[f2] = void 0 === b2[f2] && void 0 !== g ? g[f2] : b2[f2]);
        }
        var f2 = arguments.length - 2;
        if (1 === f2) d2.children = e;
        else if (1 < f2) {
          g = Array(f2);
          for (var m2 = 0; m2 < f2; m2++) g[m2] = arguments[m2 + 2];
          d2.children = g;
        }
        return { $$typeof: l2, type: a2.type, key: c2, ref: k2, props: d2, _owner: h2 };
      };
      exports.createContext = function(a2) {
        a2 = { $$typeof: u2, _currentValue: a2, _currentValue2: a2, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
        a2.Provider = { $$typeof: t2, _context: a2 };
        return a2.Consumer = a2;
      };
      exports.createElement = M2;
      exports.createFactory = function(a2) {
        var b2 = M2.bind(null, a2);
        b2.type = a2;
        return b2;
      };
      exports.createRef = function() {
        return { current: null };
      };
      exports.forwardRef = function(a2) {
        return { $$typeof: v2, render: a2 };
      };
      exports.isValidElement = O2;
      exports.lazy = function(a2) {
        return { $$typeof: y, _payload: { _status: -1, _result: a2 }, _init: T2 };
      };
      exports.memo = function(a2, b2) {
        return { $$typeof: x2, type: a2, compare: void 0 === b2 ? null : b2 };
      };
      exports.startTransition = function(a2) {
        var b2 = V2.transition;
        V2.transition = {};
        try {
          a2();
        } finally {
          V2.transition = b2;
        }
      };
      exports.unstable_act = function() {
        throw Error("act(...) is not supported in production builds of React.");
      };
      exports.useCallback = function(a2, b2) {
        return U2.current.useCallback(a2, b2);
      };
      exports.useContext = function(a2) {
        return U2.current.useContext(a2);
      };
      exports.useDebugValue = function() {
      };
      exports.useDeferredValue = function(a2) {
        return U2.current.useDeferredValue(a2);
      };
      exports.useEffect = function(a2, b2) {
        return U2.current.useEffect(a2, b2);
      };
      exports.useId = function() {
        return U2.current.useId();
      };
      exports.useImperativeHandle = function(a2, b2, e) {
        return U2.current.useImperativeHandle(a2, b2, e);
      };
      exports.useInsertionEffect = function(a2, b2) {
        return U2.current.useInsertionEffect(a2, b2);
      };
      exports.useLayoutEffect = function(a2, b2) {
        return U2.current.useLayoutEffect(a2, b2);
      };
      exports.useMemo = function(a2, b2) {
        return U2.current.useMemo(a2, b2);
      };
      exports.useReducer = function(a2, b2, e) {
        return U2.current.useReducer(a2, b2, e);
      };
      exports.useRef = function(a2) {
        return U2.current.useRef(a2);
      };
      exports.useState = function(a2) {
        return U2.current.useState(a2);
      };
      exports.useSyncExternalStore = function(a2, b2, e) {
        return U2.current.useSyncExternalStore(a2, b2, e);
      };
      exports.useTransition = function() {
        return U2.current.useTransition();
      };
      exports.version = "18.2.0";
    }
  });

  // node_modules/react/index.js
  var require_react = __commonJS({
    "node_modules/react/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/scheduler/cjs/scheduler.production.min.js
  var require_scheduler_production_min = __commonJS({
    "node_modules/scheduler/cjs/scheduler.production.min.js"(exports) {
      "use strict";
      function f2(a2, b2) {
        var c2 = a2.length;
        a2.push(b2);
        a: for (; 0 < c2; ) {
          var d2 = c2 - 1 >>> 1, e = a2[d2];
          if (0 < g(e, b2)) a2[d2] = b2, a2[c2] = e, c2 = d2;
          else break a;
        }
      }
      function h2(a2) {
        return 0 === a2.length ? null : a2[0];
      }
      function k2(a2) {
        if (0 === a2.length) return null;
        var b2 = a2[0], c2 = a2.pop();
        if (c2 !== b2) {
          a2[0] = c2;
          a: for (var d2 = 0, e = a2.length, w2 = e >>> 1; d2 < w2; ) {
            var m2 = 2 * (d2 + 1) - 1, C2 = a2[m2], n2 = m2 + 1, x2 = a2[n2];
            if (0 > g(C2, c2)) n2 < e && 0 > g(x2, C2) ? (a2[d2] = x2, a2[n2] = c2, d2 = n2) : (a2[d2] = C2, a2[m2] = c2, d2 = m2);
            else if (n2 < e && 0 > g(x2, c2)) a2[d2] = x2, a2[n2] = c2, d2 = n2;
            else break a;
          }
        }
        return b2;
      }
      function g(a2, b2) {
        var c2 = a2.sortIndex - b2.sortIndex;
        return 0 !== c2 ? c2 : a2.id - b2.id;
      }
      if ("object" === typeof performance && "function" === typeof performance.now) {
        l2 = performance;
        exports.unstable_now = function() {
          return l2.now();
        };
      } else {
        p2 = Date, q2 = p2.now();
        exports.unstable_now = function() {
          return p2.now() - q2;
        };
      }
      var l2;
      var p2;
      var q2;
      var r2 = [];
      var t2 = [];
      var u2 = 1;
      var v2 = null;
      var y = 3;
      var z2 = false;
      var A = false;
      var B2 = false;
      var D2 = "function" === typeof setTimeout ? setTimeout : null;
      var E2 = "function" === typeof clearTimeout ? clearTimeout : null;
      var F2 = "undefined" !== typeof setImmediate ? setImmediate : null;
      "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function G2(a2) {
        for (var b2 = h2(t2); null !== b2; ) {
          if (null === b2.callback) k2(t2);
          else if (b2.startTime <= a2) k2(t2), b2.sortIndex = b2.expirationTime, f2(r2, b2);
          else break;
          b2 = h2(t2);
        }
      }
      function H2(a2) {
        B2 = false;
        G2(a2);
        if (!A) if (null !== h2(r2)) A = true, I2(J2);
        else {
          var b2 = h2(t2);
          null !== b2 && K2(H2, b2.startTime - a2);
        }
      }
      function J2(a2, b2) {
        A = false;
        B2 && (B2 = false, E2(L2), L2 = -1);
        z2 = true;
        var c2 = y;
        try {
          G2(b2);
          for (v2 = h2(r2); null !== v2 && (!(v2.expirationTime > b2) || a2 && !M2()); ) {
            var d2 = v2.callback;
            if ("function" === typeof d2) {
              v2.callback = null;
              y = v2.priorityLevel;
              var e = d2(v2.expirationTime <= b2);
              b2 = exports.unstable_now();
              "function" === typeof e ? v2.callback = e : v2 === h2(r2) && k2(r2);
              G2(b2);
            } else k2(r2);
            v2 = h2(r2);
          }
          if (null !== v2) var w2 = true;
          else {
            var m2 = h2(t2);
            null !== m2 && K2(H2, m2.startTime - b2);
            w2 = false;
          }
          return w2;
        } finally {
          v2 = null, y = c2, z2 = false;
        }
      }
      var N2 = false;
      var O2 = null;
      var L2 = -1;
      var P = 5;
      var Q2 = -1;
      function M2() {
        return exports.unstable_now() - Q2 < P ? false : true;
      }
      function R2() {
        if (null !== O2) {
          var a2 = exports.unstable_now();
          Q2 = a2;
          var b2 = true;
          try {
            b2 = O2(true, a2);
          } finally {
            b2 ? S2() : (N2 = false, O2 = null);
          }
        } else N2 = false;
      }
      var S2;
      if ("function" === typeof F2) S2 = function() {
        F2(R2);
      };
      else if ("undefined" !== typeof MessageChannel) {
        T2 = new MessageChannel(), U2 = T2.port2;
        T2.port1.onmessage = R2;
        S2 = function() {
          U2.postMessage(null);
        };
      } else S2 = function() {
        D2(R2, 0);
      };
      var T2;
      var U2;
      function I2(a2) {
        O2 = a2;
        N2 || (N2 = true, S2());
      }
      function K2(a2, b2) {
        L2 = D2(function() {
          a2(exports.unstable_now());
        }, b2);
      }
      exports.unstable_IdlePriority = 5;
      exports.unstable_ImmediatePriority = 1;
      exports.unstable_LowPriority = 4;
      exports.unstable_NormalPriority = 3;
      exports.unstable_Profiling = null;
      exports.unstable_UserBlockingPriority = 2;
      exports.unstable_cancelCallback = function(a2) {
        a2.callback = null;
      };
      exports.unstable_continueExecution = function() {
        A || z2 || (A = true, I2(J2));
      };
      exports.unstable_forceFrameRate = function(a2) {
        0 > a2 || 125 < a2 ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a2 ? Math.floor(1e3 / a2) : 5;
      };
      exports.unstable_getCurrentPriorityLevel = function() {
        return y;
      };
      exports.unstable_getFirstCallbackNode = function() {
        return h2(r2);
      };
      exports.unstable_next = function(a2) {
        switch (y) {
          case 1:
          case 2:
          case 3:
            var b2 = 3;
            break;
          default:
            b2 = y;
        }
        var c2 = y;
        y = b2;
        try {
          return a2();
        } finally {
          y = c2;
        }
      };
      exports.unstable_pauseExecution = function() {
      };
      exports.unstable_requestPaint = function() {
      };
      exports.unstable_runWithPriority = function(a2, b2) {
        switch (a2) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            a2 = 3;
        }
        var c2 = y;
        y = a2;
        try {
          return b2();
        } finally {
          y = c2;
        }
      };
      exports.unstable_scheduleCallback = function(a2, b2, c2) {
        var d2 = exports.unstable_now();
        "object" === typeof c2 && null !== c2 ? (c2 = c2.delay, c2 = "number" === typeof c2 && 0 < c2 ? d2 + c2 : d2) : c2 = d2;
        switch (a2) {
          case 1:
            var e = -1;
            break;
          case 2:
            e = 250;
            break;
          case 5:
            e = 1073741823;
            break;
          case 4:
            e = 1e4;
            break;
          default:
            e = 5e3;
        }
        e = c2 + e;
        a2 = { id: u2++, callback: b2, priorityLevel: a2, startTime: c2, expirationTime: e, sortIndex: -1 };
        c2 > d2 ? (a2.sortIndex = c2, f2(t2, a2), null === h2(r2) && a2 === h2(t2) && (B2 ? (E2(L2), L2 = -1) : B2 = true, K2(H2, c2 - d2))) : (a2.sortIndex = e, f2(r2, a2), A || z2 || (A = true, I2(J2)));
        return a2;
      };
      exports.unstable_shouldYield = M2;
      exports.unstable_wrapCallback = function(a2) {
        var b2 = y;
        return function() {
          var c2 = y;
          y = b2;
          try {
            return a2.apply(this, arguments);
          } finally {
            y = c2;
          }
        };
      };
    }
  });

  // node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_scheduler_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom.production.min.js
  var require_react_dom_production_min = __commonJS({
    "node_modules/react-dom/cjs/react-dom.production.min.js"(exports) {
      "use strict";
      var aa = require_react();
      var ca = require_scheduler();
      function p2(a2) {
        for (var b2 = "https://reactjs.org/docs/error-decoder.html?invariant=" + a2, c2 = 1; c2 < arguments.length; c2++) b2 += "&args[]=" + encodeURIComponent(arguments[c2]);
        return "Minified React error #" + a2 + "; visit " + b2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var da = /* @__PURE__ */ new Set();
      var ea = {};
      function fa(a2, b2) {
        ha(a2, b2);
        ha(a2 + "Capture", b2);
      }
      function ha(a2, b2) {
        ea[a2] = b2;
        for (a2 = 0; a2 < b2.length; a2++) da.add(b2[a2]);
      }
      var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
      var ja = Object.prototype.hasOwnProperty;
      var ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
      var la = {};
      var ma = {};
      function oa(a2) {
        if (ja.call(ma, a2)) return true;
        if (ja.call(la, a2)) return false;
        if (ka.test(a2)) return ma[a2] = true;
        la[a2] = true;
        return false;
      }
      function pa(a2, b2, c2, d2) {
        if (null !== c2 && 0 === c2.type) return false;
        switch (typeof b2) {
          case "function":
          case "symbol":
            return true;
          case "boolean":
            if (d2) return false;
            if (null !== c2) return !c2.acceptsBooleans;
            a2 = a2.toLowerCase().slice(0, 5);
            return "data-" !== a2 && "aria-" !== a2;
          default:
            return false;
        }
      }
      function qa(a2, b2, c2, d2) {
        if (null === b2 || "undefined" === typeof b2 || pa(a2, b2, c2, d2)) return true;
        if (d2) return false;
        if (null !== c2) switch (c2.type) {
          case 3:
            return !b2;
          case 4:
            return false === b2;
          case 5:
            return isNaN(b2);
          case 6:
            return isNaN(b2) || 1 > b2;
        }
        return false;
      }
      function v2(a2, b2, c2, d2, e, f2, g) {
        this.acceptsBooleans = 2 === b2 || 3 === b2 || 4 === b2;
        this.attributeName = d2;
        this.attributeNamespace = e;
        this.mustUseProperty = c2;
        this.propertyName = a2;
        this.type = b2;
        this.sanitizeURL = f2;
        this.removeEmptyString = g;
      }
      var z2 = {};
      "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a2) {
        z2[a2] = new v2(a2, 0, false, a2, null, false, false);
      });
      [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a2) {
        var b2 = a2[0];
        z2[b2] = new v2(b2, 1, false, a2[1], null, false, false);
      });
      ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a2) {
        z2[a2] = new v2(a2, 2, false, a2.toLowerCase(), null, false, false);
      });
      ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a2) {
        z2[a2] = new v2(a2, 2, false, a2, null, false, false);
      });
      "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a2) {
        z2[a2] = new v2(a2, 3, false, a2.toLowerCase(), null, false, false);
      });
      ["checked", "multiple", "muted", "selected"].forEach(function(a2) {
        z2[a2] = new v2(a2, 3, true, a2, null, false, false);
      });
      ["capture", "download"].forEach(function(a2) {
        z2[a2] = new v2(a2, 4, false, a2, null, false, false);
      });
      ["cols", "rows", "size", "span"].forEach(function(a2) {
        z2[a2] = new v2(a2, 6, false, a2, null, false, false);
      });
      ["rowSpan", "start"].forEach(function(a2) {
        z2[a2] = new v2(a2, 5, false, a2.toLowerCase(), null, false, false);
      });
      var ra = /[\-:]([a-z])/g;
      function sa(a2) {
        return a2[1].toUpperCase();
      }
      "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a2) {
        var b2 = a2.replace(
          ra,
          sa
        );
        z2[b2] = new v2(b2, 1, false, a2, null, false, false);
      });
      "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a2) {
        var b2 = a2.replace(ra, sa);
        z2[b2] = new v2(b2, 1, false, a2, "http://www.w3.org/1999/xlink", false, false);
      });
      ["xml:base", "xml:lang", "xml:space"].forEach(function(a2) {
        var b2 = a2.replace(ra, sa);
        z2[b2] = new v2(b2, 1, false, a2, "http://www.w3.org/XML/1998/namespace", false, false);
      });
      ["tabIndex", "crossOrigin"].forEach(function(a2) {
        z2[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, false, false);
      });
      z2.xlinkHref = new v2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
      ["src", "href", "action", "formAction"].forEach(function(a2) {
        z2[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, true, true);
      });
      function ta(a2, b2, c2, d2) {
        var e = z2.hasOwnProperty(b2) ? z2[b2] : null;
        if (null !== e ? 0 !== e.type : d2 || !(2 < b2.length) || "o" !== b2[0] && "O" !== b2[0] || "n" !== b2[1] && "N" !== b2[1]) qa(b2, c2, e, d2) && (c2 = null), d2 || null === e ? oa(b2) && (null === c2 ? a2.removeAttribute(b2) : a2.setAttribute(b2, "" + c2)) : e.mustUseProperty ? a2[e.propertyName] = null === c2 ? 3 === e.type ? false : "" : c2 : (b2 = e.attributeName, d2 = e.attributeNamespace, null === c2 ? a2.removeAttribute(b2) : (e = e.type, c2 = 3 === e || 4 === e && true === c2 ? "" : "" + c2, d2 ? a2.setAttributeNS(d2, b2, c2) : a2.setAttribute(b2, c2)));
      }
      var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      var va = Symbol.for("react.element");
      var wa = Symbol.for("react.portal");
      var ya = Symbol.for("react.fragment");
      var za = Symbol.for("react.strict_mode");
      var Aa = Symbol.for("react.profiler");
      var Ba = Symbol.for("react.provider");
      var Ca = Symbol.for("react.context");
      var Da = Symbol.for("react.forward_ref");
      var Ea = Symbol.for("react.suspense");
      var Fa = Symbol.for("react.suspense_list");
      var Ga = Symbol.for("react.memo");
      var Ha = Symbol.for("react.lazy");
      Symbol.for("react.scope");
      Symbol.for("react.debug_trace_mode");
      var Ia = Symbol.for("react.offscreen");
      Symbol.for("react.legacy_hidden");
      Symbol.for("react.cache");
      Symbol.for("react.tracing_marker");
      var Ja = Symbol.iterator;
      function Ka(a2) {
        if (null === a2 || "object" !== typeof a2) return null;
        a2 = Ja && a2[Ja] || a2["@@iterator"];
        return "function" === typeof a2 ? a2 : null;
      }
      var A = Object.assign;
      var La;
      function Ma(a2) {
        if (void 0 === La) try {
          throw Error();
        } catch (c2) {
          var b2 = c2.stack.trim().match(/\n( *(at )?)/);
          La = b2 && b2[1] || "";
        }
        return "\n" + La + a2;
      }
      var Na = false;
      function Oa(a2, b2) {
        if (!a2 || Na) return "";
        Na = true;
        var c2 = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
          if (b2) if (b2 = function() {
            throw Error();
          }, Object.defineProperty(b2.prototype, "props", { set: function() {
            throw Error();
          } }), "object" === typeof Reflect && Reflect.construct) {
            try {
              Reflect.construct(b2, []);
            } catch (l2) {
              var d2 = l2;
            }
            Reflect.construct(a2, [], b2);
          } else {
            try {
              b2.call();
            } catch (l2) {
              d2 = l2;
            }
            a2.call(b2.prototype);
          }
          else {
            try {
              throw Error();
            } catch (l2) {
              d2 = l2;
            }
            a2();
          }
        } catch (l2) {
          if (l2 && d2 && "string" === typeof l2.stack) {
            for (var e = l2.stack.split("\n"), f2 = d2.stack.split("\n"), g = e.length - 1, h2 = f2.length - 1; 1 <= g && 0 <= h2 && e[g] !== f2[h2]; ) h2--;
            for (; 1 <= g && 0 <= h2; g--, h2--) if (e[g] !== f2[h2]) {
              if (1 !== g || 1 !== h2) {
                do
                  if (g--, h2--, 0 > h2 || e[g] !== f2[h2]) {
                    var k2 = "\n" + e[g].replace(" at new ", " at ");
                    a2.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a2.displayName));
                    return k2;
                  }
                while (1 <= g && 0 <= h2);
              }
              break;
            }
          }
        } finally {
          Na = false, Error.prepareStackTrace = c2;
        }
        return (a2 = a2 ? a2.displayName || a2.name : "") ? Ma(a2) : "";
      }
      function Pa(a2) {
        switch (a2.tag) {
          case 5:
            return Ma(a2.type);
          case 16:
            return Ma("Lazy");
          case 13:
            return Ma("Suspense");
          case 19:
            return Ma("SuspenseList");
          case 0:
          case 2:
          case 15:
            return a2 = Oa(a2.type, false), a2;
          case 11:
            return a2 = Oa(a2.type.render, false), a2;
          case 1:
            return a2 = Oa(a2.type, true), a2;
          default:
            return "";
        }
      }
      function Qa(a2) {
        if (null == a2) return null;
        if ("function" === typeof a2) return a2.displayName || a2.name || null;
        if ("string" === typeof a2) return a2;
        switch (a2) {
          case ya:
            return "Fragment";
          case wa:
            return "Portal";
          case Aa:
            return "Profiler";
          case za:
            return "StrictMode";
          case Ea:
            return "Suspense";
          case Fa:
            return "SuspenseList";
        }
        if ("object" === typeof a2) switch (a2.$$typeof) {
          case Ca:
            return (a2.displayName || "Context") + ".Consumer";
          case Ba:
            return (a2._context.displayName || "Context") + ".Provider";
          case Da:
            var b2 = a2.render;
            a2 = a2.displayName;
            a2 || (a2 = b2.displayName || b2.name || "", a2 = "" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
            return a2;
          case Ga:
            return b2 = a2.displayName || null, null !== b2 ? b2 : Qa(a2.type) || "Memo";
          case Ha:
            b2 = a2._payload;
            a2 = a2._init;
            try {
              return Qa(a2(b2));
            } catch (c2) {
            }
        }
        return null;
      }
      function Ra(a2) {
        var b2 = a2.type;
        switch (a2.tag) {
          case 24:
            return "Cache";
          case 9:
            return (b2.displayName || "Context") + ".Consumer";
          case 10:
            return (b2._context.displayName || "Context") + ".Provider";
          case 18:
            return "DehydratedFragment";
          case 11:
            return a2 = b2.render, a2 = a2.displayName || a2.name || "", b2.displayName || ("" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
          case 7:
            return "Fragment";
          case 5:
            return b2;
          case 4:
            return "Portal";
          case 3:
            return "Root";
          case 6:
            return "Text";
          case 16:
            return Qa(b2);
          case 8:
            return b2 === za ? "StrictMode" : "Mode";
          case 22:
            return "Offscreen";
          case 12:
            return "Profiler";
          case 21:
            return "Scope";
          case 13:
            return "Suspense";
          case 19:
            return "SuspenseList";
          case 25:
            return "TracingMarker";
          case 1:
          case 0:
          case 17:
          case 2:
          case 14:
          case 15:
            if ("function" === typeof b2) return b2.displayName || b2.name || null;
            if ("string" === typeof b2) return b2;
        }
        return null;
      }
      function Sa(a2) {
        switch (typeof a2) {
          case "boolean":
          case "number":
          case "string":
          case "undefined":
            return a2;
          case "object":
            return a2;
          default:
            return "";
        }
      }
      function Ta(a2) {
        var b2 = a2.type;
        return (a2 = a2.nodeName) && "input" === a2.toLowerCase() && ("checkbox" === b2 || "radio" === b2);
      }
      function Ua(a2) {
        var b2 = Ta(a2) ? "checked" : "value", c2 = Object.getOwnPropertyDescriptor(a2.constructor.prototype, b2), d2 = "" + a2[b2];
        if (!a2.hasOwnProperty(b2) && "undefined" !== typeof c2 && "function" === typeof c2.get && "function" === typeof c2.set) {
          var e = c2.get, f2 = c2.set;
          Object.defineProperty(a2, b2, { configurable: true, get: function() {
            return e.call(this);
          }, set: function(a3) {
            d2 = "" + a3;
            f2.call(this, a3);
          } });
          Object.defineProperty(a2, b2, { enumerable: c2.enumerable });
          return { getValue: function() {
            return d2;
          }, setValue: function(a3) {
            d2 = "" + a3;
          }, stopTracking: function() {
            a2._valueTracker = null;
            delete a2[b2];
          } };
        }
      }
      function Va(a2) {
        a2._valueTracker || (a2._valueTracker = Ua(a2));
      }
      function Wa(a2) {
        if (!a2) return false;
        var b2 = a2._valueTracker;
        if (!b2) return true;
        var c2 = b2.getValue();
        var d2 = "";
        a2 && (d2 = Ta(a2) ? a2.checked ? "true" : "false" : a2.value);
        a2 = d2;
        return a2 !== c2 ? (b2.setValue(a2), true) : false;
      }
      function Xa(a2) {
        a2 = a2 || ("undefined" !== typeof document ? document : void 0);
        if ("undefined" === typeof a2) return null;
        try {
          return a2.activeElement || a2.body;
        } catch (b2) {
          return a2.body;
        }
      }
      function Ya(a2, b2) {
        var c2 = b2.checked;
        return A({}, b2, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c2 ? c2 : a2._wrapperState.initialChecked });
      }
      function Za(a2, b2) {
        var c2 = null == b2.defaultValue ? "" : b2.defaultValue, d2 = null != b2.checked ? b2.checked : b2.defaultChecked;
        c2 = Sa(null != b2.value ? b2.value : c2);
        a2._wrapperState = { initialChecked: d2, initialValue: c2, controlled: "checkbox" === b2.type || "radio" === b2.type ? null != b2.checked : null != b2.value };
      }
      function ab(a2, b2) {
        b2 = b2.checked;
        null != b2 && ta(a2, "checked", b2, false);
      }
      function bb(a2, b2) {
        ab(a2, b2);
        var c2 = Sa(b2.value), d2 = b2.type;
        if (null != c2) if ("number" === d2) {
          if (0 === c2 && "" === a2.value || a2.value != c2) a2.value = "" + c2;
        } else a2.value !== "" + c2 && (a2.value = "" + c2);
        else if ("submit" === d2 || "reset" === d2) {
          a2.removeAttribute("value");
          return;
        }
        b2.hasOwnProperty("value") ? cb(a2, b2.type, c2) : b2.hasOwnProperty("defaultValue") && cb(a2, b2.type, Sa(b2.defaultValue));
        null == b2.checked && null != b2.defaultChecked && (a2.defaultChecked = !!b2.defaultChecked);
      }
      function db(a2, b2, c2) {
        if (b2.hasOwnProperty("value") || b2.hasOwnProperty("defaultValue")) {
          var d2 = b2.type;
          if (!("submit" !== d2 && "reset" !== d2 || void 0 !== b2.value && null !== b2.value)) return;
          b2 = "" + a2._wrapperState.initialValue;
          c2 || b2 === a2.value || (a2.value = b2);
          a2.defaultValue = b2;
        }
        c2 = a2.name;
        "" !== c2 && (a2.name = "");
        a2.defaultChecked = !!a2._wrapperState.initialChecked;
        "" !== c2 && (a2.name = c2);
      }
      function cb(a2, b2, c2) {
        if ("number" !== b2 || Xa(a2.ownerDocument) !== a2) null == c2 ? a2.defaultValue = "" + a2._wrapperState.initialValue : a2.defaultValue !== "" + c2 && (a2.defaultValue = "" + c2);
      }
      var eb = Array.isArray;
      function fb(a2, b2, c2, d2) {
        a2 = a2.options;
        if (b2) {
          b2 = {};
          for (var e = 0; e < c2.length; e++) b2["$" + c2[e]] = true;
          for (c2 = 0; c2 < a2.length; c2++) e = b2.hasOwnProperty("$" + a2[c2].value), a2[c2].selected !== e && (a2[c2].selected = e), e && d2 && (a2[c2].defaultSelected = true);
        } else {
          c2 = "" + Sa(c2);
          b2 = null;
          for (e = 0; e < a2.length; e++) {
            if (a2[e].value === c2) {
              a2[e].selected = true;
              d2 && (a2[e].defaultSelected = true);
              return;
            }
            null !== b2 || a2[e].disabled || (b2 = a2[e]);
          }
          null !== b2 && (b2.selected = true);
        }
      }
      function gb(a2, b2) {
        if (null != b2.dangerouslySetInnerHTML) throw Error(p2(91));
        return A({}, b2, { value: void 0, defaultValue: void 0, children: "" + a2._wrapperState.initialValue });
      }
      function hb(a2, b2) {
        var c2 = b2.value;
        if (null == c2) {
          c2 = b2.children;
          b2 = b2.defaultValue;
          if (null != c2) {
            if (null != b2) throw Error(p2(92));
            if (eb(c2)) {
              if (1 < c2.length) throw Error(p2(93));
              c2 = c2[0];
            }
            b2 = c2;
          }
          null == b2 && (b2 = "");
          c2 = b2;
        }
        a2._wrapperState = { initialValue: Sa(c2) };
      }
      function ib(a2, b2) {
        var c2 = Sa(b2.value), d2 = Sa(b2.defaultValue);
        null != c2 && (c2 = "" + c2, c2 !== a2.value && (a2.value = c2), null == b2.defaultValue && a2.defaultValue !== c2 && (a2.defaultValue = c2));
        null != d2 && (a2.defaultValue = "" + d2);
      }
      function jb(a2) {
        var b2 = a2.textContent;
        b2 === a2._wrapperState.initialValue && "" !== b2 && null !== b2 && (a2.value = b2);
      }
      function kb(a2) {
        switch (a2) {
          case "svg":
            return "http://www.w3.org/2000/svg";
          case "math":
            return "http://www.w3.org/1998/Math/MathML";
          default:
            return "http://www.w3.org/1999/xhtml";
        }
      }
      function lb(a2, b2) {
        return null == a2 || "http://www.w3.org/1999/xhtml" === a2 ? kb(b2) : "http://www.w3.org/2000/svg" === a2 && "foreignObject" === b2 ? "http://www.w3.org/1999/xhtml" : a2;
      }
      var mb;
      var nb = function(a2) {
        return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b2, c2, d2, e) {
          MSApp.execUnsafeLocalFunction(function() {
            return a2(b2, c2, d2, e);
          });
        } : a2;
      }(function(a2, b2) {
        if ("http://www.w3.org/2000/svg" !== a2.namespaceURI || "innerHTML" in a2) a2.innerHTML = b2;
        else {
          mb = mb || document.createElement("div");
          mb.innerHTML = "<svg>" + b2.valueOf().toString() + "</svg>";
          for (b2 = mb.firstChild; a2.firstChild; ) a2.removeChild(a2.firstChild);
          for (; b2.firstChild; ) a2.appendChild(b2.firstChild);
        }
      });
      function ob(a2, b2) {
        if (b2) {
          var c2 = a2.firstChild;
          if (c2 && c2 === a2.lastChild && 3 === c2.nodeType) {
            c2.nodeValue = b2;
            return;
          }
        }
        a2.textContent = b2;
      }
      var pb = {
        animationIterationCount: true,
        aspectRatio: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
      };
      var qb = ["Webkit", "ms", "Moz", "O"];
      Object.keys(pb).forEach(function(a2) {
        qb.forEach(function(b2) {
          b2 = b2 + a2.charAt(0).toUpperCase() + a2.substring(1);
          pb[b2] = pb[a2];
        });
      });
      function rb(a2, b2, c2) {
        return null == b2 || "boolean" === typeof b2 || "" === b2 ? "" : c2 || "number" !== typeof b2 || 0 === b2 || pb.hasOwnProperty(a2) && pb[a2] ? ("" + b2).trim() : b2 + "px";
      }
      function sb(a2, b2) {
        a2 = a2.style;
        for (var c2 in b2) if (b2.hasOwnProperty(c2)) {
          var d2 = 0 === c2.indexOf("--"), e = rb(c2, b2[c2], d2);
          "float" === c2 && (c2 = "cssFloat");
          d2 ? a2.setProperty(c2, e) : a2[c2] = e;
        }
      }
      var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
      function ub(a2, b2) {
        if (b2) {
          if (tb[a2] && (null != b2.children || null != b2.dangerouslySetInnerHTML)) throw Error(p2(137, a2));
          if (null != b2.dangerouslySetInnerHTML) {
            if (null != b2.children) throw Error(p2(60));
            if ("object" !== typeof b2.dangerouslySetInnerHTML || !("__html" in b2.dangerouslySetInnerHTML)) throw Error(p2(61));
          }
          if (null != b2.style && "object" !== typeof b2.style) throw Error(p2(62));
        }
      }
      function vb(a2, b2) {
        if (-1 === a2.indexOf("-")) return "string" === typeof b2.is;
        switch (a2) {
          case "annotation-xml":
          case "color-profile":
          case "font-face":
          case "font-face-src":
          case "font-face-uri":
          case "font-face-format":
          case "font-face-name":
          case "missing-glyph":
            return false;
          default:
            return true;
        }
      }
      var wb = null;
      function xb(a2) {
        a2 = a2.target || a2.srcElement || window;
        a2.correspondingUseElement && (a2 = a2.correspondingUseElement);
        return 3 === a2.nodeType ? a2.parentNode : a2;
      }
      var yb = null;
      var zb = null;
      var Ab = null;
      function Bb(a2) {
        if (a2 = Cb(a2)) {
          if ("function" !== typeof yb) throw Error(p2(280));
          var b2 = a2.stateNode;
          b2 && (b2 = Db(b2), yb(a2.stateNode, a2.type, b2));
        }
      }
      function Eb(a2) {
        zb ? Ab ? Ab.push(a2) : Ab = [a2] : zb = a2;
      }
      function Fb() {
        if (zb) {
          var a2 = zb, b2 = Ab;
          Ab = zb = null;
          Bb(a2);
          if (b2) for (a2 = 0; a2 < b2.length; a2++) Bb(b2[a2]);
        }
      }
      function Gb(a2, b2) {
        return a2(b2);
      }
      function Hb() {
      }
      var Ib = false;
      function Jb(a2, b2, c2) {
        if (Ib) return a2(b2, c2);
        Ib = true;
        try {
          return Gb(a2, b2, c2);
        } finally {
          if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
        }
      }
      function Kb(a2, b2) {
        var c2 = a2.stateNode;
        if (null === c2) return null;
        var d2 = Db(c2);
        if (null === d2) return null;
        c2 = d2[b2];
        a: switch (b2) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
          case "onMouseEnter":
            (d2 = !d2.disabled) || (a2 = a2.type, d2 = !("button" === a2 || "input" === a2 || "select" === a2 || "textarea" === a2));
            a2 = !d2;
            break a;
          default:
            a2 = false;
        }
        if (a2) return null;
        if (c2 && "function" !== typeof c2) throw Error(p2(231, b2, typeof c2));
        return c2;
      }
      var Lb = false;
      if (ia) try {
        Mb = {};
        Object.defineProperty(Mb, "passive", { get: function() {
          Lb = true;
        } });
        window.addEventListener("test", Mb, Mb);
        window.removeEventListener("test", Mb, Mb);
      } catch (a2) {
        Lb = false;
      }
      var Mb;
      function Nb(a2, b2, c2, d2, e, f2, g, h2, k2) {
        var l2 = Array.prototype.slice.call(arguments, 3);
        try {
          b2.apply(c2, l2);
        } catch (m2) {
          this.onError(m2);
        }
      }
      var Ob = false;
      var Pb = null;
      var Qb = false;
      var Rb = null;
      var Sb = { onError: function(a2) {
        Ob = true;
        Pb = a2;
      } };
      function Tb(a2, b2, c2, d2, e, f2, g, h2, k2) {
        Ob = false;
        Pb = null;
        Nb.apply(Sb, arguments);
      }
      function Ub(a2, b2, c2, d2, e, f2, g, h2, k2) {
        Tb.apply(this, arguments);
        if (Ob) {
          if (Ob) {
            var l2 = Pb;
            Ob = false;
            Pb = null;
          } else throw Error(p2(198));
          Qb || (Qb = true, Rb = l2);
        }
      }
      function Vb(a2) {
        var b2 = a2, c2 = a2;
        if (a2.alternate) for (; b2.return; ) b2 = b2.return;
        else {
          a2 = b2;
          do
            b2 = a2, 0 !== (b2.flags & 4098) && (c2 = b2.return), a2 = b2.return;
          while (a2);
        }
        return 3 === b2.tag ? c2 : null;
      }
      function Wb(a2) {
        if (13 === a2.tag) {
          var b2 = a2.memoizedState;
          null === b2 && (a2 = a2.alternate, null !== a2 && (b2 = a2.memoizedState));
          if (null !== b2) return b2.dehydrated;
        }
        return null;
      }
      function Xb(a2) {
        if (Vb(a2) !== a2) throw Error(p2(188));
      }
      function Yb(a2) {
        var b2 = a2.alternate;
        if (!b2) {
          b2 = Vb(a2);
          if (null === b2) throw Error(p2(188));
          return b2 !== a2 ? null : a2;
        }
        for (var c2 = a2, d2 = b2; ; ) {
          var e = c2.return;
          if (null === e) break;
          var f2 = e.alternate;
          if (null === f2) {
            d2 = e.return;
            if (null !== d2) {
              c2 = d2;
              continue;
            }
            break;
          }
          if (e.child === f2.child) {
            for (f2 = e.child; f2; ) {
              if (f2 === c2) return Xb(e), a2;
              if (f2 === d2) return Xb(e), b2;
              f2 = f2.sibling;
            }
            throw Error(p2(188));
          }
          if (c2.return !== d2.return) c2 = e, d2 = f2;
          else {
            for (var g = false, h2 = e.child; h2; ) {
              if (h2 === c2) {
                g = true;
                c2 = e;
                d2 = f2;
                break;
              }
              if (h2 === d2) {
                g = true;
                d2 = e;
                c2 = f2;
                break;
              }
              h2 = h2.sibling;
            }
            if (!g) {
              for (h2 = f2.child; h2; ) {
                if (h2 === c2) {
                  g = true;
                  c2 = f2;
                  d2 = e;
                  break;
                }
                if (h2 === d2) {
                  g = true;
                  d2 = f2;
                  c2 = e;
                  break;
                }
                h2 = h2.sibling;
              }
              if (!g) throw Error(p2(189));
            }
          }
          if (c2.alternate !== d2) throw Error(p2(190));
        }
        if (3 !== c2.tag) throw Error(p2(188));
        return c2.stateNode.current === c2 ? a2 : b2;
      }
      function Zb(a2) {
        a2 = Yb(a2);
        return null !== a2 ? $b(a2) : null;
      }
      function $b(a2) {
        if (5 === a2.tag || 6 === a2.tag) return a2;
        for (a2 = a2.child; null !== a2; ) {
          var b2 = $b(a2);
          if (null !== b2) return b2;
          a2 = a2.sibling;
        }
        return null;
      }
      var ac = ca.unstable_scheduleCallback;
      var bc = ca.unstable_cancelCallback;
      var cc = ca.unstable_shouldYield;
      var dc = ca.unstable_requestPaint;
      var B2 = ca.unstable_now;
      var ec = ca.unstable_getCurrentPriorityLevel;
      var fc = ca.unstable_ImmediatePriority;
      var gc = ca.unstable_UserBlockingPriority;
      var hc = ca.unstable_NormalPriority;
      var ic = ca.unstable_LowPriority;
      var jc = ca.unstable_IdlePriority;
      var kc = null;
      var lc = null;
      function mc(a2) {
        if (lc && "function" === typeof lc.onCommitFiberRoot) try {
          lc.onCommitFiberRoot(kc, a2, void 0, 128 === (a2.current.flags & 128));
        } catch (b2) {
        }
      }
      var oc = Math.clz32 ? Math.clz32 : nc;
      var pc = Math.log;
      var qc = Math.LN2;
      function nc(a2) {
        a2 >>>= 0;
        return 0 === a2 ? 32 : 31 - (pc(a2) / qc | 0) | 0;
      }
      var rc = 64;
      var sc = 4194304;
      function tc(a2) {
        switch (a2 & -a2) {
          case 1:
            return 1;
          case 2:
            return 2;
          case 4:
            return 4;
          case 8:
            return 8;
          case 16:
            return 16;
          case 32:
            return 32;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return a2 & 4194240;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            return a2 & 130023424;
          case 134217728:
            return 134217728;
          case 268435456:
            return 268435456;
          case 536870912:
            return 536870912;
          case 1073741824:
            return 1073741824;
          default:
            return a2;
        }
      }
      function uc(a2, b2) {
        var c2 = a2.pendingLanes;
        if (0 === c2) return 0;
        var d2 = 0, e = a2.suspendedLanes, f2 = a2.pingedLanes, g = c2 & 268435455;
        if (0 !== g) {
          var h2 = g & ~e;
          0 !== h2 ? d2 = tc(h2) : (f2 &= g, 0 !== f2 && (d2 = tc(f2)));
        } else g = c2 & ~e, 0 !== g ? d2 = tc(g) : 0 !== f2 && (d2 = tc(f2));
        if (0 === d2) return 0;
        if (0 !== b2 && b2 !== d2 && 0 === (b2 & e) && (e = d2 & -d2, f2 = b2 & -b2, e >= f2 || 16 === e && 0 !== (f2 & 4194240))) return b2;
        0 !== (d2 & 4) && (d2 |= c2 & 16);
        b2 = a2.entangledLanes;
        if (0 !== b2) for (a2 = a2.entanglements, b2 &= d2; 0 < b2; ) c2 = 31 - oc(b2), e = 1 << c2, d2 |= a2[c2], b2 &= ~e;
        return d2;
      }
      function vc(a2, b2) {
        switch (a2) {
          case 1:
          case 2:
          case 4:
            return b2 + 250;
          case 8:
          case 16:
          case 32:
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return b2 + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            return -1;
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
            return -1;
          default:
            return -1;
        }
      }
      function wc(a2, b2) {
        for (var c2 = a2.suspendedLanes, d2 = a2.pingedLanes, e = a2.expirationTimes, f2 = a2.pendingLanes; 0 < f2; ) {
          var g = 31 - oc(f2), h2 = 1 << g, k2 = e[g];
          if (-1 === k2) {
            if (0 === (h2 & c2) || 0 !== (h2 & d2)) e[g] = vc(h2, b2);
          } else k2 <= b2 && (a2.expiredLanes |= h2);
          f2 &= ~h2;
        }
      }
      function xc(a2) {
        a2 = a2.pendingLanes & -1073741825;
        return 0 !== a2 ? a2 : a2 & 1073741824 ? 1073741824 : 0;
      }
      function yc() {
        var a2 = rc;
        rc <<= 1;
        0 === (rc & 4194240) && (rc = 64);
        return a2;
      }
      function zc(a2) {
        for (var b2 = [], c2 = 0; 31 > c2; c2++) b2.push(a2);
        return b2;
      }
      function Ac(a2, b2, c2) {
        a2.pendingLanes |= b2;
        536870912 !== b2 && (a2.suspendedLanes = 0, a2.pingedLanes = 0);
        a2 = a2.eventTimes;
        b2 = 31 - oc(b2);
        a2[b2] = c2;
      }
      function Bc(a2, b2) {
        var c2 = a2.pendingLanes & ~b2;
        a2.pendingLanes = b2;
        a2.suspendedLanes = 0;
        a2.pingedLanes = 0;
        a2.expiredLanes &= b2;
        a2.mutableReadLanes &= b2;
        a2.entangledLanes &= b2;
        b2 = a2.entanglements;
        var d2 = a2.eventTimes;
        for (a2 = a2.expirationTimes; 0 < c2; ) {
          var e = 31 - oc(c2), f2 = 1 << e;
          b2[e] = 0;
          d2[e] = -1;
          a2[e] = -1;
          c2 &= ~f2;
        }
      }
      function Cc(a2, b2) {
        var c2 = a2.entangledLanes |= b2;
        for (a2 = a2.entanglements; c2; ) {
          var d2 = 31 - oc(c2), e = 1 << d2;
          e & b2 | a2[d2] & b2 && (a2[d2] |= b2);
          c2 &= ~e;
        }
      }
      var C2 = 0;
      function Dc(a2) {
        a2 &= -a2;
        return 1 < a2 ? 4 < a2 ? 0 !== (a2 & 268435455) ? 16 : 536870912 : 4 : 1;
      }
      var Ec;
      var Fc;
      var Gc;
      var Hc;
      var Ic;
      var Jc = false;
      var Kc = [];
      var Lc = null;
      var Mc = null;
      var Nc = null;
      var Oc = /* @__PURE__ */ new Map();
      var Pc = /* @__PURE__ */ new Map();
      var Qc = [];
      var Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
      function Sc(a2, b2) {
        switch (a2) {
          case "focusin":
          case "focusout":
            Lc = null;
            break;
          case "dragenter":
          case "dragleave":
            Mc = null;
            break;
          case "mouseover":
          case "mouseout":
            Nc = null;
            break;
          case "pointerover":
          case "pointerout":
            Oc.delete(b2.pointerId);
            break;
          case "gotpointercapture":
          case "lostpointercapture":
            Pc.delete(b2.pointerId);
        }
      }
      function Tc(a2, b2, c2, d2, e, f2) {
        if (null === a2 || a2.nativeEvent !== f2) return a2 = { blockedOn: b2, domEventName: c2, eventSystemFlags: d2, nativeEvent: f2, targetContainers: [e] }, null !== b2 && (b2 = Cb(b2), null !== b2 && Fc(b2)), a2;
        a2.eventSystemFlags |= d2;
        b2 = a2.targetContainers;
        null !== e && -1 === b2.indexOf(e) && b2.push(e);
        return a2;
      }
      function Uc(a2, b2, c2, d2, e) {
        switch (b2) {
          case "focusin":
            return Lc = Tc(Lc, a2, b2, c2, d2, e), true;
          case "dragenter":
            return Mc = Tc(Mc, a2, b2, c2, d2, e), true;
          case "mouseover":
            return Nc = Tc(Nc, a2, b2, c2, d2, e), true;
          case "pointerover":
            var f2 = e.pointerId;
            Oc.set(f2, Tc(Oc.get(f2) || null, a2, b2, c2, d2, e));
            return true;
          case "gotpointercapture":
            return f2 = e.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a2, b2, c2, d2, e)), true;
        }
        return false;
      }
      function Vc(a2) {
        var b2 = Wc(a2.target);
        if (null !== b2) {
          var c2 = Vb(b2);
          if (null !== c2) {
            if (b2 = c2.tag, 13 === b2) {
              if (b2 = Wb(c2), null !== b2) {
                a2.blockedOn = b2;
                Ic(a2.priority, function() {
                  Gc(c2);
                });
                return;
              }
            } else if (3 === b2 && c2.stateNode.current.memoizedState.isDehydrated) {
              a2.blockedOn = 3 === c2.tag ? c2.stateNode.containerInfo : null;
              return;
            }
          }
        }
        a2.blockedOn = null;
      }
      function Xc(a2) {
        if (null !== a2.blockedOn) return false;
        for (var b2 = a2.targetContainers; 0 < b2.length; ) {
          var c2 = Yc(a2.domEventName, a2.eventSystemFlags, b2[0], a2.nativeEvent);
          if (null === c2) {
            c2 = a2.nativeEvent;
            var d2 = new c2.constructor(c2.type, c2);
            wb = d2;
            c2.target.dispatchEvent(d2);
            wb = null;
          } else return b2 = Cb(c2), null !== b2 && Fc(b2), a2.blockedOn = c2, false;
          b2.shift();
        }
        return true;
      }
      function Zc(a2, b2, c2) {
        Xc(a2) && c2.delete(b2);
      }
      function $c() {
        Jc = false;
        null !== Lc && Xc(Lc) && (Lc = null);
        null !== Mc && Xc(Mc) && (Mc = null);
        null !== Nc && Xc(Nc) && (Nc = null);
        Oc.forEach(Zc);
        Pc.forEach(Zc);
      }
      function ad(a2, b2) {
        a2.blockedOn === b2 && (a2.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
      }
      function bd(a2) {
        function b2(b3) {
          return ad(b3, a2);
        }
        if (0 < Kc.length) {
          ad(Kc[0], a2);
          for (var c2 = 1; c2 < Kc.length; c2++) {
            var d2 = Kc[c2];
            d2.blockedOn === a2 && (d2.blockedOn = null);
          }
        }
        null !== Lc && ad(Lc, a2);
        null !== Mc && ad(Mc, a2);
        null !== Nc && ad(Nc, a2);
        Oc.forEach(b2);
        Pc.forEach(b2);
        for (c2 = 0; c2 < Qc.length; c2++) d2 = Qc[c2], d2.blockedOn === a2 && (d2.blockedOn = null);
        for (; 0 < Qc.length && (c2 = Qc[0], null === c2.blockedOn); ) Vc(c2), null === c2.blockedOn && Qc.shift();
      }
      var cd = ua.ReactCurrentBatchConfig;
      var dd = true;
      function ed(a2, b2, c2, d2) {
        var e = C2, f2 = cd.transition;
        cd.transition = null;
        try {
          C2 = 1, fd(a2, b2, c2, d2);
        } finally {
          C2 = e, cd.transition = f2;
        }
      }
      function gd(a2, b2, c2, d2) {
        var e = C2, f2 = cd.transition;
        cd.transition = null;
        try {
          C2 = 4, fd(a2, b2, c2, d2);
        } finally {
          C2 = e, cd.transition = f2;
        }
      }
      function fd(a2, b2, c2, d2) {
        if (dd) {
          var e = Yc(a2, b2, c2, d2);
          if (null === e) hd(a2, b2, d2, id, c2), Sc(a2, d2);
          else if (Uc(e, a2, b2, c2, d2)) d2.stopPropagation();
          else if (Sc(a2, d2), b2 & 4 && -1 < Rc.indexOf(a2)) {
            for (; null !== e; ) {
              var f2 = Cb(e);
              null !== f2 && Ec(f2);
              f2 = Yc(a2, b2, c2, d2);
              null === f2 && hd(a2, b2, d2, id, c2);
              if (f2 === e) break;
              e = f2;
            }
            null !== e && d2.stopPropagation();
          } else hd(a2, b2, d2, null, c2);
        }
      }
      var id = null;
      function Yc(a2, b2, c2, d2) {
        id = null;
        a2 = xb(d2);
        a2 = Wc(a2);
        if (null !== a2) if (b2 = Vb(a2), null === b2) a2 = null;
        else if (c2 = b2.tag, 13 === c2) {
          a2 = Wb(b2);
          if (null !== a2) return a2;
          a2 = null;
        } else if (3 === c2) {
          if (b2.stateNode.current.memoizedState.isDehydrated) return 3 === b2.tag ? b2.stateNode.containerInfo : null;
          a2 = null;
        } else b2 !== a2 && (a2 = null);
        id = a2;
        return null;
      }
      function jd(a2) {
        switch (a2) {
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "auxclick":
          case "dblclick":
          case "dragend":
          case "dragstart":
          case "drop":
          case "focusin":
          case "focusout":
          case "input":
          case "invalid":
          case "keydown":
          case "keypress":
          case "keyup":
          case "mousedown":
          case "mouseup":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "ratechange":
          case "reset":
          case "resize":
          case "seeked":
          case "submit":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "volumechange":
          case "change":
          case "selectionchange":
          case "textInput":
          case "compositionstart":
          case "compositionend":
          case "compositionupdate":
          case "beforeblur":
          case "afterblur":
          case "beforeinput":
          case "blur":
          case "fullscreenchange":
          case "focus":
          case "hashchange":
          case "popstate":
          case "select":
          case "selectstart":
            return 1;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "mousemove":
          case "mouseout":
          case "mouseover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "scroll":
          case "toggle":
          case "touchmove":
          case "wheel":
          case "mouseenter":
          case "mouseleave":
          case "pointerenter":
          case "pointerleave":
            return 4;
          case "message":
            switch (ec()) {
              case fc:
                return 1;
              case gc:
                return 4;
              case hc:
              case ic:
                return 16;
              case jc:
                return 536870912;
              default:
                return 16;
            }
          default:
            return 16;
        }
      }
      var kd = null;
      var ld = null;
      var md = null;
      function nd() {
        if (md) return md;
        var a2, b2 = ld, c2 = b2.length, d2, e = "value" in kd ? kd.value : kd.textContent, f2 = e.length;
        for (a2 = 0; a2 < c2 && b2[a2] === e[a2]; a2++) ;
        var g = c2 - a2;
        for (d2 = 1; d2 <= g && b2[c2 - d2] === e[f2 - d2]; d2++) ;
        return md = e.slice(a2, 1 < d2 ? 1 - d2 : void 0);
      }
      function od(a2) {
        var b2 = a2.keyCode;
        "charCode" in a2 ? (a2 = a2.charCode, 0 === a2 && 13 === b2 && (a2 = 13)) : a2 = b2;
        10 === a2 && (a2 = 13);
        return 32 <= a2 || 13 === a2 ? a2 : 0;
      }
      function pd() {
        return true;
      }
      function qd() {
        return false;
      }
      function rd(a2) {
        function b2(b3, d2, e, f2, g) {
          this._reactName = b3;
          this._targetInst = e;
          this.type = d2;
          this.nativeEvent = f2;
          this.target = g;
          this.currentTarget = null;
          for (var c2 in a2) a2.hasOwnProperty(c2) && (b3 = a2[c2], this[c2] = b3 ? b3(f2) : f2[c2]);
          this.isDefaultPrevented = (null != f2.defaultPrevented ? f2.defaultPrevented : false === f2.returnValue) ? pd : qd;
          this.isPropagationStopped = qd;
          return this;
        }
        A(b2.prototype, { preventDefault: function() {
          this.defaultPrevented = true;
          var a3 = this.nativeEvent;
          a3 && (a3.preventDefault ? a3.preventDefault() : "unknown" !== typeof a3.returnValue && (a3.returnValue = false), this.isDefaultPrevented = pd);
        }, stopPropagation: function() {
          var a3 = this.nativeEvent;
          a3 && (a3.stopPropagation ? a3.stopPropagation() : "unknown" !== typeof a3.cancelBubble && (a3.cancelBubble = true), this.isPropagationStopped = pd);
        }, persist: function() {
        }, isPersistent: pd });
        return b2;
      }
      var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a2) {
        return a2.timeStamp || Date.now();
      }, defaultPrevented: 0, isTrusted: 0 };
      var td = rd(sd);
      var ud = A({}, sd, { view: 0, detail: 0 });
      var vd = rd(ud);
      var wd;
      var xd;
      var yd;
      var Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a2) {
        return void 0 === a2.relatedTarget ? a2.fromElement === a2.srcElement ? a2.toElement : a2.fromElement : a2.relatedTarget;
      }, movementX: function(a2) {
        if ("movementX" in a2) return a2.movementX;
        a2 !== yd && (yd && "mousemove" === a2.type ? (wd = a2.screenX - yd.screenX, xd = a2.screenY - yd.screenY) : xd = wd = 0, yd = a2);
        return wd;
      }, movementY: function(a2) {
        return "movementY" in a2 ? a2.movementY : xd;
      } });
      var Bd = rd(Ad);
      var Cd = A({}, Ad, { dataTransfer: 0 });
      var Dd = rd(Cd);
      var Ed = A({}, ud, { relatedTarget: 0 });
      var Fd = rd(Ed);
      var Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 });
      var Hd = rd(Gd);
      var Id = A({}, sd, { clipboardData: function(a2) {
        return "clipboardData" in a2 ? a2.clipboardData : window.clipboardData;
      } });
      var Jd = rd(Id);
      var Kd = A({}, sd, { data: 0 });
      var Ld = rd(Kd);
      var Md = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
      };
      var Nd = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
      };
      var Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
      function Pd(a2) {
        var b2 = this.nativeEvent;
        return b2.getModifierState ? b2.getModifierState(a2) : (a2 = Od[a2]) ? !!b2[a2] : false;
      }
      function zd() {
        return Pd;
      }
      var Qd = A({}, ud, { key: function(a2) {
        if (a2.key) {
          var b2 = Md[a2.key] || a2.key;
          if ("Unidentified" !== b2) return b2;
        }
        return "keypress" === a2.type ? (a2 = od(a2), 13 === a2 ? "Enter" : String.fromCharCode(a2)) : "keydown" === a2.type || "keyup" === a2.type ? Nd[a2.keyCode] || "Unidentified" : "";
      }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a2) {
        return "keypress" === a2.type ? od(a2) : 0;
      }, keyCode: function(a2) {
        return "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
      }, which: function(a2) {
        return "keypress" === a2.type ? od(a2) : "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
      } });
      var Rd = rd(Qd);
      var Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 });
      var Td = rd(Sd);
      var Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd });
      var Vd = rd(Ud);
      var Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 });
      var Xd = rd(Wd);
      var Yd = A({}, Ad, {
        deltaX: function(a2) {
          return "deltaX" in a2 ? a2.deltaX : "wheelDeltaX" in a2 ? -a2.wheelDeltaX : 0;
        },
        deltaY: function(a2) {
          return "deltaY" in a2 ? a2.deltaY : "wheelDeltaY" in a2 ? -a2.wheelDeltaY : "wheelDelta" in a2 ? -a2.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
      });
      var Zd = rd(Yd);
      var $d = [9, 13, 27, 32];
      var ae2 = ia && "CompositionEvent" in window;
      var be2 = null;
      ia && "documentMode" in document && (be2 = document.documentMode);
      var ce2 = ia && "TextEvent" in window && !be2;
      var de2 = ia && (!ae2 || be2 && 8 < be2 && 11 >= be2);
      var ee2 = String.fromCharCode(32);
      var fe2 = false;
      function ge2(a2, b2) {
        switch (a2) {
          case "keyup":
            return -1 !== $d.indexOf(b2.keyCode);
          case "keydown":
            return 229 !== b2.keyCode;
          case "keypress":
          case "mousedown":
          case "focusout":
            return true;
          default:
            return false;
        }
      }
      function he2(a2) {
        a2 = a2.detail;
        return "object" === typeof a2 && "data" in a2 ? a2.data : null;
      }
      var ie2 = false;
      function je2(a2, b2) {
        switch (a2) {
          case "compositionend":
            return he2(b2);
          case "keypress":
            if (32 !== b2.which) return null;
            fe2 = true;
            return ee2;
          case "textInput":
            return a2 = b2.data, a2 === ee2 && fe2 ? null : a2;
          default:
            return null;
        }
      }
      function ke2(a2, b2) {
        if (ie2) return "compositionend" === a2 || !ae2 && ge2(a2, b2) ? (a2 = nd(), md = ld = kd = null, ie2 = false, a2) : null;
        switch (a2) {
          case "paste":
            return null;
          case "keypress":
            if (!(b2.ctrlKey || b2.altKey || b2.metaKey) || b2.ctrlKey && b2.altKey) {
              if (b2.char && 1 < b2.char.length) return b2.char;
              if (b2.which) return String.fromCharCode(b2.which);
            }
            return null;
          case "compositionend":
            return de2 && "ko" !== b2.locale ? null : b2.data;
          default:
            return null;
        }
      }
      var le2 = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
      function me2(a2) {
        var b2 = a2 && a2.nodeName && a2.nodeName.toLowerCase();
        return "input" === b2 ? !!le2[a2.type] : "textarea" === b2 ? true : false;
      }
      function ne2(a2, b2, c2, d2) {
        Eb(d2);
        b2 = oe2(b2, "onChange");
        0 < b2.length && (c2 = new td("onChange", "change", null, c2, d2), a2.push({ event: c2, listeners: b2 }));
      }
      var pe2 = null;
      var qe2 = null;
      function re2(a2) {
        se2(a2, 0);
      }
      function te2(a2) {
        var b2 = ue2(a2);
        if (Wa(b2)) return a2;
      }
      function ve2(a2, b2) {
        if ("change" === a2) return b2;
      }
      var we2 = false;
      if (ia) {
        if (ia) {
          ye2 = "oninput" in document;
          if (!ye2) {
            ze2 = document.createElement("div");
            ze2.setAttribute("oninput", "return;");
            ye2 = "function" === typeof ze2.oninput;
          }
          xe2 = ye2;
        } else xe2 = false;
        we2 = xe2 && (!document.documentMode || 9 < document.documentMode);
      }
      var xe2;
      var ye2;
      var ze2;
      function Ae2() {
        pe2 && (pe2.detachEvent("onpropertychange", Be2), qe2 = pe2 = null);
      }
      function Be2(a2) {
        if ("value" === a2.propertyName && te2(qe2)) {
          var b2 = [];
          ne2(b2, qe2, a2, xb(a2));
          Jb(re2, b2);
        }
      }
      function Ce2(a2, b2, c2) {
        "focusin" === a2 ? (Ae2(), pe2 = b2, qe2 = c2, pe2.attachEvent("onpropertychange", Be2)) : "focusout" === a2 && Ae2();
      }
      function De2(a2) {
        if ("selectionchange" === a2 || "keyup" === a2 || "keydown" === a2) return te2(qe2);
      }
      function Ee2(a2, b2) {
        if ("click" === a2) return te2(b2);
      }
      function Fe2(a2, b2) {
        if ("input" === a2 || "change" === a2) return te2(b2);
      }
      function Ge(a2, b2) {
        return a2 === b2 && (0 !== a2 || 1 / a2 === 1 / b2) || a2 !== a2 && b2 !== b2;
      }
      var He2 = "function" === typeof Object.is ? Object.is : Ge;
      function Ie2(a2, b2) {
        if (He2(a2, b2)) return true;
        if ("object" !== typeof a2 || null === a2 || "object" !== typeof b2 || null === b2) return false;
        var c2 = Object.keys(a2), d2 = Object.keys(b2);
        if (c2.length !== d2.length) return false;
        for (d2 = 0; d2 < c2.length; d2++) {
          var e = c2[d2];
          if (!ja.call(b2, e) || !He2(a2[e], b2[e])) return false;
        }
        return true;
      }
      function Je2(a2) {
        for (; a2 && a2.firstChild; ) a2 = a2.firstChild;
        return a2;
      }
      function Ke2(a2, b2) {
        var c2 = Je2(a2);
        a2 = 0;
        for (var d2; c2; ) {
          if (3 === c2.nodeType) {
            d2 = a2 + c2.textContent.length;
            if (a2 <= b2 && d2 >= b2) return { node: c2, offset: b2 - a2 };
            a2 = d2;
          }
          a: {
            for (; c2; ) {
              if (c2.nextSibling) {
                c2 = c2.nextSibling;
                break a;
              }
              c2 = c2.parentNode;
            }
            c2 = void 0;
          }
          c2 = Je2(c2);
        }
      }
      function Le2(a2, b2) {
        return a2 && b2 ? a2 === b2 ? true : a2 && 3 === a2.nodeType ? false : b2 && 3 === b2.nodeType ? Le2(a2, b2.parentNode) : "contains" in a2 ? a2.contains(b2) : a2.compareDocumentPosition ? !!(a2.compareDocumentPosition(b2) & 16) : false : false;
      }
      function Me2() {
        for (var a2 = window, b2 = Xa(); b2 instanceof a2.HTMLIFrameElement; ) {
          try {
            var c2 = "string" === typeof b2.contentWindow.location.href;
          } catch (d2) {
            c2 = false;
          }
          if (c2) a2 = b2.contentWindow;
          else break;
          b2 = Xa(a2.document);
        }
        return b2;
      }
      function Ne2(a2) {
        var b2 = a2 && a2.nodeName && a2.nodeName.toLowerCase();
        return b2 && ("input" === b2 && ("text" === a2.type || "search" === a2.type || "tel" === a2.type || "url" === a2.type || "password" === a2.type) || "textarea" === b2 || "true" === a2.contentEditable);
      }
      function Oe2(a2) {
        var b2 = Me2(), c2 = a2.focusedElem, d2 = a2.selectionRange;
        if (b2 !== c2 && c2 && c2.ownerDocument && Le2(c2.ownerDocument.documentElement, c2)) {
          if (null !== d2 && Ne2(c2)) {
            if (b2 = d2.start, a2 = d2.end, void 0 === a2 && (a2 = b2), "selectionStart" in c2) c2.selectionStart = b2, c2.selectionEnd = Math.min(a2, c2.value.length);
            else if (a2 = (b2 = c2.ownerDocument || document) && b2.defaultView || window, a2.getSelection) {
              a2 = a2.getSelection();
              var e = c2.textContent.length, f2 = Math.min(d2.start, e);
              d2 = void 0 === d2.end ? f2 : Math.min(d2.end, e);
              !a2.extend && f2 > d2 && (e = d2, d2 = f2, f2 = e);
              e = Ke2(c2, f2);
              var g = Ke2(
                c2,
                d2
              );
              e && g && (1 !== a2.rangeCount || a2.anchorNode !== e.node || a2.anchorOffset !== e.offset || a2.focusNode !== g.node || a2.focusOffset !== g.offset) && (b2 = b2.createRange(), b2.setStart(e.node, e.offset), a2.removeAllRanges(), f2 > d2 ? (a2.addRange(b2), a2.extend(g.node, g.offset)) : (b2.setEnd(g.node, g.offset), a2.addRange(b2)));
            }
          }
          b2 = [];
          for (a2 = c2; a2 = a2.parentNode; ) 1 === a2.nodeType && b2.push({ element: a2, left: a2.scrollLeft, top: a2.scrollTop });
          "function" === typeof c2.focus && c2.focus();
          for (c2 = 0; c2 < b2.length; c2++) a2 = b2[c2], a2.element.scrollLeft = a2.left, a2.element.scrollTop = a2.top;
        }
      }
      var Pe2 = ia && "documentMode" in document && 11 >= document.documentMode;
      var Qe2 = null;
      var Re2 = null;
      var Se2 = null;
      var Te2 = false;
      function Ue2(a2, b2, c2) {
        var d2 = c2.window === c2 ? c2.document : 9 === c2.nodeType ? c2 : c2.ownerDocument;
        Te2 || null == Qe2 || Qe2 !== Xa(d2) || (d2 = Qe2, "selectionStart" in d2 && Ne2(d2) ? d2 = { start: d2.selectionStart, end: d2.selectionEnd } : (d2 = (d2.ownerDocument && d2.ownerDocument.defaultView || window).getSelection(), d2 = { anchorNode: d2.anchorNode, anchorOffset: d2.anchorOffset, focusNode: d2.focusNode, focusOffset: d2.focusOffset }), Se2 && Ie2(Se2, d2) || (Se2 = d2, d2 = oe2(Re2, "onSelect"), 0 < d2.length && (b2 = new td("onSelect", "select", null, b2, c2), a2.push({ event: b2, listeners: d2 }), b2.target = Qe2)));
      }
      function Ve2(a2, b2) {
        var c2 = {};
        c2[a2.toLowerCase()] = b2.toLowerCase();
        c2["Webkit" + a2] = "webkit" + b2;
        c2["Moz" + a2] = "moz" + b2;
        return c2;
      }
      var We2 = { animationend: Ve2("Animation", "AnimationEnd"), animationiteration: Ve2("Animation", "AnimationIteration"), animationstart: Ve2("Animation", "AnimationStart"), transitionend: Ve2("Transition", "TransitionEnd") };
      var Xe2 = {};
      var Ye2 = {};
      ia && (Ye2 = document.createElement("div").style, "AnimationEvent" in window || (delete We2.animationend.animation, delete We2.animationiteration.animation, delete We2.animationstart.animation), "TransitionEvent" in window || delete We2.transitionend.transition);
      function Ze2(a2) {
        if (Xe2[a2]) return Xe2[a2];
        if (!We2[a2]) return a2;
        var b2 = We2[a2], c2;
        for (c2 in b2) if (b2.hasOwnProperty(c2) && c2 in Ye2) return Xe2[a2] = b2[c2];
        return a2;
      }
      var $e2 = Ze2("animationend");
      var af = Ze2("animationiteration");
      var bf = Ze2("animationstart");
      var cf = Ze2("transitionend");
      var df = /* @__PURE__ */ new Map();
      var ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
      function ff(a2, b2) {
        df.set(a2, b2);
        fa(b2, [a2]);
      }
      for (gf = 0; gf < ef.length; gf++) {
        hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
        ff(jf, "on" + kf);
      }
      var hf;
      var jf;
      var kf;
      var gf;
      ff($e2, "onAnimationEnd");
      ff(af, "onAnimationIteration");
      ff(bf, "onAnimationStart");
      ff("dblclick", "onDoubleClick");
      ff("focusin", "onFocus");
      ff("focusout", "onBlur");
      ff(cf, "onTransitionEnd");
      ha("onMouseEnter", ["mouseout", "mouseover"]);
      ha("onMouseLeave", ["mouseout", "mouseover"]);
      ha("onPointerEnter", ["pointerout", "pointerover"]);
      ha("onPointerLeave", ["pointerout", "pointerover"]);
      fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
      fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
      fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
      fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
      fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
      fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
      var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
      var mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
      function nf(a2, b2, c2) {
        var d2 = a2.type || "unknown-event";
        a2.currentTarget = c2;
        Ub(d2, b2, void 0, a2);
        a2.currentTarget = null;
      }
      function se2(a2, b2) {
        b2 = 0 !== (b2 & 4);
        for (var c2 = 0; c2 < a2.length; c2++) {
          var d2 = a2[c2], e = d2.event;
          d2 = d2.listeners;
          a: {
            var f2 = void 0;
            if (b2) for (var g = d2.length - 1; 0 <= g; g--) {
              var h2 = d2[g], k2 = h2.instance, l2 = h2.currentTarget;
              h2 = h2.listener;
              if (k2 !== f2 && e.isPropagationStopped()) break a;
              nf(e, h2, l2);
              f2 = k2;
            }
            else for (g = 0; g < d2.length; g++) {
              h2 = d2[g];
              k2 = h2.instance;
              l2 = h2.currentTarget;
              h2 = h2.listener;
              if (k2 !== f2 && e.isPropagationStopped()) break a;
              nf(e, h2, l2);
              f2 = k2;
            }
          }
        }
        if (Qb) throw a2 = Rb, Qb = false, Rb = null, a2;
      }
      function D2(a2, b2) {
        var c2 = b2[of];
        void 0 === c2 && (c2 = b2[of] = /* @__PURE__ */ new Set());
        var d2 = a2 + "__bubble";
        c2.has(d2) || (pf(b2, a2, 2, false), c2.add(d2));
      }
      function qf(a2, b2, c2) {
        var d2 = 0;
        b2 && (d2 |= 4);
        pf(c2, a2, d2, b2);
      }
      var rf = "_reactListening" + Math.random().toString(36).slice(2);
      function sf(a2) {
        if (!a2[rf]) {
          a2[rf] = true;
          da.forEach(function(b3) {
            "selectionchange" !== b3 && (mf.has(b3) || qf(b3, false, a2), qf(b3, true, a2));
          });
          var b2 = 9 === a2.nodeType ? a2 : a2.ownerDocument;
          null === b2 || b2[rf] || (b2[rf] = true, qf("selectionchange", false, b2));
        }
      }
      function pf(a2, b2, c2, d2) {
        switch (jd(b2)) {
          case 1:
            var e = ed;
            break;
          case 4:
            e = gd;
            break;
          default:
            e = fd;
        }
        c2 = e.bind(null, b2, c2, a2);
        e = void 0;
        !Lb || "touchstart" !== b2 && "touchmove" !== b2 && "wheel" !== b2 || (e = true);
        d2 ? void 0 !== e ? a2.addEventListener(b2, c2, { capture: true, passive: e }) : a2.addEventListener(b2, c2, true) : void 0 !== e ? a2.addEventListener(b2, c2, { passive: e }) : a2.addEventListener(b2, c2, false);
      }
      function hd(a2, b2, c2, d2, e) {
        var f2 = d2;
        if (0 === (b2 & 1) && 0 === (b2 & 2) && null !== d2) a: for (; ; ) {
          if (null === d2) return;
          var g = d2.tag;
          if (3 === g || 4 === g) {
            var h2 = d2.stateNode.containerInfo;
            if (h2 === e || 8 === h2.nodeType && h2.parentNode === e) break;
            if (4 === g) for (g = d2.return; null !== g; ) {
              var k2 = g.tag;
              if (3 === k2 || 4 === k2) {
                if (k2 = g.stateNode.containerInfo, k2 === e || 8 === k2.nodeType && k2.parentNode === e) return;
              }
              g = g.return;
            }
            for (; null !== h2; ) {
              g = Wc(h2);
              if (null === g) return;
              k2 = g.tag;
              if (5 === k2 || 6 === k2) {
                d2 = f2 = g;
                continue a;
              }
              h2 = h2.parentNode;
            }
          }
          d2 = d2.return;
        }
        Jb(function() {
          var d3 = f2, e2 = xb(c2), g2 = [];
          a: {
            var h3 = df.get(a2);
            if (void 0 !== h3) {
              var k3 = td, n2 = a2;
              switch (a2) {
                case "keypress":
                  if (0 === od(c2)) break a;
                case "keydown":
                case "keyup":
                  k3 = Rd;
                  break;
                case "focusin":
                  n2 = "focus";
                  k3 = Fd;
                  break;
                case "focusout":
                  n2 = "blur";
                  k3 = Fd;
                  break;
                case "beforeblur":
                case "afterblur":
                  k3 = Fd;
                  break;
                case "click":
                  if (2 === c2.button) break a;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                  k3 = Bd;
                  break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                  k3 = Dd;
                  break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                  k3 = Vd;
                  break;
                case $e2:
                case af:
                case bf:
                  k3 = Hd;
                  break;
                case cf:
                  k3 = Xd;
                  break;
                case "scroll":
                  k3 = vd;
                  break;
                case "wheel":
                  k3 = Zd;
                  break;
                case "copy":
                case "cut":
                case "paste":
                  k3 = Jd;
                  break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                  k3 = Td;
              }
              var t2 = 0 !== (b2 & 4), J2 = !t2 && "scroll" === a2, x2 = t2 ? null !== h3 ? h3 + "Capture" : null : h3;
              t2 = [];
              for (var w2 = d3, u2; null !== w2; ) {
                u2 = w2;
                var F2 = u2.stateNode;
                5 === u2.tag && null !== F2 && (u2 = F2, null !== x2 && (F2 = Kb(w2, x2), null != F2 && t2.push(tf(w2, F2, u2))));
                if (J2) break;
                w2 = w2.return;
              }
              0 < t2.length && (h3 = new k3(h3, n2, null, c2, e2), g2.push({ event: h3, listeners: t2 }));
            }
          }
          if (0 === (b2 & 7)) {
            a: {
              h3 = "mouseover" === a2 || "pointerover" === a2;
              k3 = "mouseout" === a2 || "pointerout" === a2;
              if (h3 && c2 !== wb && (n2 = c2.relatedTarget || c2.fromElement) && (Wc(n2) || n2[uf])) break a;
              if (k3 || h3) {
                h3 = e2.window === e2 ? e2 : (h3 = e2.ownerDocument) ? h3.defaultView || h3.parentWindow : window;
                if (k3) {
                  if (n2 = c2.relatedTarget || c2.toElement, k3 = d3, n2 = n2 ? Wc(n2) : null, null !== n2 && (J2 = Vb(n2), n2 !== J2 || 5 !== n2.tag && 6 !== n2.tag)) n2 = null;
                } else k3 = null, n2 = d3;
                if (k3 !== n2) {
                  t2 = Bd;
                  F2 = "onMouseLeave";
                  x2 = "onMouseEnter";
                  w2 = "mouse";
                  if ("pointerout" === a2 || "pointerover" === a2) t2 = Td, F2 = "onPointerLeave", x2 = "onPointerEnter", w2 = "pointer";
                  J2 = null == k3 ? h3 : ue2(k3);
                  u2 = null == n2 ? h3 : ue2(n2);
                  h3 = new t2(F2, w2 + "leave", k3, c2, e2);
                  h3.target = J2;
                  h3.relatedTarget = u2;
                  F2 = null;
                  Wc(e2) === d3 && (t2 = new t2(x2, w2 + "enter", n2, c2, e2), t2.target = u2, t2.relatedTarget = J2, F2 = t2);
                  J2 = F2;
                  if (k3 && n2) b: {
                    t2 = k3;
                    x2 = n2;
                    w2 = 0;
                    for (u2 = t2; u2; u2 = vf(u2)) w2++;
                    u2 = 0;
                    for (F2 = x2; F2; F2 = vf(F2)) u2++;
                    for (; 0 < w2 - u2; ) t2 = vf(t2), w2--;
                    for (; 0 < u2 - w2; ) x2 = vf(x2), u2--;
                    for (; w2--; ) {
                      if (t2 === x2 || null !== x2 && t2 === x2.alternate) break b;
                      t2 = vf(t2);
                      x2 = vf(x2);
                    }
                    t2 = null;
                  }
                  else t2 = null;
                  null !== k3 && wf(g2, h3, k3, t2, false);
                  null !== n2 && null !== J2 && wf(g2, J2, n2, t2, true);
                }
              }
            }
            a: {
              h3 = d3 ? ue2(d3) : window;
              k3 = h3.nodeName && h3.nodeName.toLowerCase();
              if ("select" === k3 || "input" === k3 && "file" === h3.type) var na = ve2;
              else if (me2(h3)) if (we2) na = Fe2;
              else {
                na = De2;
                var xa = Ce2;
              }
              else (k3 = h3.nodeName) && "input" === k3.toLowerCase() && ("checkbox" === h3.type || "radio" === h3.type) && (na = Ee2);
              if (na && (na = na(a2, d3))) {
                ne2(g2, na, c2, e2);
                break a;
              }
              xa && xa(a2, h3, d3);
              "focusout" === a2 && (xa = h3._wrapperState) && xa.controlled && "number" === h3.type && cb(h3, "number", h3.value);
            }
            xa = d3 ? ue2(d3) : window;
            switch (a2) {
              case "focusin":
                if (me2(xa) || "true" === xa.contentEditable) Qe2 = xa, Re2 = d3, Se2 = null;
                break;
              case "focusout":
                Se2 = Re2 = Qe2 = null;
                break;
              case "mousedown":
                Te2 = true;
                break;
              case "contextmenu":
              case "mouseup":
              case "dragend":
                Te2 = false;
                Ue2(g2, c2, e2);
                break;
              case "selectionchange":
                if (Pe2) break;
              case "keydown":
              case "keyup":
                Ue2(g2, c2, e2);
            }
            var $a;
            if (ae2) b: {
              switch (a2) {
                case "compositionstart":
                  var ba = "onCompositionStart";
                  break b;
                case "compositionend":
                  ba = "onCompositionEnd";
                  break b;
                case "compositionupdate":
                  ba = "onCompositionUpdate";
                  break b;
              }
              ba = void 0;
            }
            else ie2 ? ge2(a2, c2) && (ba = "onCompositionEnd") : "keydown" === a2 && 229 === c2.keyCode && (ba = "onCompositionStart");
            ba && (de2 && "ko" !== c2.locale && (ie2 || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie2 && ($a = nd()) : (kd = e2, ld = "value" in kd ? kd.value : kd.textContent, ie2 = true)), xa = oe2(d3, ba), 0 < xa.length && (ba = new Ld(ba, a2, null, c2, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he2(c2), null !== $a && (ba.data = $a))));
            if ($a = ce2 ? je2(a2, c2) : ke2(a2, c2)) d3 = oe2(d3, "onBeforeInput"), 0 < d3.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c2, e2), g2.push({ event: e2, listeners: d3 }), e2.data = $a);
          }
          se2(g2, b2);
        });
      }
      function tf(a2, b2, c2) {
        return { instance: a2, listener: b2, currentTarget: c2 };
      }
      function oe2(a2, b2) {
        for (var c2 = b2 + "Capture", d2 = []; null !== a2; ) {
          var e = a2, f2 = e.stateNode;
          5 === e.tag && null !== f2 && (e = f2, f2 = Kb(a2, c2), null != f2 && d2.unshift(tf(a2, f2, e)), f2 = Kb(a2, b2), null != f2 && d2.push(tf(a2, f2, e)));
          a2 = a2.return;
        }
        return d2;
      }
      function vf(a2) {
        if (null === a2) return null;
        do
          a2 = a2.return;
        while (a2 && 5 !== a2.tag);
        return a2 ? a2 : null;
      }
      function wf(a2, b2, c2, d2, e) {
        for (var f2 = b2._reactName, g = []; null !== c2 && c2 !== d2; ) {
          var h2 = c2, k2 = h2.alternate, l2 = h2.stateNode;
          if (null !== k2 && k2 === d2) break;
          5 === h2.tag && null !== l2 && (h2 = l2, e ? (k2 = Kb(c2, f2), null != k2 && g.unshift(tf(c2, k2, h2))) : e || (k2 = Kb(c2, f2), null != k2 && g.push(tf(c2, k2, h2))));
          c2 = c2.return;
        }
        0 !== g.length && a2.push({ event: b2, listeners: g });
      }
      var xf = /\r\n?/g;
      var yf = /\u0000|\uFFFD/g;
      function zf(a2) {
        return ("string" === typeof a2 ? a2 : "" + a2).replace(xf, "\n").replace(yf, "");
      }
      function Af(a2, b2, c2) {
        b2 = zf(b2);
        if (zf(a2) !== b2 && c2) throw Error(p2(425));
      }
      function Bf() {
      }
      var Cf = null;
      var Df = null;
      function Ef(a2, b2) {
        return "textarea" === a2 || "noscript" === a2 || "string" === typeof b2.children || "number" === typeof b2.children || "object" === typeof b2.dangerouslySetInnerHTML && null !== b2.dangerouslySetInnerHTML && null != b2.dangerouslySetInnerHTML.__html;
      }
      var Ff = "function" === typeof setTimeout ? setTimeout : void 0;
      var Gf = "function" === typeof clearTimeout ? clearTimeout : void 0;
      var Hf = "function" === typeof Promise ? Promise : void 0;
      var Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a2) {
        return Hf.resolve(null).then(a2).catch(If);
      } : Ff;
      function If(a2) {
        setTimeout(function() {
          throw a2;
        });
      }
      function Kf(a2, b2) {
        var c2 = b2, d2 = 0;
        do {
          var e = c2.nextSibling;
          a2.removeChild(c2);
          if (e && 8 === e.nodeType) if (c2 = e.data, "/$" === c2) {
            if (0 === d2) {
              a2.removeChild(e);
              bd(b2);
              return;
            }
            d2--;
          } else "$" !== c2 && "$?" !== c2 && "$!" !== c2 || d2++;
          c2 = e;
        } while (c2);
        bd(b2);
      }
      function Lf(a2) {
        for (; null != a2; a2 = a2.nextSibling) {
          var b2 = a2.nodeType;
          if (1 === b2 || 3 === b2) break;
          if (8 === b2) {
            b2 = a2.data;
            if ("$" === b2 || "$!" === b2 || "$?" === b2) break;
            if ("/$" === b2) return null;
          }
        }
        return a2;
      }
      function Mf(a2) {
        a2 = a2.previousSibling;
        for (var b2 = 0; a2; ) {
          if (8 === a2.nodeType) {
            var c2 = a2.data;
            if ("$" === c2 || "$!" === c2 || "$?" === c2) {
              if (0 === b2) return a2;
              b2--;
            } else "/$" === c2 && b2++;
          }
          a2 = a2.previousSibling;
        }
        return null;
      }
      var Nf = Math.random().toString(36).slice(2);
      var Of = "__reactFiber$" + Nf;
      var Pf = "__reactProps$" + Nf;
      var uf = "__reactContainer$" + Nf;
      var of = "__reactEvents$" + Nf;
      var Qf = "__reactListeners$" + Nf;
      var Rf = "__reactHandles$" + Nf;
      function Wc(a2) {
        var b2 = a2[Of];
        if (b2) return b2;
        for (var c2 = a2.parentNode; c2; ) {
          if (b2 = c2[uf] || c2[Of]) {
            c2 = b2.alternate;
            if (null !== b2.child || null !== c2 && null !== c2.child) for (a2 = Mf(a2); null !== a2; ) {
              if (c2 = a2[Of]) return c2;
              a2 = Mf(a2);
            }
            return b2;
          }
          a2 = c2;
          c2 = a2.parentNode;
        }
        return null;
      }
      function Cb(a2) {
        a2 = a2[Of] || a2[uf];
        return !a2 || 5 !== a2.tag && 6 !== a2.tag && 13 !== a2.tag && 3 !== a2.tag ? null : a2;
      }
      function ue2(a2) {
        if (5 === a2.tag || 6 === a2.tag) return a2.stateNode;
        throw Error(p2(33));
      }
      function Db(a2) {
        return a2[Pf] || null;
      }
      var Sf = [];
      var Tf = -1;
      function Uf(a2) {
        return { current: a2 };
      }
      function E2(a2) {
        0 > Tf || (a2.current = Sf[Tf], Sf[Tf] = null, Tf--);
      }
      function G2(a2, b2) {
        Tf++;
        Sf[Tf] = a2.current;
        a2.current = b2;
      }
      var Vf = {};
      var H2 = Uf(Vf);
      var Wf = Uf(false);
      var Xf = Vf;
      function Yf(a2, b2) {
        var c2 = a2.type.contextTypes;
        if (!c2) return Vf;
        var d2 = a2.stateNode;
        if (d2 && d2.__reactInternalMemoizedUnmaskedChildContext === b2) return d2.__reactInternalMemoizedMaskedChildContext;
        var e = {}, f2;
        for (f2 in c2) e[f2] = b2[f2];
        d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = b2, a2.__reactInternalMemoizedMaskedChildContext = e);
        return e;
      }
      function Zf(a2) {
        a2 = a2.childContextTypes;
        return null !== a2 && void 0 !== a2;
      }
      function $f() {
        E2(Wf);
        E2(H2);
      }
      function ag(a2, b2, c2) {
        if (H2.current !== Vf) throw Error(p2(168));
        G2(H2, b2);
        G2(Wf, c2);
      }
      function bg(a2, b2, c2) {
        var d2 = a2.stateNode;
        b2 = b2.childContextTypes;
        if ("function" !== typeof d2.getChildContext) return c2;
        d2 = d2.getChildContext();
        for (var e in d2) if (!(e in b2)) throw Error(p2(108, Ra(a2) || "Unknown", e));
        return A({}, c2, d2);
      }
      function cg(a2) {
        a2 = (a2 = a2.stateNode) && a2.__reactInternalMemoizedMergedChildContext || Vf;
        Xf = H2.current;
        G2(H2, a2);
        G2(Wf, Wf.current);
        return true;
      }
      function dg(a2, b2, c2) {
        var d2 = a2.stateNode;
        if (!d2) throw Error(p2(169));
        c2 ? (a2 = bg(a2, b2, Xf), d2.__reactInternalMemoizedMergedChildContext = a2, E2(Wf), E2(H2), G2(H2, a2)) : E2(Wf);
        G2(Wf, c2);
      }
      var eg = null;
      var fg = false;
      var gg = false;
      function hg(a2) {
        null === eg ? eg = [a2] : eg.push(a2);
      }
      function ig(a2) {
        fg = true;
        hg(a2);
      }
      function jg() {
        if (!gg && null !== eg) {
          gg = true;
          var a2 = 0, b2 = C2;
          try {
            var c2 = eg;
            for (C2 = 1; a2 < c2.length; a2++) {
              var d2 = c2[a2];
              do
                d2 = d2(true);
              while (null !== d2);
            }
            eg = null;
            fg = false;
          } catch (e) {
            throw null !== eg && (eg = eg.slice(a2 + 1)), ac(fc, jg), e;
          } finally {
            C2 = b2, gg = false;
          }
        }
        return null;
      }
      var kg = [];
      var lg = 0;
      var mg = null;
      var ng = 0;
      var og = [];
      var pg = 0;
      var qg = null;
      var rg = 1;
      var sg = "";
      function tg(a2, b2) {
        kg[lg++] = ng;
        kg[lg++] = mg;
        mg = a2;
        ng = b2;
      }
      function ug(a2, b2, c2) {
        og[pg++] = rg;
        og[pg++] = sg;
        og[pg++] = qg;
        qg = a2;
        var d2 = rg;
        a2 = sg;
        var e = 32 - oc(d2) - 1;
        d2 &= ~(1 << e);
        c2 += 1;
        var f2 = 32 - oc(b2) + e;
        if (30 < f2) {
          var g = e - e % 5;
          f2 = (d2 & (1 << g) - 1).toString(32);
          d2 >>= g;
          e -= g;
          rg = 1 << 32 - oc(b2) + e | c2 << e | d2;
          sg = f2 + a2;
        } else rg = 1 << f2 | c2 << e | d2, sg = a2;
      }
      function vg(a2) {
        null !== a2.return && (tg(a2, 1), ug(a2, 1, 0));
      }
      function wg(a2) {
        for (; a2 === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
        for (; a2 === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
      }
      var xg = null;
      var yg = null;
      var I2 = false;
      var zg = null;
      function Ag(a2, b2) {
        var c2 = Bg(5, null, null, 0);
        c2.elementType = "DELETED";
        c2.stateNode = b2;
        c2.return = a2;
        b2 = a2.deletions;
        null === b2 ? (a2.deletions = [c2], a2.flags |= 16) : b2.push(c2);
      }
      function Cg(a2, b2) {
        switch (a2.tag) {
          case 5:
            var c2 = a2.type;
            b2 = 1 !== b2.nodeType || c2.toLowerCase() !== b2.nodeName.toLowerCase() ? null : b2;
            return null !== b2 ? (a2.stateNode = b2, xg = a2, yg = Lf(b2.firstChild), true) : false;
          case 6:
            return b2 = "" === a2.pendingProps || 3 !== b2.nodeType ? null : b2, null !== b2 ? (a2.stateNode = b2, xg = a2, yg = null, true) : false;
          case 13:
            return b2 = 8 !== b2.nodeType ? null : b2, null !== b2 ? (c2 = null !== qg ? { id: rg, overflow: sg } : null, a2.memoizedState = { dehydrated: b2, treeContext: c2, retryLane: 1073741824 }, c2 = Bg(18, null, null, 0), c2.stateNode = b2, c2.return = a2, a2.child = c2, xg = a2, yg = null, true) : false;
          default:
            return false;
        }
      }
      function Dg(a2) {
        return 0 !== (a2.mode & 1) && 0 === (a2.flags & 128);
      }
      function Eg(a2) {
        if (I2) {
          var b2 = yg;
          if (b2) {
            var c2 = b2;
            if (!Cg(a2, b2)) {
              if (Dg(a2)) throw Error(p2(418));
              b2 = Lf(c2.nextSibling);
              var d2 = xg;
              b2 && Cg(a2, b2) ? Ag(d2, c2) : (a2.flags = a2.flags & -4097 | 2, I2 = false, xg = a2);
            }
          } else {
            if (Dg(a2)) throw Error(p2(418));
            a2.flags = a2.flags & -4097 | 2;
            I2 = false;
            xg = a2;
          }
        }
      }
      function Fg(a2) {
        for (a2 = a2.return; null !== a2 && 5 !== a2.tag && 3 !== a2.tag && 13 !== a2.tag; ) a2 = a2.return;
        xg = a2;
      }
      function Gg(a2) {
        if (a2 !== xg) return false;
        if (!I2) return Fg(a2), I2 = true, false;
        var b2;
        (b2 = 3 !== a2.tag) && !(b2 = 5 !== a2.tag) && (b2 = a2.type, b2 = "head" !== b2 && "body" !== b2 && !Ef(a2.type, a2.memoizedProps));
        if (b2 && (b2 = yg)) {
          if (Dg(a2)) throw Hg(), Error(p2(418));
          for (; b2; ) Ag(a2, b2), b2 = Lf(b2.nextSibling);
        }
        Fg(a2);
        if (13 === a2.tag) {
          a2 = a2.memoizedState;
          a2 = null !== a2 ? a2.dehydrated : null;
          if (!a2) throw Error(p2(317));
          a: {
            a2 = a2.nextSibling;
            for (b2 = 0; a2; ) {
              if (8 === a2.nodeType) {
                var c2 = a2.data;
                if ("/$" === c2) {
                  if (0 === b2) {
                    yg = Lf(a2.nextSibling);
                    break a;
                  }
                  b2--;
                } else "$" !== c2 && "$!" !== c2 && "$?" !== c2 || b2++;
              }
              a2 = a2.nextSibling;
            }
            yg = null;
          }
        } else yg = xg ? Lf(a2.stateNode.nextSibling) : null;
        return true;
      }
      function Hg() {
        for (var a2 = yg; a2; ) a2 = Lf(a2.nextSibling);
      }
      function Ig() {
        yg = xg = null;
        I2 = false;
      }
      function Jg(a2) {
        null === zg ? zg = [a2] : zg.push(a2);
      }
      var Kg = ua.ReactCurrentBatchConfig;
      function Lg(a2, b2) {
        if (a2 && a2.defaultProps) {
          b2 = A({}, b2);
          a2 = a2.defaultProps;
          for (var c2 in a2) void 0 === b2[c2] && (b2[c2] = a2[c2]);
          return b2;
        }
        return b2;
      }
      var Mg = Uf(null);
      var Ng = null;
      var Og = null;
      var Pg = null;
      function Qg() {
        Pg = Og = Ng = null;
      }
      function Rg(a2) {
        var b2 = Mg.current;
        E2(Mg);
        a2._currentValue = b2;
      }
      function Sg(a2, b2, c2) {
        for (; null !== a2; ) {
          var d2 = a2.alternate;
          (a2.childLanes & b2) !== b2 ? (a2.childLanes |= b2, null !== d2 && (d2.childLanes |= b2)) : null !== d2 && (d2.childLanes & b2) !== b2 && (d2.childLanes |= b2);
          if (a2 === c2) break;
          a2 = a2.return;
        }
      }
      function Tg(a2, b2) {
        Ng = a2;
        Pg = Og = null;
        a2 = a2.dependencies;
        null !== a2 && null !== a2.firstContext && (0 !== (a2.lanes & b2) && (Ug = true), a2.firstContext = null);
      }
      function Vg(a2) {
        var b2 = a2._currentValue;
        if (Pg !== a2) if (a2 = { context: a2, memoizedValue: b2, next: null }, null === Og) {
          if (null === Ng) throw Error(p2(308));
          Og = a2;
          Ng.dependencies = { lanes: 0, firstContext: a2 };
        } else Og = Og.next = a2;
        return b2;
      }
      var Wg = null;
      function Xg(a2) {
        null === Wg ? Wg = [a2] : Wg.push(a2);
      }
      function Yg(a2, b2, c2, d2) {
        var e = b2.interleaved;
        null === e ? (c2.next = c2, Xg(b2)) : (c2.next = e.next, e.next = c2);
        b2.interleaved = c2;
        return Zg(a2, d2);
      }
      function Zg(a2, b2) {
        a2.lanes |= b2;
        var c2 = a2.alternate;
        null !== c2 && (c2.lanes |= b2);
        c2 = a2;
        for (a2 = a2.return; null !== a2; ) a2.childLanes |= b2, c2 = a2.alternate, null !== c2 && (c2.childLanes |= b2), c2 = a2, a2 = a2.return;
        return 3 === c2.tag ? c2.stateNode : null;
      }
      var $g = false;
      function ah(a2) {
        a2.updateQueue = { baseState: a2.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
      }
      function bh(a2, b2) {
        a2 = a2.updateQueue;
        b2.updateQueue === a2 && (b2.updateQueue = { baseState: a2.baseState, firstBaseUpdate: a2.firstBaseUpdate, lastBaseUpdate: a2.lastBaseUpdate, shared: a2.shared, effects: a2.effects });
      }
      function ch(a2, b2) {
        return { eventTime: a2, lane: b2, tag: 0, payload: null, callback: null, next: null };
      }
      function dh(a2, b2, c2) {
        var d2 = a2.updateQueue;
        if (null === d2) return null;
        d2 = d2.shared;
        if (0 !== (K2 & 2)) {
          var e = d2.pending;
          null === e ? b2.next = b2 : (b2.next = e.next, e.next = b2);
          d2.pending = b2;
          return Zg(a2, c2);
        }
        e = d2.interleaved;
        null === e ? (b2.next = b2, Xg(d2)) : (b2.next = e.next, e.next = b2);
        d2.interleaved = b2;
        return Zg(a2, c2);
      }
      function eh(a2, b2, c2) {
        b2 = b2.updateQueue;
        if (null !== b2 && (b2 = b2.shared, 0 !== (c2 & 4194240))) {
          var d2 = b2.lanes;
          d2 &= a2.pendingLanes;
          c2 |= d2;
          b2.lanes = c2;
          Cc(a2, c2);
        }
      }
      function fh(a2, b2) {
        var c2 = a2.updateQueue, d2 = a2.alternate;
        if (null !== d2 && (d2 = d2.updateQueue, c2 === d2)) {
          var e = null, f2 = null;
          c2 = c2.firstBaseUpdate;
          if (null !== c2) {
            do {
              var g = { eventTime: c2.eventTime, lane: c2.lane, tag: c2.tag, payload: c2.payload, callback: c2.callback, next: null };
              null === f2 ? e = f2 = g : f2 = f2.next = g;
              c2 = c2.next;
            } while (null !== c2);
            null === f2 ? e = f2 = b2 : f2 = f2.next = b2;
          } else e = f2 = b2;
          c2 = { baseState: d2.baseState, firstBaseUpdate: e, lastBaseUpdate: f2, shared: d2.shared, effects: d2.effects };
          a2.updateQueue = c2;
          return;
        }
        a2 = c2.lastBaseUpdate;
        null === a2 ? c2.firstBaseUpdate = b2 : a2.next = b2;
        c2.lastBaseUpdate = b2;
      }
      function gh(a2, b2, c2, d2) {
        var e = a2.updateQueue;
        $g = false;
        var f2 = e.firstBaseUpdate, g = e.lastBaseUpdate, h2 = e.shared.pending;
        if (null !== h2) {
          e.shared.pending = null;
          var k2 = h2, l2 = k2.next;
          k2.next = null;
          null === g ? f2 = l2 : g.next = l2;
          g = k2;
          var m2 = a2.alternate;
          null !== m2 && (m2 = m2.updateQueue, h2 = m2.lastBaseUpdate, h2 !== g && (null === h2 ? m2.firstBaseUpdate = l2 : h2.next = l2, m2.lastBaseUpdate = k2));
        }
        if (null !== f2) {
          var q2 = e.baseState;
          g = 0;
          m2 = l2 = k2 = null;
          h2 = f2;
          do {
            var r2 = h2.lane, y = h2.eventTime;
            if ((d2 & r2) === r2) {
              null !== m2 && (m2 = m2.next = {
                eventTime: y,
                lane: 0,
                tag: h2.tag,
                payload: h2.payload,
                callback: h2.callback,
                next: null
              });
              a: {
                var n2 = a2, t2 = h2;
                r2 = b2;
                y = c2;
                switch (t2.tag) {
                  case 1:
                    n2 = t2.payload;
                    if ("function" === typeof n2) {
                      q2 = n2.call(y, q2, r2);
                      break a;
                    }
                    q2 = n2;
                    break a;
                  case 3:
                    n2.flags = n2.flags & -65537 | 128;
                  case 0:
                    n2 = t2.payload;
                    r2 = "function" === typeof n2 ? n2.call(y, q2, r2) : n2;
                    if (null === r2 || void 0 === r2) break a;
                    q2 = A({}, q2, r2);
                    break a;
                  case 2:
                    $g = true;
                }
              }
              null !== h2.callback && 0 !== h2.lane && (a2.flags |= 64, r2 = e.effects, null === r2 ? e.effects = [h2] : r2.push(h2));
            } else y = { eventTime: y, lane: r2, tag: h2.tag, payload: h2.payload, callback: h2.callback, next: null }, null === m2 ? (l2 = m2 = y, k2 = q2) : m2 = m2.next = y, g |= r2;
            h2 = h2.next;
            if (null === h2) if (h2 = e.shared.pending, null === h2) break;
            else r2 = h2, h2 = r2.next, r2.next = null, e.lastBaseUpdate = r2, e.shared.pending = null;
          } while (1);
          null === m2 && (k2 = q2);
          e.baseState = k2;
          e.firstBaseUpdate = l2;
          e.lastBaseUpdate = m2;
          b2 = e.shared.interleaved;
          if (null !== b2) {
            e = b2;
            do
              g |= e.lane, e = e.next;
            while (e !== b2);
          } else null === f2 && (e.shared.lanes = 0);
          hh |= g;
          a2.lanes = g;
          a2.memoizedState = q2;
        }
      }
      function ih(a2, b2, c2) {
        a2 = b2.effects;
        b2.effects = null;
        if (null !== a2) for (b2 = 0; b2 < a2.length; b2++) {
          var d2 = a2[b2], e = d2.callback;
          if (null !== e) {
            d2.callback = null;
            d2 = c2;
            if ("function" !== typeof e) throw Error(p2(191, e));
            e.call(d2);
          }
        }
      }
      var jh = new aa.Component().refs;
      function kh(a2, b2, c2, d2) {
        b2 = a2.memoizedState;
        c2 = c2(d2, b2);
        c2 = null === c2 || void 0 === c2 ? b2 : A({}, b2, c2);
        a2.memoizedState = c2;
        0 === a2.lanes && (a2.updateQueue.baseState = c2);
      }
      var nh = { isMounted: function(a2) {
        return (a2 = a2._reactInternals) ? Vb(a2) === a2 : false;
      }, enqueueSetState: function(a2, b2, c2) {
        a2 = a2._reactInternals;
        var d2 = L2(), e = lh(a2), f2 = ch(d2, e);
        f2.payload = b2;
        void 0 !== c2 && null !== c2 && (f2.callback = c2);
        b2 = dh(a2, f2, e);
        null !== b2 && (mh(b2, a2, e, d2), eh(b2, a2, e));
      }, enqueueReplaceState: function(a2, b2, c2) {
        a2 = a2._reactInternals;
        var d2 = L2(), e = lh(a2), f2 = ch(d2, e);
        f2.tag = 1;
        f2.payload = b2;
        void 0 !== c2 && null !== c2 && (f2.callback = c2);
        b2 = dh(a2, f2, e);
        null !== b2 && (mh(b2, a2, e, d2), eh(b2, a2, e));
      }, enqueueForceUpdate: function(a2, b2) {
        a2 = a2._reactInternals;
        var c2 = L2(), d2 = lh(a2), e = ch(c2, d2);
        e.tag = 2;
        void 0 !== b2 && null !== b2 && (e.callback = b2);
        b2 = dh(a2, e, d2);
        null !== b2 && (mh(b2, a2, d2, c2), eh(b2, a2, d2));
      } };
      function oh(a2, b2, c2, d2, e, f2, g) {
        a2 = a2.stateNode;
        return "function" === typeof a2.shouldComponentUpdate ? a2.shouldComponentUpdate(d2, f2, g) : b2.prototype && b2.prototype.isPureReactComponent ? !Ie2(c2, d2) || !Ie2(e, f2) : true;
      }
      function ph(a2, b2, c2) {
        var d2 = false, e = Vf;
        var f2 = b2.contextType;
        "object" === typeof f2 && null !== f2 ? f2 = Vg(f2) : (e = Zf(b2) ? Xf : H2.current, d2 = b2.contextTypes, f2 = (d2 = null !== d2 && void 0 !== d2) ? Yf(a2, e) : Vf);
        b2 = new b2(c2, f2);
        a2.memoizedState = null !== b2.state && void 0 !== b2.state ? b2.state : null;
        b2.updater = nh;
        a2.stateNode = b2;
        b2._reactInternals = a2;
        d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = e, a2.__reactInternalMemoizedMaskedChildContext = f2);
        return b2;
      }
      function qh(a2, b2, c2, d2) {
        a2 = b2.state;
        "function" === typeof b2.componentWillReceiveProps && b2.componentWillReceiveProps(c2, d2);
        "function" === typeof b2.UNSAFE_componentWillReceiveProps && b2.UNSAFE_componentWillReceiveProps(c2, d2);
        b2.state !== a2 && nh.enqueueReplaceState(b2, b2.state, null);
      }
      function rh(a2, b2, c2, d2) {
        var e = a2.stateNode;
        e.props = c2;
        e.state = a2.memoizedState;
        e.refs = jh;
        ah(a2);
        var f2 = b2.contextType;
        "object" === typeof f2 && null !== f2 ? e.context = Vg(f2) : (f2 = Zf(b2) ? Xf : H2.current, e.context = Yf(a2, f2));
        e.state = a2.memoizedState;
        f2 = b2.getDerivedStateFromProps;
        "function" === typeof f2 && (kh(a2, b2, f2, c2), e.state = a2.memoizedState);
        "function" === typeof b2.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b2 = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b2 !== e.state && nh.enqueueReplaceState(e, e.state, null), gh(a2, c2, e, d2), e.state = a2.memoizedState);
        "function" === typeof e.componentDidMount && (a2.flags |= 4194308);
      }
      function sh(a2, b2, c2) {
        a2 = c2.ref;
        if (null !== a2 && "function" !== typeof a2 && "object" !== typeof a2) {
          if (c2._owner) {
            c2 = c2._owner;
            if (c2) {
              if (1 !== c2.tag) throw Error(p2(309));
              var d2 = c2.stateNode;
            }
            if (!d2) throw Error(p2(147, a2));
            var e = d2, f2 = "" + a2;
            if (null !== b2 && null !== b2.ref && "function" === typeof b2.ref && b2.ref._stringRef === f2) return b2.ref;
            b2 = function(a3) {
              var b3 = e.refs;
              b3 === jh && (b3 = e.refs = {});
              null === a3 ? delete b3[f2] : b3[f2] = a3;
            };
            b2._stringRef = f2;
            return b2;
          }
          if ("string" !== typeof a2) throw Error(p2(284));
          if (!c2._owner) throw Error(p2(290, a2));
        }
        return a2;
      }
      function th(a2, b2) {
        a2 = Object.prototype.toString.call(b2);
        throw Error(p2(31, "[object Object]" === a2 ? "object with keys {" + Object.keys(b2).join(", ") + "}" : a2));
      }
      function uh(a2) {
        var b2 = a2._init;
        return b2(a2._payload);
      }
      function vh(a2) {
        function b2(b3, c3) {
          if (a2) {
            var d3 = b3.deletions;
            null === d3 ? (b3.deletions = [c3], b3.flags |= 16) : d3.push(c3);
          }
        }
        function c2(c3, d3) {
          if (!a2) return null;
          for (; null !== d3; ) b2(c3, d3), d3 = d3.sibling;
          return null;
        }
        function d2(a3, b3) {
          for (a3 = /* @__PURE__ */ new Map(); null !== b3; ) null !== b3.key ? a3.set(b3.key, b3) : a3.set(b3.index, b3), b3 = b3.sibling;
          return a3;
        }
        function e(a3, b3) {
          a3 = wh(a3, b3);
          a3.index = 0;
          a3.sibling = null;
          return a3;
        }
        function f2(b3, c3, d3) {
          b3.index = d3;
          if (!a2) return b3.flags |= 1048576, c3;
          d3 = b3.alternate;
          if (null !== d3) return d3 = d3.index, d3 < c3 ? (b3.flags |= 2, c3) : d3;
          b3.flags |= 2;
          return c3;
        }
        function g(b3) {
          a2 && null === b3.alternate && (b3.flags |= 2);
          return b3;
        }
        function h2(a3, b3, c3, d3) {
          if (null === b3 || 6 !== b3.tag) return b3 = xh(c3, a3.mode, d3), b3.return = a3, b3;
          b3 = e(b3, c3);
          b3.return = a3;
          return b3;
        }
        function k2(a3, b3, c3, d3) {
          var f3 = c3.type;
          if (f3 === ya) return m2(a3, b3, c3.props.children, d3, c3.key);
          if (null !== b3 && (b3.elementType === f3 || "object" === typeof f3 && null !== f3 && f3.$$typeof === Ha && uh(f3) === b3.type)) return d3 = e(b3, c3.props), d3.ref = sh(a3, b3, c3), d3.return = a3, d3;
          d3 = yh(c3.type, c3.key, c3.props, null, a3.mode, d3);
          d3.ref = sh(a3, b3, c3);
          d3.return = a3;
          return d3;
        }
        function l2(a3, b3, c3, d3) {
          if (null === b3 || 4 !== b3.tag || b3.stateNode.containerInfo !== c3.containerInfo || b3.stateNode.implementation !== c3.implementation) return b3 = zh(c3, a3.mode, d3), b3.return = a3, b3;
          b3 = e(b3, c3.children || []);
          b3.return = a3;
          return b3;
        }
        function m2(a3, b3, c3, d3, f3) {
          if (null === b3 || 7 !== b3.tag) return b3 = Ah(c3, a3.mode, d3, f3), b3.return = a3, b3;
          b3 = e(b3, c3);
          b3.return = a3;
          return b3;
        }
        function q2(a3, b3, c3) {
          if ("string" === typeof b3 && "" !== b3 || "number" === typeof b3) return b3 = xh("" + b3, a3.mode, c3), b3.return = a3, b3;
          if ("object" === typeof b3 && null !== b3) {
            switch (b3.$$typeof) {
              case va:
                return c3 = yh(b3.type, b3.key, b3.props, null, a3.mode, c3), c3.ref = sh(a3, null, b3), c3.return = a3, c3;
              case wa:
                return b3 = zh(b3, a3.mode, c3), b3.return = a3, b3;
              case Ha:
                var d3 = b3._init;
                return q2(a3, d3(b3._payload), c3);
            }
            if (eb(b3) || Ka(b3)) return b3 = Ah(b3, a3.mode, c3, null), b3.return = a3, b3;
            th(a3, b3);
          }
          return null;
        }
        function r2(a3, b3, c3, d3) {
          var e2 = null !== b3 ? b3.key : null;
          if ("string" === typeof c3 && "" !== c3 || "number" === typeof c3) return null !== e2 ? null : h2(a3, b3, "" + c3, d3);
          if ("object" === typeof c3 && null !== c3) {
            switch (c3.$$typeof) {
              case va:
                return c3.key === e2 ? k2(a3, b3, c3, d3) : null;
              case wa:
                return c3.key === e2 ? l2(a3, b3, c3, d3) : null;
              case Ha:
                return e2 = c3._init, r2(
                  a3,
                  b3,
                  e2(c3._payload),
                  d3
                );
            }
            if (eb(c3) || Ka(c3)) return null !== e2 ? null : m2(a3, b3, c3, d3, null);
            th(a3, c3);
          }
          return null;
        }
        function y(a3, b3, c3, d3, e2) {
          if ("string" === typeof d3 && "" !== d3 || "number" === typeof d3) return a3 = a3.get(c3) || null, h2(b3, a3, "" + d3, e2);
          if ("object" === typeof d3 && null !== d3) {
            switch (d3.$$typeof) {
              case va:
                return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, k2(b3, a3, d3, e2);
              case wa:
                return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, l2(b3, a3, d3, e2);
              case Ha:
                var f3 = d3._init;
                return y(a3, b3, c3, f3(d3._payload), e2);
            }
            if (eb(d3) || Ka(d3)) return a3 = a3.get(c3) || null, m2(b3, a3, d3, e2, null);
            th(b3, d3);
          }
          return null;
        }
        function n2(e2, g2, h3, k3) {
          for (var l3 = null, m3 = null, u2 = g2, w2 = g2 = 0, x2 = null; null !== u2 && w2 < h3.length; w2++) {
            u2.index > w2 ? (x2 = u2, u2 = null) : x2 = u2.sibling;
            var n3 = r2(e2, u2, h3[w2], k3);
            if (null === n3) {
              null === u2 && (u2 = x2);
              break;
            }
            a2 && u2 && null === n3.alternate && b2(e2, u2);
            g2 = f2(n3, g2, w2);
            null === m3 ? l3 = n3 : m3.sibling = n3;
            m3 = n3;
            u2 = x2;
          }
          if (w2 === h3.length) return c2(e2, u2), I2 && tg(e2, w2), l3;
          if (null === u2) {
            for (; w2 < h3.length; w2++) u2 = q2(e2, h3[w2], k3), null !== u2 && (g2 = f2(u2, g2, w2), null === m3 ? l3 = u2 : m3.sibling = u2, m3 = u2);
            I2 && tg(e2, w2);
            return l3;
          }
          for (u2 = d2(e2, u2); w2 < h3.length; w2++) x2 = y(u2, e2, w2, h3[w2], k3), null !== x2 && (a2 && null !== x2.alternate && u2.delete(null === x2.key ? w2 : x2.key), g2 = f2(x2, g2, w2), null === m3 ? l3 = x2 : m3.sibling = x2, m3 = x2);
          a2 && u2.forEach(function(a3) {
            return b2(e2, a3);
          });
          I2 && tg(e2, w2);
          return l3;
        }
        function t2(e2, g2, h3, k3) {
          var l3 = Ka(h3);
          if ("function" !== typeof l3) throw Error(p2(150));
          h3 = l3.call(h3);
          if (null == h3) throw Error(p2(151));
          for (var u2 = l3 = null, m3 = g2, w2 = g2 = 0, x2 = null, n3 = h3.next(); null !== m3 && !n3.done; w2++, n3 = h3.next()) {
            m3.index > w2 ? (x2 = m3, m3 = null) : x2 = m3.sibling;
            var t3 = r2(e2, m3, n3.value, k3);
            if (null === t3) {
              null === m3 && (m3 = x2);
              break;
            }
            a2 && m3 && null === t3.alternate && b2(e2, m3);
            g2 = f2(t3, g2, w2);
            null === u2 ? l3 = t3 : u2.sibling = t3;
            u2 = t3;
            m3 = x2;
          }
          if (n3.done) return c2(
            e2,
            m3
          ), I2 && tg(e2, w2), l3;
          if (null === m3) {
            for (; !n3.done; w2++, n3 = h3.next()) n3 = q2(e2, n3.value, k3), null !== n3 && (g2 = f2(n3, g2, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
            I2 && tg(e2, w2);
            return l3;
          }
          for (m3 = d2(e2, m3); !n3.done; w2++, n3 = h3.next()) n3 = y(m3, e2, w2, n3.value, k3), null !== n3 && (a2 && null !== n3.alternate && m3.delete(null === n3.key ? w2 : n3.key), g2 = f2(n3, g2, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
          a2 && m3.forEach(function(a3) {
            return b2(e2, a3);
          });
          I2 && tg(e2, w2);
          return l3;
        }
        function J2(a3, d3, f3, h3) {
          "object" === typeof f3 && null !== f3 && f3.type === ya && null === f3.key && (f3 = f3.props.children);
          if ("object" === typeof f3 && null !== f3) {
            switch (f3.$$typeof) {
              case va:
                a: {
                  for (var k3 = f3.key, l3 = d3; null !== l3; ) {
                    if (l3.key === k3) {
                      k3 = f3.type;
                      if (k3 === ya) {
                        if (7 === l3.tag) {
                          c2(a3, l3.sibling);
                          d3 = e(l3, f3.props.children);
                          d3.return = a3;
                          a3 = d3;
                          break a;
                        }
                      } else if (l3.elementType === k3 || "object" === typeof k3 && null !== k3 && k3.$$typeof === Ha && uh(k3) === l3.type) {
                        c2(a3, l3.sibling);
                        d3 = e(l3, f3.props);
                        d3.ref = sh(a3, l3, f3);
                        d3.return = a3;
                        a3 = d3;
                        break a;
                      }
                      c2(a3, l3);
                      break;
                    } else b2(a3, l3);
                    l3 = l3.sibling;
                  }
                  f3.type === ya ? (d3 = Ah(f3.props.children, a3.mode, h3, f3.key), d3.return = a3, a3 = d3) : (h3 = yh(f3.type, f3.key, f3.props, null, a3.mode, h3), h3.ref = sh(a3, d3, f3), h3.return = a3, a3 = h3);
                }
                return g(a3);
              case wa:
                a: {
                  for (l3 = f3.key; null !== d3; ) {
                    if (d3.key === l3) if (4 === d3.tag && d3.stateNode.containerInfo === f3.containerInfo && d3.stateNode.implementation === f3.implementation) {
                      c2(a3, d3.sibling);
                      d3 = e(d3, f3.children || []);
                      d3.return = a3;
                      a3 = d3;
                      break a;
                    } else {
                      c2(a3, d3);
                      break;
                    }
                    else b2(a3, d3);
                    d3 = d3.sibling;
                  }
                  d3 = zh(f3, a3.mode, h3);
                  d3.return = a3;
                  a3 = d3;
                }
                return g(a3);
              case Ha:
                return l3 = f3._init, J2(a3, d3, l3(f3._payload), h3);
            }
            if (eb(f3)) return n2(a3, d3, f3, h3);
            if (Ka(f3)) return t2(a3, d3, f3, h3);
            th(a3, f3);
          }
          return "string" === typeof f3 && "" !== f3 || "number" === typeof f3 ? (f3 = "" + f3, null !== d3 && 6 === d3.tag ? (c2(a3, d3.sibling), d3 = e(d3, f3), d3.return = a3, a3 = d3) : (c2(a3, d3), d3 = xh(f3, a3.mode, h3), d3.return = a3, a3 = d3), g(a3)) : c2(a3, d3);
        }
        return J2;
      }
      var Bh = vh(true);
      var Ch = vh(false);
      var Dh = {};
      var Eh = Uf(Dh);
      var Fh = Uf(Dh);
      var Gh = Uf(Dh);
      function Hh(a2) {
        if (a2 === Dh) throw Error(p2(174));
        return a2;
      }
      function Ih(a2, b2) {
        G2(Gh, b2);
        G2(Fh, a2);
        G2(Eh, Dh);
        a2 = b2.nodeType;
        switch (a2) {
          case 9:
          case 11:
            b2 = (b2 = b2.documentElement) ? b2.namespaceURI : lb(null, "");
            break;
          default:
            a2 = 8 === a2 ? b2.parentNode : b2, b2 = a2.namespaceURI || null, a2 = a2.tagName, b2 = lb(b2, a2);
        }
        E2(Eh);
        G2(Eh, b2);
      }
      function Jh() {
        E2(Eh);
        E2(Fh);
        E2(Gh);
      }
      function Kh(a2) {
        Hh(Gh.current);
        var b2 = Hh(Eh.current);
        var c2 = lb(b2, a2.type);
        b2 !== c2 && (G2(Fh, a2), G2(Eh, c2));
      }
      function Lh(a2) {
        Fh.current === a2 && (E2(Eh), E2(Fh));
      }
      var M2 = Uf(0);
      function Mh(a2) {
        for (var b2 = a2; null !== b2; ) {
          if (13 === b2.tag) {
            var c2 = b2.memoizedState;
            if (null !== c2 && (c2 = c2.dehydrated, null === c2 || "$?" === c2.data || "$!" === c2.data)) return b2;
          } else if (19 === b2.tag && void 0 !== b2.memoizedProps.revealOrder) {
            if (0 !== (b2.flags & 128)) return b2;
          } else if (null !== b2.child) {
            b2.child.return = b2;
            b2 = b2.child;
            continue;
          }
          if (b2 === a2) break;
          for (; null === b2.sibling; ) {
            if (null === b2.return || b2.return === a2) return null;
            b2 = b2.return;
          }
          b2.sibling.return = b2.return;
          b2 = b2.sibling;
        }
        return null;
      }
      var Nh = [];
      function Oh() {
        for (var a2 = 0; a2 < Nh.length; a2++) Nh[a2]._workInProgressVersionPrimary = null;
        Nh.length = 0;
      }
      var Ph = ua.ReactCurrentDispatcher;
      var Qh = ua.ReactCurrentBatchConfig;
      var Rh = 0;
      var N2 = null;
      var O2 = null;
      var P = null;
      var Sh = false;
      var Th = false;
      var Uh = 0;
      var Vh = 0;
      function Q2() {
        throw Error(p2(321));
      }
      function Wh(a2, b2) {
        if (null === b2) return false;
        for (var c2 = 0; c2 < b2.length && c2 < a2.length; c2++) if (!He2(a2[c2], b2[c2])) return false;
        return true;
      }
      function Xh(a2, b2, c2, d2, e, f2) {
        Rh = f2;
        N2 = b2;
        b2.memoizedState = null;
        b2.updateQueue = null;
        b2.lanes = 0;
        Ph.current = null === a2 || null === a2.memoizedState ? Yh : Zh;
        a2 = c2(d2, e);
        if (Th) {
          f2 = 0;
          do {
            Th = false;
            Uh = 0;
            if (25 <= f2) throw Error(p2(301));
            f2 += 1;
            P = O2 = null;
            b2.updateQueue = null;
            Ph.current = $h;
            a2 = c2(d2, e);
          } while (Th);
        }
        Ph.current = ai;
        b2 = null !== O2 && null !== O2.next;
        Rh = 0;
        P = O2 = N2 = null;
        Sh = false;
        if (b2) throw Error(p2(300));
        return a2;
      }
      function bi() {
        var a2 = 0 !== Uh;
        Uh = 0;
        return a2;
      }
      function ci() {
        var a2 = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
        null === P ? N2.memoizedState = P = a2 : P = P.next = a2;
        return P;
      }
      function di() {
        if (null === O2) {
          var a2 = N2.alternate;
          a2 = null !== a2 ? a2.memoizedState : null;
        } else a2 = O2.next;
        var b2 = null === P ? N2.memoizedState : P.next;
        if (null !== b2) P = b2, O2 = a2;
        else {
          if (null === a2) throw Error(p2(310));
          O2 = a2;
          a2 = { memoizedState: O2.memoizedState, baseState: O2.baseState, baseQueue: O2.baseQueue, queue: O2.queue, next: null };
          null === P ? N2.memoizedState = P = a2 : P = P.next = a2;
        }
        return P;
      }
      function ei(a2, b2) {
        return "function" === typeof b2 ? b2(a2) : b2;
      }
      function fi(a2) {
        var b2 = di(), c2 = b2.queue;
        if (null === c2) throw Error(p2(311));
        c2.lastRenderedReducer = a2;
        var d2 = O2, e = d2.baseQueue, f2 = c2.pending;
        if (null !== f2) {
          if (null !== e) {
            var g = e.next;
            e.next = f2.next;
            f2.next = g;
          }
          d2.baseQueue = e = f2;
          c2.pending = null;
        }
        if (null !== e) {
          f2 = e.next;
          d2 = d2.baseState;
          var h2 = g = null, k2 = null, l2 = f2;
          do {
            var m2 = l2.lane;
            if ((Rh & m2) === m2) null !== k2 && (k2 = k2.next = { lane: 0, action: l2.action, hasEagerState: l2.hasEagerState, eagerState: l2.eagerState, next: null }), d2 = l2.hasEagerState ? l2.eagerState : a2(d2, l2.action);
            else {
              var q2 = {
                lane: m2,
                action: l2.action,
                hasEagerState: l2.hasEagerState,
                eagerState: l2.eagerState,
                next: null
              };
              null === k2 ? (h2 = k2 = q2, g = d2) : k2 = k2.next = q2;
              N2.lanes |= m2;
              hh |= m2;
            }
            l2 = l2.next;
          } while (null !== l2 && l2 !== f2);
          null === k2 ? g = d2 : k2.next = h2;
          He2(d2, b2.memoizedState) || (Ug = true);
          b2.memoizedState = d2;
          b2.baseState = g;
          b2.baseQueue = k2;
          c2.lastRenderedState = d2;
        }
        a2 = c2.interleaved;
        if (null !== a2) {
          e = a2;
          do
            f2 = e.lane, N2.lanes |= f2, hh |= f2, e = e.next;
          while (e !== a2);
        } else null === e && (c2.lanes = 0);
        return [b2.memoizedState, c2.dispatch];
      }
      function gi(a2) {
        var b2 = di(), c2 = b2.queue;
        if (null === c2) throw Error(p2(311));
        c2.lastRenderedReducer = a2;
        var d2 = c2.dispatch, e = c2.pending, f2 = b2.memoizedState;
        if (null !== e) {
          c2.pending = null;
          var g = e = e.next;
          do
            f2 = a2(f2, g.action), g = g.next;
          while (g !== e);
          He2(f2, b2.memoizedState) || (Ug = true);
          b2.memoizedState = f2;
          null === b2.baseQueue && (b2.baseState = f2);
          c2.lastRenderedState = f2;
        }
        return [f2, d2];
      }
      function hi() {
      }
      function ii(a2, b2) {
        var c2 = N2, d2 = di(), e = b2(), f2 = !He2(d2.memoizedState, e);
        f2 && (d2.memoizedState = e, Ug = true);
        d2 = d2.queue;
        ji(ki.bind(null, c2, d2, a2), [a2]);
        if (d2.getSnapshot !== b2 || f2 || null !== P && P.memoizedState.tag & 1) {
          c2.flags |= 2048;
          li(9, mi.bind(null, c2, d2, e, b2), void 0, null);
          if (null === R2) throw Error(p2(349));
          0 !== (Rh & 30) || ni(c2, b2, e);
        }
        return e;
      }
      function ni(a2, b2, c2) {
        a2.flags |= 16384;
        a2 = { getSnapshot: b2, value: c2 };
        b2 = N2.updateQueue;
        null === b2 ? (b2 = { lastEffect: null, stores: null }, N2.updateQueue = b2, b2.stores = [a2]) : (c2 = b2.stores, null === c2 ? b2.stores = [a2] : c2.push(a2));
      }
      function mi(a2, b2, c2, d2) {
        b2.value = c2;
        b2.getSnapshot = d2;
        oi(b2) && pi(a2);
      }
      function ki(a2, b2, c2) {
        return c2(function() {
          oi(b2) && pi(a2);
        });
      }
      function oi(a2) {
        var b2 = a2.getSnapshot;
        a2 = a2.value;
        try {
          var c2 = b2();
          return !He2(a2, c2);
        } catch (d2) {
          return true;
        }
      }
      function pi(a2) {
        var b2 = Zg(a2, 1);
        null !== b2 && mh(b2, a2, 1, -1);
      }
      function qi(a2) {
        var b2 = ci();
        "function" === typeof a2 && (a2 = a2());
        b2.memoizedState = b2.baseState = a2;
        a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ei, lastRenderedState: a2 };
        b2.queue = a2;
        a2 = a2.dispatch = ri.bind(null, N2, a2);
        return [b2.memoizedState, a2];
      }
      function li(a2, b2, c2, d2) {
        a2 = { tag: a2, create: b2, destroy: c2, deps: d2, next: null };
        b2 = N2.updateQueue;
        null === b2 ? (b2 = { lastEffect: null, stores: null }, N2.updateQueue = b2, b2.lastEffect = a2.next = a2) : (c2 = b2.lastEffect, null === c2 ? b2.lastEffect = a2.next = a2 : (d2 = c2.next, c2.next = a2, a2.next = d2, b2.lastEffect = a2));
        return a2;
      }
      function si() {
        return di().memoizedState;
      }
      function ti(a2, b2, c2, d2) {
        var e = ci();
        N2.flags |= a2;
        e.memoizedState = li(1 | b2, c2, void 0, void 0 === d2 ? null : d2);
      }
      function ui(a2, b2, c2, d2) {
        var e = di();
        d2 = void 0 === d2 ? null : d2;
        var f2 = void 0;
        if (null !== O2) {
          var g = O2.memoizedState;
          f2 = g.destroy;
          if (null !== d2 && Wh(d2, g.deps)) {
            e.memoizedState = li(b2, c2, f2, d2);
            return;
          }
        }
        N2.flags |= a2;
        e.memoizedState = li(1 | b2, c2, f2, d2);
      }
      function vi(a2, b2) {
        return ti(8390656, 8, a2, b2);
      }
      function ji(a2, b2) {
        return ui(2048, 8, a2, b2);
      }
      function wi(a2, b2) {
        return ui(4, 2, a2, b2);
      }
      function xi(a2, b2) {
        return ui(4, 4, a2, b2);
      }
      function yi(a2, b2) {
        if ("function" === typeof b2) return a2 = a2(), b2(a2), function() {
          b2(null);
        };
        if (null !== b2 && void 0 !== b2) return a2 = a2(), b2.current = a2, function() {
          b2.current = null;
        };
      }
      function zi(a2, b2, c2) {
        c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
        return ui(4, 4, yi.bind(null, b2, a2), c2);
      }
      function Ai() {
      }
      function Bi(a2, b2) {
        var c2 = di();
        b2 = void 0 === b2 ? null : b2;
        var d2 = c2.memoizedState;
        if (null !== d2 && null !== b2 && Wh(b2, d2[1])) return d2[0];
        c2.memoizedState = [a2, b2];
        return a2;
      }
      function Ci(a2, b2) {
        var c2 = di();
        b2 = void 0 === b2 ? null : b2;
        var d2 = c2.memoizedState;
        if (null !== d2 && null !== b2 && Wh(b2, d2[1])) return d2[0];
        a2 = a2();
        c2.memoizedState = [a2, b2];
        return a2;
      }
      function Di(a2, b2, c2) {
        if (0 === (Rh & 21)) return a2.baseState && (a2.baseState = false, Ug = true), a2.memoizedState = c2;
        He2(c2, b2) || (c2 = yc(), N2.lanes |= c2, hh |= c2, a2.baseState = true);
        return b2;
      }
      function Ei(a2, b2) {
        var c2 = C2;
        C2 = 0 !== c2 && 4 > c2 ? c2 : 4;
        a2(true);
        var d2 = Qh.transition;
        Qh.transition = {};
        try {
          a2(false), b2();
        } finally {
          C2 = c2, Qh.transition = d2;
        }
      }
      function Fi() {
        return di().memoizedState;
      }
      function Gi(a2, b2, c2) {
        var d2 = lh(a2);
        c2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
        if (Hi(a2)) Ii(b2, c2);
        else if (c2 = Yg(a2, b2, c2, d2), null !== c2) {
          var e = L2();
          mh(c2, a2, d2, e);
          Ji(c2, b2, d2);
        }
      }
      function ri(a2, b2, c2) {
        var d2 = lh(a2), e = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
        if (Hi(a2)) Ii(b2, e);
        else {
          var f2 = a2.alternate;
          if (0 === a2.lanes && (null === f2 || 0 === f2.lanes) && (f2 = b2.lastRenderedReducer, null !== f2)) try {
            var g = b2.lastRenderedState, h2 = f2(g, c2);
            e.hasEagerState = true;
            e.eagerState = h2;
            if (He2(h2, g)) {
              var k2 = b2.interleaved;
              null === k2 ? (e.next = e, Xg(b2)) : (e.next = k2.next, k2.next = e);
              b2.interleaved = e;
              return;
            }
          } catch (l2) {
          } finally {
          }
          c2 = Yg(a2, b2, e, d2);
          null !== c2 && (e = L2(), mh(c2, a2, d2, e), Ji(c2, b2, d2));
        }
      }
      function Hi(a2) {
        var b2 = a2.alternate;
        return a2 === N2 || null !== b2 && b2 === N2;
      }
      function Ii(a2, b2) {
        Th = Sh = true;
        var c2 = a2.pending;
        null === c2 ? b2.next = b2 : (b2.next = c2.next, c2.next = b2);
        a2.pending = b2;
      }
      function Ji(a2, b2, c2) {
        if (0 !== (c2 & 4194240)) {
          var d2 = b2.lanes;
          d2 &= a2.pendingLanes;
          c2 |= d2;
          b2.lanes = c2;
          Cc(a2, c2);
        }
      }
      var ai = { readContext: Vg, useCallback: Q2, useContext: Q2, useEffect: Q2, useImperativeHandle: Q2, useInsertionEffect: Q2, useLayoutEffect: Q2, useMemo: Q2, useReducer: Q2, useRef: Q2, useState: Q2, useDebugValue: Q2, useDeferredValue: Q2, useTransition: Q2, useMutableSource: Q2, useSyncExternalStore: Q2, useId: Q2, unstable_isNewReconciler: false };
      var Yh = { readContext: Vg, useCallback: function(a2, b2) {
        ci().memoizedState = [a2, void 0 === b2 ? null : b2];
        return a2;
      }, useContext: Vg, useEffect: vi, useImperativeHandle: function(a2, b2, c2) {
        c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
        return ti(
          4194308,
          4,
          yi.bind(null, b2, a2),
          c2
        );
      }, useLayoutEffect: function(a2, b2) {
        return ti(4194308, 4, a2, b2);
      }, useInsertionEffect: function(a2, b2) {
        return ti(4, 2, a2, b2);
      }, useMemo: function(a2, b2) {
        var c2 = ci();
        b2 = void 0 === b2 ? null : b2;
        a2 = a2();
        c2.memoizedState = [a2, b2];
        return a2;
      }, useReducer: function(a2, b2, c2) {
        var d2 = ci();
        b2 = void 0 !== c2 ? c2(b2) : b2;
        d2.memoizedState = d2.baseState = b2;
        a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a2, lastRenderedState: b2 };
        d2.queue = a2;
        a2 = a2.dispatch = Gi.bind(null, N2, a2);
        return [d2.memoizedState, a2];
      }, useRef: function(a2) {
        var b2 = ci();
        a2 = { current: a2 };
        return b2.memoizedState = a2;
      }, useState: qi, useDebugValue: Ai, useDeferredValue: function(a2) {
        return ci().memoizedState = a2;
      }, useTransition: function() {
        var a2 = qi(false), b2 = a2[0];
        a2 = Ei.bind(null, a2[1]);
        ci().memoizedState = a2;
        return [b2, a2];
      }, useMutableSource: function() {
      }, useSyncExternalStore: function(a2, b2, c2) {
        var d2 = N2, e = ci();
        if (I2) {
          if (void 0 === c2) throw Error(p2(407));
          c2 = c2();
        } else {
          c2 = b2();
          if (null === R2) throw Error(p2(349));
          0 !== (Rh & 30) || ni(d2, b2, c2);
        }
        e.memoizedState = c2;
        var f2 = { value: c2, getSnapshot: b2 };
        e.queue = f2;
        vi(ki.bind(
          null,
          d2,
          f2,
          a2
        ), [a2]);
        d2.flags |= 2048;
        li(9, mi.bind(null, d2, f2, c2, b2), void 0, null);
        return c2;
      }, useId: function() {
        var a2 = ci(), b2 = R2.identifierPrefix;
        if (I2) {
          var c2 = sg;
          var d2 = rg;
          c2 = (d2 & ~(1 << 32 - oc(d2) - 1)).toString(32) + c2;
          b2 = ":" + b2 + "R" + c2;
          c2 = Uh++;
          0 < c2 && (b2 += "H" + c2.toString(32));
          b2 += ":";
        } else c2 = Vh++, b2 = ":" + b2 + "r" + c2.toString(32) + ":";
        return a2.memoizedState = b2;
      }, unstable_isNewReconciler: false };
      var Zh = {
        readContext: Vg,
        useCallback: Bi,
        useContext: Vg,
        useEffect: ji,
        useImperativeHandle: zi,
        useInsertionEffect: wi,
        useLayoutEffect: xi,
        useMemo: Ci,
        useReducer: fi,
        useRef: si,
        useState: function() {
          return fi(ei);
        },
        useDebugValue: Ai,
        useDeferredValue: function(a2) {
          var b2 = di();
          return Di(b2, O2.memoizedState, a2);
        },
        useTransition: function() {
          var a2 = fi(ei)[0], b2 = di().memoizedState;
          return [a2, b2];
        },
        useMutableSource: hi,
        useSyncExternalStore: ii,
        useId: Fi,
        unstable_isNewReconciler: false
      };
      var $h = { readContext: Vg, useCallback: Bi, useContext: Vg, useEffect: ji, useImperativeHandle: zi, useInsertionEffect: wi, useLayoutEffect: xi, useMemo: Ci, useReducer: gi, useRef: si, useState: function() {
        return gi(ei);
      }, useDebugValue: Ai, useDeferredValue: function(a2) {
        var b2 = di();
        return null === O2 ? b2.memoizedState = a2 : Di(b2, O2.memoizedState, a2);
      }, useTransition: function() {
        var a2 = gi(ei)[0], b2 = di().memoizedState;
        return [a2, b2];
      }, useMutableSource: hi, useSyncExternalStore: ii, useId: Fi, unstable_isNewReconciler: false };
      function Ki(a2, b2) {
        try {
          var c2 = "", d2 = b2;
          do
            c2 += Pa(d2), d2 = d2.return;
          while (d2);
          var e = c2;
        } catch (f2) {
          e = "\nError generating stack: " + f2.message + "\n" + f2.stack;
        }
        return { value: a2, source: b2, stack: e, digest: null };
      }
      function Li(a2, b2, c2) {
        return { value: a2, source: null, stack: null != c2 ? c2 : null, digest: null != b2 ? b2 : null };
      }
      function Mi(a2, b2) {
        try {
          console.error(b2.value);
        } catch (c2) {
          setTimeout(function() {
            throw c2;
          });
        }
      }
      var Ni = "function" === typeof WeakMap ? WeakMap : Map;
      function Oi(a2, b2, c2) {
        c2 = ch(-1, c2);
        c2.tag = 3;
        c2.payload = { element: null };
        var d2 = b2.value;
        c2.callback = function() {
          Pi || (Pi = true, Qi = d2);
          Mi(a2, b2);
        };
        return c2;
      }
      function Ri(a2, b2, c2) {
        c2 = ch(-1, c2);
        c2.tag = 3;
        var d2 = a2.type.getDerivedStateFromError;
        if ("function" === typeof d2) {
          var e = b2.value;
          c2.payload = function() {
            return d2(e);
          };
          c2.callback = function() {
            Mi(a2, b2);
          };
        }
        var f2 = a2.stateNode;
        null !== f2 && "function" === typeof f2.componentDidCatch && (c2.callback = function() {
          Mi(a2, b2);
          "function" !== typeof d2 && (null === Si ? Si = /* @__PURE__ */ new Set([this]) : Si.add(this));
          var c3 = b2.stack;
          this.componentDidCatch(b2.value, { componentStack: null !== c3 ? c3 : "" });
        });
        return c2;
      }
      function Ti(a2, b2, c2) {
        var d2 = a2.pingCache;
        if (null === d2) {
          d2 = a2.pingCache = new Ni();
          var e = /* @__PURE__ */ new Set();
          d2.set(b2, e);
        } else e = d2.get(b2), void 0 === e && (e = /* @__PURE__ */ new Set(), d2.set(b2, e));
        e.has(c2) || (e.add(c2), a2 = Ui.bind(null, a2, b2, c2), b2.then(a2, a2));
      }
      function Vi(a2) {
        do {
          var b2;
          if (b2 = 13 === a2.tag) b2 = a2.memoizedState, b2 = null !== b2 ? null !== b2.dehydrated ? true : false : true;
          if (b2) return a2;
          a2 = a2.return;
        } while (null !== a2);
        return null;
      }
      function Wi(a2, b2, c2, d2, e) {
        if (0 === (a2.mode & 1)) return a2 === b2 ? a2.flags |= 65536 : (a2.flags |= 128, c2.flags |= 131072, c2.flags &= -52805, 1 === c2.tag && (null === c2.alternate ? c2.tag = 17 : (b2 = ch(-1, 1), b2.tag = 2, dh(c2, b2, 1))), c2.lanes |= 1), a2;
        a2.flags |= 65536;
        a2.lanes = e;
        return a2;
      }
      var Xi = ua.ReactCurrentOwner;
      var Ug = false;
      function Yi(a2, b2, c2, d2) {
        b2.child = null === a2 ? Ch(b2, null, c2, d2) : Bh(b2, a2.child, c2, d2);
      }
      function Zi(a2, b2, c2, d2, e) {
        c2 = c2.render;
        var f2 = b2.ref;
        Tg(b2, e);
        d2 = Xh(a2, b2, c2, d2, f2, e);
        c2 = bi();
        if (null !== a2 && !Ug) return b2.updateQueue = a2.updateQueue, b2.flags &= -2053, a2.lanes &= ~e, $i(a2, b2, e);
        I2 && c2 && vg(b2);
        b2.flags |= 1;
        Yi(a2, b2, d2, e);
        return b2.child;
      }
      function aj(a2, b2, c2, d2, e) {
        if (null === a2) {
          var f2 = c2.type;
          if ("function" === typeof f2 && !bj(f2) && void 0 === f2.defaultProps && null === c2.compare && void 0 === c2.defaultProps) return b2.tag = 15, b2.type = f2, cj(a2, b2, f2, d2, e);
          a2 = yh(c2.type, null, d2, b2, b2.mode, e);
          a2.ref = b2.ref;
          a2.return = b2;
          return b2.child = a2;
        }
        f2 = a2.child;
        if (0 === (a2.lanes & e)) {
          var g = f2.memoizedProps;
          c2 = c2.compare;
          c2 = null !== c2 ? c2 : Ie2;
          if (c2(g, d2) && a2.ref === b2.ref) return $i(a2, b2, e);
        }
        b2.flags |= 1;
        a2 = wh(f2, d2);
        a2.ref = b2.ref;
        a2.return = b2;
        return b2.child = a2;
      }
      function cj(a2, b2, c2, d2, e) {
        if (null !== a2) {
          var f2 = a2.memoizedProps;
          if (Ie2(f2, d2) && a2.ref === b2.ref) if (Ug = false, b2.pendingProps = d2 = f2, 0 !== (a2.lanes & e)) 0 !== (a2.flags & 131072) && (Ug = true);
          else return b2.lanes = a2.lanes, $i(a2, b2, e);
        }
        return dj(a2, b2, c2, d2, e);
      }
      function ej(a2, b2, c2) {
        var d2 = b2.pendingProps, e = d2.children, f2 = null !== a2 ? a2.memoizedState : null;
        if ("hidden" === d2.mode) if (0 === (b2.mode & 1)) b2.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G2(fj, gj), gj |= c2;
        else {
          if (0 === (c2 & 1073741824)) return a2 = null !== f2 ? f2.baseLanes | c2 : c2, b2.lanes = b2.childLanes = 1073741824, b2.memoizedState = { baseLanes: a2, cachePool: null, transitions: null }, b2.updateQueue = null, G2(fj, gj), gj |= a2, null;
          b2.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
          d2 = null !== f2 ? f2.baseLanes : c2;
          G2(fj, gj);
          gj |= d2;
        }
        else null !== f2 ? (d2 = f2.baseLanes | c2, b2.memoizedState = null) : d2 = c2, G2(fj, gj), gj |= d2;
        Yi(a2, b2, e, c2);
        return b2.child;
      }
      function hj(a2, b2) {
        var c2 = b2.ref;
        if (null === a2 && null !== c2 || null !== a2 && a2.ref !== c2) b2.flags |= 512, b2.flags |= 2097152;
      }
      function dj(a2, b2, c2, d2, e) {
        var f2 = Zf(c2) ? Xf : H2.current;
        f2 = Yf(b2, f2);
        Tg(b2, e);
        c2 = Xh(a2, b2, c2, d2, f2, e);
        d2 = bi();
        if (null !== a2 && !Ug) return b2.updateQueue = a2.updateQueue, b2.flags &= -2053, a2.lanes &= ~e, $i(a2, b2, e);
        I2 && d2 && vg(b2);
        b2.flags |= 1;
        Yi(a2, b2, c2, e);
        return b2.child;
      }
      function ij(a2, b2, c2, d2, e) {
        if (Zf(c2)) {
          var f2 = true;
          cg(b2);
        } else f2 = false;
        Tg(b2, e);
        if (null === b2.stateNode) jj(a2, b2), ph(b2, c2, d2), rh(b2, c2, d2, e), d2 = true;
        else if (null === a2) {
          var g = b2.stateNode, h2 = b2.memoizedProps;
          g.props = h2;
          var k2 = g.context, l2 = c2.contextType;
          "object" === typeof l2 && null !== l2 ? l2 = Vg(l2) : (l2 = Zf(c2) ? Xf : H2.current, l2 = Yf(b2, l2));
          var m2 = c2.getDerivedStateFromProps, q2 = "function" === typeof m2 || "function" === typeof g.getSnapshotBeforeUpdate;
          q2 || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h2 !== d2 || k2 !== l2) && qh(b2, g, d2, l2);
          $g = false;
          var r2 = b2.memoizedState;
          g.state = r2;
          gh(b2, d2, g, e);
          k2 = b2.memoizedState;
          h2 !== d2 || r2 !== k2 || Wf.current || $g ? ("function" === typeof m2 && (kh(b2, c2, m2, d2), k2 = b2.memoizedState), (h2 = $g || oh(b2, c2, h2, d2, r2, k2, l2)) ? (q2 || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b2.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b2.flags |= 4194308), b2.memoizedProps = d2, b2.memoizedState = k2), g.props = d2, g.state = k2, g.context = l2, d2 = h2) : ("function" === typeof g.componentDidMount && (b2.flags |= 4194308), d2 = false);
        } else {
          g = b2.stateNode;
          bh(a2, b2);
          h2 = b2.memoizedProps;
          l2 = b2.type === b2.elementType ? h2 : Lg(b2.type, h2);
          g.props = l2;
          q2 = b2.pendingProps;
          r2 = g.context;
          k2 = c2.contextType;
          "object" === typeof k2 && null !== k2 ? k2 = Vg(k2) : (k2 = Zf(c2) ? Xf : H2.current, k2 = Yf(b2, k2));
          var y = c2.getDerivedStateFromProps;
          (m2 = "function" === typeof y || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h2 !== q2 || r2 !== k2) && qh(b2, g, d2, k2);
          $g = false;
          r2 = b2.memoizedState;
          g.state = r2;
          gh(b2, d2, g, e);
          var n2 = b2.memoizedState;
          h2 !== q2 || r2 !== n2 || Wf.current || $g ? ("function" === typeof y && (kh(b2, c2, y, d2), n2 = b2.memoizedState), (l2 = $g || oh(b2, c2, l2, d2, r2, n2, k2) || false) ? (m2 || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d2, n2, k2), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d2, n2, k2)), "function" === typeof g.componentDidUpdate && (b2.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b2.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 1024), b2.memoizedProps = d2, b2.memoizedState = n2), g.props = d2, g.state = n2, g.context = k2, d2 = l2) : ("function" !== typeof g.componentDidUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 1024), d2 = false);
        }
        return kj(a2, b2, c2, d2, f2, e);
      }
      function kj(a2, b2, c2, d2, e, f2) {
        hj(a2, b2);
        var g = 0 !== (b2.flags & 128);
        if (!d2 && !g) return e && dg(b2, c2, false), $i(a2, b2, f2);
        d2 = b2.stateNode;
        Xi.current = b2;
        var h2 = g && "function" !== typeof c2.getDerivedStateFromError ? null : d2.render();
        b2.flags |= 1;
        null !== a2 && g ? (b2.child = Bh(b2, a2.child, null, f2), b2.child = Bh(b2, null, h2, f2)) : Yi(a2, b2, h2, f2);
        b2.memoizedState = d2.state;
        e && dg(b2, c2, true);
        return b2.child;
      }
      function lj(a2) {
        var b2 = a2.stateNode;
        b2.pendingContext ? ag(a2, b2.pendingContext, b2.pendingContext !== b2.context) : b2.context && ag(a2, b2.context, false);
        Ih(a2, b2.containerInfo);
      }
      function mj(a2, b2, c2, d2, e) {
        Ig();
        Jg(e);
        b2.flags |= 256;
        Yi(a2, b2, c2, d2);
        return b2.child;
      }
      var nj = { dehydrated: null, treeContext: null, retryLane: 0 };
      function oj(a2) {
        return { baseLanes: a2, cachePool: null, transitions: null };
      }
      function pj(a2, b2, c2) {
        var d2 = b2.pendingProps, e = M2.current, f2 = false, g = 0 !== (b2.flags & 128), h2;
        (h2 = g) || (h2 = null !== a2 && null === a2.memoizedState ? false : 0 !== (e & 2));
        if (h2) f2 = true, b2.flags &= -129;
        else if (null === a2 || null !== a2.memoizedState) e |= 1;
        G2(M2, e & 1);
        if (null === a2) {
          Eg(b2);
          a2 = b2.memoizedState;
          if (null !== a2 && (a2 = a2.dehydrated, null !== a2)) return 0 === (b2.mode & 1) ? b2.lanes = 1 : "$!" === a2.data ? b2.lanes = 8 : b2.lanes = 1073741824, null;
          g = d2.children;
          a2 = d2.fallback;
          return f2 ? (d2 = b2.mode, f2 = b2.child, g = { mode: "hidden", children: g }, 0 === (d2 & 1) && null !== f2 ? (f2.childLanes = 0, f2.pendingProps = g) : f2 = qj(g, d2, 0, null), a2 = Ah(a2, d2, c2, null), f2.return = b2, a2.return = b2, f2.sibling = a2, b2.child = f2, b2.child.memoizedState = oj(c2), b2.memoizedState = nj, a2) : rj(b2, g);
        }
        e = a2.memoizedState;
        if (null !== e && (h2 = e.dehydrated, null !== h2)) return sj(a2, b2, g, d2, h2, e, c2);
        if (f2) {
          f2 = d2.fallback;
          g = b2.mode;
          e = a2.child;
          h2 = e.sibling;
          var k2 = { mode: "hidden", children: d2.children };
          0 === (g & 1) && b2.child !== e ? (d2 = b2.child, d2.childLanes = 0, d2.pendingProps = k2, b2.deletions = null) : (d2 = wh(e, k2), d2.subtreeFlags = e.subtreeFlags & 14680064);
          null !== h2 ? f2 = wh(h2, f2) : (f2 = Ah(f2, g, c2, null), f2.flags |= 2);
          f2.return = b2;
          d2.return = b2;
          d2.sibling = f2;
          b2.child = d2;
          d2 = f2;
          f2 = b2.child;
          g = a2.child.memoizedState;
          g = null === g ? oj(c2) : { baseLanes: g.baseLanes | c2, cachePool: null, transitions: g.transitions };
          f2.memoizedState = g;
          f2.childLanes = a2.childLanes & ~c2;
          b2.memoizedState = nj;
          return d2;
        }
        f2 = a2.child;
        a2 = f2.sibling;
        d2 = wh(f2, { mode: "visible", children: d2.children });
        0 === (b2.mode & 1) && (d2.lanes = c2);
        d2.return = b2;
        d2.sibling = null;
        null !== a2 && (c2 = b2.deletions, null === c2 ? (b2.deletions = [a2], b2.flags |= 16) : c2.push(a2));
        b2.child = d2;
        b2.memoizedState = null;
        return d2;
      }
      function rj(a2, b2) {
        b2 = qj({ mode: "visible", children: b2 }, a2.mode, 0, null);
        b2.return = a2;
        return a2.child = b2;
      }
      function tj(a2, b2, c2, d2) {
        null !== d2 && Jg(d2);
        Bh(b2, a2.child, null, c2);
        a2 = rj(b2, b2.pendingProps.children);
        a2.flags |= 2;
        b2.memoizedState = null;
        return a2;
      }
      function sj(a2, b2, c2, d2, e, f2, g) {
        if (c2) {
          if (b2.flags & 256) return b2.flags &= -257, d2 = Li(Error(p2(422))), tj(a2, b2, g, d2);
          if (null !== b2.memoizedState) return b2.child = a2.child, b2.flags |= 128, null;
          f2 = d2.fallback;
          e = b2.mode;
          d2 = qj({ mode: "visible", children: d2.children }, e, 0, null);
          f2 = Ah(f2, e, g, null);
          f2.flags |= 2;
          d2.return = b2;
          f2.return = b2;
          d2.sibling = f2;
          b2.child = d2;
          0 !== (b2.mode & 1) && Bh(b2, a2.child, null, g);
          b2.child.memoizedState = oj(g);
          b2.memoizedState = nj;
          return f2;
        }
        if (0 === (b2.mode & 1)) return tj(a2, b2, g, null);
        if ("$!" === e.data) {
          d2 = e.nextSibling && e.nextSibling.dataset;
          if (d2) var h2 = d2.dgst;
          d2 = h2;
          f2 = Error(p2(419));
          d2 = Li(f2, d2, void 0);
          return tj(a2, b2, g, d2);
        }
        h2 = 0 !== (g & a2.childLanes);
        if (Ug || h2) {
          d2 = R2;
          if (null !== d2) {
            switch (g & -g) {
              case 4:
                e = 2;
                break;
              case 16:
                e = 8;
                break;
              case 64:
              case 128:
              case 256:
              case 512:
              case 1024:
              case 2048:
              case 4096:
              case 8192:
              case 16384:
              case 32768:
              case 65536:
              case 131072:
              case 262144:
              case 524288:
              case 1048576:
              case 2097152:
              case 4194304:
              case 8388608:
              case 16777216:
              case 33554432:
              case 67108864:
                e = 32;
                break;
              case 536870912:
                e = 268435456;
                break;
              default:
                e = 0;
            }
            e = 0 !== (e & (d2.suspendedLanes | g)) ? 0 : e;
            0 !== e && e !== f2.retryLane && (f2.retryLane = e, Zg(a2, e), mh(d2, a2, e, -1));
          }
          uj();
          d2 = Li(Error(p2(421)));
          return tj(a2, b2, g, d2);
        }
        if ("$?" === e.data) return b2.flags |= 128, b2.child = a2.child, b2 = vj.bind(null, a2), e._reactRetry = b2, null;
        a2 = f2.treeContext;
        yg = Lf(e.nextSibling);
        xg = b2;
        I2 = true;
        zg = null;
        null !== a2 && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a2.id, sg = a2.overflow, qg = b2);
        b2 = rj(b2, d2.children);
        b2.flags |= 4096;
        return b2;
      }
      function wj(a2, b2, c2) {
        a2.lanes |= b2;
        var d2 = a2.alternate;
        null !== d2 && (d2.lanes |= b2);
        Sg(a2.return, b2, c2);
      }
      function xj(a2, b2, c2, d2, e) {
        var f2 = a2.memoizedState;
        null === f2 ? a2.memoizedState = { isBackwards: b2, rendering: null, renderingStartTime: 0, last: d2, tail: c2, tailMode: e } : (f2.isBackwards = b2, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d2, f2.tail = c2, f2.tailMode = e);
      }
      function yj(a2, b2, c2) {
        var d2 = b2.pendingProps, e = d2.revealOrder, f2 = d2.tail;
        Yi(a2, b2, d2.children, c2);
        d2 = M2.current;
        if (0 !== (d2 & 2)) d2 = d2 & 1 | 2, b2.flags |= 128;
        else {
          if (null !== a2 && 0 !== (a2.flags & 128)) a: for (a2 = b2.child; null !== a2; ) {
            if (13 === a2.tag) null !== a2.memoizedState && wj(a2, c2, b2);
            else if (19 === a2.tag) wj(a2, c2, b2);
            else if (null !== a2.child) {
              a2.child.return = a2;
              a2 = a2.child;
              continue;
            }
            if (a2 === b2) break a;
            for (; null === a2.sibling; ) {
              if (null === a2.return || a2.return === b2) break a;
              a2 = a2.return;
            }
            a2.sibling.return = a2.return;
            a2 = a2.sibling;
          }
          d2 &= 1;
        }
        G2(M2, d2);
        if (0 === (b2.mode & 1)) b2.memoizedState = null;
        else switch (e) {
          case "forwards":
            c2 = b2.child;
            for (e = null; null !== c2; ) a2 = c2.alternate, null !== a2 && null === Mh(a2) && (e = c2), c2 = c2.sibling;
            c2 = e;
            null === c2 ? (e = b2.child, b2.child = null) : (e = c2.sibling, c2.sibling = null);
            xj(b2, false, e, c2, f2);
            break;
          case "backwards":
            c2 = null;
            e = b2.child;
            for (b2.child = null; null !== e; ) {
              a2 = e.alternate;
              if (null !== a2 && null === Mh(a2)) {
                b2.child = e;
                break;
              }
              a2 = e.sibling;
              e.sibling = c2;
              c2 = e;
              e = a2;
            }
            xj(b2, true, c2, null, f2);
            break;
          case "together":
            xj(b2, false, null, null, void 0);
            break;
          default:
            b2.memoizedState = null;
        }
        return b2.child;
      }
      function jj(a2, b2) {
        0 === (b2.mode & 1) && null !== a2 && (a2.alternate = null, b2.alternate = null, b2.flags |= 2);
      }
      function $i(a2, b2, c2) {
        null !== a2 && (b2.dependencies = a2.dependencies);
        hh |= b2.lanes;
        if (0 === (c2 & b2.childLanes)) return null;
        if (null !== a2 && b2.child !== a2.child) throw Error(p2(153));
        if (null !== b2.child) {
          a2 = b2.child;
          c2 = wh(a2, a2.pendingProps);
          b2.child = c2;
          for (c2.return = b2; null !== a2.sibling; ) a2 = a2.sibling, c2 = c2.sibling = wh(a2, a2.pendingProps), c2.return = b2;
          c2.sibling = null;
        }
        return b2.child;
      }
      function zj(a2, b2, c2) {
        switch (b2.tag) {
          case 3:
            lj(b2);
            Ig();
            break;
          case 5:
            Kh(b2);
            break;
          case 1:
            Zf(b2.type) && cg(b2);
            break;
          case 4:
            Ih(b2, b2.stateNode.containerInfo);
            break;
          case 10:
            var d2 = b2.type._context, e = b2.memoizedProps.value;
            G2(Mg, d2._currentValue);
            d2._currentValue = e;
            break;
          case 13:
            d2 = b2.memoizedState;
            if (null !== d2) {
              if (null !== d2.dehydrated) return G2(M2, M2.current & 1), b2.flags |= 128, null;
              if (0 !== (c2 & b2.child.childLanes)) return pj(a2, b2, c2);
              G2(M2, M2.current & 1);
              a2 = $i(a2, b2, c2);
              return null !== a2 ? a2.sibling : null;
            }
            G2(M2, M2.current & 1);
            break;
          case 19:
            d2 = 0 !== (c2 & b2.childLanes);
            if (0 !== (a2.flags & 128)) {
              if (d2) return yj(a2, b2, c2);
              b2.flags |= 128;
            }
            e = b2.memoizedState;
            null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
            G2(M2, M2.current);
            if (d2) break;
            else return null;
          case 22:
          case 23:
            return b2.lanes = 0, ej(a2, b2, c2);
        }
        return $i(a2, b2, c2);
      }
      var Aj;
      var Bj;
      var Cj;
      var Dj;
      Aj = function(a2, b2) {
        for (var c2 = b2.child; null !== c2; ) {
          if (5 === c2.tag || 6 === c2.tag) a2.appendChild(c2.stateNode);
          else if (4 !== c2.tag && null !== c2.child) {
            c2.child.return = c2;
            c2 = c2.child;
            continue;
          }
          if (c2 === b2) break;
          for (; null === c2.sibling; ) {
            if (null === c2.return || c2.return === b2) return;
            c2 = c2.return;
          }
          c2.sibling.return = c2.return;
          c2 = c2.sibling;
        }
      };
      Bj = function() {
      };
      Cj = function(a2, b2, c2, d2) {
        var e = a2.memoizedProps;
        if (e !== d2) {
          a2 = b2.stateNode;
          Hh(Eh.current);
          var f2 = null;
          switch (c2) {
            case "input":
              e = Ya(a2, e);
              d2 = Ya(a2, d2);
              f2 = [];
              break;
            case "select":
              e = A({}, e, { value: void 0 });
              d2 = A({}, d2, { value: void 0 });
              f2 = [];
              break;
            case "textarea":
              e = gb(a2, e);
              d2 = gb(a2, d2);
              f2 = [];
              break;
            default:
              "function" !== typeof e.onClick && "function" === typeof d2.onClick && (a2.onclick = Bf);
          }
          ub(c2, d2);
          var g;
          c2 = null;
          for (l2 in e) if (!d2.hasOwnProperty(l2) && e.hasOwnProperty(l2) && null != e[l2]) if ("style" === l2) {
            var h2 = e[l2];
            for (g in h2) h2.hasOwnProperty(g) && (c2 || (c2 = {}), c2[g] = "");
          } else "dangerouslySetInnerHTML" !== l2 && "children" !== l2 && "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && "autoFocus" !== l2 && (ea.hasOwnProperty(l2) ? f2 || (f2 = []) : (f2 = f2 || []).push(l2, null));
          for (l2 in d2) {
            var k2 = d2[l2];
            h2 = null != e ? e[l2] : void 0;
            if (d2.hasOwnProperty(l2) && k2 !== h2 && (null != k2 || null != h2)) if ("style" === l2) if (h2) {
              for (g in h2) !h2.hasOwnProperty(g) || k2 && k2.hasOwnProperty(g) || (c2 || (c2 = {}), c2[g] = "");
              for (g in k2) k2.hasOwnProperty(g) && h2[g] !== k2[g] && (c2 || (c2 = {}), c2[g] = k2[g]);
            } else c2 || (f2 || (f2 = []), f2.push(
              l2,
              c2
            )), c2 = k2;
            else "dangerouslySetInnerHTML" === l2 ? (k2 = k2 ? k2.__html : void 0, h2 = h2 ? h2.__html : void 0, null != k2 && h2 !== k2 && (f2 = f2 || []).push(l2, k2)) : "children" === l2 ? "string" !== typeof k2 && "number" !== typeof k2 || (f2 = f2 || []).push(l2, "" + k2) : "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && (ea.hasOwnProperty(l2) ? (null != k2 && "onScroll" === l2 && D2("scroll", a2), f2 || h2 === k2 || (f2 = [])) : (f2 = f2 || []).push(l2, k2));
          }
          c2 && (f2 = f2 || []).push("style", c2);
          var l2 = f2;
          if (b2.updateQueue = l2) b2.flags |= 4;
        }
      };
      Dj = function(a2, b2, c2, d2) {
        c2 !== d2 && (b2.flags |= 4);
      };
      function Ej(a2, b2) {
        if (!I2) switch (a2.tailMode) {
          case "hidden":
            b2 = a2.tail;
            for (var c2 = null; null !== b2; ) null !== b2.alternate && (c2 = b2), b2 = b2.sibling;
            null === c2 ? a2.tail = null : c2.sibling = null;
            break;
          case "collapsed":
            c2 = a2.tail;
            for (var d2 = null; null !== c2; ) null !== c2.alternate && (d2 = c2), c2 = c2.sibling;
            null === d2 ? b2 || null === a2.tail ? a2.tail = null : a2.tail.sibling = null : d2.sibling = null;
        }
      }
      function S2(a2) {
        var b2 = null !== a2.alternate && a2.alternate.child === a2.child, c2 = 0, d2 = 0;
        if (b2) for (var e = a2.child; null !== e; ) c2 |= e.lanes | e.childLanes, d2 |= e.subtreeFlags & 14680064, d2 |= e.flags & 14680064, e.return = a2, e = e.sibling;
        else for (e = a2.child; null !== e; ) c2 |= e.lanes | e.childLanes, d2 |= e.subtreeFlags, d2 |= e.flags, e.return = a2, e = e.sibling;
        a2.subtreeFlags |= d2;
        a2.childLanes = c2;
        return b2;
      }
      function Fj(a2, b2, c2) {
        var d2 = b2.pendingProps;
        wg(b2);
        switch (b2.tag) {
          case 2:
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
            return S2(b2), null;
          case 1:
            return Zf(b2.type) && $f(), S2(b2), null;
          case 3:
            d2 = b2.stateNode;
            Jh();
            E2(Wf);
            E2(H2);
            Oh();
            d2.pendingContext && (d2.context = d2.pendingContext, d2.pendingContext = null);
            if (null === a2 || null === a2.child) Gg(b2) ? b2.flags |= 4 : null === a2 || a2.memoizedState.isDehydrated && 0 === (b2.flags & 256) || (b2.flags |= 1024, null !== zg && (Gj(zg), zg = null));
            Bj(a2, b2);
            S2(b2);
            return null;
          case 5:
            Lh(b2);
            var e = Hh(Gh.current);
            c2 = b2.type;
            if (null !== a2 && null != b2.stateNode) Cj(a2, b2, c2, d2, e), a2.ref !== b2.ref && (b2.flags |= 512, b2.flags |= 2097152);
            else {
              if (!d2) {
                if (null === b2.stateNode) throw Error(p2(166));
                S2(b2);
                return null;
              }
              a2 = Hh(Eh.current);
              if (Gg(b2)) {
                d2 = b2.stateNode;
                c2 = b2.type;
                var f2 = b2.memoizedProps;
                d2[Of] = b2;
                d2[Pf] = f2;
                a2 = 0 !== (b2.mode & 1);
                switch (c2) {
                  case "dialog":
                    D2("cancel", d2);
                    D2("close", d2);
                    break;
                  case "iframe":
                  case "object":
                  case "embed":
                    D2("load", d2);
                    break;
                  case "video":
                  case "audio":
                    for (e = 0; e < lf.length; e++) D2(lf[e], d2);
                    break;
                  case "source":
                    D2("error", d2);
                    break;
                  case "img":
                  case "image":
                  case "link":
                    D2(
                      "error",
                      d2
                    );
                    D2("load", d2);
                    break;
                  case "details":
                    D2("toggle", d2);
                    break;
                  case "input":
                    Za(d2, f2);
                    D2("invalid", d2);
                    break;
                  case "select":
                    d2._wrapperState = { wasMultiple: !!f2.multiple };
                    D2("invalid", d2);
                    break;
                  case "textarea":
                    hb(d2, f2), D2("invalid", d2);
                }
                ub(c2, f2);
                e = null;
                for (var g in f2) if (f2.hasOwnProperty(g)) {
                  var h2 = f2[g];
                  "children" === g ? "string" === typeof h2 ? d2.textContent !== h2 && (true !== f2.suppressHydrationWarning && Af(d2.textContent, h2, a2), e = ["children", h2]) : "number" === typeof h2 && d2.textContent !== "" + h2 && (true !== f2.suppressHydrationWarning && Af(
                    d2.textContent,
                    h2,
                    a2
                  ), e = ["children", "" + h2]) : ea.hasOwnProperty(g) && null != h2 && "onScroll" === g && D2("scroll", d2);
                }
                switch (c2) {
                  case "input":
                    Va(d2);
                    db(d2, f2, true);
                    break;
                  case "textarea":
                    Va(d2);
                    jb(d2);
                    break;
                  case "select":
                  case "option":
                    break;
                  default:
                    "function" === typeof f2.onClick && (d2.onclick = Bf);
                }
                d2 = e;
                b2.updateQueue = d2;
                null !== d2 && (b2.flags |= 4);
              } else {
                g = 9 === e.nodeType ? e : e.ownerDocument;
                "http://www.w3.org/1999/xhtml" === a2 && (a2 = kb(c2));
                "http://www.w3.org/1999/xhtml" === a2 ? "script" === c2 ? (a2 = g.createElement("div"), a2.innerHTML = "<script><\/script>", a2 = a2.removeChild(a2.firstChild)) : "string" === typeof d2.is ? a2 = g.createElement(c2, { is: d2.is }) : (a2 = g.createElement(c2), "select" === c2 && (g = a2, d2.multiple ? g.multiple = true : d2.size && (g.size = d2.size))) : a2 = g.createElementNS(a2, c2);
                a2[Of] = b2;
                a2[Pf] = d2;
                Aj(a2, b2, false, false);
                b2.stateNode = a2;
                a: {
                  g = vb(c2, d2);
                  switch (c2) {
                    case "dialog":
                      D2("cancel", a2);
                      D2("close", a2);
                      e = d2;
                      break;
                    case "iframe":
                    case "object":
                    case "embed":
                      D2("load", a2);
                      e = d2;
                      break;
                    case "video":
                    case "audio":
                      for (e = 0; e < lf.length; e++) D2(lf[e], a2);
                      e = d2;
                      break;
                    case "source":
                      D2("error", a2);
                      e = d2;
                      break;
                    case "img":
                    case "image":
                    case "link":
                      D2(
                        "error",
                        a2
                      );
                      D2("load", a2);
                      e = d2;
                      break;
                    case "details":
                      D2("toggle", a2);
                      e = d2;
                      break;
                    case "input":
                      Za(a2, d2);
                      e = Ya(a2, d2);
                      D2("invalid", a2);
                      break;
                    case "option":
                      e = d2;
                      break;
                    case "select":
                      a2._wrapperState = { wasMultiple: !!d2.multiple };
                      e = A({}, d2, { value: void 0 });
                      D2("invalid", a2);
                      break;
                    case "textarea":
                      hb(a2, d2);
                      e = gb(a2, d2);
                      D2("invalid", a2);
                      break;
                    default:
                      e = d2;
                  }
                  ub(c2, e);
                  h2 = e;
                  for (f2 in h2) if (h2.hasOwnProperty(f2)) {
                    var k2 = h2[f2];
                    "style" === f2 ? sb(a2, k2) : "dangerouslySetInnerHTML" === f2 ? (k2 = k2 ? k2.__html : void 0, null != k2 && nb(a2, k2)) : "children" === f2 ? "string" === typeof k2 ? ("textarea" !== c2 || "" !== k2) && ob(a2, k2) : "number" === typeof k2 && ob(a2, "" + k2) : "suppressContentEditableWarning" !== f2 && "suppressHydrationWarning" !== f2 && "autoFocus" !== f2 && (ea.hasOwnProperty(f2) ? null != k2 && "onScroll" === f2 && D2("scroll", a2) : null != k2 && ta(a2, f2, k2, g));
                  }
                  switch (c2) {
                    case "input":
                      Va(a2);
                      db(a2, d2, false);
                      break;
                    case "textarea":
                      Va(a2);
                      jb(a2);
                      break;
                    case "option":
                      null != d2.value && a2.setAttribute("value", "" + Sa(d2.value));
                      break;
                    case "select":
                      a2.multiple = !!d2.multiple;
                      f2 = d2.value;
                      null != f2 ? fb(a2, !!d2.multiple, f2, false) : null != d2.defaultValue && fb(
                        a2,
                        !!d2.multiple,
                        d2.defaultValue,
                        true
                      );
                      break;
                    default:
                      "function" === typeof e.onClick && (a2.onclick = Bf);
                  }
                  switch (c2) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      d2 = !!d2.autoFocus;
                      break a;
                    case "img":
                      d2 = true;
                      break a;
                    default:
                      d2 = false;
                  }
                }
                d2 && (b2.flags |= 4);
              }
              null !== b2.ref && (b2.flags |= 512, b2.flags |= 2097152);
            }
            S2(b2);
            return null;
          case 6:
            if (a2 && null != b2.stateNode) Dj(a2, b2, a2.memoizedProps, d2);
            else {
              if ("string" !== typeof d2 && null === b2.stateNode) throw Error(p2(166));
              c2 = Hh(Gh.current);
              Hh(Eh.current);
              if (Gg(b2)) {
                d2 = b2.stateNode;
                c2 = b2.memoizedProps;
                d2[Of] = b2;
                if (f2 = d2.nodeValue !== c2) {
                  if (a2 = xg, null !== a2) switch (a2.tag) {
                    case 3:
                      Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                      break;
                    case 5:
                      true !== a2.memoizedProps.suppressHydrationWarning && Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                  }
                }
                f2 && (b2.flags |= 4);
              } else d2 = (9 === c2.nodeType ? c2 : c2.ownerDocument).createTextNode(d2), d2[Of] = b2, b2.stateNode = d2;
            }
            S2(b2);
            return null;
          case 13:
            E2(M2);
            d2 = b2.memoizedState;
            if (null === a2 || null !== a2.memoizedState && null !== a2.memoizedState.dehydrated) {
              if (I2 && null !== yg && 0 !== (b2.mode & 1) && 0 === (b2.flags & 128)) Hg(), Ig(), b2.flags |= 98560, f2 = false;
              else if (f2 = Gg(b2), null !== d2 && null !== d2.dehydrated) {
                if (null === a2) {
                  if (!f2) throw Error(p2(318));
                  f2 = b2.memoizedState;
                  f2 = null !== f2 ? f2.dehydrated : null;
                  if (!f2) throw Error(p2(317));
                  f2[Of] = b2;
                } else Ig(), 0 === (b2.flags & 128) && (b2.memoizedState = null), b2.flags |= 4;
                S2(b2);
                f2 = false;
              } else null !== zg && (Gj(zg), zg = null), f2 = true;
              if (!f2) return b2.flags & 65536 ? b2 : null;
            }
            if (0 !== (b2.flags & 128)) return b2.lanes = c2, b2;
            d2 = null !== d2;
            d2 !== (null !== a2 && null !== a2.memoizedState) && d2 && (b2.child.flags |= 8192, 0 !== (b2.mode & 1) && (null === a2 || 0 !== (M2.current & 1) ? 0 === T2 && (T2 = 3) : uj()));
            null !== b2.updateQueue && (b2.flags |= 4);
            S2(b2);
            return null;
          case 4:
            return Jh(), Bj(a2, b2), null === a2 && sf(b2.stateNode.containerInfo), S2(b2), null;
          case 10:
            return Rg(b2.type._context), S2(b2), null;
          case 17:
            return Zf(b2.type) && $f(), S2(b2), null;
          case 19:
            E2(M2);
            f2 = b2.memoizedState;
            if (null === f2) return S2(b2), null;
            d2 = 0 !== (b2.flags & 128);
            g = f2.rendering;
            if (null === g) if (d2) Ej(f2, false);
            else {
              if (0 !== T2 || null !== a2 && 0 !== (a2.flags & 128)) for (a2 = b2.child; null !== a2; ) {
                g = Mh(a2);
                if (null !== g) {
                  b2.flags |= 128;
                  Ej(f2, false);
                  d2 = g.updateQueue;
                  null !== d2 && (b2.updateQueue = d2, b2.flags |= 4);
                  b2.subtreeFlags = 0;
                  d2 = c2;
                  for (c2 = b2.child; null !== c2; ) f2 = c2, a2 = d2, f2.flags &= 14680066, g = f2.alternate, null === g ? (f2.childLanes = 0, f2.lanes = a2, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g.childLanes, f2.lanes = g.lanes, f2.child = g.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g.memoizedProps, f2.memoizedState = g.memoizedState, f2.updateQueue = g.updateQueue, f2.type = g.type, a2 = g.dependencies, f2.dependencies = null === a2 ? null : { lanes: a2.lanes, firstContext: a2.firstContext }), c2 = c2.sibling;
                  G2(M2, M2.current & 1 | 2);
                  return b2.child;
                }
                a2 = a2.sibling;
              }
              null !== f2.tail && B2() > Hj && (b2.flags |= 128, d2 = true, Ej(f2, false), b2.lanes = 4194304);
            }
            else {
              if (!d2) if (a2 = Mh(g), null !== a2) {
                if (b2.flags |= 128, d2 = true, c2 = a2.updateQueue, null !== c2 && (b2.updateQueue = c2, b2.flags |= 4), Ej(f2, true), null === f2.tail && "hidden" === f2.tailMode && !g.alternate && !I2) return S2(b2), null;
              } else 2 * B2() - f2.renderingStartTime > Hj && 1073741824 !== c2 && (b2.flags |= 128, d2 = true, Ej(f2, false), b2.lanes = 4194304);
              f2.isBackwards ? (g.sibling = b2.child, b2.child = g) : (c2 = f2.last, null !== c2 ? c2.sibling = g : b2.child = g, f2.last = g);
            }
            if (null !== f2.tail) return b2 = f2.tail, f2.rendering = b2, f2.tail = b2.sibling, f2.renderingStartTime = B2(), b2.sibling = null, c2 = M2.current, G2(M2, d2 ? c2 & 1 | 2 : c2 & 1), b2;
            S2(b2);
            return null;
          case 22:
          case 23:
            return Ij(), d2 = null !== b2.memoizedState, null !== a2 && null !== a2.memoizedState !== d2 && (b2.flags |= 8192), d2 && 0 !== (b2.mode & 1) ? 0 !== (gj & 1073741824) && (S2(b2), b2.subtreeFlags & 6 && (b2.flags |= 8192)) : S2(b2), null;
          case 24:
            return null;
          case 25:
            return null;
        }
        throw Error(p2(156, b2.tag));
      }
      function Jj(a2, b2) {
        wg(b2);
        switch (b2.tag) {
          case 1:
            return Zf(b2.type) && $f(), a2 = b2.flags, a2 & 65536 ? (b2.flags = a2 & -65537 | 128, b2) : null;
          case 3:
            return Jh(), E2(Wf), E2(H2), Oh(), a2 = b2.flags, 0 !== (a2 & 65536) && 0 === (a2 & 128) ? (b2.flags = a2 & -65537 | 128, b2) : null;
          case 5:
            return Lh(b2), null;
          case 13:
            E2(M2);
            a2 = b2.memoizedState;
            if (null !== a2 && null !== a2.dehydrated) {
              if (null === b2.alternate) throw Error(p2(340));
              Ig();
            }
            a2 = b2.flags;
            return a2 & 65536 ? (b2.flags = a2 & -65537 | 128, b2) : null;
          case 19:
            return E2(M2), null;
          case 4:
            return Jh(), null;
          case 10:
            return Rg(b2.type._context), null;
          case 22:
          case 23:
            return Ij(), null;
          case 24:
            return null;
          default:
            return null;
        }
      }
      var Kj = false;
      var U2 = false;
      var Lj = "function" === typeof WeakSet ? WeakSet : Set;
      var V2 = null;
      function Mj(a2, b2) {
        var c2 = a2.ref;
        if (null !== c2) if ("function" === typeof c2) try {
          c2(null);
        } catch (d2) {
          W2(a2, b2, d2);
        }
        else c2.current = null;
      }
      function Nj(a2, b2, c2) {
        try {
          c2();
        } catch (d2) {
          W2(a2, b2, d2);
        }
      }
      var Oj = false;
      function Pj(a2, b2) {
        Cf = dd;
        a2 = Me2();
        if (Ne2(a2)) {
          if ("selectionStart" in a2) var c2 = { start: a2.selectionStart, end: a2.selectionEnd };
          else a: {
            c2 = (c2 = a2.ownerDocument) && c2.defaultView || window;
            var d2 = c2.getSelection && c2.getSelection();
            if (d2 && 0 !== d2.rangeCount) {
              c2 = d2.anchorNode;
              var e = d2.anchorOffset, f2 = d2.focusNode;
              d2 = d2.focusOffset;
              try {
                c2.nodeType, f2.nodeType;
              } catch (F2) {
                c2 = null;
                break a;
              }
              var g = 0, h2 = -1, k2 = -1, l2 = 0, m2 = 0, q2 = a2, r2 = null;
              b: for (; ; ) {
                for (var y; ; ) {
                  q2 !== c2 || 0 !== e && 3 !== q2.nodeType || (h2 = g + e);
                  q2 !== f2 || 0 !== d2 && 3 !== q2.nodeType || (k2 = g + d2);
                  3 === q2.nodeType && (g += q2.nodeValue.length);
                  if (null === (y = q2.firstChild)) break;
                  r2 = q2;
                  q2 = y;
                }
                for (; ; ) {
                  if (q2 === a2) break b;
                  r2 === c2 && ++l2 === e && (h2 = g);
                  r2 === f2 && ++m2 === d2 && (k2 = g);
                  if (null !== (y = q2.nextSibling)) break;
                  q2 = r2;
                  r2 = q2.parentNode;
                }
                q2 = y;
              }
              c2 = -1 === h2 || -1 === k2 ? null : { start: h2, end: k2 };
            } else c2 = null;
          }
          c2 = c2 || { start: 0, end: 0 };
        } else c2 = null;
        Df = { focusedElem: a2, selectionRange: c2 };
        dd = false;
        for (V2 = b2; null !== V2; ) if (b2 = V2, a2 = b2.child, 0 !== (b2.subtreeFlags & 1028) && null !== a2) a2.return = b2, V2 = a2;
        else for (; null !== V2; ) {
          b2 = V2;
          try {
            var n2 = b2.alternate;
            if (0 !== (b2.flags & 1024)) switch (b2.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (null !== n2) {
                  var t2 = n2.memoizedProps, J2 = n2.memoizedState, x2 = b2.stateNode, w2 = x2.getSnapshotBeforeUpdate(b2.elementType === b2.type ? t2 : Lg(b2.type, t2), J2);
                  x2.__reactInternalSnapshotBeforeUpdate = w2;
                }
                break;
              case 3:
                var u2 = b2.stateNode.containerInfo;
                1 === u2.nodeType ? u2.textContent = "" : 9 === u2.nodeType && u2.documentElement && u2.removeChild(u2.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(p2(163));
            }
          } catch (F2) {
            W2(b2, b2.return, F2);
          }
          a2 = b2.sibling;
          if (null !== a2) {
            a2.return = b2.return;
            V2 = a2;
            break;
          }
          V2 = b2.return;
        }
        n2 = Oj;
        Oj = false;
        return n2;
      }
      function Qj(a2, b2, c2) {
        var d2 = b2.updateQueue;
        d2 = null !== d2 ? d2.lastEffect : null;
        if (null !== d2) {
          var e = d2 = d2.next;
          do {
            if ((e.tag & a2) === a2) {
              var f2 = e.destroy;
              e.destroy = void 0;
              void 0 !== f2 && Nj(b2, c2, f2);
            }
            e = e.next;
          } while (e !== d2);
        }
      }
      function Rj(a2, b2) {
        b2 = b2.updateQueue;
        b2 = null !== b2 ? b2.lastEffect : null;
        if (null !== b2) {
          var c2 = b2 = b2.next;
          do {
            if ((c2.tag & a2) === a2) {
              var d2 = c2.create;
              c2.destroy = d2();
            }
            c2 = c2.next;
          } while (c2 !== b2);
        }
      }
      function Sj(a2) {
        var b2 = a2.ref;
        if (null !== b2) {
          var c2 = a2.stateNode;
          switch (a2.tag) {
            case 5:
              a2 = c2;
              break;
            default:
              a2 = c2;
          }
          "function" === typeof b2 ? b2(a2) : b2.current = a2;
        }
      }
      function Tj(a2) {
        var b2 = a2.alternate;
        null !== b2 && (a2.alternate = null, Tj(b2));
        a2.child = null;
        a2.deletions = null;
        a2.sibling = null;
        5 === a2.tag && (b2 = a2.stateNode, null !== b2 && (delete b2[Of], delete b2[Pf], delete b2[of], delete b2[Qf], delete b2[Rf]));
        a2.stateNode = null;
        a2.return = null;
        a2.dependencies = null;
        a2.memoizedProps = null;
        a2.memoizedState = null;
        a2.pendingProps = null;
        a2.stateNode = null;
        a2.updateQueue = null;
      }
      function Uj(a2) {
        return 5 === a2.tag || 3 === a2.tag || 4 === a2.tag;
      }
      function Vj(a2) {
        a: for (; ; ) {
          for (; null === a2.sibling; ) {
            if (null === a2.return || Uj(a2.return)) return null;
            a2 = a2.return;
          }
          a2.sibling.return = a2.return;
          for (a2 = a2.sibling; 5 !== a2.tag && 6 !== a2.tag && 18 !== a2.tag; ) {
            if (a2.flags & 2) continue a;
            if (null === a2.child || 4 === a2.tag) continue a;
            else a2.child.return = a2, a2 = a2.child;
          }
          if (!(a2.flags & 2)) return a2.stateNode;
        }
      }
      function Wj(a2, b2, c2) {
        var d2 = a2.tag;
        if (5 === d2 || 6 === d2) a2 = a2.stateNode, b2 ? 8 === c2.nodeType ? c2.parentNode.insertBefore(a2, b2) : c2.insertBefore(a2, b2) : (8 === c2.nodeType ? (b2 = c2.parentNode, b2.insertBefore(a2, c2)) : (b2 = c2, b2.appendChild(a2)), c2 = c2._reactRootContainer, null !== c2 && void 0 !== c2 || null !== b2.onclick || (b2.onclick = Bf));
        else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Wj(a2, b2, c2), a2 = a2.sibling; null !== a2; ) Wj(a2, b2, c2), a2 = a2.sibling;
      }
      function Xj(a2, b2, c2) {
        var d2 = a2.tag;
        if (5 === d2 || 6 === d2) a2 = a2.stateNode, b2 ? c2.insertBefore(a2, b2) : c2.appendChild(a2);
        else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Xj(a2, b2, c2), a2 = a2.sibling; null !== a2; ) Xj(a2, b2, c2), a2 = a2.sibling;
      }
      var X2 = null;
      var Yj = false;
      function Zj(a2, b2, c2) {
        for (c2 = c2.child; null !== c2; ) ak(a2, b2, c2), c2 = c2.sibling;
      }
      function ak(a2, b2, c2) {
        if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
          lc.onCommitFiberUnmount(kc, c2);
        } catch (h2) {
        }
        switch (c2.tag) {
          case 5:
            U2 || Mj(c2, b2);
          case 6:
            var d2 = X2, e = Yj;
            X2 = null;
            Zj(a2, b2, c2);
            X2 = d2;
            Yj = e;
            null !== X2 && (Yj ? (a2 = X2, c2 = c2.stateNode, 8 === a2.nodeType ? a2.parentNode.removeChild(c2) : a2.removeChild(c2)) : X2.removeChild(c2.stateNode));
            break;
          case 18:
            null !== X2 && (Yj ? (a2 = X2, c2 = c2.stateNode, 8 === a2.nodeType ? Kf(a2.parentNode, c2) : 1 === a2.nodeType && Kf(a2, c2), bd(a2)) : Kf(X2, c2.stateNode));
            break;
          case 4:
            d2 = X2;
            e = Yj;
            X2 = c2.stateNode.containerInfo;
            Yj = true;
            Zj(a2, b2, c2);
            X2 = d2;
            Yj = e;
            break;
          case 0:
          case 11:
          case 14:
          case 15:
            if (!U2 && (d2 = c2.updateQueue, null !== d2 && (d2 = d2.lastEffect, null !== d2))) {
              e = d2 = d2.next;
              do {
                var f2 = e, g = f2.destroy;
                f2 = f2.tag;
                void 0 !== g && (0 !== (f2 & 2) ? Nj(c2, b2, g) : 0 !== (f2 & 4) && Nj(c2, b2, g));
                e = e.next;
              } while (e !== d2);
            }
            Zj(a2, b2, c2);
            break;
          case 1:
            if (!U2 && (Mj(c2, b2), d2 = c2.stateNode, "function" === typeof d2.componentWillUnmount)) try {
              d2.props = c2.memoizedProps, d2.state = c2.memoizedState, d2.componentWillUnmount();
            } catch (h2) {
              W2(c2, b2, h2);
            }
            Zj(a2, b2, c2);
            break;
          case 21:
            Zj(a2, b2, c2);
            break;
          case 22:
            c2.mode & 1 ? (U2 = (d2 = U2) || null !== c2.memoizedState, Zj(a2, b2, c2), U2 = d2) : Zj(a2, b2, c2);
            break;
          default:
            Zj(a2, b2, c2);
        }
      }
      function bk(a2) {
        var b2 = a2.updateQueue;
        if (null !== b2) {
          a2.updateQueue = null;
          var c2 = a2.stateNode;
          null === c2 && (c2 = a2.stateNode = new Lj());
          b2.forEach(function(b3) {
            var d2 = ck.bind(null, a2, b3);
            c2.has(b3) || (c2.add(b3), b3.then(d2, d2));
          });
        }
      }
      function dk(a2, b2) {
        var c2 = b2.deletions;
        if (null !== c2) for (var d2 = 0; d2 < c2.length; d2++) {
          var e = c2[d2];
          try {
            var f2 = a2, g = b2, h2 = g;
            a: for (; null !== h2; ) {
              switch (h2.tag) {
                case 5:
                  X2 = h2.stateNode;
                  Yj = false;
                  break a;
                case 3:
                  X2 = h2.stateNode.containerInfo;
                  Yj = true;
                  break a;
                case 4:
                  X2 = h2.stateNode.containerInfo;
                  Yj = true;
                  break a;
              }
              h2 = h2.return;
            }
            if (null === X2) throw Error(p2(160));
            ak(f2, g, e);
            X2 = null;
            Yj = false;
            var k2 = e.alternate;
            null !== k2 && (k2.return = null);
            e.return = null;
          } catch (l2) {
            W2(e, b2, l2);
          }
        }
        if (b2.subtreeFlags & 12854) for (b2 = b2.child; null !== b2; ) ek(b2, a2), b2 = b2.sibling;
      }
      function ek(a2, b2) {
        var c2 = a2.alternate, d2 = a2.flags;
        switch (a2.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            dk(b2, a2);
            fk(a2);
            if (d2 & 4) {
              try {
                Qj(3, a2, a2.return), Rj(3, a2);
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
              try {
                Qj(5, a2, a2.return);
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            break;
          case 1:
            dk(b2, a2);
            fk(a2);
            d2 & 512 && null !== c2 && Mj(c2, c2.return);
            break;
          case 5:
            dk(b2, a2);
            fk(a2);
            d2 & 512 && null !== c2 && Mj(c2, c2.return);
            if (a2.flags & 32) {
              var e = a2.stateNode;
              try {
                ob(e, "");
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            if (d2 & 4 && (e = a2.stateNode, null != e)) {
              var f2 = a2.memoizedProps, g = null !== c2 ? c2.memoizedProps : f2, h2 = a2.type, k2 = a2.updateQueue;
              a2.updateQueue = null;
              if (null !== k2) try {
                "input" === h2 && "radio" === f2.type && null != f2.name && ab(e, f2);
                vb(h2, g);
                var l2 = vb(h2, f2);
                for (g = 0; g < k2.length; g += 2) {
                  var m2 = k2[g], q2 = k2[g + 1];
                  "style" === m2 ? sb(e, q2) : "dangerouslySetInnerHTML" === m2 ? nb(e, q2) : "children" === m2 ? ob(e, q2) : ta(e, m2, q2, l2);
                }
                switch (h2) {
                  case "input":
                    bb(e, f2);
                    break;
                  case "textarea":
                    ib(e, f2);
                    break;
                  case "select":
                    var r2 = e._wrapperState.wasMultiple;
                    e._wrapperState.wasMultiple = !!f2.multiple;
                    var y = f2.value;
                    null != y ? fb(e, !!f2.multiple, y, false) : r2 !== !!f2.multiple && (null != f2.defaultValue ? fb(
                      e,
                      !!f2.multiple,
                      f2.defaultValue,
                      true
                    ) : fb(e, !!f2.multiple, f2.multiple ? [] : "", false));
                }
                e[Pf] = f2;
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            break;
          case 6:
            dk(b2, a2);
            fk(a2);
            if (d2 & 4) {
              if (null === a2.stateNode) throw Error(p2(162));
              e = a2.stateNode;
              f2 = a2.memoizedProps;
              try {
                e.nodeValue = f2;
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            break;
          case 3:
            dk(b2, a2);
            fk(a2);
            if (d2 & 4 && null !== c2 && c2.memoizedState.isDehydrated) try {
              bd(b2.containerInfo);
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
            break;
          case 4:
            dk(b2, a2);
            fk(a2);
            break;
          case 13:
            dk(b2, a2);
            fk(a2);
            e = a2.child;
            e.flags & 8192 && (f2 = null !== e.memoizedState, e.stateNode.isHidden = f2, !f2 || null !== e.alternate && null !== e.alternate.memoizedState || (gk = B2()));
            d2 & 4 && bk(a2);
            break;
          case 22:
            m2 = null !== c2 && null !== c2.memoizedState;
            a2.mode & 1 ? (U2 = (l2 = U2) || m2, dk(b2, a2), U2 = l2) : dk(b2, a2);
            fk(a2);
            if (d2 & 8192) {
              l2 = null !== a2.memoizedState;
              if ((a2.stateNode.isHidden = l2) && !m2 && 0 !== (a2.mode & 1)) for (V2 = a2, m2 = a2.child; null !== m2; ) {
                for (q2 = V2 = m2; null !== V2; ) {
                  r2 = V2;
                  y = r2.child;
                  switch (r2.tag) {
                    case 0:
                    case 11:
                    case 14:
                    case 15:
                      Qj(4, r2, r2.return);
                      break;
                    case 1:
                      Mj(r2, r2.return);
                      var n2 = r2.stateNode;
                      if ("function" === typeof n2.componentWillUnmount) {
                        d2 = r2;
                        c2 = r2.return;
                        try {
                          b2 = d2, n2.props = b2.memoizedProps, n2.state = b2.memoizedState, n2.componentWillUnmount();
                        } catch (t2) {
                          W2(d2, c2, t2);
                        }
                      }
                      break;
                    case 5:
                      Mj(r2, r2.return);
                      break;
                    case 22:
                      if (null !== r2.memoizedState) {
                        hk(q2);
                        continue;
                      }
                  }
                  null !== y ? (y.return = r2, V2 = y) : hk(q2);
                }
                m2 = m2.sibling;
              }
              a: for (m2 = null, q2 = a2; ; ) {
                if (5 === q2.tag) {
                  if (null === m2) {
                    m2 = q2;
                    try {
                      e = q2.stateNode, l2 ? (f2 = e.style, "function" === typeof f2.setProperty ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h2 = q2.stateNode, k2 = q2.memoizedProps.style, g = void 0 !== k2 && null !== k2 && k2.hasOwnProperty("display") ? k2.display : null, h2.style.display = rb("display", g));
                    } catch (t2) {
                      W2(a2, a2.return, t2);
                    }
                  }
                } else if (6 === q2.tag) {
                  if (null === m2) try {
                    q2.stateNode.nodeValue = l2 ? "" : q2.memoizedProps;
                  } catch (t2) {
                    W2(a2, a2.return, t2);
                  }
                } else if ((22 !== q2.tag && 23 !== q2.tag || null === q2.memoizedState || q2 === a2) && null !== q2.child) {
                  q2.child.return = q2;
                  q2 = q2.child;
                  continue;
                }
                if (q2 === a2) break a;
                for (; null === q2.sibling; ) {
                  if (null === q2.return || q2.return === a2) break a;
                  m2 === q2 && (m2 = null);
                  q2 = q2.return;
                }
                m2 === q2 && (m2 = null);
                q2.sibling.return = q2.return;
                q2 = q2.sibling;
              }
            }
            break;
          case 19:
            dk(b2, a2);
            fk(a2);
            d2 & 4 && bk(a2);
            break;
          case 21:
            break;
          default:
            dk(
              b2,
              a2
            ), fk(a2);
        }
      }
      function fk(a2) {
        var b2 = a2.flags;
        if (b2 & 2) {
          try {
            a: {
              for (var c2 = a2.return; null !== c2; ) {
                if (Uj(c2)) {
                  var d2 = c2;
                  break a;
                }
                c2 = c2.return;
              }
              throw Error(p2(160));
            }
            switch (d2.tag) {
              case 5:
                var e = d2.stateNode;
                d2.flags & 32 && (ob(e, ""), d2.flags &= -33);
                var f2 = Vj(a2);
                Xj(a2, f2, e);
                break;
              case 3:
              case 4:
                var g = d2.stateNode.containerInfo, h2 = Vj(a2);
                Wj(a2, h2, g);
                break;
              default:
                throw Error(p2(161));
            }
          } catch (k2) {
            W2(a2, a2.return, k2);
          }
          a2.flags &= -3;
        }
        b2 & 4096 && (a2.flags &= -4097);
      }
      function ik(a2, b2, c2) {
        V2 = a2;
        jk(a2, b2, c2);
      }
      function jk(a2, b2, c2) {
        for (var d2 = 0 !== (a2.mode & 1); null !== V2; ) {
          var e = V2, f2 = e.child;
          if (22 === e.tag && d2) {
            var g = null !== e.memoizedState || Kj;
            if (!g) {
              var h2 = e.alternate, k2 = null !== h2 && null !== h2.memoizedState || U2;
              h2 = Kj;
              var l2 = U2;
              Kj = g;
              if ((U2 = k2) && !l2) for (V2 = e; null !== V2; ) g = V2, k2 = g.child, 22 === g.tag && null !== g.memoizedState ? kk(e) : null !== k2 ? (k2.return = g, V2 = k2) : kk(e);
              for (; null !== f2; ) V2 = f2, jk(f2, b2, c2), f2 = f2.sibling;
              V2 = e;
              Kj = h2;
              U2 = l2;
            }
            lk(a2, b2, c2);
          } else 0 !== (e.subtreeFlags & 8772) && null !== f2 ? (f2.return = e, V2 = f2) : lk(a2, b2, c2);
        }
      }
      function lk(a2) {
        for (; null !== V2; ) {
          var b2 = V2;
          if (0 !== (b2.flags & 8772)) {
            var c2 = b2.alternate;
            try {
              if (0 !== (b2.flags & 8772)) switch (b2.tag) {
                case 0:
                case 11:
                case 15:
                  U2 || Rj(5, b2);
                  break;
                case 1:
                  var d2 = b2.stateNode;
                  if (b2.flags & 4 && !U2) if (null === c2) d2.componentDidMount();
                  else {
                    var e = b2.elementType === b2.type ? c2.memoizedProps : Lg(b2.type, c2.memoizedProps);
                    d2.componentDidUpdate(e, c2.memoizedState, d2.__reactInternalSnapshotBeforeUpdate);
                  }
                  var f2 = b2.updateQueue;
                  null !== f2 && ih(b2, f2, d2);
                  break;
                case 3:
                  var g = b2.updateQueue;
                  if (null !== g) {
                    c2 = null;
                    if (null !== b2.child) switch (b2.child.tag) {
                      case 5:
                        c2 = b2.child.stateNode;
                        break;
                      case 1:
                        c2 = b2.child.stateNode;
                    }
                    ih(b2, g, c2);
                  }
                  break;
                case 5:
                  var h2 = b2.stateNode;
                  if (null === c2 && b2.flags & 4) {
                    c2 = h2;
                    var k2 = b2.memoizedProps;
                    switch (b2.type) {
                      case "button":
                      case "input":
                      case "select":
                      case "textarea":
                        k2.autoFocus && c2.focus();
                        break;
                      case "img":
                        k2.src && (c2.src = k2.src);
                    }
                  }
                  break;
                case 6:
                  break;
                case 4:
                  break;
                case 12:
                  break;
                case 13:
                  if (null === b2.memoizedState) {
                    var l2 = b2.alternate;
                    if (null !== l2) {
                      var m2 = l2.memoizedState;
                      if (null !== m2) {
                        var q2 = m2.dehydrated;
                        null !== q2 && bd(q2);
                      }
                    }
                  }
                  break;
                case 19:
                case 17:
                case 21:
                case 22:
                case 23:
                case 25:
                  break;
                default:
                  throw Error(p2(163));
              }
              U2 || b2.flags & 512 && Sj(b2);
            } catch (r2) {
              W2(b2, b2.return, r2);
            }
          }
          if (b2 === a2) {
            V2 = null;
            break;
          }
          c2 = b2.sibling;
          if (null !== c2) {
            c2.return = b2.return;
            V2 = c2;
            break;
          }
          V2 = b2.return;
        }
      }
      function hk(a2) {
        for (; null !== V2; ) {
          var b2 = V2;
          if (b2 === a2) {
            V2 = null;
            break;
          }
          var c2 = b2.sibling;
          if (null !== c2) {
            c2.return = b2.return;
            V2 = c2;
            break;
          }
          V2 = b2.return;
        }
      }
      function kk(a2) {
        for (; null !== V2; ) {
          var b2 = V2;
          try {
            switch (b2.tag) {
              case 0:
              case 11:
              case 15:
                var c2 = b2.return;
                try {
                  Rj(4, b2);
                } catch (k2) {
                  W2(b2, c2, k2);
                }
                break;
              case 1:
                var d2 = b2.stateNode;
                if ("function" === typeof d2.componentDidMount) {
                  var e = b2.return;
                  try {
                    d2.componentDidMount();
                  } catch (k2) {
                    W2(b2, e, k2);
                  }
                }
                var f2 = b2.return;
                try {
                  Sj(b2);
                } catch (k2) {
                  W2(b2, f2, k2);
                }
                break;
              case 5:
                var g = b2.return;
                try {
                  Sj(b2);
                } catch (k2) {
                  W2(b2, g, k2);
                }
            }
          } catch (k2) {
            W2(b2, b2.return, k2);
          }
          if (b2 === a2) {
            V2 = null;
            break;
          }
          var h2 = b2.sibling;
          if (null !== h2) {
            h2.return = b2.return;
            V2 = h2;
            break;
          }
          V2 = b2.return;
        }
      }
      var mk = Math.ceil;
      var nk = ua.ReactCurrentDispatcher;
      var ok = ua.ReactCurrentOwner;
      var pk = ua.ReactCurrentBatchConfig;
      var K2 = 0;
      var R2 = null;
      var Y2 = null;
      var Z2 = 0;
      var gj = 0;
      var fj = Uf(0);
      var T2 = 0;
      var qk = null;
      var hh = 0;
      var rk = 0;
      var sk = 0;
      var tk = null;
      var uk = null;
      var gk = 0;
      var Hj = Infinity;
      var vk = null;
      var Pi = false;
      var Qi = null;
      var Si = null;
      var wk = false;
      var xk = null;
      var yk = 0;
      var zk = 0;
      var Ak = null;
      var Bk = -1;
      var Ck = 0;
      function L2() {
        return 0 !== (K2 & 6) ? B2() : -1 !== Bk ? Bk : Bk = B2();
      }
      function lh(a2) {
        if (0 === (a2.mode & 1)) return 1;
        if (0 !== (K2 & 2) && 0 !== Z2) return Z2 & -Z2;
        if (null !== Kg.transition) return 0 === Ck && (Ck = yc()), Ck;
        a2 = C2;
        if (0 !== a2) return a2;
        a2 = window.event;
        a2 = void 0 === a2 ? 16 : jd(a2.type);
        return a2;
      }
      function mh(a2, b2, c2, d2) {
        if (50 < zk) throw zk = 0, Ak = null, Error(p2(185));
        Ac(a2, c2, d2);
        if (0 === (K2 & 2) || a2 !== R2) a2 === R2 && (0 === (K2 & 2) && (rk |= c2), 4 === T2 && Dk(a2, Z2)), Ek(a2, d2), 1 === c2 && 0 === K2 && 0 === (b2.mode & 1) && (Hj = B2() + 500, fg && jg());
      }
      function Ek(a2, b2) {
        var c2 = a2.callbackNode;
        wc(a2, b2);
        var d2 = uc(a2, a2 === R2 ? Z2 : 0);
        if (0 === d2) null !== c2 && bc(c2), a2.callbackNode = null, a2.callbackPriority = 0;
        else if (b2 = d2 & -d2, a2.callbackPriority !== b2) {
          null != c2 && bc(c2);
          if (1 === b2) 0 === a2.tag ? ig(Fk.bind(null, a2)) : hg(Fk.bind(null, a2)), Jf(function() {
            0 === (K2 & 6) && jg();
          }), c2 = null;
          else {
            switch (Dc(d2)) {
              case 1:
                c2 = fc;
                break;
              case 4:
                c2 = gc;
                break;
              case 16:
                c2 = hc;
                break;
              case 536870912:
                c2 = jc;
                break;
              default:
                c2 = hc;
            }
            c2 = Gk(c2, Hk.bind(null, a2));
          }
          a2.callbackPriority = b2;
          a2.callbackNode = c2;
        }
      }
      function Hk(a2, b2) {
        Bk = -1;
        Ck = 0;
        if (0 !== (K2 & 6)) throw Error(p2(327));
        var c2 = a2.callbackNode;
        if (Ik() && a2.callbackNode !== c2) return null;
        var d2 = uc(a2, a2 === R2 ? Z2 : 0);
        if (0 === d2) return null;
        if (0 !== (d2 & 30) || 0 !== (d2 & a2.expiredLanes) || b2) b2 = Jk(a2, d2);
        else {
          b2 = d2;
          var e = K2;
          K2 |= 2;
          var f2 = Kk();
          if (R2 !== a2 || Z2 !== b2) vk = null, Hj = B2() + 500, Lk(a2, b2);
          do
            try {
              Mk();
              break;
            } catch (h2) {
              Nk(a2, h2);
            }
          while (1);
          Qg();
          nk.current = f2;
          K2 = e;
          null !== Y2 ? b2 = 0 : (R2 = null, Z2 = 0, b2 = T2);
        }
        if (0 !== b2) {
          2 === b2 && (e = xc(a2), 0 !== e && (d2 = e, b2 = Ok(a2, e)));
          if (1 === b2) throw c2 = qk, Lk(a2, 0), Dk(a2, d2), Ek(a2, B2()), c2;
          if (6 === b2) Dk(a2, d2);
          else {
            e = a2.current.alternate;
            if (0 === (d2 & 30) && !Pk(e) && (b2 = Jk(a2, d2), 2 === b2 && (f2 = xc(a2), 0 !== f2 && (d2 = f2, b2 = Ok(a2, f2))), 1 === b2)) throw c2 = qk, Lk(a2, 0), Dk(a2, d2), Ek(a2, B2()), c2;
            a2.finishedWork = e;
            a2.finishedLanes = d2;
            switch (b2) {
              case 0:
              case 1:
                throw Error(p2(345));
              case 2:
                Qk(a2, uk, vk);
                break;
              case 3:
                Dk(a2, d2);
                if ((d2 & 130023424) === d2 && (b2 = gk + 500 - B2(), 10 < b2)) {
                  if (0 !== uc(a2, 0)) break;
                  e = a2.suspendedLanes;
                  if ((e & d2) !== d2) {
                    L2();
                    a2.pingedLanes |= a2.suspendedLanes & e;
                    break;
                  }
                  a2.timeoutHandle = Ff(Qk.bind(null, a2, uk, vk), b2);
                  break;
                }
                Qk(a2, uk, vk);
                break;
              case 4:
                Dk(a2, d2);
                if ((d2 & 4194240) === d2) break;
                b2 = a2.eventTimes;
                for (e = -1; 0 < d2; ) {
                  var g = 31 - oc(d2);
                  f2 = 1 << g;
                  g = b2[g];
                  g > e && (e = g);
                  d2 &= ~f2;
                }
                d2 = e;
                d2 = B2() - d2;
                d2 = (120 > d2 ? 120 : 480 > d2 ? 480 : 1080 > d2 ? 1080 : 1920 > d2 ? 1920 : 3e3 > d2 ? 3e3 : 4320 > d2 ? 4320 : 1960 * mk(d2 / 1960)) - d2;
                if (10 < d2) {
                  a2.timeoutHandle = Ff(Qk.bind(null, a2, uk, vk), d2);
                  break;
                }
                Qk(a2, uk, vk);
                break;
              case 5:
                Qk(a2, uk, vk);
                break;
              default:
                throw Error(p2(329));
            }
          }
        }
        Ek(a2, B2());
        return a2.callbackNode === c2 ? Hk.bind(null, a2) : null;
      }
      function Ok(a2, b2) {
        var c2 = tk;
        a2.current.memoizedState.isDehydrated && (Lk(a2, b2).flags |= 256);
        a2 = Jk(a2, b2);
        2 !== a2 && (b2 = uk, uk = c2, null !== b2 && Gj(b2));
        return a2;
      }
      function Gj(a2) {
        null === uk ? uk = a2 : uk.push.apply(uk, a2);
      }
      function Pk(a2) {
        for (var b2 = a2; ; ) {
          if (b2.flags & 16384) {
            var c2 = b2.updateQueue;
            if (null !== c2 && (c2 = c2.stores, null !== c2)) for (var d2 = 0; d2 < c2.length; d2++) {
              var e = c2[d2], f2 = e.getSnapshot;
              e = e.value;
              try {
                if (!He2(f2(), e)) return false;
              } catch (g) {
                return false;
              }
            }
          }
          c2 = b2.child;
          if (b2.subtreeFlags & 16384 && null !== c2) c2.return = b2, b2 = c2;
          else {
            if (b2 === a2) break;
            for (; null === b2.sibling; ) {
              if (null === b2.return || b2.return === a2) return true;
              b2 = b2.return;
            }
            b2.sibling.return = b2.return;
            b2 = b2.sibling;
          }
        }
        return true;
      }
      function Dk(a2, b2) {
        b2 &= ~sk;
        b2 &= ~rk;
        a2.suspendedLanes |= b2;
        a2.pingedLanes &= ~b2;
        for (a2 = a2.expirationTimes; 0 < b2; ) {
          var c2 = 31 - oc(b2), d2 = 1 << c2;
          a2[c2] = -1;
          b2 &= ~d2;
        }
      }
      function Fk(a2) {
        if (0 !== (K2 & 6)) throw Error(p2(327));
        Ik();
        var b2 = uc(a2, 0);
        if (0 === (b2 & 1)) return Ek(a2, B2()), null;
        var c2 = Jk(a2, b2);
        if (0 !== a2.tag && 2 === c2) {
          var d2 = xc(a2);
          0 !== d2 && (b2 = d2, c2 = Ok(a2, d2));
        }
        if (1 === c2) throw c2 = qk, Lk(a2, 0), Dk(a2, b2), Ek(a2, B2()), c2;
        if (6 === c2) throw Error(p2(345));
        a2.finishedWork = a2.current.alternate;
        a2.finishedLanes = b2;
        Qk(a2, uk, vk);
        Ek(a2, B2());
        return null;
      }
      function Rk(a2, b2) {
        var c2 = K2;
        K2 |= 1;
        try {
          return a2(b2);
        } finally {
          K2 = c2, 0 === K2 && (Hj = B2() + 500, fg && jg());
        }
      }
      function Sk(a2) {
        null !== xk && 0 === xk.tag && 0 === (K2 & 6) && Ik();
        var b2 = K2;
        K2 |= 1;
        var c2 = pk.transition, d2 = C2;
        try {
          if (pk.transition = null, C2 = 1, a2) return a2();
        } finally {
          C2 = d2, pk.transition = c2, K2 = b2, 0 === (K2 & 6) && jg();
        }
      }
      function Ij() {
        gj = fj.current;
        E2(fj);
      }
      function Lk(a2, b2) {
        a2.finishedWork = null;
        a2.finishedLanes = 0;
        var c2 = a2.timeoutHandle;
        -1 !== c2 && (a2.timeoutHandle = -1, Gf(c2));
        if (null !== Y2) for (c2 = Y2.return; null !== c2; ) {
          var d2 = c2;
          wg(d2);
          switch (d2.tag) {
            case 1:
              d2 = d2.type.childContextTypes;
              null !== d2 && void 0 !== d2 && $f();
              break;
            case 3:
              Jh();
              E2(Wf);
              E2(H2);
              Oh();
              break;
            case 5:
              Lh(d2);
              break;
            case 4:
              Jh();
              break;
            case 13:
              E2(M2);
              break;
            case 19:
              E2(M2);
              break;
            case 10:
              Rg(d2.type._context);
              break;
            case 22:
            case 23:
              Ij();
          }
          c2 = c2.return;
        }
        R2 = a2;
        Y2 = a2 = wh(a2.current, null);
        Z2 = gj = b2;
        T2 = 0;
        qk = null;
        sk = rk = hh = 0;
        uk = tk = null;
        if (null !== Wg) {
          for (b2 = 0; b2 < Wg.length; b2++) if (c2 = Wg[b2], d2 = c2.interleaved, null !== d2) {
            c2.interleaved = null;
            var e = d2.next, f2 = c2.pending;
            if (null !== f2) {
              var g = f2.next;
              f2.next = e;
              d2.next = g;
            }
            c2.pending = d2;
          }
          Wg = null;
        }
        return a2;
      }
      function Nk(a2, b2) {
        do {
          var c2 = Y2;
          try {
            Qg();
            Ph.current = ai;
            if (Sh) {
              for (var d2 = N2.memoizedState; null !== d2; ) {
                var e = d2.queue;
                null !== e && (e.pending = null);
                d2 = d2.next;
              }
              Sh = false;
            }
            Rh = 0;
            P = O2 = N2 = null;
            Th = false;
            Uh = 0;
            ok.current = null;
            if (null === c2 || null === c2.return) {
              T2 = 1;
              qk = b2;
              Y2 = null;
              break;
            }
            a: {
              var f2 = a2, g = c2.return, h2 = c2, k2 = b2;
              b2 = Z2;
              h2.flags |= 32768;
              if (null !== k2 && "object" === typeof k2 && "function" === typeof k2.then) {
                var l2 = k2, m2 = h2, q2 = m2.tag;
                if (0 === (m2.mode & 1) && (0 === q2 || 11 === q2 || 15 === q2)) {
                  var r2 = m2.alternate;
                  r2 ? (m2.updateQueue = r2.updateQueue, m2.memoizedState = r2.memoizedState, m2.lanes = r2.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
                }
                var y = Vi(g);
                if (null !== y) {
                  y.flags &= -257;
                  Wi(y, g, h2, f2, b2);
                  y.mode & 1 && Ti(f2, l2, b2);
                  b2 = y;
                  k2 = l2;
                  var n2 = b2.updateQueue;
                  if (null === n2) {
                    var t2 = /* @__PURE__ */ new Set();
                    t2.add(k2);
                    b2.updateQueue = t2;
                  } else n2.add(k2);
                  break a;
                } else {
                  if (0 === (b2 & 1)) {
                    Ti(f2, l2, b2);
                    uj();
                    break a;
                  }
                  k2 = Error(p2(426));
                }
              } else if (I2 && h2.mode & 1) {
                var J2 = Vi(g);
                if (null !== J2) {
                  0 === (J2.flags & 65536) && (J2.flags |= 256);
                  Wi(J2, g, h2, f2, b2);
                  Jg(Ki(k2, h2));
                  break a;
                }
              }
              f2 = k2 = Ki(k2, h2);
              4 !== T2 && (T2 = 2);
              null === tk ? tk = [f2] : tk.push(f2);
              f2 = g;
              do {
                switch (f2.tag) {
                  case 3:
                    f2.flags |= 65536;
                    b2 &= -b2;
                    f2.lanes |= b2;
                    var x2 = Oi(f2, k2, b2);
                    fh(f2, x2);
                    break a;
                  case 1:
                    h2 = k2;
                    var w2 = f2.type, u2 = f2.stateNode;
                    if (0 === (f2.flags & 128) && ("function" === typeof w2.getDerivedStateFromError || null !== u2 && "function" === typeof u2.componentDidCatch && (null === Si || !Si.has(u2)))) {
                      f2.flags |= 65536;
                      b2 &= -b2;
                      f2.lanes |= b2;
                      var F2 = Ri(f2, h2, b2);
                      fh(f2, F2);
                      break a;
                    }
                }
                f2 = f2.return;
              } while (null !== f2);
            }
            Tk(c2);
          } catch (na) {
            b2 = na;
            Y2 === c2 && null !== c2 && (Y2 = c2 = c2.return);
            continue;
          }
          break;
        } while (1);
      }
      function Kk() {
        var a2 = nk.current;
        nk.current = ai;
        return null === a2 ? ai : a2;
      }
      function uj() {
        if (0 === T2 || 3 === T2 || 2 === T2) T2 = 4;
        null === R2 || 0 === (hh & 268435455) && 0 === (rk & 268435455) || Dk(R2, Z2);
      }
      function Jk(a2, b2) {
        var c2 = K2;
        K2 |= 2;
        var d2 = Kk();
        if (R2 !== a2 || Z2 !== b2) vk = null, Lk(a2, b2);
        do
          try {
            Uk();
            break;
          } catch (e) {
            Nk(a2, e);
          }
        while (1);
        Qg();
        K2 = c2;
        nk.current = d2;
        if (null !== Y2) throw Error(p2(261));
        R2 = null;
        Z2 = 0;
        return T2;
      }
      function Uk() {
        for (; null !== Y2; ) Vk(Y2);
      }
      function Mk() {
        for (; null !== Y2 && !cc(); ) Vk(Y2);
      }
      function Vk(a2) {
        var b2 = Wk(a2.alternate, a2, gj);
        a2.memoizedProps = a2.pendingProps;
        null === b2 ? Tk(a2) : Y2 = b2;
        ok.current = null;
      }
      function Tk(a2) {
        var b2 = a2;
        do {
          var c2 = b2.alternate;
          a2 = b2.return;
          if (0 === (b2.flags & 32768)) {
            if (c2 = Fj(c2, b2, gj), null !== c2) {
              Y2 = c2;
              return;
            }
          } else {
            c2 = Jj(c2, b2);
            if (null !== c2) {
              c2.flags &= 32767;
              Y2 = c2;
              return;
            }
            if (null !== a2) a2.flags |= 32768, a2.subtreeFlags = 0, a2.deletions = null;
            else {
              T2 = 6;
              Y2 = null;
              return;
            }
          }
          b2 = b2.sibling;
          if (null !== b2) {
            Y2 = b2;
            return;
          }
          Y2 = b2 = a2;
        } while (null !== b2);
        0 === T2 && (T2 = 5);
      }
      function Qk(a2, b2, c2) {
        var d2 = C2, e = pk.transition;
        try {
          pk.transition = null, C2 = 1, Xk(a2, b2, c2, d2);
        } finally {
          pk.transition = e, C2 = d2;
        }
        return null;
      }
      function Xk(a2, b2, c2, d2) {
        do
          Ik();
        while (null !== xk);
        if (0 !== (K2 & 6)) throw Error(p2(327));
        c2 = a2.finishedWork;
        var e = a2.finishedLanes;
        if (null === c2) return null;
        a2.finishedWork = null;
        a2.finishedLanes = 0;
        if (c2 === a2.current) throw Error(p2(177));
        a2.callbackNode = null;
        a2.callbackPriority = 0;
        var f2 = c2.lanes | c2.childLanes;
        Bc(a2, f2);
        a2 === R2 && (Y2 = R2 = null, Z2 = 0);
        0 === (c2.subtreeFlags & 2064) && 0 === (c2.flags & 2064) || wk || (wk = true, Gk(hc, function() {
          Ik();
          return null;
        }));
        f2 = 0 !== (c2.flags & 15990);
        if (0 !== (c2.subtreeFlags & 15990) || f2) {
          f2 = pk.transition;
          pk.transition = null;
          var g = C2;
          C2 = 1;
          var h2 = K2;
          K2 |= 4;
          ok.current = null;
          Pj(a2, c2);
          ek(c2, a2);
          Oe2(Df);
          dd = !!Cf;
          Df = Cf = null;
          a2.current = c2;
          ik(c2, a2, e);
          dc();
          K2 = h2;
          C2 = g;
          pk.transition = f2;
        } else a2.current = c2;
        wk && (wk = false, xk = a2, yk = e);
        f2 = a2.pendingLanes;
        0 === f2 && (Si = null);
        mc(c2.stateNode, d2);
        Ek(a2, B2());
        if (null !== b2) for (d2 = a2.onRecoverableError, c2 = 0; c2 < b2.length; c2++) e = b2[c2], d2(e.value, { componentStack: e.stack, digest: e.digest });
        if (Pi) throw Pi = false, a2 = Qi, Qi = null, a2;
        0 !== (yk & 1) && 0 !== a2.tag && Ik();
        f2 = a2.pendingLanes;
        0 !== (f2 & 1) ? a2 === Ak ? zk++ : (zk = 0, Ak = a2) : zk = 0;
        jg();
        return null;
      }
      function Ik() {
        if (null !== xk) {
          var a2 = Dc(yk), b2 = pk.transition, c2 = C2;
          try {
            pk.transition = null;
            C2 = 16 > a2 ? 16 : a2;
            if (null === xk) var d2 = false;
            else {
              a2 = xk;
              xk = null;
              yk = 0;
              if (0 !== (K2 & 6)) throw Error(p2(331));
              var e = K2;
              K2 |= 4;
              for (V2 = a2.current; null !== V2; ) {
                var f2 = V2, g = f2.child;
                if (0 !== (V2.flags & 16)) {
                  var h2 = f2.deletions;
                  if (null !== h2) {
                    for (var k2 = 0; k2 < h2.length; k2++) {
                      var l2 = h2[k2];
                      for (V2 = l2; null !== V2; ) {
                        var m2 = V2;
                        switch (m2.tag) {
                          case 0:
                          case 11:
                          case 15:
                            Qj(8, m2, f2);
                        }
                        var q2 = m2.child;
                        if (null !== q2) q2.return = m2, V2 = q2;
                        else for (; null !== V2; ) {
                          m2 = V2;
                          var r2 = m2.sibling, y = m2.return;
                          Tj(m2);
                          if (m2 === l2) {
                            V2 = null;
                            break;
                          }
                          if (null !== r2) {
                            r2.return = y;
                            V2 = r2;
                            break;
                          }
                          V2 = y;
                        }
                      }
                    }
                    var n2 = f2.alternate;
                    if (null !== n2) {
                      var t2 = n2.child;
                      if (null !== t2) {
                        n2.child = null;
                        do {
                          var J2 = t2.sibling;
                          t2.sibling = null;
                          t2 = J2;
                        } while (null !== t2);
                      }
                    }
                    V2 = f2;
                  }
                }
                if (0 !== (f2.subtreeFlags & 2064) && null !== g) g.return = f2, V2 = g;
                else b: for (; null !== V2; ) {
                  f2 = V2;
                  if (0 !== (f2.flags & 2048)) switch (f2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qj(9, f2, f2.return);
                  }
                  var x2 = f2.sibling;
                  if (null !== x2) {
                    x2.return = f2.return;
                    V2 = x2;
                    break b;
                  }
                  V2 = f2.return;
                }
              }
              var w2 = a2.current;
              for (V2 = w2; null !== V2; ) {
                g = V2;
                var u2 = g.child;
                if (0 !== (g.subtreeFlags & 2064) && null !== u2) u2.return = g, V2 = u2;
                else b: for (g = w2; null !== V2; ) {
                  h2 = V2;
                  if (0 !== (h2.flags & 2048)) try {
                    switch (h2.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Rj(9, h2);
                    }
                  } catch (na) {
                    W2(h2, h2.return, na);
                  }
                  if (h2 === g) {
                    V2 = null;
                    break b;
                  }
                  var F2 = h2.sibling;
                  if (null !== F2) {
                    F2.return = h2.return;
                    V2 = F2;
                    break b;
                  }
                  V2 = h2.return;
                }
              }
              K2 = e;
              jg();
              if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
                lc.onPostCommitFiberRoot(kc, a2);
              } catch (na) {
              }
              d2 = true;
            }
            return d2;
          } finally {
            C2 = c2, pk.transition = b2;
          }
        }
        return false;
      }
      function Yk(a2, b2, c2) {
        b2 = Ki(c2, b2);
        b2 = Oi(a2, b2, 1);
        a2 = dh(a2, b2, 1);
        b2 = L2();
        null !== a2 && (Ac(a2, 1, b2), Ek(a2, b2));
      }
      function W2(a2, b2, c2) {
        if (3 === a2.tag) Yk(a2, a2, c2);
        else for (; null !== b2; ) {
          if (3 === b2.tag) {
            Yk(b2, a2, c2);
            break;
          } else if (1 === b2.tag) {
            var d2 = b2.stateNode;
            if ("function" === typeof b2.type.getDerivedStateFromError || "function" === typeof d2.componentDidCatch && (null === Si || !Si.has(d2))) {
              a2 = Ki(c2, a2);
              a2 = Ri(b2, a2, 1);
              b2 = dh(b2, a2, 1);
              a2 = L2();
              null !== b2 && (Ac(b2, 1, a2), Ek(b2, a2));
              break;
            }
          }
          b2 = b2.return;
        }
      }
      function Ui(a2, b2, c2) {
        var d2 = a2.pingCache;
        null !== d2 && d2.delete(b2);
        b2 = L2();
        a2.pingedLanes |= a2.suspendedLanes & c2;
        R2 === a2 && (Z2 & c2) === c2 && (4 === T2 || 3 === T2 && (Z2 & 130023424) === Z2 && 500 > B2() - gk ? Lk(a2, 0) : sk |= c2);
        Ek(a2, b2);
      }
      function Zk(a2, b2) {
        0 === b2 && (0 === (a2.mode & 1) ? b2 = 1 : (b2 = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
        var c2 = L2();
        a2 = Zg(a2, b2);
        null !== a2 && (Ac(a2, b2, c2), Ek(a2, c2));
      }
      function vj(a2) {
        var b2 = a2.memoizedState, c2 = 0;
        null !== b2 && (c2 = b2.retryLane);
        Zk(a2, c2);
      }
      function ck(a2, b2) {
        var c2 = 0;
        switch (a2.tag) {
          case 13:
            var d2 = a2.stateNode;
            var e = a2.memoizedState;
            null !== e && (c2 = e.retryLane);
            break;
          case 19:
            d2 = a2.stateNode;
            break;
          default:
            throw Error(p2(314));
        }
        null !== d2 && d2.delete(b2);
        Zk(a2, c2);
      }
      var Wk;
      Wk = function(a2, b2, c2) {
        if (null !== a2) if (a2.memoizedProps !== b2.pendingProps || Wf.current) Ug = true;
        else {
          if (0 === (a2.lanes & c2) && 0 === (b2.flags & 128)) return Ug = false, zj(a2, b2, c2);
          Ug = 0 !== (a2.flags & 131072) ? true : false;
        }
        else Ug = false, I2 && 0 !== (b2.flags & 1048576) && ug(b2, ng, b2.index);
        b2.lanes = 0;
        switch (b2.tag) {
          case 2:
            var d2 = b2.type;
            jj(a2, b2);
            a2 = b2.pendingProps;
            var e = Yf(b2, H2.current);
            Tg(b2, c2);
            e = Xh(null, b2, d2, a2, e, c2);
            var f2 = bi();
            b2.flags |= 1;
            "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b2.tag = 1, b2.memoizedState = null, b2.updateQueue = null, Zf(d2) ? (f2 = true, cg(b2)) : f2 = false, b2.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, ah(b2), e.updater = nh, b2.stateNode = e, e._reactInternals = b2, rh(b2, d2, a2, c2), b2 = kj(null, b2, d2, true, f2, c2)) : (b2.tag = 0, I2 && f2 && vg(b2), Yi(null, b2, e, c2), b2 = b2.child);
            return b2;
          case 16:
            d2 = b2.elementType;
            a: {
              jj(a2, b2);
              a2 = b2.pendingProps;
              e = d2._init;
              d2 = e(d2._payload);
              b2.type = d2;
              e = b2.tag = $k(d2);
              a2 = Lg(d2, a2);
              switch (e) {
                case 0:
                  b2 = dj(null, b2, d2, a2, c2);
                  break a;
                case 1:
                  b2 = ij(null, b2, d2, a2, c2);
                  break a;
                case 11:
                  b2 = Zi(null, b2, d2, a2, c2);
                  break a;
                case 14:
                  b2 = aj(null, b2, d2, Lg(d2.type, a2), c2);
                  break a;
              }
              throw Error(p2(
                306,
                d2,
                ""
              ));
            }
            return b2;
          case 0:
            return d2 = b2.type, e = b2.pendingProps, e = b2.elementType === d2 ? e : Lg(d2, e), dj(a2, b2, d2, e, c2);
          case 1:
            return d2 = b2.type, e = b2.pendingProps, e = b2.elementType === d2 ? e : Lg(d2, e), ij(a2, b2, d2, e, c2);
          case 3:
            a: {
              lj(b2);
              if (null === a2) throw Error(p2(387));
              d2 = b2.pendingProps;
              f2 = b2.memoizedState;
              e = f2.element;
              bh(a2, b2);
              gh(b2, d2, null, c2);
              var g = b2.memoizedState;
              d2 = g.element;
              if (f2.isDehydrated) if (f2 = { element: d2, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b2.updateQueue.baseState = f2, b2.memoizedState = f2, b2.flags & 256) {
                e = Ki(Error(p2(423)), b2);
                b2 = mj(a2, b2, d2, c2, e);
                break a;
              } else if (d2 !== e) {
                e = Ki(Error(p2(424)), b2);
                b2 = mj(a2, b2, d2, c2, e);
                break a;
              } else for (yg = Lf(b2.stateNode.containerInfo.firstChild), xg = b2, I2 = true, zg = null, c2 = Ch(b2, null, d2, c2), b2.child = c2; c2; ) c2.flags = c2.flags & -3 | 4096, c2 = c2.sibling;
              else {
                Ig();
                if (d2 === e) {
                  b2 = $i(a2, b2, c2);
                  break a;
                }
                Yi(a2, b2, d2, c2);
              }
              b2 = b2.child;
            }
            return b2;
          case 5:
            return Kh(b2), null === a2 && Eg(b2), d2 = b2.type, e = b2.pendingProps, f2 = null !== a2 ? a2.memoizedProps : null, g = e.children, Ef(d2, e) ? g = null : null !== f2 && Ef(d2, f2) && (b2.flags |= 32), hj(a2, b2), Yi(a2, b2, g, c2), b2.child;
          case 6:
            return null === a2 && Eg(b2), null;
          case 13:
            return pj(a2, b2, c2);
          case 4:
            return Ih(b2, b2.stateNode.containerInfo), d2 = b2.pendingProps, null === a2 ? b2.child = Bh(b2, null, d2, c2) : Yi(a2, b2, d2, c2), b2.child;
          case 11:
            return d2 = b2.type, e = b2.pendingProps, e = b2.elementType === d2 ? e : Lg(d2, e), Zi(a2, b2, d2, e, c2);
          case 7:
            return Yi(a2, b2, b2.pendingProps, c2), b2.child;
          case 8:
            return Yi(a2, b2, b2.pendingProps.children, c2), b2.child;
          case 12:
            return Yi(a2, b2, b2.pendingProps.children, c2), b2.child;
          case 10:
            a: {
              d2 = b2.type._context;
              e = b2.pendingProps;
              f2 = b2.memoizedProps;
              g = e.value;
              G2(Mg, d2._currentValue);
              d2._currentValue = g;
              if (null !== f2) if (He2(f2.value, g)) {
                if (f2.children === e.children && !Wf.current) {
                  b2 = $i(a2, b2, c2);
                  break a;
                }
              } else for (f2 = b2.child, null !== f2 && (f2.return = b2); null !== f2; ) {
                var h2 = f2.dependencies;
                if (null !== h2) {
                  g = f2.child;
                  for (var k2 = h2.firstContext; null !== k2; ) {
                    if (k2.context === d2) {
                      if (1 === f2.tag) {
                        k2 = ch(-1, c2 & -c2);
                        k2.tag = 2;
                        var l2 = f2.updateQueue;
                        if (null !== l2) {
                          l2 = l2.shared;
                          var m2 = l2.pending;
                          null === m2 ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                          l2.pending = k2;
                        }
                      }
                      f2.lanes |= c2;
                      k2 = f2.alternate;
                      null !== k2 && (k2.lanes |= c2);
                      Sg(
                        f2.return,
                        c2,
                        b2
                      );
                      h2.lanes |= c2;
                      break;
                    }
                    k2 = k2.next;
                  }
                } else if (10 === f2.tag) g = f2.type === b2.type ? null : f2.child;
                else if (18 === f2.tag) {
                  g = f2.return;
                  if (null === g) throw Error(p2(341));
                  g.lanes |= c2;
                  h2 = g.alternate;
                  null !== h2 && (h2.lanes |= c2);
                  Sg(g, c2, b2);
                  g = f2.sibling;
                } else g = f2.child;
                if (null !== g) g.return = f2;
                else for (g = f2; null !== g; ) {
                  if (g === b2) {
                    g = null;
                    break;
                  }
                  f2 = g.sibling;
                  if (null !== f2) {
                    f2.return = g.return;
                    g = f2;
                    break;
                  }
                  g = g.return;
                }
                f2 = g;
              }
              Yi(a2, b2, e.children, c2);
              b2 = b2.child;
            }
            return b2;
          case 9:
            return e = b2.type, d2 = b2.pendingProps.children, Tg(b2, c2), e = Vg(e), d2 = d2(e), b2.flags |= 1, Yi(a2, b2, d2, c2), b2.child;
          case 14:
            return d2 = b2.type, e = Lg(d2, b2.pendingProps), e = Lg(d2.type, e), aj(a2, b2, d2, e, c2);
          case 15:
            return cj(a2, b2, b2.type, b2.pendingProps, c2);
          case 17:
            return d2 = b2.type, e = b2.pendingProps, e = b2.elementType === d2 ? e : Lg(d2, e), jj(a2, b2), b2.tag = 1, Zf(d2) ? (a2 = true, cg(b2)) : a2 = false, Tg(b2, c2), ph(b2, d2, e), rh(b2, d2, e, c2), kj(null, b2, d2, true, a2, c2);
          case 19:
            return yj(a2, b2, c2);
          case 22:
            return ej(a2, b2, c2);
        }
        throw Error(p2(156, b2.tag));
      };
      function Gk(a2, b2) {
        return ac(a2, b2);
      }
      function al(a2, b2, c2, d2) {
        this.tag = a2;
        this.key = c2;
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
        this.index = 0;
        this.ref = null;
        this.pendingProps = b2;
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
        this.mode = d2;
        this.subtreeFlags = this.flags = 0;
        this.deletions = null;
        this.childLanes = this.lanes = 0;
        this.alternate = null;
      }
      function Bg(a2, b2, c2, d2) {
        return new al(a2, b2, c2, d2);
      }
      function bj(a2) {
        a2 = a2.prototype;
        return !(!a2 || !a2.isReactComponent);
      }
      function $k(a2) {
        if ("function" === typeof a2) return bj(a2) ? 1 : 0;
        if (void 0 !== a2 && null !== a2) {
          a2 = a2.$$typeof;
          if (a2 === Da) return 11;
          if (a2 === Ga) return 14;
        }
        return 2;
      }
      function wh(a2, b2) {
        var c2 = a2.alternate;
        null === c2 ? (c2 = Bg(a2.tag, b2, a2.key, a2.mode), c2.elementType = a2.elementType, c2.type = a2.type, c2.stateNode = a2.stateNode, c2.alternate = a2, a2.alternate = c2) : (c2.pendingProps = b2, c2.type = a2.type, c2.flags = 0, c2.subtreeFlags = 0, c2.deletions = null);
        c2.flags = a2.flags & 14680064;
        c2.childLanes = a2.childLanes;
        c2.lanes = a2.lanes;
        c2.child = a2.child;
        c2.memoizedProps = a2.memoizedProps;
        c2.memoizedState = a2.memoizedState;
        c2.updateQueue = a2.updateQueue;
        b2 = a2.dependencies;
        c2.dependencies = null === b2 ? null : { lanes: b2.lanes, firstContext: b2.firstContext };
        c2.sibling = a2.sibling;
        c2.index = a2.index;
        c2.ref = a2.ref;
        return c2;
      }
      function yh(a2, b2, c2, d2, e, f2) {
        var g = 2;
        d2 = a2;
        if ("function" === typeof a2) bj(a2) && (g = 1);
        else if ("string" === typeof a2) g = 5;
        else a: switch (a2) {
          case ya:
            return Ah(c2.children, e, f2, b2);
          case za:
            g = 8;
            e |= 8;
            break;
          case Aa:
            return a2 = Bg(12, c2, b2, e | 2), a2.elementType = Aa, a2.lanes = f2, a2;
          case Ea:
            return a2 = Bg(13, c2, b2, e), a2.elementType = Ea, a2.lanes = f2, a2;
          case Fa:
            return a2 = Bg(19, c2, b2, e), a2.elementType = Fa, a2.lanes = f2, a2;
          case Ia:
            return qj(c2, e, f2, b2);
          default:
            if ("object" === typeof a2 && null !== a2) switch (a2.$$typeof) {
              case Ba:
                g = 10;
                break a;
              case Ca:
                g = 9;
                break a;
              case Da:
                g = 11;
                break a;
              case Ga:
                g = 14;
                break a;
              case Ha:
                g = 16;
                d2 = null;
                break a;
            }
            throw Error(p2(130, null == a2 ? a2 : typeof a2, ""));
        }
        b2 = Bg(g, c2, b2, e);
        b2.elementType = a2;
        b2.type = d2;
        b2.lanes = f2;
        return b2;
      }
      function Ah(a2, b2, c2, d2) {
        a2 = Bg(7, a2, d2, b2);
        a2.lanes = c2;
        return a2;
      }
      function qj(a2, b2, c2, d2) {
        a2 = Bg(22, a2, d2, b2);
        a2.elementType = Ia;
        a2.lanes = c2;
        a2.stateNode = { isHidden: false };
        return a2;
      }
      function xh(a2, b2, c2) {
        a2 = Bg(6, a2, null, b2);
        a2.lanes = c2;
        return a2;
      }
      function zh(a2, b2, c2) {
        b2 = Bg(4, null !== a2.children ? a2.children : [], a2.key, b2);
        b2.lanes = c2;
        b2.stateNode = { containerInfo: a2.containerInfo, pendingChildren: null, implementation: a2.implementation };
        return b2;
      }
      function bl(a2, b2, c2, d2, e) {
        this.tag = b2;
        this.containerInfo = a2;
        this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
        this.timeoutHandle = -1;
        this.callbackNode = this.pendingContext = this.context = null;
        this.callbackPriority = 0;
        this.eventTimes = zc(0);
        this.expirationTimes = zc(-1);
        this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
        this.entanglements = zc(0);
        this.identifierPrefix = d2;
        this.onRecoverableError = e;
        this.mutableSourceEagerHydrationData = null;
      }
      function cl(a2, b2, c2, d2, e, f2, g, h2, k2) {
        a2 = new bl(a2, b2, c2, h2, k2);
        1 === b2 ? (b2 = 1, true === f2 && (b2 |= 8)) : b2 = 0;
        f2 = Bg(3, null, null, b2);
        a2.current = f2;
        f2.stateNode = a2;
        f2.memoizedState = { element: d2, isDehydrated: c2, cache: null, transitions: null, pendingSuspenseBoundaries: null };
        ah(f2);
        return a2;
      }
      function dl(a2, b2, c2) {
        var d2 = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        return { $$typeof: wa, key: null == d2 ? null : "" + d2, children: a2, containerInfo: b2, implementation: c2 };
      }
      function el(a2) {
        if (!a2) return Vf;
        a2 = a2._reactInternals;
        a: {
          if (Vb(a2) !== a2 || 1 !== a2.tag) throw Error(p2(170));
          var b2 = a2;
          do {
            switch (b2.tag) {
              case 3:
                b2 = b2.stateNode.context;
                break a;
              case 1:
                if (Zf(b2.type)) {
                  b2 = b2.stateNode.__reactInternalMemoizedMergedChildContext;
                  break a;
                }
            }
            b2 = b2.return;
          } while (null !== b2);
          throw Error(p2(171));
        }
        if (1 === a2.tag) {
          var c2 = a2.type;
          if (Zf(c2)) return bg(a2, c2, b2);
        }
        return b2;
      }
      function fl(a2, b2, c2, d2, e, f2, g, h2, k2) {
        a2 = cl(c2, d2, true, a2, e, f2, g, h2, k2);
        a2.context = el(null);
        c2 = a2.current;
        d2 = L2();
        e = lh(c2);
        f2 = ch(d2, e);
        f2.callback = void 0 !== b2 && null !== b2 ? b2 : null;
        dh(c2, f2, e);
        a2.current.lanes = e;
        Ac(a2, e, d2);
        Ek(a2, d2);
        return a2;
      }
      function gl(a2, b2, c2, d2) {
        var e = b2.current, f2 = L2(), g = lh(e);
        c2 = el(c2);
        null === b2.context ? b2.context = c2 : b2.pendingContext = c2;
        b2 = ch(f2, g);
        b2.payload = { element: a2 };
        d2 = void 0 === d2 ? null : d2;
        null !== d2 && (b2.callback = d2);
        a2 = dh(e, b2, g);
        null !== a2 && (mh(a2, e, g, f2), eh(a2, e, g));
        return g;
      }
      function hl(a2) {
        a2 = a2.current;
        if (!a2.child) return null;
        switch (a2.child.tag) {
          case 5:
            return a2.child.stateNode;
          default:
            return a2.child.stateNode;
        }
      }
      function il(a2, b2) {
        a2 = a2.memoizedState;
        if (null !== a2 && null !== a2.dehydrated) {
          var c2 = a2.retryLane;
          a2.retryLane = 0 !== c2 && c2 < b2 ? c2 : b2;
        }
      }
      function jl(a2, b2) {
        il(a2, b2);
        (a2 = a2.alternate) && il(a2, b2);
      }
      function kl() {
        return null;
      }
      var ll = "function" === typeof reportError ? reportError : function(a2) {
        console.error(a2);
      };
      function ml(a2) {
        this._internalRoot = a2;
      }
      nl.prototype.render = ml.prototype.render = function(a2) {
        var b2 = this._internalRoot;
        if (null === b2) throw Error(p2(409));
        gl(a2, b2, null, null);
      };
      nl.prototype.unmount = ml.prototype.unmount = function() {
        var a2 = this._internalRoot;
        if (null !== a2) {
          this._internalRoot = null;
          var b2 = a2.containerInfo;
          Sk(function() {
            gl(null, a2, null, null);
          });
          b2[uf] = null;
        }
      };
      function nl(a2) {
        this._internalRoot = a2;
      }
      nl.prototype.unstable_scheduleHydration = function(a2) {
        if (a2) {
          var b2 = Hc();
          a2 = { blockedOn: null, target: a2, priority: b2 };
          for (var c2 = 0; c2 < Qc.length && 0 !== b2 && b2 < Qc[c2].priority; c2++) ;
          Qc.splice(c2, 0, a2);
          0 === c2 && Vc(a2);
        }
      };
      function ol(a2) {
        return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType);
      }
      function pl(a2) {
        return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType && (8 !== a2.nodeType || " react-mount-point-unstable " !== a2.nodeValue));
      }
      function ql() {
      }
      function rl(a2, b2, c2, d2, e) {
        if (e) {
          if ("function" === typeof d2) {
            var f2 = d2;
            d2 = function() {
              var a3 = hl(g);
              f2.call(a3);
            };
          }
          var g = fl(b2, d2, a2, 0, null, false, false, "", ql);
          a2._reactRootContainer = g;
          a2[uf] = g.current;
          sf(8 === a2.nodeType ? a2.parentNode : a2);
          Sk();
          return g;
        }
        for (; e = a2.lastChild; ) a2.removeChild(e);
        if ("function" === typeof d2) {
          var h2 = d2;
          d2 = function() {
            var a3 = hl(k2);
            h2.call(a3);
          };
        }
        var k2 = cl(a2, 0, false, null, null, false, false, "", ql);
        a2._reactRootContainer = k2;
        a2[uf] = k2.current;
        sf(8 === a2.nodeType ? a2.parentNode : a2);
        Sk(function() {
          gl(b2, k2, c2, d2);
        });
        return k2;
      }
      function sl(a2, b2, c2, d2, e) {
        var f2 = c2._reactRootContainer;
        if (f2) {
          var g = f2;
          if ("function" === typeof e) {
            var h2 = e;
            e = function() {
              var a3 = hl(g);
              h2.call(a3);
            };
          }
          gl(b2, g, a2, e);
        } else g = rl(c2, b2, a2, e, d2);
        return hl(g);
      }
      Ec = function(a2) {
        switch (a2.tag) {
          case 3:
            var b2 = a2.stateNode;
            if (b2.current.memoizedState.isDehydrated) {
              var c2 = tc(b2.pendingLanes);
              0 !== c2 && (Cc(b2, c2 | 1), Ek(b2, B2()), 0 === (K2 & 6) && (Hj = B2() + 500, jg()));
            }
            break;
          case 13:
            Sk(function() {
              var b3 = Zg(a2, 1);
              if (null !== b3) {
                var c3 = L2();
                mh(b3, a2, 1, c3);
              }
            }), jl(a2, 1);
        }
      };
      Fc = function(a2) {
        if (13 === a2.tag) {
          var b2 = Zg(a2, 134217728);
          if (null !== b2) {
            var c2 = L2();
            mh(b2, a2, 134217728, c2);
          }
          jl(a2, 134217728);
        }
      };
      Gc = function(a2) {
        if (13 === a2.tag) {
          var b2 = lh(a2), c2 = Zg(a2, b2);
          if (null !== c2) {
            var d2 = L2();
            mh(c2, a2, b2, d2);
          }
          jl(a2, b2);
        }
      };
      Hc = function() {
        return C2;
      };
      Ic = function(a2, b2) {
        var c2 = C2;
        try {
          return C2 = a2, b2();
        } finally {
          C2 = c2;
        }
      };
      yb = function(a2, b2, c2) {
        switch (b2) {
          case "input":
            bb(a2, c2);
            b2 = c2.name;
            if ("radio" === c2.type && null != b2) {
              for (c2 = a2; c2.parentNode; ) c2 = c2.parentNode;
              c2 = c2.querySelectorAll("input[name=" + JSON.stringify("" + b2) + '][type="radio"]');
              for (b2 = 0; b2 < c2.length; b2++) {
                var d2 = c2[b2];
                if (d2 !== a2 && d2.form === a2.form) {
                  var e = Db(d2);
                  if (!e) throw Error(p2(90));
                  Wa(d2);
                  bb(d2, e);
                }
              }
            }
            break;
          case "textarea":
            ib(a2, c2);
            break;
          case "select":
            b2 = c2.value, null != b2 && fb(a2, !!c2.multiple, b2, false);
        }
      };
      Gb = Rk;
      Hb = Sk;
      var tl = { usingClientEntryPoint: false, Events: [Cb, ue2, Db, Eb, Fb, Rk] };
      var ul = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.2.0", rendererPackageName: "react-dom" };
      var vl = { bundleType: ul.bundleType, version: ul.version, rendererPackageName: ul.rendererPackageName, rendererConfig: ul.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a2) {
        a2 = Zb(a2);
        return null === a2 ? null : a2.stateNode;
      }, findFiberByHostInstance: ul.findFiberByHostInstance || kl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.2.0-next-9e3b772b8-20220608" };
      if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
        wl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!wl.isDisabled && wl.supportsFiber) try {
          kc = wl.inject(vl), lc = wl;
        } catch (a2) {
        }
      }
      var wl;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = tl;
      exports.createPortal = function(a2, b2) {
        var c2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!ol(b2)) throw Error(p2(200));
        return dl(a2, b2, null, c2);
      };
      exports.createRoot = function(a2, b2) {
        if (!ol(a2)) throw Error(p2(299));
        var c2 = false, d2 = "", e = ll;
        null !== b2 && void 0 !== b2 && (true === b2.unstable_strictMode && (c2 = true), void 0 !== b2.identifierPrefix && (d2 = b2.identifierPrefix), void 0 !== b2.onRecoverableError && (e = b2.onRecoverableError));
        b2 = cl(a2, 1, false, null, null, c2, false, d2, e);
        a2[uf] = b2.current;
        sf(8 === a2.nodeType ? a2.parentNode : a2);
        return new ml(b2);
      };
      exports.findDOMNode = function(a2) {
        if (null == a2) return null;
        if (1 === a2.nodeType) return a2;
        var b2 = a2._reactInternals;
        if (void 0 === b2) {
          if ("function" === typeof a2.render) throw Error(p2(188));
          a2 = Object.keys(a2).join(",");
          throw Error(p2(268, a2));
        }
        a2 = Zb(b2);
        a2 = null === a2 ? null : a2.stateNode;
        return a2;
      };
      exports.flushSync = function(a2) {
        return Sk(a2);
      };
      exports.hydrate = function(a2, b2, c2) {
        if (!pl(b2)) throw Error(p2(200));
        return sl(null, a2, b2, true, c2);
      };
      exports.hydrateRoot = function(a2, b2, c2) {
        if (!ol(a2)) throw Error(p2(405));
        var d2 = null != c2 && c2.hydratedSources || null, e = false, f2 = "", g = ll;
        null !== c2 && void 0 !== c2 && (true === c2.unstable_strictMode && (e = true), void 0 !== c2.identifierPrefix && (f2 = c2.identifierPrefix), void 0 !== c2.onRecoverableError && (g = c2.onRecoverableError));
        b2 = fl(b2, null, a2, 1, null != c2 ? c2 : null, e, false, f2, g);
        a2[uf] = b2.current;
        sf(a2);
        if (d2) for (a2 = 0; a2 < d2.length; a2++) c2 = d2[a2], e = c2._getVersion, e = e(c2._source), null == b2.mutableSourceEagerHydrationData ? b2.mutableSourceEagerHydrationData = [c2, e] : b2.mutableSourceEagerHydrationData.push(
          c2,
          e
        );
        return new nl(b2);
      };
      exports.render = function(a2, b2, c2) {
        if (!pl(b2)) throw Error(p2(200));
        return sl(null, a2, b2, false, c2);
      };
      exports.unmountComponentAtNode = function(a2) {
        if (!pl(a2)) throw Error(p2(40));
        return a2._reactRootContainer ? (Sk(function() {
          sl(null, null, a2, false, function() {
            a2._reactRootContainer = null;
            a2[uf] = null;
          });
        }), true) : false;
      };
      exports.unstable_batchedUpdates = Rk;
      exports.unstable_renderSubtreeIntoContainer = function(a2, b2, c2, d2) {
        if (!pl(c2)) throw Error(p2(200));
        if (null == a2 || void 0 === a2._reactInternals) throw Error(p2(38));
        return sl(a2, b2, c2, false, d2);
      };
      exports.version = "18.2.0-next-9e3b772b8-20220608";
    }
  });

  // node_modules/react-dom/index.js
  var require_react_dom = __commonJS({
    "node_modules/react-dom/index.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
  function asyncGeneratorStep(n2, t2, e, r2, o, a2, c2) {
    try {
      var i2 = n2[a2](c2), u2 = i2.value;
    } catch (n3) {
      return void e(n3);
    }
    i2.done ? t2(u2) : Promise.resolve(u2).then(r2, o);
  }
  function _asyncToGenerator(n2) {
    return function() {
      var t2 = this, e = arguments;
      return new Promise(function(r2, o) {
        var a2 = n2.apply(t2, e);
        function _next(n3) {
          asyncGeneratorStep(a2, r2, o, _next, _throw, "next", n3);
        }
        function _throw(n3) {
          asyncGeneratorStep(a2, r2, o, _next, _throw, "throw", n3);
        }
        _next(void 0);
      });
    };
  }

  // node_modules/@babel/runtime/helpers/esm/classCallCheck.js
  function _classCallCheck(a2, n2) {
    if (!(a2 instanceof n2)) throw new TypeError("Cannot call a class as a function");
  }

  // node_modules/@babel/runtime/helpers/esm/typeof.js
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }

  // node_modules/@babel/runtime/helpers/esm/toPrimitive.js
  function toPrimitive(t2, r2) {
    if ("object" != _typeof(t2) || !t2) return t2;
    var e = t2[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i2 = e.call(t2, r2 || "default");
      if ("object" != _typeof(i2)) return i2;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t2);
  }

  // node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
  function toPropertyKey(t2) {
    var i2 = toPrimitive(t2, "string");
    return "symbol" == _typeof(i2) ? i2 : i2 + "";
  }

  // node_modules/@babel/runtime/helpers/esm/createClass.js
  function _defineProperties(e, r2) {
    for (var t2 = 0; t2 < r2.length; t2++) {
      var o = r2[t2];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r2, t2) {
    return r2 && _defineProperties(e.prototype, r2), t2 && _defineProperties(e, t2), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }

  // node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }

  // node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js
  function _possibleConstructorReturn(t2, e) {
    if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t2);
  }

  // node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
  function _getPrototypeOf(t2) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t3) {
      return t3.__proto__ || Object.getPrototypeOf(t3);
    }, _getPrototypeOf(t2);
  }

  // node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
  function _setPrototypeOf(t2, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t3, e2) {
      return t3.__proto__ = e2, t3;
    }, _setPrototypeOf(t2, e);
  }

  // node_modules/@babel/runtime/helpers/esm/inherits.js
  function _inherits(t2, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t2.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t2,
        writable: true,
        configurable: true
      }
    }), Object.defineProperty(t2, "prototype", {
      writable: false
    }), e && _setPrototypeOf(t2, e);
  }

  // node_modules/@babel/runtime/helpers/esm/defineProperty.js
  function _defineProperty(e, r2, t2) {
    return (r2 = toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, {
      value: t2,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r2] = t2, e;
  }

  // node_modules/rete/rete.esm.js
  var import_regenerator = __toESM(require_regenerator2());
  function _createForOfIteratorHelper$1(r2, e) {
    var t2 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (!t2) {
      if (Array.isArray(r2) || (t2 = _unsupportedIterableToArray$1(r2)) || e && r2 && "number" == typeof r2.length) {
        t2 && (r2 = t2);
        var _n = 0, F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          return _n >= r2.length ? { done: true } : { done: false, value: r2[_n++] };
        }, e: function e2(r3) {
          throw r3;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a2 = true, u2 = false;
    return { s: function s() {
      t2 = t2.call(r2);
    }, n: function n2() {
      var r3 = t2.next();
      return a2 = r3.done, r3;
    }, e: function e2(r3) {
      u2 = true, o = r3;
    }, f: function f2() {
      try {
        a2 || null == t2["return"] || t2["return"]();
      } finally {
        if (u2) throw o;
      }
    } };
  }
  function _unsupportedIterableToArray$1(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray$1(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray$1(r2, a2) : void 0;
    }
  }
  function _arrayLikeToArray$1(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }
  function useHelper() {
    return {
      debug: function debug(_f) {
      }
    };
  }
  var Signal = /* @__PURE__ */ function() {
    function Signal2() {
      _classCallCheck(this, Signal2);
      _defineProperty(this, "pipes", []);
    }
    return _createClass(Signal2, [{
      key: "addPipe",
      value: function addPipe(pipe) {
        this.pipes.push(pipe);
      }
    }, {
      key: "emit",
      value: function() {
        var _emit = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee(context) {
          var current, _iterator, _step, pipe;
          return import_regenerator.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                current = context;
                _iterator = _createForOfIteratorHelper$1(this.pipes);
                _context.prev = 2;
                _iterator.s();
              case 4:
                if ((_step = _iterator.n()).done) {
                  _context.next = 13;
                  break;
                }
                pipe = _step.value;
                _context.next = 8;
                return pipe(current);
              case 8:
                current = _context.sent;
                if (!(typeof current === "undefined")) {
                  _context.next = 11;
                  break;
                }
                return _context.abrupt("return");
              case 11:
                _context.next = 4;
                break;
              case 13:
                _context.next = 18;
                break;
              case 15:
                _context.prev = 15;
                _context.t0 = _context["catch"](2);
                _iterator.e(_context.t0);
              case 18:
                _context.prev = 18;
                _iterator.f();
                return _context.finish(18);
              case 21:
                return _context.abrupt("return", current);
              case 22:
              case "end":
                return _context.stop();
            }
          }, _callee, this, [[2, 15, 18, 21]]);
        }));
        function emit(_x) {
          return _emit.apply(this, arguments);
        }
        return emit;
      }()
    }]);
  }();
  var Scope = /* @__PURE__ */ function() {
    function Scope2(name) {
      _classCallCheck(this, Scope2);
      _defineProperty(this, "signal", new Signal());
      this.name = name;
    }
    return _createClass(Scope2, [{
      key: "addPipe",
      value: function addPipe(middleware2) {
        this.signal.addPipe(middleware2);
      }
    }, {
      key: "use",
      value: function use(scope) {
        if (!(scope instanceof Scope2)) throw new Error("cannot use non-Scope instance");
        scope.setParent(this);
        this.addPipe(function(context) {
          return scope.signal.emit(context);
        });
        return useHelper();
      }
    }, {
      key: "setParent",
      value: function setParent(scope) {
        this.parent = scope;
      }
    }, {
      key: "emit",
      value: function emit(context) {
        return this.signal.emit(context);
      }
    }, {
      key: "hasParent",
      value: function hasParent() {
        return Boolean(this.parent);
      }
    }, {
      key: "parentScope",
      value: function parentScope(type) {
        if (!this.parent) throw new Error("cannot find parent");
        if (type && this.parent instanceof type) return this.parent;
        if (type) throw new Error("actual parent is not instance of type");
        return this.parent;
      }
    }]);
  }();
  function _createForOfIteratorHelper(r2, e) {
    var t2 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (!t2) {
      if (Array.isArray(r2) || (t2 = _unsupportedIterableToArray(r2)) || e && r2 && "number" == typeof r2.length) {
        t2 && (r2 = t2);
        var _n = 0, F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          return _n >= r2.length ? { done: true } : { done: false, value: r2[_n++] };
        }, e: function e2(r3) {
          throw r3;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a2 = true, u2 = false;
    return { s: function s() {
      t2 = t2.call(r2);
    }, n: function n2() {
      var r3 = t2.next();
      return a2 = r3.done, r3;
    }, e: function e2(r3) {
      u2 = true, o = r3;
    }, f: function f2() {
      try {
        a2 || null == t2["return"] || t2["return"]();
      } finally {
        if (u2) throw o;
      }
    } };
  }
  function _unsupportedIterableToArray(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray(r2, a2) : void 0;
    }
  }
  function _arrayLikeToArray(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }
  function _callSuper$1(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct$1() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  var NodeEditor = /* @__PURE__ */ function(_Scope) {
    function NodeEditor2() {
      var _this;
      _classCallCheck(this, NodeEditor2);
      _this = _callSuper$1(this, NodeEditor2, ["NodeEditor"]);
      _defineProperty(_this, "nodes", []);
      _defineProperty(_this, "connections", []);
      return _this;
    }
    _inherits(NodeEditor2, _Scope);
    return _createClass(NodeEditor2, [{
      key: "getNode",
      value: function getNode(id) {
        return this.nodes.find(function(node2) {
          return node2.id === id;
        });
      }
      /**
       * Get all nodes
       * @returns Copy of array with nodes
       */
    }, {
      key: "getNodes",
      value: function getNodes() {
        return this.nodes.slice();
      }
      /**
       * Get all connections
       * @returns Copy of array with onnections
       */
    }, {
      key: "getConnections",
      value: function getConnections() {
        return this.connections.slice();
      }
      /**
       * Get a connection by id
       * @param id - The connection id
       * @returns The connection or undefined
       */
    }, {
      key: "getConnection",
      value: function getConnection(id) {
        return this.connections.find(function(connection) {
          return connection.id === id;
        });
      }
      /**
       * Add a node
       * @param data - The node data
       * @returns Whether the node was added
       * @throws If the node has already been added
       * @emits nodecreate
       * @emits nodecreated
       */
    }, {
      key: "addNode",
      value: function() {
        var _addNode = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee(data) {
          return import_regenerator.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (!this.getNode(data.id)) {
                  _context.next = 2;
                  break;
                }
                throw new Error("node has already been added");
              case 2:
                _context.next = 4;
                return this.emit({
                  type: "nodecreate",
                  data
                });
              case 4:
                if (_context.sent) {
                  _context.next = 6;
                  break;
                }
                return _context.abrupt("return", false);
              case 6:
                this.nodes.push(data);
                _context.next = 9;
                return this.emit({
                  type: "nodecreated",
                  data
                });
              case 9:
                return _context.abrupt("return", true);
              case 10:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function addNode(_x) {
          return _addNode.apply(this, arguments);
        }
        return addNode;
      }()
    }, {
      key: "addConnection",
      value: function() {
        var _addConnection = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee2(data) {
          return import_regenerator.default.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.getConnection(data.id)) {
                  _context2.next = 2;
                  break;
                }
                throw new Error("connection has already been added");
              case 2:
                _context2.next = 4;
                return this.emit({
                  type: "connectioncreate",
                  data
                });
              case 4:
                if (_context2.sent) {
                  _context2.next = 6;
                  break;
                }
                return _context2.abrupt("return", false);
              case 6:
                this.connections.push(data);
                _context2.next = 9;
                return this.emit({
                  type: "connectioncreated",
                  data
                });
              case 9:
                return _context2.abrupt("return", true);
              case 10:
              case "end":
                return _context2.stop();
            }
          }, _callee2, this);
        }));
        function addConnection(_x2) {
          return _addConnection.apply(this, arguments);
        }
        return addConnection;
      }()
    }, {
      key: "removeNode",
      value: function() {
        var _removeNode = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee3(id) {
          var node2, index4;
          return import_regenerator.default.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                node2 = this.nodes.find(function(n2) {
                  return n2.id === id;
                });
                if (node2) {
                  _context3.next = 3;
                  break;
                }
                throw new Error("cannot find node");
              case 3:
                _context3.next = 5;
                return this.emit({
                  type: "noderemove",
                  data: node2
                });
              case 5:
                if (_context3.sent) {
                  _context3.next = 7;
                  break;
                }
                return _context3.abrupt("return", false);
              case 7:
                index4 = this.nodes.indexOf(node2);
                this.nodes.splice(index4, 1);
                _context3.next = 11;
                return this.emit({
                  type: "noderemoved",
                  data: node2
                });
              case 11:
                return _context3.abrupt("return", true);
              case 12:
              case "end":
                return _context3.stop();
            }
          }, _callee3, this);
        }));
        function removeNode(_x3) {
          return _removeNode.apply(this, arguments);
        }
        return removeNode;
      }()
    }, {
      key: "removeConnection",
      value: function() {
        var _removeConnection = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee4(id) {
          var connection, index4;
          return import_regenerator.default.wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                connection = this.connections.find(function(c2) {
                  return c2.id === id;
                });
                if (connection) {
                  _context4.next = 3;
                  break;
                }
                throw new Error("cannot find connection");
              case 3:
                _context4.next = 5;
                return this.emit({
                  type: "connectionremove",
                  data: connection
                });
              case 5:
                if (_context4.sent) {
                  _context4.next = 7;
                  break;
                }
                return _context4.abrupt("return", false);
              case 7:
                index4 = this.connections.indexOf(connection);
                this.connections.splice(index4, 1);
                _context4.next = 11;
                return this.emit({
                  type: "connectionremoved",
                  data: connection
                });
              case 11:
                return _context4.abrupt("return", true);
              case 12:
              case "end":
                return _context4.stop();
            }
          }, _callee4, this);
        }));
        function removeConnection(_x4) {
          return _removeConnection.apply(this, arguments);
        }
        return removeConnection;
      }()
    }, {
      key: "clear",
      value: function() {
        var _clear = _asyncToGenerator(/* @__PURE__ */ import_regenerator.default.mark(function _callee5() {
          var _iterator, _step, connection, _iterator2, _step2, node2;
          return import_regenerator.default.wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.emit({
                  type: "clear"
                });
              case 2:
                if (_context5.sent) {
                  _context5.next = 6;
                  break;
                }
                _context5.next = 5;
                return this.emit({
                  type: "clearcancelled"
                });
              case 5:
                return _context5.abrupt("return", false);
              case 6:
                _iterator = _createForOfIteratorHelper(this.connections.slice());
                _context5.prev = 7;
                _iterator.s();
              case 9:
                if ((_step = _iterator.n()).done) {
                  _context5.next = 15;
                  break;
                }
                connection = _step.value;
                _context5.next = 13;
                return this.removeConnection(connection.id);
              case 13:
                _context5.next = 9;
                break;
              case 15:
                _context5.next = 20;
                break;
              case 17:
                _context5.prev = 17;
                _context5.t0 = _context5["catch"](7);
                _iterator.e(_context5.t0);
              case 20:
                _context5.prev = 20;
                _iterator.f();
                return _context5.finish(20);
              case 23:
                _iterator2 = _createForOfIteratorHelper(this.nodes.slice());
                _context5.prev = 24;
                _iterator2.s();
              case 26:
                if ((_step2 = _iterator2.n()).done) {
                  _context5.next = 32;
                  break;
                }
                node2 = _step2.value;
                _context5.next = 30;
                return this.removeNode(node2.id);
              case 30:
                _context5.next = 26;
                break;
              case 32:
                _context5.next = 37;
                break;
              case 34:
                _context5.prev = 34;
                _context5.t1 = _context5["catch"](24);
                _iterator2.e(_context5.t1);
              case 37:
                _context5.prev = 37;
                _iterator2.f();
                return _context5.finish(37);
              case 40:
                _context5.next = 42;
                return this.emit({
                  type: "cleared"
                });
              case 42:
                return _context5.abrupt("return", true);
              case 43:
              case "end":
                return _context5.stop();
            }
          }, _callee5, this, [[7, 17, 20, 23], [24, 34, 37, 40]]);
        }));
        function clear() {
          return _clear.apply(this, arguments);
        }
        return clear;
      }()
    }]);
  }(Scope);
  var crypto = globalThis.crypto;
  function getUID() {
    if ("randomBytes" in crypto) {
      return crypto.randomBytes(8).toString("hex");
    }
    var bytes = crypto.getRandomValues(new Uint8Array(8));
    var array = Array.from(bytes);
    var hexPairs = array.map(function(b2) {
      return b2.toString(16).padStart(2, "0");
    });
    return hexPairs.join("");
  }
  function _callSuper(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  var Socket = /* @__PURE__ */ _createClass(
    /**
     * @constructor
     * @param name Name of the socket
     */
    function Socket2(name) {
      _classCallCheck(this, Socket2);
      this.name = name;
    }
  );
  var Port = /* @__PURE__ */ _createClass(
    /**
     * Port id, unique string generated by `getUID` function
     */
    /**
     * Port index, used for sorting ports. Default is `0`
     */
    /**
     * @constructor
     * @param socket Socket instance
     * @param label Label of the port
     * @param multipleConnections Whether the output port can have multiple connections
     */
    function Port2(socket2, label, multipleConnections) {
      _classCallCheck(this, Port2);
      this.socket = socket2;
      this.label = label;
      this.multipleConnections = multipleConnections;
      this.id = getUID();
    }
  );
  var Input = /* @__PURE__ */ function(_Port) {
    function Input3(socket2, label, multipleConnections) {
      var _this;
      _classCallCheck(this, Input3);
      _this = _callSuper(this, Input3, [socket2, label, multipleConnections]);
      _defineProperty(_this, "control", null);
      _defineProperty(_this, "showControl", true);
      _this.socket = socket2;
      _this.label = label;
      _this.multipleConnections = multipleConnections;
      return _this;
    }
    _inherits(Input3, _Port);
    return _createClass(Input3, [{
      key: "addControl",
      value: function addControl(control) {
        if (this.control) throw new Error("control already added for this input");
        this.control = control;
      }
      /**
       * Remove control from the input port
       */
    }, {
      key: "removeControl",
      value: function removeControl() {
        this.control = null;
      }
    }]);
  }(Port);
  var Output = /* @__PURE__ */ function(_Port2) {
    function Output2(socket2, label, multipleConnections) {
      _classCallCheck(this, Output2);
      return _callSuper(this, Output2, [socket2, label, multipleConnections !== false]);
    }
    _inherits(Output2, _Port2);
    return _createClass(Output2);
  }(Port);
  var Control = /* @__PURE__ */ _createClass(
    /**
     * Control id, unique string generated by `getUID` function
     */
    /**
     * Control index, used for sorting controls. Default is `0`
     */
    function Control2() {
      _classCallCheck(this, Control2);
      this.id = getUID();
    }
  );
  var InputControl = /* @__PURE__ */ function(_Control) {
    function InputControl2(type, options) {
      var _options$readonly;
      var _this2;
      _classCallCheck(this, InputControl2);
      _this2 = _callSuper(this, InputControl2);
      _this2.type = type;
      _this2.options = options;
      _this2.id = getUID();
      _this2.readonly = (_options$readonly = options === null || options === void 0 ? void 0 : options.readonly) !== null && _options$readonly !== void 0 ? _options$readonly : false;
      if (typeof (options === null || options === void 0 ? void 0 : options.initial) !== "undefined") _this2.value = options.initial;
      return _this2;
    }
    _inherits(InputControl2, _Control);
    return _createClass(InputControl2, [{
      key: "setValue",
      value: function setValue(value) {
        var _this$options;
        this.value = value;
        if ((_this$options = this.options) !== null && _this$options !== void 0 && _this$options.change) this.options.change(value);
      }
    }]);
  }(Control);
  var Node = /* @__PURE__ */ function() {
    function Node3(label) {
      _classCallCheck(this, Node3);
      _defineProperty(this, "inputs", {});
      _defineProperty(this, "outputs", {});
      _defineProperty(this, "controls", {});
      this.label = label;
      this.id = getUID();
    }
    return _createClass(Node3, [{
      key: "hasInput",
      value: function hasInput(key) {
        return Object.prototype.hasOwnProperty.call(this.inputs, key);
      }
    }, {
      key: "addInput",
      value: function addInput(key, input) {
        if (this.hasInput(key)) throw new Error("input with key '".concat(String(key), "' already added"));
        Object.defineProperty(this.inputs, key, {
          value: input,
          enumerable: true,
          configurable: true
        });
      }
    }, {
      key: "removeInput",
      value: function removeInput(key) {
        delete this.inputs[key];
      }
    }, {
      key: "hasOutput",
      value: function hasOutput(key) {
        return Object.prototype.hasOwnProperty.call(this.outputs, key);
      }
    }, {
      key: "addOutput",
      value: function addOutput(key, output) {
        if (this.hasOutput(key)) throw new Error("output with key '".concat(String(key), "' already added"));
        Object.defineProperty(this.outputs, key, {
          value: output,
          enumerable: true,
          configurable: true
        });
      }
    }, {
      key: "removeOutput",
      value: function removeOutput(key) {
        delete this.outputs[key];
      }
    }, {
      key: "hasControl",
      value: function hasControl(key) {
        return Object.prototype.hasOwnProperty.call(this.controls, key);
      }
    }, {
      key: "addControl",
      value: function addControl(key, control) {
        if (this.hasControl(key)) throw new Error("control with key '".concat(String(key), "' already added"));
        Object.defineProperty(this.controls, key, {
          value: control,
          enumerable: true,
          configurable: true
        });
      }
    }, {
      key: "removeControl",
      value: function removeControl(key) {
        delete this.controls[key];
      }
    }]);
  }();
  var Connection = /* @__PURE__ */ _createClass(
    /**
     * Connection id, unique string generated by `getUID` function
     */
    /**
     * Source node id
     */
    /**
     * Target node id
     */
    /**
     * @constructor
     * @param source Source node instance
     * @param sourceOutput Source node output key
     * @param target Target node instance
     * @param targetInput Target node input key
     */
    function Connection2(source, sourceOutput, target, targetInput) {
      _classCallCheck(this, Connection2);
      this.sourceOutput = sourceOutput;
      this.targetInput = targetInput;
      if (!source.outputs[sourceOutput]) {
        throw new Error("source node doesn't have output with a key ".concat(String(sourceOutput)));
      }
      if (!target.inputs[targetInput]) {
        throw new Error("target node doesn't have input with a key ".concat(String(targetInput)));
      }
      this.id = getUID();
      this.source = source.id;
      this.target = target.id;
    }
  );
  var classic = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    Socket,
    Port,
    Input,
    Output,
    Control,
    InputControl,
    Node,
    Connection
  });

  // node_modules/rete-area-plugin/rete-area-plugin.esm.js
  var import_regenerator2 = __toESM(require_regenerator2());

  // node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
  function _arrayLikeToArray2(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }

  // node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js
  function _arrayWithoutHoles(r2) {
    if (Array.isArray(r2)) return _arrayLikeToArray2(r2);
  }

  // node_modules/@babel/runtime/helpers/esm/iterableToArray.js
  function _iterableToArray(r2) {
    if ("undefined" != typeof Symbol && null != r2[Symbol.iterator] || null != r2["@@iterator"]) return Array.from(r2);
  }

  // node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js
  function _unsupportedIterableToArray2(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray2(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray2(r2, a2) : void 0;
    }
  }

  // node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // node_modules/@babel/runtime/helpers/esm/toConsumableArray.js
  function _toConsumableArray(r2) {
    return _arrayWithoutHoles(r2) || _iterableToArray(r2) || _unsupportedIterableToArray2(r2) || _nonIterableSpread();
  }

  // node_modules/rete-area-plugin/rete-area-plugin.esm.js
  var Content = /* @__PURE__ */ function() {
    function Content2(reordered) {
      _classCallCheck(this, Content2);
      this.reordered = reordered;
      this.holder = document.createElement("div");
      this.holder.style.transformOrigin = "0 0";
    }
    return _createClass(Content2, [{
      key: "getPointerFrom",
      value: function getPointerFrom(event) {
        var _this$holder$getBound = this.holder.getBoundingClientRect(), left = _this$holder$getBound.left, top = _this$holder$getBound.top;
        var x2 = event.clientX - left;
        var y = event.clientY - top;
        return {
          x: x2,
          y
        };
      }
    }, {
      key: "add",
      value: function add(element) {
        this.holder.appendChild(element);
      }
      // eslint-disable-next-line no-undef
    }, {
      key: "reorder",
      value: function() {
        var _reorder = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(target, next2) {
          return import_regenerator2.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (this.holder.contains(target)) {
                  _context.next = 2;
                  break;
                }
                throw new Error("content doesn't have 'target' for reordering");
              case 2:
                if (!(next2 !== null && !this.holder.contains(next2))) {
                  _context.next = 4;
                  break;
                }
                throw new Error("content doesn't have 'next' for reordering");
              case 4:
                this.holder.insertBefore(target, next2);
                _context.next = 7;
                return this.reordered(target);
              case 7:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function reorder(_x, _x2) {
          return _reorder.apply(this, arguments);
        }
        return reorder;
      }()
    }, {
      key: "remove",
      value: function remove(element) {
        if (this.holder.contains(element)) {
          this.holder.removeChild(element);
        }
      }
    }]);
  }();
  function usePointerListener(element, handlers) {
    var move = function move2(event) {
      handlers.move(event);
    };
    var _up = function up(event) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", _up);
      window.removeEventListener("pointercancel", _up);
      handlers.up(event);
    };
    var down = function down2(event) {
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", _up);
      window.addEventListener("pointercancel", _up);
      handlers.down(event);
    };
    element.addEventListener("pointerdown", down);
    return {
      destroy: function destroy() {
        element.removeEventListener("pointerdown", down);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", _up);
        window.removeEventListener("pointercancel", _up);
      }
    };
  }
  var min = function min2(arr) {
    return arr.length === 0 ? 0 : Math.min.apply(Math, _toConsumableArray(arr));
  };
  var max = function max2(arr) {
    return arr.length === 0 ? 0 : Math.max.apply(Math, _toConsumableArray(arr));
  };
  function getBoundingBox$1(rects) {
    var left = min(rects.map(function(rect) {
      return rect.position.x;
    }));
    var top = min(rects.map(function(rect) {
      return rect.position.y;
    }));
    var right = max(rects.map(function(rect) {
      return rect.position.x + rect.width;
    }));
    var bottom = max(rects.map(function(rect) {
      return rect.position.y + rect.height;
    }));
    return {
      left,
      right,
      top,
      bottom,
      width: Math.abs(left - right),
      height: Math.abs(top - bottom),
      center: {
        x: (left + right) / 2,
        y: (top + bottom) / 2
      }
    };
  }
  function ownKeys$4(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread$4(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$4(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys$4(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  var Drag = /* @__PURE__ */ function() {
    function Drag2(guards) {
      var _this = this;
      _classCallCheck(this, Drag2);
      _defineProperty(this, "down", function(e) {
        if (!_this.guards.down(e)) return;
        e.stopPropagation();
        _this.pointerStart = {
          x: e.pageX,
          y: e.pageY
        };
        _this.startPosition = _objectSpread$4({}, _this.config.getCurrentPosition());
        _this.events.start(e);
      });
      _defineProperty(this, "move", function(e) {
        if (!_this.pointerStart || !_this.startPosition) return;
        if (!_this.guards.move(e)) return;
        e.preventDefault();
        var delta = {
          x: e.pageX - _this.pointerStart.x,
          y: e.pageY - _this.pointerStart.y
        };
        var zoom = _this.config.getZoom();
        var x2 = _this.startPosition.x + delta.x / zoom;
        var y = _this.startPosition.y + delta.y / zoom;
        void _this.events.translate(x2, y, e);
      });
      _defineProperty(this, "up", function(e) {
        if (!_this.pointerStart) return;
        delete _this.pointerStart;
        _this.events.drag(e);
      });
      this.guards = guards || {
        down: function down(e) {
          return !(e.pointerType === "mouse" && e.button !== 0);
        },
        move: function move() {
          return true;
        }
      };
    }
    return _createClass(Drag2, [{
      key: "initialize",
      value: function initialize(element, config, events) {
        this.config = config;
        this.events = events;
        element.style.touchAction = "none";
        this.pointerListener = usePointerListener(element, {
          down: this.down,
          move: this.move,
          up: this.up
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.pointerListener.destroy();
      }
    }]);
  }();
  var Zoom = /* @__PURE__ */ function() {
    function Zoom2(intensity) {
      var _this = this;
      _classCallCheck(this, Zoom2);
      _defineProperty(this, "previous", null);
      _defineProperty(this, "pointers", []);
      _defineProperty(this, "wheel", function(e) {
        e.preventDefault();
        var _this$element$getBoun = _this.element.getBoundingClientRect(), left = _this$element$getBoun.left, top = _this$element$getBoun.top;
        var isNegative = e.deltaY < 0;
        var delta = isNegative ? _this.intensity : -_this.intensity;
        var ox = (left - e.clientX) * delta;
        var oy = (top - e.clientY) * delta;
        _this.onzoom(delta, ox, oy, "wheel");
      });
      _defineProperty(this, "down", function(e) {
        _this.pointers.push(e);
      });
      _defineProperty(this, "move", function(e) {
        _this.pointers = _this.pointers.map(function(p2) {
          return p2.pointerId === e.pointerId ? e : p2;
        });
        if (!_this.isTranslating()) return;
        var _this$element$getBoun2 = _this.element.getBoundingClientRect(), left = _this$element$getBoun2.left, top = _this$element$getBoun2.top;
        var _this$getTouches = _this.getTouches(), cx = _this$getTouches.cx, cy = _this$getTouches.cy, distance = _this$getTouches.distance;
        if (_this.previous !== null && _this.previous.distance > 0) {
          var _delta = distance / _this.previous.distance - 1;
          var _ox = (left - cx) * _delta;
          var _oy = (top - cy) * _delta;
          _this.onzoom(_delta, _ox - (_this.previous.cx - cx), _oy - (_this.previous.cy - cy), "touch");
        }
        _this.previous = {
          cx,
          cy,
          distance
        };
      });
      _defineProperty(this, "contextmenu", function() {
        _this.pointers = [];
      });
      _defineProperty(this, "up", function(e) {
        _this.previous = null;
        _this.pointers = _this.pointers.filter(function(p2) {
          return p2.pointerId !== e.pointerId;
        });
      });
      _defineProperty(this, "dblclick", function(e) {
        e.preventDefault();
        var _this$element$getBoun3 = _this.element.getBoundingClientRect(), left = _this$element$getBoun3.left, top = _this$element$getBoun3.top;
        var delta = 4 * _this.intensity;
        var ox = (left - e.clientX) * delta;
        var oy = (top - e.clientY) * delta;
        _this.onzoom(delta, ox, oy, "dblclick");
      });
      this.intensity = intensity;
    }
    return _createClass(Zoom2, [{
      key: "initialize",
      value: function initialize(container, element, onzoom) {
        this.container = container;
        this.element = element;
        this.onzoom = onzoom;
        this.container.addEventListener("wheel", this.wheel);
        this.container.addEventListener("pointerdown", this.down);
        this.container.addEventListener("dblclick", this.dblclick);
        window.addEventListener("pointermove", this.move);
        window.addEventListener("pointerup", this.up);
        window.addEventListener("pointercancel", this.up);
        window.addEventListener("contextmenu", this.contextmenu);
      }
    }, {
      key: "getTouches",
      value: function getTouches() {
        var e = {
          touches: this.pointers
        };
        var _ref = [e.touches[0].clientX, e.touches[0].clientY], x1 = _ref[0], y1 = _ref[1];
        var _ref2 = [e.touches[1].clientX, e.touches[1].clientY], x2 = _ref2[0], y2 = _ref2[1];
        var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        return {
          cx: (x1 + x2) / 2,
          cy: (y1 + y2) / 2,
          distance
        };
      }
    }, {
      key: "isTranslating",
      value: function isTranslating() {
        return this.pointers.length >= 2;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.container.removeEventListener("wheel", this.wheel);
        this.container.removeEventListener("pointerdown", this.down);
        this.container.removeEventListener("dblclick", this.dblclick);
        window.removeEventListener("pointermove", this.move);
        window.removeEventListener("pointerup", this.up);
        window.removeEventListener("pointercancel", this.up);
        window.removeEventListener("contextmenu", this.contextmenu);
      }
    }]);
  }();
  var Area = /* @__PURE__ */ function() {
    function Area2(container, events, guards) {
      var _this = this;
      _classCallCheck(this, Area2);
      _defineProperty(this, "transform", {
        k: 1,
        x: 0,
        y: 0
      });
      _defineProperty(this, "pointer", {
        x: 0,
        y: 0
      });
      _defineProperty(this, "zoomHandler", null);
      _defineProperty(this, "dragHandler", null);
      _defineProperty(this, "pointerdown", function(event) {
        _this.setPointerFrom(event);
        _this.events.pointerDown(_this.pointer, event);
      });
      _defineProperty(this, "pointermove", function(event) {
        _this.setPointerFrom(event);
        _this.events.pointerMove(_this.pointer, event);
      });
      _defineProperty(this, "pointerup", function(event) {
        _this.setPointerFrom(event);
        _this.events.pointerUp(_this.pointer, event);
      });
      _defineProperty(this, "resize", function(event) {
        _this.events.resize(event);
      });
      _defineProperty(this, "onTranslate", function(x2, y) {
        var _this$zoomHandler;
        if ((_this$zoomHandler = _this.zoomHandler) !== null && _this$zoomHandler !== void 0 && _this$zoomHandler.isTranslating()) return;
        void _this.translate(x2, y);
      });
      _defineProperty(this, "onZoom", function(delta, ox, oy, source) {
        void _this.zoom(_this.transform.k * (1 + delta), ox, oy, source);
        _this.update();
      });
      this.container = container;
      this.events = events;
      this.guards = guards;
      this.content = new Content(function(element) {
        return _this.events.reordered(element);
      });
      this.content.holder.style.transformOrigin = "0 0";
      this.setZoomHandler(new Zoom(0.1));
      this.setDragHandler(new Drag());
      this.container.addEventListener("pointerdown", this.pointerdown);
      this.container.addEventListener("pointermove", this.pointermove);
      window.addEventListener("pointerup", this.pointerup);
      window.addEventListener("resize", this.resize);
      container.appendChild(this.content.holder);
      this.update();
    }
    return _createClass(Area2, [{
      key: "update",
      value: function update() {
        var _this$transform = this.transform, x2 = _this$transform.x, y = _this$transform.y, k2 = _this$transform.k;
        this.content.holder.style.transform = "translate(".concat(x2, "px, ").concat(y, "px) scale(").concat(k2, ")");
      }
      /**
       * Drag handler. Destroy previous drag handler if exists.
       * @param drag drag handler
       * @example area.area.setDragHandler(null) // disable drag
       */
    }, {
      key: "setDragHandler",
      value: function setDragHandler(drag) {
        var _this2 = this;
        if (this.dragHandler) this.dragHandler.destroy();
        this.dragHandler = drag;
        if (this.dragHandler) this.dragHandler.initialize(this.container, {
          getCurrentPosition: function getCurrentPosition() {
            return _this2.transform;
          },
          getZoom: function getZoom() {
            return 1;
          }
        }, {
          start: function start() {
            return null;
          },
          translate: this.onTranslate,
          drag: function drag2() {
            return null;
          }
        });
      }
      /**
       * Set zoom handler. Destroy previous zoom handler if exists.
       * @param zoom zoom handler
       * @example area.area.setZoomHandler(null) // disable zoom
       */
    }, {
      key: "setZoomHandler",
      value: function setZoomHandler(zoom) {
        if (this.zoomHandler) this.zoomHandler.destroy();
        this.zoomHandler = zoom;
        if (this.zoomHandler) this.zoomHandler.initialize(this.container, this.content.holder, this.onZoom);
      }
    }, {
      key: "setPointerFrom",
      value: function setPointerFrom(event) {
        var _this$content$getPoin = this.content.getPointerFrom(event), x2 = _this$content$getPoin.x, y = _this$content$getPoin.y;
        var k2 = this.transform.k;
        this.pointer = {
          x: x2 / k2,
          y: y / k2
        };
      }
    }, {
      key: "translate",
      value: (
        /**
         * Change position of the area
         * @param x desired x coordinate
         * @param y desired y coordinate
         * @returns true if the translation was successful, false otherwise
         * @emits translate
         * @emits translated
         */
        function() {
          var _translate = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(x2, y) {
            var position2, result;
            return import_regenerator2.default.wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  position2 = {
                    x: x2,
                    y
                  };
                  _context.next = 3;
                  return this.guards.translate({
                    previous: this.transform,
                    position: position2
                  });
                case 3:
                  result = _context.sent;
                  if (result) {
                    _context.next = 6;
                    break;
                  }
                  return _context.abrupt("return", false);
                case 6:
                  this.transform.x = result.data.position.x;
                  this.transform.y = result.data.position.y;
                  this.update();
                  _context.next = 11;
                  return this.events.translated(result.data);
                case 11:
                  return _context.abrupt("return", true);
                case 12:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function translate(_x, _x2) {
            return _translate.apply(this, arguments);
          }
          return translate;
        }()
      )
    }, {
      key: "zoom",
      value: function() {
        var _zoom2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(_zoom) {
          var ox, oy, source, k2, result, d2, _args2 = arguments;
          return import_regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                ox = _args2.length > 1 && _args2[1] !== void 0 ? _args2[1] : 0;
                oy = _args2.length > 2 && _args2[2] !== void 0 ? _args2[2] : 0;
                source = _args2.length > 3 ? _args2[3] : void 0;
                k2 = this.transform.k;
                _context2.next = 6;
                return this.guards.zoom({
                  previous: this.transform,
                  zoom: _zoom,
                  source
                });
              case 6:
                result = _context2.sent;
                if (result) {
                  _context2.next = 9;
                  break;
                }
                return _context2.abrupt("return", true);
              case 9:
                d2 = (k2 - result.data.zoom) / (k2 - _zoom || 1);
                this.transform.k = result.data.zoom || 1;
                this.transform.x += ox * d2;
                this.transform.y += oy * d2;
                this.update();
                _context2.next = 16;
                return this.events.zoomed(result.data);
              case 16:
                return _context2.abrupt("return", false);
              case 17:
              case "end":
                return _context2.stop();
            }
          }, _callee2, this);
        }));
        function zoom(_x3) {
          return _zoom2.apply(this, arguments);
        }
        return zoom;
      }()
    }, {
      key: "destroy",
      value: function destroy() {
        this.container.removeEventListener("pointerdown", this.pointerdown);
        this.container.removeEventListener("pointermove", this.pointermove);
        window.removeEventListener("pointerup", this.pointerup);
        window.removeEventListener("resize", this.resize);
        if (this.dragHandler) this.dragHandler.destroy();
        if (this.zoomHandler) this.zoomHandler.destroy();
        this.content.holder.innerHTML = "";
      }
    }]);
  }();
  function _callSuper$12(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct$12() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct$12() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct$12 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  var BaseAreaPlugin = /* @__PURE__ */ function(_Scope) {
    function BaseAreaPlugin2() {
      _classCallCheck(this, BaseAreaPlugin2);
      return _callSuper$12(this, BaseAreaPlugin2, arguments);
    }
    _inherits(BaseAreaPlugin2, _Scope);
    return _createClass(BaseAreaPlugin2);
  }(Scope);
  var ConnectionView = /* @__PURE__ */ _createClass(function ConnectionView2(events) {
    _classCallCheck(this, ConnectionView2);
    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.left = "0";
    this.element.style.top = "0";
    this.element.addEventListener("contextmenu", function(event) {
      return events.contextmenu(event);
    });
  });
  var ElementsHolder = /* @__PURE__ */ function() {
    function ElementsHolder2() {
      _classCallCheck(this, ElementsHolder2);
      _defineProperty(this, "views", /* @__PURE__ */ new WeakMap());
      _defineProperty(this, "viewsElements", /* @__PURE__ */ new Map());
    }
    return _createClass(ElementsHolder2, [{
      key: "set",
      value: function set(context) {
        var element = context.element, type = context.type, payload = context.payload;
        if (payload !== null && payload !== void 0 && payload.id) {
          this.views.set(element, context);
          this.viewsElements.set("".concat(type, "_").concat(payload.id), element);
        }
      }
    }, {
      key: "get",
      value: function get(type, id) {
        var element = this.viewsElements.get("".concat(type, "_").concat(id));
        return element && this.views.get(element);
      }
    }, {
      key: "delete",
      value: function _delete(element) {
        var _view$payload;
        var view = this.views.get(element);
        if (view && (_view$payload = view.payload) !== null && _view$payload !== void 0 && _view$payload.id) {
          this.views["delete"](element);
          this.viewsElements["delete"]("".concat(view.type, "_").concat(view.payload.id));
        }
      }
    }]);
  }();
  function ownKeys$3(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread$3(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$3(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys$3(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  var NodeView = /* @__PURE__ */ function() {
    function NodeView2(getZoom, events, guards) {
      var _this = this;
      _classCallCheck(this, NodeView2);
      _defineProperty(this, "translate", /* @__PURE__ */ function() {
        var _ref = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(x2, y) {
          var previous, translation;
          return import_regenerator2.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                previous = _objectSpread$3({}, _this.position);
                _context.next = 3;
                return _this.guards.translate({
                  previous,
                  position: {
                    x: x2,
                    y
                  }
                });
              case 3:
                translation = _context.sent;
                if (translation) {
                  _context.next = 6;
                  break;
                }
                return _context.abrupt("return", false);
              case 6:
                _this.position = _objectSpread$3({}, translation.data.position);
                _this.element.style.transform = "translate(".concat(_this.position.x, "px, ").concat(_this.position.y, "px)");
                _context.next = 10;
                return _this.events.translated({
                  position: _this.position,
                  previous
                });
              case 10:
                return _context.abrupt("return", true);
              case 11:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return function(_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
      _defineProperty(this, "resize", /* @__PURE__ */ function() {
        var _ref2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(width, height) {
          var size, el;
          return import_regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                size = {
                  width,
                  height
                };
                _context2.next = 3;
                return _this.guards.resize({
                  size
                });
              case 3:
                if (_context2.sent) {
                  _context2.next = 5;
                  break;
                }
                return _context2.abrupt("return", false);
              case 5:
                el = _this.element.querySelector("*:not(span):not([fragment])");
                if (!(!el || !(el instanceof HTMLElement))) {
                  _context2.next = 8;
                  break;
                }
                return _context2.abrupt("return", false);
              case 8:
                el.style.width = "".concat(width, "px");
                el.style.height = "".concat(height, "px");
                _context2.next = 12;
                return _this.events.resized({
                  size
                });
              case 12:
                return _context2.abrupt("return", true);
              case 13:
              case "end":
                return _context2.stop();
            }
          }, _callee2);
        }));
        return function(_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
      this.getZoom = getZoom;
      this.events = events;
      this.guards = guards;
      this.element = document.createElement("div");
      this.element.style.position = "absolute";
      this.position = {
        x: 0,
        y: 0
      };
      void this.translate(0, 0);
      this.element.addEventListener("contextmenu", function(event) {
        return _this.events.contextmenu(event);
      });
      this.dragHandler = new Drag();
      this.dragHandler.initialize(this.element, {
        getCurrentPosition: function getCurrentPosition() {
          return _this.position;
        },
        getZoom: function getZoom2() {
          return _this.getZoom();
        }
      }, {
        start: this.events.picked,
        translate: this.translate,
        drag: this.events.dragged
      });
    }
    return _createClass(NodeView2, [{
      key: "destroy",
      value: function destroy() {
        this.dragHandler.destroy();
      }
    }]);
  }();
  function getNodesRect(nodes, views) {
    return nodes.map(function(node2) {
      return {
        view: views.get(node2.id),
        node: node2
      };
    }).filter(function(item) {
      return item.view;
    }).map(function(_ref) {
      var view = _ref.view, node2 = _ref.node;
      var width = node2.width, height = node2.height;
      if (typeof width !== "undefined" && typeof height !== "undefined") {
        return {
          position: view.position,
          width,
          height
        };
      }
      return {
        position: view.position,
        width: view.element.clientWidth,
        height: view.element.clientHeight
      };
    });
  }
  function getBoundingBox(plugin, nodes) {
    var editor = plugin.parentScope(NodeEditor);
    var list = nodes.map(function(node2) {
      return _typeof(node2) === "object" ? node2 : editor.getNode(node2);
    });
    var rects = getNodesRect(list, plugin.nodeViews);
    return getBoundingBox$1(rects);
  }
  function simpleNodesOrder(base) {
    var area = base;
    area.addPipe(function(context) {
      if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
      if (context.type === "nodepicked") {
        var view = area.nodeViews.get(context.data.id);
        var content = area.area.content;
        if (view) {
          content.reorder(view.element, null);
        }
      }
      if (context.type === "connectioncreated") {
        var _view = area.connectionViews.get(context.data.id);
        var _content = area.area.content;
        if (_view) {
          _content.reorder(_view.element, _content.holder.firstChild);
        }
      }
      return context;
    });
  }
  function ownKeys$2(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread$2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$2(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys$2(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function restrictor(plugin, params) {
    var scaling = params !== null && params !== void 0 && params.scaling ? params.scaling === true ? {
      min: 0.1,
      max: 1
    } : params.scaling : false;
    var translation = params !== null && params !== void 0 && params.translation ? params.translation === true ? {
      left: 0,
      top: 0,
      right: 1e3,
      bottom: 1e3
    } : params.translation : false;
    function restrictZoom(zoom) {
      if (!scaling) throw new Error("scaling param isnt defined");
      var _ref = typeof scaling === "function" ? scaling() : scaling, min3 = _ref.min, max3 = _ref.max;
      if (zoom < min3) {
        return min3;
      } else if (zoom > max3) {
        return max3;
      }
      return zoom;
    }
    function restrictPosition(position2) {
      if (!translation) throw new Error("translation param isnt defined");
      var nextPosition = _objectSpread$2({}, position2);
      var _ref2 = typeof translation === "function" ? translation() : translation, left = _ref2.left, top = _ref2.top, right = _ref2.right, bottom = _ref2.bottom;
      if (nextPosition.x < left) {
        nextPosition.x = left;
      }
      if (nextPosition.x > right) {
        nextPosition.x = right;
      }
      if (nextPosition.y < top) {
        nextPosition.y = top;
      }
      if (nextPosition.y > bottom) {
        nextPosition.y = bottom;
      }
      return nextPosition;
    }
    plugin.addPipe(function(context) {
      if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
      if (scaling && context.type === "zoom") {
        return _objectSpread$2(_objectSpread$2({}, context), {}, {
          data: _objectSpread$2(_objectSpread$2({}, context.data), {}, {
            zoom: restrictZoom(context.data.zoom)
          })
        });
      }
      if (translation && context.type === "zoomed") {
        var position2 = restrictPosition(plugin.area.transform);
        void plugin.area.translate(position2.x, position2.y);
      }
      if (translation && context.type === "translate") {
        return _objectSpread$2(_objectSpread$2({}, context), {}, {
          data: _objectSpread$2(_objectSpread$2({}, context.data), {}, {
            position: restrictPosition(context.data.position)
          })
        });
      }
      return context;
    });
  }
  function accumulateOnCtrl() {
    var pressed = false;
    function keydown(e) {
      if (e.key === "Control" || e.key === "Meta") pressed = true;
    }
    function keyup(e) {
      if (e.key === "Control" || e.key === "Meta") pressed = false;
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    return {
      active: function active() {
        return pressed;
      },
      destroy: function destroy() {
        document.removeEventListener("keydown", keydown);
        document.removeEventListener("keyup", keyup);
      }
    };
  }
  var Selector = /* @__PURE__ */ function() {
    function Selector2() {
      _classCallCheck(this, Selector2);
      _defineProperty(this, "entities", /* @__PURE__ */ new Map());
      _defineProperty(this, "pickId", null);
    }
    return _createClass(Selector2, [{
      key: "isSelected",
      value: function isSelected(entity) {
        return this.entities.has("".concat(entity.label, "_").concat(entity.id));
      }
    }, {
      key: "add",
      value: function() {
        var _add = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(entity, accumulate) {
          return import_regenerator2.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                if (accumulate) {
                  _context.next = 3;
                  break;
                }
                _context.next = 3;
                return this.unselectAll();
              case 3:
                this.entities.set("".concat(entity.label, "_").concat(entity.id), entity);
              case 4:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function add(_x, _x2) {
          return _add.apply(this, arguments);
        }
        return add;
      }()
    }, {
      key: "remove",
      value: function() {
        var _remove = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(entity) {
          var id, item;
          return import_regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                id = "".concat(entity.label, "_").concat(entity.id);
                item = this.entities.get(id);
                if (!item) {
                  _context2.next = 6;
                  break;
                }
                this.entities["delete"](id);
                _context2.next = 6;
                return item.unselect();
              case 6:
              case "end":
                return _context2.stop();
            }
          }, _callee2, this);
        }));
        function remove(_x3) {
          return _remove.apply(this, arguments);
        }
        return remove;
      }()
    }, {
      key: "unselectAll",
      value: function() {
        var _unselectAll = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee3() {
          var _this = this;
          return import_regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return Promise.all(_toConsumableArray(Array.from(this.entities.values())).map(function(item) {
                  return _this.remove(item);
                }));
              case 2:
              case "end":
                return _context3.stop();
            }
          }, _callee3, this);
        }));
        function unselectAll() {
          return _unselectAll.apply(this, arguments);
        }
        return unselectAll;
      }()
    }, {
      key: "translate",
      value: function() {
        var _translate = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee4(dx, dy) {
          var _this2 = this;
          return import_regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.all(Array.from(this.entities.values()).map(function(item) {
                  return !_this2.isPicked(item) && item.translate(dx, dy);
                }));
              case 2:
              case "end":
                return _context4.stop();
            }
          }, _callee4, this);
        }));
        function translate(_x4, _x5) {
          return _translate.apply(this, arguments);
        }
        return translate;
      }()
    }, {
      key: "pick",
      value: function pick(entity) {
        this.pickId = "".concat(entity.label, "_").concat(entity.id);
      }
    }, {
      key: "release",
      value: function release() {
        this.pickId = null;
      }
    }, {
      key: "isPicked",
      value: function isPicked(entity) {
        return this.pickId === "".concat(entity.label, "_").concat(entity.id);
      }
    }]);
  }();
  function selector() {
    return new Selector();
  }
  function selectableNodes(base, core, options) {
    var editor = null;
    var area = base;
    var getEditor = function getEditor2() {
      return editor || (editor = area.parentScope(NodeEditor));
    };
    var twitch = 0;
    function selectNode(node2) {
      if (!node2.selected) {
        node2.selected = true;
        void area.update("node", node2.id);
      }
    }
    function unselectNode(node2) {
      if (node2.selected) {
        node2.selected = false;
        void area.update("node", node2.id);
      }
    }
    function add(_x6, _x7) {
      return _add2.apply(this, arguments);
    }
    function _add2() {
      _add2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee7(nodeId, accumulate) {
        var node2;
        return import_regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              node2 = getEditor().getNode(nodeId);
              if (node2) {
                _context7.next = 3;
                break;
              }
              return _context7.abrupt("return");
            case 3:
              _context7.next = 5;
              return core.add({
                label: "node",
                id: node2.id,
                translate: function translate(dx, dy) {
                  return _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee6() {
                    var view, current;
                    return import_regenerator2.default.wrap(function _callee6$(_context6) {
                      while (1) switch (_context6.prev = _context6.next) {
                        case 0:
                          view = area.nodeViews.get(node2.id);
                          current = view === null || view === void 0 ? void 0 : view.position;
                          if (!current) {
                            _context6.next = 5;
                            break;
                          }
                          _context6.next = 5;
                          return view.translate(current.x + dx, current.y + dy);
                        case 5:
                        case "end":
                          return _context6.stop();
                      }
                    }, _callee6);
                  }))();
                },
                unselect: function unselect() {
                  unselectNode(node2);
                }
              }, accumulate);
            case 5:
              selectNode(node2);
            case 6:
            case "end":
              return _context7.stop();
          }
        }, _callee7);
      }));
      return _add2.apply(this, arguments);
    }
    function remove(_x8) {
      return _remove2.apply(this, arguments);
    }
    function _remove2() {
      _remove2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee8(nodeId) {
        return import_regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return core.remove({
                id: nodeId,
                label: "node"
              });
            case 2:
            case "end":
              return _context8.stop();
          }
        }, _callee8);
      }));
      return _remove2.apply(this, arguments);
    }
    area.addPipe(/* @__PURE__ */ function() {
      var _ref = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee5(context) {
        var pickedId, accumulate, _context$data, id, position2, previous, _dx, _dy;
        return import_regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              if (!(!context || _typeof(context) !== "object" || !("type" in context))) {
                _context5.next = 2;
                break;
              }
              return _context5.abrupt("return", context);
            case 2:
              if (!(context.type === "nodepicked")) {
                _context5.next = 11;
                break;
              }
              pickedId = context.data.id;
              accumulate = options.accumulating.active();
              core.pick({
                id: pickedId,
                label: "node"
              });
              twitch = null;
              _context5.next = 9;
              return add(pickedId, accumulate);
            case 9:
              _context5.next = 33;
              break;
            case 11:
              if (!(context.type === "nodetranslated")) {
                _context5.next = 20;
                break;
              }
              _context$data = context.data, id = _context$data.id, position2 = _context$data.position, previous = _context$data.previous;
              _dx = position2.x - previous.x;
              _dy = position2.y - previous.y;
              if (!core.isPicked({
                id,
                label: "node"
              })) {
                _context5.next = 18;
                break;
              }
              _context5.next = 18;
              return core.translate(_dx, _dy);
            case 18:
              _context5.next = 33;
              break;
            case 20:
              if (!(context.type === "pointerdown")) {
                _context5.next = 24;
                break;
              }
              twitch = 0;
              _context5.next = 33;
              break;
            case 24:
              if (!(context.type === "pointermove")) {
                _context5.next = 28;
                break;
              }
              if (twitch !== null) twitch++;
              _context5.next = 33;
              break;
            case 28:
              if (!(context.type === "pointerup")) {
                _context5.next = 33;
                break;
              }
              if (!(twitch !== null && twitch < 4)) {
                _context5.next = 32;
                break;
              }
              _context5.next = 32;
              return core.unselectAll();
            case 32:
              twitch = null;
            case 33:
              return _context5.abrupt("return", context);
            case 34:
            case "end":
              return _context5.stop();
          }
        }, _callee5);
      }));
      return function(_x9) {
        return _ref.apply(this, arguments);
      };
    }());
    return {
      select: add,
      unselect: remove
    };
  }
  function showInputControl(area, visible) {
    var editor = null;
    var getEditor = function getEditor2() {
      return editor || (editor = area.parentScope(NodeEditor));
    };
    function updateInputControlVisibility(target, targetInput) {
      var node2 = getEditor().getNode(target);
      if (!node2) return;
      var input = node2.inputs[targetInput];
      if (!input) throw new Error("cannot find input");
      var previous = input.showControl;
      var connections = getEditor().getConnections();
      var hasAnyConnection = Boolean(connections.find(function(connection) {
        return connection.target === target && connection.targetInput === targetInput;
      }));
      input.showControl = visible ? visible({
        hasAnyConnection,
        input
      }) : !hasAnyConnection;
      if (input.showControl !== previous) {
        void area.update("node", node2.id);
      }
    }
    area.addPipe(function(context) {
      if (context.type === "connectioncreated" || context.type === "connectionremoved") {
        updateInputControlVisibility(context.data.target, context.data.targetInput);
      }
      return context;
    });
  }
  function ownKeys$1(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread$1(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$1(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys$1(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function snapGrid(base, params) {
    var area = base;
    var size = typeof (params === null || params === void 0 ? void 0 : params.size) === "undefined" ? 16 : params.size;
    var dynamic = typeof (params === null || params === void 0 ? void 0 : params.dynamic) === "undefined" ? true : params.dynamic;
    function snap(value) {
      return Math.round(value / size) * size;
    }
    area.addPipe(function(context) {
      if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
      if (dynamic && context.type === "nodetranslate") {
        var position2 = context.data.position;
        var x2 = snap(position2.x);
        var y = snap(position2.y);
        return _objectSpread$1(_objectSpread$1({}, context), {}, {
          data: _objectSpread$1(_objectSpread$1({}, context.data), {}, {
            position: {
              x: x2,
              y
            }
          })
        });
      }
      if (!dynamic && context.type === "nodedragged") {
        var view = area.nodeViews.get(context.data.id);
        if (view) {
          var _view$position = view.position, _x = _view$position.x, _y = _view$position.y;
          void view.translate(snap(_x), snap(_y));
        }
      }
      return context;
    });
  }
  function zoomAt(_x, _x2, _x3) {
    return _zoomAt.apply(this, arguments);
  }
  function _zoomAt() {
    _zoomAt = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(plugin, nodes, params) {
      var _ref, _ref$scale, scale, editor, list, rects, boundingBox, _ref2, w2, h2, kw, kh, k2;
      return import_regenerator2.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _ref = params || {}, _ref$scale = _ref.scale, scale = _ref$scale === void 0 ? 0.9 : _ref$scale;
            editor = plugin.parentScope(NodeEditor);
            list = nodes.map(function(node2) {
              return _typeof(node2) === "object" ? node2 : editor.getNode(node2);
            });
            rects = getNodesRect(list, plugin.nodeViews);
            boundingBox = getBoundingBox$1(rects);
            _ref2 = [plugin.container.clientWidth, plugin.container.clientHeight], w2 = _ref2[0], h2 = _ref2[1];
            kw = w2 / boundingBox.width, kh = h2 / boundingBox.height;
            k2 = Math.min(kh * scale, kw * scale, 1);
            plugin.area.transform.x = w2 / 2 - boundingBox.center.x * k2;
            plugin.area.transform.y = h2 / 2 - boundingBox.center.y * k2;
            _context.next = 12;
            return plugin.area.zoom(k2, 0, 0);
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _zoomAt.apply(this, arguments);
  }
  var index = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    getBoundingBox,
    simpleNodesOrder,
    restrictor,
    accumulateOnCtrl,
    selectableNodes,
    Selector,
    selector,
    showInputControl,
    snapGrid,
    zoomAt
  });
  function ownKeys(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function _callSuper2(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct2() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct2() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct2 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  var AreaPlugin = /* @__PURE__ */ function(_BaseAreaPlugin) {
    function AreaPlugin2(container) {
      var _this;
      _classCallCheck(this, AreaPlugin2);
      _this = _callSuper2(this, AreaPlugin2, ["area"]);
      _defineProperty(_this, "nodeViews", /* @__PURE__ */ new Map());
      _defineProperty(_this, "connectionViews", /* @__PURE__ */ new Map());
      _defineProperty(_this, "elements", new ElementsHolder());
      _defineProperty(_this, "onContextMenu", function(event) {
        void _this.emit({
          type: "contextmenu",
          data: {
            event,
            context: "root"
          }
        });
      });
      _this.container = container;
      container.style.overflow = "hidden";
      container.addEventListener("contextmenu", _this.onContextMenu);
      _this.addPipe(function(context) {
        if (!context || !(_typeof(context) === "object" && "type" in context)) return context;
        if (context.type === "nodecreated") {
          _this.addNodeView(context.data);
        }
        if (context.type === "noderemoved") {
          _this.removeNodeView(context.data.id);
        }
        if (context.type === "connectioncreated") {
          _this.addConnectionView(context.data);
        }
        if (context.type === "connectionremoved") {
          _this.removeConnectionView(context.data.id);
        }
        if (context.type === "render") {
          _this.elements.set(context.data);
        }
        if (context.type === "unmount") {
          _this.elements["delete"](context.data.element);
        }
        return context;
      });
      _this.area = new Area(container, {
        zoomed: function zoomed(params) {
          return _this.emit({
            type: "zoomed",
            data: params
          });
        },
        pointerDown: function pointerDown(position2, event) {
          return void _this.emit({
            type: "pointerdown",
            data: {
              position: position2,
              event
            }
          });
        },
        pointerMove: function pointerMove(position2, event) {
          return void _this.emit({
            type: "pointermove",
            data: {
              position: position2,
              event
            }
          });
        },
        pointerUp: function pointerUp(position2, event) {
          return void _this.emit({
            type: "pointerup",
            data: {
              position: position2,
              event
            }
          });
        },
        resize: function resize(event) {
          return void _this.emit({
            type: "resized",
            data: {
              event
            }
          });
        },
        translated: function translated(params) {
          return _this.emit({
            type: "translated",
            data: params
          });
        },
        reordered: function reordered(element) {
          return _this.emit({
            type: "reordered",
            data: {
              element
            }
          });
        }
      }, {
        translate: function translate(params) {
          return _this.emit({
            type: "translate",
            data: params
          });
        },
        zoom: function zoom(params) {
          return _this.emit({
            type: "zoom",
            data: params
          });
        }
      });
      return _this;
    }
    _inherits(AreaPlugin2, _BaseAreaPlugin);
    return _createClass(AreaPlugin2, [{
      key: "addNodeView",
      value: function addNodeView(node2) {
        var _this2 = this;
        var id = node2.id;
        var view = new NodeView(function() {
          return _this2.area.transform.k;
        }, {
          picked: function picked() {
            return void _this2.emit({
              type: "nodepicked",
              data: {
                id
              }
            });
          },
          translated: function translated(data) {
            return _this2.emit({
              type: "nodetranslated",
              data: _objectSpread({
                id
              }, data)
            });
          },
          dragged: function dragged() {
            return void _this2.emit({
              type: "nodedragged",
              data: node2
            });
          },
          contextmenu: function contextmenu(event) {
            return void _this2.emit({
              type: "contextmenu",
              data: {
                event,
                context: node2
              }
            });
          },
          resized: function resized(_ref) {
            var size = _ref.size;
            return _this2.emit({
              type: "noderesized",
              data: {
                id: node2.id,
                size
              }
            });
          }
        }, {
          translate: function translate(data) {
            return _this2.emit({
              type: "nodetranslate",
              data: _objectSpread({
                id
              }, data)
            });
          },
          resize: function resize(_ref2) {
            var size = _ref2.size;
            return _this2.emit({
              type: "noderesize",
              data: {
                id: node2.id,
                size
              }
            });
          }
        });
        this.nodeViews.set(id, view);
        this.area.content.add(view.element);
        void this.emit({
          type: "render",
          data: {
            element: view.element,
            type: "node",
            payload: node2
          }
        });
        return view;
      }
    }, {
      key: "removeNodeView",
      value: function removeNodeView(id) {
        var view = this.nodeViews.get(id);
        if (view) {
          void this.emit({
            type: "unmount",
            data: {
              element: view.element
            }
          });
          this.nodeViews["delete"](id);
          this.area.content.remove(view.element);
        }
      }
    }, {
      key: "addConnectionView",
      value: function addConnectionView(connection) {
        var _this3 = this;
        var view = new ConnectionView({
          contextmenu: function contextmenu(event) {
            return void _this3.emit({
              type: "contextmenu",
              data: {
                event,
                context: connection
              }
            });
          }
        });
        this.connectionViews.set(connection.id, view);
        this.area.content.add(view.element);
        void this.emit({
          type: "render",
          data: {
            element: view.element,
            type: "connection",
            payload: connection
          }
        });
        return view;
      }
    }, {
      key: "removeConnectionView",
      value: function removeConnectionView(id) {
        var view = this.connectionViews.get(id);
        if (view) {
          void this.emit({
            type: "unmount",
            data: {
              element: view.element
            }
          });
          this.connectionViews["delete"](id);
          this.area.content.remove(view.element);
        }
      }
      /**
       * Force update rendered element by id (node, connection, etc.)
       * @param type Element type
       * @param id Element id
       * @emits render
       */
    }, {
      key: "update",
      value: function() {
        var _update = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee(type, id) {
          var data;
          return import_regenerator2.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                data = this.elements.get(type, id);
                if (!data) {
                  _context.next = 4;
                  break;
                }
                _context.next = 4;
                return this.emit({
                  type: "render",
                  data
                });
              case 4:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function update(_x, _x2) {
          return _update.apply(this, arguments);
        }
        return update;
      }()
    }, {
      key: "resize",
      value: function() {
        var _resize = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee2(id, width, height) {
          var view;
          return import_regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                view = this.nodeViews.get(id);
                if (!view) {
                  _context2.next = 5;
                  break;
                }
                _context2.next = 4;
                return view.resize(width, height);
              case 4:
                return _context2.abrupt("return", _context2.sent);
              case 5:
              case "end":
                return _context2.stop();
            }
          }, _callee2, this);
        }));
        function resize(_x3, _x4, _x5) {
          return _resize.apply(this, arguments);
        }
        return resize;
      }()
    }, {
      key: "translate",
      value: function() {
        var _translate = _asyncToGenerator(/* @__PURE__ */ import_regenerator2.default.mark(function _callee3(id, _ref3) {
          var x2, y, view;
          return import_regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                x2 = _ref3.x, y = _ref3.y;
                view = this.nodeViews.get(id);
                if (!view) {
                  _context3.next = 6;
                  break;
                }
                _context3.next = 5;
                return view.translate(x2, y);
              case 5:
                return _context3.abrupt("return", _context3.sent);
              case 6:
              case "end":
                return _context3.stop();
            }
          }, _callee3, this);
        }));
        function translate(_x6, _x7) {
          return _translate.apply(this, arguments);
        }
        return translate;
      }()
    }, {
      key: "destroy",
      value: function destroy() {
        var _this4 = this;
        this.container.removeEventListener("contextmenu", this.onContextMenu);
        Array.from(this.connectionViews.keys()).forEach(function(id) {
          return _this4.removeConnectionView(id);
        });
        Array.from(this.nodeViews.keys()).forEach(function(id) {
          return _this4.removeNodeView(id);
        });
        this.area.destroy();
      }
    }]);
  }(BaseAreaPlugin);

  // node_modules/@babel/runtime/helpers/esm/superPropBase.js
  function _superPropBase(t2, o) {
    for (; !{}.hasOwnProperty.call(t2, o) && null !== (t2 = _getPrototypeOf(t2)); ) ;
    return t2;
  }

  // node_modules/@babel/runtime/helpers/esm/get.js
  function _get() {
    return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function(e, t2, r2) {
      var p2 = _superPropBase(e, t2);
      if (p2) {
        var n2 = Object.getOwnPropertyDescriptor(p2, t2);
        return n2.get ? n2.get.call(arguments.length < 3 ? e : r2) : n2.value;
      }
    }, _get.apply(null, arguments);
  }

  // node_modules/rete-connection-plugin/rete-connection-plugin.esm.js
  var import_regenerator3 = __toESM(require_regenerator2());

  // node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
  function _arrayWithHoles(r2) {
    if (Array.isArray(r2)) return r2;
  }

  // node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
  function _iterableToArrayLimit(r2, l2) {
    var t2 = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t2) {
      var e, n2, i2, u2, a2 = [], f2 = true, o = false;
      try {
        if (i2 = (t2 = t2.call(r2)).next, 0 === l2) {
          if (Object(t2) !== t2) return;
          f2 = false;
        } else for (; !(f2 = (e = i2.call(t2)).done) && (a2.push(e.value), a2.length !== l2); f2 = true) ;
      } catch (r3) {
        o = true, n2 = r3;
      } finally {
        try {
          if (!f2 && null != t2["return"] && (u2 = t2["return"](), Object(u2) !== u2)) return;
        } finally {
          if (o) throw n2;
        }
      }
      return a2;
    }
  }

  // node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // node_modules/@babel/runtime/helpers/esm/slicedToArray.js
  function _slicedToArray(r2, e) {
    return _arrayWithHoles(r2) || _iterableToArrayLimit(r2, e) || _unsupportedIterableToArray2(r2, e) || _nonIterableRest();
  }

  // node_modules/rete-connection-plugin/rete-connection-plugin.esm.js
  function ownKeys2(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys2(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys2(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function createPseudoconnection(extra) {
    var element = null;
    var id = null;
    function unmount(areaPlugin) {
      if (id) {
        areaPlugin.removeConnectionView(id);
      }
      element = null;
      id = null;
    }
    function mount(areaPlugin) {
      unmount(areaPlugin);
      id = "pseudo_".concat(getUID());
    }
    return {
      isMounted: function isMounted() {
        return Boolean(id);
      },
      mount,
      render: function render2(areaPlugin, _ref, data) {
        var x2 = _ref.x, y = _ref.y;
        var isOutput = data.side === "output";
        var pointer = {
          x: x2 + (isOutput ? -3 : 3),
          y
        };
        if (!id) throw new Error("pseudo connection id wasn't generated");
        var payload = isOutput ? _objectSpread2({
          id,
          source: data.nodeId,
          sourceOutput: data.key,
          target: "",
          targetInput: ""
        }, extra !== null && extra !== void 0 ? extra : {}) : _objectSpread2({
          id,
          target: data.nodeId,
          targetInput: data.key,
          source: "",
          sourceOutput: ""
        }, extra !== null && extra !== void 0 ? extra : {});
        if (!element) {
          var view = areaPlugin.addConnectionView(payload);
          element = view.element;
        }
        if (!element) return;
        void areaPlugin.emit({
          type: "render",
          data: _objectSpread2({
            element,
            type: "connection",
            payload
          }, isOutput ? {
            end: pointer
          } : {
            start: pointer
          })
        });
      },
      unmount
    };
  }
  function _createForOfIteratorHelper$12(r2, e) {
    var t2 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (!t2) {
      if (Array.isArray(r2) || (t2 = _unsupportedIterableToArray$12(r2)) || e && r2 && "number" == typeof r2.length) {
        t2 && (r2 = t2);
        var _n = 0, F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          return _n >= r2.length ? { done: true } : { done: false, value: r2[_n++] };
        }, e: function e2(r3) {
          throw r3;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a2 = true, u2 = false;
    return { s: function s() {
      t2 = t2.call(r2);
    }, n: function n2() {
      var r3 = t2.next();
      return a2 = r3.done, r3;
    }, e: function e2(r3) {
      u2 = true, o = r3;
    }, f: function f2() {
      try {
        a2 || null == t2["return"] || t2["return"]();
      } finally {
        if (u2) throw o;
      }
    } };
  }
  function _unsupportedIterableToArray$12(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray$12(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray$12(r2, a2) : void 0;
    }
  }
  function _arrayLikeToArray$12(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }
  function findSocket(socketsCache, elements) {
    var _iterator = _createForOfIteratorHelper$12(elements), _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        var element = _step.value;
        var found = socketsCache.get(element);
        if (found) {
          return found;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  function elementsFromPoint(x2, y) {
    var _elements$;
    var root = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : document;
    var elements = root.elementsFromPoint(x2, y);
    var shadowRoot = (_elements$ = elements[0]) === null || _elements$ === void 0 ? void 0 : _elements$.shadowRoot;
    if (shadowRoot && shadowRoot !== root) {
      elements.unshift.apply(elements, _toConsumableArray(elementsFromPoint(x2, y, shadowRoot)));
    }
    return elements;
  }
  var State = /* @__PURE__ */ function() {
    function State2() {
      _classCallCheck(this, State2);
    }
    return _createClass(State2, [{
      key: "setContext",
      value: function setContext(context) {
        this.context = context;
      }
    }]);
  }();
  function getSourceTarget(initial, socket2) {
    var forward = initial.side === "output" && socket2.side === "input";
    var backward = initial.side === "input" && socket2.side === "output";
    var _ref = forward ? [initial, socket2] : backward ? [socket2, initial] : [], _ref2 = _slicedToArray(_ref, 2), source = _ref2[0], target = _ref2[1];
    if (source && target) return [source, target];
  }
  function canMakeConnection(initial, socket2) {
    return Boolean(getSourceTarget(initial, socket2));
  }
  function makeConnection(initial, socket2, context) {
    var _ref3 = getSourceTarget(initial, socket2) || [null, null], _ref4 = _slicedToArray(_ref3, 2), source = _ref4[0], target = _ref4[1];
    if (source && target) {
      void context.editor.addConnection({
        id: getUID(),
        source: source.nodeId,
        sourceOutput: source.key,
        target: target.nodeId,
        targetInput: target.key
      });
      return true;
    }
  }
  function findPort(socket2, editor) {
    var node2 = editor.getNode(socket2.nodeId);
    if (!node2) throw new Error("cannot find node");
    var list = socket2.side === "input" ? node2.inputs : node2.outputs;
    return list[socket2.key];
  }
  function findConnections(socket2, editor) {
    var nodeId = socket2.nodeId, side = socket2.side, key = socket2.key;
    return editor.getConnections().filter(function(connection) {
      if (side === "input") {
        return connection.target === nodeId && connection.targetInput === key;
      }
      if (side === "output") {
        return connection.source === nodeId && connection.sourceOutput === key;
      }
    });
  }
  function syncConnections(sockets, editor) {
    var connections = sockets.map(function(socket2) {
      var port = findPort(socket2, editor);
      var multiple = port === null || port === void 0 ? void 0 : port.multipleConnections;
      if (multiple) return [];
      return findConnections(socket2, editor);
    }).flat();
    return {
      commit: function commit() {
        var uniqueIds = Array.from(new Set(connections.map(function(_ref) {
          var id = _ref.id;
          return id;
        })));
        uniqueIds.forEach(function(id) {
          return void editor.removeConnection(id);
        });
      }
    };
  }
  function _callSuper$13(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct$13() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct$13() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct$13 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  var Picked = /* @__PURE__ */ function(_State) {
    function Picked2(initial, params) {
      var _this;
      _classCallCheck(this, Picked2);
      _this = _callSuper$13(this, Picked2);
      _this.initial = initial;
      _this.params = params;
      return _this;
    }
    _inherits(Picked2, _State);
    return _createClass(Picked2, [{
      key: "pick",
      value: function() {
        var _pick = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee(_ref, context) {
          var socket2, created;
          return import_regenerator3.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                socket2 = _ref.socket;
                if (this.params.canMakeConnection(this.initial, socket2)) {
                  syncConnections([this.initial, socket2], context.editor).commit();
                  created = this.params.makeConnection(this.initial, socket2, context);
                  this.drop(context, created ? socket2 : null, created);
                }
              case 2:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function pick(_x, _x2) {
          return _pick.apply(this, arguments);
        }
        return pick;
      }()
    }, {
      key: "drop",
      value: function drop(context) {
        var socket2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        var created = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        if (this.initial) {
          void context.scope.emit({
            type: "connectiondrop",
            data: {
              initial: this.initial,
              socket: socket2,
              created
            }
          });
        }
        this.context.switchTo(new Idle(this.params));
      }
    }]);
  }(State);
  var PickedExisting = /* @__PURE__ */ function(_State2) {
    function PickedExisting2(connection, params, context) {
      var _this2;
      _classCallCheck(this, PickedExisting2);
      _this2 = _callSuper$13(this, PickedExisting2);
      _this2.connection = connection;
      _this2.params = params;
      var outputSocket = Array.from(context.socketsCache.values()).find(function(data) {
        return data.nodeId === _this2.connection.source && data.side === "output" && data.key === _this2.connection.sourceOutput;
      });
      if (!outputSocket) throw new Error("cannot find output socket");
      _this2.outputSocket = outputSocket;
      return _this2;
    }
    _inherits(PickedExisting2, _State2);
    return _createClass(PickedExisting2, [{
      key: "init",
      value: function() {
        var _init = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee2(context) {
          var _this3 = this;
          return import_regenerator3.default.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                void context.scope.emit({
                  type: "connectionpick",
                  data: {
                    socket: this.outputSocket
                  }
                }).then(function(response) {
                  if (response) {
                    void context.editor.removeConnection(_this3.connection.id);
                    _this3.initial = _this3.outputSocket;
                  } else {
                    _this3.drop(context);
                  }
                });
              case 1:
              case "end":
                return _context2.stop();
            }
          }, _callee2, this);
        }));
        function init(_x3) {
          return _init.apply(this, arguments);
        }
        return init;
      }()
    }, {
      key: "pick",
      value: function() {
        var _pick2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee3(_ref2, context) {
          var socket2, event, created, droppedSocket, _created, _droppedSocket;
          return import_regenerator3.default.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                socket2 = _ref2.socket, event = _ref2.event;
                if (this.initial && !(socket2.side === "input" && this.connection.target === socket2.nodeId && this.connection.targetInput === socket2.key)) {
                  if (this.params.canMakeConnection(this.initial, socket2)) {
                    syncConnections([this.initial, socket2], context.editor).commit();
                    created = this.params.makeConnection(this.initial, socket2, context);
                    droppedSocket = created ? socket2 : null;
                    this.drop(context, droppedSocket, created);
                  }
                } else if (event === "down") {
                  if (this.initial) {
                    syncConnections([this.initial, socket2], context.editor).commit();
                    _created = this.params.makeConnection(this.initial, socket2, context);
                    _droppedSocket = _created ? null : socket2;
                    this.drop(context, _droppedSocket, _created);
                  }
                }
              case 2:
              case "end":
                return _context3.stop();
            }
          }, _callee3, this);
        }));
        function pick(_x4, _x5) {
          return _pick2.apply(this, arguments);
        }
        return pick;
      }()
    }, {
      key: "drop",
      value: function drop(context) {
        var socket2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        var created = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        if (this.initial) {
          void context.scope.emit({
            type: "connectiondrop",
            data: {
              initial: this.initial,
              socket: socket2,
              created
            }
          });
        }
        this.context.switchTo(new Idle(this.params));
      }
    }]);
  }(State);
  var Idle = /* @__PURE__ */ function(_State3) {
    function Idle2(params) {
      var _this4;
      _classCallCheck(this, Idle2);
      _this4 = _callSuper$13(this, Idle2);
      _this4.params = params;
      return _this4;
    }
    _inherits(Idle2, _State3);
    return _createClass(Idle2, [{
      key: "pick",
      value: function() {
        var _pick3 = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee4(_ref3, context) {
          var socket2, event, _connection, state;
          return import_regenerator3.default.wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                socket2 = _ref3.socket, event = _ref3.event;
                if (!(event !== "down")) {
                  _context4.next = 3;
                  break;
                }
                return _context4.abrupt("return");
              case 3:
                if (!(socket2.side === "input")) {
                  _context4.next = 11;
                  break;
                }
                _connection = context.editor.getConnections().find(function(item) {
                  return item.target === socket2.nodeId && item.targetInput === socket2.key;
                });
                if (!_connection) {
                  _context4.next = 11;
                  break;
                }
                state = new PickedExisting(_connection, this.params, context);
                _context4.next = 9;
                return state.init(context);
              case 9:
                this.context.switchTo(state);
                return _context4.abrupt("return");
              case 11:
                _context4.next = 13;
                return context.scope.emit({
                  type: "connectionpick",
                  data: {
                    socket: socket2
                  }
                });
              case 13:
                if (!_context4.sent) {
                  _context4.next = 17;
                  break;
                }
                this.context.switchTo(new Picked(socket2, this.params));
                _context4.next = 18;
                break;
              case 17:
                this.drop(context);
              case 18:
              case "end":
                return _context4.stop();
            }
          }, _callee4, this);
        }));
        function pick(_x6, _x7) {
          return _pick3.apply(this, arguments);
        }
        return pick;
      }()
    }, {
      key: "drop",
      value: function drop(context) {
        var socket2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        var created = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        if (this.initial) {
          void context.scope.emit({
            type: "connectiondrop",
            data: {
              initial: this.initial,
              socket: socket2,
              created
            }
          });
        }
        delete this.initial;
      }
    }]);
  }(State);
  var ClassicFlow = /* @__PURE__ */ function() {
    function ClassicFlow2(params) {
      _classCallCheck(this, ClassicFlow2);
      var canMakeConnection$1 = (params === null || params === void 0 ? void 0 : params.canMakeConnection) || canMakeConnection;
      var makeConnection$1 = (params === null || params === void 0 ? void 0 : params.makeConnection) || makeConnection;
      this.switchTo(new Idle({
        canMakeConnection: canMakeConnection$1,
        makeConnection: makeConnection$1
      }));
    }
    return _createClass(ClassicFlow2, [{
      key: "pick",
      value: function() {
        var _pick4 = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee5(params, context) {
          return import_regenerator3.default.wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.currentState.pick(params, context);
              case 2:
              case "end":
                return _context5.stop();
            }
          }, _callee5, this);
        }));
        function pick(_x8, _x9) {
          return _pick4.apply(this, arguments);
        }
        return pick;
      }()
    }, {
      key: "getPickedSocket",
      value: function getPickedSocket() {
        return this.currentState.initial;
      }
    }, {
      key: "switchTo",
      value: function switchTo(state) {
        state.setContext(this);
        this.currentState = state;
      }
    }, {
      key: "drop",
      value: function drop(context) {
        this.currentState.drop(context);
      }
    }]);
  }();
  function setup() {
    return function() {
      return new ClassicFlow();
    };
  }
  var classic2 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    setup
  });
  var index2 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    classic: classic2
  });
  function _createForOfIteratorHelper2(r2, e) {
    var t2 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (!t2) {
      if (Array.isArray(r2) || (t2 = _unsupportedIterableToArray3(r2)) || e && r2 && "number" == typeof r2.length) {
        t2 && (r2 = t2);
        var _n = 0, F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          return _n >= r2.length ? { done: true } : { done: false, value: r2[_n++] };
        }, e: function e2(r3) {
          throw r3;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a2 = true, u2 = false;
    return { s: function s() {
      t2 = t2.call(r2);
    }, n: function n2() {
      var r3 = t2.next();
      return a2 = r3.done, r3;
    }, e: function e2(r3) {
      u2 = true, o = r3;
    }, f: function f2() {
      try {
        a2 || null == t2["return"] || t2["return"]();
      } finally {
        if (u2) throw o;
      }
    } };
  }
  function _unsupportedIterableToArray3(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray3(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray3(r2, a2) : void 0;
    }
  }
  function _arrayLikeToArray3(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }
  function _callSuper3(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct3() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct3() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct3 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  function _superPropGet(t2, e, o, r2) {
    var p2 = _get(_getPrototypeOf(1 & r2 ? t2.prototype : t2), e, o);
    return 2 & r2 && "function" == typeof p2 ? function(t3) {
      return p2.apply(o, t3);
    } : p2;
  }
  var ConnectionPlugin = /* @__PURE__ */ function(_Scope) {
    function ConnectionPlugin2() {
      var _this;
      _classCallCheck(this, ConnectionPlugin2);
      _this = _callSuper3(this, ConnectionPlugin2, ["connection"]);
      _defineProperty(_this, "presets", []);
      _defineProperty(_this, "currentFlow", null);
      _defineProperty(_this, "preudoconnection", createPseudoconnection({
        isPseudo: true
      }));
      _defineProperty(_this, "socketsCache", /* @__PURE__ */ new Map());
      return _this;
    }
    _inherits(ConnectionPlugin2, _Scope);
    return _createClass(ConnectionPlugin2, [{
      key: "addPreset",
      value: function addPreset(preset) {
        this.presets.push(preset);
      }
    }, {
      key: "findPreset",
      value: function findPreset(data) {
        var _iterator = _createForOfIteratorHelper2(this.presets), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var preset = _step.value;
            var flow = preset(data);
            if (flow) return flow;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return null;
      }
    }, {
      key: "update",
      value: function update() {
        if (!this.currentFlow) return;
        var socket2 = this.currentFlow.getPickedSocket();
        if (socket2) {
          this.preudoconnection.render(this.areaPlugin, this.areaPlugin.area.pointer, socket2);
        }
      }
      /**
       * Drop pseudo-connection if exists
       * @emits connectiondrop
       */
    }, {
      key: "drop",
      value: function drop() {
        var flowContext = {
          editor: this.editor,
          scope: this,
          socketsCache: this.socketsCache
        };
        if (this.currentFlow) {
          this.currentFlow.drop(flowContext);
          this.preudoconnection.unmount(this.areaPlugin);
          this.currentFlow = null;
        }
      }
      // eslint-disable-next-line max-statements
    }, {
      key: "pick",
      value: function() {
        var _pick = _asyncToGenerator(/* @__PURE__ */ import_regenerator3.default.mark(function _callee(event, type) {
          var flowContext, pointedElements, pickedSocket;
          return import_regenerator3.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                flowContext = {
                  editor: this.editor,
                  scope: this,
                  socketsCache: this.socketsCache
                };
                pointedElements = elementsFromPoint(event.clientX, event.clientY);
                pickedSocket = findSocket(this.socketsCache, pointedElements);
                if (!pickedSocket) {
                  _context.next = 13;
                  break;
                }
                event.preventDefault();
                event.stopPropagation();
                this.currentFlow = this.currentFlow || this.findPreset(pickedSocket);
                if (!this.currentFlow) {
                  _context.next = 11;
                  break;
                }
                _context.next = 10;
                return this.currentFlow.pick({
                  socket: pickedSocket,
                  event: type
                }, flowContext);
              case 10:
                this.preudoconnection.mount(this.areaPlugin);
              case 11:
                _context.next = 14;
                break;
              case 13:
                if (this.currentFlow) {
                  this.currentFlow.drop(flowContext);
                }
              case 14:
                if (this.currentFlow && !this.currentFlow.getPickedSocket()) {
                  this.preudoconnection.unmount(this.areaPlugin);
                  this.currentFlow = null;
                }
                this.update();
              case 16:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function pick(_x, _x2) {
          return _pick.apply(this, arguments);
        }
        return pick;
      }()
    }, {
      key: "setParent",
      value: function setParent(scope) {
        var _this2 = this;
        _superPropGet(ConnectionPlugin2, "setParent", this, 3)([scope]);
        this.areaPlugin = this.parentScope(BaseAreaPlugin);
        this.editor = this.areaPlugin.parentScope(NodeEditor);
        var pointerdownSocket = function pointerdownSocket2(e) {
          void _this2.pick(e, "down");
        };
        this.addPipe(function(context) {
          if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
          if (context.type === "pointermove") {
            _this2.update();
          } else if (context.type === "pointerup") {
            void _this2.pick(context.data.event, "up");
          } else if (context.type === "render") {
            if (context.data.type === "socket") {
              var element = context.data.element;
              element.addEventListener("pointerdown", pointerdownSocket);
              _this2.socketsCache.set(element, context.data);
            }
          } else if (context.type === "unmount") {
            var _element = context.data.element;
            _element.removeEventListener("pointerdown", pointerdownSocket);
            _this2.socketsCache["delete"](_element);
          }
          return context;
        });
      }
    }]);
  }(Scope);

  // node_modules/rete-react-plugin/rete-react-plugin.esm.js
  var React = __toESM(require_react());
  var import_react2 = __toESM(require_react());
  var ReactDOM = __toESM(require_react_dom());
  var import_react_dom = __toESM(require_react_dom());
  var import_regenerator5 = __toESM(require_regenerator2());

  // node_modules/rete-render-utils/rete-render-utils.esm.js
  var import_regenerator4 = __toESM(require_regenerator2());
  function classicConnectionPath(points, curvature) {
    var _points = _slicedToArray(points, 2), _points$ = _points[0], x1 = _points$.x, y1 = _points$.y, _points$2 = _points[1], x2 = _points$2.x, y2 = _points$2.y;
    var vertical = Math.abs(y1 - y2);
    var hx1 = x1 + Math.max(vertical / 2, Math.abs(x2 - x1)) * curvature;
    var hx2 = x2 - Math.max(vertical / 2, Math.abs(x2 - x1)) * curvature;
    return "M ".concat(x1, " ").concat(y1, " C ").concat(hx1, " ").concat(y1, " ").concat(hx2, " ").concat(y2, " ").concat(x2, " ").concat(y2);
  }
  function loopConnectionPath(points, curvature, size) {
    var _points2 = _slicedToArray(points, 2), _points2$ = _points2[0], x1 = _points2$.x, y1 = _points2$.y, _points2$2 = _points2[1], x2 = _points2$2.x, y2 = _points2$2.y;
    var k2 = y2 > y1 ? 1 : -1;
    var scale = size + Math.abs(x1 - x2) / (size / 2);
    var middleX = (x1 + x2) / 2;
    var middleY = y1 - k2 * scale;
    var vertical = (y2 - y1) * curvature;
    return "\n        M ".concat(x1, " ").concat(y1, "\n        C ").concat(x1 + scale, " ").concat(y1, "\n        ").concat(x1 + scale, " ").concat(middleY - vertical, "\n        ").concat(middleX, " ").concat(middleY, "\n        C ").concat(x2 - scale, " ").concat(middleY + vertical, "\n        ").concat(x2 - scale, " ").concat(y2, "\n        ").concat(x2, " ").concat(y2, "\n    ");
  }
  function getElementCenter(_x, _x2) {
    return _getElementCenter.apply(this, arguments);
  }
  function _getElementCenter() {
    _getElementCenter = _asyncToGenerator(/* @__PURE__ */ import_regenerator4.default.mark(function _callee(child, parent) {
      var x2, y, currentElement, width, height;
      return import_regenerator4.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (child.offsetParent) {
              _context.next = 5;
              break;
            }
            _context.next = 3;
            return new Promise(function(res) {
              return setTimeout(res, 0);
            });
          case 3:
            _context.next = 0;
            break;
          case 5:
            x2 = child.offsetLeft;
            y = child.offsetTop;
            currentElement = child.offsetParent;
            if (currentElement) {
              _context.next = 10;
              break;
            }
            throw new Error("child has null offsetParent");
          case 10:
            while (currentElement !== null && currentElement !== parent) {
              x2 += currentElement.offsetLeft + currentElement.clientLeft;
              y += currentElement.offsetTop + currentElement.clientTop;
              currentElement = currentElement.offsetParent;
            }
            width = child.offsetWidth;
            height = child.offsetHeight;
            return _context.abrupt("return", {
              x: x2 + width / 2,
              y: y + height / 2
            });
          case 14:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _getElementCenter.apply(this, arguments);
  }
  var EventEmitter = /* @__PURE__ */ function() {
    function EventEmitter2() {
      _classCallCheck(this, EventEmitter2);
      _defineProperty(this, "listeners", /* @__PURE__ */ new Set());
    }
    return _createClass(EventEmitter2, [{
      key: "emit",
      value: function emit(data) {
        this.listeners.forEach(function(listener) {
          listener(data);
        });
      }
    }, {
      key: "listen",
      value: function listen(handler) {
        var _this = this;
        this.listeners.add(handler);
        return function() {
          _this.listeners["delete"](handler);
        };
      }
    }]);
  }();
  var SocketsPositionsStorage = /* @__PURE__ */ function() {
    function SocketsPositionsStorage2() {
      _classCallCheck(this, SocketsPositionsStorage2);
      _defineProperty(this, "elements", /* @__PURE__ */ new Map());
    }
    return _createClass(SocketsPositionsStorage2, [{
      key: "getPosition",
      value: function getPosition(data) {
        var _found$pop$position, _found$pop;
        var list = Array.from(this.elements.values()).flat();
        var found = list.filter(function(item) {
          return item.side === data.side && item.nodeId === data.nodeId && item.key === data.key;
        });
        if (found.length > 1) console.warn(["Found more than one element for socket with same key and side.", "Probably it was not unmounted correctly"].join(" "), data);
        return (_found$pop$position = (_found$pop = found.pop()) === null || _found$pop === void 0 ? void 0 : _found$pop.position) !== null && _found$pop$position !== void 0 ? _found$pop$position : null;
      }
    }, {
      key: "add",
      value: function add(data) {
        var existing = this.elements.get(data.element);
        this.elements.set(data.element, existing ? [].concat(_toConsumableArray(existing.filter(function(n2) {
          return !(n2.nodeId === data.nodeId && n2.key === data.key && n2.side === data.side);
        })), [data]) : [data]);
      }
    }, {
      key: "remove",
      value: function remove(element) {
        this.elements["delete"](element);
      }
    }, {
      key: "snapshot",
      value: function snapshot() {
        return Array.from(this.elements.values()).flat();
      }
    }]);
  }();
  var BaseSocketPosition = /* @__PURE__ */ function() {
    function BaseSocketPosition2() {
      _classCallCheck(this, BaseSocketPosition2);
      _defineProperty(this, "sockets", new SocketsPositionsStorage());
      _defineProperty(this, "emitter", new EventEmitter());
      _defineProperty(this, "area", null);
    }
    return _createClass(BaseSocketPosition2, [{
      key: "attach",
      value: (
        /**
         * Attach the watcher to the area's child scope.
         * @param scope Scope of the watcher that should be a child of `BaseAreaPlugin`
         */
        function attach(scope) {
          var _this = this;
          if (this.area) return;
          if (!scope.hasParent()) return;
          this.area = scope.parentScope(BaseAreaPlugin);
          this.area.addPipe(/* @__PURE__ */ function() {
            var _ref = _asyncToGenerator(/* @__PURE__ */ import_regenerator4.default.mark(function _callee2(context) {
              var _context$data, _nodeId, _key, _side, _element, position2, _nodeId2, _context$data$payload, source, target, _nodeId3;
              return import_regenerator4.default.wrap(function _callee2$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!(context.type === "rendered" && context.data.type === "socket")) {
                      _context2.next = 8;
                      break;
                    }
                    _context$data = context.data, _nodeId = _context$data.nodeId, _key = _context$data.key, _side = _context$data.side, _element = _context$data.element;
                    _context2.next = 4;
                    return _this.calculatePosition(_nodeId, _side, _key, _element);
                  case 4:
                    position2 = _context2.sent;
                    if (position2) {
                      _this.sockets.add({
                        nodeId: _nodeId,
                        key: _key,
                        side: _side,
                        element: _element,
                        position: position2
                      });
                      _this.emitter.emit({
                        nodeId: _nodeId,
                        key: _key,
                        side: _side
                      });
                    }
                    _context2.next = 24;
                    break;
                  case 8:
                    if (!(context.type === "unmount")) {
                      _context2.next = 12;
                      break;
                    }
                    _this.sockets.remove(context.data.element);
                    _context2.next = 24;
                    break;
                  case 12:
                    if (!(context.type === "nodetranslated")) {
                      _context2.next = 16;
                      break;
                    }
                    _this.emitter.emit({
                      nodeId: context.data.id
                    });
                    _context2.next = 24;
                    break;
                  case 16:
                    if (!(context.type === "noderesized")) {
                      _context2.next = 23;
                      break;
                    }
                    _nodeId2 = context.data.id;
                    _context2.next = 20;
                    return Promise.all(_this.sockets.snapshot().filter(function(item) {
                      return item.nodeId === context.data.id && item.side === "output";
                    }).map(/* @__PURE__ */ function() {
                      var _ref2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator4.default.mark(function _callee(item) {
                        var side, key, element, position3;
                        return import_regenerator4.default.wrap(function _callee$(_context) {
                          while (1) switch (_context.prev = _context.next) {
                            case 0:
                              side = item.side, key = item.key, element = item.element;
                              _context.next = 3;
                              return _this.calculatePosition(_nodeId2, side, key, element);
                            case 3:
                              position3 = _context.sent;
                              if (position3) {
                                item.position = position3;
                              }
                            case 5:
                            case "end":
                              return _context.stop();
                          }
                        }, _callee);
                      }));
                      return function(_x2) {
                        return _ref2.apply(this, arguments);
                      };
                    }()));
                  case 20:
                    _this.emitter.emit({
                      nodeId: _nodeId2
                    });
                    _context2.next = 24;
                    break;
                  case 23:
                    if (context.type === "render" && context.data.type === "connection") {
                      _context$data$payload = context.data.payload, source = _context$data$payload.source, target = _context$data$payload.target;
                      _nodeId3 = source || target;
                      _this.emitter.emit({
                        nodeId: _nodeId3
                      });
                    }
                  case 24:
                    return _context2.abrupt("return", context);
                  case 25:
                  case "end":
                    return _context2.stop();
                }
              }, _callee2);
            }));
            return function(_x) {
              return _ref.apply(this, arguments);
            };
          }());
        }
      )
      /**
       * Listen to socket position changes. Usually used by rendering plugins to update the start/end of the connection.
       * @internal
       * @param nodeId Node ID
       * @param side Side of the socket, 'input' or 'output'
       * @param key Socket key
       * @param change Callback function that is called when the socket position changes
       */
    }, {
      key: "listen",
      value: function listen(nodeId, side, key, change) {
        var _this2 = this;
        var unlisten = this.emitter.listen(function(data) {
          if (data.nodeId !== nodeId) return;
          if ((!data.key || data.side === side) && (!data.side || data.key === key)) {
            var _this2$area;
            var position2 = _this2.sockets.getPosition({
              side,
              nodeId,
              key
            });
            if (!position2) return;
            var x2 = position2.x, y = position2.y;
            var nodeView = (_this2$area = _this2.area) === null || _this2$area === void 0 ? void 0 : _this2$area.nodeViews.get(nodeId);
            if (nodeView) change({
              x: x2 + nodeView.position.x,
              y: y + nodeView.position.y
            });
          }
        });
        this.sockets.snapshot().forEach(function(data) {
          if (data.nodeId === nodeId) _this2.emitter.emit(data);
        });
        return unlisten;
      }
    }]);
  }();
  function _callSuper4(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct4() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct4() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct4 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  var DOMSocketPosition = /* @__PURE__ */ function(_BaseSocketPosition) {
    function DOMSocketPosition2(props) {
      var _this;
      _classCallCheck(this, DOMSocketPosition2);
      _this = _callSuper4(this, DOMSocketPosition2);
      _this.props = props;
      return _this;
    }
    _inherits(DOMSocketPosition2, _BaseSocketPosition);
    return _createClass(DOMSocketPosition2, [{
      key: "calculatePosition",
      value: function() {
        var _calculatePosition = _asyncToGenerator(/* @__PURE__ */ import_regenerator4.default.mark(function _callee(nodeId, side, key, element) {
          var _this$area, _this$props;
          var view, position2;
          return import_regenerator4.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                view = (_this$area = this.area) === null || _this$area === void 0 ? void 0 : _this$area.nodeViews.get(nodeId);
                if (view !== null && view !== void 0 && view.element) {
                  _context.next = 3;
                  break;
                }
                return _context.abrupt("return", null);
              case 3:
                _context.next = 5;
                return getElementCenter(element, view.element);
              case 5:
                position2 = _context.sent;
                if (!((_this$props = this.props) !== null && _this$props !== void 0 && _this$props.offset)) {
                  _context.next = 8;
                  break;
                }
                return _context.abrupt("return", this.props.offset(position2, nodeId, side, key));
              case 8:
                return _context.abrupt("return", {
                  x: position2.x + 12 * (side === "input" ? -1 : 1),
                  y: position2.y
                });
              case 9:
              case "end":
                return _context.stop();
            }
          }, _callee, this);
        }));
        function calculatePosition(_x, _x2, _x3, _x4) {
          return _calculatePosition.apply(this, arguments);
        }
        return calculatePosition;
      }()
    }]);
  }(BaseSocketPosition);
  function getDOMSocketPosition(props) {
    return new DOMSocketPosition(props);
  }

  // node_modules/@babel/runtime/helpers/esm/taggedTemplateLiteral.js
  function _taggedTemplateLiteral(e, t2) {
    return t2 || (t2 = e.slice(0)), Object.freeze(Object.defineProperties(e, {
      raw: {
        value: Object.freeze(t2)
      }
    }));
  }

  // node_modules/styled-components/dist/styled-components.browser.esm.js
  var import_react = __toESM(require_react());

  // node_modules/stylis/src/Enum.js
  var MS = "-ms-";
  var MOZ = "-moz-";
  var WEBKIT = "-webkit-";
  var COMMENT = "comm";
  var RULESET = "rule";
  var DECLARATION = "decl";
  var IMPORT = "@import";
  var NAMESPACE = "@namespace";
  var KEYFRAMES = "@keyframes";
  var LAYER = "@layer";

  // node_modules/stylis/src/Utility.js
  var abs = Math.abs;
  var from = String.fromCharCode;
  var assign = Object.assign;
  function hash(value, length2) {
    return charat(value, 0) ^ 45 ? (((length2 << 2 ^ charat(value, 0)) << 2 ^ charat(value, 1)) << 2 ^ charat(value, 2)) << 2 ^ charat(value, 3) : 0;
  }
  function trim(value) {
    return value.trim();
  }
  function match(value, pattern) {
    return (value = pattern.exec(value)) ? value[0] : value;
  }
  function replace(value, pattern, replacement) {
    return value.replace(pattern, replacement);
  }
  function indexof(value, search, position2) {
    return value.indexOf(search, position2);
  }
  function charat(value, index4) {
    return value.charCodeAt(index4) | 0;
  }
  function substr(value, begin, end) {
    return value.slice(begin, end);
  }
  function strlen(value) {
    return value.length;
  }
  function sizeof(value) {
    return value.length;
  }
  function append(value, array) {
    return array.push(value), value;
  }
  function combine(array, callback) {
    return array.map(callback).join("");
  }
  function filter(array, pattern) {
    return array.filter(function(value) {
      return !match(value, pattern);
    });
  }

  // node_modules/stylis/src/Tokenizer.js
  var line = 1;
  var column = 1;
  var length = 0;
  var position = 0;
  var character = 0;
  var characters = "";
  function node(value, root, parent, type, props, children, length2, siblings) {
    return { value, root, parent, type, props, children, line, column, length: length2, return: "", siblings };
  }
  function copy(root, props) {
    return assign(node("", null, null, "", null, null, 0, root.siblings), root, { length: -root.length }, props);
  }
  function lift(root) {
    while (root.root)
      root = copy(root.root, { children: [root] });
    append(root, root.siblings);
  }
  function char() {
    return character;
  }
  function prev() {
    character = position > 0 ? charat(characters, --position) : 0;
    if (column--, character === 10)
      column = 1, line--;
    return character;
  }
  function next() {
    character = position < length ? charat(characters, position++) : 0;
    if (column++, character === 10)
      column = 1, line++;
    return character;
  }
  function peek() {
    return charat(characters, position);
  }
  function caret() {
    return position;
  }
  function slice(begin, end) {
    return substr(characters, begin, end);
  }
  function token(type) {
    switch (type) {
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      case 59:
      case 123:
      case 125:
        return 4;
      case 58:
        return 3;
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function alloc(value) {
    return line = column = 1, length = strlen(characters = value), position = 0, [];
  }
  function dealloc(value) {
    return characters = "", value;
  }
  function delimit(type) {
    return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
  }
  function whitespace(type) {
    while (character = peek())
      if (character < 33)
        next();
      else
        break;
    return token(type) > 2 || token(character) > 3 ? "" : " ";
  }
  function escaping(index4, count) {
    while (--count && next())
      if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
        break;
    return slice(index4, caret() + (count < 6 && peek() == 32 && next() == 32));
  }
  function delimiter(type) {
    while (next())
      switch (character) {
        case type:
          return position;
        case 34:
        case 39:
          if (type !== 34 && type !== 39)
            delimiter(character);
          break;
        case 40:
          if (type === 41)
            delimiter(type);
          break;
        case 92:
          next();
          break;
      }
    return position;
  }
  function commenter(type, index4) {
    while (next())
      if (type + character === 47 + 10)
        break;
      else if (type + character === 42 + 42 && peek() === 47)
        break;
    return "/*" + slice(index4, position - 1) + "*" + from(type === 47 ? type : next());
  }
  function identifier(index4) {
    while (!token(peek()))
      next();
    return slice(index4, position);
  }

  // node_modules/stylis/src/Parser.js
  function compile(value) {
    return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
  }
  function parse(value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
    var index4 = 0;
    var offset = 0;
    var length2 = pseudo;
    var atrule = 0;
    var property = 0;
    var previous = 0;
    var variable = 1;
    var scanning = 1;
    var ampersand = 1;
    var character2 = 0;
    var type = "";
    var props = rules;
    var children = rulesets;
    var reference = rule;
    var characters2 = type;
    while (scanning)
      switch (previous = character2, character2 = next()) {
        case 40:
          if (previous != 108 && charat(characters2, length2 - 1) == 58) {
            if (indexof(characters2 += replace(delimit(character2), "&", "&\f"), "&\f", abs(index4 ? points[index4 - 1] : 0)) != -1)
              ampersand = -1;
            break;
          }
        case 34:
        case 39:
        case 91:
          characters2 += delimit(character2);
          break;
        case 9:
        case 10:
        case 13:
        case 32:
          characters2 += whitespace(previous);
          break;
        case 92:
          characters2 += escaping(caret() - 1, 7);
          continue;
        case 47:
          switch (peek()) {
            case 42:
            case 47:
              append(comment(commenter(next(), caret()), root, parent, declarations), declarations);
              if ((token(previous || 1) == 5 || token(peek() || 1) == 5) && strlen(characters2) && substr(characters2, -1, void 0) !== " ") characters2 += " ";
              break;
            default:
              characters2 += "/";
          }
          break;
        case 123 * variable:
          points[index4++] = strlen(characters2) * ampersand;
        case 125 * variable:
        case 59:
        case 0:
          switch (character2) {
            case 0:
            case 125:
              scanning = 0;
            case 59 + offset:
              if (ampersand == -1) characters2 = replace(characters2, /\f/g, "");
              if (property > 0 && (strlen(characters2) - length2 || variable === 0 && previous === 47))
                append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1, declarations) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2, declarations), declarations);
              break;
            case 59:
              characters2 += ";";
            default:
              append(reference = ruleset(characters2, root, parent, index4, offset, rules, points, type, props = [], children = [], length2, rulesets), rulesets);
              if (character2 === 123)
                if (offset === 0)
                  parse(characters2, root, reference, reference, props, rulesets, length2, points, children);
                else {
                  switch (atrule) {
                    case 99:
                      if (charat(characters2, 3) === 110) break;
                    case 108:
                      if (charat(characters2, 2) === 97) break;
                    default:
                      offset = 0;
                    case 100:
                    case 109:
                    case 115:
                  }
                  if (offset) parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2, children), children), rules, children, length2, points, rule ? props : children);
                  else parse(characters2, reference, reference, reference, [""], children, 0, points, children);
                }
          }
          index4 = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
          break;
        case 58:
          length2 = 1 + strlen(characters2), property = previous;
        default:
          if (variable < 1) {
            if (character2 == 123)
              --variable;
            else if (character2 == 125 && variable++ == 0 && prev() == 125)
              continue;
          }
          switch (characters2 += from(character2), character2 * variable) {
            case 38:
              ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
              break;
            case 44:
              points[index4++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
              break;
            case 64:
              if (peek() === 45)
                characters2 += delimit(next());
              atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
              break;
            case 45:
              if (previous === 45 && strlen(characters2) == 2)
                variable = 0;
          }
      }
    return rulesets;
  }
  function ruleset(value, root, parent, index4, offset, rules, points, type, props, children, length2, siblings) {
    var post = offset - 1;
    var rule = offset === 0 ? rules : [""];
    var size = sizeof(rule);
    for (var i2 = 0, j2 = 0, k2 = 0; i2 < index4; ++i2)
      for (var x2 = 0, y = substr(value, post + 1, post = abs(j2 = points[i2])), z2 = value; x2 < size; ++x2)
        if (z2 = trim(j2 > 0 ? rule[x2] + " " + y : replace(y, /&\f/g, rule[x2])))
          props[k2++] = z2;
    return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length2, siblings);
  }
  function comment(value, root, parent, siblings) {
    return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0, siblings);
  }
  function declaration(value, root, parent, length2, siblings) {
    return node(value, root, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2, siblings);
  }

  // node_modules/stylis/src/Prefixer.js
  function prefix(value, length2, children) {
    switch (hash(value, length2)) {
      case 5103:
        return WEBKIT + "print-" + value + value;
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
        return WEBKIT + value + value;
      case 4855:
        return WEBKIT + value.replace("add", "source-over").replace("substract", "source-out").replace("intersect", "source-in").replace("exclude", "xor") + value;
      case 4789:
        return MOZ + value + value;
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return WEBKIT + value + MOZ + value + MS + value + value;
      case 5936:
        switch (charat(value, length2 + 11)) {
          case 114:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb") + value;
          case 108:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "tb-rl") + value;
          case 45:
            return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, "lr") + value;
        }
      case 6828:
      case 4268:
      case 2903:
        return WEBKIT + value + MS + value + value;
      case 6165:
        return WEBKIT + value + MS + "flex-" + value + value;
      case 5187:
        return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + "box-$1$2" + MS + "flex-$1$2") + value;
      case 5443:
        return WEBKIT + value + MS + "flex-item-" + replace(value, /flex-|-self/g, "") + (!match(value, /flex-|baseline/) ? MS + "grid-row-" + replace(value, /flex-|-self/g, "") : "") + value;
      case 4675:
        return WEBKIT + value + MS + "flex-line-pack" + replace(value, /align-content|flex-|-self/g, "") + value;
      case 5548:
        return WEBKIT + value + MS + replace(value, "shrink", "negative") + value;
      case 5292:
        return WEBKIT + value + MS + replace(value, "basis", "preferred-size") + value;
      case 6060:
        return WEBKIT + "box-" + replace(value, "-grow", "") + WEBKIT + value + MS + replace(value, "grow", "positive") + value;
      case 4554:
        return WEBKIT + replace(value, /([^-])(transform)/g, "$1" + WEBKIT + "$2") + value;
      case 6187:
        return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + "$1"), /(image-set)/, WEBKIT + "$1"), value, "") + value;
      case 5495:
      case 3959:
        return replace(value, /(image-set\([^]*)/, WEBKIT + "$1$`$1");
      case 4968:
        return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + "box-pack:$3" + MS + "flex-pack:$3"), /space-between/, "justify") + WEBKIT + value + value;
      case 4200:
        if (!match(value, /flex-|baseline/)) return MS + "grid-column-align" + substr(value, length2) + value;
        break;
      case 2592:
      case 3360:
        return MS + replace(value, "template-", "") + value;
      case 4384:
      case 3616:
        if (children && children.some(function(element, index4) {
          return length2 = index4, match(element.props, /grid-\w+-end/);
        })) {
          return ~indexof(value + (children = children[length2].value), "span", 0) ? value : MS + replace(value, "-start", "") + value + MS + "grid-row-span:" + (~indexof(children, "span", 0) ? match(children, /\d+/) : +match(children, /\d+/) - +match(value, /\d+/)) + ";";
        }
        return MS + replace(value, "-start", "") + value;
      case 4896:
      case 4128:
        return children && children.some(function(element) {
          return match(element.props, /grid-\w+-start/);
        }) ? value : MS + replace(replace(value, "-end", "-span"), "span ", "") + value;
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return replace(value, /(.+)-inline(.+)/, WEBKIT + "$1$2") + value;
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        if (strlen(value) - 1 - length2 > 6)
          switch (charat(value, length2 + 1)) {
            case 109:
              if (charat(value, length2 + 4) !== 45)
                break;
            case 102:
              return replace(value, /(.+:)(.+)-([^]+)/, "$1" + WEBKIT + "$2-$3$1" + MOZ + (charat(value, length2 + 3) == 108 ? "$3" : "$2-$3")) + value;
            case 115:
              return ~indexof(value, "stretch", 0) ? prefix(replace(value, "stretch", "fill-available"), length2, children) + value : value;
          }
        break;
      case 5152:
      case 5920:
        return replace(value, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(_, a2, b2, c2, d2, e, f2) {
          return MS + a2 + ":" + b2 + f2 + (c2 ? MS + a2 + "-span:" + (d2 ? e : +e - +b2) + f2 : "") + value;
        });
      case 4949:
        if (charat(value, length2 + 6) === 121)
          return replace(value, ":", ":" + WEBKIT) + value;
        break;
      case 6444:
        switch (charat(value, charat(value, 14) === 45 ? 18 : 11)) {
          case 120:
            return replace(value, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + WEBKIT + (charat(value, 14) === 45 ? "inline-" : "") + "box$3$1" + WEBKIT + "$2$3$1" + MS + "$2box$3") + value;
          case 100:
            return replace(value, ":", ":" + MS) + value;
        }
        break;
      case 5719:
      case 2647:
      case 2135:
      case 3927:
      case 2391:
        return replace(value, "scroll-", "scroll-snap-") + value;
    }
    return value;
  }

  // node_modules/stylis/src/Serializer.js
  function serialize(children, callback) {
    var output = "";
    for (var i2 = 0; i2 < children.length; i2++)
      output += callback(children[i2], i2, children, callback) || "";
    return output;
  }
  function stringify(element, index4, children, callback) {
    switch (element.type) {
      case LAYER:
        if (element.children.length) break;
      case IMPORT:
      case NAMESPACE:
      case DECLARATION:
        return element.return = element.return || element.value;
      case COMMENT:
        return "";
      case KEYFRAMES:
        return element.return = element.value + "{" + serialize(element.children, callback) + "}";
      case RULESET:
        if (!strlen(element.value = element.props.join(","))) return "";
    }
    return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
  }

  // node_modules/stylis/src/Middleware.js
  function middleware(collection) {
    var length2 = sizeof(collection);
    return function(element, index4, children, callback) {
      var output = "";
      for (var i2 = 0; i2 < length2; i2++)
        output += collection[i2](element, index4, children, callback) || "";
      return output;
    };
  }
  function rulesheet(callback) {
    return function(element) {
      if (!element.root) {
        if (element = element.return)
          callback(element);
      }
    };
  }
  function prefixer(element, index4, children, callback) {
    if (element.length > -1) {
      if (!element.return)
        switch (element.type) {
          case DECLARATION:
            element.return = prefix(element.value, element.length, children);
            return;
          case KEYFRAMES:
            return serialize([copy(element, { value: replace(element.value, "@", "@" + WEBKIT) })], callback);
          case RULESET:
            if (element.length)
              return combine(children = element.props, function(value) {
                switch (match(value, callback = /(::plac\w+|:read-\w+)/)) {
                  case ":read-only":
                  case ":read-write":
                    lift(copy(element, { props: [replace(value, /:(read-\w+)/, ":" + MOZ + "$1")] }));
                    lift(copy(element, { props: [value] }));
                    assign(element, { props: filter(children, callback) });
                    break;
                  case "::placeholder":
                    lift(copy(element, { props: [replace(value, /:(plac\w+)/, ":" + WEBKIT + "input-$1")] }));
                    lift(copy(element, { props: [replace(value, /:(plac\w+)/, ":" + MOZ + "$1")] }));
                    lift(copy(element, { props: [replace(value, /:(plac\w+)/, MS + "input-$1")] }));
                    lift(copy(element, { props: [value] }));
                    assign(element, { props: filter(children, callback) });
                    break;
                }
                return "";
              });
        }
    }
  }

  // node_modules/styled-components/dist/styled-components.browser.esm.js
  var r;
  var i;
  var c = "undefined" != typeof process && void 0 !== process.env && (process.env.REACT_APP_SC_ATTR || process.env.SC_ATTR) || "data-styled";
  var a = "active";
  var l = "data-styled-version";
  var u = "6.4.1";
  var h = "/*!sc*/\n";
  var d = "undefined" != typeof window && "undefined" != typeof document;
  function p(e) {
    if ("undefined" != typeof process && void 0 !== process.env) {
      const t2 = process.env[e];
      if (void 0 !== t2 && "" !== t2) return "false" !== t2;
    }
  }
  var f = Boolean("boolean" == typeof SC_DISABLE_SPEEDY ? SC_DISABLE_SPEEDY : null !== (i = null !== (r = p("REACT_APP_SC_DISABLE_SPEEDY")) && void 0 !== r ? r : p("SC_DISABLE_SPEEDY")) && void 0 !== i ? i : "undefined" == typeof process || void 0 === process.env || false);
  var m = "sc-keyframes-";
  function v(e, ...t2) {
    return true ? new Error(`An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#${e} for more information.${t2.length > 0 ? ` Args: ${t2.join(", ")}` : ""}`) : new Error(function(...e2) {
      let t3 = e2[0];
      const n2 = [];
      for (let t4 = 1, o = e2.length; t4 < o; t4 += 1) n2.push(e2[t4]);
      return n2.forEach((e3) => {
        t3 = t3.replace(/%[a-z]/, e3);
      }), t3;
    }(g[e], ...t2).trim());
  }
  var S = 1 << 30;
  var b = /* @__PURE__ */ new Map();
  var w = /* @__PURE__ */ new Map();
  var N = 1;
  var C = (e) => {
    if (b.has(e)) return b.get(e);
    for (; w.has(N); ) N++;
    const t2 = N++;
    if (false) throw v(16, `${t2}`);
    return b.set(e, t2), w.set(t2, e), t2;
  };
  var O = (e) => w.get(e);
  var E = (e, t2) => {
    N = t2 + 1, b.set(e, t2), w.set(t2, e);
  };
  var I = Object.freeze([]);
  var $ = Object.freeze({});
  function R(e, t2, n2 = $) {
    return e.theme !== n2.theme && e.theme || t2 || n2.theme;
  }
  var j = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g;
  var x = /(^-|-$)/g;
  function T(e) {
    return e.replace(j, "-").replace(x, "");
  }
  var k = /(a)(d)/gi;
  var D = (e) => String.fromCharCode(e + (e > 25 ? 39 : 97));
  function V(e) {
    let t2, n2 = "";
    for (t2 = Math.abs(e); t2 > 52; t2 = t2 / 52 | 0) n2 = D(t2 % 52) + n2;
    return (D(t2 % 52) + n2).replace(k, "$1-$2");
  }
  var M = 5381;
  var G = (e, t2) => {
    let n2 = t2.length;
    for (; n2; ) e = 33 * e ^ t2.charCodeAt(--n2);
    return e;
  };
  var F = (e) => G(M, e);
  function z(e) {
    return V(F(e) >>> 0);
  }
  function W(e) {
    return e.displayName || e.name || "Component";
  }
  function L(e) {
    return "string" == typeof e && true;
  }
  function B(e) {
    return L(e) ? `styled.${e}` : `Styled(${W(e)})`;
  }
  var q = Symbol.for("react.memo");
  var H = Symbol.for("react.forward_ref");
  var Y = { contextType: true, defaultProps: true, displayName: true, getDerivedStateFromError: true, getDerivedStateFromProps: true, propTypes: true, type: true };
  var U = { name: true, length: true, prototype: true, caller: true, callee: true, arguments: true, arity: true };
  var J = { $$typeof: true, compare: true, defaultProps: true, displayName: true, propTypes: true, type: true };
  var X = { [H]: { $$typeof: true, render: true, defaultProps: true, displayName: true, propTypes: true }, [q]: J };
  function K(e) {
    return ("type" in (t2 = e) && t2.type.$$typeof) === q ? J : "$$typeof" in e ? X[e.$$typeof] : Y;
    var t2;
  }
  var Q = Object.defineProperty;
  var Z = Object.getOwnPropertyNames;
  var ee = Object.getOwnPropertySymbols;
  var te = Object.getOwnPropertyDescriptor;
  var ne = Object.getPrototypeOf;
  var oe = Object.prototype;
  function se(e, t2, n2) {
    if ("string" != typeof t2) {
      const o = ne(t2);
      o && o !== oe && se(e, o, n2);
      const s = Z(t2).concat(ee(t2)), r2 = K(e), i2 = K(t2);
      for (let o2 = 0; o2 < s.length; ++o2) {
        const c2 = s[o2];
        if (!(c2 in U || n2 && n2[c2] || i2 && c2 in i2 || r2 && c2 in r2)) {
          const n3 = te(t2, c2);
          try {
            Q(e, c2, n3);
          } catch (e2) {
          }
        }
      }
    }
    return e;
  }
  function re(e) {
    return "function" == typeof e;
  }
  function ie(e) {
    return "object" == typeof e && "styledComponentId" in e;
  }
  function ce(e, t2) {
    return e && t2 ? e + " " + t2 : e || t2 || "";
  }
  function ae(e, t2) {
    return e.join(t2 || "");
  }
  function le(e) {
    return null !== e && "object" == typeof e && e.constructor.name === Object.name && !("props" in e && e.$$typeof);
  }
  function ue(e, t2, n2 = false) {
    if (!n2 && !le(e) && !Array.isArray(e)) return t2;
    if (Array.isArray(t2)) for (let n3 = 0; n3 < t2.length; n3++) e[n3] = ue(e[n3], t2[n3]);
    else if (le(t2)) for (const n3 in t2) e[n3] = ue(e[n3], t2[n3]);
    return e;
  }
  function he(e, t2) {
    Object.defineProperty(e, "toString", { value: t2 });
  }
  var de = class {
    constructor(e) {
      this.groupSizes = new Uint32Array(512), this.length = 512, this.tag = e, this._cGroup = 0, this._cIndex = 0;
    }
    indexOfGroup(e) {
      if (e === this._cGroup) return this._cIndex;
      let t2 = this._cIndex;
      if (e > this._cGroup) for (let n2 = this._cGroup; n2 < e; n2++) t2 += this.groupSizes[n2];
      else for (let n2 = this._cGroup - 1; n2 >= e; n2--) t2 -= this.groupSizes[n2];
      return this._cGroup = e, this._cIndex = t2, t2;
    }
    insertRules(e, t2) {
      if (e >= this.groupSizes.length) {
        const t3 = this.groupSizes, n3 = t3.length;
        let o2 = n3;
        for (; e >= o2; ) if (o2 <<= 1, o2 < 0) throw v(16, `${e}`);
        this.groupSizes = new Uint32Array(o2), this.groupSizes.set(t3), this.length = o2;
        for (let e2 = n3; e2 < o2; e2++) this.groupSizes[e2] = 0;
      }
      let n2 = this.indexOfGroup(e + 1), o = 0;
      for (let s = 0, r2 = t2.length; s < r2; s++) this.tag.insertRule(n2, t2[s]) && (this.groupSizes[e]++, n2++, o++);
      o > 0 && this._cGroup > e && (this._cIndex += o);
    }
    clearGroup(e) {
      if (e < this.length) {
        const t2 = this.groupSizes[e], n2 = this.indexOfGroup(e), o = n2 + t2;
        this.groupSizes[e] = 0;
        for (let e2 = n2; e2 < o; e2++) this.tag.deleteRule(n2);
        t2 > 0 && this._cGroup > e && (this._cIndex -= t2);
      }
    }
    getGroup(e) {
      let t2 = "";
      if (e >= this.length || 0 === this.groupSizes[e]) return t2;
      const n2 = this.groupSizes[e], o = this.indexOfGroup(e), s = o + n2;
      for (let e2 = o; e2 < s; e2++) t2 += this.tag.getRule(e2) + h;
      return t2;
    }
  };
  var pe = `style[${c}][${l}="${u}"]`;
  var fe = new RegExp(`^${c}\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)`);
  var me = (e) => "undefined" != typeof ShadowRoot && e instanceof ShadowRoot || "host" in e && 11 === e.nodeType;
  var ye = (e) => {
    if (!e) return document;
    if (me(e)) return e;
    if ("getRootNode" in e) {
      const t2 = e.getRootNode();
      if (me(t2)) return t2;
    }
    return document;
  };
  var ge = (e, t2, n2) => {
    const o = n2.split(",");
    let s;
    for (let n3 = 0, r2 = o.length; n3 < r2; n3++) (s = o[n3]) && e.registerName(t2, s);
  };
  var ve = (e, t2) => {
    var n2;
    const o = (null !== (n2 = t2.textContent) && void 0 !== n2 ? n2 : "").split(h), s = [];
    for (let t3 = 0, n3 = o.length; t3 < n3; t3++) {
      const n4 = o[t3].trim();
      if (!n4) continue;
      const r2 = n4.match(fe);
      if (r2) {
        const t4 = 0 | parseInt(r2[1], 10), n5 = r2[2];
        0 !== t4 && (E(n5, t4), ge(e, n5, r2[3]), e.getTag().insertRules(t4, s)), s.length = 0;
      } else s.push(n4);
    }
  };
  var Se = (e) => {
    const t2 = ye(e.options.target).querySelectorAll(pe);
    for (let n2 = 0, o = t2.length; n2 < o; n2++) {
      const o2 = t2[n2];
      o2 && o2.getAttribute(c) !== a && (ve(e, o2), o2.parentNode && o2.parentNode.removeChild(o2));
    }
  };
  var be = false;
  function we() {
    if (false !== be) return be;
    if ("undefined" != typeof document) {
      const e = document.head.querySelector('meta[property="csp-nonce"]');
      if (e) return be = e.nonce || e.getAttribute("content") || void 0;
      const t2 = document.head.querySelector('meta[name="sc-nonce"]');
      if (t2) return be = t2.getAttribute("content") || void 0;
    }
    return be = "undefined" != typeof __webpack_nonce__ ? __webpack_nonce__ : void 0;
  }
  var Ne = (e, t2) => {
    const n2 = document.head, o = e || n2, s = document.createElement("style"), r2 = ((e2) => {
      const t3 = Array.from(e2.querySelectorAll(`style[${c}]`));
      return t3[t3.length - 1];
    })(o), i2 = void 0 !== r2 ? r2.nextSibling : null;
    s.setAttribute(c, a), s.setAttribute(l, u);
    const h2 = t2 || we();
    return h2 && s.setAttribute("nonce", h2), o.insertBefore(s, i2), s;
  };
  var Ce = class {
    constructor(e, t2) {
      this.element = Ne(e, t2), this.element.appendChild(document.createTextNode("")), this.sheet = ((e2) => {
        var t3;
        if (e2.sheet) return e2.sheet;
        const n2 = null !== (t3 = e2.getRootNode().styleSheets) && void 0 !== t3 ? t3 : document.styleSheets;
        for (let t4 = 0, o = n2.length; t4 < o; t4++) {
          const o2 = n2[t4];
          if (o2.ownerNode === e2) return o2;
        }
        throw v(17);
      })(this.element), this.length = 0;
    }
    insertRule(e, t2) {
      try {
        return this.sheet.insertRule(t2, e), this.length++, true;
      } catch (e2) {
        return false;
      }
    }
    deleteRule(e) {
      this.sheet.deleteRule(e), this.length--;
    }
    getRule(e) {
      const t2 = this.sheet.cssRules[e];
      return t2 && t2.cssText ? t2.cssText : "";
    }
  };
  var Oe = class {
    constructor(e, t2) {
      this.element = Ne(e, t2), this.nodes = this.element.childNodes, this.length = 0;
    }
    insertRule(e, t2) {
      if (e <= this.length && e >= 0) {
        const n2 = document.createTextNode(t2);
        return this.element.insertBefore(n2, this.nodes[e] || null), this.length++, true;
      }
      return false;
    }
    deleteRule(e) {
      this.element.removeChild(this.nodes[e]), this.length--;
    }
    getRule(e) {
      return e < this.length ? this.nodes[e].textContent : "";
    }
  };
  var Ee = d;
  var Ae = { isServer: !d, useCSSOMInjection: !f };
  var Pe = class _Pe {
    static registerId(e) {
      return C(e);
    }
    constructor(e = $, t2 = {}, n2) {
      this.options = Object.assign(Object.assign({}, Ae), e), this.gs = t2, this.keyframeIds = /* @__PURE__ */ new Set(), this.names = new Map(n2), this.server = !!e.isServer, !this.server && d && Ee && (Ee = false, Se(this)), he(this, () => ((e2) => {
        const t3 = e2.getTag(), { length: n3 } = t3;
        let o = "";
        for (let s = 0; s < n3; s++) {
          const n4 = O(s);
          if (void 0 === n4) continue;
          const r2 = e2.names.get(n4);
          if (void 0 === r2 || !r2.size) continue;
          const i2 = t3.getGroup(s);
          if (0 === i2.length) continue;
          const a2 = c + ".g" + s + '[id="' + n4 + '"]';
          let l2 = "";
          for (const e3 of r2) e3.length > 0 && (l2 += e3 + ",");
          o += i2 + a2 + '{content:"' + l2 + '"}' + h;
        }
        return o;
      })(this));
    }
    rehydrate() {
      !this.server && d && Se(this);
    }
    reconstructWithOptions(e, t2 = true) {
      const n2 = new _Pe(Object.assign(Object.assign({}, this.options), e), this.gs, t2 && this.names || void 0);
      return n2.keyframeIds = new Set(this.keyframeIds), !this.server && d && e.target !== this.options.target && ye(this.options.target) !== ye(e.target) && Se(n2), n2;
    }
    allocateGSInstance(e) {
      return this.gs[e] = (this.gs[e] || 0) + 1;
    }
    getTag() {
      return this.tag || (this.tag = (e = (({ useCSSOMInjection: e2, target: t2, nonce: n2 }) => e2 ? new Ce(t2, n2) : new Oe(t2, n2))(this.options), new de(e)));
      var e;
    }
    hasNameForId(e, t2) {
      var n2, o;
      return null !== (o = null === (n2 = this.names.get(e)) || void 0 === n2 ? void 0 : n2.has(t2)) && void 0 !== o && o;
    }
    registerName(e, t2) {
      C(e), e.startsWith(m) && this.keyframeIds.add(e);
      const n2 = this.names.get(e);
      n2 ? n2.add(t2) : this.names.set(e, /* @__PURE__ */ new Set([t2]));
    }
    insertRules(e, t2, n2) {
      this.registerName(e, t2), this.getTag().insertRules(C(e), n2);
    }
    clearNames(e) {
      this.names.has(e) && this.names.get(e).clear();
    }
    clearRules(e) {
      this.getTag().clearGroup(C(e)), this.clearNames(e);
    }
    clearTag() {
      this.tag = void 0;
    }
  };
  var _e = /* @__PURE__ */ new WeakSet();
  var Ie = { animationIterationCount: 1, aspectRatio: 1, borderImageOutset: 1, borderImageSlice: 1, borderImageWidth: 1, columnCount: 1, columns: 1, flex: 1, flexGrow: 1, flexShrink: 1, gridRow: 1, gridRowEnd: 1, gridRowSpan: 1, gridRowStart: 1, gridColumn: 1, gridColumnEnd: 1, gridColumnSpan: 1, gridColumnStart: 1, fontWeight: 1, lineHeight: 1, opacity: 1, order: 1, orphans: 1, scale: 1, tabSize: 1, widows: 1, zIndex: 1, zoom: 1, WebkitLineClamp: 1, fillOpacity: 1, floodOpacity: 1, stopOpacity: 1, strokeDasharray: 1, strokeDashoffset: 1, strokeMiterlimit: 1, strokeOpacity: 1, strokeWidth: 1 };
  function $e(e, t2) {
    return null == t2 || "boolean" == typeof t2 || "" === t2 ? "" : "number" != typeof t2 || 0 === t2 || e in Ie || e.startsWith("--") ? String(t2).trim() : t2 + "px";
  }
  var Re = 47;
  function je(e) {
    if (45 === e.charCodeAt(0) && 45 === e.charCodeAt(1)) return e;
    let t2 = "";
    for (let n2 = 0; n2 < e.length; n2++) {
      const o = e.charCodeAt(n2);
      t2 += o >= 65 && o <= 90 ? "-" + String.fromCharCode(o + 32) : e[n2];
    }
    return t2.startsWith("ms-") ? "-" + t2 : t2;
  }
  var xe = Symbol.for("sc-keyframes");
  function Te(e) {
    return "object" == typeof e && null !== e && xe in e;
  }
  function ke(e) {
    return re(e) && !(e.prototype && e.prototype.isReactComponent);
  }
  var De = (e) => null == e || false === e || "" === e;
  var Ve = Symbol.for("react.client.reference");
  function Me(e) {
    return e.$$typeof === Ve;
  }
  function Fe(e, t2) {
    for (const n2 in e) {
      const o = e[n2];
      e.hasOwnProperty(n2) && !De(o) && (Array.isArray(o) && _e.has(o) || re(o) ? t2.push(je(n2) + ":", o, ";") : le(o) ? (t2.push(n2 + " {"), Fe(o, t2), t2.push("}")) : t2.push(je(n2) + ": " + $e(n2, o) + ";"));
    }
  }
  function ze(e, t2, n2, o, s = []) {
    if (De(e)) return s;
    const r2 = typeof e;
    if ("string" === r2) return s.push(e), s;
    if ("function" === r2) {
      if (Me(e)) return false, s;
      if (ke(e) && t2) {
        const r3 = e(t2);
        return true, ze(r3, t2, n2, o, s);
      }
      return s.push(e), s;
    }
    if (Array.isArray(e)) {
      for (let r3 = 0; r3 < e.length; r3++) ze(e[r3], t2, n2, o, s);
      return s;
    }
    return ie(e) ? (s.push(`.${e.styledComponentId}`), s) : Te(e) ? (n2 ? (e.inject(n2, o), s.push(e.getName(o))) : s.push(e), s) : Me(e) ? (false, s) : le(e) ? (Fe(e, s), s) : (s.push(e.toString()), s);
  }
  var We = F(u);
  var Le = class {
    constructor(e, t2, n2) {
      this.rules = e, this.componentId = t2, this.baseHash = G(We, t2), this.baseStyle = n2, Pe.registerId(t2);
    }
    generateAndInjectStyles(e, t2, n2) {
      let o = this.baseStyle ? this.baseStyle.generateAndInjectStyles(e, t2, n2) : "";
      {
        let s = "";
        for (let o2 = 0; o2 < this.rules.length; o2++) {
          const r2 = this.rules[o2];
          if ("string" == typeof r2) s += r2;
          else if (r2) if (ke(r2)) {
            const o3 = r2(e);
            "string" == typeof o3 ? s += o3 : null != o3 && false !== o3 && (true, s += ae(ze(o3, e, t2, n2)));
          } else s += ae(ze(r2, e, t2, n2));
        }
        if (s) {
          this.dynamicNameCache || (this.dynamicNameCache = /* @__PURE__ */ new Map());
          const e2 = n2.hash ? n2.hash + s : s;
          let r2 = this.dynamicNameCache.get(e2);
          if (!r2) {
            if (r2 = V(G(G(this.baseHash, n2.hash), s) >>> 0), this.dynamicNameCache.size >= 200) {
              const e3 = this.dynamicNameCache.keys().next().value;
              void 0 !== e3 && this.dynamicNameCache.delete(e3);
            }
            this.dynamicNameCache.set(e2, r2);
          }
          if (!t2.hasNameForId(this.componentId, r2)) {
            const e3 = n2(s, "." + r2, void 0, this.componentId);
            t2.insertRules(this.componentId, r2, e3);
          }
          o = ce(o, r2);
        }
      }
      return o;
    }
  };
  var Be = /&/g;
  function qe(e, t2) {
    let n2 = 0;
    for (; --t2 >= 0 && 92 === e.charCodeAt(t2); ) n2++;
    return !(1 & ~n2);
  }
  function He(e) {
    const t2 = e.length;
    let n2 = "", o = 0, s = 0, r2 = 0, i2 = false, c2 = false;
    for (let a2 = 0; a2 < t2; a2++) {
      const l2 = e.charCodeAt(a2);
      if (0 !== r2 || i2 || l2 !== Re || 42 !== e.charCodeAt(a2 + 1)) if (i2) 42 === l2 && e.charCodeAt(a2 + 1) === Re && (i2 = false, a2++);
      else if (34 !== l2 && 39 !== l2 || qe(e, a2)) {
        if (0 === r2) if (123 === l2) s++;
        else if (125 === l2) {
          if (s--, s < 0) {
            c2 = true;
            let n3 = a2 + 1;
            for (; n3 < t2; ) {
              const t3 = e.charCodeAt(n3);
              if (59 === t3 || 10 === t3) break;
              n3++;
            }
            n3 < t2 && 59 === e.charCodeAt(n3) && n3++, s = 0, a2 = n3 - 1, o = n3;
            continue;
          }
          0 === s && (n2 += e.substring(o, a2 + 1), o = a2 + 1);
        } else 59 === l2 && 0 === s && (n2 += e.substring(o, a2 + 1), o = a2 + 1);
      } else 0 === r2 ? r2 = l2 : r2 === l2 && (r2 = 0);
      else i2 = true, a2++;
    }
    return c2 || 0 !== s || 0 !== r2 ? (o < t2 && 0 === s && 0 === r2 && (n2 += e.substring(o)), n2) : e;
  }
  function Ye(e, t2) {
    const n2 = t2 + " ", o = "," + n2;
    for (let s = 0; s < e.length; s++) {
      const r2 = e[s];
      if ("rule" === r2.type) {
        r2.value = (n2 + r2.value).replaceAll(",", o);
        const e2 = r2.props, t3 = [];
        for (let o2 = 0; o2 < e2.length; o2++) t3[o2] = n2 + e2[o2];
        r2.props = t3;
      }
      Array.isArray(r2.children) && "@keyframes" !== r2.type && Ye(r2.children, t2);
    }
    return e;
  }
  function Ue({ options: e = $, plugins: t2 = I } = $) {
    let n2, s, r2;
    const i2 = (e2, t3, o) => o.startsWith(s) && o.endsWith(s) && o.replaceAll(s, "").length > 0 ? `.${n2}` : e2, c2 = t2.slice();
    c2.push((e2) => {
      e2.type === RULESET && e2.value.includes("&") && (r2 || (r2 = new RegExp(`\\${s}\\b`, "g")), e2.props[0] = e2.props[0].replace(Be, s).replace(r2, i2));
    }), e.prefix && c2.push(prefixer), c2.push(stringify);
    let a2 = [];
    const l2 = middleware(c2.concat(rulesheet((e2) => a2.push(e2)))), u2 = (t3, i3 = "", c3 = "", u3 = "&") => {
      n2 = u3, s = i3, r2 = void 0;
      const h3 = function(e2) {
        const t4 = -1 !== e2.indexOf("//"), n3 = -1 !== e2.indexOf("}");
        if (!t4 && !n3) return e2;
        if (!t4) return He(e2);
        const o = e2.length;
        let s2 = "", r3 = 0, i4 = 0, c4 = 0, a3 = 0, l3 = 0, u4 = false;
        for (; i4 < o; ) {
          const t5 = e2.charCodeAt(i4);
          if (34 !== t5 && 39 !== t5 || qe(e2, i4)) if (0 === c4) if (t5 === Re && i4 + 1 < o && 42 === e2.charCodeAt(i4 + 1)) {
            for (i4 += 2; i4 + 1 < o && (42 !== e2.charCodeAt(i4) || e2.charCodeAt(i4 + 1) !== Re); ) i4++;
            i4 += 2;
          } else if (40 !== t5) if (41 !== t5) if (a3 > 0) i4++;
          else if (42 === t5 && i4 + 1 < o && e2.charCodeAt(i4 + 1) === Re) s2 += e2.substring(r3, i4), i4 += 2, r3 = i4, u4 = true;
          else if (t5 === Re && i4 + 1 < o && e2.charCodeAt(i4 + 1) === Re) {
            for (s2 += e2.substring(r3, i4); i4 < o && 10 !== e2.charCodeAt(i4); ) i4++;
            r3 = i4, u4 = true;
          } else 123 === t5 ? l3++ : 125 === t5 && l3--, i4++;
          else a3 > 0 && a3--, i4++;
          else a3++, i4++;
          else i4++;
          else 0 === c4 ? c4 = t5 : c4 === t5 && (c4 = 0), i4++;
        }
        return u4 ? (r3 < o && (s2 += e2.substring(r3)), 0 === l3 ? s2 : He(s2)) : 0 === l3 ? e2 : He(e2);
      }(t3);
      let d3 = compile(c3 || i3 ? c3 + " " + i3 + " { " + h3 + " }" : h3);
      return e.namespace && (d3 = Ye(d3, e.namespace)), a2 = [], serialize(d3, l2), a2;
    }, h2 = e;
    let d2 = M;
    for (let e2 = 0; e2 < t2.length; e2++) t2[e2].name || v(15), d2 = G(d2, t2[e2].name);
    return (null == h2 ? void 0 : h2.namespace) && (d2 = G(d2, h2.namespace)), (null == h2 ? void 0 : h2.prefix) && (d2 = G(d2, "p")), u2.hash = d2 !== M ? d2.toString() : "", u2;
  }
  var Je = new Pe();
  var Xe = Ue();
  var Ke = import_react.default.createContext({ shouldForwardProp: void 0, styleSheet: Je, stylis: Xe, stylisPlugins: void 0 });
  var Qe = Ke.Consumer;
  function Ze() {
    return import_react.default.useContext(Ke);
  }
  var tt = import_react.default.createContext(void 0);
  var nt = tt.Consumer;
  var rt = Object.prototype.hasOwnProperty;
  var it = {};
  function ct(e, t2) {
    const n2 = "string" != typeof e ? "sc" : T(e);
    it[n2] = (it[n2] || 0) + 1;
    const o = n2 + "-" + z(u + n2 + it[n2]);
    return t2 ? t2 + "-" + o : o;
  }
  function lt(o, s, r2) {
    const i2 = ie(o), c2 = o, a2 = !L(o), { attrs: l2 = I, componentId: u2 = ct(s.displayName, s.parentComponentId), displayName: h2 = B(o) } = s, d2 = s.displayName && s.componentId ? T(s.displayName) + "-" + s.componentId : s.componentId || u2, p2 = i2 && c2.attrs ? c2.attrs.concat(l2).filter(Boolean) : l2;
    let { shouldForwardProp: f2 } = s;
    if (i2 && c2.shouldForwardProp) {
      const e = c2.shouldForwardProp;
      if (s.shouldForwardProp) {
        const t2 = s.shouldForwardProp;
        f2 = (n2, o2) => e(n2, o2) && t2(n2, o2);
      } else f2 = e;
    }
    const m2 = new Le(r2, d2, i2 ? c2.componentStyle : void 0);
    function y(o2, s2) {
      return function(o3, s3, r3) {
        const { attrs: i3, componentStyle: c3, defaultProps: a3, foldedComponentIds: l3, styledComponentId: u3, target: h3 } = o3, d3 = import_react.default.useContext(tt), p3 = Ze(), f3 = o3.shouldForwardProp || p3.shouldForwardProp;
        const m3 = R(s3, d3, a3) || $;
        let y2, g2;
        {
          const e = import_react.default.useRef(null), n2 = e.current;
          if (null !== n2 && n2[1] === m3 && n2[2] === p3.styleSheet && n2[3] === p3.stylis && n2[7] === c3 && function(e2, t2, n3) {
            const o4 = e2, s4 = t2;
            let r4 = 0;
            for (const e3 in s4) if (rt.call(s4, e3) && (r4++, o4[e3] !== s4[e3])) return false;
            return r4 === n3;
          }(n2[0], s3, n2[4])) y2 = n2[5], g2 = n2[6];
          else {
            y2 = function(e2, t2, n4) {
              const o4 = Object.assign(Object.assign({}, t2), { className: void 0, theme: n4 }), s4 = e2.length > 1;
              for (let n5 = 0; n5 < e2.length; n5++) {
                const r4 = e2[n5], i4 = re(r4) ? r4(s4 ? Object.assign({}, o4) : o4) : r4;
                for (const e3 in i4) "className" === e3 ? o4.className = ce(o4.className, i4[e3]) : "style" === e3 ? o4.style = Object.assign(Object.assign({}, o4.style), i4[e3]) : e3 in t2 && void 0 === t2[e3] || (o4[e3] = i4[e3]);
              }
              return "className" in t2 && "string" == typeof t2.className && (o4.className = ce(o4.className, t2.className)), o4;
            }(i3, s3, m3), g2 = function(e2, n4, o4, s4) {
              const r4 = e2.generateAndInjectStyles(n4, o4, s4);
              return false, r4;
            }(c3, y2, p3.styleSheet, p3.stylis);
            let n3 = 0;
            for (const e2 in s3) rt.call(s3, e2) && n3++;
            e.current = [s3, m3, p3.styleSheet, p3.stylis, n3, y2, g2, c3];
          }
        }
        const v2 = y2.as || h3, S2 = function(t2, n2, o4, s4) {
          const r4 = {};
          for (const i4 in t2) void 0 === t2[i4] || "$" === i4[0] || "as" === i4 || "theme" === i4 && t2.theme === o4 || ("forwardedAs" === i4 ? r4.as = t2.forwardedAs : s4 && !s4(i4, n2) || (r4[i4] = t2[i4], s4 || true));
          return r4;
        }(y2, v2, m3, f3);
        let b2 = ce(l3, u3);
        return g2 && (b2 += " " + g2), y2.className && (b2 += " " + y2.className), S2[L(v2) && v2.includes("-") ? "class" : "className"] = b2, r3 && (S2.ref = r3), (0, import_react.createElement)(v2, S2);
      }(g, o2, s2);
    }
    y.displayName = h2;
    let g = import_react.default.forwardRef(y);
    return g.attrs = p2, g.componentStyle = m2, g.displayName = h2, g.shouldForwardProp = f2, g.foldedComponentIds = i2 ? ce(c2.foldedComponentIds, c2.styledComponentId) : "", g.styledComponentId = d2, g.target = i2 ? c2.target : o, Object.defineProperty(g, "defaultProps", { get() {
      return this._foldedDefaultProps;
    }, set(e) {
      this._foldedDefaultProps = i2 ? function(e2, ...t2) {
        for (const n2 of t2) ue(e2, n2, true);
        return e2;
      }({}, c2.defaultProps, e) : e;
    } }), false, he(g, () => `.${g.styledComponentId}`), a2 && se(g, o, { attrs: true, componentStyle: true, displayName: true, foldedComponentIds: true, shouldForwardProp: true, styledComponentId: true, target: true }), g;
  }
  var ut = /* @__PURE__ */ new Set(["a", "abbr", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "blockquote", "body", "button", "br", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "menu", "meter", "nav", "object", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "slot", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "u", "ul", "var", "video", "wbr", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tspan", "use"]);
  function ht(e, t2) {
    const n2 = [e[0]];
    for (let o = 0, s = t2.length; o < s; o += 1) n2.push(t2[o], e[o + 1]);
    return n2;
  }
  var dt = (e) => (_e.add(e), e);
  function pt(e, ...t2) {
    if (re(e) || le(e)) return dt(ze(ht(I, [e, ...t2])));
    const n2 = e;
    return 0 === t2.length && 1 === n2.length && "string" == typeof n2[0] ? ze(n2) : dt(ze(ht(n2, t2)));
  }
  function ft(e, t2, n2 = $) {
    if (!t2) throw v(1, t2);
    const o = (o2, ...s) => e(t2, n2, pt(o2, ...s));
    return o.attrs = (o2) => ft(e, t2, Object.assign(Object.assign({}, n2), { attrs: Array.prototype.concat(n2.attrs, o2).filter(Boolean) })), o.withConfig = (o2) => ft(e, t2, Object.assign(Object.assign({}, n2), o2)), o;
  }
  var mt = (e) => ft(lt, e);
  var yt = mt;
  ut.forEach((e) => {
    yt[e] = mt(e);
  });
  var Nt;
  Nt = xe;
  var _t = `__sc-${c}__`;
  var $t = `:not(style[${c}])`;
  var Rt = `style[${c}]`;

  // node_modules/@babel/runtime/helpers/esm/extends.js
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n2) {
      for (var e = 1; e < arguments.length; e++) {
        var t2 = arguments[e];
        for (var r2 in t2) ({}).hasOwnProperty.call(t2, r2) && (n2[r2] = t2[r2]);
      }
      return n2;
    }, _extends.apply(null, arguments);
  }

  // node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
  function _objectWithoutPropertiesLoose(r2, e) {
    if (null == r2) return {};
    var t2 = {};
    for (var n2 in r2) if ({}.hasOwnProperty.call(r2, n2)) {
      if (-1 !== e.indexOf(n2)) continue;
      t2[n2] = r2[n2];
    }
    return t2;
  }

  // node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js
  function _objectWithoutProperties(e, t2) {
    if (null == e) return {};
    var o, r2, i2 = _objectWithoutPropertiesLoose(e, t2);
    if (Object.getOwnPropertySymbols) {
      var n2 = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n2.length; r2++) o = n2[r2], -1 === t2.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i2[o] = e[o]);
    }
    return i2;
  }

  // node_modules/rete-react-plugin/rete-react-plugin.esm.js
  function getRenderer(props) {
    var createRoot = props === null || props === void 0 ? void 0 : props.createRoot;
    var wrappers = /* @__PURE__ */ new WeakMap();
    function getWrapper(container) {
      var wrapper = wrappers.get(container);
      if (wrapper) return wrapper;
      var span = document.createElement("span");
      container.appendChild(span);
      wrappers.set(container, span);
      return span;
    }
    function removeWrapper(container) {
      var wrapper = wrappers.get(container);
      if (wrapper) {
        wrapper.remove();
        wrappers["delete"](container);
      }
    }
    if (createRoot) {
      var roots = /* @__PURE__ */ new WeakMap();
      return {
        mount: function mount(element, container) {
          var _wrapper$firstElement;
          var wrapper = getWrapper(container);
          var root = roots.get(wrapper);
          if (!root) {
            root = createRoot(wrapper);
            roots.set(wrapper, root);
          }
          root.render(element);
          return (_wrapper$firstElement = wrapper.firstElementChild) !== null && _wrapper$firstElement !== void 0 ? _wrapper$firstElement : wrapper;
        },
        unmount: function unmount(container) {
          var wrapper = getWrapper(container);
          var root = roots.get(wrapper);
          if (root) {
            root.unmount();
            roots["delete"](wrapper);
          }
          removeWrapper(container);
        }
      };
    }
    return {
      mount: function mount(element, container) {
        var wrapper = getWrapper(container);
        if ("render" in ReactDOM && typeof ReactDOM.render === "function") {
          var result = ReactDOM.render(element, wrapper);
          return result || wrapper;
        }
        throw new Error("ReactDOM.render is not available");
      },
      unmount: function unmount(container) {
        var wrapper = getWrapper(container);
        if ("unmountComponentAtNode" in ReactDOM && typeof ReactDOM.unmountComponentAtNode === "function") {
          ReactDOM.unmountComponentAtNode(wrapper);
        } else {
          throw new Error("ReactDOM.unmountComponentAtNode is not available");
        }
        removeWrapper(container);
      }
    };
  }
  function Root(_ref) {
    var children = _ref.children, rendered = _ref.rendered;
    (0, import_react2.useEffect)(function() {
      rendered();
    });
    return children;
  }
  function syncFlush() {
    var ready = (0, import_react2.useRef)(false);
    (0, import_react2.useEffect)(function() {
      ready.current = true;
    }, []);
    return {
      apply: function apply(f2) {
        if (ready.current) {
          queueMicrotask(function() {
            (0, import_react_dom.flushSync)(f2);
          });
        } else {
          f2();
        }
      }
    };
  }
  var ConnectionContext = /* @__PURE__ */ (0, import_react2.createContext)({
    start: null,
    end: null,
    path: null
  });
  function ConnectionWrapper(props) {
    var children = props.children;
    var _useState = (0, import_react2.useState)(null), _useState2 = _slicedToArray(_useState, 2), computedStart = _useState2[0], setStart = _useState2[1];
    var _useState3 = (0, import_react2.useState)(null), _useState4 = _slicedToArray(_useState3, 2), computedEnd = _useState4[0], setEnd = _useState4[1];
    var _useState5 = (0, import_react2.useState)(null), _useState6 = _slicedToArray(_useState5, 2), path = _useState6[0], setPath = _useState6[1];
    var start = "x" in props.start ? props.start : computedStart;
    var end = "x" in props.end ? props.end : computedEnd;
    var flush = syncFlush();
    (0, import_react2.useEffect)(function() {
      var unwatch1 = typeof props.start === "function" && props.start(function(s) {
        flush.apply(function() {
          setStart(s);
        });
      });
      var unwatch2 = typeof props.end === "function" && props.end(function(s) {
        flush.apply(function() {
          setEnd(s);
        });
      });
      return function() {
        if (unwatch1) unwatch1();
        if (unwatch2) unwatch2();
      };
    }, []);
    (0, import_react2.useEffect)(function() {
      if (start && end) void props.path(start, end).then(function(p2) {
        flush.apply(function() {
          setPath(p2);
        });
      });
    }, [start, end]);
    return /* @__PURE__ */ React.createElement(ConnectionContext.Provider, {
      value: {
        start,
        end,
        path
      }
    }, children);
  }
  function useConnection() {
    return (0, import_react2.useContext)(ConnectionContext);
  }
  var _templateObject$b;
  var _templateObject2$3;
  var Svg = yt.svg(_templateObject$b || (_templateObject$b = _taggedTemplateLiteral(["\n    overflow: visible !important;\n    position: absolute;\n    pointer-events: none;\n    width: 9999px;\n    height: 9999px;\n"])));
  var Path = yt.path(_templateObject2$3 || (_templateObject2$3 = _taggedTemplateLiteral(["\n    fill: none;\n    stroke-width: 5px;\n    stroke: steelblue;\n    pointer-events: auto;\n    ", "\n"])), function(props) {
    var _props$styles;
    return (_props$styles = props.styles) === null || _props$styles === void 0 ? void 0 : _props$styles.call(props, props);
  });
  function Connection3(props) {
    var _useConnection = useConnection(), path = _useConnection.path;
    if (!path) return null;
    return /* @__PURE__ */ React.createElement(Svg, {
      "data-testid": "connection"
    }, /* @__PURE__ */ React.createElement(Path, {
      styles: props.styles,
      d: path
    }));
  }
  function _createForOfIteratorHelper$13(r2, e) {
    var t2 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (!t2) {
      if (Array.isArray(r2) || (t2 = _unsupportedIterableToArray$13(r2)) || e && r2 && "number" == typeof r2.length) {
        t2 && (r2 = t2);
        var _n = 0, F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          return _n >= r2.length ? { done: true } : { done: false, value: r2[_n++] };
        }, e: function e2(r3) {
          throw r3;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a2 = true, u2 = false;
    return { s: function s() {
      t2 = t2.call(r2);
    }, n: function n2() {
      var r3 = t2.next();
      return a2 = r3.done, r3;
    }, e: function e2(r3) {
      u2 = true, o = r3;
    }, f: function f2() {
      try {
        a2 || null == t2["return"] || t2["return"]();
      } finally {
        if (u2) throw o;
      }
    } };
  }
  function _unsupportedIterableToArray$13(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray$13(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray$13(r2, a2) : void 0;
    }
  }
  function _arrayLikeToArray$13(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }
  function copyEvent(e) {
    var newEvent = new e.constructor(e.type);
    var current = newEvent;
    while (current = Object.getPrototypeOf(current)) {
      var keys = Object.getOwnPropertyNames(current);
      var _iterator = _createForOfIteratorHelper$13(keys), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var k2 = _step.value;
          var item = newEvent[k2];
          if (typeof item === "function") continue;
          Object.defineProperty(newEvent, k2, {
            value: e[k2]
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return newEvent;
  }
  var rootPrefix = "__reactContainer$";
  function findReactRoot(element) {
    var current = element;
    while (current) {
      if (current._reactRootContainer || Object.keys(current).some(function(key) {
        return key.startsWith(rootPrefix);
      })) return current;
      current = current.parentElement;
    }
  }
  function ownKeys$12(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread$12(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys$12(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys$12(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function useDrag(translate, getPointer) {
    return {
      start: function start(e) {
        var previous = _objectSpread$12({}, getPointer(e));
        function move(moveEvent) {
          var current = _objectSpread$12({}, getPointer(moveEvent));
          var dx = current.x - previous.x;
          var dy = current.y - previous.y;
          previous = current;
          translate(dx, dy);
        }
        function up() {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("pointercancel", up);
        }
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
      }
    };
  }
  function useNoDrag(ref, disabled) {
    React.useEffect(function() {
      var handleClick = function handleClick2(e) {
        if (disabled) return;
        var root = findReactRoot(e.target);
        var target = React.version.startsWith("16") ? document : root;
        if (target) {
          e.stopPropagation();
          target.dispatchEvent(copyEvent(e));
        }
      };
      var el = ref.current;
      el === null || el === void 0 ? void 0 : el.addEventListener("pointerdown", handleClick);
      return function() {
        el === null || el === void 0 ? void 0 : el.removeEventListener("pointerdown", handleClick);
      };
    }, [ref, disabled]);
  }
  var _templateObject$a;
  var Input2 = yt.input(_templateObject$a || (_templateObject$a = _taggedTemplateLiteral(["\n  width: 100%;\n  border-radius: 30px;\n  background-color: white;\n  padding: 2px 6px;\n  border: 1px solid #999;\n  font-size: 110%;\n  box-sizing: border-box;\n  ", "\n"])), function(props) {
    var _props$styles;
    return (_props$styles = props.styles) === null || _props$styles === void 0 ? void 0 : _props$styles.call(props, props);
  });
  function Control3(props) {
    var _React$useState = React.useState(props.data.value), _React$useState2 = _slicedToArray(_React$useState, 2), value = _React$useState2[0], setValue = _React$useState2[1];
    var ref = React.useRef(null);
    useNoDrag(ref);
    React.useEffect(function() {
      setValue(props.data.value);
    }, [props.data.value]);
    return /* @__PURE__ */ React.createElement(Input2, {
      value,
      type: props.data.type,
      ref,
      readOnly: props.data.readonly,
      onChange: function onChange(e) {
        var val = props.data.type === "number" ? +e.target.value : e.target.value;
        setValue(val);
        props.data.setValue(val);
      },
      styles: props.styles
    });
  }
  var $nodecolor = "rgba(110,136,255,0.8)";
  var $nodecolorselected = "#ffd92c";
  var $socketsize = 24;
  var $socketmargin = 6;
  var $socketcolor = "#96b38a";
  var $nodewidth = 180;
  var vars = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    $nodecolor,
    $nodecolorselected,
    $socketsize,
    $socketmargin,
    $socketcolor,
    $nodewidth
  });
  var _excluded$2 = ["init", "unmount"];
  function RefComponent(_ref) {
    var init = _ref.init, unmount = _ref.unmount, props = _objectWithoutProperties(_ref, _excluded$2);
    var ref = React.useRef(null);
    React.useEffect(function() {
      var element = ref.current;
      return function() {
        if (element) unmount(element);
      };
    }, []);
    React.useEffect(function() {
      if (ref.current) init(ref.current);
    });
    return /* @__PURE__ */ React.createElement("span", _extends({}, props, {
      ref
    }));
  }
  var _excluded$1 = ["name", "emit", "payload"];
  function RefControl(_ref) {
    var name = _ref.name, emit = _ref.emit, payload = _ref.payload, props = _objectWithoutProperties(_ref, _excluded$1);
    return /* @__PURE__ */ React.createElement(RefComponent, _extends({}, props, {
      className: name,
      init: function init(ref) {
        emit({
          type: "render",
          data: {
            type: "control",
            element: ref,
            payload
          }
        });
      },
      unmount: function unmount(ref) {
        emit({
          type: "unmount",
          data: {
            element: ref
          }
        });
      }
    }));
  }
  var _excluded = ["name", "emit", "nodeId", "side", "socketKey", "payload"];
  function RefSocket(_ref) {
    var name = _ref.name, emit = _ref.emit, nodeId = _ref.nodeId, side = _ref.side, socketKey = _ref.socketKey, payload = _ref.payload, props = _objectWithoutProperties(_ref, _excluded);
    return /* @__PURE__ */ React.createElement(RefComponent, _extends({}, props, {
      className: name,
      init: function init(ref) {
        emit({
          type: "render",
          data: {
            type: "socket",
            side,
            key: socketKey,
            nodeId,
            element: ref,
            payload
          }
        });
      },
      unmount: function unmount(ref) {
        emit({
          type: "unmount",
          data: {
            element: ref
          }
        });
      }
    }));
  }
  var _templateObject$9;
  var _templateObject2$2;
  var NodeStyles = yt.div(_templateObject$9 || (_templateObject$9 = _taggedTemplateLiteral(["\n    background: ", ";\n    border: 2px solid #4e58bf;\n    border-radius: 10px;\n    cursor: pointer;\n    box-sizing: border-box;\n    width: ", ";\n    height: ", ";\n    padding-bottom: 6px;\n    position: relative;\n    user-select: none;\n    line-height: initial;\n    font-family: Arial;\n\n    &:hover {\n        background: lighten(", ",4%);\n    }\n    ", "\n    .title {\n        color: white;\n        font-family: sans-serif;\n        font-size: 18px;\n        padding: 8px;\n    }\n    .output {\n        text-align: right;\n    }\n    .input {\n        text-align: left;\n    }\n    .output-socket {\n        text-align: right;\n        margin-right: -", "px;\n        display: inline-block;\n    }\n    .input-socket {\n        text-align: left;\n        margin-left: -", "px;\n        display: inline-block;\n    }\n    .input-title,.output-title {\n        vertical-align: middle;\n        color: white;\n        display: inline-block;\n        font-family: sans-serif;\n        font-size: 14px;\n        margin: ", "px;\n        line-height: ", "px;\n    }\n    .input-control {\n        z-index: 1;\n        width: calc(100% - ", "px);\n        vertical-align: middle;\n        display: inline-block;\n    }\n    .control {\n        display: block;\n        padding: ", "px ", "px;\n    }\n    ", "\n"])), $nodecolor, function(props) {
    return Number.isFinite(props.width) ? "".concat(props.width, "px") : "".concat($nodewidth, "px");
  }, function(props) {
    return Number.isFinite(props.height) ? "".concat(props.height, "px") : "auto";
  }, $nodecolor, function(props) {
    return props.selected && pt(_templateObject2$2 || (_templateObject2$2 = _taggedTemplateLiteral(["\n        background: ", ";\n        border-color: #e3c000;\n    "])), $nodecolorselected);
  }, $socketsize / 2 + $socketmargin, $socketsize / 2 + $socketmargin, $socketmargin, $socketsize, $socketsize + 2 * $socketmargin, $socketmargin, $socketsize / 2 + $socketmargin, function(props) {
    var _props$styles;
    return (_props$styles = props.styles) === null || _props$styles === void 0 ? void 0 : _props$styles.call(props, props);
  });
  function sortByIndex(entries) {
    entries.sort(function(a2, b2) {
      var _a$, _b$;
      var ai = ((_a$ = a2[1]) === null || _a$ === void 0 ? void 0 : _a$.index) || 0;
      var bi = ((_b$ = b2[1]) === null || _b$ === void 0 ? void 0 : _b$.index) || 0;
      return ai - bi;
    });
  }
  function Node2(props) {
    var inputs = Object.entries(props.data.inputs);
    var outputs = Object.entries(props.data.outputs);
    var controls = Object.entries(props.data.controls);
    var selected = props.data.selected || false;
    var _props$data = props.data, id = _props$data.id, label = _props$data.label, width = _props$data.width, height = _props$data.height;
    sortByIndex(inputs);
    sortByIndex(outputs);
    sortByIndex(controls);
    return /* @__PURE__ */ React.createElement(NodeStyles, {
      selected,
      width,
      height,
      styles: props.styles,
      "data-testid": "node"
    }, /* @__PURE__ */ React.createElement("div", {
      className: "title",
      "data-testid": "title"
    }, label), outputs.map(function(_ref) {
      var _ref2 = _slicedToArray(_ref, 2), key = _ref2[0], output = _ref2[1];
      return output && /* @__PURE__ */ React.createElement("div", {
        className: "output",
        key,
        "data-testid": "output-".concat(key)
      }, /* @__PURE__ */ React.createElement("div", {
        className: "output-title",
        "data-testid": "output-title"
      }, output.label), /* @__PURE__ */ React.createElement(RefSocket, {
        name: "output-socket",
        side: "output",
        socketKey: key,
        nodeId: id,
        emit: props.emit,
        payload: output.socket,
        "data-testid": "output-socket"
      }));
    }), controls.map(function(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2), key = _ref4[0], control = _ref4[1];
      return control ? /* @__PURE__ */ React.createElement(RefControl, {
        key,
        name: "control",
        emit: props.emit,
        payload: control,
        "data-testid": "control-".concat(key)
      }) : null;
    }), inputs.map(function(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2), key = _ref6[0], input = _ref6[1];
      return input && /* @__PURE__ */ React.createElement("div", {
        className: "input",
        key,
        "data-testid": "input-".concat(key)
      }, /* @__PURE__ */ React.createElement(RefSocket, {
        name: "input-socket",
        side: "input",
        socketKey: key,
        nodeId: id,
        emit: props.emit,
        payload: input.socket,
        "data-testid": "input-socket"
      }), input && (!input.control || !input.showControl) && /* @__PURE__ */ React.createElement("div", {
        className: "input-title",
        "data-testid": "input-title"
      }, input.label), input.control && input.showControl && /* @__PURE__ */ React.createElement(RefControl, {
        key,
        name: "input-control",
        emit: props.emit,
        payload: input.control,
        "data-testid": "input-control"
      }));
    }));
  }
  var _templateObject$8;
  var _templateObject2$1;
  var Styles$4 = yt.div(_templateObject$8 || (_templateObject$8 = _taggedTemplateLiteral(["\n    display: inline-block;\n    cursor: pointer;\n    border: 1px solid white;\n    border-radius: ", "px;\n    width: ", "px;\n    height: ", "px;\n    vertical-align: middle;\n    background: ", ";\n    z-index: 2;\n    box-sizing: border-box;\n    &:hover {\n      border-width: 4px;\n    }\n    &.multiple {\n      border-color: yellow;\n    }\n"])), $socketsize / 2, $socketsize, $socketsize, $socketcolor);
  var Hoverable = yt.div(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral(["\n    border-radius: ", "px;\n    padding: ", "px;\n    &:hover ", " {\n      border-width: 4px;\n    }\n"])), ($socketsize + $socketmargin * 2) / 2, $socketmargin, Styles$4);
  function Socket3(props) {
    return /* @__PURE__ */ React.createElement(Hoverable, null, /* @__PURE__ */ React.createElement(Styles$4, {
      title: props.data.name
    }));
  }
  function setup$3(props) {
    var positionWatcher = typeof (props === null || props === void 0 ? void 0 : props.socketPositionWatcher) === "undefined" ? getDOMSocketPosition() : props.socketPositionWatcher;
    var _ref = (props === null || props === void 0 ? void 0 : props.customize) || {}, node2 = _ref.node, connection = _ref.connection, socket2 = _ref.socket, control = _ref.control;
    return {
      attach: function attach(plugin) {
        positionWatcher.attach(plugin);
      },
      // eslint-disable-next-line complexity
      render: function render2(context, plugin) {
        if (context.data.type === "node") {
          var parent = plugin.parentScope();
          var Component = node2 ? node2(context.data) : Node2;
          return Component && /* @__PURE__ */ React.createElement(Component, {
            data: context.data.payload,
            emit: function emit(data) {
              return void parent.emit(data);
            }
          });
        } else if (context.data.type === "connection") {
          var _Component = connection ? connection(context.data) : Connection3;
          var payload = context.data.payload;
          var sourceOutput = payload.sourceOutput, targetInput = payload.targetInput, source = payload.source, target = payload.target;
          return _Component && /* @__PURE__ */ React.createElement(ConnectionWrapper, {
            start: context.data.start || function(change) {
              return positionWatcher.listen(source, "output", sourceOutput, change);
            },
            end: context.data.end || function(change) {
              return positionWatcher.listen(target, "input", targetInput, change);
            },
            path: /* @__PURE__ */ function() {
              var _ref2 = _asyncToGenerator(/* @__PURE__ */ import_regenerator5.default.mark(function _callee(start, end) {
                var response, _response$data, path, points, curvature;
                return import_regenerator5.default.wrap(function(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 1;
                      return plugin.emit({
                        type: "connectionpath",
                        data: {
                          payload,
                          points: [start, end]
                        }
                      });
                    case 1:
                      response = _context.sent;
                      if (response) {
                        _context.next = 2;
                        break;
                      }
                      return _context.abrupt("return", "");
                    case 2:
                      _response$data = response.data, path = _response$data.path, points = _response$data.points;
                      curvature = 0.3;
                      if (!(!path && points.length !== 2)) {
                        _context.next = 3;
                        break;
                      }
                      throw new Error("cannot render connection with a custom number of points");
                    case 3:
                      if (path) {
                        _context.next = 4;
                        break;
                      }
                      return _context.abrupt("return", payload.isLoop ? loopConnectionPath(points, curvature, 120) : classicConnectionPath(points, curvature));
                    case 4:
                      return _context.abrupt("return", path);
                    case 5:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function(_x, _x2) {
                return _ref2.apply(this, arguments);
              };
            }()
          }, /* @__PURE__ */ React.createElement(_Component, {
            data: context.data.payload
          }));
        } else if (context.data.type === "socket") {
          var _Component2 = socket2 ? socket2(context.data) : Socket3;
          return _Component2 && context.data.payload && /* @__PURE__ */ React.createElement(_Component2, {
            data: context.data.payload
          });
        } else if (context.data.type === "control") {
          var _Component3 = control && context.data.payload ? control(context.data) : context.data.payload instanceof classic.InputControl ? Control3 : null;
          return _Component3 && /* @__PURE__ */ React.createElement(_Component3, {
            data: context.data.payload
          });
        }
      }
    };
  }
  var index$4 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    vars,
    setup: setup$3,
    Connection: Connection3,
    useConnection,
    Control: Control3,
    InputControl: Control3,
    Node: Node2,
    NodeStyles,
    RefControl,
    RefSocket,
    Socket: Socket3
  });
  function useDebounce(cb, timeout) {
    var ref = (0, import_react2.useRef)(void 0);
    function cancel() {
      if (ref.current) {
        clearTimeout(ref.current);
      }
    }
    var func = function func2() {
      cancel();
      ref.current = setTimeout(function() {
        cb();
      }, timeout);
    };
    (0, import_react2.useEffect)(function() {
      return cancel;
    }, []);
    return [func, cancel];
  }
  var $contextColor = "rgba(110,136,255,0.8)";
  var $contextColorLight = "rgba(130, 153, 255, 0.8)";
  var $contextColorDark = "rgba(69, 103, 255, 0.8)";
  var $contextMenuRound = "5px";
  var $width = 120;
  var _templateObject$7;
  var CommonStyle = yt.div(_templateObject$7 || (_templateObject$7 = _taggedTemplateLiteral(["\n  color: #fff;\n  padding: 4px;\n  border-bottom: 1px solid ", ";\n  background-color: ", ";\n  cursor: pointer;\n  width: 100%;\n  position: relative;\n  &:first-child {\n    border-top-left-radius: ", ";\n    border-top-right-radius: ", ";\n  }\n  &:last-child {\n    border-bottom-left-radius: ", ";\n    border-bottom-right-radius: ", ";\n  }\n  &:hover {\n    background-color: ", ";\n  }\n"])), $contextColorDark, $contextColor, $contextMenuRound, $contextMenuRound, $contextMenuRound, $contextMenuRound, $contextColorLight);
  var _templateObject$6;
  var _templateObject2;
  var _templateObject3;
  var ItemStyle = yt(CommonStyle)(_templateObject$6 || (_templateObject$6 = _taggedTemplateLiteral(["\n    ", "\n"])), function(props) {
    return props.hasSubitems && pt(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["&:after {\n    content: '\u25BA';\n    position: absolute;\n    opacity: 0.6;\n    right: 5px;\n    top: 5px;\n    }"])));
  });
  var SubitemStyles = yt.div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    position: absolute;\n    top: 0;\n    left: 100%;\n    width: ", "px;\n"])), $width);
  function ItemElement(props) {
    var _props$components, _props$components$ite, _props$components2, _props$components2$su;
    var _React$useState = React.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), visibleSubitems = _React$useState2[0], setVisibleSubitems = _React$useState2[1];
    var setInvisibile = React.useCallback(function() {
      setVisibleSubitems(false);
    }, [setVisibleSubitems]);
    var _useDebounce = useDebounce(setInvisibile, props.delay), _useDebounce2 = _slicedToArray(_useDebounce, 2), hide = _useDebounce2[0], cancelHide = _useDebounce2[1];
    var Component = ((_props$components = props.components) === null || _props$components === void 0 ? void 0 : (_props$components$ite = _props$components.item) === null || _props$components$ite === void 0 ? void 0 : _props$components$ite.call(_props$components, props.data)) || ItemStyle;
    var Subitems = ((_props$components2 = props.components) === null || _props$components2 === void 0 ? void 0 : (_props$components2$su = _props$components2.subitems) === null || _props$components2$su === void 0 ? void 0 : _props$components2$su.call(_props$components2, props.data)) || SubitemStyles;
    return /* @__PURE__ */ React.createElement(Component, {
      onClick: function onClick(e) {
        e.stopPropagation();
        props.data.handler();
        props.hide();
      },
      hasSubitems: Boolean(props.data.subitems),
      onPointerDown: function onPointerDown(e) {
        e.stopPropagation();
      },
      onPointerOver: function onPointerOver() {
        cancelHide();
        setVisibleSubitems(true);
      },
      onPointerLeave: function onPointerLeave() {
        if (hide) hide();
      },
      "data-testid": "context-menu-item"
    }, props.children, props.data.subitems && visibleSubitems && /* @__PURE__ */ React.createElement(Subitems, null, props.data.subitems.map(function(item) {
      return /* @__PURE__ */ React.createElement(ItemElement, {
        key: item.key,
        data: item,
        delay: props.delay,
        hide: props.hide,
        components: props.components
      }, item.label);
    })));
  }
  var _templateObject$5;
  var SearchInput = yt.input(_templateObject$5 || (_templateObject$5 = _taggedTemplateLiteral(["\n  color: white;\n  padding: 1px 8px;\n  border: 1px solid white;\n  border-radius: 10px;\n  font-size: 16px;\n  font-family: serif;\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n"])));
  function Search(props) {
    var Component = props.component || SearchInput;
    return /* @__PURE__ */ React.createElement(Component, {
      value: props.value,
      onInput: function onInput(e) {
        props.onChange(e.target.value);
      },
      onPointerDown: function onPointerDown(e) {
        e.stopPropagation();
      },
      "data-testid": "context-menu-search-input"
    });
  }
  var _templateObject$4;
  var Styles$3 = yt.div(_templateObject$4 || (_templateObject$4 = _taggedTemplateLiteral(["\n  padding: 10px;\n  width: ", "px;\n  margin-top: -20px;\n  margin-left: -", "px;\n"])), $width, $width / 2);
  function Menu(props) {
    var _props$components, _props$components$mai, _props$components2, _props$components2$co, _props$components3, _props$components3$se;
    var _useDebounce = useDebounce(props.onHide, props.delay), _useDebounce2 = _slicedToArray(_useDebounce, 2), hide = _useDebounce2[0], cancelHide = _useDebounce2[1];
    var _React$useState = React.useState(""), _React$useState2 = _slicedToArray(_React$useState, 2), filter2 = _React$useState2[0], setFilter = _React$useState2[1];
    var filterRegexp = new RegExp(filter2, "i");
    var filteredList = props.items.filter(function(item) {
      return item.label.match(filterRegexp);
    });
    var Component = ((_props$components = props.components) === null || _props$components === void 0 ? void 0 : (_props$components$mai = _props$components.main) === null || _props$components$mai === void 0 ? void 0 : _props$components$mai.call(_props$components)) || Styles$3;
    var Common = ((_props$components2 = props.components) === null || _props$components2 === void 0 ? void 0 : (_props$components2$co = _props$components2.common) === null || _props$components2$co === void 0 ? void 0 : _props$components2$co.call(_props$components2)) || CommonStyle;
    return /* @__PURE__ */ React.createElement(Component, {
      onMouseOver: function onMouseOver() {
        cancelHide();
      },
      onMouseLeave: function onMouseLeave() {
        hide === null || hide === void 0 ? void 0 : hide();
      },
      onWheel: function onWheel(e) {
        e.stopPropagation();
      },
      "data-testid": "context-menu"
    }, props.searchBar && /* @__PURE__ */ React.createElement(Common, null, /* @__PURE__ */ React.createElement(Search, {
      value: filter2,
      onChange: setFilter,
      component: (_props$components3 = props.components) === null || _props$components3 === void 0 ? void 0 : (_props$components3$se = _props$components3.search) === null || _props$components3$se === void 0 ? void 0 : _props$components3$se.call(_props$components3)
    })), filteredList.map(function(item) {
      return /* @__PURE__ */ React.createElement(ItemElement, {
        key: item.key,
        data: item,
        delay: props.delay,
        hide: props.onHide,
        components: props.components
      }, item.label);
    }));
  }
  function setup$2(props) {
    var delay = typeof (props === null || props === void 0 ? void 0 : props.delay) === "undefined" ? 1e3 : props.delay;
    return {
      render: function render2(context) {
        if (context.data.type === "contextmenu") {
          return /* @__PURE__ */ React.createElement(Menu, {
            items: context.data.items,
            delay,
            searchBar: context.data.searchBar,
            onHide: context.data.onHide,
            components: props === null || props === void 0 ? void 0 : props.customize
          });
        }
      }
    };
  }
  var index$3 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    setup: setup$2,
    Item: ItemStyle,
    Subitems: SubitemStyles,
    Menu: Styles$3,
    Search: SearchInput,
    Common: CommonStyle
  });
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  freeGlobal || freeSelf || Function("return this")();
  function useIsMounted() {
    const isMounted = (0, import_react2.useRef)(false);
    (0, import_react2.useEffect)(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);
    return (0, import_react2.useCallback)(() => isMounted.current, []);
  }
  var initialSize = {
    width: void 0,
    height: void 0
  };
  function useResizeObserver(options) {
    const { ref, box = "content-box" } = options;
    const [{ width, height }, setSize] = (0, import_react2.useState)(initialSize);
    const isMounted = useIsMounted();
    const previousSize = (0, import_react2.useRef)({ ...initialSize });
    const onResize = (0, import_react2.useRef)(void 0);
    onResize.current = options.onResize;
    (0, import_react2.useEffect)(() => {
      if (!ref.current)
        return;
      if (typeof window === "undefined" || !("ResizeObserver" in window))
        return;
      const observer = new ResizeObserver(([entry]) => {
        const boxProp = box === "border-box" ? "borderBoxSize" : box === "device-pixel-content-box" ? "devicePixelContentBoxSize" : "contentBoxSize";
        const newWidth = extractSize(entry, boxProp, "inlineSize");
        const newHeight = extractSize(entry, boxProp, "blockSize");
        const hasChanged = previousSize.current.width !== newWidth || previousSize.current.height !== newHeight;
        if (hasChanged) {
          const newSize = { width: newWidth, height: newHeight };
          previousSize.current.width = newWidth;
          previousSize.current.height = newHeight;
          if (onResize.current) {
            onResize.current(newSize);
          } else {
            if (isMounted()) {
              setSize(newSize);
            }
          }
        }
      });
      observer.observe(ref.current, { box });
      return () => {
        observer.disconnect();
      };
    }, [box, ref, isMounted]);
    return { width, height };
  }
  function extractSize(entry, box, sizeType) {
    if (!entry[box]) {
      if (box === "contentBoxSize") {
        return entry.contentRect[sizeType === "inlineSize" ? "width" : "height"];
      }
      return void 0;
    }
    return Array.isArray(entry[box]) ? entry[box][0][sizeType] : (
      // @ts-ignore Support Firefox's non-standard behavior
      entry[box][sizeType]
    );
  }
  function px(value) {
    return "".concat(value, "px");
  }
  var _templateObject$3;
  var Styles$2 = yt.div(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral(["\n    position: absolute;\n    background: rgba(110, 136, 255, 0.8);\n    border: 1px solid rgb(192 206 212 / 60%);\n"])));
  function MiniNode(props) {
    return /* @__PURE__ */ React.createElement(Styles$2, {
      style: {
        left: px(props.left),
        top: px(props.top),
        width: px(props.width),
        height: px(props.height)
      },
      "data-testid": "minimap-node"
    });
  }
  var _templateObject$2;
  var MiniViewportStyles = yt.div(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral(["\n  position: absolute;\n  background: rgba(255, 251, 128, 0.32);\n  border: 1px solid #ffe52b;\n"])));
  function MiniViewport(props) {
    var scale = function scale2(v2) {
      return v2 * props.containerWidth;
    };
    var invert = function invert2(v2) {
      return v2 / props.containerWidth;
    };
    var drag = useDrag(function(dx, dy) {
      props.translate(invert(-dx), invert(-dy));
    }, function(e) {
      return {
        x: e.pageX,
        y: e.pageY
      };
    });
    return /* @__PURE__ */ React.createElement(MiniViewportStyles, {
      onPointerDown: drag.start,
      style: {
        left: px(scale(props.left)),
        top: px(scale(props.top)),
        width: px(scale(props.width)),
        height: px(scale(props.height))
      },
      "data-testid": "minimap-viewport"
    });
  }
  var _templateObject$1;
  var Styles$1 = yt.div(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["\n    position: absolute;\n    right: 24px;\n    bottom: 24px;\n    background: rgba(229, 234, 239, 0.65);\n    padding: 20px;\n    overflow: hidden;\n    border: 1px solid #b1b7ff;\n    border-radius: 8px;\n    box-sizing: border-box;\n"])));
  function Minimap(props) {
    var _ref$current;
    var ref = (0, import_react2.useRef)(null);
    var _useResizeObserver = useResizeObserver({
      // https://github.com/juliencrn/usehooks-ts/issues/663
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      ref
    }), _useResizeObserver$wi = _useResizeObserver.width, width = _useResizeObserver$wi === void 0 ? 0 : _useResizeObserver$wi;
    var containerWidth = ((_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.clientWidth) || width;
    var scale = (0, import_react2.useCallback)(function(v2) {
      return v2 * containerWidth;
    }, [containerWidth]);
    return /* @__PURE__ */ React.createElement(Styles$1, {
      size: props.size,
      style: {
        width: px(props.size * props.ratio),
        height: px(props.size)
      },
      onPointerDown: function onPointerDown(e) {
        e.stopPropagation();
        e.preventDefault();
      },
      onDoubleClick: function onDoubleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        if (!ref.current) return;
        var box = ref.current.getBoundingClientRect();
        var x2 = (e.clientX - box.left) / (props.size * props.ratio);
        var y = (e.clientY - box.top) / (props.size * props.ratio);
        props.point(x2, y);
      },
      ref,
      "data-testid": "minimap"
    }, containerWidth ? props.nodes.map(function(node2, i2) {
      return /* @__PURE__ */ React.createElement(MiniNode, {
        key: i2,
        left: scale(node2.left),
        top: scale(node2.top),
        width: scale(node2.width),
        height: scale(node2.height)
      });
    }) : null, /* @__PURE__ */ React.createElement(MiniViewport, _extends({}, props.viewport, {
      start: props.start,
      containerWidth,
      translate: props.translate
    })));
  }
  function setup$1(props) {
    return {
      render: function render2(context) {
        if (context.data.type === "minimap") {
          return /* @__PURE__ */ React.createElement(Minimap, {
            nodes: context.data.nodes,
            size: (props === null || props === void 0 ? void 0 : props.size) || 200,
            ratio: context.data.ratio,
            viewport: context.data.viewport,
            start: context.data.start,
            translate: context.data.translate,
            point: context.data.point
          });
        }
      }
    };
  }
  var index$2 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    setup: setup$1
  });
  var _templateObject;
  var pinSize = 20;
  var Styles = yt.div(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  width: ", "px;\n  height: ", "px;\n  box-sizing: border-box;\n  background: ", ";\n  border: 2px solid white;\n  border-radius: ", "px;\n"])), pinSize, pinSize, function(props) {
    return props.selected ? "#ffd92c" : "steelblue";
  }, pinSize);
  function Pin(props) {
    var drag = useDrag(function(dx, dy) {
      props.translate(dx, dy);
    }, props.pointer);
    var _props$position = props.position, x2 = _props$position.x, y = _props$position.y;
    return /* @__PURE__ */ React.createElement(Styles, {
      onPointerDown: function onPointerDown(e) {
        e.stopPropagation();
        e.preventDefault();
        drag.start(e);
        props.pointerdown();
      },
      onContextMenu: function onContextMenu(e) {
        e.stopPropagation();
        e.preventDefault();
        props.contextMenu();
      },
      selected: props.selected,
      style: {
        position: "absolute",
        top: "".concat(y - pinSize / 2, "px"),
        left: "".concat(x2 - pinSize / 2, "px")
      },
      "data-testid": "pin"
    });
  }
  function setup2(props) {
    function renderPins(data, pointer) {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, data.pins.map(function(pin) {
        return /* @__PURE__ */ React.createElement(Pin, _extends({}, pin, {
          key: pin.id,
          contextMenu: function contextMenu() {
            var _props$contextMenu;
            props === null || props === void 0 ? void 0 : (_props$contextMenu = props.contextMenu) === null || _props$contextMenu === void 0 ? void 0 : _props$contextMenu.call(props, pin.id);
          },
          translate: function translate(dx, dy) {
            var _props$translate;
            props === null || props === void 0 ? void 0 : (_props$translate = props.translate) === null || _props$translate === void 0 ? void 0 : _props$translate.call(props, pin.id, dx, dy);
          },
          pointerdown: function pointerdown() {
            var _props$pointerdown;
            props === null || props === void 0 ? void 0 : (_props$pointerdown = props.pointerdown) === null || _props$pointerdown === void 0 ? void 0 : _props$pointerdown.call(props, pin.id);
          },
          pointer
        }));
      }));
    }
    return {
      render: function render2(context, plugin) {
        var data = context.data;
        var area = plugin.parentScope(BaseAreaPlugin);
        if (data.type === "reroute-pins") {
          return renderPins(data.data, function() {
            return area.area.pointer;
          });
        }
      }
    };
  }
  var index$1 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    setup: setup2
  });
  var index3 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    classic: index$4,
    contextMenu: index$3,
    minimap: index$2,
    reroute: index$1
  });
  function _createForOfIteratorHelper3(r2, e) {
    var t2 = "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (!t2) {
      if (Array.isArray(r2) || (t2 = _unsupportedIterableToArray4(r2)) || e && r2 && "number" == typeof r2.length) {
        t2 && (r2 = t2);
        var _n = 0, F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          return _n >= r2.length ? { done: true } : { done: false, value: r2[_n++] };
        }, e: function e2(r3) {
          throw r3;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a2 = true, u2 = false;
    return { s: function s() {
      t2 = t2.call(r2);
    }, n: function n2() {
      var r3 = t2.next();
      return a2 = r3.done, r3;
    }, e: function e2(r3) {
      u2 = true, o = r3;
    }, f: function f2() {
      try {
        a2 || null == t2["return"] || t2["return"]();
      } finally {
        if (u2) throw o;
      }
    } };
  }
  function _unsupportedIterableToArray4(r2, a2) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray4(r2, a2);
      var t2 = {}.toString.call(r2).slice(8, -1);
      return "Object" === t2 && r2.constructor && (t2 = r2.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r2) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray4(r2, a2) : void 0;
    }
  }
  function _arrayLikeToArray4(r2, a2) {
    (null == a2 || a2 > r2.length) && (a2 = r2.length);
    for (var e = 0, n2 = Array(a2); e < a2; e++) n2[e] = r2[e];
    return n2;
  }
  function ownKeys3(e, r2) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread3(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t2 = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys3(Object(t2), true).forEach(function(r3) {
        _defineProperty(e, r3, t2[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys3(Object(t2)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
      });
    }
    return e;
  }
  function _callSuper5(t2, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t2, _isNativeReflectConstruct5() ? Reflect.construct(o, e || [], _getPrototypeOf(t2).constructor) : o.apply(t2, e));
  }
  function _isNativeReflectConstruct5() {
    try {
      var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t3) {
    }
    return (_isNativeReflectConstruct5 = function _isNativeReflectConstruct6() {
      return !!t2;
    })();
  }
  function _superPropGet2(t2, o, e, r2) {
    var p2 = _get(_getPrototypeOf(1 & r2 ? t2.prototype : t2), o, e);
    return 2 & r2 && "function" == typeof p2 ? function(t3) {
      return p2.apply(e, t3);
    } : p2;
  }
  var ReactPlugin = /* @__PURE__ */ function(_Scope) {
    function ReactPlugin2() {
      var _this;
      for (var _len = arguments.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
        _ref[_key] = arguments[_key];
      }
      var props = _ref[0];
      _classCallCheck(this, ReactPlugin2);
      _this = _callSuper5(this, ReactPlugin2, ["react-render"]);
      _defineProperty(_this, "presets", []);
      _this.renderer = getRenderer({
        createRoot: props === null || props === void 0 ? void 0 : props.createRoot
      });
      _this.addPipe(function(context) {
        if (!context || _typeof(context) !== "object" || !("type" in context)) return context;
        if (context.type === "unmount") {
          _this.unmount(context.data.element);
        } else if (context.type === "render") {
          if ("filled" in context.data && context.data.filled) {
            return context;
          }
          if (_this.mount(context.data.element, context)) {
            return _objectSpread3(_objectSpread3({}, context), {}, {
              data: _objectSpread3(_objectSpread3({}, context.data), {}, {
                filled: true
              })
            });
          }
        }
        return context;
      });
      return _this;
    }
    _inherits(ReactPlugin2, _Scope);
    return _createClass(ReactPlugin2, [{
      key: "setParent",
      value: function setParent(scope) {
        var _this2 = this;
        _superPropGet2(ReactPlugin2, "setParent", this, 3)([scope]);
        this.presets.forEach(function(preset) {
          if (preset.attach) preset.attach(_this2);
        });
      }
    }, {
      key: "mount",
      value: function mount(element, context) {
        var parent = this.parentScope();
        var _iterator = _createForOfIteratorHelper3(this.presets), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var preset = _step.value;
            var result = preset.render(context, this);
            if (!result) continue;
            var reactElement = /* @__PURE__ */ React.createElement(Root, {
              rendered: function rendered() {
                return void parent.emit({
                  type: "rendered",
                  data: context.data
                });
              }
            }, result);
            this.renderer.mount(reactElement, element);
            return true;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "unmount",
      value: function unmount(element) {
        this.renderer.unmount(element);
      }
      /**
       * Adds a preset to the plugin.
       * @param preset Preset that can render nodes, connections and other elements.
       */
    }, {
      key: "addPreset",
      value: function addPreset(preset) {
        var local = preset;
        if (local.attach) local.attach(this);
        this.presets.push(local);
      }
    }]);
  }(Scope);

  // ../../src/loom.js
  var LoomError = class extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "LoomError";
      this.code = code;
      this.details = details;
    }
  };
  var RestrictedDSLEvaluator = class {
    constructor(dslString, nodeId) {
      this.input = dslString;
      this.pos = 0;
      this.nodeId = nodeId;
    }
    error(msg) {
      throw new LoomError("INVALID_GRAPH", `DSL parse error: ${msg}`, {
        reason: "filter.predicate",
        nodeId: this.nodeId,
        error: msg
      });
    }
    peek() {
      return this.input[this.pos];
    }
    advance() {
      this.pos++;
    }
    skipWhitespace() {
      while (this.pos < this.input.length && /\s/.test(this.peek())) {
        this.advance();
      }
    }
    tokenize() {
      const tokens = [];
      while (this.pos < this.input.length) {
        this.skipWhitespace();
        if (this.pos >= this.input.length) break;
        const ch = this.peek();
        if (/\d/.test(ch) || ch === "-" && /\d/.test(this.input[this.pos + 1])) {
          let num = "";
          if (ch === "-") {
            num += "-";
            this.advance();
          }
          while (this.pos < this.input.length && /[\d.]/.test(this.peek())) {
            num += this.peek();
            this.advance();
          }
          tokens.push({ type: "NUMBER", value: parseFloat(num) });
        } else if (ch === "'") {
          this.advance();
          let str = "";
          while (this.pos < this.input.length && this.peek() !== "'") {
            str += this.peek();
            this.advance();
          }
          if (this.peek() !== "'") this.error("Unterminated string");
          this.advance();
          tokens.push({ type: "STRING", value: str });
        } else if (/[a-zA-Z_]/.test(ch)) {
          let ident = "";
          while (this.pos < this.input.length && /[a-zA-Z0-9_.]/.test(this.peek())) {
            ident += this.peek();
            this.advance();
          }
          if (ident === "true") tokens.push({ type: "BOOL", value: true });
          else if (ident === "false") tokens.push({ type: "BOOL", value: false });
          else tokens.push({ type: "IDENT", value: ident });
        } else if (ch === "(") {
          tokens.push({ type: "LPAREN" });
          this.advance();
        } else if (ch === ")") {
          tokens.push({ type: "RPAREN" });
          this.advance();
        } else if (ch === "!" && this.input[this.pos + 1] === "=") {
          tokens.push({ type: "NE" });
          this.advance();
          this.advance();
        } else if (ch === "!") {
          tokens.push({ type: "NOT" });
          this.advance();
        } else if (ch === "=" && this.input[this.pos + 1] === "=") {
          tokens.push({ type: "EQ" });
          this.advance();
          this.advance();
        } else if (ch === "<" && this.input[this.pos + 1] === "=") {
          tokens.push({ type: "LE" });
          this.advance();
          this.advance();
        } else if (ch === "<") {
          tokens.push({ type: "LT" });
          this.advance();
        } else if (ch === ">" && this.input[this.pos + 1] === "=") {
          tokens.push({ type: "GE" });
          this.advance();
          this.advance();
        } else if (ch === ">") {
          tokens.push({ type: "GT" });
          this.advance();
        } else if (ch === "&" && this.input[this.pos + 1] === "&") {
          tokens.push({ type: "AND" });
          this.advance();
          this.advance();
        } else if (ch === "|" && this.input[this.pos + 1] === "|") {
          tokens.push({ type: "OR" });
          this.advance();
          this.advance();
        } else if (ch === "+") {
          tokens.push({ type: "PLUS" });
          this.advance();
        } else if (ch === "-" && !/\d/.test(this.input[this.pos + 1])) {
          tokens.push({ type: "MINUS" });
          this.advance();
        } else if (ch === "*") {
          tokens.push({ type: "MUL" });
          this.advance();
        } else if (ch === "/") {
          tokens.push({ type: "DIV" });
          this.advance();
        } else {
          this.error(`Unexpected character: ${ch}`);
        }
      }
      return tokens;
    }
    parse() {
      const tokens = this.tokenize();
      this.tokens = tokens;
      this.tokenPos = 0;
      return this.parseExpression();
    }
    currentToken() {
      return this.tokens[this.tokenPos];
    }
    consumeToken() {
      this.tokenPos++;
    }
    expect(type) {
      const tok = this.currentToken();
      if (!tok || tok.type !== type) {
        this.error(`Expected ${type}, got ${tok ? tok.type : "EOF"}`);
      }
      this.consumeToken();
    }
    parseExpression() {
      return this.parseOr();
    }
    parseOr() {
      let left = this.parseAnd();
      while (this.currentToken() && this.currentToken().type === "OR") {
        this.consumeToken();
        const right = this.parseAnd();
        left = { type: "binary", op: "||", left, right };
      }
      return left;
    }
    parseAnd() {
      let left = this.parseComparison();
      while (this.currentToken() && this.currentToken().type === "AND") {
        this.consumeToken();
        const right = this.parseComparison();
        left = { type: "binary", op: "&&", left, right };
      }
      return left;
    }
    parseComparison() {
      let left = this.parseAdditive();
      const tok = this.currentToken();
      if (tok && ["EQ", "NE", "LT", "LE", "GT", "GE"].includes(tok.type)) {
        const opMap = { EQ: "==", NE: "!=", LT: "<", LE: "<=", GT: ">", GE: ">=" };
        const op = opMap[tok.type];
        this.consumeToken();
        const right = this.parseAdditive();
        return { type: "binary", op, left, right };
      }
      return left;
    }
    parseAdditive() {
      let left = this.parseMultiplicative();
      while (this.currentToken() && ["PLUS", "MINUS"].includes(this.currentToken().type)) {
        const op = this.currentToken().type === "PLUS" ? "+" : "-";
        this.consumeToken();
        const right = this.parseMultiplicative();
        left = { type: "binary", op, left, right };
      }
      return left;
    }
    parseMultiplicative() {
      let left = this.parseUnary();
      while (this.currentToken() && ["MUL", "DIV"].includes(this.currentToken().type)) {
        const op = this.currentToken().type === "MUL" ? "*" : "/";
        this.consumeToken();
        const right = this.parseUnary();
        left = { type: "binary", op, left, right };
      }
      return left;
    }
    parseUnary() {
      const tok = this.currentToken();
      if (tok && tok.type === "NOT") {
        this.consumeToken();
        const operand = this.parseUnary();
        return { type: "unary", op: "!", operand };
      }
      return this.parsePrimary();
    }
    parsePrimary() {
      const tok = this.currentToken();
      if (!tok) this.error("Unexpected end of input");
      if (tok.type === "NUMBER") {
        this.consumeToken();
        return { type: "literal", value: tok.value };
      }
      if (tok.type === "STRING") {
        this.consumeToken();
        return { type: "literal", value: tok.value };
      }
      if (tok.type === "BOOL") {
        this.consumeToken();
        return { type: "literal", value: tok.value };
      }
      if (tok.type === "IDENT") {
        const ident = tok.value;
        this.consumeToken();
        if (ident.includes(".")) {
          const parts = ident.split(".");
          if (parts.length === 2 && parts[0] === "value" && ["x", "y"].includes(parts[1])) {
            return { type: "fieldAccess", object: "value", field: parts[1] };
          }
          this.error(`Invalid field access: ${ident}`);
        }
        return { type: "identifier", name: ident };
      }
      if (tok.type === "LPAREN") {
        this.consumeToken();
        const expr = this.parseExpression();
        this.expect("RPAREN");
        return expr;
      }
      this.error(`Unexpected token: ${tok.type}`);
    }
    evaluate() {
      const ast = this.parse();
      return this.createEvaluator(ast);
    }
    createEvaluator(ast) {
      return (payload) => {
        return this.evalAst(ast, payload);
      };
    }
    evalAst(ast, payload) {
      if (ast.type === "literal") {
        return ast.value;
      }
      if (ast.type === "identifier") {
        if (ast.name === "value") return payload;
        if (ast.name === "key") return typeof payload === "string" ? payload : void 0;
        return void 0;
      }
      if (ast.type === "fieldAccess") {
        const obj = this.evalAst({ type: "identifier", name: ast.object }, payload);
        if (obj != null && typeof obj === "object") {
          return obj[ast.field];
        }
        return void 0;
      }
      if (ast.type === "binary") {
        const left = this.evalAst(ast.left, payload);
        const right = this.evalAst(ast.right, payload);
        switch (ast.op) {
          case "==":
            return left === right;
          case "!=":
            return left !== right;
          case "<":
            return left < right;
          case "<=":
            return left <= right;
          case ">":
            return left > right;
          case ">=":
            return left >= right;
          case "&&":
            return this.isTruthy(left) && this.isTruthy(right);
          case "||":
            return this.isTruthy(left) || this.isTruthy(right);
          case "+":
            if (typeof left === "number" && typeof right === "number") return left + right;
            return void 0;
          case "-":
            if (typeof left === "number" && typeof right === "number") return left - right;
            return void 0;
          case "*":
            if (typeof left === "number" && typeof right === "number") return left * right;
            return void 0;
          case "/":
            if (typeof left === "number" && typeof right === "number" && right !== 0) {
              return left / right;
            }
            return void 0;
          default:
            return void 0;
        }
      }
      if (ast.type === "unary") {
        const operand = this.evalAst(ast.operand, payload);
        if (ast.op === "!") return !this.isTruthy(operand);
        return void 0;
      }
      return void 0;
    }
    isTruthy(value) {
      return !(!value || value === 0 || value === "" || value === false || value === null || value === void 0);
    }
  };
  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }
  function coerceFiniteNumber(value, fallback = 0) {
    return isFiniteNumber(value) ? value : fallback;
  }
  function resolveStateInputValue(value, fallback) {
    if (value === null || value === void 0) return fallback;
    return coerceFiniteNumber(value, 0);
  }
  function sanitizeStateValue(value, initial) {
    return isFiniteNumber(value) ? value : initial;
  }
  function stringifyJsonValue(value, pretty = false) {
    return JSON.stringify(value, null, pretty ? 2 : 0);
  }
  function stringifyTextValue(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    const json = JSON.stringify(value);
    return json === void 0 ? "" : json;
  }
  function inspectValue(value) {
    const json = JSON.stringify(value, null, 2);
    return json === void 0 ? String(value) : json;
  }
  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }
  function collectInputs(inputs, names) {
    return names.map((name) => inputs[name]).filter((value) => value !== void 0);
  }
  function isLoomletCallable(value) {
    return Boolean(value && value.__loomletCallable === true && typeof value.call === "function");
  }
  function assertLoomletCallable(value, nodeName) {
    if (!isLoomletCallable(value)) {
      throw new LoomError("INVALID_FUNCTION_VALUE", `${nodeName} expected fn to be a Loomlet function value`);
    }
    return value;
  }
  function isLoomletTruthy(value) {
    return Boolean(value);
  }
  var POSITIONAL_BINARY_NODE_TYPES = /* @__PURE__ */ new Set([
    "math.add",
    "math.subtract",
    "math.multiply",
    "math.divide",
    "math.mod",
    "math.min",
    "math.max",
    "logic.and",
    "logic.or"
  ]);
  function canUseTwoPositionalArgs(nodeName, nodeType) {
    return Boolean(nodeType.commutative || POSITIONAL_BINARY_NODE_TYPES.has(nodeName));
  }
  function evaluateLegacyFunctionExpr(expr, env, ctx) {
    if (!expr) return null;
    if (expr.type === "number" || expr.type === "string" || expr.type === "bool" || expr.type === "null" || expr.type === "array" || expr.type === "object") {
      return expr.value;
    }
    if (expr.type === "ident") {
      if (Object.prototype.hasOwnProperty.call(env, expr.name)) return env[expr.name];
      throw new LoomError("UNDEFINED_IDENTIFIER", `Undefined identifier in function body: ${expr.name}`);
    }
    if (expr.type === "call") {
      if (Object.prototype.hasOwnProperty.call(env, expr.name) && isLoomletCallable(env[expr.name])) {
        const args = expr.args.map((arg) => {
          if (arg.named) throw new LoomError("MISSING_ARGUMENT_NAME", `User-defined function '${expr.name}' only accepts positional arguments`);
          return evaluateLegacyFunctionExpr(arg.value, env, ctx);
        });
        return env[expr.name].call(args, ctx);
      }
      const nodeType = NODE_TYPES[expr.name];
      if (!nodeType) throw new LoomError("UNKNOWN_NODE_TYPE", `Unknown node type in function body: ${expr.name}`);
      const positionalArgs = expr.args.filter((arg) => !arg.named);
      const namedArgs = expr.args.filter((arg) => arg.named);
      const inputNames = new Set((nodeType.inputs || []).map((input) => input.name));
      const paramNames = new Set((nodeType.params || []).map((param) => param.name));
      const hasUnknownNamed = namedArgs.some((arg) => !inputNames.has(arg.name) && !paramNames.has(arg.name));
      if (nodeType.commutative && positionalArgs.length > 0 && namedArgs.length > 0 && !hasUnknownNamed) {
        throw new LoomError("MISSING_ARGUMENT_NAME", `Node '${expr.name}' is commutative: arguments must be all positional or all named`);
      }
      if (!canUseTwoPositionalArgs(expr.name, nodeType) && positionalArgs.length > 1) {
        throw new LoomError("MISSING_ARGUMENT_NAME", `Argument at position 2 for '${expr.name}' requires a name`);
      }
      const inputs = {};
      const params = {};
      for (const input of nodeType.inputs || []) inputs[input.name] = input.default;
      for (const param of nodeType.params || []) params[param.name] = param.default;
      let positionalIndex = 0;
      for (const arg of positionalArgs) {
        const input = nodeType.inputs[positionalIndex++];
        if (!input) throw new LoomError("MISSING_ARGUMENT_NAME", `Too many positional arguments for '${expr.name}'`);
        const value = evaluateLegacyFunctionExpr(arg.value, env, ctx);
        inputs[input.name] = value;
        if (paramNames.has(input.name)) params[input.name] = value;
      }
      for (const arg of namedArgs) {
        const value = evaluateLegacyFunctionExpr(arg.value, env, ctx);
        if (inputNames.has(arg.name)) {
          inputs[arg.name] = value;
          if (paramNames.has(arg.name)) params[arg.name] = value;
        } else if (paramNames.has(arg.name)) {
          params[arg.name] = value;
        } else {
          throw new LoomError("UNKNOWN_ARGUMENT", `Unknown argument '${arg.name}' for '${expr.name}'`);
        }
      }
      const outputs = nodeType.evaluate(inputs, params, ctx);
      const outputDef = nodeType.outputs?.length === 1 ? nodeType.outputs[0] : nodeType.outputs?.find((output) => output.name === "out") ?? nodeType.outputs?.[0];
      return outputDef ? outputs[outputDef.name] : null;
    }
    if (expr.type === "pipe") {
      const value = evaluateLegacyFunctionExpr(expr.left, env, ctx);
      return evaluateLegacyFunctionExpr({ ...expr.call, args: [{ named: false, value: { type: "object", value } }, ...expr.call.args] }, env, ctx);
    }
    throw new LoomError("UNEXPECTED_TOKEN", `Unsupported expression in function body: ${expr.type}`);
  }
  function createLoomletFunction(params, body, closureRefs, ctx) {
    const closure = {};
    for (const [name, ref] of Object.entries(closureRefs || {})) {
      closure[name] = ctx.engine?.getValue(ref);
    }
    return {
      __loomletCallable: true,
      params: [...params],
      call(args, callCtx = ctx) {
        const env = { ...closure };
        params.forEach((name, index4) => {
          env[name] = args[index4];
        });
        return evaluateLegacyFunctionExpr(body, env, callCtx);
      }
    };
  }
  function mapFunctionValueNode(name, reducer) {
    return {
      category: "transform",
      inputs: [
        { name: "list", type: "array", default: [], kind: "behavior" },
        { name: "fn", type: "function", default: null, kind: "behavior" },
        { name: "initial", type: "any", default: null, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: name === "list.reduce" ? "any" : "array", kind: "behavior" }],
      params: [
        { name: "fn", type: "function", default: null },
        { name: "initial", type: "any", default: null }
      ],
      evaluate: (inputs, params, ctx) => reducer(toArray(inputs.list), assertLoomletCallable(inputs.fn, name), inputs.initial, ctx)
    };
  }
  function getNodeFs() {
    const getBuiltinModule = globalThis.process?.getBuiltinModule;
    if (typeof getBuiltinModule !== "function") {
      throw new LoomError("UNSUPPORTED_RUNTIME_NODE", "fs nodes are only available in the Node.js CLI runtime");
    }
    return getBuiltinModule("fs");
  }
  function getNodePath() {
    return globalThis.process.getBuiltinModule("path");
  }
  var NODE_TYPES = {
    // Phase 0 ノード
    clock: {
      category: "source",
      inputs: [],
      outputs: [{ name: "t", type: "number", kind: "behavior" }],
      params: [],
      evaluate: (inputs, params, ctx) => ({ t: ctx.time })
    },
    "function.literal": {
      category: "source",
      inputs: [],
      outputs: [{ name: "out", type: "function", kind: "behavior" }],
      params: [
        { name: "params", type: "array", default: [] },
        { name: "body", type: "any", default: null },
        { name: "closureRefs", type: "object", default: {} }
      ],
      evaluate: (inputs, params, ctx) => ({ out: createLoomletFunction(params.params || [], params.body, params.closureRefs, ctx) })
    },
    "function.call": {
      category: "transform",
      inputs: [
        { name: "fn", type: "function", default: null, kind: "behavior" },
        ...Array.from({ length: 8 }, (_, i2) => ({ name: `arg${i2 + 1}`, type: "any", default: void 0, kind: "behavior" }))
      ],
      outputs: [{ name: "out", type: "any", kind: "behavior" }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const fn = assertLoomletCallable(inputs.fn, "function.call");
        return { out: fn.call(collectInputs(inputs, Array.from({ length: 8 }, (_, i2) => `arg${i2 + 1}`)), ctx) };
      }
    },
    constant: {
      category: "source",
      inputs: [],
      outputs: [{ name: "out", type: "any", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: 0 }],
      evaluate: (inputs, params, ctx) => ({ out: params.value })
    },
    sine: {
      category: "transform",
      inputs: [
        { name: "t", type: "number", default: 0, kind: "behavior" },
        { name: "freq", type: "number", default: 1, kind: "behavior" },
        { name: "amplitude", type: "number", default: 1, kind: "behavior" },
        { name: "phase", type: "number", default: 0, kind: "behavior" },
        { name: "offset", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "freq", type: "number", default: 1 },
        { name: "amplitude", type: "number", default: 1 },
        { name: "phase", type: "number", default: 0 },
        { name: "offset", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        const t2 = inputs.t;
        const freq = inputs.freq;
        const amplitude = inputs.amplitude;
        const phase = inputs.phase;
        const offset = inputs.offset;
        return { out: Math.sin(t2 * freq * 2 * Math.PI + phase) * amplitude + offset };
      }
    },
    add: {
      category: "transform",
      commutative: true,
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" },
        { name: "b", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 },
        { name: "b", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.a + inputs.b })
    },
    multiply: {
      category: "transform",
      commutative: true,
      inputs: [
        { name: "a", type: "number", default: 1, kind: "behavior" },
        { name: "b", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 1 },
        { name: "b", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.a * inputs.b })
    },
    // 第1陣: 基本演算系
    subtract: {
      category: "transform",
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" },
        { name: "b", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 },
        { name: "b", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.a - inputs.b })
    },
    divide: {
      category: "transform",
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" },
        { name: "b", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 },
        { name: "b", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.b === 0 ? 0 : inputs.a / inputs.b })
    },
    mod: {
      category: "transform",
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" },
        { name: "b", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 },
        { name: "b", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.b === 0 ? 0 : (inputs.a % inputs.b + inputs.b) % inputs.b })
    },
    negate: {
      category: "transform",
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: -inputs.a })
    },
    abs: {
      category: "transform",
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: Math.abs(inputs.a) })
    },
    // 第2陣: 範囲操作系＋コサイン
    clamp: {
      category: "transform",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" },
        { name: "min", type: "number", default: 0, kind: "behavior" },
        { name: "max", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "min", type: "number", default: 0 },
        { name: "max", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => ({
        out: inputs.min > inputs.max ? inputs.min : Math.max(inputs.min, Math.min(inputs.max, inputs.value))
      })
    },
    lerp: {
      category: "transform",
      inputs: [
        { name: "a", type: "number", default: 0, kind: "behavior" },
        { name: "b", type: "number", default: 1, kind: "behavior" },
        { name: "t", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "a", type: "number", default: 0 },
        { name: "b", type: "number", default: 1 },
        { name: "t", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.a + (inputs.b - inputs.a) * inputs.t })
    },
    smoothstep: {
      category: "transform",
      inputs: [
        { name: "x", type: "number", default: 0, kind: "behavior" },
        { name: "edge0", type: "number", default: 0, kind: "behavior" },
        { name: "edge1", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "x", type: "number", default: 0 },
        { name: "edge0", type: "number", default: 0 },
        { name: "edge1", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => {
        const { x: x2, edge0, edge1 } = inputs;
        if (edge0 === edge1) {
          return { out: x2 < edge0 ? 0 : 1 };
        }
        let t2 = (x2 - edge0) / (edge1 - edge0);
        t2 = Math.max(0, Math.min(1, t2));
        return { out: t2 * t2 * (3 - 2 * t2) };
      }
    },
    map: {
      category: "transform",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" },
        { name: "inMin", type: "number", default: 0, kind: "behavior" },
        { name: "inMax", type: "number", default: 1, kind: "behavior" },
        { name: "outMin", type: "number", default: 0, kind: "behavior" },
        { name: "outMax", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "inMin", type: "number", default: 0 },
        { name: "inMax", type: "number", default: 1 },
        { name: "outMin", type: "number", default: 0 },
        { name: "outMax", type: "number", default: 1 },
        { name: "clamp", type: "boolean", default: false }
      ],
      evaluate: (inputs, params, ctx) => {
        const { value, inMin, inMax, outMin, outMax } = inputs;
        if (inMax === inMin) {
          return { out: outMin };
        }
        let t2 = (value - inMin) / (inMax - inMin);
        if (params.clamp === true) {
          t2 = Math.max(0, Math.min(1, t2));
        }
        return { out: outMin + (outMax - outMin) * t2 };
      }
    },
    cosine: {
      category: "transform",
      inputs: [
        { name: "t", type: "number", default: 0, kind: "behavior" },
        { name: "freq", type: "number", default: 1, kind: "behavior" },
        { name: "amplitude", type: "number", default: 1, kind: "behavior" },
        { name: "phase", type: "number", default: 0, kind: "behavior" },
        { name: "offset", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "freq", type: "number", default: 1 },
        { name: "amplitude", type: "number", default: 1 },
        { name: "phase", type: "number", default: 0 },
        { name: "offset", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        const t2 = inputs.t;
        const freq = inputs.freq;
        const amplitude = inputs.amplitude;
        const phase = inputs.phase;
        const offset = inputs.offset;
        return { out: Math.cos(t2 * freq * 2 * Math.PI + phase) * amplitude + offset };
      }
    },
    greaterThan: {
      category: "transform",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" },
        { name: "threshold", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "boolean", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "threshold", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.value > inputs.threshold })
    },
    lessThan: {
      category: "transform",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" },
        { name: "threshold", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "boolean", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "threshold", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => ({ out: inputs.value < inputs.threshold })
    },
    smoothLerp: {
      category: "state",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "rate", type: "number", default: 5 },
        { name: "initial", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
        const value = resolveStateInputValue(inputs.value, params.initial);
        const rate = coerceFiniteNumber(params.rate, 5);
        const factor = 1 - Math.exp(-rate * ctx.dt);
        return { out: prevOut + (value - prevOut) * factor };
      }
    },
    lowpass: {
      category: "state",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "tau", type: "number", default: 0.2 },
        { name: "initial", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
        const value = resolveStateInputValue(inputs.value, params.initial);
        const tau = coerceFiniteNumber(params.tau, 0.2);
        const factor = tau <= 0 ? 1 : ctx.dt / (tau + ctx.dt);
        return { out: prevOut + (value - prevOut) * factor };
      }
    },
    delay1: {
      category: "state",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "initial", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
        const value = resolveStateInputValue(inputs.value, params.initial);
        return { out: prevOut, _newState: value };
      }
    },
    integrate: {
      category: "state",
      inputs: [
        { name: "value", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "value", type: "number", default: 0 },
        { name: "initial", type: "number", default: 0 },
        { name: "min", type: "number|null", default: null },
        { name: "max", type: "number|null", default: null }
      ],
      evaluate: (inputs, params, ctx) => {
        const prevOut = sanitizeStateValue(ctx.prevOut, params.initial);
        const value = resolveStateInputValue(inputs.value, 0);
        const min3 = params.min === null ? null : coerceFiniteNumber(params.min, null);
        const max3 = params.max === null ? null : coerceFiniteNumber(params.max, null);
        let out = prevOut + value * ctx.dt;
        if (min3 !== null && out < min3) out = min3;
        if (max3 !== null && out > max3) out = max3;
        return { out };
      }
    },
    // Phase 1 入力ノード
    pointerClick: {
      category: "input",
      inputs: [],
      outputs: [{ name: "event", type: "event<vec2>", kind: "event" }],
      params: [{ name: "target", type: "string", default: "window" }],
      evaluate: (inputs, params, ctx) => {
        return { event: [] };
      },
      onStart: (node2, engine) => {
        const targetSelector = node2.params?.target || "window";
        const target = targetSelector === "window" ? window : document.querySelector(targetSelector);
        if (!target) return;
        const handler = (e) => {
          engine.dispatchEvent(node2.id + ".event", { x: e.clientX, y: e.clientY });
        };
        target.addEventListener("pointerdown", handler);
        node2._eventHandler = handler;
        node2._eventTarget = target;
      },
      onStop: (node2, engine) => {
        if (node2._eventTarget && node2._eventHandler) {
          node2._eventTarget.removeEventListener("pointerdown", node2._eventHandler);
          delete node2._eventHandler;
          delete node2._eventTarget;
        }
      }
    },
    pointerPosition: {
      category: "input",
      inputs: [],
      outputs: [{ name: "pos", type: "vec2", kind: "behavior" }],
      params: [{ name: "target", type: "string", default: "window" }],
      evaluate: (inputs, params, ctx) => {
        if (!ctx.engine || !ctx.engine._inputStates) {
          ctx.engine._inputStates = {};
        }
        const lastPos = ctx.engine._inputStates.lastPos || { x: 0, y: 0 };
        return { pos: lastPos };
      },
      onStart: (node2, engine) => {
        const targetSelector = node2.params?.target || "window";
        const target = targetSelector === "window" ? window : document.querySelector(targetSelector);
        if (!target) return;
        if (!engine._inputStates) {
          engine._inputStates = {};
        }
        const handler = (e) => {
          engine._inputStates.lastPos = { x: e.clientX, y: e.clientY };
        };
        target.addEventListener("pointermove", handler);
        node2._eventHandler = handler;
        node2._eventTarget = target;
      },
      onStop: (node2, engine) => {
        if (node2._eventTarget && node2._eventHandler) {
          node2._eventTarget.removeEventListener("pointermove", node2._eventHandler);
          delete node2._eventHandler;
          delete node2._eventTarget;
        }
      }
    },
    keyDown: {
      category: "input",
      inputs: [],
      outputs: [{ name: "event", type: "event<string>", kind: "event" }],
      params: [{ name: "key", type: "string", default: null }],
      evaluate: (inputs, params, ctx) => {
        return { event: [] };
      },
      onStart: (node2, engine) => {
        const filterKey = node2.params?.key || null;
        const handler = (e) => {
          if (!filterKey || e.key === filterKey) {
            engine.dispatchEvent(node2.id + ".event", e.key);
          }
        };
        window.addEventListener("keydown", handler);
        node2._eventHandler = handler;
      },
      onStop: (node2, engine) => {
        if (node2._eventHandler) {
          window.removeEventListener("keydown", node2._eventHandler);
          delete node2._eventHandler;
        }
      }
    },
    keyUp: {
      category: "input",
      inputs: [],
      outputs: [{ name: "event", type: "event<string>", kind: "event" }],
      params: [{ name: "key", type: "string", default: null }],
      evaluate: (inputs, params, ctx) => {
        return { event: [] };
      },
      onStart: (node2, engine) => {
        const filterKey = node2.params?.key || null;
        const handler = (e) => {
          if (!filterKey || e.key === filterKey) {
            engine.dispatchEvent(node2.id + ".event", e.key);
          }
        };
        window.addEventListener("keyup", handler);
        node2._eventHandler = handler;
      },
      onStop: (node2, engine) => {
        if (node2._eventHandler) {
          window.removeEventListener("keyup", node2._eventHandler);
          delete node2._eventHandler;
        }
      }
    },
    // Phase 1 イベント変換ノード
    filter: {
      category: "transform",
      inputs: [{ name: "event", type: "event<any>", kind: "event" }],
      outputs: [{ name: "event", type: "event<any>", kind: "event" }],
      params: [{ name: "predicate", type: "string", default: "true" }],
      evaluate: (inputs, params, ctx) => {
        const eventPayloads = inputs.event || [];
        if (!Array.isArray(eventPayloads)) {
          return { event: [] };
        }
        if (!ctx.nodePredicates) ctx.nodePredicates = /* @__PURE__ */ new Map();
        const cacheKey = params.predicate;
        let evaluator = ctx.nodePredicates.get(cacheKey);
        if (!evaluator) {
          try {
            const dslEval = new RestrictedDSLEvaluator(params.predicate);
            evaluator = dslEval.evaluate();
            ctx.nodePredicates.set(cacheKey, evaluator);
          } catch (e) {
            throw e;
          }
        }
        const filtered = eventPayloads.filter((payload) => {
          try {
            return evaluator(payload);
          } catch (e) {
            return false;
          }
        });
        return { event: filtered };
      }
    },
    sample: {
      category: "transform",
      inputs: [
        { name: "trigger", type: "event<void>", kind: "event" },
        { name: "value", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "event", type: "event<number>", kind: "event" }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const triggers = inputs.trigger || [];
        const value = inputs.value;
        if (!Array.isArray(triggers)) {
          return { event: [] };
        }
        const sampled = triggers.map(() => value);
        return { event: sampled };
      }
    },
    merge: {
      category: "transform",
      inputs: [
        { name: "a", type: "event<any>", kind: "event" },
        { name: "b", type: "event<any>", kind: "event" }
      ],
      outputs: [{ name: "event", type: "event<any>", kind: "event" }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const aPayloads = inputs.a || [];
        const bPayloads = inputs.b || [];
        const merged = [
          ...Array.isArray(aPayloads) ? aPayloads : [],
          ...Array.isArray(bPayloads) ? bPayloads : []
        ];
        return { event: merged };
      }
    },
    "text.upper": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: String(inputs.value ?? "").toUpperCase() })
    },
    "text.lower": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: String(inputs.value ?? "").toLowerCase() })
    },
    "text.trim": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: String(inputs.value ?? "").trim() })
    },
    "text.replace": {
      category: "transform",
      inputs: [
        { name: "value", type: "any", default: "", kind: "behavior" },
        { name: "search", type: "any", default: "", kind: "behavior" },
        { name: "replacement", type: "any", default: "", kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [
        { name: "value", type: "any", default: "" },
        { name: "search", type: "any", default: "" },
        { name: "replacement", type: "any", default: "" }
      ],
      evaluate: (inputs) => ({
        out: String(inputs.value ?? "").replaceAll(String(inputs.search ?? ""), String(inputs.replacement ?? ""))
      })
    },
    "text.concat": {
      category: "transform",
      inputs: Array.from({ length: 8 }, (_, i2) => ({ name: `value${i2 + 1}`, type: "any", default: void 0, kind: "behavior" })),
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: Array.from({ length: 8 }, (_, i2) => ({ name: `value${i2 + 1}`, type: "any", default: void 0 })),
      evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 8 }, (_, i2) => `value${i2 + 1}`)).map((value) => stringifyTextValue(value)).join("") })
    },
    "text.split": {
      category: "transform",
      inputs: [
        { name: "value", type: "any", default: "", kind: "behavior" },
        { name: "separator", type: "any", default: ",", kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "array", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }, { name: "separator", type: "any", default: "," }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).split(stringifyTextValue(inputs.separator)) })
    },
    "text.join": {
      category: "transform",
      inputs: [
        { name: "list", type: "array", default: [], kind: "behavior" },
        { name: "separator", type: "any", default: ",", kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [{ name: "list", type: "array", default: [] }, { name: "separator", type: "any", default: "," }],
      evaluate: (inputs) => ({ out: toArray(inputs.list).map((value) => stringifyTextValue(value)).join(stringifyTextValue(inputs.separator)) })
    },
    "text.includes": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }, { name: "search", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "boolean", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }, { name: "search", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).includes(stringifyTextValue(inputs.search)) })
    },
    "text.startsWith": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }, { name: "search", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "boolean", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }, { name: "search", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).startsWith(stringifyTextValue(inputs.search)) })
    },
    "text.endsWith": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }, { name: "search", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "boolean", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }, { name: "search", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).endsWith(stringifyTextValue(inputs.search)) })
    },
    "text.length": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).length })
    },
    "text.isEmpty": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "boolean", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value).length === 0 })
    },
    "text.stringify": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: null, kind: "behavior" }],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: null }],
      evaluate: (inputs) => ({ out: stringifyTextValue(inputs.value) })
    },
    "json.parse": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: "", kind: "behavior" }],
      outputs: [{ name: "out", type: "any", kind: "behavior" }],
      params: [{ name: "value", type: "any", default: "" }],
      evaluate: (inputs) => {
        try {
          return { out: JSON.parse(String(inputs.value ?? "")) };
        } catch (error) {
          throw new LoomError("INVALID_JSON", `JSON parse failed: ${error.message}`);
        }
      }
    },
    "json.stringify": {
      category: "transform",
      inputs: [{ name: "value", type: "any", default: null, kind: "behavior" }],
      outputs: [{ name: "out", type: "string", kind: "behavior" }],
      params: [
        { name: "value", type: "any", default: null },
        { name: "pretty", type: "boolean", default: false }
      ],
      evaluate: (inputs, params) => ({ out: stringifyJsonValue(inputs.value, params.pretty === true) })
    },
    "console.log": {
      category: "sink",
      inputs: [{ name: "value", type: "any", default: void 0, kind: "behavior" }],
      outputs: [],
      params: [],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({ type: "console.log", level: "log", value: inputs.value, nodeId: ctx.currentNodeId });
        return {};
      }
    },
    "console.warn": {
      category: "sink",
      inputs: [{ name: "value", type: "any", default: void 0, kind: "behavior" }],
      outputs: [],
      params: [],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({ type: "console.warn", level: "warn", value: inputs.value, nodeId: ctx.currentNodeId });
        return {};
      }
    },
    "console.error": {
      category: "sink",
      inputs: [{ name: "value", type: "any", default: void 0, kind: "behavior" }],
      outputs: [],
      params: [],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({ type: "console.error", level: "error", value: inputs.value, nodeId: ctx.currentNodeId });
        return {};
      }
    },
    "console.table": {
      category: "sink",
      inputs: [{ name: "value", type: "any", default: void 0, kind: "behavior" }],
      outputs: [],
      params: [],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({ type: "console.table", level: "table", value: inputs.value, nodeId: ctx.currentNodeId });
        if (typeof console.table === "function" && ctx.emitConsole === true) console.table(inputs.value);
        return {};
      }
    },
    "logic.not": { category: "transform", inputs: [{ name: "value", type: "any", default: false, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "any", default: false }], evaluate: (inputs) => ({ out: !inputs.value }) },
    "logic.and": { category: "transform", commutative: true, inputs: [{ name: "a", type: "any", default: false, kind: "behavior" }, { name: "b", type: "any", default: false, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "a", type: "any", default: false }, { name: "b", type: "any", default: false }], evaluate: (inputs) => ({ out: Boolean(inputs.a && inputs.b) }) },
    "logic.or": { category: "transform", commutative: true, inputs: [{ name: "a", type: "any", default: false, kind: "behavior" }, { name: "b", type: "any", default: false, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "a", type: "any", default: false }, { name: "b", type: "any", default: false }], evaluate: (inputs) => ({ out: Boolean(inputs.a || inputs.b) }) },
    "logic.equals": { category: "transform", inputs: [{ name: "value", type: "any", default: null, kind: "behavior" }, { name: "other", type: "any", default: null, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "any", default: null }, { name: "other", type: "any", default: null }], evaluate: (inputs) => ({ out: Object.is(inputs.value, inputs.other) }) },
    "logic.notEquals": { category: "transform", inputs: [{ name: "value", type: "any", default: null, kind: "behavior" }, { name: "other", type: "any", default: null, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "any", default: null }, { name: "other", type: "any", default: null }], evaluate: (inputs) => ({ out: !Object.is(inputs.value, inputs.other) }) },
    "logic.greaterThan": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "other", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "other", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.value > inputs.other }) },
    "logic.lessThan": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "other", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "other", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.value < inputs.other }) },
    "logic.greaterOrEqual": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "other", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "other", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.value >= inputs.other }) },
    "logic.lessOrEqual": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "other", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "other", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.value <= inputs.other }) },
    "logic.select": { category: "transform", inputs: [{ name: "condition", type: "any", default: false, kind: "behavior" }, { name: "whenTrue", type: "any", default: null, kind: "behavior" }, { name: "whenFalse", type: "any", default: null, kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "condition", type: "any", default: false }, { name: "whenTrue", type: "any", default: null }, { name: "whenFalse", type: "any", default: null }], evaluate: (inputs) => ({ out: inputs.condition ? inputs.whenTrue : inputs.whenFalse }) },
    "logic.when": { category: "transform", inputs: [{ name: "condition", type: "any", default: false, kind: "behavior" }, { name: "value", type: "any", default: null, kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "condition", type: "any", default: false }, { name: "value", type: "any", default: null }], evaluate: (inputs) => ({ out: inputs.condition ? inputs.value : null }) },
    "list.of": { category: "transform", inputs: Array.from({ length: 8 }, (_, i2) => ({ name: `value${i2 + 1}`, type: "any", default: void 0, kind: "behavior" })), outputs: [{ name: "out", type: "array", kind: "behavior" }], params: Array.from({ length: 8 }, (_, i2) => ({ name: `value${i2 + 1}`, type: "any", default: void 0 })), evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 8 }, (_, i2) => `value${i2 + 1}`)) }) },
    "list.range": { category: "transform", inputs: [{ name: "start", type: "number", default: 0, kind: "behavior" }, { name: "end", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "array", kind: "behavior" }], params: [{ name: "start", type: "number", default: 0 }, { name: "end", type: "number", default: 0 }], evaluate: (inputs) => {
      const start = Math.trunc(inputs.start);
      const end = Math.trunc(inputs.end);
      const step = start <= end ? 1 : -1;
      const out = [];
      for (let n2 = start; step > 0 ? n2 <= end : n2 >= end; n2 += step) out.push(n2);
      return { out };
    } },
    "list.length": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }], evaluate: (inputs) => ({ out: toArray(inputs.list).length }) },
    "list.at": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }, { name: "index", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }, { name: "index", type: "number", default: 0 }], evaluate: (inputs) => {
      const list = toArray(inputs.list);
      const raw = Math.trunc(inputs.index);
      const index4 = raw < 0 ? list.length + raw : raw;
      return { out: index4 >= 0 && index4 < list.length ? list[index4] : null };
    } },
    "list.first": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }], evaluate: (inputs) => ({ out: toArray(inputs.list)[0] ?? null }) },
    "list.last": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }], evaluate: (inputs) => {
      const list = toArray(inputs.list);
      return { out: list.length ? list[list.length - 1] : null };
    } },
    "list.map": mapFunctionValueNode("list.map", (list, fn, initial, ctx) => ({ out: list.map((item) => fn.call([item], ctx)) })),
    "list.filter": mapFunctionValueNode("list.filter", (list, fn, initial, ctx) => ({ out: list.filter((item) => isLoomletTruthy(fn.call([item], ctx))) })),
    "list.reduce": mapFunctionValueNode("list.reduce", (list, fn, initial, ctx) => ({ out: list.reduce((acc, item) => fn.call([acc, item], ctx), initial) })),
    "list.join": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }, { name: "separator", type: "any", default: ",", kind: "behavior" }], outputs: [{ name: "out", type: "string", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }, { name: "separator", type: "any", default: "," }], evaluate: (inputs) => ({ out: toArray(inputs.list).map((value) => stringifyTextValue(value)).join(stringifyTextValue(inputs.separator)) }) },
    "list.reverse": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }], outputs: [{ name: "out", type: "array", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }], evaluate: (inputs) => ({ out: [...toArray(inputs.list)].reverse() }) },
    "list.sort": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }], outputs: [{ name: "out", type: "array", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }], evaluate: (inputs) => {
      const list = [...toArray(inputs.list)];
      if (list.every((value) => typeof value === "number")) list.sort((a2, b2) => a2 - b2);
      else list.sort((a2, b2) => String(a2).localeCompare(String(b2)));
      return { out: list };
    } },
    "list.take": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }, { name: "count", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "array", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }, { name: "count", type: "number", default: 0 }], evaluate: (inputs) => ({ out: toArray(inputs.list).slice(0, Math.max(0, Math.trunc(inputs.count))) }) },
    "list.drop": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }, { name: "count", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "array", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }, { name: "count", type: "number", default: 0 }], evaluate: (inputs) => ({ out: toArray(inputs.list).slice(Math.max(0, Math.trunc(inputs.count))) }) },
    "list.concat": { category: "transform", inputs: Array.from({ length: 4 }, (_, i2) => ({ name: `list${i2 + 1}`, type: "array", default: void 0, kind: "behavior" })), outputs: [{ name: "out", type: "array", kind: "behavior" }], params: Array.from({ length: 4 }, (_, i2) => ({ name: `list${i2 + 1}`, type: "array", default: void 0 })), evaluate: (inputs) => ({ out: collectInputs(inputs, Array.from({ length: 4 }, (_, i2) => `list${i2 + 1}`)).flatMap((value) => toArray(value)) }) },
    "math.add": { category: "transform", commutative: true, inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.a + inputs.b }) },
    "math.subtract": { category: "transform", inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.a - inputs.b }) },
    "math.multiply": { category: "transform", commutative: true, inputs: [{ name: "a", type: "number", default: 1, kind: "behavior" }, { name: "b", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 1 }, { name: "b", type: "number", default: 1 }], evaluate: (inputs) => ({ out: inputs.a * inputs.b }) },
    "math.divide": { category: "transform", inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 1 }], evaluate: (inputs) => ({ out: inputs.b === 0 ? 0 : inputs.a / inputs.b }) },
    "math.mod": { category: "transform", inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 1 }], evaluate: (inputs) => ({ out: inputs.b === 0 ? 0 : (inputs.a % inputs.b + inputs.b) % inputs.b }) },
    "math.abs": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.abs(inputs.value) }) },
    "math.clamp": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "min", type: "number", default: 0, kind: "behavior" }, { name: "max", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "min", type: "number", default: 0 }, { name: "max", type: "number", default: 1 }], evaluate: (inputs) => ({ out: inputs.min > inputs.max ? inputs.min : Math.max(inputs.min, Math.min(inputs.max, inputs.value)) }) },
    "math.map": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "inMin", type: "number", default: 0, kind: "behavior" }, { name: "inMax", type: "number", default: 1, kind: "behavior" }, { name: "outMin", type: "number", default: 0, kind: "behavior" }, { name: "outMax", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "inMin", type: "number", default: 0 }, { name: "inMax", type: "number", default: 1 }, { name: "outMin", type: "number", default: 0 }, { name: "outMax", type: "number", default: 1 }, { name: "clamp", type: "boolean", default: false }], evaluate: (inputs, params) => {
      if (inputs.inMax === inputs.inMin) return { out: inputs.outMin };
      let t2 = (inputs.value - inputs.inMin) / (inputs.inMax - inputs.inMin);
      if (params.clamp === true) t2 = Math.max(0, Math.min(1, t2));
      return { out: inputs.outMin + (inputs.outMax - inputs.outMin) * t2 };
    } },
    "math.lerp": { category: "transform", inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 1, kind: "behavior" }, { name: "t", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 1 }, { name: "t", type: "number", default: 0 }], evaluate: (inputs) => ({ out: inputs.a + (inputs.b - inputs.a) * inputs.t }) },
    "math.smoothstep": { category: "transform", inputs: [{ name: "x", type: "number", default: 0, kind: "behavior" }, { name: "edge0", type: "number", default: 0, kind: "behavior" }, { name: "edge1", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "x", type: "number", default: 0 }, { name: "edge0", type: "number", default: 0 }, { name: "edge1", type: "number", default: 1 }], evaluate: (inputs) => {
      if (inputs.edge0 === inputs.edge1) return { out: inputs.x < inputs.edge0 ? 0 : 1 };
      let t2 = (inputs.x - inputs.edge0) / (inputs.edge1 - inputs.edge0);
      t2 = Math.max(0, Math.min(1, t2));
      return { out: t2 * t2 * (3 - 2 * t2) };
    } },
    "math.cosine": { category: "transform", inputs: [{ name: "t", type: "number", default: 0, kind: "behavior" }, { name: "freq", type: "number", default: 1, kind: "behavior" }, { name: "amplitude", type: "number", default: 1, kind: "behavior" }, { name: "phase", type: "number", default: 0, kind: "behavior" }, { name: "offset", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "freq", type: "number", default: 1 }, { name: "amplitude", type: "number", default: 1 }, { name: "phase", type: "number", default: 0 }, { name: "offset", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.cos(inputs.t * inputs.freq * 2 * Math.PI + inputs.phase) * inputs.amplitude + inputs.offset }) },
    "math.floor": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.floor(inputs.value) }) },
    "math.ceil": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.ceil(inputs.value) }) },
    "math.round": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.round(inputs.value) }) },
    "math.min": { category: "transform", commutative: true, inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.min(inputs.a, inputs.b) }) },
    "math.max": { category: "transform", commutative: true, inputs: [{ name: "a", type: "number", default: 0, kind: "behavior" }, { name: "b", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "a", type: "number", default: 0 }, { name: "b", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.max(inputs.a, inputs.b) }) },
    "math.tan": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.tan(inputs.value) }) },
    "math.sqrt": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }], evaluate: (inputs) => ({ out: Math.sqrt(inputs.value) }) },
    "math.pow": { category: "transform", inputs: [{ name: "value", type: "number", default: 0, kind: "behavior" }, { name: "exponent", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "value", type: "number", default: 0 }, { name: "exponent", type: "number", default: 1 }], evaluate: (inputs) => ({ out: Math.pow(inputs.value, inputs.exponent) }) },
    "random.value": { category: "source", inputs: [], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [], evaluate: () => ({ out: Math.random() }) },
    "random.range": { category: "transform", inputs: [{ name: "min", type: "number", default: 0, kind: "behavior" }, { name: "max", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "min", type: "number", default: 0 }, { name: "max", type: "number", default: 1 }], evaluate: (inputs) => ({ out: inputs.min + Math.random() * (inputs.max - inputs.min) }) },
    "random.int": { category: "transform", inputs: [{ name: "min", type: "number", default: 0, kind: "behavior" }, { name: "max", type: "number", default: 1, kind: "behavior" }], outputs: [{ name: "out", type: "number", kind: "behavior" }], params: [{ name: "min", type: "number", default: 0 }, { name: "max", type: "number", default: 1 }], evaluate: (inputs) => {
      const min3 = Math.ceil(Math.min(inputs.min, inputs.max));
      const max3 = Math.floor(Math.max(inputs.min, inputs.max));
      return { out: Math.floor(Math.random() * (max3 - min3 + 1)) + min3 };
    } },
    "random.choice": { category: "transform", inputs: [{ name: "list", type: "array", default: [], kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "list", type: "array", default: [] }], evaluate: (inputs) => {
      const list = toArray(inputs.list);
      return { out: list.length ? list[Math.floor(Math.random() * list.length)] : null };
    } },
    "debug.inspect": { category: "transform", inputs: [{ name: "value", type: "any", default: null, kind: "behavior" }], outputs: [{ name: "out", type: "string", kind: "behavior" }], params: [{ name: "value", type: "any", default: null }], evaluate: (inputs) => ({ out: inspectValue(inputs.value) }) },
    "debug.trace": { category: "transform", inputs: [{ name: "value", type: "any", default: null, kind: "behavior" }, { name: "label", type: "string", default: "trace", kind: "behavior" }], outputs: [{ name: "out", type: "any", kind: "behavior" }], params: [{ name: "value", type: "any", default: null }, { name: "label", type: "string", default: "trace" }], evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({ type: "debug.trace", label: inputs.label, value: inputs.value, nodeId: ctx.currentNodeId });
      return { out: inputs.value };
    } },
    "debug.assert": { category: "transform", inputs: [{ name: "condition", type: "any", default: false, kind: "behavior" }, { name: "message", type: "string", default: "Assertion failed", kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "condition", type: "any", default: false }, { name: "message", type: "string", default: "Assertion failed" }], evaluate: (inputs) => {
      if (!inputs.condition) throw new LoomError("ASSERTION_FAILED", stringifyTextValue(inputs.message) || "Assertion failed");
      return { out: true };
    } },
    "fs.readText": { category: "source", inputs: [{ name: "path", type: "string", default: "", kind: "behavior" }], outputs: [{ name: "out", type: "string", kind: "behavior" }], params: [{ name: "path", type: "string", default: "" }], evaluate: (inputs) => ({ out: getNodeFs().readFileSync(String(inputs.path), "utf8") }) },
    "fs.writeText": { category: "sink", inputs: [{ name: "path", type: "string", default: "", kind: "behavior" }, { name: "value", type: "any", default: "", kind: "behavior" }], outputs: [], params: [{ name: "path", type: "string", default: "" }, { name: "value", type: "any", default: "" }], evaluate: (inputs) => {
      const fs = getNodeFs();
      const path = getNodePath();
      fs.mkdirSync(path.dirname(String(inputs.path)), { recursive: true });
      fs.writeFileSync(String(inputs.path), stringifyTextValue(inputs.value), "utf8");
      return {};
    } },
    "fs.exists": { category: "source", inputs: [{ name: "path", type: "string", default: "", kind: "behavior" }], outputs: [{ name: "out", type: "boolean", kind: "behavior" }], params: [{ name: "path", type: "string", default: "" }], evaluate: (inputs) => ({ out: getNodeFs().existsSync(String(inputs.path)) }) },
    "fs.list": { category: "source", inputs: [{ name: "path", type: "string", default: ".", kind: "behavior" }], outputs: [{ name: "out", type: "array", kind: "behavior" }], params: [{ name: "path", type: "string", default: "." }], evaluate: (inputs) => ({ out: getNodeFs().readdirSync(String(inputs.path)) }) },
    // Scene Sync effect nodes
    "scene.setPosition": {
      category: "sink",
      inputs: [
        { name: "objectId", type: "string", default: "", kind: "behavior" },
        { name: "x", type: "number", default: 0, kind: "behavior" },
        { name: "y", type: "number", default: 0, kind: "behavior" },
        { name: "z", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "objectId", type: "string", default: "" },
        { name: "x", type: "number", default: 0 },
        { name: "y", type: "number", default: 0 },
        { name: "z", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({
          type: "scene.setPosition",
          objectId: inputs.objectId,
          position: [inputs.x, inputs.y, inputs.z],
          target: "scenesync",
          nodeId: ctx.currentNodeId
        });
        return {};
      }
    },
    "scene.setRotation": {
      category: "sink",
      inputs: [
        { name: "objectId", type: "string", default: "", kind: "behavior" },
        { name: "x", type: "number", default: 0, kind: "behavior" },
        { name: "y", type: "number", default: 0, kind: "behavior" },
        { name: "z", type: "number", default: 0, kind: "behavior" },
        { name: "w", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "objectId", type: "string", default: "" },
        { name: "x", type: "number", default: 0 },
        { name: "y", type: "number", default: 0 },
        { name: "z", type: "number", default: 0 },
        { name: "w", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({
          type: "scene.setRotation",
          objectId: inputs.objectId,
          rotation: [inputs.x, inputs.y, inputs.z, inputs.w],
          target: "scenesync",
          nodeId: ctx.currentNodeId
        });
        return {};
      }
    },
    "scene.setScale": {
      category: "sink",
      inputs: [
        { name: "objectId", type: "string", default: "", kind: "behavior" },
        { name: "x", type: "number", default: 1, kind: "behavior" },
        { name: "y", type: "number", default: 1, kind: "behavior" },
        { name: "z", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "objectId", type: "string", default: "" },
        { name: "x", type: "number", default: 1 },
        { name: "y", type: "number", default: 1 },
        { name: "z", type: "number", default: 1 }
      ],
      evaluate: (inputs, params, ctx) => {
        ctx.engine?._recordEffect({
          type: "scene.setScale",
          objectId: inputs.objectId,
          scale: [inputs.x, inputs.y, inputs.z],
          target: "scenesync",
          nodeId: ctx.currentNodeId
        });
        return {};
      }
    },
    // DOM シンクノード
    setText: {
      category: "sink",
      inputs: [
        { name: "value", type: "any", default: "", kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" }
      ],
      evaluate: (inputs, params, ctx) => {
        if (!params.target) return {};
        const el = document.querySelector(params.target);
        if (el) el.textContent = String(inputs.value);
        return {};
      }
    },
    setStyle: {
      category: "sink",
      inputs: [
        { name: "value", type: "any", default: "", kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "property", type: "string", default: "" },
        { name: "unit", type: "string", default: "" }
      ],
      evaluate: (inputs, params, ctx) => {
        if (!params.target || !params.property) return {};
        const el = document.querySelector(params.target);
        if (el) el.style[params.property] = String(inputs.value) + params.unit;
        return {};
      }
    },
    setClass: {
      category: "sink",
      inputs: [
        { name: "enabled", type: "boolean", default: true, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "className", type: "string", default: "" }
      ],
      evaluate: (inputs, params, ctx) => {
        if (!params.target || !params.className) return {};
        const el = document.querySelector(params.target);
        if (!el) return {};
        el.classList.toggle(params.className, Boolean(inputs.enabled));
        return {};
      }
    },
    setCssVar: {
      category: "sink",
      inputs: [
        { name: "value", type: "any", default: 0, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "name", type: "string", default: "" },
        { name: "unit", type: "string", default: "" }
      ],
      evaluate: (inputs, params, ctx) => {
        if (!params.target || !params.name) return {};
        if (inputs.value === null || inputs.value === void 0) return {};
        const el = document.querySelector(params.target);
        if (!el) return {};
        const cssVarName = params.name.startsWith("--") ? params.name : `--${params.name}`;
        el.style.setProperty(cssVarName, String(inputs.value) + params.unit);
        return {};
      }
    },
    setTransform2D: {
      category: "sink",
      inputs: [
        { name: "x", type: "number", default: 0, kind: "behavior" },
        { name: "y", type: "number", default: 0, kind: "behavior" },
        { name: "scale", type: "number", default: 1, kind: "behavior" },
        { name: "rotate", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "unit", type: "string", default: "px" },
        { name: "rotateUnit", type: "string", default: "deg" }
      ],
      evaluate: (inputs, params, ctx) => {
        if (!params.target) return {};
        const el = document.querySelector(params.target);
        if (!el) return {};
        el.style.transform = `translate(${inputs.x}${params.unit}, ${inputs.y}${params.unit}) scale(${inputs.scale}) rotate(${inputs.rotate}${params.rotateUnit})`;
        return {};
      }
    },
    setAttr: {
      category: "sink",
      inputs: [
        { name: "value", type: "any", default: "", kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "name", type: "string", default: "" }
      ],
      evaluate: (inputs, params, ctx) => {
        if (!params.target || !params.name) return {};
        const el = document.querySelector(params.target);
        if (el) el.setAttribute(params.name, String(inputs.value));
        return {};
      }
    },
    "time.serverClock": {
      category: "source",
      inputs: [],
      outputs: [{ name: "t", type: "number", kind: "behavior" }],
      params: [],
      evaluate: (inputs, params, ctx) => ({ t: ctx.time })
    },
    "math.sine": {
      category: "transform",
      inputs: [
        { name: "t", type: "number", default: 0, kind: "behavior" },
        { name: "freq", type: "number", default: 1, kind: "behavior" },
        { name: "amplitude", type: "number", default: 1, kind: "behavior" },
        { name: "offset", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [{ name: "out", type: "number", kind: "behavior" }],
      params: [
        { name: "freq", type: "number", default: 1 },
        { name: "amplitude", type: "number", default: 1 },
        { name: "offset", type: "number", default: 0 }
      ],
      evaluate: (inputs, params, ctx) => {
        const t2 = inputs.t;
        const freq = inputs.freq;
        const amplitude = inputs.amplitude;
        const offset = inputs.offset;
        return { out: Math.sin(t2 * freq * 2 * Math.PI) * amplitude + offset };
      }
    },
    log: {
      category: "output",
      inputs: [
        { name: "value", type: "any", default: void 0, kind: "behavior" }
      ],
      outputs: [
        { name: "value", type: "any", kind: "behavior" }
      ],
      params: [
        { name: "label", type: "string", default: "" }
      ],
      evaluate: (inputs, params, ctx) => {
        const label = params.label ?? "";
        const message = label ? `${label}: ${inspectValue(inputs.value)}` : inspectValue(inputs.value);
        ctx.engine?._recordEffect({ type: "log", message, nodeId: ctx.currentNodeId });
        return { value: inputs.value };
      }
    }
  };

  // ../../editor-studio/src/rete-operation-helpers.js
  function connectionToAddEdgeOp(connection) {
    return {
      type: "addEdge",
      edge: {
        id: "",
        fromNodeId: connection.source,
        fromPort: connection.sourceOutput,
        toNodeId: connection.target,
        toPort: connection.targetInput
      }
    };
  }
  function translateToMoveNodeOp(data) {
    return {
      type: "moveNode",
      id: data.id,
      position: { x: data.position.x, y: data.position.y }
    };
  }
  function controlValueToUpdateParamOp(nodeId, key, rawValue, controlType) {
    const parsed = controlType === "number" ? Number(rawValue) : rawValue;
    return {
      type: "updateParam",
      id: nodeId,
      key,
      value: controlType === "number" && Number.isFinite(parsed) ? parsed : rawValue
    };
  }

  // ../../editor-studio/src/node-editor-view-diff.js
  function cloneEditorModelSnapshot(editorModel) {
    return JSON.parse(JSON.stringify(editorModel));
  }
  function canPatchEditorModel(previous, next2) {
    if (!previous || !next2) return false;
    if (!previous.nodesById || !next2.nodesById) return false;
    if (!previous.edgesById || !next2.edgesById) return false;
    if (!Array.isArray(previous.order) || !Array.isArray(next2.order)) return false;
    return true;
  }
  function getAddedNodeIds(previous, next2) {
    return next2.order.filter((id) => !previous.nodesById[id]);
  }
  function getRemovedNodeIds(previous, next2) {
    return previous.order.filter((id) => !next2.nodesById[id]);
  }
  function getCommonNodeIds(previous, next2) {
    return next2.order.filter((id) => previous.nodesById[id] && next2.nodesById[id]);
  }
  function getAddedEdgeIds(previous, next2) {
    return Object.keys(next2.edgesById || {}).filter((id) => !previous.edgesById?.[id]);
  }
  function getRemovedEdgeIds(previous, next2) {
    return Object.keys(previous.edgesById || {}).filter((id) => !next2.edgesById?.[id]);
  }
  function shouldRecreateNode(previousNode, nextNode) {
    if (previousNode.type !== nextNode.type) return true;
    if (previousNode.category !== nextNode.category) return true;
    if ((previousNode.label || "") !== (nextNode.label || "")) return true;
    const prevParamKeys = Object.keys(previousNode.params || {}).sort();
    const nextParamKeys = Object.keys(nextNode.params || {}).sort();
    if (prevParamKeys.join("\0") !== nextParamKeys.join("\0")) return true;
    return false;
  }
  function sameParams(a2, b2) {
    return JSON.stringify(a2 || {}) === JSON.stringify(b2 || {});
  }
  function samePosition(a2, b2) {
    return a2?.x === b2?.x && a2?.y === b2?.y;
  }

  // ../../editor-studio/src/node-editor-view.js
  var socket = new classic.Socket("value");
  function getPortName(port) {
    return typeof port === "string" ? port : port.name;
  }
  function createReteNode(editorNode, onControl) {
    const nodeTypeDef = NODE_TYPES[editorNode.type];
    const displayLabel = editorNode.label || editorNode.type;
    const node2 = new classic.Node(displayLabel);
    node2.id = editorNode.id;
    node2._editorNode = editorNode;
    if (nodeTypeDef) {
      for (const input of nodeTypeDef.inputs || []) {
        const name = getPortName(input);
        node2.addInput(name, new classic.Input(socket, name));
      }
      for (const output of nodeTypeDef.outputs || []) {
        const name = getPortName(output);
        node2.addOutput(name, new classic.Output(socket, name));
      }
    }
    const paramDefs = nodeTypeDef?.params || [];
    for (const [key, value] of Object.entries(editorNode.params || {})) {
      const paramDef = paramDefs.find((p2) => p2.name === key);
      const controlType = paramDef?.type === "number" || typeof value === "number" ? "number" : "text";
      const ctrl = new classic.InputControl(controlType, {
        initial: value,
        change(v2) {
          onControl({
            ...controlValueToUpdateParamOp(editorNode.id, key, v2, controlType),
            source: "nodeEditorControl"
          });
        }
      });
      node2.addControl(key, ctrl);
    }
    return node2;
  }
  function findReteConnectionIdByEdgeId(connectionMap, edgeId) {
    for (const [connectionId, mappedEdgeId] of connectionMap.entries()) {
      if (mappedEdgeId === edgeId) return connectionId;
    }
    return null;
  }
  var NodeEditorView = class {
    constructor(container, { onOperation, onError, onSelectNode } = {}) {
      this.container = container;
      this.onOperation = onOperation || (() => {
      });
      this.onError = onError || ((e) => console.error("NodeEditorView:", e));
      this.onSelectNode = onSelectNode || (() => {
      });
      this.isRendering = false;
      this.connectionMap = /* @__PURE__ */ new Map();
      this._renderLock = null;
      this.currentEditorModel = null;
      this.editor = new NodeEditor();
      this.area = new AreaPlugin(this.container);
      this.connectionPlugin = new ConnectionPlugin();
      this.renderPlugin = new ReactPlugin();
      this.renderPlugin.addPreset(index3.classic.setup());
      this.connectionPlugin.addPreset(index2.classic.setup());
      this.editor.use(this.area);
      this.area.use(this.connectionPlugin);
      this.area.use(this.renderPlugin);
      this._setupPipes();
    }
    _setupPipes() {
      this.editor.addPipe((context) => {
        if (!this.isRendering) {
          if (context.type === "connectioncreated") {
            this._onConnectionCreated(context.data);
          } else if (context.type === "connectionremoved") {
            this._onConnectionRemoved(context.data);
          }
        }
        return context;
      });
      this.area.addPipe((context) => {
        if (!this.isRendering && context.type === "nodetranslated") {
          this._onNodeTranslated(context.data);
        }
        if (!this.isRendering && context.type === "nodepicked") {
          const nodeId = context.data?.id;
          if (nodeId && this.editor.getNode(nodeId)) {
            this.onSelectNode(nodeId);
          }
        }
        return context;
      });
    }
    _onConnectionCreated(connection) {
      try {
        const edgeId = `${connection.source}.${connection.sourceOutput}->${connection.target}.${connection.targetInput}`;
        this.connectionMap.set(connection.id, edgeId);
        this.onOperation(connectionToAddEdgeOp(connection));
      } catch (e) {
        this.onError(e);
      }
    }
    _onConnectionRemoved(connection) {
      const edgeId = this.connectionMap.get(connection.id);
      if (edgeId) {
        this.connectionMap.delete(connection.id);
        this.onOperation({ type: "removeEdge", edgeId });
      }
    }
    _onNodeTranslated(data) {
      this.onOperation(translateToMoveNodeOp(data));
    }
    async _addReteNode(editorNode) {
      const reteNode = createReteNode(editorNode, (op) => {
        if (!this.isRendering) {
          this.onOperation(op);
        }
      });
      await this.editor.addNode(reteNode);
      const pos = editorNode.position ?? { x: 0, y: 0 };
      await this.area.translate(reteNode.id, { x: pos.x, y: pos.y });
      return reteNode;
    }
    async _addReteConnection(edge) {
      const sourceNode = this.editor.getNode(edge.fromNodeId);
      const targetNode = this.editor.getNode(edge.toNodeId);
      if (!sourceNode || !targetNode) return false;
      try {
        const conn = new classic.Connection(
          sourceNode,
          edge.fromPort,
          targetNode,
          edge.toPort
        );
        await this.editor.addConnection(conn);
        this.connectionMap.set(conn.id, edge.id);
        return true;
      } catch (e) {
        console.warn("renderModel: skipping connection", edge.id, e.message);
        return false;
      }
    }
    async _removeReteConnectionByEdgeId(edgeId) {
      const connectionId = findReteConnectionIdByEdgeId(this.connectionMap, edgeId);
      if (!connectionId) return false;
      const connection = this.editor.getConnection(connectionId);
      if (!connection) {
        this.connectionMap.delete(connectionId);
        return false;
      }
      await this.editor.removeConnection(connection.id);
      this.connectionMap.delete(connectionId);
      return true;
    }
    async _removeReteNode(nodeId) {
      const node2 = this.editor.getNode(nodeId);
      if (!node2) return false;
      await this.editor.removeNode(nodeId);
      return true;
    }
    async _renderModelFull(editorModel) {
      if (this._renderLock) {
        await this._renderLock;
      }
      let resolve;
      this._renderLock = new Promise((r2) => {
        resolve = r2;
      });
      this.isRendering = true;
      this.connectionMap.clear();
      try {
        await this.editor.clear();
        for (const nodeId of editorModel.order) {
          const node2 = editorModel.nodesById[nodeId];
          if (!node2) continue;
          await this._addReteNode(node2);
        }
        for (const edge of Object.values(editorModel.edgesById)) {
          await this._addReteConnection(edge);
        }
      } finally {
        this.isRendering = false;
        resolve();
        this._renderLock = null;
      }
    }
    async _patchModel(previous, next2) {
      if (this._renderLock) {
        await this._renderLock;
      }
      let resolve;
      this._renderLock = new Promise((r2) => {
        resolve = r2;
      });
      this.isRendering = true;
      try {
        const removedNodeIds = getRemovedNodeIds(previous, next2);
        const addedNodeIds = getAddedNodeIds(previous, next2);
        const commonNodeIds = getCommonNodeIds(previous, next2);
        const recreateNodeIds = /* @__PURE__ */ new Set();
        for (const nodeId of commonNodeIds) {
          const prevNode = previous.nodesById[nodeId];
          const nextNode = next2.nodesById[nodeId];
          if (shouldRecreateNode(prevNode, nextNode) || !sameParams(prevNode.params, nextNode.params)) {
            recreateNodeIds.add(nodeId);
          }
        }
        const removedEdgeIds = new Set(getRemovedEdgeIds(previous, next2));
        const addedEdgeIds = new Set(getAddedEdgeIds(previous, next2));
        for (const edge of Object.values(previous.edgesById || {})) {
          if (removedNodeIds.includes(edge.fromNodeId) || removedNodeIds.includes(edge.toNodeId) || recreateNodeIds.has(edge.fromNodeId) || recreateNodeIds.has(edge.toNodeId)) {
            removedEdgeIds.add(edge.id);
          }
        }
        for (const edgeId of removedEdgeIds) {
          await this._removeReteConnectionByEdgeId(edgeId);
        }
        for (const nodeId of removedNodeIds) {
          await this._removeReteNode(nodeId);
        }
        for (const nodeId of recreateNodeIds) {
          await this._removeReteNode(nodeId);
          await this._addReteNode(next2.nodesById[nodeId]);
        }
        for (const nodeId of addedNodeIds) {
          await this._addReteNode(next2.nodesById[nodeId]);
        }
        for (const nodeId of commonNodeIds) {
          if (recreateNodeIds.has(nodeId)) continue;
          const prevNode = previous.nodesById[nodeId];
          const nextNode = next2.nodesById[nodeId];
          if (!samePosition(prevNode.position, nextNode.position)) {
            const pos = nextNode.position ?? { x: 0, y: 0 };
            await this.area.translate(nodeId, { x: pos.x, y: pos.y });
          }
        }
        for (const edge of Object.values(next2.edgesById || {})) {
          if (addedEdgeIds.has(edge.id) || recreateNodeIds.has(edge.fromNodeId) || recreateNodeIds.has(edge.toNodeId)) {
            await this._addReteConnection(edge);
          }
        }
      } finally {
        this.isRendering = false;
        resolve();
        this._renderLock = null;
      }
    }
    async renderModel(editorModel, { force = false } = {}) {
      if (force || !this.currentEditorModel) {
        await this._renderModelFull(editorModel);
        this.currentEditorModel = cloneEditorModelSnapshot(editorModel);
        return;
      }
      const canPatch = canPatchEditorModel(this.currentEditorModel, editorModel);
      if (!canPatch) {
        await this._renderModelFull(editorModel);
        this.currentEditorModel = cloneEditorModelSnapshot(editorModel);
        return;
      }
      try {
        await this._patchModel(this.currentEditorModel, editorModel);
      } catch (error) {
        console.warn("incremental render failed; falling back to full render", error);
        await this._renderModelFull(editorModel);
      }
      this.currentEditorModel = cloneEditorModelSnapshot(editorModel);
    }
    async focusNode(nodeId) {
      if (!nodeId || !this.editor || !this.area) {
        return false;
      }
      try {
        const node2 = this.editor.getNode(nodeId);
        if (!node2) return false;
        await index.zoomAt(this.area, [node2]);
        return true;
      } catch (e) {
        console.warn("focusNode failed:", e.message);
        return false;
      }
    }
    destroy() {
      this.area.destroy();
      this.container.innerHTML = "";
      this.currentEditorModel = null;
    }
  };

  // webview-src/node-editor-webview.js
  var vscode = acquireVsCodeApi();
  var editorView = null;
  var editorVisible = true;
  var lastErrors = [];
  var currentRenderPreview = { items: [], unsupported: [] };
  function resizePreviewCanvas() {
    const canvas = document.getElementById("lp-preview-canvas");
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    drawPreviewCanvas(dpr);
  }
  function drawPreviewCanvas(dpr) {
    const canvas = document.getElementById("lp-preview-canvas");
    if (!canvas) return;
    drawPreviewBackground(canvas, dpr);
    if (currentRenderPreview.items && currentRenderPreview.items.length > 0) {
      drawRenderItems(canvas, currentRenderPreview.items, dpr);
    } else {
      drawPlaceholderText(canvas, dpr);
    }
    if (currentRenderPreview.unsupported && currentRenderPreview.unsupported.length > 0) {
      drawUnsupportedHint(canvas, currentRenderPreview.unsupported, dpr);
    }
  }
  function drawPreviewBackground(canvas, dpr) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w2 = canvas.width;
    const h2 = canvas.height;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, w2, h2);
    const step = 28 * dpr;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let x2 = step; x2 < w2; x2 += step) {
      for (let y = step; y < h2; y += step) {
        ctx.beginPath();
        ctx.arc(x2, y, dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  function drawPlaceholderText(canvas, dpr) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w2 = canvas.width;
    const h2 = canvas.height;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.font = `${Math.round(15 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillText("Runtime Preview", w2 / 2, h2 / 2 - Math.round(13 * dpr));
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.font = `${Math.round(11 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.fillText("render output will appear here", w2 / 2, h2 / 2 + Math.round(13 * dpr));
  }
  function drawRenderItems(canvas, items, dpr) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    for (const item of items) {
      try {
        if (item.kind === "circle") {
          drawCircle(ctx, item, dpr);
        } else if (item.kind === "rect") {
          drawRect(ctx, item, dpr);
        } else if (item.kind === "bar") {
          drawBar(ctx, item, dpr);
        } else if (item.kind === "text") {
          drawText(ctx, item, dpr);
        }
      } catch (e) {
        console.warn("Failed to draw render item:", item, e);
      }
    }
  }
  function drawCircle(ctx, item, dpr) {
    const x2 = (item.x || 100) * dpr;
    const y = (item.y || 100) * dpr;
    const r2 = (item.r || 24) * dpr;
    const color = item.color || "#80ed99";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x2, y, r2, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawRect(ctx, item, dpr) {
    const x2 = (item.x || 80) * dpr;
    const y = (item.y || 80) * dpr;
    const width = (item.width || 120) * dpr;
    const height = (item.height || 80) * dpr;
    const color = item.color || "#70d6ff";
    ctx.fillStyle = color;
    ctx.fillRect(x2, y, width, height);
  }
  function drawBar(ctx, item, dpr) {
    const x2 = (item.x || 40) * dpr;
    const y = (item.y || 120) * dpr;
    const width = (item.width || 240) * dpr;
    const height = (item.height || 24) * dpr;
    const value = Math.max(0, Math.min(1, item.value || 0.5));
    const color = item.color || "#ffd166";
    const bgColor = item.backgroundColor || "rgba(255,255,255,0.12)";
    ctx.fillStyle = bgColor;
    ctx.fillRect(x2, y, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(x2, y, width * value, height);
  }
  function drawText(ctx, item, dpr) {
    const x2 = (item.x || 40) * dpr;
    const y = (item.y || 60) * dpr;
    const text = item.text || "text";
    const color = item.color || "#ffffff";
    const size = item.size || 18;
    ctx.fillStyle = color;
    ctx.font = `${Math.round(size * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, x2, y);
  }
  function drawUnsupportedHint(canvas, unsupported, dpr) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const count = unsupported.length;
    const hintText = `${count} unsupported render item${count > 1 ? "s" : ""}`;
    ctx.fillStyle = "rgba(255,150,100,0.4)";
    ctx.font = `${Math.round(10 * dpr)}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(hintText, Math.round(12 * dpr), Math.round(canvas.height - 24 * dpr));
  }
  function setStatus(text, isError) {
    const el = document.getElementById("lp-status");
    if (!el) return;
    el.textContent = text;
    if (isError) {
      el.style.borderLeftColor = "#f44747";
      el.style.color = "#f88";
    } else {
      el.style.borderLeftColor = "#4a90e2";
      el.style.color = "#9cdcfe";
    }
  }
  function buildStatusText(editorModel, errors, renderPreview) {
    let status = "";
    if (editorModel && renderPreview) {
      status = "Synced";
      if (renderPreview.items && renderPreview.items.length > 0) {
        status += ` \xB7 ${renderPreview.items.length} render item${renderPreview.items.length > 1 ? "s" : ""}`;
      }
      if (renderPreview.unsupported && renderPreview.unsupported.length > 0) {
        status += ` \xB7 ${renderPreview.unsupported.length} unsupported`;
      }
    } else {
      status = "Empty";
    }
    status += " \xB7 Read-only Node Preview";
    return status;
  }
  function setErrors(errors) {
    lastErrors = errors || [];
    _renderErrors();
  }
  function _renderErrors() {
    const el = document.getElementById("lp-errors");
    if (!el) return;
    if (!editorVisible || lastErrors.length === 0) {
      el.style.display = "none";
      el.innerHTML = "";
      return;
    }
    el.style.display = "block";
    el.innerHTML = lastErrors.map((e) => `<div class="lp-error-item">${escapeHtml(e.message || String(e))}</div>`).join("");
  }
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function toggleEditor() {
    editorVisible = !editorVisible;
    const panel = document.getElementById("lp-panel");
    const container = document.getElementById("lp-editor-container");
    const btn = document.getElementById("lp-toggle-editor");
    if (editorVisible) {
      if (container) container.style.display = "";
      if (panel) panel.style.flex = "1";
      if (btn) btn.textContent = "Hide Editor";
      _renderErrors();
    } else {
      if (container) container.style.display = "none";
      if (panel) panel.style.flex = "0 0 auto";
      if (btn) btn.textContent = "Show Editor";
      _renderErrors();
    }
  }
  function initToggleButton() {
    const btn = document.getElementById("lp-toggle-editor");
    if (btn) btn.addEventListener("click", toggleEditor);
  }
  function initEditorView() {
    if (editorView) return;
    const container = document.getElementById("lp-editor-container");
    if (!container) return;
    editorView = new NodeEditorView(container, {
      onOperation: () => {
      },
      // read-only: ignore all edit operations
      onError: (e) => console.error("[NodeEditorView]", e),
      onSelectNode: () => {
      }
    });
  }
  window.addEventListener("message", async (event) => {
    const message = event.data;
    if (!message || message.type !== "setModel") return;
    const { editorModel, errors, renderPreview } = message;
    if (errors && errors.length > 0) {
      setStatus("DSL has errors \xB7 Read-only Node Preview", true);
      setErrors(errors);
      return;
    }
    setErrors([]);
    if (renderPreview) {
      currentRenderPreview = renderPreview;
      resizePreviewCanvas();
    }
    if (!editorModel) {
      setStatus(buildStatusText(null, [], renderPreview), false);
      return;
    }
    initEditorView();
    try {
      await editorView.renderModel(editorModel);
      setStatus(buildStatusText(editorModel, [], renderPreview), false);
    } catch (e) {
      console.error("[loomlet-preview] renderModel failed:", e);
      setStatus("Render error \xB7 Read-only Node Preview", true);
    }
  });
  resizePreviewCanvas();
  window.addEventListener("resize", resizePreviewCanvas);
  initToggleButton();
  vscode.postMessage({ type: "ready" });
})();
/*! Bundled license information:

@babel/runtime/helpers/regenerator.js:
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.min.js:
  (**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

rete/rete.esm.js:
  (*!
  * rete v2.0.5
  * (c) 2025 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)

rete-area-plugin/rete-area-plugin.esm.js:
  (*!
  * rete-area-plugin v2.1.4
  * (c) 2025 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)

rete-connection-plugin/rete-connection-plugin.esm.js:
  (*!
  * rete-connection-plugin v2.0.4
  * (c) 2024 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)

rete-render-utils/rete-render-utils.esm.js:
  (*!
  * rete-render-utils v2.0.2
  * (c) 2024 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)

rete-react-plugin/rete-react-plugin.esm.js:
  (*!
  * rete-react-plugin v2.0.7
  * (c) 2025 Vitaliy Stoliarov
  * Released under the MIT license.
  * *)
*/
