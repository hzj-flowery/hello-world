import Device from "../../../Device";
import {syGL} from "../../gfx/syGLEnums";


/**
 * 创建一个纹理的一些设置参数
 */
export class TextureOpts {
    constructor() {
        this.configFormat = syGL.TextureFormat.RGBA8;//纹理的配置格式
    }
    public set configFormat(format: syGL.TextureFormat) {
        this._configFormat = format;
        let infor = syGL.getTexFmtConfig(format);
        this._pixelType = infor.pixelType;
        this._format = infor.format;
        this._internalFormat = infor.internalFormat;
    }
    public get configFormat() {
        return this._configFormat;
    }
    public get format() {
        return this._format;
    }
    public get internalFormat() {
        return this._internalFormat;
    }
    public get pixelType() {
        return this._pixelType;
    }
    public set data(d){
           this._data = d; 
    }
    public get data(){
        return this._data;
    }
    private _data: Uint8Array|HTMLImageElement|Float32Array;
    private _format: number;
    private _internalFormat: number;
    /**
     * 像素的类型
     * 它准确来说是决定每一个像素关于通道是如何分配字节的
     */
    private _pixelType:syGL.PixelType;
    alignment: number = 1;
    /**
     * 设置该值非常重要
     * 对于外界的jpg png等格式图片数据，一般情况是要翻的转
     * 因为webgl坐标系左下角 UI坐标系左上角
     * 但对于其他格式的或者自己定义的纹理数据，可以根据实际情况来定
     * 如果没有正确定义：可能会造成以下几种情况
     * 对于2d节点，你看到的图像是倒着的
     * 对于3d节点并且这个3d节点还有动画，那么有可能节点会变形
     */
    unpackFlipY:boolean = true;
    /**
     * 纹理是否开启预乘
     * 预乘这个功能主要是为了纹理的线性过滤产生奇怪边缘颜色的
     * 
     */
    premultiplyAlpha:boolean = false;
    /**
     * 默认值为0
     */
    level: number = 0;
    /**
     * 默认值为0
     */
    border: number = 0;
    /**
     * 纹理的宽度 有多少个像素点
     */
    width: number = 1;
    /**
     * 纹理的高度 有多少个像素点 
    */    
    height: number = 1;    
    genMipmaps: boolean = false;//是否开启mipmap技术
    compressed: boolean = false;//纹理是否是压缩的
    anisotropy: number = 1;//设置纹理所有方向的最大值
    minFilter: number = syGL.TexFilter.LINEAR;//纹理缩小过滤模式
    magFilter: number = syGL.TexFilter.LINEAR;//纹理放大过滤模式
    /**
     *设置纹理缩小过滤的模式为特殊的线性过滤GL_LINEAR_MIPMAP_NEAREST
      这个格式只适用于多远渐进纹理
     */
    mipFilter: number = syGL.TexFilter.LINEAR_MIPMAP_LINEAR; 
    wrapS = syGL.TextureWrap.MIRROR;//设置s方向上的贴图模式为镜像对称重复
    wrapT = syGL.TextureWrap.MIRROR;//设置t方向上的贴图模式为镜像对称重复
    private _configFormat: syGL.TextureFormat;//纹理的配置格式

    //参数的有效性
    //一般使用前 调用一下
    public checkValid(): void {
        if(this.genMipmaps&&this.isPow2(this.width)==false||this.isPow2(this.height)==false)
        {
            console.warn('WebGL1 doesn\'t support all wrap modes with NPOT textures');
            this.genMipmaps = false;
        }
        if(!this.isValidMag(this.magFilter))
        {
            this.magFilter = syGL.TexFilter.NEAREST;
        }
        if(!this.isValidMin(this.minFilter))
        {
            this.minFilter = syGL.TexFilter.NEAREST;
        }
    }
    static readonly _validMagData: Array<number> = [syGL.TexFilter.LINEAR, syGL.TexFilter.NEAREST];
    static readonly _validMinData: Array<number> = [syGL.TexFilter.LINEAR, syGL.TexFilter.NEAREST,
    syGL.TexFilter.LINEAR_MIPMAP_LINEAR,
    syGL.TexFilter.LINEAR_MIPMAP_NEAREST,
    syGL.TexFilter.NEAREST_MIPMAP_LINEAR,
    syGL.TexFilter.NEAREST_MIPMAP_NEAREST]
    private isValidMag(mag: number): boolean {
        return TextureOpts._validMagData.indexOf(mag) >= 0;
    }
    private isValidMin(min:number):boolean{
        if(this.genMipmaps)
        {
            //表示当前数据可能要生成多远渐进纹理
            return TextureOpts._validMinData.indexOf(min)>=0;
        }
        else
        {
            //如果没有可能生成多远渐进纹理，那么缩小的取值算法必须和放大一样
            return this.isValidMag(min)
        }
    }
    //判断当前数是不是2的幂
    private isPow2(v) {
        return !(v & (v - 1)) && (!!v);
    }
}

const _nullWebGLTexture = null;

let _textureID = 0;

export class Texture {

    /**
     * @param {WebGLContext}
     */
    protected _gl: WebGL2RenderingContext;
    public _glID: WebGLTexture;

    protected _width: number;     //纹理的真实宽度
    protected _height: number;    //纹理的真实高度
    protected _genMipmaps: boolean;//是否开启mipmap技术
    protected _compressed: boolean;//纹理是否是压缩的
    protected _anisotropy: number;//设置纹理所有方向的最大值
    protected _minFilter: number;//纹理缩小过滤模式
    protected _magFilter: number;//纹理放大过滤模式
    protected _mipFilter: number;///设置纹理缩小过滤的模式为特殊的线性过滤
    protected _border:number;
    protected _level:number;
    protected _unpackFlipY:boolean;
    protected _premultiplyAlpha:boolean;
    protected _alignment:number;
    protected _pixelType:number;//像素的类型,是一个字节存放还是多个字节
    protected _data:any;
    protected _wrapS;//设置s方向上的贴图模式
    protected _wrapT;//设置t方向上的贴图模式
    protected _cformat: syGL.TextureFormat;//纹理的格式
    protected _format:number;
    protected _internalFormat:number;
    protected _target;//目标缓冲区
    protected _id: number;

    public loaded: boolean = false;//是否加载到内存

    protected _bites: number = 0;//纹理在GPU端所占的内存

    public get glID():WebGLTexture{
        return this._glID
    }
    public set glID(glID:WebGLTexture){
        this._glID = glID
    }

    
    /**
     * 是否是2d纹理图片
     */
    public get isTexture2D():boolean{
       return this._target==this._gl.TEXTURE_2D;
    }
    /**
     * 是否是立方体纹理
     */
    public get isTextureCube():boolean{
        return this._target==this._gl.TEXTURE_CUBE_MAP;
    }


    constructor() {
        this._gl = Device.Instance.gl;
        this._target = -1;
        this._id = _textureID++;
        this.glID = this._gl.createTexture();
        this._bites = 0;
        this.loaded = false;
    }
    protected updateOptions(options: TextureOpts): void {
        if(!options)
        {
            console.log("传入值为空------",options);
            return;
        }
        options.checkValid();
        this._width = options.width;
        this._height = options.height;
        this._genMipmaps = options.genMipmaps;
        this._anisotropy = options.anisotropy;
        this._minFilter = options.minFilter;
        this._magFilter = options.magFilter;
        this._mipFilter = options.mipFilter;
        this._wrapS = options.wrapS;
        this._wrapT = options.wrapT;
        this._border = options.border;
        this._level = options.level;
        this._data = options.data;
        this._format = options.format;
        this._internalFormat = options.internalFormat;
        this._pixelType = options.pixelType;
        this._alignment = options.alignment;
        this._unpackFlipY = options.unpackFlipY;
        this._premultiplyAlpha = options.premultiplyAlpha;

        // wrapR available in webgl2
        // this._wrapR = enums.WRAP_REPEAT;
        this._cformat = options.configFormat;

        this._cformat = options.configFormat;
        this._compressed =
            (this._cformat >= syGL.TextureFormat.RGB_DXT1 && this._cformat <= syGL.TextureFormat.RGBA_PVRTC_4BPPV1) ||
            (this._cformat >= syGL.TextureFormat.RGB_ETC2 && this._cformat <= syGL.TextureFormat.RGBA_ETC2);

        this.updateNormalBytes();
    }

    protected upload(){
        this.uploadTextureToGPU(); 
    }
    
    /**
     * 更新显存中的纹理数据
     */
    public reUpload(data:Uint8Array|HTMLImageElement|Float32Array):void{
          this._data = data;
          this.upload();
    }
    /**
     * 设置GPU中纹理操作
     */
    private setTextureOperator(): void {
        let gl = this._gl;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT,this._alignment);
        // Y 轴取反
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this._unpackFlipY);
        //预乘
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this._premultiplyAlpha);
        if(this._genMipmaps)
        {
            // 生成 MipMap 映射
            // 首先要调用此方法
            // 要在texImage2D 后调用，否则会报错error:GL_INVALID_OPERATION  gl.generateMipmap(this._target)
            //如果开启此技术对于256*256这个贴图 它的内存占用会比原来多出三分之一
            //256*256 p(gpu内存) = (width * height * 4 /1024)*(4/3) =342
            //能够使用这个技术的图片的宽高必须是2的幂
            //此技术开启以后，会生成以下级别的图片，256*256这个是0级
            //级别：128*128（1）,64*64（1）,32*32（1）,16*16（1）,8*8（1）,4*4（1）,2*2（1）,1*1（1）
            //实时渲染时，根据采样密度选择其中的某一级纹理，以此避免运行时的大量计算

            //生成多远渐进纹理
            console.log("生成多远渐进纹理");
            gl.generateMipmap(this._target);
        }
        this.texParameteri()
    }
    
    /**
     * 设置纹理过滤
     *  * MIN_FILTER 和 MAG_FILTER
         * -------------对于纹理的放大
         * 一个纹理是由离散的数据组成的，比如一个 2x2 的纹理是由 4 个像素组成的，使用 (0,0)、(0, 1) 等四个坐标去纹理上取样，自然可以取到对应的像素颜色；
         * 但是，如果使用非整数坐标到这个纹理上去取色。比如，当这个纹理被「拉近」之后，在屏幕上占据了 4x4 一共 16 个像素，
         * 那么就会使用 (0.33,0) 之类的坐标去取值，如何根据离散的 4 个像素颜色去计算 (0.33,0) 处的颜色，就取决于参数 MAG_FILTER
         * MAG_FILTER（放大） 有两个可选项，NEAREST 和 LINEAR。
         * 顾名思义，NEAREST 就是去取距离当前坐标最近的那个像素的颜色，而 LINEAR 则会根据距离当前坐标最近的 4 个点去内插计算出一个数值
         * NEAREST：速度快，但图片被放的比较大的时候,图片的颗粒感会比较明显
         * LINEAR： 速度慢点，但图片会显示的更顺滑一点
         * -------------对于纹理的缩小
         * MIN_FILTER（缩小） 有以下 6 个可选配置项：
         * NEAREST
         * LINEAR
         * NEAREST_MIPMAP_NEAREST
         * NEAREST_MIPMAP_LINEAR
         * LINEAR_MIPMAP_NEAREST
         * LINEAR_MIPMAP_LINEAR
         * 前两个配置项和 MAG_FILTER 的含义和作用是完全一样的。
         * 但问题是，当纹理被缩小时，原纹理中并不是每一个像素周围都会落上采样点，这就导致了某些像素，完全没有参与纹理的计算，新纹理丢失了一些信息。
         * 假设一种极端的情况，就是一个纹理彻底缩小为了一个点，那么这个点的值应当是纹理上所有像素颜色的平均值，这才比较合理。
         * 但是 NEAREST 只会从纹理中取一个点，而 LINEAR 也只是从纹理中取了四个点计算了一下而已。这时候，就该用上 MIPMAP 了
         * 
         * 为了在纹理缩小也获得比较好的效果，需要按照采样密度，选择一定数量（通常大于 LINEAR 的 4 个，极端情况下为原纹理上所有像素）的像素进行计算。
         * 实时进行计算的开销是很大的，所有有一种称为 MIPMAP（金字塔）的技术。
         * 在纹理创建之初，就为纹理创建好 MIPMAP，比如对 512x512 的纹理，依次建立 256x256（称为 1 级 Mipmap）、128x128（称为 2 级 Mipmap） 乃至 2x2、1x1 的纹理。
         * 实时渲染时，根据采样密度选择其中的某一级纹理，以此避免运行时的大量计算
     * @param minFilter 
     * @param magFilter 
     * @param wrapS 
     * @param wrapT 
     */
    protected texParameteri(minFilter?:number,magFilter?:number,wrapS?:number,wrapT?:number){
        minFilter = minFilter? minFilter:this._minFilter;
        magFilter = magFilter? magFilter:this._magFilter;
        wrapS = wrapS? wrapS:this._wrapS;
        wrapT = wrapT? wrapT:this._wrapT;
         let gl = this._gl
         // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, magFilter);
        gl.texParameteri(this._target, gl.TEXTURE_WRAP_S,wrapS);
        gl.texParameteri(this._target, gl.TEXTURE_WRAP_T,wrapT);
    }
    /**
     * 上传纹理到显存中
     */
    private uploadTextureToGPU(): void {
        this._gl.bindTexture(this._target, this.glID);
        this._gl.texImage2D(
            this._target,
            this._level,
            this._internalFormat,
            this._width,
            this._height,
            this._border,
            this._format,
            this._pixelType,
            this._data);
        this.setTextureOperator();
        this._gl.bindTexture(this._target, null);
    }
    //ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas;
    private uploadImageDataToGPU():void{
        this._gl.texImage2D(
            this._target,
            0, 
            this._format,
            this._internalFormat,
            this._pixelType, 
            this._data);
    }
    //ArrayBuffer||null
    private uploadArrayBufferDataToGPU():void{
        this._gl.texImage2D(
            this._target,
            this._level,
            this._internalFormat,
            this._width,
            this._height,
            this._border,
            this._format,
            this._pixelType,
            this._data);
    }

    //更新字节数
    private updateNormalBytes(): void {
        if (this._compressed == false) {
            this._bites = (this._width * this._height * syGL.getTextureChanelTotalBytes(this._cformat)) / 1024;
            // 开启了mipmap而造成的纹理内存增大的字节数
            this._bites = this._genMipmaps?this._bites * (4 / 3):this._bites;
        }
    }
    /**
     * @method destroy
     */
    public destroy() {
        if (this.glID === _nullWebGLTexture) {
            console.error('The texture already destroyed');
            return;
        }
        this._gl.deleteTexture(this.glID);
        this.glID = _nullWebGLTexture;
    }
}