"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperVisitor = void 0;
var Parser_1 = require("../parsers/Parser");
var SuperVisitor = /** @class */ (function () {
    function SuperVisitor() {
    }
    SuperVisitor.prototype.enter = function (parser) {
        var node = parser.node;
        if (node.type === 'CallStatement') {
            var expression = parser.getChildAt('expression');
            if (expression.node.type === 'CallExpression') {
                var base = expression.getChildAt('base');
                if (base.node.type === 'MemberExpression' && base.node.indexer === '.') {
                    var superBase = base.getChildAt('base');
                    if (superBase.node.type === 'MemberExpression' &&
                        superBase.node.indexer === '.') {
                        var superId = superBase.getChildAt('identifier');
                        if (superId.node.type === 'Identifier' && superId.node.name === 'super') {
                            superId.node.name = 'prototype';
                            var newBase = new Parser_1.Parser({
                                type: 'MemberExpression',
                                indexer: '.',
                                identifier: {
                                    type: 'Identifier',
                                    name: 'call'
                                },
                                base: {
                                    type: 'Identifier',
                                    name: 'null'
                                }
                            }, null);
                            newBase.addChild(base, ['base']);
                            expression.addChild(newBase, ['base']);
                        }
                    }
                }
            }
        }
    };
    SuperVisitor.prototype.leave = function (parser) {
    };
    return SuperVisitor;
}());
exports.SuperVisitor = SuperVisitor;
//# sourceMappingURL=Super.js.map