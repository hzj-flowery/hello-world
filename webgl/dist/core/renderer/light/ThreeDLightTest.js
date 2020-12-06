"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var LoaderManager_1 = require("../../../LoaderManager");
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var Shader_1 = require("../shader/Shader");
//三维光源
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec3 a_normal;' +
    'uniform mat4 u_worldViewProjection;' +
    'uniform mat4 u_worldInverseTranspose;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'v_normal = mat3(u_worldInverseTranspose) * a_normal;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'varying vec3 v_normal;' +
    'uniform vec3 u_reverseLightDirection;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(normal, u_reverseLightDirection);' +
    'gl_FragColor = u_color;' +
    'gl_FragColor.rgb *= light;' +
    '}';
"use strict";
function main() {
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    // setup GLSL program
    var programShader = Shader_1.G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    var datas = LoaderManager_1.default.instance.getCacheData("res/models/char/F.json");
    var cubeData = {};
    cubeData.position = new Float32Array(datas.position);
    cubeData.normal = new Float32Array(datas.normal);
    var matrix = Matrix_1.glMatrix.mat4.identity(null);
    Matrix_1.glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
    Matrix_1.glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);
    for (var ii = 0; ii < cubeData.position.length; ii += 3) {
        var vector = Matrix_1.glMatrix.mat4.transformPoint(null, matrix, [cubeData.position[ii + 0], cubeData.position[ii + 1], cubeData.position[ii + 2], 1]);
        cubeData.position[ii + 0] = vector[0];
        cubeData.position[ii + 1] = vector[1];
        cubeData.position[ii + 2] = vector[2];
    }
    var cubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeData);
    var fieldOfViewRadians = MathUtils_1.MathUtils.degToRad(60);
    var fRotationRadians = 0;
    drawScene();
    // Setup a ui.
    var webglLessonsUI = window["webglLessonsUI"];
    webglLessonsUI.setupSlider("#fRotation", { value: MathUtils_1.MathUtils.radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });
    function updateRotation(event, ui) {
        fRotationRadians = MathUtils_1.MathUtils.degToRad(ui.value);
        drawScene();
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
        gl.useProgram(programShader.spGlID);
        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = Matrix_1.glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);
        // Compute the camera's matrix
        var camera = [100, 150, 200];
        var target = [0, 35, 0];
        var up = [0, 1, 0];
        var cameraMatrix = Matrix_1.glMatrix.mat4.lookAt2(null, camera, target, up);
        // Make a view matrix from the camera matrix.
        var viewMatrix = Matrix_1.glMatrix.mat4.invert(null, cameraMatrix);
        // Compute a view projection matrix
        var viewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
        // Draw a F at the origin
        var worldMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);
        // Multiply the matrices.
        var worldViewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, viewProjectionMatrix, worldMatrix); //pvm
        var worldInverseMatrix = Matrix_1.glMatrix.mat4.invert(null, worldMatrix);
        var worldInverseTransposeMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);
        var uniformData = {
            u_worldViewProjection: worldViewProjectionMatrix,
            u_worldInverseTranspose: worldInverseTransposeMatrix,
            u_color: [0.2, 1, 0.2, 1],
            u_reverseLightDirection: Matrix_1.glMatrix.vec3.normalize(null, [0.5, 0.7, 1])
        };
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, cubeBufferInfo);
        Shader_1.G_ShaderFactory.setUniforms(programShader.uniSetters, uniformData);
        Shader_1.G_ShaderFactory.drawBufferInfo(cubeBufferInfo, gl.TRIANGLES);
    }
}
var ThreeDLightTest = /** @class */ (function () {
    function ThreeDLightTest() {
    }
    ThreeDLightTest.run = function () {
        main();
    };
    return ThreeDLightTest;
}());
exports.default = ThreeDLightTest;
//# sourceMappingURL=ThreeDLightTest.js.map