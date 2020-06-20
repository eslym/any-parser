import { Rule, SerializedParser } from "./rules";
interface ParserEntries {
    default: Rule;
    [name: string]: Rule;
}
declare enum ConsumerAction {
    APPEND = "append",
    COMMIT = "commit",
    SKIP = "skip",
    HALT = "halt"
}
export interface Token {
    name: string;
    value: string;
    children: (Token | string)[];
}
interface ConsumerResult {
    action: ConsumerAction;
    consumed: number;
    value?: Token | string;
}
declare abstract class Consumer {
    protected parser: Parser;
    protected action: ConsumerAction;
    protected constructor(parser: Parser, action: ConsumerAction);
    abstract consume(str: string): Generator<ConsumerResult>;
    abstract accept(str: string): boolean;
}
export declare class Parser {
    static load(parser: SerializedParser): any;
    protected readonly entries: ParserEntries;
    protected readonly rules: Rule[];
    protected consumer: Consumer[];
    constructor(rule: Rule);
    addEntry(name: string, rule: Rule): this;
    parse(str: string, entry?: string): (Token | string)[];
    serialize(): SerializedParser;
    resolveConsumer(rule: Rule): Consumer;
}
export {};
