import Device from "../../Device";
import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import { GameMainCamera } from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";

/**
 * 延迟渲染
 */ export class RTT extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs); 
        this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size)
        GameMainCamera.instance.createBaseVituralCamera(syRender.RenderTextureUUid.RTT, syRender.DrawingOrder.Middle);
        this.pushPassContent(syRender.ShaderType.RTT_Create)
    }
    protected onSetTextureUrl(): void {
        GameMainCamera.instance.pushRenderTexture(syRender.RenderTextureUUid.RTT,this.texture as RenderTexture);
    }
}

export class RTTTest extends SY.SpriteBase {
    constructor() {
        super();
    }
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs); 
        this.createNormalsBuffer(rd.normals, rd.dF.normal_item_size)
    }
}