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

export interface MatchRule {
    test: 'char' | 'extend' | {pattern: string, flags?:string};
    token?: string,
    children?: Rule[],
    next?: Rule[],
}

interface RuleHolder<T extends Rule> {
    rule: T;
}

class RuleBuilderImpl implements RuleHolder<Rule>{
    static fallback: {
        readonly commit: RuleHolder<FallbackRule> | RuleBuilderImpl,
        readonly halt: RuleHolder<FallbackRule> | RuleBuilderImpl
    } = {
        commit: (new RuleBuilderImpl('fallback')).action('commit'),
        halt: (new RuleBuilderImpl('fallback')).action('halt'),
    };

    static char: {
        readonly append: RuleHolder<MatchRule> | RuleBuilderImpl,
        readonly skip: RuleHolder<MatchRule> | RuleBuilderImpl,
    } = {
        append: (new RuleBuilderImpl('char')).action('append'),
        skip: (new RuleBuilderImpl('char')).action('skip'),
    }

    get rule(): Rule {
        return this._rule;
    }

    private readonly _rule: any;

    constructor(test: RuleTest) {
        if(!(this instanceof RuleBuilderImpl)){
            return new RuleBuilderImpl(test);
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

export const RuleBuilder: (test: RuleTest)=>RuleBuilderImpl | typeof RuleBuilderImpl = RuleBuilderImpl as any;
