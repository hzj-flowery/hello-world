import { createNoSubstitutionTemplateLiteral } from "typescript";
import Device from "../../Device";
import { glMatrix } from "../../Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { G_ShaderFactory } from "../shader/Shader";

var vertexshader3d =
    'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_matrix;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = u_matrix * a_position;' +
    'v_color = normalize(a_color);' +
    '}'

var fragmentshader3d =
    'precision mediump float;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}'

"use strict";

var modelData = {
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
        0, 150, 0],
    color: [
        // left column front
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,

        // top rung front
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,

        // middle rung front
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,
        200, 70, 120,255,

        // left column back
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,

        // top rung back
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,

        // middle rung back
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,
        80, 70, 200,255,

        // top
        70, 200, 210,255,
        70, 200, 210,255,
        70, 200, 210,255,
        70, 200, 210,255,
        70, 200, 210,255,
        70, 200, 210,255,

        // top rung right
        200, 200, 70,255,
        200, 200, 70,255,
        200, 200, 70,255,
        200, 200, 70,255,
        200, 200, 70,255,
        200, 200, 70,255,

        // under top rung
        210, 100, 70,255,
        210, 100, 70,255,
        210, 100, 70,255,
        210, 100, 70,255,
        210, 100, 70,255,
        210, 100, 70,255,

        // between top rung and middle
        210, 160, 70,255,
        210, 160, 70,255,
        210, 160, 70,255,
        210, 160, 70,255,
        210, 160, 70,255,
        210, 160, 70,255,

        // top of middle rung
        70, 180, 210,255,
        70, 180, 210,255,
        70, 180, 210,255,
        70, 180, 210,255,
        70, 180, 210,255,
        70, 180, 210,255,

        // right of middle rung
        100, 70, 210,255,
        100, 70, 210,255,
        100, 70, 210,255,
        100, 70, 210,255,
        100, 70, 210,255,
        100, 70, 210,255,

        // bottom of middle rung.
        76, 210, 100,255,
        76, 210, 100,255,
        76, 210, 100,255,
        76, 210, 100,255,
        76, 210, 100,255,
        76, 210, 100,255,

        // right of bottom
        140, 210, 80,255,
        140, 210, 80,255,
        140, 210, 80,255,
        140, 210, 80,255,
        140, 210, 80,255,
        140, 210, 80,255,

        // bottom
        90, 130, 110,255,
        90, 130, 110,255,
        90, 130, 110,255,
        90, 130, 110,255,
        90, 130, 110,255,
        90, 130, 110,255,

        // left side
        160, 160, 220,255,
        160, 160, 220,255,
        160, 160, 220,255,
        160, 160, 220,255,
        160, 160, 220,255,
        160, 160, 220,255]
}

function main() {
    var gl = Device.Instance.gl;
    if (!gl) {
        return;
    }

    // setup GLSL program
    var programShader = G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    var cubeBufferInfor = G_ShaderFactory.createBufferInfoFromArrays(modelData);
    var uniforms = {
        u_matrix: {}
    }



    var translation = [0, 0, -360];
    var rotation = [MathUtils.degToRad(190), MathUtils.degToRad(40), MathUtils.degToRad(320)];
    var scale = [1, 1, 1];
    var fieldOfViewRadians = MathUtils.degToRad(60);
    var rotationSpeed = 1.2;

    var then = 0;

    requestAnimationFrame(renderLoop);

    function renderLoop(now) {
        // Convert to seconds
        now *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = now - then;
        // Remember the current time for the next frame.
        then = now;

        // Every frame increase the rotation a little.
        rotation[1] += rotationSpeed * deltaTime;

        drawScene();

        // Call renderLoop again next frame
        requestAnimationFrame(renderLoop);
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
        gl.useProgram(programShader.spGlID);

        G_ShaderFactory.setBuffersAndAttributes(programShader.attrSetters, cubeBufferInfor)


        // Compute the matrices
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, 1, 2000);
        glMatrix.mat4.translate(projectionMatrix, projectionMatrix, translation);
        glMatrix.mat4.rotateX(projectionMatrix, projectionMatrix, rotation[0]);
        glMatrix.mat4.rotateY(projectionMatrix, projectionMatrix, rotation[1]);
        glMatrix.mat4.rotateZ(projectionMatrix, projectionMatrix, rotation[2]);
        glMatrix.mat4.scale(projectionMatrix, projectionMatrix, scale);

        uniforms.u_matrix = projectionMatrix;
        G_ShaderFactory.setUniforms(programShader.uniSetters, uniforms)

        G_ShaderFactory.drawBufferInfo(cubeBufferInfor, gl.TRIANGLES)
    }

    const elem = document.querySelector('#screenshot');
    elem.addEventListener('click', () => {
        drawScene();
        (gl.canvas as any).toBlob((blob) => {
            saveBlob(blob, `screencapture-${gl.canvas.width}x${gl.canvas.height}.png`);
        });
    });

    const saveBlob = (function () {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        return function saveData(blob, fileName) {
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
        };
    }());
}


export default class CaptureTest {
    static run() {
        main();
    }
}

