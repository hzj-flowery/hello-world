
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { StateString, StateValueMap } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";

export class Line extends SY.SpriteBasePolygon {
    constructor() {
        super();
    }
    protected onInit() {
        this.color = [1.0,0,0,1.0];
        this.pushPassContent(syRender.ShaderType.Line,[
            [StateString.primitiveType,StateValueMap.primitiveType.PT_LINES]
        ]);
        super.onInit()
    }
}