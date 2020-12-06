"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 <div class="description" style="position: absolute;left: 750px; top:10px;color:crimson">
        Drag sliders to change the frustum.
        </div>
        <div style="position:absolute;">
          <img id="eye" src="resources/eye-icon.png" style="position: absolute; z-index:2; left: 10px; top: 275px; width: 32px; height: auto;"/>
        </div>
        <div id="uiContainer" style="position: absolute;left: 750px; top:30px;color: blue;">
          <div id="ui">
            <div id="cameraPosX"></div>
            <div id="cameraPosY"></div>
            <div id="cameraPosZ"></div>
            <div id="cameraRotateX"></div>
            <div id="cameraRotateY"></div>
            <div id="cameraRotateZ"></div>
            <div id="fieldOfView"></div>
            <div id="zNear"></div>
            <div id="zFar"></div>
            <div id="zPosition"></div>
          </div>
        </div>
 */
var Device_1 = require("../../../Device");
var Matrix_1 = require("../../Matrix");
var Primitives_1 = require("../shader/Primitives");
var Shader_1 = require("../shader/Shader");
var vertexColorVertexShader = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_worldViewProjection;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
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
var darkColors = {
    lines: [1, 1, 1, 1],
};
var lightColors = {
    lines: [0, 0, 0, 1],
};
var fBufferInfoData = {
    position: [
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,
        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,
        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,
        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,
        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,
        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,
        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,
        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,
        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,
        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,
        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,
        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,
        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,
        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,
        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,
        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0,
    ],
    color: {
        numComponents: 3,
        data: new Uint8Array([
            // left column front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            // top rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            // middle rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            // left column back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            // top rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            // middle rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            // top
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            // top rung right
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            // under top rung
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            // between top rung and middle
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            // top of middle rung
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            // right of middle rung
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
        ]),
    },
};
var darkMatcher = window.matchMedia("(prefers-color-scheme: dark)");
var isDarkMode = darkMatcher.matches;
var colors = isDarkMode ? darkColors : lightColors;
var eyeElem = document.querySelector("#eye");
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
        0, 4, 1, 5, 2, 6, 3, 7,
    ],
};
// globals
var pixelRatio = window.devicePixelRatio || 1;
var scale = 1;
function px(v) {
    return (v | 0) + "px";
}
function degToRad(deg) {
    return deg * Math.PI / 180;
}
function lerp(a, b, l) {
    return a + (b - a) * l;
}
var StageTest = /** @class */ (function () {
    function StageTest() {
        // uniforms.
        this.sharedUniforms = {};
        this.sceneCubeUniforms = {
            u_color: [1, 1, 1, 1],
            u_worldViewProjection: new Float32Array(16),
            u_exampleWorldViewProjection: new Float32Array(16),
        };
        this.frustumCubeUniforms = {
            u_color: [1, 1, 1, 0.4],
            u_worldViewProjection: new Float32Array(16),
            u_exampleWorldViewProjection: new Float32Array(16),
        };
        this.cubeRaysUniforms = {
            u_color: colors.lines,
            u_worldViewProjection: new Float32Array(16),
        };
        this.wireFrustumUniforms = {
            u_color: colors.lines,
            u_worldViewProjection: new Float32Array(16),
        };
        this.zNear = 10; //相机最近能看到的距离
        this.zFar = 50; //相机最远能看到的距离
        this.fieldOfView = 30; //相机张开的角度
        this.zPosition = -25; //场景的位置
        this.v3t0 = new Float32Array(3);
        this.targetToEye = new Float32Array(3);
        this.eyePosition = new Float32Array([31, 17, 15]); //相机的位置
        this.eyeRotation = new Float32Array([0, 0, 0]); //相机的旋转
        this.target = new Float32Array([23, 16, 0]);
        this.up = new Float32Array([0, 1, 0]);
        this.viewProjection = new Float32Array(16);
        this.gl = Device_1.default.Instance.gl;
    }
    StageTest.run = function () {
        new StageTest().start();
    };
    // Setup a ui.
    StageTest.prototype.updateFieldOfView = function (event, ui) {
        this.fieldOfView = ui.value;
    };
    StageTest.prototype.updateZNear = function (event, ui) {
        this.zNear = ui.value;
    };
    StageTest.prototype.updateZFar = function (event, ui) {
        this.zFar = ui.value;
    };
    StageTest.prototype.updateZPosition = function (event, ui) {
        this.zPosition = ui.value;
    };
    StageTest.prototype.updateCamearXPos = function (event, ui) {
        this.eyePosition[0] = ui.value;
    };
    StageTest.prototype.updateCamearYPos = function (event, ui) {
        this.eyePosition[1] = ui.value;
    };
    StageTest.prototype.updateCamearZPos = function (event, ui) {
        this.eyePosition[2] = ui.value;
    };
    StageTest.prototype.updateCamearXRotation = function (event, ui) {
        this.eyeRotation[0] = degToRad(ui.value);
    };
    StageTest.prototype.updateCamearYRotation = function (event, ui) {
        this.eyeRotation[1] = degToRad(ui.value);
    };
    StageTest.prototype.updateCamearZRotation = function (event, ui) {
        this.eyeRotation[2] = degToRad(ui.value);
    };
    StageTest.prototype.initData = function () {
        this.zNear = 10;
        this.zFar = 50;
        this.zPosition = -25;
    };
    StageTest.prototype.start = function () {
        this.vertexColorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(vertexColorVertexShader, vertexColorFragmentShader);
        this.colorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
        this.cubeRaysBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeRaysArrays);
        this.wireCubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(wireCubeArrays);
        var cubeArrays = Primitives_1.syPrimitives.createCubeVertices(2);
        delete cubeArrays.normal;
        delete cubeArrays.texcoord;
        cubeArrays.color = colorVerts;
        this.cubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);
        this.fBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(fBufferInfoData);
        this.aspect = this.gl.canvas.width / (this.gl.canvas.width / 2);
        this.setUI();
        requestAnimationFrame(this.render.bind(this));
    };
    StageTest.prototype.render = function (time) {
        time *= 0.001;
        this.adjustCamera();
        this.drawScene(time, this.viewProjection, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
        //绘制齐次裁切空间 六个面
        this.drawFrustumCube(this.viewProjection, this.colorProgramInfo, this.cubeBufferInfo);
        //绘制四条射线
        this.drawViewCone(this.viewProjection, this.vertexColorProgramInfo, this.cubeRaysBufferInfo);
        //绘制四个金属线
        this.drawFrustumWire(this.viewProjection, this.vertexColorProgramInfo, this.wireCubeBufferInfo);
        this.draw3DView(time);
        requestAnimationFrame(this.render.bind(this));
    };
    StageTest.prototype.setUI = function () {
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
    StageTest.prototype.adjustCamera = function () {
        Matrix_1.glMatrix.vec3.subtract(this.targetToEye, this.eyePosition, this.target);
        var gl = this.gl;
        Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas, pixelRatio);
        var halfHeight = gl.canvas.height / 2;
        var width = gl.canvas.width;
        var proj = Matrix_1.glMatrix.mat4.create();
        var view = new Float32Array(16);
        // clear the screen.
        gl.disable(gl.SCISSOR_TEST);
        gl.colorMask(true, true, true, true);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, halfHeight, width, halfHeight);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        Matrix_1.glMatrix.mat4.perspective(proj, degToRad(60), this.aspect, 1, 5000);
        var f = Math.max(30, this.fieldOfView) - 30;
        f = f / (179 - 30);
        f = f * f * f * f;
        f = lerp(1, 179 * 0.9, f);
        // f = 1;
        Matrix_1.glMatrix.vec3.scale(this.v3t0, this.targetToEye, f);
        Matrix_1.glMatrix.vec3.add(this.v3t0, this.target, this.v3t0);
        Matrix_1.glMatrix.mat4.lookAt(view, this.v3t0, //eyePosition,
        this.target, this.up);
        Matrix_1.glMatrix.mat4.rotateX(view, view, this.eyeRotation[0]);
        Matrix_1.glMatrix.mat4.rotateY(view, view, this.eyeRotation[1]);
        Matrix_1.glMatrix.mat4.rotateZ(view, view, this.eyeRotation[2]);
        // glMatrix.mat4.invert(view, view);
        //算出视图投影矩阵
        Matrix_1.glMatrix.mat4.multiply(this.viewProjection, proj, view);
    };
    // Draw view cone.
    //绘制齐次裁切空间的四条射线
    StageTest.prototype.drawViewCone = function (vp, sd, buffAttr) {
        var halfHeight = this.gl.canvas.height / 2;
        var width = this.gl.canvas.width;
        var proj = Matrix_1.glMatrix.mat4.create();
        var worldTemp = Matrix_1.glMatrix.mat4.create();
        Matrix_1.glMatrix.mat4.perspective(proj, degToRad(this.fieldOfView), this.aspect, 1, 5000);
        Matrix_1.glMatrix.mat4.invert(proj, proj);
        Matrix_1.glMatrix.mat4.translation(worldTemp, 0, 0, 0);
        Matrix_1.glMatrix.mat4.multiply(worldTemp, worldTemp, proj);
        Matrix_1.glMatrix.mat4.scale(worldTemp, worldTemp, [scale, scale, scale]);
        Matrix_1.glMatrix.mat4.multiply(this.cubeRaysUniforms.u_worldViewProjection, vp, worldTemp);
        this.gl.useProgram(sd.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(sd.attrSetters, buffAttr);
        Shader_1.G_ShaderFactory.setUniforms(sd.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(sd.uniSetters, this.cubeRaysUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(buffAttr, this.gl.LINES);
        var eyePosition = Matrix_1.glMatrix.mat4.transformPoint(null, this.cubeRaysUniforms.u_worldViewProjection, [0, 0, 0]);
        var ex = (eyePosition[0] * .5 + .5) * width / pixelRatio;
        var ey = (eyePosition[1] * -.5 + .5) * halfHeight / pixelRatio;
        eyeElem.style.left = px(ex - eyeElem.width / 2);
        eyeElem.style.top = px(ey - eyeElem.height / 2);
    };
    // Draw Frustum Wire
    //绘制齐次裁切空间远近平面的边缘线
    StageTest.prototype.drawFrustumWire = function (vp, sdData, buffAttrData) {
        var worldTemp = Matrix_1.glMatrix.mat4.create();
        var proj = Matrix_1.glMatrix.mat4.create();
        Matrix_1.glMatrix.mat4.perspective(proj, degToRad(this.fieldOfView), this.aspect, this.zNear, this.zFar * scale);
        Matrix_1.glMatrix.mat4.invert(proj, proj);
        Matrix_1.glMatrix.mat4.translation(worldTemp, 0, 0, 0);
        Matrix_1.glMatrix.mat4.multiply(worldTemp, worldTemp, proj);
        Matrix_1.glMatrix.mat4.scale(worldTemp, worldTemp, [scale, scale, scale]);
        Matrix_1.glMatrix.mat4.multiply(this.wireFrustumUniforms.u_worldViewProjection, vp, worldTemp);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(sdData.attrSetters, buffAttrData);
        Shader_1.G_ShaderFactory.setUniforms(sdData.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(sdData.uniSetters, this.wireFrustumUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(buffAttrData, this.gl.LINES);
    };
    // Draw scene
    StageTest.prototype.drawScene = function (time, vp, exProjection, shaderD, buffAttData) {
        Device_1.default.Instance.cullFace(false);
        var worldTemp = Matrix_1.glMatrix.mat4.create();
        this.gl.useProgram(shaderD.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
        var cubeScale = scale * 3;
        for (var ii = -1; ii <= 1; ++ii) {
            Matrix_1.glMatrix.mat4.translation(worldTemp, ii * 10, 0, this.zPosition);
            // glMatrix.mat4.rotateY(worldTemp, worldTemp, time + ii * Math.PI / 6);
            // glMatrix.mat4.rotateX(worldTemp, worldTemp, Math.PI / 4);
            // glMatrix.mat4.rotateZ(worldTemp, worldTemp, Math.PI / 4);
            Matrix_1.glMatrix.mat4.scale(worldTemp, worldTemp, [cubeScale, cubeScale, cubeScale]);
            Matrix_1.glMatrix.mat4.multiply(this.sceneCubeUniforms.u_worldViewProjection, vp, worldTemp);
            Matrix_1.glMatrix.mat4.multiply(this.sceneCubeUniforms.u_exampleWorldViewProjection, exProjection, worldTemp);
            Shader_1.G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sceneCubeUniforms);
            Shader_1.G_ShaderFactory.drawBufferInfo(buffAttData);
        }
        // var rotation = [degToRad(40), degToRad(25), degToRad(325)];
        // glMatrix.mat4.translation(worldTemp, 45, 150, 0);
        // glMatrix.mat4.rotateX(worldTemp, worldTemp, rotation[0]);
        // glMatrix.mat4.rotateY(worldTemp, worldTemp, rotation[1]);
        // glMatrix.mat4.rotateZ(worldTemp, worldTemp, rotation[2]);
        // glMatrix.mat4.multiply(this.sceneCubeUniforms.u_worldViewProjection, vp, worldTemp);
        // glMatrix.mat4.multiply(this.sceneCubeUniforms.u_exampleWorldViewProjection, exProjection, worldTemp);
        // G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, this.fBufferInfo);
        // G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sceneCubeUniforms);
        // G_ShaderFactory.drawBufferInfo(this.fBufferInfo);
        Device_1.default.Instance.closeCullFace();
    };
    // Draw Frustum Cube behind
    StageTest.prototype.drawFrustumCube = function (vp, shaderD, buffAttData) {
        var gl = this.gl;
        Device_1.default.Instance.cullFace(false);
        var worldTemp = Matrix_1.glMatrix.mat4.create();
        var tempProj = Matrix_1.glMatrix.mat4.create();
        gl.useProgram(shaderD.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
        Matrix_1.glMatrix.mat4.perspective(tempProj, degToRad(this.fieldOfView), this.aspect, this.zNear, this.zFar * scale);
        Matrix_1.glMatrix.mat4.invert(tempProj, tempProj);
        Matrix_1.glMatrix.mat4.translation(worldTemp, 0, 0, 0);
        Matrix_1.glMatrix.mat4.multiply(worldTemp, tempProj, worldTemp);
        Matrix_1.glMatrix.mat4.scale(worldTemp, worldTemp, [scale, scale, scale]);
        Matrix_1.glMatrix.mat4.multiply(this.frustumCubeUniforms.u_worldViewProjection, vp, worldTemp);
        Shader_1.G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(shaderD.uniSetters, this.frustumCubeUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(buffAttData);
        Device_1.default.Instance.closeCullFace();
    };
    // Draw 3D view
    StageTest.prototype.draw3DView = function (time) {
        var halfHeight = this.gl.canvas.height / 2;
        var width = this.gl.canvas.width;
        var gl = this.gl;
        gl.enable(gl.SCISSOR_TEST);
        gl.viewport(0, 0, width, halfHeight);
        gl.scissor(0, 0, width, halfHeight);
        gl.clearColor(0.5, 0.5, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var proj = Matrix_1.glMatrix.mat4.create();
        Matrix_1.glMatrix.mat4.perspective(proj, degToRad(this.fieldOfView), this.aspect, this.zNear, this.zFar * scale);
        // this.drawScene(time, proj as Float32Array, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
        this.drawScene(time, this.viewProjection, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
    };
    return StageTest;
}());
exports.default = StageTest;
//# sourceMappingURL=StageTest.js.map