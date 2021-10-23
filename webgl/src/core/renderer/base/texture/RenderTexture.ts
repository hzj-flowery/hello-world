
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
 * Color[x][y] = rgba :x和y的值范围就是[0,1]
 * Depth[x][y] = z:   x和y的值范围就是[0,1]
 * Stencil[x][y] = s :x和y的值范围就是[0,1]
 * 
 * 第六步：屏幕映射，将标准的ndc坐标映射到屏幕坐标系下([0,width][0,height])
 * 
 * 第七步：将结果输出到帧缓冲中
 * ----------------------------------------------------------------------------end
 * 
 * --深刻理解以下几个变量
 * gl_FragCoord：片元在窗口的坐标位置：x, y, z, 1/w，只读, x和y是片段的窗口空间坐标，原点为窗口的左下角, z为深度值
 * 对于这个变量我们可以直接在片元着色器中使用 何为窗口坐标？就是屏幕坐标啊
 * 这里就一个特别大的误区：写入到帧缓冲的各个附件的位置坐标是标准的ndc坐标，比如我们要从上一次生成的纹理中指定位置取数据，应该用ndc的坐标
 * 那如何取到这个ndc坐标呢？两种方案：
 * 方案1：将顶点着色器中最后的gl_position,传到片元着色器中，然后在片元着色器中执行齐次除法，再将齐次裁切坐标转为标准的ndc坐标，即可
 * 方案2：拿到gl_FragCoord这个值，执行屏幕坐标转为ndc坐标，即x除以屏幕的宽度，y除以屏幕的高度，最后就算出标准的ndc的坐标
 * 
 */


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
    private _renderBuffer_Depth: WebGLRenderbuffer;//深度渲染缓冲的glID
    private _renderBuffer_Depth_Stencil: WebGLRenderbuffer;//深度和模板渲染缓存的glID
    private _deferredTexMap: Map<syRender.BuiltinTexture, WebGLTexture>;
    private _deferredTexMapPos:Map<number,WebGLTexture>;
    public get frameBuffer() {
        return this._frameBuffer;
    }
    /**
     * 
     * @param place 
     * @param width 
     * @param height 
     * @param nums 
     */
    public attach(attachPlace: syRender.AttachPlace, width: number, height: number, param?: any) {
        if (attachPlace == syRender.AttachPlace.Color) {
            this.renderTextureToColor(width, height);
        }
        else if (attachPlace == syRender.AttachPlace.Depth) {
            let isWebgl2 = this._gl instanceof WebGL2RenderingContext ? true : false;
            isWebgl2 ? this.renderTextureToDepthWebgl2(width, height) : this.renderTextureToDepthWebgl1(width, height);
        }
        else if (attachPlace == syRender.AttachPlace.MoreColor) {
            this.renderMoreTextureToColor(width, height, param);
        }
        this.checkAndUnbind();
        this.loaded = true;
    }
    private checkAndUnbind(): void {
        var gl = this._gl;
        // 检测帧缓冲区对象的配置状态是否成功
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

        if (e !== gl.FRAMEBUFFER_COMPLETE) {
            switch (e) {
                case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_ATTACHMENT');
                    break;
                }
                case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT');
                    break;
                }
                case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_INCOMPLETE_DIMENSIONS');
                    break;
                }
                case gl.FRAMEBUFFER_UNSUPPORTED: {
                    console.error('glCheckFramebufferStatus() - FRAMEBUFFER_UNSUPPORTED');
                    break;
                }
                default:
            }
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
    private renderMoreTextureToColor(dtWidth: number, dtHeight: number, texData: Array<any>): void {

        if (!texData || texData.length <= 0) {
            return
        }

        this._deferredTexMap = new Map();
        this._deferredTexMapPos = new Map();
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

        let COLOR_ATTACHMENT = [];
        let startCount = 0;
        for (let i = 0; i < texData.length; i++) {
            var texType = texData[i].type;
            if (texType == syRender.BuiltinTexture.None) {
                this._gl.deleteTexture(this.glID);
                var tempTex = G_TextureManager.createTexture(texData[i].value);
                this.glID = tempTex.glID;
                this._deferredTexMap.set(syRender.BuiltinTexture.None, this.glID)
                continue;
            }
            let textureID = gl.createTexture();
            //创建纹理
            gl.bindTexture(gl.TEXTURE_2D, textureID);
            // Y 轴取反
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);
            this.texParameteri(gl.LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT);
            //设置纹理格式，作为帧缓冲的颜色附件
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dtWidth, dtHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            //设置上面创建纹理作为颜色附件
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl["COLOR_ATTACHMENT" + startCount], gl.TEXTURE_2D, textureID, 0);
            COLOR_ATTACHMENT.push(gl["COLOR_ATTACHMENT" + startCount]);
            this._deferredTexMap.set(texType, textureID);
            this._deferredTexMapPos.set(startCount,textureID);
            startCount++;
        }
        this.addRenderBuffer(dtWidth, dtHeight,true);
        //采样到几个颜色附件(对应的几何纹理)
        gl.drawBuffers(COLOR_ATTACHMENT);

    }

    /**
     * 获取延迟渲染的纹理
     * @param ty 
     * @returns 
     */
    public getDeferredTex(ty: syRender.BuiltinTexture): WebGLTexture {
        return this._deferredTexMap.get(ty)
    }

    /**
     * 获取延迟渲染纹理的数量
     * @returns 
     */
    public getDeferredTexSize(): number {
        if (!this._deferredTexMap) {
            return 0;
        }
        if (this._deferredTexMap.get(syRender.BuiltinTexture.None)) {
            //普通的纹理不能包含在里面
            return this._deferredTexMap.size - 1;
        }
        return this._deferredTexMap.size
    }
    /**
     * 判断是否事离线渲染
     */
    public isDeferred(): boolean {
        return this._deferredTexMap && this._deferredTexMap.size >= 1;
    }

    /**
     * 渲染纹理到颜色附件
     * @param dtWidth 
     * @param dtHeight 
     */
    private renderTextureToColor(dtWidth: number, dtHeight: number): void {
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

        this.addRenderBuffer(dtWidth, dtHeight,true);
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
        this.texParameteri(gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE)
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

        this.addRenderBuffer(dtWidth, dtHeight,true);
    }
    
    /**
     * 
     * @param dtWidth 
     * @param dtHeight 
     * @param isAddStencil 是否加入模板缓冲
     */
    private addRenderBuffer(dtWidth: number, dtHeight: number,isAddStencil?):void{
        var gl = this._gl
        if(isAddStencil)
        {
            //添加渲染缓冲充当深度和模板附件
            //创建渲染缓冲区
            if (!this._renderBuffer_Depth_Stencil)
                this._renderBuffer_Depth_Stencil = gl.createRenderbuffer();
            //设置渲染缓冲对象作为深度附件
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer_Depth_Stencil);
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
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, dtWidth, dtHeight);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer_Depth_Stencil);
        }
        else
        {
            //添加渲染缓冲充当深度附件
            //创建渲染缓冲区
            if (!this._renderBuffer_Depth)
                this._renderBuffer_Depth = gl.createRenderbuffer();
            //设置渲染缓冲对象作为深度附件
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer_Depth);
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
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer_Depth);
        }
    }

    destroy() {
        super.destroy();
        if (this._frameBuffer) {
            this._gl.deleteFramebuffer(this._frameBuffer);
            this._frameBuffer = null;
        }
        if (this._renderBuffer_Depth) {
            this._gl.deleteRenderbuffer(this._renderBuffer_Depth);
            this._renderBuffer_Depth = null;
        }
        if (this._renderBuffer_Depth_Stencil) {
            this._gl.deleteRenderbuffer(this._renderBuffer_Depth_Stencil);
            this._renderBuffer_Depth_Stencil = null;
        }
    }

    private _resetUnderlyingMipmaps(): void {

    }


}

