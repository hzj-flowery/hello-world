import {Visitor} from './Visitor'
import { IParser } from '../parsers/IParser';
import { Identifier } from 'luaparse';

interface PropertyMap {
    [key: string]: string[]
}

export class SeekNodeVisitor implements Visitor {
    constructor(private nodeMap: PropertyMap) {

    }

    enter(parser: IParser, path: Array<string | number>) {
        if (parser.node.type === 'AssignmentStatement') {
            let init = parser.getChildAt('init') as Array<IParser>;
            for (let i = 0; i < init.length; i++) {
                let exp = init[i];
                if (exp.node.type === 'CallExpression') {
                    let base = exp.getChildAt('base') as IParser;
                    if (base.node.type === 'MemberExpression') {
                        let id = base.getChildAt('identifier') as IParser;
                        if (id.node.type === 'Identifier' && id.node.name === 'seekNodeByName') {
                            base = base.getChildAt('base') as IParser;
                            if (base.node.type === 'MemberExpression') {
                                id = base.getChildAt('identifier') as IParser;
                                if (id.node.type === 'Identifier' && id.node.name === 'Helper') {
                                    base = base.getChildAt('base') as IParser;
                                    if (base.node.type === 'Identifier' && base.node.name === 'ccui') {
                                        this.registerProperty((parser.getChildAt('variables') as Array<IParser>)[i], exp.getChildAt('arguments') as Array<IParser>);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
            
            
    }

    leave(parser: IParser, path: Array<string | number>) {

    }

    private registerProperty(variable: IParser, argument: Array<IParser>) {
        let prop: string;
        if (variable.node.type === 'Identifier') {
            console.warn('[seeknode] identifier')
            prop = variable.node.name;
        } else if (variable.node.type === 'MemberExpression') {
            let id = variable.getChildAt('identifier') as IParser;
            let base = variable.getChildAt('base') as IParser;
            if (base.node.type === 'Identifier' && base.node.name === 'self') {
                prop = (id.node as Identifier).name;
            } else {
                throw 'unsupport type: ' + variable.node.type;
            }
        } else {
            console.error('[seeknode]unsupport type:', variable.node.type)
            throw 'unsupport type: ' + variable.node.type;
        }
        
        if (argument.length !== 2) {
            console.error('[seeknode]arguments count is wrong', argument.length)
            throw 'arguments count is wrong: ' + argument.length;
        }

        let parent = argument[0];
        let name = argument[1];

        let names: string[]
        if (parent.node.type === 'MemberExpression') {
            let id = variable.getChildAt('identifier') as IParser;
            names = this.nodeMap[(id.node as Identifier).name] || [];

            if (name.node.type === 'StringLiteral') {
                names.push(name.node.value);
            } else {
                throw 'unsupport type: ' + name.node.type;
            }
        } else {
            throw 'unsupport type: ' + parent.node.type;
        }

        this.nodeMap[prop] = names;
    }
}