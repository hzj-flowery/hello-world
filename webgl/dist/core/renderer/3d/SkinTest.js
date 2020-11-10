"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkinTest = void 0;
var Device_1 = require("../../../Device");
var vs = 'attribute vec4 a_position;' +
    'attribute vec4 a_weight;' +
    'attribute vec4 a_boneNdx;' +
    'uniform mat4 projection;' +
    'uniform mat4 view;' +
    'uniform mat4 bones[4];' +
    'void main() {' +
    'gl_Position = projection * view *' +
    '(bones[int(a_boneNdx[0])] * a_position * a_weight[0] +' +
    'bones[int(a_boneNdx[1])] * a_position * a_weight[1] +' +
    'bones[int(a_boneNdx[2])] * a_position * a_weight[2] +' +
    'bones[int(a_boneNdx[3])] * a_position * a_weight[3]);' +
    '}';
var fs = 'precision mediump float;' +
    'uniform vec4 color;' +
    'void main () {' +
    'gl_FragColor = color;' +
    '}';
var vs2 = 'attribute vec4 a_position;' +
    'uniform mat4 projection;' +
    'uniform mat4 view;' +
    'uniform mat4 model;' +
    'void main() {' +
    'gl_Position = projection * view * model * a_position;' +
    '}';
"use strict";
function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var webglUtils = window["webglUtils"];
    var m4 = window["m4"];
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    // compiles and links the shaders, looks up attribute and uniform locations
    var programInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
    var arrays = {
        position: {
            numComponents: 2,
            data: [
                0, 1,
                0, -1,
                2, 1,
                2, -1,
                4, 1,
                4, -1,
                6, 1,
                6, -1,
                8, 1,
                8, -1,
            ],
        },
        boneNdx: {
            numComponents: 4,
            data: [
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                1, 0, 0, 0,
                1, 0, 0, 0,
                1, 2, 0, 0,
                1, 2, 0, 0,
                2, 0, 0, 0,
                2, 0, 0, 0,
            ],
        },
        weight: {
            numComponents: 4,
            data: [
                1, 0, 0, 0,
                1, 0, 0, 0,
                .5, .5, 0, 0,
                .5, .5, 0, 0,
                1, 0, 0, 0,
                1, 0, 0, 0,
                .5, .5, 0, 0,
                .5, .5, 0, 0,
                1, 0, 0, 0,
                1, 0, 0, 0,
            ],
        },
        indices: {
            numComponents: 2,
            data: [
                0, 1,
                0, 2,
                1, 3,
                2, 3,
                2, 4,
                3, 5,
                4, 5,
                4, 6,
                5, 7,
                6, 7,
                6, 8,
                7, 9,
                8, 9,
            ],
        },
    };
    // calls gl.createBuffer, gl.bindBuffer, gl.bufferData
    var bufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);
    // 4 matrices, one for each bone
    var numBones = 4;
    var boneArray = new Float32Array(numBones * 16);
    var uniforms = {
        projection: m4.orthographic(-20, 20, -10, 10, -1, 1),
        view: m4.translation(-6, 0, 0),
        bones: boneArray,
        color: [1, 0, 0, 1],
    };
    // make views for each bone. This lets all the bones
    // exist in 1 array for uploading but as separate
    // arrays for using with the math functions
    var boneMatrices = []; // the uniform data
    var bones = []; // the value before multiplying by inverse bind matrix
    var bindPose = []; // the bind matrix
    for (var i = 0; i < numBones; ++i) {
        boneMatrices.push(new Float32Array(boneArray.buffer, i * 4 * 16, 16));
        bindPose.push(m4.identity()); // just allocate storage
        bones.push(m4.identity()); // just allocate storage
    }
    // rotate each bone by a and simulate a hierarchy
    function computeBoneMatrices(bones, angle) {
        var m = m4.identity();
        m4.zRotate(m, angle, bones[0]);
        m4.translate(bones[0], 4, 0, 0, m);
        m4.zRotate(m, angle, bones[1]);
        m4.translate(bones[1], 4, 0, 0, m);
        m4.zRotate(m, angle, bones[2]);
        // bones[3] is not used
    }
    // compute the initial positions of each matrix
    computeBoneMatrices(bindPose, 0);
    // compute their inverses
    var bindPoseInv = bindPose.map(function (m) {
        return m4.inverse(m);
    });
    function render(time) {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        var aspect = gl.canvas.width / gl.canvas.height;
        m4.orthographic(-aspect * 10, aspect * 10, -10, 10, -1, 1, uniforms.projection);
        var t = time * 0.001;
        var angle = Math.sin(t) * 0.8;
        computeBoneMatrices(bones, angle);
        // multiply each by its bindPoseInverse
        bones.forEach(function (bone, ndx) {
            m4.multiply(bone, bindPoseInv[ndx], boneMatrices[ndx]);
        });
        gl.useProgram(programInfo.program);
        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        // calls gl.uniformXXX, gl.activeTexture, gl.bindTexture
        webglUtils.setUniforms(programInfo, uniforms);
        // calls gl.drawArrays or gl.drawIndices
        webglUtils.drawBufferInfo(gl, bufferInfo, gl.LINES);
        drawAxis(uniforms.projection, uniforms.view, bones);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    // --- ignore below this line - it's not relevant to the exmample and it's kind of a bad example ---
    var axisProgramInfo;
    var axisBufferInfo;
    function drawAxis(projection, view, bones) {
        if (!axisProgramInfo) {
            axisProgramInfo = webglUtils.createProgramInfo(gl, [vs2, fs]);
            axisBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
                position: {
                    numComponents: 2,
                    data: [
                        0, 0,
                        1, 0,
                    ],
                },
            });
        }
        var uniforms = {
            projection: projection,
            view: view,
            model: null,
            color: null,
        };
        gl.useProgram(axisProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, axisProgramInfo, axisBufferInfo);
        for (var i = 0; i < 3; ++i) {
            drawLine(bones[i], 0, [0, 1, 0, 1]);
            drawLine(bones[i], Math.PI * 0.5, [0, 0, 1, 1]);
        }
        function drawLine(mat, angle, color) {
            uniforms.model = m4.zRotate(mat, angle);
            uniforms.color = color;
            webglUtils.setUniforms(axisProgramInfo, uniforms);
            webglUtils.drawBufferInfo(gl, axisBufferInfo, gl.LINES);
        }
    }
}
var SkinTest = /** @class */ (function () {
    function SkinTest() {
    }
    SkinTest.run = function () {
        main();
    };
    return SkinTest;
}());
exports.SkinTest = SkinTest;
//# sourceMappingURL=SkinTest.js.map