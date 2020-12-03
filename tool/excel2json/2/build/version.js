const fs = require("fs");

function modifyVersion(tsPath, key, version) {
    let content = fs.readFileSync(tsPath, {encoding: 'utf-8'});
    let lines = content.split('\n');
    let regx = new RegExp(`^\\s*export\\s+(var|let)\\s+${key}\\s+=`)
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let match = line.match(regx);
        if (match && match.length > 0) {
            lines[i] = match[0] + ' "' + version + '";'
        }
    }

    fs.writeFileSync(tsPath, lines.join('\n'), {encoding: 'utf-8'});
    console.log('version to ' + version);
}

function main() {
    let tsPath = process.argv[2];
    let key = process.argv[3];
    let version = process.argv[4];
    modifyVersion(tsPath, key, version);
}

main()