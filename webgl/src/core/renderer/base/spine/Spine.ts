"use strict";
import { SY } from "../Sprite";
import { Skeleton_Parse } from "./Skeleton_Parse";
import { Skeleton_Node } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";
//骨骼节点
export default class Spine extends SY.SpriteBase {

    constructor() {
        super();
        this._cameraType = 0;
        this.gltf = Skeleton_Parse.parseGLTF(this.gl);
    }
    private gltf;
    private sharedUniforms;
    protected onInit() {
        this.localFunc();
    }
    private origMatrices: Map<Skeleton_Node, Float32Array> = new Map();
    private animSkin(skin: Skeleton_Skin, a: number) {
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
            const m = this._glMatrix.mat4.create();
            this._glMatrix.mat4.rotateX(m, origMatrix, a);
            // decompose it back into position, rotation, scale
            // into the joint
            this._glMatrix.mat4.decompose(m, joint.transform.position, joint.transform.rotation, joint.transform.scale);
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
        this.spineMatrix = this._glMatrix.mat4.create();
        this._glMatrix.mat4.lookAt2(this.spineMatrix, cameraPosition, target, up);

        this._glMatrix.mat4.mul(this._modelMatrix,this._modelMatrix,this.spineMatrix);
    }
    private renderDrawables(node: Skeleton_Node) {
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
        var lightDirection = this._glMatrix.vec3.create();
       
        this._glMatrix.vec3.normalize(lightDirection, [-1, 3, 5]);
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
