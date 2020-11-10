import Device from "../../../Device";
import { glMatrix } from "../../Matrix";
import { G_ShaderFactory } from "../shader/Shader";

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

var vertexshader3d =
    'attribute vec4 a_position;' +
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
    '}'

var fragmentshader3d =
    'precision mediump float;' +
    'varying vec3 v_normal;' +
    'varying vec3 v_surfaceToLight;' +
    'varying vec3 v_surfaceToView;' +
    'uniform vec4 u_color;' +
    'uniform float u_shininess;' +
    'uniform vec3 u_lightDirection;' +
    'uniform float u_innerLimit;'+          // in dot space
    'uniform float u_outerLimit;'+        // in dot space

    'void main() {' +
    'vec3 normal = normalize(v_normal);' +
    'vec3 surfaceToLightDirection = normalize(v_surfaceToLight);' +
    'vec3 surfaceToViewDirection = normalize(v_surfaceToView);' +
    'vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);' +
    'float dotFromDirection = dot(surfaceToLightDirection,' +
    '-u_lightDirection);' +
    'float limitRange = u_innerLimit - u_outerLimit;' +
    'float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.0, 1.0);' +
    'float light = inLight * dot(normal, surfaceToLightDirection);' +
    'float specular = inLight * pow(dot(normal, halfVector), u_shininess);' +
    'gl_FragColor = u_color;' +
    'gl_FragColor.rgb *= light;' +
    'gl_FragColor.rgb += specular;' +
    '}'

"use strict";

function main() {
    var gl = Device.Instance.gl;
    if (!gl) {
        return;
    }

    // setup GLSL program
    var program = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d).spGlID;

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var normalLocation = gl.getAttribLocation(program, "a_normal");

    // lookup uniforms
    var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var shininessLocation = gl.getUniformLocation(program, "u_shininess");
    var lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    var innerLimitLocation = gl.getUniformLocation(program, "u_innerLimit");
    var outerLimitLocation = gl.getUniformLocation(program, "u_outerLimit");
    var lightWorldPositionLocation =
        gl.getUniformLocation(program, "u_lightWorldPosition");
    var viewWorldPositionLocation =
        gl.getUniformLocation(program, "u_viewWorldPosition");
    var worldLocation =
        gl.getUniformLocation(program, "u_world");

    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put geometry data into buffer
    setGeometry(gl);

    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // Put normals data into buffer
    setNormals(gl);

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);
    var fRotationRadians = 0;
    var shininess = 150;
    var lightRotationX = 0;
    var lightRotationY = 0;
    var lightDirection = [0, 0, 1];  // this is computed in updateScene
    var innerLimit = degToRad(10);
    var outerLimit = degToRad(20);

    drawScene();

    // Setup a ui.
    var webglLessonsUI = window["webglLessonsUI"];
    webglLessonsUI.setupSlider("#fRotation", { value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#lightRotationX", { value: lightRotationX, slide: updatelightRotationX, min: -2, max: 2, precision: 2, step: 0.001 });
    webglLessonsUI.setupSlider("#lightRotationY", { value: lightRotationY, slide: updatelightRotationY, min: -2, max: 2, precision: 2, step: 0.001 });
    webglLessonsUI.setupSlider("#innerLimit", { value: radToDeg(innerLimit), slide: updateInnerLimit, min: 0, max: 180 });
    webglLessonsUI.setupSlider("#outerLimit", { value: radToDeg(outerLimit), slide: updateOuterLimit, min: 0, max: 180 });

    function updateRotation(event, ui) {
        fRotationRadians = degToRad(ui.value);
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
        innerLimit = degToRad(ui.value);
        drawScene();
    }

    function updateOuterLimit(event, ui) {
        outerLimit = degToRad(ui.value);
        drawScene();
    }

    // Draw the scene.
    function drawScene() {
        Device.Instance.resizeCanvasToDisplaySize(gl.canvas);

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
        gl.useProgram(program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);

        // Turn on the normal attribute
        gl.enableVertexAttribArray(normalLocation);

        // Bind the normal buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

        // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floating point values
        var normalize = false; // normalize the data (convert from 0-255 to 0-1)
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            normalLocation, size, type, normalize, stride, offset);

        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, zNear, zFar);

        // Compute the camera's matrix
        var camera = [100, 150, 200];
        var target = [0, 35, 0];
        var up = [0, 1, 0];
        var cameraMatrix = glMatrix.mat4.identity(null);
        glMatrix.mat4.lookAt2(cameraMatrix, camera, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = glMatrix.mat4.invert(null, cameraMatrix);

        // Compute a view projection matrix
        var viewProjectionMatrix = glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);

        // Draw a F at the origin
        var worldMatrix = glMatrix.mat4.identity(null);
        glMatrix.mat4.rotateY(worldMatrix, worldMatrix, fRotationRadians);

        // Multiply the matrices.
        var worldViewProjectionMatrix = glMatrix.mat4.multiply(null, viewProjectionMatrix, worldMatrix);
        var worldInverseMatrix = glMatrix.mat4.invert(null, worldMatrix);
        var worldInverseTransposeMatrix = glMatrix.mat4.identity(null);
        glMatrix.mat4.transpose(worldInverseTransposeMatrix, worldInverseMatrix);

        // Set the matrices
        gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
        gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
        gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

        // Set the color to use
        gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

        // set the light position
        const lightPosition = [40, 60, 120];
        gl.uniform3fv(lightWorldPositionLocation, lightPosition);

        // set the camera/view position
        gl.uniform3fv(viewWorldPositionLocation, camera);

        // set the shininess
        gl.uniform1f(shininessLocation, shininess);

        // set the spotlight uniforms

        // since we don't have a plane like most spotlight examples
        // let's point the spot light at the F
        {
            let temp1 = glMatrix.mat4.identity(null);
            let temp2 = glMatrix.mat4.identity(null);
            var lmat =  glMatrix.mat4.identity(null);
            glMatrix.mat4.lookAt2(lmat, lightPosition, target, up);
            glMatrix.mat4.multiply(lmat, glMatrix.mat4.rotateX(temp1, temp1, lightRotationX), lmat);
            glMatrix.mat4.multiply(lmat, glMatrix.mat4.rotateY(temp2, temp2, lightRotationY), lmat);
            // get the zAxis from the matrix
            // negate it because lookAt looks down the -Z axis
            lightDirection = [-lmat[8], -lmat[9], -lmat[10]];
        }

        gl.uniform3fv(lightDirectionLocation, lightDirection);
        gl.uniform1f(innerLimitLocation, Math.cos(innerLimit));
        gl.uniform1f(outerLimitLocation, Math.cos(outerLimit));

        // Draw the geometry.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 16 * 6;
        gl.drawArrays(primitiveType, offset, count);
    }
}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    var positions = new Float32Array([
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
        0, 150, 0]);

    // Center the F around the origin and Flip it around. We do this because
    // we're in 3D now with and +Y is up where as before when we started with 2D
    // we had +Y as down.

    // We could do by changing all the values above but I'm lazy.
    // We could also do it with a matrix at draw time but you should
    // never do stuff at draw time if you can do it at init time.
    var matrix = glMatrix.mat4.identity(null);
    glMatrix.mat4.rotateX(matrix, matrix, Math.PI)
    glMatrix.mat4.translate(matrix, matrix, [-50, -75, -15]);

    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = glMatrix.mat4.transformPoint(null, matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
        positions[ii + 0] = vector[0];
        positions[ii + 1] = vector[1];
        positions[ii + 2] = vector[2];
    }

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setNormals(gl) {
    var normals = new Float32Array([
        // left column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // left column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // under top rung
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // between top rung and middle
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top of middle rung
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // right of middle rung
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom of middle rung.
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // right of bottom
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // left side
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

export default class SpotLightTest {
    static run() {
        main();
    }
}

