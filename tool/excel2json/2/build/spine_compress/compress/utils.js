const fs = require('fs');
const path = require('path');

function formatSrc(dir, exts) {
    if (!fs.existsSync(dir)) {
        return Promise.reject('not exists ' + dir);
    }

    let stat = fs.statSync(dir);
    let src;
    if (stat.isDirectory()) {
        src = path.join(dir, `**/*.@(${exts.join('|')})`)
    } else {
        let ext = path.extname(dir);
        if (!ext) {
            return Promise.reject('unkown ext ' + dir);
        }

        ext = ext.slice(1).toLowerCase();
        if (ext in exts) {
            src = dir;
        } else {
            return Promise.reject('unsupported ext ' + dir);
        }
    }

    return Promise.resolve(src);
}

module.exports = {
    formatSrc: formatSrc
}