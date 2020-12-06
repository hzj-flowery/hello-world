"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var CameraData_1 = require("../data/CameraData");
var PointLight_1 = require("./PointLight");
function main() {
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    var FModel = new PointLight_1.PointLight();
    FModel.Url = "res/models/char/F.json";
    var fRotationRadians = 0;
    var cameraPoX = 100;
    var cameraPoY = 150;
    var cameraPoZ = 200;
    var shininess = 150;
    drawScene();
    // Setup a ui.
    var webglLessonsUI = window["webglLessonsUI"];
    webglLessonsUI.setupSlider("#fRotation", { value: MathUtils_1.MathUtils.radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#cameraPosX", { value: cameraPoX, slide: upateCamPosX, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#cameraPosY", { value: cameraPoY, slide: upateCamPosY, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#cameraPosZ", { value: cameraPoZ, slide: upateCamPosZ, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#shininess", { value: shininess, slide: updateShininess, min: 1, max: 300 });
    function updateRotation(event, ui) {
        fRotationRadians = ui.value;
        drawScene();
    }
    function upateCamPosX(event, ui) {
        cameraPoX = ui.value;
        drawScene();
    }
    function upateCamPosY(event, ui) {
        cameraPoY = ui.value;
        drawScene();
    }
    function upateCamPosZ(event, ui) {
        cameraPoZ = ui.value;
        drawScene();
    }
    function updateShininess(event, ui) {
        shininess = ui.value;
        drawScene();
    }
    //设置相机
    function setCamera() {
        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = Matrix_1.glMatrix.mat4.perspective(null, MathUtils_1.MathUtils.degToRad(60), aspect, zNear, zFar);
        cameraPoX = 0;
        cameraPoY = 0;
        // cameraPoZ = 100;
        // Compute the camera's matrix
        var cameraPos = [cameraPoX, cameraPoY, cameraPoZ];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        // var cameraMatrix = glMatrix.mat4.lookAt2(null, cameraPos, target, up);
        var cameraMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.translate(cameraMatrix, cameraMatrix, cameraPos);
        // Make a view matrix from the camera matrix.
        var viewMatrix = Matrix_1.glMatrix.mat4.invert(null, cameraMatrix);
        // Compute a view projection matrix
        var viewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix); //pv投影视口矩阵
        var worldMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);
        var ret = new CameraData_1.CameraData();
        ret.position = cameraPos;
        return ret;
    }
    // Draw the scene.
    function drawScene() {
        Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);
        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);
        // Tell it to use our program (pair of shaders)
        gl.useProgram(FModel._shaderData.spGlID);
        var cameraData = setCamera();
        FModel.setRotation(0, fRotationRadians, 0);
        FModel.visit(0);
        FModel.updateUniformsData(cameraData);
        FModel.testDraw();
    }
}
var PointLightTest = /** @class */ (function () {
    function PointLightTest() {
    }
    PointLightTest.run = function () {
        main();
    };
    return PointLightTest;
}());
exports.default = PointLightTest;
//# sourceMappingURL=PointLightTest.js.map