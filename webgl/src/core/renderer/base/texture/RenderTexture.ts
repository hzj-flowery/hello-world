
import { Texture2D } from "./Texture2D";
import { syGL } from "../../gfx/syGLEnums";

/**
 * 帧缓冲
 * 模板附件     颜色附件         深度附件     累计附件
 * 接收         纹理（渲染缓冲） 渲染缓冲     渲染缓冲
 */

/**
 * !#en The depth buffer and stencil buffer format for RenderTexture.
 * !#zh RenderTexture 的深度缓冲以及模板缓冲格式。
 * @enum RenderTexture.DepthStencilFormat
 */
let DepthStencilFormat = {
    /**
     * !#en 24 bit depth buffer and 8 bit stencil buffer
     * !#zh 24 位深度缓冲和 8 位模板缓冲
     * @property RB_FMT_D24S8
     * @readonly
     * @type {number}
     */
    RB_FMT_D24S8: syGL.RenderBufferFormat.D24S8,
    /**
     * !#en Only 8 bit stencil buffer
     * !#zh 只申请 8 位模板缓冲
     * @property RB_FMT_S8
     * @readonly
     * @type {number}
     */
    RB_FMT_S8: syGL.RenderBufferFormat.S8,
    /**
     * !#en Only 16 bit depth buffer
     * !#zh 只申请 16 位深度缓冲
     * @property RB_FMT_D16
     * @readonly
     * @type {number}
     */
    RB_FMT_D16: syGL.RenderBufferFormat.D16
}

enum AttachPlace {
    Color = 1,
    Depth,
    MoreColor
}

/**
 * Render textures are textures that can be rendered to.
 * @class RenderTexture
 * @extends Texture2D
 */
export class RenderTexture extends Texture2D {

    constructor() {
        super();
        this.initFrameBuffer();
    }
    //初始化帧缓存
    private initFrameBuffer(): void {
        var gl = this._gl;
        //创建帧缓冲
        this._frameBuffer = gl.createFramebuffer();
        //创建渲染缓冲区
        this._renderBuffer = gl.createRenderbuffer();
    }
    private _frameBuffer: WebGLFramebuffer;//帧缓冲的glID
    private _renderBuffer: WebGLRenderbuffer;//渲染缓冲的glID
    private _moreTexture:Array<WebGLTexture>;//多纹理
    private _attachPlace:AttachPlace;
    public get frameBuffer(){
        return this._frameBuffer;
    }
    public get moreTexture():Array<WebGLTexture>{
        return this._moreTexture;
    }
    /**
     * 
     * @param place 
     * @param width 
     * @param height 
     * @param nums 
     */
    public attach(place:string,width:number,height:number,nums:number=1) {
        if(place=="color")
        {
            this.renderTextureToColor(width,height);
            this._attachPlace = AttachPlace.Color;
        }
        else if(place=="depth")
        {
            let isWebgl2 = this._gl instanceof WebGL2RenderingContext?true:false;
            isWebgl2?this.renderTextureToDepthWebgl2(width,height):this.renderTextureToDepthWebgl1(width,height);
            this._attachPlace = AttachPlace.Depth;
        }
        else if(place=="more")
        {
            this.renderMoreTextureToColor(width,height,nums);
            this._attachPlace = AttachPlace.MoreColor
        }
        this.checkAndUnbind();
        this.loaded = true;
    }
    private checkAndUnbind():void{
        var gl = this._gl;
         // 检测帧缓冲区对象的配置状态是否成功
         var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
         if (gl.FRAMEBUFFER_COMPLETE !== e) {
             console.log('Frame buffer object is incomplete: ' + e.toString());
             return;
         }
         else {
             console.log("创建帧缓存成功----------");
         }
         gl.bindFramebuffer(gl.FRAMEBUFFER, null);
         gl.bindTexture(gl.TEXTURE_2D, null);
         gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
    /**
     * 渲染多纹理到颜色附件
     * @param dtWidth 
     * @param dtHeight 
     */
     private renderMoreTextureToColor(dtWidth: number, dtHeight: number,nums:number):void{
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
      
        this._moreTexture = [];
        let COLOR_ATTACHMENT = [];
        for(let i = 0;i<nums;i++)
        {
            let textureID = gl.createTexture();
            this._moreTexture.push(textureID)
            //创建纹理
            gl.bindTexture(gl.TEXTURE_2D, textureID);
            // Y 轴取反
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            //设置纹理格式，作为帧缓冲的颜色附件
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dtWidth, dtHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            //设置上面创建纹理作为颜色附件
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl["COLOR_ATTACHMENT"+i], gl.TEXTURE_2D, textureID, 0);
            COLOR_ATTACHMENT.push(gl["COLOR_ATTACHMENT"+i])
        }


        //设置渲染缓冲对象作为深度附件
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, dtWidth, dtHeight);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer);

        //采样到几个颜色附件(对应的几何纹理)
        gl.drawBuffers(COLOR_ATTACHMENT);
    }

    /**
     * 渲染纹理到颜色附件
     * @param dtWidth 
     * @param dtHeight 
     */
    private renderTextureToColor(dtWidth: number, dtHeight: number):void{
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        //创建纹理
        gl.bindTexture(gl.TEXTURE_2D, this.glID);
        // Y 轴取反
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dtWidth, dtHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        //设置上面创建纹理作为颜色附件
        //参数attachment是gl.COLOR_ATTACHMENT0表示纹理缓冲区作为帧缓冲区的颜色缓冲区，接收片元像素数据，
        //如果是gl.DEPTH_ATTACHMENT表示纹理缓冲区作为帧缓冲区的深度缓冲区，接收片元深度值Z
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glID, 0);


        //设置渲染缓冲对象作为深度附件
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
        /**
         * 指定为颜色缓冲区就可以接收帧缓冲区的片元的像素数据（rgb），指定为深度缓冲区就可以接收片元的深度值Z数据
         *  gl.DEPTH_COMPONENT16	深度缓冲区
         *  gl.DEPTH_COMPONENT24    深度缓冲区
            gl.DEPTH_COMPONENT32F   深度缓冲区
            gl.STENCIL_INDEX8	    模板缓冲区
            gl.RGBA4	            颜色缓冲区，4个分量都是4比特
            gl.RGB5_A1          	颜色缓冲区，RGB分量5比特，A分量1比特
            gl.RGB565	            颜色缓冲区，RGB分量分别5、6、5比特
         */
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, dtWidth, dtHeight);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer);
    }
    private renderTextureToDepthWebgl1(dtWidth: number, dtHeight: number): void {
        var gl = this._gl as WebGLRenderingContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        //深度纹理附件
        gl.bindTexture(gl.TEXTURE_2D, this.glID);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            dtWidth,   // width
            dtHeight,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type  //通道数是4 每一位大小是1个字节
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point 将指定的纹理绑定到帧缓冲的深度附件中
            gl.TEXTURE_2D,        // texture target
            this.glID,    // texture
            0);                   // mip level

        //颜色纹理附件
        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        var tempTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tempTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            dtWidth,
            dtHeight,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        //将颜色纹理附件附加到帧缓存
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point 将指定的纹理绑定到帧缓冲的颜色附件中
            gl.TEXTURE_2D,         // texture target
            tempTexture,         // texture
            0);                    // mip level
    }
    private renderTextureToDepthWebgl2(dtWidth: number, dtHeight: number): void {
        var gl = (this._gl) as WebGL2RenderingContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        //颜色纹理附件
        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.glID = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.glID);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            dtWidth,
            dtHeight,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        //将颜色纹理附件附加到帧缓存
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point 将指定的纹理绑定到帧缓冲的颜色附件中
            gl.TEXTURE_2D,         // texture target
            this.glID,         // texture
            0);                    // mip level
        
        //创建渲染缓冲并绑定以及初始化存储
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
        //深度附件尺寸，每一个深度附件使用24位来表示
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, dtWidth, dtHeight);
        //设置渲染缓冲对象作为深度附件
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer);
    }

    destroy() {
        super.destroy();
        if (this._frameBuffer) {
            this._gl.deleteFramebuffer(this._frameBuffer);
            this._frameBuffer = null;
        }
        if(this._renderBuffer){
            this._gl.deleteRenderbuffer(this._renderBuffer);
            this._renderBuffer = null;
        }
    }

    private _resetUnderlyingMipmaps(): void {

    }


}

