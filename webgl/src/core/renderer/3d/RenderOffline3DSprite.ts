import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import { GameMainCamera } from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";
import { syRender } from "../data/RenderData";

/**
 * 延迟渲染
 */
export class RenderOffline3DSprite extends SY.SpriteBase{
    constructor() {
        super();
    }
    private _virtualCameraIndex:syRender.CameraUUid = syRender.CameraUUid.normal1;
    protected onInit() {
        var rd = CubeData.getData();
        this.createVertexsBuffer(rd.vertex, rd.dF.vertex_item_size);
        this.createUVsBuffer(rd.uvData, rd.dF.uv_item_size);
        this.createIndexsBuffer(rd.indexs);
        this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
    }
    protected onSetTextureUrl():void{
        
        GameMainCamera.instance.getCameraIndex(this._virtualCameraIndex).targetTexture = this.texture as RenderTexture;
    }
    public setVirtualCameraIndex(index:syRender.CameraUUid):void{
        this._virtualCameraIndex = index;
        GameMainCamera.instance.createVituralCamera(0,index);
    }
}