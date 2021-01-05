//transforms

import { glMatrix } from "../../../Matrix";
import { Skeleton_MeshRenderer } from "./Skeleton_MeshRenderer";
import { Skeleton_SkinRenderer } from "./Skeleton_SkinRenderer";

//位置 旋转 缩放
export class Skeleton_Transform {
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
        glMatrix.mat4.compose(dst,this.position, this.rotation, this.scale);
        return dst;
    }
}

//节点
export class Skeleton_Node {
    private name: string;
    public transform: Skeleton_Transform;
    private parent: Skeleton_Node;

    private children: Array<Skeleton_Node>;
    private localMatrix: Float32Array | any[];
    public worldMatrix: Float32Array | any[];
    public mesh_Drawables: Array<Skeleton_MeshRenderer> = [];
    public skin_Drawables: Array<Skeleton_SkinRenderer> = [];

    constructor(transform: Skeleton_Transform, name: string) {
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
    setParent(parent: Skeleton_Node) {
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
    _addChild(child: Skeleton_Node) {
        this.children.push(child);
    }
    _removeChild(child: Skeleton_Node) {
        const ndx = this.children.indexOf(child);
        this.children.splice(ndx, 1);
    }


}