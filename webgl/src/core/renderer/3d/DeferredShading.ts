import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import GameMainCamera from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";

/**
 * 延迟渲染
 */
export class DeferredShading extends SY.SpriteBase{
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
}