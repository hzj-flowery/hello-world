
import { glMatrix } from "./core/Matrix";
import { NormalRenderData, RenderData, RenderDataPool, RenderDataType, SpineRenderData } from "./core/renderer/data/RenderData";
import Scene2D from "./core/renderer/base/Scene2D";
import Scene3D from "./core/renderer/base/Scene3D";
import { CameraModel, G_CameraModel } from "./core/renderer/camera/CameraModel";
import GameMainCamera from "./core/renderer/camera/GameMainCamera";
import FrameBuffer from "./core/renderer/gfx/FrameBuffer";
import { GLapi } from "./core/renderer/gfx/GLapi";
import { G_ShaderFactory } from "./core/renderer/shader/Shader";
import { MathUtils } from "./core/utils/MathUtils";
import { CameraData } from "./core/renderer/data/CameraData";

/**
* _attach
*/
function _attach(gl, location, attachment, face = 0) {
    // if (attachment instanceof Texture2D) {
    //     gl.framebufferTexture2D(
    //         gl.FRAMEBUFFER,
    //         location,
    //         gl.TEXTURE_2D,
    //         attachment._glID,
    //         0
    //     );
    // } 
    // else if (attachment instanceof TextureCube) {
    //     gl.framebufferTexture2D(
    //         gl.FRAMEBUFFER,
    //         location,
    //         gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
    //         attachment._glID,
    //         0
    //     );
    // } else {
    //     gl.framebufferRenderbuffer(
    //         gl.FRAMEBUFFER,
    //         location,
    //         gl.RENDERBUFFER,
    //         attachment._glID
    //     );
    // }
}

export default class Device {
    constructor() { };
    public gl: WebGL2RenderingContext;
    private _gl2d;
    private _width: number = 0;
    private _height: number = 0;
    public canvas: HTMLElement;
    private static _instance: Device;
    public static get Instance(): Device {
        if (!this._instance) {
            this._instance = new Device();
        }
        return this._instance;
    }
    public init(): void {

        var canvas: HTMLElement = window["canvas"];
        var gl = this.createGLContext(canvas);
        this.gl = gl;
        this.canvas = canvas;
        GLapi.bindGL(gl);
        canvas.onmousedown = this.onMouseDown.bind(this);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onmouseup = this.onMouseUp.bind(this);
        this._width = canvas.clientWidth;
        this._height = canvas.clientHeight;
        console.log("画布的尺寸----", this._width, this._height);




        this.initExt();
        this.initMatrix();


    }

    //初始化矩阵
    private initMatrix(): void {
        this._temp_model_view_matrix = glMatrix.mat4.identity(null);
    }
    public getWebglContext(): WebGLRenderingContext {
        return (this.canvas as any).getContext("webgl")
    }

    public get Width(): number {
        return this._width;
    }
    public get Height(): number {
        return this._height;
    }

    //获取webgl画笔的类型
    public getContextType(): string {
        if (this.gl instanceof WebGL2RenderingContext) {
            return "webgl2"
        }
        else if ((this.gl as any) instanceof WebGLRenderingContext) {
            return "webgl";
        }
    }
    //创建webgl画笔
    private createGLContext(canvas): WebGL2RenderingContext {
        var names = ["webgl2", "webgl", "experimental-webgl"];
        var context = null;
        for (var i = 0; i < names.length; i++) {
            try {
                console.log("-names---", names[i]);
                context = canvas.getContext(names[i]);
            } catch (e) { }
            if (context) {
                break;
            }
        }

        if (context) {
            //添加动态属性记录画布的大小
            context.viewportWidth = canvas.width;
            context.viewportHeight = canvas.height;
        } else {
            alert("Failed to create WebGL context!");
        }
        return context;
    }

    private _isCapture: boolean = false;
    private onMouseDown(ev): void {
        this._isCapture = true;

    }
    private onMouseMove(ev): void {

    }
    private onMouseUp(ev): void {
        this._isCapture = false;
    }

    /**
     * 将结果绘制到UI上
     */
    public drawToUI(time: number, scene2D: Scene2D, scene3D: Scene3D): void {
        this.onBeforeRender();
        this._commitRenderState([0.5, 0.5, 0.5, 1.0], scene2D.getFrameBuffer());
        scene3D.visit(time);
        scene2D.visit(time);
        this.triggerRender();
        this.onAfterRender();
    }
    //将结果绘制到窗口
    public draw2screen(time: number, scene2D: Scene2D, scene3D: Scene3D): void {
        this.onBeforeRender();
        this._commitRenderState([0.5, 0.5, 0.5, 1.0], null,{ x: 0, y: 0, w: 0.5, h: 1 });
        scene3D.visit(time);
        scene2D.visit(time);
        this.triggerRender();
        this.setViewPort({ x: 0.5, y: 0, w: 0.5, h: 1 });
        this.triggerRender(true);
        if (this._isCapture) {
            this._isCapture = false;
            this.capture();
        }
        this.onAfterRender();

    }
    //渲染前
    private onBeforeRender() {
        this._renderData = [];
    }
    //提交渲染状态
    private _commitRenderState(clearColor: Array<number>, frameBuffer: WebGLFramebuffer, viewPort: Object = { x: 0, y: 0, w: 1, h: 1 }): void {
        let gl = this.gl;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.SCISSOR_TEST);
        this.setViewPort(viewPort);
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    //渲染后
    private onAfterRender() {
        RenderDataPool.return(this._renderData);
    }
    private triggerRender(isScene: boolean = false) {
        if (isScene) {
            var cameraData = GameMainCamera.instance.getCamera(this._renderData[0]._cameraType).getCameraData();
            G_CameraModel.draw(cameraData.projectMat, cameraData.modelMat);
        }
        //提交数据给GPU 立即绘制
        for (var j = 0; j < this._renderData.length; j++) {
            this.draw(this._renderData[j], isScene);
        }
    }

    private _temp_model_view_matrix;//视口模型矩阵
    /**
     * 
     * @param rData 
     * @param projMatix 投影矩阵
     * @param viewMatrix 视口矩阵
     */
    private _drawBase(rData: RenderData, projMatix: Float32Array, viewMatrix: Float32Array): void {
        //激活shader
        rData._shader.active();
        //给shader中的变量赋值
        rData._shader.setUseLight(rData._lightColor, rData._lightDirection);
        if (rData._u_pvm_matrix_inverse) {
            rData._shader.setUseSkyBox(rData._u_pvm_matrix_inverse);
        }
        glMatrix.mat4.mul(this._temp_model_view_matrix, viewMatrix, rData._modelMatrix)
        rData._shader.setUseModelViewMatrix(this._temp_model_view_matrix);

        rData._shader.setUseProjectionMatrix(projMatix);
        rData._shader.setUseVertexAttribPointerForVertex(rData._vertGLID, rData._vertItemSize);
        rData._shader.setUseVertexAttribPointerForUV(rData._uvGLID, rData._uvItemSize);
        rData._shader.setUseVertexAttriPointerForNormal(rData._normalGLID, rData._normalItemSize);
        if (rData._textureGLIDArray.length > 0) {
            rData._shader.setUseTexture(rData._textureGLIDArray[0]);
        }
        var indexglID = rData._indexGLID;
        if (indexglID != -1) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexglID);
            this.gl.drawElements(rData._glPrimitiveType, rData._indexItemNums, this.gl.UNSIGNED_SHORT, 0);
        }
        else {
            this.gl.drawArrays(rData._glPrimitiveType, 0, rData._vertItemNums);
        }
        //解除缓冲区对于目标纹理的绑定
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        rData._shader.disableVertexAttribArray();
    }
    private _temp1Matrix: Float32Array = glMatrix.mat4.identity(null);
    private _temp2Matrix: Float32Array = glMatrix.mat4.identity(null);
    private _temp3Matrix: Float32Array = glMatrix.mat4.identity(null);
    private draw(rData: RenderData, isUseScene: boolean = false): void {
        var cameraData = GameMainCamera.instance.getCamera(rData._cameraType).getCameraData();
        glMatrix.mat4.identity(this._temp1Matrix);
        switch (rData._type) {
            case RenderDataType.Base:
                if (isUseScene) {
                    let projMatix = G_CameraModel.getSceneProjectMatrix();
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix());
                    this._drawBase(rData, projMatix, this._temp1Matrix);
                }
                else {
                    glMatrix.mat4.invert(this._temp1Matrix, cameraData.modelMat);
                    this._drawBase(rData, cameraData.projectMat, this._temp1Matrix);
                }; 
                break;
            case RenderDataType.Normal:
                if(isUseScene)
                this._drawNormal(rData as NormalRenderData,cameraData);
                break;
            case RenderDataType.Spine:
                if (isUseScene) {
                    let projMatix = G_CameraModel.getSceneProjectMatrix();
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix());
                    this._drawSpine(rData as SpineRenderData, projMatix, this._temp1Matrix);
                }
                else {
                    glMatrix.mat4.invert(this._temp1Matrix, cameraData.modelMat);
                    this._drawSpine(rData as SpineRenderData, cameraData.projectMat, this._temp1Matrix);
                };
                break

        }

    }
    private _curGLID = -1;
    private _drawSpine(sData: SpineRenderData, projMatix: Float32Array, viewMatrix: Float32Array): void {
        if (this._curGLID != sData._shaderData.spGlID) {
            this.gl.useProgram(sData._shaderData.spGlID);
            this._curGLID == sData._shaderData.spGlID;
        }
        G_ShaderFactory.setBuffersAndAttributes(sData._shaderData.attrSetters, sData._attrbufferInfo);
        for (let j = 0; j < sData._uniformInfors.length; j++) {
            G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, sData._uniformInfors[j]);
        }
        let vleft = glMatrix.mat4.multiply(null, viewMatrix, sData._extraViewLeftMatrix)
        let projData = {};
        projData[sData._projKey] = projMatix;
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, projData);
        let viewData = {};
        viewData[sData._viewKey] = vleft;
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, viewData);
        G_ShaderFactory.drawBufferInfo(sData._attrbufferInfo, sData._glPrimitiveType);
    }

    private _drawNormal(sData: NormalRenderData, cameraData:CameraData): void {
        this.gl.useProgram(sData._shaderData.spGlID);
        sData._node.updateUniformsData(cameraData);
        G_ShaderFactory.setBuffersAndAttributes(sData._shaderData.attrSetters, sData._attrbufferInfo);
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, sData._uniformInfors);
        G_ShaderFactory.drawBufferInfo(sData._attrbufferInfo, sData._glPrimitiveType);
    }
    private _renderData: Array<RenderData> = [];//绘制的数据
    public collectData(rData: RenderData): void {
        this._renderData.push(rData);
    }





    private _framebuffer: FrameBuffer;//帧缓存
    /**
   * @method setFrameBuffer
   * @param {FrameBuffer} fb - null means use the backbuffer
   */
    setFrameBuffer(fb: FrameBuffer) {
        if (this._framebuffer === fb) {
            return;
        }

        this._framebuffer = fb;
        const gl = this.gl;

        if (!fb) {
            console.log("绑定帧缓冲失败--------");
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return;
        }
        else {
            console.log("绑定帧缓冲成功");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb.getHandle());

        // let numColors = fb._colors.length;
        // for (let i = 0; i < numColors; ++i) {
        //     let colorBuffer = fb._colors[i];
        //     _attach(gl, gl.COLOR_ATTACHMENT0 + i, colorBuffer);

        //     // TODO: what about cubemap face??? should be the target parameter for colorBuffer
        // }
        // for (let i = numColors; i < this._caps.maxColorAttachments; ++i) {
        //     gl.framebufferTexture2D(
        //         gl.FRAMEBUFFER,
        //         gl.COLOR_ATTACHMENT0 + i,
        //         gl.TEXTURE_2D,
        //         null,
        //         0
        //     );
        // }

        // if (fb._depth) {
        //     _attach(gl, gl.DEPTH_ATTACHMENT, fb._depth);
        // }

        // if (fb._stencil) {
        //     _attach(gl, gl.STENCIL_ATTACHMENT, fb._stencil);
        // }

        // if (fb._depthStencil) {
        //     _attach(gl, gl.DEPTH_STENCIL_ATTACHMENT, fb._depthStencil);
        // }
    }

    /**
     * 
     * @param object 
     * {
     * x:
     * y:
     * w:
     * h:
     * }
     */
    public setViewPort(object: any): void {
        let x = object.x * this.gl.canvas.width;
        let y = object.y * this.gl.canvas.height;
        let width = object.w * this.gl.canvas.width;
        let height = object.h * this.gl.canvas.height;
        this.gl.viewport(x, y, width, height);
        this.gl.scissor(x, y, width, height);
    }


    /**
     * Resize a canvas to match the size its displayed.
     * @param {HTMLCanvasElement} canvas The canvas to resize.
     * @param {number} [multiplier] amount to multiply by.
     *    Pass in window.devicePixelRatio for native pixels.
     * @return {boolean} true if the canvas was resized.
     * @memberOf module:webgl-utils
     */
    resizeCanvasToDisplaySize(canvas, multiplier?) {
        multiplier = multiplier || 1;
        const width = canvas.clientWidth * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    //copy-------------------------------------------------------------------------------------------------
    private _caps = {
        maxVertexStreams: 4,
        maxVertexTextures: 0,
        maxFragUniforms: 0,  //片段着色器最大可以用的uniform变量
        maxTextureUnits: 0, //最大使用的纹理单元数
        maxVertexAttribs: 0,//shader中最大允许设置的顶点属性变量数目
        maxTextureSize: 0,//在显存中最大存取纹理的尺寸16384kb,也就是16m,[4096,4096]
        maxDrawBuffers: 0,
        maxColorAttachments: 0
    };
    private _extensions: Array<any> = [];
    private _stats: any;
    private initExt() {
        this._stats = {
            texture: 0,
            vb: 0,
            ib: 0,
            drawcalls: 0,
        };

        // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Using_Extensions
        this._initExtensions([
            'EXT_texture_filter_anisotropic',
            'EXT_shader_texture_lod',
            'OES_standard_derivatives',
            'OES_texture_float',
            'OES_texture_float_linear',
            'OES_texture_half_float',
            'OES_texture_half_float_linear',
            'OES_vertex_array_object',
            'WEBGL_compressed_texture_atc',
            'WEBGL_compressed_texture_etc',
            'WEBGL_compressed_texture_etc1',
            'WEBGL_compressed_texture_pvrtc',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_depth_texture',
            'WEBGL_draw_buffers',
        ]);
        this._initCaps();
        // this._initStates();

        this.handlePrecision();

        console.log("拓展-----", this.gl.getSupportedExtensions());
        /**
         * 'EXT_color_buffer_float', 
         * 'EXT_disjoint_timer_query_webgl2',
         * 'EXT_float_blend', 
         * 'EXT_texture_compression_bptc', 
         * 'EXT_texture_compression_rgtc', 
         * 'EXT_texture_filter_anisotropic', 
         * 'KHR_parallel_shader_compile', 
         * 'OES_texture_float_linear', 
         * 'WEBGL_compressed_texture_s3tc', 
         * 'WEBGL_compressed_texture_s3tc_srgb', 
         * 'WEBGL_debug_renderer_info', 
         * 'WEBGL_debug_shaders', 
         * 'WEBGL_lose_context', 
         * 'WEBGL_multi_draw', 
         * 'OVR_multiview2
         */
    }


    private handlePrecision(): void {
        var gl = this.gl;
        console.log("处理精度");
        var data1 = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT);
        var data2 = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT);
        var data3 = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
        var data4 = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT);
        var data5 = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT);
        var data6 = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT);
        console.log("vertex 精度值---", data1, data2, data3, data4, data5, data6);

        var data1 = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT);
        var data2 = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
        var data3 = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        var data4 = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT);
        var data5 = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT);
        var data6 = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT);
        console.log("fragment 精度值---", data1, data2, data3, data4, data5, data6);
    }

    /**
     * 初始化渲染状态
     */
    private _initStates() {
        const gl = this.gl;

        // gl.frontFace(gl.CCW);这一句代码是多余的，webgl默认的就是逆时针为正面
        gl.disable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendColor(1, 1, 1, 1);

        gl.colorMask(true, true, true, true);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.disable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.depthRange(0, 1);

        gl.disable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
        gl.stencilMask(0xFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);


        gl.clearDepth(1);
        gl.clearColor(0, 0, 0, 0);
        gl.clearStencil(0);

        gl.disable(gl.SCISSOR_TEST);
    }

    private _initExtensions(extensions) {
        const gl = this.gl;
        for (let i = 0; i < extensions.length; ++i) {
            let name = extensions[i];
            let vendorPrefixes = ["", "WEBKIT_", "MOZ_"];

            for (var j = 0; j < vendorPrefixes.length; j++) {
                try {
                    let ext = gl.getExtension(vendorPrefixes[j] + name);
                    if (ext) {
                        this._extensions[name] = ext;
                        break;
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    /**
* @method ext
* @param {string} name
*/
    ext(name) {
        return this._extensions[name];
    }

    _initCaps() {
        const gl = this.gl;
        const extDrawBuffers = this.ext('WEBGL_draw_buffers');

        this._caps.maxVertexStreams = 4;
        this._caps.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this._caps.maxFragUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        this._caps.maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this._caps.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        this._caps.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        this._caps.maxDrawBuffers = extDrawBuffers ? gl.getParameter(extDrawBuffers.MAX_DRAW_BUFFERS_WEBGL) : 1;
        this._caps.maxColorAttachments = extDrawBuffers ? gl.getParameter(extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;

        console.log("this._caps---", this._caps);

        localStorage.setItem("zm", "nihaoa");
    }

    /**
     * 截图
     */
    private capture(): void {
        const saveBlob = (function () {
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            return function saveData(blob, fileName) {
                const url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
            };
        }());
        var gl = this.gl;
        (gl.canvas as any).toBlob((blob) => {
            saveBlob(blob, `screencapture-${gl.canvas.width}x${gl.canvas.height}.png`);
        });

    }

    //剔除某一个面
    /**
     * 
     * @param back true 代表剔除背面 false 代表剔除前面
     * @param both 表示前后面都剔除
     */
    public cullFace(back: boolean = true, both?): void {
        var gl = this.gl;
        gl.enable(gl.CULL_FACE);//开启面剔除功能
        gl.frontFace(gl.CW);//逆时针绘制的代表正面 正常理解，看到的面是正面gl.FRONT，看不到的面是背面gl.BACK
        // gl.frontFace(gl.CCW);//顺时针绘制的代表正面  需要反过来理解，即我们看到的面是背面，看不到的面是正面
        if (both) {
            gl.cullFace(gl.FRONT_AND_BACK); //前后两个面都剔除
        }
        else if (back) {
            gl.cullFace(gl.BACK);//只剔除背面

        }
        else {
            gl.cullFace(gl.FRONT);//只剔除前面
        }
    }
    /**
     * 关闭面剔除功能
     */
    public closeCullFace(): void {
        var gl = this.gl;
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.disable(gl.CULL_FACE);
    }
}
