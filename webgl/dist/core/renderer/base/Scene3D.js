"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scene_1 = require("./Scene");
var PerspectiveCamera_1 = require("../camera/PerspectiveCamera");
var Ground_1 = require("../3d/Ground");
var Cube_1 = require("../3d/Cube");
var LightCube_1 = require("../3d/LightCube");
var SkyBox_1 = require("../3d/SkyBox");
var Device_1 = require("../../../Device");
var Node_1 = require("./Node");
var CameraView_1 = require("../camera/CameraView");
var CustomTextureCube_1 = require("../3d/CustomTextureCube");
var CustomTextureData_1 = require("../data/CustomTextureData");
var Scene3D = /** @class */ (function (_super) {
    __extends(Scene3D, _super);
    function Scene3D() {
        var _this = _super.call(this) || this;
        _this._cameraEyePosZ = 0;
        _this._cameraTargetPosZ = 0;
        return _this;
    }
    Scene3D.prototype.cameraSceneTest1 = function () {
        //opegl的世界坐标系是x轴向右，y轴向上，z轴向外（由屏幕指向你的眼睛）
        //世界坐标系的原点就是屏幕的正中心
        var gl = Device_1.default.Instance.gl;
        //创建一个透视投影的摄像机
        //透视矩阵所造的空间是从（-0.1，-200）的视锥体区域
        //也就是说所有可见的区域，它的z轴坐标必须处于（-0.1，-200）
        this._3dCamera = new PerspectiveCamera_1.default(60 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.1, 200);
        //注意这里修改的只能是相机的节点坐标系矩阵
        //节点坐标系矩阵就是如何描述如何修改空间坐标系的，包含平移 缩放，旋转
        // this._3dCamera.setScale(2,2,2);
        this._3dCamera.setPosition(0, 0, 5);
        // this._3dCamera.setRotation(0,30,0);
        this._cameraEyePosZ = -30;
        this._cameraTargetPosZ = 0;
        this._3dCamera.lookAt([0, 0, this._cameraEyePosZ]);
        //获取相机的透视投影矩阵和节点坐标系的矩阵
        // this.addCamera(this._3dCamera);
        this.setPosition(0, 0, -10);
        setTimeout(this.updateRotate.bind(this), 20);
    };
    Scene3D.prototype.updateRotate = function () {
        this._3dCamera.rotate(0, 1, 0);
        // this._cameraPosZ = this._cameraPosZ+0.1;
        // this._cameraTargetPosZ = this._cameraTargetPosZ + 0.1;
        // console.log(this._cameraTargetPosZ);
        this._3dCamera.lookAt([0, 0, this._cameraEyePosZ]);
        this.addCamera(this._3dCamera);
        setTimeout(this.updateRotate.bind(this), 20);
    };
    Scene3D.prototype.init = function () {
        var gl = Device_1.default.Instance.gl;
        this.cameraSceneTest1();
        this._cameraView = new CameraView_1.default(gl);
        this._3dCamera.addChild(this._cameraView);
        var centerNode = new Node_1.Node();
        centerNode.setPosition(0, 1.1, 0);
        this.addChild(centerNode);
        this._floorNode = new Ground_1.default(gl);
        this._floorNode.url = "res/ground.jpg";
        this.addChild(this._floorNode);
        this._customTexture = new CustomTextureCube_1.default(gl);
        this._customTexture.url = CustomTextureData_1.default.getRandomData(3, 5, 15 /* RGB8 */);
        this._customTexture.setPosition(0, 3.1, 0);
        centerNode.addChild(this._customTexture);
        this._tableNode = new Cube_1.default(gl);
        this._tableNode.url = "res/wood.jpg";
        this._tableNode.setPosition(0, 1, 0);
        this._tableNode.setScale(2.0, 0.1, 2.0);
        centerNode.addChild(this._tableNode);
        this._cubeNode = new Cube_1.default(gl);
        this._cubeNode.url = "res/wicker.jpg";
        this._cubeNode.setPosition(0, 1.7, 0);
        this._cubeNode.setScale(0.5, 0.5, 0.5);
        centerNode.addChild(this._cubeNode);
        // 绘制 4 个腿
        for (var i = -1; i <= 1; i += 2) {
            for (var j = -1; j <= 1; j += 2) {
                var node = new Cube_1.default(gl);
                node.setPosition(i * 19, -0.1, j * 19);
                node.setScale(0.1, 1.0, 0.1);
                node.url = "res/wood.jpg";
                centerNode.addChild(node);
            }
        }
        this._lightCube = new LightCube_1.default(gl);
        this._lightCube.url = "res/wicker.jpg";
        this._lightCube.setPosition(1, 2.7, 0);
        this._lightCube.setScale(0.5, 0.5, 0.5);
        centerNode.addChild(this._lightCube);
        this._skybox = new SkyBox_1.default(gl);
        this._skybox.addCamera(this._3dCamera);
        this._skybox.setDefaultUrl();
    };
    Scene3D.prototype.getCamera = function () {
        return this._3dCamera;
    };
    Scene3D.prototype.rotate = function (x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        //    super.rotate(x,y,z);
        // this._tableNode.rotate(x,y,z);
    };
    Scene3D.prototype.deleteGPUTexture = function () {
        var _this = this;
        setTimeout(function () {
            _this._floorNode.destroy();
            _this._cubeNode.destroy();
            _this._tableNode.destroy();
        }, 5000);
        setTimeout(function () {
            _this._floorNode.url = "res/ground.jpg";
            _this._cubeNode.url = "res/wicker.jpg";
            _this._tableNode.url = "res/wood.jpg";
        }, 7000);
    };
    Scene3D.prototype.readyDraw = function (time) {
        _super.prototype.readyDraw.call(this, time);
        this._skybox.readyDraw(time);
        this._cameraView.readyDraw(time);
    };
    return Scene3D;
}(Scene_1.default));
exports.default = Scene3D;
//# sourceMappingURL=Scene3D.js.map