import { IParser } from "../parsers/IParser";
import { getConvertResult } from './utils';

import { table } from './tableapi';
import { Identifier } from "luaparse";

export let custom2js = [
    {test: isNew, convert: convertToNew}
]

function isNew(parser: IParser): boolean {
    if (parser.node.type === 'CallExpression') {
        let base = parser.getChildAt('base') as IParser;
        if (base.node.type === 'MemberExpression') {
            let id = base.getChildAt('identifier') as IParser;
            if (id.node.type === 'Identifier' && 
            (id.node.name === 'new' || 
            (id.node.name === 'create' && base.node.indexer === ':'))) {
                return true;
            }
        }
    }

    return false;
}

function convertToNew(parser: IParser): ESTree.NewExpression {
    let base = parser.getChildAt('base') as IParser;
    let callee = base.getChildAt('base') as IParser;
    return {
        type: 'NewExpression',
        callee: getConvertResult(callee),
        arguments: (parser.getChildAt('arguments') as IParser[]).map(getConvertResult)
    }
}

function isTableApi(parser: IParser): boolean {
    if (parser.node.type === 'CallExpression') {
        let base = parser.getChildAt('base') as IParser;
        if (base.node.type === 'MemberExpression' &&
        base.node.indexer === '.') {
            let id = base.getChildAt('base') as IParser;
            if (id.node.type === 'Identifier' && id.node.name === 'table') {
                return true;
            }
        }
    }

    return false;
}

function convertToArray(parser: IParser): ESTree.CallExpression | undefined {
    if (parser.node.type === 'CallExpression') {
        let base = parser.getChildAt('base') as IParser;
        let id = (base.getChildAt('identifier') as IParser).node as Identifier;

        let t = table as any;
        let func = t[id.name];
        return func(parser.getChildAt('arguments'));
    }
}