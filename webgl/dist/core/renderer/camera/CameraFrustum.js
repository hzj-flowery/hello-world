"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraFrustum = exports.TriggerRenderType = void 0;
var Device_1 = require("../../../Device");
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var Sprite_1 = require("../base/Sprite");
var Primitives_1 = require("../shader/Primitives");
var Shader_1 = require("../shader/Shader");
var vertexColorVertexShader = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_worldViewProjection;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'gl_PointSize = 10.0;' +
    'v_color = a_color;' +
    '}';
var vertexColorFragmentShader = 'precision mediump float;' +
    'uniform vec4 u_color;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = u_color * v_color;' +
    '}';
var baseVertexShader = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_worldViewProjection;' +
    'uniform mat4 u_exampleWorldViewProjection;' +
    'varying vec4 v_color;' +
    'varying vec4 v_position;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'v_position = u_exampleWorldViewProjection * a_position;' +
    'v_position = v_position / v_position.w;' +
    'v_color = a_color;' +
    '}';
var colorFragmentShader = 'precision mediump float;' +
    'varying vec4 v_color;' +
    'varying vec4 v_position;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'bool blend = (v_position.x < -1.0 || v_position.x > 1.0 ||' +
    'v_position.y < -1.0 || v_position.y > 1.0 ||' +
    'v_position.z < -1.0 || v_position.z > 1.0);' +
    'vec4 blendColor = blend ? vec4(0.35, 0.35, 0.35, 1.0) : vec4(1, 1, 1, 1);' +
    'gl_FragColor = v_color * u_color * blendColor;' +
    '}';
var darkColors = {
    lines: [1, 1, 1, 1],
};
var lightColors = {
    lines: [0, 0, 0, 1],
};
var darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");
var isDarkMode = darkMatcher.matches;
var colors = isDarkMode ? darkColors : lightColors;
var eyeElem = document.querySelector("#eye");
var worldCoordinateArrays = {
    position: [
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
        1.2, 0, 0,
        0, 1.2, 0,
        0, 0, 1.2,
        0, 0, 0, 0,
        0, 1, 1, 0
    ],
    color: [
        0, 0, 0, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        1, 1, 0, 0,
        1, 1, 0, 0 //13
    ],
    indices: [
        4, 1, 5, 2, 6, 3, 1, 7, 2, 8, 3, 9, 10, 11 //11 12 13
    ]
};
//要绘制的点的信息
var pointArrays = {
    position: [
        0, 0, 0,
    ],
    color: [
        0, 0, 0, 1
    ]
};
for (var j = 0; j < worldCoordinateArrays.position.length; j++) {
    worldCoordinateArrays.position[j] = worldCoordinateArrays.position[j] * 6;
}
var wireCubeArrays = {
    position: [
        -1, 1, -1,
        1, 1, -1,
        1, -1, -1,
        -1, -1, -1,
        -1, 1, 1,
        1, 1, 1,
        1, -1, 1,
        -1, -1, 1,
    ],
    color: [
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
    ],
    indices: [
        0, 1, 1, 2, 2, 3, 3, 0,
        4, 5, 5, 6, 6, 7, 7, 4,
        0, 4, 1, 5, 2, 6, 3, 7,
    ],
};
var tempColor = [
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 1, 1,
];
for (var j = 0; j < 4; j++)
    tempColor.push.apply(tempColor, colors.lines);
var cubeRaysArrays = {
    position: wireCubeArrays.position,
    color: tempColor,
    indices: [
        0, 4, 1, 5, 2, 6, 3, 7, 7, 3
    ],
};
var faceColors = [
    [1, 0, 0, 1,],
    [0, 1, 0, 1,],
    [1, 1, 0, 1,],
    [0, 0, 1, 1,],
    [1, 0, 1, 1,],
    [0, 1, 1, 1,],
];
var colorVerts = [];
for (var f = 0; f < 6; ++f) {
    for (var v = 0; v < 4; ++v) {
        colorVerts.push.apply(colorVerts, faceColors[f]);
    }
}
// globals
var pixelRatio = window.devicePixelRatio || 1;
var TriggerRenderType;
(function (TriggerRenderType) {
    TriggerRenderType[TriggerRenderType["Normal"] = 0] = "Normal";
    TriggerRenderType[TriggerRenderType["Trisform"] = 1] = "Trisform";
    TriggerRenderType[TriggerRenderType["Rotate"] = 2] = "Rotate";
    TriggerRenderType[TriggerRenderType["Scale"] = 3] = "Scale";
})(TriggerRenderType = exports.TriggerRenderType || (exports.TriggerRenderType = {}));
var CameraFrustum = /** @class */ (function (_super) {
    __extends(CameraFrustum, _super);
    function CameraFrustum(gl) {
        var _this = _super.call(this, gl) || this;
        _this.zNear = 10; //相机最近能看到的距离
        _this.zFar = 50; //相机最远能看到的距离
        _this.fieldOfView = 30; //相机张开的角度
        // uniforms.
        _this.sharedUniforms = {};
        _this.frustumCubeUniforms = {
            u_color: [1, 1, 1, 0.4],
            u_worldViewProjection: new Float32Array(16),
            u_exampleWorldViewProjection: new Float32Array(16),
        };
        _this.cubeRaysUniforms = {
            u_color: colors.lines,
            u_worldViewProjection: new Float32Array(16),
        };
        _this.wireFrustumUniforms = {
            u_color: colors.lines,
            u_worldViewProjection: new Float32Array(16),
        };
        _this.zPosition = -25;
        _this.yPosition = 0;
        _this.xPosition = 0;
        return _this;
    }
    CameraFrustum.create = function () {
        return new CameraFrustum(Device_1.default.Instance.gl);
    };
    // Setup a ui.
    CameraFrustum.prototype.updateFieldOfView = function (event, ui) {
        this.fieldOfView = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateZNear = function (event, ui) {
        this.zNear = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateZFar = function (event, ui) {
        this.zFar = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateZPosition = function (event, ui) {
        this.zPosition = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateYPosition = function (event, ui) {
        this.yPosition = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateXPosition = function (event, ui) {
        this.xPosition = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateCamearXPos = function (event, ui) {
        this.eyePosition[0] = ui.value;
        this.trigerRender(TriggerRenderType.Trisform);
    };
    CameraFrustum.prototype.updateCamearYPos = function (event, ui) {
        this.eyePosition[1] = ui.value;
        this.trigerRender(TriggerRenderType.Trisform);
    };
    CameraFrustum.prototype.updateCamearZPos = function (event, ui) {
        this.eyePosition[2] = ui.value;
        this.trigerRender(TriggerRenderType.Trisform);
    };
    CameraFrustum.prototype.updateTargetXPos = function (event, ui) {
        this.targetPosition[0] = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateTargetYPos = function (event, ui) {
        this.targetPosition[1] = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateTargetZPos = function (event, ui) {
        this.targetPosition[2] = ui.value;
        this.trigerRender(TriggerRenderType.Normal);
    };
    CameraFrustum.prototype.updateCamearXRotation = function (event, ui) {
        this.eyeRotation[0] = MathUtils_1.MathUtils.degToRad(ui.value);
        this.trigerRender(TriggerRenderType.Rotate);
    };
    CameraFrustum.prototype.updateCamearYRotation = function (event, ui) {
        this.eyeRotation[1] = MathUtils_1.MathUtils.degToRad(ui.value);
        this.trigerRender(TriggerRenderType.Rotate);
    };
    CameraFrustum.prototype.updateCamearZRotation = function (event, ui) {
        this.eyeRotation[2] = MathUtils_1.MathUtils.degToRad(ui.value);
        this.trigerRender(TriggerRenderType.Rotate);
    };
    //触发渲染
    CameraFrustum.prototype.trigerRender = function (type) {
        this._triggerCB && this._triggerCB(type);
    };
    CameraFrustum.prototype.getUIData = function () {
        return {
            fieldOfView: this.fieldOfView,
            zNear: this.zNear,
            zFar: this.zFar,
            zPosition: this.zPosition,
            yPosition: this.yPosition,
            xPosition: this.xPosition,
            target: this.targetPosition,
            eyePosition: this.eyePosition,
            eyeRotation: this.eyeRotation
        };
    };
    CameraFrustum.prototype.setTriggerRenderCallBack = function (cb) {
        this._triggerCB = cb;
    };
    CameraFrustum.prototype.setUI = function () {
        var webglLessonsUI = window["webglLessonsUI"];
        webglLessonsUI.setupSlider("#fieldOfView", { value: this.fieldOfView, slide: this.updateFieldOfView.bind(this), max: 179 });
        webglLessonsUI.setupSlider("#zNear", { value: this.zNear, slide: this.updateZNear.bind(this), min: 1, max: 50 });
        webglLessonsUI.setupSlider("#zFar", { value: this.zFar, slide: this.updateZFar.bind(this), min: 1, max: 50 });
        webglLessonsUI.setupSlider("#zPosition", { value: this.zPosition, slide: this.updateZPosition.bind(this), min: -100, max: 100 });
        webglLessonsUI.setupSlider("#yPosition", { value: this.yPosition, slide: this.updateYPosition.bind(this), min: -100, max: 100 });
        webglLessonsUI.setupSlider("#xPosition", { value: this.xPosition, slide: this.updateXPosition.bind(this), min: -100, max: 100 });
        webglLessonsUI.setupSlider("#cameraPosX", { value: this.eyePosition[0], slide: this.updateCamearXPos.bind(this), min: -50, max: 50 }); //31
        webglLessonsUI.setupSlider("#cameraPosY", { value: this.eyePosition[1], slide: this.updateCamearYPos.bind(this), min: -50, max: 50 }); //17
        webglLessonsUI.setupSlider("#cameraPosZ", { value: this.eyePosition[2], slide: this.updateCamearZPos.bind(this), min: -50, max: 50 }); //15
        webglLessonsUI.setupSlider("#targetX", { value: this.targetPosition[0], slide: this.updateTargetXPos.bind(this), min: -50, max: 50 }); //31
        webglLessonsUI.setupSlider("#targetY", { value: this.targetPosition[1], slide: this.updateTargetYPos.bind(this), min: -50, max: 50 }); //17
        webglLessonsUI.setupSlider("#targetZ", { value: this.targetPosition[2], slide: this.updateTargetZPos.bind(this), min: -50, max: 50 }); //15
        webglLessonsUI.setupSlider("#cameraRotateX", { value: this.eyeRotation[0], slide: this.updateCamearXRotation.bind(this), min: 0, max: 360 }); //31
        webglLessonsUI.setupSlider("#cameraRotateY", { value: this.eyeRotation[1], slide: this.updateCamearYRotation.bind(this), min: 0, max: 360 }); //17
        webglLessonsUI.setupSlider("#cameraRotateZ", { value: this.eyeRotation[2], slide: this.updateCamearZRotation.bind(this), min: 0, max: 360 }); //15
    };
    CameraFrustum.prototype.onInit = function () {
        this.vertexColorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(vertexColorVertexShader, vertexColorFragmentShader);
        this.colorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
        this.cubeRaysBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeRaysArrays);
        this.wireCubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(wireCubeArrays);
        this.coordinateBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(worldCoordinateArrays);
        this.pointArrays = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(pointArrays);
        var cubeArrays = Primitives_1.syPrimitives.createCubeVertices(2);
        delete cubeArrays.normal;
        delete cubeArrays.texcoord;
        cubeArrays.color = colorVerts;
        this.cubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);
        this.aspect = this.gl.canvas.width / (this.gl.canvas.width / 2);
        this.zFar = 50;
        this.zNear = 10;
        this.fieldOfView = 30;
        this._loacalInvertProj = Matrix_1.glMatrix.mat4.identity(null);
        this._localProj = Matrix_1.glMatrix.mat4.identity(null);
        this._localRayProj = Matrix_1.glMatrix.mat4.identity(null);
        this._loacalRayInvertProj = Matrix_1.glMatrix.mat4.identity(null);
        this._worldTemp = Matrix_1.glMatrix.mat4.identity(null);
        this._originPos = [0, 0, 0];
        this.eyePosition = new Float32Array([31, 17, 15]);
        this.eyeRotation = new Float32Array([0, 0, 0]);
        this.targetPosition = new Float32Array([0, 0, 0]);
        this.setUI();
    };
    //设置UI初始数据
    CameraFrustum.prototype.setUIInitData = function (eyePosition, eyeRotation, zNear, zFar, fieldOfView, zPosition, yPosition, xPosition) {
        this.zFar = zFar;
        this.zNear = zNear;
        this.fieldOfView = fieldOfView;
        this.eyePosition = eyePosition;
        this.eyeRotation = eyeRotation;
        this.zPosition = zPosition;
        this.yPosition = yPosition;
        this.xPosition = xPosition;
    };
    //更新本地投影矩阵
    CameraFrustum.prototype.updateLocalProj = function () {
        Matrix_1.glMatrix.mat4.perspective(this._localProj, MathUtils_1.MathUtils.degToRad(this.fieldOfView), this.aspect, this.zNear, this.zFar);
        Matrix_1.glMatrix.mat4.invert(this._loacalInvertProj, this._localProj);
        Matrix_1.glMatrix.mat4.perspective(this._localRayProj, MathUtils_1.MathUtils.degToRad(this.fieldOfView), this.aspect, 1, 50);
        Matrix_1.glMatrix.mat4.invert(this._loacalRayInvertProj, this._localRayProj);
    };
    CameraFrustum.prototype.testDraw = function (vp, aspect, zNear, zFar, fieldOfView) {
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;
        this.fieldOfView = fieldOfView;
        pointArrays.position[3] = this.eyePosition[0]; //眼睛的位置
        pointArrays.position[4] = this.eyePosition[1]; //眼睛的位置
        pointArrays.position[5] = this.eyePosition[2]; //眼睛的位置
        pointArrays.color[5] = 1;
        pointArrays.color[6] = 0;
        pointArrays.color[7] = 0;
        pointArrays.color[8] = 1;
        pointArrays.position[6] = this.targetPosition[0]; //看向的位置
        pointArrays.position[7] = this.targetPosition[1]; //看向的位置
        pointArrays.position[8] = this.targetPosition[2]; //看向的位置
        pointArrays.color[9] = 0;
        pointArrays.color[10] = 0;
        pointArrays.color[11] = 1;
        pointArrays.color[12] = 1;
        this.pointArrays = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(pointArrays);
        this.updateLocalProj();
        //绘制齐次裁切空间 六个面
        this.drawFrustumCube(vp, this.colorProgramInfo, this.cubeBufferInfo);
        //绘制四条射线
        this.drawViewCone(vp, this.vertexColorProgramInfo, this.cubeRaysBufferInfo);
        //绘制四个金属线
        this.drawFrustumWire(vp, this.vertexColorProgramInfo, this.wireCubeBufferInfo);
        this.drawWorldCoordinateSystem(vp);
        this.drawPoint(vp);
    };
    // Draw view cone.
    //绘制齐次裁切空间的四条射线
    CameraFrustum.prototype.drawViewCone = function (vp, sd, buffAttr) {
        var halfHeight = this.gl.canvas.height / 2;
        var width = this.gl.canvas.width;
        Matrix_1.glMatrix.mat4.translation(this._worldTemp, this._originPos[0], this._originPos[1], this._originPos[2]);
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp, this._worldTemp, this._loacalRayInvertProj);
        Matrix_1.glMatrix.mat4.multiply(this.cubeRaysUniforms.u_worldViewProjection, vp, this._worldTemp); //pvm
        this.gl.useProgram(sd.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(sd.attrSetters, buffAttr);
        Shader_1.G_ShaderFactory.setUniforms(sd.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(sd.uniSetters, this.cubeRaysUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(buffAttr, this.gl.LINES);
        var eyePosition = Matrix_1.glMatrix.mat4.transformPoint(null, this.cubeRaysUniforms.u_worldViewProjection, this._originPos);
        var ex = (eyePosition[0] * .5 + .5) * width / pixelRatio;
        var ey = (eyePosition[1] * -.5 + .5) * halfHeight / pixelRatio;
        eyeElem.style.left = MathUtils_1.MathUtils.px(ex - eyeElem.width / 2);
        eyeElem.style.top = MathUtils_1.MathUtils.px(ey - eyeElem.height / 2);
    };
    // Draw Frustum Wire
    //绘制齐次裁切空间远近平面的边缘线
    CameraFrustum.prototype.drawFrustumWire = function (vp, sdData, buffAttrData) {
        this.gl.useProgram(sdData.spGlID);
        Matrix_1.glMatrix.mat4.translation(this._worldTemp, this._originPos[0], this._originPos[1], this._originPos[2]);
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp, this._worldTemp, this._loacalInvertProj);
        Matrix_1.glMatrix.mat4.multiply(this.wireFrustumUniforms.u_worldViewProjection, vp, this._worldTemp); //pvm
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(sdData.attrSetters, buffAttrData);
        Shader_1.G_ShaderFactory.setUniforms(sdData.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(sdData.uniSetters, this.wireFrustumUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(buffAttrData, this.gl.LINES);
    };
    // Draw Frustum Cube behind
    CameraFrustum.prototype.drawFrustumCube = function (vp, shaderD, buffAttData) {
        var gl = this.gl;
        Device_1.default.Instance.cullFace(false);
        gl.useProgram(shaderD.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
        Matrix_1.glMatrix.mat4.translation(this._worldTemp, this._originPos[0], this._originPos[1], this._originPos[2]);
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp, this._loacalInvertProj, this._worldTemp);
        Matrix_1.glMatrix.mat4.multiply(this.frustumCubeUniforms.u_worldViewProjection, vp, this._worldTemp); //pvm
        Shader_1.G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(shaderD.uniSetters, this.frustumCubeUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(buffAttData);
        Device_1.default.Instance.closeCullFace();
    };
    //绘制相机坐标系
    CameraFrustum.prototype.drawWorldCoordinateSystem = function (vp) {
        this.gl.useProgram(this.vertexColorProgramInfo.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this.vertexColorProgramInfo.attrSetters, this.coordinateBufferInfo);
        Shader_1.G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters, { u_worldViewProjection: vp });
        Shader_1.G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters, { u_color: [1, 1, 1, 1] });
        Shader_1.G_ShaderFactory.drawBufferInfo(this.coordinateBufferInfo, this.gl.LINES);
        this.drawWorld();
    };
    //绘制世界坐标系
    CameraFrustum.prototype.drawWorld = function () {
        var world = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.scale(world, world, [0.1, 0.1, 0.1]);
        this.gl.useProgram(this.vertexColorProgramInfo.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this.vertexColorProgramInfo.attrSetters, this.coordinateBufferInfo);
        Shader_1.G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters, { u_worldViewProjection: world });
        Shader_1.G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters, { u_color: [1, 1, 1, 1] });
        Shader_1.G_ShaderFactory.drawBufferInfo(this.coordinateBufferInfo, this.gl.LINES);
    };
    CameraFrustum.prototype.drawPoint = function (vp) {
        var world = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.scale(world, world, [0.1, 0.1, 0.1]);
        this.gl.useProgram(this.vertexColorProgramInfo.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this.vertexColorProgramInfo.attrSetters, this.pointArrays);
        Shader_1.G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters, { u_worldViewProjection: world });
        Shader_1.G_ShaderFactory.setUniforms(this.vertexColorProgramInfo.uniSetters, { u_color: [1, 1, 1, 1] });
        Shader_1.G_ShaderFactory.drawBufferInfo(this.pointArrays, this.gl.POINTS);
    };
    return CameraFrustum;
}(Sprite_1.SY.SpriteBase));
exports.CameraFrustum = CameraFrustum;
//# sourceMappingURL=CameraFrustum.js.map