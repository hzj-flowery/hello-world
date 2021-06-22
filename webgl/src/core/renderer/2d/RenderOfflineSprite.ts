import { SY } from "../base/Sprite";
import Device from "../../Device";
import {GameMainCamera} from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";


export class RenderOfflineSprite extends SY.Sprite2D{
    constructor(){
        super();
    }
    protected onInit(): void {
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
    }
    protected onSetTextureUrl():void{
        
        GameMainCamera.instance.get2DCamera().targetTexture = this.texture as RenderTexture;
    }
}