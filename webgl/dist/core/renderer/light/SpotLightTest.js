"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var LoaderManager_1 = require("../../../LoaderManager");
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var Shader_1 = require("../shader/Shader");
/**
 *  <div class="description">
    Drag slider to rotate F.
    </div>
    <!-- <canvas id="canvas"></canvas> -->
    <div id="uiContainer">
      <div id="ui">
        <div id="fRotation"></div>
        <div id="lightRotationX"></div>
        <div id="lightRotationY"></div>
        <div id="innerLimit"></div>
        <div id="outerLimit"></div>
    </div>
    </div>
 */
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec3 a_normal;' +
    'uniform vec3 u_lightWorldPosition;' +
    'uniform vec3 u_viewWorldPosition;' +
    'uniform mat4 u_world;' +
    'uniform mat4 u_worldViewProjection;' +
    'uniform mat4 u_worldInverseTranspose;' +
    'varying vec3 v_normal;' +
    'varying vec3 v_surfaceToLight;' +
    'varying vec3 v_surfaceToView;' +
    'void main() {' +
    'gl_Position = u_worldViewProjection * a_position;' +
    'v_normal = mat3(u_worldInverseTranspose) * a_normal;' +
    'vec3 surfaceWorldPosition = (u_world * a_position).xyz;' +
    'v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;' +
    'v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'varying vec3 v_normal;' +
    'varying vec3 v_surfaceToLight;' +
    'varying vec3 v_surfaceToView;' +
    'uniform vec4 u_color;' +
    'uniform float u_shininess;' +
    'uniform vec3 u_lightDirection;' +
    'uniform float u_innerLimit;' + // in dot space
    'uniform float u_outerLimit;' + // in dot space
    'void main() {' +
    'vec3 normal = normalize(v_normal);' +
    'vec3 surfaceToLightDirection = normalize(v_surfaceToLight);' +
    'vec3 surfaceToViewDirection = normalize(v_surfaceToView);' +
    'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);' +
    'float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection);' +
    'float limitRange = u_innerLimit - u_outerLimit;' +
    'float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.0, 1.0);' +
    'float light = inLight * dot(normal, surfaceToLightDirection);' +
    'float specular = inLight * pow(dot(normal, halfVector), u_shininess);' +
    'gl_FragColor = u_color;' +
    'gl_FragColor.rgb *= light;' +
    'gl_FragColor.rgb += specular;' +
    '}';
"use strict";
function main() {
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    // setup GLSL program
    var programShader = Shader_1.G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    var matrix = Matrix_1.glMatrix.mat4.identity(null);
    Matrix_1.glMatrix.mat4.rotateX(matrix, matrix, Math.PI);
    Matrix_1.glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);
    var datas = LoaderManager_1.default.instance.getCacheData("res/models/char/F.json");
    var cubeData = {};
    cubeData.position = new Float32Array(datas.position);
    cubeData.normal = new Float32Array(datas.normal);
    for (var ii = 0; ii < cubeData.position.length; ii += 3) {
        var vector = Matrix_1.glMatrix.mat4.transformPoint(null, matrix, [cubeData.position[ii + 0], cubeData.position[ii + 1], cubeData.position[ii + 2], 1]);
        cubeData.position[ii + 0] = vector[0];
        cubeData.position[ii + 1] = vector[1];
        cubeData.position[ii + 2] = vector[2];
    }
    var cubeBufferData = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeData);
    var uniformData = {
        u_worldViewProjection: {},
        u_worldInverseTranspose: {},
        u_color: {},
        u_shininess: {},
        u_lightDirection: {},
        u_innerLimit: {},
        u_outerLimit: {},
        u_lightWorldPosition: {},
        u_viewWorldPosition: {},
        u_world: {}
    };
    var fieldOfViewRadians = MathUtils_1.MathUtils.degToRad(60);
    var fRotationRadians = 0;
    var shininess = 150;
    var lightRotationX = 0;
    var lightRotationY = 0;
    var lightDirection = [0, 0, 1]; // this is computed in updateScene
    var innerLimit = MathUtils_1.MathUtils.degToRad(10);
    var outerLimit = MathUtils_1.MathUtils.degToRad(20);
    drawScene();
    // Setup a ui.
    var webglLessonsUI = window["webglLessonsUI"];
    webglLessonsUI.setupSlider("#fRotation", { value: MathUtils_1.MathUtils.radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#lightRotationX", { value: lightRotationX, slide: updatelightRotationX, min: -2, max: 2, precision: 2, step: 0.001 });
    webglLessonsUI.setupSlider("#lightRotationY", { value: lightRotationY, slide: updatelightRotationY, min: -2, max: 2, precision: 2, step: 0.001 });
    webglLessonsUI.setupSlider("#innerLimit", { value: MathUtils_1.MathUtils.radToDeg(innerLimit), slide: updateInnerLimit, min: 0, max: 180 });
    webglLessonsUI.setupSlider("#outerLimit", { value: MathUtils_1.MathUtils.radToDeg(outerLimit), slide: updateOuterLimit, min: 0, max: 180 });
    function updateRotation(event, ui) {
        fRotationRadians = MathUtils_1.MathUtils.degToRad(ui.value);
        drawScene();
    }
    function updatelightRotationX(event, ui) {
        lightRotationX = ui.value;
        drawScene();
    }
    function updatelightRotationY(event, ui) {
        lightRotationY = ui.value;
        drawScene();
    }
    function updateInnerLimit(event, ui) {
        innerLimit = MathUtils_1.MathUtils.degToRad(ui.value);
        drawScene();
    }
    function updateOuterLimit(event, ui) {
        outerLimit = MathUtils_1.MathUtils.degToRad(ui.value);
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
        //设置属性数据
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, cubeBufferData);
        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = Matrix_1.glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);
        // Compute the camera's matrix
        var camera = [100, 150, 200];
        var target = [0, 35, 0];
        var up = [0, 1, 0];
        var cameraMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.lookAt2(cameraMatrix, camera, target, up);
        // Make a view matrix from the camera matrix.
        var viewMatrix = Matrix_1.glMatrix.mat4.invert(null, cameraMatrix);
        // Compute a view projection matrix
        var viewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
        // Draw a F at the origin
        var worldMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);
        // Multiply the matrices.
        var worldViewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, viewProjectionMatrix, worldMatrix);
        var worldInverseMatrix = Matrix_1.glMatrix.mat4.invert(null, worldMatrix);
        var worldInverseTransposeMatrix = Matrix_1.glMatrix.mat4.identity(null);
        Matrix_1.glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);
        uniformData.u_worldViewProjection = worldViewProjectionMatrix;
        uniformData.u_worldInverseTranspose = worldInverseTransposeMatrix;
        uniformData.u_world = worldMatrix;
        uniformData.u_color = [0.2, 1, 0.2, 1];
        // set the light position
        var lightPosition = [40, 60, 120];
        uniformData.u_lightWorldPosition = lightPosition; //光在世界中的位置
        uniformData.u_viewWorldPosition = camera; //相机在世界中的位置
        uniformData.u_shininess = shininess;
        // since we don't have a plane like most spotlight examples
        // let's point the spot light at the F
        {
            var temp1 = Matrix_1.glMatrix.mat4.identity(null);
            var temp2 = Matrix_1.glMatrix.mat4.identity(null);
            var lmat = Matrix_1.glMatrix.mat4.identity(null);
            Matrix_1.glMatrix.mat4.lookAt2(lmat, lightPosition, target, up);
            Matrix_1.glMatrix.mat4.multiply(lmat, Matrix_1.glMatrix.mat4.rotateX(temp1, temp1, lightRotationX), lmat);
            Matrix_1.glMatrix.mat4.multiply(lmat, Matrix_1.glMatrix.mat4.rotateY(temp2, temp2, lightRotationY), lmat);
            // get the zAxis from the matrix
            // negate it because lookAt looks down the -Z axis
            lightDirection = [-lmat[8], -lmat[9], -lmat[10]];
        }
        uniformData.u_lightDirection = lightDirection;
        uniformData.u_innerLimit = Math.cos(innerLimit);
        uniformData.u_outerLimit = Math.cos(outerLimit);
        Shader_1.G_ShaderFactory.setUniforms(programShader.uniSetters, uniformData);
        Shader_1.G_ShaderFactory.drawBufferInfo(cubeBufferData, gl.TRIANGLES);
    }
}
var SpotLightTest = /** @class */ (function () {
    function SpotLightTest() {
    }
    SpotLightTest.run = function () {
        main();
    };
    return SpotLightTest;
}());
exports.default = SpotLightTest;
//# sourceMappingURL=SpotLightTest.js.map