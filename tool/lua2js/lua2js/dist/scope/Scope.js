"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scope = /** @class */ (function () {
    function Scope(type, name) {
        this.type = type;
        this.name = name;
        this.variables = {};
        this.children = {};
        this.variables = {};
    }
    Scope.prototype.addChild = function (scope) {
        scope.parent = scope;
        this.children[scope.name] = scope;
    };
    Scope.prototype.setVar = function (name, variable) {
        if (this.variables[name]) {
            console.warn('repeat variable:', name, this.name, this.type);
            return;
        }
        this.variables[name] = variable;
    };
    Scope.prototype.changeVarType = function (name, type) {
        var variable = this.getVar(name);
        if (variable) {
            variable.type = type;
        }
        else {
            console.error('unknown variable:', name);
        }
    };
    Scope.prototype.getVar = function (name) {
        var scope = this;
        while (scope && !scope.variables[name]) {
            scope = scope.parent;
        }
        if (scope) {
            return scope.variables[name];
        }
    };
    Scope.prototype.setProperty = function (name, base, property) {
    };
    return Scope;
}());
exports.Scope = Scope;
//# sourceMappingURL=Scope.js.map