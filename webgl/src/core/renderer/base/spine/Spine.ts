"use strict";
import { SY } from "../Sprite";
import { Skeleton_Parse } from "./Skeleton_Parse";
import { Skeleton_Node } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";
import { glMatrix } from "../../../math/Matrix";
import { syRender } from "../../data/RenderData";
import { StateString, StateValueMap } from "../../gfx/State";
//骨骼节点
export default class Spine extends SY.SpriteBase {
    private gltf;
    private sharedUniforms;
    private origMatrices: Map<Skeleton_Node, Float32Array> = new Map();
    private _tempMatrix: Float32Array;
    private _lightDirection: Float32Array;
    protected onInit(): void {
        this.gltf = Skeleton_Parse.parseGLTF(this.gl);
        this._tempMatrix = glMatrix.mat4.identity(null);
        this._lightDirection = glMatrix.vec3.create() as Float32Array;
        this._glMatrix.vec3.normalize(this._lightDirection, [-1, 3, 5]);
        this.pushPassContent(syRender.ShaderType.Spine_Skin,[
            [StateString.primitiveType,StateValueMap.primitiveType.PT_TRIANGLES]
        ],[]);
        // this.pushPassContent(syRender.ShaderType.Spine_Mesh);
    }
    private animSkin(skin: Skeleton_Skin, a: number) {
        for (let i = 0; i < skin.jointNodes.length; ++i) {
            const jointNode = skin.jointNodes[i];
            if (!this.origMatrices.has(jointNode)) {
                this.origMatrices.set(jointNode, jointNode.transform.getMatrix());
            }
            // get the original matrix
            const origMatrix = this.origMatrices.get(jointNode);
            // rotate it
            this._glMatrix.mat4.rotateX(this._tempMatrix, origMatrix, a);
            // this._glMatrix.mat4.rotateY(this._tempMatrix, origMatrix, a);
            // this._glMatrix.mat4.rotateZ(this._tempMatrix, origMatrix, a);
            // this._glMatrix.mat4.rotate(this._tempMatrix, origMatrix, a,[1,0,0])
            // this._glMatrix.mat4.rotate(this._tempMatrix, this._tempMatrix, a,[0,1,0])
            // this._glMatrix.mat4.rotate(this._tempMatrix, this._tempMatrix, a,[0,0,1])
            // decompose it back into position, rotation, scale
            // into the joint
            this._glMatrix.mat4.decompose(this._tempMatrix, jointNode.transform.position, jointNode.transform.rotation, jointNode.transform.scale);
        }
    }
    private renderDrawables(node: Skeleton_Node) {
        for (const drawable of node.mesh_Drawables) {
            //渲染网格
            drawable.render(node, this.modelMatrix, this.sharedUniforms, this.pass[1]);
        }
        for (const drawable of node.skin_Drawables) {
            //渲染皮肤
            drawable.render(node, this.modelMatrix, this.sharedUniforms, this.pass[0])
        }
    }

    protected collectRenderData(time: number): void {
        if (this.pass.length<0) {
            return;
        }
        time *= 0.001;  // convert to seconds
        this.animSkin(this.gltf.skins[0], Math.sin(time) * .5);
        this.sharedUniforms = {
            u_spotDirection: this._lightDirection,
        };
        /**
         * 下面会遍历所有的骨骼节点
         */
        for (const scene of this.gltf.scenes) {
            // updatte all world matices in the scene.
            scene.root.updateWorldMatrix();
            // walk the scene and render all renderables
            scene.root.traverse(this.renderDrawables.bind(this));
        }
    }
}
