"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = exports.RuleBuilder = void 0;
var RuleBuilder = /** @class */ (function () {
    function RuleBuilder(test) {
        if (!(this instanceof RuleBuilder)) {
            return new RuleBuilder(test);
        }
        this._rule = { test: test };
    }
    Object.defineProperty(RuleBuilder.prototype, "rule", {
        get: function () {
            return this._rule;
        },
        enumerable: false,
        configurable: true
    });
    RuleBuilder.prototype.token = function (name) {
        this._rule.token = name;
        return this;
    };
    RuleBuilder.prototype.action = function (action) {
        this._rule.action = action;
        return this;
    };
    RuleBuilder.prototype.children = function () {
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
    RuleBuilder.prototype.next = function () {
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
    RuleBuilder.fallback = {
        commit: (new RuleBuilder('fallback')).action('commit'),
        halt: (new RuleBuilder('fallback')).action('halt'),
    };
    RuleBuilder.char = {
        append: (new RuleBuilder('char')).action('append'),
        skip: (new RuleBuilder('char')).action('skip'),
    };
    return RuleBuilder;
}());
exports.RuleBuilder = RuleBuilder;
exports.rule = RuleBuilder;
//# sourceMappingURL=rules.js.map