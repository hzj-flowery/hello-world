"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Parser_1 = require("../parsers/Parser");
var utils_1 = require("./utils");
exports.toJs = {
    BreakStatement: function (parser) {
        return {
            type: 'BreakStatement'
        };
    },
    GotoStatement: function (parser) {
        console.error('unsupported goto statement');
    },
    ReturnStatement: function (parser) {
        var argument = parser.getChildAt('arguments');
        var jsArgument;
        if (argument.length > 1) {
            //   console.warn('js unsupport return multi expressions');
            jsArgument = {
                type: 'ArrayExpression',
                elements: []
            };
            argument.forEach(function (parser) {
                jsArgument.elements.push(utils_1.getConvertResult(parser));
            });
        }
        else if (argument.length === 1) {
            var parser_1 = argument[0];
            jsArgument = utils_1.getConvertResult(parser_1);
        }
        var result = {
            type: 'ReturnStatement'
        };
        if (jsArgument) {
            result.argument = jsArgument;
        }
        return result;
    },
    IfStatement: function (parser) {
        var clauses = parser.getChildAt('clauses');
        var clause = clauses[0];
        var condition = clause.getChildAt('condition');
        var body = clause.getChildAt('body');
        var consequent = {
            type: 'BlockStatement',
            body: []
        };
        body.forEach(function (p) {
            consequent.body.push(utils_1.getConvertResult(p));
        });
        var ifStatement = {
            type: 'IfStatement',
            test: utils_1.getConvertResult(condition),
            consequent: consequent
        };
        var firstIf = ifStatement;
        var _loop_1 = function (i) {
            clause = clauses[i];
            var consequent_1 = {
                type: 'BlockStatement',
                body: []
            };
            var body_1 = clause.getChildAt('body');
            body_1.forEach(function (p) {
                consequent_1.body.push(utils_1.getConvertResult(p));
            });
            if (clause.node.type === 'ElseifClause') {
                var alternate = {
                    type: 'IfStatement',
                    test: utils_1.getConvertResult(clause.getChildAt('condition')),
                    consequent: consequent_1
                };
                ifStatement.alternate = alternate;
                ifStatement = alternate;
            }
            else if (clause.node.type === 'ElseClause') {
                ifStatement.alternate = consequent_1;
                console.assert(i === clauses.length - 1, 'else clause if not last clause!!');
            }
        };
        for (var i = 1; i < clauses.length; i++) {
            _loop_1(i);
        }
        return firstIf;
    },
    WhileStatement: function (parser) {
        var condition = parser.getChildAt('condition');
        var body = parser.getChildAt('body');
        var block = {
            type: 'BlockStatement',
            body: []
        };
        body.forEach(function (p) {
            block.body.push(utils_1.getConvertResult(p));
        });
        return {
            type: 'WhileStatement',
            test: utils_1.getConvertResult(condition),
            body: block
        };
    },
    DoStatement: function (parser) {
        var body = parser.getChildAt('body');
        return {
            type: 'BlockStatement',
            body: body.map(function (s) {
                return utils_1.getConvertResult(s);
            })
        };
    },
    RepeatStatement: function (parser) {
        console.error('unsupported do while statement');
        var body = parser.getChildAt('body');
        var block = {
            type: 'BlockStatement',
            body: body.map(function (s) {
                return utils_1.getConvertResult(s);
            })
        };
        var condition = parser.getChildAt('condition');
        var test = {
            type: 'UnaryExpression',
            operator: '!',
            prefix: true,
            argument: utils_1.getConvertResult(condition)
        };
        return {
            type: 'DoWhileStatement',
            body: block,
            test: test
        };
    },
    LocalStatement: function (parser) {
        var variables = parser.getChildAt('variables');
        var inits = parser.getChildAt('init');
        var node = {
            type: "VariableDeclaration",
            declarations: [],
            kind: 'var'
        };
        for (var i = 0; i < variables.length; i++) {
            var vari = variables[i];
            var init = inits[i];
            var variableDeclarator = {
                type: 'VariableDeclarator',
                id: utils_1.getConvertResult(vari)
            };
            if (init) {
                variableDeclarator.init = utils_1.getConvertResult(init);
            }
            node.declarations.push(variableDeclarator);
        }
        return node;
    },
    AssignmentStatement: function (parser) {
        var node;
        var variables = parser.getChildAt('variables');
        var inits = parser.getChildAt('init');
        if (variables.length > 1) {
            var expression = {
                type: 'SequenceExpression',
                expressions: []
            };
            node = {
                type: 'ExpressionStatement',
                expression: expression
            };
            var assign = void 0;
            for (var i = variables.length - 1; i >= 0; i--) {
                assign = {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: utils_1.getConvertResult(variables[i]),
                    right: utils_1.getConvertResult(inits[i])
                };
                expression.expressions.unshift(assign);
            }
        }
        else {
            var expression = {
                type: 'AssignmentExpression',
                operator: '=',
                left: utils_1.getConvertResult(variables[0]),
                right: utils_1.getConvertResult(inits[0])
            };
            node = {
                type: 'ExpressionStatement',
                expression: expression
            };
        }
        return node;
    },
    CallStatement: function (parser) {
        var expression = parser.getChildAt('expression');
        var node = {
            type: 'ExpressionStatement',
            expression: utils_1.getConvertResult(expression)
        };
        return node;
    },
    FunctionDeclaration: function (parser) {
        var id = parser.getChildAt('identifier');
        var parameters = parser.getChildAt('parameters');
        var body = parser.getChildAt('body');
        var params = parameters.map(function (p) {
            return utils_1.getConvertResult(p);
        });
        var block = {
            type: 'BlockStatement',
            body: body.map(function (p) {
                return utils_1.getConvertResult(p);
            })
        };
        var result;
        if (!id) {
            result = {
                type: 'FunctionExpression',
                body: block,
                params: params
            };
        }
        else {
            if (id.node.type === 'MemberExpression') {
                if (id.node.indexer === ':') {
                    id.node.indexer = '.';
                    var base = id.getChildAt('base');
                    base.removeFromParent();
                    var proto = new Parser_1.Parser({
                        type: 'MemberExpression',
                        indexer: '.',
                        identifier: {
                            type: 'Identifier',
                            name: 'prototype'
                        },
                        base: {
                            type: 'Identifier',
                            name: 'fill'
                        }
                    }, id);
                    id.addChild(proto, ['base']);
                    proto.addChild(base, ['base']);
                }
                var func = {
                    type: 'FunctionExpression',
                    body: block,
                    params: params,
                };
                var expression = {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: utils_1.getConvertResult(id),
                    right: func
                };
                result = {
                    type: 'ExpressionStatement',
                    expression: expression
                };
            }
            else {
                result = {
                    type: 'FunctionDeclaration',
                    body: block,
                    params: params,
                    id: utils_1.getConvertResult(id)
                };
            }
        }
        return result;
    },
    ForNumericStatement: function (parser) {
        var variable = parser.getChildAt('variable');
        var start = parser.getChildAt('start');
        var end = parser.getChildAt('end');
        var step = parser.getChildAt('step');
        var body = parser.getChildAt('body');
        var init = {
            type: 'VariableDeclaration',
            declarations: [{
                    type: 'VariableDeclarator',
                    id: utils_1.getConvertResult(variable),
                    init: utils_1.getConvertResult(start)
                }],
            kind: 'var'
        };
        var test = {
            type: 'BinaryExpression',
            operator: '!=',
            left: utils_1.getConvertResult(variable),
            right: utils_1.getConvertResult(end)
        };
        var update;
        if (step) {
            update = {
                type: 'AssignmentExpression',
                operator: '+=',
                left: utils_1.getConvertResult(variable),
                right: utils_1.getConvertResult(step),
            };
        }
        else {
            update = {
                type: 'UpdateExpression',
                operator: '++',
                argument: utils_1.getConvertResult(variable),
                prefix: false
            };
        }
        var block = {
            type: 'BlockStatement',
            body: []
        };
        body.forEach(function (p) {
            block.body.push(utils_1.getConvertResult(p));
        });
        return {
            type: 'ForStatement',
            init: init,
            test: test,
            update: update,
            body: block
        };
    },
    ForGenericStatement: function (parser) {
        var variables = parser.getChildAt('variables');
        var key = variables[0];
        var left = utils_1.getConvertResult(key);
        var value = variables[1];
        var iterators = parser.getChildAt('iterators');
        var right;
        if (iterators.length > 1) {
            console.error('unsupport multi iterators in for generic statement!');
            right = {
                "type": "Literal"
            };
        }
        else {
            var iterator = iterators[0];
            var id = iterator.getChildAt('arguments')[0];
            right = utils_1.getConvertResult(id);
        }
        var body = parser.getChildAt('body');
        var block = {
            type: 'BlockStatement',
            body: body.map(function (s) {
                return utils_1.getConvertResult(s);
            })
        };
        if (value) {
            var init = {
                type: "MemberExpression",
                object: right,
                property: left,
                computed: true
            };
            var valueDeclaration = {
                type: 'VariableDeclaration',
                declarations: [{
                        type: 'VariableDeclarator',
                        id: utils_1.getConvertResult(value),
                        init: init
                    }],
                kind: 'var'
            };
            block.body.unshift(valueDeclaration);
        }
        return {
            type: 'ForInStatement',
            left: utils_1.getConvertResult(key),
            right: right,
            body: block
        };
    },
    Chunk: function (parser) {
        var body = parser.getChildAt('body');
        var statements = [];
        body.forEach(function (p) {
            statements.push(utils_1.getConvertResult(p));
        });
        return {
            type: 'Program',
            body: statements
        };
    },
    Identifier: function (parser) {
        var node = parser.node;
        if (node.name === 'self') {
            return {
                type: 'ThisExpression'
            };
        }
        return {
            type: 'Identifier',
            name: node.name
        };
    },
    StringLiteral: function (parser) {
        var node = parser.node;
        return {
            type: 'Literal',
            value: node.value,
        };
    },
    NumericLiteral: function (parser) {
        var node = parser.node;
        return {
            type: 'Literal',
            value: node.value,
        };
    },
    BooleanLiteral: function (parser) {
        var node = parser.node;
        return {
            type: 'Literal',
            value: node.value,
        };
    },
    NilLiteral: function (parser) {
        var node = parser.node;
        var r = {
            type: 'Literal',
            value: null,
        };
        return r;
    },
    VarargLiteral: function (parser) {
        var node = parser.node;
        return {
            type: 'Literal',
            value: node.value,
        };
    },
    TableConstructorExpression: function (parser) {
        var fields = parser.getChildAt('fields');
        var isArray = 0;
        var table = 1;
        var array = 2;
        var mix = 3;
        fields.forEach(function (f) {
            if (f.node.type === 'TableValue') {
                if (!isArray) {
                    isArray = array;
                }
                else if (isArray === table) {
                    isArray = mix;
                }
            }
            else {
                if (!isArray) {
                    isArray = table;
                }
                else if (isArray === array) {
                    isArray = mix;
                }
            }
        });
        isArray = isArray || table;
        if ((isArray === table) || (isArray === mix)) {
            var i_1 = 0;
            var props = fields.map(function (f) {
                var key = f.getChildAt('key');
                var value = f.getChildAt('value');
                var k;
                if (key) {
                    k = utils_1.getConvertResult(key);
                }
                else {
                    k = {
                        type: 'Literal',
                        value: i_1.toString(),
                    };
                    i_1++;
                }
                var result = {
                    type: 'Property',
                    key: k,
                    value: utils_1.getConvertResult(value),
                    kind: 'init',
                    computed: f.node.type === 'TableKey'
                };
                return result;
            });
            return {
                type: 'ObjectExpression',
                properties: props
            };
        }
        else {
            var e = fields.map(function (f) {
                var p = f.getChildAt('value');
                return utils_1.getConvertResult(p);
            });
            return {
                type: 'ArrayExpression',
                elements: e
            };
        }
    },
    UnaryExpression: function (parser) {
        var node = parser.node;
        var operator = node.operator;
        var argument = utils_1.getConvertResult(parser.getChildAt('argument'));
        if (operator === '#') {
            var prop = {
                type: 'Identifier',
                name: 'length'
            };
            return {
                type: 'MemberExpression',
                object: argument,
                property: prop,
                computed: false
            };
        }
        else if (operator === 'not') {
            return {
                type: 'UnaryExpression',
                operator: '!',
                argument: argument,
                prefix: true
            };
        }
        else {
            return {
                type: 'UnaryExpression',
                operator: operator,
                argument: argument,
                prefix: true
            };
        }
    },
    BinaryExpression: function (parser) {
        var node = parser.node;
        var left = parser.getChildAt('left');
        var right = parser.getChildAt('right');
        var operator;
        if (node.operator === '..') {
            operator = '+';
        }
        else if (node.operator === '~=') {
            operator = '!=';
        }
        else if (node.operator === '//') {
            var object = {
                type: 'Identifier',
                name: 'Math'
            };
            var property = {
                type: 'Identifier',
                name: 'floor'
            };
            var callee = {
                type: 'MemberExpression',
                object: object,
                property: property,
                computed: false
            };
            var binary = {
                type: 'BinaryExpression',
                operator: '/',
                left: utils_1.getConvertResult(left),
                right: utils_1.getConvertResult(right)
            };
            return {
                type: 'CallExpression',
                callee: callee,
                arguments: [
                    binary
                ]
            };
        }
        else {
            operator = node.operator;
        }
        return {
            type: 'BinaryExpression',
            operator: operator,
            left: utils_1.getConvertResult(left),
            right: utils_1.getConvertResult(right)
        };
    },
    LogicalExpression: function (parser) {
        var node = parser.node;
        var left = parser.getChildAt('left');
        var right = parser.getChildAt('right');
        var operator;
        if (node.operator === 'or') {
            operator = '||';
        }
        else {
            operator = '&&';
        }
        return {
            type: 'LogicalExpression',
            operator: operator,
            left: utils_1.getConvertResult(left),
            right: utils_1.getConvertResult(right)
        };
    },
    MemberExpression: function (parser) {
        var id = parser.getChildAt('identifier');
        var base = parser.getChildAt('base');
        return {
            type: 'MemberExpression',
            object: utils_1.getConvertResult(base),
            property: utils_1.getConvertResult(id),
            computed: false
        };
    },
    IndexExpression: function (parser) {
        var id = parser.getChildAt('index');
        var base = parser.getChildAt('base');
        return {
            type: 'MemberExpression',
            object: utils_1.getConvertResult(base),
            property: utils_1.getConvertResult(id),
            computed: true
        };
    },
    CallExpression: function (parser) {
        var base = parser.getChildAt('base');
        var argument = parser.getChildAt('arguments');
        var argus = [];
        argument.forEach(function (p) {
            argus.push(utils_1.getConvertResult(p));
        });
        return {
            type: 'CallExpression',
            callee: utils_1.getConvertResult(base),
            arguments: argus
        };
    },
    TableCallExpression: function (parser) {
        var base = parser.getChildAt('base');
        var argument = parser.getChildAt('arguments');
        return {
            type: 'CallExpression',
            callee: utils_1.getConvertResult(base),
            arguments: [utils_1.getConvertResult(argument)]
        };
    },
    StringCallExpression: function (parser) {
        var base = parser.getChildAt('base');
        var argument = parser.getChildAt('argument');
        return {
            type: 'CallExpression',
            callee: utils_1.getConvertResult(base),
            arguments: [utils_1.getConvertResult(argument)]
        };
    }
};
//# sourceMappingURL=lua2js.js.map