import { SY } from "../base/Sprite";
import Device from "../../Device";
import {GameMainCamera} from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";
import { syRender } from "../data/RenderData";


export class RenderOfflineSprite extends SY.Sprite2D{
    constructor(){
        super();
    }
    protected onInit(): void {
        this.pushPassContent(syRender.ShaderType.Sprite)
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
    }
    protected onSetTextureUrl():void{
        GameMainCamera.instance.pushRenderTexture(syRender.RenderTextureUUid.offline2D,this.texture as RenderTexture)
    }
}