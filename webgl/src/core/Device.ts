
import { glMatrix } from "./math/Matrix";
import Scene2D from "./renderer/base/Scene2D";
import Scene3D from "./renderer/base/Scene3D";
import { G_CameraModel } from "./renderer/camera/CameraModel";
import { CameraRenderData, GameMainCamera } from "./renderer/camera/GameMainCamera";
import FrameBuffer from "./renderer/gfx/FrameBuffer";
import { CameraData } from "./renderer/data/CameraData";
import { syRender } from "./renderer/data/RenderData";
import { State } from "./renderer/gfx/State";
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
import { MathUtils } from "./utils/MathUtils";
import { Rect } from "./value-types/rect";
import Vec4 from "./value-types/vec4";

/**
 渲染流程：
 阶段1--》CPU准备数据（顶点，法线，uv坐标，切线等）
 阶段2--》顶点着色器：主要完成顶点的空间变换，将顶点从模型空间变换到世界空间，再变换到视口空间，再变换到齐次裁切空间
 上面的三种变换就是大名鼎鼎的(PVM*position),在这三种变换以后，下面的操作就是GPU的内置操作了，如下：
 会进行齐次除法，完成真正的投影，然后会自动进行归一化，生成标准的NDC坐标，NDC的坐标范围是【-1,1】，而屏幕坐标的范围是【0,1】，最后会进行屏幕映射生成屏幕坐标
 阶段3--》图元装配：点，线，三角形目前支持这三种
 阶段4--》光栅化，生成片元，这里面也有裁切操作进行
 阶段5--》片元着色器
 阶段6--》逐片元操作（像素所有权测试）
 阶段7--》逐片元操作（裁切）
 阶段8--》逐片元操作（模板测试）
 阶段9--》逐片元操作（深度测试）
 阶段10--》逐片元操作（混合）
 阶段11--》抖动

 从顶点着色器传到片元着色器的相关的变量，有的是需要归一化的，比如法线，其它方向等，因为这个中间有一个插值的存在

 */

/**
    * 初始化渲染状态
    */
function _initStates(gl: WebGL2RenderingContext) {

    gl.activeTexture(gl.TEXTURE0);
    gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // rasterizer state
    gl.enable(gl.SCISSOR_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.0, 0.0);

    // depth stencil state
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.depthRange(0.0, 1.0);

    gl.stencilFunc(gl.ALWAYS, 0, 0xffff)
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
    gl.stencilMask(0xffff)

    gl.stencilFuncSeparate(gl.FRONT, gl.ALWAYS, 0, 0xffff);
    gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.KEEP);
    gl.stencilMaskSeparate(gl.FRONT, 0xffff);
    gl.stencilFuncSeparate(gl.BACK, gl.ALWAYS, 0, 0xffff);
    gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.KEEP);
    gl.stencilMaskSeparate(gl.BACK, 0xffff);
    gl.disable(gl.STENCIL_TEST);

    // blend state
    gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.disable(gl.BLEND);
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
    gl.colorMask(true, true, true, true);
    gl.blendColor(0.0, 0.0, 0.0, 0.0);
}

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
//坊间基础知识
//何为隐藏面消除 隐藏面一般都在背面 深度值要大一些，开启深度测试 可以消除
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

gDepthBuffer[x][y] = [z,z,z,z,z,z,....]
x:屏幕的坐标
y:屏幕的坐标
....................
....................
....................
....................
....................

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
        //举一个例子
        //在混合的时候，往往是先渲染不透明的物体，再渲染透明的物体，透明的物体也是从远往近绘制
        //在绘制不透明节点的时候，是开启深度测试，然后关闭深度写入，注意这里只是关闭深度写入，混合后的颜色值还是正常写入的
        //对于透明的物体而言，它是可以看到后边物体的，如果我们把深度写入，那后边的物体就不会通过深度测试了，这是关闭深度写入的原因
        //对于那些挡在透明度物体前面的物体，那当前透明物体这块区域是看不见的，所以要开启深度测试
        //当有多个透明物体时，多个透明物体彼此是可以相互透明的，就需要从远处向近处绘制，不然无法通过深度测试
        next.depthWrite ? gl.depthMask(true) : gl.depthMask(false);
    }
    if (cur.depthFunc != next.depthFunc) {
        //比较函数
        gl.depthFunc(next.depthFunc);
    }
}
/**
 * 提交模板状态
 * @param gl 
 * @param cur 
 * @param next 
 * 
    //模板测试伪代码
    // stencil test比较的时候需要mask
    status = stencilfunc.func((stencilbuf[x,y] & stencilfunc.mask), (stencilfunc.ref & stencilfunc.mask));
    status |= depth_test_result;
    if (status == stencil_test_fail) stencilop = sfailop;
    else if (status == stencil_test_pass & depth_test_fail) stencilop = dpfailop;
    else if (status == stencil_test_pass & depth_test_pass) stencilop = dppassop;
    // stencil test结束后的操作不需要mask
    stencil_new_value = stencilop(stencilbuf[x,y]);
    // 写入stencil buffer的时候需要另一个mask
    stencilbuf[x,y] = (stencil_new_value & stencilmask.mask) | (stencilbuf[x,y] & (~stencilmask.mask));



    函数功能：指定模板测试的比较方法
    gl.stencilFunc(func: number, ref: number, mask: number)
    func:设置一个比较方法
    ref:指定模板测试的引用值。模板缓冲的内容会与这个值对比
    mask:指定一个遮罩，在模板测试对比引用值和储存的模板值前，对它们进行按位与（and）操作，初始设置为1，
         指定掩码，只在掩码为1的位上进行比较，控制参考值的哪些位和缓冲区进行比较
    func的值下边随便用
        DS_FUNC_NEVER: 512,    // gl.NEVER    总是不通过测试
        DS_FUNC_LESS: 513,     // gl.LESS     (ref & mask) < (bufferValue & mask)
        DS_FUNC_EQUAL: 514,    // gl.EQUAL    (ref & mask) = (bufferValue & mask)
        DS_FUNC_LEQUAL: 515,   // gl.LEQUAL   (ref & mask) <= (bufferValue & mask)
        DS_FUNC_GREATER: 516,  // gl.GREATER  (ref & mask) > (bufferValue & mask)
        DS_FUNC_NOTEQUAL: 517, // gl.NOTEQUAL (ref & mask) != (bufferValue & mask)
        DS_FUNC_GEQUAL: 518,   // gl.GEQUAL   (ref & mask) >= (bufferValue & mask)
        DS_FUNC_ALWAYS: 519,   // gl.ALWAYS   总是通过测试
    gl.stencilFuncSeparate(face:number,func: number, ref: number, mask: number)
    此函数与gl.stencilFunc功能一样，只是它可以指定一个面进行模板测试
    face可以传入的值如下：
        CULL_FRONT: 1028,          //gl.FRONT           前面
        CULL_BACK: 1029,           //gl.BACK            背面
        CULL_FRONT_AND_BACK: 1032, //gl.FRONT_AND_BACK  前后两面

    
    函数功能：指定了当一个片段通过或未通过模板测试是，模板缓冲区中的数据如何进行修改
    gl.stencilOp(fail: GLenum, zfail: GLenum, zpass: GLenum)
    fail: 如果模板测试失败将采取的动作。
    zfail： 如果模板测试通过，但是深度测试失败时采取的动作。
    zpass： 如果深度测试和模板测试都通过，将采取的动作
    下边的参数随便用
        STENCIL_OP_KEEP: 7680,          // gl.KEEP  	保持现有的模板值
        STENCIL_OP_ZERO: 0,             // gl.ZERO      将模板值置为0
        STENCIL_OP_REPLACE: 7681,       // gl.REPLACE   将模板值设置为用glStencilFunc函数设置的ref值
        STENCIL_OP_INCR: 7682,          // gl.INCR      如果模板值不是最大值就将模板值+1
        STENCIL_OP_INCR_WRAP: 34055,    // gl.INCR_WRAP 与gl.GL_INCR一样将模板值+1，如果模板值已经是最大值则设为0
        STENCIL_OP_DECR: 7683,          // gl.DECR      如果模板值不是最小值就将模板值-1
        STENCIL_OP_DECR_WRAP: 34056,    // gl.DECR_WRAP 与GL_DECR一样将模板值-1，如果模板值已经是最小值则设为最大值
        STENCIL_OP_INVERT: 5386,        // gl.INVERT    Bitwise inverts the current stencil buffer value
    gl.stencilOpSeparate(face:number,fail: GLenum, zfail: GLenum, zpass: GLenum)
    此函数与gl.stencilOp功能一样，只是它可以指定一个面进行模板数据操作
    face可以传入的值如下：
        CULL_FRONT: 1028,          //gl.FRONT           前面
        CULL_BACK: 1029,           //gl.BACK            背面
        CULL_FRONT_AND_BACK: 1032, //gl.FRONT_AND_BACK  前后两面
    
    函数功能：当通过层层测试的时候最终要写入到模板缓冲的时候，需要用到这个值
    gl.stencilMask(mask:number)
    gl.stencilMaskSeparate(face:number,mask:number)
 */
function _commitStencilState(gl: WebGLRenderingContext, cur: State, next: State): void {

    if (next.stencilSep) {
        /**
         * 这种模式下的模板功能很奇怪
         * 只有默认值和用到的时候设置的ref,mask一样，才可以正常使用模板
         */
        //关闭或者开启模板测试
        if ((cur.stencilTestFront !== next.stencilTestFront)
            || (cur.stencilTestBack !== next.stencilTestBack)) {

            if (next.stencilTestFront || next.stencilTestBack) {
                gl.enable(gl.STENCIL_TEST);
            } else {
                gl.disable(gl.STENCIL_TEST);
                return
            }
        }
        // front
        if ((cur.stencilFuncFront !== next.stencilFuncFront)
            || (cur.stencilRefFront !== next.stencilRefFront)
            || (cur.stencilMaskFront !== next.stencilMaskFront)) {
            gl.stencilFuncSeparate(
                gl.FRONT,
                next.stencilFuncFront,
                next.stencilRefFront,
                next.stencilMaskFront,
            );
        }
        if ((cur.stencilFailOpFront !== next.stencilFailOpFront)
            || (cur.stencilZFailOpFront !== next.stencilZFailOpFront)
            || (cur.stencilZPassOpFront !== next.stencilZPassOpFront)) {
            gl.stencilOpSeparate(
                gl.FRONT,
                next.stencilFailOpFront,
                next.stencilZFailOpFront,
                next.stencilZPassOpFront,
            );
        }
        if (cur.stencilWriteMaskFront !== next.stencilWriteMaskFront) {
            gl.stencilMaskSeparate(gl.FRONT, next.stencilWriteMaskFront);
        }
        //back
        if ((cur.stencilFuncBack !== next.stencilFuncBack)
            || (cur.stencilRefBack !== next.stencilRefBack)
            || (cur.stencilMaskBack !== next.stencilMaskBack)) {
            gl.stencilFuncSeparate(
                gl.BACK,
                next.stencilFuncBack,
                next.stencilRefBack,
                next.stencilMaskBack,
            );
        }
        if ((cur.stencilFailOpBack !== next.stencilFailOpBack)
            || (cur.stencilZFailOpBack !== next.stencilZFailOpBack)
            || (cur.stencilZPassOpBack !== next.stencilZPassOpBack)) {
            gl.stencilOpSeparate(
                gl.BACK,
                next.stencilFailOpBack,
                next.stencilZFailOpBack,
                next.stencilZPassOpBack,
            );
        }
        if (cur.stencilWriteMaskBack !== next.stencilWriteMaskBack) {
            gl.stencilMaskSeparate(gl.BACK, next.stencilWriteMaskBack);
        }
    }
    else {
        /**
         * 使用下面这种可以正常使用模板功能
         * 也就是说 可以随意指定模板值
         */
        if (cur.stencilTest != next.stencilTest) {
            next.stencilTest ? gl.enable(gl.STENCIL_TEST) : gl.disable(gl.STENCIL_TEST)
        }
        if (cur.stencilFunc != next.stencilFunc ||
            cur.stencilRef != next.stencilRef ||
            cur.stencilMask != next.stencilMask) {
            gl.stencilFunc(next.stencilFunc, next.stencilRef, next.stencilMask)
        }
        if ((cur.stencilFailOp !== next.stencilFailOp)
            || (cur.stencilZFailOp !== next.stencilZFailOp)
            || (cur.stencilZPassOp !== next.stencilZPassOp)) {
            gl.stencilOp(next.stencilFailOp, next.stencilZFailOp, next.stencilZPassOp,
            );
        }
    }
}


/**
 * 默认情况下 剔除功能是关闭的
gl.enable(gl.CULL_FACE);开启面剔除
gl.disable(gl.CULL_FACE);关闭面剔除

gl.frontFace()这个函数是设置那个面是正面
----------》gl.CW：表示顺时针绘制的代表正面gl.FRONT，否则是背面gl.BACK，这个是默认设置
----------》gl.CCW：表示逆时针绘制的代表正面gl.FRONT，否则是背面gl.BACK
gl.cullFace()设置那一面被剔除有三个函数，如下
----------》gl.BACK：背面
----------》gl.FRONT：前面
----------》gl.FRONT_AND_BACK：前后两面

CULL_NONE: 0,      
CULL_FRONT: 1028,
CULL_BACK: 1029,
CULL_FRONT_AND_BACK: 1032,

 */
function _commitCullState(gl: WebGLRenderingContext, cur: State, next: State): void {
    if (cur.cullMode != next.cullMode) {
        if (next.cullMode == glEnums.CULL_NONE) {
            //关闭剔除
            gl.disable(gl.CULL_FACE);
        }
        else {
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
 * 裁切区域左下角为：（0,0）
 * 裁切区域右上角为：（screenWidth,screenHeight）
 */
function _commitScissorState(gl: WebGLRenderingContext, cur: State, next: State): void {
    if(cur.ScissorTest!=next.ScissorTest)
    {
        next.ScissorTest?gl.enable(gl.SCISSOR_TEST):gl.disable(gl.SCISSOR_TEST);
    }

    if(cur.ScissorLeftBottom_X!=next.ScissorLeftBottom_X||
        cur.ScissorLeftBottom_Y!=next.ScissorLeftBottom_Y||
        cur.ScissorRightTop_X!=next.ScissorRightTop_X||
        cur.ScissorRightTop_Y!=next.ScissorRightTop_Y)
    {
        gl.scissor(next.ScissorLeftBottom_X,next.ScissorLeftBottom_Y,next.ScissorRightTop_X, next.ScissorRightTop_Y);
    }
}
/**
 * 导读-----------------------------------------------------------------------------
 * 混合(Blending)就是控制透明的。处于片元着色器以后通过深度测试，就会进入到混合
 * alpha值可以直接来自于纹理中，也可以外界传入，然后在片元着色器中赋给片元
 * 特别注意：在混合中也不一定会用到从片元着色器出来的alpha值，这取决于我们如何选取混合函数的参数
 * 例如我们选gl.blendFunc(gl.ONE,gl.ZERO) == 》 finalColor = srcColor*1 op targetColor*0，
 * 但如果我们选gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA) ==》 finalColor = srcColor*sAlpha op targetColor*(1-sAlpha),这样alpha就会
 * 
 * 最常实现的功能就是半透明叠加
 * 有一个问题 必须是透明的颜色才具备混合，也就是alpha的值必须小于1，否则就是覆盖了
 * 所以我们说的混合都是针对alpha小于1的顶点颜色
 * 
 * 最常见的混合方式gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);但这样的混合方式会改变alpha
   如果不希望改变混合后的alpha,可以使用下面这个函数
   gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
 * 
 * ----------------------------------------------------------------------------------
 * 
 * 公式------------------------------------------------------------------------------
 * 
 * gl.enable(gl.BLEND);开启混合
 * gl.enable(gl.BLEND);//关闭混合
 * 
 * 
 * 在不使用拆分混合的时候
 * gl.blendFunc(源系数,目标系数)
 * 最终颜色 = （Shader计算出的点颜色值 * 源系数）op（深度缓冲区颜色 * 目标系数）
 * 最终alpha = （Shader计算出的点alpha * 源系数）op（深度缓冲区alpha * 目标系数）
 * 在使用拆分混合的时候
 * gl.blendFuncSeparate(rgb源系数,rgb目标系数,alpha源系数,alpha目标系数)
 * 最终颜色 = （Shader计算出的点颜色值 * rgb源系数）op（深度缓冲区颜色 * rgb目标系数）
 * 最终alpha = （Shader计算出的点alpha * alpha源系数）op（深度缓冲区alpha * alpha目标系数）
 * -----------------------------------------------------------------------------------

 * 参数解析---------------------------------------------------------------------------
 * 源系数&&目标系数（SrcFactor&&DstFactor）
 * ==》可以是从片元着色器中输出的alpha值，也可以是从片元着色器中输出的rgb值
 * --》混合参数就需要下面这几种
 *  -gl.ONE;
    -gl.ZERO;
    -gl.SRC_COLOR;
    -gl.DST_COLOR
    -gl.SRC_ALPHA;
    -gl.DST_ALPHA;
    -gl.ONE_MINUS_SRC_ALPHA;
    -gl.ONE_MINUS_SRC_COLOR;
    -gl.ONE_MINUS_DST_ALPHA;
    -gl.ONE_MINUS_DST_COLOR;
 * ==》也可以通过gl.blendColor(r,g,b,a)这个函数来指定alpha值和rgb值
 * --》混合参数就需要调用这四个参数
    -gl.CONSTANT_ALPHA
    -gl.CONSTANT_COLOR
    -gl.ONE_MINUS_CONSTANT_ALPHA
    -gl.ONE_MINUS_CONSTANT_COLO
 * 深度缓冲区颜色：这个是当前位置的点累计计算的颜色，也就是深度缓冲区的颜色
 * 深度缓冲区alpha:这个就是深度缓冲区的alpha值，也有可能是alpha缓冲中，如果深度缓冲中只存有rgb的话
 * Shader计算出的点颜色值：这个是当前材质上点的颜色，也就是片元着色器中gl_FragColor.rgb
 * Shader计算出的点alpha：从片元着色器中传出的值，也就是gl_FragColor.a
 * op:指的是操作函数 ，无非就三种，加，减，逆向减
 *  ==》gl.blendEquation(mode):该函数可以设置op的操作函数如下：
    -gl.FUNC_ADD：相加处理
    -gl.FUNC_SUBTRACT：相减处理
    -gl.FUNC_REVERSE_SUBSTRACT：反向相减处理，即 dest 减去 source
 * ----------------------------------------------------------------------------------------
 * 

 * 外界传参---------------------------------------------------------------------------------
 *  blend: false, //是否开启混合  -->enable(gl.BLEND) or gl.disable(gl.CULL_FACE);
    blendSep: false, //是否拆开混合
    blendColor: 0xffffffff,
    blendEq: syGL.BlendFunc.ADD, 
    blendAlphaEq: syGL.BlendFunc.ADD,
    blendSrc: syGL.Blend.ONE,  
    blendDst: syGL.Blend.ZERO,
    blendSrcAlpha: syGL.Blend.ONE,
    blendDstAlpha: syGL.Blend.ZERO,
   -----------------------------------------------------------------------------------------
 */
function _commitBlendState(gl: WebGLRenderingContext, cur: State, next: State): void {


    if (cur.blend != next.blend) {
        //控制开启或者关闭混合
        next.blend ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
    }

    if (cur.blendColorMask !== next.blendColorMask) {
        var colorMask = next.blendColorMask
        const r = (colorMask & syRender.ColorMask.R) !== syRender.ColorMask.NONE;
        const g = (colorMask & syRender.ColorMask.G) !== syRender.ColorMask.NONE;
        const b = (colorMask & syRender.ColorMask.B) !== syRender.ColorMask.NONE;
        const a = (colorMask & syRender.ColorMask.A) !== syRender.ColorMask.NONE;
        gl.colorMask(r, g, b, a);
    }

    if (cur.blendColor != next.blendColor) {
        var copyColor = next.blendColor
        var setColor = Util.hexToRgb(copyColor)
        gl.blendColor(setColor.r, setColor.g, setColor.b, setColor.a)
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

            if (cur.blendEq != next.blendEq) {
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




    private getTreeData(drawOrder: syRender.DrawingOrder, tag: syRender.ShaderType): syRender.BaseData[] {
        //深度渲染pass
        var treeData = this._mapRenderTreeData.get(drawOrder);
        var retData = []
        for (let j in treeData) {
            if (treeData[j].pass && treeData[j].pass.shaderType == tag) {
                retData.push(treeData[j]);
            }
            else if (!treeData[j].pass && tag == syRender.ShaderType.Custom) {
                retData.push(treeData[j]);
            }
        }
        return retData;
    }
    /**
     * 渲染顺序规则如下：值越大，表示渲染越靠后
     * 2d节点：1
     *       透明：1.1
     *       深度：1.2
     * 3d节点：2
     *       透明：2.1
     *       深度：2.2
     */
    private sortTreeData(): void {
        var data = this._mapRenderTreeData.get(syRender.DrawingOrder.Normal);
        if (data && data.length > 0)
            data.sort((a, b) => {
                if (a.pass != null && b.pass != null) {
                    if (a.primitive.alpha == b.primitive.alpha) {

                        if (a.node.gZOrder == b.node.gZOrder) {
                            if (a.node.getNodeType() == b.node.getNodeType()) {
                                return a.pass.shaderType - b.pass.shaderType;
                            }
                            else {
                                //3d节点应该先于2d节点渲染
                                return b.node.getNodeType() - a.node.getNodeType()
                            }
                        }
                        else {
                            //gZOrder 值越小越要提前渲染
                            return a.node.gZOrder - b.node.gZOrder
                        }

                    }
                    else {
                        if (a.node.gZOrder == b.node.gZOrder) {
                            if (a.node.getNodeType() == b.node.getNodeType()) {
                                /**
                             * 需要优先绘制不透明的物体
                             * 
                             * 绘制所有半透明的物体（α小于0）,注意它们应当按照深度排序，然后从后向前绘制
                             */
                                return b.primitive.alpha - a.primitive.alpha;
                            }
                            else {
                                //3d节点应该先于2d节点渲染
                                return b.node.getNodeType() - a.node.getNodeType()
                            }
                        }
                        else {
                            return a.node.gZOrder - b.node.gZOrder
                        }
                    }
                }
                return -1;
            })
    }
    /**
     * 获取常规渲染的data
     * @param drawOrder 
     * @param tagArr 
     * @returns 
     */
    private getNormalTreeData(): syRender.BaseData[] {
        var drawOrder = syRender.DrawingOrder.Normal;
        var tagArr: Array<syRender.ShaderType> = [syRender.ShaderType.Custom,
        syRender.ShaderType.Light_Spot,
        syRender.ShaderType.Light_Point,
        syRender.ShaderType.Light_Parallel,
        syRender.ShaderType.Line,
        syRender.ShaderType.Point,
        syRender.ShaderType.Sprite,
        syRender.ShaderType.SolidColor,
        syRender.ShaderType.UvSprite,
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
        for (let j in treeData) {
            if (treeData[j].pass && tagArr.indexOf(treeData[j].pass.shaderType) >= 0) {
                retData.push(treeData[j]);
            }
            else if (!treeData[j].pass && tagArr.indexOf(syRender.ShaderType.Custom) >= 0) {
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
        cameraData.sort(function (a, b) {
            if (a.drawingOrder != b.drawingOrder)
                return b.drawingOrder - a.drawingOrder;
            else
                return b.rtuuid - a.rtuuid;
        })
        for (let k = 0; k < cameraData.length; k++) {
            if (cameraData[k].drawingOrder == syRender.DrawingOrder.Normal) {
                if (cameraData[k].rtuuid == syRender.RenderTextureUUid.shadowMap) {
                    //深度渲染pass
                    this.triggerRender(this.getTreeData(syRender.DrawingOrder.Normal, syRender.ShaderType.ShadowMap), cameraData[k]);
                }
                else {
                    this.triggerRender(this.getNormalTreeData(), cameraData[k]);
                }
            }
            else if (cameraData[k].drawingOrder == syRender.DrawingOrder.Middle) {
                //优先绘制
                var tree1 = this.getTreeData(syRender.DrawingOrder.Middle, syRender.ShaderType.Custom)
                var tree2 = this.getTreeData(syRender.DrawingOrder.Middle, syRender.ShaderType.Rtt)
                this.triggerRender(tree1.concat(tree2), cameraData[k]);
            }
        }
        if (G_InputControl.openCapture && G_InputControl.isCapture) {
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
        this._nextFrameS.set(state);
        _commitScissorState(gl, this._curFrameS, this._nextFrameS);
        _commitDepthState(gl, this._curFrameS, this._nextFrameS);
        _commitStencilState(gl, this._curFrameS, this._nextFrameS);
        _commitCullState(gl, this._curFrameS, this._nextFrameS);
        _commitBlendState(gl, this._curFrameS, this._nextFrameS);
        //更新状态
        this._curFrameS.set(this._nextFrameS);
    }
    //渲染后
    private onAfterRender() {
        this.stats.end();
        this._mapRenderTreeData.forEach(function (value, key) {
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
    private triggerRender(treeData: Array<syRender.BaseData>, crData: CameraRenderData) {
        if (!treeData || treeData.length <= 0) {
            return;
        }
        //设置帧缓冲区
        this.readyForOneFrame(crData);
        //记录一下当前渲染的时间
        this._triggerRenderTime++;
        var cameraData = GameMainCamera.instance.getCameraByUUid(syRender.CameraUUid.base3D).getCameraData();
        G_CameraModel.createCamera(crData.VA, cameraData.projectMat, cameraData.modelMat, crData.VAPos);
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
            if (cammerauuid == syRender.CameraUUid.adapt) {
                //自适应的相机 就是2d的节点使用2d相机 3d节点使用3d相机
                if (rData.node.is3DNode()) {
                    cammerauuid = syRender.CameraUUid.base3D;
                }
                else {
                    cammerauuid = syRender.CameraUUid.base2D;
                }
            }
            else {
                cammerauuid = syRender.CameraUUid.light;
            }
            var cameraData = GameMainCamera.instance.getCameraByUUid(cammerauuid).getCameraData();

            this.draw(rData, crData, cameraData);
        }
    }
    /**
     * 
     * @param rData 
     * @param projMatix 投影矩阵
     * @param viewMatrix 视口矩阵
     */
    private _drawBase(rData: syRender.BaseData, projMatix: Float32Array, viewMatrix: Float32Array, crData: CameraRenderData): void {
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
    private draw(rData: syRender.BaseData, crData: CameraRenderData, cData: CameraData): void {


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
                    this._drawBase(rData, cData.projectMat, cData.viewMat, crData);
                }
                else {
                    let projMatix = G_CameraModel.getSceneProjectMatrix(crData.VA);
                    glMatrix.mat4.invert(this._temp1Matrix, G_CameraModel.getSceneCameraMatrix(crData.VA));
                    this._drawBase(rData, projMatix, this._temp1Matrix, crData);
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
    private _mapRenderTreeData: Map<syRender.DrawingOrder, Array<syRender.BaseData>> = new Map();//渲染树上的绘制数据
    public collectData(rData: syRender.BaseData): void {
        if (!this._mapRenderTreeData.has(rData.drawingOrder)) {
            this._mapRenderTreeData.set(rData.drawingOrder, [])
        }
        this._mapRenderTreeData.get(rData.drawingOrder).push(rData);
    }

    //----------------------------------------------------------------------------------------------------------------start---------
    /**
     * 渲染一帧前 对缓冲区做一些准备工作
     */
    private readyForOneFrame(crData: CameraRenderData): void {

        this.setFrameBuffer(crData.fb);
        this.setViewPort(crData.viewPort);
        crData.clear?G_DrawEngine.clearBuffer(crData.clearColor, crData.clear):null;
        

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
    private _curViewPort:Rect = new Rect();
    private setViewPort(object: Rect): void {
        let x = object.x * this.width;
        let y = object.y * this.height;
        let width = object.width * this.width;
        let height = object.height * this.height;
        if (this._curViewPort == null ||
            this._curViewPort.x != x ||
            this._curViewPort.y != y || 
            this._curViewPort.width != width ||
             this._curViewPort.height != height) {
            G_DrawEngine.viewport(x, y, width, height);
            this._curViewPort.set(object);
        }

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
        _initStates(this.gl);

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

    public autoCapture(): void {
        var x = G_InputControl.getLastPressPos()[0];
        var y = G_InputControl.getLastPressPos()[1];
        var gl = this.gl;
        var width = 512;
        var height = 512;
        var pixels = new Uint8Array(width * height * 4);
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        let ctx = Device.Instance.getCanvas2D();
        ctx.putImageData(imageData, 0, 0);
        //截图保存下来
        this.capture(window["canvas2d"]);
    }

    /**
     * 显示当前帧缓存中的图像数据
     * @param width 
     * @param height 
     */
    public showCurFramerBufferOnCanvas(width?: number, height?: number): void {
        if (!G_InputControl.openCapture) {
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
