import {Rule, RuleTest, SerializedParser, SerializedRule} from "./rules";
import {Schema, Validator} from "jsonschema";

const ParserSchema: Schema = require("../schema/parser.json");

const ArrLast = {
    get(arr: any[], prop, receiver?: any) {
        if (prop === 'last') {
            return arr[arr.length - 1];
        }
        return Reflect.get(arr, prop, receiver);
    },
    set(arr: any[], prop, value, receiver?: any) {
        if (prop === 'last' && arr.length > 0) {
            return arr[arr.length - 1] = value;
        }
        return Reflect.set(arr, prop, value, receiver);
    }
};

interface HasLastArr<T> extends Array<T> {
    last: T;
}

function deepLoop(rules: Rule[], rule: Rule) {
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

interface ParserEntries {
    default: Rule;

    [name: string]: Rule;
}

function loadRule(rules: SerializedRule[], index: number): Rule {
    let rule: any = rules[index];
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

enum ConsumerAction {
    APPEND = 'append',
    COMMIT = 'commit',
    SKIP = 'skip',
    HALT = 'halt'
}

export interface Token {
    name: string;
    value: string;
    children: (Token | string)[];
}

interface ConsumerResult {
    action: ConsumerAction;
    consumed: number;
    value?: Token | string;
}

abstract class Consumer {
    protected parser: Parser;
    protected action: ConsumerAction;

    protected constructor(parser: Parser, action: ConsumerAction) {
        this.parser = parser;
        this.action = action;
    }

    abstract consume(str: string): Generator<ConsumerResult>;

    public abstract accept(str: string): boolean;
}

class FallbackConsumer extends Consumer {
    protected action: ConsumerAction;

    constructor(parser: Parser, action: ConsumerAction.COMMIT | ConsumerAction.HALT) {
        super(parser, action);
        this.action = action;
    }

    * consume(str: string): Generator<ConsumerResult> {
        yield {
            action: this.action,
            consumed: 0,
        };
    }

    accept(str: string): boolean {
        return true;
    }
}

class MatchConsumer extends Consumer {
    set children(value: Rule[]) {
        this._children = value ?? [];
    }

    set next(value: Rule[]) {
        this._next = value ?? [];
    }

    private _children: Rule[] = [];
    private _next: Rule[] = [];
    protected test: RuleTest;
    protected token?: string = undefined;

    constructor(parser: Parser, action: ConsumerAction, test: 'char' | { pattern: string, flags?: string }, token?: string) {
        super(parser, action);
        this.test = test;
        this.token = token;
    }

    * consume(str: string): Generator<ConsumerResult> {
        let val = str.match(this.testRegex())[0];
        str = str.slice(val.length);
        if (this.token === undefined) {
            yield {
                action: this.action,
                consumed: val.length,
                value: val,
            }
        } else {
            let token: Token = {
                name: this.token,
                value: val,
                children: []
            }
            let children = new Proxy(token.children, ArrLast) as HasLastArr<Token | string>;
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
                                    } else if (typeof res.value !== 'undefined') {
                                        children.push(res.value);
                                    }
                                }
                                str = str.slice(res.consumed);
                                consumed += res.consumed;
                                if (res.action === ConsumerAction.COMMIT) {
                                    loop = false;
                                } else if (res.action === ConsumerAction.HALT) {
                                    throw new Error('Syntax Error at > ' + str.slice(0, 10));
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
            }
        }
        for (let rule of this._next) {
            let c = this.parser.resolveConsumer(rule);
            if (c.accept(str)) {
                yield* c.consume(str);
                break;
            }
        }
    }

    protected testRegex(): RegExp {
        if (typeof this.test === 'string') {
            return /^[\s\S]/m;
        }
        return new RegExp(`^(?:${this.test.pattern})`, this.test.flags);
    }

    accept(str: string): boolean {
        return str.match(this.testRegex()) !== null;
    }
}

export class Parser {
    static load(parser: SerializedParser) {
        let validator = new Validator();
        validator.validate(parser, ParserSchema, {throwError: true});
        let cloned: SerializedParser = JSON.parse(JSON.stringify(parser));
        let p: any = {
            entries: {},
            rules: [],
            consumer: [],
        } as any;
        p.__proto__ = Parser.prototype;
        for (let entry of Object.entries(cloned.entries)) {
            p.addEntry(entry[0], loadRule(cloned.rules, entry[1]));
        }
        return p;
    }

    protected readonly entries: ParserEntries;

    protected readonly rules: Rule[] = [];

    protected consumer: Consumer[] = [];

    constructor(rule: Rule) {
        this.entries = {default: rule};
        deepLoop(this.rules, rule);
    }

    addEntry(name: string, rule: Rule): this {
        this.entries[name] = rule;
        deepLoop(this.rules, rule);
        return this;
    }

    parse(str: string, entry?: string): (Token | string)[] {
        if (typeof entry === "undefined") {
            entry = 'default';
        }
        let rule = this.entries[entry];
        let consumer = this.resolveConsumer(rule);
        let _result: (Token | string)[] = [];
        let result = new Proxy(_result, ArrLast) as HasLastArr<Token | string>;
        if(consumer.accept(str)){
            for (let res of consumer.consume(str)) {
                if (res.action !== ConsumerAction.SKIP) {
                    if (typeof res.value === 'string') {
                        if (typeof result.last !== 'string') {
                            result.push('');
                        }
                        result.last += res.value;
                    } else {
                        result.push(res.value);
                    }
                }
                if (res.action === ConsumerAction.COMMIT) {
                    break;
                } else if (res.action === ConsumerAction.HALT) {
                    throw new Error('Syntax Error');
                }
            }
            return _result;
        } else {
            throw new Error('Syntax Error at > ' + str.slice(0, 10));
        }
    }

    serialize(): SerializedParser {
        let entries: any = {};
        for (let e of Object.entries(this.entries)) {
            entries[e[0]] = this.rules.indexOf(e[1]);
        }
        let data: SerializedParser = {
            entries: entries,
            rules: [],
        };
        data.rules = this.rules.map((rule) => {
            if (rule.test === 'fallback') {
                return {
                    test: 'fallback',
                    action: rule.action,
                }
            } else {
                let r: SerializedRule = {
                    test: rule.test,
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

    resolveConsumer(rule: Rule): Consumer {
        let index = this.rules.indexOf(rule);
        if (index === -1) {
            return undefined;
        }
        if (typeof this.consumer[index] === 'undefined') {
            if (rule.test === 'fallback') {
                this.consumer[index] = new FallbackConsumer(this, rule.action as any);
            } else if (rule.test === 'extend') {

            } else {
                let c = new MatchConsumer(this, rule.action as any, rule.test, rule.token);
                c.children = rule.children;
                c.next = rule.next;
                this.consumer[index] = c;
            }
        }
        return this.consumer[index];
    }
}