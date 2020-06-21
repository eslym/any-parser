const JsonRule = require('../presets/json').default;

const Parser = require('../dist/index').Parser;

const rules = require('../dist/presets/json.json');

let p1 = new Parser(JsonRule.rule);

console.log(JSON.stringify(p1.serialize(), null, 4));

p2 = Parser.load(rules);

console.log(p1, p2);

let testStr = "\"測試測試，這只是測試(°∀。)\\n各種測試哈哈哈哈哈哈\\u0000\""

// let testval = {
//     "glossary": {
//         "title": "example glossary",
//         "GlossDiv": {
//             "title": "S",
//             "GlossList": {
//                 "GlossEntry": {
//                     "ID": "SGML",
//                     "SortAs": "SGML",
//                     "GlossTerm": "Standard Generalized Markup Language",
//                     "Acronym": "SGML",
//                     "Abbrev": "ISO 8879:1986",
//                     "GlossDef": {
//                         "para": "A meta-markup language, used to create markup languages such as DocBook.",
//                         "GlossSeeAlso": ["GML", "XML"]
//                     },
//                     "GlossSee": "markup"
//                 }
//             }
//         }
//     }
// };
//let testStr = JSON.stringify(testval, null, 2);

let res = p2.parse(testStr);
console.log(res);

/**
 * @param token {Token}
 */
function mapValue(token){
    switch (token.name) {
        case 'STRING':
            let str = [];
            for(let val of token.children){
                if(typeof val === 'string'){
                    str.push(val);
                } else switch (val.name){
                    case 'ESCAPE':
                        str.push({
                            "\\" : "\\",
                            "b" : "\b",
                            "n" : "\n",
                            "r" : "\r",
                            "f" : "\f",
                            "/" : "/",
                        }[val.value]);
                        break;
                    case 'UNICODE':
                        let code = Number.parseInt(val.value, 16);
                        let char = String.fromCharCode(code);
                        str.push(char);
                        break;
                }
            }
            return str.join('');
        case 'NUMBER':
            let num = Number.parseInt(token.value);
            for(let val of token.children){
                switch (val.name) {
                    case 'FRACTION':
                        num += Number.parseFloat(val.value);
                        break;
                    case 'EXPONENT':
                        num *= Number.parseFloat(`1${val.value}`);
                        break;
                }
            }
            return num;
        case 'BOOLEAN':
            return token.value === 'true';
        case 'NULL':
            return null;
        case 'ARRAY':
            return token.children.map((val) => {
                return mapValue(val.children[0]);
            });
        case 'OBJECT':
            return Object.fromEntries(token.children.map((val) => {
                return [mapValue(val.children[0]), mapValue(val.children[1])];
            }));
        default:
            return mapValue(token.children[0]);
    }
}

let parsed = mapValue(res[0]);

console.log(JSON.stringify(parsed, null, 2) === testStr);