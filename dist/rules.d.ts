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
export interface MatchRule {
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
declare class RuleBuilderImpl implements RuleHolder<Rule> {
    static fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilderImpl;
        readonly halt: RuleHolder<FallbackRule> | RuleBuilderImpl;
    };
    static char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilderImpl;
        readonly skip: RuleHolder<MatchRule> | RuleBuilderImpl;
    };
    get rule(): Rule;
    private readonly _rule;
    constructor(test: RuleTest);
    token(name: string): this;
    action(action: RuleAction): this;
    children(...rules: RuleHolder<Rule>[]): this;
    next(...rules: RuleHolder<Rule>[]): this;
}
export declare const RuleBuilder: (test: RuleTest) => RuleBuilderImpl | typeof RuleBuilderImpl;
export {};
