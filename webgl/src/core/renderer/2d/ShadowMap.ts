import { SY } from "../base/Sprite";
import Device from "../../Device";
import {GameMainCamera} from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";
import { syRender } from "../data/RenderData";
import { G_LightCenter } from "../light/LightCenter";


export class ShadowMap extends SY.Sprite2D{
    constructor(){
        super();
    }
    protected onInit(): void {
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
        this.pushPassContent(syRender.ShaderType.Sprite,[],[
            [syRender.PassCustomString.offlineRender,true]
        ]);
    }
    protected onSetTextureUrl():void{
        GameMainCamera.instance.pushRenderTexture(syRender.RenderTextureUUid.shadowMap,this.texture as RenderTexture)
        G_LightCenter.lightData.shadow.map = this.texture.glID;
    }
}