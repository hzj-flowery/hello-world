import LoaderManager from "../../../LoaderManager";
import { Skeleton_MeshRenderer } from "./Skeleton_MeshRenderer";
import { Skeleton_Node, Skeleton_Transform } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";
import { Skeleton_SkinRenderer } from "./Skeleton_SkinRenderer";

//骨骼解析器
export class Skeleton_Parse {
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

    //单位元数由几个数据组成
    private static readonly accessorTypeToNumComponentsMap = {
        'SCALAR': 1,  //标量
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
    private static getAccessorTypedArrayAndStride(gltf, accessorIndex) {
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
        const gltf = LoaderManager.instance.getRes(gltfPath);
        gltf.buffers = [LoaderManager.instance.getRes(bufferPath)];
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
            const trs = new Skeleton_Transform(translation, rotation, scale);
            const node = new Skeleton_Node(trs, name);
            const realMesh = gltf.meshes[mesh];
            if (skin !== undefined) {
                /**
                 * 但凡遇到有skin的，说明有蒙皮数据
                 * 蒙皮数据有下面两个：
                 * 网格的顶点数据
                 * 这张皮肤含有多少个骨骼，将用这些骨骼的空间坐标系去造一个纹理，这个纹理就是蒙皮的来源
                 */
                skinNodes.push({ node, mesh: realMesh, skinNdx: skin });
            } else if (realMesh) {
                node.mesh_Drawables.push(new Skeleton_MeshRenderer(realMesh, gl));
            }
            return node;
        });

        //创建皮肤
        gltf.skins = gltf.skins.map((skin) => {
            const joints = skin.joints.map(ndx => gltf.nodes[ndx]);
            //96个元素 每个元素四个字节
            //一个矩阵4x4 16个元素 可以组成6个矩阵
            const { array } = this.getAccessorTypedArrayAndStride(gltf, skin.inverseBindMatrices);
            return new Skeleton_Skin(joints, array, gl);
        });

        // Add SkinRenderers to nodes with skins
        for (const { node, mesh, skinNdx } of skinNodes) {
            node.skin_Drawables.push(new Skeleton_SkinRenderer(mesh, gltf.skins[skinNdx], gl));
        }

        /**
     * 设置节点的父子关系
     * @param nodes 骨骼动画中的源节点数组
     * @param node 父节点
     * @param childIndices 骨骼动画中源节点索引 
     */
        function addChildren(nodes: Array<Skeleton_Node>, node: Skeleton_Node, childIndices: Array<number>) {
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
            scene.root = new Skeleton_Node(new Skeleton_Transform(), scene.name);
            addChildren(gltf.nodes, scene.root, scene.nodes);
        }

        return gltf;
    }

}