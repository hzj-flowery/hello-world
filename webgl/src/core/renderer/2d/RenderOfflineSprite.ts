import { SY } from "../base/Sprite";
import Device from "../../Device";
import {GameMainCamera} from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";
import { syRender } from "../data/RenderData";
import { Texture } from "../base/texture/Texture";


export class RenderOfflineSprite extends SY.UIImage{
    constructor(){
        super();
    }
    protected onInit(): void {
        this.isUnpackY = true;
        this.pushPassContent(syRender.ShaderType.Sprite,[],[
            [syRender.PassCustomKey.offlineRender,true]
        ]);
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
    }
    protected onSetTextureUrl(tex:Texture):void{
        GameMainCamera.instance.pushRenderTexture(syRender.RenderTextureUUid.offline2D,tex as RenderTexture)
        
    }
}