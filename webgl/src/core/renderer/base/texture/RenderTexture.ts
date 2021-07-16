
import { Texture2D } from "./Texture2D";
import { syGL } from "../../gfx/syGLEnums";
import { TextureOpts } from "./Texture";
import { G_TextureManager } from "./TextureManager";
import { syRender } from "../../data/RenderData";

/**
 * 屏幕映射-------------------------------------start
 * 假如屏幕的尺寸是1000*1000
 *  rgb rgb rgb ... rgb --1000
 *  rgb rgb rgb ... rgb --1000
 *  ...
 *  rgb rgb rgb ... rgb --1000
 * 
 * [0,1]--------->[1,1000]
 * 最小计量单位是：0.001
 * ---------------------------------------------end
 * 
 * 
 * 帧缓冲
 * 模板附件     颜色附件         深度附件     累计附件
 * 接收         纹理（渲染缓冲） 渲染缓冲     渲染缓冲
 * ---------------------------------------------------------------------------start
 * 第一步：cup准备顶点数据
 * 
 * 第二步：启动顶点着色器
 * 
 * 第三步：投影 执行齐次除法 将坐标转换到齐次裁切空间坐标系下[-1,1]
 * 
 * 第四步：规范化设备坐标，将坐标转换到ndc标准的设备空间坐标系下[0,1]
 * 
 * 执行光栅化 产生更多的片元
 * 
 * 第五步：启动片元着色器
 * 
 * 将结果写入到帧缓冲的相关附件中，其实这个附件就是一个二维数组，下标的范围是[0,1],这一点非常重要
 * Color[x][y] = rgb :x和y的值范围就是[0,1]
 * Depth[x][y] = z:   x和y的值范围就是[0,1]
 * Stencil[x][y] = s :x和y的值范围就是[0,1]
 * 
 * 第六步：屏幕映射，将标准的ndc坐标映射到屏幕坐标系下([0,width][0,height])
 * 
 * 第七步：将结果输出到帧缓冲中
 * ----------------------------------------------------------------------------end
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
    }
    private _frameBuffer: WebGLFramebuffer;//帧缓冲的glID
    private _renderBuffer: WebGLRenderbuffer;//渲染缓冲的glID
    private _deferredTexMap:Map<syRender.DeferredTexture,WebGLTexture>;
    private _attachPlace:AttachPlace;
    public get frameBuffer(){
        return this._frameBuffer;
    }
    /**
     * 
     * @param place 
     * @param width 
     * @param height 
     * @param nums 
     */
    public attach(place:string,width:number,height:number,param?:any) {
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
            this.renderMoreTextureToColor(width,height,param);
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
     private renderMoreTextureToColor(dtWidth: number, dtHeight: number,param:any):void{

        if(!param||!param.texArr||param.texArr.length<=0)
        {
            return
        }
        
        this._deferredTexMap = new Map();
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        
        if(param&&param.url&&param.url!="")
        {
            //删除本身的纹理显存 
            this._gl.deleteTexture(this.glID);
            var tempTex = G_TextureManager.createTexture(param.url);
            this.glID = tempTex.glID;
            this._deferredTexMap.set(syRender.DeferredTexture.None,this.glID)
        }
        let bindTexArr = param.texArr as Array<syRender.DeferredTexture>;
        let COLOR_ATTACHMENT = [];
        for(let i = 0;i<bindTexArr.length;i++)
        {
            let textureID = gl.createTexture();
            //创建纹理
            gl.bindTexture(gl.TEXTURE_2D, textureID);
            // Y 轴取反
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
            this.texParameteri(gl.LINEAR,gl.LINEAR,gl.REPEAT,gl.REPEAT);
            //设置纹理格式，作为帧缓冲的颜色附件
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dtWidth, dtHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            //设置上面创建纹理作为颜色附件
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl["COLOR_ATTACHMENT"+i], gl.TEXTURE_2D, textureID, 0);
            COLOR_ATTACHMENT.push(gl["COLOR_ATTACHMENT"+i]);
            this._deferredTexMap.set(bindTexArr[i],textureID)
        }
        this.addRenderBufferToDepth(dtWidth, dtHeight);
            //采样到几个颜色附件(对应的几何纹理)
        gl.drawBuffers(COLOR_ATTACHMENT);

    }
    
    /**
     * 获取延迟渲染的纹理
     * @param ty 
     * @returns 
     */
    public getDeferredTex(ty:syRender.DeferredTexture):WebGLTexture{
        return this._deferredTexMap.get(ty)
    }
    
    /**
     * 获取延迟渲染纹理的数量
     * @returns 
     */
    public getDeferredTexSize():number{
        return this._deferredTexMap?(this._deferredTexMap.size-1):0;
    }
    /**
     * 判断是否事离线渲染
     */
    public isDeferred():boolean{
       return this._deferredTexMap && this._deferredTexMap.size >=2;
    }

    /**
     * 渲染纹理到颜色附件
     * @param dtWidth 
     * @param dtHeight 
     */
    private renderTextureToColor(dtWidth: number, dtHeight: number):void{
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        var options = new TextureOpts();
        options.data = null;
        options.width = dtWidth;
        options.height = dtHeight;
        options.unpackFlipY = false;
        options.magFilter = syGL.TexFilter.LINEAR;
        options.minFilter = syGL.TexFilter.LINEAR;
        options.wrapS = syGL.TextureWrap.REPEAT;
        options.wrapT = syGL.TextureWrap.REPEAT;
        options.configFormat = syGL.TextureFormat.RGBA8
        this.updateOptions(options);
        this.upload();
        //设置上面创建纹理作为颜色附件
        //参数attachment是gl.COLOR_ATTACHMENT0表示纹理缓冲区作为帧缓冲区的颜色缓冲区，接收片元像素数据，
        //如果是gl.DEPTH_ATTACHMENT表示纹理缓冲区作为帧缓冲区的深度缓冲区，接收片元深度值Z
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glID, 0);

        this.addRenderBufferToDepth(dtWidth, dtHeight)
    }
    private renderTextureToDepthWebgl1(dtWidth: number, dtHeight: number): void {
        var gl = this._gl as WebGLRenderingContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        //深度纹理附件
        var options = new TextureOpts();
        options.data = null;
        options.width = dtWidth;
        options.height = dtHeight;
        options.magFilter = syGL.TexFilter.NEAREST;
        options.minFilter = syGL.TexFilter.NEAREST;
        options.wrapS = syGL.TextureWrap.CLAMP;
        options.wrapT = syGL.TextureWrap.CLAMP;
        options.configFormat = syGL.TextureFormat.D32
        this.updateOptions(options);
        this.upload();

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
        this.texParameteri(gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE,gl.CLAMP_TO_EDGE)
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
        var options = new TextureOpts();
        options.data = null;
        options.width = dtWidth;
        options.height = dtHeight;
        options.magFilter = syGL.TexFilter.NEAREST;
        options.minFilter = syGL.TexFilter.NEAREST;
        options.wrapS = syGL.TextureWrap.CLAMP;
        options.wrapT = syGL.TextureWrap.CLAMP;
        options.configFormat = syGL.TextureFormat.RGBA8
        this.updateOptions(options);
        this.upload();
        // attach it to the framebuffer
        //将颜色纹理附件附加到帧缓存
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point 将指定的纹理绑定到帧缓冲的颜色附件中
            gl.TEXTURE_2D,         // texture target
            this.glID,         // texture
            0);                    // mip level

        this.addRenderBufferToDepth(dtWidth, dtHeight)
    }
    
    /**
     * 添加渲染缓冲充当深度附件
     * @param dtWidth 
     * @param dtHeight 
     */
    private addRenderBufferToDepth(dtWidth:number, dtHeight:number):void{
        var gl = this._gl

        //创建渲染缓冲区
        if(!this._renderBuffer)
        this._renderBuffer = gl.createRenderbuffer();

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

