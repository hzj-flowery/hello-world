import {IParser} from '../parsers/IParser'
import { Identifier, StringLiteral, NumericLiteral, VarargLiteral, NilLiteral, BooleanLiteral, UnaryExpression, BinaryExpression, LogicalExpression, FunctionDeclaration, MemberExpression, ReturnStatement } from 'luaparse';
import { Parser } from '../parsers/Parser';

import { getConvertResult } from './utils';
import { existsSync } from 'fs';

export let toJs = {
    BreakStatement(parser: IParser): ESTree.BreakStatement {
        return {
            type: 'BreakStatement'
        }
    },

    GotoStatement(parser: IParser): void {
        console.error('unsupported goto statement');
    },

    ReturnStatement(parser: IParser): ESTree.ReturnStatement {
        let argument = parser.getChildAt('arguments') as Array<IParser>;
        let jsArgument: any;
        if (argument.length > 1) {
         //   console.warn('js unsupport return multi expressions');
            jsArgument = {
                type: 'ArrayExpression',
                elements: []
            }

            argument.forEach((parser) => {
                jsArgument.elements.push(getConvertResult(parser))
            });
        } else if (argument.length === 1) {
            let parser = argument[0];
            jsArgument = getConvertResult(parser);
        }

        let result: ESTree.ReturnStatement = {
            type: 'ReturnStatement'
        }

        if (jsArgument) {
            result.argument = jsArgument;
        }

        return result
    },

    IfStatement(parser: IParser): ESTree.IfStatement {
        let clauses = parser.getChildAt('clauses') as Array<IParser>;

        let clause = clauses[0];
        let condition = clause.getChildAt('condition') as IParser;
        let body = clause.getChildAt('body') as Array<IParser>;
        let consequent: ESTree.BlockStatement = {
            type: 'BlockStatement',
            body: []
        }
        body.forEach((p) => {
            consequent.body.push(getConvertResult(p))
        });

        let ifStatement: ESTree.IfStatement = {
            type: 'IfStatement',
            test: getConvertResult(condition),
            consequent: consequent
        }

        let firstIf = ifStatement;

        for (let i = 1; i < clauses.length; i++) {
            clause = clauses[i];

            let consequent: ESTree.BlockStatement = {
                type: 'BlockStatement',
                body:[]
            };
            let body = clause.getChildAt('body') as Array<IParser>;
            body.forEach((p) => {
                consequent.body.push(getConvertResult(p));
            });

            if (clause.node.type === 'ElseifClause') {
                let alternate: ESTree.IfStatement = {
                    type: 'IfStatement',
                    test: getConvertResult(clause.getChildAt('condition') as IParser),
                    consequent: consequent
                }
                ifStatement.alternate = alternate;
                ifStatement = alternate;
                
            } else if (clause.node.type === 'ElseClause') {
                ifStatement.alternate = consequent;
                console.assert(i === clauses.length - 1, 'else clause if not last clause!!');
            }
        }

        return firstIf;
    },

    WhileStatement(parser: IParser): ESTree.WhileStatement {
        let condition = parser.getChildAt('condition') as IParser

        let body = parser.getChildAt('body') as Array<IParser>;

        let block: ESTree.BlockStatement = {
            type: 'BlockStatement',
            body:[]
        }

        body.forEach((p) => {
            block.body.push(getConvertResult(p));
        })

        return {
            type: 'WhileStatement',
            test: getConvertResult(condition) as ESTree.Node,
            body: block
        }
    },

    DoStatement(parser: IParser): ESTree.BlockStatement {
        let body = parser.getChildAt('body') as Array<IParser>;
        return {
            type: 'BlockStatement',
            body: body.map((s) => {
                return getConvertResult(s)
            })
        }
    },
    
    RepeatStatement(parser: IParser): ESTree.DoWhileStatement {
        console.error('unsupported do while statement');
        let body = parser.getChildAt('body') as Array<IParser>;
        let block: ESTree.BlockStatement = {
            type: 'BlockStatement',
            body: body.map((s) => {
                return getConvertResult(s);
            })
        }

        let condition = parser.getChildAt('condition') as IParser;
        let test: ESTree.UnaryExpression = {
            type: 'UnaryExpression',
            operator: '!',
            prefix: true,
            argument: getConvertResult(condition)
        }
        return {
            type: 'DoWhileStatement',
            body: block,
            test: test
        }
    },

    LocalStatement(parser: IParser): ESTree.VariableDeclaration {
        let variables = parser.getChildAt('variables') as Array<IParser>;
        let inits = parser.getChildAt('init') as Array<IParser>;

        let node: ESTree.VariableDeclaration = {
            type: "VariableDeclaration",
            declarations: [],
            kind: 'var'
        }

        for (let i = 0; i < variables.length; i++) {
            let vari = variables[i];
            let init = inits[i];
            let variableDeclarator: ESTree.VariableDeclarator = {
                type: 'VariableDeclarator',
                id: getConvertResult(vari)
            }
            if (init) {
                variableDeclarator.init = getConvertResult(init);
            }

            node.declarations.push(variableDeclarator);
        }

        return node;
    },

    AssignmentStatement(parser: IParser): ESTree.ExpressionStatement {
        let node: ESTree.ExpressionStatement;

        let variables = parser.getChildAt('variables') as Array<IParser>;
        let inits = parser.getChildAt('init') as Array<IParser>;

        if (variables.length > 1) {
            let expression: ESTree.SequenceExpression = {
                type: 'SequenceExpression',
                expressions: []
            };

            node = {
                type: 'ExpressionStatement',
                expression: expression
            }

            let assign: ESTree.AssignmentExpression
            for (let i = variables.length - 1; i >= 0; i--) {
                assign = {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: getConvertResult(variables[i]),
                    right: getConvertResult(inits[i])
                }

                expression.expressions.unshift(assign)
            }
        } else {
            let expression: ESTree.AssignmentExpression = {
                type: 'AssignmentExpression',
                operator: '=',
                left: getConvertResult(variables[0]),
                right: getConvertResult(inits[0])
            };

            node = {
                type: 'ExpressionStatement',
                expression: expression
            }
        }

        return node
    },

    CallStatement(parser: IParser): ESTree.ExpressionStatement {
        let expression = parser.getChildAt('expression') as IParser;
        let node = {
            type: 'ExpressionStatement',
            expression: getConvertResult(expression)
        }

        return node
    },

    FunctionDeclaration(parser: IParser): ESTree.FunctionDeclaration | ESTree.FunctionExpression |ESTree.ExpressionStatement {
        let id = parser.getChildAt('identifier') as Parser;
        let parameters = parser.getChildAt('parameters') as Array<IParser>;
        let body = parser.getChildAt('body') as Array<IParser>;

        let params: Array<ESTree.Pattern> = parameters.map((p) => {
            return getConvertResult(p);
        })

        let block: ESTree.BlockStatement = {
            type: 'BlockStatement',
            body: body.map((p) => {
                return getConvertResult(p);
            })
        }

        let result: ESTree.FunctionDeclaration | ESTree.FunctionExpression | ESTree.ExpressionStatement
        if (!id) {
            result = {
                type: 'FunctionExpression',
                body: block,
                params: params
            }
        } else {
            if (id.node.type === 'MemberExpression') {
                if (id.node.indexer === ':') {
                    id.node.indexer = '.';
                    let base = id.getChildAt('base') as Parser;
                    base.removeFromParent();

                    let proto = new Parser({
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
                    }, id)

                    id.addChild(proto, ['base']);
                    proto.addChild(base, ['base']);
                }

                let func: ESTree.FunctionExpression = {
                    type: 'FunctionExpression',
                    body: block,
                    params: params,
                }

                let expression: ESTree.AssignmentExpression = {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: getConvertResult(id),
                    right: func
                }
                result = {
                    type: 'ExpressionStatement',
                    expression: expression
                }
            } else {
                result = {
                    type: 'FunctionDeclaration',
                    body: block,
                    params: params,
                    id: getConvertResult(id) as ESTree.Identifier
                }
            }


        }

        return result;
    },

    ForNumericStatement(parser: IParser): ESTree.ForStatement {
        let variable = parser.getChildAt('variable') as IParser;
        let start = parser.getChildAt('start') as IParser;
        let end = parser.getChildAt('end') as IParser;
        let step = parser.getChildAt('step') as IParser;
        let body = parser.getChildAt('body') as Array<IParser>;

        let init: ESTree.VariableDeclaration = {
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: getConvertResult(variable),
                init: getConvertResult(start)
            }],
            kind: 'var'
        }

        let test: ESTree.BinaryExpression = {
            type: 'BinaryExpression',
            operator: '!=',
            left: getConvertResult(variable),
            right: getConvertResult(end)
        }

        let update: ESTree.AssignmentExpression | ESTree.UpdateExpression;
        if (step) {
            update = {
                type: 'AssignmentExpression',
                operator: '+=',
                left: getConvertResult(variable),
                right: getConvertResult(step),
            } 
        } else {
            update = {
                type: 'UpdateExpression',
                operator: '++',
                argument: getConvertResult(variable),
                prefix: false
            }
        }

        let block: ESTree.BlockStatement = {
            type: 'BlockStatement',
            body:[]
        }

        body.forEach((p) => {
            block.body.push(getConvertResult(p));
        });

        return {
            type: 'ForStatement',
            init: init,
            test: test,
            update: update,
            body: block
        }
    },

    ForGenericStatement(parser: IParser): ESTree.ForInStatement {
        let variables = parser.getChildAt('variables') as Array<IParser>

        let key = variables[0];
        let left = getConvertResult(key);

        let value = variables[1];

        let iterators = parser.getChildAt('iterators') as Array<IParser>
        let right: ESTree.Expression;
        if (iterators.length > 1) {
            console.error('unsupport multi iterators in for generic statement!');
            right = {
                "type": "Literal"
            }
        } else {
            let iterator = iterators[0];
            let id = (iterator.getChildAt('arguments') as Array<IParser>)[0];
            right = getConvertResult(id);
        }

        let body = parser.getChildAt('body') as Array<IParser>

        let block: ESTree.BlockStatement = {
            type: 'BlockStatement',
            body: body.map((s) => {
                return getConvertResult(s)
            })
        }

        if (value) {
            let init: ESTree.MemberExpression = {
                type: "MemberExpression",
                object: right,
                property: left,
                computed: true
            }

            let valueDeclaration: ESTree.VariableDeclaration = {
                type: 'VariableDeclaration',
                declarations: [{
                    type: 'VariableDeclarator',
                    id: getConvertResult(value),
                    init: init
                }],
                kind: 'var'
            };

            block.body.unshift(valueDeclaration);
        }

        return {
            type: 'ForInStatement',
            left: getConvertResult(key),
            right: right,
            body: block
        }
    },

    Chunk(parser: IParser): ESTree.Program {
        let body = parser.getChildAt('body') as Array<IParser>;

        let statements: ESTree.Statement[] = [];
        body.forEach((p) => {
            statements.push(getConvertResult(p))
        })

        return {
            type: 'Program',
            body: statements
        }
    },

    Identifier(parser: IParser): ESTree.Identifier | ESTree.ThisExpression {
        let node = parser.node as Identifier
        if (node.name === 'self') {
            return {
                type: 'ThisExpression'
            }
        }

        return {
            type: 'Identifier',
            name: node.name
        }
    },

    StringLiteral(parser: IParser): ESTree.Literal {
        let node = parser.node as StringLiteral;
        return {
            type: 'Literal',
            value: node.value,
        }
    },

    NumericLiteral(parser: IParser): ESTree.Literal {
        let node = parser.node as NumericLiteral;
        return {
            type: 'Literal',
            value: node.value,
        }
    },

    BooleanLiteral(parser: IParser): ESTree.Literal {
        let node = parser.node as BooleanLiteral;
        return {
            type: 'Literal',
            value: node.value,
        }
    },

    NilLiteral(parser: IParser): ESTree.Node {
        let node = parser.node as NilLiteral;
        let r: any = {
            type: 'Literal',
            value: null,
        }
        return r;
    },

    VarargLiteral(parser: IParser): ESTree.Literal {
        let node = parser.node as VarargLiteral;
        return {
            type: 'Literal',
            value: node.value,
        }
    },

    TableConstructorExpression(parser: IParser): ESTree.ObjectExpression | ESTree.ArrayExpression {
        let fields = parser.getChildAt('fields') as Array<IParser>;

        let isArray = 0;

        let table = 1;
        let array = 2;
        let mix = 3;

        fields.forEach((f) => {
            if (f.node.type === 'TableValue') {
                if (!isArray) {
                    isArray = array;
                } else if (isArray === table) {
                    isArray = mix;
                }
            } else {
                if (!isArray) {
                    isArray = table;
                } else if (isArray === array) {
                    isArray = mix;
                }
            }
        })

        isArray = isArray || table;

        if ((isArray === table) || (isArray === mix)) {
            let i = 0;
            let props: Array<ESTree.Property> = fields.map((f): ESTree.Property => {
                let key = f.getChildAt('key') as IParser;
                let value = f.getChildAt('value') as IParser;

                let k: ESTree.Literal | ESTree.Identifier | ESTree.MemberExpression
                if (key) {
                    k = getConvertResult(key);
                } else {
                    k = {
                        type: 'Literal',
                        value: i.toString(),
                    }
                    i++;
                }

                let result = {
                    type: 'Property',
                    key: k,
                    value: getConvertResult(value),
                    kind: 'init',
                    computed: f.node.type === 'TableKey'
                }

                return result
            });

            return {
                type: 'ObjectExpression',
                properties: props
            }
        } else {
            let e: Array<ESTree.Expression> = fields.map((f): ESTree.Expression => {
                let p = f.getChildAt('value') as IParser;
                return getConvertResult(p);
            })

            return {
                type: 'ArrayExpression',
                elements: e
            }
        }
    },

    UnaryExpression(parser: IParser): ESTree.UnaryExpression | ESTree.MemberExpression {
        let node = parser.node as UnaryExpression;
        let operator = node.operator;
        let argument = getConvertResult(parser.getChildAt('argument') as IParser);
        if (operator === '#') {
            let prop: ESTree.Identifier = {
                type: 'Identifier',
                name: 'length'
            }
            return {
                type: 'MemberExpression',
                object: argument,
                property: prop,
                computed: false
            }
        } else if (operator === 'not') {
            return {
                type: 'UnaryExpression',
                operator: '!',
                argument: argument,
                prefix: true
            }
        } else {
            return {
                type: 'UnaryExpression',
                operator: operator,
                argument: argument,
                prefix: true
            }
        }
    },

    BinaryExpression(parser: IParser): ESTree.BinaryExpression | ESTree.CallExpression {
        let node = parser.node as BinaryExpression;
        let left = parser.getChildAt('left') as IParser;
        let right = parser.getChildAt('right') as IParser;

        let operator: string;
        if (node.operator === '..') {
            operator = '+';
        } else if (node.operator === '~=') {
            operator = '!=';
        } else if (node.operator === '//') {
            let object: Identifier = {
                type: 'Identifier',
                name: 'Math'
            }

            let property: Identifier = {
                type: 'Identifier',
                name: 'floor'
            }

            let callee: ESTree.MemberExpression = {
                type: 'MemberExpression',
                object: object,
                property: property,
                computed: false
            }

            let binary: ESTree.BinaryExpression = {
                type: 'BinaryExpression',
                operator: '/',
                left: getConvertResult(left),
                right: getConvertResult(right)
            }

            return {
                type: 'CallExpression',
                callee: callee,
                arguments: [
                    binary
                ]
            }
        } else {
            operator = node.operator;
        }

        return {
            type: 'BinaryExpression',
            operator: operator,
            left: getConvertResult(left),
            right: getConvertResult(right)
        }
    },

    LogicalExpression(parser: IParser): ESTree.LogicalExpression {
        let node = parser.node as LogicalExpression;
        let left = parser.getChildAt('left') as IParser;
        let right = parser.getChildAt('right') as IParser;

        let operator: '||' | '&&';
        if (node.operator === 'or') {
            operator = '||'
        } else {
            operator = '&&'
        }

        return {
            type: 'LogicalExpression',
            operator: operator,
            left: getConvertResult(left),
            right: getConvertResult(right)
        }
    },

    MemberExpression(parser: IParser): ESTree.MemberExpression {
        let id = parser.getChildAt('identifier') as IParser;
        let base = parser.getChildAt('base') as IParser;
        return {
            type: 'MemberExpression',
            object: getConvertResult(base),
            property: getConvertResult(id),
            computed: false
        }
    },

    IndexExpression(parser: IParser): ESTree.MemberExpression {
        let id = parser.getChildAt('index') as IParser;
        let base = parser.getChildAt('base') as IParser;
        return {
            type: 'MemberExpression',
            object: getConvertResult(base),
            property: getConvertResult(id),
            computed: true
        }
    },

    CallExpression(parser: IParser): ESTree.CallExpression {
        let base = parser.getChildAt('base') as IParser;
        let argument = parser.getChildAt('arguments') as Array<IParser>;

        let argus: Array<ESTree.Expression> = [];

        argument.forEach((p) => {
            argus.push(getConvertResult(p));
        })

        return {
            type: 'CallExpression',
            callee: getConvertResult(base),
            arguments: argus
        }
    },

    TableCallExpression(parser: IParser): ESTree.CallExpression {
        let base = parser.getChildAt('base') as IParser;
        let argument = parser.getChildAt('arguments') as IParser;

        return {
            type: 'CallExpression',
            callee: getConvertResult(base),
            arguments: [getConvertResult(argument)]
        }
    },

    StringCallExpression(parser: IParser): ESTree.CallExpression {
        let base = parser.getChildAt('base') as IParser;
        let argument = parser.getChildAt('argument') as IParser;

        return {
            type: 'CallExpression',
            callee: getConvertResult(base),
            arguments: [getConvertResult(argument)]
        }
    }
}

