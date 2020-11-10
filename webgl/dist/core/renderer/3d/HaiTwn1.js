"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var Shader_1 = require("../../../Shader");
var Matrix_1 = require("../../Matrix");
var skinVS = 'attribute vec4 a_POSITION;' +
    'attribute vec3 a_NORMAL;' +
    'attribute vec4 a_WEIGHTS_0;' +
    'attribute vec4 a_JOINTS_0;' +
    'uniform mat4 u_projection;' +
    'uniform mat4 u_view;' +
    'uniform mat4 u_world;' +
    'uniform sampler2D u_jointTexture;' +
    'uniform float u_numJoints;' +
    'varying vec3 v_normal;' +
    // '#define ROW0_U ((0.5 + 0.0) / 4.)'+
    // '#define ROW1_U ((0.5 + 1.0) / 4.)'+
    // '#define ROW2_U ((0.5 + 2.0) / 4.)'+
    // '#define ROW3_U ((0.5 + 3.0) / 4.)'+
    'mat4 getBoneMatrix(float jointNdx) {' +
    'float v = (jointNdx + 0.5) / u_numJoints;' +
    'return mat4(' +
    'texture2D(u_jointTexture, vec2(((0.5 + 0.0) / 4.), v)),' +
    'texture2D(u_jointTexture, vec2(((0.5 + 1.0) / 4.), v)),' +
    'texture2D(u_jointTexture, vec2(((0.5 + 2.0) / 4.), v)),' +
    'texture2D(u_jointTexture, vec2(((0.5 + 3.0) / 4.), v)));' +
    '}' +
    'void main() {' +
    'mat4 skinMatrix = getBoneMatrix(a_JOINTS_0[0]) * a_WEIGHTS_0[0] +' +
    'getBoneMatrix(a_JOINTS_0[1]) * a_WEIGHTS_0[1] +' +
    'getBoneMatrix(a_JOINTS_0[2]) * a_WEIGHTS_0[2] +' +
    'getBoneMatrix(a_JOINTS_0[3]) * a_WEIGHTS_0[3];' +
    'mat4 world = u_world * skinMatrix;' +
    'gl_Position = u_projection * u_view * world * a_POSITION;' +
    'v_normal = mat3(world) * a_NORMAL;' +
    '}';
var meshVS = 'attribute vec4 a_POSITION;' +
    'attribute vec3 a_NORMAL;' +
    'uniform mat4 u_projection;' +
    'uniform mat4 u_view;' +
    'uniform mat4 u_world;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    'gl_Position = u_projection * u_view * u_world * a_POSITION;' +
    'v_normal = mat3(u_world) * a_NORMAL;' +
    '}';
var fs = 'precision mediump float;' +
    'varying vec3 v_normal;' +
    'uniform vec4 u_diffuse;' +
    'uniform vec3 u_lightDirection;' +
    'void main () {' +
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(u_lightDirection, normal) * .5 + .5;' +
    'gl_FragColor = vec4(u_diffuse.rgb * light, u_diffuse.a);' +
    '}';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function throwNoKey(key) {
            throw new Error("no key: " + key);
        }
        function accessorTypeToNumComponents(type) {
            return accessorTypeToNumComponentsMap[type] || throwNoKey(type);
        }
        // Given a GL type return the TypedArray needed
        function glTypeToTypedArray(type) {
            return glTypeToTypedArrayMap[type] || throwNoKey(type);
        }
        // given an accessor index return both the accessor and
        // a TypedArray for the correct portion of the buffer
        function getAccessorTypedArrayAndStride(gl, gltf, accessorIndex) {
            var accessor = gltf.accessors[accessorIndex];
            var bufferView = gltf.bufferViews[accessor.bufferView];
            var TypedArray = glTypeToTypedArray(accessor.componentType);
            var buffer = gltf.buffers[bufferView.buffer];
            return {
                accessor: accessor,
                array: new TypedArray(buffer, bufferView.byteOffset + (accessor.byteOffset || 0), accessor.count * accessorTypeToNumComponents(accessor.type)),
                stride: bufferView.byteStride || 0,
            };
        }
        // Given an accessor index return a WebGLBuffer and a stride
        function getAccessorAndWebGLBuffer(gl, gltf, accessorIndex) {
            var accessor = gltf.accessors[accessorIndex];
            var bufferView = gltf.bufferViews[accessor.bufferView];
            if (!bufferView.webglBuffer) {
                var buffer = gl.createBuffer();
                var target = bufferView.target || gl.ARRAY_BUFFER;
                var arrayBuffer = gltf.buffers[bufferView.buffer];
                var data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
                gl.bindBuffer(target, buffer);
                gl.bufferData(target, data, gl.STATIC_DRAW);
                bufferView.webglBuffer = buffer;
            }
            return {
                accessor: accessor,
                buffer: bufferView.webglBuffer,
                stride: bufferView.stride || 0,
            };
        }
        function loadGLTF(url) {
            return __awaiter(this, void 0, void 0, function () {
                var gltf, baseURL, _a, defaultMaterial, skinNodes, origNodes, _i, skinNodes_1, _b, node, mesh, skinNdx, _c, _d, scene;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, loadJSON(url)];
                        case 1:
                            gltf = _e.sent();
                            baseURL = new URL(url, location.href);
                            _a = gltf;
                            return [4 /*yield*/, Promise.all(gltf.buffers.map(function (buffer) {
                                    var url = new URL(buffer.uri, baseURL.href);
                                    return loadBinary(url.href);
                                }))];
                        case 2:
                            _a.buffers = _e.sent();
                            defaultMaterial = {
                                uniforms: {
                                    u_diffuse: [.5, .8, 1, 1],
                                },
                            };
                            // setup meshes
                            gltf.meshes.forEach(function (mesh) {
                                mesh.primitives.forEach(function (primitive) {
                                    var attribs = {};
                                    var numElements;
                                    for (var _i = 0, _a = Object.entries(primitive.attributes); _i < _a.length; _i++) {
                                        var _b = _a[_i], attribName = _b[0], index = _b[1];
                                        var _c = getAccessorAndWebGLBuffer(gl, gltf, index), accessor = _c.accessor, buffer = _c.buffer, stride = _c.stride;
                                        numElements = accessor.count;
                                        attribs["a_" + attribName] = {
                                            buffer: buffer,
                                            type: accessor.componentType,
                                            numComponents: accessorTypeToNumComponents(accessor.type),
                                            stride: stride,
                                            offset: accessor.byteOffset | 0,
                                        };
                                    }
                                    var bufferInfo = {
                                        attribs: attribs,
                                        numElements: numElements,
                                    };
                                    if (primitive.indices !== undefined) {
                                        var _d = getAccessorAndWebGLBuffer(gl, gltf, primitive.indices), accessor = _d.accessor, buffer = _d.buffer;
                                        bufferInfo.numElements = accessor.count;
                                        bufferInfo.indices = buffer;
                                        bufferInfo.elementType = accessor.componentType;
                                    }
                                    primitive.bufferInfo = bufferInfo;
                                    // save the material info for this primitive
                                    primitive.material = gltf.materials && gltf.materials[primitive.material] || defaultMaterial;
                                });
                            });
                            skinNodes = [];
                            origNodes = gltf.nodes;
                            gltf.nodes = gltf.nodes.map(function (n) {
                                var name = n.name, skin = n.skin, mesh = n.mesh, translation = n.translation, rotation = n.rotation, scale = n.scale;
                                var trs = new TRS(translation, rotation, scale);
                                var node = new Node(trs, name);
                                var realMesh = gltf.meshes[mesh];
                                if (skin !== undefined) {
                                    skinNodes.push({ node: node, mesh: realMesh, skinNdx: skin });
                                }
                                else if (realMesh) {
                                    node.drawables.push(new MeshRenderer(realMesh));
                                }
                                return node;
                            });
                            // setup skins
                            gltf.skins = gltf.skins.map(function (skin) {
                                var joints = skin.joints.map(function (ndx) { return gltf.nodes[ndx]; });
                                var array = getAccessorTypedArrayAndStride(gl, gltf, skin.inverseBindMatrices).array;
                                return new Skin(joints, array);
                            });
                            // Add SkinRenderers to nodes with skins
                            for (_i = 0, skinNodes_1 = skinNodes; _i < skinNodes_1.length; _i++) {
                                _b = skinNodes_1[_i], node = _b.node, mesh = _b.mesh, skinNdx = _b.skinNdx;
                                node.drawables.push(new SkinRenderer(mesh, gltf.skins[skinNdx]));
                            }
                            // arrange nodes into graph
                            gltf.nodes.forEach(function (node, ndx) {
                                var children = origNodes[ndx].children;
                                if (children) {
                                    addChildren(gltf.nodes, node, children);
                                }
                            });
                            // setup scenes
                            for (_c = 0, _d = gltf.scenes; _c < _d.length; _c++) {
                                scene = _d[_c];
                                scene.root = new Node(new TRS(), scene.name);
                                addChildren(gltf.nodes, scene.root, scene.nodes);
                            }
                            return [2 /*return*/, gltf];
                    }
                });
            });
        }
        function addChildren(nodes, node, childIndices) {
            childIndices.forEach(function (childNdx) {
                var child = nodes[childNdx];
                child.setParent(node);
            });
        }
        function loadFile(url, typeFunc) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch(url)];
                        case 1:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error("could not load: " + url);
                            }
                            return [4 /*yield*/, response[typeFunc]()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        function loadBinary(url) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, loadFile(url, 'arrayBuffer')];
                });
            });
        }
        function loadJSON(url) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, loadFile(url, 'json')];
                });
            });
        }
        function degToRad(deg) {
            return deg * Math.PI / 180;
        }
        function render(time) {
            time *= 0.001; // convert to seconds
            Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.clearColor(.1, .1, .1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            var fieldOfViewRadians = degToRad(60);
            var aspect = gl.canvas.width / gl.canvas.height;
            var projection = Matrix_1.glMatrix.mat4.create();
            Matrix_1.glMatrix.mat4.perspective(projection, fieldOfViewRadians, aspect, 1, 2000);
            var cameraPosition = [10, 0, -5];
            var target = [0, 0, -10];
            // for debugging .. see article
            // const cameraPosition = [5, 0, 5];
            // const target = [0, 0, 0];
            var up = [0, 1, 0];
            // Compute the camera's matrix using look at.
            var camera = Matrix_1.glMatrix.mat4.create();
            Matrix_1.glMatrix.mat4.lookAt(camera, cameraPosition, target, up);
            // Make a view matrix from the camera matrix.
            var view = Matrix_1.glMatrix.mat4.create();
            Matrix_1.glMatrix.mat4.invert(view, camera);
            animSkin(gltf.skins[0], Math.sin(time) * .5);
            var lightDirection = Matrix_1.glMatrix.vec3.create();
            Matrix_1.glMatrix.vec3.normalize(lightDirection, [-1, 3, 5]);
            var sharedUniforms = {
                u_lightDirection: lightDirection,
            };
            function renderDrawables(node) {
                for (var _i = 0, _a = node.drawables; _i < _a.length; _i++) {
                    var drawable = _a[_i];
                    drawable.render(node, projection, view, sharedUniforms);
                }
            }
            for (var _i = 0, _a = gltf.scenes; _i < _a.length; _i++) {
                var scene = _a[_i];
                // updatte all world matices in the scene.
                scene.root.updateWorldMatrix();
                // walk the scene and render all renderables
                scene.root.traverse(renderDrawables);
            }
            requestAnimationFrame(render);
        }
        var m4, gl, ext, skinProgramInfo, meshProgramInfo, Skin, TRS, Node, SkinRenderer, MeshRenderer, accessorTypeToNumComponentsMap, glTypeToTypedArrayMap, gltf, origMatrices, animSkin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    m4 = window["m4"];
                    gl = Device_1.default.Instance.gl;
                    // var shaderUtil = new Shader(gl);
                    if (!gl) {
                        return [2 /*return*/];
                    }
                    ext = gl.getExtension('OES_texture_float');
                    if (!ext) {
                        console.log("the extension doesn't exist on this device");
                        return [2 /*return*/]; // 
                    }
                    skinProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(skinVS, fs);
                    meshProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(meshVS, fs);
                    Skin = /** @class */ (function () {
                        function Skin(joints, inverseBindMatrixData) {
                            this.joints = joints;
                            this.inverseBindMatrices = [];
                            this.jointMatrices = [];
                            // allocate enough space for one matrix per joint
                            this.jointData = new Float32Array(joints.length * 16);
                            // create views for each joint and inverseBindMatrix
                            for (var i = 0; i < joints.length; ++i) {
                                this.inverseBindMatrices.push(new Float32Array(inverseBindMatrixData.buffer, inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i, 16));
                                this.jointMatrices.push(new Float32Array(this.jointData.buffer, Float32Array.BYTES_PER_ELEMENT * 16 * i, 16));
                            }
                            // create a texture to hold the joint matrices
                            this.jointTexture = gl.createTexture();
                            gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        }
                        Skin.prototype.update = function (node) {
                            var globalWorldInverse = Matrix_1.glMatrix.mat4.create();
                            Matrix_1.glMatrix.mat4.invert(globalWorldInverse, node.worldMatrix);
                            // go through each joint and get its current worldMatrix
                            // apply the inverse bind matrices and store the
                            // entire result in the texture
                            for (var j = 0; j < this.joints.length; ++j) {
                                var joint = this.joints[j];
                                var dst = this.jointMatrices[j];
                                m4.multiply(globalWorldInverse, joint.worldMatrix, dst);
                                m4.multiply(dst, this.inverseBindMatrices[j], dst);
                            }
                            gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, this.joints.length, 0, gl.RGBA, gl.FLOAT, this.jointData);
                        };
                        return Skin;
                    }());
                    TRS = /** @class */ (function () {
                        function TRS(position, rotation, scale) {
                            if (position === void 0) { position = [0, 0, 0]; }
                            if (rotation === void 0) { rotation = [0, 0, 0, 1]; }
                            if (scale === void 0) { scale = [1, 1, 1]; }
                            this.position = position;
                            this.rotation = rotation;
                            this.scale = scale;
                        }
                        TRS.prototype.getMatrix = function (dst) {
                            dst = dst || new Float32Array(16);
                            m4.compose(this.position, this.rotation, this.scale, dst);
                            return dst;
                        };
                        return TRS;
                    }());
                    Node = /** @class */ (function () {
                        function Node(source, name) {
                            this.drawables = [];
                            this.name = name;
                            this.source = source;
                            this.parent = null;
                            this.children = [];
                            this.localMatrix = m4.identity();
                            this.worldMatrix = m4.identity();
                            this.drawables = [];
                        }
                        Node.prototype.setParent = function (parent) {
                            if (this.parent) {
                                this.parent._removeChild(this);
                                this.parent = null;
                            }
                            if (parent) {
                                parent._addChild(this);
                                this.parent = parent;
                            }
                        };
                        Node.prototype.updateWorldMatrix = function (parentWorldMatrix) {
                            var source = this.source;
                            if (source) {
                                source.getMatrix(this.localMatrix);
                            }
                            if (parentWorldMatrix) {
                                // a matrix was passed in so do the math
                                m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
                            }
                            else {
                                // no matrix was passed in so just copy local to world
                                m4.copy(this.localMatrix, this.worldMatrix);
                            }
                            // now process all the children
                            var worldMatrix = this.worldMatrix;
                            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                                var child = _a[_i];
                                child.updateWorldMatrix(worldMatrix);
                            }
                        };
                        Node.prototype.traverse = function (fn) {
                            fn(this);
                            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                                var child = _a[_i];
                                child.traverse(fn);
                            }
                        };
                        Node.prototype._addChild = function (child) {
                            this.children.push(child);
                        };
                        Node.prototype._removeChild = function (child) {
                            var ndx = this.children.indexOf(child);
                            this.children.splice(ndx, 1);
                        };
                        return Node;
                    }());
                    SkinRenderer = /** @class */ (function () {
                        function SkinRenderer(mesh, skin) {
                            this.mesh = mesh;
                            this.skin = skin;
                        }
                        SkinRenderer.prototype.render = function (node, projection, view, sharedUniforms) {
                            var _a = this, skin = _a.skin, mesh = _a.mesh;
                            skin.update(node);
                            gl.useProgram(skinProgramInfo.spGlID);
                            for (var _i = 0, _b = mesh.primitives; _i < _b.length; _i++) {
                                var primitive = _b[_i];
                                Shader_1.G_ShaderFactory.setBuffersAndAttributes(skinProgramInfo.attrSetters, primitive.bufferInfo);
                                Shader_1.G_ShaderFactory.setUniforms(skinProgramInfo.uniSetters, {
                                    u_projection: projection,
                                    u_view: view,
                                    u_world: node.worldMatrix,
                                    u_jointTexture: skin.jointTexture,
                                    u_numJoints: skin.joints.length,
                                });
                                Shader_1.G_ShaderFactory.setUniforms(skinProgramInfo.uniSetters, primitive.material.uniforms);
                                Shader_1.G_ShaderFactory.setUniforms(skinProgramInfo.uniSetters, sharedUniforms);
                                Shader_1.G_ShaderFactory.drawBufferInfo(primitive.bufferInfo);
                            }
                        };
                        return SkinRenderer;
                    }());
                    MeshRenderer = /** @class */ (function () {
                        function MeshRenderer(mesh) {
                            this.mesh = mesh;
                        }
                        MeshRenderer.prototype.render = function (node, projection, view, sharedUniforms) {
                            var mesh = this.mesh;
                            gl.useProgram(meshProgramInfo.spGlID);
                            for (var _i = 0, _a = mesh.primitives; _i < _a.length; _i++) {
                                var primitive = _a[_i];
                                Shader_1.G_ShaderFactory.setBuffersAndAttributes(meshProgramInfo.attrSetters, primitive.bufferInfo);
                                Shader_1.G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, {
                                    u_projection: projection,
                                    u_view: view,
                                    u_world: node.worldMatrix,
                                });
                                Shader_1.G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, primitive.material.uniforms);
                                Shader_1.G_ShaderFactory.setUniforms(meshProgramInfo.uniSetters, sharedUniforms);
                                Shader_1.G_ShaderFactory.drawBufferInfo(gl, primitive.bufferInfo);
                            }
                        };
                        return MeshRenderer;
                    }());
                    accessorTypeToNumComponentsMap = {
                        'SCALAR': 1,
                        'VEC2': 2,
                        'VEC3': 3,
                        'VEC4': 4,
                        'MAT2': 4,
                        'MAT3': 9,
                        'MAT4': 16,
                    };
                    glTypeToTypedArrayMap = {
                        '5120': Int8Array,
                        '5121': Uint8Array,
                        '5122': Int16Array,
                        '5123': Uint16Array,
                        '5124': Int32Array,
                        '5125': Uint32Array,
                        '5126': Float32Array,
                    };
                    console.log("time-start---", Date.now());
                    return [4 /*yield*/, loadGLTF('https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf')];
                case 1:
                    gltf = _a.sent();
                    console.log("time-end---", Date.now(), gltf);
                    origMatrices = new Map();
                    animSkin = function (skin, a) {
                        for (var i = 0; i < skin.joints.length; ++i) {
                            var joint = skin.joints[i];
                            // if there is no matrix saved for this joint
                            if (!origMatrices.has(joint)) {
                                // save a matrix for joint
                                origMatrices.set(joint, joint.source.getMatrix());
                            }
                            // get the original matrix
                            var origMatrix = origMatrices.get(joint);
                            // rotate it
                            var m = Matrix_1.glMatrix.mat4.create();
                            Matrix_1.glMatrix.mat4.rotateX(m, origMatrix, a);
                            // decompose it back into position, rotation, scale
                            // into the joint
                            Matrix_1.glMatrix.mat4.decompose(m, joint.source.position, joint.source.rotation, joint.source.scale);
                        }
                    };
                    requestAnimationFrame(render);
                    return [2 /*return*/];
            }
        });
    });
}
var HaiTwn1 = /** @class */ (function () {
    function HaiTwn1() {
    }
    HaiTwn1.run = function () {
        main();
    };
    return HaiTwn1;
}());
exports.default = HaiTwn1;
//# sourceMappingURL=HaiTwn1.js.map