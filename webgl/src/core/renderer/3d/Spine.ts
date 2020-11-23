"use strict";

import { glMatrix } from "../../Matrix";
import { Texture } from "../base/Texture";
import { Texture2D } from "../base/Texture2D";
import LoaderManager from "../../../LoaderManager";
import { SY } from "../base/Sprite";
import GameMainCamera from "../camera/GameMainCamera";
import { G_ShaderFactory, ShaderData } from "../shader/Shader";
import Device from "../../../Device";
import { SpineRenderData } from "../base/RenderData";

var skinVS =
    'attribute vec4 a_POSITION;' +  //顶点位置
    'attribute vec3 a_NORMAL;' +    //法线
    'attribute vec4 a_WEIGHTS_0;' + //权重
    'attribute vec4 a_JOINTS_0;' +
    'attribute vec2 a_TEXCOORD_0;' +
    'uniform mat4 u_projection;' +  //投影
    'uniform mat4 u_view;' +        //观察空间
    'uniform mat4 u_world;' +       //世界空间
    'uniform sampler2D u_jointTexture;' +   //骨骼矩阵纹理

    'uniform float u_numJoints;' +  //[6,7,8,9,10,11]
    'varying vec3 v_normal;' +
    'varying vec2 a_uv;' +
    //获取骨骼矩阵
    //一共有6个骨骼矩阵
    //0 1 2 3 4 5
    //每个顶点受到4个骨骼矩阵的影响
    /**
    RGBA RGBA RGBA RGBA  --矩阵1  16
    RGBA RGBA RGBA RGBA  --矩阵2  16
    RGBA RGBA RGBA RGBA  --矩阵3  16
    RGBA RGBA RGBA RGBA  --矩阵4  16
    RGBA RGBA RGBA RGBA  --矩阵5  16
    RGBA RGBA RGBA RGBA  --矩阵6  16
     */
    'mat4 getBoneMatrix(float jointNdx) {' +
    'float v = (jointNdx + 0.5) / u_numJoints;' +       //算出行
    'return mat4(' +                                                 //s      
    'texture2D(u_jointTexture, vec2(((0.5 + 0.0) / 4.), v)),' +  //0.125 
    'texture2D(u_jointTexture, vec2(((0.5 + 1.0) / 4.), v)),' +  //0.375 
    'texture2D(u_jointTexture, vec2(((0.5 + 2.0) / 4.), v)),' +  //0.625 
    'texture2D(u_jointTexture, vec2(((0.5 + 3.0) / 4.), v)));' + //0.875 
    '}' +
    'void main() {' +
    'mat4 skinMatrix =   getBoneMatrix(a_JOINTS_0[0]) * a_WEIGHTS_0[0] +' +
    'getBoneMatrix(a_JOINTS_0[1]) * a_WEIGHTS_0[1] +' +
    'getBoneMatrix(a_JOINTS_0[2]) * a_WEIGHTS_0[2] +' +
    'getBoneMatrix(a_JOINTS_0[3]) * a_WEIGHTS_0[3];' +
    'mat4 world = u_world * skinMatrix;' +
    'gl_Position = u_projection * u_view * world * a_POSITION;' +
    'v_normal = mat3(world) * a_NORMAL;' +
    'a_uv = a_TEXCOORD_0;' +
    '}'

var meshVS =
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

var fs =
    'precision mediump float;' +        //精度
    'varying vec3 v_normal;' +          //法线
    'uniform vec4 u_diffuse;' +         //漫反射
    'uniform sampler2D u_texCoord;' +   //骨骼矩阵纹理
    'uniform vec3 u_lightDirection;' +  //光的方向
    'varying vec2 a_uv;' +
    'void main () {' +
    'vec3 normal = normalize(v_normal);' +
    'float light = dot(u_lightDirection,normal) * .5 + .5;' +
    'vec4 color = texture2D(u_texCoord,normalize(a_uv)); ' +
    'gl_FragColor = color+vec4(u_diffuse.rgb * light, u_diffuse.a);' +
    '}'

class skeleton_Skin {
    public joints: Array<skeleton_Node>;
    private inverseBindMatrices: Array<Float32Array>;
    private jointMatrices: Array<Float32Array>;
    private jointData: Float32Array;
    public jointTexture: WebGLTexture;
    public _texture: Texture;
    private gl: WebGL2RenderingContext;
    //inverseBindMatrixData Float32Array(96)
    constructor(joints, inverseBindMatrixData: Float32Array, gl) {
        this.gl = gl;
        this.joints = joints;
        this.inverseBindMatrices = [];
        this.jointMatrices = [];
        this.jointData = new Float32Array(joints.length * 16);
        // create views for each joint and inverseBindMatrix
        for (let i = 0; i < joints.length; ++i) {
            this.inverseBindMatrices.push(new Float32Array(
                inverseBindMatrixData.buffer,
                inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i,
                16));
            this.jointMatrices.push(new Float32Array(
                this.jointData.buffer,
                Float32Array.BYTES_PER_ELEMENT * 16 * i,
                16));
        }
        // create a texture to hold the joint matrices
        this.jointTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.jointTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
        if(Device.Instance.getContextType()=="webgl2")
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 4, this.joints.length, 0,
            this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }
        else
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 4, this.joints.length, 0,
                this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }

        

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this._texture = new Texture2D(this.gl);

        this.createTexture2DBuffer("res/wicker.jpg");
    }
    //创建一个纹理buffer
    private createTexture2DBuffer(url: string): Texture {
        // (this._texture as TextureCustom).url = CustomTextureData.getRandomData(30,50, gltex_format.RGB8);
        (this._texture as Texture2D).url = url;
        return this._texture
    }
    update(node: skeleton_Node) {
        const globalWorldInverse = glMatrix.mat4.create();
        glMatrix.mat4.invert(globalWorldInverse, node.worldMatrix);
        // go through each joint and get its current worldMatrix
        // apply the inverse bind matrices and store the
        // entire result in the texture
        for (let j = 0; j < this.joints.length; ++j) {
            const joint = this.joints[j];
            const dst = this.jointMatrices[j];
            glMatrix.mat4.multiply(dst, globalWorldInverse, joint.worldMatrix);
            glMatrix.mat4.multiply(dst, dst, this.inverseBindMatrices[j]);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.jointTexture);
        if(Device.Instance.getContextType()=="webgl2")
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 4, this.joints.length, 0,
            this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }
        else
        {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 4, this.joints.length, 0,
                this.gl.RGBA, this.gl.FLOAT, this.jointData);
        }
    }
}

//transforms
//位置 旋转 缩放
class skeleton_Transform {
    public position: Array<number>;
    public rotation: Array<number>;
    public scale: Array<number>;
    constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
    public getMatrix(dst?) {
        dst = dst || new Float32Array(16);
        glMatrix.mat4.compose(this.position, this.rotation, this.scale, dst);
        return dst;
    }
}

//节点
class skeleton_Node {
    private name: string;
    public transform: skeleton_Transform;
    private parent: skeleton_Node;

    private children: Array<skeleton_Node>;
    private localMatrix: Float32Array | any[];
    public worldMatrix: Float32Array | any[];
    public mesh_Drawables: Array<skeleton_MeshRenderer> = [];
    public skin_Drawables: Array<skeleton_SkinRenderer> = [];

    constructor(transform: skeleton_Transform, name: string) {
        this.name = name;
        this.transform = transform;
        this.parent = null;
        this.children = [];
        // this.localMatrix = m4.identity();
        // this.worldMatrix = m4.identity();
        this.localMatrix = glMatrix.mat4.create();
        this.worldMatrix = glMatrix.mat4.create();
        glMatrix.mat4.identity(this.localMatrix);
        glMatrix.mat4.identity(this.worldMatrix);
        this.mesh_Drawables = [];
        this.skin_Drawables = [];
    }
    setParent(parent: skeleton_Node) {
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
        const transform = this.transform;
        if (transform) {
            transform.getMatrix(this.localMatrix);
        }

        if (parentWorldMatrix) {
            // a matrix was passed in so do the math
            glMatrix.mat4.multiply(this.worldMatrix, parentWorldMatrix, this.localMatrix);
        } else {
            // no matrix was passed in so just copy local to world
            glMatrix.mat4.copy(this.localMatrix, this.worldMatrix);
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
    _addChild(child: skeleton_Node) {
        this.children.push(child);
    }
    _removeChild(child: skeleton_Node) {
        const ndx = this.children.indexOf(child);
        this.children.splice(ndx, 1);
    }


}

//皮肤渲染
class skeleton_SkinRenderer {
    private mesh;
    private skin: skeleton_Skin;
    private gl: WebGLRenderingContext;
    private skinProgramInfo: ShaderData;
    constructor(mesh, skin, gl) {
        this.mesh = mesh;
        this.skin = skin;
        this.gl = gl;
        this.skinProgramInfo = G_ShaderFactory.createProgramInfo(skinVS, fs);
    }
    render(node: skeleton_Node,extViewLeftMatrix,sharedUniforms) {
        this.skin.update(node);
        for (const primitive of this.mesh.primitives) {
            var renderData = new SpineRenderData();
            renderData._shaderData = this.skinProgramInfo;
            renderData._uniformInfors.push({ 
                u_world: node.worldMatrix,
                u_texCoord: this.skin._texture._glID,
                u_jointTexture: this.skin.jointTexture,
                u_numJoints: this.skin.joints.length,
            });
            renderData._extraViewLeftMatrix = extViewLeftMatrix;
            renderData._projKey = "u_projection";
            renderData._viewKey = "u_view";
            renderData._uniformInfors.push(primitive.material.uniforms);
            renderData._uniformInfors.push(sharedUniforms);
            renderData._attrbufferInfo = primitive.bufferInfo;
            Device.Instance.drawSY(renderData);
        }
    }
}

//网格渲染
class skeleton_MeshRenderer {
    private mesh;
    private gl: WebGLRenderingContext;
    private meshProgramInfo: ShaderData;
    constructor(mesh, gl: WebGLRenderingContext) {
        this.mesh = mesh;
        this.gl = gl;
        this.meshProgramInfo = G_ShaderFactory.createProgramInfo(meshVS, fs);
    }
    public render(node: skeleton_Node, ext,sharedUniforms) {
        for (const primitive of this.mesh.primitives) {
            var renderData = new SpineRenderData();
            renderData._extraViewLeftMatrix = ext;
            renderData._projKey = "u_projection";
            renderData._viewKey = "u_view";
            renderData._shaderData = this.meshProgramInfo;
            renderData._attrbufferInfo = primitive.bufferInfo;
            renderData._uniformInfors.push({u_world: node.worldMatrix});
            renderData._uniformInfors.push(primitive.material.uniforms);
            renderData._uniformInfors.push(sharedUniforms);
            Device.Instance.drawSY(renderData);
        }
    }
}

//骨骼解析器
class skeleton_Parse {
    //https://webglfundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf
    /**
     * 骨骼文件解析
     * 变量accessors
     *     bufferView:存储的是bufferviews的索引
     *     componentType：元素的类型，具体可查看glTypeToTypedArrayMap
     *     count：元素的数量
     *     max:单位元素每一位元素的最大值
     *     min:单位元素每一位元素的最小值
     *     type：单位元素的数目，具体可查看accessorTypeToNumComponentsMap
     *变量bufferviews
           buffer:在buffer中的起始位置
           byteLength：bufferview的字节长度
           byteOffset:在buffer中的偏移位置
           target:目标缓冲
    *变量nodes
           节点，包含所有可是节点，比如相机，灯光，物体，骨骼等
           name：节点的名字
           rotation：节点的旋转
           scale：节点的缩放
           translation:节点的平移
           children：节点的孩子节点列表
     *变量skins
           inverseBindMatrices:存储的是accessors的索引
           joints:骨骼节点数组，存储的是nodes的索引

     根据上面的shader代码：我们需要下面这些数据
     顶点：
     法线：
     切线：
     权重：
     骨骼关节矩阵:
     */
    private static throwNoKey(key) {
        throw new Error(`no key: ${key}`);
    }

    //变量类型占用的元素个数
    private static readonly accessorTypeToNumComponentsMap = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,    //
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16,  //4维矩阵占用16个元素
    };
    
    //27420
    //4  2285  3
    private static accessorTypeToNumComponents(type) {
        return this.accessorTypeToNumComponentsMap[type] || this.throwNoKey(type);
    }

    //元素数组类型
    private static readonly glTypeToTypedArrayMap = {
        '5120': Int8Array,    // gl.BYTE
        '5121': Uint8Array,   // gl.UNSIGNED_BYTE
        '5122': Int16Array,   // gl.SHORT
        '5123': Uint16Array,  // gl.UNSIGNED_SHORT
        '5124': Int32Array,   // gl.INT
        '5125': Uint32Array,  // gl.UNSIGNED_INT
        '5126': Float32Array, // gl.FLOAT
    };

    // Given a GL type return the TypedArray needed
    private static glTypeToTypedArray(type) {
        return this.glTypeToTypedArrayMap[type] || this.throwNoKey(type);
    }

    // given an accessor index return both the accessor and
    // a TypedArray for the correct portion of the buffer
    private static getAccessorTypedArrayAndStride(gl, gltf, accessorIndex) {
        //gltf.accessors是bufferView的数组
        const accessor = gltf.accessors[accessorIndex];
        //gltf.bufferViews存储了每个bufferview的在顶点数组中的存放位置以及大小
        const bufferView = gltf.bufferViews[accessor.bufferView];
        const TypedArray = this.glTypeToTypedArray(accessor.componentType); //Float32Array
        const buffer = gltf.buffers[bufferView.buffer];
        console.log(gltf.buffers);
        var array = new TypedArray(
            buffer,
            bufferView.byteOffset + (accessor.byteOffset || 0),
            accessor.count * this.accessorTypeToNumComponents(accessor.type));
        return {
            accessor,
            array: array,
            stride: bufferView.byteStride || 0,
        };

    }

    // Given an accessor index return a WebGLBuffer and a stride
    private static getAccessorAndWebGLBuffer(gl, gltf, accessorIndex, attribName = "") {
        const accessor = gltf.accessors[accessorIndex];
        const bufferView = gltf.bufferViews[accessor.bufferView];
        if (!bufferView.webglBuffer) {
            const buffer = gl.createBuffer();
            const target = bufferView.target || gl.ARRAY_BUFFER;
            const arrayBuffer = gltf.buffers[bufferView.buffer];
            const data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
            //绑定缓冲
            gl.bindBuffer(target, buffer);
            //上传数据
            gl.bufferData(target, data, gl.STATIC_DRAW);
            bufferView.webglBuffer = buffer;
            if (attribName == "JOINTS_0" || attribName == "WEIGHTS_0") {
                var pData: Array<number> = []
                data.forEach(function (value, index, array) {
                    pData.push(value);
                })
            }
        }
        return {
            accessor,
            buffer: bufferView.webglBuffer,
            stride: bufferView.stride || 0,
        };
    }


    //解析骨骼动画数据
    static parseGLTF(gl: WebGLRenderingContext, gltfPath: string = "res/models/killer_whale/whale.CYCLES.gltf", bufferPath: string = "res/models/killer_whale/whale.CYCLES.bin") {
        const gltf = LoaderManager.instance.getCacheData(gltfPath);
        gltf.buffers = [LoaderManager.instance.getCacheData(bufferPath)];

        console.log(gltf);
        //缺省的材质
        const defaultMaterial = {
            uniforms: {
                u_diffuse: [0.5, 0, 0, 1],
            },
        };
        // setup meshes
        // 创建网格
        gltf.meshes.forEach((mesh) => {
            mesh.primitives.forEach((primitive) => {
                const attribs = {};
                let numElements;
                for (const [attribName, index] of Object.entries(primitive.attributes)) {
                    const { accessor, buffer, stride } = this.getAccessorAndWebGLBuffer(gl, gltf, index, attribName);
                    numElements = accessor.count;
                    attribs[`a_${attribName}`] = {
                        buffer,
                        type: accessor.componentType,
                        numComponents: this.accessorTypeToNumComponents(accessor.type),
                        stride,
                        offset: accessor.byteOffset | 0,
                    };
                }

                const bufferInfo: any = {
                    attribs,
                    numElements,
                };

                if (primitive.indices !== undefined) {
                    const { accessor, buffer } = this.getAccessorAndWebGLBuffer(gl, gltf, primitive.indices);
                    bufferInfo.numElements = accessor.count;
                    bufferInfo.indices = buffer;
                    bufferInfo.elementType = accessor.componentType;
                }

                //设置缓冲信息
                primitive.bufferInfo = bufferInfo;

                // save the material info for this primitive
                primitive.material = gltf.materials && gltf.materials[primitive.material] || defaultMaterial;
            });
        });

        const skinNodes = [];
        const origNodes = gltf.nodes;
        gltf.nodes = gltf.nodes.map((n) => {
            const { name, skin, mesh, translation, rotation, scale } = n;
            const trs = new skeleton_Transform(translation, rotation, scale);
            const node = new skeleton_Node(trs, name);
            const realMesh = gltf.meshes[mesh];
            if (skin !== undefined) {
                skinNodes.push({ node, mesh: realMesh, skinNdx: skin });
            } else if (realMesh) {
                node.mesh_Drawables.push(new skeleton_MeshRenderer(realMesh, gl));
            }
            return node;
        });

        // setup skins
        gltf.skins = gltf.skins.map((skin) => {
            const joints = skin.joints.map(ndx => gltf.nodes[ndx]);
            //96个元素 每个元素四个字节
            //一个矩阵4x4 16个元素 可以组成6个矩阵
            const { array } = this.getAccessorTypedArrayAndStride(gl, gltf, skin.inverseBindMatrices);
            return new skeleton_Skin(joints, array, gl);
        });

        // Add SkinRenderers to nodes with skins
        for (const { node, mesh, skinNdx } of skinNodes) {
            node.skin_Drawables.push(new skeleton_SkinRenderer(mesh, gltf.skins[skinNdx], gl));
        }

        /**
     * 设置节点的父子关系
     * @param nodes 骨骼动画中的源节点数组
     * @param node 父节点
     * @param childIndices 骨骼动画中源节点索引 
     */
        function addChildren(nodes: Array<skeleton_Node>, node: skeleton_Node, childIndices: Array<number>) {
            childIndices.forEach((childNdx) => {
                const child = nodes[childNdx];
                child.setParent(node);
            });
        }

        // arrange nodes into graph
        // 在骨骼动画的配置中,nodes是一个包含所有节点的对象
        //遍历nodes,就是遍历所有节点
        gltf.nodes.forEach((node, ndx) => {
            const children = origNodes[ndx].children;
            if (children) {
                addChildren(gltf.nodes, node, children);
            }
        });

        // setup scenes
        // 创建场景
        for (const scene of gltf.scenes) {
            scene.root = new skeleton_Node(new skeleton_Transform(), scene.name);
            addChildren(gltf.nodes, scene.root, scene.nodes);
        }

        return gltf;
    }

}

//骨骼节点
export default class Spine extends SY.Sprite {

    constructor(gl) {
        super(gl);
        this._cameraType = 0;
        this.gltf = skeleton_Parse.parseGLTF(gl);
    }
    private gltf;
    private sharedUniforms;
    protected onInit() {
        this.localFunc();
    }
    private origMatrices: Map<skeleton_Node, Float32Array> = new Map();
    private animSkin(skin: skeleton_Skin, a: number) {
        for (let i = 0; i < skin.joints.length; ++i) {
            const joint = skin.joints[i];
            // if there is no matrix saved for this joint
            if (!this.origMatrices.has(joint)) {
                // save a matrix for joint
                this.origMatrices.set(joint, joint.transform.getMatrix());
            }
            // get the original matrix
            const origMatrix = this.origMatrices.get(joint);
            // rotate it
            const m = glMatrix.mat4.create();
            glMatrix.mat4.rotateX(m, origMatrix, a);
            // decompose it back into position, rotation, scale
            // into the joint
            glMatrix.mat4.decompose(m, joint.transform.position, joint.transform.rotation, joint.transform.scale);
        }
    }
    private spineMatrix;
    private localFunc():void{
        const cameraPosition = [5, 0, -5];
        const target = [0, 0, -10];
        // for debugging .. see article
        // const cameraPosition = [5, 0, 5];
        // const target = [0, 0, 0];
        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        this.spineMatrix = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(this.spineMatrix, cameraPosition, target, up);

        this._glMatrix.mat4.mul(this._modelMatrix,this._modelMatrix,this.spineMatrix);
    }
    private renderDrawables(node: skeleton_Node) {
        let msMatrix = this._glMatrix.mat4.multiply(null,this._modelMatrix,this.spineMatrix);
        //渲染网格
        for (const drawable of node.mesh_Drawables) {
            drawable.render(node,msMatrix,this.sharedUniforms);
        }
        //渲染皮肤
        for (const drawable of node.skin_Drawables) {
            drawable.render(node,msMatrix,this.sharedUniforms);
        }
    }

    protected draw(time: number): void {
        time *= 0.001;  // convert to seconds
        this.animSkin(this.gltf.skins[0], Math.sin(time) * .5);
        var lightDirection = glMatrix.vec3.create();
       
        glMatrix.vec3.normalize(lightDirection, [-1, 3, 5]);
        this.sharedUniforms = {
            u_lightDirection: lightDirection,
        };
        for (const scene of this.gltf.scenes) {
            // updatte all world matices in the scene.
            scene.root.updateWorldMatrix();
            // walk the scene and render all renderables
            scene.root.traverse(this.renderDrawables.bind(this));
        }
    }
}
