"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraData = exports.LightData = void 0;
var Matrix_1 = require("../../Matrix");
/**
 * 光照数据
 */
var LightData = /** @class */ (function () {
    function LightData() {
        this.reset();
    }
    LightData.prototype.reset = function () {
        this._position = [];
        this._direction = [];
        this._color = [1, 1, 1];
        this._specularShininess = 140;
        this._specularColor = [1, 0.2, 0.2];
    };
    LightData.prototype.setData = function (pos, dir, color) {
        this._position = pos;
        this._direction = dir;
        this._color = color;
    };
    Object.defineProperty(LightData.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightData.prototype, "direction", {
        get: function () {
            return this._direction;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightData.prototype, "color", {
        get: function () {
            return this._color;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightData.prototype, "specularColor", {
        get: function () {
            return this._specularColor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightData.prototype, "specularShininess", {
        get: function () {
            return this._specularShininess;
        },
        enumerable: false,
        configurable: true
    });
    return LightData;
}());
exports.LightData = LightData;
/**
 * 相机数据
 */
var CameraData = /** @class */ (function () {
    function CameraData() {
        this.lightData = new LightData();
        this._viewProjectionMat = Matrix_1.glMatrix.mat4.identity(null);
        this._viewMat = Matrix_1.glMatrix.mat4.identity(null);
        this.reset();
    }
    CameraData.prototype.reset = function () {
        this.position = [];
        this.projectMat = null;
        this.modelMat = null;
        this._isNeedUpdate = false;
        this.lightData.reset();
    };
    Object.defineProperty(CameraData.prototype, "projectMat", {
        get: function () {
            return this._projectMat;
        },
        set: function (proj) {
            this._projectMat = proj;
            this._isNeedUpdate = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CameraData.prototype, "modelMat", {
        get: function () {
            return this._modelMat;
        },
        set: function (model) {
            this._modelMat = model;
            this._isNeedUpdate = true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 更新高铁站
     */
    CameraData.prototype.updateMat = function () {
        if (this._isNeedUpdate) {
            Matrix_1.glMatrix.mat4.invert(this._viewMat, this._modelMat);
            Matrix_1.glMatrix.mat4.multiply(this._viewProjectionMat, this._projectMat, this._viewMat);
            this._isNeedUpdate = false;
        }
    };
    Object.defineProperty(CameraData.prototype, "viewProjectionMat", {
        /**
         * 视图投影矩阵
         */
        get: function () {
            this.updateMat();
            return this._viewProjectionMat;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CameraData.prototype, "viewMat", {
        /**
         * 视图矩阵
         */
        get: function () {
            this.updateMat();
            return this._viewMat;
        },
        enumerable: false,
        configurable: true
    });
    return CameraData;
}());
exports.CameraData = CameraData;
//# sourceMappingURL=CameraData.js.map