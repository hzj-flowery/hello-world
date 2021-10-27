import { G_BufferManager } from "../base/buffer/BufferManager";
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
    private _rtuuid:syRender.RenderTextureUUid = syRender.RenderTextureUUid.screen;
    protected onInit() {
        var rd = CubeData.getData();
        G_BufferManager.createBuffer(SY.GLID_TYPE.VERTEX,this.attributeId,rd.vertex, rd.dF.vertex_item_size)
        G_BufferManager.createBuffer(SY.GLID_TYPE.UV,this.attributeId,rd.uvData, rd.dF.uv_item_size);
        G_BufferManager.createBuffer(SY.GLID_TYPE.INDEX,this.attributeId,rd.indexs,1);
        this.pushPassContent(syRender.ShaderType.Sprite)
    }
    protected onSetTextureUrl():void{
        GameMainCamera.instance.pushRenderTexture(this._rtuuid,this.texture as RenderTexture)
    }
    public setRenderTextureUUid(uuid:syRender.RenderTextureUUid):void{
        this._rtuuid = uuid;
        GameMainCamera.instance.createBaseVituralCamera(uuid);
    }
}