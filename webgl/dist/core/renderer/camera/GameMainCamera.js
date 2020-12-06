"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var MathUtils_1 = require("../../utils/MathUtils");
var enums_1 = require("./enums");
var OrthoCamera_1 = require("./OrthoCamera");
var PerspectiveCamera_1 = require("./PerspectiveCamera");
/**
 * 游戏主相机
 */
var GameMainCamera = /** @class */ (function () {
    function GameMainCamera() {
        //ui部分----------------------------------------------------------------------------
        this.zNear = 10; //相机最近能看到的距离
        this.zFar = 50; //相机最远能看到的距离
        this.fieldOfView = 30; //相机张开的角度
        this.zPosition = -25; //场景的位置
        this.eyePosition = new Float32Array([31, 17, 15]); //相机的位置
        this.eyeRotation = new Float32Array([0, 0, 0]); //相机的旋转
    }
    Object.defineProperty(GameMainCamera, "instance", {
        get: function () {
            if (!this._instance) {
                var gl = Device_1.default.Instance.gl;
                this._instance = new GameMainCamera();
            }
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    GameMainCamera.prototype.setCamera = function (type, aspect, angle, near, far) {
        if (angle === void 0) { angle = 60; }
        if (near === void 0) { near = 0.1; }
        if (far === void 0) { far = 50; }
        this._cameraType = type;
        if (type == enums_1.default.PROJ_PERSPECTIVE) {
            this._3dCamera = new PerspectiveCamera_1.default(angle * Math.PI / 180, aspect, near, far);
            // this.createUI();
            // this._3dCamera.showFrustum();
            return this._3dCamera;
        }
        else if (type == enums_1.default.PROJ_ORTHO) {
            this._2dCamera = new OrthoCamera_1.default(angle * Math.PI / 180, aspect, near, far);
            return this._2dCamera;
        }
    };
    GameMainCamera.prototype.getCamera = function (type) {
        return type == enums_1.default.PROJ_PERSPECTIVE ? this._3dCamera : this._2dCamera;
    };
    GameMainCamera.prototype.get3DCamera = function () {
        return this._3dCamera;
    };
    GameMainCamera.prototype.get2DCamera = function () {
        return this._2dCamera;
    };
    GameMainCamera.prototype.updateFieldOfView = function (event, ui) {
        this.fieldOfView = ui.value;
    };
    GameMainCamera.prototype.updateZNear = function (event, ui) {
        this.zNear = ui.value;
    };
    GameMainCamera.prototype.updateZFar = function (event, ui) {
        this.zFar = ui.value;
    };
    GameMainCamera.prototype.updateZPosition = function (event, ui) {
        this.zPosition = ui.value;
    };
    GameMainCamera.prototype.updateCamearXPos = function (event, ui) {
        this.eyePosition[0] = ui.value;
    };
    GameMainCamera.prototype.updateCamearYPos = function (event, ui) {
        this.eyePosition[1] = ui.value;
    };
    GameMainCamera.prototype.updateCamearZPos = function (event, ui) {
        this.eyePosition[2] = ui.value;
    };
    GameMainCamera.prototype.updateCamearXRotation = function (event, ui) {
        this.eyeRotation[0] = MathUtils_1.MathUtils.degToRad(ui.value);
    };
    GameMainCamera.prototype.updateCamearYRotation = function (event, ui) {
        this.eyeRotation[1] = MathUtils_1.MathUtils.degToRad(ui.value);
    };
    GameMainCamera.prototype.updateCamearZRotation = function (event, ui) {
        this.eyeRotation[2] = MathUtils_1.MathUtils.degToRad(ui.value);
    };
    //创建相机UI
    GameMainCamera.prototype.createUI = function () {
        var webglLessonsUI = window["webglLessonsUI"];
        webglLessonsUI.setupSlider("#fieldOfView", { value: this.fieldOfView, slide: this.updateFieldOfView.bind(this), max: 179 });
        webglLessonsUI.setupSlider("#zNear", { value: this.zNear, slide: this.updateZNear.bind(this), min: 1, max: 50 });
        webglLessonsUI.setupSlider("#zFar", { value: this.zFar, slide: this.updateZFar.bind(this), min: 1, max: 50 });
        webglLessonsUI.setupSlider("#zPosition", { value: this.zPosition, slide: this.updateZPosition.bind(this), min: -60, max: 0 });
        webglLessonsUI.setupSlider("#cameraPosX", { value: this.eyePosition[0], slide: this.updateCamearXPos.bind(this), min: 1, max: 50 }); //31
        webglLessonsUI.setupSlider("#cameraPosY", { value: this.eyePosition[1], slide: this.updateCamearYPos.bind(this), min: 1, max: 50 }); //17
        webglLessonsUI.setupSlider("#cameraPosZ", { value: this.eyePosition[2], slide: this.updateCamearZPos.bind(this), min: 1, max: 50 }); //15
        webglLessonsUI.setupSlider("#cameraRotateX", { value: this.eyeRotation[0], slide: this.updateCamearXRotation.bind(this), min: 0, max: 360 }); //31
        webglLessonsUI.setupSlider("#cameraRotateY", { value: this.eyeRotation[1], slide: this.updateCamearYRotation.bind(this), min: 0, max: 360 }); //17
        webglLessonsUI.setupSlider("#cameraRotateZ", { value: this.eyeRotation[2], slide: this.updateCamearZRotation.bind(this), min: 0, max: 360 }); //15
    };
    return GameMainCamera;
}());
exports.default = GameMainCamera;
//# sourceMappingURL=GameMainCamera.js.map