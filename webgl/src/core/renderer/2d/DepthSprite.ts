import { SY } from "../base/Sprite";
import Device from "../../Device";
import { GameMainCamera} from "../camera/GameMainCamera";
import { RenderTexture } from "../base/texture/RenderTexture";
import { syRender } from "../data/RenderData";


/**
 * 将游戏中的画面渲染到深度纹理中
 */
export class DepthSprite extends SY.Sprite2D{
    constructor(){
        super();
    }
    protected onInit(): void {
        this.setContentSize(Device.Instance.width/4,Device.Instance.height/4);
    }
    protected onSetTextureUrl():void{
        
        GameMainCamera.instance.getCameraByUUid(syRender.CameraUUid.Depth).targetTexture = this.texture as RenderTexture;
        
    }
}