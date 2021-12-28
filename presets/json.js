const rule = require('../dist/rules').rule;

exports.StringRule = rule(/"/)
    .token('STRING')
    .children(
        rule({pattern: /\\/.source})
            .action('skip')
            .next(
                rule(/["\\\/bfnr]/)
                    .token('ESCAPE'),
                rule({pattern: /u/.source})
                    .action('skip')
                    .next(
                        rule(/[0-9a-f]{4}/i)
                            .token('UNICODE'),
                        rule.fallback.halt,
                    ),
                rule.fallback.halt,
            ),
        rule({pattern: /[\x00-\x1f\x7f\x80-\x9f]/.source}).action('halt'),
        rule({pattern: '"'})
            .action('skip')
            .next(rule.fallback.commit),
        rule.char.append,
        rule.fallback.halt
    );

let exponent = rule(/[eE][-+]?\d+/)
    .token('EXPONENT');

let fraction = rule(/.\d+/)
    .token('FRACTION')
    .next(exponent);

exports.NumberRule = rule(/-?(?:0|[1-9]\d+)/)
    .token('NUMBER')
    .children(
        fraction,
        exponent,
    );

exports.BooleanRule = rule(/true|false/)
    .token('BOOEAN');

exports.NullRule = rule(/null/)
    .token('NULL');

let val = rule('extend')
    .token('VALUE')
    .children(
        exports.StringRule, exports.NumberRule,
        exports.BooleanRule, exports.NullRule
    )

let listEnd = rule(/\s*]/)
    .action('skip')
    .next(rule.fallback.commit);

let listItem = rule('extend')
    .token('ITEM')
    .children(val)
    .next(listEnd);

let listSap = rule(/\s*,\s*/)
    .action("skip")
    .next(listItem, rule.fallback.halt);

listItem.next(listSap, rule.fallback.halt);

exports.ArrayRule = rule(/\[\s*/)
    .token('ARRAY')
    .children(listItem);

val.children(exports.ArrayRule);

let key = rule('extend')
    .token('KEY')
    .children(exports.StringRule)
    .next(
        rule(/\s*:\s*/)
            .action('skip')
            .next(val, rule.fallback.halt),
        rule.fallback.halt
    )

let objEnd = rule(/\s*}/)
    .action('skip')
    .next(rule.fallback.commit);

let entry = rule('extend')
    .token('ENTRY')
    .children(key)
    .next(objEnd);

let entrySap = rule(/\s*,\s*/)
    .action("skip")
    .next(entry, rule.fallback.halt);

entry.next(entrySap, rule.fallback.halt);

exports.ObjectRule = rule(/{\s*/)
    .token('OBJECT')
    .children(entry, objEnd, rule.fallback.halt);

val.children(exports.ObjectRule);

exports.default = rule(/\s*/)
    .action('skip')
    .next(
        rule('extend')
            .children(val)
            .next(
                rule({pattern: /\s*$/.source})
                    .action('skip')
                    .next(
                        rule.fallback.commit,
                        rule.fallback.halt,
                    )
            ),
        rule.fallback.halt
    )
