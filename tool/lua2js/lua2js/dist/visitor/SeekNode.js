"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SeekNodeVisitor = /** @class */ (function () {
    function SeekNodeVisitor(nodeMap) {
        this.nodeMap = nodeMap;
    }
    SeekNodeVisitor.prototype.enter = function (parser, path) {
        if (parser.node.type === 'AssignmentStatement') {
            var init = parser.getChildAt('init');
            for (var i = 0; i < init.length; i++) {
                var exp = init[i];
                if (exp.node.type === 'CallExpression') {
                    var base = exp.getChildAt('base');
                    if (base.node.type === 'MemberExpression') {
                        var id = base.getChildAt('identifier');
                        if (id.node.type === 'Identifier' && id.node.name === 'seekNodeByName') {
                            base = base.getChildAt('base');
                            if (base.node.type === 'MemberExpression') {
                                id = base.getChildAt('identifier');
                                if (id.node.type === 'Identifier' && id.node.name === 'Helper') {
                                    base = base.getChildAt('base');
                                    if (base.node.type === 'Identifier' && base.node.name === 'ccui') {
                                        this.registerProperty(parser.getChildAt('variables')[i], exp.getChildAt('arguments'));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    SeekNodeVisitor.prototype.leave = function (parser, path) {
    };
    SeekNodeVisitor.prototype.registerProperty = function (variable, argument) {
        var prop;
        if (variable.node.type === 'Identifier') {
            console.warn('[seeknode] identifier');
            prop = variable.node.name;
        }
        else if (variable.node.type === 'MemberExpression') {
            var id = variable.getChildAt('identifier');
            var base = variable.getChildAt('base');
            if (base.node.type === 'Identifier' && base.node.name === 'self') {
                prop = id.node.name;
            }
            else {
                throw 'unsupport type: ' + variable.node.type;
            }
        }
        else {
            console.error('[seeknode]unsupport type:', variable.node.type);
            throw 'unsupport type: ' + variable.node.type;
        }
        if (argument.length !== 2) {
            console.error('[seeknode]arguments count is wrong', argument.length);
            throw 'arguments count is wrong: ' + argument.length;
        }
        var parent = argument[0];
        var name = argument[1];
        var names;
        if (parent.node.type === 'MemberExpression') {
            var id = variable.getChildAt('identifier');
            names = this.nodeMap[id.node.name] || [];
            if (name.node.type === 'StringLiteral') {
                names.push(name.node.value);
            }
            else {
                throw 'unsupport type: ' + name.node.type;
            }
        }
        else {
            throw 'unsupport type: ' + parent.node.type;
        }
        this.nodeMap[prop] = names;
    };
    return SeekNodeVisitor;
}());
exports.SeekNodeVisitor = SeekNodeVisitor;
//# sourceMappingURL=SeekNode.js.map