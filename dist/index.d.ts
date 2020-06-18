import { Rule, SerializedParser } from "./rules";
export declare class Parser {
    protected readonly root: Rule;
    protected readonly rules: Rule[];
    constructor(rule: Rule);
    serialize(): SerializedParser;
}
