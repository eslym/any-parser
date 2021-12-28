"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _rule;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = exports.RuleBuilder = void 0;
class RuleBuilder {
    constructor(test) {
        _rule.set(this, void 0);
        __classPrivateFieldSet(this, _rule, { test: test });
    }
    get rule() {
        return __classPrivateFieldGet(this, _rule);
    }
    token(name) {
        __classPrivateFieldGet(this, _rule).token = name;
        return this;
    }
    action(action) {
        __classPrivateFieldGet(this, _rule).action = action;
        return this;
    }
    children(...rules) {
        if (__classPrivateFieldGet(this, _rule).children === undefined) {
            __classPrivateFieldGet(this, _rule).children = [];
        }
        Array.prototype.push.apply(__classPrivateFieldGet(this, _rule).children, rules.map((r) => r.rule));
        return this;
    }
    next(...rules) {
        if (__classPrivateFieldGet(this, _rule).next === undefined) {
            __classPrivateFieldGet(this, _rule).next = [];
        }
        Array.prototype.push.apply(__classPrivateFieldGet(this, _rule).next, rules.map((r) => r.rule));
        return this;
    }
}
exports.RuleBuilder = RuleBuilder;
_rule = new WeakMap();
RuleBuilder.fallback = {
    commit: (new RuleBuilder('fallback')).action('commit'),
    halt: (new RuleBuilder('fallback')).action('halt'),
};
RuleBuilder.char = {
    append: (new RuleBuilder('char')).action('append'),
    skip: (new RuleBuilder('char')).action('skip'),
};
exports.rule = ((test) => new RuleBuilder(test));
exports.rule.fallback = RuleBuilder.fallback;
exports.rule.char = RuleBuilder.char;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcnVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQ0EsTUFBYSxXQUFXO0lBdUJwQixZQUFZLElBQWM7UUFGMUIsd0JBQW9CO1FBR2hCLHVCQUFBLElBQUksU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBQztJQUNoQyxDQUFDO0lBUkQsSUFBSSxJQUFJO1FBQ0osMkNBQWtCO0lBQ3RCLENBQUM7SUFRRCxLQUFLLENBQUMsSUFBWTtRQUNkLG9DQUFXLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFrQjtRQUNyQixvQ0FBVyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBRyxLQUF5QjtRQUNqQyxJQUFHLG9DQUFXLFFBQVEsS0FBSyxTQUFTLEVBQUM7WUFDakMsb0NBQVcsUUFBUSxHQUFHLEVBQUUsQ0FBQztTQUM1QjtRQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDdEIsb0NBQVcsUUFBUSxFQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQzNCLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQUcsS0FBeUI7UUFDN0IsSUFBRyxvQ0FBVyxJQUFJLEtBQUssU0FBUyxFQUFDO1lBQzdCLG9DQUFXLElBQUksR0FBRyxFQUFFLENBQUM7U0FDeEI7UUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ3RCLG9DQUFXLElBQUksRUFDZixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQzNCLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDOztBQXpETCxrQ0EwREM7O0FBekRVLG9CQUFRLEdBR1g7SUFDQSxNQUFNLEVBQUUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDdEQsSUFBSSxFQUFFLENBQUMsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0NBQ3JELENBQUM7QUFFSyxnQkFBSSxHQUdQO0lBQ0EsTUFBTSxFQUFFLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ2xELElBQUksRUFBRSxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztDQUNqRCxDQUFBO0FBeURRLFFBQUEsSUFBSSxHQUFpQixDQUFDLENBQUMsSUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBUSxDQUFDO0FBQ3JGLFlBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUNyQyxZQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMifQ==