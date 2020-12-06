"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var Matrix_1 = require("../../Matrix");
var MathUtils_1 = require("../../utils/MathUtils");
var Primitives_1 = require("../shader/Primitives");
var Shader_1 = require("../shader/Shader");
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_matrix;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = u_matrix * a_position;' +
    'v_color = a_color;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'varying vec4 v_color;' +
    'uniform vec4 u_colorMult;' +
    'uniform vec4 u_colorOffset;' +
    'void main() {' +
    'gl_FragColor = v_color * u_colorMult + u_colorOffset;' +
    '}';
"use strict";
var faceColors = [
    [1, 0, 0, 1,],
    [0, 1, 0, 1,],
    [1, 1, 0, 1,],
    [0, 0, 1, 1,],
    [1, 0, 1, 1,],
    [0, 1, 1, 1,],
];
var colorVerts = [];
for (var v = 0; v < 91; ++v) {
    colorVerts.push.apply(colorVerts, faceColors[Math.floor(Math.random() * 5)]);
}
var Node = /** @class */ (function () {
    function Node() {
        this.children = [];
        this.localMatrix = Matrix_1.glMatrix.mat4.identity(null);
        this.worldMatrix = Matrix_1.glMatrix.mat4.identity(null);
    }
    Node.prototype.setParent = function (parent) {
        // remove us from our parent
        if (this.parent) {
            var ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) {
                this.parent.children.splice(ndx, 1);
            }
        }
        // Add us to our new parent
        if (parent) {
            parent.children.push(this);
        }
        this.parent = parent;
    };
    ;
    Node.prototype.updateWorldMatrix = function (parentWorldMatrix) {
        if (parentWorldMatrix) {
            // a matrix was passed in so do the math
            Matrix_1.glMatrix.mat4.multiply(this.worldMatrix, parentWorldMatrix, this.localMatrix);
        }
        else {
            // no matrix was passed in so just copy local to world
            Matrix_1.glMatrix.mat4.copy(this.worldMatrix, this.localMatrix);
        }
        // now process all the children
        var worldMatrix = this.worldMatrix;
        this.children.forEach(function (child) {
            child.updateWorldMatrix(worldMatrix);
        });
    };
    ;
    return Node;
}());
;
function main() {
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    // creates buffers with position, normal, texcoord, and vertex color
    // data for primitives by calling gl.createBuffer, gl.bindBuffer,
    // and gl.bufferData
    var sphereArrays = Primitives_1.syPrimitives.createSphereVertices(10, 12, 6);
    delete sphereArrays.normal;
    delete sphereArrays.texcoord;
    sphereArrays.color = colorVerts;
    console.log("sphhh-------", sphereArrays);
    var sphereBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(sphereArrays);
    console.log("--------", sphereBufferInfo);
    // setup GLSL program
    var programInfoShader = Shader_1.G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    var cameraAngleRadians = MathUtils_1.MathUtils.degToRad(0);
    var fieldOfViewRadians = MathUtils_1.MathUtils.degToRad(60);
    var cameraHeight = 50;
    // Let's make all the nodes
    var solarSystemNode = new Node();
    var earthOrbitNode = new Node();
    earthOrbitNode.localMatrix = Matrix_1.glMatrix.mat4.translation(null, 100, 0, 0); // earth orbit 100 units from the sun
    var moonOrbitNode = new Node();
    moonOrbitNode.localMatrix = Matrix_1.glMatrix.mat4.translation(null, 30, 0, 0); // moon 30 units from the earth
    var sunNode = new Node();
    sunNode.localMatrix = Matrix_1.glMatrix.mat4.scaling(null, 5, 5, 5); // sun a the center
    sunNode.drawInfo = {
        uniforms: {
            u_colorOffset: [0.6, 0.6, 0, 1],
            u_colorMult: [0.4, 0.4, 0, 1],
            u_matrix: new Float32Array(16)
        },
        programInfo: programInfoShader,
        bufferInfo: sphereBufferInfo,
    };
    var earthNode = new Node();
    earthNode.localMatrix = Matrix_1.glMatrix.mat4.scaling(null, 2, 2, 2); // make the earth twice as large
    earthNode.drawInfo = {
        uniforms: {
            u_colorOffset: [0.2, 0.5, 0.8, 1],
            u_colorMult: [0.8, 0.5, 0.2, 1],
            u_matrix: new Float32Array(16)
        },
        programInfo: programInfoShader,
        bufferInfo: sphereBufferInfo,
    };
    var moonNode = new Node();
    moonNode.localMatrix = Matrix_1.glMatrix.mat4.scaling(null, 0.4, 0.4, 0.4);
    moonNode.drawInfo = {
        uniforms: {
            u_colorOffset: [0.6, 0.6, 0.6, 1],
            u_colorMult: [0.1, 0.1, 0.1, 1],
            u_matrix: new Float32Array(16)
        },
        programInfo: programInfoShader,
        bufferInfo: sphereBufferInfo,
    };
    // connect the celetial objects
    solarSystemNode.localMatrix = Matrix_1.glMatrix.mat4.scaling(null, 0.5, 0.5, 0.5);
    sunNode.setParent(solarSystemNode);
    earthOrbitNode.setParent(solarSystemNode);
    earthNode.setParent(earthOrbitNode);
    moonOrbitNode.setParent(earthOrbitNode);
    moonNode.setParent(moonOrbitNode);
    var objects = [
        sunNode,
        earthNode,
        moonNode,
    ];
    var objectsToDraw = [
        sunNode.drawInfo,
        earthNode.drawInfo,
        moonNode.drawInfo,
    ];
    requestAnimationFrame(drawScene);
    // Draw the scene.
    function drawScene(time) {
        time *= 0.0005;
        Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        // Clear the canvas AND the depth buffer.
        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = Matrix_1.glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, 1, 2000);
        // Compute the camera's matrix using look at.
        var cameraPosition = [0, -200, 0];
        var target = [0, 0, 0];
        var up = [0, 0, 1];
        var cameraMatrix = Matrix_1.glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
        // Make a view matrix from the camera matrix.
        var viewMatrix = Matrix_1.glMatrix.mat4.invert(null, cameraMatrix);
        // var viewMatrix = cameraMatrix;
        var viewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
        // update the local matrices for each object.
        Matrix_1.glMatrix.mat4.multiply(earthOrbitNode.localMatrix, Matrix_1.glMatrix.mat4.rotateY(null, Matrix_1.glMatrix.mat4.identity(null), 0.01), earthOrbitNode.localMatrix);
        Matrix_1.glMatrix.mat4.multiply(moonOrbitNode.localMatrix, Matrix_1.glMatrix.mat4.rotateY(null, Matrix_1.glMatrix.mat4.identity(null), 0.01), moonOrbitNode.localMatrix);
        // spin the earth
        Matrix_1.glMatrix.mat4.multiply(earthNode.localMatrix, Matrix_1.glMatrix.mat4.rotateY(null, Matrix_1.glMatrix.mat4.identity(null), 0.05), earthNode.localMatrix);
        // spin the moon
        Matrix_1.glMatrix.mat4.multiply(moonNode.localMatrix, Matrix_1.glMatrix.mat4.rotateY(null, Matrix_1.glMatrix.mat4.identity(null), -0.01), moonNode.localMatrix);
        Matrix_1.glMatrix.mat4.multiply(sunNode.localMatrix, Matrix_1.glMatrix.mat4.rotateY(null, Matrix_1.glMatrix.mat4.identity(null), -0.01), sunNode.localMatrix);
        // Update all world matrices in the scene graph
        solarSystemNode.updateWorldMatrix();
        // Compute all the matrices for rendering
        objects.forEach(function (object) {
            object.drawInfo.uniforms.u_matrix = Matrix_1.glMatrix.mat4.multiply(null, viewProjectionMatrix, object.worldMatrix);
        });
        // ------ Draw the objects --------
        var lastUsedProgramInfo = null;
        var lastUsedBufferInfo = null;
        objectsToDraw.forEach(function (object) {
            var programInfo = object.programInfo;
            var bufferInfo = object.bufferInfo;
            var bindBuffers = false;
            if (programInfo !== lastUsedProgramInfo) {
                lastUsedProgramInfo = programInfo;
                gl.useProgram(programInfo.spGlID);
                // We have to rebind buffers when changing programs because we
                // only bind buffers the program uses. So if 2 programs use the same
                // bufferInfo but the 1st one uses only positions the when the
                // we switch to the 2nd one some of the attributes will not be on.
                bindBuffers = true;
            }
            // Setup all the needed attributes.
            if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
                lastUsedBufferInfo = bufferInfo;
                Shader_1.G_ShaderFactory.setBuffersAndAttributes(programInfo.attrSetters, bufferInfo);
            }
            // Set the uniforms.
            Shader_1.G_ShaderFactory.setUniforms(programInfo.uniSetters, object.uniforms);
            Shader_1.G_ShaderFactory.drawBufferInfo(bufferInfo);
        });
        requestAnimationFrame(drawScene);
    }
    var elem = document.querySelector('#screenshot');
    elem.addEventListener('click', function () {
        drawScene(0);
        console.log("click--------");
        gl.canvas.toBlob(function (blob) {
            saveBlob(blob, "screencapture-" + gl.canvas.width + "x" + gl.canvas.height + ".png");
        });
    });
    var saveBlob = (function () {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        return function saveData(blob, fileName) {
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
        };
    }());
}
var EarthSunTest = /** @class */ (function () {
    function EarthSunTest() {
    }
    EarthSunTest.run = function () {
        main();
    };
    return EarthSunTest;
}());
exports.default = EarthSunTest;
//# sourceMappingURL=EarthSunTest.js.map