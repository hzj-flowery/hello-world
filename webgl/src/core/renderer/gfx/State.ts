import { glblend, glblend_func } from "./GLEnums";
import { glEnums } from "./GLapi";



const _default = {
    // blend
    blend: false,
    blendSep: false,
    blendColor: 0xffffffff,
    blendEq: glblend_func.ADD,
    blendAlphaEq: glblend_func.ADD,
    blendSrc: glblend.ONE,
    blendDst: glblend.ZERO,
    blendSrcAlpha: glblend.ONE,
    blendDstAlpha: glblend.ZERO,

    // depth
    depthTest: false,
    depthWrite: false,
    depthFunc: glEnums.DS_FUNC_LESS,



    // stencil
    stencilTest: false,
    stencilSep: false,
    stencilFuncFront: glEnums.DS_FUNC_ALWAYS,
    stencilRefFront: 0,
    stencilMaskFront: 0xff,
    stencilFailOpFront: glEnums.STENCIL_OP_KEEP,
    stencilZFailOpFront: glEnums.STENCIL_OP_KEEP,
    stencilZPassOpFront: glEnums.STENCIL_OP_KEEP,
    stencilWriteMaskFront: 0xff,
    stencilFuncBack: glEnums.DS_FUNC_ALWAYS,
    stencilRefBack: 0,
    stencilMaskBack: 0xff,
    stencilFailOpBack: glEnums.STENCIL_OP_KEEP,
    stencilZFailOpBack: glEnums.STENCIL_OP_KEEP,
    stencilZPassOpBack: glEnums.STENCIL_OP_KEEP,
    stencilWriteMaskBack: 0xff,

    //Scissor
    ScissorTest:false,

    // cull-mode
    cullMode: glEnums.CULL_BACK,

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

export default class State {

    public vertexBuffers;
    public vertexBufferOffsets;
    public textureUnits;

    public blend;
    public blendSep;
    public blendColor;
    public blendEq;
    public blendAlphaEq;
    public blendSrc;
    public blendDst;
    public blendSrcAlpha;
    public blendDstAlpha;

    // depth
    public depthTest;
    public depthWrite;
    public depthFunc;

    // stencil
    public stencilTest;
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

    public viewPort:any;
    public isSameViewPort(x,y,width,height):boolean{
         if(!this.viewPort)
         {
             return false;
         }
         if(this.viewPort.x==x&&this.viewPort.y == y&&this.viewPort.width == width&&this.viewPort.height == height)
         {
             return true;
         }
         return false;
    }
    public setViewPort(x,y,width,height):void{
        this.viewPort = {};
        this.viewPort.x = x;
        this.viewPort.y = y;
        this.viewPort.width = width;
        this.viewPort.height = height;
    }
    public getViewPort():any{
        return this.viewPort;
    }

    constructor(device) {
        
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

        // depth
        this.depthTest = cpy.depthTest;
        this.depthWrite = cpy.depthWrite;
        this.depthFunc = cpy.depthFunc;

        // stencil
        this.stencilTest = cpy.stencilTest;
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

        this.viewPort = cpy.viewPort;
    }
}