import { Visitor } from "./Visitor";
import { Parser } from "../parsers/Parser";

export class SuperVisitor implements Visitor {
    public enter(parser: Parser): void {
        let node = parser.node;
        if (node.type === 'CallStatement') {
            let expression = parser.getChildAt('expression') as Parser;
            if (expression.node.type === 'CallExpression') {
                let base = expression.getChildAt('base') as Parser;

                if (base.node.type === 'MemberExpression' && base.node.indexer === '.') {
                    let superBase = base.getChildAt('base') as Parser;
                    if (superBase.node.type === 'MemberExpression' && 
                    superBase.node.indexer === '.') {
                        let superId = superBase.getChildAt('identifier') as Parser
                        if (superId.node.type === 'Identifier' && superId.node.name === 'super') {
                            superId.node.name = 'prototype';

                            let newBase = new Parser({
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
    }

    public leave(parser: Parser): void {
    }

}
