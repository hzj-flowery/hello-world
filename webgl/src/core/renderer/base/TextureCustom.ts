import { Texture } from "./Texture";
import { GLapi } from "../gfx/GLapi";

/**
 * 自定义纹理
 */
export default class TextureCustom extends Texture{
    constructor(gl){
        super(gl);
        this._target = gl.TEXTURE_2D;
        
    }
    /**
     * @param {level,internalFormat,width,height,border,format,type,data,alignment} urlData
     */
    public set url(urlData){
        this.initTexture(urlData);
    }
    private initTexture(urlData:{level,internalFormat,width,height,border,format,type,data,alignment}) {

        this.loaded = true;
        
        var gl = this._gl;
        gl.bindTexture(this._target,this._glID);

        // fill texture with 3x2 pixels
        var level = urlData.level||0;
        var internalFormat = urlData.internalFormat;
        var width = urlData.width;
        var height = urlData.height;
        var border = urlData.border||0;
        var format = urlData.format;
        var type = urlData.type||gl.UNSIGNED_BYTE;
        var data = urlData.data;
        var alignment = urlData.alignment||1;


        GLapi.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
        GLapi.texImage2D(this._target, level, internalFormat, width, height, border,
            format, type, data);

        // set the filtering so we don't need mips and it's not filtered
        GLapi.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        GLapi.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        GLapi.texParameteri(this._target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        GLapi.texParameteri(this._target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

}