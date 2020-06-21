const JsonRule = require('../presets/json').default;

const Parser = require('../dist/index').Parser;

const rules = require('../dist/presets/json.json');

let p1 = new Parser(JsonRule.rule);

console.log(JSON.stringify(p1.serialize(), null, 4));

p2 = Parser.load(rules);

console.log(p1, p2);

// let testStr = "\"測試測試，這只是測試(°∀。)\\n各種測試哈哈哈哈哈哈\\u0000\""
let testStr = JSON.stringify({
    "glossary": {
        "title": "example glossary",
        "GlossDiv": {
            "title": "S",
            "GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
                    "SortAs": "SGML",
                    "GlossTerm": "Standard Generalized Markup Language",
                    "Acronym": "SGML",
                    "Abbrev": "ISO 8879:1986",
                    "GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
                        "GlossSeeAlso": ["GML", "XML"]
                    },
                    "GlossSee": "markup"
                }
            }
        }
    }
}, null, 2);

let res = p2.parse(testStr);
console.log(res);