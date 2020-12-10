"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var codegen = __importStar(require("escodegen"));
var luaparse_1 = require("luaparse");
var Parser_1 = require("../parsers/Parser");
var Super_1 = require("../visitor/Super");
var Dependence_1 = require("../visitor/Dependence");
var lua2js_1 = require("./lua2js");
var FileSystem_1 = require("./FileSystem");
var VarargLiteral_1 = require("../visitor/VarargLiteral");
var SeekNode_1 = require("../visitor/SeekNode");
var Module = /** @class */ (function () {
    function Module(path) {
        this.path = path;
        var content = FileSystem_1.readFileContent(path);
        var ast = luaparse_1.parse(content);
        this.parser = new Parser_1.Parser(ast, null);
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
    Module.prototype.getReturnId = function () {
        var body = this.parser.getChildAt('body');
        for (var i = 0; i < body.length; i++) {
            var statement = body[i];
            if (statement.node.type === 'ReturnStatement') {
                if (i !== body.length - 1) {
                    throw 'file return statement is not last statement: ' + this.path;
                }
                var argument = statement.getChildAt('arguments');
                if (argument.length === 1) {
                    var id = argument[0];
                    this.returnId = id;
                    statement.removeFromParent();
                }
                else {
                    throw 'unsupport module return multi arguments: ' + this.path;
                }
            }
        }
    };
    Module.prototype.appendExport = function () {
        if (this.returnId) {
            var statement = new Parser_1.Parser({
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
            var init = statement.getChildAt('init');
            init.push(this.returnId);
            var body = this.parser.getChildAt('body');
            body.push(statement);
        }
    };
    /**
     * 将class方法合并到cc.Class里面, 并将class语句放在代码最后
     */
    Module.prototype.mergeClass = function () {
        var body = this.parser.getChildAt('body');
        var statement;
        var i = 0;
        var classIndex = [];
        while (body[i]) {
            statement = body[i];
            var result = this.isClassStatement(statement);
            if (result) {
                var _a = this.replaceClassStatement(statement), name_1 = _a.name, parser = _a.parser;
                this.classDeclaration[name_1] = parser;
                classIndex.push(i);
                i++;
                continue;
            }
            result = this.isMethod(statement);
            if (result) {
                this.addMethod(statement);
                continue;
            }
            i++;
        }
        //将class放在代码后面
        for (var n = 0; n < classIndex.length; n++) {
            var index = classIndex[n] - n;
            statement = body.splice(index, 1)[0];
            body.push(statement);
        }
    };
    Module.prototype.isMethod = function (statement) {
        if (statement.node.type === 'FunctionDeclaration') {
            var id = statement.getChildAt('identifier');
            if (id && id.node.type === 'MemberExpression') {
                var base = id.getChildAt('base');
                if (base.node.type === 'Identifier' && this.classDeclaration[base.node.name]) {
                    return true;
                }
            }
        }
        return false;
    };
    Module.prototype.addMethod = function (statement) {
        var id = statement.getChildAt('identifier');
        var name = id.getChildAt('identifier').node.name;
        var base = id.getChildAt('base').node;
        id.removeFromParent(); //将function变成匿名函数
        var prop = {
            type: 'TableKeyString',
            key: {
                type: 'Identifier',
                name: name
            },
            value: {
                type: 'FunctionDeclaration',
                identifier: null,
                isLocal: true,
                body: [],
                parameters: []
            }
        };
        var table = this.classDeclaration[base.name];
        var fields = table.getChildAt('fields');
        var idNode = id.node;
        var propParser;
        if (idNode.indexer === '.') {
            //静态方法
            var staticProp = this.getClassStatic(base.name);
            var staticTable = staticProp.getChildAt('value');
            propParser = new Parser_1.Parser(prop, staticTable);
            fields = staticTable.getChildAt('fields');
            fields.push(propParser);
        }
        else {
            propParser = new Parser_1.Parser(prop, table);
            fields.push(propParser);
            if (name === 'ctor') {
                //构造函数删除super.ctor语句
                var body = statement.getChildAt('body');
                for (var i = 0; i < body.length; i++) {
                    var funcStatement = body[i];
                    if (funcStatement.node.type === 'CallStatement') {
                        var expression = funcStatement.getChildAt('expression');
                        if (expression.node.type === 'CallExpression') {
                            expression = expression.getChildAt('base');
                            if (expression.node.type === 'MemberExpression') {
                                var id_1 = expression.getChildAt('identifier');
                                var base_1 = expression.getChildAt('base');
                                if (id_1.node.type === 'Identifier' &&
                                    id_1.node.name === 'ctor' &&
                                    base_1.node.type === 'MemberExpression') {
                                    id_1 = base_1.getChildAt('identifier');
                                    if (id_1.node.type === 'Identifier' && id_1.node.name === 'super') {
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
    };
    Module.prototype.getClassStatic = function (name) {
        var table = this.classDeclaration[name];
        var fields = table.getChildAt('fields');
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            var key = f.getChildAt('key');
            var value = f.getChildAt('value');
            if (key.node.type === 'Identifier' && key.node.name === 'statics') {
                if (value.node.type !== 'TableConstructorExpression') {
                    throw 'statics must be table';
                }
                return f;
            }
        }
        var staticProp = new Parser_1.Parser({
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
    };
    Module.prototype.isClassStatement = function (statement) {
        if (statement.node.type === 'LocalStatement') {
            var initExpression = void 0;
            var inits = statement.getChildAt('init');
            if (inits.length === 1) {
                initExpression = inits[0];
                if (initExpression.node.type === 'CallExpression') {
                    var base = initExpression.getChildAt('base');
                    if (base.node.type === 'Identifier' && base.node.name === 'class') {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    Module.prototype.replaceClassStatement = function (statement) {
        var inits = statement.getChildAt('init');
        var initExpression = inits[0];
        var id = statement.getChildAt('variables')[0].node;
        var argument = initExpression.getChildAt('arguments');
        var nameNode = argument[0].node;
        var fields = [
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
                value: argument[1].toLuaNode()
            });
        }
        var initExp = new Parser_1.Parser({
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
            arguments: [
                {
                    type: 'TableConstructorExpression',
                    fields: fields
                }
            ]
        }, statement);
        inits[0] = initExp;
        return {
            name: id.name,
            parser: initExp.getChildAt('arguments')[0]
        };
    };
    Module.prototype.modifiSuper = function () {
        this.parser.traverse(new Super_1.SuperVisitor);
    };
    Module.prototype.modifiRequire = function () {
        this.parser.traverse(new Dependence_1.DependenceVisitor(this.path));
    };
    Module.prototype.removeUnusedVararg = function () {
        this.parser.traverse(new VarargLiteral_1.VarargLiteralVisitor);
    };
    Module.prototype.toJsAst = function () {
        var program = lua2js_1.toJs.Chunk(this.parser);
        var code = codegen.generate(program);
        return code;
    };
    Module.prototype.getSeekNode = function () {
        var map = {};
        this.parser.traverse(new SeekNode_1.SeekNodeVisitor({}));
        return map;
    };
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=Module.js.map