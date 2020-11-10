"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GLEnums_1 = require("./GLEnums");
var GLapi_1 = require("./GLapi");
var _default = {
    // blend
    blend: false,
    blendSep: false,
    blendColor: 0xffffffff,
    blendEq: GLEnums_1.glblend_func.ADD,
    blendAlphaEq: GLEnums_1.glblend_func.ADD,
    blendSrc: GLEnums_1.glblend.ONE,
    blendDst: GLEnums_1.glblend.ZERO,
    blendSrcAlpha: GLEnums_1.glblend.ONE,
    blendDstAlpha: GLEnums_1.glblend.ZERO,
    // depth
    depthTest: false,
    depthWrite: false,
    depthFunc: GLapi_1.glEnums.DS_FUNC_LESS,
    // stencil
    stencilTest: false,
    stencilSep: false,
    stencilFuncFront: GLapi_1.glEnums.DS_FUNC_ALWAYS,
    stencilRefFront: 0,
    stencilMaskFront: 0xff,
    stencilFailOpFront: GLapi_1.glEnums.STENCIL_OP_KEEP,
    stencilZFailOpFront: GLapi_1.glEnums.STENCIL_OP_KEEP,
    stencilZPassOpFront: GLapi_1.glEnums.STENCIL_OP_KEEP,
    stencilWriteMaskFront: 0xff,
    stencilFuncBack: GLapi_1.glEnums.DS_FUNC_ALWAYS,
    stencilRefBack: 0,
    stencilMaskBack: 0xff,
    stencilFailOpBack: GLapi_1.glEnums.STENCIL_OP_KEEP,
    stencilZFailOpBack: GLapi_1.glEnums.STENCIL_OP_KEEP,
    stencilZPassOpBack: GLapi_1.glEnums.STENCIL_OP_KEEP,
    stencilWriteMaskBack: 0xff,
    // cull-mode
    cullMode: GLapi_1.glEnums.CULL_BACK,
    // primitive-type
    primitiveType: GLapi_1.glEnums.PT_TRIANGLES,
    // bindings
    maxStream: -1,
    vertexBuffers: [],
    vertexBufferOffsets: [],
    indexBuffer: null,
    maxTextureSlot: -1,
    textureUnits: [],
    program: null,
};
var State = /** @class */ (function () {
    function State(device) {
        // bindings
        this.vertexBuffers = new Array(device._caps.maxVertexStreams);
        this.vertexBufferOffsets = new Array(device._caps.maxVertexStreams);
        this.textureUnits = new Array(device._caps.maxTextureUnits);
        this.set(_default);
    }
    State.initDefault = function (device) {
        _default.vertexBuffers = new Array(device._caps.maxVertexStreams);
        _default.vertexBufferOffsets = new Array(device._caps.maxVertexStreams);
        _default.textureUnits = new Array(device._caps.maxTextureUnits);
    };
    State.prototype.reset = function () {
        this.set(_default);
    };
    State.prototype.set = function (cpy) {
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
        // cull-mode
        this.cullMode = cpy.cullMode;
        // primitive-type
        this.primitiveType = cpy.primitiveType;
        // buffer bindings
        this.maxStream = cpy.maxStream;
        for (var i = 0; i < cpy.vertexBuffers.length; ++i) {
            this.vertexBuffers[i] = cpy.vertexBuffers[i];
        }
        for (var i = 0; i < cpy.vertexBufferOffsets.length; ++i) {
            this.vertexBufferOffsets[i] = cpy.vertexBufferOffsets[i];
        }
        this.indexBuffer = cpy.indexBuffer;
        // texture bindings
        this.maxTextureSlot = cpy.maxTextureSlot;
        for (var i = 0; i < cpy.textureUnits.length; ++i) {
            this.textureUnits[i] = cpy.textureUnits[i];
        }
        this.program = cpy.program;
    };
    return State;
}());
exports.default = State;
//# sourceMappingURL=State.js.map