import { glrender_buffer_format } from "../gfx/GLEnums";
import { Texture2D } from "../base/Texture2D";
import FrameBuffer from "../gfx/FrameBuffer";
import RenderBuffer from "../gfx/RenderBuffer";

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
    RB_FMT_D24S8: glrender_buffer_format.D24S8,
    /**
     * !#en Only 8 bit stencil buffer
     * !#zh 只申请 8 位模板缓冲
     * @property RB_FMT_S8
     * @readonly
     * @type {number}
     */
    RB_FMT_S8: glrender_buffer_format.S8,
    /**
     * !#en Only 16 bit depth buffer
     * !#zh 只申请 16 位深度缓冲
     * @property RB_FMT_D16
     * @readonly
     * @type {number}
     */
    RB_FMT_D16: glrender_buffer_format.D16
}

/**
 * Render textures are textures that can be rendered to.
 * @class RenderTexture
 * @extends Texture2D
 */
export class RenderTexture extends Texture2D {

    constructor(gl) {
        super(gl);

        this.intFBRuffers();
    }

    public _frameBuffer: any;//帧缓冲的glID
    public _renderBuffer: any;//渲染缓冲的glID
    public gl_width: number;
    public gl_height: number;

    public intFBRuffers() {
        var gl = this._gl;

        /**
         * 将窗口的宽高赋值给当前的渲染缓冲区
         * 因为如果我们不设置帧缓冲的话，屏幕就是帧缓冲的指向
         */
        this.gl_width = gl.canvas.width;
        this.gl_height =gl.canvas.height;
        //创建帧缓冲并绑定
        this._frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

        //创建渲染缓冲并绑定以及初始化存储
        this._renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.gl_width, this.gl_height);

        //创建纹理
        gl.bindTexture(gl.TEXTURE_2D, this._glID);
         // Y 轴取反
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, false);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);



        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

       

        //设置纹理格式，作为帧缓冲的颜色附件
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.gl_width, this.gl_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);


        //设置上面创建纹理作为颜色附件
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glID, 0);
        //设置渲染缓冲对象作为深度附件
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer);

        


        // 检测帧缓冲区对象的配置状态是否成功
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return;
        }
        else
        {
            console.log("创建帧缓存成功----------");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this.loaded = true;

    }








    // public _framebuffer: FrameBuffer;
    // private _depthStencilBuffer:RenderBuffer;
    // private _packable: boolean;
    // private loaded: boolean;

    // private _texture:Texture2D;
    // /**
    //  * !#en
    //  * Init the render texture with size.
    //  * !#zh
    //  * 初始化 render texture 
    //  * @param {Number} [width] 
    //  * @param {Number} [height]
    //  * @param {Number} [depthStencilFormat]
    //  * @method initWithSize
    //  */
    // initWithSize(width, height, depthStencilFormat) {
    //     this._width = Math.floor(width || 256);
    //     this._height = Math.floor(height || 256);
    //     this._resetUnderlyingMipmaps();

    //     let opts = {
    //         depthStencil:null,
    //         stencil:null,
    //         depth:null,
    //         colors: [this._texture],
    //     };

    //     if (this._depthStencilBuffer) this._depthStencilBuffer.destroy();
    //     let depthStencilBuffer;
    //     if (depthStencilFormat) {
    //         depthStencilBuffer = new RenderBuffer(this._gl, depthStencilFormat, width, height);
    //         if (depthStencilFormat === glrender_buffer_format.D24S8) {
    //             opts.depthStencil = depthStencilBuffer;
    //         }
    //         else if (depthStencilFormat === glrender_buffer_format.S8) {
    //             opts.stencil = depthStencilBuffer;
    //         }
    //         else if (depthStencilFormat === glrender_buffer_format.D16) {
    //             opts.depth = depthStencilBuffer;
    //         }
    //     }
    //     this._depthStencilBuffer = depthStencilBuffer;
    //     if (this._framebuffer) this._framebuffer.destroy();
    //     this._framebuffer = new FrameBuffer(this._gl, width, height, opts);

    //     this._packable = false;

    //     this.loaded = true;
    //     // this.emit("load");
    // }

    // updateSize(width, height) {
    //     this._width = Math.floor(width || 256);
    //     this._height = Math.floor(height || 256);
    //     this._resetUnderlyingMipmaps();

    //     let rbo = this._depthStencilBuffer;
    //     if (rbo) rbo.update(this._width, this._height);
    //     this._framebuffer._width = width;
    //     this._framebuffer._height = height;
    // }

    // /**
    //  * !#en Draw a texture to the specified position
    //  * !#zh 将指定的图片渲染到指定的位置上
    //  * @param {Texture2D} texture 
    //  * @param {Number} x 
    //  * @param {Number} y 
    //  */
    // drawTextureAt(texture, x, y) {
    //     if (!texture._image || texture._image.width === 0) return;

    //     // this._texture.updateSubImage({
    //     //     x, y,
    //     //     image: texture._image,
    //     //     width: texture.width,
    //     //     height: texture.height,
    //     //     level: 0,
    //     //     flipY: false,
    //     //     premultiplyAlpha: texture._premultiplyAlpha
    //     // })
    // }

    // /**
    //  * !#en
    //  * Get pixels from render texture, the pixels data stores in a RGBA Uint8Array.
    //  * It will return a new (width * height * 4) length Uint8Array by default。
    //  * You can specify a data to store the pixels to reuse the data, 
    //  * you and can specify other params to specify the texture region to read.
    //  * !#zh
    //  * 从 render texture 读取像素数据，数据类型为 RGBA 格式的 Uint8Array 数组。
    //  * 默认每次调用此函数会生成一个大小为 （长 x 高 x 4） 的 Uint8Array。
    //  * 你可以通过传入 data 来接收像素数据，也可以通过传参来指定需要读取的区域的像素。
    //  * @method readPixels
    //  * @param {Uint8Array} [data]
    //  * @param {Number} [x] 
    //  * @param {Number} [y] 
    //  * @param {Number} [w] 
    //  * @param {Number} [h] 
    //  * @return {Uint8Array}
    //  */
    // readPixels(data, x, y, w, h) {
    //     if (!this._framebuffer || !this._texture) return data;

    //     x = x || 0;
    //     y = y || 0;
    //     let width = w || this._width;
    //     let height = h || this._height
    //     data = data || new Uint8Array(width * height * 4);

    //     let gl = this._gl;
    //     let oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer.getHandle());
    //     gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, oldFBO);

    //     return data;
    // }

    destroy() {
        super.destroy();
        // if (this._framebuffer) {
        //     this._framebuffer.destroy();
        //     this._framebuffer = null;
        // }
    }

    private _resetUnderlyingMipmaps(): void {

    }


}

