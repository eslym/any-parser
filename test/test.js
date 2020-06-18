const JsonRule = require('../dist/presets/json').JsonRule;

const Parser = require('../dist/index').Parser;

let p = new Parser(JsonRule.rule);

console.log(JSON.stringify(p.serialize(), null, 4));