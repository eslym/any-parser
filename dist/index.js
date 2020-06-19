"use strict";
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
var Parser = /** @class */ (function () {
    function Parser(rule) {
        this.rules = [];
        this.entries = { default: rule };
        deepLoop(this.rules, rule);
    }
    Parser.load = function (parser) {
        var validator = new jsonschema_1.Validator();
        validator.validate(parser, ParserSchema, { throwError: true });
        var cloned = JSON.parse(JSON.stringify(parser));
        var p = {
            entries: {},
            rules: [],
        };
        p.__proto__ = Parser.prototype;
        for (var _i = 0, _a = Object.entries(cloned.entries); _i < _a.length; _i++) {
            var entry = _a[_i];
            p.addEntry(entry[0], loadRule(cloned.rules, entry[1]));
        }
        return p;
    };
    Parser.prototype.addEntry = function (name, rule) {
        this.entries[name] = rule;
        deepLoop(this.rules, rule);
        return this;
    };
    Parser.prototype.serialize = function () {
        var _this = this;
        var entries = {};
        for (var _i = 0, _a = Object.entries(this.entries); _i < _a.length; _i++) {
            var e = _a[_i];
            entries[e[0]] = this.rules.indexOf(e[1]);
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
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=index.js.map