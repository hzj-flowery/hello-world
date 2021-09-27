
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { StateString, StateValueMap } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";

export class Line extends SY.SpriteBasePolygon {
    constructor() {
        super();
    }
    protected onInit() {
        this.setColor(255,0,0,255);
        this.pushPassContent(syRender.ShaderType.Line,[
            [StateString.primitiveType,StateValueMap.primitiveType.PT_LINES]
        ]);
        super.onInit()
    }
}