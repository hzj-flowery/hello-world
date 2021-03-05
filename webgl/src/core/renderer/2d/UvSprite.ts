
import { SY } from "../base/Sprite";
export class UvSprite extends SY.Sprite2D {
    constructor() {
        super();
        this.sizeMode = SY.SpriteSizeMode.RAW;
    }
    protected onInit(): void {
        this.setContentSize(100,100);
    }
}