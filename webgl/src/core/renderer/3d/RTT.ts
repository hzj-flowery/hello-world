import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import { CubeData } from "../data/CubeData";

/**
 * 延迟渲染
 */
export class RTT extends SY.SpriteBase{
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this.createNormalsBuffer(rd.normals,rd.dF.normal_item_size)
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
    public onDrawBefore(time:number):void{
        if((this._texture as RenderTexture).moreTexture)
         console.log((this._texture as RenderTexture).moreTexture.length)
    }
    public onDrawAfter(time:number):void{

    }
}