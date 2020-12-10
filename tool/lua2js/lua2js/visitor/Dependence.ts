import { Visitor } from "./Visitor";
import { IParser } from "../parsers/IParser";
import { getModuleName } from '../cocostree/FileSystem'

export class DependenceVisitor implements Visitor {
    constructor(private module: string) {

    }

    public enter(parser: IParser): void {
        let node = parser.node;
        if (node.type === 'CallExpression') {
            let base = parser.getChildAt('base') as IParser;
            let baseNode = base.node;
            let argument = parser.getChildAt('arguments') as Array<IParser>;

            if (baseNode.type === 'Identifier' &&
            (baseNode.name === 'require' || baseNode.name === 'import') && 
            argument.length === 1) {
                node = argument[0].node;
                if (node.type === 'StringLiteral') {
                    node.value = getModuleName(node.value, this.module);
                    node.raw = `\"${node.value}\"`;
                    baseNode.name = 'require';
                }
            } 
        }
    }

    public leave(parser: IParser): void {
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
    }

}
