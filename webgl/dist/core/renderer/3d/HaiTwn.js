"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var shader3d = 'attribute vec4 a_POSITION;' +
    'attribute vec3 a_NORMAL;' +
    'uniform mat4 u_projection;' +
    'uniform mat4 u_view;' +
    'uniform mat4 u_world;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    'gl_Position = u_projection * u_view * u_world * a_POSITION;' +
    'v_normal = mat3(u_world) * a_NORMAL;' +
    '}';
var frag3d = 'precision mediump float;' +
    'varying vec3 v_normal;' +
    'uniform vec4 u_diffuse;' +
    'uniform vec3 u_lightDirection;' +
    'void main () {' +
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(u_lightDirection, normal) * .5 + .5;' +
    'gl_FragColor = vec4(u_diffuse.rgb * light, u_diffuse.a);' +
    '}';
"use strict";
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
                var gltf, baseURL, _a, defaultMaterial, origNodes, _i, _b, scene;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, loadJSON(url)];
                        case 1:
                            gltf = _c.sent();
                            baseURL = new URL(url, location.href);
                            _a = gltf;
                            return [4 /*yield*/, Promise.all(gltf.buffers.map(function (buffer) {
                                    var url = new URL(buffer.uri, baseURL.href);
                                    return loadBinary(url.href);
                                }))];
                        case 2:
                            _a.buffers = _c.sent();
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
                            origNodes = gltf.nodes;
                            gltf.nodes = gltf.nodes.map(function (n) {
                                var name = n.name, skin = n.skin, mesh = n.mesh, translation = n.translation, rotation = n.rotation, scale = n.scale;
                                var trs = new TRS(translation, rotation, scale);
                                var node = new NodeZM(trs, name);
                                var realMesh = gltf.meshes[mesh];
                                if (realMesh) {
                                    node.drawables.push(new MeshRenderer(realMesh));
                                }
                                return node;
                            });
                            // arrange nodes into graph
                            gltf.nodes.forEach(function (node, ndx) {
                                var children = origNodes[ndx].children;
                                if (children) {
                                    addChildren(gltf.nodes, node, children);
                                }
                            });
                            // setup scenes
                            for (_i = 0, _b = gltf.scenes; _i < _b.length; _i++) {
                                scene = _b[_i];
                                scene.root = new NodeZM(new TRS(), scene.name);
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
            webglUtils.resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.clearColor(.1, .1, .1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            var fieldOfViewRadians = degToRad(60);
            var aspect = gl.canvas.width / gl.canvas.height;
            var projection = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
            // camera going in circle 2 units from origin looking at origin
            var cameraRadius = 10;
            var cameraPosition = [Math.cos(time * .1) * cameraRadius, 0, Math.sin(time * .1) * cameraRadius];
            var target = [0, 0, -2];
            var up = [0, 1, 0];
            // Compute the camera's matrix using look at.
            var camera = m4.lookAt(cameraPosition, target, up);
            // Make a view matrix from the camera matrix.
            var view = m4.inverse(camera);
            var sharedUniforms = {
                u_lightDirection: m4.normalize([-1, 3, 5]),
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
        var webglUtils, m4, gl, ext, meshProgramInfo, TRS, NodeZM, MeshRenderer, accessorTypeToNumComponentsMap, glTypeToTypedArrayMap, gltf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    webglUtils = window["webglUtils"];
                    m4 = window["m4"];
                    gl = Device_1.default.Instance.gl;
                    if (!gl) {
                        return [2 /*return*/];
                    }
                    ext = gl.getExtension('OES_texture_float');
                    if (!ext) {
                        return [2 /*return*/]; // the extension doesn't exist on this device
                    }
                    meshProgramInfo = webglUtils.createProgramInfo(gl, [shader3d, frag3d]);
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
                    NodeZM = /** @class */ (function () {
                        function NodeZM(source, name) {
                            this.name = name;
                            this.source = source;
                            this.parent = null;
                            this.children = [];
                            this.localMatrix = m4.identity();
                            this.worldMatrix = m4.identity();
                            this.drawables = [];
                        }
                        NodeZM.prototype.setParent = function (parent) {
                            if (this.parent) {
                                this.parent._removeChild(this);
                                this.parent = null;
                            }
                            if (parent) {
                                parent._addChild(this);
                                this.parent = parent;
                            }
                        };
                        NodeZM.prototype.updateWorldMatrix = function (parentWorldMatrix) {
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
                        NodeZM.prototype.traverse = function (fn) {
                            fn(this);
                            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                                var child = _a[_i];
                                child.traverse(fn);
                            }
                        };
                        NodeZM.prototype._addChild = function (child) {
                            this.children.push(child);
                        };
                        NodeZM.prototype._removeChild = function (child) {
                            var ndx = this.children.indexOf(child);
                            this.children.splice(ndx, 1);
                        };
                        return NodeZM;
                    }());
                    MeshRenderer = /** @class */ (function () {
                        function MeshRenderer(mesh) {
                            this.mesh = mesh;
                        }
                        MeshRenderer.prototype.render = function (node, projection, view, sharedUniforms) {
                            var mesh = this.mesh;
                            gl.useProgram(meshProgramInfo.program);
                            for (var _i = 0, _a = mesh.primitives; _i < _a.length; _i++) {
                                var primitive = _a[_i];
                                webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, primitive.bufferInfo);
                                webglUtils.setUniforms(meshProgramInfo, {
                                    u_projection: projection,
                                    u_view: view,
                                    u_world: node.worldMatrix,
                                });
                                webglUtils.setUniforms(meshProgramInfo, primitive.material.uniforms);
                                webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
                                webglUtils.drawBufferInfo(gl, primitive.bufferInfo);
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
                    return [4 /*yield*/, loadGLTF('https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf')];
                case 1:
                    gltf = _a.sent();
                    requestAnimationFrame(render);
                    return [2 /*return*/];
            }
        });
    });
}
var HaiTwn = /** @class */ (function () {
    function HaiTwn() {
    }
    HaiTwn.run = function () {
        main();
        ;
    };
    return HaiTwn;
}());
exports.default = HaiTwn;
//# sourceMappingURL=HaiTwn.js.map