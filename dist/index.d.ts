import { Rule, SerializedParser } from "./rules";
interface ParserEntries {
    default: Rule;
    [name: string]: Rule;
}
export declare class Parser {
    static load(parser: SerializedParser): any;
    protected readonly entries: ParserEntries;
    protected readonly rules: Rule[];
    constructor(rule: Rule);
    addEntry(name: string, rule: Rule): this;
    serialize(): SerializedParser;
}
export {};
