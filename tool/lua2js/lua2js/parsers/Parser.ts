import { Node } from "luaparse";
import { getVisitorKeys } from "./utils";
import { Scope } from "../scope/Scope";
import { IParser } from "./IParser";
import { Visitor } from "../visitor/Visitor";


export class Parser implements IParser {
    private children: {[key: string]: Parser | Array<Parser>}

    constructor(public readonly node: Node, 
        public parent: Parser | null) {

        this.children = {};
        let visitorKeys = getVisitorKeys(this.node.type);
        visitorKeys.forEach((k) => {
            let node = this.node as any;
            let child = node[k] as Node;
            delete node[k];

            if (Array.isArray(child)) {
                let arrayParser: Array<Parser> = [];
                for (let i = 0; i < child.length; i++) {
                    arrayParser[i] = new Parser(child[i], this);
                }
                this.children[k] = arrayParser;
            } else if (child) {
                this.children[k] = new Parser(child, this);
            }
        });
    }

    public parseVariableTypes(scopeStack: Scope[], root: Scope) {

    }

    public traverse(visitor: Visitor) {
        for (const key in this.children) {
            let child = this.children[key];
            if (Array.isArray(child)) {
                for (let i = 0; i < child.length; i++) {
                    visitor.enter(child[i], [key, i]);
                    child[i].traverse(visitor);
                    visitor.leave(child[i], [key, i]);
                }                
            } else {
                visitor.enter(child, [key]);
                child.traverse(visitor);
                visitor.leave(child, [key]);
            }
        }
    }

    public removeFromParent() {
        let parent = this.parent;
        if (!parent) {
            return;
        }

        let keys = Object.keys(parent.children);
        let key: string;
        let children: Parser | Array<Parser>;

        for (let i = 0 ; i < keys.length; i++) {
            key = keys[i];
            children = parent.children[key];
            if (children === this) {
                delete parent.children[key];
                break;
            } else if (Array.isArray(children)) {
                let index = children.indexOf(this);
                if (index > -1) {
                    children.splice(index, 1);
                } else {
                    console.warn("can't find node from parent", JSON.stringify(this.node));
                }
            }
        }

        this.parent = null;
    }

    public addToParent(parent: Parser, path: Array<string | number>) {
        this.removeFromParent();
        parent.addChild(this, path);
    }

    public addChild(child: Parser, path: Array<string|number>) {
        child.removeFromParent();
        child.parent = this

        let path0 = path[0];
        let children = this.children[path0];
        if (!children) {
            if (path.length === 1) {
                this.children[path0] = child;
            } else {
                let path1 = path[1] as number;
                children = [];
                this.children[path0] = children;
                children.splice(path1, 0, child);
            }
        } else {
            if (path.length === 1) {
               // console.warn('replace child', JSON.stringify(this.node), path[0])
                this.children[path0] = child;
            } else {
                children = children as Array<Parser>;
                let path1 = path[1] as number;
                children.splice(path1, 0, child);
            }
        }
    }

    public getChildAt(path: string): Parser | Array<Parser> {
        return this.children[path]
    }

    public get type(): string {
        return this.node.type;
    }

    public toLuaNode(): Node {
        let node = (Object as any).assign({}, this.node) as any;
        for (let key in this.children) {
            let child = this.children[key];
            if (Array.isArray(child)) {
                node[key] = [];
                for (let i in child) {
                    node[key][i] = child[i].toLuaNode();
                }
            } else {
                node[key] = child.toLuaNode();
            }
        }

        return node;
    }
}