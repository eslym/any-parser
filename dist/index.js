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
var ArrayAccessor = {
    get: function (arr, prop, receiver) {
        switch (prop) {
            case 'last':
                prop = arr.length - 1;
                break;
            case 'first':
                prop = 0;
                break;
        }
        return Reflect.get(arr, prop, receiver);
    },
    set: function (arr, prop, value, receiver) {
        switch (prop) {
            case 'last':
                prop = arr.length - 1;
                break;
            case 'first':
                prop = 0;
                break;
        }
        return Reflect.set(arr, prop, value, receiver);
    },
    has: function (target, key) {
        return key === 'first' || key === 'last' || key in target;
    }
};
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
        var val, token, children, consumed, loop, resolved, _a, _b, rule, c, _c, _d, res, _e, _f, rule, c, e_1_1;
        var e_2, _g, e_3, _h, e_1, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
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
                    _k.sent();
                    return [3 /*break*/, 4];
                case 2:
                    token = {
                        name: this.token,
                        value: val,
                        children: []
                    };
                    children = new Proxy(token.children, ArrayAccessor);
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
                                                        if (typeof children.last !== 'string') {
                                                            children.push('');
                                                        }
                                                        children.last += res.value;
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
                                                    throw new Error('Syntax Error at > ' + str.slice(0, 10));
                                                }
                                            }
                                        }
                                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                        finally {
                                            try {
                                                if (_d && !_d.done && (_h = _c.return)) _h.call(_c);
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
                                    if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
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
                    _k.sent();
                    _k.label = 4;
                case 4:
                    _k.trys.push([4, 9, 10, 11]);
                    _e = __values(this._next), _f = _e.next();
                    _k.label = 5;
                case 5:
                    if (!!_f.done) return [3 /*break*/, 8];
                    rule = _f.value;
                    c = this.parser.resolveConsumer(rule);
                    if (!c.accept(str)) return [3 /*break*/, 7];
                    return [5 /*yield**/, __values(c.consume(str))];
                case 6:
                    _k.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _f = _e.next();
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 11];
                case 9:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 11];
                case 10:
                    try {
                        if (_f && !_f.done && (_j = _e.return)) _j.call(_e);
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
var ExtendConsumer = /** @class */ (function (_super) {
    __extends(ExtendConsumer, _super);
    function ExtendConsumer(parser, action, token) {
        return _super.call(this, parser, action, 'extend', token) || this;
    }
    ExtendConsumer.prototype.consume = function (str) {
        var consumed, resolved, token, value, _a, _b, rule, consumer, _c, _d, res, resolved_1, _e, _f, rule, consumer, _g, _h, res, e_4_1, e_5_1, _j, _k, rule, c, e_6_1;
        var e_7, _l, e_8, _m, e_5, _o, e_4, _p, e_6, _q;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    consumed = 0;
                    resolved = false;
                    if (!(typeof this.token !== "undefined")) return [3 /*break*/, 4];
                    token = {
                        name: this.token,
                        value: "",
                        children: [],
                    };
                    value = new Proxy(token.children, ArrayAccessor);
                    try {
                        for (_a = __values(this._children), _b = _a.next(); !_b.done; _b = _a.next()) {
                            rule = _b.value;
                            consumer = this.parser.resolveConsumer(rule);
                            if (consumer.accept(str)) {
                                resolved = true;
                                try {
                                    for (_c = (e_8 = void 0, __values(consumer.consume(str))), _d = _c.next(); !_d.done; _d = _c.next()) {
                                        res = _d.value;
                                        if (res.action !== ConsumerAction.SKIP) {
                                            if (typeof res.value === 'string') {
                                                if (typeof value.last !== 'string') {
                                                    value.push('');
                                                }
                                                value.last += res.value;
                                            }
                                            else if (typeof res.value !== "undefined") {
                                                value.push(res.value);
                                            }
                                        }
                                        consumed += res.consumed;
                                        if (res.action === ConsumerAction.HALT) {
                                            throw new Error('Syntax Error at > ' + str.slice(0, 10));
                                        }
                                    } // end for consume
                                }
                                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                                finally {
                                    try {
                                        if (_d && !_d.done && (_m = _c.return)) _m.call(_c);
                                    }
                                    finally { if (e_8) throw e_8.error; }
                                }
                                break; // for children
                            } // end if accept
                        } // end for children
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_l = _a.return)) _l.call(_a);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                    if (!resolved) return [3 /*break*/, 2];
                    return [4 /*yield*/, {
                            action: this.action,
                            consumed: consumed,
                            value: token,
                        }];
                case 1:
                    _r.sent();
                    return [3 /*break*/, 3];
                case 2: throw new Error('Syntax Error at > ' + str.slice(0, 10));
                case 3: return [3 /*break*/, 20];
                case 4:
                    resolved_1 = false;
                    _r.label = 5;
                case 5:
                    _r.trys.push([5, 17, 18, 19]);
                    _e = __values(this._children), _f = _e.next();
                    _r.label = 6;
                case 6:
                    if (!!_f.done) return [3 /*break*/, 16];
                    rule = _f.value;
                    consumer = this.parser.resolveConsumer(rule);
                    if (!consumer.accept(str)) return [3 /*break*/, 15];
                    resolved_1 = true;
                    _r.label = 7;
                case 7:
                    _r.trys.push([7, 12, 13, 14]);
                    _g = (e_4 = void 0, __values(consumer.consume(str))), _h = _g.next();
                    _r.label = 8;
                case 8:
                    if (!!_h.done) return [3 /*break*/, 11];
                    res = _h.value;
                    consumed += res.consumed;
                    return [4 /*yield*/, res];
                case 9:
                    _r.sent();
                    _r.label = 10;
                case 10:
                    _h = _g.next();
                    return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 14];
                case 12:
                    e_4_1 = _r.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 14];
                case 13:
                    try {
                        if (_h && !_h.done && (_p = _g.return)) _p.call(_g);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 14: return [3 /*break*/, 16];
                case 15:
                    _f = _e.next();
                    return [3 /*break*/, 6];
                case 16: return [3 /*break*/, 19];
                case 17:
                    e_5_1 = _r.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 19];
                case 18:
                    try {
                        if (_f && !_f.done && (_o = _e.return)) _o.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                    return [7 /*endfinally*/];
                case 19:
                    if (!resolved_1) {
                        throw new Error('Syntax Error at > ' + str.slice(0, 10));
                    }
                    _r.label = 20;
                case 20:
                    str = str.slice(consumed);
                    _r.label = 21;
                case 21:
                    _r.trys.push([21, 26, 27, 28]);
                    _j = __values(this._next), _k = _j.next();
                    _r.label = 22;
                case 22:
                    if (!!_k.done) return [3 /*break*/, 25];
                    rule = _k.value;
                    c = this.parser.resolveConsumer(rule);
                    if (!c.accept(str)) return [3 /*break*/, 24];
                    return [5 /*yield**/, __values(c.consume(str))];
                case 23:
                    _r.sent();
                    return [3 /*break*/, 25];
                case 24:
                    _k = _j.next();
                    return [3 /*break*/, 22];
                case 25: return [3 /*break*/, 28];
                case 26:
                    e_6_1 = _r.sent();
                    e_6 = { error: e_6_1 };
                    return [3 /*break*/, 28];
                case 27:
                    try {
                        if (_k && !_k.done && (_q = _j.return)) _q.call(_j);
                    }
                    finally { if (e_6) throw e_6.error; }
                    return [7 /*endfinally*/];
                case 28: return [2 /*return*/];
            }
        });
    };
    return ExtendConsumer;
}(MatchConsumer));
var Parser = /** @class */ (function () {
    function Parser(rule) {
        this.rules = [];
        this.consumer = [];
        this.entries = { default: rule };
        deepLoop(this.rules, rule);
    }
    Parser.load = function (parser) {
        var e_9, _a;
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
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return p;
    };
    Parser.prototype.addEntry = function (name, rule) {
        this.entries[name] = rule;
        deepLoop(this.rules, rule);
        return this;
    };
    Parser.prototype.parse = function (str, entry) {
        var e_10, _a;
        if (typeof entry === "undefined") {
            entry = 'default';
        }
        var rule = this.entries[entry];
        var consumer = this.resolveConsumer(rule);
        var _result = [];
        var result = new Proxy(_result, ArrayAccessor);
        if (consumer.accept(str)) {
            try {
                for (var _b = __values(consumer.consume(str)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var res = _c.value;
                    if (res.action !== ConsumerAction.SKIP) {
                        if (typeof res.value === 'string') {
                            if (typeof result.last !== 'string') {
                                result.push('');
                            }
                            result.last += res.value;
                        }
                        else if (typeof res.value !== "undefined") {
                            result.push(res.value);
                        }
                    }
                    str = str.slice(res.consumed);
                    if (res.action === ConsumerAction.COMMIT) {
                        break;
                    }
                    else if (res.action === ConsumerAction.HALT) {
                        throw new Error('Syntax Error at > ' + str.slice(0, 10));
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
            return _result;
        }
        else {
            throw new Error('Syntax Error at > ' + str.slice(0, 10));
        }
    };
    Parser.prototype.serialize = function () {
        var e_11, _a;
        var _this = this;
        var entries = {};
        try {
            for (var _b = __values(Object.entries(this.entries)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var e = _c.value;
                entries[e[0]] = this.rules.indexOf(e[1]);
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_11) throw e_11.error; }
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
        var _a, _b;
        var index = this.rules.indexOf(rule);
        if (index === -1) {
            return undefined;
        }
        if (typeof this.consumer[index] === 'undefined') {
            if (rule.test === 'fallback') {
                this.consumer[index] = new FallbackConsumer(this, rule.action);
            }
            else {
                var c = void 0;
                if (rule.test === 'extend') {
                    c = new ExtendConsumer(this, (_a = rule.action) !== null && _a !== void 0 ? _a : ConsumerAction.APPEND, rule.token);
                }
                else {
                    c = new MatchConsumer(this, (_b = rule.action) !== null && _b !== void 0 ? _b : ConsumerAction.APPEND, rule.test, rule.token);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EseUNBQTZDO0FBRTdDLElBQU0sWUFBWSxHQUFXLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTlELElBQU0sYUFBYSxHQUFHO0lBQ2xCLEdBQUcsRUFBSCxVQUFJLEdBQVUsRUFBRSxJQUFJLEVBQUUsUUFBYztRQUNoQyxRQUFRLElBQUksRUFBRTtZQUNWLEtBQUssTUFBTTtnQkFDUCxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDVCxNQUFNO1NBQ2I7UUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsR0FBRyxFQUFILFVBQUksR0FBVSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBYztRQUN2QyxRQUFRLElBQUksRUFBRTtZQUNWLEtBQUssTUFBTTtnQkFDUCxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDVCxNQUFNO1NBQ2I7UUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUNELEdBQUcsWUFBQyxNQUFNLEVBQUUsR0FBRztRQUNYLE9BQU8sR0FBRyxLQUFLLE9BQU8sSUFBSSxHQUFHLEtBQUssTUFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUM7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