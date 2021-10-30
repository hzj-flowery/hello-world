
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { syStateStringKey, syStateStringValue } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";

export class Line extends SY.SpriteBasePolygon {
    constructor() {
        super();
    }
    protected onInit() {
        this.setColor(255,0,0,255);
        this.pushPassContent(syRender.ShaderType.Sprite,[
            [syStateStringKey.primitiveType,syStateStringValue.primitiveType.PT_LINES]
        ],[
            [syRender.PassCustomKey.DefineUse,syRender.ShaderDefineValue.SY_USE_TEXTURE,syRender.ShaderDefineValue.SY_USE_REMOVE_DEFINE]
        ]);
        super.onInit()
    }
}