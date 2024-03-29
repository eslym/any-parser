"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRule = exports.ObjectRule = exports.ArrayRule = exports.NullRule = exports.BooleanRule = exports.NumberRule = exports.StringRule = void 0;
const rules_1 = require("../rules");
const stringRule = rules_1.rule(/"/)
    .token('STRING')
    .children(rules_1.rule(/\\/)
    .action('skip')
    .next(rules_1.rule(/["\\\/bfnr]/)
    .token('ESCAPE'), rules_1.rule(/u/)
    .action('skip')
    .next(rules_1.rule(/[0-9a-f]{4}/i)
    .token('UNICODE'), rules_1.rule.fallback.halt), rules_1.rule.fallback.halt), rules_1.rule(/[\x00-\x1f\x7f\x80-\x9f]/).action('halt'), rules_1.rule(/"/)
    .action('skip')
    .next(rules_1.rule.fallback.commit), rules_1.rule.char.append, rules_1.rule.fallback.halt);
exports.StringRule = stringRule.rule;
const exponent = rules_1.rule(/[eE][-+]?\d+/)
    .token('EXPONENT');
const fraction = rules_1.rule(/.\d+/)
    .token('FRACTION')
    .next(exponent);
const numberRule = rules_1.rule(/-?(?:0|[1-9]\d+)/)
    .token('NUMBER')
    .children(fraction, exponent);
exports.NumberRule = numberRule.rule;
const booleanRule = rules_1.rule(/true|false/)
    .token('BOOEAN');
exports.BooleanRule = booleanRule.rule;
const nullRule = rules_1.rule(/null/)
    .token('NULL');
exports.NullRule = nullRule.rule;
const val = rules_1.rule('extend')
    .token('VALUE')
    .children(stringRule, numberRule, booleanRule, nullRule);
const listEnd = rules_1.rule(/\s*]/)
    .action('skip')
    .next(rules_1.rule.fallback.commit);
const listItem = rules_1.rule('extend')
    .token('ITEM')
    .children(val)
    .next(listEnd);
const listSap = rules_1.rule(/\s*,\s*/)
    .action("skip")
    .next(listItem, rules_1.rule.fallback.halt);
listItem.next(listSap, rules_1.rule.fallback.halt);
const arrayRule = rules_1.rule(/\[\s*/)
    .token('ARRAY')
    .children(listItem);
exports.ArrayRule = arrayRule.rule;
val.children(arrayRule);
const key = rules_1.rule('extend')
    .token('KEY')
    .children(stringRule)
    .next(rules_1.rule(/\s*:\s*/)
    .action('skip')
    .next(val, rules_1.rule.fallback.halt), rules_1.rule.fallback.halt);
const objEnd = rules_1.rule(/\s*}/)
    .action('skip')
    .next(rules_1.rule.fallback.commit);
const entry = rules_1.rule('extend')
    .token('ENTRY')
    .children(key)
    .next(objEnd);
const entrySap = rules_1.rule(/\s*,\s*/)
    .action("skip")
    .next(entry, rules_1.rule.fallback.halt);
entry.next(entrySap, rules_1.rule.fallback.halt);
const objectRule = rules_1.rule(/{\s*/)
    .token('OBJECT')
    .children(entry, objEnd, rules_1.rule.fallback.halt);
exports.ObjectRule = objectRule.rule;
val.children(objectRule);
const jsonRule = rules_1.rule(/\s*/)
    .action('skip')
    .next(rules_1.rule('extend')
    .children(val)
    .next(rules_1.rule(/\s*$/)
    .action('skip')
    .next(rules_1.rule.fallback.commit, rules_1.rule.fallback.halt)), rules_1.rule.fallback.halt);
exports.JSONRule = jsonRule.rule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVzZXRzL2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0NBQThCO0FBRTlCLE1BQU0sVUFBVSxHQUFHLFlBQUksQ0FBQyxHQUFHLENBQUM7S0FDdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUNmLFFBQVEsQ0FDTCxZQUFJLENBQUUsSUFBSSxDQUFDO0tBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQztLQUNkLElBQUksQ0FDRCxZQUFJLENBQUMsYUFBYSxDQUFDO0tBQ2QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNwQixZQUFJLENBQUUsR0FBRyxDQUFDO0tBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQztLQUNkLElBQUksQ0FDRCxZQUFJLENBQUMsY0FBYyxDQUFDO0tBQ2YsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUNyQixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDckIsRUFDTCxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDckIsRUFDTCxZQUFJLENBQUUsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQ2hELFlBQUksQ0FBQyxHQUFHLENBQUM7S0FDSixNQUFNLENBQUMsTUFBTSxDQUFDO0tBQ2QsSUFBSSxDQUFDLFlBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQy9CLFlBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUNoQixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDckIsQ0FBQztBQUVPLFFBQUEsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFFMUMsTUFBTSxRQUFRLEdBQUcsWUFBSSxDQUFDLGNBQWMsQ0FBQztLQUNoQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFdkIsTUFBTSxRQUFRLEdBQUcsWUFBSSxDQUFDLE1BQU0sQ0FBQztLQUN4QixLQUFLLENBQUMsVUFBVSxDQUFDO0tBQ2pC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