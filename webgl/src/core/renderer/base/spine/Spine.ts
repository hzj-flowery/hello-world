"use strict";
import { SY } from "../Sprite";
import { Skeleton_Parse } from "./Skeleton_Parse";
import { Skeleton_Node } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";
import { glMatrix } from "../../../math/Matrix";
//骨骼节点
export default class Spine extends SY.SpriteBase {

    constructor() {
        super();
        this._cameraType = 0;
        this.gltf = Skeleton_Parse.parseGLTF(this.gl);
        this._tempMatrix = glMatrix.mat4.identity(null);
        this._lightDirection = glMatrix.vec3.create() as Float32Array;
        this._glMatrix.vec3.normalize(this._lightDirection, [-1, 3, 5]);
    }
    private gltf;
    private sharedUniforms;
    private origMatrices: Map<Skeleton_Node, Float32Array> = new Map();
    private _tempMatrix:Float32Array;
    private _lightDirection:Float32Array;
    private animSkin(skin: Skeleton_Skin, a: number) {
        for (let i = 0; i < skin.joints.length; ++i) {
            const joint = skin.joints[i];
            if (!this.origMatrices.has(joint)) {
                this.origMatrices.set(joint, joint.transform.getMatrix());
            }
            // get the original matrix
            const origMatrix = this.origMatrices.get(joint);
            // rotate it
            this._glMatrix.mat4.rotateX(this._tempMatrix, origMatrix, a);
            // decompose it back into position, rotation, scale
            // into the joint
            this._glMatrix.mat4.decompose(this._tempMatrix, joint.transform.position, joint.transform.rotation, joint.transform.scale);
        }
    }
    private renderDrawables(node: Skeleton_Node) {
        //渲染网格
        for (const drawable of node.mesh_Drawables) {
            drawable.render(node,this.modelMatrix,this.sharedUniforms);
        }
        //渲染皮肤
        for (const drawable of node.skin_Drawables) {
            drawable.render(node,this.modelMatrix,this.sharedUniforms);
        }
    }

    protected collectRenderData(time: number): void {
        time *= 0.001;  // convert to seconds
        this.animSkin(this.gltf.skins[0], Math.sin(time) * .5);
        this.sharedUniforms = {
            u_lightDirection: this._lightDirection,
        };
        for (const scene of this.gltf.scenes) {
            // updatte all world matices in the scene.
            scene.root.updateWorldMatrix();
            // walk the scene and render all renderables
            scene.root.traverse(this.renderDrawables.bind(this));
        }
    }
}
