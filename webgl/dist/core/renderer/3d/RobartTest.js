"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var LoaderManager_1 = require("../../../LoaderManager");
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
var TRS = /** @class */ (function () {
    function TRS() {
        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
    }
    ;
    TRS.prototype.getMatrix = function (dst) {
        dst = dst || new Float32Array(16);
        var t = this.translation;
        var r = this.rotation;
        var s = this.scale;
        Matrix_1.glMatrix.mat4.translation(dst, t[0], t[1], t[2]);
        Matrix_1.glMatrix.mat4.rotateX(dst, dst, r[0]);
        Matrix_1.glMatrix.mat4.rotateY(dst, dst, r[1]);
        Matrix_1.glMatrix.mat4.rotateZ(dst, dst, r[2]);
        Matrix_1.glMatrix.mat4.scale(dst, dst, [s[0], s[1], s[2]]);
        return dst;
    };
    ;
    return TRS;
}());
var Node = /** @class */ (function () {
    function Node(source) {
        this.children = [];
        this.localMatrix = Matrix_1.glMatrix.mat4.identity(null);
        this.worldMatrix = Matrix_1.glMatrix.mat4.identity(null);
        this.source = source;
    }
    ;
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
        var source = this.source;
        if (source) {
            source.getMatrix(this.localMatrix);
        }
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
function main() {
    var gl = Device_1.default.Instance.gl;
    if (!gl) {
        return;
    }
    // creates buffers with position, normal, texcoord, and vertex color
    // data for primitives by calling gl.createBuffer, gl.bindBuffer,
    // and gl.bufferData
    var cubeArrays = Primitives_1.syPrimitives.createCubeVertices(1);
    delete cubeArrays.normal;
    delete cubeArrays.texcoord;
    // cubeArrays.color = colorVerts;
    var cubeBufferInfo = Shader_1.G_ShaderFactory.createBufferInfoFromArrays(cubeArrays);
    // setup GLSL program
    var programInfo = Shader_1.G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    var cameraAngleRadians = MathUtils_1.MathUtils.degToRad(0);
    var fieldOfViewRadians = MathUtils_1.MathUtils.degToRad(60);
    var cameraHeight = 50;
    var objectsToDraw = [];
    var objects = [];
    var nodeInfosByName = {};
    // Let's make all the nodes
    var blockGuyNodeDescriptions = LoaderManager_1.default.instance.getCacheData("res/models/Robart/blockGuyNodeDescriptions.json");
    function makeNode(nodeDescription) {
        var trs = new TRS();
        var node = new Node(trs);
        nodeInfosByName[nodeDescription.name] = {
            trs: trs,
            node: node,
        };
        trs.translation = nodeDescription.translation || trs.translation;
        if (nodeDescription.draw !== false) {
            node.drawInfo = {
                uniforms: {
                    u_colorOffset: [0, 0, 0.6, 0],
                    u_colorMult: [0.4, 0.4, 0.4, 1],
                    u_matrix: new Float32Array(16)
                },
                programInfo: programInfo,
                bufferInfo: cubeBufferInfo,
            };
            objectsToDraw.push(node.drawInfo);
            objects.push(node);
        }
        makeNodes(nodeDescription.children).forEach(function (child) {
            child.setParent(node);
        });
        return node;
    }
    function makeNodes(nodeDescriptions) {
        return nodeDescriptions ? nodeDescriptions.map(makeNode) : [];
    }
    var scene = makeNode(blockGuyNodeDescriptions);
    requestAnimationFrame(drawScene);
    // Draw the scene.
    function drawScene(time) {
        time *= 0.001;
        Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Compute the projection matrix
        var aspect = gl.canvas.width / gl.canvas.height;
        var projectionMatrix = Matrix_1.glMatrix.mat4.perspective(null, fieldOfViewRadians, aspect, 1, 2000);
        // Compute the camera's matrix using look at.
        var cameraPosition = [4, 3.5, 10];
        var target = [0, 3.5, 0];
        var up = [0, 1, 0];
        var cameraMatrix = Matrix_1.glMatrix.mat4.lookAt2(null, cameraPosition, target, up);
        // Make a view matrix from the camera matrix.
        var viewMatrix = Matrix_1.glMatrix.mat4.invert(null, cameraMatrix);
        var viewProjectionMatrix = Matrix_1.glMatrix.mat4.multiply(null, projectionMatrix, viewMatrix);
        // Draw objects
        // Update all world matrices in the scene graph
        scene.updateWorldMatrix();
        var adjust;
        var speed = 3;
        var c = time * speed;
        adjust = Math.abs(Math.sin(c));
        nodeInfosByName["point between feet"].trs.translation[1] = adjust;
        adjust = Math.sin(c);
        nodeInfosByName["left-leg"].trs.rotation[0] = adjust;
        nodeInfosByName["right-leg"].trs.rotation[0] = -adjust;
        adjust = Math.sin(c + 0.1) * 0.4;
        nodeInfosByName["left-calf"].trs.rotation[0] = -adjust;
        nodeInfosByName["right-calf"].trs.rotation[0] = adjust;
        adjust = Math.sin(c + 0.1) * 0.4;
        nodeInfosByName["left-foot"].trs.rotation[0] = -adjust;
        nodeInfosByName["right-foot"].trs.rotation[0] = adjust;
        adjust = Math.sin(c) * 0.4;
        nodeInfosByName["left-arm"].trs.rotation[2] = adjust;
        nodeInfosByName["right-arm"].trs.rotation[2] = adjust;
        adjust = Math.sin(c + 0.1) * 0.4;
        nodeInfosByName["left-forearm"].trs.rotation[2] = adjust;
        nodeInfosByName["right-forearm"].trs.rotation[2] = adjust;
        adjust = Math.sin(c - 0.1) * 0.4;
        nodeInfosByName["left-hand"].trs.rotation[2] = adjust;
        nodeInfosByName["right-hand"].trs.rotation[2] = adjust;
        adjust = Math.sin(c) * 0.4;
        nodeInfosByName["waist"].trs.rotation[1] = adjust;
        adjust = Math.sin(c) * 0.4;
        nodeInfosByName["torso"].trs.rotation[1] = adjust;
        adjust = Math.sin(c + 0.25) * 0.4;
        nodeInfosByName["neck"].trs.rotation[1] = adjust;
        adjust = Math.sin(c + 0.5) * 0.4;
        nodeInfosByName["head"].trs.rotation[1] = adjust;
        adjust = Math.cos(c * 2) * 0.4;
        nodeInfosByName["head"].trs.rotation[0] = adjust;
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
}
var RobartTest = /** @class */ (function () {
    function RobartTest() {
    }
    RobartTest.run = function () {
        main();
    };
    return RobartTest;
}());
exports.default = RobartTest;
//# sourceMappingURL=RobartTest.js.map