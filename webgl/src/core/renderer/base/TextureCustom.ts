import { Texture, TextureUpdateOpts } from "./Texture";

/**
 * 自定义纹理
 */
export default class TextureCustom extends Texture {
    constructor(gl) {
        super(gl);
        this._target = gl.TEXTURE_2D;

    }
    public set url(urlData:TextureUpdateOpts) {
        this.initTexture(urlData);
    }
    private initTexture(urlData: TextureUpdateOpts) {
        this.loaded = true;
        var gl = this._gl;
        gl.bindTexture(this._target, this._glID);
        var level = urlData.level || 0;
        var internalFormat = urlData.internalFormat;
        var width = urlData.width;
        var height = urlData.height;
        var border = urlData.border || 0;
        var format = urlData.format;
        var type = urlData.pixelType || gl.UNSIGNED_BYTE;
        var data = urlData.data;
        var alignment = urlData.alignment || 1;

        let minFilter = urlData.minFilter;
        let magFilter = urlData.magFilter;
        let wraps = urlData.wrapS;
        let wrapt = urlData.wrapT;

        this._gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
        this._gl.texImage2D(
            this._target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            data);

        if(urlData.compressed)
        {
            //生成多远渐进纹理
            gl.generateMipmap(this._target);
        }
        // set the filtering so we don't need mips and it's not filtered
        this._gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, minFilter);
        this._gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, magFilter);
        this._gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, wraps);
        this._gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, wrapt);
    }

}