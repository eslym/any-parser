export declare type RuleTest = 'char' | 'extend' | 'fallback' | {
    pattern: string;
    flags?: string;
};
export declare type RuleAction = 'append' | 'commit' | 'halt' | 'skip';
export declare type Rule = FallbackRule | MatchRule;
export interface BaseRule {
    test: RuleTest;
    action?: RuleAction;
}
export interface FallbackRule extends BaseRule {
    test: 'fallback';
    action: 'commit' | 'halt';
}
export interface MatchRule extends BaseRule {
    test: 'char' | 'extend' | {
        pattern: string;
        flags?: string;
    };
    token?: string;
    children?: Rule[];
    next?: Rule[];
}
interface RuleHolder<T extends Rule> {
    rule: T;
}
export interface SerializedParser {
    root: number;
    rules: SerializedRule[];
}
export declare type SerializedRule = SerializedMatchRule | FallbackRule;
interface SerializedMatchRule extends BaseRule {
    test: 'char' | 'extend' | {
        pattern: string;
        flags?: string;
    };
    token?: string;
    children?: number[];
    next?: number[];
}
export declare class RuleBuilder implements RuleHolder<Rule> {
    static fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilder;
        readonly halt: RuleHolder<FallbackRule> | RuleBuilder;
    };
    static char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilder;
        readonly skip: RuleHolder<MatchRule> | RuleBuilder;
    };
    get rule(): Rule;
    private readonly _rule;
    constructor(test: RuleTest);
    token(name: string): this;
    action(action: RuleAction): this;
    children(...rules: RuleHolder<Rule>[]): this;
    next(...rules: RuleHolder<Rule>[]): this;
}
interface RuleFunction {
    fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilder;
        readonly halt: RuleHolder<FallbackRule> | RuleBuilder;
    };
    char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilder;
        readonly skip: RuleHolder<MatchRule> | RuleBuilder;
    };
    (test: RuleTest): RuleBuilder;
    new (test: RuleTest): RuleBuilder;
}
export declare const rule: RuleFunction;
export {};
