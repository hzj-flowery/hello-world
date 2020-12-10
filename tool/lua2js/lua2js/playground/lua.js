let i = 1;
console.log(--i > 0);

const parser = require('luaparse');
const fs = require('fs')
const path = require('path')

let content = fs.readFileSync(path.join(__dirname, 'test.lua'), 'utf8');
let ast = parser.parse(content);
fs.writeFileSync(path.join(__dirname, `test_lua.json`), JSON.stringify(ast, null, 4));