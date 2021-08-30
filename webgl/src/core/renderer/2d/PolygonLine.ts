
import { SY } from "../base/Sprite";

export class PolygonLine extends SY.PolygonLine2D {
    constructor() {
        super();
    }
    private _screenPos:Array<any> = [];
    protected onInit(): void {
        this.color = [1.0,0,0,1.0];
    }
    public pushScreenPos(x:number,y:number):void{
         this._screenPos.push({x:x,y:y});
         this.updatePosition(this._screenPos);
    }
    public clearScreenPos():void{
        this._screenPos = [];
        this.updatePosition(this._screenPos);
    }
}