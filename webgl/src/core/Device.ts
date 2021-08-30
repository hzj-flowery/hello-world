
import { glMatrix } from "./math/Matrix";
import Scene2D from "./renderer/base/Scene2D";
import Scene3D from "./renderer/base/Scene3D";
import { G_CameraModel } from "./renderer/camera/CameraModel";
import { CameraRenderData, GameMainCamera } from "./renderer/camera/GameMainCamera";
import FrameBuffer from "./renderer/gfx/FrameBuffer";
import { CameraData } from "./renderer/data/CameraData";
import { syRender } from "./renderer/data/RenderData";
import State from "./renderer/gfx/State";
import { G_ShaderFactory } from "./renderer/shader/ShaderFactory"; 
import { glEnums } from "./renderer/gfx/GLapi";
import { Node } from "./renderer/base/Node";
import { SY } from "./renderer/base/Sprite";
import { G_DrawEngine } from "./renderer/base/DrawEngine";
import { G_LightCenter } from "./renderer/light/LightCenter";
import enums from "./renderer/camera/enums";
import { G_UISetting } from "./ui/UiSetting";
import { SYMacro } from "./platform/SYMacro";
import { G_LightModel } from "./renderer/light/LightModel";
import { G_ShaderCenter } from "./renderer/shader/ShaderCenter";
import { G_InputControl } from "./InputControl";
import utils from "./platform/utils";
import { Util } from "../utils/Util";

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
    //         attachment.glID,
    //         0
    //     );
    // } 
    // else if (attachment instanceof TextureCube) {
    //     gl.framebufferTexture2D(
    //         gl.FRAMEBUFFER,
    //         location,
    //         gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
    //         attachment.glID,
    //         0
    //     );
    // } else {
    //     gl.framebufferRenderbuffer(
    //         gl.FRAMEBUFFER,
    //         location,
    //         gl.RENDERBUFFER,
    //         attachment.glID
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
function _commitDepthState(gl: WebGLRenderingContext, cur: State, next: State): void {
    /**
     * 下面函数中，只对面消除，深度写入，深度比较函数这个三个进行操作
     */
    if (cur.depthTest != next.depthTest) {
        //是否开启深度测试
        next.depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
    }
    if (cur.depthWrite != next.depthWrite) {
        //深度值是否写入深度附件中
        next.depthWrite ? gl.depthMask(true) : gl.depthMask(false);
    }
    if (cur.depthFunc != next.depthFunc) {
        //比较函数
        gl.depthFunc(next.depthFunc);
    }

}
/**
 * 默认情况下 剔除功能是关闭的
gl.enable(gl.CULL_FACE);开启面剔除
gl.disable(gl.CULL_FACE);关闭面剔除
gl.frontFace()这个函数是设置那个面是正面
gl.CW：表示顺时针绘制的代表正面gl.FRONT，否则是背面gl.BACK，这个是默认设置
gl.CCW：表示逆时针绘制的代表正面gl.FRONT，否则是背面gl.BACK
gl.cullFace()设置那一面被剔除有三个函数，如下
gl.BACK：背面
gl.FRONT：前面
gl.FRONT_AND_BACK：前后两面

CULL_NONE: 0,      
CULL_FRONT: 1028,
CULL_BACK: 1029,
CULL_FRONT_AND_BACK: 1032,

 */
function _commitCullState(gl: WebGLRenderingContext, cur: State, next: State): void {
    if (cur.cullMode != next.cullMode) {
        if(next.cullMode==glEnums.CULL_NONE)
        {   
            //关闭剔除
            gl.disable(gl.CULL_FACE);
        }
        else
        { 
            gl.frontFace(gl.CCW)
            gl.enable(gl.CULL_FACE);
            gl.cullFace(next.cullMode);
        }
    }
} 
/**
 * 裁切状态
 * 剪裁测试用于限制绘制区域。区域内的像素，将被绘制修改。区域外的像素，将不会被修改。
 * 例子 比如我要在画布的某个区域做一些其他的事情，让其为纯色等
 * 这个功能用的比较少
 */
function _commitScissorState(gl: WebGLRenderingContext, cur: State, next: State): void {

    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, 0, 200, 50);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
}
/**
 * Blending就是控制透明的。处于光栅化的最后阶段
 * 最终颜色 = （Shader计算出的点颜色值 * 源系数）op（点累积颜色 * 目标系数）
 * Shader计算出的点颜色值：这个是当前材质上点的颜色
 * 源系数:这个是我们可以控制的（SrcFactor）
 * 点累积颜色：这个是当前位置的点累计计算的颜色，在屏幕上每一个像素点，都有可能产生很多个颜色，而最终的颜色是通过帧缓冲中同一个位置一层层颜色累计计算得出
 * 目标系数：这个是我们可以控制的（DstFactor）

 *  blend: false, //是否开启混合  -->enable(gl.BLEND) or gl.disable(gl.CULL_FACE);
    blendSep: false, //是否拆开混合
    blendColor: 0xffffffff,
    blendEq: syGL.BlendFunc.ADD, 
    blendAlphaEq: syGL.BlendFunc.ADD,
    blendSrc: syGL.Blend.ONE,
    blendDst: syGL.Blend.ZERO,
    blendSrcAlpha: syGL.Blend.ONE,
    blendDstAlpha: syGL.Blend.ZERO,
blendSep：关于这个需要特别说明
关于混合函数目前只有两种，，如下：
第一种：blendFunc，这种混合函数只有两个参数，无法指定混合后的alpha
blendEq：也只有三种运算 要么相加 要么相减 要么反过来减
比如：ttColor = sColor*blendSrc blendEq  tColor*blendDst
那么：ttAlpha = (sAlpha blendEq tAlpha)/2,这个值将被写入到alpha的目标缓冲中

如果此时我们不希望混合后的alpha改变，那么该如何操作呢，就要用到下面第二种混合函数了
第二种：blendFuncSeparate


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
function _commitBlendState(gl: WebGLRenderingContext, cur: State, next: State): void {
     
    
    if (cur.blend != next.blend) {
        //控制开启或者关闭混合
        next.blend ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
    }
 
    if(cur.blendColor!=next.blendColor)
    {
        var setColor = Util.hexToRgb(next.blendColor)
        gl.blendColor(setColor.r,setColor.g,setColor.b,setColor.a)
    }
    if (next.blend) {
        //混合必须开启 下面的设置才有意义
        if (next.blendSep) {
            //使用高级拆分混合函数blendFuncSeparate
            if (cur.blendSrc != next.blendSrc ||
                cur.blendDst != next.blendDst ||
                cur.blendSrcAlpha != next.blendSrcAlpha ||
                cur.blendDstAlpha != next.blendDstAlpha) {
                /**
                 * 
                 */
                gl.blendFuncSeparate(next.blendSrc, next.blendDst, next.blendSrcAlpha, next.blendDstAlpha);
            }
            if (cur.blendAlphaEq != next.blendAlphaEq || cur.blendEq != next.blendEq) {
                //设置混合结果的操作函数
                //混合结果只有两种
                //1是源颜色和目标颜色各自计算后如何操作来写入到目标颜色缓冲中
                //2是源alpha和目标alpha两者如何混合来写入到目标alpha缓冲中
                gl.blendEquationSeparate(next.blendEq, next.blendAlphaEq);
            }
        }
        else {
            // 使用普通的混合函数blendFunc
            if (cur.blendSrc != next.blendSrc ||
                cur.blendDst != next.blendDst) {
                gl.blendFunc(next.blendSrc, next.blendDst)
            }

            if(cur.blendEq!=next.blendEq)
            {
                //源颜色rgb计算结果该如何与目标颜色rgb计算结果进行计算
                /**
                    *   gl.FUNC_ADD：相加处理
                        gl.FUNC_SUBTRACT：相减处理
                        gl.FUNC_REVERSE_SUBSTRACT：反向相减处理，即 dest 减去 source
                    */
                gl.blendEquation(next.blendEq)
            }

        }
    }
}

export default class Device {
    constructor() { };
    public gl: WebGL2RenderingContext;
    private _gl2d;
    private _width: number = 0;
    private _height: number = 0;
    public canvas: HTMLCanvasElement;

    private _curFrameS: State;//这个非常重要
    private _nextFrameS: State;//这个非常重要

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
        this._nextFrameS = new State();
        this._curFrameS = new State();

        // 

        this._width = canvas.clientWidth;
        this._height = canvas.clientHeight;
        console.log("画布的尺寸----", this._width, this._height);
        this.initExt();


        G_InputControl.handleEvent(canvas);
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

    private handleAntialias(canvas: HTMLCanvasElement, context): void {
        // canvas.width = canvas.width * window.devicePixelRatio;
        // canvas.height = canvas.height * window.devicePixelRatio;
        // context.scale(window.devicePixelRatio, window.devicePixelRatio);
        let p = Math.sqrt(1080 * 1080 + 2340 * 2340) / 6.5;

        console.log("我手机的物理像素的密度ppi----", window, p);
    }
    //创建webgl画笔
    private createGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
        /**
         *   alpha?: boolean;
            antialias?: boolean;
            depth?: boolean;
            desynchronized?: boolean;
            failIfMajorPerformanceCaveat?: boolean;
            powerPreference?: WebGLPowerPreference;
            premultipliedAlpha?: boolean;
            preserveDrawingBuffer?: boolean; //这让 WebGL 在将画布和页面其它内容合成后不清除画布
            stencil?: boolean;
         */
        let options = {
            stencil: true, //开启模板功能
            antialias: SYMacro.macro.ENABLE_WEBGL_ANTIALIAS,//关闭抗锯齿
            depth: true,
            alpha: SYMacro.macro.ENABLE_TRANSPARENT_CANVAS, //那么这个颜色还会进一步和 canvas 所覆盖的页面颜色进行进一步叠加混色
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

        this.handleAntialias(canvas, context);
        return context;
    }

   
    

    private getTreeData(drawOrder:syRender.DrawingOrder,tag:syRender.ShaderType):syRender.BaseData[]{
        //深度渲染pass
        var treeData = this._mapRenderTreeData.get(drawOrder);
        var retData = []
        for(let j in treeData)
        {
           if(treeData[j].pass&&treeData[j].pass.shaderType==tag)
           {
              retData.push(treeData[j]);
           }
           else if(!treeData[j].pass&&tag==syRender.ShaderType.Custom)
           {
              retData.push(treeData[j]);
           }
        }
        return retData;
    }
    private sortTreeData():void{
        var data = this._mapRenderTreeData.get(syRender.DrawingOrder.Normal);
        if(data&&data.length>0)
        data.sort((a,b)=>{
           if(a.pass!=null && b.pass!=null)
           return a.pass.shaderType - b.pass.shaderType;
           return -1;
        })
    }
    /**
     * 获取常规渲染的data
     * @param drawOrder 
     * @param tagArr 
     * @returns 
     */
    private getNormalTreeData():syRender.BaseData[]{
        var drawOrder = syRender.DrawingOrder.Normal;
        var tagArr:Array<syRender.ShaderType> = [syRender.ShaderType.Custom,
            syRender.ShaderType.Spot,
            syRender.ShaderType.Point,
            syRender.ShaderType.Line,
            syRender.ShaderType.LineFrustum,
            syRender.ShaderType.Parallel,
            syRender.ShaderType.Sprite,
            syRender.ShaderType.Fog,
            syRender.ShaderType.SkyBox,
            syRender.ShaderType.Mirror,
            syRender.ShaderType.Shadow,
            syRender.ShaderType.Instantiate,
            syRender.ShaderType.Purity,
            syRender.ShaderType.OutLine,
            syRender.ShaderType.Test]
        //深度渲染pass
        var treeData = this._mapRenderTreeData.get(drawOrder);
        var retData = []
        for(let j in treeData)
        {
           if(treeData[j].pass&&tagArr.indexOf(treeData[j].pass.shaderType)>=0)
           {
              retData.push(treeData[j]);
           }
           else if(!treeData[j].pass&&tagArr.indexOf(syRender.ShaderType.Custom)>=0)
           {
              retData.push(treeData[j]);
           }
        }
        return retData;
    }
    /**
     * 
     * @param time 
     * @param stage 
     * @param debug 
     * @param drawtoUI 
     */
    public startDraw(time: number, stage: Node): void {
        this.onBeforeRender();
        this.visitRenderTree(time, stage);
        this.sortTreeData();
        var cameraData = GameMainCamera.instance.getRenderData();
        cameraData.sort(function(a,b){
            if (a.drawingOrder!=b.drawingOrder)
            return b.drawingOrder - a.drawingOrder;
            else
            return b.rtuuid-a.rtuuid;
        })
        for (let k = 0; k < cameraData.length; k++) {
            if(cameraData[k].drawingOrder==syRender.DrawingOrder.Normal)
            {
                if(cameraData[k].rtuuid == syRender.RenderTextureUUid.shadowMap)
                {
                    //深度渲染pass
                    this.triggerRender(this.getTreeData(syRender.DrawingOrder.Normal,syRender.ShaderType.ShadowMap),cameraData[k]);
                }
                else
                {
                    this.triggerRender(this.getNormalTreeData(),cameraData[k]);
                }
            }
            else if(cameraData[k].drawingOrder==syRender.DrawingOrder.Middle)
            {
                //优先绘制
                var tree1 = this.getTreeData(syRender.DrawingOrder.Middle,syRender.ShaderType.Custom)
                var tree2 = this.getTreeData(syRender.DrawingOrder.Middle,syRender.ShaderType.Rtt)
                this.triggerRender(tree1.concat(tree2),cameraData[k]);
            }
        }
        if (G_InputControl.openCapture&&G_InputControl.isCapture) {
            G_InputControl.isCapture = false;
            this.capture();
            // this.showCurFramerBufferOnCanvas();
            // this.autoCapture()
        }
        this.onAfterRender();
    }
    /**
     * 遍历渲染树
     * @param time 
     * @param scene2D 
     * @param scene3D 
     */
    private visitRenderTree(time: number, stage: Node): void {
        stage.visit(time);
    }
    //渲染前
    private onBeforeRender() {
        this.stats.begin();
        this._mapRenderTreeData.clear();
    }

    /**
     * 提交渲染状态
     */
    private _commitRenderState(state: State): void {
        let gl = this.gl;

        this._nextFrameS.depthTest = state.depthTest; //开启深度测试
        this._nextFrameS.depthFunc = state.depthFunc;//距离视野近的则留下
        this._nextFrameS.depthWrite = state.depthWrite;//可以写入

        this._nextFrameS.cullMode = state.cullMode;
        this._nextFrameS.ScissorTest = true;//裁切测试

        this._nextFrameS.blend = state.blend;
        this._nextFrameS.blendAlphaEq = state.blendAlphaEq;
        this._nextFrameS.blendColor = state.blendColor;
        this._nextFrameS.blendDst = state.blendDst;
        this._nextFrameS.blendDstAlpha = state.blendDstAlpha;
        this._nextFrameS.blendEq = state.blendEq;
        this._nextFrameS.blendSep = state.blendSep;
        this._nextFrameS.blendSrc = state.blendSrc;
        this._nextFrameS.blendSrcAlpha = state.blendSrcAlpha;

        _commitDepthState(gl, this._curFrameS, this._nextFrameS);
        _commitCullState(gl, this._curFrameS, this._nextFrameS);
        _commitScissorState(gl, this._curFrameS, this._nextFrameS);
        _commitBlendState(gl, this._curFrameS, this._nextFrameS);
        //更新状态
        this._curFrameS.set(this._nextFrameS);
    }
    //渲染后
    private onAfterRender() {
        this.stats.end();
        this._mapRenderTreeData.forEach(function(value,key){
            syRender.DataPool.return(value);
        })
    }

    /**
     * 触发渲染的时间 
     */
    private _triggerRenderTime: number = 0;
    public get triggerRenderTime() {
        return this._triggerRenderTime;
    }
    /**
     * 触发常规渲染
     * @param treeData 
     * @param crData 
     */
    private triggerRender(treeData:Array<syRender.BaseData>,crData: CameraRenderData) {
        if(!treeData||treeData.length<=0)
        {
            return;
        }
        //设置帧缓冲区
        this.readyForOneFrame(crData);
        //记录一下当前渲染的时间
        this._triggerRenderTime++;
        var cameraData = GameMainCamera.instance.getCameraByUUid(syRender.CameraUUid.base3D).getCameraData();
        G_CameraModel.createCamera(crData.VA, cameraData.projectMat, cameraData.modelMat,crData.VAPos);
        //提交数据给GPU 立即绘制
        for (var j = 0; j < treeData.length; j++) {   
            if (treeData[j].isOffline && crData.fb) {
                //对于离屏渲染的数据 如果当前是离屏渲染的话 则不可以渲染它 否则会报错
                //你想啊你把一堆显示数据渲染到一张纹理中，这张纹理本身就在这一堆渲染数据中 自然是会冲突的
                //[.Offscreen-For-WebGL-07E77500]GL ERROR :GL_INVALID_OPERATION : glDrawElements: Source and destination textures of the draw are the same
                continue;
            }
            let rData = treeData[j];
            //相机 一般只有两种 要么是3d透视相机 要么是2d正交相机
            var cammerauuid = crData.uuid;
            if(cammerauuid==syRender.CameraUUid.adapt)
            {
                //自适应的相机 就是2d的节点使用2d相机 3d节点使用3d相机
                if(rData.node.is3DNode())
                {
                    cammerauuid = syRender.CameraUUid.base3D;
                }
                else
                {
                    cammerauuid = syRender.CameraUUid.base2D;
                }
            }
            else
            {
                cammerauuid = syRender.CameraUUid.light;
            }
            var cameraData = GameMainCamera.instance.getCameraByUUid(cammerauuid).getCameraData();

            this.draw(rData, crData,cameraData);
        }
    }
    /**
     * 
     * @param rData 
     * @param projMatix 投影矩阵
     * @param viewMatrix 视口矩阵
     */
    private _drawBase(rData: syRender.BaseData, projMatix: Float32Array, viewMatrix: Float32Array,crData: CameraRenderData): void {
        G_DrawEngine.run(rData, viewMatrix, projMatix, rData.shader);
    }
    private _temp1Matrix: Float32Array = glMatrix.mat4.identity(null);
    /**
     * 此函数每调用一次就有可能产生一次drawcall
     * @param rData 
     * @param crData
     * @param cData
     * @param isUseScene 
     */
    private draw(rData: syRender.BaseData, crData: CameraRenderData,cData:CameraData): void {
        
        
        glMatrix.mat4.identity(this._temp1Matrix);
        

        //补一下光的数据
        rData.light.parallel.color = G_LightCenter.lightData.parallel.color; //光的颜色
        rData.light.parallel.direction = G_LightCenter.lightData.parallel.direction;//光的方向
        rData._cameraPosition = cData.position;
        rData.light.ambient.color = G_LightCenter.lightData.ambient.color;//环境光
        rData.light.point.color = G_LightCenter.lightData.point.color;//点光
        rData.light.specular.shininess = G_LightCenter.lightData.specular.shininess;
        rData.light.specular.color = G_LightCenter.lightData.specular.color;
        rData.light.position = G_LightCenter.lightData.position;

        rData.light.spot.direction = G_LightCenter.lightData.spot.direction;
        rData.light.spot.color = G_LightCenter.lightData.spot.color;
        rData.light.spot.innerLimitAngle = G_LightCenter.lightData.spot.innerLimitAngle;
        rData.light.spot.outerLimitAngle = G_LightCenter.lightData.spot.outerLimitAngle;

        rData.light.fog.color = G_LightCenter.lightData.fog.color;
        rData.light.fog.density = G_LightCenter.lightData.fog.density;

        rData.light.viewMatrix = G_LightCenter.lightData.viewMatrix;
        rData.light.projectionMatrix = G_LightCenter.lightData.projectionMatrix;
        
        rData.light.shadow.bias = G_LightCenter.lightData.shadow.bias;
        rData.light.shadow.size = G_LightCenter.lightData.shadow.size;
        rData.light.shadow.min = G_LightCenter.lightData.shadow.min;
        rData.light.shadow.opacity = G_LightCenter.lightData.shadow.opacity;
        rData.light.shadow.map = G_LightCenter.lightData.shadow.map;

        switch (rData.type) {
            case syRender.DataType.Base:
                this._commitRenderState(rData.pass.state);
                if (crData.isFirstVisualAngle()) {
                    this._drawBase(rData, cData.projectMat, cData.viewMat,crData);
                }
                else {
                    let projMatix = G_CameraModel.getSceneProjectMatrix(crData.VA);
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix(crData.VA));
                    this._drawBase(rData, projMatix, this._temp1Matrix,crData);
                }
                break;
            case syRender.DataType.Normal:
                this._commitRenderState((rData as syRender.NormalData)._state);
                if (crData.isFirstVisualAngle()) {
                    this._drawNormal(rData as syRender.NormalData, cData);
                }
                else {
                    let projMatix = G_CameraModel.getSceneProjectMatrix(crData.VA);
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix(crData.VA));
                    cData.projectMat = projMatix;
                    cData.modelMat = this._temp1Matrix;
                    this._drawNormal(rData as syRender.NormalData, cData);
                }
                break;
            case syRender.DataType.Spine:
                this._commitRenderState((rData as syRender.SpineData)._state);
                if (crData.isFirstVisualAngle()) {
                    glMatrix.mat4.invert(this._temp1Matrix, cData.modelMat);
                    this._drawSpine(rData as syRender.SpineData, cData.projectMat, this._temp1Matrix);
                } else {
                    let projMatix = G_CameraModel.getSceneProjectMatrix(crData.VA);
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix(crData.VA));
                    this._drawSpine(rData as syRender.SpineData, projMatix, this._temp1Matrix);
                }
                break;
        }

    }
    private _curGLID = -1;
    private _drawSpine(sData: syRender.SpineData, projMatix: Float32Array, viewMatrix: Float32Array): void {
        if (this._curGLID != sData._shaderData.spGlID) {
            this.gl.useProgram(sData._shaderData.spGlID);
            this._curGLID == sData._shaderData.spGlID;
        }
        G_ShaderFactory.setBuffersAndAttributes(sData._shaderData.attrSetters, sData._attrbufferData);
        for (let j = 0; j < sData._uniformData.length; j++) {
            G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, sData._uniformData[j]);
        }
        let projData = {};
        projData[sData._projKey] = projMatix;
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, projData);
        let viewData = {};
        viewData[sData._viewKey] = viewMatrix;
        G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, viewData);
        G_ShaderFactory.drawBufferInfo(sData._attrbufferData, sData.primitive.type);
    }
    private _drawNormal(sData: syRender.NormalData, cameraData: CameraData): void {
        this.gl.useProgram(sData._shaderData.spGlID);
        (sData.node as SY.Sprite).updateUniformsData(cameraData, G_LightCenter.lightData);
        G_ShaderFactory.setBuffersAndAttributes(sData._shaderData.attrSetters, sData._attrbufferData);
        for (let j in sData._uniformData) {
            G_ShaderFactory.setUniforms(sData._shaderData.uniSetters, sData._uniformData[j]);
        }
        G_ShaderFactory.drawBufferInfo(sData._attrbufferData, sData.primitive.type);
    }
    private _mapRenderTreeData:Map<syRender.DrawingOrder,Array<syRender.BaseData>> = new Map();//渲染树上的绘制数据
    public collectData(rData: syRender.BaseData): void {
        if(!this._mapRenderTreeData.has(rData.drawingOrder))
        {
            this._mapRenderTreeData.set(rData.drawingOrder,[])
        }
        this._mapRenderTreeData.get(rData.drawingOrder).push(rData);
    }

    //----------------------------------------------------------------------------------------------------------------start---------
    /**
     * 渲染一帧前 对缓冲区做一些准备工作
     * @param fb  帧缓冲
     * @param viewPort 视口大小
     * @param isClear 是否清理缓冲区
     */
    private readyForOneFrame(cdData:CameraRenderData): void {
        
        this.setFrameBuffer(cdData.fb);
        this.setViewPort(cdData.viewPort);
        if (cdData.isClear)
            this.clear(cdData.clearColor,cdData.cColor,cdData.cDepth,cdData.cStencil);
        
    }
    private _framebuffer: WebGLFramebuffer;//帧缓冲
    /**
   * @method setFrameBuffer
   * @param {FrameBuffer} fb - null means use the backbuffer
   */
    private setFrameBuffer(fb: WebGLFramebuffer) {
        if (this._framebuffer === fb) {
            return;
        }
        this._framebuffer = fb;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._framebuffer);
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
    private _curViewPort:any;
    private setViewPort(object: any): void {
        let x = object.x * this.width;
        let y = object.y * this.height;
        let width = object.w * this.width;
        let height = object.h * this.height;
        if (this._curViewPort == null ||
            !(this._curViewPort.x == x && this._curViewPort.y == y && this._curViewPort.width == width && this._curViewPort.height == height)) {
            this.gl.viewport(x, y, width, height);
            // this.gl.scissor(x, y, width, height);
            this._curViewPort = { x: x, y: y, width: width, height: height };
        }

    }
    /**
     * 清理附件
     * 颜色
     * 深度
     * 模板
     */
    public clear(cColor:Array<number>=[0.5,0.5,0.5,1.0],cBuffer:boolean=true,dBuffer:boolean=true,sBuffer:boolean=true): void {
        let gl = this.gl;
        gl.clearColor(cColor[0],cColor[1],cColor[2],cColor[3]);
        var value=cBuffer?gl.COLOR_BUFFER_BIT:null;
        value = dBuffer?(value?value|gl.DEPTH_BUFFER_BIT:gl.DEPTH_BUFFER_BIT):null;
        value = sBuffer?(value?value|gl.STENCIL_BUFFER_BIT:gl.STENCIL_BUFFER_BIT):null;
        gl.clear(value);
    }
    //---------------------------------------------------------------------------------------------end---------------------------------

    public get width() {
        return this._width;
    }
    public get height() {
        return this._height;
    }
    public set width(width) {
        this.width = width;
    }
    public set height(height) {
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
        this._initStates();

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
        /**
         * shader中 对于一些变量的使用是有限制的，不同的设备限制还不一样
         * 比如对于顶点着色器和片元着色器:
         * 最多可以命名使用n个vec4变量
         * 最多可以命名使用m个mat矩阵
         * 最多可以命名使用m个texture单元
         * ......
         * 另外对于单个纹理单元的大小也是有上限控制的
         * 一般一个纹理尺寸最大为（2048*2048），单位就是一个像素
         * 
         */
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

    public autoCapture():void{
        var x = G_InputControl.getLastPressPos()[0];
        var y = G_InputControl.getLastPressPos()[1];
        var gl = this.gl;
        var width = 512;
        var height = 512;
        var pixels = new Uint8Array(width * height * 4);
        gl.readPixels(x,y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        let ctx = Device.Instance.getCanvas2D();
        ctx.putImageData(imageData, 0,0);
        //截图保存下来
        this.capture(window["canvas2d"]);
    }

    /**
     * 显示当前帧缓存中的图像数据
     * @param width 
     * @param height 
     */
    public showCurFramerBufferOnCanvas(width?: number, height?: number): void {
        if(!G_InputControl.openCapture)
        {
            return;
        }
        let gl = this.gl;
        height = height || 512;
        width = width || 512;
        var pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        let ctx = Device.Instance.getCanvas2D();
        ctx.putImageData(imageData, 0, 0);
        //截图保存下来
        this.capture(window["canvas2d"]);
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
    public writeStencil(ref: number = 1, mask: number = 1, isCloseColorWrite: boolean = true): void {
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

        if (isCloseColorWrite) {
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

        gl.colorMask(true, true, true, true);
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
