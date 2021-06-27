import { SY } from "../base/Sprite";
import { RenderTexture } from "../base/texture/RenderTexture";
import {CameraIndex, GameMainCamera} from "../camera/GameMainCamera";
import { CubeData } from "../data/CubeData";

/**
 * 延迟渲染
 */
export class RenderOffline3DSprite extends SY.SpriteBase{
    constructor() {
        super();
    }
    private _virtualCameraIndex:CameraIndex = CameraIndex.normal1;
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
    public setVirtualCameraIndex(index:CameraIndex):void{
        this._virtualCameraIndex = index;
        GameMainCamera.instance.createVituralCamera(0,index);
    }
}