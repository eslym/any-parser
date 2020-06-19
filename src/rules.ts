export declare type RuleTest = 'char' | 'extend' | 'fallback' | {pattern: string, flags?:string};

export declare type RuleAction = 'append' | 'commit' | 'halt' | 'skip';

export declare type Rule = FallbackRule | MatchRule;

export interface BaseRule {
    test: RuleTest;
    action?: RuleAction;
}

export interface FallbackRule extends BaseRule{
    test: 'fallback';
    action: 'commit' | 'halt';
}

export interface MatchRule extends BaseRule{
    test: 'char' | 'extend' | {pattern: string, flags?:string};
    token?: string,
    children?: Rule[],
    next?: Rule[],
}

interface RuleHolder<T extends Rule> {
    rule: T;
}

interface SerializedParserEntries {
    default: number;
    [name: string]: number;
}

export interface SerializedParser {
    '$schema'?: string;
    entries: SerializedParserEntries;
    rules: SerializedRule[];
}

export declare type SerializedRule = SerializedMatchRule | FallbackRule;

interface SerializedMatchRule extends BaseRule {
    test: 'char' | 'extend' | {pattern: string, flags?:string};
    token?: string;
    children?: number[];
    next?: number[];
}

export class RuleBuilder implements RuleHolder<Rule>{
    static fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilder,
        readonly halt: RuleHolder<FallbackRule> | RuleBuilder
    } = {
        commit: (new RuleBuilder('fallback')).action('commit'),
        halt: (new RuleBuilder('fallback')).action('halt'),
    };

    static char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilder,
        readonly skip: RuleHolder<MatchRule> | RuleBuilder,
    } = {
        append: (new RuleBuilder('char')).action('append'),
        skip: (new RuleBuilder('char')).action('skip'),
    }

    get rule(): Rule {
        return this._rule;
    }

    private readonly _rule: any;

    constructor(test: RuleTest) {
        if(!(this instanceof RuleBuilder)){
            return new RuleBuilder(test);
        }
        this._rule = { test: test };
    }

    token(name: string): this{
        this._rule.token = name;
        return this;
    }

    action(action: RuleAction): this{
        this._rule.action = action;
        return this;
    }

    children(...rules: RuleHolder<Rule>[]): this{
        if(this._rule.children === undefined){
            this._rule.children = [];
        }
        Array.prototype.push.apply(
            this._rule.children,
            rules.map((r) => r.rule)
        );
        return this;
    }

    next(...rules: RuleHolder<Rule>[]): this{
        if(this._rule.next === undefined){
            this._rule.next = [];
        }
        Array.prototype.push.apply(
            this._rule.next,
            rules.map((r) => r.rule)
        );
        return this;
    }
}

interface RuleFunction{
    fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilder,
        readonly halt: RuleHolder<FallbackRule> | RuleBuilder
    };
    char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilder,
        readonly skip: RuleHolder<MatchRule> | RuleBuilder,
    };
    (test: RuleTest):RuleBuilder;
    new (test: RuleTest):RuleBuilder;
}

export const rule: RuleFunction = RuleBuilder as any;
