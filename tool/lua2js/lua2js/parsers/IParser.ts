import { Node } from "luaparse";
import { Visitor } from "../visitor/Visitor";
import { type } from "os";

export interface IParser {
    node: Node,
    parent: IParser | null
    type: string
    traverse(visitor: Visitor): void
    getChildAt(path: string): IParser | Array<IParser>
    addToParent(parent: IParser, path: Array<string | number>): void;
    addChild(child: IParser, path: Array<string|number>): void;
    removeFromParent(): void;
}