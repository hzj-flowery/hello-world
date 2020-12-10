const acorn = require('acorn');
const fs = require('fs');
const path = require('path');

let name = 'test'

let content = fs.readFileSync(path.join(__dirname, name + '.js'), 'utf8')
let ast = acorn.parse(content);
fs.writeFileSync(path.join(__dirname, name + '_js.json'), JSON.stringify(ast, null, 4));