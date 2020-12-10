"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PrintVisitor = /** @class */ (function () {
    function PrintVisitor() {
    }
    PrintVisitor.prototype.enter = function (parser, path) {
        console.log(JSON.stringify(path), JSON.stringify(parser.node));
    };
    PrintVisitor.prototype.leave = function (parser, path) {
    };
    return PrintVisitor;
}());
exports.PrintVisitor = PrintVisitor;
//# sourceMappingURL=Print.js.map