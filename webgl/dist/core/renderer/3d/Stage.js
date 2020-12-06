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
var MathUtils_1 = require("../../utils/MathUtils");
var CameraFrustum_1 = require("../camera/CameraFrustum");
var Primitives_1 = require("../shader/Primitives");
var Shader_1 = require("../shader/Shader");
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
var Stage = /** @class */ (function () {
    function Stage() {
        this.sceneCubeUniforms = {
            u_color: [1, 1, 1, 1],
            u_worldViewProjection: new Float32Array(16),
            u_exampleWorldViewProjection: new Float32Array(16),
        };
        this.zNear = 10; //相机最近能看到的距离
        this.zFar = 50; //相机最远能看到的距离
        this.fieldOfView = 30; //相机张开的角度
        this.zPosition = -25; //场景的位置
        this.yPosition = 0; //场景的位置
        this.xPosition = 0; //场景的位置
        this.v3t0 = new Float32Array(3);
        this.targetToEye = new Float32Array(3);
        this.eyePosition = new Float32Array([31, 17, 15]); //相机的位置
        this.eyeRotation = new Float32Array([0, 0, 0]); //相机的旋转
        this.target = new Float32Array([23, 16, 0]);
        // private target = new Float32Array([0,0,0]);
        this.up = new Float32Array([0, 1, 0]);
        this.viewProjection = new Float32Array(16);
        this.gl = Device_1.default.Instance.gl;
    }
    Stage.run = function () {
        new Stage().start();
    };
    Stage.prototype.start = function () {
        this.colorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
        var cubeArrays = Primitives_1.syPrimitives.createCubeVertices(2);
        delete cubeArrays.normal;
        delete cubeArrays.texcoord;
        cubeArrays.color = colorVerts;
        this.cubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);
        this.aspect = this.gl.canvas.width / (this.gl.canvas.width / 2);
        this._frustum = new CameraFrustum_1.CameraFrustum(this.gl);
        this._triggerRenderType = CameraFrustum_1.TriggerRenderType.Normal;
        this._frustum.setTriggerRenderCallBack(function (type) {
            // this._triggerRenderType = type;
        });
        requestAnimationFrame(this.render.bind(this));
    };
    Stage.prototype.render = function (time) {
        time = time * 0.001;
        var uiData = this._frustum.getUIData();
        this.fieldOfView = uiData.fieldOfView;
        this.zNear = uiData.zNear;
        this.zFar = uiData.zFar;
        this.zPosition = uiData.zPosition;
        this.yPosition = uiData.yPosition;
        this.xPosition = uiData.xPosition;
        this.eyeRotation = uiData.eyeRotation;
        this.eyePosition = uiData.eyePosition;
        this.target = uiData.target;
        this.adjustCamera();
        this.drawScene(time, this.viewProjection, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
        //----------------------------------------
        this._frustum.testDraw(this.viewProjection, this.aspect, this.zNear, this.zFar, this.fieldOfView);
        this.draw3DView(time);
        requestAnimationFrame(this.render.bind(this));
    };
    Stage.prototype.adjustCamera = function () {
        Matrix_1.glMatrix.vec3.subtract(this.targetToEye, this.eyePosition, this.target);
        var gl = this.gl;
        Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas, pixelRatio);
        var halfHeight = gl.canvas.height / 2;
        var width = gl.canvas.width;
        var proj = Matrix_1.glMatrix.mat4.create();
        var view = Matrix_1.glMatrix.mat4.identity(null);
        // clear the screen.
        gl.disable(gl.SCISSOR_TEST);
        gl.colorMask(true, true, true, true);
        gl.clearColor(0.9, 0.9, 0.9, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, halfHeight, width, halfHeight);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        Matrix_1.glMatrix.mat4.perspective(proj, MathUtils_1.MathUtils.degToRad(60), this.aspect, 1, 5000);
        var f = 1;
        Matrix_1.glMatrix.vec3.scale(this.v3t0, this.targetToEye, f);
        Matrix_1.glMatrix.vec3.add(this.v3t0, this.target, this.v3t0);
        // if(this._triggerRenderType==TriggerRenderType.Rotate)
        // {
        //   glMatrix.mat4.lookAt(view,this.v3t0, this.target,this.up);
        //   glMatrix.mat4.rotateX(view, view, this.eyeRotation[0]);
        //   glMatrix.mat4.rotateY(view, view, this.eyeRotation[1]);
        //   glMatrix.mat4.rotateZ(view, view, this.eyeRotation[2]);
        //   glMatrix.mat4.multiply(this.viewProjection, proj, view);
        //   glMatrix.mat4.invert(view, view);
        //   
        // }
        // else
        var worldMat = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.translation(worldMat, this.eyePosition[0], this.eyePosition[1], this.eyePosition[2]);
        // glMatrix.mat4.invert(worldMat, worldMat);
        var pv = Matrix_1.glMatrix.mat4.create();
        Matrix_1.glMatrix.mat4.multiply(pv, proj, worldMat); //pv
        Matrix_1.glMatrix.mat4.rotateX(view, view, this.eyeRotation[0]);
        Matrix_1.glMatrix.mat4.rotateY(view, view, this.eyeRotation[1]);
        Matrix_1.glMatrix.mat4.rotateZ(view, view, this.eyeRotation[2]);
        Matrix_1.glMatrix.mat4.invert(view, view);
        Matrix_1.glMatrix.mat4.multiply(this.viewProjection, pv, view);
        // console.log("平移------");
        //算出视图投影矩阵
        // 
    };
    // Draw scene
    Stage.prototype.drawScene = function (time, vp, exProjection, shaderD, buffAttData) {
        Device_1.default.Instance.cullFace(false);
        var worldTemp = Matrix_1.glMatrix.mat4.create();
        this.gl.useProgram(shaderD.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(shaderD.attrSetters, buffAttData);
        var cubeScale = 3;
        for (var ii = -1; ii <= 1; ++ii) {
            Matrix_1.glMatrix.mat4.translation(worldTemp, ii * 10, this.yPosition, this.zPosition);
            Matrix_1.glMatrix.mat4.rotateY(worldTemp, worldTemp, ii * Math.PI / 6);
            Matrix_1.glMatrix.mat4.rotateX(worldTemp, worldTemp, Math.PI / 4);
            Matrix_1.glMatrix.mat4.rotateZ(worldTemp, worldTemp, time + Math.PI / 4);
            Matrix_1.glMatrix.mat4.scale(worldTemp, worldTemp, [cubeScale, cubeScale, cubeScale]);
            Matrix_1.glMatrix.mat4.multiply(this.sceneCubeUniforms.u_worldViewProjection, vp, worldTemp);
            Matrix_1.glMatrix.mat4.multiply(this.sceneCubeUniforms.u_exampleWorldViewProjection, exProjection, worldTemp);
            Shader_1.G_ShaderFactory.setUniforms(shaderD.uniSetters, this.sceneCubeUniforms);
            Shader_1.G_ShaderFactory.drawBufferInfo(buffAttData);
        }
        Device_1.default.Instance.closeCullFace();
    };
    // Draw 3D view
    Stage.prototype.draw3DView = function (time) {
        var halfHeight = this.gl.canvas.height / 2;
        var width = this.gl.canvas.width;
        var gl = this.gl;
        gl.enable(gl.SCISSOR_TEST);
        gl.viewport(0, 0, width, halfHeight);
        gl.scissor(0, 0, width, halfHeight);
        gl.clearColor(0.5, 0.5, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var proj = Matrix_1.glMatrix.mat4.create();
        Matrix_1.glMatrix.mat4.perspective(proj, MathUtils_1.MathUtils.degToRad(this.fieldOfView), this.aspect, this.zNear, this.zFar);
        this.drawScene(time, proj, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
        // this.drawScene(time, this.viewProjection, new Float32Array(16), this.colorProgramInfo, this.cubeBufferInfo);
    };
    return Stage;
}());
exports.default = Stage;
//# sourceMappingURL=Stage.js.map