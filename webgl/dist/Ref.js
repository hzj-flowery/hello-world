"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Component = /** @class */ (function () {
    function Component() {
    }
    return Component;
}());
var Ref = /** @class */ (function () {
    function Ref() {
        this._referenceCount = 0;
        this._referenceCount = 1;
    }
    Ref.prototype.addReferenceCount = function () {
        this._referenceCount++;
    };
    Ref.prototype.reduceReferenceCount = function () {
        this._referenceCount--;
    };
    return Ref;
}());
exports.default = Ref;
//# sourceMappingURL=Ref.js.map