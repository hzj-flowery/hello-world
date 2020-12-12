"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.custom2js = void 0;
var utils_1 = require("./utils");
var tableapi_1 = require("./tableapi");
exports.custom2js = [
    { test: isNew, convert: convertToNew }
];
function isNew(parser) {
    if (parser.node.type === 'CallExpression') {
        var base = parser.getChildAt('base');
        if (base.node.type === 'MemberExpression') {
            var id = base.getChildAt('identifier');
            if (id.node.type === 'Identifier' &&
                (id.node.name === 'new' ||
                    (id.node.name === 'create' && base.node.indexer === ':'))) {
                return true;
            }
        }
    }
    return false;
}
function convertToNew(parser) {
    var base = parser.getChildAt('base');
    var callee = base.getChildAt('base');
    return {
        type: 'NewExpression',
        callee: utils_1.getConvertResult(callee),
        arguments: parser.getChildAt('arguments').map(utils_1.getConvertResult)
    };
}
function isTableApi(parser) {
    if (parser.node.type === 'CallExpression') {
        var base = parser.getChildAt('base');
        if (base.node.type === 'MemberExpression' &&
            base.node.indexer === '.') {
            var id = base.getChildAt('base');
            if (id.node.type === 'Identifier' && id.node.name === 'table') {
                return true;
            }
        }
    }
    return false;
}
function convertToArray(parser) {
    if (parser.node.type === 'CallExpression') {
        var base = parser.getChildAt('base');
        var id = base.getChildAt('identifier').node;
        var t = tableapi_1.table;
        var func = t[id.name];
        return func(parser.getChildAt('arguments'));
    }
}
//# sourceMappingURL=customLua2js.js.map