import {Rule, RuleTest, SerializedParser, SerializedRule} from "./rules";
import {Schema, Validator} from "jsonschema";

const ParserSchema: Schema = require("../schema/parser.json");

function deepLoop(rules: Rule[], rule: Rule) {
    if(rules.indexOf(rule) !== -1){
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

function loadRule(rules: SerializedRule[], index: number): Rule{
    let rule: any = rules[index];
    if(!rule.hasOwnProperty('__rule')){
        rule.__rule = {
            test: rule.test,
        };
        if(rule.hasOwnProperty('action')){
            rule.__rule.action = rule.action;
        }
        if(rule.hasOwnProperty('token')){
            rule.__rule.token = rule.token;
        }
        if(rule.hasOwnProperty('children')){
            rule.__rule.children = rule.children.map(i=>loadRule(rules, i));
        }
        if(rule.hasOwnProperty('next')){
            rule.__rule.next = rule.next.map(i=>loadRule(rules, i));
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
    children: [];
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

    abstract consume(str: string, callback:(res: ConsumerResult)=>void): void;
}

class FallbackConsumer extends Consumer {
    protected action: ConsumerAction;

    constructor(parser: Parser, action: ConsumerAction.COMMIT | ConsumerAction.HALT) {
        super(parser, action);
        this.action = action;
    }

    consume(str: string, callback:(res: ConsumerResult)=>void): boolean{
        callback({
            action: this.action,
            consumed: 0,
        });
        return true;
    }
}

class MatchConsumer extends Consumer {
    set children(value: Rule[]) {
        this._children = value;
    }
    set next(value: Rule[]) {
        this._next = value;
    }

    private _children: Rule[] = [];
    private _next: Rule[] = [];
    protected test: RuleTest;
    protected token?: string = undefined;

    constructor(parser: Parser, action: ConsumerAction, test: 'char' | {pattern: string, flags?: string}, token?: string) {
        super(parser, action);
        this.test = test;
        this.token = token;
    }

    consume(str: string, callback:(res: ConsumerResult)=>void): boolean{
        let match = str.match(this.testRegex());
        if(!match){
            return false;
        }
        let val: Token | string = match[0];
        if(this._children.length > 0){
            if(typeof this.token === 'undefined'){
                callback({
                    action: this.action,
                    consumed: match[0].length,
                    value: val,
                });
            } else {
                let consumed = val.length;
                val = {
                    name: this.token,
                    value: val,
                    children: [],
                };

            }
        } else {
            if(typeof this.token !== 'undefined'){
                val = {
                    name: this.token,
                    value: val,
                    children: [],
                };
            }
            callback({
                action: this.action,
                consumed: match[0].length,
                value: val,
            });
        }
        if(this._next.length > 0){

        }
    }

    protected testRegex(){
        if(typeof this.test === 'string'){
            return /^[\s\S]/m;
        }
        return new RegExp(`^(?:${this.test.pattern})`, this.test.flags);
    }
}

export class Parser {
    static load(parser: SerializedParser){
        let validator = new Validator();
        validator.validate(parser, ParserSchema, {throwError: true});
        let cloned: SerializedParser = JSON.parse(JSON.stringify(parser));
        let p: any = {
            entries: {},
            rules: [],
        } as any;
        p.__proto__ = Parser.prototype;
        for(let entry of Object.entries(cloned.entries)) {
            p.addEntry(entry[0], loadRule(cloned.rules, entry[1]));
        }
        return p;
    }

    protected readonly entries: ParserEntries;

    protected readonly rules: Rule[] = [];

    protected consumer: Consumer[];

    constructor(rule: Rule) {
        this.entries = {default: rule};
        deepLoop(this.rules, rule);
    }

    addEntry(name:string, rule: Rule): this{
        this.entries[name] = rule;
        deepLoop(this.rules, rule);

        return this;
    }

    serialize(): SerializedParser {
        let entries: any = {};
        for(let e of Object.entries(this.entries)){
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
                    r.children = rule.children.map(r=>this.rules.indexOf(r));
                }
                if (rule.hasOwnProperty('next')) {
                    r.next = rule.next.map(r=>this.rules.indexOf(r));
                }
                return r;
            }
        });
        return data;
    }
}