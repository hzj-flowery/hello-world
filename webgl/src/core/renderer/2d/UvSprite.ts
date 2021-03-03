import LoaderManager from "../../LoaderManager";
import { SY } from "../base/Sprite";
export class UvSprite extends SY.Sprite2D {
    constructor() {
        super();
        this.sizeMode = SY.SpriteSizeMode.RAW;
    }
    protected onInit(): void {
        this.setContentSize(100,100);
        [this._vertStr,this._fragStr] = LoaderManager.instance.getGlslRes("UvSprite");
    }
}