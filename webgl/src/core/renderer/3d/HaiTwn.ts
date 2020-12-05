import Device from "../../Device";

var shader3d =
    'attribute vec4 a_POSITION;' +
    'attribute vec3 a_NORMAL;' +
    'uniform mat4 u_projection;' +
    'uniform mat4 u_view;' +
    'uniform mat4 u_world;' +
    'varying vec3 v_normal;' +
    'void main() {' +
    'gl_Position = u_projection * u_view * u_world * a_POSITION;' +
    'v_normal = mat3(u_world) * a_NORMAL;' +
    '}'
var frag3d =
    'precision mediump float;' +
    'varying vec3 v_normal;' +
    'uniform vec4 u_diffuse;' +
    'uniform vec3 u_lightDirection;' +
    'void main () {' +
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(u_lightDirection, normal) * .5 + .5;' +
    'gl_FragColor = vec4(u_diffuse.rgb * light, u_diffuse.a);' +
    '}'

"use strict";

async function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var webglUtils = window["webglUtils"];
    var m4 = window["m4"];
    var gl = Device.Instance.gl;
    if (!gl) {
        return;
    }
    const ext = gl.getExtension('OES_texture_float');
    if (!ext) {
        return;  // the extension doesn't exist on this device
    }

    // compiles and links the shaders, looks up attribute and uniform locations
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [shader3d, frag3d]);

    class TRS {
        constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
            this.position = position;
            this.rotation = rotation;
            this.scale = scale;
        }
        public position;
        public rotation;
        public scale;
        getMatrix(dst) {
            dst = dst || new Float32Array(16);
            m4.compose(this.position, this.rotation, this.scale, dst);
            return dst;
        }
    }

    class NodeZM {
        constructor(source, name) {
            this.name = name;
            this.source = source;
            this.parent = null;
            this.children = [];
            this.localMatrix = m4.identity();
            this.worldMatrix = m4.identity();
            this.drawables = [];
        }
        public name;
        public source;
        public parent;
        public children;
        public localMatrix;
        public worldMatrix;
        public drawables;
        setParent(parent) {
            if (this.parent) {
                this.parent._removeChild(this);
                this.parent = null;
            }
            if (parent) {
                parent._addChild(this);
                this.parent = parent;
            }
        }
        updateWorldMatrix(parentWorldMatrix) {
            const source = this.source;
            if (source) {
                source.getMatrix(this.localMatrix);
            }

            if (parentWorldMatrix) {
                // a matrix was passed in so do the math
                m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
            } else {
                // no matrix was passed in so just copy local to world
                m4.copy(this.localMatrix, this.worldMatrix);
            }

            // now process all the children
            const worldMatrix = this.worldMatrix;
            for (const child of this.children) {
                child.updateWorldMatrix(worldMatrix);
            }
        }
        traverse(fn) {
            fn(this);
            for (const child of this.children) {
                child.traverse(fn);
            }
        }
        _addChild(child) {
            this.children.push(child);
        }
        _removeChild(child) {
            const ndx = this.children.indexOf(child);
            this.children.splice(ndx, 1);
        }
    }

    class MeshRenderer {
        constructor(mesh) {
            this.mesh = mesh;
        }
        public mesh;
        render(node, projection, view, sharedUniforms) {
            const { mesh } = this;
            gl.useProgram(meshProgramInfo.program);
            for (const primitive of mesh.primitives) {
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
        }
    }

    function throwNoKey(key) {
        throw new Error(`no key: ${key}`);
    }

    const accessorTypeToNumComponentsMap = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16,
    };

    function accessorTypeToNumComponents(type) {
        return accessorTypeToNumComponentsMap[type] || throwNoKey(type);
    }

    const glTypeToTypedArrayMap = {
        '5120': Int8Array,    // gl.BYTE
        '5121': Uint8Array,   // gl.UNSIGNED_BYTE
        '5122': Int16Array,   // gl.SHORT
        '5123': Uint16Array,  // gl.UNSIGNED_SHORT
        '5124': Int32Array,   // gl.INT
        '5125': Uint32Array,  // gl.UNSIGNED_INT
        '5126': Float32Array, // gl.FLOAT
    };


    // Given a GL type return the TypedArray needed
    function glTypeToTypedArray(type) {
        return glTypeToTypedArrayMap[type] || throwNoKey(type);
    }

    // given an accessor index return both the accessor and
    // a TypedArray for the correct portion of the buffer
    function getAccessorTypedArrayAndStride(gl, gltf, accessorIndex) {
        const accessor = gltf.accessors[accessorIndex];
        const bufferView = gltf.bufferViews[accessor.bufferView];
        const TypedArray = glTypeToTypedArray(accessor.componentType);
        const buffer = gltf.buffers[bufferView.buffer];
        return {
            accessor,
            array: new TypedArray(
                buffer,
                bufferView.byteOffset + (accessor.byteOffset || 0),
                accessor.count * accessorTypeToNumComponents(accessor.type)),
            stride: bufferView.byteStride || 0,
        };
    }

    // Given an accessor index return a WebGLBuffer and a stride
    function getAccessorAndWebGLBuffer(gl, gltf, accessorIndex) {
        const accessor = gltf.accessors[accessorIndex];
        const bufferView = gltf.bufferViews[accessor.bufferView];
        if (!bufferView.webglBuffer) {
            const buffer = gl.createBuffer();
            const target = bufferView.target || gl.ARRAY_BUFFER;
            const arrayBuffer = gltf.buffers[bufferView.buffer];
            const data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, data, gl.STATIC_DRAW);
            bufferView.webglBuffer = buffer;
        }
        return {
            accessor,
            buffer: bufferView.webglBuffer,
            stride: bufferView.stride || 0,
        };
    }

    async function loadGLTF(url) {
        const gltf = await loadJSON(url);

        // load all the referenced files relative to the gltf file
        const baseURL = new URL(url, location.href);
        gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
            const url = new URL(buffer.uri, baseURL.href);
            return loadBinary(url.href);
        }));

        const defaultMaterial = {
            uniforms: {
                u_diffuse: [.5, .8, 1, 1],
            },
        };

        // setup meshes
        gltf.meshes.forEach((mesh) => {
            mesh.primitives.forEach((primitive) => {
                const attribs = {};
                let numElements;
                for (const [attribName, index] of Object.entries(primitive.attributes)) {
                    const { accessor, buffer, stride } = getAccessorAndWebGLBuffer(gl, gltf, index);
                    numElements = accessor.count;
                    attribs[`a_${attribName}`] = {
                        buffer,
                        type: accessor.componentType,
                        numComponents: accessorTypeToNumComponents(accessor.type),
                        stride,
                        offset: accessor.byteOffset | 0,
                    };
                }

                const bufferInfo:any = {
                    attribs,
                    numElements,
                };

                if (primitive.indices !== undefined) {
                    const { accessor, buffer } = getAccessorAndWebGLBuffer(gl, gltf, primitive.indices);
                    bufferInfo.numElements = accessor.count;
                    bufferInfo.indices = buffer;
                    bufferInfo.elementType = accessor.componentType;
                }

                primitive.bufferInfo = bufferInfo;

                // save the material info for this primitive
                primitive.material = gltf.materials && gltf.materials[primitive.material] || defaultMaterial;
            });
        });

        const origNodes = gltf.nodes;
        gltf.nodes = gltf.nodes.map((n) => {
            const { name, skin, mesh, translation, rotation, scale } = n;
            const trs = new TRS(translation, rotation, scale);
            const node = new NodeZM(trs, name);
            const realMesh = gltf.meshes[mesh];
            if (realMesh) {
                node.drawables.push(new MeshRenderer(realMesh));
            }
            return node;
        });

        // arrange nodes into graph
        gltf.nodes.forEach((node, ndx) => {
            const children = origNodes[ndx].children;
            if (children) {
                addChildren(gltf.nodes, node, children);
            }
        });

        // setup scenes
        for (const scene of gltf.scenes) {
            scene.root = new NodeZM(new TRS(), scene.name);
            addChildren(gltf.nodes, scene.root, scene.nodes);
        }

        return gltf;
    }

    function addChildren(nodes, node, childIndices) {
        childIndices.forEach((childNdx) => {
            const child = nodes[childNdx];
            child.setParent(node);
        });
    }

    async function loadFile(url, typeFunc) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`could not load: ${url}`);
        }
        return await response[typeFunc]();
    }

    async function loadBinary(url) {
        return loadFile(url, 'arrayBuffer');
    }

    async function loadJSON(url) {
        return loadFile(url, 'json');
    }

    const gltf = await loadGLTF('https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf');

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    function render(time) {
        time *= 0.001;  // convert to seconds

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(.1, .1, .1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.width / gl.canvas.height;
        const projection = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // camera going in circle 2 units from origin looking at origin
        const cameraRadius = 10;
        const cameraPosition = [Math.cos(time * .1) * cameraRadius, 0, Math.sin(time * .1) * cameraRadius];
        const target = [0, 0, -2];
        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        const camera = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        const view = m4.inverse(camera);

        const sharedUniforms = {
            u_lightDirection: m4.normalize([-1, 3, 5]),
        };

        function renderDrawables(node) {
            for (const drawable of node.drawables) {
                drawable.render(node, projection, view, sharedUniforms);
            }
        }

        for (const scene of gltf.scenes) {
            // updatte all world matices in the scene.
            scene.root.updateWorldMatrix();
            // walk the scene and render all renderables
            scene.root.traverse(renderDrawables);
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

export default class HaiTwn{
    static run(){
        main();;
    }
}

