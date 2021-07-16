import Device from "../../Device";
import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import { CameraIndex, GameMainCamera } from "../camera/GameMainCamera";
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
        GameMainCamera.instance.createVituralCamera(0, CameraIndex.Deferred, syRender.DrawType.Single);
    }
    protected onSetTextureUrl(): void {
        GameMainCamera.instance.getCameraIndex(CameraIndex.Deferred).targetTexture = this.texture as RenderTexture;
    }
}