"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_matrix;' +
    'varying vec4 v_color;' +
    'void main() {' +
    // Multiply the position by the matrix.
    'gl_Position = u_matrix * a_position;' +
    // Pass the color to the fragment shader.
    'v_color = a_color;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    // Passed in from the vertex shader.
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}';
var textvertexshader = 'attribute vec4 a_position;' +
    'attribute vec2 a_texcoord;' +
    'uniform mat4 u_matrix;' +
    'varying vec2 v_texcoord;' +
    'void main() {' +
    // Multiply the position by the matrix.
    'gl_Position = u_matrix * a_position;' +
    // Pass the texcoord to the fragment shader.
    'v_texcoord = a_texcoord;' +
    '}';
var textfragmentshader = 'precision mediump float;' +
    // Passed in from the vertex shader.
    'varying vec2 v_texcoord;' +
    'uniform sampler2D u_texture;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'gl_FragColor = texture2D(u_texture, v_texcoord) * u_color;' +
    '}';
var textCtx = document.createElement("canvas").getContext("2d");
// Puts text in center of canvas.
function makeTextCanvas(text, width, height) {
    textCtx.canvas.width = width;
    textCtx.canvas.height = height;
    textCtx.font = "20px monospace";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "white";
    textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
    textCtx.fillText(text, width / 2, height / 2);
    return textCtx.canvas;
}
function main() {
    var primitives = window["primitives"];
    var webglUtils = window["webglUtils"];
    var m4 = window["m4"];
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    // Create data for 'F'
    var fBufferInfo = primitives.create3DFBufferInfo(gl);
    // Create a unit quad for the 'text'
    var textBufferInfo = primitives.createPlaneBufferInfo(gl, 1, 1, 1, 1, m4.xRotation(Math.PI / 2));
    // setup GLSL programs
    var fProgramInfo = webglUtils.createProgramInfo2(gl, [vertexshader3d, fragmentshader3d]);
    var textProgramInfo = webglUtils.createProgramInfo2(gl, [textvertexshader, textfragmentshader]);
    var names = [
        "anna",
        "colin",
        "james",
        "danny",
        "kalin",
        "hiro",
        "eddie",
        "shu",
        "brian",
        "tami",
        "rick",
        "gene",
        "natalie",
        "evan",
        "sakura",
        "kai",
    ];
    // create text textures, one for each letter
    var textTextures = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
    ].map(function (name) {
        var textCanvas = makeTextCanvas(name, 10, 26);
        var textWidth = textCanvas.width;
        var textHeight = textCanvas.height;
        var textTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        // make sure we can render it even if it's not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return {
            texture: textTex,
            width: textWidth,
            height: textHeight,
        };
    });
    var fUniforms = {
        u_matrix: m4.identity(),
    };
    var textUniforms = {
        u_matrix: m4.identity(),
        u_texture: null,
        u_color: [0, 0, 0, 1],
    };
    function radToDeg(r) {
        return r * 180 / Math.PI;
    }
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var translation = [0, 30, 0];
    var rotation = [degToRad(190), degToRad(0), degToRad(0)];
    var scale = [1, 1, 1];
    var fieldOfViewRadians = degToRad(60);
    var rotationSpeed = 1.2;
    var then = 0;
    requestAnimationFrame(drawScene);
    // Draw the scene.
    function drawScene(now) {
        // Convert to seconds
        now *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = now - then;
        // Remember the current time for the next frame.
        then = now;
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // Every frame increase the rotation a little.
        rotation[1] += rotationSpeed * deltaTime;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.depthMask(true);
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Compute the matrices used for all objects
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
        // Compute the camera's matrix using look at.
        var cameraRadius = 360;
        var cameraPosition = [Math.cos(now) * cameraRadius, 0, Math.sin(now) * cameraRadius];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        var viewMatrix = m4.inverse(cameraMatrix);
        var textPositions = [];
        // setup to draw the 'F'
        gl.useProgram(fProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, fProgramInfo, fBufferInfo);
        // draw the Fs.
        var spread = 170;
        for (var yy = -1; yy <= 1; ++yy) {
            for (var xx = -2; xx <= 2; ++xx) {
                var fViewMatrix = m4.translate(viewMatrix, translation[0] + xx * spread, translation[1] + yy * spread, translation[2]);
                fViewMatrix = m4.xRotate(fViewMatrix, rotation[0]);
                fViewMatrix = m4.yRotate(fViewMatrix, rotation[1] + yy * xx * 0.2);
                fViewMatrix = m4.zRotate(fViewMatrix, rotation[2] + now + (yy * 3 + xx) * 0.1);
                fViewMatrix = m4.scale(fViewMatrix, scale[0], scale[1], scale[2]);
                fViewMatrix = m4.translate(fViewMatrix, -50, -75, 0);
                textPositions.push([fViewMatrix[12], fViewMatrix[13], fViewMatrix[14]]);
                fUniforms.u_matrix = m4.multiply(projectionMatrix, fViewMatrix);
                webglUtils.setUniforms(fProgramInfo, fUniforms);
                // Draw the geometry.
                gl.drawElements(gl.TRIANGLES, fBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
            }
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        // draw the text
        // setup to draw the text.
        // Because every letter uses the same attributes and the same progarm
        // we only need to do this once.
        gl.useProgram(textProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, textProgramInfo, textBufferInfo);
        textPositions.forEach(function (pos, ndx) {
            var name = names[ndx];
            // for each leter
            for (var ii = 0; ii < name.length; ++ii) {
                var letter = name.charCodeAt(ii);
                var letterNdx = letter - "a".charCodeAt(0);
                // select a letter texture
                var tex = textTextures[letterNdx];
                // use just the position of the 'F' for the text
                // because pos is in view space that means it's a vector from the eye to
                // some position. So translate along that vector back toward the eye some distance
                var fromEye = m4.normalize(pos);
                var amountToMoveTowardEye = 150; // because the F is 150 units long
                var viewX = pos[0] - fromEye[0] * amountToMoveTowardEye;
                var viewY = pos[1] - fromEye[1] * amountToMoveTowardEye;
                var viewZ = pos[2] - fromEye[2] * amountToMoveTowardEye;
                var desiredTextScale = -1 / gl.canvas.height; // 1x1 pixels
                var scale = viewZ * desiredTextScale;
                var textMatrix = m4.translate(projectionMatrix, viewX, viewY, viewZ);
                // scale the F to the size we need it.
                textMatrix = m4.scale(textMatrix, tex.width * scale, tex.height * scale, 1);
                textMatrix = m4.translate(textMatrix, ii, 0, 0);
                // set texture uniform
                m4.copy(textMatrix, textUniforms.u_matrix);
                textUniforms.u_texture = tex.texture;
                webglUtils.setUniforms(textProgramInfo, textUniforms);
                // Draw the text.
                gl.drawElements(gl.TRIANGLES, textBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
            }
        });
        requestAnimationFrame(drawScene);
    }
}
var testWebl_Label = /** @class */ (function () {
    function testWebl_Label() {
    }
    testWebl_Label.run = function () {
        main();
    };
    return testWebl_Label;
}());
exports.default = testWebl_Label;
//# sourceMappingURL=testWebl_Label.js.map