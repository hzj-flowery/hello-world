
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";

export class Line extends SY.SpriteBasePolygon {
    constructor() {
        super();
    }
    protected onInit() {
        this.color = [1.0,0,0,1.0];
        this._glPrimitiveType = syGL.PrimitiveType.LINES;
        super.onInit()
    }
}