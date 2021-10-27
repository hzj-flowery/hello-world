
import { handler } from "../../../utils/handler";
import LoaderManager from "../../LoaderManager";
import { glMatrix } from "../../math/Matrix";
import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";
import { syPrimitives } from "../primitive/Primitives";


class SKeletonTRS {

    public translation: Array<number>;
    public rotation: Array<number>;
    public scale: Array<number>;
    constructor() {
        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
    };

    public getMatrix(dst) {
        dst = dst || new Float32Array(16);
        var t = this.translation;
        var r = this.rotation;
        var s = this.scale;
        glMatrix.mat4.translation(dst, t[0], t[1], t[2]);
        glMatrix.mat4.rotateX(dst, dst, r[0]);
        glMatrix.mat4.rotateY(dst, dst, r[1]);
        glMatrix.mat4.rotateZ(dst, dst, r[2]);
        glMatrix.mat4.scale(dst, dst, [s[0], s[1], s[2]]);
        return dst;
    };
}

class SKeletonNode {
    public children: Array<SKeletonNode>;
    public localMatrix: Float32Array;
    public worldMatrix: Float32Array;
    public source:SKeletonTRS;
    public parent: SKeletonNode;
    constructor(source) {
        this.children = [];
        this.localMatrix = glMatrix.mat4.identity(null);
        this.worldMatrix = glMatrix.mat4.identity(null);
        this.source = source;
    };
    setParent(parent) {
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
    updateWorldMatrix(parentWorldMatrix?) {

        var source = this.source;
        if (source) {
            source.getMatrix(this.localMatrix);
        }

        if (parentWorldMatrix) {
            // a matrix was passed in so do the math
            glMatrix.mat4.multiply(this.worldMatrix, parentWorldMatrix, this.localMatrix);
        } else {
            // no matrix was passed in so just copy local to world
            glMatrix.mat4.copy(this.worldMatrix, this.localMatrix);
        }

        // now process all the children
        var worldMatrix = this.worldMatrix;
        this.children.forEach(function (child) {
            child.updateWorldMatrix(worldMatrix);
        });
    };

}



/**
 * 误区：
 * 实例化绘制的矩阵其实就是一个数组，里面包含了4个item,每个item都是一个vec4
 */

export default class RobartInstantiate extends SY.Sprite3DInstance {
    constructor() {
        super();
    }
    private _skeletonScene:SKeletonNode;
    private _skeletonNode:Array<SKeletonNode>;
    private nodeInfosByName:any;
    private makeNode(nodeDescription) {
        var trs = new SKeletonTRS();
        var node = new SKeletonNode(trs);
        this.nodeInfosByName[nodeDescription.name] = {
            trs: trs,
            node: node,
        };
        trs.translation = nodeDescription.translation || trs.translation;
        if (nodeDescription.draw !== false) {
            this._skeletonNode.push(node);
        }
        this.makeNodes(nodeDescription.children).forEach(function (child) {
            child.setParent(node);
        });
        return node;
    }
    private makeNodes(nodeDescriptions) {
        return nodeDescriptions ? nodeDescriptions.map(handler(this,this.makeNode)) : [];
    }

    protected onInit():void{
        var cubeArrays = syPrimitives.createCubeVertices(1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.materialId,cubeArrays.indices,1);
        G_BufferManager.createBuffer(SY.GLID_TYPE.NORMAL,this.materialId,cubeArrays.normal, 3);
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.materialId,cubeArrays.texcoord, 2);
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.materialId,cubeArrays.position, 3)
        this.InstanceVertNums = cubeArrays.position.length/3;
        this._skeletonNode = [];
        this.nodeInfosByName = {};
        super.onInit();
    }
    protected onLoadShaderFinish():void{
        var blockGuyNodeDescriptions = LoaderManager.instance.getRes("res/models/Robart/blockGuyNodeDescriptions.json");
        this._skeletonScene = this.makeNode(blockGuyNodeDescriptions);
        this.numInstances = this._skeletonNode.length;
        this.pushDivisor("a_matrix", true);
        this.pushDivisor("a_color", false);
        // make a typed array with one view per matrix
        this.matrixData = new Float32Array(this.numInstances * 16);
        this.matrices = [];
        for (let i = 0; i < this.numInstances; ++i) {
            const byteOffsetToMatrix = i * 16 * 4;//每一位是4个字节 4行4列
            const numFloatsForView = 16;
            this.matrices.push(new Float32Array(
                this.matrixData.buffer,
                byteOffsetToMatrix,
                numFloatsForView));
        }
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERT_MATRIX, this.materialId,[], 4, this.matrixData.byteLength);
        var colorData = [];
        for (var j = 0; j < this.numInstances; j++) {
            var res = this.getRandowColor();
            colorData.push(res[0]);
            colorData.push(res[1]);
            colorData.push(res[2]);
            colorData.push(res[3]);
        }
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERT_COLOR, this.materialId,colorData, 4);
        super.onLoadShaderFinish()
    }

    private getRandowColor() {
        let ColorTest =
            [1, 0, 0, 1,  // red
                0, 1, 0, 1,  // green
                0, 0, 1, 1,  // blue
                1, 0, 1, 1,  // magenta
                0, 1, 1, 1,  // cyan
            ]
        var p = Math.floor(Math.random() * 10 / 2);
        if (p >= 5) p = 4;
        var data = ColorTest.slice(p * 4, p * 4 + 4);
        return data;
    }

    private matrices;
    private matrixData;
    public onDrawBefore(time: number) {
        // update all the matrices
        //更新缓冲区数据
        this.getBuffer(SY.GLID_TYPE.VERT_MATRIX).updateSubData(this.matrixData);
        super.onDrawBefore(time);
    }

    protected collectRenderData(time: number): void {
        time *= 0.001;  // convert to seconds
        if(!this._skeletonScene)
        {
            super.collectRenderData(time);
            return
        }
        this._skeletonScene.updateWorldMatrix();

        var adjust;
        var speed = 3;
        var c = time * speed;
        adjust = Math.abs(Math.sin(c));
        this.nodeInfosByName["point between feet"].trs.translation[1] = adjust;
        adjust = Math.sin(c);
        this.nodeInfosByName["left-leg"].trs.rotation[0] = adjust;
        this.nodeInfosByName["right-leg"].trs.rotation[0] = -adjust;
        adjust = Math.sin(c + 0.1) * 0.4;
        this.nodeInfosByName["left-calf"].trs.rotation[0] = -adjust;
        this.nodeInfosByName["right-calf"].trs.rotation[0] = adjust;
        adjust = Math.sin(c + 0.1) * 0.4;
        this.nodeInfosByName["left-foot"].trs.rotation[0] = -adjust;
        this.nodeInfosByName["right-foot"].trs.rotation[0] = adjust;

        adjust = Math.sin(c) * 0.4;
        this.nodeInfosByName["left-arm"].trs.rotation[2] = adjust;
        this.nodeInfosByName["right-arm"].trs.rotation[2] = adjust;
        adjust = Math.sin(c + 0.1) * 0.4;
        this.nodeInfosByName["left-forearm"].trs.rotation[2] = adjust;
        this.nodeInfosByName["right-forearm"].trs.rotation[2] = adjust;
        adjust = Math.sin(c - 0.1) * 0.4;
        this.nodeInfosByName["left-hand"].trs.rotation[2] = adjust;
        this.nodeInfosByName["right-hand"].trs.rotation[2] = adjust;

        adjust = Math.sin(c) * 0.4;
        this.nodeInfosByName["waist"].trs.rotation[1] = adjust;
        adjust = Math.sin(c) * 0.4;
        this.nodeInfosByName["torso"].trs.rotation[1] = adjust;
        adjust = Math.sin(c + 0.25) * 0.4;
        this.nodeInfosByName["neck"].trs.rotation[1] = adjust;
        adjust = Math.sin(c + 0.5) * 0.4;
        this.nodeInfosByName["head"].trs.rotation[1] = adjust;
        adjust = Math.cos(c * 2) * 0.4;
        this.nodeInfosByName["head"].trs.rotation[0] = adjust;

        this.matrices.forEach((mat, ndx) => {
            glMatrix.mat4.copy(mat,this._skeletonNode[ndx].worldMatrix);
        });

        super.collectRenderData(time);
    }



}