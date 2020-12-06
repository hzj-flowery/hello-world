"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G_CameraModel = exports.CameraModel = void 0;
var Device_1 = require("../../../Device");
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
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
/**
 *
 */
var Graphic = /** @class */ (function () {
    function Graphic(gl) {
        this.vert = 'attribute vec4 a_position;' +
            'attribute vec4 a_color;' +
            'uniform mat4 u_worldViewProjection;' +
            'varying vec4 v_color;' +
            'void main() {' +
            'gl_Position = u_worldViewProjection * a_position;' +
            'gl_PointSize = 5.0;' +
            'v_color = a_color;' +
            '}';
        this.frag = 'precision mediump float;' +
            'uniform vec4 u_color;' +
            'varying vec4 v_color;' +
            'void main() {' +
            'gl_FragColor = u_color * v_color;' +
            '}';
        this._coordinateArrays = {
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
                1, 1, 0, 0 // 13
            ],
            indices: [
                4, 1, 5, 2, 6, 3, 1, 7, 2, 8, 3, 9, 10, 11 //11 12 13
            ]
        };
        this._pointArrays = {
            position: [
                0, 0, 0,
                1, 0, 0,
                0, 1, 0,
                0, 0, 1 //11
            ],
            color: [
                0, 0, 0, 1,
                1, 0, 0, 1,
                0, 1, 0, 1,
                0, 0, 1, 1
            ]
        };
        this.gl = gl;
        this.init();
    }
    Graphic.prototype.init = function () {
        var scale = 6;
        for (var j = 0; j < this._coordinateArrays.position.length; j++) {
            this._coordinateArrays.position[j] = this._coordinateArrays.position[j] * scale;
        }
        this._pointBufferInfor = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(this._pointArrays);
        //创建shader
        this._programInfor = Shader_1.G_ShaderFactory.createProgramInfo(this.vert, this.frag);
        //创建attribuffer
        this._coordinateBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(this._coordinateArrays);
    };
    /**
     * 绘制世界坐标系
     * 你想在上面位置来观察世界坐标系
     * @param proj 投影矩阵
     * @param camera 相机矩阵
     * @param world 世界矩阵  当前模型中的点需要乘以这个矩阵转换到世界坐标系下
     *
     */
    Graphic.prototype.drawLine = function (proj, camera, world) {
        if (world === void 0) { world = Matrix_1.glMatrix.mat4.identity(null); }
        var view = Matrix_1.glMatrix.mat4.invert(null, camera);
        var pv = Matrix_1.glMatrix.mat4.multiply(null, proj, view);
        Matrix_1.glMatrix.mat4.multiply(pv, pv, world);
        this.gl.useProgram(this._programInfor.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._coordinateBufferInfo);
        Shader_1.G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_worldViewProjection: pv });
        Shader_1.G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_color: [1, 1, 1, 1] });
        Shader_1.G_ShaderFactory.drawBufferInfo(this._coordinateBufferInfo, this.gl.LINES);
    };
    Graphic.prototype.updatePoint = function () {
        var change = 0.1;
        this._pointArrays.position[3] = this._pointArrays.position[3] + change; //眼睛的位置
        this._pointArrays.position[7] = this._pointArrays.position[7] + change;
        this._pointArrays.position[11] = this._pointArrays.position[11] + change;
        this._pointBufferInfor = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(this._pointArrays);
    };
    Graphic.prototype.drawPoint = function (proj, camera, world) {
        if (world === void 0) { world = Matrix_1.glMatrix.mat4.identity(null); }
        this.updatePoint();
        var view = Matrix_1.glMatrix.mat4.invert(null, camera);
        var vp = Matrix_1.glMatrix.mat4.multiply(null, proj, view);
        Matrix_1.glMatrix.mat4.multiply(vp, vp, world);
        this.gl.useProgram(this._programInfor.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._pointBufferInfor);
        Shader_1.G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_worldViewProjection: vp });
        Shader_1.G_ShaderFactory.setUniforms(this._programInfor.uniSetters, { u_color: [1, 1, 1, 1] });
        Shader_1.G_ShaderFactory.drawBufferInfo(this._pointBufferInfor, this.gl.POINTS);
    };
    return Graphic;
}());
var CameraModel = /** @class */ (function () {
    function CameraModel() {
        // uniforms.
        this.sharedUniforms = {};
        this._frustumCubeUniforms = {
            u_color: [1, 1, 1, 0.4],
            u_worldViewProjection: new Float32Array(16),
            u_exampleWorldViewProjection: new Float32Array(16),
        };
        this.solidcolorvertexshader = 'attribute vec4 a_position;' +
            'uniform mat4 u_matrix;' +
            'void main() {' +
            'gl_Position = u_matrix * a_position;' +
            '}';
        this.solidcolorfragmentshader = 'precision mediump float;' +
            'uniform vec4 u_color;' +
            'void main() {' +
            'gl_FragColor = u_color;' +
            '}';
        this._sceneCameraPosition = [-70, 10, 10];
        //------------------------------ui-------------------------------------------------------------------------------------
        this.settings = {
            posX: 0,
            posY: 0,
            posZ: 0,
            rotation: 150,
            cam1FieldOfView: 60,
            cam1PosX: 0,
            cam1PosY: 0,
            cam1PosZ: 20,
            cam1RotX: 0,
            cam1RotY: 0,
            cam1RotZ: 0,
            cam1Near: 1,
            cam1Far: 200,
            cam1Ortho: false,
            cam1OrthoUnits: 120,
        };
    }
    CameraModel.prototype.init = function (gl) {
        this.gl = gl;
        this._programInfor = Shader_1.G_ShaderFactory.createProgramInfo(this.solidcolorvertexshader, this.solidcolorfragmentshader);
        this._frustumCube = Shader_1.G_ShaderFactory.createProgramInfo(baseVertexShader, colorFragmentShader);
        this._modelBuffer = this.createCameraBufferInfo();
        this._clipSpaceBuffer = this.createClipspaceCubeBufferInfo();
        this._coordinate = new Graphic(this.gl); //绘制线
        this._worldTemp = Matrix_1.glMatrix.mat4.identity(null);
        this._worldTemp1 = Matrix_1.glMatrix.mat4.identity(null);
        this._worldTemp2 = Matrix_1.glMatrix.mat4.identity(null);
        this._loacalInvertProj = Matrix_1.glMatrix.mat4.identity(null);
        this._pvTemp1 = Matrix_1.glMatrix.mat4.identity(null);
        this._viewMatrix = Matrix_1.glMatrix.mat4.identity(null);
        this._sceneCameraMatrix = Matrix_1.glMatrix.mat4.identity(null);
        this._sceneCameraProjectMatrix = Matrix_1.glMatrix.mat4.identity(null);
        this._originPos = [0, 0, 0];
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
        var cubeArrays = Primitives_1.syPrimitives.createCubeVertices(2);
        delete cubeArrays.normal;
        delete cubeArrays.texcoord;
        cubeArrays.color = colorVerts;
        this._cubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);
        //场景摄像机
        this.setSceneCamera();
        //UI
        this.setUI();
    };
    CameraModel.prototype.createClipspaceCubeBufferInfo = function () {
        // first let's add a cube. It goes from 1 to 3
        // because cameras look down -Z so we want
        // the camera to start at Z = 0. We'll put a
        // a cone in front of this cube opening
        // toward -Z
        var positions = [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            0, 0, -1,
            0, 0, 1 //前节点 9
        ];
        var indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
            8, 9, 9, 8
        ];
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays({
            position: positions,
            indices: indices,
        });
    };
    // create geometry for a camera
    CameraModel.prototype.createCameraBufferInfo = function (scale) {
        if (scale === void 0) { scale = 1; }
        // first let's add a cube. It goes from 1 to 3
        // because cameras look down -Z so we want
        // the camera to start at Z = 0.
        // We'll put a cone in front of this cube opening
        // toward -Z
        var positions = [
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            -1, -1, 3,
            1, -1, 3,
            -1, 1, 3,
            1, 1, 3,
            0, 0, 1,
        ];
        var indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        // add cone segments
        var numSegments = 6;
        var coneBaseIndex = positions.length / 3;
        var coneTipIndex = coneBaseIndex - 1;
        for (var i = 0; i < numSegments; ++i) {
            var u = i / numSegments;
            var angle = u * Math.PI * 2;
            var x = Math.cos(angle);
            var y = Math.sin(angle);
            positions.push(x, y, 0);
            // line from tip to edge
            indices.push(coneTipIndex, coneBaseIndex + i);
            // line from point on edge to next point on edge
            indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
        }
        positions.forEach(function (v, ndx) {
            positions[ndx] *= scale;
        });
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays({
            position: positions,
            indices: indices,
        });
    };
    /**
    * 这个函数的目的就是用一个相机去看目标相机
    * 目标相机有两个东西要绘制 一个是相机模型 一个是齐次裁切空间
    * @param targetProjMatrix 目标摄像机的投影矩阵
    * @param targetCameraMatrix 目标摄像机的相机矩阵
    */
    CameraModel.prototype.draw = function (targetProjMatrix, targetCameraMatrix) {
        /**
         * 本地相机的投影矩阵和节点矩阵
         */
        var projMatrix = this._sceneCameraProjectMatrix;
        var cameraMatrix = this._sceneCameraMatrix;
        var gl = this.gl;
        // draw object to represent first camera
        // Make a view matrix from the camera matrix.
        Matrix_1.glMatrix.mat4.invert(this._viewMatrix, cameraMatrix);
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp1, projMatrix, this._viewMatrix); //投影矩阵X视口矩阵
        // use the first's camera's matrix as the matrix to position
        // the camera's representative in the scene
        //可以这么理解，第一台摄像机上的点乘以它得相机矩阵，可以将位置转换到世界坐标系下
        //通过世界坐标系这个枢纽，再将点转换到其他的视口坐标系下，进行投影
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp1, this._worldTemp1, targetCameraMatrix); //投影矩阵xs视口矩阵x第一个摄像机的相机矩阵
        gl.useProgram(this._programInfor.spGlID);
        // ------ Draw the Camera Representation --------绘制相机模型
        // Setup all the needed attributes.
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._modelBuffer);
        // Set the uniforms
        Shader_1.G_ShaderFactory.setUniforms(this._programInfor.uniSetters, {
            u_matrix: this._worldTemp1,
            u_color: [1, 0, 0, 1],
        });
        Shader_1.G_ShaderFactory.drawBufferInfo(this._modelBuffer, gl.LINES);
        // ----- Draw the frustum ------- 绘制齐次裁切空间坐标系
        //一个正方体乘以这个矩阵的逆矩阵可以变成一个棱台
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp1, this._worldTemp1, Matrix_1.glMatrix.mat4.invert(null, targetProjMatrix));
        // Setup all the needed attributes.
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this._programInfor.attrSetters, this._clipSpaceBuffer);
        // Set the uniforms
        Shader_1.G_ShaderFactory.setUniforms(this._programInfor.uniSetters, {
            u_matrix: this._worldTemp1,
            u_color: [0, 1, 0, 1],
        });
        Shader_1.G_ShaderFactory.drawBufferInfo(this._clipSpaceBuffer, gl.LINES);
        //原点
        Matrix_1.glMatrix.mat4.identity(this._worldTemp2);
        //转换到相机坐标系下
        //你可以理解为相机中的点乘以相机坐标系可以转换到世界坐标系
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp2, this._worldTemp2, targetCameraMatrix); //投影矩阵xs视口矩阵x第一个摄像机的相机矩阵
        this._coordinate.drawLine(projMatrix, cameraMatrix, this._worldTemp2);
        this._coordinate.drawLine(projMatrix, cameraMatrix);
        this._coordinate.drawPoint(projMatrix, cameraMatrix, this._worldTemp2);
        this._coordinate.drawPoint(projMatrix, cameraMatrix);
        //绘制棱台
        // this.drawFrustumCube(projMatrix, cameraMatrix, targetProjMatrix, targetCameraMatrix);
    };
    // Draw Frustum Cube behind
    CameraModel.prototype.drawFrustumCube = function (projMatrix, cameraMatrix, targetProjMatrix, targetCameraMatrix) {
        //绘制齐次裁切空间 六个面
        Matrix_1.glMatrix.mat4.invert(this._viewMatrix, cameraMatrix);
        Matrix_1.glMatrix.mat4.multiply(this._pvTemp1, projMatrix, this._viewMatrix);
        Matrix_1.glMatrix.mat4.multiply(this._pvTemp1, this._pvTemp1, targetCameraMatrix);
        Matrix_1.glMatrix.mat4.invert(this._loacalInvertProj, targetProjMatrix);
        var gl = this.gl;
        Device_1.default.Instance.cullFace(false);
        gl.useProgram(this._frustumCube.spGlID);
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(this._frustumCube.attrSetters, this._cubeBufferInfo);
        Matrix_1.glMatrix.mat4.translation(this._worldTemp, this._originPos[0], this._originPos[1], this._originPos[2]);
        Matrix_1.glMatrix.mat4.multiply(this._worldTemp, this._loacalInvertProj, this._worldTemp);
        Matrix_1.glMatrix.mat4.multiply(this._frustumCubeUniforms.u_worldViewProjection, this._pvTemp1, this._worldTemp); //pvm
        Shader_1.G_ShaderFactory.setUniforms(this._frustumCube.uniSetters, this.sharedUniforms);
        Shader_1.G_ShaderFactory.setUniforms(this._frustumCube.uniSetters, this._frustumCubeUniforms);
        Shader_1.G_ShaderFactory.drawBufferInfo(this._cubeBufferInfo);
        Device_1.default.Instance.closeCullFace();
    };
    CameraModel.prototype.setSceneCameraPosition = function (pos) {
        this._sceneCameraPosition = pos;
        this.setSceneCamera();
    };
    CameraModel.prototype.setSceneCamera = function () {
        var gl = this.gl;
        var effectiveWidth = gl.canvas.width / 2;
        var aspect = effectiveWidth / gl.canvas.height;
        var near = 1;
        var far = 2000;
        Matrix_1.glMatrix.mat4.perspective(this._sceneCameraProjectMatrix, MathUtils_1.MathUtils.degToRad(60), aspect, near, far);
        // Compute the camera's matrix using look at.
        var cameraPosition2 = this._sceneCameraPosition;
        var target2 = [0, 0, 0];
        var up2 = [0, 1, 0];
        Matrix_1.glMatrix.mat4.lookAt2(this._sceneCameraMatrix, cameraPosition2, target2, up2);
    };
    CameraModel.prototype.getSceneCameraMatrix = function () {
        return this._sceneCameraMatrix;
    };
    CameraModel.prototype.getSceneProjectMatrix = function () {
        return this._sceneCameraProjectMatrix;
    };
    // //初始化UI
    CameraModel.prototype.setUI = function () {
        var render = this.render.bind(this);
        var webglLessonsUI = window["webglLessonsUI"];
        webglLessonsUI.setupUI(document.querySelector('#ui'), this.settings, [
            { type: 'slider', key: 'rotation', min: 0, max: 360, change: render, precision: 2, step: 0.001, },
            { type: 'slider', key: 'posX', min: -200, max: 200, change: render, },
            { type: 'slider', key: 'posY', min: -200, max: 200, change: render, },
            { type: 'slider', key: 'posZ', min: -200, max: 200, change: render, },
            { type: 'slider', key: 'cam1FieldOfView', min: 0, max: 180, change: render, },
            { type: 'slider', key: 'cam1PosX', min: -100, max: 100, change: render, },
            { type: 'slider', key: 'cam1PosY', min: -100, max: 100, change: render, },
            { type: 'slider', key: 'cam1PosZ', min: -100, max: 200, change: render, },
            { type: 'slider', key: 'cam1RotX', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam1RotY', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam1RotZ', min: 0, max: 360, change: render, },
            { type: 'slider', key: 'cam1Near', min: 1, max: 300, change: render, },
            { type: 'slider', key: 'cam1Far', min: 1, max: 300, change: render, },
            { type: 'checkbox', key: 'cam1Ortho', change: render, },
            { type: 'slider', key: 'cam1OrthoUnits', min: 1, max: 150, change: render, },
        ]);
        this.render();
    };
    CameraModel.prototype.render = function () {
        if (this._renderCallBack)
            this._renderCallBack(this.settings);
    };
    CameraModel.prototype.setRenderCallBack = function (cb) {
        this._renderCallBack = cb;
    };
    CameraModel.prototype.getSettings = function () {
        return this.settings;
    };
    return CameraModel;
}());
exports.CameraModel = CameraModel;
exports.G_CameraModel = new CameraModel();
//# sourceMappingURL=CameraModel.js.map