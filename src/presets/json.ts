import {rule} from '../rules';

const stringRule = rule(/"/)
    .token('STRING')
    .children(
        rule( /\\/)
            .action('skip')
            .next(
                rule(/["\\\/bfnr]/)
                    .token('ESCAPE'),
                rule( /u/)
                    .action('skip')
                    .next(
                        rule(/[0-9a-f]{4}/i)
                            .token('UNICODE'),
                        rule.fallback.halt,
                    ),
                rule.fallback.halt,
            ),
        rule( /[\x00-\x1f\x7f\x80-\x9f]/).action('halt'),
        rule(/"/)
            .action('skip')
            .next(rule.fallback.commit),
        rule.char.append,
        rule.fallback.halt
    );

export const StringRule = stringRule.rule;

const exponent = rule(/[eE][-+]?\d+/)
    .token('EXPONENT');

const fraction = rule(/.\d+/)
    .token('FRACTION')
    .next(exponent);

const numberRule = rule(/-?(?:0|[1-9]\d+)/)
    .token('NUMBER')
    .children(
        fraction,
        exponent,
    );

export const NumberRule = numberRule.rule;

const booleanRule = rule(/true|false/)
    .token('BOOEAN');

export const BooleanRule = booleanRule.rule

const nullRule = rule(/null/)
    .token('NULL');

export const NullRule = nullRule.rule;

const val = rule('extend')
    .token('VALUE')
    .children(
        stringRule, numberRule,
        booleanRule, nullRule
    )

const listEnd = rule(/\s*]/)
    .action('skip')
    .next(rule.fallback.commit);

const listItem = rule('extend')
    .token('ITEM')
    .children(val)
    .next(listEnd);

const listSap = rule(/\s*,\s*/)
    .action("skip")
    .next(listItem, rule.fallback.halt);

listItem.next(listSap, rule.fallback.halt);

const arrayRule = rule(/\[\s*/)
    .token('ARRAY')
    .children(listItem);

export const ArrayRule = arrayRule.rule;

val.children(arrayRule);

const key = rule('extend')
    .token('KEY')
    .children(stringRule)
    .next(
        rule(/\s*:\s*/)
            .action('skip')
            .next(val, rule.fallback.halt),
        rule.fallback.halt
    )

const objEnd = rule(/\s*}/)
    .action('skip')
    .next(rule.fallback.commit);

const entry = rule('extend')
    .token('ENTRY')
    .children(key)
    .next(objEnd);

const entrySap = rule(/\s*,\s*/)
    .action("skip")
    .next(entry, rule.fallback.halt);

entry.next(entrySap, rule.fallback.halt);

const objectRule = rule(/{\s*/)
    .token('OBJECT')
    .children(entry, objEnd, rule.fallback.halt);

export const ObjectRule = objectRule.rule;

val.children(objectRule);

const jsonRule = rule(/\s*/)
    .action('skip')
    .next(
        rule('extend')
            .children(val)
            .next(
                rule( /\s*$/)
                    .action('skip')
                    .next(
                        rule.fallback.commit,
                        rule.fallback.halt,
                    )
            ),
        rule.fallback.halt
    );

export const JSONRule = jsonRule.rule;
