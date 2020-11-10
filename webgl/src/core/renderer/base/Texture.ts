import { gltex_filter, gltex_wrap, gltex_format, glTextureChanelTotalBytes } from "../gfx/GLEnums";



/**
 * 创建一个纹理的一些设置参数
 */
export class TextureUpdateOpts{
    image:HTMLImageElement;
    width:number       = 1;
    height:number      = 1;
    genMipmaps:boolean = false;//是否开启mipmap技术
    compressed:boolean = false;//纹理是否是压缩的
    anisotropy:number  = 1;//设置纹理所有方向的最大值
    minFilter:number   = gltex_filter.LINEAR;//纹理缩小过滤模式
    magFilter:number   = gltex_filter.LINEAR;//纹理放大过滤模式
    mipFilter:number   = gltex_filter.LINEAR_MIPMAP_LINEAR; //设置纹理缩小过滤的模式为特殊的线性过滤GL_LINEAR_MIPMAP_NEAREST
    wrapS              = gltex_wrap.MIRROR;//设置s方向上的贴图模式为镜像对称重复
    wrapT              = gltex_wrap.MIRROR;//设置t方向上的贴图模式为镜像对称重复
    format:gltex_format= gltex_format.RGBA8;//纹理的格式
}

const _nullWebGLTexture = null;

let _textureID = 0;

export  class Texture {

    /**
     * @param {WebGLContext}
     */
    protected _gl: any;
    public _glID: any;

    protected _width: number;
    protected _height: number;
    protected _genMipmaps: boolean;//是否开启mipmap技术
    protected _compressed: boolean;//纹理是否是压缩的
    protected _anisotropy: number;//设置纹理所有方向的最大值
    protected _minFilter: number;//纹理缩小过滤模式
    protected _magFilter: number;//纹理放大过滤模式
    protected _mipFilter: number;///设置纹理缩小过滤的模式为特殊的线性过滤
    protected _wrapS;//设置s方向上的贴图模式
    protected _wrapT;//设置t方向上的贴图模式
    protected _format: gltex_format;//纹理的格式

    protected _target;//目标缓冲区
    protected _id: number;

    public loaded:boolean = false;//是否加载到内存

    protected _bites:number = 0;//纹理在GPU端所占的内存

    constructor(gl) {
        this._gl = gl;
        this._target = -1;
        this._id = _textureID++;
        this._glID = gl.createTexture();
        this._bites = 0;
        this.loaded = false;
        console.log("-_id-------", this._id);
    }
    protected updateOptions(options: TextureUpdateOpts): void {
        this._width = options.width;
        this._height = options.height;
        this._genMipmaps = options.genMipmaps;
        this._anisotropy = options.anisotropy;
        this._minFilter = options.minFilter;
        this._magFilter = options.magFilter;
        this._mipFilter = options.mipFilter;
        this._wrapS = options.wrapS;
        this._wrapT = options.wrapT;
        // wrapR available in webgl2
        // this._wrapR = enums.WRAP_REPEAT;
        this._format = options.format;

        this._format = options.format;
        this._compressed = 
          (this._format >= gltex_format.RGB_DXT1 && this._format <= gltex_format.RGBA_PVRTC_4BPPV1) || 
          (this._format >= gltex_format.RGB_ETC2 && this._format <= gltex_format.RGBA_ETC2);

          this.updateNormalBytes();
    }
    
    //更新字节数
    private updateNormalBytes():void{
        if(this._compressed==false)
        {
            this._bites = (this._width * this._height * glTextureChanelTotalBytes(this._format))/1024;
        }
    }
    
    //更新由于开启了mipmap而造成的纹理内存增大的字节数
    protected updateGenMipMapsAddBites():void{
          //（1/）
          this.updateNormalBytes();
          this._bites = this._bites*(4/3);
    }

    /**
     * @method destroy
     */
    public destroy() {
        if (this._glID === _nullWebGLTexture) {
            console.error('The texture already destroyed');
            return;
        }
        this._gl.deleteTexture(this._glID);
        this._glID = _nullWebGLTexture;
    }
}