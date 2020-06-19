const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../');
const srcPath = path.join(basePath, 'presets');
const outPath = path.join(basePath, 'dist/presets');
const schemaPath = path.relative(outPath, path.join('schema/parser.json'));

if(!fs.existsSync(outPath)){
    fs.mkdirSync(outPath, {recursive: true});
}

/** @type {typeof Parser} */
const Parser = require(basePath).Parser;

fs.readdirSync(srcPath).forEach((preset)=>{
    let presets = require(path.join(srcPath, preset));
    let parser = new Parser(presets.default.rule);
    delete presets.default;
    for(let entry of Object.entries(presets)){
        parser.addEntry(entry[0], entry[1].rule);
    }
    let serialized = Object.assign({$schema: schemaPath}, parser.serialize());
    fs.writeFileSync(
        path.join(outPath, path.basename(preset, '.js')+'.json'),
        JSON.stringify(serialized, null, 2)
    );
});
