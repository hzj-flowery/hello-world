"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLapi = exports.glEnums = exports.glErrors = void 0;
exports.glErrors = (_a = {},
    _a[1] = { error: "failed to compile shader: ERROR: 0:1 : No prceision specified for (float)",
        reason: "没有在片元着色器中指定float的精度" },
    _a[2] = { error: "类型不匹配", reason: "编程的时候，如果浮点数刚好是0、1等整数值，要注意书写为0.0,1.0，\
    不能省略点，如果直接写0、1等形式，系统会识别为整型数，进行运算的过程中，如果把数据类型搞错可能会报错" },
    _a[3] = { error: "WebGL: INVALID_OPERATION: texImage2D: ArrayBufferView not big enough for request",
        reason: "我们传入的纹理数据和纹理格式不匹配，纹理数据有宽高,纹理格式会决定每一个像素取几个纹理数据" },
    _a);
/**
 * enums
 */
exports.glEnums = {
    // buffer usage
    USAGE_STATIC: 35044,
    USAGE_DYNAMIC: 35048,
    USAGE_STREAM: 35040,
    // index buffer format
    INDEX_FMT_UINT8: 5121,
    INDEX_FMT_UINT16: 5123,
    INDEX_FMT_UINT32: 5125,
    // vertex attribute semantic
    ATTR_POSITION: 'a_position',
    ATTR_NORMAL: 'a_normal',
    ATTR_TANGENT: 'a_tangent',
    ATTR_BITANGENT: 'a_bitangent',
    ATTR_WEIGHTS: 'a_weights',
    ATTR_JOINTS: 'a_joints',
    ATTR_COLOR: 'a_color',
    ATTR_COLOR0: 'a_color0',
    ATTR_COLOR1: 'a_color1',
    ATTR_UV: 'a_uv',
    ATTR_UV0: 'a_uv0',
    ATTR_UV1: 'a_uv1',
    ATTR_UV2: 'a_uv2',
    ATTR_UV3: 'a_uv3',
    ATTR_UV4: 'a_uv4',
    ATTR_UV5: 'a_uv5',
    ATTR_UV6: 'a_uv6',
    ATTR_UV7: 'a_uv7',
    ATTR_TEX_COORD: 'a_texCoord',
    ATTR_TEX_COORD1: 'a_texCoord1',
    ATTR_TEX_COORD2: 'a_texCoord2',
    ATTR_TEX_COORD3: 'a_texCoord3',
    ATTR_TEX_COORD4: 'a_texCoord4',
    ATTR_TEX_COORD5: 'a_texCoord5',
    ATTR_TEX_COORD6: 'a_texCoord6',
    ATTR_TEX_COORD7: 'a_texCoord7',
    ATTR_TEX_COORD8: 'a_texCoord8',
    // vertex attribute type
    ATTR_TYPE_INT8: 5120,
    ATTR_TYPE_UINT8: 5121,
    ATTR_TYPE_INT16: 5122,
    ATTR_TYPE_UINT16: 5123,
    ATTR_TYPE_INT32: 5124,
    ATTR_TYPE_UINT32: 5125,
    ATTR_TYPE_FLOAT32: 5126,
    // texture filter
    FILTER_NEAREST: 0,
    FILTER_LINEAR: 1,
    // texture wrap mode
    WRAP_REPEAT: 10497,
    WRAP_CLAMP: 33071,
    WRAP_MIRROR: 33648,
    // texture format
    // compress formats
    TEXTURE_FMT_RGB_DXT1: 0,
    TEXTURE_FMT_RGBA_DXT1: 1,
    TEXTURE_FMT_RGBA_DXT3: 2,
    TEXTURE_FMT_RGBA_DXT5: 3,
    TEXTURE_FMT_RGB_ETC1: 4,
    TEXTURE_FMT_RGB_PVRTC_2BPPV1: 5,
    TEXTURE_FMT_RGBA_PVRTC_2BPPV1: 6,
    TEXTURE_FMT_RGB_PVRTC_4BPPV1: 7,
    TEXTURE_FMT_RGBA_PVRTC_4BPPV1: 8,
    // normal formats
    TEXTURE_FMT_A8: 9,
    TEXTURE_FMT_L8: 10,
    TEXTURE_FMT_L8_A8: 11,
    TEXTURE_FMT_R5_G6_B5: 12,
    TEXTURE_FMT_R5_G5_B5_A1: 13,
    TEXTURE_FMT_R4_G4_B4_A4: 14,
    TEXTURE_FMT_RGB8: 15,
    TEXTURE_FMT_RGBA8: 16,
    TEXTURE_FMT_RGB16F: 17,
    TEXTURE_FMT_RGBA16F: 18,
    TEXTURE_FMT_RGB32F: 19,
    TEXTURE_FMT_RGBA32F: 20,
    TEXTURE_FMT_R32F: 21,
    TEXTURE_FMT_111110F: 22,
    TEXTURE_FMT_SRGB: 23,
    TEXTURE_FMT_SRGBA: 24,
    // depth formats
    TEXTURE_FMT_D16: 25,
    TEXTURE_FMT_D32: 26,
    TEXTURE_FMT_D24S8: 27,
    // etc2 format
    TEXTURE_FMT_RGB_ETC2: 28,
    TEXTURE_FMT_RGBA_ETC2: 29,
    // depth and stencil function
    DS_FUNC_NEVER: 512,
    DS_FUNC_LESS: 513,
    DS_FUNC_EQUAL: 514,
    DS_FUNC_LEQUAL: 515,
    DS_FUNC_GREATER: 516,
    DS_FUNC_NOTEQUAL: 517,
    DS_FUNC_GEQUAL: 518,
    DS_FUNC_ALWAYS: 519,
    // render-buffer format
    RB_FMT_RGBA4: 32854,
    RB_FMT_RGB5_A1: 32855,
    RB_FMT_RGB565: 36194,
    RB_FMT_D16: 33189,
    RB_FMT_S8: 36168,
    RB_FMT_D24S8: 34041,
    // blend-equation
    BLEND_FUNC_ADD: 32774,
    BLEND_FUNC_SUBTRACT: 32778,
    BLEND_FUNC_REVERSE_SUBTRACT: 32779,
    // blend
    BLEND_ZERO: 0,
    BLEND_ONE: 1,
    BLEND_SRC_COLOR: 768,
    BLEND_ONE_MINUS_SRC_COLOR: 769,
    BLEND_DST_COLOR: 774,
    BLEND_ONE_MINUS_DST_COLOR: 775,
    BLEND_SRC_ALPHA: 770,
    BLEND_ONE_MINUS_SRC_ALPHA: 771,
    BLEND_DST_ALPHA: 772,
    BLEND_ONE_MINUS_DST_ALPHA: 773,
    BLEND_CONSTANT_COLOR: 32769,
    BLEND_ONE_MINUS_CONSTANT_COLOR: 32770,
    BLEND_CONSTANT_ALPHA: 32771,
    BLEND_ONE_MINUS_CONSTANT_ALPHA: 32772,
    BLEND_SRC_ALPHA_SATURATE: 776,
    // stencil operation
    STENCIL_DISABLE: 0,
    STENCIL_ENABLE: 1,
    STENCIL_INHERIT: 2,
    STENCIL_OP_KEEP: 7680,
    STENCIL_OP_ZERO: 0,
    STENCIL_OP_REPLACE: 7681,
    STENCIL_OP_INCR: 7682,
    STENCIL_OP_INCR_WRAP: 34055,
    STENCIL_OP_DECR: 7683,
    STENCIL_OP_DECR_WRAP: 34056,
    STENCIL_OP_INVERT: 5386,
    // cull
    CULL_NONE: 0,
    CULL_FRONT: 1028,
    CULL_BACK: 1029,
    CULL_FRONT_AND_BACK: 1032,
    // primitive type
    PT_POINTS: 0,
    PT_LINES: 1,
    PT_LINE_LOOP: 2,
    PT_LINE_STRIP: 3,
    PT_TRIANGLES: 4,
    PT_TRIANGLE_STRIP: 5,
    PT_TRIANGLE_FAN: 6,
};
var GLapi;
(function (GLapi) {
    //本地opegl上下文
    var gl;
    //此函数务必调用
    function bindGL(glT) {
        gl = glT;
        GLapi.glTEXTURE_MAG_FILTER = gl.TEXTURE_MAG_FILTER;
        GLapi.glTEXTURE_MIN_FILTER = gl.TEXTURE_MIN_FILTER;
    }
    GLapi.bindGL = bindGL;
    /**
 * @method attrTypeBytes
 * @param {ATTR_TYPE_*} attrType
 */
    function attrTypeBytes(attrType) {
        if (attrType === exports.glEnums.ATTR_TYPE_INT8) {
            return 1;
        }
        else if (attrType === exports.glEnums.ATTR_TYPE_UINT8) {
            return 1;
        }
        else if (attrType === exports.glEnums.ATTR_TYPE_INT16) {
            return 2;
        }
        else if (attrType === exports.glEnums.ATTR_TYPE_UINT16) {
            return 2;
        }
        else if (attrType === exports.glEnums.ATTR_TYPE_INT32) {
            return 4;
        }
        else if (attrType === exports.glEnums.ATTR_TYPE_UINT32) {
            return 4;
        }
        else if (attrType === exports.glEnums.ATTR_TYPE_FLOAT32) {
            return 4;
        }
        console.warn("Unknown ATTR_TYPE: " + attrType);
        return 0;
    }
    GLapi.attrTypeBytes = attrTypeBytes;
    /**
     * 将buffer绑定到目标缓冲区
     * @param target
     * GLenum指定结合点（目标）。可能的值：
        gl.ARRAY_BUFFER：包含顶点属性的缓冲区，例如顶点坐标，纹理坐标数据或顶点颜色数据。
        gl.ELEMENT_ARRAY_BUFFER：用于元素索引的缓冲区。
        使用WebGL 2上下文时，还可以使用以下值：
        gl.COPY_READ_BUFFER：用于从一个缓冲区对象复制到另一个缓冲区对象的缓冲区。
        gl.COPY_WRITE_BUFFER：用于从一个缓冲区对象复制到另一个缓冲区对象的缓冲区。
        gl.TRANSFORM_FEEDBACK_BUFFER：用于变换反馈操作的缓冲区。
        gl.UNIFORM_BUFFER：用于存储统一块的缓冲区。
        gl.PIXEL_PACK_BUFFER：用于像素传输操作的缓冲区。
        gl.PIXEL_UNPACK_BUFFER：用于像素传输操作的缓冲区。
     * @param buffer
     */
    function bindBuffer(target, buffer) {
        gl.bindBuffer(target, buffer);
    }
    GLapi.bindBuffer = bindBuffer;
    /**
     * @param mode
     * 枚举类型 指定要渲染的图元类型。可以是以下类型:
        gl.POINTS: 画单独的点。
        gl.LINE_STRIP: 画一条直线到下一个顶点。
        gl.LINE_LOOP: 绘制一条直线到下一个顶点，并将最后一个顶点返回到第一个顶点.
        gl.LINES: 在一对顶点之间画一条线.
        gl.TRIANGLE_STRIP
        gl.TRIANGLE_FAN
        gl.TRIANGLES: 为一组三个顶点绘制一个三角形.
     * @param count
        整数型 指定要渲染的元素数量
     * @param type
        枚举类型 指定元素数组缓冲区中的值的类型。可能的值是:
        gl.UNSIGNED_BYTE
        gl.UNSIGNED_SHORT
        当使用 OES_element_index_uint 扩展时:
        gl.UNSIGNED_INT
     * @param offset
         字节单位 指定元素数组缓冲区中的偏移量。必须是给定类型大小的有效倍数
        @returns
        none
        @error
        如果 mode 不是正确值,  gl.INVALID_ENUM 将会抛出错误异常.
        如果offset 不是给定类型大小的有效倍数, gl.INVALID_OPERATION 将会抛出错误异常.
        如果 count 是负的,  gl.INVALID_VALUE 将会抛出错误异常.
     */
    function drawElements(mode, count, type, offset) {
        gl.drawElements(mode, count, type, offset);
    }
    GLapi.drawElements = drawElements;
    /**
     *
     * @param mode
     * GLenum 类型，指定绘制图元的方式，可能值如下。
        gl.POINTS: 绘制一系列点。
        gl.LINE_STRIP: 绘制一个线条。即，绘制一系列线段，上一点连接下一点。
        gl.LINE_LOOP: 绘制一个线圈。即，绘制一系列线段，上一点连接下一点，并且最后一点与第一个点相连。
        gl.LINES: 绘制一系列单独线段。每两个点作为端点，线段之间不连接。
        gl.TRIANGLE_STRIP：绘制一个三角带。
        gl.TRIANGLE_FAN：绘制一个三角扇。
        gl.TRIANGLES: 绘制一系列三角形。每三个点作为顶点
     * @param first
        GLint 类型 ，指定从哪个点开始绘制
     * @param count
        GLsizei 类型，指定绘制需要使用到多少个点
     @returns
     none
     @error
        如果 mode 不是一个可接受值，将会抛出 gl.INVALID_ENUM 异常。
        如果 first 或者 count 是负值，会抛出 gl.INVALID_VALUE 异常。
        如果 gl.CURRENT_PROGRAM 为 null，会抛出 gl.INVALID_OPERATION 异常
     */
    function drawArrays(mode, first, count) {
        gl.drawArrays(mode, first, count);
    }
    GLapi.drawArrays = drawArrays;
    /*
        // WebGL1:
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView? pixels);
    void gl.texImage2D(target, level, internalformat, format, type, ImageData? pixels);
    void gl.texImage2D(target, level, internalformat, format, type, HTMLImageElement? pixels);
    void gl.texImage2D(target, level, internalformat, format, type, HTMLCanvasElement? pixels);
    void gl.texImage2D(target, level, internalformat, format, type, HTMLVideoElement? pixels);
    void gl.texImage2D(target, level, internalformat, format, type, ImageBitmap? pixels);
    // WebGL2:
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, GLintptr offset);
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, HTMLCanvasElement source);
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, HTMLImageElement source);
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, HTMLVideoElement source);
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ImageBitmap source);
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ImageData source);
    void gl.texImage2D(target, level, internalformat, width, height, border, format, type, ArrayBufferView srcData, srcOffset);
    */
    /**
     *
     * @param target
     *    GLenum 指定纹理的绑定对象.可能的值:
             gl.TEXTURE_2D: 二维纹理贴图.
             gl.TEXTURE_CUBE_MAP_POSITIVE_X:立方体映射纹理的正X面。
             gl.TEXTURE_CUBE_MAP_NEGATIVE_X: 立方体映射纹理的负X面。
             gl.TEXTURE_CUBE_MAP_POSITIVE_Y: 立方体映射纹理的正Y面。
             gl.TEXTURE_CUBE_MAP_NEGATIVE_Y: 立方体映射纹理的负Y面。
             gl.TEXTURE_CUBE_MAP_POSITIVE_Z: 立方体映射纹理的正Z面。
             gl.TEXTURE_CUBE_MAP_NEGATIVE_Z: 立方体映射纹理的负Z面。
     * @param level
     *  GLint 指定详细级别. 0级是基本图像等级，n级是第n个金字塔简化级.
     * @param internalformat
     * @param width
     *  GLsizei 指定纹理的宽度
     * @param height
     * GLsizei 指定纹理的高度
     * @param border
     * GLint 指定纹理的边框宽度。必须为 0
     * @param format
     *  GLenum 指定texel数据格式。在 WebGL 1中，它必须与 internalformat 相同（查看上面). 在WebGL 2中, 这张表中列出了这些组合
     * @param type
     * GLenum 指定texel数据的数据类型。可能的值:
         gl.UNSIGNED_BYTE:  gl.RGBA每个通道8位
         gl.UNSIGNED_SHORT_5_6_5: 5 bits红, 6 bits绿, 5 bits蓝
         gl.UNSIGNED_SHORT_4_4_4_4: 4 bits红, 4 bits绿, 4 bits蓝, 4 alpha bits.
         gl.UNSIGNED_SHORT_5_5_5_1: 5 bits红, 5 bits绿, 5 bits蓝, 1 alpha bit.
         当使用 WEBGL_depth_texture 扩展:
         gl.UNSIGNED_SHORT
         gl.UNSIGNED_INT
         ext.UNSIGNED_INT_24_8_WEBGL (constant provided by the extension)
         当使用 OES_texture_float扩展 :
         gl.FLOAT
         当使用 OES_texture_half_float 扩展:
         ext.HALF_FLOAT_OES (constant provided by the extension)
         当使用 WebGL 2 context,下面的值也是可用的:
         gl.BYTE
         gl.UNSIGNED_SHORT
         gl.SHORT
         gl.UNSIGNED_INT
         gl.INT
         gl.HALF_FLOAT
         gl.FLOAT
         gl.UNSIGNED_INT_2_10_10_10_REV
         gl.UNSIGNED_INT_10F_11F_11F_REV
         gl.UNSIGNED_INT_5_9_9_9_REV
         gl.UNSIGNED_INT_24_8
         gl.FLOAT_32_UNSIGNED_INT_24_8_REV (pixels must be null)
     * @param pixels
     * 下列对象之一可以用作纹理的像素源:
         ArrayBufferView,
         Uint8Array  如果 type 是 gl.UNSIGNED_BYTE则必须使用
         Uint16Array 如果 type 是 gl.UNSIGNED_SHORT_5_6_5, gl.UNSIGNED_SHORT_4_4_4_4, gl.UNSIGNED_SHORT_5_5_5_1, gl.UNSIGNED_SHORT 或ext.HALF_FLOAT_OES则必须使用
         Uint32Array 如果type 是 gl.UNSIGNED_INT 或ext.UNSIGNED_INT_24_8_WEBGL则必须使用
     */
    function texImage2D(target, level, internalformat, width, height, border, format, type, pixels) {
        gl.texImage2D(target, level, internalformat, width, height, border, format, type, pixels);
    }
    GLapi.texImage2D = texImage2D;
    /**
     * 图像预处理函数
     * 规定了图像如何从内存中读出，又或者如何从显存读入内存
     * @param pname
     *  Glenum 类型 ，表示处理的方式。关于该参数可选值，请见下面表格
     * @param param
     *  GLint  类型，表示 pname 处理方式的参数。关于该参数可选值，请见下面表格
     * 支持的平台webgl 1.0,opengl es 2.0
     * pname                                   default            param          des
     * gl.PACK_ALIGNMENT                         4             1, 2, 4, 8       将像素数据打包到内存中（从显存将数据发往内存）
     * gl.UNPACK_ALIGNMENT                       4             1, 2, 4, 8       从内存中解包像素数据(接完以后发往显存)
     * gl.UNPACK_FLIP_Y_WEBGL                    false         true,false       如果为true，则把图片上下对称翻转坐标轴(图片本身不变)
     * gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL         false         true, false      将alpha通道乘以其他颜色通道
     * gl.UNPACK_COLORSPACE_CONVERSION_WEBGL  (gl.BROWSER_DEFAULT_WEBGL) (gl.BROWSER_DEFAULT_WEBGL, gl.NONE) 默认颜色空间转换或无颜色空间转换
     *
     */
    function pixelStorei(pname, param) {
        gl.pixelStorei(pname, param);
    }
    GLapi.pixelStorei = pixelStorei;
    function texParameterf(target, pname, param) {
        gl.texParameterf(target, pname, param);
    }
    GLapi.texParameterf = texParameterf;
    /**
     * 设置纹理过滤的属性
     * 当图片进行一些变换诸如放大缩小等，如何从纹理中取数据
     * @param target
     * GLenum 指定绑定点(目标)。可能的值：
                gl.TEXTURE_2D: 二维纹理.
                gl.TEXTURE_CUBE_MAP: 立方体纹理.
                当使用 WebGL 2 context 时,还可以使用以下值
                gl.TEXTURE_3D: 三维贴图.
                gl.TEXTURE_2D_ARRAY: 二维数组贴图.
     * @param pname
     * @param param
     *
     *  gl.TEXTURE_MAG_FILTER	纹理放大滤波器	gl.LINEAR (默认值), gl.NEAREST.
        gl.TEXTURE_MIN_FILTER	纹理缩小滤波器	gl.LINEAR, gl.NEAREST, gl.NEAREST_MIPMAP_NEAREST, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR (默认值), gl.LINEAR_MIPMAP_LINEAR.
        gl.TEXTURE_WRAP_S	纹理坐标水平填充 s	gl.REPEAT (默认值),gl.CLAMP_TO_EDGE, gl.MIRRORED_REPEAT.
        gl.TEXTURE_WRAP_T	纹理坐标垂直填充 t	gl.REPEAT (默认值),gl.CLAMP_TO_EDGE, gl.MIRRORED_REPEAT.
        Additionally available when using the EXT_texture_filter_anisotropic extension
        ext.TEXTURE_MAX_ANISOTROPY_EXT	纹理最大向异性	 GLfloat 值.
        Additionally available when using a WebGL 2 context
        gl.TEXTURE_BASE_LEVEL	纹理映射等级	任何整型值.
        gl.TEXTURE_COMPARE_FUNC	纹理对比函数	gl.LEQUAL (默认值), gl.GEQUAL, gl.LESS, gl.GREATER, gl.EQUAL, gl.NOTEQUAL, gl.ALWAYS, gl.NEVER.
        gl.TEXTURE_COMPARE_MODE	纹理对比模式	gl.NONE (默认值), gl.COMPARE_REF_TO_TEXTURE.
        gl.TEXTURE_MAX_LEVEL	最大纹理映射数组等级	任何整型值.
        gl.TEXTURE_MAX_LOD	纹理最大细节层次值	任何整型值.
        gl.TEXTURE_MIN_LOD	纹理最小细节层次值	任何浮点型值.
        gl.TEXTURE_WRAP_R	纹理坐标r包装功能	gl.REPEAT (默认值), gl.CLAMP_TO_EDGE, gl.MIRRORED_REPEAT.
        @error
        INVALID_ENUM target不是合法的值。
        INVALID_OPRATION 当前目标上没有绑定纹理对象
     */
    function texParameteri(target, pname, param) {
        gl.texParameteri(target, pname, param);
    }
    GLapi.texParameteri = texParameteri;
    /**
     * 获取shader中attribute下对应的属性位置
     * @param program shader的glID
     * @param name 属性的名字
     * @returns
     * 表明属性位置的下标 GLint 数字，如果找不到该属性则返回-1
     */
    function getAttribLocation(program, name) {
        return gl.getAttribLocation(program, name);
    }
    GLapi.getAttribLocation = getAttribLocation;
    /**
     * 激活顶点属性
     * @param index
     * 类型为GLuint 的索引，指向要激活的顶点属性。如果您只知道属性的名称，不知道索引，
     * 您可以使用以下方法来获取索引getAttribLocation()
     *
     * 特别说明
     * 在WebGL中，作用于顶点的数据会先储存在attributes。
     * 这些数据仅对JavaScript代码和顶点着色器可用。
     * 属性由索引号引用到GPU维护的属性列表中。在不同的平台或GPU上，某些顶点属性索引可能具有预定义的值。
     * 创建属性时，WebGL层会分配其他属性。
       无论怎样，都需要你使用enableVertexAttribArray()方法，来激活每一个属性以便使用，不被激活的属性是不会被使用的。
       一旦激活，以下其他方法就可以获取到属性的值了，
       包括vertexAttribPointer()，vertexAttrib*()，和 getVertexAttrib()
       @error
       您可以使用getError()方法，来检查使用enableVertexAttribArray()时发生的错误。
       WebGLRenderingContext.INVALID_VALUE 非法的 index 。
       一般是 index 大于或等于了顶点属性列表允许的最大值。该值可以通过 WebGLRenderingContext.MAX_VERTEX_ATTRIBS获取
     */
    function enableVertexAttribArray(index) {
        gl.enableVertexAttribArray(index);
    }
    GLapi.enableVertexAttribArray = enableVertexAttribArray;
    /**
     * 方法在给定的索引位置关闭通用顶点属性数组
     * @param index
     * shader 变量的位置
     */
    function disableVertexAttribArray(index) {
        gl.disableVertexAttribArray(index);
    }
    GLapi.disableVertexAttribArray = disableVertexAttribArray;
    /**
     * 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据。
       WebGL API 的WebGLRenderingContext.vertexAttribPointer()方法绑定当前缓冲区范围到gl.ARRAY_BUFFER,
       成为当前顶点缓冲区对象的通用顶点属性并指定它的布局(缓冲区对象中的偏移量)
     * @param index
       指定要修改的顶点属性的索引 其实就是某个attribute变量在shader中的位置
     * @param size
       指定每个顶点属性的组成数量，必须是1，2，3或4
     * @param type
        指定数组中每个元素的数据类型可能是：
            gl.BYTE: signed 8-bit integer, with values in [-128, 127]
            有符号的8位整数，范围[-128, 127]
            gl.SHORT: signed 16-bit integer, with values in [-32768, 32767]
            有符号的16位整数，范围[-32768, 32767]
            gl.UNSIGNED_BYTE: unsigned 8-bit integer, with values in [0, 255]
            无符号的8位整数，范围[0, 255]
            gl.UNSIGNED_SHORT: unsigned 16-bit integer, with values in [0, 65535]
            无符号的16位整数，范围[0, 65535]
            gl.FLOAT: 32-bit IEEE floating point number
            32位IEEE标准的浮点数
            When using a WebGL 2 context, the following values are available additionally:
            使用WebGL2版本的还可以使用以下值：
            gl.HALF_FLOAT: 16-bit IEEE floating point number
            16位IEEE标准的浮点数
     * @param normalized
        当转换为浮点数时是否应该将整数数值归一化到特定的范围。
            For types gl.BYTE and gl.SHORT, normalizes the values to [-1, 1] if true.
            对于类型gl.BYTE和gl.SHORT，如果是true则将值归一化为[-1, 1]
            For types gl.UNSIGNED_BYTE and gl.UNSIGNED_SHORT, normalizes the values to [0, 1] if true.
            对于类型gl.UNSIGNED_BYTE和gl.UNSIGNED_SHORT，如果是true则将值归一化为[0, 1]
            For types gl.FLOAT and gl.HALF_FLOAT, this parameter has no effect.
            对于类型gl.FLOAT和gl.HALF_FLOAT，此参数无效
     * @param stride
        一个GLsizei，以字节为单位指定连续顶点属性开始之间的偏移量(即数组中一行长度)。
        不能大于255。如果stride为0，则假定该属性是紧密打包的，即不交错属性，
        每个属性在一个单独的块中，下一个顶点的属性紧跟当前顶点之后
     * @param offset
         GLintptr指定顶点属性数组中第一部分的字节偏移量。必须是类型的字节长度的倍数

        @error
        A gl.INVALID_VALUE error is thrown if offset is negative.
        如果偏移量为负，则抛出gl.INVALID_VALUE错误。
        A gl.INVALID_OPERATION error is thrown if stride and offset are not multiples of the size of the data type.
        如果stride和offset不是数据类型大小的倍数，则抛出gl.INVALID_OPERATION错误。
        A gl.INVALID_OPERATION error is thrown if no WebGLBuffer is bound to the ARRAY_BUFFER target.
        如果没有将WebGLBuffer绑定到ARRAY_BUFFER目标，则抛出gl.INVALID_OPERATION错误。
        When using a WebGL 2 context
        a gl.INVALID_OPERATION error is thrown if this vertex attribute is defined as a integer in the vertex shader (e.g. uvec4 or ivec4, instead of vec4).
     */
    function vertexAttribPointer(index, size, type, normalized, stride, offset) {
        gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }
    GLapi.vertexAttribPointer = vertexAttribPointer;
    /**
     * 设置缓冲区大小
     * @param target
     * @param size
     * GLsizeiptr 设定Buffer对象的数据存储区大小
     * @param usage
     */
    function bufferDataLength(target, size, usage) {
        gl.bufferData(target, size, usage);
    }
    GLapi.bufferDataLength = bufferDataLength;
    function bufferData(target, srcData, usage) {
        gl.bufferData(target, srcData, usage);
    }
    GLapi.bufferData = bufferData;
    function bufferSubData(target, offset, srcData) {
        gl.bufferSubData(target, offset, srcData);
    }
    GLapi.bufferSubData = bufferSubData;
    /**
     *
     * @param target
     * GLenum 指定Buffer绑定点（目标）。可取以下值：
        gl.ARRAY_BUFFER: 包含顶点属性的Buffer，如顶点坐标，纹理坐标数据或顶点颜色数据。
        gl.ELEMENT_ARRAY_BUFFER: 用于元素索引的Buffer。
        当使用 WebGL 2 context 时，可以使用以下值：
        gl.COPY_READ_BUFFER: 从一个Buffer对象复制到另一个Buffer对象。
        gl.COPY_WRITE_BUFFER: 从一个Buffer对象复制到另一个Buffer对象。
        gl.TRANSFORM_FEEDBACK_BUFFER: 用于转换反馈操作的Buffer。
        gl.UNIFORM_BUFFER: 用于存储统一块的Buffer。
        gl.PIXEL_PACK_BUFFER: 用于像素转换操作的Buffer。
        gl.PIXEL_UNPACK_BUFFER: 用于像素转换操作的Buffer
     * @param srcData
        一个ArrayBuffer，SharedArrayBuffer 或者 ArrayBufferView 类型的数组对象，将被复制到Buffer的数据存储区。
         如果为null，数据存储区仍会被创建，但是不会进行初始化和定义
     * @param usage
         GLenum 指定数据存储区的使用方法。可取以下值：
            gl.STATIC_DRAW: 缓冲区的内容可能经常使用，而不会经常更改。内容被写入缓冲区，但不被读取。
            gl.DYNAMIC_DRAW: 缓冲区的内容可能经常被使用，并且经常更改。内容被写入缓冲区，但不被读取。
            gl.STREAM_DRAW: 缓冲区的内容可能不会经常使用。内容被写入缓冲区，但不被读取。
            当使用 WebGL 2 context 时，可以使用以下值：
            gl.STATIC_READ: 缓冲区的内容可能经常使用，而不会经常更改。内容从缓冲区读取，但不写入。
            gl.DYNAMIC_READ: 缓冲区的内容可能经常使用，并且经常更改。内容从缓冲区读取，但不写入。
            gl.STREAM_READ: 缓冲区的内容可能不会经常使用。内容从缓冲区读取，但不写入。
            gl.STATIC_COPY: 缓冲区的内容可能经常使用，而不会经常更改。用户不会从缓冲区读取内容，也不写入。
            gl.DYNAMIC_COPY: 缓冲区的内容可能经常使用，并且经常更改。用户不会从缓冲区读取内容，也不写入。
            gl.STREAM_COPY: 缓冲区的内容可能不会经常使用。用户不会从缓冲区读取内容，也不写入
     * @param srcOffset
           GLuint 指定读取缓冲时的初始元素索引偏移量
     * @param length
            GLuint 默认为0
        @error
            如果无法创建size指定大小的数据存储区，则会抛出gl.OUT_OF_MEMORY异常。
            如果size是负值，则会抛出gl.INVALID_VALUE异常。
            如果target或usage不属于枚举值之列，则会抛出gl.INVALID_ENUM异常
     */
    function bufferDataForWebgl2(target, srcData, usage, srcOffset, length) {
        //gl.bufferData(target, srcData, usage, srcOffset, length)
    }
    GLapi.bufferDataForWebgl2 = bufferDataForWebgl2;
})(GLapi = exports.GLapi || (exports.GLapi = {}));
//# sourceMappingURL=GLapi.js.map