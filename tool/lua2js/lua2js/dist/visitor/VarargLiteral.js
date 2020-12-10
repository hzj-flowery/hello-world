"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VarargLiteralVisitor = /** @class */ (function () {
    function VarargLiteralVisitor() {
        this.inThreeDotFunction = false;
        this.threeDotUsed = 0;
    }
    VarargLiteralVisitor.prototype.enter = function (parser) {
        if (this.inThreeDotFunction) {
            if (parser.node.type === 'VarargLiteral') {
                this.threeDotUsed++;
            }
        }
        else {
            if (this.isThreeDotFunction(parser)) {
                this.inThreeDotFunction = true;
            }
        }
    };
    VarargLiteralVisitor.prototype.leave = function (parser) {
        if (this.inThreeDotFunction && this.isThreeDotFunction(parser)) {
            if (this.threeDotUsed <= 1) {
                //一次是在arguments中，所有至少是2次，body中才有可能使用了变长参数
                var parameters = parser.getChildAt('parameters');
                for (var i = 0; i < parameters.length; i++) {
                    var param = parameters[i];
                    if (param.node.type === 'VarargLiteral') {
                        parameters.splice(i, 1);
                        break;
                    }
                }
            }
            this.threeDotUsed = 0;
            this.inThreeDotFunction = false;
        }
    };
    VarargLiteralVisitor.prototype.isThreeDotFunction = function (parser) {
        var node = parser.node;
        if (node.type === 'FunctionDeclaration') {
            var parameters = parser.getChildAt('parameters');
            for (var i = 0; i < parameters.length; i++) {
                var param = parameters[i];
                if (param.node.type === 'VarargLiteral') {
                    return true;
                }
            }
        }
        return false;
    };
    return VarargLiteralVisitor;
}());
exports.VarargLiteralVisitor = VarargLiteralVisitor;
//# sourceMappingURL=VarargLiteral.js.map