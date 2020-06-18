"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRule = exports.ObjectRule = exports.ArrayRule = exports.NullRule = exports.BooleanRule = exports.NumberRule = exports.StringRule = void 0;
var rules_1 = require("../rules");
exports.StringRule = rules_1.rule({ pattern: /"/.source })
    .token('STRING')
    .children(rules_1.rule({ pattern: /\\/.source })
    .action('skip')
    .next(rules_1.rule({ pattern: /["\\\/bfnr]/.source })
    .token('ESCAPE'), rules_1.rule({ pattern: /u[0-9a-f]{4}/.source, flags: 'i' })
    .token('UNICODE'), rules_1.rule.fallback.halt), rules_1.rule({ pattern: /[\x00-\x1f\x7f\x80-\x9f]/.source }).action('halt'), rules_1.rule({ pattern: '"' })
    .action('skip')
    .next(rules_1.rule.fallback.commit), rules_1.rule.char.append, rules_1.rule.fallback.halt);
var exponent = rules_1.rule({ pattern: /[eE][-+]?\d+/.source })
    .token('EXPONENT');
var fraction = rules_1.rule({ pattern: /.\d+/.source })
    .token('FRACTION')
    .next(exponent);
exports.NumberRule = rules_1.rule({ pattern: /-?(?:0|[1-9]\d+)/.source })
    .token('NUMBER')
    .children(fraction, exponent);
exports.BooleanRule = rules_1.rule({ pattern: /true|false/.source })
    .token('BOOEAN');
exports.NullRule = rules_1.rule({ pattern: 'null' })
    .token('NULL');
var val = rules_1.rule('extend')
    .token('VALUE')
    .children(exports.StringRule, exports.NumberRule, exports.BooleanRule, exports.NullRule);
var listEnd = rules_1.rule({ pattern: /\s*?]/.source })
    .action('skip')
    .next(rules_1.rule.fallback.commit);
var listItem = rules_1.rule('extend')
    .token('ITEM')
    .children(val)
    .next(listEnd);
var listSap = rules_1.rule({ pattern: /\s*?,\s*?/.source })
    .action("skip")
    .next(listItem, rules_1.rule.fallback.halt);
listItem.next(listSap, rules_1.rule.fallback.halt);
exports.ArrayRule = rules_1.rule({ pattern: /\[\s*?/.source })
    .token('ARRAY')
    .children(listItem);
val.children(exports.ArrayRule);
var key = rules_1.rule('extend')
    .token('KEY')
    .children(exports.StringRule)
    .next(rules_1.rule({ pattern: /\s*:\s*/.source })
    .action('skip')
    .next(val, rules_1.rule.fallback.halt), rules_1.rule.fallback.halt);
var objEnd = rules_1.rule({ pattern: /\s*}/.source })
    .action('skip')
    .next(rules_1.rule.fallback.commit);
var entry = rules_1.rule('extend')
    .token('ENTRY')
    .children(key)
    .next(objEnd);
var entrySap = rules_1.rule({ pattern: /\s*?,\s*?/.source })
    .action("skip")
    .next(entry, rules_1.rule.fallback.halt);
entry.next(entrySap, rules_1.rule.fallback.halt);
exports.ObjectRule = rules_1.rule({ pattern: /{\s*/.source })
    .token('OBJECT')
    .children(entry, objEnd, rules_1.rule.fallback.halt);
val.children(exports.ObjectRule);
exports.JsonRule = rules_1.rule({ pattern: /\s*/.source })
    .next(rules_1.rule('extend')
    .children(val)
    .next(rules_1.rule({ pattern: /\s*$/.source })
    .next(rules_1.rule.fallback.commit, rules_1.rule.fallback.halt)), rules_1.rule.fallback.halt);
//# sourceMappingURL=json.js.map