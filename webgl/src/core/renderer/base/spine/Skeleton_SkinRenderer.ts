import Device from "../../../Device";
import { glMatrix } from "../../../math/Matrix";
import { syRender } from "../../data/RenderData";
import { Pass } from "../../shader/Pass";
import { ShaderProgram } from "../../shader/Shader";
import { G_ShaderFactory } from "../../shader/ShaderFactory";
import { Skeleton_Node } from "./Skeleton_Node";
import { Skeleton_Skin } from "./Skeleton_Skin";
/**
 * 一个蒙皮渲染器负责管理一个皮肤节点，一个皮肤节点下面有若干个骨骼节点，
 * 这个皮肤节点就用这若干个骨骼节点来造一张骨骼纹理
 */

//皮肤渲染
export class Skeleton_SkinRenderer {
    /**
     * 网格的绘制信息
     * 主要包含顶点数据
     */
    public mesh: any;
    public skin: Skeleton_Skin;
    private _renderDataArray: Array<syRender.QueueItemData> = [];
    constructor(mesh, skin: Skeleton_Skin) {
        this.mesh = mesh;
        this.skin = skin;
    }
    public render(node: Skeleton_Node, worldMatrix: Float32Array, sharedUniforms, pass: Pass) {
        this.skin.update()
        let j = 0;
        for (const primitive of this.mesh.primitives) {
            var renderData = this._renderDataArray[j];
            if (!renderData) {
                renderData = syRender.DataPool.get(syRender.QueueItemType.Normal) as syRender.QueueItemData;
                this._renderDataArray.push(renderData);
            }
            renderData._shaderData = pass.program;
            renderData.pass = pass;
            renderData._uniformData.push({
                u_world: worldMatrix,
                u_texture: this.skin._texture.glID,
                u_texture1: this.skin._riverTexture.glID,
                u_texture2: this.skin.jointTexture.glID,
                u_float_custom: this.skin.jointNodes.length,
                u_time: Device.Instance.triggerRenderTime,
            });
            renderData._uniformData.push(primitive.material.uniforms);
            renderData._uniformData.push(sharedUniforms);
            renderData._attrbufferData = primitive.bufferInfo;
            renderData.node = node as any;
            Device.Instance.collectData(renderData);
            j++;
        }
    }
}