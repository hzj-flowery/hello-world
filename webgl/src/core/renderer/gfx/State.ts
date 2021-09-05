import { syGL} from "./syGLEnums";
import { glEnums } from "./GLapi";
import { syRender } from "../data/RenderData";
import { couldStartTrivia } from "typescript";


const sy_temp_blend_func = {
    BLEND_ZERO: 0,                          // gl.ZERO
    BLEND_ONE: 1,                           // gl.ONE
    BLEND_SRC_COLOR: 768,                   // gl.SRC_COLOR
    BLEND_ONE_MINUS_SRC_COLOR: 769,         // gl.ONE_MINUS_SRC_COLOR
    BLEND_DST_COLOR: 774,                   // gl.DST_COLOR
    BLEND_ONE_MINUS_DST_COLOR: 775,         // gl.ONE_MINUS_DST_COLOR
    BLEND_SRC_ALPHA: 770,                   // gl.SRC_ALPHA
    BLEND_ONE_MINUS_SRC_ALPHA: 771,         // gl.ONE_MINUS_SRC_ALPHA
    BLEND_DST_ALPHA: 772,                   // gl.DST_ALPHA
    BLEND_ONE_MINUS_DST_ALPHA: 773,         // gl.ONE_MINUS_DST_ALPHA
    BLEND_CONSTANT_COLOR: 32769,            // gl.CONSTANT_COLOR
    BLEND_ONE_MINUS_CONSTANT_COLOR: 32770,  // gl.ONE_MINUS_CONSTANT_COLOR
    BLEND_CONSTANT_ALPHA: 32771,            // gl.CONSTANT_ALPHA
    BLEND_ONE_MINUS_CONSTANT_ALPHA: 32772,  // gl.ONE_MINUS_CONSTANT_ALPHA
    BLEND_SRC_ALPHA_SATURATE: 776,          // gl.SRC_ALPHA_SATURATE
}

const sy_temp_blend_eq_func = {
    BLEND_FUNC_ADD: 32774,              // gl.FUNC_ADD
    BLEND_FUNC_SUBTRACT: 32778,         // gl.FUNC_SUBTRACT
    BLEND_FUNC_REVERSE_SUBTRACT: 32779, // gl.FUNC_REVERSE_SUBTRACT
}

const sy_temp_stencil_op_func = {
    STENCIL_OP_KEEP: 7680,          // gl.KEEP
    STENCIL_OP_ZERO: 0,             // gl.ZERO
    STENCIL_OP_REPLACE: 7681,       // gl.REPLACE
    STENCIL_OP_INCR: 7682,          // gl.INCR
    STENCIL_OP_INCR_WRAP: 34055,    // gl.INCR_WRAP
    STENCIL_OP_DECR: 7683,          // gl.DECR
    STENCIL_OP_DECR_WRAP: 34056,    // gl.DECR_WRAP
    STENCIL_OP_INVERT: 5386,        // gl.INVERT
}

const sy_temp_cull = {
    CULL_NONE: 0,
    CULL_FRONT: 1028,
    CULL_BACK: 1029,
    CULL_FRONT_AND_BACK: 1032,
}

const sy_temp_ds_func = {
    DS_FUNC_NEVER: 512,    // gl.NEVER
    DS_FUNC_LESS: 513,     // gl.LESS
    DS_FUNC_EQUAL: 514,    // gl.EQUAL
    DS_FUNC_LEQUAL: 515,   // gl.LEQUAL
    DS_FUNC_GREATER: 516,  // gl.GREATER
    DS_FUNC_NOTEQUAL: 517, // gl.NOTEQUAL
    DS_FUNC_GEQUAL: 518,   // gl.GEQUAL
    DS_FUNC_ALWAYS: 519,   // gl.ALWAYS
}

const sy_temp_pt = {
    PT_POINTS: 0,         // gl.POINTS
    PT_LINES: 1,          // gl.LINES
    PT_LINE_LOOP: 2,      // gl.LINE_LOOP
    PT_LINE_STRIP: 3,     // gl.LINE_STRIP
    PT_TRIANGLES: 4,      // gl.TRIANGLES
    PT_TRIANGLE_STRIP: 5, // gl.TRIANGLE_STRIP
    PT_TRIANGLE_FAN: 6,   // gl.TRIANGLE_FAN
}

// const sy_temp_color_mask = {
//     NONE:syRender.ColorMask.NONE,
//     R:syRender.ColorMask.R,
//     G:syRender.ColorMask.G,
//     B:syRender.ColorMask.B,
//     A:syRender.ColorMask.A,
//     All:syRender.ColorMask.ALL,
// }

const sy_temp_on_off = {
    on:true,
    off:false,
}

const _default = {
    // blend
    blend: false,
    blendSep: false,
    blendColor: "0xffffffff",
    blendEq: glEnums.BLEND_FUNC_ADD,
    blendAlphaEq: glEnums.BLEND_FUNC_ADD,
    blendSrc: glEnums.BLEND_ONE,
    blendDst: glEnums.BLEND_ZERO,
    blendSrcAlpha: glEnums.BLEND_ONE,
    blendDstAlpha: glEnums.BLEND_ZERO,
    blendColorMask:15,

    // depth
    depthTest: false,
    depthWrite: false,
    depthFunc: glEnums.DS_FUNC_LESS,



    // stencil
    stencilTestFront:false,
    stencilTestBack:false,
    stencilSep: false,
    stencilFuncFront: glEnums.DS_FUNC_ALWAYS,
    stencilRefFront: 1,
    stencilMaskFront: 0xffff,
    stencilFailOpFront: glEnums.STENCIL_OP_KEEP,
    stencilZFailOpFront: glEnums.STENCIL_OP_KEEP,
    stencilZPassOpFront: glEnums.STENCIL_OP_KEEP,
    stencilWriteMaskFront: 0xffff,
    stencilFuncBack: glEnums.DS_FUNC_ALWAYS,
    stencilRefBack: 1,
    stencilMaskBack: 0xffff,
    stencilFailOpBack: glEnums.STENCIL_OP_KEEP,
    stencilZFailOpBack: glEnums.STENCIL_OP_KEEP,
    stencilZPassOpBack: glEnums.STENCIL_OP_KEEP,
    stencilWriteMaskBack: 0xffff,

    //Scissor
    ScissorTest:false,

    // cull-mode
    cullMode: glEnums.CULL_NONE,  //剔除默认不开启

    // primitive-type
    primitiveType: glEnums.PT_TRIANGLES,

    // bindings
    maxStream: -1,
    vertexBuffers: [],
    vertexBufferOffsets: [],
    indexBuffer: null,
    maxTextureSlot: -1,
    textureUnits: [],
    program: null,

    viewPort:null

};

export const StateValueMap = {
   
    /**
     * 是否开启alpha混合
     */
    blend:sy_temp_on_off,
    /**
     * 是否是拆分混合函数blendFuncSeparate 不然就使用低级的blendFunc
     */
    blendSep:sy_temp_on_off,
    /**
     * 设置常量的混合颜色 r g b a
     * 一般情况，源颜色指的是片元着色器传出的颜色，目标颜色指的是颜色缓冲中的颜色
     * 我们也可以追加指定一个常量，不使用上面提到的两种颜色，或者alpha
     */
    // blendColor:"blendColor",
    /**
     * 设置混合颜色计算公式(加 减 逆向减)
     * 默认情况不拆开混合的话，也会设置alpha计算公式
     */
    blendEq:sy_temp_blend_eq_func,
    /**
     * 设置透明度混合的计算公式
     */
    blendAlphaEq:sy_temp_blend_eq_func,
    /**
     * 设置源因子
     */
    blendSrc:sy_temp_blend_func,
    /**
     * 设置目标因子
     */
    blendDst:sy_temp_blend_func,
    /**
     * 设置alpha的源因子
     */
    blendSrcAlpha:sy_temp_blend_func,
    /**
     * 设置alpha的目标因子
     */
    blendDstAlpha:sy_temp_blend_func,
    /**
     * 控制是否可以向颜色缓冲写数据
     */
    // blendColorMask:sy_temp_color_mask,

    // depth
    /**
     * 是否开启深度测试
     */
    depthTest:sy_temp_on_off,
    /**
     * 是否允许深度写入
     */
    depthWrite:sy_temp_on_off,
    /**
     * 设置深度比较函数
     */
    depthFunc:sy_temp_ds_func,

    // stencil
    /**
     * 是否开启正面模板测试
     */
    stencilTestFront:sy_temp_on_off,
    /**
     * 是否开启背面模板测试
     */
    stencilTestBack:sy_temp_on_off,
    /**
     * 是否拆分开启模板测试
     */
    stencilSep:sy_temp_on_off,
    /**
     * 设置正面模板函数
     */
    stencilFuncFront:sy_temp_ds_func,
    /**
     * 设置正面的模板函数的ref参数
     */
    // stencilRefFront:"stencilRefFront",
    /**
     * 设置正面的模板函数的mask参数
     */
    // stencilMaskFront:"stencilMaskFront",
    /**
     * 正面模板测试失败后该如何操作
     */
    stencilFailOpFront:sy_temp_stencil_op_func,
    /**
     * 正面模板测试通过，深度测试成功，该如何操作
     */
    stencilZFailOpFront:sy_temp_stencil_op_func,
    /**
     * 正面模板测试和深度测试都通过，该如何操作
     */
    stencilZPassOpFront:sy_temp_stencil_op_func,
    /**
     * 设置正面参与最后写入模板缓冲计算的mask值
     */
    // stencilWriteMaskFront:"stencilWriteMaskFront",
     /**
     * 设置背面模板函数
     */
    stencilFuncBack:sy_temp_ds_func,
    /**
     * 设置背面的模板函数的ref参数
     */
    // stencilRefBack:"stencilRefBack",
    /**
     * 设置背面的模板函数的mask参数
     */
    // stencilMaskBack:"stencilMaskBack",
    /**
     * 背面模板测试失败后该如何操作
     */
    stencilFailOpBack:sy_temp_stencil_op_func,
    /**
     * 背面模板测试通过，深度测试成功，该如何操作
     */
    stencilZFailOpBack:sy_temp_stencil_op_func,
    /**
     * 背面模板测试和深度测试都通过，该如何操作
     */
    stencilZPassOpBack:sy_temp_stencil_op_func,
    /**
     * 设置背面参与最后写入模板缓冲计算的mask值
     */
    // stencilWriteMaskBack:"stencilWriteMaskBack",

    /**
     * 是否开启裁切
     */
    ScissorTest:sy_temp_on_off,

    // cull-mode
    cullMode:sy_temp_cull,
    // primitive-type
    primitiveType:sy_temp_pt,
}

export const StateString = {
    vertexBuffers:"vertexBuffers",
    vertexBufferOffsets:"vertexBufferOffsets",
    textureUnits:"textureUnits",
    
    /**
     * 是否开启alpha混合
     */
    blend:"blend",
    /**
     * 是否是拆分混合函数blendFuncSeparate 不然就使用低级的blendFunc
     */
    blendSep:"blendSep",
    /**
     * 设置常量的混合颜色 r g b a
     * 一般情况，源颜色指的是片元着色器传出的颜色，目标颜色指的是颜色缓冲中的颜色
     * 我们也可以追加指定一个常量，不使用上面提到的两种颜色，或者alpha
     */
    blendColor:"blendColor",
    /**
     * 设置混合颜色计算公式(加 减 逆向减)
     * 默认情况不拆开混合的话，也会设置alpha计算公式
     */
    blendEq:"blendEq",
    /**
     * 设置透明度混合的计算公式
     */
    blendAlphaEq:"blendAlphaEq",
    /**
     * 设置源因子
     */
    blendSrc:"blendSrc",
    /**
     * 设置目标因子
     */
    blendDst:"blendDst",
    /**
     * 设置alpha的源因子
     */
    blendSrcAlpha:"blendSrcAlpha",
    /**
     * 设置alpha的目标因子
     */
    blendDstAlpha:"blendDstAlpha",
    /**
     * 控制是否可以向颜色缓冲写数据
     */
    blendColorMask:"blendColorMask",

    // depth
    /**
     * 是否开启深度测试
     */
    depthTest:"depthTest",
    /**
     * 是否允许深度写入
     */
    depthWrite:"depthWrite",
    /**
     * 设置深度比较函数
     */
    depthFunc:"depthFunc",

    // stencil
    /**
     * 是否开启正面模板测试
     */
    stencilTestFront:"stencilTestFront",
    /**
     * 是否开启背面模板测试
     */
    stencilTestBack:"stencilTestBack",
    stencilSep:"stencilSep",
    /**
     * 设置正面模板函数
     */
    stencilFuncFront:"stencilFuncFront",
    /**
     * 设置正面的模板函数的ref参数
     */
    stencilRefFront:"stencilRefFront",
    /**
     * 设置正面的模板函数的mask参数
     */
    stencilMaskFront:"stencilMaskFront",
    /**
     * 正面模板测试失败后该如何操作
     */
    stencilFailOpFront:"stencilFailOpFront",
    /**
     * 正面模板测试通过，深度测试成功，该如何操作
     */
    stencilZFailOpFront:"stencilZFailOpFront",
    /**
     * 正面模板测试和深度测试都通过，该如何操作
     */
    stencilZPassOpFront:"stencilZPassOpFront",
    /**
     * 设置正面参与最后写入模板缓冲计算的mask值
     */
    stencilWriteMaskFront:"stencilWriteMaskFront",
     /**
     * 设置背面模板函数
     */
    stencilFuncBack:"stencilFuncBack",
    /**
     * 设置背面的模板函数的ref参数
     */
    stencilRefBack:"stencilRefBack",
    /**
     * 设置背面的模板函数的mask参数
     */
    stencilMaskBack:"stencilMaskBack",
    /**
     * 背面模板测试失败后该如何操作
     */
    stencilFailOpBack:"stencilFailOpBack",
    /**
     * 背面模板测试通过，深度测试成功，该如何操作
     */
    stencilZFailOpBack:"stencilZFailOpBack",
    /**
     * 背面模板测试和深度测试都通过，该如何操作
     */
    stencilZPassOpBack:"stencilZPassOpBack",
    /**
     * 设置背面参与最后写入模板缓冲计算的mask值
     */
    stencilWriteMaskBack:"stencilWriteMaskBack",

    /**
     * 是否开启裁切
     */
    ScissorTest:"ScissorTest",

    // cull-mode
    cullMode:"cullMode",
    // primitive-type
    primitiveType:"primitiveType",
    // buffer bindings
    maxStream:"maxStream",
    indexBuffer:"indexBuffer",
    maxTextureSlot:"maxTextureSlot",
    program:"program",
}

/***
 * 渲染状态
 */
export  class State {

    public vertexBuffers;
    public vertexBufferOffsets;
    public textureUnits;

    public blend:boolean;//是否开启混合
    public blendSep:boolean;//是否是拆分混合函数blendFuncSeparate 不然就使用低级的blendFunc
    public blendColor:string;
    public blendEq;
    public blendAlphaEq;
    public blendSrc:number;
    public blendDst:number;
    public blendSrcAlpha:number;
    public blendDstAlpha:number;
    public blendColorMask:number;

    // depth
    public depthTest;
    public depthWrite;
    public depthFunc;

    // stencil
    public stencilTestFront;
    public stencilTestBack;
    public stencilSep;
    public stencilFuncFront;
    public stencilRefFront;
    public stencilMaskFront;
    public stencilFailOpFront;
    public stencilZFailOpFront;
    public stencilZPassOpFront;
    public stencilWriteMaskFront;
    public stencilFuncBack;
    public stencilRefBack;
    public stencilMaskBack;
    public stencilFailOpBack;
    public stencilZFailOpBack;
    public stencilZPassOpBack;
    public stencilWriteMaskBack;

    //裁切测试
    public ScissorTest;

    // cull-mode
    public cullMode;

    // primitive-type
    public primitiveType;

    // buffer bindings
    public maxStream;


    public indexBuffer;

    public maxTextureSlot;


    public program;


    constructor() {
        
        this.set(_default);
    }

    static initDefault(device) {
        // _default.vertexBuffers = new Array(device._caps.maxVertexStreams);
        // _default.vertexBufferOffsets = new Array(device._caps.maxVertexStreams);
        // _default.textureUnits = new Array(device._caps.maxTextureUnits);
    }

    reset() {
        this.set(_default);
    }

    set(cpy) {
        // blending
        this.blend = cpy.blend;
        this.blendSep = cpy.blendSep;
        this.blendColor = cpy.blendColor;
        this.blendEq = cpy.blendEq;
        this.blendAlphaEq = cpy.blendAlphaEq;
        this.blendSrc = cpy.blendSrc;
        this.blendDst = cpy.blendDst;
        this.blendSrcAlpha = cpy.blendSrcAlpha;
        this.blendDstAlpha = cpy.blendDstAlpha;
        this.blendColorMask = cpy.blendColorMask;

        // depth
        this.depthTest = cpy.depthTest;
        this.depthWrite = cpy.depthWrite;
        this.depthFunc = cpy.depthFunc;

        // stencil
        this.stencilTestFront = cpy.stencilTestFront;
        this.stencilTestBack = cpy.stencilTestBack;
        this.stencilSep = cpy.stencilSep;
        this.stencilFuncFront = cpy.stencilFuncFront;
        this.stencilRefFront = cpy.stencilRefFront;
        this.stencilMaskFront = cpy.stencilMaskFront;
        this.stencilFailOpFront = cpy.stencilFailOpFront;
        this.stencilZFailOpFront = cpy.stencilZFailOpFront;
        this.stencilZPassOpFront = cpy.stencilZPassOpFront;
        this.stencilWriteMaskFront = cpy.stencilWriteMaskFront;
        this.stencilFuncBack = cpy.stencilFuncBack;
        this.stencilRefBack = cpy.stencilRefBack;
        this.stencilMaskBack = cpy.stencilMaskBack;
        this.stencilFailOpBack = cpy.stencilFailOpBack;
        this.stencilZFailOpBack = cpy.stencilZFailOpBack;
        this.stencilZPassOpBack = cpy.stencilZPassOpBack;
        this.stencilWriteMaskBack = cpy.stencilWriteMaskBack;

        this.ScissorTest = cpy.ScissorTest;

        // cull-mode
        this.cullMode = cpy.cullMode;

        // primitive-type
        this.primitiveType = cpy.primitiveType;

        // // buffer bindings
        // this.maxStream = cpy.maxStream;
        // for (let i = 0; i < cpy.vertexBuffers.length; ++i) {
        //     this.vertexBuffers[i] = cpy.vertexBuffers[i];
        // }
        // for (let i = 0; i < cpy.vertexBufferOffsets.length; ++i) {
        //     this.vertexBufferOffsets[i] = cpy.vertexBufferOffsets[i];
        // }
        // this.indexBuffer = cpy.indexBuffer;

        // // texture bindings
        // this.maxTextureSlot = cpy.maxTextureSlot;
        // for (let i = 0; i < cpy.textureUnits.length; ++i) {
        //     this.textureUnits[i] = cpy.textureUnits[i];
        // }

        this.program = cpy.program;

    }
}