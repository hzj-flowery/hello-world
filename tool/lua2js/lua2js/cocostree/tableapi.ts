import { IParser } from "../parsers/IParser";
import { getConvertResult } from "./utils";

export let table = {
    insert(args: IParser[]): ESTree.CallExpression {
        if (args.length === 2) {
            let push: ESTree.Identifier = {
                type: 'Identifier',
                name: 'push'
            }
            let callee: ESTree.MemberExpression = {
                type: 'MemberExpression',
                object: getConvertResult(args[0]),
                property: push,
                computed: false
            }
            return {
                type: 'CallExpression',
                callee: callee,
                arguments:[getConvertResult(args[1])]
            }
        } else if (args.length === 3) {
            let splice: ESTree.Identifier = {
                type: 'Identifier',
                name: 'splice'
            }
            let callee: ESTree.MemberExpression = {
                type: 'MemberExpression',
                object: getConvertResult(args[0]),
                property: splice,
                computed: false
            }
            let zero: ESTree.Literal = {
                type: 'Literal',
                value: 0
            }

            return {
                type: 'CallExpression',
                callee: callee,
                arguments:[
                    getConvertResult(args[1]),
                    zero,
                    getConvertResult(args[2])
                ]
            }
        } else {
            throw 'table.insert arguments number error!'
        }
    },
    remove(args: IParser[]) {
        if (args.length === 1) {
            let pop: ESTree.Identifier = {
                type: 'Identifier',
                name: 'pop'
            }
            let callee: ESTree.MemberExpression = {
                type: 'MemberExpression',
                object: getConvertResult(args[0]),
                property: pop,
                computed: false
            }
            return {
                type: 'CallExpression',
                callee: callee,
                arguments:[]
            }
        } else if (args.length === 2) {
            let splice: ESTree.Identifier = {
                type: 'Identifier',
                name: 'splice'
            }
            let callee: ESTree.MemberExpression = {
                type: 'MemberExpression',
                object: getConvertResult(args[0]),
                property: splice,
                computed: false
            }
            let one: ESTree.Literal = {
                type: 'Literal',
                value: 1
            }

            return {
                type: 'CallExpression',
                callee: callee,
                arguments:[
                    getConvertResult(args[1]),
                    one
                ]
            }
        } else {
            throw 'table.remove arguments number error!'
        }

    },
    sort(args: IParser[]) {
        let sort: ESTree.Identifier = {
            type: 'Identifier',
            name: 'sort'
        }
        let callee: ESTree.MemberExpression = {
            type: 'MemberExpression',
            object: getConvertResult(args[0]),
            property: sort,
            computed: false
        }

        return {
            type: 'CallExpression',
            callee: callee,
            arguments:[
                getConvertResult(args[1])
            ]
        }
    },
    concat(args: IParser[]) {
        let join: ESTree.Identifier = {
            type: 'Identifier',
            name: 'join'
        }

        let sep: ESTree.Expression | ESTree.Literal
        if (args[1]) {
            sep = getConvertResult(args[1]);
        } else {
            sep = {
                type: 'Literal',
                value: ' '
            }
        }

        let callee: ESTree.MemberExpression | ESTree.CallExpression
        if (args[2]) {
            callee = {
                type: 'MemberExpression',
                object: getConvertResult(args[0]),
                property: join,
                computed: false
            }
        } else {
            let slice: ESTree.Identifier = {
                type: 'Identifier',
                name: 'slice'
            }

            let sliceCallee: ESTree.MemberExpression = {
                type: 'MemberExpression',
                object: getConvertResult(args[0]),
                property: slice,
                computed: false
            }

            let sliceArgs: ESTree.Expression[] = [
                getConvertResult(args[2])
            ];

            if (args[3]) {
                sliceArgs.push(getConvertResult(args[3]));
            }

            callee = {
                type: 'CallExpression',
                callee: sliceCallee,
                arguments: sliceArgs
            }
        }

        return {
            type: 'CallExpression',
            callee: callee,
            arguments:[
                sep
            ]
        }
    },
    
    nums(args: IParser[]) {
        
    }
}