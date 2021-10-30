
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { glEnums } from "../gfx/GLapi";
import { syStateStringKey, syStateStringValue } from "../gfx/State";

export class Pen extends SY.SpriteBasePolygon {
    constructor() {
        super();
    }
    private _screenPos:Array<any> = [];
    private _stop2Clear:boolean = true;//
    protected onInit(): void {
        this._node__type = syRender.NodeType.D2;
        this.setColor(255,0,0,255);
        this.pushPassContent(syRender.ShaderType.Sprite,[
            [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_POINTS]
        ],[
        [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE,syRender.ShaderDefineValue.SY_USE_REMOVE_DEFINE],
        [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_POINT_SIZE,2.0]
        ]);
        super.onInit();
    }
    public pushScreenPos(x:number,y:number):void{
         this._screenPos.push({x:x,y:y});
         this.updatePositionData(this._screenPos);
    }
    public clearScreenPos():void{
        this._screenPos = [];
        this.updatePositionData(this._screenPos,this._stop2Clear);
    }
}