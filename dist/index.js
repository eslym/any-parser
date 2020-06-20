"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var jsonschema_1 = require("jsonschema");
var ParserSchema = require("../schema/parser.json");
function deepLoop(rules, rule) {
    if (rules.indexOf(rule) !== -1) {
        return;
    }
    rules.push(rule);
    if (rule.test !== 'fallback') {
        if (rule.hasOwnProperty('children'))
            rule.children.forEach(function (r) { return deepLoop(rules, r); });
        if (rule.hasOwnProperty('next'))
            rule.next.forEach(function (r) { return deepLoop(rules, r); });
    }
}
function loadRule(rules, index) {
    var rule = rules[index];
    if (!rule.hasOwnProperty('__rule')) {
        rule.__rule = {
            test: rule.test,
        };
        if (rule.hasOwnProperty('action')) {
            rule.__rule.action = rule.action;
        }
        if (rule.hasOwnProperty('token')) {
            rule.__rule.token = rule.token;
        }
        if (rule.hasOwnProperty('children')) {
            rule.__rule.children = rule.children.map(function (i) { return loadRule(rules, i); });
        }
        if (rule.hasOwnProperty('next')) {
            rule.__rule.next = rule.next.map(function (i) { return loadRule(rules, i); });
        }
    }
    return rule.__rule;
}
var ConsumerAction;
(function (ConsumerAction) {
    ConsumerAction["APPEND"] = "append";
    ConsumerAction["COMMIT"] = "commit";
    ConsumerAction["SKIP"] = "skip";
    ConsumerAction["HALT"] = "halt";
})(ConsumerAction || (ConsumerAction = {}));
var Consumer = /** @class */ (function () {
    function Consumer(parser, action) {
        this.parser = parser;
        this.action = action;
    }
    return Consumer;
}());
var FallbackConsumer = /** @class */ (function (_super) {
    __extends(FallbackConsumer, _super);
    function FallbackConsumer(parser, action) {
        var _this = _super.call(this, parser, action) || this;
        _this.action = action;
        return _this;
    }
    FallbackConsumer.prototype.consume = function (str) {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, {
                        action: this.action,
                        consumed: 0,
                    }];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    FallbackConsumer.prototype.accept = function (str) {
        return true;
    };
    return FallbackConsumer;
}(Consumer));
var MatchConsumer = /** @class */ (function (_super) {
    __extends(MatchConsumer, _super);
    function MatchConsumer(parser, action, test, token) {
        var _this = _super.call(this, parser, action) || this;
        _this._children = [];
        _this._next = [];
        _this.token = undefined;
        _this.test = test;
        _this.token = token;
        return _this;
    }
    Object.defineProperty(MatchConsumer.prototype, "children", {
        set: function (value) {
            this._children = value !== null && value !== void 0 ? value : [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MatchConsumer.prototype, "next", {
        set: function (value) {
            this._next = value !== null && value !== void 0 ? value : [];
        },
        enumerable: false,
        configurable: true
    });
    MatchConsumer.prototype.consume = function (str) {
        var val, token, children, consumed, loop, resolved, _a, _b, rule, c, _c, _d, res, _e, length_1, _f, last, _g, _h, rule, c, e_1_1;
        var e_2, _j, e_3, _k, e_1, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    val = str.match(this.testRegex())[0];
                    str = str.slice(val.length);
                    if (!(this.token === undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, {
                            action: this.action,
                            consumed: val.length,
                            value: val,
                        }];
                case 1:
                    _m.sent();
                    return [3 /*break*/, 4];
                case 2:
                    token = {
                        name: this.token,
                        value: val,
                        children: []
                    };
                    children = token.children;
                    consumed = val.length;
                    if (this._children.length !== 0) {
                        loop = true;
                        while (loop) {
                            resolved = false;
                            try {
                                for (_a = (e_2 = void 0, __values(this._children[Symbol.iterator]())), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    rule = _b.value;
                                    c = this.parser.resolveConsumer(rule);
                                    if (c.accept(str)) {
                                        try {
                                            for (_c = (e_3 = void 0, __values(c.consume(str))), _d = _c.next(); !_d.done; _d = _c.next()) {
                                                res = _d.value;
                                                if (res.action !== ConsumerAction.SKIP) {
                                                    if (typeof res.value === 'string') {
                                                        _e = children, length_1 = _e.length, _f = length_1 - 1, last = _e[_f];
                                                        if (typeof last !== 'string') {
                                                            children.push('');
                                                            length_1++;
                                                        }
                                                        children[length_1 - 1] += res.value;
                                                    }
                                                    else if (typeof res.value !== 'undefined') {
                                                        children.push(res.value);
                                                    }
                                                }
                                                str = str.slice(res.consumed);
                                                consumed += res.consumed;
                                                if (res.action === ConsumerAction.COMMIT) {
                                                    loop = false;
                                                }
                                                else if (res.action === ConsumerAction.HALT) {
                                                    throw new Error('Syntax Error');
                                                }
                                            }
                                        }
                                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                        finally {
                                            try {
                                                if (_d && !_d.done && (_k = _c.return)) _k.call(_c);
                                            }
                                            finally { if (e_3) throw e_3.error; }
                                        }
                                        resolved = true;
                                        break;
                                    }
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_j = _a.return)) _j.call(_a);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            if (!resolved) {
                                break;
                            }
                        }
                    }
                    return [4 /*yield*/, {
                            action: this.action,
                            consumed: consumed,
                            value: token
                        }];
                case 3:
                    _m.sent();
                    _m.label = 4;
                case 4:
                    _m.trys.push([4, 9, 10, 11]);
                    _g = __values(this._next), _h = _g.next();
                    _m.label = 5;
                case 5:
                    if (!!_h.done) return [3 /*break*/, 8];
                    rule = _h.value;
                    c = this.parser.resolveConsumer(rule);
                    if (!c.accept(str)) return [3 /*break*/, 7];
                    return [5 /*yield**/, __values(c.consume(str))];
                case 6:
                    _m.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _h = _g.next();
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 11];
                case 9:
                    e_1_1 = _m.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 11];
                case 10:
                    try {
                        if (_h && !_h.done && (_l = _g.return)) _l.call(_g);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    };
    MatchConsumer.prototype.testRegex = function () {
        if (typeof this.test === 'string') {
            return /^[\s\S]/m;
        }
        return new RegExp("^(?:" + this.test.pattern + ")", this.test.flags);
    };
    MatchConsumer.prototype.accept = function (str) {
        return str.match(this.testRegex()) !== null;
    };
    return MatchConsumer;
}(Consumer));
var Parser = /** @class */ (function () {
    function Parser(rule) {
        this.rules = [];
        this.consumer = [];
        this.entries = { default: rule };
        deepLoop(this.rules, rule);
    }
    Parser.load = function (parser) {
        var e_4, _a;
        var validator = new jsonschema_1.Validator();
        validator.validate(parser, ParserSchema, { throwError: true });
        var cloned = JSON.parse(JSON.stringify(parser));
        var p = {
            entries: {},
            rules: [],
            consumer: [],
        };
        p.__proto__ = Parser.prototype;
        try {
            for (var _b = __values(Object.entries(cloned.entries)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entry = _c.value;
                p.addEntry(entry[0], loadRule(cloned.rules, entry[1]));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return p;
    };
    Parser.prototype.addEntry = function (name, rule) {
        this.entries[name] = rule;
        deepLoop(this.rules, rule);
        return this;
    };
    Parser.prototype.parse = function (str, entry) {
        var e_5, _a;
        if (typeof entry === "undefined") {
            entry = 'default';
        }
        var rule = this.entries[entry];
        var consumer = this.resolveConsumer(rule);
        var result = [];
        try {
            for (var _b = __values(consumer.consume(str)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var res = _c.value;
                if (res.action !== ConsumerAction.SKIP) {
                    if (typeof res.value === 'string') {
                        var _d = result, length_2 = _d.length, _e = length_2 - 1, last = _d[_e];
                        if (typeof last !== 'string') {
                            result.push('');
                            length_2++;
                        }
                        result[length_2 - 1] += res.value;
                    }
                    else {
                        result.push(res.value);
                    }
                }
                if (res.action === ConsumerAction.COMMIT) {
                    break;
                }
                else if (res.action === ConsumerAction.HALT) {
                    throw new Error('Syntax Error');
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return result;
    };
    Parser.prototype.serialize = function () {
        var e_6, _a;
        var _this = this;
        var entries = {};
        try {
            for (var _b = __values(Object.entries(this.entries)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var e = _c.value;
                entries[e[0]] = this.rules.indexOf(e[1]);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var data = {
            entries: entries,
            rules: [],
        };
        data.rules = this.rules.map(function (rule) {
            if (rule.test === 'fallback') {
                return {
                    test: 'fallback',
                    action: rule.action,
                };
            }
            else {
                var r = {
                    test: rule.test,
                };
                if (rule.hasOwnProperty('action')) {
                    r.action = rule.action;
                }
                if (rule.hasOwnProperty('token')) {
                    r.token = rule.token;
                }
                if (rule.hasOwnProperty('children')) {
                    r.children = rule.children.map(function (r) { return _this.rules.indexOf(r); });
                }
                if (rule.hasOwnProperty('next')) {
                    r.next = rule.next.map(function (r) { return _this.rules.indexOf(r); });
                }
                return r;
            }
        });
        return data;
    };
    Parser.prototype.resolveConsumer = function (rule) {
        var index = this.rules.indexOf(rule);
        if (index === -1) {
            return undefined;
        }
        if (typeof this.consumer[index] === 'undefined') {
            if (rule.test === 'fallback') {
                this.consumer[index] = new FallbackConsumer(this, rule.action);
            }
            else if (rule.test === 'extend') {
            }
            else {
                var c = new MatchConsumer(this, rule.action, rule.test, rule.token);
                c.children = rule.children;
                c.next = rule.next;
                this.consumer[index] = c;
            }
        }
        return this.consumer[index];
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EseUNBQTZDO0FBRTdDLElBQU0sWUFBWSxHQUFXLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTlELFNBQVMsUUFBUSxDQUFDLEtBQWEsRUFBRSxJQUFVO0lBQ3ZDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM1QixPQUFPO0tBQ1Y7SUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDMUIsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO0tBQ3BEO0FBQ0wsQ0FBQztBQVFELFNBQVMsUUFBUSxDQUFDLEtBQXVCLEVBQUUsS0FBYTtJQUNwRCxJQUFJLElBQUksR0FBUSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNWLElBQUksRUFBRSxJQUFJ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