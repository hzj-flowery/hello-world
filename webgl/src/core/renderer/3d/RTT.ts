import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import {GameMainCamera} from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";

/**
 * 延迟渲染
 */
export class RTT extends SY.SpriteBase{
    constructor() {
        super();
    }
    // private renderTexture: RenderTexture;
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals,rd.dF.normal_item_size)
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;

        this._texture = new RenderTexture();
        (this._texture as RenderTexture).attach("more",500,500,3)
    }
}