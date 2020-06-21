const rule = require('../dist/rules').rule;

exports.StringRule = rule({pattern: /"/.source})
    .token('STRING')
    .children(
        rule({pattern: /\\/.source})
            .action('skip')
            .next(
                rule({pattern: /["\\\/bfnr]/.source})
                    .token('ESCAPE'),
                rule({pattern: /u/.source})
                    .action('skip')
                    .next(
                        rule({pattern: /[0-9a-f]{4}/.source, flags:'i'})
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

let exponent = rule({pattern: /[eE][-+]?\d+/.source})
    .token('EXPONENT');

let fraction = rule({pattern: /.\d+/.source})
    .token('FRACTION')
    .next(exponent);

exports.NumberRule = rule({pattern: /-?(?:0|[1-9]\d+)/.source})
    .token('NUMBER')
    .children(
        fraction,
        exponent,
    );

exports.BooleanRule = rule({pattern: /true|false/.source})
    .token('BOOEAN');

exports.NullRule = rule({pattern: 'null'})
    .token('NULL');

let val = rule('extend')
    .token('VALUE')
    .children(
        exports.StringRule, exports.NumberRule,
        exports.BooleanRule, exports.NullRule
    )

let listEnd = rule({pattern: /\s*]/.source})
    .action('skip')
    .next(rule.fallback.commit);

let listItem = rule('extend')
    .token('ITEM')
    .children(val)
    .next(listEnd);

let listSap = rule({pattern: /\s*,\s*/.source})
    .action("skip")
    .next(listItem, rule.fallback.halt);

listItem.next(listSap, rule.fallback.halt);

exports.ArrayRule = rule({pattern: /\[\s*/.source})
    .token('ARRAY')
    .children(listItem);

val.children(exports.ArrayRule);

let key = rule('extend')
    .token('KEY')
    .children(exports.StringRule)
    .next(
        rule({pattern: /\s*:\s*/.source})
            .action('skip')
            .next(val, rule.fallback.halt),
        rule.fallback.halt
    )

let objEnd = rule({pattern: /\s*}/.source})
    .action('skip')
    .next(rule.fallback.commit);

let entry = rule('extend')
    .token('ENTRY')
    .children(key)
    .next(objEnd);

let entrySap = rule({pattern: /\s*,\s*/.source})
    .action("skip")
    .next(entry, rule.fallback.halt);

entry.next(entrySap, rule.fallback.halt);

exports.ObjectRule = rule({pattern: /{\s*/.source})
    .token('OBJECT')
    .children(entry, objEnd, rule.fallback.halt);

val.children(exports.ObjectRule);

exports.default = rule({pattern: /\s*/.source})
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
