"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.table = void 0;
var utils_1 = require("./utils");
exports.table = {
    insert: function (args) {
        if (args.length === 2) {
            var push = {
                type: 'Identifier',
                name: 'push'
            };
            var callee = {
                type: 'MemberExpression',
                object: utils_1.getConvertResult(args[0]),
                property: push,
                computed: false
            };
            return {
                type: 'CallExpression',
                callee: callee,
                arguments: [utils_1.getConvertResult(args[1])]
            };
        }
        else if (args.length === 3) {
            var splice = {
                type: 'Identifier',
                name: 'splice'
            };
            var callee = {
                type: 'MemberExpression',
                object: utils_1.getConvertResult(args[0]),
                property: splice,
                computed: false
            };
            var zero = {
                type: 'Literal',
                value: 0
            };
            return {
                type: 'CallExpression',
                callee: callee,
                arguments: [
                    utils_1.getConvertResult(args[1]),
                    zero,
                    utils_1.getConvertResult(args[2])
                ]
            };
        }
        else {
            throw 'table.insert arguments number error!';
        }
    },
    remove: function (args) {
        if (args.length === 1) {
            var pop = {
                type: 'Identifier',
                name: 'pop'
            };
            var callee = {
                type: 'MemberExpression',
                object: utils_1.getConvertResult(args[0]),
                property: pop,
                computed: false
            };
            return {
                type: 'CallExpression',
                callee: callee,
                arguments: []
            };
        }
        else if (args.length === 2) {
            var splice = {
                type: 'Identifier',
                name: 'splice'
            };
            var callee = {
                type: 'MemberExpression',
                object: utils_1.getConvertResult(args[0]),
                property: splice,
                computed: false
            };
            var one = {
                type: 'Literal',
                value: 1
            };
            return {
                type: 'CallExpression',
                callee: callee,
                arguments: [
                    utils_1.getConvertResult(args[1]),
                    one
                ]
            };
        }
        else {
            throw 'table.remove arguments number error!';
        }
    },
    sort: function (args) {
        var sort = {
            type: 'Identifier',
            name: 'sort'
        };
        var callee = {
            type: 'MemberExpression',
            object: utils_1.getConvertResult(args[0]),
            property: sort,
            computed: false
        };
        return {
            type: 'CallExpression',
            callee: callee,
            arguments: [
                utils_1.getConvertResult(args[1])
            ]
        };
    },
    concat: function (args) {
        var join = {
            type: 'Identifier',
            name: 'join'
        };
        var sep;
        if (args[1]) {
            sep = utils_1.getConvertResult(args[1]);
        }
        else {
            sep = {
                type: 'Literal',
                value: ' '
            };
        }
        var callee;
        if (args[2]) {
            callee = {
                type: 'MemberExpression',
                object: utils_1.getConvertResult(args[0]),
                property: join,
                computed: false
            };
        }
        else {
            var slice = {
                type: 'Identifier',
                name: 'slice'
            };
            var sliceCallee = {
                type: 'MemberExpression',
                object: utils_1.getConvertResult(args[0]),
                property: slice,
                computed: false
            };
            var sliceArgs = [
                utils_1.getConvertResult(args[2])
            ];
            if (args[3]) {
                sliceArgs.push(utils_1.getConvertResult(args[3]));
            }
            callee = {
                type: 'CallExpression',
                callee: sliceCallee,
                arguments: sliceArgs
            };
        }
        return {
            type: 'CallExpression',
            callee: callee,
            arguments: [
                sep
            ]
        };
    },
    nums: function (args) {
    }
};
//# sourceMappingURL=tableapi.js.map