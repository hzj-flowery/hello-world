"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Camera_1 = require("./Camera");
var enums_1 = require("./enums");
var PerspectiveCamera = /** @class */ (function (_super) {
    __extends(PerspectiveCamera, _super);
    function PerspectiveCamera(fovy, aspect, near, far) {
        var _this = _super.call(this, fovy, aspect, near, far, enums_1.default.PROJ_PERSPECTIVE) || this;
        _this.test();
        return _this;
    }
    PerspectiveCamera.prototype.test = function () {
        this.setRect(0, 0, 1, 1);
    };
    /**
     * @param time in seconds
     */
    PerspectiveCamera.prototype.updateLookAt = function (time) {
        // convert to seconds
        time *= 0.001;
        // camera going in circle 2 units from origin looking at origin
        var m4 = this._glMatrix.mat4;
        var cameraPosition = [Math.cos(time * 0.1), 0, Math.sin(time * 0.1)];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        var cameraMatrix = m4.create();
        m4.lookAt(cameraMatrix, cameraPosition, target, up);
        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.create();
        m4.invert(viewMatrix, cameraMatrix);
        // We only care about direciton so remove the translation
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;
        var viewDirectionProjectionMatrix = m4.create();
        m4.multiply(viewDirectionProjectionMatrix, this._projectionMatrix, viewMatrix);
        var viewDirectionProjectionInverseMatrix = m4.create();
        m4.invert(viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix);
        return viewDirectionProjectionInverseMatrix;
    };
    return PerspectiveCamera;
}(Camera_1.default));
exports.default = PerspectiveCamera;
//# sourceMappingURL=PerspectiveCamera.js.map