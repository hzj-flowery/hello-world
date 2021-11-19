import { SY } from "../base/Sprite";
import Device from "../../Device";
import {GameMainCamera} from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";
import { syRender } from "../data/RenderData";
import { G_LightCenter } from "../light/LightCenter";
import { Texture } from "../base/texture/Texture";


export class ShadowMap extends SY.UIImage{
    constructor(){
        super();
    }
    protected onInit(): void {
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
        this.pushPassContent(syRender.ShaderType.Sprite,[],[
            [syRender.PassCustomKey.offlineRender,true]
        ]);
    }
    protected onSetTextureUrl(tex:Texture):void{
        GameMainCamera.instance.pushRenderTexture(syRender.RenderTextureUUid.shadowMap,tex as RenderTexture)
        G_LightCenter.lightData.shadow.map = tex.glID;
    }
}