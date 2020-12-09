import { gltex_filter } from "../gfx/GLEnums";
import { Texture, TextureOpts } from "./Texture";

/**
 * 自定义纹理
 */
export default class TextureCustom extends Texture {
    constructor(gl) {
        super(gl);
        this._target = gl.TEXTURE_2D;

    }
    public set url(urlData:TextureOpts) {
        this.updateOptions(urlData);
        this.loaded = true;
        this.upload();
    }
}