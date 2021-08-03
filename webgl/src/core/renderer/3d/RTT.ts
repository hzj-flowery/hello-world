import Device from "../../Device";
import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import { GameMainCamera } from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";

/**
 * 延迟渲染
 */
export class RTT extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs); 
        this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size)
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
        GameMainCamera.instance.createVituralCamera(0, syRender.CameraUUid.Deferred, syRender.DrawingOrder.Middle);
    }
    protected onSetTextureUrl(): void {
        GameMainCamera.instance.getCameraByUUid(syRender.CameraUUid.Deferred).targetTexture = this.texture as RenderTexture;
    }
}