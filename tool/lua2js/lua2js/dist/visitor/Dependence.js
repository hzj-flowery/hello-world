"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileSystem_1 = require("../cocostree/FileSystem");
var DependenceVisitor = /** @class */ (function () {
    function DependenceVisitor(module) {
        this.module = module;
    }
    DependenceVisitor.prototype.enter = function (parser) {
        var node = parser.node;
        if (node.type === 'CallExpression') {
            var base = parser.getChildAt('base');
            var baseNode = base.node;
            var argument = parser.getChildAt('arguments');
            if (baseNode.type === 'Identifier' &&
                (baseNode.name === 'require' || baseNode.name === 'import') &&
                argument.length === 1) {
                node = argument[0].node;
                if (node.type === 'StringLiteral') {
                    node.value = FileSystem_1.getModuleName(node.value, this.module);
                    node.raw = "\"" + node.value + "\"";
                    baseNode.name = 'require';
                }
            }
        }
    };
    DependenceVisitor.prototype.leave = function (parser) {
        // let node = parser.node;
        // if (node.type === 'CallExpression') {
        //     let base = parser.getChildAt('base') as IParser;
        //     let baseNode = base.node;
        //     let argument = parser.getChildAt('arguments') as Array<IParser>;
        //     if (baseNode.type === 'Identifier' &&
        //     baseNode.name === 'require' && 
        //     argument.length === 1) {
        //         node = argument[0].node;
        //         if (node.type === 'StringLiteral') {
        //             node.value = sharedProgram().getModuleName(node.value);
        //             node.raw = `\"${node.value}\"`
        //         }
        //         let statement = parser.parent as IParser;
        //         statement.addToParent(statement.parent as IParser, ['body', 0])
        //     } 
        // }
    };
    return DependenceVisitor;
}());
exports.DependenceVisitor = DependenceVisitor;
//# sourceMappingURL=Dependence.js.map