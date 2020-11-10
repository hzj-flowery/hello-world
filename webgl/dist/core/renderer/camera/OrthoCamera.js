"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Camera_1 = require("./Camera");
var enums_1 = require("./enums");
var OrthoCamera = /** @class */ (function (_super) {
    __extends(OrthoCamera, _super);
    function OrthoCamera(fovy, aspect, near, far) {
        return _super.call(this, fovy, aspect, near, far, enums_1.default.PROJ_ORTHO) || this;
    }
    return OrthoCamera;
}(Camera_1.default));
exports.default = OrthoCamera;
//# sourceMappingURL=OrthoCamera.js.map