const JsonRule = require('../presets/json').default;

const Parser = require('../dist/index').Parser;

const rules = require('../dist/presets/json.json');

let p1 = new Parser(JsonRule.rule);

console.log(JSON.stringify(p1.serialize(), null, 4));

p2 = Parser.load(rules);

console.log(p1, p2);