"use strict";
//texture 取值
Object.defineProperty(exports, "__esModule", { value: true });
exports.glTextureChanelTotalBytes = exports.glTextureTotalChanels = exports.glTextureFmtInfor = exports.glFilter = exports.glblend = exports.glblend_func = exports.glbuffer_usage = exports.glindex_buffer_format = exports.gldepth_stencil_func = exports.glstencil_operation = exports.glcull = exports.glrender_buffer_format = exports.glTEXTURE_UNIT_VALID = exports.gltex_filter = void 0;
// texture filter
exports.gltex_filter = {
    NEAREST: 9728,
    LINEAR: 9729,
    //下面是针对缩小的是采用mipmap技术
    NEAREST_MIPMAP_NEAREST: 9984,
    LINEAR_MIPMAP_NEAREST: 9985,
    NEAREST_MIPMAP_LINEAR: 9986,
    LINEAR_MIPMAP_LINEAR: 9987,
};
var _filterGL = [
    [exports.gltex_filter.NEAREST, exports.gltex_filter.NEAREST_MIPMAP_NEAREST, exports.gltex_filter.NEAREST_MIPMAP_LINEAR],
    [exports.gltex_filter.LINEAR, exports.gltex_filter.LINEAR_MIPMAP_NEAREST, exports.gltex_filter.LINEAR_MIPMAP_LINEAR],
];
var _textureFmtGL = [
    // RGB_DXT1: 0
    { format: 6407 /* RGB */, internalFormat: 33776 /* RGB_S3TC_DXT1_EXT */, pixelType: null },
    // RGBA_DXT1: 1
    { format: 6408 /* RGBA */, internalFormat: 33777 /* RGBA_S3TC_DXT1_EXT */, pixelType: null },
    // RGBA_DXT3: 2
    { format: 6408 /* RGBA */, internalFormat: 33778 /* RGBA_S3TC_DXT3_EXT */, pixelType: null },
    // RGBA_DXT5: 3
    { format: 6408 /* RGBA */, internalFormat: 33779 /* RGBA_S3TC_DXT5_EXT */, pixelType: null },
    // RGB_ETC1: 4
    { format: 6407 /* RGB */, internalFormat: 36196 /* RGB_ETC1_WEBGL */, pixelType: null },
    // RGB_PVRTC_2BPPV1: 5
    { format: 6407 /* RGB */, internalFormat: 35841 /* RGB_PVRTC_2BPPV1_IMG */, pixelType: null },
    // RGBA_PVRTC_2BPPV1: 6
    { format: 6408 /* RGBA */, internalFormat: 35843 /* RGBA_PVRTC_2BPPV1_IMG */, pixelType: null },
    // RGB_PVRTC_4BPPV1: 7
    { format: 6407 /* RGB */, internalFormat: 35840 /* RGB_PVRTC_4BPPV1_IMG */, pixelType: null },
    // RGBA_PVRTC_4BPPV1: 8
    { format: 6408 /* RGBA */, internalFormat: 35842 /* RGBA_PVRTC_4BPPV1_IMG */, pixelType: null },
    // A8: 9
    { format: 6406 /* ALPHA */, internalFormat: 6406 /* ALPHA */, pixelType: 5121 /* UNSIGNED_BYTE */ },
    // L8: 10
    { format: 6409 /* LUMINANCE */, internalFormat: 6409 /* LUMINANCE */, pixelType: 5121 /* UNSIGNED_BYTE */ },
    // L8_A8: 11
    { format: 6410 /* LUMINANCE_ALPHA */, internalFormat: 6410 /* LUMINANCE_ALPHA */, pixelType: 5121 /* UNSIGNED_BYTE */ },
    // R5_G6_B5: 12
    { format: 6407 /* RGB */, internalFormat: 6407 /* RGB */, pixelType: 33635 /* UNSIGNED_SHORT_5_6_5 */ },
    // R5_G5_B5_A1: 13
    { format: 6408 /* RGBA */, internalFormat: 6408 /* RGBA */, pixelType: 32820 /* UNSIGNED_SHORT_5_5_5_1 */ },
    // R4_G4_B4_A4: 14
    { format: 6408 /* RGBA */, internalFormat: 6408 /* RGBA */, pixelType: 32819 /* UNSIGNED_SHORT_4_4_4_4 */ },
    // RGB8: 15
    { format: 6407 /* RGB */, internalFormat: 6407 /* RGB */, pixelType: 5121 /* UNSIGNED_BYTE */ },
    // RGBA8: 16
    { format: 6408 /* RGBA */, internalFormat: 6408 /* RGBA */, pixelType: 5121 /* UNSIGNED_BYTE */ },
    // RGB16F: 17
    { format: 6407 /* RGB */, internalFormat: 6407 /* RGB */, pixelType: 36193 /* HALF_FLOAT_OES */ },
    // RGBA16F: 18
    { format: 6408 /* RGBA */, internalFormat: 6408 /* RGBA */, pixelType: 36193 /* HALF_FLOAT_OES */ },
    // RGB32F: 19
    { format: 6407 /* RGB */, internalFormat: 6407 /* RGB */, pixelType: 5126 /* FLOAT */ },
    // RGBA32F: 20
    { format: 6408 /* RGBA */, internalFormat: 6408 /* RGBA */, pixelType: 5126 /* FLOAT */ },
    // R32F: 21
    { format: null, internalFormat: null, pixelType: null },
    // _111110F: 22
    { format: null, internalFormat: null, pixelType: null },
    // SRGB: 23
    { format: null, internalFormat: null, pixelType: null },
    // SRGBA: 24
    { format: null, internalFormat: null, pixelType: null },
    // D16: 25
    { format: 6402 /* DEPTH_COMPONENT */, internalFormat: 6402 /* DEPTH_COMPONENT */, pixelType: 5123 /* UNSIGNED_SHORT */ },
    // D32: 26
    { format: 6402 /* DEPTH_COMPONENT */, internalFormat: 6402 /* DEPTH_COMPONENT */, pixelType: 5125 /* UNSIGNED_INT */ },
    // D24S8: 27
    { format: 6402 /* DEPTH_COMPONENT */, internalFormat: 6402 /* DEPTH_COMPONENT */, pixelType: 5125 /* UNSIGNED_INT */ },
    // RGB_ETC2: 28
    { format: 6407 /* RGB */, internalFormat: 37492 /* RGB8_ETC2 */, pixelType: null },
    // RGBA_ETC2: 29
    { format: 6408 /* RGBA */, internalFormat: 37496 /* RGBA8_ETC2_EAC */, pixelType: null },
];
/**
 * webgl有效的纹理单元
 * 经过测试最大的纹理单元数目是32个
 */
exports.glTEXTURE_UNIT_VALID = [
    "TEXTURE0", "TEXTURE1", "TEXTURE2", "TEXTURE3", "TEXTURE4", "TEXTURE5", "TEXTURE6", "TEXTURE7",
    "TEXTURE8", "TEXTURE9", "TEXTURE10", "TEXTURE11", "TEXTURE12", "TEXTURE13", "TEXTURE14", "TEXTURE15",
    "TEXTURE16", "TEXTURE17", "TEXTURE18", "TEXTURE19", "TEXTURE20", "TEXTURE21", "TEXTURE22", "TEXTURE23",
    "TEXTURE24", "TEXTURE25", "TEXTURE26", "TEXTURE27", "TEXTURE28", "TEXTURE29", "TEXTURE30", "TEXTURE31",
];
// render-buffer format
exports.glrender_buffer_format = {
    RGBA4: 32854,
    RGB5_A1: 32855,
    RGB565: 36194,
    D16: 33189,
    S8: 36168,
    D24S8: 34041,
};
// cull
exports.glcull = {
    NONE: 0,
    FRONT: 1028,
    BACK: 1029,
    FRONT_AND_BACK: 1032,
};
// stencil operation
exports.glstencil_operation = {
    DISABLE: 0,
    ENABLE: 1,
    INHERIT: 2,
    OP_KEEP: 7680,
    OP_ZERO: 0,
    OP_REPLACE: 7681,
    OP_INCR: 7682,
    OP_INCR_WRAP: 34055,
    OP_DECR: 7683,
    OP_DECR_WRAP: 34056,
    OP_INVERT: 5386,
};
// depth and stencil function
// 简写"ds"
exports.gldepth_stencil_func = {
    NEVER: 512,
    LESS: 513,
    EQUAL: 514,
    LEQUAL: 515,
    GREATER: 516,
    NOTEQUAL: 517,
    GEQUAL: 518,
    ALWAYS: 519,
};
// index buffer format
exports.glindex_buffer_format = {
    INDEX_FMT_UINT8: 5121,
    INDEX_FMT_UINT16: 5123,
    INDEX_FMT_UINT32: 5125,
};
// buffer usage
exports.glbuffer_usage = {
    USAGE_STATIC: 35044,
    USAGE_DYNAMIC: 35048,
    USAGE_STREAM: 35040,
};
// blend-func
exports.glblend_func = {
    ADD: 32774,
    SUBTRACT: 32778,
    REVERSE_SUBTRACT: 32779,
};
// blend
exports.glblend = {
    ZERO: 0,
    ONE: 1,
    SRC_COLOR: 768,
    ONE_MINUS_SRC_COLOR: 769,
    DST_COLOR: 774,
    ONE_MINUS_DST_COLOR: 775,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    DST_ALPHA: 772,
    ONE_MINUS_DST_ALPHA: 773,
    CONSTANT_COLOR: 32769,
    ONE_MINUS_CONSTANT_COLOR: 32770,
    CONSTANT_ALPHA: 32771,
    ONE_MINUS_CONSTANT_ALPHA: 32772,
    SRC_ALPHA_SATURATE: 776,
};
/**
 * @method glFilter
 * @param {WebGLContext} gl
 * @param {FILTER_*} filter
 * @param {FILTER_*} mipFilter
 */
function glFilter(gl, filter, mipFilter) {
    if (mipFilter === void 0) { mipFilter = -1; }
    var result = _filterGL[filter][mipFilter + 1];
    if (result === undefined) {
        console.warn("Unknown FILTER: " + filter);
        return mipFilter === -1 ? exports.gltex_filter.LINEAR : exports.gltex_filter.LINEAR_MIPMAP_LINEAR;
    }
    return result;
}
exports.glFilter = glFilter;
/**
 * @method glTextureFmt
 * @param {gltex_format} fmt
 * @return {format,internalFormat,pixelType} result
 */
function glTextureFmtInfor(fmt) {
    var result = _textureFmtGL[fmt];
    if (result === undefined) {
        console.warn("Unknown TEXTURE_FMT: " + fmt);
        return _textureFmtGL[16 /* RGBA8 */];
    }
    return result;
}
exports.glTextureFmtInfor = glTextureFmtInfor;
/*
format                type            通道数 通道总字节数
RGBA         	 UNSIGNED_BYTE	        4	    4
RGB	             UNSIGNED_BYTE	        3	    3
RGBA             UNSIGNED_SHORT_4_4_4_4	4	    2
RGBA         	 UNSIGNED_SHORT_5_5_5_1	4	    2
RGB	             UNSIGNED_SHORT_5_6_5   3	    2
LUMINANCE_ALPHA	 UNSIGNED_BYTE       	2	    2
LUMINANCE   	 UNSIGNED_BYTE      	1	    1
ALPHA       	 UNSIGNED_BYTE       	1	    1
*/
var glformat_type_bytes = {};
glformat_type_bytes[6408 /* RGBA */] = {};
glformat_type_bytes[6407 /* RGB */] = {};
glformat_type_bytes[6410 /* LUMINANCE_ALPHA */] = {};
glformat_type_bytes[6409 /* LUMINANCE */] = {};
glformat_type_bytes[6406 /* ALPHA */] = {};
glformat_type_bytes[6408 /* RGBA */][5121 /* UNSIGNED_BYTE */] = 4;
glformat_type_bytes[6407 /* RGB */][5121 /* UNSIGNED_BYTE */] = 3;
glformat_type_bytes[6408 /* RGBA */][32819 /* UNSIGNED_SHORT_4_4_4_4 */] = 2;
glformat_type_bytes[6408 /* RGBA */][32820 /* UNSIGNED_SHORT_5_5_5_1 */] = 2;
glformat_type_bytes[6407 /* RGB */][33635 /* UNSIGNED_SHORT_5_6_5 */] = 2;
glformat_type_bytes[6410 /* LUMINANCE_ALPHA */][5121 /* UNSIGNED_BYTE */] = 2;
glformat_type_bytes[6409 /* LUMINANCE */][5121 /* UNSIGNED_BYTE */] = 1;
glformat_type_bytes[6406 /* ALPHA */][5121 /* UNSIGNED_BYTE */] = 1;
var glformat_type_chanels = {};
glformat_type_chanels[6408 /* RGBA */] = {};
glformat_type_chanels[6407 /* RGB */] = {};
glformat_type_chanels[6410 /* LUMINANCE_ALPHA */] = {};
glformat_type_chanels[6409 /* LUMINANCE */] = {};
glformat_type_chanels[6406 /* ALPHA */] = {};
glformat_type_chanels[6408 /* RGBA */][5121 /* UNSIGNED_BYTE */] = 4;
glformat_type_chanels[6407 /* RGB */][5121 /* UNSIGNED_BYTE */] = 3;
glformat_type_chanels[6408 /* RGBA */][32819 /* UNSIGNED_SHORT_4_4_4_4 */] = 4;
glformat_type_chanels[6408 /* RGBA */][32820 /* UNSIGNED_SHORT_5_5_5_1 */] = 4;
glformat_type_chanels[6407 /* RGB */][33635 /* UNSIGNED_SHORT_5_6_5 */] = 3;
glformat_type_chanels[6410 /* LUMINANCE_ALPHA */][5121 /* UNSIGNED_BYTE */] = 2;
glformat_type_chanels[6409 /* LUMINANCE */][5121 /* UNSIGNED_BYTE */] = 1;
glformat_type_chanels[6406 /* ALPHA */][5121 /* UNSIGNED_BYTE */] = 1;
/**
 * 获取纹理的通道数
 * @method glTextureChanelTotalBytes
 * @param {gltex_format} fmt
 */
function glTextureTotalChanels(fmt) {
    var result = glTextureFmtInfor(fmt);
    var re = glformat_type_chanels[result.format][result.pixelType];
    if (!re) {
        console.warn("glTextureTotalChanels 报错,", result);
        re = 0;
    }
    return re;
}
exports.glTextureTotalChanels = glTextureTotalChanels;
/**
 * 获取纹理的通道字节数
 * @method glTextureChanelTotalBytes
 * @param {gltex_format} fmt
 */
function glTextureChanelTotalBytes(fmt) {
    var result = glTextureFmtInfor(fmt);
    var re = glformat_type_bytes[result.format][result.pixelType];
    if (!re) {
        console.warn("glTextureChanelTotalBytes 报错,", result);
        re = 0;
    }
    return re;
}
exports.glTextureChanelTotalBytes = glTextureChanelTotalBytes;
//# sourceMappingURL=GLEnums.js.map