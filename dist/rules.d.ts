export declare type RuleTest = 'char' | 'extend' | 'fallback' | {
    pattern: string;
    flags?: string;
} | RegExp;
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
    test: 'char' | 'extend' | {
        pattern: string;
        flags?: string;
    };
    token?: string;
    children?: number[];
    next?: number[];
}
export declare class RuleBuilder implements RuleHolder<Rule> {
    #private;
    static fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilder;
        readonly halt: RuleHolder<FallbackRule> | RuleBuilder;
    };
    static char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilder;
        readonly skip: RuleHolder<MatchRule> | RuleBuilder;
    };
    get rule(): Rule;
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
}
export declare const rule: RuleFunction;
export {};
