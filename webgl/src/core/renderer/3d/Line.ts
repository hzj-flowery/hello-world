
import { SY } from "../base/Sprite";
import { syGL } from "../gfx/syGLEnums";

export class Line extends SY.SpriteBaseLine {
    constructor() {
        super();
        //画线
        this._glPrimitiveType = syGL.PrimitiveType.LINES;
        
    }
    protected onInit() {
        this.color = [1.0,0,0,1.0];
    }
}