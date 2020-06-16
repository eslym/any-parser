const fs = require('fs');
const path = require('path');

function rmdashr(path){
    if(fs.existsSync(path)){
        if(fs.lstatSync(path).isDirectory()){
            fs.readdirSync(path)
                .map(p => path.join(path, p))
                .forEach(rmdashr);
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
        console.info(`Deleted ${path}`);
    }
}

fs.readdirSync('dist')
    .filter(s => !s.startsWith('.'))
    .map(p => path.join(__dirname, "dist", p))
    .forEach(rmdashr);
