"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _test;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.ParserError = void 0;
const jsonschema_1 = require("jsonschema");
const ParserSchema = require("../schema/parser.json");
const ArrayAccessor = {
    get(arr, prop, receiver) {
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
    set(arr, prop, value, receiver) {
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
    has(target, key) {
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
            rule.children.forEach((r) => deepLoop(rules, r));
        if (rule.hasOwnProperty('next'))
            rule.next.forEach((r) => deepLoop(rules, r));
    }
}
function loadRule(rules, index) {
    let rule = rules[index];
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
            rule.__rule.children = rule.children.map(i => loadRule(rules, i));
        }
        if (rule.hasOwnProperty('next')) {
            rule.__rule.next = rule.next.map(i => loadRule(rules, i));
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
class Consumer {
    constructor(parser, action) {
        this.parser = parser;
        this.action = action;
    }
}
class FallbackConsumer extends Consumer {
    constructor(parser, action) {
        super(parser, action);
        this.action = action;
    }
    *consume(str) {
        yield {
            action: this.action,
            consumed: 0,
        };
    }
    accept(str) {
        return true;
    }
}
class MatchConsumer extends Consumer {
    constructor(parser, action, test, token) {
        super(parser, action);
        _test.set(this, void 0);
        this._children = [];
        this._next = [];
        this.token = undefined;
        this.test = test;
        this.token = token;
    }
    set children(value) {
        this._children = value !== null && value !== void 0 ? value : [];
    }
    set next(value) {
        this._next = value !== null && value !== void 0 ? value : [];
    }
    *consume(str) {
        let val = str.match(this.testRegex())[0];
        str = str.slice(val.length);
        if (this.token === undefined) {
            yield {
                action: this.action,
                consumed: val.length,
                value: val,
            };
        }
        else {
            let token = {
                name: this.token,
                value: val,
                children: []
            };
            let children = new Proxy(token.children, ArrayAccessor);
            let consumed = val.length;
            if (this._children.length !== 0) {
                let loop = true;
                while (loop) {
                    let resolved = false;
                    for (let rule of this._children[Symbol.iterator]()) {
                        let c = this.parser.resolveConsumer(rule);
                        if (c.accept(str)) {
                            for (let res of c.consume(str)) {
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
                            resolved = true;
                            break;
                        }
                    }
                    if (!resolved) {
                        break;
                    }
                }
            }
            yield {
                action: this.action,
                consumed: consumed,
                value: token
            };
        }
        for (let rule of this._next) {
            let c = this.parser.resolveConsumer(rule);
            if (c.accept(str)) {
                yield* c.consume(str);
                break;
            }
        }
    }
    testRegex() {
        if (__classPrivateFieldGet(this, _test))
            return __classPrivateFieldGet(this, _test);
        if (typeof this.test === 'string') {
            return __classPrivateFieldSet(this, _test, /^[\s\S]/m);
        }
        let { pattern, flags } = this.test instanceof RegExp ?
            { pattern: this.test.source, flags: this.test.flags } :
            this.test;
        return __classPrivateFieldSet(this, _test, new RegExp(`^(?:${pattern})`, flags));
    }
    accept(str) {
        return str.match(this.testRegex()) !== null;
    }
}
_test = new WeakMap();
class ExtendConsumer extends MatchConsumer {
    constructor(parser, action, token) {
        super(parser, action, 'extend', token);
    }
    *consume(str) {
        let consumed = 0;
        let resolved = false;
        let result = [];
        let value = new Proxy(result, ArrayAccessor);
        let forward = [];
        for (let rule of this._children) {
            let consumer = this.parser.resolveConsumer(rule);
            if (consumer.accept(str)) {
                resolved = true;
                for (let res of consumer.consume(str)) {
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
                if (resolved) {
                    break; // for children
                }
            } // end if accept
        } // end for children
        if (!resolved) {
            throw new ParserError('Unrecognized pattern at > ' + str.slice(0, 10));
        }
        if (typeof this.token !== 'undefined') {
            yield {
                action: this.action,
                consumed: consumed,
                value: {
                    name: this.token,
                    value: '',
                    children: result,
                },
            };
        }
        else {
            yield* forward[Symbol.iterator]();
        }
        str = str.slice(consumed);
        for (let rule of this._next) {
            let c = this.parser.resolveConsumer(rule);
            if (c.accept(str)) {
                yield* c.consume(str);
                break;
            }
        }
    }
}
class ParserError extends Error {
}
exports.ParserError = ParserError;
class Parser {
    constructor(rule) {
        this.rules = [];
        this.consumer = [];
        this.entries = { default: rule };
        deepLoop(this.rules, rule);
    }
    static load(parser) {
        let validator = new jsonschema_1.Validator();
        validator.validate(parser, ParserSchema, { throwError: true });
        let cloned = JSON.parse(JSON.stringify(parser));
        let p = {
            entries: {},
            rules: [],
            consumer: [],
        };
        p.__proto__ = Parser.prototype;
        for (let entry of Object.entries(cloned.entries)) {
            p.addEntry(entry[0], loadRule(cloned.rules, entry[1]));
        }
        return p;
    }
    addEntry(name, rule) {
        this.entries[name] = rule;
        deepLoop(this.rules, rule);
        return this;
    }
    parse(str, entry) {
        if (typeof entry === "undefined") {
            entry = 'default';
        }
        let rule = this.entries[entry];
        let consumer = this.resolveConsumer(rule);
        let _result = [];
        let result = new Proxy(_result, ArrayAccessor);
        if (consumer.accept(str)) {
            for (let res of consumer.consume(str)) {
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
            return _result;
        }
        else {
            throw new ParserError('Unrecognized pattern at > ' + str.slice(0, 10));
        }
    }
    serialize() {
        let entries = {};
        for (let e of Object.entries(this.entries)) {
            entries[e[0]] = this.rules.indexOf(e[1]);
        }
        let data = {
            entries: entries,
            rules: [],
        };
        data.rules = this.rules.map((rule) => {
            if (rule.test === 'fallback') {
                return {
                    test: 'fallback',
                    action: rule.action,
                };
            }
            else {
                let r = {
                    test: rule.test instanceof RegExp ?
                        { pattern: rule.test.source, flags: rule.test.flags } :
                        rule.test,
                };
                if (rule.hasOwnProperty('action')) {
                    r.action = rule.action;
                }
                if (rule.hasOwnProperty('token')) {
                    r.token = rule.token;
                }
                if (rule.hasOwnProperty('children')) {
                    r.children = rule.children.map(r => this.rules.indexOf(r));
                }
                if (rule.hasOwnProperty('next')) {
                    r.next = rule.next.map(r => this.rules.indexOf(r));
                }
                return r;
            }
        });
        return data;
    }
    resolveConsumer(rule) {
        var _a, _b;
        let index = this.rules.indexOf(rule);
        if (index === -1) {
            return undefined;
        }
        if (typeof this.consumer[index] === 'undefined') {
            if (rule.test === 'fallback') {
                this.consumer[index] = new FallbackConsumer(this, rule.action);
            }
            else {
                let c;
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
    }
}
exports.Parser = Parser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwyQ0FBNkM7QUFFN0MsTUFBTSxZQUFZLEdBQVcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFOUQsTUFBTSxhQUFhLEdBQUc7SUFDbEIsR0FBRyxDQUFDLEdBQVUsRUFBRSxJQUFJLEVBQUUsUUFBYztRQUNoQyxRQUFRLElBQUksRUFBRTtZQUNWLEtBQUssTUFBTTtnQkFDUCxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDVCxNQUFNO1NBQ2I7UUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsR0FBRyxDQUFDLEdBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQWM7UUFDdkMsUUFBUSxJQUFJLEVBQUU7WUFDVixLQUFLLE1BQU07Z0JBQ1AsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixNQUFNO1lBQ1YsS0FBSyxPQUFPO2dCQUNSLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBQ1QsTUFBTTtTQUNiO1FBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDRCxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUc7UUFDWCxPQUFPLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxLQUFLLE1BQU0sSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQzlELENBQUM7Q0FDSixDQUFDO0FBT0YsU0FBUyxRQUFRLENBQUMsS0FBYSxF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