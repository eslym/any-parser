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
exports.Parser = exports.ParserError = void 0;
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
                                                    throw new ParserError('Unrecognized pattern at > ' + str.slice(0, 10));
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
        var consumed, resolved, result, value, forward, _a, _b, rule, consumer, _c, _d, res, _e, _f, rule, c, e_4_1;
        var e_5, _g, e_6, _h, e_4, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    consumed = 0;
                    resolved = false;
                    result = [];
                    value = new Proxy(result, ArrayAccessor);
                    forward = [];
                    try {
                        for (_a = __values(this._children), _b = _a.next(); !_b.done; _b = _a.next()) {
                            rule = _b.value;
                            consumer = this.parser.resolveConsumer(rule);
                            if (consumer.accept(str)) {
                                resolved = true;
                                try {
                                    for (_c = (e_6 = void 0, __values(consumer.consume(str))), _d = _c.next(); !_d.done; _d = _c.next()) {
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
                                        forward.push(res);
                                        consumed += res.consumed;
                                        if (res.action === ConsumerAction.HALT) {
                                            consumed = 0;
                                            result.splice(0, result.length);
                                            forward = [];
                                            resolved = false;
                                            break;
                                        }
                                    } // end for consume
                                }
                                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                                finally {
                                    try {
                                        if (_d && !_d.done && (_h = _c.return)) _h.call(_c);
                                    }
                                    finally { if (e_6) throw e_6.error; }
                                }
                                if (resolved) {
                                    break; // for children
                                }
                            } // end if accept
                        } // end for children
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    if (!resolved) {
                        throw new ParserError('Unrecognized pattern at > ' + str.slice(0, 10));
                    }
                    if (!(typeof this.token !== 'undefined')) return [3 /*break*/, 2];
                    return [4 /*yield*/, {
                            action: this.action,
                            consumed: consumed,
                            value: {
                                name: this.token,
                                value: '',
                                children: result,
                            },
                        }];
                case 1:
                    _k.sent();
                    return [3 /*break*/, 4];
                case 2: return [5 /*yield**/, __values(forward[Symbol.iterator]())];
                case 3:
                    _k.sent();
                    _k.label = 4;
                case 4:
                    str = str.slice(consumed);
                    _k.label = 5;
                case 5:
                    _k.trys.push([5, 10, 11, 12]);
                    _e = __values(this._next), _f = _e.next();
                    _k.label = 6;
                case 6:
                    if (!!_f.done) return [3 /*break*/, 9];
                    rule = _f.value;
                    c = this.parser.resolveConsumer(rule);
                    if (!c.accept(str)) return [3 /*break*/, 8];
                    return [5 /*yield**/, __values(c.consume(str))];
                case 7:
                    _k.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _f = _e.next();
                    return [3 /*break*/, 6];
                case 9: return [3 /*break*/, 12];
                case 10:
                    e_4_1 = _k.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 12];
                case 11:
                    try {
                        if (_f && !_f.done && (_j = _e.return)) _j.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    };
    return ExtendConsumer;
}(MatchConsumer));
var ParserError = /** @class */ (function (_super) {
    __extends(ParserError, _super);
    function ParserError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ParserError;
}(Error));
exports.ParserError = ParserError;
var Parser = /** @class */ (function () {
    function Parser(rule) {
        this.rules = [];
        this.consumer = [];
        this.entries = { default: rule };
        deepLoop(this.rules, rule);
    }
    Parser.load = function (parser) {
        var e_7, _a;
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
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return p;
    };
    Parser.prototype.addEntry = function (name, rule) {
        this.entries[name] = rule;
        deepLoop(this.rules, rule);
        return this;
    };
    Parser.prototype.parse = function (str, entry) {
        var e_8, _a;
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
                        throw new ParserError('Unrecognized pattern at > ' + str.slice(0, 10));
                    }
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return _result;
        }
        else {
            throw new ParserError('Unrecognized pattern at > ' + str.slice(0, 10));
        }
    };
    Parser.prototype.serialize = function () {
        var e_9, _a;
        var _this = this;
        var entries = {};
        try {
            for (var _b = __values(Object.entries(this.entries)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var e = _c.value;
                entries[e[0]] = this.rules.indexOf(e[1]);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
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