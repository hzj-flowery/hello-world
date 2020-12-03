const fs = require('fs');
const acorn = require('acorn');
const escodegen = require('escodegen');
const md5Hex = require('md5-hex');

function readSettings(file) {
    let content = fs.readFileSync(file, 'utf8')
    let body = acorn.parse(content).body;
    for (let i = 0; i < body.length; i++) {
        let expression = body[i].expression;
        if (expression.type == 'AssignmentExpression') {
            let left = expression.left;
            let setKey = '_CCSettings'
            if (left.type == 'MemberExpression') {
                let object = left.object;
                let property = left.property;
                if (object.type == 'Identifier' && 
                property.type == 'Identifier' &&
                object.name == 'window' &&
                property.name == setKey) {
                    object.name = 'global';
                    let code = escodegen.generate(expression);
                    eval(code);
                    return global[setKey];
                }
            }
        }
    }
}

function getSettingsName(content) {
    return `settings.${md5Hex(content).substr(0, 5)}.bin`
}


module.exports = {
    readSettings: readSettings,
    getSettingsName: getSettingsName
}