// import Device from "../../../Device";
// import { glMatrix } from "../../Matrix";
// /**
//  * 骨骼动画
//  */
// export namespace Spine{
//     var gl;
//     var m4 = glMatrix.mat4;
//     export function initSpine(context):void{
//         gl= context;
//     }
//     export class Skin {
//         public joints;
//         private inverseBindMatrices;
//         private jointMatrices;
//         private jointData;
//         private jointTexture;
//         constructor(joints, inverseBindMatrixData) {
//             this.joints = joints;
//             this.inverseBindMatrices = [];
//             this.jointMatrices = [];
//             // allocate enough space for one matrix per joint
//             this.jointData = new Float32Array(joints.length * 16);
//             // create views for each joint and inverseBindMatrix
//             for (let i = 0; i < joints.length; ++i) {
//                 this.inverseBindMatrices.push(new Float32Array(
//                     inverseBindMatrixData.buffer,
//                     inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i,
//                     16));
//                 this.jointMatrices.push(new Float32Array(
//                     this.jointData.buffer,
//                     Float32Array.BYTES_PER_ELEMENT * 16 * i,
//                     16));
//             }
//             // create a texture to hold the joint matrices
//             this.jointTexture = gl.createTexture();
//             gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//         }
//         update(node) {
//             const globalWorldInverse = m4.create();
//             m4.invert(globalWorldInverse,node.worldMatrix);
//             // go through each joint and get its current worldMatrix
//             // apply the inverse bind matrices and store the
//             // entire result in the texture
//             for (let j = 0; j < this.joints.length; ++j) {
//                 const joint = this.joints[j];
//                 const dst = this.jointMatrices[j];
//                 m4.multiply(globalWorldInverse, joint.worldMatrix, dst);
//                 m4.multiply(dst, this.inverseBindMatrices[j], dst);
//             }
//             gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
//             gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, this.joints.length, 0,
//                 gl.RGBA, gl.FLOAT, this.jointData);
//         }
//     }
//     export class TRS {
//         private position;
//         private rotation;
//         private scale;
//         constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
//             this.position = position;
//             this.rotation = rotation;
//             this.scale = scale;
//         }
//         getMatrix(dst) {
//             dst = dst || new Float32Array(16);
//             m4.compose(this.position, this.rotation, this.scale, dst);
//             return dst;
//         }
//     }
//     export class Node {
//         private name;
//         private source;
//         private parent;
//         private children;
//         private localMatrix;
//         public worldMatrix;
//         public drawables = [];
//         constructor(source, name) {
//             this.name = name;
//             this.source = source;
//             this.parent = null;
//             this.children = [];
//             this.localMatrix = m4.create();
//             m4.identity(this.localMatrix);
//             this.worldMatrix =m4.create();
//              m4.identity(this.worldMatrix);
//             this.drawables = [];
//         }
//         setParent(parent) {
//             if (this.parent) {
//                 this.parent._removeChild(this);
//                 this.parent = null;
//             }
//             if (parent) {
//                 parent._addChild(this);
//                 this.parent = parent;
//             }
//         }
//         updateWorldMatrix(parentWorldMatrix) {
//             const source = this.source;
//             if (source) {
//                 source.getMatrix(this.localMatrix);
//             }
//             if (parentWorldMatrix) {
//                 // a matrix was passed in so do the math
//                 m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
//             } else {
//                 // no matrix was passed in so just copy local to world
//                 m4.copy(this.localMatrix, this.worldMatrix);
//             }
//             // now process all the children
//             const worldMatrix = this.worldMatrix;
//             for (const child of this.children) {
//                 child.updateWorldMatrix(worldMatrix);
//             }
//         }
//         traverse(fn) {
//             fn(this);
//             for (const child of this.children) {
//                 child.traverse(fn);
//             }
//         }
//         _addChild(child) {
//             this.children.push(child);
//         }
//         _removeChild(child) {
//             const ndx = this.children.indexOf(child);
//             this.children.splice(ndx, 1);
//         }
//     }
//     export class SkinRenderer {
//         private mesh;
//         private skin;
//         constructor(mesh, skin) {
//             this.mesh = mesh;
//             this.skin = skin;
//         }
//         render(node:Spine.Node, projection, view, sharedUniforms) {
//             const { skin, mesh } = this;
//             skin.update(node);
//             gl.useProgram(skinProgramInfo.program);
//             for (const primitive of mesh.primitives) {
//                 webglUtils.setBuffersAndAttributes(gl, skinProgramInfo, primitive.bufferInfo);
//                 webglUtils.setUniforms(skinProgramInfo, {
//                     u_projection: projection,
//                     u_view: view,
//                     u_world: node.worldMatrix,
//                     u_jointTexture: skin.jointTexture,
//                     u_numJoints: skin.joints.length,
//                 });
//                 webglUtils.setUniforms(skinProgramInfo, primitive.material.uniforms);
//                 webglUtils.setUniforms(skinProgramInfo, sharedUniforms);
//                 webglUtils.drawBufferInfo(gl, primitive.bufferInfo);
//             }
//         }
//     }
//     export class MeshRenderer {
//         private mesh;
//         constructor(mesh) {
//             this.mesh = mesh;
//         }
//         render(node:Spine.Node, projection, view, sharedUniforms) {
//             const { mesh } = this;
//             gl.useProgram(meshProgramInfo.program);
//             for (const primitive of mesh.primitives) {
//                 webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, primitive.bufferInfo);
//                 webglUtils.setUniforms(meshProgramInfo, {
//                     u_projection: projection,
//                     u_view: view,
//                     u_world: node.worldMatrix,
//                 });
//                 webglUtils.setUniforms(meshProgramInfo, primitive.material.uniforms);
//                 webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
//                 webglUtils.drawBufferInfo(gl, primitive.bufferInfo);
//             }
//         }
//     }
//     function throwNoKey(key) {
//         throw new Error(`no key: ${key}`);
//     }
//     const accessorTypeToNumComponentsMap = {
//         'SCALAR': 1,
//         'VEC2': 2,
//         'VEC3': 3,
//         'VEC4': 4,
//         'MAT2': 4,
//         'MAT3': 9,
//         'MAT4': 16,
//     };
//     function accessorTypeToNumComponents(type) {
//         return accessorTypeToNumComponentsMap[type] || throwNoKey(type);
//     }
//     const glTypeToTypedArrayMap = {
//         '5120': Int8Array,    // gl.BYTE
//         '5121': Uint8Array,   // gl.UNSIGNED_BYTE
//         '5122': Int16Array,   // gl.SHORT
//         '5123': Uint16Array,  // gl.UNSIGNED_SHORT
//         '5124': Int32Array,   // gl.INT
//         '5125': Uint32Array,  // gl.UNSIGNED_INT
//         '5126': Float32Array, // gl.FLOAT
//     };
//     // Given a GL type return the TypedArray needed
//     function glTypeToTypedArray(type) {
//         return glTypeToTypedArrayMap[type] || throwNoKey(type);
//     }
//     // given an accessor index return both the accessor and
//     // a TypedArray for the correct portion of the buffer
//     function getAccessorTypedArrayAndStride(gl, gltf, accessorIndex) {
//         const accessor = gltf.accessors[accessorIndex];
//         const bufferView = gltf.bufferViews[accessor.bufferView];
//         const TypedArray = glTypeToTypedArray(accessor.componentType);
//         const buffer = gltf.buffers[bufferView.buffer];
//         return {
//             accessor,
//             array: new TypedArray(
//                 buffer,
//                 bufferView.byteOffset + (accessor.byteOffset || 0),
//                 accessor.count * accessorTypeToNumComponents(accessor.type)),
//             stride: bufferView.byteStride || 0,
//         };
//     }
//     // Given an accessor index return a WebGLBuffer and a stride
//     function getAccessorAndWebGLBuffer(gl, gltf, accessorIndex) {
//         const accessor = gltf.accessors[accessorIndex];
//         const bufferView = gltf.bufferViews[accessor.bufferView];
//         if (!bufferView.webglBuffer) {
//             const buffer = gl.createBuffer();
//             const target = bufferView.target || gl.ARRAY_BUFFER;
//             const arrayBuffer = gltf.buffers[bufferView.buffer];
//             const data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
//             gl.bindBuffer(target, buffer);
//             gl.bufferData(target, data, gl.STATIC_DRAW);
//             bufferView.webglBuffer = buffer;
//         }
//         return {
//             accessor,
//             buffer: bufferView.webglBuffer,
//             stride: bufferView.stride || 0,
//         };
//     }
//     async function loadGLTF(url) {
//         const gltf = await loadJSON(url);
//         // load all the referenced files relative to the gltf file
//         const baseURL = new URL(url, location.href);
//         gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
//             const url = new URL(buffer.uri, baseURL.href);
//             return loadBinary(url.href);
//         }));
//         const defaultMaterial = {
//             uniforms: {
//                 u_diffuse: [.5, .8, 1, 1],
//             },
//         };
//         // setup meshes
//         gltf.meshes.forEach((mesh) => {
//             mesh.primitives.forEach((primitive) => {
//                 const attribs = {};
//                 let numElements;
//                 for (const [attribName, index] of Object.entries(primitive.attributes)) {
//                     const { accessor, buffer, stride } = getAccessorAndWebGLBuffer(gl, gltf, index);
//                     numElements = accessor.count;
//                     attribs[`a_${attribName}`] = {
//                         buffer,
//                         type: accessor.componentType,
//                         numComponents: accessorTypeToNumComponents(accessor.type),
//                         stride,
//                         offset: accessor.byteOffset | 0,
//                     };
//                 }
//                 const bufferInfo:any = {
//                     attribs,
//                     numElements,
//                 };
//                 if (primitive.indices !== undefined) {
//                     const { accessor, buffer } = getAccessorAndWebGLBuffer(gl, gltf, primitive.indices);
//                     bufferInfo.numElements = accessor.count;
//                     bufferInfo.indices = buffer;
//                     bufferInfo.elementType = accessor.componentType;
//                 }
//                 primitive.bufferInfo = bufferInfo;
//                 // save the material info for this primitive
//                 primitive.material = gltf.materials && gltf.materials[primitive.material] || defaultMaterial;
//             });
//         });
//         const skinNodes = [];
//         const origNodes = gltf.nodes;
//         gltf.nodes = gltf.nodes.map((n) => {
//             const { name, skin, mesh, translation, rotation, scale } = n;
//             const trs = new Spine.TRS(translation, rotation, scale);
//             const node = new Spine.Node(trs, name);
//             const realMesh = gltf.meshes[mesh];
//             if (skin !== undefined) {
//                 skinNodes.push({ node, mesh: realMesh, skinNdx: skin });
//             } else if (realMesh) {
//                 node.drawables.push(new Spine.MeshRenderer(realMesh));
//             }
//             return node;
//         });
//         // setup skins
//         gltf.skins = gltf.skins.map((skin) => {
//             const joints = skin.joints.map(ndx => gltf.nodes[ndx]);
//             const { array } = getAccessorTypedArrayAndStride(gl, gltf, skin.inverseBindMatrices);
//             return new Spine.Skin(joints, array);
//         });
//         // Add SkinRenderers to nodes with skins
//         for (const { node, mesh, skinNdx } of skinNodes) {
//             node.drawables.push(new SkinRenderer(mesh, gltf.skins[skinNdx]));
//         }
//         // arrange nodes into graph
//         gltf.nodes.forEach((node, ndx) => {
//             const children = origNodes[ndx].children;
//             if (children) {
//                 addChildren(gltf.nodes, node, children);
//             }
//         });
//         // setup scenes
//         for (const scene of gltf.scenes) {
//             scene.root = new Node(new TRS(), scene.name);
//             addChildren(gltf.nodes, scene.root, scene.nodes);
//         }
//         return gltf;
//     }
//     function addChildren(nodes, node, childIndices) {
//         childIndices.forEach((childNdx) => {
//             const child = nodes[childNdx];
//             child.setParent(node);
//         });
//     }
//     async function loadFile(url, typeFunc) {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`could not load: ${url}`);
//         }
//         return await response[typeFunc]();
//     }
//     async function loadBinary(url) {
//         return loadFile(url, 'arrayBuffer');
//     }
//     async function loadJSON(url) {
//         return loadFile(url, 'json');
//     }
//     var gltf = {};
//     async function startLoadGLTF(){
//         gltf = await loadGLTF('https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf');
//     }
//     //开始加载骨骼动画
//     startLoadGLTF();
//     function degToRad(deg) {
//         return deg * Math.PI / 180;
//     }
//     const origMatrices = new Map();
//     var animSkin = function (skin:Spine.Skin, a:number) {
//         for (let i = 0; i < skin.joints.length; ++i) {
//             const joint = skin.joints[i];
//             // if there is no matrix saved for this joint
//             if (!origMatrices.has(joint)) {
//                 // save a matrix for joint
//                 origMatrices.set(joint, joint.source.getMatrix());
//             }
//             // get the original matrix
//             const origMatrix = origMatrices.get(joint);
//             // rotate it
//             const m = m4.create();
//             m4.rotateX(m,origMatrix, a);
//             // decompose it back into position, rotation, scale
//             // into the joint
//             m4.decompose(m, joint.source.position, joint.source.rotation, joint.source.scale);
//         }
//     }
// }
//# sourceMappingURL=Spine.js.map