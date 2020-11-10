"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var vertexShader = 'attribute vec4 a_position;' +
    'attribute vec4 color;' +
    'attribute mat4 matrix;' +
    'uniform mat4 projection;' +
    'uniform mat4 view;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = projection * view * matrix * a_position;' +
    'v_color = color;' +
    '}';
var fragShader = 'precision mediump float;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}';
'use strict';
function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var webglUtils = window["webglUtils"];
    var m4 = window["m4"];
    var gl = Device_1.default.Instance.gl;
    var ext = gl.getExtension('ANGLE_instanced_arrays');
    if (!ext) {
        return alert('need ANGLE_instanced_arrays'); // eslint-disable-line
    }
    // setup GLSL programs
    // compiles shaders, links program
    var program = webglUtils.createProgramFromScripts2(gl, [vertexShader, fragShader]);
    var positionLoc = gl.getAttribLocation(program, 'a_position');
    var colorLoc = gl.getAttribLocation(program, 'color');
    var matrixLoc = gl.getAttribLocation(program, 'matrix');
    var projectionLoc = gl.getUniformLocation(program, 'projection');
    var viewLoc = gl.getUniformLocation(program, 'view');
    console.log("colorLoc----", colorLoc, matrixLoc, projectionLoc, viewLoc);
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.1, 0.4,
        -0.1, -0.4,
        0.1, -0.4,
        0.1, -0.4,
        -0.1, 0.4,
        0.1, 0.4,
        0.4, -0.1,
        -0.4, -0.1,
        -0.4, 0.1,
        -0.4, 0.1,
        0.4, -0.1,
        0.4, 0.1,
    ]), gl.STATIC_DRAW);
    var numVertices = 12;
    // setup matrixes, one per instance
    var numInstances = 5;
    // make a typed array with one view per matrix
    var matrixData = new Float32Array(numInstances * 16);
    var matrices = [];
    for (var i = 0; i < numInstances; ++i) {
        var byteOffsetToMatrix = i * 16 * 4;
        var numFloatsForView = 16;
        matrices.push(new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView));
    }
    var matrixBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    // just allocate the buffer
    gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);
    console.log("test-------------", matrixData.byteLength);
    // setup colors, one per instance
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 0, 1, 1,
        0, 1, 1, 1,
    ]), gl.STATIC_DRAW);
    function render(time) {
        time *= 0.001; // seconds
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(program);
        // set the view and projection matrices since
        // they are shared by all instances
        var aspect = gl.canvas.width / gl.canvas.height;
        gl.uniformMatrix4fv(projectionLoc, false, m4.orthographic(-aspect, aspect, -1, 1, -1, 1));
        gl.uniformMatrix4fv(viewLoc, false, m4.zRotation(time * .1));
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        // update all the matrices
        matrices.forEach(function (mat, ndx) {
            m4.translation(-0.5 + ndx * 0.25, 0, 0, mat);
            m4.zRotate(mat, time * (0.1 + 0.1 * ndx), mat);
        });
        // upload the new matrix data
        gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);
        // set all 4 attributes for matrix
        var bytesPerMatrix = 4 * 16;
        for (var i = 0; i < 4; ++i) {
            var loc = matrixLoc + i;
            gl.enableVertexAttribArray(loc);
            // note the stride and offset
            var offset = i * 16; // 4 floats per row, 4 bytes per float
            gl.vertexAttribPointer(loc, // location
            4, // size (num values to pull from buffer per iteration)
            gl.FLOAT, // type of data in buffer
            false, // normalize
            bytesPerMatrix, // stride, num bytes to advance to get to next set of values
            offset);
            // this line says this attribute only changes for each 1 instance
            ext.vertexAttribDivisorANGLE(loc, 1);
        }
        // set attribute for color
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(colorLoc, 1);
        ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, // offset
        numVertices, // num vertices per instance
        numInstances);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
var SpeedTest = /** @class */ (function () {
    function SpeedTest() {
    }
    SpeedTest.run = function () {
        main();
    };
    return SpeedTest;
}());
exports.default = SpeedTest;
//# sourceMappingURL=SpeedTest.js.map