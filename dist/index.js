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
var ArrLast = {
    get: function (arr, prop, receiver) {
        if (prop === 'last') {
            return arr[arr.length - 1];
        }
        return Reflect.get(arr, prop, receiver);
    },
    set: function (arr, prop, value, receiver) {
        if (prop === 'last' && arr.length > 0) {
            return arr[arr.length - 1] = value;
        }
        return Reflect.set(arr, prop, value, receiver);
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
                    children = new Proxy(token.children, ArrLast);
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
        var _result = [];
        var result = new Proxy(_result, ArrLast);
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
            return _result;
        }
        else {
            throw new Error('Syntax Error at > ' + str.slice(0, 10));
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EseUNBQTZDO0FBRTdDLElBQU0sWUFBWSxHQUFXLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTlELElBQU0sT0FBTyxHQUFHO0lBQ1osR0FBRyxFQUFILFVBQUksR0FBVSxFQUFFLElBQUksRUFBRSxRQUFjO1FBQ2hDLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtZQUNqQixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELEdBQUcsRUFBSCxVQUFJLEdBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQWM7UUFDdkMsSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDSixDQUFDO0FBTUYsU0FBUyxRQUFRLENBQUMsS0FBYSxFQUFFLElBQVU7SUFDdkMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzVCLE9BQU87S0FDVjtJQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakIsSUFBSSxJQUFJ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