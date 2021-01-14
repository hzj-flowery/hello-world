//texture 取值


// texture filter
export const gltex_filter = {

    NEAREST: 9728,                // gl.NEAREST
    LINEAR: 9729,                 // gl.LINEAR
    //下面是针对缩小的是采用mipmap技术
    NEAREST_MIPMAP_NEAREST: 9984, // gl.NEAREST_MIPMAP_NEAREST
    LINEAR_MIPMAP_NEAREST: 9985,  // gl.LINEAR_MIPMAP_NEAREST
    NEAREST_MIPMAP_LINEAR: 9986,  // gl.NEAREST_MIPMAP_LINEAR
    LINEAR_MIPMAP_LINEAR: 9987,   // gl.LINEAR_MIPMAP_LINEAR
}


export const enum glType{
    // const GL_BYTE = 5120;                  // gl.BYTE
    UNSIGNED_BYTE = 5121,            // gl.UNSIGNED_BYTE
    // const GL_SHORT:5122,                 // gl.SHORT
    UNSIGNED_SHORT = 5123,           // gl.UNSIGNED_SHORT
    UNSIGNED_INT = 5125,             // gl.UNSIGNED_INT
    FLOAT = 5126,                    // gl.FLOAT
    UNSIGNED_SHORT_5_6_5 = 33635,    // gl.UNSIGNED_SHORT_5_6_5
    UNSIGNED_SHORT_4_4_4_4 = 32819,  // gl.UNSIGNED_SHORT_4_4_4_4
    UNSIGNED_SHORT_5_5_5_1 = 32820,  // gl.UNSIGNED_SHORT_5_5_5_1
    HALF_FLOAT_OES = 36193,          // gl.HALF_FLOAT_OES
}


const enum gltex_fmt{
    //texture normal format
    DEPTH_COMPONENT = 6402, // gl.DEPTH_COMPONENT
    ALPHA = 6406,            // gl.ALPHA
    RGB = 6407,              // gl.RGB
    RGBA = 6408,             // gl.RGBA
    LUMINANCE = 6409,        // gl.LUMINANCE
    LUMINANCE_ALPHA = 6410,  // gl.LUMINANCE_ALPHA
    
    //texture compressed format
    RGB_S3TC_DXT1_EXT = 0x83F0,   // ext.COMPRESSED_RGB_S3TC_DXT1_EXT
    RGBA_S3TC_DXT1_EXT = 0x83F1,  // ext.COMPRESSED_RGBA_S3TC_DXT1_EXT
    RGBA_S3TC_DXT3_EXT = 0x83F2,  // ext.COMPRESSED_RGBA_S3TC_DXT3_EXT
    RGBA_S3TC_DXT5_EXT = 0x83F3,  // ext.COMPRESSED_RGBA_S3TC_DXT5_EXT
    RGB_PVRTC_4BPPV1_IMG = 0x8C00,  // ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG
    RGB_PVRTC_2BPPV1_IMG = 0x8C01,  // ext.COMPRESSED_RGB_PVRTC_2BPPV1_IMG
    RGBA_PVRTC_4BPPV1_IMG = 0x8C02, // ext.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG
    RGBA_PVRTC_2BPPV1_IMG = 0x8C03, // ext.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
    RGB_ETC1_WEBGL = 0x8D64, // ext.COMPRESSED_RGB_ETC1_WEBGL
    RGB8_ETC2 = 0x9274,       // ext.COMPRESSED_RGB8_ETC2
    RGBA8_ETC2_EAC = 0x9278,  // ext.COMPRESSED_RGBA8_ETC2_EAC

}


const _filterGL = [
    [gltex_filter.NEAREST, gltex_filter.NEAREST_MIPMAP_NEAREST, gltex_filter.NEAREST_MIPMAP_LINEAR],
    [gltex_filter.LINEAR, gltex_filter.LINEAR_MIPMAP_NEAREST, gltex_filter.LINEAR_MIPMAP_LINEAR],
];


const _textureFmtGL = [
    // RGB_DXT1: 0
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB_S3TC_DXT1_EXT, pixelType: null },

    // RGBA_DXT1: 1
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA_S3TC_DXT1_EXT, pixelType: null },

    // RGBA_DXT3: 2
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA_S3TC_DXT3_EXT, pixelType: null },

    // RGBA_DXT5: 3
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA_S3TC_DXT5_EXT, pixelType: null },

    // RGB_ETC1: 4
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB_ETC1_WEBGL, pixelType: null },

    // RGB_PVRTC_2BPPV1: 5
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB_PVRTC_2BPPV1_IMG, pixelType: null },

    // RGBA_PVRTC_2BPPV1: 6
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA_PVRTC_2BPPV1_IMG, pixelType: null },

    // RGB_PVRTC_4BPPV1: 7
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB_PVRTC_4BPPV1_IMG, pixelType: null },

    // RGBA_PVRTC_4BPPV1: 8
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA_PVRTC_4BPPV1_IMG, pixelType: null },


    // A8: 9
    { format: gltex_fmt.ALPHA, internalFormat: gltex_fmt.ALPHA, pixelType: glType.UNSIGNED_BYTE },

    // L8: 10
    { format: gltex_fmt.LUMINANCE, internalFormat: gltex_fmt.LUMINANCE, pixelType: glType.UNSIGNED_BYTE },

    // L8_A8: 11
    { format: gltex_fmt.LUMINANCE_ALPHA, internalFormat: gltex_fmt.LUMINANCE_ALPHA, pixelType: glType.UNSIGNED_BYTE },

    // R5_G6_B5: 12
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB, pixelType: glType.UNSIGNED_SHORT_5_6_5 },

    // R5_G5_B5_A1: 13
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA, pixelType: glType.UNSIGNED_SHORT_5_5_5_1 },

    // R4_G4_B4_A4: 14
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA, pixelType: glType.UNSIGNED_SHORT_4_4_4_4 },

    // RGB8: 15
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB, pixelType: glType.UNSIGNED_BYTE },

    // RGBA8: 16
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA, pixelType: glType.UNSIGNED_BYTE },

    // RGB16F: 17
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB, pixelType: glType.HALF_FLOAT_OES },

    // RGBA16F: 18
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA, pixelType: glType.HALF_FLOAT_OES },

    // RGB32F: 19
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB, pixelType: glType.FLOAT },

    // RGBA32F: 20
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA, pixelType: glType.FLOAT },

    // R32F: 21
    { format: null, internalFormat: null, pixelType: null },

    // _111110F: 22
    { format: null, internalFormat: null, pixelType: null },

    // SRGB: 23
    { format: null, internalFormat: null, pixelType: null },

    // SRGBA: 24
    { format: null, internalFormat: null, pixelType: null },

    // D16: 25
    { format: gltex_fmt.DEPTH_COMPONENT, internalFormat: gltex_fmt.DEPTH_COMPONENT, pixelType: glType.UNSIGNED_SHORT },

    // D32: 26
    { format: gltex_fmt.DEPTH_COMPONENT, internalFormat: gltex_fmt.DEPTH_COMPONENT, pixelType: glType.UNSIGNED_INT },

    // D24S8: 27
    { format: gltex_fmt.DEPTH_COMPONENT, internalFormat: gltex_fmt.DEPTH_COMPONENT, pixelType: glType.UNSIGNED_INT },

    // RGB_ETC2: 28
    { format: gltex_fmt.RGB, internalFormat: gltex_fmt.RGB8_ETC2, pixelType: null },

    // RGBA_ETC2: 29
    { format: gltex_fmt.RGBA, internalFormat: gltex_fmt.RGBA8_ETC2_EAC, pixelType: null },
];

/**
 * webgl有效的纹理单元
 * 经过测试最大的纹理单元数目是32个
 */
export const glTEXTURE_UNIT_VALID = [
    "TEXTURE0", "TEXTURE1", "TEXTURE2", "TEXTURE3", "TEXTURE4", "TEXTURE5", "TEXTURE6", "TEXTURE7",
    "TEXTURE8", "TEXTURE9", "TEXTURE10", "TEXTURE11", "TEXTURE12", "TEXTURE13", "TEXTURE14", "TEXTURE15",
    "TEXTURE16", "TEXTURE17", "TEXTURE18", "TEXTURE19", "TEXTURE20", "TEXTURE21", "TEXTURE22", "TEXTURE23",
    "TEXTURE24", "TEXTURE25", "TEXTURE26", "TEXTURE27", "TEXTURE28", "TEXTURE29", "TEXTURE30", "TEXTURE31",
]

// vertex attribute semantic
export const enum glvert_attr_semantic{
    POSITION = 'a_position',
    NORMAL = 'a_normal',
    TANGENT = 'a_tangent',
    BITANGENT = 'a_bitangent',
    WEIGHTS = 'a_weights',
    JOINTS = 'a_joints',
    COLOR = 'a_color',//显示节点每一个顶点的颜色颜色
    NODE_Matrix = 'a_Matrix',//节点矩阵
    NODE_COLOR = 'u_color', //节点颜色
    //现阶段场景中只支持三种光
    LIGHT_COLOR = 'u_lightColor',
    LIGHT_COLOR_DIR = 'u_lightColorDir',
    LIGHT_COLOR1 = 'u_lightColor1',
    LIGHT_COLOR_DIR1 = 'u_lightColorDir1',
    LIGHT_COLOR2 = 'u_lightColor2',
    LIGHT_COLOR_DIR2 = 'u_lightColorDir2',
    LIGHT_SPECULAR_COLOR = 'u_specularColor', //高光
    LIGHT_SPECULAR_SHININESS = 'u_shininess' ,//高光指数
    

    UV = 'a_uv',
    UV0 = 'a_uv0',
    UV1 = 'a_uv1',
    UV2 = 'a_uv2',
    UV3 = 'a_uv3',
    UV4 = 'a_uv4',
    UV5 = 'a_uv5',
    UV6 = 'a_uv6',
    UV7 = 'a_uv7',
    CUBE_COORD = 'u_cubeCoord',//立方体纹理单元
    TEX_COORD = 'u_texCoord',    //使用的纹理单元
    TEX_COORD1 = 'u_texCoord1',
    TEX_COORD2 = 'u_texCoord2',
    TEX_COORD3 = 'u_texCoord3',
    TEX_COORD4 = 'u_texCoord4',
    TEX_COORD5 = 'u_texCoord5',
    TEX_COORD6 = 'u_texCoord6',
    TEX_COORD7 = 'u_texCoord7',
    TEX_COORD8 = 'u_texCoord8',
    SKYBOX = "u_skybox",
    
    
    MVMatrix = 'u_MVMatrix',  //视口矩阵*模型世界矩阵
    MMatrix = 'u_MMatrix',    //模型世界矩阵
    MTMatrix = 'u_MTMatrix',    //模型世界矩阵的转置矩阵
    MIMatrix = 'u_MIMatrix',    //模型世界矩阵的逆矩阵
    MITMatrix = 'u_MITMatrix',    //模型世界矩阵的逆矩阵的转置矩阵
    VMatrix = 'u_VMatrix',    //视口矩阵
    PMatrix = 'u_PMatrix',    //投影矩阵
    PVMatrix = 'u_PVMatrix',    //投影*视口矩阵
    PVMatrix_INVERSE = 'u_PVInverseMatrix',    //投影*视口矩阵的逆矩阵
    PVM_MATRIX = "u_PVMMatrix",//投影矩阵*视口矩阵*模型世界矩阵
    PVM_MATRIX_INVERSE = "u_PVMInverseMatrix", //(投影矩阵*视口矩阵*模型世界矩阵)的逆矩阵
    LightWorldPosition =  "u_lightWorldPosition", //光的位置
    CameraWorldPosition = "u_cameraWorldPosition" //相机的位置
}



// texture wrap mode
export const enum gltex_wrap{
    REPEAT = 10497, // gl.REPEAT           平铺式的重复纹理
    CLAMP = 33071,  // gl.CLAMP_TO_EDGE    使用纹理图像边缘值
    MIRROR = 33648, // gl.MIRRORED_REPEAT  镜像对称的重复纹理
}
// texture format
//外部使用
export const enum gltex_config_format {

    // compress formats
    RGB_DXT1 = 0, //0
    RGBA_DXT1,  //1,
    RGBA_DXT3,  //2,
    RGBA_DXT5,  //3,
    RGB_ETC1,  //4,
    RGB_PVRTC_2BPPV1,  //5,
    RGBA_PVRTC_2BPPV1,  //6,
    RGB_PVRTC_4BPPV1,  //7,
    RGBA_PVRTC_4BPPV1,  //8,

    // normal formats
    A8,  //9,
    L8,  //10,
    L8_A8,  //11,
    R5_G6_B5,  //12,
    R5_G5_B5_A1,  //13,
    R4_G4_B4_A4,  //14,
    RGB8,  //15,  常用jpg
    RGBA8,  //16,常用png
    RGB16F,  //17,
    RGBA16F,  //18,
    RGB32F,  //19,
    RGBA32F,  //20,
    R32F,  //21,
    _111110F,  //22,
    SRGB,  //23,
    SRGBA,  //24,

    // depth formats
    D16,  //25,
    D32,  //26,
    D24S8,  //27,

    // etc2 format
    RGB_ETC2,  //28,
    RGBA_ETC2,  //29,

}

// render-buffer format
export const glrender_buffer_format = {
    RGBA4: 32854,    // gl.RGBA4
    RGB5_A1: 32855,  // gl.RGB5_A1
    RGB565: 36194,   // gl.RGB565
    D16: 33189,      // gl.DEPTH_COMPONENT16
    S8: 36168,       // gl.STENCIL_INDEX8
    D24S8: 34041,    // gl.DEPTH_STENCIL
}

// primitive type
export const enum glprimitive_type {

    POINTS = 0,         // gl.POINTS  要绘制一系列的点
    LINES = 1,          // gl.LINES   要绘制了一系列未连接直线段(单独行)
    LINE_LOOP = 2,      // gl.LINE_LOOP  要绘制一系列连接的线段
    LINE_STRIP = 3,     // gl.LINE_STRIP  要绘制一系列连接的线段。它还连接的第一和最后的顶点，以形成一个环
    TRIANGLES = 4,      // gl.TRIANGLES  一系列单独的三角形；绘制方式：（v0,v1,v2）,(v1,v3,v4)
    TRIANGLE_STRIP = 5, // gl.TRIANGLE_STRIP  一系列带状的三角形
    TRIANGLE_FAN = 6,   // gl.TRIANGLE_FAN  扇形绘制方式
}

// cull
export const glcull = {

    NONE: 0,
    FRONT: 1028,
    BACK: 1029,
    FRONT_AND_BACK: 1032,
}

// stencil operation
export const glstencil_operation = {

    DISABLE: 0,             // disable stencil
    ENABLE: 1,              // enable stencil
    INHERIT: 2,             // inherit stencil states

    OP_KEEP: 7680,          // gl.KEEP
    OP_ZERO: 0,             // gl.ZERO
    OP_REPLACE: 7681,       // gl.REPLACE
    OP_INCR: 7682,          // gl.INCR
    OP_INCR_WRAP: 34055,    // gl.INCR_WRAP
    OP_DECR: 7683,          // gl.DECR
    OP_DECR_WRAP: 34056,    // gl.DECR_WRAP
    OP_INVERT: 5386,        // gl.INVERT
}

// depth and stencil function
// 简写"ds"
export const gldepth_stencil_func = {

    NEVER: 512,    // gl.NEVER
    LESS: 513,     // gl.LESS
    EQUAL: 514,    // gl.EQUAL
    LEQUAL: 515,   // gl.LEQUAL
    GREATER: 516,  // gl.GREATER
    NOTEQUAL: 517, // gl.NOTEQUAL
    GEQUAL: 518,   // gl.GEQUAL
    ALWAYS: 519,   // gl.ALWAYS
}

 // index buffer format
export const glindex_buffer_format = {
   
  INDEX_FMT_UINT8: 5121,  // gl.UNSIGNED_BYTE
  INDEX_FMT_UINT16: 5123, // gl.UNSIGNED_SHORT
  INDEX_FMT_UINT32: 5125, // gl.UNSIGNED_INT (OES_element_index_uint)
}

 // buffer usage
export const glbuffer_usage= {
  USAGE_STATIC: 35044,  // gl.STATIC_DRAW
  USAGE_DYNAMIC: 35048, // gl.DYNAMIC_DRAW
  USAGE_STREAM: 35040,  // gl.STREAM_DRAW
}

// blend-func
export const glblend_func = {
    ADD: 32774,              // gl.FUNC_ADD
    SUBTRACT: 32778,         // gl.FUNC_SUBTRACT
    REVERSE_SUBTRACT: 32779, // gl.FUNC_REVERSE_SUBTRACT
}

// blend
export const glblend = {
    ZERO: 0,                          // gl.ZERO
    ONE: 1,                           // gl.ONE
    SRC_COLOR: 768,                   // gl.SRC_COLOR
    ONE_MINUS_SRC_COLOR: 769,         // gl.ONE_MINUS_SRC_COLOR
    DST_COLOR: 774,                   // gl.DST_COLOR
    ONE_MINUS_DST_COLOR: 775,         // gl.ONE_MINUS_DST_COLOR
    SRC_ALPHA: 770,                   // gl.SRC_ALPHA
    ONE_MINUS_SRC_ALPHA: 771,         // gl.ONE_MINUS_SRC_ALPHA
    DST_ALPHA: 772,                   // gl.DST_ALPHA
    ONE_MINUS_DST_ALPHA: 773,         // gl.ONE_MINUS_DST_ALPHA
    CONSTANT_COLOR: 32769,            // gl.CONSTANT_COLOR
    ONE_MINUS_CONSTANT_COLOR: 32770,  // gl.ONE_MINUS_CONSTANT_COLOR
    CONSTANT_ALPHA: 32771,            // gl.CONSTANT_ALPHA
    ONE_MINUS_CONSTANT_ALPHA: 32772,  // gl.ONE_MINUS_CONSTANT_ALPHA
    SRC_ALPHA_SATURATE: 776,          // gl.SRC_ALPHA_SATURATE
}

/**
 * @method glFilter
 * @param {WebGLContext} gl
 * @param {FILTER_*} filter
 * @param {FILTER_*} mipFilter
 */
export function glFilter(gl, filter, mipFilter = -1) {
    let result = _filterGL[filter][mipFilter + 1];
    if (result === undefined) {
        console.warn(`Unknown FILTER: ${filter}`);
        return mipFilter === -1 ? gltex_filter.LINEAR : gltex_filter.LINEAR_MIPMAP_LINEAR;
    }

    return result;
}

/**
 * @method glTextureFmt
 * @param {gltex_config_format} fmt
 * @return {format,internalFormat,pixelType} result
 */
export function glTextureFmtInfor(fmt:gltex_config_format) {
    let result = _textureFmtGL[fmt];
    if (result === undefined) {
        console.warn(`Unknown TEXTURE_FMT: ${fmt}`);
        return _textureFmtGL[gltex_config_format.RGBA8];
    }

    return result;
}

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
const glformat_type_bytes = {};
glformat_type_bytes[gltex_fmt.RGBA] = {};
glformat_type_bytes[gltex_fmt.RGB] = {};
glformat_type_bytes[gltex_fmt.LUMINANCE_ALPHA] = {};
glformat_type_bytes[gltex_fmt.LUMINANCE] = {};
glformat_type_bytes[gltex_fmt.ALPHA] = {};
glformat_type_bytes[gltex_fmt.RGBA][glType.UNSIGNED_BYTE] = 4;
glformat_type_bytes[gltex_fmt.RGB][glType.UNSIGNED_BYTE] = 3;
glformat_type_bytes[gltex_fmt.RGBA][glType.UNSIGNED_SHORT_4_4_4_4] = 2;
glformat_type_bytes[gltex_fmt.RGBA][glType.UNSIGNED_SHORT_5_5_5_1] = 2;
glformat_type_bytes[gltex_fmt.RGB][glType.UNSIGNED_SHORT_5_6_5] = 2;
glformat_type_bytes[gltex_fmt.LUMINANCE_ALPHA][glType.UNSIGNED_BYTE] = 2;
glformat_type_bytes[gltex_fmt.LUMINANCE][glType.UNSIGNED_BYTE] = 1;
glformat_type_bytes[gltex_fmt.ALPHA][glType.UNSIGNED_BYTE] = 1;

const glformat_type_chanels = {};
glformat_type_chanels[gltex_fmt.RGBA] = {};
glformat_type_chanels[gltex_fmt.RGB] = {};
glformat_type_chanels[gltex_fmt.LUMINANCE_ALPHA] = {};
glformat_type_chanels[gltex_fmt.LUMINANCE] = {};
glformat_type_chanels[gltex_fmt.ALPHA] = {};
glformat_type_chanels[gltex_fmt.RGBA][glType.UNSIGNED_BYTE] = 4;
glformat_type_chanels[gltex_fmt.RGB][glType.UNSIGNED_BYTE] = 3;
glformat_type_chanels[gltex_fmt.RGBA][glType.UNSIGNED_SHORT_4_4_4_4] = 4;
glformat_type_chanels[gltex_fmt.RGBA][glType.UNSIGNED_SHORT_5_5_5_1] = 4;
glformat_type_chanels[gltex_fmt.RGB][glType.UNSIGNED_SHORT_5_6_5] = 3;
glformat_type_chanels[gltex_fmt.LUMINANCE_ALPHA][glType.UNSIGNED_BYTE] = 2;
glformat_type_chanels[gltex_fmt.LUMINANCE][glType.UNSIGNED_BYTE] = 1;
glformat_type_chanels[gltex_fmt.ALPHA][glType.UNSIGNED_BYTE] = 1;

/**
 * 获取纹理的通道数
 * @method glTextureChanelTotalBytes
 * @param {gltex_format} fmt
 */
export function glTextureTotalChanels(fmt):number{
    let result =  glTextureFmtInfor(fmt);
    let re = glformat_type_chanels[result.format][result.pixelType];
    if(!re)
    {
        console.warn("glTextureTotalChanels 报错,",result);
        re = 0;
    }
    return re;
}
/**
 * 获取纹理的通道字节数
 * @method glTextureChanelTotalBytes
 * @param {gltex_format} fmt
 */
export function glTextureChanelTotalBytes(fmt):number{
     let result =  glTextureFmtInfor(fmt);
     let re = glformat_type_bytes[result.format][result.pixelType];
     if(!re)
     {
         console.warn("glTextureChanelTotalBytes 报错,",result);
         re = 0;
     }
     return re;
}



