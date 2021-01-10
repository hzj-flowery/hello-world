import { gltex_filter } from "../../gfx/GLEnums";
import { Texture, TextureOpts } from "./Texture";

/**
 * 自定义纹理
 */
export default class TextureCustom extends Texture {
    constructor() {
        super();
        this._target = this._gl.TEXTURE_2D;

    }
    public set url(urlData:TextureOpts) {
        this.updateOptions(urlData);
        this.loaded = true;
        this.upload();
    }
}