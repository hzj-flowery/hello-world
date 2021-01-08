
import { glMatrix } from "./Matrix";
import Scene2D from "./renderer/base/Scene2D";
import Scene3D from "./renderer/base/Scene3D";
import {G_CameraModel } from "./renderer/camera/CameraModel";
import GameMainCamera from "./renderer/camera/GameMainCamera";
import FrameBuffer from "./renderer/gfx/FrameBuffer";
import { CameraData } from "./renderer/data/CameraData";
import { NormalRenderData, RenderData, RenderDataPool, RenderDataType, SpineRenderData } from "./renderer/data/RenderData";
import State from "./renderer/gfx/State";
import { G_ShaderFactory } from "./renderer/shader/ShaderFactory";
import { glEnums } from "./renderer/gfx/GLapi";
import { Node } from "./renderer/base/Node";
import { SY } from "./renderer/base/Sprite";
import { G_DrawEngine } from "./renderer/base/DrawEngine";

/**
 渲染流程：
 阶段1--》CPU准备数据（顶点，法线，uv坐标，切线等）
 阶段2--》顶点着色器：主要完成顶点的空间变换，将顶点从模型空间变换到世界空间，再变换到视口空间，再变换到齐次裁切空间
 上面的三种变换就是大名鼎鼎的(PVM*position),在这三种变换以后，下面的操作就是GPU的内置操作了，如下：
 会进行齐次除法，完成真正的投影，然后会自动进行归一化，生成标准的NDC坐标，NDC的坐标范围是【-1,1】，而屏幕坐标的范围是【0,1】，最后会进行屏幕映射生成屏幕坐标
 阶段3--》图元装配：点，线，三角形目前支持这三种
 阶段4--》光栅化，生成片元，这里面也有裁切操作进行
 阶段5--》片元着色器
 阶段6--》逐片元操作

 */

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

//----------------------------------------------------------下面是状态管理-----------------------------
//深度缓冲区 也称Z缓冲区
/**
深度缓冲区其实就是一个二维数组，下标就是屏幕坐标，里面存放着的值就是z坐标，我们可以通过下面描述的方法来对这个数组进行操作
它的主要功能就是判断前后遮挡关系，选择片元是否渲染
gl.enable(gl.DEPTH_TEST);开启深度检测
gl.disable(gl.DEPTH_TEST);关闭深度检测
gl.depthFunc(param)函数的参数如下：
    gl.NEVER （总不通过）
    gl.LESS（如果新值小于缓冲区中的值则通过）
    gl.EQUAL（如果新值等于缓冲区中的值则通过）
    gl.LEQUAL（如果新值小于等于缓冲区中的值则通过）
    gl.GREATER（如果新值大于缓冲区中的值则通过）
    gl.NOTEQUAL（如果新值不等于缓冲区中的值则通过）
    gl.GEQUAL（如果新值大于等于缓冲区中的值则通过）
    gl.ALWAYS（总通过）
gl.depthMask(true);//允许往深度缓存写数据
gl.depthMask(false);//不允许往深度缓存写数据

gl.clearDepth(depth);指定深度缓冲区填充深度值，这个值一般是是最大值，因为屏幕坐标的范围是【0,1】，所以最大值一般为1
注意上面这个函数并不是去清理，需要结合gl.clear(gl.DEPTH_BUFFER_BIT)这个清理函数来使用

gl.depthRange(0,1);这个函数有两个参数near,far,near默认为0，far默认为1，near永远小于far
这个函数的设置会影响到屏幕的z坐标的计算，当我们进行屏幕映射的时候，会用下边的公式将NDC的z坐标转为屏幕坐标系下的z坐标
Zw = ((Far - Near)/2)*Zndc+(Far+Near)/2
最终写入到深度缓冲区的值也是这个屏幕坐标系下的z坐标，我们在片段着色器中可以gl_FragCoord.z拿到这个z坐标
  
下面这个函数很有意思，叫多边形偏移
出现这个功能是由于深度冲突才产生的，深度冲突指的是深度缓冲区的值和当前的顶点深度值，已经无法比较谁大谁小了
比如在屏幕上有两个三角形他们在某个像素点的z值几乎是一样的，也就是在小数点n位才可以区分出来，而这个n位大于深度缓冲区的精度
gl.disable(gl.POLYGON_OFFSET_FILL);//关闭多边形偏移
gl.enable(gl.POLYGON_OFFSET_FILL); //开启多边形偏移
多边形偏移使用举例：
// 开启多边形偏移
gl.enable(gl.POLYGON_OFFSET_FILL);
// 绘制的时候分两次绘制产生冲突
gl.drawArrays(gl.TRIANGLES, 0, n / 2);   // 绿色三角形
gl.polygonOffset(1.0, 1.0);          // 设置偏移量
gl.drawArrays(gl.TRIANGLES, n / 2, n / 2); // 黄色三角形

 */
function _commitDepthState(gl:WebGLRenderingContext,cur:State,next:State):void{
    /**
     * 下面函数中，只对面消除，深度写入，深度比较函数这个三个进行操作
     */
    if(cur.depthTest!=next.depthTest)
    {
        next.depthTest?gl.enable(gl.DEPTH_TEST):gl.disable(gl.DEPTH_TEST);
    }
    if(cur.depthWrite!=next.depthWrite)
    {
        next.depthWrite?gl.depthMask(true):gl.depthMask(false);
    }
    if(cur.depthFunc!=next.depthFunc)
    {
        gl.depthFunc(next.depthFunc);
    }
}
/**
 * 
gl.enable(gl.CULL_FACE);开启面剔除
gl.disable(gl.CULL_FACE);关闭面剔除
gl.frontFace()这个函数是设置那个面是正面
gl.CW：表示逆时针绘制的代表正面gl.FRONT，否则是背面gl.BACK，这个是默认设置
gl.CCW：表示顺时针绘制的代表正面gl.FRONT，否则是背面gl.BACK
gl.cullFace()设置那一面被剔除有三个函数，如下
gl.BACK：背面
gl.FRONT：前面
gl.FRONT_AND_BACK：前后两面
 */
function _commitCullState(gl: WebGLRenderingContext, cur: State, next: State): void {
    if (cur.cullMode === next.cullMode) {
        return;
      }
      if (next.cullMode === glEnums.CULL_NONE) {
        gl.disable(gl.CULL_FACE);
        return;
      }
      gl.enable(gl.CULL_FACE);
      gl.cullFace(next.cullMode);
}
/**
 * 裁切状态
 * 剪裁测试用于限制绘制区域。区域内的像素，将被绘制修改。区域外的像素，将不会被修改。
 * 例子 比如我要在画布的某个区域做一些其他的事情，让其为纯色等
 */
function _commitScissorState(gl:WebGLRenderingContext,cur:State,next:State):void{
   
    // gl.enable(gl.SCISSOR_TEST);
    // gl.scissor(0,0,50,50);
    // gl.clearColor(1.0, 0.0, 0.0,1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.disable(gl.SCISSOR_TEST);
}
/**
 * 混合状态
 * 最常实现的功能就是半透明叠加
 * 有一个问题 必须是透明的颜色才具备混合，也就是alpha的值必须小于1，否则就是覆盖了
 * 所以我们说的混合都是针对alpha小于1的顶点颜色
 * 
 * gl.enable(gl.BLEND);开启混合
 * gl.enable(gl.BLEND);//关闭混合
公式：COLORfinal = COLORsource*FACTORsource op COLORdest * FACTORdest
COLORfinal：混合之后的颜色。
COLORsource：即将写入缓冲区的颜色。
FACTORsource：写入颜色的比例因子，会与颜色值进行乘法计算。
op：数学计算方法，将操作符左右两边的结果进行某种数学运算。最常见的是加法。
COLORdest：缓冲区已经存在的颜色
FACTORdest：已存在颜色的比例因子

gl.blendFunc(sFactor,dFactor);设置混合方式，可以用的参数如下：
gl.ONE;
gl.ZERO;
gl.SRC_COLOR;
gl.DST_COLOR
gl.SRC_ALPHA;
gl.DST_ALPHA;
gl.CONSTANT_ALPHA;
gl.CONSTANT_COLOR;
gl.ONE_MINUS_SRC_ALPHA;
gl.ONE_MINUS_SRC_COLOR;
gl.ONE_MINUS_DST_ALPHA;
gl.ONE_MINUS_DST_COLOR;
gl.ONE_MINUS_CONSTANT_ALPHA;
gl.ONE_MINUS_CONSTANT_COLOR;
最常见的混合方式gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);但这样的混合方式会改变alpha
如果不希望改变混合后的alpha,可以使用下面这个函数
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);

如果我们使用了上面提到的constant的混合因子，可以使用下面这个函数来指定混合颜色
gl.blendColor(GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha)

gl.blendEquation(mode):该函数可以设置op的操作函数如下：
gl.FUNC_ADD：相加处理
gl.FUNC_SUBTRACT：相减处理
gl.FUNC_REVERSE_SUBSTRACT：反向相减处理，即 dest 减去 source
下面这个函数可以对rgb和alpha
gl.blendEquationSeparate(GLenum modeRGB, GLenum modeAlpha)
 */
function _commitBlendState(gl:WebGLRenderingContext,cur:State,next:State):void{
  
}

export default class Device {
    constructor() { };
    public gl: WebGL2RenderingContext;
    private _gl2d;
    private _width: number = 0;
    private _height: number = 0;
    public canvas: HTMLCanvasElement;

    private _curFrameS:State;//这个非常重要
    private _nextFrameS:State;//这个非常重要

    private static _instance: Device;
    public static get Instance(): Device {
        if (!this._instance) {
            this._instance = new Device();
        }
        return this._instance;
    }
    public init(): void {

        var canvas: HTMLCanvasElement = window["canvas"];
        var gl = this.createGLContext(canvas);
        this.gl = gl;
        this.canvas = canvas;
        this._nextFrameS = new State(gl);
        this._curFrameS = new State(gl);
        canvas.onmousedown = this.onMouseDown.bind(this);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onmouseup = this.onMouseUp.bind(this);
        this._width = canvas.clientWidth;
        this._height = canvas.clientHeight;
        console.log("画布的尺寸----", this._width, this._height);
        this.initExt();

        //添加事件监听
        canvas.addEventListener("webglcontextlost", this.contextLost.bind(this));
        canvas.addEventListener("webglcontextrestored", this.resume.bind(this));

        this.openStats();
    }

    //
    private stats: any;
    private openStats(): void {
        this.stats = new window["Stats"]();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        window["document"].body.appendChild(this.stats.dom);
    }
    /**
     * 启动子线程
     */
    private _worker: Worker;
    private startSonWorker(): void {
        let canvasBitmap: any = window["canvas2d"];
        let ctxBitmap = canvasBitmap.getContext('2d');
        if (!this._worker) {
            this._worker = new Worker('./bitmap_worker.js');
            this._worker.postMessage({ msg: 'init' });
            this._worker.onmessage = function (e) {
                console.log("收到来自子线程的数据------", e.data.imageBitmap);
                ctxBitmap.drawImage(e.data.imageBitmap, 0, 0);
            }
        }
        ctxBitmap.clearRect(0, 0, canvasBitmap.width, canvasBitmap.height);
        this._worker.postMessage({ msg: 'draw' });
    }
    private getCanvas2D(): CanvasRenderingContext2D {
        let result = window["canvas2d"].getContext("2d");
        if (!result) {
            console.log("没有canvas 2d画笔--------------");
        }
        return result;
    }
    private contextLost(): void {
        console.log("丢失上下文----");
    }
    private resume(): void {
        console.log("回来-----");
    }
    public getWebglContext(): WebGLRenderingContext {
        return (this.canvas as any).getContext("webgl")
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
    private createGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {

        let options = {
            stencil: true, //开启模板功能
            // alpha:true, //那么这个颜色还会进一步和 canvas 所覆盖的页面颜色进行进一步叠加混色
        }
        var names = ["webgl2", "webgl", "experimental-webgl"];
        var context = null;
        for (var i = 0; i < names.length; i++) {
            try {
                console.log("-names---", names[i]);
                context = canvas.getContext(names[i], options);
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
    public startDraw(time: number,stage:Node): void {
        this.onBeforeRender();
        this.visitRenderTree(time,stage);
        this.drawToUI();
        this.draw2screen();
        this.onAfterRender();
    }
    /**
     * 遍历渲染树
     * @param time 
     * @param scene2D 
     * @param scene3D 
     */
    private visitRenderTree(time: number, stage:Node): void {
        stage.visit(time);
    }
    /**
     * 将结果绘制到UI上
     */
    private drawToUI(): void {
        let frameBuffer: WebGLFramebuffer = GameMainCamera.instance.get2DCamera().getFramebuffer();
        this._commitRenderState(frameBuffer);
        this.triggerRender(false,false);
    }
    //将结果绘制到窗口
    private draw2screen(): void {
        let isShowCamera: boolean = true;
        if (isShowCamera) {
            this._commitRenderState(null, { x: 0, y: 0, w: 0.5, h: 1 });
            this.triggerRender(false,true);
            this.setViewPort({ x: 0.5, y: 0, w: 0.5, h: 1 });
            this.triggerRender(true,true);
        }
        else {
            this._commitRenderState(null);
            this.triggerRender(false,true);
        }
        if (this._isCapture) {
            this._isCapture = false;
            this.capture();
        }
    }
    //渲染前
    private onBeforeRender() {
        this.stats.begin();
        this._renderData = [];
    }
   
    //提交渲染状态
    private _commitRenderState(frameBuffer: WebGLFramebuffer, viewPort: any = { x: 0, y: 0, w: 1, h: 1 }): void {
        let gl = this.gl;

        this._nextFrameS.depthTest = true; //开启深度测试
        this._nextFrameS.depthFunc = gl.LESS;
        this._nextFrameS.depthWrite = true;//可以写入

        this._nextFrameS.cullMode = glEnums.CULL_BACK;

        this._nextFrameS.ScissorTest = true;//裁切测试
        //设置viewport
        let x = viewPort.x * this.width;
        let y = viewPort.y * this.height;
        let width = viewPort.w * this.width;
        let height = viewPort.h * this.height;
        this._nextFrameS.setViewPort(x,y,width,height);

        _commitDepthState(gl,this._curFrameS,this._nextFrameS);
        _commitCullState(gl,this._curFrameS,this._nextFrameS);
        _commitScissorState(gl,this._curFrameS,this._nextFrameS);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        this.setViewPort(viewPort);
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //更新状态
        this._curFrameS.set(this._nextFrameS);
    }
    //渲染后
    private onAfterRender() {
        this.stats.end();
        RenderDataPool.return(this._renderData);
    }
    private triggerRender(isScene: boolean = false,isRenderToScreen:boolean) {
        if (isScene) {
            var cameraData = GameMainCamera.instance.getCamera(this._renderData[0]._cameraType).getCameraData();
            G_CameraModel.draw(cameraData.projectMat, cameraData.modelMat);
        }
        //提交数据给GPU 立即绘制
        for (var j = 0; j < this._renderData.length; j++) {
            if(this._renderData[j]._isOffline&&!isRenderToScreen)
            {
                //对于离屏渲染的数据 如果当前是离屏渲染的话 则不可以渲染它 否则会报错
                //你想啊你把一堆显示数据渲染到一张纹理中，这张纹理本身就在这一堆渲染数据中 自然是会冲突的
                //[.Offscreen-For-WebGL-07E77500]GL ERROR :GL_INVALID_OPERATION : glDrawElements: Source and destination textures of the draw are the same
                continue;
            }
            this.draw(this._renderData[j], isScene);
        }
    }
    /**
     * 
     * @param rData 
     * @param projMatix 投影矩阵
     * @param viewMatrix 视口矩阵
     */
    private _drawBase(rData: RenderData, projMatix: Float32Array, viewMatrix: Float32Array): void {
        G_DrawEngine.run(rData,viewMatrix,projMatix);
    }
    private _temp1Matrix: Float32Array = glMatrix.mat4.identity(null);
    /**
     * 此函数每调用一次就有可能产生一次drawcall
     * @param rData 
     * @param isUseScene 
     */
    private draw(rData: RenderData, isUseScene: boolean = false): void {
        var cameraData = GameMainCamera.instance.getCamera(rData._cameraType).getCameraData();
        glMatrix.mat4.identity(this._temp1Matrix);

         //补一下光的数据
        rData._lightColor = cameraData.lightData.color;
        rData._lightDirection = cameraData.lightData.direction;
        rData._cameraPosition = cameraData.position;

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
                if (isUseScene) {
                    let projMatix = G_CameraModel.getSceneProjectMatrix();
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix());
                    cameraData.projectMat = projMatix;
                    cameraData.modelMat = this._temp1Matrix;
                    this._drawNormal(rData as NormalRenderData, cameraData);
                }
                else {
                    this._drawNormal(rData as NormalRenderData, cameraData);
                }
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
        G_ShaderFactory.setBuffersAndAttributes(sData._shaderData.attrSetters, sData._attrbufferData);
        for (let j = 0; j < sData._uniformData.length; j++) {
            G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, sData._uniformData[j]);
        }
        let vleft = glMatrix.mat4.multiply(null, viewMatrix, sData._extraViewLeftMatrix)
        let projData = {};
        projData[sData._projKey] = projMatix;
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, projData);
        let viewData = {};
        viewData[sData._viewKey] = vleft;
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, viewData);
        G_ShaderFactory.drawBufferInfo(sData._attrbufferData, sData._glPrimitiveType);
    }

    private _drawNormal(sData: NormalRenderData, cameraData: CameraData): void {
        this.gl.useProgram(sData._shaderData.spGlID);
        (sData._node as SY.Sprite).updateUniformsData(cameraData);
        G_ShaderFactory.setBuffersAndAttributes(sData._shaderData.attrSetters, sData._attrbufferData);
        for (let j in sData._uniformData) {
            G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, sData._uniformData[j]);
        }
        G_ShaderFactory.drawBufferInfo(sData._attrbufferData, sData._glPrimitiveType);
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
     * 设置视口
     * @param object 
     * {
     * x:【0,1】
     * y:【0,1】
     * w:【0,1】
     * h:【0,1】
     * }
     */
    public setViewPort(object: any): void {
        let x = object.x * this.width;
        let y = object.y * this.height;
        let width = object.w * this.width;
        let height = object.h * this.height;
        if(this._curFrameS.isSameViewPort(x,y,width,height)==false)
        {
            this.gl.viewport(x, y, width, height);
            this.gl.scissor(x, y, width, height);
        }
        
    }
    public get width(){
        return this._width;
    }
    public get height(){
        return this._height;
    }
    public set width(width){
        this.width = width;
    }
    public set height(height){
        this._height = height;
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

        gl.colorMask(true, true, true, true);//允许往颜色缓冲写数据

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        gl.disable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);//允许往深度缓存写数据
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
     * 显示当前帧缓存中的图像数据
     * @param width 
     * @param height 
     */
    public showCurFramerBufferOnCanvas(width?: number, height?: number): void {
        let gl = this.gl;
        height = height || 512;
        width = width || 512;
        var pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        let ctx = Device.Instance.getCanvas2D();
        ctx.putImageData(imageData, 0, 0);
        //截图保存下来
        // this.capture(window["canvas2d"]);
    }

    /**
     * 截图
     */
    private capture(canvas?: HTMLCanvasElement): void {
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
        if (!canvas) {
            canvas = this.gl.canvas as HTMLCanvasElement;
        }
        canvas.toBlob((blob) => {
            saveBlob(blob, `screencapture-${gl.canvas.width}x${gl.canvas.height}.png`);
        });
    }
    //-----------------------------------------------------状态处理-------------------------------------------------------------
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
    //写入模板值
    public writeStencil(ref: number = 1, mask: number = 1,isCloseColorWrite:boolean = true): void {
        /**
         * 可以把模板缓存想象成一个二维数组stencil[width][height]
         * 清空缓存，就是将这个数组的每一个元素设为0
         * 开启模板测试，就是当下面进行绘制的时候，每一个片元进行逐片元的操作时，会有模板测试
         * 对于一个片元而言，它本身会携带位置信息，通过位置我们就能在模板缓冲中对应的模板值
         * 设置模板测试参数ref，这个其实就是一个全局变量，GPU会拿这个值和模板值进行比较
         * gl.ALWAYS：这个是比较函数，它的意思是不管最后比较结果如何，都通过模板测试
         * 设置模板操作，其实就是说如果模板测试通过了，将采取什么操作
         * gl.REPLACE：表示拿全局测试参数ref，替换掉模板缓冲的值
         * 综上：其实这个函数的作用就是将接下来绘制的所有片元，以他们的位置为索引，替换掉模板缓冲的值
         */
        let gl = this.gl;
        // 清除模板缓存
        gl.clear(gl.STENCIL_BUFFER_BIT);
        // 开启模板测试
        gl.enable(gl.STENCIL_TEST);
        // 设置模板测试参数
        gl.stencilFunc(gl.ALWAYS, ref, mask);
        // 设置模板值操作
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        
        if(isCloseColorWrite)
        {
            //关闭向颜色附件中写入颜色值
            gl.colorMask(false, false, false, false);
        }
    }
    //比较模板值
    public compareStencil(ref: number = 1, mask: number = 1): void {
        /**
         * 在我们调用了 writeStencil 这个函数以后，然后进行了绘制，那么模板缓冲中已经有了我们设置的值
         * 接着我们调用了这个函数
         * 设置模板测试参数ref
         * gl.EQUAL:意思是在进行模板测试的时候，只有模板值和我们的模板测试参数一样，才可以通过，否则不通过测试，即丢弃
         * 设置模板操作，注意到这里写的都是gl.keep,它的意思就是无论测试结果如何，都保持模板缓冲现有的值
         * 
         * 综上：这个函数的功能就是说，在接下来的绘制中，必须模板缓冲的值必须和我们现在设置的模板参数ref一样，才可以进行绘制
         */
        let gl = this.gl;
        //设置模板测试参数
        gl.stencilFunc(gl.EQUAL, ref, mask);
        //设置模板测试后的操作
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        // ----- 模板方法 end -----
        // 关闭深度检测
        gl.disable(gl.DEPTH_TEST);

        gl.colorMask(true, true,true,true);
    }
    //关闭模板测试
    public closeStencil(): void {
        let gl = this.gl;
        // 开启深度检测
        gl.enable(gl.DEPTH_TEST);
        // 关闭模板测试
        gl.disable(gl.STENCIL_TEST);
    }
}
