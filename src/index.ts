import {Rule, SerializedParser, SerializedRule} from "./rules";

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

export class Parser {
    protected readonly root: Rule;

    protected readonly rules: Rule[] = [];

    constructor(rule: Rule) {
        this.root = rule;
        deepLoop(this.rules, rule);
    }

    serialize(): SerializedParser {
        let data: SerializedParser = {
            root: this.rules.indexOf(this.root),
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