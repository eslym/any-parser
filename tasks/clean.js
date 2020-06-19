const fs = require('fs');
const path = require('path');

function rmdashr(p){
    if(fs.existsSync(p)){
        if(fs.lstatSync(p).isDirectory()){
            fs.readdirSync(p)
                .map(_p => path.join(p, _p))
                .forEach(rmdashr);
            fs.rmdirSync(p);
        } else {
            fs.unlinkSync(p);
        }
        console.info(`Deleted ${p}`);
    }
}

fs.readdirSync(path.join(__dirname, '../dist'))
    .filter(s => !s.startsWith('.'))
    .map(p => path.join(__dirname, "dist", p))
    .forEach(rmdashr);
