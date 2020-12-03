const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const pako = require('pako');

const XlsxDir = path.join( __dirname,'./excels')
const JsonDir = path.join(__dirname , "../../config/config")
const BinDir = path.join(__dirname, '../../main/assets/resources/config')

const indexesCellIndex = 'A1';
const typeRowIndex = 1;
const excludesRowIndex = 3;
const keysRowIndex = 4;

const CellTypes = {
    Int : 0,
    String : 1
}

function parseFile(file) {
    let workbook = xlsx.readFile(file);
    let sheet = workbook.Sheets[workbook.SheetNames[0]];
    // let range = xlsx.utils.decode_range(sheet["!ref"]);
    let range = getRealRange(sheet);
    // if (!sheet[xlsx.utils.encode_cell(range.e)]) {
    //     console.log('range error!', file)
    //     return;
    // }
    console.log('parse file:', file, range);
    let keys = indexKeys(sheet);

    let excludes = excludeCol(sheet, range.e.c);
    if (excludes.length === range.e.c + 1) {
		console.error('fail:',file)
        return;
    }

    let types = colTypes(sheet, range.e.c);

    let key_map = getKeysMap(sheet, range.e.c, excludes);
    let data = getData(sheet, range, excludes, types);
    let indexes = getIndexes(sheet, range.e.r, keys, key_map);

    writeFile(file, JSON.stringify({
        key_map: key_map,
        data: data,
        indexes: indexes
    }, null, 4));
}

function parseDir(dir) {
    let files = fs.readdirSync(dir);
    files.forEach((f) => {
        if (path.extname(f) === '.xlsx') {
            parseFile(path.join(dir, f));
        }
    })
}

function getRealRange(sheet) {
    let c = 0;
    do {
        var cell = sheet[xlsx.utils.encode_cell({r:keysRowIndex, c: c})]
        if (!cell) {
            break;
        }
        c++;
    } while (true)

    let r = 0;
    do {
        var cell = sheet[xlsx.utils.encode_cell({r:r, c: 0})]
        if (!cell) {
            break;
        }
        r++;
    } while (true)

    return {s: {r: 0, c: 0}, e: {r: r-1, c: c-1}};
}

function excludeCol(sheet, end) {
    let excludes = [];
    for (let i = 0; i <= end; i++) {
        var cell = sheet[xlsx.utils.encode_cell({c: i, r: excludesRowIndex})]
        var token = cell.w || cell.v;
        if (token !== 'Both' && token !== 'Client') {
            excludes.push(i);
        }
    }

    return excludes;
}

function colTypes(sheet, end) {
    let types = [];
    for (let i = 0; i <= end; i++) {
        var cell = sheet[xlsx.utils.encode_cell({c: i, r: typeRowIndex})];
        if (!cell) {
            continue;
        }
        var token = cell.w || cell.v;
        token = token.toLowerCase();

        switch (token) {
            case 'int':
            case 'int64':
                types[i] = CellTypes.Int;
                break;
            case 'string':
                types[i] = CellTypes.String;
                break;
            case 'x':
                break;
            default:
                console.error('unkown type', token, i);
                break;
        }
    }

    return types;
}

function indexKeys(sheet) {
    let cell = sheet[indexesCellIndex];
    let keys = cell.w || cell.v;

    return keys.split(',').map((v) => {
        return v.trim();
    });
}

function getKeysMap(sheet, endCol, excludes) {
    let keys = {};
    let j = 0
    let m = 0
    for (let i = 0; i <= endCol; i++) {
        if (excludes[m] === i) {
            m++;
            continue;
        }

        var cell = sheet[xlsx.utils.encode_cell({c: i, r: keysRowIndex})]
        var token = cell.w || cell.v;
        keys[token] = j;
        j++;
    }

    return keys;
}

function getData(sheet, range, excludes, types) {
    let data = [];
    for (let i = 5; i <= range.e.r; i++) {
        var j = 0;
        var m = 0;
        var row = [];
        data[i - 5] = row;
        for (let k = 0; k <= range.e.c; k++) {
            if (excludes[m] === k) {
                m++;
                continue;
            }

            var cell = sheet[xlsx.utils.encode_cell({c: k, r: i})];
            var token;
            if (!cell) {
                if (types[k] === CellTypes.Int) {
                    token = 0;
                } else if (types[k] === CellTypes.String) {
                    token = '';
                } else {
                    console.error('unknown type', k);
                    token = null
                }
            } else {
                token = cell.w || cell.v;
                if (types[k] === CellTypes.Int) {
                    token = Number(token);
                } else if (types[k] === CellTypes.String) {
                    token = String(token).replace(/\\n/g, "\n");
                    
                }
            }
            row[j] = token;
            j++;
        }
    }

    return data;
}

function getIndexes(sheet, endRow, indexKeys, keysMap) {
    let indexes = {};
    for (let i = 5; i <= endRow; i++) {
        var index = "";
        for (let j = 0; j < indexKeys.length; j++) {
            var col = keysMap[indexKeys[j]];
            var cell = sheet[xlsx.utils.encode_cell({c: col, r: i})];
            var token = cell.w || cell.v;
            if (j === 0) {
                index += token;
            } else {
                index = index + '_' + token;
            }
        }

        indexes[index] = i - 5;
    }

    return indexes;
}

function writeFile(name, data) {
    let ext = path.extname(name);
    let basename = path.basename(name, ext) + '.json';
    let file = path.join(JsonDir, basename);

    let dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }

    fs.writeFileSync(file, data);
}

function merge() {
    let files = fs.readdirSync(JsonDir)
    .filter((f) => {
        return path.extname(f) === '.json'
    })

    let all = {}
    files.forEach(f => {
        let file = path.join(JsonDir, f)
        let name = path.basename(f, '.json');
        let contents = fs.readFileSync(file, {encoding: 'utf8'});
        all[name] = JSON.parse(contents);
    })

    // fs.writeFileSync(path.join(__dirname, 'all.json'), JSON.stringify(all));

    let buffer = Buffer.from(pako.deflate(JSON.stringify(all)).buffer);

    fs.writeFileSync(path.join(BinDir, 'all.bin'), buffer);
}

parseDir(XlsxDir);
merge();
