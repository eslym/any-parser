"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RuleBuilderImpl = /** @class */ (function () {
    function RuleBuilderImpl(test) {
        if (!(this instanceof RuleBuilderImpl)) {
            return new RuleBuilderImpl(test);
        }
        this._rule = { test: test };
    }
    Object.defineProperty(RuleBuilderImpl.prototype, "rule", {
        get: function () {
            return this._rule;
        },
        enumerable: true,
        configurable: true
    });
    RuleBuilderImpl.prototype.token = function (name) {
        this._rule.token = name;
        return this;
    };
    RuleBuilderImpl.prototype.action = function (action) {
        this._rule.action = action;
        return this;
    };
    RuleBuilderImpl.prototype.children = function () {
        var rules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rules[_i] = arguments[_i];
        }
        if (this._rule.children === undefined) {
            this._rule.children = [];
        }
        Array.prototype.push.apply(this._rule.children, rules.map(function (r) { return r.rule; }));
        return this;
    };
    RuleBuilderImpl.prototype.next = function () {
        var rules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rules[_i] = arguments[_i];
        }
        if (this._rule.next === undefined) {
            this._rule.next = [];
        }
        Array.prototype.push.apply(this._rule.next, rules.map(function (r) { return r.rule; }));
        return this;
    };
    RuleBuilderImpl.fallback = {
        commit: (new RuleBuilderImpl('fallback')).action('commit'),
        halt: (new RuleBuilderImpl('fallback')).action('halt'),
    };
    RuleBuilderImpl.char = {
        append: (new RuleBuilderImpl('char')).action('append'),
        skip: (new RuleBuilderImpl('char')).action('skip'),
    };
    return RuleBuilderImpl;
}());
exports.RuleBuilder = RuleBuilderImpl;
//# sourceMappingURL=rules.js.map