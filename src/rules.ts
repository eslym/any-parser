export declare type RuleTest = 'char' | 'extend' | 'fallback' | {pattern: string, flags?:string} | RegExp;

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
        return this.#rule;
    }

    readonly #rule: any;

    constructor(test: RuleTest) {
        this.#rule = { test: test };
    }

    token(name: string): this{
        this.#rule.token = name;
        return this;
    }

    action(action: RuleAction): this{
        this.#rule.action = action;
        return this;
    }

    children(...rules: RuleHolder<Rule>[]): this{
        if(this.#rule.children === undefined){
            this.#rule.children = [];
        }
        Array.prototype.push.apply(
            this.#rule.children,
            rules.map((r) => r.rule)
        );
        return this;
    }

    next(...rules: RuleHolder<Rule>[]): this{
        if(this.#rule.next === undefined){
            this.#rule.next = [];
        }
        Array.prototype.push.apply(
            this.#rule.next,
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
}

export const rule: RuleFunction = ((test: RuleTest) => new RuleBuilder(test)) as any;
rule.fallback = RuleBuilder.fallback;
rule.char = RuleBuilder.char;
