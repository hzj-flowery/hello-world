"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GLapi_1 = require("./core/renderer/gfx/GLapi");
/**
* _attach
*/
function _attach(gl, location, attachment, face) {
    if (face === void 0) { face = 0; }
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
var Device = /** @class */ (function () {
    function Device() {
        this._width = 0;
        this._height = 0;
        //copy-------------------------------------------------------------------------------------------------
        this._caps = {
            maxVertexStreams: 4,
            maxVertexTextures: 0,
            maxFragUniforms: 0,
            maxTextureUnits: 0,
            maxVertexAttribs: 0,
            maxTextureSize: 0,
            maxDrawBuffers: 0,
            maxColorAttachments: 0
        };
        this._extensions = [];
    }
    ;
    Object.defineProperty(Device, "Instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new Device();
            }
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    Device.prototype.init = function () {
        var canvas = window["canvas"];
        var gl = this.createGLContext(canvas);
        this.gl = gl;
        this.canvas = canvas;
        GLapi_1.GLapi.bindGL(gl);
        canvas.onmousedown = this.onMouseDown.bind(this);
        canvas.onmousemove = this.onMouseMove.bind(this);
        canvas.onmouseup = this.onMouseUp.bind(this);
        this._width = canvas.clientWidth;
        this._height = canvas.clientHeight;
        console.log("画布的尺寸----", this._width, this._height);
        this.initExt();
    };
    Object.defineProperty(Device.prototype, "Width", {
        get: function () {
            return this._width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Device.prototype, "Height", {
        get: function () {
            return this._height;
        },
        enumerable: false,
        configurable: true
    });
    Device.prototype.createGLContext = function (canvas) {
        var names = ["webgl2", "webgl", "experimental-webgl"];
        var context = null;
        for (var i = 0; i < names.length; i++) {
            try {
                console.log("-names---", names[i]);
                context = canvas.getContext(names[i]);
            }
            catch (e) { }
            if (context) {
                break;
            }
        }
        if (context) {
            //添加动态属性记录画布的大小
            context.viewportWidth = canvas.width;
            context.viewportHeight = canvas.height;
        }
        else {
            alert("Failed to create WebGL context!");
        }
        return context;
    };
    Device.prototype.onMouseDown = function (ev) {
        console.log("mouse down--->");
    };
    Device.prototype.onMouseMove = function (ev) {
        // console.log("mouse move--->");
    };
    Device.prototype.onMouseUp = function (ev) {
        console.log("mouse up--->");
    };
    /**
   * @method setFrameBuffer
   * @param {FrameBuffer} fb - null means use the backbuffer
   */
    Device.prototype.setFrameBuffer = function (fb) {
        if (this._framebuffer === fb) {
            return;
        }
        this._framebuffer = fb;
        var gl = this.gl;
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
    };
    Device.prototype.draw = function (sceneData) {
    };
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
    Device.prototype.setViewPort = function (object) {
        this.gl.viewport(object.x, object.y, object.w * this.gl.canvas.width, object.h * this.gl.canvas.height);
    };
    /**
     * Resize a canvas to match the size its displayed.
     * @param {HTMLCanvasElement} canvas The canvas to resize.
     * @param {number} [multiplier] amount to multiply by.
     *    Pass in window.devicePixelRatio for native pixels.
     * @return {boolean} true if the canvas was resized.
     * @memberOf module:webgl-utils
     */
    Device.prototype.resizeCanvasToDisplaySize = function (canvas, multiplier) {
        multiplier = multiplier || 1;
        var width = canvas.clientWidth * multiplier | 0;
        var height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    };
    Device.prototype.initExt = function () {
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
    };
    Device.prototype.handlePrecision = function () {
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
    };
    /**
     * 初始化渲染状态
     */
    Device.prototype._initStates = function () {
        var gl = this.gl;
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
    };
    Device.prototype._initExtensions = function (extensions) {
        var gl = this.gl;
        for (var i = 0; i < extensions.length; ++i) {
            var name_1 = extensions[i];
            var vendorPrefixes = ["", "WEBKIT_", "MOZ_"];
            for (var j = 0; j < vendorPrefixes.length; j++) {
                try {
                    var ext = gl.getExtension(vendorPrefixes[j] + name_1);
                    if (ext) {
                        this._extensions[name_1] = ext;
                        break;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    };
    /**
* @method ext
* @param {string} name
*/
    Device.prototype.ext = function (name) {
        return this._extensions[name];
    };
    Device.prototype._initCaps = function () {
        var gl = this.gl;
        var extDrawBuffers = this.ext('WEBGL_draw_buffers');
        this._caps.maxVertexStreams = 4;
        this._caps.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this._caps.maxFragUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        this._caps.maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this._caps.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        this._caps.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this._caps.maxDrawBuffers = extDrawBuffers ? gl.getParameter(extDrawBuffers.MAX_DRAW_BUFFERS_WEBGL) : 1;
        this._caps.maxColorAttachments = extDrawBuffers ? gl.getParameter(extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
        console.log("this._caps---", this._caps);
    };
    return Device;
}());
exports.default = Device;
//# sourceMappingURL=Device.js.map