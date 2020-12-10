import * as codegen from 'escodegen';
import { parse, Identifier, StringLiteral, FunctionDeclaration, TableKey, TableKeyString, CallExpression, MemberExpression, Expression } from "luaparse";
import { Parser } from "../parsers/Parser";
import { SuperVisitor } from '../visitor/Super';
import { DependenceVisitor } from '../visitor/Dependence';
import { toJs } from './lua2js';
import { readFileContent } from './FileSystem';
import { VarargLiteralVisitor } from '../visitor/VarargLiteral';
import { SeekNodeVisitor } from '../visitor/SeekNode';


export class Module {
    public readonly parser: Parser;
    //声明class的table，不是语句！！！
    private classDeclaration: {[key: string]: Parser};

    private returnId: Parser | undefined;

    constructor(private path: string) {

        let content = readFileContent(path);
        let ast = parse(content);
        this.parser = new Parser(ast, null);

        this.classDeclaration = {};

        this.getReturnId();

        this.mergeClass();

        this.modifiSuper();
        this.modifiRequire();

        this.removeUnusedVararg();

        this.appendExport();
    }

    /**
     * 获取return的表达式，先删除，等处理完class再加回来
     */
    private getReturnId() {
        let body = this.parser.getChildAt('body') as Array<Parser>
        for (let i = 0; i < body.length; i++) {
            let statement = body[i];
            if (statement.node.type === 'ReturnStatement') {
                if (i !== body.length - 1) {
                    throw 'file return statement is not last statement: ' + this.path;
                }

                let argument = statement.getChildAt('arguments') as Array<Parser>
                if (argument.length === 1) {
                    let id = argument[0];
                    this.returnId = id;
                    statement.removeFromParent();
                } else {
                    throw 'unsupport module return multi arguments: ' + this.path;
                }
            }
        }
    }

    private appendExport() {
        if (this.returnId) {
            let statement = new Parser({
                type: 'AssignmentStatement',
                variables: [{
                    type: 'MemberExpression',
                    indexer: '.',
                    base: {
                        type: 'Identifier',
                        name: 'module'
                    },
                    identifier: {
                        type: 'Identifier',
                        name: 'exports'
                    }
                }],
                init: []
            }, this.parser);

            let init = statement.getChildAt('init') as Array<Parser>;
            init.push(this.returnId);

            let body = this.parser.getChildAt('body') as Array<Parser>;
            body.push(statement);
        }
    }

    /**
     * 将class方法合并到cc.Class里面, 并将class语句放在代码最后
     */
    private mergeClass() {
        let body = this.parser.getChildAt('body') as Array<Parser>
        let statement: Parser;

        let i = 0;

        let classIndex: Array<number> = [];

        while (body[i]) {
            statement = body[i];
            let result = this.isClassStatement(statement);
            if (result) {
                let {name, parser} = this.replaceClassStatement(statement);
                this.classDeclaration[name] = parser;

                classIndex.push(i);
                i++;
                continue;
            }

            result = this.isMethod(statement);
            if (result) {
                this.addMethod(statement)
                continue;
            }

            i++;
        }

        //将class放在代码后面
        for (let n = 0; n < classIndex.length; n++) {
            let index = classIndex[n] - n;
            statement = body.splice(index, 1)[0]
            body.push(statement);
        }
    }

    private isMethod(statement: Parser): boolean {
        if (statement.node.type === 'FunctionDeclaration') {
            let id = statement.getChildAt('identifier') as Parser;
            if (id && id.node.type === 'MemberExpression') {

                let base = id.getChildAt('base') as Parser;
                if (base.node.type === 'Identifier' && this.classDeclaration[base.node.name]) {
                    return true;
                }
            }
        }

        return false;
    }

    private addMethod(statement: Parser) {
        let id = statement.getChildAt('identifier') as Parser;
        let name = ((id.getChildAt('identifier') as Parser).node as Identifier).name;
        let base = (id.getChildAt('base') as Parser).node as Identifier;
        id.removeFromParent(); //将function变成匿名函数

        let prop: TableKeyString = {
            type: 'TableKeyString',
            key: {
                type: 'Identifier',
                name: name
            },

            value: {
                type: 'FunctionDeclaration',
                identifier: null,
                isLocal: true,
                body:[],
                parameters: []
            }
        }

        let table = this.classDeclaration[base.name];
        let fields = table.getChildAt('fields') as Array<Parser>;

        let idNode = id.node as MemberExpression;

        let propParser: Parser;
        if (idNode.indexer === '.') {
            //静态方法

            let staticProp = this.getClassStatic(base.name);
            let staticTable = staticProp.getChildAt('value') as Parser;
            propParser = new Parser(prop, staticTable);
            fields = staticTable.getChildAt('fields') as Array<Parser>;
            fields.push(propParser);
        } else {
            propParser = new Parser(prop, table);
            fields.push(propParser);

            if (name === 'ctor') {
                //构造函数删除super.ctor语句
                let body = statement.getChildAt('body') as Array<Parser>;
                for (let i = 0; i < body.length; i++) {
                    let funcStatement = body[i];
                    if (funcStatement.node.type === 'CallStatement') {
                        let expression = funcStatement.getChildAt('expression') as Parser;
                        if (expression.node.type === 'CallExpression') {
                            expression = expression.getChildAt('base') as Parser;
                            if (expression.node.type === 'MemberExpression') {
                                let id = expression.getChildAt('identifier') as Parser;
                                let base = expression.getChildAt('base') as Parser;
                                if (id.node.type === 'Identifier' && 
                                id.node.name === 'ctor' && 
                                base.node.type === 'MemberExpression') {
                                    id = base.getChildAt('identifier') as Parser;
                                    if (id.node.type === 'Identifier' && id.node.name === 'super') {
                                        body.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        idNode.indexer = '.';
        propParser.addChild(statement, ['value']);
    }

    private getClassStatic(name: string): Parser {
        let table = this.classDeclaration[name];
        let fields = table.getChildAt('fields') as Array<Parser>;

        for (let i = 0; i < fields.length; i++) {
            var f = fields[i];
            var key = f.getChildAt('key') as Parser;
            var value = f.getChildAt('value') as Parser;
            if (key.node.type === 'Identifier' && key.node.name === 'statics') {
                if (value.node.type !== 'TableConstructorExpression') {
                    throw 'statics must be table';
                }

                return f;
            }
        }

        let staticProp = new Parser({
            type: 'TableKeyString',
            key: {
                type: 'Identifier',
                name: 'statics'
            },
            value: {
                type: 'TableConstructorExpression',
                fields: []
            }
        }, table);

        fields.push(staticProp);

        return staticProp;
    }

    private isClassStatement(statement: Parser): boolean {
        if (statement.node.type === 'LocalStatement') {
            let initExpression: Parser;
            let inits = statement.getChildAt('init') as Array<Parser>;
            if (inits.length === 1) {

                initExpression = inits[0];
                if (initExpression.node.type === 'CallExpression') {

                    let base = initExpression.getChildAt('base') as Parser;
                    if (base.node.type === 'Identifier' && base.node.name === 'class') {

                        return true;
                    }
                }
            }
        }

        return false;
    }

    private replaceClassStatement(statement: Parser): {name: string, parser: Parser} {
        let inits = statement.getChildAt('init') as Array<Parser>;
        let initExpression = inits[0];

        let id = (statement.getChildAt('variables') as Array<Parser>)[0].node as Identifier;
        let argument = initExpression.getChildAt('arguments') as Array<Parser>;
        let nameNode = argument[0].node as StringLiteral;

        let fields: TableKeyString[] = [
            {
                type: 'TableKeyString',
                key: {
                    type: 'Identifier',
                    name: 'name'
                },
                value: {
                    type: 'StringLiteral',
                    value: nameNode.value,
                    raw: nameNode.raw
                }
            }
        ];

        if (argument.length > 1) {
            fields.push({
                type: 'TableKeyString',
                key: {
                    type: 'Identifier',
                    name: 'extends'
                },
                value: argument[1].toLuaNode() as Expression
            })
        }

        let initExp = new Parser({
            type: 'CallExpression',
            base: {
                type: 'MemberExpression',
                base: {
                    type: 'Identifier',
                    name: 'cc'
                },
                identifier: {
                    type: "Identifier",
                    name: 'Class'
                },
                indexer: '.'
            },
            arguments:[
                {
                    type: 'TableConstructorExpression',
                    fields: fields
                }
            ]
        }, statement);

        inits[0] = initExp;

        return {
            name: id.name,
            parser: (initExp.getChildAt('arguments') as Array<Parser>)[0]
        }
    }

    private modifiSuper() {
        this.parser.traverse(new SuperVisitor);
    }

    private modifiRequire() {
        this.parser.traverse(new DependenceVisitor(this.path));
    }

    private removeUnusedVararg() {
        this.parser.traverse(new VarargLiteralVisitor);
    }

    public toJsAst(): string {
        let program = toJs.Chunk(this.parser);
        let code = codegen.generate(program);

        return code;
    }

    public getSeekNode() {
        let map = {};
        this.parser.traverse(new SeekNodeVisitor({}));

        return map;
    }
}