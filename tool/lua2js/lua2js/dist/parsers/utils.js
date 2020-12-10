"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var visitorkeys = {
    LabelStatement: ['label'],
    BreakStatement: [],
    GotoStatement: ['label'],
    ReturnStatement: ['arguments'],
    IfStatement: ["clauses"],
    IfClause: ["condition", "body"],
    ElseifClause: ["condition", "body"],
    ElseClause: ["body"],
    WhileStatement: ["condition", "body"],
    DoStatement: ["body"],
    RepeatStatement: ["condition", "body"],
    LocalStatement: ["variables", "init"],
    AssignmentStatement: ["variables", "init"],
    CallStatement: ["expression"],
    FunctionDeclaration: ["identifier", "parameters", "body"],
    ForNumericStatement: ["variable", "start", "end", "step", "body"],
    ForGenericStatement: ["variables", "iterators", "body"],
    Chunk: ['body'],
    Identifier: [],
    StringLiteral: [],
    NumericLiteral: [],
    BooleanLiteral: [],
    NilLiteral: [],
    VarargLiteral: [],
    TableKey: ["key", "value"],
    TableKeyString: ["key", "value"],
    TableValue: ["value"],
    TableConstructorExpression: ['fields'],
    UnaryExpression: ["argument"],
    BinaryExpression: ["left", "right"],
    LogicalExpression: ["left", "right"],
    MemberExpression: ["identifier", "base"],
    IndexExpression: ["base", "index"],
    CallExpression: ["base", "arguments"],
    TableCallExpression: ["base", "arguments"],
    StringCallExpression: ["base", "argument"],
};
function getVisitorKeys(type) {
    return visitorkeys[type];
}
exports.getVisitorKeys = getVisitorKeys;
//# sourceMappingURL=utils.js.map