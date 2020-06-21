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
            case 'first':
                prop = 0;
        }
        return Reflect.get(arr, prop, receiver);
    },
    set: function (arr, prop, value, receiver) {
        switch (prop) {
            case 'last':
                prop = arr.length - 1;
            case 'first':
                prop = 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EseUNBQTZDO0FBRTdDLElBQU0sWUFBWSxHQUFXLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTlELElBQU0sYUFBYSxHQUFHO0lBQ2xCLEdBQUcsRUFBSCxVQUFJLEdBQVUsRUFBRSxJQUFJLEVBQUUsUUFBYztRQUNoQyxRQUFRLElBQUksRUFBRTtZQUNWLEtBQUssTUFBTTtnQkFDUCxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7WUFDekIsS0FBSyxPQUFPO2dCQUNSLElBQUksR0FBRyxDQUFDLENBQUE7U0FDZjtRQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxHQUFHLEVBQUgsVUFBSSxHQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFjO1FBQ3ZDLFFBQVEsSUFBSSxFQUFFO1lBQ1YsS0FBSyxNQUFNO2dCQUNQLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUMxQixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxHQUFHLENBQUMsQ0FBQztTQUNoQjtRQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBQ0QsR0FBRyxZQUFDLE1BQU0sRUFBRSxHQUFHO1FBQ1gsT0FBTyxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUM5RCxDQUFDO0NBQ0osQ0FBQztBQU9GLFNBQVMsUUFBUSxDQUFDLEtB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