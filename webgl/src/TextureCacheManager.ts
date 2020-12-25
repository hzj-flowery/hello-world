import { Texture } from "./core/renderer/base/texture/Texture";


/**
 * 纹理缓存管理员
 */
export default class TextureCacheManager {
    private static _instance: TextureCacheManager;
    public static get instance(): TextureCacheManager {
        if (!this._instance)
            this._instance = new TextureCacheManager();
        return this._instance;
    }
    private _textureArray: Array<Texture> = [];
    public cacheTexture(tex: Texture): void {
        if (tex)
            this._textureArray.push(tex);
    }
    public uncacheTexture(tex: Texture): void {
        let index = this._textureArray.indexOf(tex);
        if (index >= 0)
            this._textureArray.splice(index, 1);
    }
}