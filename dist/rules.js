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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcnVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBK0NBO0lBdUJJLHFCQUFZLElBQWM7UUFDdEIsSUFBRyxDQUFDLENBQUMsSUFBSSxZQUFZLFdBQVcsQ0FBQyxFQUFDO1lBQzlCLE9BQU8sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFYRCxzQkFBSSw2QkFBSTthQUFSO1lBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBV0QsMkJBQUssR0FBTCxVQUFNLElBQVk7UUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELDRCQUFNLEdBQU4sVUFBTyxNQUFrQjtRQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELDhCQUFRLEdBQVI7UUFBUyxlQUE0QjthQUE1QixVQUE0QixFQUE1QixxQkFBNEIsRUFBNUIsSUFBNEI7WUFBNUIsMEJBQTRCOztRQUNqQyxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBQztZQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7U0FDNUI7UUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FDM0IsQ0FBQztRQUNGLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCwwQkFBSSxHQUFKO1FBQUssZUFBNEI7YUFBNUIsVUFBNEIsRUFBNUIscUJBQTRCLEVBQTVCLElBQTRCO1lBQTVCLDBCQUE0Qjs7UUFDN0IsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUM7WUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ3hCO1FBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFDZixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FDM0IsQ0FBQztRQUNGLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUEzRE0sb0JBQVEsR0FHWDtRQUNBLE1BQU0sRUFBRSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUN0RCxJQUFJLEVBQUUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDckQsQ0FBQztJQUVLLGdCQUFJLEdBR1A7UUFDQSxNQUFNLEVBQUUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDbEQsSUFBSSxFQUFFLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0tBQ2pELENBQUE7SUE4Q0wsa0JBQUM7Q0FBQSxBQTdERCxJQTZEQztBQTdEWSxrQ0FBVztBQTRFWCxRQUFBLElBQUksR0FBaUIsV0FBa0IsQ0FBQyJ9