
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { glEnums } from "../gfx/GLapi";
import { StateString, StateValueMap } from "../gfx/State";

export class Pen extends SY.SpriteBasePolygon {
    constructor() {
        super();
    }
    private _screenPos:Array<any> = [];
    private _stop2Clear:boolean = true;//
    protected onInit(): void {
        this._node__type = syRender.NodeType.D2;
        this.color = [1.0,0,0,1.0];
        this.pushPassContent(syRender.ShaderType.Point,[
            [StateString.primitiveType,StateValueMap.primitiveType.PT_POINTS]
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