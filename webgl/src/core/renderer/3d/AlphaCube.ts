
import { SY } from "../base/Sprite";
import { CubeData } from "../data/CubeData";

export default class AlphaCube extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
        this.alpha = 0.5;
        this._defineUse.SY_USE_PNG = (0.1);
    }
}