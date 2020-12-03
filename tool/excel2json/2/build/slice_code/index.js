const fs = require('fs');
const path = require('path');

const fileUtils = require('../utils/file');

const acorn = require('acorn');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

const {scanScripts} = require('./nameMap');

const scriptsToken = '__scripts';

const CODE_NAME = "index.js"

const codegenOpt = {
    format: {
        compact: true
    }
}

let settingsName;

function getChild(node, child, type) {
    let c = node[child]
    if (!c || c.type != type) {
        throw new Error('parsed error')
    }

    return c;
}

function isConsoleExpression(node) {
    if (node.type == "LogicalExpression"
    && node.right.type == 'CallExpression'
    && node.right.callee.type == 'MemberExpression'
    && node.right.callee.object.type == 'Identifier'
    && node.right.callee.object.name == 'console') {
        if (node.right.callee.property.type == 'Identifier' && node.right.callee.property.name == 'log') {
            return false;
        }
        return true;
    }

    if (node.type == 'CallExpression'
    && node.callee.type == 'MemberExpression'
    && node.callee.object.type == 'Identifier'
    && node.callee.object.name == 'console') {
        if (node.callee.property.type == 'Identifier' && node.callee.property.name == 'log') {
            return false;
        }
        return true;
    }

    return false;

}

function removeConsole(ast) {
    estraverse.replace(ast, {
        enter: function (node) {
            if (node.type == 'ExpressionStatement' && isConsoleExpression(node.expression)) {
                return this.remove();
            }

            if (isConsoleExpression(node)) {
                return this.remove();
            }
        }
    })

    estraverse.traverse(ast, {
        enter: function (node, parent) {
            if (node.type == 'IfStatement' && !node.consequent) {
                node.consequent = {
                    type: 'BlockStatement',
                    body: []
                }
            }

            if (node.type == 'ConditionalExpression') {
                if (!node.consequent) {
                    node.consequent = {
                        type: 'BlockStatement',
                        body: []
                    }
                } else if (!node.alternate) {
                    node.alternate = {
                        type: 'BlockStatement',
                        body: []
                    }
                }

            }

            if (node.type == 'UnaryExpression' && node.operator == 'void' && !node.argument) {
                node.argument = {
                    type: 'Literal',
                    value: 0
                }
            }
            if (node.type == 'CallExpression'
            && node.callee.type == 'MemberExpression'
            && node.callee.object.type == 'Identifier'
            && node.callee.object.name == 'console') {
                // console.log(node.type, parent.type)
            }
        }
    })
}

function slice(ast) {
    let body = ast.body[0];

    let expression = getChild(body, 'expression', 'AssignmentExpression');
    let callExp = getChild(expression, 'right', 'CallExpression')
    let args = callExp.arguments;

    let modules = args[0]['properties'];
    args[0] = getScriptsToken();

    scanScripts(modules);

    let scripts = [];
    let script = '';
    let size = 0;
    let maxSize = 4 * 1000 * 1000; //4M;
    for (let i = 0; i < modules.length; i++) {
        let module = modules[i];
        let keyStr = escodegen.generate(module.key, codegenOpt);
        let valueStr = escodegen.generate(module.value, codegenOpt);
        let moduleSize= keyStr.length + valueStr.length + 7;//s['xxx']=yyy;
        if (size + moduleSize > maxSize) {
            scripts.push(script);
            script = '';
            size = 0;
        }
        script += `s['${keyStr}']=${valueStr};`
        size += moduleSize;
    }

    scripts.push(script);

    scripts = scripts.map((s) => {
        return `(function(s){${s}})(window.__scripts||(window.__scripts={}))`
    });
    scripts.push(escodegen.generate(ast, codegenOpt))

    return scripts
}

function getScriptsToken() {
    return {
        type: 'MemberExpression',
        object: {
            type: 'Identifier',
            name: 'window'
        },
        property: {
            type: 'Identifier',
            name: scriptsToken
        }
    }
}

module.exports = function(src) {
    // let src = fileUtils.getCodeFile();
    let code = fs.readFileSync(src, 'utf8')
    let ast = acorn.parse(code)
    removeConsole(ast);
    return slice(ast);

    // output(gen);
    // return gen.length - 1;
}