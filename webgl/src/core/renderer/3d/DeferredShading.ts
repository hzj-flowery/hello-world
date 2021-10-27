import { G_BufferManager } from "../base/buffer/BufferManager";
import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import {GameMainCamera} from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";
import { StateString, StateValueMap } from "../gfx/State";

/**
 * 延迟渲染
 */
export class DeferredShading extends SY.SpriteBase{
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.attributeId,rd.vertex, rd.dF.vertex_item_size)
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.attributeId,rd.uvData, rd.dF.uv_item_size);
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.attributeId,rd.indexs,1);
        this.pushPassContent(syRender.ShaderType.Sprite)
    }
}