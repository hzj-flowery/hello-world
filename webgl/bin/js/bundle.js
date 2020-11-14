var __extends = (this && this.__extends) || (function () {
			var extendStatics = function (d, b) {
				extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
				return extendStatics(d, b);
			};
			return function (d, b) {
				extendStatics(d, b);
				function __() { this.constructor = d; }
				d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
		})();
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        this._isCapture = false;
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
    Device.prototype.getWebglContext = function () {
        return this.canvas.getContext("webgl");
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
    //获取webgl画笔的类型
    Device.prototype.getContextType = function () {
        if (this.gl instanceof WebGL2RenderingContext) {
            return "webgl2";
        }
        else if (this.gl instanceof WebGLRenderingContext) {
            return "webgl";
        }
    };
    //创建webgl画笔
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
        this._isCapture = true;
    };
    Device.prototype.onMouseMove = function (ev) {
    };
    Device.prototype.onMouseUp = function (ev) {
        this._isCapture = false;
    };
    /**
     * 将结果绘制到UI上
     */
    Device.prototype.drawToUI = function (time, scene2D, scene3D) {
        this.gl.clearColor(0.50, 0.50, 0.50, 1.0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, scene2D.getFrameBuffer());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        scene3D.readyDraw(time);
        scene2D.readyDraw(time);
    };
    //将结果绘制到窗口
    Device.prototype.draw2screen = function (time, scene2D, scene3D) {
        this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        scene3D.readyDraw(time);
        // scene2D.readyDraw(time);
        if (this._isCapture) {
            this._isCapture = false;
            this.capture();
        }
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
        localStorage.setItem("zm", "nihaoa");
    };
    /**
     * 截图
     */
    Device.prototype.capture = function () {
        var saveBlob = (function () {
            var a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            return function saveData(blob, fileName) {
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
            };
        }());
        var gl = this.gl;
        gl.canvas.toBlob(function (blob) {
            saveBlob(blob, "screencapture-" + gl.canvas.width + "x" + gl.canvas.height + ".png");
        });
    };
    //剔除某一个面
    /**
     *
     * @param back true 代表剔除背面 false 代表剔除前面
     * @param both 表示前后面都剔除
     */
    Device.prototype.cullFace = function (back, both) {
        if (back === void 0) { back = true; }
        var gl = this.gl;
        gl.enable(gl.CULL_FACE); //开启面剔除功能
        gl.frontFace(gl.CW); //逆时针绘制的代表正面 正常理解，看到的面是正面gl.FRONT，看不到的面是背面gl.BACK
        // gl.frontFace(gl.CCW);//顺时针绘制的代表正面  需要反过来理解，即我们看到的面是背面，看不到的面是正面
        if (both) {
            gl.cullFace(gl.FRONT_AND_BACK); //前后两个面都剔除
        }
        else if (back) {
            gl.cullFace(gl.BACK); //只剔除背面
        }
        else {
            gl.cullFace(gl.FRONT); //只剔除前面
        }
    };
    /**
     * 关闭面剔除功能
     */
    Device.prototype.closeCullFace = function () {
        var gl = this.gl;
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.disable(gl.CULL_FACE);
    };
    return Device;
}());
exports.default = Device;
},{"./core/renderer/gfx/GLapi":6}],2:[function(require,module,exports){
"use strict";
/**
 * 加载管理员
 */
Object.defineProperty(exports, "__esModule", { value: true });
var CacheImageData = /** @class */ (function () {
    function CacheImageData(url, img) {
        this.url = "";
        this.url = url;
        this.img = img;
    }
    return CacheImageData;
}());
function loadFile(url, typeFunc) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("could not load: " + url);
                    }
                    return [4 /*yield*/, response[typeFunc]()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function loadBinary(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, loadFile(url, 'arrayBuffer')];
        });
    });
}
function loadJSON(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, loadFile(url, 'json')];
        });
    });
}
var LoaderManager = /** @class */ (function () {
    function LoaderManager() {
        this._cacheImage = [];
        this._cache = new Map();
    }
    Object.defineProperty(LoaderManager, "instance", {
        get: function () {
            if (!this._instance)
                this._instance = new LoaderManager();
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    //加载gltf动画文件
    LoaderManager.prototype.loadGLTF = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var gltf, baseURL, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, loadJSON(path)];
                    case 1:
                        gltf = _b.sent();
                        baseURL = new URL(path, location.href);
                        _a = gltf;
                        return [4 /*yield*/, Promise.all(gltf.buffers.map(function (buffer) {
                                var url = new URL(buffer.uri, baseURL.href);
                                return loadBinary(url.href);
                            }))];
                    case 2:
                        _a.buffers = _b.sent();
                        this._cache.set(path, gltf);
                        return [2 /*return*/];
                }
            });
        });
    };
    //加载json格式的二进制
    //就是将json转为二进制 然后以二进制读取再转会json
    LoaderManager.prototype.loadJsonBlobData = function (path, callBackProgress, callBackFinish) {
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        //以二进制方式读取数据,读取到的结果将放入Blob的一个对象中存放
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {
                    console.log("bin file---", fr.result);
                    var rawData = new Float32Array(fr.result);
                    var str = "";
                    for (var i = 0; i < rawData.length; i++) {
                        str = str + String.fromCharCode((rawData[i]));
                    }
                    JSON.parse(str);
                    console.log("result --", str);
                    _this._cache.set(path, fr.result);
                    if (callBackFinish)
                        callBackFinish.call(null, fr.result);
                };
            }
        };
    };
    //加载二进制数据
    LoaderManager.prototype.loadBlobData = function (path, callBackProgress, callBackFinish) {
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                fr.onload = function (e) {
                    _this._cache.set(path, fr.result);
                    if (callBackFinish)
                        callBackFinish.call(null, fr.result);
                };
            }
        };
    };
    //加载json数据
    LoaderManager.prototype.loadJsonData = function (path, callBackProgress, callBackFinish) {
        var request = new XMLHttpRequest();
        var _this = this;
        request.open("get", path);
        request.send(null);
        request.responseType = "json";
        request.onload = function () {
            if (request.status == 0) {
                var jsonData = request.response;
                _this._cache.set(path, jsonData);
                if (callBackFinish)
                    callBackFinish.call(null, jsonData);
            }
        };
    };
    //加载可以转化为json的数据
    LoaderManager.prototype.loadJsonStringData = function (path, callBackProgress, callBackFinish) {
        var request = new XMLHttpRequest();
        var _this = this;
        request.open("get", path);
        request.send(null);
        request.responseType = "text";
        request.onload = function () {
            if (request.status == 0) {
                var jsonData = JSON.parse(request.responseText);
                _this._cache.set(path, jsonData);
                if (callBackFinish)
                    callBackFinish.call(null, jsonData);
            }
        };
    };
    //加载骨骼数据
    LoaderManager.prototype.loadSkelData = function (path, callBackProgress, callBackFinish) {
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("get", path);
        request.send(null);
        request.responseType = "blob";
        request.onload = function () {
            if (request.status == 0) {
                var fr = new FileReader(); //FileReader可以读取Blob内容  
                fr.readAsArrayBuffer(request.response); //二进制转换成ArrayBuffer
                // fr.readAsText(request.response);
                fr.onload = function (e) {
                    // console.log("加载二进制成功---",fr.result);
                    _this._cache.set(path, fr.result);
                    // var uint8_msg = new Uint8Array(fr.result as ArrayBuffer);
                    // // 解码成字符串
                    // var decodedString = String.fromCharCode.apply(null, uint8_msg);
                    // console.log("字符串--",decodedString); 
                    // // parse,转成json数据
                    // var data = JSON.parse(decodedString);
                    // console.log(data);
                    // let content = fr.result;//arraybuffer类型数据
                    // let resBlob = new Blob([content])
                    // let reader = new FileReader()
                    // reader.readAsText(resBlob, "utf-8")
                    // reader.onload = () => {
                    //     console.log("gagag---",reader.result);
                    //         let res = JSON.parse(reader.result as string)
                    //         console.log(res);
                    // }
                    if (callBackFinish)
                        callBackFinish.call(null, fr.result);
                };
            }
        };
    };
    //加载图片数据
    LoaderManager.prototype.loadImageData = function (path, callBackProgress, callBackFinish) {
        var img = new Image();
        img.onload = function (img) {
            if (!img) {
                console.log("加载的图片路径不存在---", path);
                return;
            }
            this._cacheImage.push(new CacheImageData(path, img));
            if (callBackFinish)
                callBackFinish.call(null, img);
        }.bind(this, img);
        img.src = path;
    };
    LoaderManager.prototype.getLoadFunc = function (path) {
        var strArr = path.split('.');
        var extName = strArr[strArr.length - 1];
        switch (extName) {
            case "jpg": return this.loadImageData;
            case "png": return this.loadImageData;
            case "bin": return this.loadBlobData;
            //   case "bin":return this.loadJsonBlobData;
            case "json": return this.loadJsonData;
            case "gltf": return this.loadJsonStringData;
            case "skel": return this.loadSkelData;
            default:
                console.log("发现未知后缀名的文件----", path);
                null;
                break;
        }
    };
    //加载数据
    LoaderManager.prototype.loadData = function (arr, callBackProgress, callBackFinish) {
        return __awaiter(this, void 0, void 0, function () {
            var count, j, path, loadFunc;
            var _this_1 = this;
            return __generator(this, function (_a) {
                count = 0;
                for (j = 0; j < arr.length; j++) {
                    path = arr[j];
                    loadFunc = this.getLoadFunc(path);
                    loadFunc.call(this, path, null, function (res) {
                        count++;
                        _this_1.onLoadProgress(count / arr.length);
                        if (count == arr.length) {
                            _this_1.onLoadFinish();
                            if (callBackFinish)
                                callBackFinish();
                        }
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    //获取缓存中的数据
    LoaderManager.prototype.getCacheData = function (url) {
        console.log(url, this._cache.has(url));
        return this._cache.get(url);
    };
    /**
     * 获取缓存的纹理数据
     * @param url
     */
    LoaderManager.prototype.getCacheImage = function (url) {
        for (var j = 0; j < this._cacheImage.length; j++) {
            var data = this._cacheImage[j];
            if (data.url == url)
                return data.img;
        }
        return null;
    };
    /**
     * 移除CPU端内存中的图片缓存
     * @param url
     */
    LoaderManager.prototype.removeImage = function (url) {
        var index = -1;
        var img;
        for (var j = 0; j < this._cacheImage.length; j++) {
            var data = this._cacheImage[j];
            if (data.url == url) {
                index = j;
                img = data.img;
                break;
            }
        }
        if (index >= 0) {
            console.log("解除引用");
            this._cacheImage.splice(index, 1);
            this.releaseCPUMemoryForImageCache(img);
        }
        else {
            console.log("没找到----", img, index);
        }
    };
    /**
     *
     * @param img
     * 释放CPU端内存中的图片缓存
     */
    LoaderManager.prototype.releaseCPUMemoryForImageCache = function (img) {
        img.src = "";
        img = null;
    };
    LoaderManager.prototype.onLoadProgress = function (progress) {
        console.log("加载进度---------", progress);
    };
    LoaderManager.prototype.onLoadFinish = function () {
        console.log("加载完成啦");
    };
    return LoaderManager;
}());
exports.default = LoaderManager;
},{}],3:[function(require,module,exports){
"use strict";
//第1步 - 准备Canvas和获取WebGL的渲染上下文
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("./Device");
var LoaderManager_1 = require("./LoaderManager");
var Shader_1 = require("./core/renderer/shader/Shader");
var CameraTest_1 = require("./core/renderer/3d/CameraTest");
Device_1.default.Instance.init();
Shader_1.G_ShaderFactory.init(Device_1.default.Instance.gl);
//testWebl_Label.run();
//LightTest.run();
// skyBoxTest.run();
// SkinTes1.run();
var arr = [
    "res/models/killer_whale/whale.CYCLES.bin",
    "res/models/killer_whale/whale.CYCLES.gltf",
    "res/models/HeadData/head.json",
    "res/8x8-font.png",
    "res/wood.jpg",
    "res/tree.jpg",
    "res/ground.jpg",
    "res/wicker.jpg"
];
// ThreeDTexture.run();
// LabelTest.run();
// ShaderShadowTest.run();
// Stage.run();
// EarthSunTest.run();
// RobartTest.run();
// CaptureTest.run();
// CameraTest.run();
// TextureTest.run();
// SpeedTest.run();
//  HaiTwn1.run();
// ThreeDLightTest.run();
// SpotLightTest.run();
// PointLightTest.run();
// FogTest.run();
LoaderManager_1.default.instance.loadData(arr, null, function () {
    // debugger;
    // new RenderFlow().startup();
    // RampTextureTest.run();
    CameraTest_1.default.run();
});
},{"./Device":1,"./LoaderManager":2,"./core/renderer/3d/CameraTest":4,"./core/renderer/shader/Shader":7}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("../../../Device");
var Shader_1 = require("../shader/Shader");
var vertexshader3d = 'attribute vec4 a_position;' +
    'attribute vec4 a_color;' +
    'uniform mat4 u_matrix;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_Position = u_matrix * a_position;' +
    'v_color = a_color;' +
    '}';
var fragmentshader3d = 'precision mediump float;' +
    'varying vec4 v_color;' +
    'void main() {' +
    'gl_FragColor = v_color;' +
    '}';
var solidcolorvertexshader = 'attribute vec4 a_position;' +
    'uniform mat4 u_matrix;' +
    'void main() {' +
    'gl_Position = u_matrix * a_position;' +
    '}';
var solidcolorfragmentshader = 'precision mediump float;' +
    'uniform vec4 u_color;' +
    'void main() {' +
    'gl_FragColor = u_color;' +
    '}';
function main() {
    var m4 = window["m4"];
    var gl = Device_1.default.Instance.gl;
    var primitives = window["primitives"];
    var webglLessonsUI = window["webglLessonsUI"];
    if (!gl) {
        return;
    }
    // setup GLSL programs
    // compiles shaders, links program, looks up locations
    var vertexColorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(vertexshader3d, fragmentshader3d);
    var solidColorProgramInfo = Shader_1.G_ShaderFactory.createProgramInfo(solidcolorvertexshader, solidcolorfragmentshader);
    // create buffers and fill with data for a 3D 'F'
    var fBufferInfo = primitives.create3DFBufferInfo(gl);
    function createClipspaceCubeBufferInfo(gl) {
        // first let's add a cube. It goes from 1 to 3
        // because cameras look down -Z so we want
        // the camera to start at Z = 0. We'll put a
        // a cone in front of this cube opening
        // toward -Z
        var positions = [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
        ];
        var indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays({
            position: positions,
            indices: indices,
        });
    }
    // create geometry for a camera
    function createCameraBufferInfo(gl, scale) {
        if (scale === void 0) { scale = 1; }
        // first let's add a cube. It goes from 1 to 3
        // because cameras look down -Z so we want
        // the camera to start at Z = 0.
        // We'll put a cone in front of this cube opening
        // toward -Z
        var positions = [
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            -1, -1, 3,
            1, -1, 3,
            -1, 1, 3,
            1, 1, 3,
            0, 0, 1,
        ];
        var indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];
        // add cone segments
        var numSegments = 6;
        var coneBaseIndex = positions.length / 3;
        var coneTipIndex = coneBaseIndex - 1;
        for (var i = 0; i < numSegments; ++i) {
            var u = i / numSegments;
            var angle = u * Math.PI * 2;
            var x = Math.cos(angle);
            var y = Math.sin(angle);
            positions.push(x, y, 0);
            // line from tip to edge
            indices.push(coneTipIndex, coneBaseIndex + i);
            // line from point on edge to next point on edge
            indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
        }
        positions.forEach(function (v, ndx) {
            positions[ndx] *= scale;
        });
        return Shader_1.G_ShaderFactory.createBufferInfoFromArrays({
            position: positions,
            indices: indices,
        });
    }
    var cameraScale = 20;
    var cameraBufferInfo = createCameraBufferInfo(gl, cameraScale);
    var clipspaceCubeBufferInfo = createClipspaceCubeBufferInfo(gl);
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var settings = {
        rotation: 150,
        cam1FieldOfView: 60,
        cam1PosX: 0,
        cam1PosY: 0,
        cam1PosZ: -200,
        cam1Near: 30,
        cam1Far: 500,
        cam1Ortho: true,
        cam1OrthoUnits: 120,
    };
    webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
        { type: 'slider', key: 'rotation', min: 0, max: 360, change: render, precision: 2, step: 0.001, },
        { type: 'slider', key: 'cam1FieldOfView', min: 1, max: 170, change: render, },
        { type: 'slider', key: 'cam1PosX', min: -200, max: 200, change: render, },
        { type: 'slider', key: 'cam1PosY', min: -200, max: 200, change: render, },
        { type: 'slider', key: 'cam1PosZ', min: -200, max: 200, change: render, },
        { type: 'slider', key: 'cam1Near', min: 1, max: 500, change: render, },
        { type: 'slider', key: 'cam1Far', min: 1, max: 500, change: render, },
        { type: 'checkbox', key: 'cam1Ortho', change: render, },
        { type: 'slider', key: 'cam1OrthoUnits', min: 1, max: 150, change: render, },
    ]);
    function drawScene(projectionMatrix, cameraMatrix, worldMatrix) {
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);
        var mat = m4.multiply(projectionMatrix, viewMatrix);
        mat = m4.multiply(mat, worldMatrix);
        gl.useProgram(vertexColorProgramInfo.spGlID);
        // ------ Draw the F --------
        // Setup all the needed attributes.
        Shader_1.G_ShaderFactory.setBuffersAndAttributes(vertexColorProgramInfo.attrSetters, fBufferInfo);
        // Set the uniforms
        Shader_1.G_ShaderFactory.setUniforms(vertexColorProgramInfo.uniSetters, {
            u_matrix: mat,
        });
        Shader_1.G_ShaderFactory.drawBufferInfo(fBufferInfo);
    }
    function render() {
        Device_1.default.Instance.resizeCanvasToDisplaySize(gl.canvas);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.SCISSOR_TEST);
        // we're going to split the view in 2
        var effectiveWidth = gl.canvas.width / 2;
        var aspect = effectiveWidth / gl.canvas.height;
        var near = 1;
        var far = 2000;
        // Compute a projection matrix
        var halfHeightUnits = 120;
        var perspectiveProjectionMatrix = settings.cam1Ortho
            ? m4.orthographic(-settings.cam1OrthoUnits * aspect, // left
            settings.cam1OrthoUnits * aspect, // right
            -settings.cam1OrthoUnits, // bottom
            settings.cam1OrthoUnits, // top
            settings.cam1Near, settings.cam1Far)
            : m4.perspective(degToRad(settings.cam1FieldOfView), aspect, settings.cam1Near, settings.cam1Far);
        // Compute the camera's matrix using look at.
        var cameraPosition = [
            settings.cam1PosX,
            settings.cam1PosY,
            settings.cam1PosZ,
        ];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);
        var worldMatrix = m4.yRotation(degToRad(settings.rotation));
        worldMatrix = m4.xRotate(worldMatrix, degToRad(settings.rotation));
        // center the 'F' around its origin
        worldMatrix = m4.translate(worldMatrix, -35, -75, -5);
        var _a = gl.canvas, width = _a.width, height = _a.height;
        var leftWidth = width / 2 | 0;
        // draw on the left with orthographic camera
        gl.viewport(0, 0, leftWidth, height);
        gl.scissor(0, 0, leftWidth, height);
        gl.clearColor(1, 0.8, 0.8, 1);
        //将相机中的物体单独拿出来绘制
        drawScene(perspectiveProjectionMatrix, cameraMatrix, worldMatrix);
        // draw on right with perspective camera
        var rightWidth = width - leftWidth;
        gl.viewport(leftWidth, 0, rightWidth, height);
        gl.scissor(leftWidth, 0, rightWidth, height);
        gl.clearColor(0.8, 0.8, 1, 1);
        var perspectiveProjectionMatrix2 = m4.perspective(degToRad(60), aspect, near, far);
        // Compute the camera's matrix using look at.
        var cameraPosition2 = [-600, 400, -400];
        var target2 = [0, 0, 0];
        var cameraMatrix2 = m4.lookAt(cameraPosition2, target2, up);
        //绘制相机中的物体
        drawScene(perspectiveProjectionMatrix2, cameraMatrix2, worldMatrix);
        // draw object to represent first camera
        {
            // Make a view matrix from the camera matrix.
            var viewMatrix = m4.inverse(cameraMatrix2);
            var mat = m4.multiply(perspectiveProjectionMatrix2, viewMatrix);
            // use the first's camera's matrix as the matrix to position
            // the camera's representative in the scene
            mat = m4.multiply(mat, cameraMatrix);
            gl.useProgram(solidColorProgramInfo.spGlID);
            // ------ Draw the Camera Representation --------绘制相机模型
            // Setup all the needed attributes.
            Shader_1.G_ShaderFactory.setBuffersAndAttributes(solidColorProgramInfo.attrSetters, cameraBufferInfo);
            // Set the uniforms
            Shader_1.G_ShaderFactory.setUniforms(solidColorProgramInfo.uniSetters, {
                u_matrix: mat,
                u_color: [1, 0, 0, 1],
            });
            Shader_1.G_ShaderFactory.drawBufferInfo(cameraBufferInfo, gl.LINES);
            // ----- Draw the frustum ------- 绘制齐次裁切空间坐标系
            mat = m4.multiply(mat, m4.inverse(perspectiveProjectionMatrix));
            // Setup all the needed attributes.
            Shader_1.G_ShaderFactory.setBuffersAndAttributes(solidColorProgramInfo.attrSetters, clipspaceCubeBufferInfo);
            // Set the uniforms
            Shader_1.G_ShaderFactory.setUniforms(solidColorProgramInfo.uniSetters, {
                u_matrix: mat,
                u_color: [0, 1, 0, 1],
            });
            Shader_1.G_ShaderFactory.drawBufferInfo(clipspaceCubeBufferInfo, gl.LINES);
        }
    }
    render();
}
var CameraTest = /** @class */ (function () {
    function CameraTest() {
    }
    CameraTest.run = function () {
        main();
    };
    return CameraTest;
}());
exports.default = CameraTest;
},{"../../../Device":1,"../shader/Shader":7}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shader = exports.G_ShaderFactory = exports.BufferAttribsData = exports.ShaderData = void 0;
var GLEnums_1 = require("../gfx/GLEnums");
var GLapi_1 = require("../gfx/GLapi");
var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["VERTEX"] = 1] = "VERTEX";
    ShaderType[ShaderType["FRAGMENT"] = 2] = "FRAGMENT";
})(ShaderType || (ShaderType = {}));
var vertextBaseCode = 'attribute vec3 a_position;' +
    'attribute vec3 a_normal;' +
    'attribute vec2 a_uv;' +
    'uniform mat4 u_MVMatrix;' +
    'uniform mat4 u_PMatrix;' +
    'uniform mat4 u_MMatrix;' +
    'uniform mat4 u_VMatrix;' +
    'varying vec3 v_normal;' +
    'varying vec2 v_uv;' +
    'void main() {' +
    'gl_Position = u_PMatrix * u_MVMatrix * vec4(a_position, 1.0);' +
    'v_uv = a_uv;' +
    '}';
//基础的shader的片段着色器
var fragBaseCode = 'precision mediump float;' +
    'varying vec2 v_uv;' +
    'uniform samplerCube u_skybox;' +
    'uniform sampler2D u_texCoord;' +
    'uniform mat4 u_PVM_Matrix_Inverse;' +
    'uniform vec4 u_color;' +
    'uniform vec4 u_color_dir;' +
    'void main() {' +
    'gl_FragColor = texture2D(u_texCoord, v_uv);' +
    '}';
var ShaderData = /** @class */ (function () {
    function ShaderData(spGLID, index) {
        this._textureUnit = 0;
        this._index = -1;
        this._spGLID = spGLID;
        this._textureUnit = 0;
        this._index = index;
    }
    Object.defineProperty(ShaderData.prototype, "spGlID", {
        get: function () {
            return this._spGLID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderData.prototype, "textureUnit", {
        get: function () {
            return this._textureUnit;
        },
        enumerable: false,
        configurable: true
    });
    ShaderData.prototype.addTextureUnit = function () {
        var before = this._textureUnit;
        this._textureUnit++;
        return before;
    };
    Object.defineProperty(ShaderData.prototype, "uniSetters", {
        get: function () {
            return this._uniformSetters;
        },
        set: function (set) {
            this._uniformSetters = set;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderData.prototype, "attrSetters", {
        get: function () {
            return this._attribSetters;
        },
        set: function (set) {
            this._attribSetters = set;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderData.prototype, "Index", {
        get: function () {
            return this._index;
        },
        enumerable: false,
        configurable: true
    });
    return ShaderData;
}());
exports.ShaderData = ShaderData;
var BufferAttribsData = /** @class */ (function () {
    function BufferAttribsData(attribs, numElements, indices) {
        this.attribs = attribs;
        this.numElements = numElements;
        this.indices = indices;
    }
    return BufferAttribsData;
}());
exports.BufferAttribsData = BufferAttribsData;
/**
 * shader工厂
 */
var ShaderFactory = /** @class */ (function () {
    function ShaderFactory() {
        this.texcoordRE = /coord|texture/i;
        this.colorRE = /color|colour/i;
        /**
         * tries to get the number of elements from a set of arrays.
         */
        this.positionKeys = ['position', 'positions', 'a_position'];
    }
    ShaderFactory.prototype.init = function (gl) {
        this._gl = gl;
        this._shaderData = [];
    };
    /**
     * 获取一个shaderData
     * @param index
     */
    ShaderFactory.prototype.getShareDataByIndex = function (index) {
        var ret;
        this._shaderData.forEach(function (value, index) {
            if (value.Index == index) {
                ret = value;
            }
        });
        return ret;
    };
    /**
     * 获取一个shaderData
     * @param glID
     */
    ShaderFactory.prototype.getShareDataByGlID = function (glID) {
        var ret;
        this._shaderData.forEach(function (value, index) {
            if (value.spGlID == glID) {
                ret = value;
            }
        });
        return ret;
    };
    /**
     * 生成一个shaderData
     * @param GLID
     * @param textureUnit
     * @param USet
     * @param ASet
     */
    ShaderFactory.prototype.createShaderData = function (GLID) {
        var ret = this.getShareDataByGlID(GLID);
        if (ret == null) {
            var index = this._shaderData.length;
            var res = new ShaderData(GLID, index);
            this._shaderData.push(res);
            return res;
        }
        return ret;
    };
    /**
    *
    * @param shaderType shader的类型 1代表顶点着色器 2代表像素着色器
    * @param shaderSource shader的源码
    */
    ShaderFactory.prototype.loadShader = function (shaderType, shaderSource) {
        // 创建着色器
        var shader;
        if (shaderType == ShaderType.FRAGMENT) {
            shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        }
        else if (shaderType == ShaderType.VERTEX) {
            shader = this._gl.createShader(this._gl.VERTEX_SHADER);
        }
        else {
            return null;
        }
        // 编译着色器
        this._gl.shaderSource(shader, shaderSource);
        this._gl.compileShader(shader);
        // 判断编译是否成功
        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            alert(this._gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
    /**
     *
     * @param vertextCode 顶点shader
     * @param fragCode 片段shader
     */
    ShaderFactory.prototype.createShader = function (vertextCode, fragCode) {
        if (vertextCode === void 0) { vertextCode = vertextBaseCode; }
        if (fragCode === void 0) { fragCode = fragBaseCode; }
        // 从 DOM 上创建对应的着色器
        var vertexShader = this.loadShader(ShaderType.VERTEX, vertextCode);
        var fragmentShader = this.loadShader(ShaderType.FRAGMENT, fragCode);
        // 创建程序并连接着色器
        var shaderGLID = this._gl.createProgram();
        this._gl.attachShader(shaderGLID, vertexShader);
        this._gl.attachShader(shaderGLID, fragmentShader);
        this._gl.linkProgram(shaderGLID);
        // 连接失败的检测
        if (!this._gl.getProgramParameter(shaderGLID, this._gl.LINK_STATUS)) {
            alert("Failed to setup shaders");
        }
        return shaderGLID;
    };
    ShaderFactory.prototype.onCreateShader = function () {
    };
    ShaderFactory.prototype.destroyShder = function (shaderProgram) {
    };
    ShaderFactory.prototype.createAttribSetter = function (index) {
        var gl = this._gl;
        return function (b) {
            if (b.value) {
                gl.disableVertexAttribArray(index);
                switch (b.value.length) {
                    case 4:
                        gl.vertexAttrib4fv(index, b.value);
                        break;
                    case 3:
                        gl.vertexAttrib3fv(index, b.value);
                        break;
                    case 2:
                        gl.vertexAttrib2fv(index, b.value);
                        break;
                    case 1:
                        gl.vertexAttrib1fv(index, b.value);
                        break;
                    default:
                        throw new Error('the length of a float constant value must be between 1 and 4!');
                }
            }
            else {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
            }
        };
    };
    ShaderFactory.prototype.createAttributeSetters = function (shaderData) {
        var gl = this._gl;
        var program = shaderData.spGlID;
        var attribSetters = {};
        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
            var attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo) {
                break;
            }
            var index = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = this.createAttribSetter(index);
        }
        return attribSetters;
    };
    /**
   * Returns the corresponding bind point for a given sampler type
   */
    ShaderFactory.prototype.getBindPointForSamplerType = function (gl, type) {
        if (type === gl.SAMPLER_2D)
            return gl.TEXTURE_2D; // eslint-disable-line
        if (type === gl.SAMPLER_CUBE)
            return gl.TEXTURE_CUBE_MAP; // eslint-disable-line
        return undefined;
    };
    /**
       * Creates a setter for a uniform of the given program with it's
       * location embedded in the setter.
       * @param {WebGLProgram} program
       * @param {WebGLUniformInfo} uniformInfo
       * @returns {function} the created setter.
       */
    ShaderFactory.prototype.createUniformSetter = function (uniformInfo, shaderData) {
        var gl = this._gl;
        var program = shaderData.spGlID;
        var location = gl.getUniformLocation(program, uniformInfo.name);
        var type = uniformInfo.type;
        // Check if this uniform is an array
        var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        if (type === gl.FLOAT && isArray) {
            return function (v) {
                gl.uniform1fv(location, v);
            };
        }
        if (type === gl.FLOAT) {
            return function (v) {
                gl.uniform1f(location, v);
            };
        }
        if (type === gl.FLOAT_VEC2) {
            return function (v) {
                gl.uniform2fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC3) {
            return function (v) {
                gl.uniform3fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC4) {
            return function (v) {
                gl.uniform4fv(location, v);
            };
        }
        if (type === gl.INT && isArray) {
            return function (v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.INT) {
            return function (v) {
                gl.uniform1i(location, v);
            };
        }
        if (type === gl.INT_VEC2) {
            return function (v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.INT_VEC3) {
            return function (v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.INT_VEC4) {
            return function (v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.BOOL) {
            return function (v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC2) {
            return function (v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC3) {
            return function (v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC4) {
            return function (v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.FLOAT_MAT2) {
            return function (v) {
                gl.uniformMatrix2fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT3) {
            return function (v) {
                gl.uniformMatrix3fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT4) {
            return function (v) {
                gl.uniformMatrix4fv(location, false, v);
            };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            var units = [];
            for (var ii = 0; ii < uniformInfo.size; ++ii) {
                units.push(shaderData.addTextureUnit());
            }
            return function (bindPoint, units) {
                return function (textures) {
                    gl.uniform1iv(location, units);
                    textures.forEach(function (texture, index) {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        gl.bindTexture(bindPoint, texture);
                    });
                };
            }(this.getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function (bindPoint, unit) {
                return function (texture) {
                    gl.uniform1i(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(bindPoint, texture);
                };
            }(this.getBindPointForSamplerType(gl, type), shaderData.addTextureUnit());
        }
        throw ('unknown type: 0x' + type.toString(16)); // we should never get here.
    };
    /**
     * uniform变量设置器
     */
    ShaderFactory.prototype.createUniformSetters = function (shaderData) {
        var program = shaderData.spGlID;
        var gl = this._gl;
        var uniformSetters = {};
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var ii = 0; ii < numUniforms; ++ii) {
            var uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            var name_1 = uniformInfo.name;
            // remove the array suffix.
            if (name_1.substr(-3) === '[0]') {
                name_1 = name_1.substr(0, name_1.length - 3);
            }
            var setter = this.createUniformSetter(uniformInfo, shaderData);
            uniformSetters[name_1] = setter;
        }
        return uniformSetters;
    };
    /**
     * 创建一个shader
     * @param vs
     * @param fs
     */
    ShaderFactory.prototype.createProgramInfo = function (vs, fs) {
        var glID = this.createShader(vs, fs);
        var shaderData = this.createShaderData(glID);
        var uniformSetters = this.createUniformSetters(shaderData);
        var attribSetters = this.createAttributeSetters(shaderData);
        shaderData.uniSetters = uniformSetters;
        shaderData.attrSetters = attribSetters;
        return shaderData;
    };
    ShaderFactory.prototype.getShaderProgram = function (index) {
        return this.getShareDataByIndex(index).spGlID;
    };
    //设置attribute变量
    ShaderFactory.prototype.setBuffersAndAttributes = function (attribSetters, buffers) {
        var gl = this._gl;
        var attribs = buffers.attribs;
        var setters = attribSetters;
        Object.keys(attribs).forEach(function (name) {
            var setter = setters[name];
            if (setter) {
                setter(attribs[name]);
            }
            else {
                console.log("error  绑定attribute变量失败-----", name);
            }
        });
        if (buffers.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        }
    };
    //设置uniform变量
    ShaderFactory.prototype.setUniforms = function (uniformSetters) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var setters = uniformSetters;
        var _loop_1 = function (uniforms) {
            Object.keys(uniforms).forEach(function (name) {
                var setter = setters[name];
                if (setter) {
                    setter(uniforms[name]);
                }
                else {
                    console.log("error  绑定uniform变量失败------", name);
                }
            });
        };
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var uniforms = values_1[_a];
            _loop_1(uniforms);
        }
    };
    //启动顶点着色器绘制
    ShaderFactory.prototype.drawBufferInfo = function (bufferInfo, primitiveType, count, offset) {
        var gl = this._gl;
        var indices = bufferInfo.indices;
        primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
        var numElements = count === undefined ? bufferInfo.numElements : count;
        offset = offset === undefined ? 0 : offset;
        if (indices) {
            gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
        }
        else {
            gl.drawArrays(primitiveType, offset, numElements);
        }
    };
    //ext---------------------------------------------------------------------------------
    // Add `push` to a typed array. It just keeps a 'cursor'
    // and allows use to `push` values into the array so we
    // don't have to manually compute offsets
    ShaderFactory.prototype.augmentTypedArray = function (typedArray, numComponents) {
        var cursor = 0;
        typedArray.push = function () {
            for (var ii = 0; ii < arguments.length; ++ii) {
                var value = arguments[ii];
                if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                    for (var jj = 0; jj < value.length; ++jj) {
                        typedArray[cursor++] = value[jj];
                    }
                }
                else {
                    typedArray[cursor++] = value;
                }
            }
        };
        typedArray.reset = function (opt_index) {
            cursor = opt_index || 0;
        };
        typedArray.numComponents = numComponents;
        Object.defineProperty(typedArray, 'numElements', {
            get: function () {
                return this.length / this.numComponents | 0;
            },
        });
        return typedArray;
    };
    /**
    * creates a typed array with a `push` function attached
    * so that you can easily *push* values.
    *
    * `push` can take multiple arguments. If an argument is an array each element
    * of the array will be added to the typed array.
    *
    * Example:
    *
    *     let array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
    *     array.push(1, 2, 3);
    *     array.push([4, 5, 6]);
    *     // array now contains [1, 2, 3, 4, 5, 6]
    *
    * Also has `numComponents` and `numElements` properties.
    *
    * @param {number} numComponents number of components
    * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
    * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
    * @return {ArrayBuffer} A typed array.
    * @memberOf module:webgl-utils
    */
    ShaderFactory.prototype.createAugmentedTypedArray = function (numComponents, numElements, opt_type) {
        var Type = opt_type || Float32Array;
        return this.augmentTypedArray(new Type(numComponents * numElements), numComponents);
    };
    ShaderFactory.prototype.getArray = function (array) {
        return array.length ? array : array.data;
    };
    ShaderFactory.prototype.guessNumComponentsFromName = function (name, length) {
        var numComponents;
        if (this.texcoordRE.test(name)) {
            numComponents = 2;
        }
        else if (this.colorRE.test(name)) {
            numComponents = 4;
        }
        else {
            numComponents = 3; // position, normals, indices ...
        }
        if (length % numComponents > 0) {
            throw new Error("Can not guess numComponents for attribute '" + name + "'. Tried " + numComponents + " but " + length + " values is not evenly divisible by " + numComponents + ". You should specify it.");
        }
        return numComponents;
    };
    ShaderFactory.prototype.getNumComponents = function (array, arrayName) {
        return array.numComponents || array.size || this.guessNumComponentsFromName(arrayName, this.getArray(array).length);
    };
    ShaderFactory.prototype.getNumElementsFromNonIndexedArrays = function (arrays) {
        var key;
        for (var _i = 0, _a = this.positionKeys; _i < _a.length; _i++) {
            var k = _a[_i];
            if (k in arrays) {
                key = k;
                break;
            }
        }
        key = key || Object.keys(arrays)[0];
        var array = arrays[key];
        var length = this.getArray(array).length;
        var numComponents = this.getNumComponents(array, key);
        var numElements = length / numComponents;
        if (length % numComponents > 0) {
            throw new Error("numComponents " + numComponents + " not correct for length " + length);
        }
        return numElements;
    };
    ShaderFactory.prototype.getGLTypeForTypedArray = function (gl, typedArray) {
        if (typedArray instanceof Int8Array) {
            return gl.BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Uint8Array) {
            return gl.UNSIGNED_BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Int16Array) {
            return gl.SHORT;
        } // eslint-disable-line
        if (typedArray instanceof Uint16Array) {
            return gl.UNSIGNED_SHORT;
        } // eslint-disable-line
        if (typedArray instanceof Int32Array) {
            return gl.INT;
        } // eslint-disable-line
        if (typedArray instanceof Uint32Array) {
            return gl.UNSIGNED_INT;
        } // eslint-disable-line
        if (typedArray instanceof Float32Array) {
            return gl.FLOAT;
        } // eslint-disable-line
        throw 'unsupported typed array type';
    };
    // This is really just a guess. Though I can't really imagine using
    // anything else? Maybe for some compression?
    ShaderFactory.prototype.getNormalizationForTypedArray = function (typedArray) {
        if (typedArray instanceof Int8Array) {
            return true;
        } // eslint-disable-line
        if (typedArray instanceof Uint8Array) {
            return true;
        } // eslint-disable-line
        return false;
    };
    ShaderFactory.prototype.isArrayBuffer = function (a) {
        return a.buffer && a.buffer instanceof ArrayBuffer;
    };
    ShaderFactory.prototype.createBufferFromTypedArray = function (gl, array, type, drawType) {
        type = type || gl.ARRAY_BUFFER;
        var buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
        return buffer;
    };
    ShaderFactory.prototype.allButIndices = function (name) {
        return name !== 'indices';
    };
    ShaderFactory.prototype.createMapping = function (obj) {
        var mapping = {};
        Object.keys(obj).filter(this.allButIndices).forEach(function (key) {
            mapping['a_' + key] = key;
        });
        return mapping;
    };
    ShaderFactory.prototype.makeTypedArray = function (array, name) {
        if (this.isArrayBuffer(array)) {
            return array;
        }
        if (array.data && this.isArrayBuffer(array.data)) {
            return array.data;
        }
        if (Array.isArray(array)) {
            array = {
                data: array,
            };
        }
        if (!array.numComponents) {
            array.numComponents = this.guessNumComponentsFromName(name, array.length);
        }
        var type = array.type;
        if (!type) {
            if (name === 'indices') {
                type = Uint16Array;
            }
        }
        var typedArray = this.createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
        typedArray.push(array.data);
        return typedArray;
    };
    ShaderFactory.prototype.createAttribsFromArrays = function (gl, arrays, opt_mapping) {
        var _this = this;
        var mapping = opt_mapping || this.createMapping(arrays);
        var attribs = {};
        Object.keys(mapping).forEach(function (attribName) {
            var bufferName = mapping[attribName];
            var origArray = arrays[bufferName];
            if (origArray.value) {
                attribs[attribName] = {
                    value: origArray.value,
                };
            }
            else {
                var array = _this.makeTypedArray(origArray, bufferName);
                attribs[attribName] = {
                    buffer: _this.createBufferFromTypedArray(gl, array),
                    numComponents: origArray.numComponents || array.numComponents || _this.guessNumComponentsFromName(bufferName),
                    type: _this.getGLTypeForTypedArray(gl, array),
                    normalize: _this.getNormalizationForTypedArray(array),
                };
            }
        });
        return attribs;
    };
    ShaderFactory.prototype.createBufferInfoFromArrays = function (arrays, opt_mapping) {
        var gl = this._gl;
        var bufferInfo = {
            attribs: this.createAttribsFromArrays(gl, arrays, opt_mapping),
        };
        var indices = arrays.indices;
        if (indices) {
            indices = this.makeTypedArray(indices, 'indices');
            bufferInfo.indices = this.createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
            bufferInfo.numElements = indices.length;
        }
        else {
            bufferInfo.numElements = this.getNumElementsFromNonIndexedArrays(arrays);
        }
        return new BufferAttribsData(bufferInfo.attribs, bufferInfo.numElements, bufferInfo.indices);
    };
    return ShaderFactory;
}());
exports.G_ShaderFactory = new ShaderFactory();
var Shader = /** @class */ (function () {
    function Shader(gl, glID) {
        this.USE_NORMAL = false; //法线
        this.USE_LIGHT = false; //光照
        this.USE_SKYBOX = false; //天空盒
        this._gl = gl;
        this._spGLID = glID;
        this.onCreateShader();
    }
    /**
     * 创建一个shader
     * @param vert
     * @param frag
     */
    Shader.create = function (vert, frag) {
        var glID = exports.G_ShaderFactory.createShader(vert, frag);
        return new Shader(exports.G_ShaderFactory._gl, glID);
    };
    Shader.prototype.onCreateShader = function () {
        var shaderProgramGLID = this._spGLID;
        var gl = this._gl;
        this.a_position_loc = gl.getAttribLocation(shaderProgramGLID, "a_position" /* POSITION */);
        this.a_normal_loc = gl.getAttribLocation(shaderProgramGLID, "a_normal" /* NORMAL */);
        this.a_uv_loc = gl.getAttribLocation(shaderProgramGLID, "a_uv" /* UV */);
        this.a_tangent_loc = gl.getAttribLocation(shaderProgramGLID, "a_tangent" /* TANGENT */);
        this.u_color_loc = gl.getUniformLocation(shaderProgramGLID, "u_color" /* COLOR */);
        this.u_color_dir_loc = gl.getUniformLocation(shaderProgramGLID, "u_color_dir" /* COLOR_DIR */);
        this.u_MVMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_MVMatrix" /* MVMatrix */);
        this.u_PMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_PMatrix" /* PMatrix */);
        this.u_texCoord_loc = gl.getUniformLocation(shaderProgramGLID, "u_texCoord" /* TEX_COORD */);
        this.u_skybox_loc = gl.getUniformLocation(shaderProgramGLID, "u_skybox" /* SKYBOX */);
        this.u_pvm_matrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_PVM_Matrix" /* PMV_MATRIX */);
        this.u_pvm_matrix_inverse_loc = gl.getUniformLocation(shaderProgramGLID, "u_PVM_Matrix_Inverse" /* PMV_MATRIX_INVERSE */);
        this.u_MMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_MMatrix" /* MMatrix */);
        this.u_VMatrix_loc = gl.getUniformLocation(shaderProgramGLID, "u_VMatrix" /* VMatrix */);
    };
    Shader.prototype.getCustomAttributeLocation = function (varName) {
        return this._gl.getAttribLocation(this._spGLID, varName);
    };
    Shader.prototype.getGLID = function () {
        return this._spGLID;
    };
    /**
     * 检查shader中变量的位置是否有效
     * @param loc
     */
    Shader.prototype.checklocValid = function (loc, tagName) {
        var result = !(loc == null || loc < 0);
        if (!result && this.isShowDebugLog) {
            console.error("err-------", loc, tagName);
        }
        return result;
    };
    Shader.prototype.checkGLIDValid = function (glID) {
        return (glID == null || glID <= 0) ? false : true;
    };
    //启用属性从缓冲区中获取数据的功能
    Shader.prototype.enableVertexAttribute = function () {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) { // 设定为数组类型的变量数据
            this._gl.enableVertexAttribArray(this.a_position_loc);
        }
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.enableVertexAttribArray(this.a_uv_loc);
        }
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.enableVertexAttribArray(this.a_normal_loc);
        }
    };
    //shader中所有的attributes变量
    Shader.prototype.updateAttributes = function (shaderProgramGLID) {
        var gl = this._gl;
        var numAttribs = gl.getProgramParameter(shaderProgramGLID, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
            var attribInfo = gl.getActiveAttrib(shaderProgramGLID, ii);
            if (!attribInfo) {
                break;
            }
            console.log("attribInfo--", attribInfo.name);
            var index = gl.getAttribLocation(shaderProgramGLID, attribInfo.name);
        }
    };
    //激活shader
    Shader.prototype.active = function () {
        this.disableVertexAttribArray();
        this.enableVertexAttribute();
        this._gl.useProgram(this._spGLID);
    };
    /**
     *
     * @param color 光的颜色
     * @param direction 光的方向
     */
    Shader.prototype.setUseLight = function (color, direction) {
        if (color === void 0) { color = [0.2, 1, 0.2, 1]; }
        if (direction === void 0) { direction = [0.5, 0.7, 1]; }
        if (!this.USE_LIGHT || !this.checklocValid(this.u_color_loc, "u_color_loc") || !this.checklocValid(this.u_color_dir_loc, "u_color_dir_loc")) {
            return;
        }
        // Set the color to use
        this._gl.uniform4fv(this.u_color_loc, color); // green
        // set the light direction.
        this._gl.uniform3fv(this.u_color_dir_loc, direction);
    };
    Shader.prototype.setUseSkyBox = function (u_pvm_matrix_inverse) {
        var gl = this._gl;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        // Set the uniforms
        gl.uniformMatrix4fv(this.u_pvm_matrix_inverse_loc, false, u_pvm_matrix_inverse);
        // Tell the shader to use texture unit 0 for u_skybox
        gl.uniform1i(this.u_skybox_loc, 0);
        // let our quad pass the depth test at 1.0
        gl.depthFunc(gl.LEQUAL);
    };
    //设置使用投影视口模型矩阵
    Shader.prototype.setUseProjectViewModelMatrix = function (pvmMatrix) {
        if (this.checklocValid(this.u_pvm_matrix_loc, "u_pvm_matrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_pvm_matrix_loc, false, pvmMatrix);
        }
    };
    //设置光照
    Shader.prototype.setUseColor = function (uColor) {
        if (this.checklocValid(this.u_color_loc, "u_color_loc")) {
            this._gl.uniform4fv(this.u_color_loc, uColor);
        }
    };
    //设置模型视口矩阵
    Shader.prototype.setUseModelViewMatrix = function (mvMatrix) {
        if (this.checklocValid(this.u_MVMatrix_loc, "u_MVMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_MVMatrix_loc, false, mvMatrix);
        }
    };
    //设置透视投影矩阵
    Shader.prototype.setUseProjectionMatrix = function (projMatrix) {
        if (this.checklocValid(this.u_PMatrix_loc, "u_PMatrix_loc")) {
            this._gl.uniformMatrix4fv(this.u_PMatrix_loc, false, projMatrix);
        }
    };
    //设置顶点值
    Shader.prototype.setUseVertexAttribPointerForVertex = function (glID, itemSize) {
        if (!this.checkGLIDValid(glID))
            return;
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            this._gl.enableVertexAttribArray(this.a_position_loc);
            GLapi_1.GLapi.vertexAttribPointer(this.a_position_loc, itemSize, this._gl.FLOAT, false, 0, 0);
        }
    };
    //设置法线值
    Shader.prototype.setUseVertexAttriPointerForNormal = function (glID, itemSize) {
        if (!this.checkGLIDValid(glID))
            return;
        /**
         * localtion:shader中attribute声明变量的位置
         * size:每次迭代使用的单位数据
         * type:单位数据类型
         * normallize:单位化（【0-255】--》【0-1】）
         * stride:每次迭代跳多少个数据到下一个数据
         * offset:从绑定缓冲区的偏移位置
         */
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            this._gl.enableVertexAttribArray(this.a_normal_loc);
            this._gl.vertexAttribPointer(this.a_normal_loc, itemSize, this._gl.FLOAT, false, 0, 0);
        }
    };
    //设置uv值
    Shader.prototype.setUseVertexAttribPointerForUV = function (glID, itemSize) {
        if (!this.checkGLIDValid(glID))
            return;
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, glID);
            this._gl.enableVertexAttribArray(this.a_uv_loc);
            this._gl.vertexAttribPointer(this.a_uv_loc, itemSize, this._gl.FLOAT, false, 0, 0);
        }
    };
    //设置使用的纹理
    //注意如果此处不重新设置使用的纹理，那么会默认使用上一次绘制时的纹理
    Shader.prototype.setUseTexture = function (glID, pos) {
        if (pos === void 0) { pos = 0; }
        if (!this.checkGLIDValid(glID))
            return;
        /**
          * activeTexture必须在bindTexture之前。如果没activeTexture就bindTexture，会默认绑定到0号纹理单元
        */
        if (this.checklocValid(this.u_texCoord_loc, "u_texCoord_loc")) {
            // 激活 0 号纹理单元
            this._gl.activeTexture(this._gl[GLEnums_1.glTEXTURE_UNIT_VALID[pos]]);
            // 指定当前操作的贴图
            this._gl.bindTexture(this._gl.TEXTURE_2D, glID);
            this._gl.uniform1i(this.u_texCoord_loc, pos);
        }
    };
    Shader.prototype.disableVertexAttribArray = function () {
        if (this.checklocValid(this.a_position_loc, "a_position_loc")) { // 设定为数组类型的变量数据
            this._gl.disableVertexAttribArray(this.a_position_loc);
        }
        if (this.checklocValid(this.a_uv_loc, "a_uv_loc")) {
            this._gl.disableVertexAttribArray(this.a_uv_loc);
        }
        if (this.checklocValid(this.a_normal_loc, "a_normal_loc")) {
            this._gl.disableVertexAttribArray(this.a_normal_loc);
        }
    };
    return Shader;
}());
exports.Shader = Shader;
},{"../gfx/GLEnums":5,"../gfx/GLapi":6}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGV2aWNlLnRzIiwic3JjL0xvYWRlck1hbmFnZXIudHMiLCJzcmMvTWFpbi50cyIsInNyYy9jb3JlL3JlbmRlcmVyLzNkL0NhbWVyYVRlc3QudHMiLCJzcmMvY29yZS9yZW5kZXJlci9nZngvR0xFbnVtcy50cyIsInNyYy9jb3JlL3JlbmRlcmVyL2dmeC9HTGFwaS50cyIsInNyYy9jb3JlL3JlbmRlcmVyL3NoYWRlci9TaGFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ01BLG1EQUFrRDtBQUVsRDs7RUFFRTtBQUNGLFNBQVMsT0FBTyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQVE7SUFBUixxQkFBQSxFQUFBLFFBQVE7SUFDL0MseUNBQXlDO0lBQ3pDLCtCQUErQjtJQUMvQiwwQkFBMEI7SUFDMUIsb0JBQW9CO0lBQ3BCLHlCQUF5QjtJQUN6Qiw0QkFBNEI7SUFDNUIsWUFBWTtJQUNaLFNBQVM7SUFDVCxLQUFLO0lBQ0wsZ0RBQWdEO0lBQ2hELCtCQUErQjtJQUMvQiwwQkFBMEI7SUFDMUIsb0JBQW9CO0lBQ3BCLGlEQUFpRDtJQUNqRCw0QkFBNEI7SUFDNUIsWUFBWTtJQUNaLFNBQVM7SUFDVCxXQUFXO0lBQ1gsa0NBQWtDO0lBQ2xDLDBCQUEwQjtJQUMxQixvQkFBb0I7SUFDcEIsMkJBQTJCO0lBQzNCLDJCQUEyQjtJQUMzQixTQUFTO0lBQ1QsSUFBSTtBQUNSLENBQUM7QUFFRDtJQUNJO1FBR1EsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBc0VwQixlQUFVLEdBQVksS0FBSyxDQUFDO1FBb0lwQyx1R0FBdUc7UUFDL0YsVUFBSyxHQUFHO1lBQ1osZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixpQkFBaUIsRUFBRSxDQUFDO1lBQ3BCLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLGVBQWUsRUFB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QkFBZ0IsQ0FBQyxFQUFFO1lBQzNELGFBQWE7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLDhCQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxZQUFZO1lBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNoRDtJQUNMLENBQUM7SUFFTSx5Q0FBd0IsR0FBL0I7UUFDSSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUMsZUFBZTtZQUMzRSxJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMxRDtRQUNELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BEO1FBQ0QsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLEVBQUU7WUFDdkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDeEQ7SUFDTCxDQUFDO0lBSUwsYUFBQztBQUFELENBalBBLEFBaVBDLElBQUE7QUFqUFksd0JBQU0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcclxuaW1wb3J0IGJyb3dzZXJpZnkgPSByZXF1aXJlKFwiYnJvd3NlcmlmeVwiKTtcclxuaW1wb3J0IHsgdXBkYXRlU291cmNlRmlsZU5vZGUgfSBmcm9tIFwidHlwZXNjcmlwdFwiO1xyXG5pbXBvcnQgU2NlbmUyRCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyL2Jhc2UvU2NlbmUyRFwiO1xyXG5pbXBvcnQgU2NlbmUzRCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyL2Jhc2UvU2NlbmUzRFwiO1xyXG5pbXBvcnQgRnJhbWVCdWZmZXIgZnJvbSBcIi4vY29yZS9yZW5kZXJlci9nZngvRnJhbWVCdWZmZXJcIjtcclxuaW1wb3J0IHsgR0xhcGkgfSBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyL2dmeC9HTGFwaVwiO1xyXG5cclxuLyoqXHJcbiogX2F0dGFjaFxyXG4qL1xyXG5mdW5jdGlvbiBfYXR0YWNoKGdsLCBsb2NhdGlvbiwgYXR0YWNobWVudCwgZmFjZSA9IDApIHtcclxuICAgIC8vIGlmIChhdHRhY2htZW50IGluc3RhbmNlb2YgVGV4dHVyZTJEKSB7XHJcbiAgICAvLyAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXHJcbiAgICAvLyAgICAgICAgIGdsLkZSQU1FQlVGRkVSLFxyXG4gICAgLy8gICAgICAgICBsb2NhdGlvbixcclxuICAgIC8vICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcclxuICAgIC8vICAgICAgICAgYXR0YWNobWVudC5fZ2xJRCxcclxuICAgIC8vICAgICAgICAgMFxyXG4gICAgLy8gICAgICk7XHJcbiAgICAvLyB9IFxyXG4gICAgLy8gZWxzZSBpZiAoYXR0YWNobWVudCBpbnN0YW5jZW9mIFRleHR1cmVDdWJlKSB7XHJcbiAgICAvLyAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXHJcbiAgICAvLyAgICAgICAgIGdsLkZSQU1FQlVGRkVSLFxyXG4gICAgLy8gICAgICAgICBsb2NhdGlvbixcclxuICAgIC8vICAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgZmFjZSxcclxuICAgIC8vICAgICAgICAgYXR0YWNobWVudC5fZ2xJRCxcclxuICAgIC8vICAgICAgICAgMFxyXG4gICAgLy8gICAgICk7XHJcbiAgICAvLyB9IGVsc2Uge1xyXG4gICAgLy8gICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKFxyXG4gICAgLy8gICAgICAgICBnbC5GUkFNRUJVRkZFUixcclxuICAgIC8vICAgICAgICAgbG9jYXRpb24sXHJcbiAgICAvLyAgICAgICAgIGdsLlJFTkRFUkJVRkZFUixcclxuICAgIC8vICAgICAgICAgYXR0YWNobWVudC5fZ2xJRFxyXG4gICAgLy8gICAgICk7XHJcbiAgICAvLyB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERldmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfTtcclxuICAgIHB1YmxpYyBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcclxuICAgIHByaXZhdGUgX2dsMmQ7XHJcbiAgICBwcml2YXRlIF93aWR0aDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX2hlaWdodDogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBjYW52YXM6IEhUTUxFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBEZXZpY2U7XHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBJbnN0YW5jZSgpOiBEZXZpY2Uge1xyXG4gICAgICAgIGlmICghdGhpcy5faW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBuZXcgRGV2aWNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0KCk6IHZvaWQge1xyXG5cclxuICAgICAgICB2YXIgY2FudmFzOiBIVE1MRWxlbWVudCA9IHdpbmRvd1tcImNhbnZhc1wiXTtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmNyZWF0ZUdMQ29udGV4dChjYW52YXMpO1xyXG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICBHTGFwaS5iaW5kR0woZ2wpO1xyXG4gICAgICAgIGNhbnZhcy5vbm1vdXNlZG93biA9IHRoaXMub25Nb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICBjYW52YXMub25tb3VzZW1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgY2FudmFzLm9ubW91c2V1cCA9IHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fd2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIueUu+W4g+eahOWwuuWvuC0tLS1cIiwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXRFeHQoKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRXZWJnbENvbnRleHQoKTogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuY2FudmFzIGFzIGFueSkuZ2V0Q29udGV4dChcIndlYmdsXCIpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBXaWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93aWR0aDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgSGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICAvL+iOt+WPlndlYmds55S756yU55qE57G75Z6LXHJcbiAgICBwdWJsaWMgZ2V0Q29udGV4dFR5cGUoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5nbCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwid2ViZ2wyXCJcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoKHRoaXMuZ2wgYXMgYW55KSBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyaW5nQ29udGV4dCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJ3ZWJnbFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v5Yib5bu6d2ViZ2znlLvnrJRcclxuICAgIHByaXZhdGUgY3JlYXRlR0xDb250ZXh0KGNhbnZhcyk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgICAgIHZhciBuYW1lcyA9IFtcIndlYmdsMlwiLCBcIndlYmdsXCIsIFwiZXhwZXJpbWVudGFsLXdlYmdsXCJdO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0gbnVsbDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIi1uYW1lcy0tLVwiLCBuYW1lc1tpXSk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQobmFtZXNbaV0pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cclxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICAvL+a3u+WKoOWKqOaAgeWxnuaAp+iusOW9leeUu+W4g+eahOWkp+Wwj1xyXG4gICAgICAgICAgICBjb250ZXh0LnZpZXdwb3J0V2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnRleHQudmlld3BvcnRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGNyZWF0ZSBXZWJHTCBjb250ZXh0IVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNDYXB0dXJlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5faXNDYXB0dXJlID0gdHJ1ZTtcclxuXHJcbiAgICB9XHJcbiAgICBwcml2YXRlIG9uTW91c2VNb3ZlKGV2KTogdm9pZCB7XHJcblxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXYpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLl9pc0NhcHR1cmUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWwhue7k+aenOe7mOWItuWIsFVJ5LiKXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkcmF3VG9VSSh0aW1lOiBudW1iZXIsIHNjZW5lMkQ6IFNjZW5lMkQsIHNjZW5lM0Q6IFNjZW5lM0QpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmdsLmNsZWFyQ29sb3IoMC41MCwgMC41MCwgMC41MCwgMS4wKTtcclxuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBzY2VuZTJELmdldEZyYW1lQnVmZmVyKCkpO1xyXG4gICAgICAgIHRoaXMuZ2wuY2xlYXIodGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUIHwgdGhpcy5nbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBzY2VuZTNELnJlYWR5RHJhdyh0aW1lKTtcclxuICAgICAgICBzY2VuZTJELnJlYWR5RHJhdyh0aW1lKTtcclxuXHJcbiAgICB9XHJcbiAgICAvL+Wwhue7k+aenOe7mOWItuWIsOeql+WPo1xyXG4gICAgcHVibGljIGRyYXcyc2NyZWVuKHRpbWU6IG51bWJlciwgc2NlbmUyRDogU2NlbmUyRCwgc2NlbmUzRDogU2NlbmUzRCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZ2wuY2xlYXJDb2xvcigwLjgsIDAuOCwgMC44LCAxLjApO1xyXG4gICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMuZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xyXG4gICAgICAgIHRoaXMuZ2wuY2xlYXIodGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUIHwgdGhpcy5nbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBzY2VuZTNELnJlYWR5RHJhdyh0aW1lKTtcclxuICAgICAgICAvLyBzY2VuZTJELnJlYWR5RHJhdyh0aW1lKTtcclxuICAgICAgICBpZiAodGhpcy5faXNDYXB0dXJlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzQ2FwdHVyZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNhcHR1cmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBfZnJhbWVidWZmZXI6IEZyYW1lQnVmZmVyOy8v5bin57yT5a2YXHJcbiAgICAvKipcclxuICAgKiBAbWV0aG9kIHNldEZyYW1lQnVmZmVyXHJcbiAgICogQHBhcmFtIHtGcmFtZUJ1ZmZlcn0gZmIgLSBudWxsIG1lYW5zIHVzZSB0aGUgYmFja2J1ZmZlclxyXG4gICAqL1xyXG4gICAgc2V0RnJhbWVCdWZmZXIoZmI6IEZyYW1lQnVmZmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZyYW1lYnVmZmVyID09PSBmYikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9mcmFtZWJ1ZmZlciA9IGZiO1xyXG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcclxuXHJcbiAgICAgICAgaWYgKCFmYikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIue7keWumuW4p+e8k+WGsuWksei0pS0tLS0tLS0tXCIpO1xyXG4gICAgICAgICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIue7keWumuW4p+e8k+WGsuaIkOWKn1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZmIuZ2V0SGFuZGxlKCkpO1xyXG5cclxuICAgICAgICAvLyBsZXQgbnVtQ29sb3JzID0gZmIuX2NvbG9ycy5sZW5ndGg7XHJcbiAgICAgICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db2xvcnM7ICsraSkge1xyXG4gICAgICAgIC8vICAgICBsZXQgY29sb3JCdWZmZXIgPSBmYi5fY29sb3JzW2ldO1xyXG4gICAgICAgIC8vICAgICBfYXR0YWNoKGdsLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGksIGNvbG9yQnVmZmVyKTtcclxuXHJcbiAgICAgICAgLy8gICAgIC8vIFRPRE86IHdoYXQgYWJvdXQgY3ViZW1hcCBmYWNlPz8/IHNob3VsZCBiZSB0aGUgdGFyZ2V0IHBhcmFtZXRlciBmb3IgY29sb3JCdWZmZXJcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gZm9yIChsZXQgaSA9IG51bUNvbG9yczsgaSA8IHRoaXMuX2NhcHMubWF4Q29sb3JBdHRhY2htZW50czsgKytpKSB7XHJcbiAgICAgICAgLy8gICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxyXG4gICAgICAgIC8vICAgICAgICAgZ2wuRlJBTUVCVUZGRVIsXHJcbiAgICAgICAgLy8gICAgICAgICBnbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGksXHJcbiAgICAgICAgLy8gICAgICAgICBnbC5URVhUVVJFXzJELFxyXG4gICAgICAgIC8vICAgICAgICAgbnVsbCxcclxuICAgICAgICAvLyAgICAgICAgIDBcclxuICAgICAgICAvLyAgICAgKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIGlmIChmYi5fZGVwdGgpIHtcclxuICAgICAgICAvLyAgICAgX2F0dGFjaChnbCwgZ2wuREVQVEhfQVRUQUNITUVOVCwgZmIuX2RlcHRoKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIGlmIChmYi5fc3RlbmNpbCkge1xyXG4gICAgICAgIC8vICAgICBfYXR0YWNoKGdsLCBnbC5TVEVOQ0lMX0FUVEFDSE1FTlQsIGZiLl9zdGVuY2lsKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIGlmIChmYi5fZGVwdGhTdGVuY2lsKSB7XHJcbiAgICAgICAgLy8gICAgIF9hdHRhY2goZ2wsIGdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVCwgZmIuX2RlcHRoU3RlbmNpbCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkcmF3KHNjZW5lRGF0YSk6IHZvaWQge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIG9iamVjdCBcclxuICAgICAqIHtcclxuICAgICAqIHg6XHJcbiAgICAgKiB5OlxyXG4gICAgICogdzpcclxuICAgICAqIGg6XHJcbiAgICAgKiB9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRWaWV3UG9ydChvYmplY3Q6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZ2wudmlld3BvcnQob2JqZWN0LngsIG9iamVjdC55LCBvYmplY3QudyAqIHRoaXMuZ2wuY2FudmFzLndpZHRoLCBvYmplY3QuaCAqIHRoaXMuZ2wuY2FudmFzLmhlaWdodCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzaXplIGEgY2FudmFzIHRvIG1hdGNoIHRoZSBzaXplIGl0cyBkaXNwbGF5ZWQuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMgVGhlIGNhbnZhcyB0byByZXNpemUuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW211bHRpcGxpZXJdIGFtb3VudCB0byBtdWx0aXBseSBieS5cclxuICAgICAqICAgIFBhc3MgaW4gd2luZG93LmRldmljZVBpeGVsUmF0aW8gZm9yIG5hdGl2ZSBwaXhlbHMuXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjYW52YXMgd2FzIHJlc2l6ZWQuXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOndlYmdsLXV0aWxzXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoY2FudmFzLCBtdWx0aXBsaWVyPykge1xyXG4gICAgICAgIG11bHRpcGxpZXIgPSBtdWx0aXBsaWVyIHx8IDE7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiBtdWx0aXBsaWVyIHwgMDtcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogbXVsdGlwbGllciB8IDA7XHJcbiAgICAgICAgaWYgKGNhbnZhcy53aWR0aCAhPT0gd2lkdGggfHwgY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vY29weS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIHByaXZhdGUgX2NhcHMgPSB7XHJcbiAgICAgICAgbWF4VmVydGV4U3RyZWFtczogNCxcclxuICAgICAgICBtYXhWZXJ0ZXhUZXh0dXJlczogMCxcclxuICAgICAgICBtYXhGcmFnVW5pZm9ybXM6IDAsICAvL+eJh+auteedgOiJsuWZqOacgOWkp+WPr+S7peeUqOeahHVuaWZvcm3lj5jph49cclxuICAgICAgICBtYXhUZXh0dXJlVW5pdHM6IDAsIC8v5pyA5aSn5L2/55So55qE57q555CG5Y2V5YWD5pWwXHJcbiAgICAgICAgbWF4VmVydGV4QXR0cmliczogMCwvL3NoYWRlcuS4reacgOWkp+WFgeiuuOiuvue9rueahOmhtueCueWxnuaAp+WPmOmHj+aVsOebrlxyXG4gICAgICAgIG1heFRleHR1cmVTaXplOiAwLC8v5Zyo5pi+5a2Y5Lit5pyA5aSn5a2Y5Y+W57q555CG55qE5bC65a+4MTYzODRrYizkuZ/lsLHmmK8xNm0sWzQwOTYsNDA5Nl1cclxuICAgICAgICBtYXhEcmF3QnVmZmVyczogMCxcclxuICAgICAgICBtYXhDb2xvckF0dGFjaG1lbnRzOiAwXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfZXh0ZW5zaW9uczogQXJyYXk8YW55PiA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfc3RhdHM6IGFueTtcclxuICAgIHByaXZhdGUgaW5pdEV4dCgpIHtcclxuICAgICAgICB0aGlzLl9zdGF0cyA9IHtcclxuICAgICAgICAgICAgdGV4dHVyZTogMCxcclxuICAgICAgICAgICAgdmI6IDAsXHJcbiAgICAgICAgICAgIGliOiAwLFxyXG4gICAgICAgICAgICBkcmF3Y2FsbHM6IDAsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvemgtQ04vZG9jcy9XZWIvQVBJL1dlYkdMX0FQSS9Vc2luZ19FeHRlbnNpb25zXHJcbiAgICAgICAgdGhpcy5faW5pdEV4dGVuc2lvbnMoW1xyXG4gICAgICAgICAgICAnRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJyxcclxuICAgICAgICAgICAgJ0VYVF9zaGFkZXJfdGV4dHVyZV9sb2QnLFxyXG4gICAgICAgICAgICAnT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyxcclxuICAgICAgICAgICAgJ09FU190ZXh0dXJlX2Zsb2F0JyxcclxuICAgICAgICAgICAgJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicsXHJcbiAgICAgICAgICAgICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0JyxcclxuICAgICAgICAgICAgJ09FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyJyxcclxuICAgICAgICAgICAgJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JyxcclxuICAgICAgICAgICAgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9hdGMnLFxyXG4gICAgICAgICAgICAnV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YycsXHJcbiAgICAgICAgICAgICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfZXRjMScsXHJcbiAgICAgICAgICAgICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfcHZydGMnLFxyXG4gICAgICAgICAgICAnV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnLFxyXG4gICAgICAgICAgICAnV0VCR0xfZGVwdGhfdGV4dHVyZScsXHJcbiAgICAgICAgICAgICdXRUJHTF9kcmF3X2J1ZmZlcnMnLFxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHRoaXMuX2luaXRDYXBzKCk7XHJcbiAgICAgICAgLy8gdGhpcy5faW5pdFN0YXRlcygpO1xyXG5cclxuICAgICAgICB0aGlzLmhhbmRsZVByZWNpc2lvbigpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhcIuaLk+WxlS0tLS0tXCIsIHRoaXMuZ2wuZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucygpKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAnRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCcsIFxyXG4gICAgICAgICAqICdFWFRfZGlzam9pbnRfdGltZXJfcXVlcnlfd2ViZ2wyJyxcclxuICAgICAgICAgKiAnRVhUX2Zsb2F0X2JsZW5kJywgXHJcbiAgICAgICAgICogJ0VYVF90ZXh0dXJlX2NvbXByZXNzaW9uX2JwdGMnLCBcclxuICAgICAgICAgKiAnRVhUX3RleHR1cmVfY29tcHJlc3Npb25fcmd0YycsIFxyXG4gICAgICAgICAqICdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnLCBcclxuICAgICAgICAgKiAnS0hSX3BhcmFsbGVsX3NoYWRlcl9jb21waWxlJywgXHJcbiAgICAgICAgICogJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicsIFxyXG4gICAgICAgICAqICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycsIFxyXG4gICAgICAgICAqICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0Y19zcmdiJywgXHJcbiAgICAgICAgICogJ1dFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8nLCBcclxuICAgICAgICAgKiAnV0VCR0xfZGVidWdfc2hhZGVycycsIFxyXG4gICAgICAgICAqICdXRUJHTF9sb3NlX2NvbnRleHQnLCBcclxuICAgICAgICAgKiAnV0VCR0xfbXVsdGlfZHJhdycsIFxyXG4gICAgICAgICAqICdPVlJfbXVsdGl2aWV3MlxyXG4gICAgICAgICAqL1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZVByZWNpc2lvbigpOiB2b2lkIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwi5aSE55CG57K+5bqmXCIpO1xyXG4gICAgICAgIHZhciBkYXRhMSA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5WRVJURVhfU0hBREVSLCBnbC5MT1dfRkxPQVQpO1xyXG4gICAgICAgIHZhciBkYXRhMiA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5WRVJURVhfU0hBREVSLCBnbC5NRURJVU1fRkxPQVQpO1xyXG4gICAgICAgIHZhciBkYXRhMyA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5WRVJURVhfU0hBREVSLCBnbC5ISUdIX0ZMT0FUKTtcclxuICAgICAgICB2YXIgZGF0YTQgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuVkVSVEVYX1NIQURFUiwgZ2wuTE9XX0lOVCk7XHJcbiAgICAgICAgdmFyIGRhdGE1ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLlZFUlRFWF9TSEFERVIsIGdsLk1FRElVTV9JTlQpO1xyXG4gICAgICAgIHZhciBkYXRhNiA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5WRVJURVhfU0hBREVSLCBnbC5ISUdIX0lOVCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJ2ZXJ0ZXgg57K+5bqm5YC8LS0tXCIsIGRhdGExLCBkYXRhMiwgZGF0YTMsIGRhdGE0LCBkYXRhNSwgZGF0YTYpO1xyXG5cclxuICAgICAgICB2YXIgZGF0YTEgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5MT1dfRkxPQVQpO1xyXG4gICAgICAgIHZhciBkYXRhMiA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5GUkFHTUVOVF9TSEFERVIsIGdsLk1FRElVTV9GTE9BVCk7XHJcbiAgICAgICAgdmFyIGRhdGEzID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuSElHSF9GTE9BVCk7XHJcbiAgICAgICAgdmFyIGRhdGE0ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuTE9XX0lOVCk7XHJcbiAgICAgICAgdmFyIGRhdGE1ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuTUVESVVNX0lOVCk7XHJcbiAgICAgICAgdmFyIGRhdGE2ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuSElHSF9JTlQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZnJhZ21lbnQg57K+5bqm5YC8LS0tXCIsIGRhdGExLCBkYXRhMiwgZGF0YTMsIGRhdGE0LCBkYXRhNSwgZGF0YTYpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyW5riy5p+T54q25oCBXHJcbiAgICAgKi9cclxuICAgIF9pbml0U3RhdGVzKCkge1xyXG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcclxuXHJcbiAgICAgICAgLy8gZ2wuZnJvbnRGYWNlKGdsLkNDVyk76L+Z5LiA5Y+l5Luj56CB5piv5aSa5L2Z55qE77yMd2ViZ2zpu5jorqTnmoTlsLHmmK/pgIbml7bpkojkuLrmraPpnaJcclxuICAgICAgICBnbC5kaXNhYmxlKGdsLkJMRU5EKTtcclxuICAgICAgICBnbC5ibGVuZEZ1bmMoZ2wuT05FLCBnbC5aRVJPKTtcclxuICAgICAgICBnbC5ibGVuZEVxdWF0aW9uKGdsLkZVTkNfQUREKTtcclxuICAgICAgICBnbC5ibGVuZENvbG9yKDEsIDEsIDEsIDEpO1xyXG5cclxuICAgICAgICBnbC5jb2xvck1hc2sodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xyXG5cclxuICAgICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG4gICAgICAgIGdsLmRlcHRoRnVuYyhnbC5MRVNTKTtcclxuICAgICAgICBnbC5kZXB0aE1hc2sodHJ1ZSk7XHJcbiAgICAgICAgZ2wuZGlzYWJsZShnbC5QT0xZR09OX09GRlNFVF9GSUxMKTtcclxuICAgICAgICBnbC5kZXB0aFJhbmdlKDAsIDEpO1xyXG5cclxuICAgICAgICBnbC5kaXNhYmxlKGdsLlNURU5DSUxfVEVTVCk7XHJcbiAgICAgICAgZ2wuc3RlbmNpbEZ1bmMoZ2wuQUxXQVlTLCAwLCAweEZGKTtcclxuICAgICAgICBnbC5zdGVuY2lsTWFzaygweEZGKTtcclxuICAgICAgICBnbC5zdGVuY2lsT3AoZ2wuS0VFUCwgZ2wuS0VFUCwgZ2wuS0VFUCk7XHJcblxyXG5cclxuICAgICAgICBnbC5jbGVhckRlcHRoKDEpO1xyXG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMCk7XHJcbiAgICAgICAgZ2wuY2xlYXJTdGVuY2lsKDApO1xyXG5cclxuICAgICAgICBnbC5kaXNhYmxlKGdsLlNDSVNTT1JfVEVTVCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2luaXRFeHRlbnNpb25zKGV4dGVuc2lvbnMpIHtcclxuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gZXh0ZW5zaW9uc1tpXTtcclxuICAgICAgICAgICAgbGV0IHZlbmRvclByZWZpeGVzID0gW1wiXCIsIFwiV0VCS0lUX1wiLCBcIk1PWl9cIl07XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZlbmRvclByZWZpeGVzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleHQgPSBnbC5nZXRFeHRlbnNpb24odmVuZG9yUHJlZml4ZXNbal0gKyBuYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V4dGVuc2lvbnNbbmFtZV0gPSBleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4qIEBtZXRob2QgZXh0XHJcbiogQHBhcmFtIHtzdHJpbmd9IG5hbWVcclxuKi9cclxuICAgIGV4dChuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V4dGVuc2lvbnNbbmFtZV07XHJcbiAgICB9XHJcblxyXG4gICAgX2luaXRDYXBzKCkge1xyXG4gICAgICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcclxuICAgICAgICBjb25zdCBleHREcmF3QnVmZmVycyA9IHRoaXMuZXh0KCdXRUJHTF9kcmF3X2J1ZmZlcnMnKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY2Fwcy5tYXhWZXJ0ZXhTdHJlYW1zID0gNDtcclxuICAgICAgICB0aGlzLl9jYXBzLm1heFZlcnRleFRleHR1cmVzID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVEVYVFVSRV9JTUFHRV9VTklUUyk7XHJcbiAgICAgICAgdGhpcy5fY2Fwcy5tYXhGcmFnVW5pZm9ybXMgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0ZSQUdNRU5UX1VOSUZPUk1fVkVDVE9SUyk7XHJcbiAgICAgICAgdGhpcy5fY2Fwcy5tYXhUZXh0dXJlVW5pdHMgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xyXG4gICAgICAgIHRoaXMuX2NhcHMubWF4VmVydGV4QXR0cmlicyA9IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX0FUVFJJQlMpO1xyXG4gICAgICAgIHRoaXMuX2NhcHMubWF4VGV4dHVyZVNpemUgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfU0laRSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NhcHMubWF4RHJhd0J1ZmZlcnMgPSBleHREcmF3QnVmZmVycyA/IGdsLmdldFBhcmFtZXRlcihleHREcmF3QnVmZmVycy5NQVhfRFJBV19CVUZGRVJTX1dFQkdMKSA6IDE7XHJcbiAgICAgICAgdGhpcy5fY2Fwcy5tYXhDb2xvckF0dGFjaG1lbnRzID0gZXh0RHJhd0J1ZmZlcnMgPyBnbC5nZXRQYXJhbWV0ZXIoZXh0RHJhd0J1ZmZlcnMuTUFYX0NPTE9SX0FUVEFDSE1FTlRTX1dFQkdMKSA6IDE7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwidGhpcy5fY2Fwcy0tLVwiLCB0aGlzLl9jYXBzKTtcclxuXHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ6bVwiLCBcIm5paGFvYVwiKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDmiKrlm75cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYXB0dXJlKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNhdmVCbG9iID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcclxuICAgICAgICAgICAgYS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2F2ZURhdGEoYmxvYiwgZmlsZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgICAgICAgICAgICAgYS5ocmVmID0gdXJsO1xyXG4gICAgICAgICAgICAgICAgYS5kb3dubG9hZCA9IGZpbGVOYW1lO1xyXG4gICAgICAgICAgICAgICAgYS5jbGljaygpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0oKSk7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcclxuICAgICAgICAoZ2wuY2FudmFzIGFzIGFueSkudG9CbG9iKChibG9iKSA9PiB7XHJcbiAgICAgICAgICAgIHNhdmVCbG9iKGJsb2IsIGBzY3JlZW5jYXB0dXJlLSR7Z2wuY2FudmFzLndpZHRofXgke2dsLmNhbnZhcy5oZWlnaHR9LnBuZ2ApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL+WJlOmZpOafkOS4gOS4qumdolxyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBiYWNrIHRydWUg5Luj6KGo5YmU6Zmk6IOM6Z2iIGZhbHNlIOS7o+ihqOWJlOmZpOWJjemdolxyXG4gICAgICogQHBhcmFtIGJvdGgg6KGo56S65YmN5ZCO6Z2i6YO95YmU6ZmkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjdWxsRmFjZShiYWNrOiBib29sZWFuID0gdHJ1ZSwgYm90aD8pOiB2b2lkIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpOy8v5byA5ZCv6Z2i5YmU6Zmk5Yqf6IO9XHJcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNXKTsvL+mAhuaXtumSiOe7mOWItueahOS7o+ihqOato+mdoiDmraPluLjnkIbop6PvvIznnIvliLDnmoTpnaLmmK/mraPpnaJnbC5GUk9OVO+8jOeci+S4jeWIsOeahOmdouaYr+iDjOmdomdsLkJBQ0tcclxuICAgICAgICAvLyBnbC5mcm9udEZhY2UoZ2wuQ0NXKTsvL+mhuuaXtumSiOe7mOWItueahOS7o+ihqOato+mdoiAg6ZyA6KaB5Y+N6L+H5p2l55CG6Kej77yM5Y2z5oiR5Lus55yL5Yiw55qE6Z2i5piv6IOM6Z2i77yM55yL5LiN5Yiw55qE6Z2i5piv5q2j6Z2iXHJcbiAgICAgICAgaWYgKGJvdGgpIHtcclxuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlRfQU5EX0JBQ0spOyAvL+WJjeWQjuS4pOS4qumdoumDveWJlOmZpFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChiYWNrKSB7XHJcbiAgICAgICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spOy8v5Y+q5YmU6Zmk6IOM6Z2iXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpOy8v5Y+q5YmU6Zmk5YmN6Z2iXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDlhbPpl63pnaLliZTpmaTlip/og71cclxuICAgICAqL1xyXG4gICAgcHVibGljIGNsb3NlQ3VsbEZhY2UoKTogdm9pZCB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcclxuICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpO1xyXG4gICAgICAgIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICog5Yqg6L29566h55CG5ZGYXHJcbiAqL1xyXG5cclxuY2xhc3MgQ2FjaGVJbWFnZURhdGEge1xyXG4gICAgY29uc3RydWN0b3IodXJsLGltZyl7XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgICAgdGhpcy5pbWcgPSBpbWc7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdXJsOnN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgaW1nOkhUTUxJbWFnZUVsZW1lbnQ7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRGaWxlKHVybCwgdHlwZUZ1bmMpIHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNvdWxkIG5vdCBsb2FkOiAke3VybH1gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZVt0eXBlRnVuY10oKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZEJpbmFyeSh1cmwpIHtcclxuICAgIHJldHVybiBsb2FkRmlsZSh1cmwsICdhcnJheUJ1ZmZlcicpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkSlNPTih1cmwpIHtcclxuICAgIHJldHVybiBsb2FkRmlsZSh1cmwsICdqc29uJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvYWRlck1hbmFnZXJ7XHJcbiAgICBwcml2YXRlIF9jYWNoZUltYWdlOkFycmF5PENhY2hlSW1hZ2VEYXRhPiA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfY2FjaGU6TWFwPHN0cmluZyxhbnk+Oy8v6LWE5rqQ57yT5a2YXHJcbiAgICBwdWJsaWMgc3RhdGljIF9pbnN0YW5jZTpMb2FkZXJNYW5hZ2VyO1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKTpMb2FkZXJNYW5hZ2VyXHJcbiAgICB7XHJcbiAgICAgICAgaWYoIXRoaXMuX2luc3RhbmNlKVxyXG4gICAgICAgIHRoaXMuX2luc3RhbmNlID0gbmV3IExvYWRlck1hbmFnZXIoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBNYXA8c3RyaW5nLGFueT4oKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy/liqDovb1nbHRm5Yqo55S75paH5Lu2XHJcbiAgICBhc3luYyBsb2FkR0xURihwYXRoOnN0cmluZyl7XHJcbiAgICAgICAgY29uc3QgZ2x0ZiA9IGF3YWl0IGxvYWRKU09OKHBhdGgpO1xyXG4gICAgICAgIC8vIGxvYWQgYWxsIHRoZSByZWZlcmVuY2VkIGZpbGVzIHJlbGF0aXZlIHRvIHRoZSBnbHRmIGZpbGVcclxuICAgICAgICBjb25zdCBiYXNlVVJMID0gbmV3IFVSTChwYXRoLCBsb2NhdGlvbi5ocmVmKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgZ2x0Zi5idWZmZXJzID0gYXdhaXQgUHJvbWlzZS5hbGwoZ2x0Zi5idWZmZXJzLm1hcCgoYnVmZmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYnVmZmVyLnVyaSwgYmFzZVVSTC5ocmVmKTtcclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRCaW5hcnkodXJsLmhyZWYpO1xyXG4gICAgICAgIH0pKTtcclxuICAgICAgICB0aGlzLl9jYWNoZS5zZXQocGF0aCxnbHRmKTtcclxuICAgIH1cclxuXHJcbiAgICAvL+WKoOi9vWpzb27moLzlvI/nmoTkuozov5vliLZcclxuICAgIC8v5bCx5piv5bCGanNvbui9rOS4uuS6jOi/m+WItiDnhLblkI7ku6Xkuozov5vliLbor7vlj5blho3ovazkvJpqc29uXHJcbiAgICBwcml2YXRlIGxvYWRKc29uQmxvYkRhdGEocGF0aDpzdHJpbmcsY2FsbEJhY2tQcm9ncmVzcz8sY2FsbEJhY2tGaW5pc2g/KTp2b2lke1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oXCJnZXRcIixwYXRoKTtcclxuICAgICAgICByZXF1ZXN0LnNlbmQobnVsbCk7XHJcbiAgICAgICAgLy/ku6Xkuozov5vliLbmlrnlvI/or7vlj5bmlbDmja4s6K+75Y+W5Yiw55qE57uT5p6c5bCG5pS+5YWlQmxvYueahOS4gOS4quWvueixoeS4reWtmOaUvlxyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XHJcbiAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmKHJlcXVlc3Quc3RhdHVzPT0wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpOyAvL0ZpbGVSZWFkZXLlj6/ku6Xor7vlj5ZCbG9i5YaF5a65ICBcclxuICAgICAgICAgICAgICAgIGZyLnJlYWRBc0FycmF5QnVmZmVyKHJlcXVlc3QucmVzcG9uc2UpOyAvL+S6jOi/m+WItui9rOaNouaIkEFycmF5QnVmZmVyXHJcbiAgICAgICAgICAgICAgICBmci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkgeyAgLy/ovazmjaLlrozmiJDlkI7vvIzosIPnlKhvbmxvYWTmlrnms5VcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImJpbiBmaWxlLS0tXCIsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmF3RGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZnIucmVzdWx0IGFzIEFycmF5QnVmZmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RyID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhd0RhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyK1N0cmluZy5mcm9tQ2hhckNvZGUoKHJhd0RhdGFbaV0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShzdHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0IC0tXCIsc3RyKTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FjaGUuc2V0KHBhdGgsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZihjYWxsQmFja0ZpbmlzaCljYWxsQmFja0ZpbmlzaC5jYWxsKG51bGwsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIC8v5Yqg6L295LqM6L+b5Yi25pWw5o2uXHJcbiAgICBwdWJsaWMgbG9hZEJsb2JEYXRhKHBhdGg6c3RyaW5nLGNhbGxCYWNrUHJvZ3Jlc3M/LGNhbGxCYWNrRmluaXNoPyk6dm9pZHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgcmVxdWVzdC5vcGVuKFwiZ2V0XCIscGF0aCk7XHJcbiAgICAgICAgcmVxdWVzdC5zZW5kKG51bGwpO1xyXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XHJcbiAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmKHJlcXVlc3Quc3RhdHVzPT0wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpOyAvL0ZpbGVSZWFkZXLlj6/ku6Xor7vlj5ZCbG9i5YaF5a65ICBcclxuICAgICAgICAgICAgICAgIGZyLnJlYWRBc0FycmF5QnVmZmVyKHJlcXVlc3QucmVzcG9uc2UpOyAvL+S6jOi/m+WItui9rOaNouaIkEFycmF5QnVmZmVyXHJcbiAgICAgICAgICAgICAgICBmci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkgeyAgLy/ovazmjaLlrozmiJDlkI7vvIzosIPnlKhvbmxvYWTmlrnms5VcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FjaGUuc2V0KHBhdGgsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZihjYWxsQmFja0ZpbmlzaCljYWxsQmFja0ZpbmlzaC5jYWxsKG51bGwsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v5Yqg6L29anNvbuaVsOaNrlxyXG4gICAgcHVibGljIGxvYWRKc29uRGF0YShwYXRoOnN0cmluZyxjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pOnZvaWR7XHJcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJlcXVlc3Qub3BlbihcImdldFwiLHBhdGgpO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZChudWxsKTtcclxuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwianNvblwiO1xyXG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZihyZXF1ZXN0LnN0YXR1cz09MClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGpzb25EYXRhID0gcmVxdWVzdC5yZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLl9jYWNoZS5zZXQocGF0aCxqc29uRGF0YSlcclxuICAgICAgICAgICAgICAgIGlmKGNhbGxCYWNrRmluaXNoKWNhbGxCYWNrRmluaXNoLmNhbGwobnVsbCxqc29uRGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL+WKoOi9veWPr+S7pei9rOWMluS4umpzb27nmoTmlbDmja5cclxuICAgIHB1YmxpYyBsb2FkSnNvblN0cmluZ0RhdGEocGF0aDpzdHJpbmcsY2FsbEJhY2tQcm9ncmVzcz8sY2FsbEJhY2tGaW5pc2g/KTp2b2lke1xyXG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICByZXF1ZXN0Lm9wZW4oXCJnZXRcIixwYXRoKTtcclxuICAgICAgICByZXF1ZXN0LnNlbmQobnVsbCk7XHJcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBcInRleHRcIjtcclxuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYocmVxdWVzdC5zdGF0dXM9PTApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBqc29uRGF0YSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuX2NhY2hlLnNldChwYXRoLGpzb25EYXRhKVxyXG4gICAgICAgICAgICAgICAgaWYoY2FsbEJhY2tGaW5pc2gpY2FsbEJhY2tGaW5pc2guY2FsbChudWxsLGpzb25EYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v5Yqg6L296aqo6aq85pWw5o2uXHJcbiAgICBwcml2YXRlIGxvYWRTa2VsRGF0YShwYXRoOnN0cmluZyxjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pOnZvaWR7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHJlcXVlc3Qub3BlbihcImdldFwiLHBhdGgpO1xyXG4gICAgICAgIHJlcXVlc3Quc2VuZChudWxsKTtcclxuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xyXG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZihyZXF1ZXN0LnN0YXR1cz09MClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZyID0gbmV3IEZpbGVSZWFkZXIoKTsgLy9GaWxlUmVhZGVy5Y+v5Lul6K+75Y+WQmxvYuWGheWuuSAgXHJcbiAgICAgICAgICAgICAgICBmci5yZWFkQXNBcnJheUJ1ZmZlcihyZXF1ZXN0LnJlc3BvbnNlKTsgLy/kuozov5vliLbovazmjaLmiJBBcnJheUJ1ZmZlclxyXG4gICAgICAgICAgICAgICAgLy8gZnIucmVhZEFzVGV4dChyZXF1ZXN0LnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIGZyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7ICAvL+i9rOaNouWujOaIkOWQju+8jOiwg+eUqG9ubG9hZOaWueazlVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwi5Yqg6L295LqM6L+b5Yi25oiQ5YqfLS0tXCIsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FjaGUuc2V0KHBhdGgsZnIucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgdWludDhfbXNnID0gbmV3IFVpbnQ4QXJyYXkoZnIucmVzdWx0IGFzIEFycmF5QnVmZmVyKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyAvLyDop6PnoIHmiJDlrZfnrKbkuLJcclxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgZGVjb2RlZFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdWludDhfbXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIuWtl+espuS4si0tXCIsZGVjb2RlZFN0cmluZyk7IFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIHBhcnNlLOi9rOaIkGpzb27mlbDmja5cclxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZGVjb2RlZFN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBjb250ZW50ID0gZnIucmVzdWx0Oy8vYXJyYXlidWZmZXLnsbvlnovmlbDmja5cclxuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgcmVzQmxvYiA9IG5ldyBCbG9iKFtjb250ZW50XSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlYWRlci5yZWFkQXNUZXh0KHJlc0Jsb2IsIFwidXRmLThcIilcclxuICAgICAgICAgICAgICAgICAgICAvLyByZWFkZXIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImdhZ2FnLS0tXCIscmVhZGVyLnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBsZXQgcmVzID0gSlNPTi5wYXJzZShyZWFkZXIucmVzdWx0IGFzIHN0cmluZylcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNhbGxCYWNrRmluaXNoKWNhbGxCYWNrRmluaXNoLmNhbGwobnVsbCxmci5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8v5Yqg6L295Zu+54mH5pWw5o2uXHJcbiAgICBwdWJsaWMgbG9hZEltYWdlRGF0YShwYXRoOnN0cmluZyxjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pOnZvaWR7XHJcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbihpbWc6SFRNTEltYWdlRWxlbWVudCl7XHJcbiAgICAgICAgICAgIGlmKCFpbWcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5Yqg6L2955qE5Zu+54mH6Lev5b6E5LiN5a2Y5ZyoLS0tXCIscGF0aCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSW1hZ2UucHVzaChuZXcgQ2FjaGVJbWFnZURhdGEocGF0aCxpbWcpKTtcclxuICAgICAgICAgICAgaWYoY2FsbEJhY2tGaW5pc2gpY2FsbEJhY2tGaW5pc2guY2FsbChudWxsLGltZyk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMsaW1nKTtcclxuICAgICAgICBpbWcuc3JjID0gcGF0aDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZ2V0TG9hZEZ1bmMocGF0aDpzdHJpbmcpOkZ1bmN0aW9ue1xyXG4gICAgICAgICAgICBsZXQgc3RyQXJyID0gcGF0aC5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICBsZXQgZXh0TmFtZSA9IHN0ckFycltzdHJBcnIubGVuZ3RoLTFdO1xyXG4gICAgICAgICAgICBzd2l0Y2goZXh0TmFtZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICBjYXNlIFwianBnXCI6cmV0dXJuIHRoaXMubG9hZEltYWdlRGF0YTtcclxuICAgICAgICAgICAgICAgY2FzZSBcInBuZ1wiOnJldHVybiB0aGlzLmxvYWRJbWFnZURhdGE7XHJcbiAgICAgICAgICAgICAgIGNhc2UgXCJiaW5cIjpyZXR1cm4gdGhpcy5sb2FkQmxvYkRhdGE7XHJcbiAgICAgICAgICAgIC8vICAgY2FzZSBcImJpblwiOnJldHVybiB0aGlzLmxvYWRKc29uQmxvYkRhdGE7XHJcbiAgICAgICAgICAgICAgIGNhc2UgXCJqc29uXCI6cmV0dXJuIHRoaXMubG9hZEpzb25EYXRhO1xyXG4gICAgICAgICAgICAgICBjYXNlIFwiZ2x0ZlwiOnJldHVybiB0aGlzLmxvYWRKc29uU3RyaW5nRGF0YTtcclxuICAgICAgICAgICAgICAgY2FzZSBcInNrZWxcIjpyZXR1cm4gdGhpcy5sb2FkU2tlbERhdGE7XHJcbiAgICAgICAgICAgICAgIGRlZmF1bHQ6Y29uc29sZS5sb2coXCLlj5HnjrDmnKrnn6XlkI7nvIDlkI3nmoTmlofku7YtLS0tXCIscGF0aCk7bnVsbDticmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy/liqDovb3mlbDmja5cclxuICAgIHB1YmxpYyBhc3luYyBsb2FkRGF0YShhcnI6QXJyYXk8c3RyaW5nPixjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pe1xyXG4gICAgICAgICBcclxuICAgICAgICAvL3Rlc3RcclxuICAgICAgICAvLyBhd2FpdCB0aGlzLmxvYWRHTFRGKFwiaHR0cHM6Ly93ZWJnbGZ1bmRhbWVudGFscy5vcmcvd2ViZ2wvcmVzb3VyY2VzL21vZGVscy9raWxsZXJfd2hhbGUvd2hhbGUuQ1lDTEVTLmdsdGZcIik7XHJcblxyXG4gICAgICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICAgICAgZm9yKHZhciBqID0wO2o8YXJyLmxlbmd0aDtqKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGV0IHBhdGg6c3RyaW5nID0gYXJyW2pdO1xyXG4gICAgICAgICAgdmFyIGxvYWRGdW5jID0gdGhpcy5nZXRMb2FkRnVuYyhwYXRoKTtcclxuICAgICAgICAgIGxvYWRGdW5jLmNhbGwodGhpcyxwYXRoLG51bGwsKHJlcyk9PntcclxuICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICAgIHRoaXMub25Mb2FkUHJvZ3Jlc3MoY291bnQvYXJyLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgaWYoY291bnQ9PWFyci5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkxvYWRGaW5pc2goKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmKGNhbGxCYWNrRmluaXNoKWNhbGxCYWNrRmluaXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy/ojrflj5bnvJPlrZjkuK3nmoTmlbDmja5cclxuICAgIHB1YmxpYyBnZXRDYWNoZURhdGEodXJsOnN0cmluZyk6YW55e1xyXG4gICAgICAgICAgIGNvbnNvbGUubG9nKHVybCx0aGlzLl9jYWNoZS5oYXModXJsKSk7XHJcbiAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlLmdldCh1cmwpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bnvJPlrZjnmoTnurnnkIbmlbDmja5cclxuICAgICAqIEBwYXJhbSB1cmwgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDYWNoZUltYWdlKHVybDpzdHJpbmcpOkhUTUxJbWFnZUVsZW1lbnR7XHJcbiAgICAgICAgIGZvcih2YXIgaiA9IDA7ajx0aGlzLl9jYWNoZUltYWdlLmxlbmd0aDtqKyspXHJcbiAgICAgICAgIHtcclxuICAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fY2FjaGVJbWFnZVtqXTtcclxuICAgICAgICAgICAgIGlmKGRhdGEudXJsPT11cmwpXHJcbiAgICAgICAgICAgICByZXR1cm4gZGF0YS5pbWc7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpENQVeerr+WGheWtmOS4reeahOWbvueJh+e8k+WtmFxyXG4gICAgICogQHBhcmFtIHVybCBcclxuICAgICAqLyBcclxuICAgIHB1YmxpYyByZW1vdmVJbWFnZSh1cmw6c3RyaW5nKTp2b2lke1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBpbmRleCA9IC0xO1xyXG4gICAgICAgIHZhciBpbWc6SFRNTEltYWdlRWxlbWVudDtcclxuICAgICAgICBmb3IodmFyIGogPSAwO2o8dGhpcy5fY2FjaGVJbWFnZS5sZW5ndGg7aisrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9jYWNoZUltYWdlW2pdO1xyXG4gICAgICAgICAgICBpZihkYXRhLnVybD09dXJsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgIGluZGV4ID0gajtcclxuICAgICAgICAgICAgICAgaW1nID0gZGF0YS5pbWc7XHJcbiAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGluZGV4Pj0wKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLop6PpmaTlvJXnlKhcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlSW1hZ2Uuc3BsaWNlKGluZGV4LDEpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbGVhc2VDUFVNZW1vcnlGb3JJbWFnZUNhY2hlKGltZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5rKh5om+5YiwLS0tLVwiLGltZyxpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBpbWcgXHJcbiAgICAgKiDph4rmlL5DUFXnq6/lhoXlrZjkuK3nmoTlm77niYfnvJPlrZhcclxuICAgICAqLyBcclxuICAgIHB1YmxpYyByZWxlYXNlQ1BVTWVtb3J5Rm9ySW1hZ2VDYWNoZShpbWc6SFRNTEltYWdlRWxlbWVudCk6dm9pZHtcclxuICAgICAgICBpbWcuc3JjID0gXCJcIjtcclxuICAgICAgICBpbWcgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgcHVibGljIG9uTG9hZFByb2dyZXNzKHByb2dyZXNzOm51bWJlcik6dm9pZHtcclxuICAgICAgICAgY29uc29sZS5sb2coXCLliqDovb3ov5vluqYtLS0tLS0tLS1cIixwcm9ncmVzcyk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgb25Mb2FkRmluaXNoKCk6dm9pZHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIuWKoOi9veWujOaIkOWVplwiKTtcclxuICAgIH1cclxuXHJcbn0iLCIvL+esrDHmraUgLSDlh4blpIdDYW52YXPlkozojrflj5ZXZWJHTOeahOa4suafk+S4iuS4i+aWh1xyXG5cclxuaW1wb3J0IERldmljZSBmcm9tIFwiLi9EZXZpY2VcIjtcclxuaW1wb3J0IExvYWRlck1hbmFnZXIgZnJvbSBcIi4vTG9hZGVyTWFuYWdlclwiO1xyXG5pbXBvcnQgeyBHX1NoYWRlckZhY3RvcnkgfSBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyL3NoYWRlci9TaGFkZXJcIjtcclxuaW1wb3J0IFBvaW50TGlnaHRUZXN0IGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvbGlnaHQvUG9pbnRMaWdodFRlc3RcIjtcclxuaW1wb3J0IFJlbmRlckZsb3cgZnJvbSBcIi4vUmVuZGVyRmxvd1wiO1xyXG5pbXBvcnQgU3RhZ2UgZnJvbSBcIi4vY29yZS9yZW5kZXJlci8zZC9TdGFnZVwiO1xyXG5pbXBvcnQgRm9nVGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyLzNkL0ZvZ1Rlc3RcIjtcclxuaW1wb3J0IEVhcnRoU3VuVGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyLzNkL0VhcnRoU3VuVGVzdFwiO1xyXG5pbXBvcnQgUm9iYXJ0VGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyLzNkL1JvYmFydFRlc3RcIjtcclxuaW1wb3J0IENhcHR1cmVUZXN0IGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvM2QvQ2FwdHVyZVRlc3RcIjtcclxuaW1wb3J0IFJhbXBUZXh0dXJlVGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyLzNkL1JhbXBUZXh0dXJlVGVzdFwiO1xyXG5pbXBvcnQgQ2FtZXJhVGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyLzNkL0NhbWVyYVRlc3RcIjtcclxuXHJcblxyXG5cclxuRGV2aWNlLkluc3RhbmNlLmluaXQoKTtcclxuR19TaGFkZXJGYWN0b3J5LmluaXQoRGV2aWNlLkluc3RhbmNlLmdsKTtcclxuXHJcbi8vdGVzdFdlYmxfTGFiZWwucnVuKCk7XHJcblxyXG4vL0xpZ2h0VGVzdC5ydW4oKTtcclxuXHJcbi8vIHNreUJveFRlc3QucnVuKCk7XHJcblxyXG4vLyBTa2luVGVzMS5ydW4oKTtcclxuXHJcbiB2YXIgYXJyID0gW1xyXG4gICAgXCJyZXMvbW9kZWxzL2tpbGxlcl93aGFsZS93aGFsZS5DWUNMRVMuYmluXCIsXHJcbiAgICBcInJlcy9tb2RlbHMva2lsbGVyX3doYWxlL3doYWxlLkNZQ0xFUy5nbHRmXCIsXHJcbiAgICBcInJlcy9tb2RlbHMvSGVhZERhdGEvaGVhZC5qc29uXCIsXHJcbiAgICBcInJlcy84eDgtZm9udC5wbmdcIixcclxuICAgIFwicmVzL3dvb2QuanBnXCIsXHJcbiAgICBcInJlcy90cmVlLmpwZ1wiLFxyXG4gICAgXCJyZXMvZ3JvdW5kLmpwZ1wiLFxyXG4gICAgXCJyZXMvd2lja2VyLmpwZ1wiXHJcbiBdXHJcblxyXG4vLyBUaHJlZURUZXh0dXJlLnJ1bigpO1xyXG4vLyBMYWJlbFRlc3QucnVuKCk7XHJcbi8vIFNoYWRlclNoYWRvd1Rlc3QucnVuKCk7XHJcblxyXG4vLyBTdGFnZS5ydW4oKTtcclxuXHJcbi8vIEVhcnRoU3VuVGVzdC5ydW4oKTtcclxuXHJcbi8vIFJvYmFydFRlc3QucnVuKCk7XHJcbi8vIENhcHR1cmVUZXN0LnJ1bigpO1xyXG5cclxuLy8gQ2FtZXJhVGVzdC5ydW4oKTtcclxuXHJcbi8vIFRleHR1cmVUZXN0LnJ1bigpO1xyXG5cclxuLy8gU3BlZWRUZXN0LnJ1bigpO1xyXG4vLyAgSGFpVHduMS5ydW4oKTtcclxuXHJcbi8vIFRocmVlRExpZ2h0VGVzdC5ydW4oKTtcclxuLy8gU3BvdExpZ2h0VGVzdC5ydW4oKTtcclxuLy8gUG9pbnRMaWdodFRlc3QucnVuKCk7XHJcblxyXG4vLyBGb2dUZXN0LnJ1bigpO1xyXG5cclxuXHJcbkxvYWRlck1hbmFnZXIuaW5zdGFuY2UubG9hZERhdGEoYXJyLG51bGwsZnVuY3Rpb24oKXtcclxuICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgLy8gbmV3IFJlbmRlckZsb3coKS5zdGFydHVwKCk7XHJcbiAgICAvLyBSYW1wVGV4dHVyZVRlc3QucnVuKCk7XHJcbiAgICBDYW1lcmFUZXN0LnJ1bigpO1xyXG4gICAgXHJcbn0pXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCBEZXZpY2UgZnJvbSBcIi4uLy4uLy4uL0RldmljZVwiO1xyXG5pbXBvcnQgeyBHX1NoYWRlckZhY3RvcnkgfSBmcm9tIFwiLi4vc2hhZGVyL1NoYWRlclwiO1xyXG52YXIgIHZlcnRleHNoYWRlcjNkID0gXHJcbidhdHRyaWJ1dGUgdmVjNCBhX3Bvc2l0aW9uOycrXHJcbidhdHRyaWJ1dGUgdmVjNCBhX2NvbG9yOycrXHJcbid1bmlmb3JtIG1hdDQgdV9tYXRyaXg7JytcclxuJ3ZhcnlpbmcgdmVjNCB2X2NvbG9yOycrXHJcbid2b2lkIG1haW4oKSB7JytcclxuJ2dsX1Bvc2l0aW9uID0gdV9tYXRyaXggKiBhX3Bvc2l0aW9uOycrXHJcbid2X2NvbG9yID0gYV9jb2xvcjsnK1xyXG4nfSdcclxuXHJcbnZhciBmcmFnbWVudHNoYWRlcjNkID0gXHJcbidwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnK1xyXG4ndmFyeWluZyB2ZWM0IHZfY29sb3I7JytcclxuJ3ZvaWQgbWFpbigpIHsnK1xyXG4nZ2xfRnJhZ0NvbG9yID0gdl9jb2xvcjsnK1xyXG4nfSdcclxuXHJcbnZhciBzb2xpZGNvbG9ydmVydGV4c2hhZGVyID0gXHJcbidhdHRyaWJ1dGUgdmVjNCBhX3Bvc2l0aW9uOycrXHJcbid1bmlmb3JtIG1hdDQgdV9tYXRyaXg7JytcclxuJ3ZvaWQgbWFpbigpIHsnK1xyXG4nZ2xfUG9zaXRpb24gPSB1X21hdHJpeCAqIGFfcG9zaXRpb247JytcclxuJ30nXHJcblxyXG52YXIgc29saWRjb2xvcmZyYWdtZW50c2hhZGVyID0gXHJcbidwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnK1xyXG4ndW5pZm9ybSB2ZWM0IHVfY29sb3I7JytcclxuJ3ZvaWQgbWFpbigpIHsnK1xyXG4nZ2xfRnJhZ0NvbG9yID0gdV9jb2xvcjsnK1xyXG4nfSdcclxuXHJcbmZ1bmN0aW9uIG1haW4oKSB7XHJcbiAgXHJcbiAgdmFyIG00ID0gd2luZG93W1wibTRcIl07XHJcbiAgdmFyIGdsID0gRGV2aWNlLkluc3RhbmNlLmdsO1xyXG4gIHZhciBwcmltaXRpdmVzID0gd2luZG93W1wicHJpbWl0aXZlc1wiXTtcclxuICB2YXIgd2ViZ2xMZXNzb25zVUkgPSB3aW5kb3dbXCJ3ZWJnbExlc3NvbnNVSVwiXVxyXG4gIGlmICghZ2wpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIHNldHVwIEdMU0wgcHJvZ3JhbXNcclxuICAvLyBjb21waWxlcyBzaGFkZXJzLCBsaW5rcyBwcm9ncmFtLCBsb29rcyB1cCBsb2NhdGlvbnNcclxuICBjb25zdCB2ZXJ0ZXhDb2xvclByb2dyYW1JbmZvID0gR19TaGFkZXJGYWN0b3J5LmNyZWF0ZVByb2dyYW1JbmZvKHZlcnRleHNoYWRlcjNkLCBmcmFnbWVudHNoYWRlcjNkKTtcclxuICBjb25zdCBzb2xpZENvbG9yUHJvZ3JhbUluZm8gPSBHX1NoYWRlckZhY3RvcnkuY3JlYXRlUHJvZ3JhbUluZm8oc29saWRjb2xvcnZlcnRleHNoYWRlciwgc29saWRjb2xvcmZyYWdtZW50c2hhZGVyKTtcclxuXHJcbiAgLy8gY3JlYXRlIGJ1ZmZlcnMgYW5kIGZpbGwgd2l0aCBkYXRhIGZvciBhIDNEICdGJ1xyXG4gIGNvbnN0IGZCdWZmZXJJbmZvID0gcHJpbWl0aXZlcy5jcmVhdGUzREZCdWZmZXJJbmZvKGdsKTtcclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlQ2xpcHNwYWNlQ3ViZUJ1ZmZlckluZm8oZ2wpIHtcclxuICAgIC8vIGZpcnN0IGxldCdzIGFkZCBhIGN1YmUuIEl0IGdvZXMgZnJvbSAxIHRvIDNcclxuICAgIC8vIGJlY2F1c2UgY2FtZXJhcyBsb29rIGRvd24gLVogc28gd2Ugd2FudFxyXG4gICAgLy8gdGhlIGNhbWVyYSB0byBzdGFydCBhdCBaID0gMC4gV2UnbGwgcHV0IGFcclxuICAgIC8vIGEgY29uZSBpbiBmcm9udCBvZiB0aGlzIGN1YmUgb3BlbmluZ1xyXG4gICAgLy8gdG93YXJkIC1aXHJcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbXHJcbiAgICAgIC0xLCAtMSwgLTEsICAvLyBjdWJlIHZlcnRpY2VzXHJcbiAgICAgICAxLCAtMSwgLTEsXHJcbiAgICAgIC0xLCAgMSwgLTEsXHJcbiAgICAgICAxLCAgMSwgLTEsXHJcbiAgICAgIC0xLCAtMSwgIDEsXHJcbiAgICAgICAxLCAtMSwgIDEsXHJcbiAgICAgIC0xLCAgMSwgIDEsXHJcbiAgICAgICAxLCAgMSwgIDEsXHJcbiAgICBdO1xyXG4gICAgY29uc3QgaW5kaWNlcyA9IFtcclxuICAgICAgMCwgMSwgMSwgMywgMywgMiwgMiwgMCwgLy8gY3ViZSBpbmRpY2VzXHJcbiAgICAgIDQsIDUsIDUsIDcsIDcsIDYsIDYsIDQsXHJcbiAgICAgIDAsIDQsIDEsIDUsIDMsIDcsIDIsIDYsXHJcbiAgICBdO1xyXG4gICAgcmV0dXJuIEdfU2hhZGVyRmFjdG9yeS5jcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyh7XHJcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXHJcbiAgICAgIGluZGljZXMsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIGNyZWF0ZSBnZW9tZXRyeSBmb3IgYSBjYW1lcmFcclxuICBmdW5jdGlvbiBjcmVhdGVDYW1lcmFCdWZmZXJJbmZvKGdsLCBzY2FsZSA9IDEpIHtcclxuICAgIC8vIGZpcnN0IGxldCdzIGFkZCBhIGN1YmUuIEl0IGdvZXMgZnJvbSAxIHRvIDNcclxuICAgIC8vIGJlY2F1c2UgY2FtZXJhcyBsb29rIGRvd24gLVogc28gd2Ugd2FudFxyXG4gICAgLy8gdGhlIGNhbWVyYSB0byBzdGFydCBhdCBaID0gMC5cclxuICAgIC8vIFdlJ2xsIHB1dCBhIGNvbmUgaW4gZnJvbnQgb2YgdGhpcyBjdWJlIG9wZW5pbmdcclxuICAgIC8vIHRvd2FyZCAtWlxyXG4gICAgY29uc3QgcG9zaXRpb25zID0gW1xyXG4gICAgICAtMSwgLTEsICAxLCAgLy8gY3ViZSB2ZXJ0aWNlc1xyXG4gICAgICAgMSwgLTEsICAxLFxyXG4gICAgICAtMSwgIDEsICAxLFxyXG4gICAgICAgMSwgIDEsICAxLFxyXG4gICAgICAtMSwgLTEsICAzLFxyXG4gICAgICAgMSwgLTEsICAzLFxyXG4gICAgICAtMSwgIDEsICAzLFxyXG4gICAgICAgMSwgIDEsICAzLFxyXG4gICAgICAgMCwgIDAsICAxLCAgLy8gY29uZSB0aXBcclxuICAgIF07XHJcbiAgICBjb25zdCBpbmRpY2VzID0gW1xyXG4gICAgICAwLCAxLCAxLCAzLCAzLCAyLCAyLCAwLCAvLyBjdWJlIGluZGljZXNcclxuICAgICAgNCwgNSwgNSwgNywgNywgNiwgNiwgNCxcclxuICAgICAgMCwgNCwgMSwgNSwgMywgNywgMiwgNixcclxuICAgIF07XHJcbiAgICAvLyBhZGQgY29uZSBzZWdtZW50c1xyXG4gICAgY29uc3QgbnVtU2VnbWVudHMgPSA2O1xyXG4gICAgY29uc3QgY29uZUJhc2VJbmRleCA9IHBvc2l0aW9ucy5sZW5ndGggLyAzO1xyXG4gICAgY29uc3QgY29uZVRpcEluZGV4ID0gIGNvbmVCYXNlSW5kZXggLSAxO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TZWdtZW50czsgKytpKSB7XHJcbiAgICAgIGNvbnN0IHUgPSBpIC8gbnVtU2VnbWVudHM7XHJcbiAgICAgIGNvbnN0IGFuZ2xlID0gdSAqIE1hdGguUEkgKiAyO1xyXG4gICAgICBjb25zdCB4ID0gTWF0aC5jb3MoYW5nbGUpO1xyXG4gICAgICBjb25zdCB5ID0gTWF0aC5zaW4oYW5nbGUpO1xyXG4gICAgICBwb3NpdGlvbnMucHVzaCh4LCB5LCAwKTtcclxuICAgICAgLy8gbGluZSBmcm9tIHRpcCB0byBlZGdlXHJcbiAgICAgIGluZGljZXMucHVzaChjb25lVGlwSW5kZXgsIGNvbmVCYXNlSW5kZXggKyBpKTtcclxuICAgICAgLy8gbGluZSBmcm9tIHBvaW50IG9uIGVkZ2UgdG8gbmV4dCBwb2ludCBvbiBlZGdlXHJcbiAgICAgIGluZGljZXMucHVzaChjb25lQmFzZUluZGV4ICsgaSwgY29uZUJhc2VJbmRleCArIChpICsgMSkgJSBudW1TZWdtZW50cyk7XHJcbiAgICB9XHJcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgodiwgbmR4KSA9PiB7XHJcbiAgICAgIHBvc2l0aW9uc1tuZHhdICo9IHNjYWxlO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gR19TaGFkZXJGYWN0b3J5LmNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzKHtcclxuICAgICAgcG9zaXRpb246IHBvc2l0aW9ucyxcclxuICAgICAgaW5kaWNlcyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY2FtZXJhU2NhbGUgPSAyMDtcclxuICBjb25zdCBjYW1lcmFCdWZmZXJJbmZvID0gY3JlYXRlQ2FtZXJhQnVmZmVySW5mbyhnbCwgY2FtZXJhU2NhbGUpO1xyXG5cclxuICBjb25zdCBjbGlwc3BhY2VDdWJlQnVmZmVySW5mbyA9IGNyZWF0ZUNsaXBzcGFjZUN1YmVCdWZmZXJJbmZvKGdsKTtcclxuXHJcbiAgZnVuY3Rpb24gZGVnVG9SYWQoZCkge1xyXG4gICAgcmV0dXJuIGQgKiBNYXRoLlBJIC8gMTgwO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2V0dGluZ3MgPSB7XHJcbiAgICByb3RhdGlvbjogMTUwLCAgLy8gaW4gZGVncmVlc1xyXG4gICAgY2FtMUZpZWxkT2ZWaWV3OiA2MCwgIC8vIGluIGRlZ3JlZXNcclxuICAgIGNhbTFQb3NYOiAwLFxyXG4gICAgY2FtMVBvc1k6IDAsXHJcbiAgICBjYW0xUG9zWjogLTIwMCxcclxuICAgIGNhbTFOZWFyOiAzMCxcclxuICAgIGNhbTFGYXI6IDUwMCxcclxuICAgIGNhbTFPcnRobzogdHJ1ZSxcclxuICAgIGNhbTFPcnRob1VuaXRzOiAxMjAsXHJcbiAgfTtcclxuICB3ZWJnbExlc3NvbnNVSS5zZXR1cFVJKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN1aScpLCBzZXR0aW5ncywgW1xyXG4gICAgeyB0eXBlOiAnc2xpZGVyJywgICBrZXk6ICdyb3RhdGlvbicsICAgICAgICBtaW46IDAsIG1heDogMzYwLCBjaGFuZ2U6IHJlbmRlciwgcHJlY2lzaW9uOiAyLCBzdGVwOiAwLjAwMSwgfSxcclxuICAgIHsgdHlwZTogJ3NsaWRlcicsICAga2V5OiAnY2FtMUZpZWxkT2ZWaWV3JywgbWluOiAxLCBtYXg6IDE3MCwgY2hhbmdlOiByZW5kZXIsIH0sXHJcbiAgICB7IHR5cGU6ICdzbGlkZXInLCAgIGtleTogJ2NhbTFQb3NYJywgICAgIG1pbjogLTIwMCwgbWF4OiAyMDAsIGNoYW5nZTogcmVuZGVyLCB9LFxyXG4gICAgeyB0eXBlOiAnc2xpZGVyJywgICBrZXk6ICdjYW0xUG9zWScsICAgICBtaW46IC0yMDAsIG1heDogMjAwLCBjaGFuZ2U6IHJlbmRlciwgfSxcclxuICAgIHsgdHlwZTogJ3NsaWRlcicsICAga2V5OiAnY2FtMVBvc1onLCAgICAgbWluOiAtMjAwLCBtYXg6IDIwMCwgY2hhbmdlOiByZW5kZXIsIH0sXHJcbiAgICB7IHR5cGU6ICdzbGlkZXInLCAgIGtleTogJ2NhbTFOZWFyJywgICAgIG1pbjogMSwgbWF4OiA1MDAsIGNoYW5nZTogcmVuZGVyLCB9LFxyXG4gICAgeyB0eXBlOiAnc2xpZGVyJywgICBrZXk6ICdjYW0xRmFyJywgICAgICBtaW46IDEsIG1heDogNTAwLCBjaGFuZ2U6IHJlbmRlciwgfSxcclxuICAgIHsgdHlwZTogJ2NoZWNrYm94Jywga2V5OiAnY2FtMU9ydGhvJywgY2hhbmdlOiByZW5kZXIsIH0sXHJcbiAgICB7IHR5cGU6ICdzbGlkZXInLCAgIGtleTogJ2NhbTFPcnRob1VuaXRzJywgIG1pbjogMSwgbWF4OiAxNTAsIGNoYW5nZTogcmVuZGVyLCB9LFxyXG4gIF0pO1xyXG5cclxuICBmdW5jdGlvbiBkcmF3U2NlbmUocHJvamVjdGlvbk1hdHJpeCwgY2FtZXJhTWF0cml4LCB3b3JsZE1hdHJpeCkge1xyXG4gICAgLy8gQ2xlYXIgdGhlIGNhbnZhcyBBTkQgdGhlIGRlcHRoIGJ1ZmZlci5cclxuICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuXHJcbiAgICAvLyBNYWtlIGEgdmlldyBtYXRyaXggZnJvbSB0aGUgY2FtZXJhIG1hdHJpeC5cclxuICAgIGNvbnN0IHZpZXdNYXRyaXggPSBtNC5pbnZlcnNlKGNhbWVyYU1hdHJpeCk7XHJcblxyXG4gICAgbGV0IG1hdCA9IG00Lm11bHRpcGx5KHByb2plY3Rpb25NYXRyaXgsIHZpZXdNYXRyaXgpO1xyXG4gICAgbWF0ID0gbTQubXVsdGlwbHkobWF0LCB3b3JsZE1hdHJpeCk7XHJcblxyXG4gICAgZ2wudXNlUHJvZ3JhbSh2ZXJ0ZXhDb2xvclByb2dyYW1JbmZvLnNwR2xJRCk7XHJcblxyXG4gICAgLy8gLS0tLS0tIERyYXcgdGhlIEYgLS0tLS0tLS1cclxuXHJcbiAgICAvLyBTZXR1cCBhbGwgdGhlIG5lZWRlZCBhdHRyaWJ1dGVzLlxyXG4gICAgR19TaGFkZXJGYWN0b3J5LnNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzKHZlcnRleENvbG9yUHJvZ3JhbUluZm8uYXR0clNldHRlcnMsIGZCdWZmZXJJbmZvKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHVuaWZvcm1zXHJcbiAgICBHX1NoYWRlckZhY3Rvcnkuc2V0VW5pZm9ybXModmVydGV4Q29sb3JQcm9ncmFtSW5mby51bmlTZXR0ZXJzLCB7XHJcbiAgICAgIHVfbWF0cml4OiBtYXQsXHJcbiAgICB9KTtcclxuXHJcbiAgICBHX1NoYWRlckZhY3RvcnkuZHJhd0J1ZmZlckluZm8oZkJ1ZmZlckluZm8pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgRGV2aWNlLkluc3RhbmNlLnJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoZ2wuY2FudmFzKTtcclxuXHJcbiAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcclxuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuICAgIGdsLmVuYWJsZShnbC5TQ0lTU09SX1RFU1QpO1xyXG5cclxuICAgIC8vIHdlJ3JlIGdvaW5nIHRvIHNwbGl0IHRoZSB2aWV3IGluIDJcclxuICAgIGNvbnN0IGVmZmVjdGl2ZVdpZHRoID0gZ2wuY2FudmFzLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IGFzcGVjdCA9IGVmZmVjdGl2ZVdpZHRoIC8gZ2wuY2FudmFzLmhlaWdodDtcclxuICAgIGNvbnN0IG5lYXIgPSAxO1xyXG4gICAgY29uc3QgZmFyID0gMjAwMDtcclxuXHJcbiAgICAvLyBDb21wdXRlIGEgcHJvamVjdGlvbiBtYXRyaXhcclxuICAgIGNvbnN0IGhhbGZIZWlnaHRVbml0cyA9IDEyMDtcclxuICAgIGNvbnN0IHBlcnNwZWN0aXZlUHJvamVjdGlvbk1hdHJpeCA9IHNldHRpbmdzLmNhbTFPcnRob1xyXG4gICAgICAgID8gbTQub3J0aG9ncmFwaGljKFxyXG4gICAgICAgICAgICAtc2V0dGluZ3MuY2FtMU9ydGhvVW5pdHMgKiBhc3BlY3QsICAvLyBsZWZ0XHJcbiAgICAgICAgICAgICBzZXR0aW5ncy5jYW0xT3J0aG9Vbml0cyAqIGFzcGVjdCwgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgIC1zZXR0aW5ncy5jYW0xT3J0aG9Vbml0cywgICAgICAgICAgIC8vIGJvdHRvbVxyXG4gICAgICAgICAgICAgc2V0dGluZ3MuY2FtMU9ydGhvVW5pdHMsICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgIHNldHRpbmdzLmNhbTFOZWFyLFxyXG4gICAgICAgICAgICAgc2V0dGluZ3MuY2FtMUZhcilcclxuICAgICAgICA6IG00LnBlcnNwZWN0aXZlKGRlZ1RvUmFkKHNldHRpbmdzLmNhbTFGaWVsZE9mVmlldyksXHJcbiAgICAgICAgICAgIGFzcGVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3MuY2FtMU5lYXIsXHJcbiAgICAgICAgICAgIHNldHRpbmdzLmNhbTFGYXIpO1xyXG5cclxuICAgIC8vIENvbXB1dGUgdGhlIGNhbWVyYSdzIG1hdHJpeCB1c2luZyBsb29rIGF0LlxyXG4gICAgY29uc3QgY2FtZXJhUG9zaXRpb24gPSBbXHJcbiAgICAgICAgc2V0dGluZ3MuY2FtMVBvc1gsXHJcbiAgICAgICAgc2V0dGluZ3MuY2FtMVBvc1ksXHJcbiAgICAgICAgc2V0dGluZ3MuY2FtMVBvc1osXHJcbiAgICBdO1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gWzAsIDAsIDBdO1xyXG4gICAgY29uc3QgdXAgPSBbMCwgMSwgMF07XHJcbiAgICBjb25zdCBjYW1lcmFNYXRyaXggPSBtNC5sb29rQXQoY2FtZXJhUG9zaXRpb24sIHRhcmdldCwgdXApO1xyXG5cclxuICAgIGxldCB3b3JsZE1hdHJpeCA9IG00LnlSb3RhdGlvbihkZWdUb1JhZChzZXR0aW5ncy5yb3RhdGlvbikpO1xyXG4gICAgd29ybGRNYXRyaXggPSBtNC54Um90YXRlKHdvcmxkTWF0cml4LCBkZWdUb1JhZChzZXR0aW5ncy5yb3RhdGlvbikpO1xyXG4gICAgLy8gY2VudGVyIHRoZSAnRicgYXJvdW5kIGl0cyBvcmlnaW5cclxuICAgIHdvcmxkTWF0cml4ID0gbTQudHJhbnNsYXRlKHdvcmxkTWF0cml4LCAtMzUsIC03NSwgLTUpO1xyXG5cclxuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGdsLmNhbnZhcztcclxuICAgIGNvbnN0IGxlZnRXaWR0aCA9IHdpZHRoIC8gMiB8IDA7XHJcblxyXG4gICAgLy8gZHJhdyBvbiB0aGUgbGVmdCB3aXRoIG9ydGhvZ3JhcGhpYyBjYW1lcmFcclxuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGxlZnRXaWR0aCwgaGVpZ2h0KTtcclxuICAgIGdsLnNjaXNzb3IoMCwgMCwgbGVmdFdpZHRoLCBoZWlnaHQpO1xyXG4gICAgZ2wuY2xlYXJDb2xvcigxLCAwLjgsIDAuOCwgMSk7XHJcbiAgICBcclxuICAgIC8v5bCG55u45py65Lit55qE54mp5L2T5Y2V54us5ou/5Ye65p2l57uY5Yi2XHJcbiAgICBkcmF3U2NlbmUocGVyc3BlY3RpdmVQcm9qZWN0aW9uTWF0cml4LCBjYW1lcmFNYXRyaXgsIHdvcmxkTWF0cml4KTtcclxuXHJcbiAgICAvLyBkcmF3IG9uIHJpZ2h0IHdpdGggcGVyc3BlY3RpdmUgY2FtZXJhXHJcbiAgICBjb25zdCByaWdodFdpZHRoID0gd2lkdGggLSBsZWZ0V2lkdGg7XHJcbiAgICBnbC52aWV3cG9ydChsZWZ0V2lkdGgsIDAsIHJpZ2h0V2lkdGgsIGhlaWdodCk7XHJcbiAgICBnbC5zY2lzc29yKGxlZnRXaWR0aCwgMCwgcmlnaHRXaWR0aCwgaGVpZ2h0KTtcclxuICAgIGdsLmNsZWFyQ29sb3IoMC44LCAwLjgsIDEsIDEpO1xyXG5cclxuICAgIGNvbnN0IHBlcnNwZWN0aXZlUHJvamVjdGlvbk1hdHJpeDIgPVxyXG4gICAgICAgIG00LnBlcnNwZWN0aXZlKGRlZ1RvUmFkKDYwKSwgYXNwZWN0LCBuZWFyLCBmYXIpO1xyXG5cclxuICAgIC8vIENvbXB1dGUgdGhlIGNhbWVyYSdzIG1hdHJpeCB1c2luZyBsb29rIGF0LlxyXG4gICAgY29uc3QgY2FtZXJhUG9zaXRpb24yID0gWy02MDAsIDQwMCwgLTQwMF07XHJcbiAgICBjb25zdCB0YXJnZXQyID0gWzAsIDAsIDBdO1xyXG4gICAgY29uc3QgY2FtZXJhTWF0cml4MiA9IG00Lmxvb2tBdChjYW1lcmFQb3NpdGlvbjIsIHRhcmdldDIsIHVwKTtcclxuICAgIFxyXG4gICAgLy/nu5jliLbnm7jmnLrkuK3nmoTniankvZNcclxuICAgIGRyYXdTY2VuZShwZXJzcGVjdGl2ZVByb2plY3Rpb25NYXRyaXgyLCBjYW1lcmFNYXRyaXgyLCB3b3JsZE1hdHJpeCk7XHJcblxyXG4gICAgLy8gZHJhdyBvYmplY3QgdG8gcmVwcmVzZW50IGZpcnN0IGNhbWVyYVxyXG4gICAge1xyXG4gICAgICAvLyBNYWtlIGEgdmlldyBtYXRyaXggZnJvbSB0aGUgY2FtZXJhIG1hdHJpeC5cclxuICAgICAgY29uc3Qgdmlld01hdHJpeCA9IG00LmludmVyc2UoY2FtZXJhTWF0cml4Mik7XHJcblxyXG4gICAgICBsZXQgbWF0ID0gbTQubXVsdGlwbHkocGVyc3BlY3RpdmVQcm9qZWN0aW9uTWF0cml4Miwgdmlld01hdHJpeCk7XHJcbiAgICAgIC8vIHVzZSB0aGUgZmlyc3QncyBjYW1lcmEncyBtYXRyaXggYXMgdGhlIG1hdHJpeCB0byBwb3NpdGlvblxyXG4gICAgICAvLyB0aGUgY2FtZXJhJ3MgcmVwcmVzZW50YXRpdmUgaW4gdGhlIHNjZW5lXHJcbiAgICAgIG1hdCA9IG00Lm11bHRpcGx5KG1hdCwgY2FtZXJhTWF0cml4KTtcclxuXHJcbiAgICAgIGdsLnVzZVByb2dyYW0oc29saWRDb2xvclByb2dyYW1JbmZvLnNwR2xJRCk7XHJcblxyXG4gICAgICAvLyAtLS0tLS0gRHJhdyB0aGUgQ2FtZXJhIFJlcHJlc2VudGF0aW9uIC0tLS0tLS0t57uY5Yi255u45py65qih5Z6LXHJcblxyXG4gICAgICAvLyBTZXR1cCBhbGwgdGhlIG5lZWRlZCBhdHRyaWJ1dGVzLlxyXG4gICAgICBHX1NoYWRlckZhY3Rvcnkuc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXMoc29saWRDb2xvclByb2dyYW1JbmZvLmF0dHJTZXR0ZXJzLCBjYW1lcmFCdWZmZXJJbmZvKTtcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgdW5pZm9ybXNcclxuICAgICAgR19TaGFkZXJGYWN0b3J5LnNldFVuaWZvcm1zKHNvbGlkQ29sb3JQcm9ncmFtSW5mby51bmlTZXR0ZXJzLCB7XHJcbiAgICAgICAgdV9tYXRyaXg6IG1hdCxcclxuICAgICAgICB1X2NvbG9yOiBbMSwgMCwgMCwgMV0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgR19TaGFkZXJGYWN0b3J5LmRyYXdCdWZmZXJJbmZvKGNhbWVyYUJ1ZmZlckluZm8sIGdsLkxJTkVTKTtcclxuXHJcbiAgICAgIC8vIC0tLS0tIERyYXcgdGhlIGZydXN0dW0gLS0tLS0tLSDnu5jliLbpvZDmrKHoo4HliIfnqbrpl7TlnZDmoIfns7tcclxuXHJcbiAgICAgIG1hdCA9IG00Lm11bHRpcGx5KG1hdCwgbTQuaW52ZXJzZShwZXJzcGVjdGl2ZVByb2plY3Rpb25NYXRyaXgpKTtcclxuXHJcbiAgICAgIC8vIFNldHVwIGFsbCB0aGUgbmVlZGVkIGF0dHJpYnV0ZXMuXHJcbiAgICAgIEdfU2hhZGVyRmFjdG9yeS5zZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhzb2xpZENvbG9yUHJvZ3JhbUluZm8uYXR0clNldHRlcnMsIGNsaXBzcGFjZUN1YmVCdWZmZXJJbmZvKTtcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgdW5pZm9ybXNcclxuICAgICAgR19TaGFkZXJGYWN0b3J5LnNldFVuaWZvcm1zKHNvbGlkQ29sb3JQcm9ncmFtSW5mby51bmlTZXR0ZXJzLCB7XHJcbiAgICAgICAgdV9tYXRyaXg6IG1hdCxcclxuICAgICAgICB1X2NvbG9yOiBbMCwgMSwgMCwgMV0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgR19TaGFkZXJGYWN0b3J5LmRyYXdCdWZmZXJJbmZvKGNsaXBzcGFjZUN1YmVCdWZmZXJJbmZvLCBnbC5MSU5FUyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJlbmRlcigpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYW1lcmFUZXN0e1xyXG4gIHN0YXRpYyBydW4oKXtcclxuICAgIG1haW4oKTtcclxuICB9XHJcbn1cclxuIiwiLy90ZXh0dXJlIOWPluWAvFxyXG5cclxuXHJcbi8vIHRleHR1cmUgZmlsdGVyXHJcbmV4cG9ydCBjb25zdCBnbHRleF9maWx0ZXIgPSB7XHJcblxyXG4gICAgTkVBUkVTVDogOTcyOCwgICAgICAgICAgICAgICAgLy8gZ2wuTkVBUkVTVFxyXG4gICAgTElORUFSOiA5NzI5LCAgICAgICAgICAgICAgICAgLy8gZ2wuTElORUFSXHJcbiAgICAvL+S4i+mdouaYr+mSiOWvuee8qeWwj+eahOaYr+mHh+eUqG1pcG1hcOaKgOacr1xyXG4gICAgTkVBUkVTVF9NSVBNQVBfTkVBUkVTVDogOTk4NCwgLy8gZ2wuTkVBUkVTVF9NSVBNQVBfTkVBUkVTVFxyXG4gICAgTElORUFSX01JUE1BUF9ORUFSRVNUOiA5OTg1LCAgLy8gZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUXHJcbiAgICBORUFSRVNUX01JUE1BUF9MSU5FQVI6IDk5ODYsICAvLyBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVJcclxuICAgIExJTkVBUl9NSVBNQVBfTElORUFSOiA5OTg3LCAgIC8vIGdsLkxJTkVBUl9NSVBNQVBfTElORUFSXHJcbn1cclxuXHJcblxyXG5leHBvcnQgY29uc3QgZW51bSBnbFR5cGV7XHJcbiAgICAvLyBjb25zdCBHTF9CWVRFID0gNTEyMDsgICAgICAgICAgICAgICAgICAvLyBnbC5CWVRFXHJcbiAgICBVTlNJR05FRF9CWVRFID0gNTEyMSwgICAgICAgICAgICAvLyBnbC5VTlNJR05FRF9CWVRFXHJcbiAgICAvLyBjb25zdCBHTF9TSE9SVDo1MTIyLCAgICAgICAgICAgICAgICAgLy8gZ2wuU0hPUlRcclxuICAgIFVOU0lHTkVEX1NIT1JUID0gNTEyMywgICAgICAgICAgIC8vIGdsLlVOU0lHTkVEX1NIT1JUXHJcbiAgICBVTlNJR05FRF9JTlQgPSA1MTI1LCAgICAgICAgICAgICAvLyBnbC5VTlNJR05FRF9JTlRcclxuICAgIEZMT0FUID0gNTEyNiwgICAgICAgICAgICAgICAgICAgIC8vIGdsLkZMT0FUXHJcbiAgICBVTlNJR05FRF9TSE9SVF81XzZfNSA9IDMzNjM1LCAgICAvLyBnbC5VTlNJR05FRF9TSE9SVF81XzZfNVxyXG4gICAgVU5TSUdORURfU0hPUlRfNF80XzRfNCA9IDMyODE5LCAgLy8gZ2wuVU5TSUdORURfU0hPUlRfNF80XzRfNFxyXG4gICAgVU5TSUdORURfU0hPUlRfNV81XzVfMSA9IDMyODIwLCAgLy8gZ2wuVU5TSUdORURfU0hPUlRfNV81XzVfMVxyXG4gICAgSEFMRl9GTE9BVF9PRVMgPSAzNjE5MywgICAgICAgICAgLy8gZ2wuSEFMRl9GTE9BVF9PRVNcclxufVxyXG5cclxuLy90ZXh0dXJlIG5vcm1hbCBmb3JtYXRcclxuY29uc3QgZW51bSBnbHRleF9uZm10e1xyXG4gICAgREVQVEhfQ09NUE9ORU5UID0gNjQwMiwgLy8gZ2wuREVQVEhfQ09NUE9ORU5UXHJcbiAgICBBTFBIQSA9IDY0MDYsICAgICAgICAgICAgLy8gZ2wuQUxQSEFcclxuICAgIFJHQiA9IDY0MDcsICAgICAgICAgICAgICAvLyBnbC5SR0JcclxuICAgIFJHQkEgPSA2NDA4LCAgICAgICAgICAgICAvLyBnbC5SR0JBXHJcbiAgICBMVU1JTkFOQ0UgPSA2NDA5LCAgICAgICAgLy8gZ2wuTFVNSU5BTkNFXHJcbiAgICBMVU1JTkFOQ0VfQUxQSEEgPSA2NDEwLCAgLy8gZ2wuTFVNSU5BTkNFX0FMUEhBXHJcbn1cclxuLy90ZXh0dXJlIGNvbXByZXNzZWQgZm9ybWF0XHJcbmNvbnN0IGVudW0gZ2x0ZXhfY2ZtdHtcclxuICAgIFJHQl9TM1RDX0RYVDFfRVhUID0gMHg4M0YwLCAgIC8vIGV4dC5DT01QUkVTU0VEX1JHQl9TM1RDX0RYVDFfRVhUXHJcbiAgICBSR0JBX1MzVENfRFhUMV9FWFQgPSAweDgzRjEsICAvLyBleHQuQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUMV9FWFRcclxuICAgIFJHQkFfUzNUQ19EWFQzX0VYVCA9IDB4ODNGMiwgIC8vIGV4dC5DT01QUkVTU0VEX1JHQkFfUzNUQ19EWFQzX0VYVFxyXG4gICAgUkdCQV9TM1RDX0RYVDVfRVhUID0gMHg4M0YzLCAgLy8gZXh0LkNPTVBSRVNTRURfUkdCQV9TM1RDX0RYVDVfRVhUXHJcblxyXG4gICAgUkdCX1BWUlRDXzRCUFBWMV9JTUcgPSAweDhDMDAsICAvLyBleHQuQ09NUFJFU1NFRF9SR0JfUFZSVENfNEJQUFYxX0lNR1xyXG4gICAgUkdCX1BWUlRDXzJCUFBWMV9JTUcgPSAweDhDMDEsICAvLyBleHQuQ09NUFJFU1NFRF9SR0JfUFZSVENfMkJQUFYxX0lNR1xyXG4gICAgUkdCQV9QVlJUQ180QlBQVjFfSU1HID0gMHg4QzAyLCAvLyBleHQuQ09NUFJFU1NFRF9SR0JBX1BWUlRDXzRCUFBWMV9JTUdcclxuICAgIFJHQkFfUFZSVENfMkJQUFYxX0lNRyA9IDB4OEMwMywgLy8gZXh0LkNPTVBSRVNTRURfUkdCQV9QVlJUQ18yQlBQVjFfSU1HXHJcblxyXG4gICAgUkdCX0VUQzFfV0VCR0wgPSAweDhENjQsIC8vIGV4dC5DT01QUkVTU0VEX1JHQl9FVEMxX1dFQkdMXHJcblxyXG4gICAgUkdCOF9FVEMyID0gMHg5Mjc0LCAgICAgICAvLyBleHQuQ09NUFJFU1NFRF9SR0I4X0VUQzJcclxuICAgIFJHQkE4X0VUQzJfRUFDID0gMHg5Mjc4LCAgLy8gZXh0LkNPTVBSRVNTRURfUkdCQThfRVRDMl9FQUNcclxufVxyXG5cclxuY29uc3QgX2ZpbHRlckdMID0gW1xyXG4gICAgW2dsdGV4X2ZpbHRlci5ORUFSRVNULCBnbHRleF9maWx0ZXIuTkVBUkVTVF9NSVBNQVBfTkVBUkVTVCwgZ2x0ZXhfZmlsdGVyLk5FQVJFU1RfTUlQTUFQX0xJTkVBUl0sXHJcbiAgICBbZ2x0ZXhfZmlsdGVyLkxJTkVBUiwgZ2x0ZXhfZmlsdGVyLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCwgZ2x0ZXhfZmlsdGVyLkxJTkVBUl9NSVBNQVBfTElORUFSXSxcclxuXTtcclxuXHJcblxyXG5jb25zdCBfdGV4dHVyZUZtdEdMID0gW1xyXG4gICAgLy8gUkdCX0RYVDE6IDBcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQiwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCX1MzVENfRFhUMV9FWFQsIHBpeGVsVHlwZTogbnVsbCB9LFxyXG5cclxuICAgIC8vIFJHQkFfRFhUMTogMVxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCQV9TM1RDX0RYVDFfRVhULCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBSR0JBX0RYVDM6IDJcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9jZm10LlJHQkFfUzNUQ19EWFQzX0VYVCwgcGl4ZWxUeXBlOiBudWxsIH0sXHJcblxyXG4gICAgLy8gUkdCQV9EWFQ1OiAzXHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0JBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JBX1MzVENfRFhUNV9FWFQsIHBpeGVsVHlwZTogbnVsbCB9LFxyXG5cclxuICAgIC8vIFJHQl9FVEMxOiA0XHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9jZm10LlJHQl9FVEMxX1dFQkdMLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBSR0JfUFZSVENfMkJQUFYxOiA1XHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9jZm10LlJHQl9QVlJUQ18yQlBQVjFfSU1HLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBSR0JBX1BWUlRDXzJCUFBWMTogNlxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCQV9QVlJUQ18yQlBQVjFfSU1HLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBSR0JfUFZSVENfNEJQUFYxOiA3XHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9jZm10LlJHQl9QVlJUQ180QlBQVjFfSU1HLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBSR0JBX1BWUlRDXzRCUFBWMTogOFxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCQV9QVlJUQ180QlBQVjFfSU1HLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcblxyXG4gICAgLy8gQTg6IDlcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkFMUEhBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfbmZtdC5BTFBIQSwgcGl4ZWxUeXBlOiBnbFR5cGUuVU5TSUdORURfQllURSB9LFxyXG5cclxuICAgIC8vIEw4OiAxMFxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuTFVNSU5BTkNFLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfbmZtdC5MVU1JTkFOQ0UsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX0JZVEUgfSxcclxuXHJcbiAgICAvLyBMOF9BODogMTFcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkxVTUlOQU5DRV9BTFBIQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBLCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9CWVRFIH0sXHJcblxyXG4gICAgLy8gUjVfRzZfQjU6IDEyXHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQiwgcGl4ZWxUeXBlOiBnbFR5cGUuVU5TSUdORURfU0hPUlRfNV82XzUgfSxcclxuXHJcbiAgICAvLyBSNV9HNV9CNV9BMTogMTNcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzVfNV81XzEgfSxcclxuXHJcbiAgICAvLyBSNF9HNF9CNF9BNDogMTRcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzRfNF80XzQgfSxcclxuXHJcbiAgICAvLyBSR0I4OiAxNVxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX0JZVEUgfSxcclxuXHJcbiAgICAvLyBSR0JBODogMTZcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX0JZVEUgfSxcclxuXHJcbiAgICAvLyBSR0IxNkY6IDE3XHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQiwgcGl4ZWxUeXBlOiBnbFR5cGUuSEFMRl9GTE9BVF9PRVMgfSxcclxuXHJcbiAgICAvLyBSR0JBMTZGOiAxOFxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgcGl4ZWxUeXBlOiBnbFR5cGUuSEFMRl9GTE9BVF9PRVMgfSxcclxuXHJcbiAgICAvLyBSR0IzMkY6IDE5XHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQiwgcGl4ZWxUeXBlOiBnbFR5cGUuRkxPQVQgfSxcclxuXHJcbiAgICAvLyBSR0JBMzJGOiAyMFxyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgcGl4ZWxUeXBlOiBnbFR5cGUuRkxPQVQgfSxcclxuXHJcbiAgICAvLyBSMzJGOiAyMVxyXG4gICAgeyBmb3JtYXQ6IG51bGwsIGludGVybmFsRm9ybWF0OiBudWxsLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBfMTExMTEwRjogMjJcclxuICAgIHsgZm9ybWF0OiBudWxsLCBpbnRlcm5hbEZvcm1hdDogbnVsbCwgcGl4ZWxUeXBlOiBudWxsIH0sXHJcblxyXG4gICAgLy8gU1JHQjogMjNcclxuICAgIHsgZm9ybWF0OiBudWxsLCBpbnRlcm5hbEZvcm1hdDogbnVsbCwgcGl4ZWxUeXBlOiBudWxsIH0sXHJcblxyXG4gICAgLy8gU1JHQkE6IDI0XHJcbiAgICB7IGZvcm1hdDogbnVsbCwgaW50ZXJuYWxGb3JtYXQ6IG51bGwsIHBpeGVsVHlwZTogbnVsbCB9LFxyXG5cclxuICAgIC8vIEQxNjogMjVcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkRFUFRIX0NPTVBPTkVOVCwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuREVQVEhfQ09NUE9ORU5ULCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9TSE9SVCB9LFxyXG5cclxuICAgIC8vIEQzMjogMjZcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkRFUFRIX0NPTVBPTkVOVCwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuREVQVEhfQ09NUE9ORU5ULCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9JTlQgfSxcclxuXHJcbiAgICAvLyBEMjRTODogMjdcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkRFUFRIX0NPTVBPTkVOVCwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuREVQVEhfQ09NUE9ORU5ULCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9JTlQgfSxcclxuXHJcbiAgICAvLyBSR0JfRVRDMjogMjhcclxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQiwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCOF9FVEMyLCBwaXhlbFR5cGU6IG51bGwgfSxcclxuXHJcbiAgICAvLyBSR0JBX0VUQzI6IDI5XHJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0JBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JBOF9FVEMyX0VBQywgcGl4ZWxUeXBlOiBudWxsIH0sXHJcbl07XHJcblxyXG4vKipcclxuICogd2ViZ2zmnInmlYjnmoTnurnnkIbljZXlhYNcclxuICog57uP6L+H5rWL6K+V5pyA5aSn55qE57q555CG5Y2V5YWD5pWw55uu5pivMzLkuKpcclxuICovXHJcbmV4cG9ydCBjb25zdCBnbFRFWFRVUkVfVU5JVF9WQUxJRCA9IFtcclxuICAgIFwiVEVYVFVSRTBcIiwgXCJURVhUVVJFMVwiLCBcIlRFWFRVUkUyXCIsIFwiVEVYVFVSRTNcIiwgXCJURVhUVVJFNFwiLCBcIlRFWFRVUkU1XCIsIFwiVEVYVFVSRTZcIiwgXCJURVhUVVJFN1wiLFxyXG4gICAgXCJURVhUVVJFOFwiLCBcIlRFWFRVUkU5XCIsIFwiVEVYVFVSRTEwXCIsIFwiVEVYVFVSRTExXCIsIFwiVEVYVFVSRTEyXCIsIFwiVEVYVFVSRTEzXCIsIFwiVEVYVFVSRTE0XCIsIFwiVEVYVFVSRTE1XCIsXHJcbiAgICBcIlRFWFRVUkUxNlwiLCBcIlRFWFRVUkUxN1wiLCBcIlRFWFRVUkUxOFwiLCBcIlRFWFRVUkUxOVwiLCBcIlRFWFRVUkUyMFwiLCBcIlRFWFRVUkUyMVwiLCBcIlRFWFRVUkUyMlwiLCBcIlRFWFRVUkUyM1wiLFxyXG4gICAgXCJURVhUVVJFMjRcIiwgXCJURVhUVVJFMjVcIiwgXCJURVhUVVJFMjZcIiwgXCJURVhUVVJFMjdcIiwgXCJURVhUVVJFMjhcIiwgXCJURVhUVVJFMjlcIiwgXCJURVhUVVJFMzBcIiwgXCJURVhUVVJFMzFcIixcclxuXVxyXG5cclxuLy8gdmVydGV4IGF0dHJpYnV0ZSBzZW1hbnRpY1xyXG5leHBvcnQgY29uc3QgZW51bSBnbHZlcnRfYXR0cl9zZW1hbnRpY3tcclxuICAgIFBPU0lUSU9OID0gJ2FfcG9zaXRpb24nLFxyXG4gICAgTk9STUFMID0gJ2Ffbm9ybWFsJyxcclxuICAgIFRBTkdFTlQgPSAnYV90YW5nZW50JyxcclxuICAgIEJJVEFOR0VOVCA9ICdhX2JpdGFuZ2VudCcsXHJcbiAgICBXRUlHSFRTID0gJ2Ffd2VpZ2h0cycsXHJcbiAgICBKT0lOVFMgPSAnYV9qb2ludHMnLFxyXG4gICAgQ09MT1IgPSAndV9jb2xvcicsXHJcbiAgICBDT0xPUl9ESVIgPSAndV9jb2xvcl9kaXInLFxyXG4gICAgQ09MT1IwID0gJ3VfY29sb3IwJyxcclxuICAgIENPTE9SMF9ESVIgPSAndV9jb2xvcjBfZGlyJyxcclxuICAgIENPTE9SMSA9ICd1X2NvbG9yMScsXHJcbiAgICBDT0xPUjFfRElSID0gJ3VfY29sb3IxX2RpcicsXHJcbiAgICBVViA9ICdhX3V2JyxcclxuICAgIFVWMCA9ICdhX3V2MCcsXHJcbiAgICBVVjEgPSAnYV91djEnLFxyXG4gICAgVVYyID0gJ2FfdXYyJyxcclxuICAgIFVWMyA9ICdhX3V2MycsXHJcbiAgICBVVjQgPSAnYV91djQnLFxyXG4gICAgVVY1ID0gJ2FfdXY1JyxcclxuICAgIFVWNiA9ICdhX3V2NicsXHJcbiAgICBVVjcgPSAnYV91djcnLFxyXG4gICAgVEVYX0NPT1JEID0gJ3VfdGV4Q29vcmQnLFxyXG4gICAgVEVYX0NPT1JEMSA9ICd1X3RleENvb3JkMScsXHJcbiAgICBURVhfQ09PUkQyID0gJ3VfdGV4Q29vcmQyJyxcclxuICAgIFRFWF9DT09SRDMgPSAndV90ZXhDb29yZDMnLFxyXG4gICAgVEVYX0NPT1JENCA9ICd1X3RleENvb3JkNCcsXHJcbiAgICBURVhfQ09PUkQ1ID0gJ3VfdGV4Q29vcmQ1JyxcclxuICAgIFRFWF9DT09SRDYgPSAndV90ZXhDb29yZDYnLFxyXG4gICAgVEVYX0NPT1JENyA9ICd1X3RleENvb3JkNycsXHJcbiAgICBURVhfQ09PUkQ4ID0gJ3VfdGV4Q29vcmQ4JyxcclxuICAgIFNLWUJPWCA9IFwidV9za3lib3hcIixcclxuICAgIE1WTWF0cml4ID0gJ3VfTVZNYXRyaXgnLFxyXG4gICAgTU1hdHJpeCA9ICd1X01NYXRyaXgnLFxyXG4gICAgVk1hdHJpeCA9ICd1X1ZNYXRyaXgnLFxyXG4gICAgUE1hdHJpeCA9ICd1X1BNYXRyaXgnLFxyXG4gICAgUE1WX01BVFJJWCA9IFwidV9QVk1fTWF0cml4XCIsXHJcbiAgICBQTVZfTUFUUklYX0lOVkVSU0UgPSBcInVfUFZNX01hdHJpeF9JbnZlcnNlXCJcclxuXHJcbn1cclxuXHJcblxyXG5cclxuLy8gdGV4dHVyZSB3cmFwIG1vZGVcclxuZXhwb3J0IGNvbnN0IGVudW0gZ2x0ZXhfd3JhcHtcclxuICAgIFJFUEVBVCA9IDEwNDk3LCAvLyBnbC5SRVBFQVQgICAgICAgICAgIOW5s+mTuuW8j+eahOmHjeWkjee6ueeQhlxyXG4gICAgQ0xBTVAgPSAzMzA3MSwgIC8vIGdsLkNMQU1QX1RPX0VER0UgICAg5L2/55So57q555CG5Zu+5YOP6L6557yY5YC8XHJcbiAgICBNSVJST1IgPSAzMzY0OCwgLy8gZ2wuTUlSUk9SRURfUkVQRUFUICDplZzlg4/lr7nnp7DnmoTph43lpI3nurnnkIZcclxufVxyXG4vLyB0ZXh0dXJlIGZvcm1hdFxyXG4vL+WklumDqOS9v+eUqFxyXG5leHBvcnQgY29uc3QgZW51bSBnbHRleF9mb3JtYXQge1xyXG5cclxuICAgIC8vIGNvbXByZXNzIGZvcm1hdHNcclxuICAgIFJHQl9EWFQxID0gMCwgLy8wXHJcbiAgICBSR0JBX0RYVDEsICAvLzEsXHJcbiAgICBSR0JBX0RYVDMsICAvLzIsXHJcbiAgICBSR0JBX0RYVDUsICAvLzMsXHJcbiAgICBSR0JfRVRDMSwgIC8vNCxcclxuICAgIFJHQl9QVlJUQ18yQlBQVjEsICAvLzUsXHJcbiAgICBSR0JBX1BWUlRDXzJCUFBWMSwgIC8vNixcclxuICAgIFJHQl9QVlJUQ180QlBQVjEsICAvLzcsXHJcbiAgICBSR0JBX1BWUlRDXzRCUFBWMSwgIC8vOCxcclxuXHJcbiAgICAvLyBub3JtYWwgZm9ybWF0c1xyXG4gICAgQTgsICAvLzksXHJcbiAgICBMOCwgIC8vMTAsXHJcbiAgICBMOF9BOCwgIC8vMTEsXHJcbiAgICBSNV9HNl9CNSwgIC8vMTIsXHJcbiAgICBSNV9HNV9CNV9BMSwgIC8vMTMsXHJcbiAgICBSNF9HNF9CNF9BNCwgIC8vMTQsXHJcbiAgICBSR0I4LCAgLy8xNSwgIOW4uOeUqGpwZ1xyXG4gICAgUkdCQTgsICAvLzE2LOW4uOeUqHBuZ1xyXG4gICAgUkdCMTZGLCAgLy8xNyxcclxuICAgIFJHQkExNkYsICAvLzE4LFxyXG4gICAgUkdCMzJGLCAgLy8xOSxcclxuICAgIFJHQkEzMkYsICAvLzIwLFxyXG4gICAgUjMyRiwgIC8vMjEsXHJcbiAgICBfMTExMTEwRiwgIC8vMjIsXHJcbiAgICBTUkdCLCAgLy8yMyxcclxuICAgIFNSR0JBLCAgLy8yNCxcclxuXHJcbiAgICAvLyBkZXB0aCBmb3JtYXRzXHJcbiAgICBEMTYsICAvLzI1LFxyXG4gICAgRDMyLCAgLy8yNixcclxuICAgIEQyNFM4LCAgLy8yNyxcclxuXHJcbiAgICAvLyBldGMyIGZvcm1hdFxyXG4gICAgUkdCX0VUQzIsICAvLzI4LFxyXG4gICAgUkdCQV9FVEMyLCAgLy8yOSxcclxuXHJcbn1cclxuXHJcbi8vIHJlbmRlci1idWZmZXIgZm9ybWF0XHJcbmV4cG9ydCBjb25zdCBnbHJlbmRlcl9idWZmZXJfZm9ybWF0ID0ge1xyXG4gICAgUkdCQTQ6IDMyODU0LCAgICAvLyBnbC5SR0JBNFxyXG4gICAgUkdCNV9BMTogMzI4NTUsICAvLyBnbC5SR0I1X0ExXHJcbiAgICBSR0I1NjU6IDM2MTk0LCAgIC8vIGdsLlJHQjU2NVxyXG4gICAgRDE2OiAzMzE4OSwgICAgICAvLyBnbC5ERVBUSF9DT01QT05FTlQxNlxyXG4gICAgUzg6IDM2MTY4LCAgICAgICAvLyBnbC5TVEVOQ0lMX0lOREVYOFxyXG4gICAgRDI0Uzg6IDM0MDQxLCAgICAvLyBnbC5ERVBUSF9TVEVOQ0lMXHJcbn1cclxuXHJcbi8vIHByaW1pdGl2ZSB0eXBlXHJcbmV4cG9ydCBjb25zdCBlbnVtIGdscHJpbWl0aXZlX3R5cGUge1xyXG5cclxuICAgIFBPSU5UUyA9IDAsICAgICAgICAgLy8gZ2wuUE9JTlRTICDopoHnu5jliLbkuIDns7vliJfnmoTngrlcclxuICAgIExJTkVTID0gMSwgICAgICAgICAgLy8gZ2wuTElORVMgICDopoHnu5jliLbkuobkuIDns7vliJfmnKrov57mjqXnm7Tnur/mrrUo5Y2V54us6KGMKVxyXG4gICAgTElORV9MT09QID0gMiwgICAgICAvLyBnbC5MSU5FX0xPT1AgIOimgee7mOWItuS4gOezu+WIl+i/nuaOpeeahOe6v+autVxyXG4gICAgTElORV9TVFJJUCA9IDMsICAgICAvLyBnbC5MSU5FX1NUUklQICDopoHnu5jliLbkuIDns7vliJfov57mjqXnmoTnur/mrrXjgILlroPov5jov57mjqXnmoTnrKzkuIDlkozmnIDlkI7nmoTpobbngrnvvIzku6XlvaLmiJDkuIDkuKrnjq9cclxuICAgIFRSSUFOR0xFUyA9IDQsICAgICAgLy8gZ2wuVFJJQU5HTEVTICDkuIDns7vliJfljZXni6znmoTkuInop5LlvaLvvJvnu5jliLbmlrnlvI/vvJrvvIh2MCx2MSx2Mu+8iSwodjEsdjMsdjQpXHJcbiAgICBUUklBTkdMRV9TVFJJUCA9IDUsIC8vIGdsLlRSSUFOR0xFX1NUUklQICDkuIDns7vliJfluKbnirbnmoTkuInop5LlvaJcclxuICAgIFRSSUFOR0xFX0ZBTiA9IDYsICAgLy8gZ2wuVFJJQU5HTEVfRkFOICDmiYflvaLnu5jliLbmlrnlvI9cclxufVxyXG5cclxuLy8gY3VsbFxyXG5leHBvcnQgY29uc3QgZ2xjdWxsID0ge1xyXG5cclxuICAgIE5PTkU6IDAsXHJcbiAgICBGUk9OVDogMTAyOCxcclxuICAgIEJBQ0s6IDEwMjksXHJcbiAgICBGUk9OVF9BTkRfQkFDSzogMTAzMixcclxufVxyXG5cclxuLy8gc3RlbmNpbCBvcGVyYXRpb25cclxuZXhwb3J0IGNvbnN0IGdsc3RlbmNpbF9vcGVyYXRpb24gPSB7XHJcblxyXG4gICAgRElTQUJMRTogMCwgICAgICAgICAgICAgLy8gZGlzYWJsZSBzdGVuY2lsXHJcbiAgICBFTkFCTEU6IDEsICAgICAgICAgICAgICAvLyBlbmFibGUgc3RlbmNpbFxyXG4gICAgSU5IRVJJVDogMiwgICAgICAgICAgICAgLy8gaW5oZXJpdCBzdGVuY2lsIHN0YXRlc1xyXG5cclxuICAgIE9QX0tFRVA6IDc2ODAsICAgICAgICAgIC8vIGdsLktFRVBcclxuICAgIE9QX1pFUk86IDAsICAgICAgICAgICAgIC8vIGdsLlpFUk9cclxuICAgIE9QX1JFUExBQ0U6IDc2ODEsICAgICAgIC8vIGdsLlJFUExBQ0VcclxuICAgIE9QX0lOQ1I6IDc2ODIsICAgICAgICAgIC8vIGdsLklOQ1JcclxuICAgIE9QX0lOQ1JfV1JBUDogMzQwNTUsICAgIC8vIGdsLklOQ1JfV1JBUFxyXG4gICAgT1BfREVDUjogNzY4MywgICAgICAgICAgLy8gZ2wuREVDUlxyXG4gICAgT1BfREVDUl9XUkFQOiAzNDA1NiwgICAgLy8gZ2wuREVDUl9XUkFQXHJcbiAgICBPUF9JTlZFUlQ6IDUzODYsICAgICAgICAvLyBnbC5JTlZFUlRcclxufVxyXG5cclxuLy8gZGVwdGggYW5kIHN0ZW5jaWwgZnVuY3Rpb25cclxuLy8g566A5YaZXCJkc1wiXHJcbmV4cG9ydCBjb25zdCBnbGRlcHRoX3N0ZW5jaWxfZnVuYyA9IHtcclxuXHJcbiAgICBORVZFUjogNTEyLCAgICAvLyBnbC5ORVZFUlxyXG4gICAgTEVTUzogNTEzLCAgICAgLy8gZ2wuTEVTU1xyXG4gICAgRVFVQUw6IDUxNCwgICAgLy8gZ2wuRVFVQUxcclxuICAgIExFUVVBTDogNTE1LCAgIC8vIGdsLkxFUVVBTFxyXG4gICAgR1JFQVRFUjogNTE2LCAgLy8gZ2wuR1JFQVRFUlxyXG4gICAgTk9URVFVQUw6IDUxNywgLy8gZ2wuTk9URVFVQUxcclxuICAgIEdFUVVBTDogNTE4LCAgIC8vIGdsLkdFUVVBTFxyXG4gICAgQUxXQVlTOiA1MTksICAgLy8gZ2wuQUxXQVlTXHJcbn1cclxuXHJcbiAvLyBpbmRleCBidWZmZXIgZm9ybWF0XHJcbmV4cG9ydCBjb25zdCBnbGluZGV4X2J1ZmZlcl9mb3JtYXQgPSB7XHJcbiAgIFxyXG4gIElOREVYX0ZNVF9VSU5UODogNTEyMSwgIC8vIGdsLlVOU0lHTkVEX0JZVEVcclxuICBJTkRFWF9GTVRfVUlOVDE2OiA1MTIzLCAvLyBnbC5VTlNJR05FRF9TSE9SVFxyXG4gIElOREVYX0ZNVF9VSU5UMzI6IDUxMjUsIC8vIGdsLlVOU0lHTkVEX0lOVCAoT0VTX2VsZW1lbnRfaW5kZXhfdWludClcclxufVxyXG5cclxuIC8vIGJ1ZmZlciB1c2FnZVxyXG5leHBvcnQgY29uc3QgZ2xidWZmZXJfdXNhZ2U9IHtcclxuICBVU0FHRV9TVEFUSUM6IDM1MDQ0LCAgLy8gZ2wuU1RBVElDX0RSQVdcclxuICBVU0FHRV9EWU5BTUlDOiAzNTA0OCwgLy8gZ2wuRFlOQU1JQ19EUkFXXHJcbiAgVVNBR0VfU1RSRUFNOiAzNTA0MCwgIC8vIGdsLlNUUkVBTV9EUkFXXHJcbn1cclxuXHJcbi8vIGJsZW5kLWZ1bmNcclxuZXhwb3J0IGNvbnN0IGdsYmxlbmRfZnVuYyA9IHtcclxuICAgIEFERDogMzI3NzQsICAgICAgICAgICAgICAvLyBnbC5GVU5DX0FERFxyXG4gICAgU1VCVFJBQ1Q6IDMyNzc4LCAgICAgICAgIC8vIGdsLkZVTkNfU1VCVFJBQ1RcclxuICAgIFJFVkVSU0VfU1VCVFJBQ1Q6IDMyNzc5LCAvLyBnbC5GVU5DX1JFVkVSU0VfU1VCVFJBQ1RcclxufVxyXG5cclxuLy8gYmxlbmRcclxuZXhwb3J0IGNvbnN0IGdsYmxlbmQgPSB7XHJcbiAgICBaRVJPOiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2wuWkVST1xyXG4gICAgT05FOiAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdsLk9ORVxyXG4gICAgU1JDX0NPTE9SOiA3NjgsICAgICAgICAgICAgICAgICAgIC8vIGdsLlNSQ19DT0xPUlxyXG4gICAgT05FX01JTlVTX1NSQ19DT0xPUjogNzY5LCAgICAgICAgIC8vIGdsLk9ORV9NSU5VU19TUkNfQ09MT1JcclxuICAgIERTVF9DT0xPUjogNzc0LCAgICAgICAgICAgICAgICAgICAvLyBnbC5EU1RfQ09MT1JcclxuICAgIE9ORV9NSU5VU19EU1RfQ09MT1I6IDc3NSwgICAgICAgICAvLyBnbC5PTkVfTUlOVVNfRFNUX0NPTE9SXHJcbiAgICBTUkNfQUxQSEE6IDc3MCwgICAgICAgICAgICAgICAgICAgLy8gZ2wuU1JDX0FMUEhBXHJcbiAgICBPTkVfTUlOVVNfU1JDX0FMUEhBOiA3NzEsICAgICAgICAgLy8gZ2wuT05FX01JTlVTX1NSQ19BTFBIQVxyXG4gICAgRFNUX0FMUEhBOiA3NzIsICAgICAgICAgICAgICAgICAgIC8vIGdsLkRTVF9BTFBIQVxyXG4gICAgT05FX01JTlVTX0RTVF9BTFBIQTogNzczLCAgICAgICAgIC8vIGdsLk9ORV9NSU5VU19EU1RfQUxQSEFcclxuICAgIENPTlNUQU5UX0NPTE9SOiAzMjc2OSwgICAgICAgICAgICAvLyBnbC5DT05TVEFOVF9DT0xPUlxyXG4gICAgT05FX01JTlVTX0NPTlNUQU5UX0NPTE9SOiAzMjc3MCwgIC8vIGdsLk9ORV9NSU5VU19DT05TVEFOVF9DT0xPUlxyXG4gICAgQ09OU1RBTlRfQUxQSEE6IDMyNzcxLCAgICAgICAgICAgIC8vIGdsLkNPTlNUQU5UX0FMUEhBXHJcbiAgICBPTkVfTUlOVVNfQ09OU1RBTlRfQUxQSEE6IDMyNzcyLCAgLy8gZ2wuT05FX01JTlVTX0NPTlNUQU5UX0FMUEhBXHJcbiAgICBTUkNfQUxQSEFfU0FUVVJBVEU6IDc3NiwgICAgICAgICAgLy8gZ2wuU1JDX0FMUEhBX1NBVFVSQVRFXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAbWV0aG9kIGdsRmlsdGVyXHJcbiAqIEBwYXJhbSB7V2ViR0xDb250ZXh0fSBnbFxyXG4gKiBAcGFyYW0ge0ZJTFRFUl8qfSBmaWx0ZXJcclxuICogQHBhcmFtIHtGSUxURVJfKn0gbWlwRmlsdGVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2xGaWx0ZXIoZ2wsIGZpbHRlciwgbWlwRmlsdGVyID0gLTEpIHtcclxuICAgIGxldCByZXN1bHQgPSBfZmlsdGVyR0xbZmlsdGVyXVttaXBGaWx0ZXIgKyAxXTtcclxuICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBGSUxURVI6ICR7ZmlsdGVyfWApO1xyXG4gICAgICAgIHJldHVybiBtaXBGaWx0ZXIgPT09IC0xID8gZ2x0ZXhfZmlsdGVyLkxJTkVBUiA6IGdsdGV4X2ZpbHRlci5MSU5FQVJfTUlQTUFQX0xJTkVBUjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogQG1ldGhvZCBnbFRleHR1cmVGbXRcclxuICogQHBhcmFtIHtnbHRleF9mb3JtYXR9IGZtdFxyXG4gKiBAcmV0dXJuIHtmb3JtYXQsaW50ZXJuYWxGb3JtYXQscGl4ZWxUeXBlfSByZXN1bHRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnbFRleHR1cmVGbXRJbmZvcihmbXQ6Z2x0ZXhfZm9ybWF0KSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gX3RleHR1cmVGbXRHTFtmbXRdO1xyXG4gICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGBVbmtub3duIFRFWFRVUkVfRk1UOiAke2ZtdH1gKTtcclxuICAgICAgICByZXR1cm4gX3RleHR1cmVGbXRHTFtnbHRleF9mb3JtYXQuUkdCQThdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qXHJcbmZvcm1hdCAgICAgICAgICAgICAgICB0eXBlICAgICAgICAgICAg6YCa6YGT5pWwIOmAmumBk+aAu+Wtl+iKguaVsFxyXG5SR0JBICAgICAgICAgXHQgVU5TSUdORURfQllURVx0ICAgICAgICA0XHQgICAgNFxyXG5SR0JcdCAgICAgICAgICAgICBVTlNJR05FRF9CWVRFXHQgICAgICAgIDNcdCAgICAzXHJcblJHQkEgICAgICAgICAgICAgVU5TSUdORURfU0hPUlRfNF80XzRfNFx0NFx0ICAgIDJcclxuUkdCQSAgICAgICAgIFx0IFVOU0lHTkVEX1NIT1JUXzVfNV81XzFcdDRcdCAgICAyXHJcblJHQlx0ICAgICAgICAgICAgIFVOU0lHTkVEX1NIT1JUXzVfNl81ICAgM1x0ICAgIDJcclxuTFVNSU5BTkNFX0FMUEhBXHQgVU5TSUdORURfQllURSAgICAgICBcdDJcdCAgICAyXHJcbkxVTUlOQU5DRSAgIFx0IFVOU0lHTkVEX0JZVEUgICAgICBcdDFcdCAgICAxXHJcbkFMUEhBICAgICAgIFx0IFVOU0lHTkVEX0JZVEUgICAgICAgXHQxXHQgICAgMVxyXG4qL1xyXG5jb25zdCBnbGZvcm1hdF90eXBlX2J5dGVzID0ge307XHJcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5SR0JBXSA9IHt9O1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuUkdCXSA9IHt9O1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBXSA9IHt9O1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuTFVNSU5BTkNFXSA9IHt9O1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuQUxQSEFdID0ge307XHJcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5SR0JBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSA0O1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuUkdCXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAzO1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuUkdCQV1bZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzRfNF80XzRdID0gMjtcclxuZ2xmb3JtYXRfdHlwZV9ieXRlc1tnbHRleF9uZm10LlJHQkFdW2dsVHlwZS5VTlNJR05FRF9TSE9SVF81XzVfNV8xXSA9IDI7XHJcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5SR0JdW2dsVHlwZS5VTlNJR05FRF9TSE9SVF81XzZfNV0gPSAyO1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAyO1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuTFVNSU5BTkNFXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAxO1xyXG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuQUxQSEFdW2dsVHlwZS5VTlNJR05FRF9CWVRFXSA9IDE7XHJcblxyXG5jb25zdCBnbGZvcm1hdF90eXBlX2NoYW5lbHMgPSB7fTtcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCQV0gPSB7fTtcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCXSA9IHt9O1xyXG5nbGZvcm1hdF90eXBlX2NoYW5lbHNbZ2x0ZXhfbmZtdC5MVU1JTkFOQ0VfQUxQSEFdID0ge307XHJcbmdsZm9ybWF0X3R5cGVfY2hhbmVsc1tnbHRleF9uZm10LkxVTUlOQU5DRV0gPSB7fTtcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuQUxQSEFdID0ge307XHJcbmdsZm9ybWF0X3R5cGVfY2hhbmVsc1tnbHRleF9uZm10LlJHQkFdW2dsVHlwZS5VTlNJR05FRF9CWVRFXSA9IDQ7XHJcbmdsZm9ybWF0X3R5cGVfY2hhbmVsc1tnbHRleF9uZm10LlJHQl1bZ2xUeXBlLlVOU0lHTkVEX0JZVEVdID0gMztcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCQV1bZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzRfNF80XzRdID0gNDtcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCQV1bZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzVfNV81XzFdID0gNDtcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCXVtnbFR5cGUuVU5TSUdORURfU0hPUlRfNV82XzVdID0gMztcclxuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAyO1xyXG5nbGZvcm1hdF90eXBlX2NoYW5lbHNbZ2x0ZXhfbmZtdC5MVU1JTkFOQ0VdW2dsVHlwZS5VTlNJR05FRF9CWVRFXSA9IDE7XHJcbmdsZm9ybWF0X3R5cGVfY2hhbmVsc1tnbHRleF9uZm10LkFMUEhBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAxO1xyXG5cclxuLyoqXHJcbiAqIOiOt+WPlue6ueeQhueahOmAmumBk+aVsFxyXG4gKiBAbWV0aG9kIGdsVGV4dHVyZUNoYW5lbFRvdGFsQnl0ZXNcclxuICogQHBhcmFtIHtnbHRleF9mb3JtYXR9IGZtdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdsVGV4dHVyZVRvdGFsQ2hhbmVscyhmbXQpOm51bWJlcntcclxuICAgIGxldCByZXN1bHQgPSAgZ2xUZXh0dXJlRm10SW5mb3IoZm10KTtcclxuICAgIGxldCByZSA9IGdsZm9ybWF0X3R5cGVfY2hhbmVsc1tyZXN1bHQuZm9ybWF0XVtyZXN1bHQucGl4ZWxUeXBlXTtcclxuICAgIGlmKCFyZSlcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJnbFRleHR1cmVUb3RhbENoYW5lbHMg5oql6ZSZLFwiLHJlc3VsdCk7XHJcbiAgICAgICAgcmUgPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlO1xyXG59XHJcbi8qKlxyXG4gKiDojrflj5bnurnnkIbnmoTpgJrpgZPlrZfoioLmlbBcclxuICogQG1ldGhvZCBnbFRleHR1cmVDaGFuZWxUb3RhbEJ5dGVzXHJcbiAqIEBwYXJhbSB7Z2x0ZXhfZm9ybWF0fSBmbXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnbFRleHR1cmVDaGFuZWxUb3RhbEJ5dGVzKGZtdCk6bnVtYmVye1xyXG4gICAgIGxldCByZXN1bHQgPSAgZ2xUZXh0dXJlRm10SW5mb3IoZm10KTtcclxuICAgICBsZXQgcmUgPSBnbGZvcm1hdF90eXBlX2J5dGVzW3Jlc3VsdC5mb3JtYXRdW3Jlc3VsdC5waXhlbFR5cGVdO1xyXG4gICAgIGlmKCFyZSlcclxuICAgICB7XHJcbiAgICAgICAgIGNvbnNvbGUud2FybihcImdsVGV4dHVyZUNoYW5lbFRvdGFsQnl0ZXMg5oql6ZSZLFwiLHJlc3VsdCk7XHJcbiAgICAgICAgIHJlID0gMDtcclxuICAgICB9XHJcbiAgICAgcmV0dXJuIHJlO1xyXG59XHJcblxyXG5cclxuXHJcbiIsIlxyXG5cclxuZXhwb3J0IGNvbnN0IGdsRXJyb3JzID0ge1xyXG4gICAgWzFdOntlcnJvcjpcImZhaWxlZCB0byBjb21waWxlIHNoYWRlcjogRVJST1I6IDA6MSA6IE5vIHByY2Vpc2lvbiBzcGVjaWZpZWQgZm9yIChmbG9hdClcIixcclxuICAgIHJlYXNvbjpcIuayoeacieWcqOeJh+WFg+edgOiJsuWZqOS4reaMh+WummZsb2F055qE57K+5bqmXCJ9LFxyXG4gICAgWzJdOntlcnJvcjpcIuexu+Wei+S4jeWMuemFjVwiLHJlYXNvbjpcIue8lueoi+eahOaXtuWAme+8jOWmguaenOa1rueCueaVsOWImuWlveaYrzDjgIEx562J5pW05pWw5YC877yM6KaB5rOo5oSP5Lmm5YaZ5Li6MC4wLDEuMO+8jFxcXHJcbiAgICDkuI3og73nnIHnlaXngrnvvIzlpoLmnpznm7TmjqXlhpkw44CBMeetieW9ouW8j++8jOezu+e7n+S8muivhuWIq+S4uuaVtOWei+aVsO+8jOi/m+ihjOi/kOeul+eahOi/h+eoi+S4re+8jOWmguaenOaKiuaVsOaNruexu+Wei+aQnumUmeWPr+iDveS8muaKpemUmVwifSxcclxuICAgIFszXTp7ZXJyb3I6XCJXZWJHTDogSU5WQUxJRF9PUEVSQVRJT046IHRleEltYWdlMkQ6IEFycmF5QnVmZmVyVmlldyBub3QgYmlnIGVub3VnaCBmb3IgcmVxdWVzdFwiLFxyXG4gICAgcmVhc29uOlwi5oiR5Lus5Lyg5YWl55qE57q555CG5pWw5o2u5ZKM57q555CG5qC85byP5LiN5Yy56YWN77yM57q555CG5pWw5o2u5pyJ5a696auYLOe6ueeQhuagvOW8j+S8muWGs+Wumuavj+S4gOS4quWDj+e0oOWPluWHoOS4que6ueeQhuaVsOaNrlwifVxyXG5cclxufVxyXG4vKipcclxuICogZW51bXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBnbEVudW1zID0ge1xyXG4gICAgLy8gYnVmZmVyIHVzYWdlXHJcbiAgICBVU0FHRV9TVEFUSUM6IDM1MDQ0LCAgLy8gZ2wuU1RBVElDX0RSQVdcclxuICAgIFVTQUdFX0RZTkFNSUM6IDM1MDQ4LCAvLyBnbC5EWU5BTUlDX0RSQVdcclxuICAgIFVTQUdFX1NUUkVBTTogMzUwNDAsICAvLyBnbC5TVFJFQU1fRFJBV1xyXG4gIFxyXG4gICAgLy8gaW5kZXggYnVmZmVyIGZvcm1hdFxyXG4gICAgSU5ERVhfRk1UX1VJTlQ4OiA1MTIxLCAgLy8gZ2wuVU5TSUdORURfQllURVxyXG4gICAgSU5ERVhfRk1UX1VJTlQxNjogNTEyMywgLy8gZ2wuVU5TSUdORURfU0hPUlRcclxuICAgIElOREVYX0ZNVF9VSU5UMzI6IDUxMjUsIC8vIGdsLlVOU0lHTkVEX0lOVCAoT0VTX2VsZW1lbnRfaW5kZXhfdWludClcclxuICBcclxuICAgIC8vIHZlcnRleCBhdHRyaWJ1dGUgc2VtYW50aWNcclxuICAgIEFUVFJfUE9TSVRJT046ICdhX3Bvc2l0aW9uJyxcclxuICAgIEFUVFJfTk9STUFMOiAnYV9ub3JtYWwnLFxyXG4gICAgQVRUUl9UQU5HRU5UOiAnYV90YW5nZW50JyxcclxuICAgIEFUVFJfQklUQU5HRU5UOiAnYV9iaXRhbmdlbnQnLFxyXG4gICAgQVRUUl9XRUlHSFRTOiAnYV93ZWlnaHRzJyxcclxuICAgIEFUVFJfSk9JTlRTOiAnYV9qb2ludHMnLFxyXG4gICAgQVRUUl9DT0xPUjogJ2FfY29sb3InLFxyXG4gICAgQVRUUl9DT0xPUjA6ICdhX2NvbG9yMCcsXHJcbiAgICBBVFRSX0NPTE9SMTogJ2FfY29sb3IxJyxcclxuICAgIEFUVFJfVVY6ICdhX3V2JyxcclxuICAgIEFUVFJfVVYwOiAnYV91djAnLFxyXG4gICAgQVRUUl9VVjE6ICdhX3V2MScsXHJcbiAgICBBVFRSX1VWMjogJ2FfdXYyJyxcclxuICAgIEFUVFJfVVYzOiAnYV91djMnLFxyXG4gICAgQVRUUl9VVjQ6ICdhX3V2NCcsXHJcbiAgICBBVFRSX1VWNTogJ2FfdXY1JyxcclxuICAgIEFUVFJfVVY2OiAnYV91djYnLFxyXG4gICAgQVRUUl9VVjc6ICdhX3V2NycsXHJcbiAgICBBVFRSX1RFWF9DT09SRDogJ2FfdGV4Q29vcmQnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQxOiAnYV90ZXhDb29yZDEnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQyOiAnYV90ZXhDb29yZDInLFxyXG4gICAgQVRUUl9URVhfQ09PUkQzOiAnYV90ZXhDb29yZDMnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQ0OiAnYV90ZXhDb29yZDQnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQ1OiAnYV90ZXhDb29yZDUnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQ2OiAnYV90ZXhDb29yZDYnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQ3OiAnYV90ZXhDb29yZDcnLFxyXG4gICAgQVRUUl9URVhfQ09PUkQ4OiAnYV90ZXhDb29yZDgnLFxyXG4gIFxyXG4gIFxyXG4gICAgLy8gdmVydGV4IGF0dHJpYnV0ZSB0eXBlXHJcbiAgICBBVFRSX1RZUEVfSU5UODogNTEyMCwgICAgLy8gZ2wuQllURVxyXG4gICAgQVRUUl9UWVBFX1VJTlQ4OiA1MTIxLCAgIC8vIGdsLlVOU0lHTkVEX0JZVEVcclxuICAgIEFUVFJfVFlQRV9JTlQxNjogNTEyMiwgICAvLyBnbC5TSE9SVFxyXG4gICAgQVRUUl9UWVBFX1VJTlQxNjogNTEyMywgIC8vIGdsLlVOU0lHTkVEX1NIT1JUXHJcbiAgICBBVFRSX1RZUEVfSU5UMzI6IDUxMjQsICAgLy8gZ2wuSU5UXHJcbiAgICBBVFRSX1RZUEVfVUlOVDMyOiA1MTI1LCAgLy8gZ2wuVU5TSUdORURfSU5UXHJcbiAgICBBVFRSX1RZUEVfRkxPQVQzMjogNTEyNiwgLy8gZ2wuRkxPQVRcclxuICBcclxuICAgIC8vIHRleHR1cmUgZmlsdGVyXHJcbiAgICBGSUxURVJfTkVBUkVTVDogMCxcclxuICAgIEZJTFRFUl9MSU5FQVI6IDEsXHJcbiAgXHJcbiAgICAvLyB0ZXh0dXJlIHdyYXAgbW9kZVxyXG4gICAgV1JBUF9SRVBFQVQ6IDEwNDk3LCAvLyBnbC5SRVBFQVRcclxuICAgIFdSQVBfQ0xBTVA6IDMzMDcxLCAgLy8gZ2wuQ0xBTVBfVE9fRURHRVxyXG4gICAgV1JBUF9NSVJST1I6IDMzNjQ4LCAvLyBnbC5NSVJST1JFRF9SRVBFQVRcclxuICBcclxuICAgIC8vIHRleHR1cmUgZm9ybWF0XHJcbiAgICAvLyBjb21wcmVzcyBmb3JtYXRzXHJcbiAgICBURVhUVVJFX0ZNVF9SR0JfRFhUMTogMCxcclxuICAgIFRFWFRVUkVfRk1UX1JHQkFfRFhUMTogMSxcclxuICAgIFRFWFRVUkVfRk1UX1JHQkFfRFhUMzogMixcclxuICAgIFRFWFRVUkVfRk1UX1JHQkFfRFhUNTogMyxcclxuICAgIFRFWFRVUkVfRk1UX1JHQl9FVEMxOiA0LFxyXG4gICAgVEVYVFVSRV9GTVRfUkdCX1BWUlRDXzJCUFBWMTogNSxcclxuICAgIFRFWFRVUkVfRk1UX1JHQkFfUFZSVENfMkJQUFYxOiA2LFxyXG4gICAgVEVYVFVSRV9GTVRfUkdCX1BWUlRDXzRCUFBWMTogNyxcclxuICAgIFRFWFRVUkVfRk1UX1JHQkFfUFZSVENfNEJQUFYxOiA4LFxyXG4gIFxyXG4gICAgLy8gbm9ybWFsIGZvcm1hdHNcclxuICAgIFRFWFRVUkVfRk1UX0E4OiA5LFxyXG4gICAgVEVYVFVSRV9GTVRfTDg6IDEwLFxyXG4gICAgVEVYVFVSRV9GTVRfTDhfQTg6IDExLFxyXG4gICAgVEVYVFVSRV9GTVRfUjVfRzZfQjU6IDEyLFxyXG4gICAgVEVYVFVSRV9GTVRfUjVfRzVfQjVfQTE6IDEzLFxyXG4gICAgVEVYVFVSRV9GTVRfUjRfRzRfQjRfQTQ6IDE0LFxyXG4gICAgVEVYVFVSRV9GTVRfUkdCODogMTUsXHJcbiAgICBURVhUVVJFX0ZNVF9SR0JBODogMTYsXHJcbiAgICBURVhUVVJFX0ZNVF9SR0IxNkY6IDE3LFxyXG4gICAgVEVYVFVSRV9GTVRfUkdCQTE2RjogMTgsXHJcbiAgICBURVhUVVJFX0ZNVF9SR0IzMkY6IDE5LFxyXG4gICAgVEVYVFVSRV9GTVRfUkdCQTMyRjogMjAsXHJcbiAgICBURVhUVVJFX0ZNVF9SMzJGOiAyMSxcclxuICAgIFRFWFRVUkVfRk1UXzExMTExMEY6IDIyLFxyXG4gICAgVEVYVFVSRV9GTVRfU1JHQjogMjMsXHJcbiAgICBURVhUVVJFX0ZNVF9TUkdCQTogMjQsXHJcbiAgXHJcbiAgICAvLyBkZXB0aCBmb3JtYXRzXHJcbiAgICBURVhUVVJFX0ZNVF9EMTY6IDI1LFxyXG4gICAgVEVYVFVSRV9GTVRfRDMyOiAyNixcclxuICAgIFRFWFRVUkVfRk1UX0QyNFM4OiAyNyxcclxuICBcclxuICAgIC8vIGV0YzIgZm9ybWF0XHJcbiAgICBURVhUVVJFX0ZNVF9SR0JfRVRDMjogMjgsXHJcbiAgICBURVhUVVJFX0ZNVF9SR0JBX0VUQzI6IDI5LFxyXG4gIFxyXG4gICAgLy8gZGVwdGggYW5kIHN0ZW5jaWwgZnVuY3Rpb25cclxuICAgIERTX0ZVTkNfTkVWRVI6IDUxMiwgICAgLy8gZ2wuTkVWRVJcclxuICAgIERTX0ZVTkNfTEVTUzogNTEzLCAgICAgLy8gZ2wuTEVTU1xyXG4gICAgRFNfRlVOQ19FUVVBTDogNTE0LCAgICAvLyBnbC5FUVVBTFxyXG4gICAgRFNfRlVOQ19MRVFVQUw6IDUxNSwgICAvLyBnbC5MRVFVQUxcclxuICAgIERTX0ZVTkNfR1JFQVRFUjogNTE2LCAgLy8gZ2wuR1JFQVRFUlxyXG4gICAgRFNfRlVOQ19OT1RFUVVBTDogNTE3LCAvLyBnbC5OT1RFUVVBTFxyXG4gICAgRFNfRlVOQ19HRVFVQUw6IDUxOCwgICAvLyBnbC5HRVFVQUxcclxuICAgIERTX0ZVTkNfQUxXQVlTOiA1MTksICAgLy8gZ2wuQUxXQVlTXHJcbiAgXHJcbiAgICAvLyByZW5kZXItYnVmZmVyIGZvcm1hdFxyXG4gICAgUkJfRk1UX1JHQkE0OiAzMjg1NCwgICAgLy8gZ2wuUkdCQTRcclxuICAgIFJCX0ZNVF9SR0I1X0ExOiAzMjg1NSwgIC8vIGdsLlJHQjVfQTFcclxuICAgIFJCX0ZNVF9SR0I1NjU6IDM2MTk0LCAgIC8vIGdsLlJHQjU2NVxyXG4gICAgUkJfRk1UX0QxNjogMzMxODksICAgICAgLy8gZ2wuREVQVEhfQ09NUE9ORU5UMTZcclxuICAgIFJCX0ZNVF9TODogMzYxNjgsICAgICAgIC8vIGdsLlNURU5DSUxfSU5ERVg4XHJcbiAgICBSQl9GTVRfRDI0Uzg6IDM0MDQxLCAgICAvLyBnbC5ERVBUSF9TVEVOQ0lMXHJcbiAgXHJcbiAgICAvLyBibGVuZC1lcXVhdGlvblxyXG4gICAgQkxFTkRfRlVOQ19BREQ6IDMyNzc0LCAgICAgICAgICAgICAgLy8gZ2wuRlVOQ19BRERcclxuICAgIEJMRU5EX0ZVTkNfU1VCVFJBQ1Q6IDMyNzc4LCAgICAgICAgIC8vIGdsLkZVTkNfU1VCVFJBQ1RcclxuICAgIEJMRU5EX0ZVTkNfUkVWRVJTRV9TVUJUUkFDVDogMzI3NzksIC8vIGdsLkZVTkNfUkVWRVJTRV9TVUJUUkFDVFxyXG4gIFxyXG4gICAgLy8gYmxlbmRcclxuICAgIEJMRU5EX1pFUk86IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnbC5aRVJPXHJcbiAgICBCTEVORF9PTkU6IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2wuT05FXHJcbiAgICBCTEVORF9TUkNfQ09MT1I6IDc2OCwgICAgICAgICAgICAgICAgICAgLy8gZ2wuU1JDX0NPTE9SXHJcbiAgICBCTEVORF9PTkVfTUlOVVNfU1JDX0NPTE9SOiA3NjksICAgICAgICAgLy8gZ2wuT05FX01JTlVTX1NSQ19DT0xPUlxyXG4gICAgQkxFTkRfRFNUX0NPTE9SOiA3NzQsICAgICAgICAgICAgICAgICAgIC8vIGdsLkRTVF9DT0xPUlxyXG4gICAgQkxFTkRfT05FX01JTlVTX0RTVF9DT0xPUjogNzc1LCAgICAgICAgIC8vIGdsLk9ORV9NSU5VU19EU1RfQ09MT1JcclxuICAgIEJMRU5EX1NSQ19BTFBIQTogNzcwLCAgICAgICAgICAgICAgICAgICAvLyBnbC5TUkNfQUxQSEFcclxuICAgIEJMRU5EX09ORV9NSU5VU19TUkNfQUxQSEE6IDc3MSwgICAgICAgICAvLyBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBXHJcbiAgICBCTEVORF9EU1RfQUxQSEE6IDc3MiwgICAgICAgICAgICAgICAgICAgLy8gZ2wuRFNUX0FMUEhBXHJcbiAgICBCTEVORF9PTkVfTUlOVVNfRFNUX0FMUEhBOiA3NzMsICAgICAgICAgLy8gZ2wuT05FX01JTlVTX0RTVF9BTFBIQVxyXG4gICAgQkxFTkRfQ09OU1RBTlRfQ09MT1I6IDMyNzY5LCAgICAgICAgICAgIC8vIGdsLkNPTlNUQU5UX0NPTE9SXHJcbiAgICBCTEVORF9PTkVfTUlOVVNfQ09OU1RBTlRfQ09MT1I6IDMyNzcwLCAgLy8gZ2wuT05FX01JTlVTX0NPTlNUQU5UX0NPTE9SXHJcbiAgICBCTEVORF9DT05TVEFOVF9BTFBIQTogMzI3NzEsICAgICAgICAgICAgLy8gZ2wuQ09OU1RBTlRfQUxQSEFcclxuICAgIEJMRU5EX09ORV9NSU5VU19DT05TVEFOVF9BTFBIQTogMzI3NzIsICAvLyBnbC5PTkVfTUlOVVNfQ09OU1RBTlRfQUxQSEFcclxuICAgIEJMRU5EX1NSQ19BTFBIQV9TQVRVUkFURTogNzc2LCAgICAgICAgICAvLyBnbC5TUkNfQUxQSEFfU0FUVVJBVEVcclxuICBcclxuICAgIC8vIHN0ZW5jaWwgb3BlcmF0aW9uXHJcbiAgICBTVEVOQ0lMX0RJU0FCTEU6IDAsICAgICAgICAgICAgIC8vIGRpc2FibGUgc3RlbmNpbFxyXG4gICAgU1RFTkNJTF9FTkFCTEU6IDEsICAgICAgICAgICAgICAvLyBlbmFibGUgc3RlbmNpbFxyXG4gICAgU1RFTkNJTF9JTkhFUklUOiAyLCAgICAgICAgICAgICAvLyBpbmhlcml0IHN0ZW5jaWwgc3RhdGVzXHJcbiAgXHJcbiAgICBTVEVOQ0lMX09QX0tFRVA6IDc2ODAsICAgICAgICAgIC8vIGdsLktFRVBcclxuICAgIFNURU5DSUxfT1BfWkVSTzogMCwgICAgICAgICAgICAgLy8gZ2wuWkVST1xyXG4gICAgU1RFTkNJTF9PUF9SRVBMQUNFOiA3NjgxLCAgICAgICAvLyBnbC5SRVBMQUNFXHJcbiAgICBTVEVOQ0lMX09QX0lOQ1I6IDc2ODIsICAgICAgICAgIC8vIGdsLklOQ1JcclxuICAgIFNURU5DSUxfT1BfSU5DUl9XUkFQOiAzNDA1NSwgICAgLy8gZ2wuSU5DUl9XUkFQXHJcbiAgICBTVEVOQ0lMX09QX0RFQ1I6IDc2ODMsICAgICAgICAgIC8vIGdsLkRFQ1JcclxuICAgIFNURU5DSUxfT1BfREVDUl9XUkFQOiAzNDA1NiwgICAgLy8gZ2wuREVDUl9XUkFQXHJcbiAgICBTVEVOQ0lMX09QX0lOVkVSVDogNTM4NiwgICAgICAgIC8vIGdsLklOVkVSVFxyXG4gIFxyXG4gICAgLy8gY3VsbFxyXG4gICAgQ1VMTF9OT05FOiAwLFxyXG4gICAgQ1VMTF9GUk9OVDogMTAyOCxcclxuICAgIENVTExfQkFDSzogMTAyOSxcclxuICAgIENVTExfRlJPTlRfQU5EX0JBQ0s6IDEwMzIsXHJcbiAgXHJcbiAgICAvLyBwcmltaXRpdmUgdHlwZVxyXG4gICAgUFRfUE9JTlRTOiAwLCAgICAgICAgIC8vIGdsLlBPSU5UU1xyXG4gICAgUFRfTElORVM6IDEsICAgICAgICAgIC8vIGdsLkxJTkVTXHJcbiAgICBQVF9MSU5FX0xPT1A6IDIsICAgICAgLy8gZ2wuTElORV9MT09QXHJcbiAgICBQVF9MSU5FX1NUUklQOiAzLCAgICAgLy8gZ2wuTElORV9TVFJJUFxyXG4gICAgUFRfVFJJQU5HTEVTOiA0LCAgICAgIC8vIGdsLlRSSUFOR0xFU1xyXG4gICAgUFRfVFJJQU5HTEVfU1RSSVA6IDUsIC8vIGdsLlRSSUFOR0xFX1NUUklQXHJcbiAgICBQVF9UUklBTkdMRV9GQU46IDYsICAgLy8gZ2wuVFJJQU5HTEVfRkFOXHJcbn07XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIEdMYXBpIHtcclxuXHJcbiAgICAvL+acrOWcsG9wZWds5LiK5LiL5paHXHJcbiAgICB2YXIgZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0O1xyXG5cclxuICAgIC8v5q2k5Ye95pWw5Yqh5b+F6LCD55SoXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gYmluZEdMKGdsVCk6IHZvaWQge1xyXG4gICAgICAgIGdsID0gZ2xUO1xyXG5cclxuICAgICAgICBHTGFwaS5nbFRFWFRVUkVfTUFHX0ZJTFRFUiA9IGdsLlRFWFRVUkVfTUFHX0ZJTFRFUjtcclxuICAgICAgICBHTGFwaS5nbFRFWFRVUkVfTUlOX0ZJTFRFUiA9IGdsLlRFWFRVUkVfTUlOX0ZJTFRFUjtcclxuICAgIH1cclxuICAgIGV4cG9ydCB2YXIgZ2xURVhUVVJFX01BR19GSUxURVI7XHJcbiAgICBleHBvcnQgdmFyIGdsVEVYVFVSRV9NSU5fRklMVEVSO1xyXG4gICBcclxuXHJcblxyXG4gICAgLyoqXHJcbiAqIEBtZXRob2QgYXR0clR5cGVCeXRlc1xyXG4gKiBAcGFyYW0ge0FUVFJfVFlQRV8qfSBhdHRyVHlwZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGF0dHJUeXBlQnl0ZXMoYXR0clR5cGUpIHtcclxuICAgIFxyXG4gICAgaWYgKGF0dHJUeXBlID09PSBnbEVudW1zLkFUVFJfVFlQRV9JTlQ4KSB7XHJcbiAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIGlmIChhdHRyVHlwZSA9PT0gZ2xFbnVtcy5BVFRSX1RZUEVfVUlOVDgpIHtcclxuICAgICAgcmV0dXJuIDE7XHJcbiAgICB9IGVsc2UgaWYgKGF0dHJUeXBlID09PSBnbEVudW1zLkFUVFJfVFlQRV9JTlQxNikge1xyXG4gICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoYXR0clR5cGUgPT09IGdsRW51bXMuQVRUUl9UWVBFX1VJTlQxNikge1xyXG4gICAgICByZXR1cm4gMjtcclxuICAgIH0gZWxzZSBpZiAoYXR0clR5cGUgPT09IGdsRW51bXMuQVRUUl9UWVBFX0lOVDMyKSB7XHJcbiAgICAgIHJldHVybiA0O1xyXG4gICAgfSBlbHNlIGlmIChhdHRyVHlwZSA9PT0gZ2xFbnVtcy5BVFRSX1RZUEVfVUlOVDMyKSB7XHJcbiAgICAgIHJldHVybiA0O1xyXG4gICAgfSBlbHNlIGlmIChhdHRyVHlwZSA9PT0gZ2xFbnVtcy5BVFRSX1RZUEVfRkxPQVQzMikge1xyXG4gICAgICByZXR1cm4gNDtcclxuICAgIH1cclxuICBcclxuICAgIGNvbnNvbGUud2FybihgVW5rbm93biBBVFRSX1RZUEU6ICR7YXR0clR5cGV9YCk7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlsIZidWZmZXLnu5HlrprliLDnm67moIfnvJPlhrLljLpcclxuICAgICAqIEBwYXJhbSB0YXJnZXQgXHJcbiAgICAgKiBHTGVudW3mjIflrprnu5PlkIjngrnvvIjnm67moIfvvInjgILlj6/og73nmoTlgLzvvJpcclxuICAgICAgICBnbC5BUlJBWV9CVUZGRVLvvJrljIXlkKvpobbngrnlsZ7mgKfnmoTnvJPlhrLljLrvvIzkvovlpoLpobbngrnlnZDmoIfvvIznurnnkIblnZDmoIfmlbDmja7miJbpobbngrnpopzoibLmlbDmja7jgIJcclxuICAgICAgICBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUu+8mueUqOS6juWFg+e0oOe0ouW8leeahOe8k+WGsuWMuuOAglxyXG4gICAgICAgIOS9v+eUqFdlYkdMIDLkuIrkuIvmlofml7bvvIzov5jlj6/ku6Xkvb/nlKjku6XkuIvlgLzvvJpcclxuICAgICAgICBnbC5DT1BZX1JFQURfQlVGRkVS77ya55So5LqO5LuO5LiA5Liq57yT5Yay5Yy65a+56LGh5aSN5Yi25Yiw5Y+m5LiA5Liq57yT5Yay5Yy65a+56LGh55qE57yT5Yay5Yy644CCXHJcbiAgICAgICAgZ2wuQ09QWV9XUklURV9CVUZGRVLvvJrnlKjkuo7ku47kuIDkuKrnvJPlhrLljLrlr7nosaHlpI3liLbliLDlj6bkuIDkuKrnvJPlhrLljLrlr7nosaHnmoTnvJPlhrLljLrjgIJcclxuICAgICAgICBnbC5UUkFOU0ZPUk1fRkVFREJBQ0tfQlVGRkVS77ya55So5LqO5Y+Y5o2i5Y+N6aaI5pON5L2c55qE57yT5Yay5Yy644CCXHJcbiAgICAgICAgZ2wuVU5JRk9STV9CVUZGRVLvvJrnlKjkuo7lrZjlgqjnu5/kuIDlnZfnmoTnvJPlhrLljLrjgIJcclxuICAgICAgICBnbC5QSVhFTF9QQUNLX0JVRkZFUu+8mueUqOS6juWDj+e0oOS8oOi+k+aTjeS9nOeahOe8k+WGsuWMuuOAglxyXG4gICAgICAgIGdsLlBJWEVMX1VOUEFDS19CVUZGRVLvvJrnlKjkuo7lg4/ntKDkvKDovpPmk43kvZznmoTnvJPlhrLljLrjgIJcclxuICAgICAqIEBwYXJhbSBidWZmZXIgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBiaW5kQnVmZmVyKHRhcmdldCwgYnVmZmVyKSB7XHJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIGJ1ZmZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gbW9kZSBcclxuICAgICAqIOaemuS4vuexu+WeiyDmjIflrpropoHmuLLmn5PnmoTlm77lhYPnsbvlnovjgILlj6/ku6XmmK/ku6XkuIvnsbvlnos6XHJcbiAgICAgICAgZ2wuUE9JTlRTOiDnlLvljZXni6znmoTngrnjgIJcclxuICAgICAgICBnbC5MSU5FX1NUUklQOiDnlLvkuIDmnaHnm7Tnur/liLDkuIvkuIDkuKrpobbngrnjgIJcclxuICAgICAgICBnbC5MSU5FX0xPT1A6IOe7mOWItuS4gOadoeebtOe6v+WIsOS4i+S4gOS4qumhtueCue+8jOW5tuWwhuacgOWQjuS4gOS4qumhtueCuei/lOWbnuWIsOesrOS4gOS4qumhtueCuS5cclxuICAgICAgICBnbC5MSU5FUzog5Zyo5LiA5a+56aG254K55LmL6Ze055S75LiA5p2h57q/LlxyXG4gICAgICAgIGdsLlRSSUFOR0xFX1NUUklQXHJcbiAgICAgICAgZ2wuVFJJQU5HTEVfRkFOXHJcbiAgICAgICAgZ2wuVFJJQU5HTEVTOiDkuLrkuIDnu4TkuInkuKrpobbngrnnu5jliLbkuIDkuKrkuInop5LlvaIuXHJcbiAgICAgKiBAcGFyYW0gY291bnQgXHJcbiAgICAgICAg5pW05pWw5Z6LIOaMh+Wumuimgea4suafk+eahOWFg+e0oOaVsOmHj1xyXG4gICAgICogQHBhcmFtIHR5cGUgXHJcbiAgICAgICAg5p6a5Li+57G75Z6LIOaMh+WumuWFg+e0oOaVsOe7hOe8k+WGsuWMuuS4reeahOWAvOeahOexu+Wei+OAguWPr+iDveeahOWAvOaYrzpcclxuICAgICAgICBnbC5VTlNJR05FRF9CWVRFXHJcbiAgICAgICAgZ2wuVU5TSUdORURfU0hPUlRcclxuICAgICAgICDlvZPkvb/nlKggT0VTX2VsZW1lbnRfaW5kZXhfdWludCDmianlsZXml7Y6XHJcbiAgICAgICAgZ2wuVU5TSUdORURfSU5UXHJcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IFxyXG4gICAgICAgICDlrZfoioLljZXkvY0g5oyH5a6a5YWD57Sg5pWw57uE57yT5Yay5Yy65Lit55qE5YGP56e76YeP44CC5b+F6aG75piv57uZ5a6a57G75Z6L5aSn5bCP55qE5pyJ5pWI5YCN5pWwXHJcbiAgICAgICAgQHJldHVybnNcclxuICAgICAgICBub25lXHJcbiAgICAgICAgQGVycm9yXHJcbiAgICAgICAg5aaC5p6cIG1vZGUg5LiN5piv5q2j56Gu5YC8LCAgZ2wuSU5WQUxJRF9FTlVNIOWwhuS8muaKm+WHuumUmeivr+W8guW4uC5cclxuICAgICAgICDlpoLmnpxvZmZzZXQg5LiN5piv57uZ5a6a57G75Z6L5aSn5bCP55qE5pyJ5pWI5YCN5pWwLCBnbC5JTlZBTElEX09QRVJBVElPTiDlsIbkvJrmipvlh7rplJnor6/lvILluLguXHJcbiAgICAgICAg5aaC5p6cIGNvdW50IOaYr+i0n+eahCwgIGdsLklOVkFMSURfVkFMVUUg5bCG5Lya5oqb5Ye66ZSZ6K+v5byC5bi4LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZHJhd0VsZW1lbnRzKG1vZGUsIGNvdW50LCB0eXBlLCBvZmZzZXQpIHtcclxuICAgICAgICBnbC5kcmF3RWxlbWVudHMobW9kZSwgY291bnQsIHR5cGUsIG9mZnNldClcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gbW9kZSBcclxuICAgICAqIEdMZW51bSDnsbvlnovvvIzmjIflrprnu5jliLblm77lhYPnmoTmlrnlvI/vvIzlj6/og73lgLzlpoLkuIvjgIJcclxuICAgICAgICBnbC5QT0lOVFM6IOe7mOWItuS4gOezu+WIl+eCueOAglxyXG4gICAgICAgIGdsLkxJTkVfU1RSSVA6IOe7mOWItuS4gOS4que6v+adoeOAguWNs++8jOe7mOWItuS4gOezu+WIl+e6v+aute+8jOS4iuS4gOeCuei/nuaOpeS4i+S4gOeCueOAglxyXG4gICAgICAgIGdsLkxJTkVfTE9PUDog57uY5Yi25LiA5Liq57q/5ZyI44CC5Y2z77yM57uY5Yi25LiA57O75YiX57q/5q6177yM5LiK5LiA54K56L+e5o6l5LiL5LiA54K577yM5bm25LiU5pyA5ZCO5LiA54K55LiO56ys5LiA5Liq54K555u46L+e44CCXHJcbiAgICAgICAgZ2wuTElORVM6IOe7mOWItuS4gOezu+WIl+WNleeLrOe6v+auteOAguavj+S4pOS4queCueS9nOS4uuerr+eCue+8jOe6v+auteS5i+mXtOS4jei/nuaOpeOAglxyXG4gICAgICAgIGdsLlRSSUFOR0xFX1NUUklQ77ya57uY5Yi25LiA5Liq5LiJ6KeS5bim44CCXHJcbiAgICAgICAgZ2wuVFJJQU5HTEVfRkFO77ya57uY5Yi25LiA5Liq5LiJ6KeS5omH44CCXHJcbiAgICAgICAgZ2wuVFJJQU5HTEVTOiDnu5jliLbkuIDns7vliJfkuInop5LlvaLjgILmr4/kuInkuKrngrnkvZzkuLrpobbngrlcclxuICAgICAqIEBwYXJhbSBmaXJzdCBcclxuICAgICAgICBHTGludCDnsbvlnosg77yM5oyH5a6a5LuO5ZOq5Liq54K55byA5aeL57uY5Yi2XHJcbiAgICAgKiBAcGFyYW0gY291bnQgXHJcbiAgICAgICAgR0xzaXplaSDnsbvlnovvvIzmjIflrprnu5jliLbpnIDopoHkvb/nlKjliLDlpJrlsJHkuKrngrlcclxuICAgICBAcmV0dXJuc1xyXG4gICAgIG5vbmVcclxuICAgICBAZXJyb3JcclxuICAgICAgICDlpoLmnpwgbW9kZSDkuI3mmK/kuIDkuKrlj6/mjqXlj5flgLzvvIzlsIbkvJrmipvlh7ogZ2wuSU5WQUxJRF9FTlVNIOW8guW4uOOAglxyXG4gICAgICAgIOWmguaenCBmaXJzdCDmiJbogIUgY291bnQg5piv6LSf5YC877yM5Lya5oqb5Ye6IGdsLklOVkFMSURfVkFMVUUg5byC5bi444CCXHJcbiAgICAgICAg5aaC5p6cIGdsLkNVUlJFTlRfUFJPR1JBTSDkuLogbnVsbO+8jOS8muaKm+WHuiBnbC5JTlZBTElEX09QRVJBVElPTiDlvILluLhcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRyYXdBcnJheXMobW9kZSwgZmlyc3QsIGNvdW50KSB7XHJcbiAgICAgICAgZ2wuZHJhd0FycmF5cyhtb2RlLCBmaXJzdCwgY291bnQpO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICAgICAvLyBXZWJHTDE6XHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBBcnJheUJ1ZmZlclZpZXc/IHBpeGVscyk7XHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIGZvcm1hdCwgdHlwZSwgSW1hZ2VEYXRhPyBwaXhlbHMpO1xyXG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCBmb3JtYXQsIHR5cGUsIEhUTUxJbWFnZUVsZW1lbnQ/IHBpeGVscyk7XHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIGZvcm1hdCwgdHlwZSwgSFRNTENhbnZhc0VsZW1lbnQ/IHBpeGVscyk7XHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIGZvcm1hdCwgdHlwZSwgSFRNTFZpZGVvRWxlbWVudD8gcGl4ZWxzKTtcclxuICAgIHZvaWQgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgZm9ybWF0LCB0eXBlLCBJbWFnZUJpdG1hcD8gcGl4ZWxzKTtcclxuICAgIC8vIFdlYkdMMjpcclxuICAgIHZvaWQgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIEdMaW50cHRyIG9mZnNldCk7XHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBIVE1MQ2FudmFzRWxlbWVudCBzb3VyY2UpO1xyXG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgSFRNTEltYWdlRWxlbWVudCBzb3VyY2UpOyBcclxuICAgIHZvaWQgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIEhUTUxWaWRlb0VsZW1lbnQgc291cmNlKTsgXHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBJbWFnZUJpdG1hcCBzb3VyY2UpO1xyXG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgSW1hZ2VEYXRhIHNvdXJjZSk7XHJcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBBcnJheUJ1ZmZlclZpZXcgc3JjRGF0YSwgc3JjT2Zmc2V0KTtcclxuICAgICovXHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHRhcmdldCBcclxuICAgICAqICAgIEdMZW51bSDmjIflrprnurnnkIbnmoTnu5Hlrprlr7nosaEu5Y+v6IO955qE5YC8OlxyXG4gICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRDog5LqM57u057q555CG6LS05Zu+LlxyXG4gICAgICAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YOueri+aWueS9k+aYoOWwhOe6ueeQhueahOato1jpnaLjgIJcclxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWDog56uL5pa55L2T5pig5bCE57q555CG55qE6LSfWOmdouOAglxyXG4gICAgICAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZOiDnq4vmlrnkvZPmmKDlsITnurnnkIbnmoTmraNZ6Z2i44CCXHJcbiAgICAgICAgICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1k6IOeri+aWueS9k+aYoOWwhOe6ueeQhueahOi0n1npnaLjgIJcclxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWjog56uL5pa55L2T5pig5bCE57q555CG55qE5q2jWumdouOAglxyXG4gICAgICAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aOiDnq4vmlrnkvZPmmKDlsITnurnnkIbnmoTotJ9a6Z2i44CCXHJcbiAgICAgKiBAcGFyYW0gbGV2ZWwgXHJcbiAgICAgKiAgR0xpbnQg5oyH5a6a6K+m57uG57qn5YirLiAw57qn5piv5Z+65pys5Zu+5YOP562J57qn77yMbue6p+aYr+esrG7kuKrph5HlrZfloZTnroDljJbnuqcuXHJcbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxmb3JtYXQgXHJcbiAgICAgKiBAcGFyYW0gd2lkdGggXHJcbiAgICAgKiAgR0xzaXplaSDmjIflrprnurnnkIbnmoTlrr3luqZcclxuICAgICAqIEBwYXJhbSBoZWlnaHQgXHJcbiAgICAgKiBHTHNpemVpIOaMh+Wumue6ueeQhueahOmrmOW6plxyXG4gICAgICogQHBhcmFtIGJvcmRlciBcclxuICAgICAqIEdMaW50IOaMh+Wumue6ueeQhueahOi+ueahhuWuveW6puOAguW/hemhu+S4uiAwXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0IFxyXG4gICAgICogIEdMZW51bSDmjIflrpp0ZXhlbOaVsOaNruagvOW8j+OAguWcqCBXZWJHTCAx5Lit77yM5a6D5b+F6aG75LiOIGludGVybmFsZm9ybWF0IOebuOWQjO+8iOafpeeci+S4iumdoikuIOWcqFdlYkdMIDLkuK0sIOi/meW8oOihqOS4reWIl+WHuuS6hui/meS6m+e7hOWQiFxyXG4gICAgICogQHBhcmFtIHR5cGUgXHJcbiAgICAgKiBHTGVudW0g5oyH5a6adGV4ZWzmlbDmja7nmoTmlbDmja7nsbvlnovjgILlj6/og73nmoTlgLw6XHJcbiAgICAgICAgIGdsLlVOU0lHTkVEX0JZVEU6ICBnbC5SR0JB5q+P5Liq6YCa6YGTOOS9jVxyXG4gICAgICAgICBnbC5VTlNJR05FRF9TSE9SVF81XzZfNTogNSBiaXRz57qiLCA2IGJpdHPnu78sIDUgYml0c+iTnVxyXG4gICAgICAgICBnbC5VTlNJR05FRF9TSE9SVF80XzRfNF80OiA0IGJpdHPnuqIsIDQgYml0c+e7vywgNCBiaXRz6JOdLCA0IGFscGhhIGJpdHMuXHJcbiAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JUXzVfNV81XzE6IDUgYml0c+e6oiwgNSBiaXRz57u/LCA1IGJpdHPok50sIDEgYWxwaGEgYml0LlxyXG4gICAgICAgICDlvZPkvb/nlKggV0VCR0xfZGVwdGhfdGV4dHVyZSDmianlsZU6XHJcbiAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JUXHJcbiAgICAgICAgIGdsLlVOU0lHTkVEX0lOVFxyXG4gICAgICAgICBleHQuVU5TSUdORURfSU5UXzI0XzhfV0VCR0wgKGNvbnN0YW50IHByb3ZpZGVkIGJ5IHRoZSBleHRlbnNpb24pXHJcbiAgICAgICAgIOW9k+S9v+eUqCBPRVNfdGV4dHVyZV9mbG9hdOaJqeWxlSA6XHJcbiAgICAgICAgIGdsLkZMT0FUXHJcbiAgICAgICAgIOW9k+S9v+eUqCBPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0IOaJqeWxlTpcclxuICAgICAgICAgZXh0LkhBTEZfRkxPQVRfT0VTIChjb25zdGFudCBwcm92aWRlZCBieSB0aGUgZXh0ZW5zaW9uKVxyXG4gICAgICAgICDlvZPkvb/nlKggV2ViR0wgMiBjb250ZXh0LOS4i+mdoueahOWAvOS5n+aYr+WPr+eUqOeahDpcclxuICAgICAgICAgZ2wuQllURVxyXG4gICAgICAgICBnbC5VTlNJR05FRF9TSE9SVFxyXG4gICAgICAgICBnbC5TSE9SVFxyXG4gICAgICAgICBnbC5VTlNJR05FRF9JTlRcclxuICAgICAgICAgZ2wuSU5UXHJcbiAgICAgICAgIGdsLkhBTEZfRkxPQVRcclxuICAgICAgICAgZ2wuRkxPQVRcclxuICAgICAgICAgZ2wuVU5TSUdORURfSU5UXzJfMTBfMTBfMTBfUkVWXHJcbiAgICAgICAgIGdsLlVOU0lHTkVEX0lOVF8xMEZfMTFGXzExRl9SRVZcclxuICAgICAgICAgZ2wuVU5TSUdORURfSU5UXzVfOV85XzlfUkVWXHJcbiAgICAgICAgIGdsLlVOU0lHTkVEX0lOVF8yNF84XHJcbiAgICAgICAgIGdsLkZMT0FUXzMyX1VOU0lHTkVEX0lOVF8yNF84X1JFViAocGl4ZWxzIG11c3QgYmUgbnVsbClcclxuICAgICAqIEBwYXJhbSBwaXhlbHMgXHJcbiAgICAgKiDkuIvliJflr7nosaHkuYvkuIDlj6/ku6XnlKjkvZznurnnkIbnmoTlg4/ntKDmupA6XHJcbiAgICAgICAgIEFycmF5QnVmZmVyVmlldyxcclxuICAgICAgICAgVWludDhBcnJheSAg5aaC5p6cIHR5cGUg5pivIGdsLlVOU0lHTkVEX0JZVEXliJnlv4Xpobvkvb/nlKhcclxuICAgICAgICAgVWludDE2QXJyYXkg5aaC5p6cIHR5cGUg5pivIGdsLlVOU0lHTkVEX1NIT1JUXzVfNl81LCBnbC5VTlNJR05FRF9TSE9SVF80XzRfNF80LCBnbC5VTlNJR05FRF9TSE9SVF81XzVfNV8xLCBnbC5VTlNJR05FRF9TSE9SVCDmiJZleHQuSEFMRl9GTE9BVF9PRVPliJnlv4Xpobvkvb/nlKhcclxuICAgICAgICAgVWludDMyQXJyYXkg5aaC5p6cdHlwZSDmmK8gZ2wuVU5TSUdORURfSU5UIOaIlmV4dC5VTlNJR05FRF9JTlRfMjRfOF9XRUJHTOWImeW/hemhu+S9v+eUqFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIHBpeGVsczogQXJyYXlCdWZmZXJWaWV3KTogdm9pZCB7XHJcbiAgICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIHBpeGVscylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWbvuWDj+mihOWkhOeQhuWHveaVsFxyXG4gICAgICog6KeE5a6a5LqG5Zu+5YOP5aaC5L2V5LuO5YaF5a2Y5Lit6K+75Ye677yM5Y+I5oiW6ICF5aaC5L2V5LuO5pi+5a2Y6K+75YWl5YaF5a2YXHJcbiAgICAgKiBAcGFyYW0gcG5hbWUgXHJcbiAgICAgKiAgR2xlbnVtIOexu+WeiyDvvIzooajnpLrlpITnkIbnmoTmlrnlvI/jgILlhbPkuo7or6Xlj4LmlbDlj6/pgInlgLzvvIzor7fop4HkuIvpnaLooajmoLxcclxuICAgICAqIEBwYXJhbSBwYXJhbSBcclxuICAgICAqICBHTGludCAg57G75Z6L77yM6KGo56S6IHBuYW1lIOWkhOeQhuaWueW8j+eahOWPguaVsOOAguWFs+S6juivpeWPguaVsOWPr+mAieWAvO+8jOivt+ingeS4i+mdouihqOagvFxyXG4gICAgICog5pSv5oyB55qE5bmz5Y+wd2ViZ2wgMS4wLG9wZW5nbCBlcyAyLjBcclxuICAgICAqIHBuYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0ICAgICAgICAgICAgcGFyYW0gICAgICAgICAgZGVzXHJcbiAgICAgKiBnbC5QQUNLX0FMSUdOTUVOVCAgICAgICAgICAgICAgICAgICAgICAgICA0ICAgICAgICAgICAgIDEsIDIsIDQsIDggICAgICAg5bCG5YOP57Sg5pWw5o2u5omT5YyF5Yiw5YaF5a2Y5Lit77yI5LuO5pi+5a2Y5bCG5pWw5o2u5Y+R5b6A5YaF5a2Y77yJXHJcbiAgICAgKiBnbC5VTlBBQ0tfQUxJR05NRU5UICAgICAgICAgICAgICAgICAgICAgICA0ICAgICAgICAgICAgIDEsIDIsIDQsIDggICAgICAg5LuO5YaF5a2Y5Lit6Kej5YyF5YOP57Sg5pWw5o2uKOaOpeWujOS7peWQjuWPkeW+gOaYvuWtmClcclxuICAgICAqIGdsLlVOUEFDS19GTElQX1lfV0VCR0wgICAgICAgICAgICAgICAgICAgIGZhbHNlICAgICAgICAgdHJ1ZSxmYWxzZSAgICAgICDlpoLmnpzkuLp0cnVl77yM5YiZ5oqK5Zu+54mH5LiK5LiL5a+556ew57+76L2s5Z2Q5qCH6L20KOWbvueJh+acrOi6q+S4jeWPmClcclxuICAgICAqIGdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCAgICAgICAgIGZhbHNlICAgICAgICAgdHJ1ZSwgZmFsc2UgICAgICDlsIZhbHBoYemAmumBk+S5mOS7peWFtuS7luminOiJsumAmumBk1xyXG4gICAgICogZ2wuVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTCAgKGdsLkJST1dTRVJfREVGQVVMVF9XRUJHTCkgKGdsLkJST1dTRVJfREVGQVVMVF9XRUJHTCwgZ2wuTk9ORSkg6buY6K6k6aKc6Imy56m66Ze06L2s5o2i5oiW5peg6aKc6Imy56m66Ze06L2s5o2iXHJcbiAgICAgKiBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHBpeGVsU3RvcmVpKHBuYW1lLCBwYXJhbSkge1xyXG4gICAgICAgIGdsLnBpeGVsU3RvcmVpKHBuYW1lLCBwYXJhbSlcclxuICAgIH1cclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0ZXhQYXJhbWV0ZXJmKHRhcmdldDogR0xlbnVtLCBwbmFtZTogR0xlbnVtLCBwYXJhbTogR0xmbG9hdCkge1xyXG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmYodGFyZ2V0LCBwbmFtZSwgcGFyYW0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7nurnnkIbov4fmu6TnmoTlsZ7mgKdcclxuICAgICAqIOW9k+WbvueJh+i/m+ihjOS4gOS6m+WPmOaNouivuOWmguaUvuWkp+e8qeWwj+etie+8jOWmguS9leS7jue6ueeQhuS4reWPluaVsOaNrlxyXG4gICAgICogQHBhcmFtIHRhcmdldCBcclxuICAgICAqIEdMZW51bSDmjIflrprnu5Hlrprngrko55uu5qCHKeOAguWPr+iDveeahOWAvO+8mlxyXG4gICAgICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRDog5LqM57u057q555CGLlxyXG4gICAgICAgICAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUDog56uL5pa55L2T57q555CGLlxyXG4gICAgICAgICAgICAgICAg5b2T5L2/55SoIFdlYkdMIDIgY29udGV4dCDml7Ys6L+Y5Y+v5Lul5L2/55So5Lul5LiL5YC8XHJcbiAgICAgICAgICAgICAgICBnbC5URVhUVVJFXzNEOiDkuInnu7TotLTlm74uXHJcbiAgICAgICAgICAgICAgICBnbC5URVhUVVJFXzJEX0FSUkFZOiDkuoznu7TmlbDnu4TotLTlm74uXHJcbiAgICAgKiBAcGFyYW0gcG5hbWUgXHJcbiAgICAgKiBAcGFyYW0gcGFyYW0gXHJcbiAgICAgKiBcclxuICAgICAqICBnbC5URVhUVVJFX01BR19GSUxURVJcdOe6ueeQhuaUvuWkp+a7pOazouWZqFx0Z2wuTElORUFSICjpu5jorqTlgLwpLCBnbC5ORUFSRVNULlxyXG4gICAgICAgIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUlx057q555CG57yp5bCP5ruk5rOi5ZmoXHRnbC5MSU5FQVIsIGdsLk5FQVJFU1QsIGdsLk5FQVJFU1RfTUlQTUFQX05FQVJFU1QsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCwgZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSICjpu5jorqTlgLwpLCBnbC5MSU5FQVJfTUlQTUFQX0xJTkVBUi5cclxuICAgICAgICBnbC5URVhUVVJFX1dSQVBfU1x057q555CG5Z2Q5qCH5rC05bmz5aGr5YWFIHNcdGdsLlJFUEVBVCAo6buY6K6k5YC8KSxnbC5DTEFNUF9UT19FREdFLCBnbC5NSVJST1JFRF9SRVBFQVQuXHJcbiAgICAgICAgZ2wuVEVYVFVSRV9XUkFQX1RcdOe6ueeQhuWdkOagh+WeguebtOWhq+WFhSB0XHRnbC5SRVBFQVQgKOm7mOiupOWAvCksZ2wuQ0xBTVBfVE9fRURHRSwgZ2wuTUlSUk9SRURfUkVQRUFULlxyXG4gICAgICAgIEFkZGl0aW9uYWxseSBhdmFpbGFibGUgd2hlbiB1c2luZyB0aGUgRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljIGV4dGVuc2lvblxyXG4gICAgICAgIGV4dC5URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVFx057q555CG5pyA5aSn5ZCR5byC5oCnXHQgR0xmbG9hdCDlgLwuXHJcbiAgICAgICAgQWRkaXRpb25hbGx5IGF2YWlsYWJsZSB3aGVuIHVzaW5nIGEgV2ViR0wgMiBjb250ZXh0XHJcbiAgICAgICAgZ2wuVEVYVFVSRV9CQVNFX0xFVkVMXHTnurnnkIbmmKDlsITnrYnnuqdcdOS7u+S9leaVtOWei+WAvC5cclxuICAgICAgICBnbC5URVhUVVJFX0NPTVBBUkVfRlVOQ1x057q555CG5a+55q+U5Ye95pWwXHRnbC5MRVFVQUwgKOm7mOiupOWAvCksIGdsLkdFUVVBTCwgZ2wuTEVTUywgZ2wuR1JFQVRFUiwgZ2wuRVFVQUwsIGdsLk5PVEVRVUFMLCBnbC5BTFdBWVMsIGdsLk5FVkVSLlxyXG4gICAgICAgIGdsLlRFWFRVUkVfQ09NUEFSRV9NT0RFXHTnurnnkIblr7nmr5TmqKHlvI9cdGdsLk5PTkUgKOm7mOiupOWAvCksIGdsLkNPTVBBUkVfUkVGX1RPX1RFWFRVUkUuXHJcbiAgICAgICAgZ2wuVEVYVFVSRV9NQVhfTEVWRUxcdOacgOWkp+e6ueeQhuaYoOWwhOaVsOe7hOetiee6p1x05Lu75L2V5pW05Z6L5YC8LlxyXG4gICAgICAgIGdsLlRFWFRVUkVfTUFYX0xPRFx057q555CG5pyA5aSn57uG6IqC5bGC5qyh5YC8XHTku7vkvZXmlbTlnovlgLwuXHJcbiAgICAgICAgZ2wuVEVYVFVSRV9NSU5fTE9EXHTnurnnkIbmnIDlsI/nu4boioLlsYLmrKHlgLxcdOS7u+S9lea1rueCueWei+WAvC5cclxuICAgICAgICBnbC5URVhUVVJFX1dSQVBfUlx057q555CG5Z2Q5qCHcuWMheijheWKn+iDvVx0Z2wuUkVQRUFUICjpu5jorqTlgLwpLCBnbC5DTEFNUF9UT19FREdFLCBnbC5NSVJST1JFRF9SRVBFQVQuXHJcbiAgICAgICAgQGVycm9yXHJcbiAgICAgICAgSU5WQUxJRF9FTlVNIHRhcmdldOS4jeaYr+WQiOazleeahOWAvOOAglxyXG4gICAgICAgIElOVkFMSURfT1BSQVRJT04g5b2T5YmN55uu5qCH5LiK5rKh5pyJ57uR5a6a57q555CG5a+56LGhXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiB0ZXhQYXJhbWV0ZXJpKHRhcmdldDogR0xlbnVtLCBwbmFtZTogR0xlbnVtLCBwYXJhbTogR0xpbnQpIHtcclxuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgcG5hbWUsIHBhcmFtKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+Wc2hhZGVy5LitYXR0cmlidXRl5LiL5a+55bqU55qE5bGe5oCn5L2N572uXHJcbiAgICAgKiBAcGFyYW0gcHJvZ3JhbSBzaGFkZXLnmoRnbElEXHJcbiAgICAgKiBAcGFyYW0gbmFtZSDlsZ7mgKfnmoTlkI3lrZdcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKiDooajmmI7lsZ7mgKfkvY3nva7nmoTkuIvmoIcgR0xpbnQg5pWw5a2X77yM5aaC5p6c5om+5LiN5Yiw6K+l5bGe5oCn5YiZ6L+U5ZueLTFcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIG5hbWUpOiBHTHVpbnQge1xyXG4gICAgICAgIHJldHVybiBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBuYW1lKVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmv4DmtLvpobbngrnlsZ7mgKdcclxuICAgICAqIEBwYXJhbSBpbmRleCBcclxuICAgICAqIOexu+Wei+S4ukdMdWludCDnmoTntKLlvJXvvIzmjIflkJHopoHmv4DmtLvnmoTpobbngrnlsZ7mgKfjgILlpoLmnpzmgqjlj6rnn6XpgZPlsZ7mgKfnmoTlkI3np7DvvIzkuI3nn6XpgZPntKLlvJXvvIxcclxuICAgICAqIOaCqOWPr+S7peS9v+eUqOS7peS4i+aWueazleadpeiOt+WPlue0ouW8lWdldEF0dHJpYkxvY2F0aW9uKClcclxuICAgICAqIFxyXG4gICAgICog54m55Yir6K+05piOXHJcbiAgICAgKiDlnKhXZWJHTOS4re+8jOS9nOeUqOS6jumhtueCueeahOaVsOaNruS8muWFiOWCqOWtmOWcqGF0dHJpYnV0ZXPjgIJcclxuICAgICAqIOi/meS6m+aVsOaNruS7heWvuUphdmFTY3JpcHTku6PnoIHlkozpobbngrnnnYDoibLlmajlj6/nlKjjgIJcclxuICAgICAqIOWxnuaAp+eUsee0ouW8leWPt+W8leeUqOWIsEdQVee7tOaKpOeahOWxnuaAp+WIl+ihqOS4reOAguWcqOS4jeWQjOeahOW5s+WPsOaIlkdQVeS4iu+8jOafkOS6m+mhtueCueWxnuaAp+e0ouW8leWPr+iDveWFt+aciemihOWumuS5ieeahOWAvOOAglxyXG4gICAgICog5Yib5bu65bGe5oCn5pe277yMV2ViR0zlsYLkvJrliIbphY3lhbbku5blsZ7mgKfjgIJcclxuICAgICAgIOaXoOiuuuaAjuagt++8jOmDvemcgOimgeS9oOS9v+eUqGVuYWJsZVZlcnRleEF0dHJpYkFycmF5KCnmlrnms5XvvIzmnaXmv4DmtLvmr4/kuIDkuKrlsZ7mgKfku6Xkvr/kvb/nlKjvvIzkuI3ooqvmv4DmtLvnmoTlsZ7mgKfmmK/kuI3kvJrooqvkvb/nlKjnmoTjgIJcclxuICAgICAgIOS4gOaXpua/gOa0u++8jOS7peS4i+WFtuS7luaWueazleWwseWPr+S7peiOt+WPluWIsOWxnuaAp+eahOWAvOS6hu+8jFxyXG4gICAgICAg5YyF5ousdmVydGV4QXR0cmliUG9pbnRlcigp77yMdmVydGV4QXR0cmliKigp77yM5ZKMIGdldFZlcnRleEF0dHJpYigpXHJcbiAgICAgICBAZXJyb3JcclxuICAgICAgIOaCqOWPr+S7peS9v+eUqGdldEVycm9yKCnmlrnms5XvvIzmnaXmo4Dmn6Xkvb/nlKhlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgp5pe25Y+R55Sf55qE6ZSZ6K+v44CCXHJcbiAgICAgICBXZWJHTFJlbmRlcmluZ0NvbnRleHQuSU5WQUxJRF9WQUxVRSDpnZ7ms5XnmoQgaW5kZXgg44CCXHJcbiAgICAgICDkuIDoiKzmmK8gaW5kZXgg5aSn5LqO5oiW562J5LqO5LqG6aG254K55bGe5oCn5YiX6KGo5YWB6K6455qE5pyA5aSn5YC844CC6K+l5YC85Y+v5Lul6YCa6L+HIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5NQVhfVkVSVEVYX0FUVFJJQlPojrflj5ZcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4OiBHTHVpbnQpIHtcclxuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShpbmRleCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaWueazleWcqOe7meWumueahOe0ouW8leS9jee9ruWFs+mXremAmueUqOmhtueCueWxnuaAp+aVsOe7hFxyXG4gICAgICogQHBhcmFtIGluZGV4IFxyXG4gICAgICogc2hhZGVyIOWPmOmHj+eahOS9jee9rlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4OiBHTHVpbnQpIHtcclxuICAgICAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoaW5kZXgpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWRiuivieaYvuWNoeS7juW9k+WJjee7keWumueahOe8k+WGsuWMuu+8iGJpbmRCdWZmZXIoKeaMh+WumueahOe8k+WGsuWMuu+8ieS4reivu+WPlumhtueCueaVsOaNruOAglxyXG4gICAgICAgV2ViR0wgQVBJIOeahFdlYkdMUmVuZGVyaW5nQ29udGV4dC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCnmlrnms5Xnu5HlrprlvZPliY3nvJPlhrLljLrojIPlm7TliLBnbC5BUlJBWV9CVUZGRVIsXHJcbiAgICAgICDmiJDkuLrlvZPliY3pobbngrnnvJPlhrLljLrlr7nosaHnmoTpgJrnlKjpobbngrnlsZ7mgKflubbmjIflrprlroPnmoTluIPlsYAo57yT5Yay5Yy65a+56LGh5Lit55qE5YGP56e76YePKVxyXG4gICAgICogQHBhcmFtIGluZGV4IFxyXG4gICAgICAg5oyH5a6a6KaB5L+u5pS555qE6aG254K55bGe5oCn55qE57Si5byVIOWFtuWunuWwseaYr+afkOS4qmF0dHJpYnV0ZeWPmOmHj+WcqHNoYWRlcuS4reeahOS9jee9rlxyXG4gICAgICogQHBhcmFtIHNpemUgXHJcbiAgICAgICDmjIflrprmr4/kuKrpobbngrnlsZ7mgKfnmoTnu4TmiJDmlbDph4/vvIzlv4XpobvmmK8x77yMMu+8jDPmiJY0XHJcbiAgICAgKiBAcGFyYW0gdHlwZSBcclxuICAgICAgICDmjIflrprmlbDnu4TkuK3mr4/kuKrlhYPntKDnmoTmlbDmja7nsbvlnovlj6/og73mmK/vvJpcclxuICAgICAgICAgICAgZ2wuQllURTogc2lnbmVkIDgtYml0IGludGVnZXIsIHdpdGggdmFsdWVzIGluIFstMTI4LCAxMjddXHJcbiAgICAgICAgICAgIOacieespuWPt+eahDjkvY3mlbTmlbDvvIzojIPlm7RbLTEyOCwgMTI3XVxyXG4gICAgICAgICAgICBnbC5TSE9SVDogc2lnbmVkIDE2LWJpdCBpbnRlZ2VyLCB3aXRoIHZhbHVlcyBpbiBbLTMyNzY4LCAzMjc2N11cclxuICAgICAgICAgICAg5pyJ56ym5Y+355qEMTbkvY3mlbTmlbDvvIzojIPlm7RbLTMyNzY4LCAzMjc2N11cclxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURTogdW5zaWduZWQgOC1iaXQgaW50ZWdlciwgd2l0aCB2YWx1ZXMgaW4gWzAsIDI1NV1cclxuICAgICAgICAgICAg5peg56ym5Y+355qEOOS9jeaVtOaVsO+8jOiMg+WbtFswLCAyNTVdXHJcbiAgICAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JUOiB1bnNpZ25lZCAxNi1iaXQgaW50ZWdlciwgd2l0aCB2YWx1ZXMgaW4gWzAsIDY1NTM1XVxyXG4gICAgICAgICAgICDml6DnrKblj7fnmoQxNuS9jeaVtOaVsO+8jOiMg+WbtFswLCA2NTUzNV1cclxuICAgICAgICAgICAgZ2wuRkxPQVQ6IDMyLWJpdCBJRUVFIGZsb2F0aW5nIHBvaW50IG51bWJlclxyXG4gICAgICAgICAgICAzMuS9jUlFRUXmoIflh4bnmoTmta7ngrnmlbBcclxuICAgICAgICAgICAgV2hlbiB1c2luZyBhIFdlYkdMIDIgY29udGV4dCwgdGhlIGZvbGxvd2luZyB2YWx1ZXMgYXJlIGF2YWlsYWJsZSBhZGRpdGlvbmFsbHk6XHJcbiAgICAgICAgICAgIOS9v+eUqFdlYkdMMueJiOacrOeahOi/mOWPr+S7peS9v+eUqOS7peS4i+WAvO+8mlxyXG4gICAgICAgICAgICBnbC5IQUxGX0ZMT0FUOiAxNi1iaXQgSUVFRSBmbG9hdGluZyBwb2ludCBudW1iZXJcclxuICAgICAgICAgICAgMTbkvY1JRUVF5qCH5YeG55qE5rWu54K55pWwXHJcbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZCBcclxuICAgICAgICDlvZPovazmjaLkuLrmta7ngrnmlbDml7bmmK/lkKblupTor6XlsIbmlbTmlbDmlbDlgLzlvZLkuIDljJbliLDnibnlrprnmoTojIPlm7TjgIJcclxuICAgICAgICAgICAgRm9yIHR5cGVzIGdsLkJZVEUgYW5kIGdsLlNIT1JULCBub3JtYWxpemVzIHRoZSB2YWx1ZXMgdG8gWy0xLCAxXSBpZiB0cnVlLlxyXG4gICAgICAgICAgICDlr7nkuo7nsbvlnotnbC5CWVRF5ZKMZ2wuU0hPUlTvvIzlpoLmnpzmmK90cnVl5YiZ5bCG5YC85b2S5LiA5YyW5Li6Wy0xLCAxXVxyXG4gICAgICAgICAgICBGb3IgdHlwZXMgZ2wuVU5TSUdORURfQllURSBhbmQgZ2wuVU5TSUdORURfU0hPUlQsIG5vcm1hbGl6ZXMgdGhlIHZhbHVlcyB0byBbMCwgMV0gaWYgdHJ1ZS5cclxuICAgICAgICAgICAg5a+55LqO57G75Z6LZ2wuVU5TSUdORURfQllUReWSjGdsLlVOU0lHTkVEX1NIT1JU77yM5aaC5p6c5pivdHJ1ZeWImeWwhuWAvOW9kuS4gOWMluS4ulswLCAxXVxyXG4gICAgICAgICAgICBGb3IgdHlwZXMgZ2wuRkxPQVQgYW5kIGdsLkhBTEZfRkxPQVQsIHRoaXMgcGFyYW1ldGVyIGhhcyBubyBlZmZlY3QuXHJcbiAgICAgICAgICAgIOWvueS6juexu+Wei2dsLkZMT0FU5ZKMZ2wuSEFMRl9GTE9BVO+8jOatpOWPguaVsOaXoOaViFxyXG4gICAgICogQHBhcmFtIHN0cmlkZSBcclxuICAgICAgICDkuIDkuKpHTHNpemVp77yM5Lul5a2X6IqC5Li65Y2V5L2N5oyH5a6a6L+e57ut6aG254K55bGe5oCn5byA5aeL5LmL6Ze055qE5YGP56e76YePKOWNs+aVsOe7hOS4reS4gOihjOmVv+W6pinjgIJcclxuICAgICAgICDkuI3og73lpKfkuo4yNTXjgILlpoLmnpxzdHJpZGXkuLow77yM5YiZ5YGH5a6a6K+l5bGe5oCn5piv57Sn5a+G5omT5YyF55qE77yM5Y2z5LiN5Lqk6ZSZ5bGe5oCn77yMXHJcbiAgICAgICAg5q+P5Liq5bGe5oCn5Zyo5LiA5Liq5Y2V54us55qE5Z2X5Lit77yM5LiL5LiA5Liq6aG254K555qE5bGe5oCn57Sn6Lef5b2T5YmN6aG254K55LmL5ZCOXHJcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IFxyXG4gICAgICAgICBHTGludHB0cuaMh+WumumhtueCueWxnuaAp+aVsOe7hOS4reesrOS4gOmDqOWIhueahOWtl+iKguWBj+enu+mHj+OAguW/hemhu+aYr+exu+Wei+eahOWtl+iKgumVv+W6pueahOWAjeaVsFxyXG5cclxuICAgICAgICBAZXJyb3JcclxuICAgICAgICBBIGdsLklOVkFMSURfVkFMVUUgZXJyb3IgaXMgdGhyb3duIGlmIG9mZnNldCBpcyBuZWdhdGl2ZS5cclxuICAgICAgICDlpoLmnpzlgY/np7vph4/kuLrotJ/vvIzliJnmipvlh7pnbC5JTlZBTElEX1ZBTFVF6ZSZ6K+v44CCXHJcbiAgICAgICAgQSBnbC5JTlZBTElEX09QRVJBVElPTiBlcnJvciBpcyB0aHJvd24gaWYgc3RyaWRlIGFuZCBvZmZzZXQgYXJlIG5vdCBtdWx0aXBsZXMgb2YgdGhlIHNpemUgb2YgdGhlIGRhdGEgdHlwZS5cclxuICAgICAgICDlpoLmnpxzdHJpZGXlkoxvZmZzZXTkuI3mmK/mlbDmja7nsbvlnovlpKflsI/nmoTlgI3mlbDvvIzliJnmipvlh7pnbC5JTlZBTElEX09QRVJBVElPTumUmeivr+OAglxyXG4gICAgICAgIEEgZ2wuSU5WQUxJRF9PUEVSQVRJT04gZXJyb3IgaXMgdGhyb3duIGlmIG5vIFdlYkdMQnVmZmVyIGlzIGJvdW5kIHRvIHRoZSBBUlJBWV9CVUZGRVIgdGFyZ2V0LlxyXG4gICAgICAgIOWmguaenOayoeacieWwhldlYkdMQnVmZmVy57uR5a6a5YiwQVJSQVlfQlVGRkVS55uu5qCH77yM5YiZ5oqb5Ye6Z2wuSU5WQUxJRF9PUEVSQVRJT07plJnor6/jgIJcclxuICAgICAgICBXaGVuIHVzaW5nIGEgV2ViR0wgMiBjb250ZXh0XHJcbiAgICAgICAgYSBnbC5JTlZBTElEX09QRVJBVElPTiBlcnJvciBpcyB0aHJvd24gaWYgdGhpcyB2ZXJ0ZXggYXR0cmlidXRlIGlzIGRlZmluZWQgYXMgYSBpbnRlZ2VyIGluIHRoZSB2ZXJ0ZXggc2hhZGVyIChlLmcuIHV2ZWM0IG9yIGl2ZWM0LCBpbnN0ZWFkIG9mIHZlYzQpLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdmVydGV4QXR0cmliUG9pbnRlcihpbmRleCwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZCwgc3RyaWRlLCBvZmZzZXQpIHtcclxuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluZGV4LCBzaXplLCB0eXBlLCBub3JtYWxpemVkLCBzdHJpZGUsIG9mZnNldClcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7nvJPlhrLljLrlpKflsI9cclxuICAgICAqIEBwYXJhbSB0YXJnZXQgXHJcbiAgICAgKiBAcGFyYW0gc2l6ZSBcclxuICAgICAqIEdMc2l6ZWlwdHIg6K6+5a6aQnVmZmVy5a+56LGh55qE5pWw5o2u5a2Y5YKo5Yy65aSn5bCPXHJcbiAgICAgKiBAcGFyYW0gdXNhZ2UgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBidWZmZXJEYXRhTGVuZ3RoKHRhcmdldCwgc2l6ZTogR0xzaXplaXB0ciwgdXNhZ2UpIHtcclxuICAgICAgICBnbC5idWZmZXJEYXRhKHRhcmdldCwgc2l6ZSwgdXNhZ2UpXHJcbiAgICB9XHJcbiAgICBleHBvcnQgZnVuY3Rpb24gYnVmZmVyRGF0YSh0YXJnZXQsIHNyY0RhdGE6IEFycmF5QnVmZmVyLCB1c2FnZSkge1xyXG4gICAgICAgIGdsLmJ1ZmZlckRhdGEodGFyZ2V0LCBzcmNEYXRhLCB1c2FnZSlcclxuICAgIH1cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBidWZmZXJTdWJEYXRhKHRhcmdldCwgb2Zmc2V0LHNyY0RhdGE6QXJyYXlCdWZmZXJWaWV3KVxyXG4gICAge1xyXG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEodGFyZ2V0LCBvZmZzZXQsc3JjRGF0YSlcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxyXG4gICAgICogR0xlbnVtIOaMh+WumkJ1ZmZlcue7keWumueCue+8iOebruagh++8ieOAguWPr+WPluS7peS4i+WAvO+8mlxyXG4gICAgICAgIGdsLkFSUkFZX0JVRkZFUjog5YyF5ZCr6aG254K55bGe5oCn55qEQnVmZmVy77yM5aaC6aG254K55Z2Q5qCH77yM57q555CG5Z2Q5qCH5pWw5o2u5oiW6aG254K56aKc6Imy5pWw5o2u44CCXHJcbiAgICAgICAgZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVI6IOeUqOS6juWFg+e0oOe0ouW8leeahEJ1ZmZlcuOAglxyXG4gICAgICAgIOW9k+S9v+eUqCBXZWJHTCAyIGNvbnRleHQg5pe277yM5Y+v5Lul5L2/55So5Lul5LiL5YC877yaXHJcbiAgICAgICAgZ2wuQ09QWV9SRUFEX0JVRkZFUjog5LuO5LiA5LiqQnVmZmVy5a+56LGh5aSN5Yi25Yiw5Y+m5LiA5LiqQnVmZmVy5a+56LGh44CCXHJcbiAgICAgICAgZ2wuQ09QWV9XUklURV9CVUZGRVI6IOS7juS4gOS4qkJ1ZmZlcuWvueixoeWkjeWItuWIsOWPpuS4gOS4qkJ1ZmZlcuWvueixoeOAglxyXG4gICAgICAgIGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVI6IOeUqOS6jui9rOaNouWPjemmiOaTjeS9nOeahEJ1ZmZlcuOAglxyXG4gICAgICAgIGdsLlVOSUZPUk1fQlVGRkVSOiDnlKjkuo7lrZjlgqjnu5/kuIDlnZfnmoRCdWZmZXLjgIJcclxuICAgICAgICBnbC5QSVhFTF9QQUNLX0JVRkZFUjog55So5LqO5YOP57Sg6L2s5o2i5pON5L2c55qEQnVmZmVy44CCXHJcbiAgICAgICAgZ2wuUElYRUxfVU5QQUNLX0JVRkZFUjog55So5LqO5YOP57Sg6L2s5o2i5pON5L2c55qEQnVmZmVyXHJcbiAgICAgKiBAcGFyYW0gc3JjRGF0YSBcclxuICAgICAgICDkuIDkuKpBcnJheUJ1ZmZlcu+8jFNoYXJlZEFycmF5QnVmZmVyIOaIluiAhSBBcnJheUJ1ZmZlclZpZXcg57G75Z6L55qE5pWw57uE5a+56LGh77yM5bCG6KKr5aSN5Yi25YiwQnVmZmVy55qE5pWw5o2u5a2Y5YKo5Yy644CCXHJcbiAgICAgICAgIOWmguaenOS4um51bGzvvIzmlbDmja7lrZjlgqjljLrku43kvJrooqvliJvlu7rvvIzkvYbmmK/kuI3kvJrov5vooYzliJ3lp4vljJblkozlrprkuYlcclxuICAgICAqIEBwYXJhbSB1c2FnZSBcclxuICAgICAgICAgR0xlbnVtIOaMh+WumuaVsOaNruWtmOWCqOWMuueahOS9v+eUqOaWueazleOAguWPr+WPluS7peS4i+WAvO+8mlxyXG4gICAgICAgICAgICBnbC5TVEFUSUNfRFJBVzog57yT5Yay5Yy655qE5YaF5a655Y+v6IO957uP5bi45L2/55So77yM6ICM5LiN5Lya57uP5bi45pu05pS544CC5YaF5a656KKr5YaZ5YWl57yT5Yay5Yy677yM5L2G5LiN6KKr6K+75Y+W44CCXHJcbiAgICAgICAgICAgIGdsLkRZTkFNSUNfRFJBVzog57yT5Yay5Yy655qE5YaF5a655Y+v6IO957uP5bi46KKr5L2/55So77yM5bm25LiU57uP5bi45pu05pS544CC5YaF5a656KKr5YaZ5YWl57yT5Yay5Yy677yM5L2G5LiN6KKr6K+75Y+W44CCXHJcbiAgICAgICAgICAgIGdsLlNUUkVBTV9EUkFXOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73kuI3kvJrnu4/luLjkvb/nlKjjgILlhoXlrrnooqvlhpnlhaXnvJPlhrLljLrvvIzkvYbkuI3ooqvor7vlj5bjgIJcclxuICAgICAgICAgICAg5b2T5L2/55SoIFdlYkdMIDIgY29udGV4dCDml7bvvIzlj6/ku6Xkvb/nlKjku6XkuIvlgLzvvJpcclxuICAgICAgICAgICAgZ2wuU1RBVElDX1JFQUQ6IOe8k+WGsuWMuueahOWGheWuueWPr+iDvee7j+W4uOS9v+eUqO+8jOiAjOS4jeS8mue7j+W4uOabtOaUueOAguWGheWuueS7jue8k+WGsuWMuuivu+WPlu+8jOS9huS4jeWGmeWFpeOAglxyXG4gICAgICAgICAgICBnbC5EWU5BTUlDX1JFQUQ6IOe8k+WGsuWMuueahOWGheWuueWPr+iDvee7j+W4uOS9v+eUqO+8jOW5tuS4lOe7j+W4uOabtOaUueOAguWGheWuueS7jue8k+WGsuWMuuivu+WPlu+8jOS9huS4jeWGmeWFpeOAglxyXG4gICAgICAgICAgICBnbC5TVFJFQU1fUkVBRDog57yT5Yay5Yy655qE5YaF5a655Y+v6IO95LiN5Lya57uP5bi45L2/55So44CC5YaF5a655LuO57yT5Yay5Yy66K+75Y+W77yM5L2G5LiN5YaZ5YWl44CCXHJcbiAgICAgICAgICAgIGdsLlNUQVRJQ19DT1BZOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73nu4/luLjkvb/nlKjvvIzogIzkuI3kvJrnu4/luLjmm7TmlLnjgILnlKjmiLfkuI3kvJrku47nvJPlhrLljLror7vlj5blhoXlrrnvvIzkuZ/kuI3lhpnlhaXjgIJcclxuICAgICAgICAgICAgZ2wuRFlOQU1JQ19DT1BZOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73nu4/luLjkvb/nlKjvvIzlubbkuJTnu4/luLjmm7TmlLnjgILnlKjmiLfkuI3kvJrku47nvJPlhrLljLror7vlj5blhoXlrrnvvIzkuZ/kuI3lhpnlhaXjgIJcclxuICAgICAgICAgICAgZ2wuU1RSRUFNX0NPUFk6IOe8k+WGsuWMuueahOWGheWuueWPr+iDveS4jeS8mue7j+W4uOS9v+eUqOOAgueUqOaIt+S4jeS8muS7jue8k+WGsuWMuuivu+WPluWGheWuue+8jOS5n+S4jeWGmeWFpVxyXG4gICAgICogQHBhcmFtIHNyY09mZnNldCBcclxuICAgICAgICAgICBHTHVpbnQg5oyH5a6a6K+75Y+W57yT5Yay5pe255qE5Yid5aeL5YWD57Sg57Si5byV5YGP56e76YePXHJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIFxyXG4gICAgICAgICAgICBHTHVpbnQg6buY6K6k5Li6MFxyXG4gICAgICAgIEBlcnJvclxyXG4gICAgICAgICAgICDlpoLmnpzml6Dms5XliJvlu7pzaXpl5oyH5a6a5aSn5bCP55qE5pWw5o2u5a2Y5YKo5Yy677yM5YiZ5Lya5oqb5Ye6Z2wuT1VUX09GX01FTU9SWeW8guW4uOOAglxyXG4gICAgICAgICAgICDlpoLmnpxzaXpl5piv6LSf5YC877yM5YiZ5Lya5oqb5Ye6Z2wuSU5WQUxJRF9WQUxVReW8guW4uOOAglxyXG4gICAgICAgICAgICDlpoLmnpx0YXJnZXTmiJZ1c2FnZeS4jeWxnuS6juaemuS4vuWAvOS5i+WIl++8jOWImeS8muaKm+WHumdsLklOVkFMSURfRU5VTeW8guW4uFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gYnVmZmVyRGF0YUZvcldlYmdsMih0YXJnZXQsIHNyY0RhdGE6IEFycmF5QnVmZmVyVmlldywgdXNhZ2UsIHNyY09mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICAgICAgLy9nbC5idWZmZXJEYXRhKHRhcmdldCwgc3JjRGF0YSwgdXNhZ2UsIHNyY09mZnNldCwgbGVuZ3RoKVxyXG4gICAgfVxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBnbHZlcnRfYXR0cl9zZW1hbnRpYywgZ2xURVhUVVJFX1VOSVRfVkFMSUQgfSBmcm9tIFwiLi4vZ2Z4L0dMRW51bXNcIjtcclxuaW1wb3J0IHsgR0xhcGkgfSBmcm9tIFwiLi4vZ2Z4L0dMYXBpXCI7XHJcblxyXG5lbnVtIFNoYWRlclR5cGUge1xyXG4gICAgVkVSVEVYID0gMSxcclxuICAgIEZSQUdNRU5UXHJcbn1cclxuXHJcblxyXG52YXIgdmVydGV4dEJhc2VDb2RlID1cclxuICAgICdhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uOycgK1xyXG4gICAgJ2F0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsOycgK1xyXG4gICAgJ2F0dHJpYnV0ZSB2ZWMyIGFfdXY7JyArXHJcblxyXG4gICAgJ3VuaWZvcm0gbWF0NCB1X01WTWF0cml4OycgK1xyXG4gICAgJ3VuaWZvcm0gbWF0NCB1X1BNYXRyaXg7JyArXHJcbiAgICAndW5pZm9ybSBtYXQ0IHVfTU1hdHJpeDsnICtcclxuICAgICd1bmlmb3JtIG1hdDQgdV9WTWF0cml4OycgK1xyXG5cclxuICAgICd2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7JyArXHJcbiAgICAndmFyeWluZyB2ZWMyIHZfdXY7JyArXHJcblxyXG4gICAgJ3ZvaWQgbWFpbigpIHsnICtcclxuICAgICdnbF9Qb3NpdGlvbiA9IHVfUE1hdHJpeCAqIHVfTVZNYXRyaXggKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7JyArXHJcbiAgICAndl91diA9IGFfdXY7JyArXHJcbiAgICAnfSdcclxuLy/ln7rnoYDnmoRzaGFkZXLnmoTniYfmrrXnnYDoibLlmahcclxudmFyIGZyYWdCYXNlQ29kZSA9XHJcbiAgICAncHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7JyArXHJcblxyXG4gICAgJ3ZhcnlpbmcgdmVjMiB2X3V2OycgK1xyXG4gICAgJ3VuaWZvcm0gc2FtcGxlckN1YmUgdV9za3lib3g7JyArXHJcbiAgICAndW5pZm9ybSBzYW1wbGVyMkQgdV90ZXhDb29yZDsnICtcclxuICAgICd1bmlmb3JtIG1hdDQgdV9QVk1fTWF0cml4X0ludmVyc2U7JyArXHJcbiAgICAndW5pZm9ybSB2ZWM0IHVfY29sb3I7JyArXHJcbiAgICAndW5pZm9ybSB2ZWM0IHVfY29sb3JfZGlyOycgK1xyXG5cclxuICAgICd2b2lkIG1haW4oKSB7JyArXHJcbiAgICAnZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVfdGV4Q29vcmQsIHZfdXYpOycgK1xyXG4gICAgJ30nXHJcblxyXG5leHBvcnQgY2xhc3MgU2hhZGVyRGF0YSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzcEdMSUQsIGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5fc3BHTElEID0gc3BHTElEO1xyXG4gICAgICAgIHRoaXMuX3RleHR1cmVVbml0ID0gMDtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfc3BHTElEO1xyXG4gICAgcHJpdmF0ZSBfdGV4dHVyZVVuaXQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF91bmlmb3JtU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH07XHJcbiAgICBwcml2YXRlIF9hdHRyaWJTZXR0ZXJzOiB7IFtpbmRleDogc3RyaW5nXTogRnVuY3Rpb24gfTtcclxuICAgIHByaXZhdGUgX2luZGV4OiBudW1iZXIgPSAtMTtcclxuICAgIHB1YmxpYyBnZXQgc3BHbElEKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zcEdMSUQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0IHRleHR1cmVVbml0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90ZXh0dXJlVW5pdDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBhZGRUZXh0dXJlVW5pdCgpIHtcclxuICAgICAgICB2YXIgYmVmb3JlID0gdGhpcy5fdGV4dHVyZVVuaXQ7XHJcbiAgICAgICAgdGhpcy5fdGV4dHVyZVVuaXQrKztcclxuICAgICAgICByZXR1cm4gYmVmb3JlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldCB1bmlTZXR0ZXJzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bmlmb3JtU2V0dGVycztcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgYXR0clNldHRlcnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F0dHJpYlNldHRlcnM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IHVuaVNldHRlcnMoc2V0OiB7IFtpbmRleDogc3RyaW5nXTogRnVuY3Rpb24gfSkge1xyXG4gICAgICAgIHRoaXMuX3VuaWZvcm1TZXR0ZXJzID0gc2V0O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBhdHRyU2V0dGVycyhzZXQ6IHsgW2luZGV4OiBzdHJpbmddOiBGdW5jdGlvbiB9KSB7XHJcbiAgICAgICAgdGhpcy5fYXR0cmliU2V0dGVycyA9IHNldDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXQgSW5kZXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBCdWZmZXJBdHRyaWJzRGF0YXtcclxuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnMsbnVtRWxlbWVudHMsaW5kaWNlcyl7XHJcbiAgICAgICAgdGhpcy5hdHRyaWJzID0gYXR0cmlicztcclxuICAgICAgICB0aGlzLm51bUVsZW1lbnRzID0gbnVtRWxlbWVudHM7XHJcbiAgICAgICAgdGhpcy5pbmRpY2VzID0gaW5kaWNlcztcclxuICAgIH1cclxuICAgIHB1YmxpYyByZWFkb25seSBpbmRpY2VzOkFycmF5PG51bWJlcj47XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbnVtRWxlbWVudHM6bnVtYmVyO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF0dHJpYnM6T2JqZWN0O1xyXG59XHJcbi8qKlxyXG4gKiBzaGFkZXLlt6XljoJcclxuICovXHJcbmNsYXNzIFNoYWRlckZhY3Rvcnkge1xyXG4gICAgcHVibGljIF9nbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0O1xyXG4gICAgcHJvdGVjdGVkIF9zaGFkZXJEYXRhOiBBcnJheTxTaGFkZXJEYXRhPjtcclxuICAgIGluaXQoZ2wpIHtcclxuICAgICAgICB0aGlzLl9nbCA9IGdsO1xyXG4gICAgICAgIHRoaXMuX3NoYWRlckRhdGEgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluS4gOS4qnNoYWRlckRhdGFcclxuICAgICAqIEBwYXJhbSBpbmRleCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldFNoYXJlRGF0YUJ5SW5kZXgoaW5kZXgpOiBTaGFkZXJEYXRhIHtcclxuICAgICAgICB2YXIgcmV0OiBTaGFkZXJEYXRhO1xyXG4gICAgICAgIHRoaXMuX3NoYWRlckRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5JbmRleCA9PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluS4gOS4qnNoYWRlckRhdGFcclxuICAgICAqIEBwYXJhbSBnbElEIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0U2hhcmVEYXRhQnlHbElEKGdsSUQpOiBTaGFkZXJEYXRhIHtcclxuICAgICAgICB2YXIgcmV0OiBTaGFkZXJEYXRhO1xyXG4gICAgICAgIHRoaXMuX3NoYWRlckRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5zcEdsSUQgPT0gZ2xJRCkge1xyXG4gICAgICAgICAgICAgICAgcmV0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOeUn+aIkOS4gOS4qnNoYWRlckRhdGFcclxuICAgICAqIEBwYXJhbSBHTElEIFxyXG4gICAgICogQHBhcmFtIHRleHR1cmVVbml0IFxyXG4gICAgICogQHBhcmFtIFVTZXQgXHJcbiAgICAgKiBAcGFyYW0gQVNldCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVNoYWRlckRhdGEoR0xJRCk6IFNoYWRlckRhdGEge1xyXG4gICAgICAgIHZhciByZXQgPSB0aGlzLmdldFNoYXJlRGF0YUJ5R2xJRChHTElEKTtcclxuICAgICAgICBpZiAocmV0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fc2hhZGVyRGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciByZXM6IFNoYWRlckRhdGEgPSBuZXcgU2hhZGVyRGF0YShHTElELCBpbmRleCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NoYWRlckRhdGEucHVzaChyZXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAqIFxyXG4gICAgKiBAcGFyYW0gc2hhZGVyVHlwZSBzaGFkZXLnmoTnsbvlnosgMeS7o+ihqOmhtueCueedgOiJsuWZqCAy5Luj6KGo5YOP57Sg552A6Imy5ZmoXHJcbiAgICAqIEBwYXJhbSBzaGFkZXJTb3VyY2Ugc2hhZGVy55qE5rqQ56CBXHJcbiAgICAqL1xyXG4gICAgcHJpdmF0ZSBsb2FkU2hhZGVyKHNoYWRlclR5cGU6IFNoYWRlclR5cGUsIHNoYWRlclNvdXJjZSkge1xyXG4gICAgICAgIC8vIOWIm+W7uuedgOiJsuWZqFxyXG4gICAgICAgIHZhciBzaGFkZXI7XHJcbiAgICAgICAgaWYgKHNoYWRlclR5cGUgPT0gU2hhZGVyVHlwZS5GUkFHTUVOVCkge1xyXG4gICAgICAgICAgICBzaGFkZXIgPSB0aGlzLl9nbC5jcmVhdGVTaGFkZXIodGhpcy5fZ2wuRlJBR01FTlRfU0hBREVSKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNoYWRlclR5cGUgPT0gU2hhZGVyVHlwZS5WRVJURVgpIHtcclxuICAgICAgICAgICAgc2hhZGVyID0gdGhpcy5fZ2wuY3JlYXRlU2hhZGVyKHRoaXMuX2dsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDnvJbor5HnnYDoibLlmahcclxuICAgICAgICB0aGlzLl9nbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzaGFkZXJTb3VyY2UpO1xyXG4gICAgICAgIHRoaXMuX2dsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcclxuICAgICAgICAvLyDliKTmlq3nvJbor5HmmK/lkKbmiJDlip9cclxuICAgICAgICBpZiAoIXRoaXMuX2dsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIHRoaXMuX2dsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICBhbGVydCh0aGlzLl9nbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdmVydGV4dENvZGUg6aG254K5c2hhZGVyIFxyXG4gICAgICogQHBhcmFtIGZyYWdDb2RlIOeJh+autXNoYWRlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY3JlYXRlU2hhZGVyKHZlcnRleHRDb2RlOiBzdHJpbmcgPSB2ZXJ0ZXh0QmFzZUNvZGUsIGZyYWdDb2RlOiBzdHJpbmcgPSBmcmFnQmFzZUNvZGUpOiBhbnkge1xyXG4gICAgICAgIC8vIOS7jiBET00g5LiK5Yib5bu65a+55bqU55qE552A6Imy5ZmoXHJcbiAgICAgICAgdmFyIHZlcnRleFNoYWRlciA9IHRoaXMubG9hZFNoYWRlcihTaGFkZXJUeXBlLlZFUlRFWCwgdmVydGV4dENvZGUpO1xyXG4gICAgICAgIHZhciBmcmFnbWVudFNoYWRlciA9IHRoaXMubG9hZFNoYWRlcihTaGFkZXJUeXBlLkZSQUdNRU5ULCBmcmFnQ29kZSk7XHJcblxyXG4gICAgICAgIC8vIOWIm+W7uueoi+W6j+W5tui/nuaOpeedgOiJsuWZqFxyXG4gICAgICAgIHZhciBzaGFkZXJHTElEID0gdGhpcy5fZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG4gICAgICAgIHRoaXMuX2dsLmF0dGFjaFNoYWRlcihzaGFkZXJHTElELCB2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgICAgIHRoaXMuX2dsLmF0dGFjaFNoYWRlcihzaGFkZXJHTElELCBmcmFnbWVudFNoYWRlcik7XHJcblxyXG4gICAgICAgIHRoaXMuX2dsLmxpbmtQcm9ncmFtKHNoYWRlckdMSUQpO1xyXG4gICAgICAgIC8vIOi/nuaOpeWksei0peeahOajgOa1i1xyXG4gICAgICAgIGlmICghdGhpcy5fZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihzaGFkZXJHTElELCB0aGlzLl9nbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICAgICAgYWxlcnQoXCJGYWlsZWQgdG8gc2V0dXAgc2hhZGVyc1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNoYWRlckdMSUQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uQ3JlYXRlU2hhZGVyKCk6IHZvaWQge1xyXG5cclxuICAgIH1cclxuICAgIHB1YmxpYyBkZXN0cm95U2hkZXIoc2hhZGVyUHJvZ3JhbSk6IHZvaWQge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZUF0dHJpYlNldHRlcihpbmRleCkge1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYikge1xyXG4gICAgICAgICAgICBpZiAoYi52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4KTtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoYi52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYjRmdihpbmRleCwgYi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliM2Z2KGluZGV4LCBiLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWIyZnYoaW5kZXgsIGIudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYjFmdihpbmRleCwgYi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhlIGxlbmd0aCBvZiBhIGZsb2F0IGNvbnN0YW50IHZhbHVlIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA0IScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGIuYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4KTtcclxuICAgICAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoaW5kZXgsIGIubnVtQ29tcG9uZW50cyB8fCBiLnNpemUsIGIudHlwZSB8fCBnbC5GTE9BVCwgYi5ub3JtYWxpemUgfHwgZmFsc2UsIGIuc3RyaWRlIHx8IDAsIGIub2Zmc2V0IHx8IDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgY3JlYXRlQXR0cmlidXRlU2V0dGVycyhzaGFkZXJEYXRhOiBTaGFkZXJEYXRhKTogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0ge1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xyXG4gICAgICAgIHZhciBwcm9ncmFtID0gc2hhZGVyRGF0YS5zcEdsSUQ7XHJcbiAgICAgICAgY29uc3QgYXR0cmliU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBudW1BdHRyaWJzID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5BQ1RJVkVfQVRUUklCVVRFUyk7XHJcbiAgICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IG51bUF0dHJpYnM7ICsraWkpIHtcclxuICAgICAgICAgICAgY29uc3QgYXR0cmliSW5mbyA9IGdsLmdldEFjdGl2ZUF0dHJpYihwcm9ncmFtLCBpaSk7XHJcbiAgICAgICAgICAgIGlmICghYXR0cmliSW5mbykge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBhdHRyaWJJbmZvLm5hbWUpO1xyXG4gICAgICAgICAgICBhdHRyaWJTZXR0ZXJzW2F0dHJpYkluZm8ubmFtZV0gPSB0aGlzLmNyZWF0ZUF0dHJpYlNldHRlcihpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhdHRyaWJTZXR0ZXJzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBiaW5kIHBvaW50IGZvciBhIGdpdmVuIHNhbXBsZXIgdHlwZVxyXG4gICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRCaW5kUG9pbnRGb3JTYW1wbGVyVHlwZShnbCwgdHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09PSBnbC5TQU1QTEVSXzJEKSByZXR1cm4gZ2wuVEVYVFVSRV8yRDsgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl9DVUJFKSByZXR1cm4gZ2wuVEVYVFVSRV9DVUJFX01BUDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgICAqIENyZWF0ZXMgYSBzZXR0ZXIgZm9yIGEgdW5pZm9ybSBvZiB0aGUgZ2l2ZW4gcHJvZ3JhbSB3aXRoIGl0J3NcclxuICAgICAgICogbG9jYXRpb24gZW1iZWRkZWQgaW4gdGhlIHNldHRlci5cclxuICAgICAgICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW1cclxuICAgICAgICogQHBhcmFtIHtXZWJHTFVuaWZvcm1JbmZvfSB1bmlmb3JtSW5mb1xyXG4gICAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IHRoZSBjcmVhdGVkIHNldHRlci5cclxuICAgICAgICovXHJcbiAgICBwcml2YXRlIGNyZWF0ZVVuaWZvcm1TZXR0ZXIodW5pZm9ybUluZm8sIHNoYWRlckRhdGE6IFNoYWRlckRhdGEpIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcclxuICAgICAgICB2YXIgcHJvZ3JhbSA9IHNoYWRlckRhdGEuc3BHbElEO1xyXG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHVuaWZvcm1JbmZvLm5hbWUpO1xyXG4gICAgICAgIGNvbnN0IHR5cGUgPSB1bmlmb3JtSW5mby50eXBlO1xyXG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgdW5pZm9ybSBpcyBhbiBhcnJheVxyXG4gICAgICAgIGNvbnN0IGlzQXJyYXkgPSAodW5pZm9ybUluZm8uc2l6ZSA+IDEgJiYgdW5pZm9ybUluZm8ubmFtZS5zdWJzdHIoLTMpID09PSAnWzBdJyk7XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUICYmIGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMWZ2KGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFmKGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX1ZFQzIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMmZ2KGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX1ZFQzMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtM2Z2KGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX1ZFQzQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtNGZ2KGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVCAmJiBpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlID09PSBnbC5JTlQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHYpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuSU5UX1ZFQzIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMml2KGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVF9WRUMzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTNpdihsb2NhdGlvbiwgdik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlID09PSBnbC5JTlRfVkVDNCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHYpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuQk9PTCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0xaXYobG9jYXRpb24sIHYpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuQk9PTF9WRUMyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTJpdihsb2NhdGlvbiwgdik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlID09PSBnbC5CT09MX1ZFQzMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtM2l2KGxvY2F0aW9uLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0xfVkVDNCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHYpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfTUFUMikge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm1NYXRyaXgyZnYobG9jYXRpb24sIGZhbHNlLCB2KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX01BVDMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtTWF0cml4M2Z2KGxvY2F0aW9uLCBmYWxzZSwgdik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVF9NQVQ0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihsb2NhdGlvbiwgZmFsc2UsIHYpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHR5cGUgPT09IGdsLlNBTVBMRVJfMkQgfHwgdHlwZSA9PT0gZ2wuU0FNUExFUl9DVUJFKSAmJiBpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVuaXRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlpID0gMDsgaWkgPCB1bmlmb3JtSW5mby5zaXplOyArK2lpKSB7XHJcbiAgICAgICAgICAgICAgICB1bml0cy5wdXNoKHNoYWRlckRhdGEuYWRkVGV4dHVyZVVuaXQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChiaW5kUG9pbnQsIHVuaXRzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRleHR1cmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdW5pdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmVzLmZvckVhY2goZnVuY3Rpb24gKHRleHR1cmUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyB1bml0c1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShiaW5kUG9pbnQsIHRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSh0aGlzLmdldEJpbmRQb2ludEZvclNhbXBsZXJUeXBlKGdsLCB0eXBlKSwgdW5pdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl8yRCB8fCB0eXBlID09PSBnbC5TQU1QTEVSX0NVQkUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChiaW5kUG9pbnQsIHVuaXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodGV4dHVyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0xaShsb2NhdGlvbiwgdW5pdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArIHVuaXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKGJpbmRQb2ludCwgdGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KHRoaXMuZ2V0QmluZFBvaW50Rm9yU2FtcGxlclR5cGUoZ2wsIHR5cGUpLCBzaGFkZXJEYXRhLmFkZFRleHR1cmVVbml0KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyAoJ3Vua25vd24gdHlwZTogMHgnICsgdHlwZS50b1N0cmluZygxNikpOyAvLyB3ZSBzaG91bGQgbmV2ZXIgZ2V0IGhlcmUuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1bmlmb3Jt5Y+Y6YeP6K6+572u5ZmoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY3JlYXRlVW5pZm9ybVNldHRlcnMoc2hhZGVyRGF0YTogU2hhZGVyRGF0YSk6IHsgW2luZGV4OiBzdHJpbmddOiBGdW5jdGlvbiB9IHtcclxuICAgICAgICB2YXIgcHJvZ3JhbSA9IHNoYWRlckRhdGEuc3BHbElEO1xyXG4gICAgICAgIGxldCBnbCA9IHRoaXMuX2dsO1xyXG5cclxuXHJcbiAgICAgICAgdmFyIHVuaWZvcm1TZXR0ZXJzOiB7IFtpbmRleDogc3RyaW5nXTogRnVuY3Rpb24gfSA9IHt9XHJcbiAgICAgICAgY29uc3QgbnVtVW5pZm9ybXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkFDVElWRV9VTklGT1JNUyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGlpID0gMDsgaWkgPCBudW1Vbmlmb3JtczsgKytpaSkge1xyXG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtSW5mbyA9IGdsLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgaWkpO1xyXG4gICAgICAgICAgICBpZiAoIXVuaWZvcm1JbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IHVuaWZvcm1JbmZvLm5hbWU7XHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgYXJyYXkgc3VmZml4LlxyXG4gICAgICAgICAgICBpZiAobmFtZS5zdWJzdHIoLTMpID09PSAnWzBdJykge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDAsIG5hbWUubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc2V0dGVyID0gdGhpcy5jcmVhdGVVbmlmb3JtU2V0dGVyKHVuaWZvcm1JbmZvLCBzaGFkZXJEYXRhKTtcclxuICAgICAgICAgICAgdW5pZm9ybVNldHRlcnNbbmFtZV0gPSBzZXR0ZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmlmb3JtU2V0dGVycztcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65LiA5Liqc2hhZGVyXHJcbiAgICAgKiBAcGFyYW0gdnMgXHJcbiAgICAgKiBAcGFyYW0gZnMgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVQcm9ncmFtSW5mbyh2czogc3RyaW5nLCBmczogc3RyaW5nKTogU2hhZGVyRGF0YSB7XHJcbiAgICAgICAgdmFyIGdsSUQgPSB0aGlzLmNyZWF0ZVNoYWRlcih2cywgZnMpO1xyXG4gICAgICAgIHZhciBzaGFkZXJEYXRhID0gdGhpcy5jcmVhdGVTaGFkZXJEYXRhKGdsSUQpO1xyXG4gICAgICAgIGNvbnN0IHVuaWZvcm1TZXR0ZXJzID0gdGhpcy5jcmVhdGVVbmlmb3JtU2V0dGVycyhzaGFkZXJEYXRhKTtcclxuICAgICAgICBjb25zdCBhdHRyaWJTZXR0ZXJzID0gdGhpcy5jcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzKHNoYWRlckRhdGEpO1xyXG4gICAgICAgIHNoYWRlckRhdGEudW5pU2V0dGVycyA9IHVuaWZvcm1TZXR0ZXJzO1xyXG4gICAgICAgIHNoYWRlckRhdGEuYXR0clNldHRlcnMgPSBhdHRyaWJTZXR0ZXJzO1xyXG5cclxuICAgICAgICByZXR1cm4gc2hhZGVyRGF0YTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIGdldFNoYWRlclByb2dyYW0oaW5kZXgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFNoYXJlRGF0YUJ5SW5kZXgoaW5kZXgpLnNwR2xJRDtcclxuICAgIH1cclxuICAgIC8v6K6+572uYXR0cmlidXRl5Y+Y6YePXHJcbiAgICBwdWJsaWMgc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXMoYXR0cmliU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0sIGJ1ZmZlcnMpIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcclxuICAgICAgICB2YXIgYXR0cmlicyA9IGJ1ZmZlcnMuYXR0cmlicztcclxuICAgICAgICB2YXIgc2V0dGVycyA9IGF0dHJpYlNldHRlcnM7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlicykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICAgICBjb25zdCBzZXR0ZXIgPSBzZXR0ZXJzW25hbWVdO1xyXG4gICAgICAgICAgICBpZiAoc2V0dGVyKSB7XHJcbiAgICAgICAgICAgICAgICBzZXR0ZXIoYXR0cmlic1tuYW1lXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yICDnu5HlrpphdHRyaWJ1dGXlj5jph4/lpLHotKUtLS0tLVwiLG5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChidWZmZXJzLmluZGljZXMpIHtcclxuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVycy5pbmRpY2VzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL+iuvue9rnVuaWZvcm3lj5jph49cclxuICAgIHB1YmxpYyBzZXRVbmlmb3Jtcyh1bmlmb3JtU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0sIC4uLnZhbHVlcykge1xyXG4gICAgICAgIHZhciBzZXR0ZXJzID0gdW5pZm9ybVNldHRlcnM7XHJcbiAgICAgICAgZm9yIChjb25zdCB1bmlmb3JtcyBvZiB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXModW5pZm9ybXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRlciA9IHNldHRlcnNbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGVyKHVuaWZvcm1zW25hbWVdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yICDnu5Hlrpp1bmlmb3Jt5Y+Y6YeP5aSx6LSlLS0tLS0tXCIsbmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v5ZCv5Yqo6aG254K5552A6Imy5Zmo57uY5Yi2XHJcbiAgICBwdWJsaWMgZHJhd0J1ZmZlckluZm8oYnVmZmVySW5mbywgcHJpbWl0aXZlVHlwZT8sIGNvdW50Pywgb2Zmc2V0Pykge1xyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xyXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBidWZmZXJJbmZvLmluZGljZXM7XHJcbiAgICAgICAgcHJpbWl0aXZlVHlwZSA9IHByaW1pdGl2ZVR5cGUgPT09IHVuZGVmaW5lZCA/IGdsLlRSSUFOR0xFUyA6IHByaW1pdGl2ZVR5cGU7XHJcbiAgICAgICAgY29uc3QgbnVtRWxlbWVudHMgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gYnVmZmVySW5mby5udW1FbGVtZW50cyA6IGNvdW50O1xyXG4gICAgICAgIG9mZnNldCA9IG9mZnNldCA9PT0gdW5kZWZpbmVkID8gMCA6IG9mZnNldDtcclxuICAgICAgICBpZiAoaW5kaWNlcykge1xyXG4gICAgICAgICAgICBnbC5kcmF3RWxlbWVudHMocHJpbWl0aXZlVHlwZSwgbnVtRWxlbWVudHMsIGdsLlVOU0lHTkVEX1NIT1JULCBvZmZzZXQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMocHJpbWl0aXZlVHlwZSwgb2Zmc2V0LCBudW1FbGVtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vZXh0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBZGQgYHB1c2hgIHRvIGEgdHlwZWQgYXJyYXkuIEl0IGp1c3Qga2VlcHMgYSAnY3Vyc29yJ1xyXG4gICAgLy8gYW5kIGFsbG93cyB1c2UgdG8gYHB1c2hgIHZhbHVlcyBpbnRvIHRoZSBhcnJheSBzbyB3ZVxyXG4gICAgLy8gZG9uJ3QgaGF2ZSB0byBtYW51YWxseSBjb21wdXRlIG9mZnNldHNcclxuICAgIHB1YmxpYyBhdWdtZW50VHlwZWRBcnJheSh0eXBlZEFycmF5LCBudW1Db21wb25lbnRzKSB7XHJcbiAgICAgICAgbGV0IGN1cnNvciA9IDA7XHJcbiAgICAgICAgdHlwZWRBcnJheS5wdXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpaSA9IDA7IGlpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpaSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhcmd1bWVudHNbaWldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgfHwgKHZhbHVlLmJ1ZmZlciAmJiB2YWx1ZS5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqaiA9IDA7IGpqIDwgdmFsdWUubGVuZ3RoOyArK2pqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVkQXJyYXlbY3Vyc29yKytdID0gdmFsdWVbampdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZWRBcnJheVtjdXJzb3IrK10gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdHlwZWRBcnJheS5yZXNldCA9IGZ1bmN0aW9uIChvcHRfaW5kZXgpIHtcclxuICAgICAgICAgICAgY3Vyc29yID0gb3B0X2luZGV4IHx8IDA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0eXBlZEFycmF5Lm51bUNvbXBvbmVudHMgPSBudW1Db21wb25lbnRzO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlZEFycmF5LCAnbnVtRWxlbWVudHMnLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoIC8gdGhpcy5udW1Db21wb25lbnRzIHwgMDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHlwZWRBcnJheTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICogY3JlYXRlcyBhIHR5cGVkIGFycmF5IHdpdGggYSBgcHVzaGAgZnVuY3Rpb24gYXR0YWNoZWRcclxuICAgICogc28gdGhhdCB5b3UgY2FuIGVhc2lseSAqcHVzaCogdmFsdWVzLlxyXG4gICAgKlxyXG4gICAgKiBgcHVzaGAgY2FuIHRha2UgbXVsdGlwbGUgYXJndW1lbnRzLiBJZiBhbiBhcmd1bWVudCBpcyBhbiBhcnJheSBlYWNoIGVsZW1lbnRcclxuICAgICogb2YgdGhlIGFycmF5IHdpbGwgYmUgYWRkZWQgdG8gdGhlIHR5cGVkIGFycmF5LlxyXG4gICAgKlxyXG4gICAgKiBFeGFtcGxlOlxyXG4gICAgKlxyXG4gICAgKiAgICAgbGV0IGFycmF5ID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCAyKTsgIC8vIGNyZWF0ZXMgYSBGbG9hdDMyQXJyYXkgd2l0aCA2IHZhbHVlc1xyXG4gICAgKiAgICAgYXJyYXkucHVzaCgxLCAyLCAzKTtcclxuICAgICogICAgIGFycmF5LnB1c2goWzQsIDUsIDZdKTtcclxuICAgICogICAgIC8vIGFycmF5IG5vdyBjb250YWlucyBbMSwgMiwgMywgNCwgNSwgNl1cclxuICAgICpcclxuICAgICogQWxzbyBoYXMgYG51bUNvbXBvbmVudHNgIGFuZCBgbnVtRWxlbWVudHNgIHByb3BlcnRpZXMuXHJcbiAgICAqXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Db21wb25lbnRzIG51bWJlciBvZiBjb21wb25lbnRzXHJcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1FbGVtZW50cyBudW1iZXIgb2YgZWxlbWVudHMuIFRoZSB0b3RhbCBzaXplIG9mIHRoZSBhcnJheSB3aWxsIGJlIGBudW1Db21wb25lbnRzICogbnVtRWxlbWVudHNgLlxyXG4gICAgKiBAcGFyYW0ge2NvbnN0cnVjdG9yfSBvcHRfdHlwZSBBIGNvbnN0cnVjdG9yIGZvciB0aGUgdHlwZS4gRGVmYXVsdCA9IGBGbG9hdDMyQXJyYXlgLlxyXG4gICAgKiBAcmV0dXJuIHtBcnJheUJ1ZmZlcn0gQSB0eXBlZCBhcnJheS5cclxuICAgICogQG1lbWJlck9mIG1vZHVsZTp3ZWJnbC11dGlsc1xyXG4gICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KG51bUNvbXBvbmVudHMsIG51bUVsZW1lbnRzLCBvcHRfdHlwZT8pIHtcclxuICAgICAgICBjb25zdCBUeXBlID0gb3B0X3R5cGUgfHwgRmxvYXQzMkFycmF5O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF1Z21lbnRUeXBlZEFycmF5KG5ldyBUeXBlKG51bUNvbXBvbmVudHMgKiBudW1FbGVtZW50cyksIG51bUNvbXBvbmVudHMpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEFycmF5KGFycmF5KSB7XHJcbiAgICAgICAgcmV0dXJuIGFycmF5Lmxlbmd0aCA/IGFycmF5IDogYXJyYXkuZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGV4Y29vcmRSRSA9IC9jb29yZHx0ZXh0dXJlL2k7XHJcbiAgICBwdWJsaWMgY29sb3JSRSA9IC9jb2xvcnxjb2xvdXIvaTtcclxuICAgIHB1YmxpYyBndWVzc051bUNvbXBvbmVudHNGcm9tTmFtZShuYW1lLCBsZW5ndGg/KSB7XHJcbiAgICAgICAgbGV0IG51bUNvbXBvbmVudHM7XHJcbiAgICAgICAgaWYgKHRoaXMudGV4Y29vcmRSRS50ZXN0KG5hbWUpKSB7XHJcbiAgICAgICAgICAgIG51bUNvbXBvbmVudHMgPSAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb2xvclJFLnRlc3QobmFtZSkpIHtcclxuICAgICAgICAgICAgbnVtQ29tcG9uZW50cyA9IDQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbnVtQ29tcG9uZW50cyA9IDM7ICAvLyBwb3NpdGlvbiwgbm9ybWFscywgaW5kaWNlcyAuLi5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsZW5ndGggJSBudW1Db21wb25lbnRzID4gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgZ3Vlc3MgbnVtQ29tcG9uZW50cyBmb3IgYXR0cmlidXRlICcke25hbWV9Jy4gVHJpZWQgJHtudW1Db21wb25lbnRzfSBidXQgJHtsZW5ndGh9IHZhbHVlcyBpcyBub3QgZXZlbmx5IGRpdmlzaWJsZSBieSAke251bUNvbXBvbmVudHN9LiBZb3Ugc2hvdWxkIHNwZWNpZnkgaXQuYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVtQ29tcG9uZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TnVtQ29tcG9uZW50cyhhcnJheSwgYXJyYXlOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIGFycmF5Lm51bUNvbXBvbmVudHMgfHwgYXJyYXkuc2l6ZSB8fCB0aGlzLmd1ZXNzTnVtQ29tcG9uZW50c0Zyb21OYW1lKGFycmF5TmFtZSwgdGhpcy5nZXRBcnJheShhcnJheSkubGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRyaWVzIHRvIGdldCB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGZyb20gYSBzZXQgb2YgYXJyYXlzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgcG9zaXRpb25LZXlzID0gWydwb3NpdGlvbicsICdwb3NpdGlvbnMnLCAnYV9wb3NpdGlvbiddO1xyXG4gICAgcHVibGljIGdldE51bUVsZW1lbnRzRnJvbU5vbkluZGV4ZWRBcnJheXMoYXJyYXlzKSB7XHJcbiAgICAgICAgbGV0IGtleTtcclxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgdGhpcy5wb3NpdGlvbktleXMpIHtcclxuICAgICAgICAgICAgaWYgKGsgaW4gYXJyYXlzKSB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAga2V5ID0ga2V5IHx8IE9iamVjdC5rZXlzKGFycmF5cylbMF07XHJcbiAgICAgICAgY29uc3QgYXJyYXkgPSBhcnJheXNba2V5XTtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmdldEFycmF5KGFycmF5KS5sZW5ndGg7XHJcbiAgICAgICAgY29uc3QgbnVtQ29tcG9uZW50cyA9IHRoaXMuZ2V0TnVtQ29tcG9uZW50cyhhcnJheSwga2V5KTtcclxuICAgICAgICBjb25zdCBudW1FbGVtZW50cyA9IGxlbmd0aCAvIG51bUNvbXBvbmVudHM7XHJcbiAgICAgICAgaWYgKGxlbmd0aCAlIG51bUNvbXBvbmVudHMgPiAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbnVtQ29tcG9uZW50cyAke251bUNvbXBvbmVudHN9IG5vdCBjb3JyZWN0IGZvciBsZW5ndGggJHtsZW5ndGh9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudW1FbGVtZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0R0xUeXBlRm9yVHlwZWRBcnJheShnbCwgdHlwZWRBcnJheSkge1xyXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50OEFycmF5KSB7IHJldHVybiBnbC5CWVRFOyB9ICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxyXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgVWludDhBcnJheSkgeyByZXR1cm4gZ2wuVU5TSUdORURfQllURTsgfSAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDE2QXJyYXkpIHsgcmV0dXJuIGdsLlNIT1JUOyB9ICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcbiAgICAgICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50MTZBcnJheSkgeyByZXR1cm4gZ2wuVU5TSUdORURfU0hPUlQ7IH0gIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDMyQXJyYXkpIHsgcmV0dXJuIGdsLklOVDsgfSAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcbiAgICAgICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50MzJBcnJheSkgeyByZXR1cm4gZ2wuVU5TSUdORURfSU5UOyB9ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkgeyByZXR1cm4gZ2wuRkxPQVQ7IH0gICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICB0aHJvdyAndW5zdXBwb3J0ZWQgdHlwZWQgYXJyYXkgdHlwZSc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBpcyByZWFsbHkganVzdCBhIGd1ZXNzLiBUaG91Z2ggSSBjYW4ndCByZWFsbHkgaW1hZ2luZSB1c2luZ1xyXG4gICAgLy8gYW55dGhpbmcgZWxzZT8gTWF5YmUgZm9yIHNvbWUgY29tcHJlc3Npb24/XHJcbiAgICBwdWJsaWMgZ2V0Tm9ybWFsaXphdGlvbkZvclR5cGVkQXJyYXkodHlwZWRBcnJheSkge1xyXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50OEFycmF5KSB7IHJldHVybiB0cnVlOyB9ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcbiAgICAgICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7IHJldHVybiB0cnVlOyB9ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc0FycmF5QnVmZmVyKGEpIHtcclxuICAgICAgICByZXR1cm4gYS5idWZmZXIgJiYgYS5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlQnVmZmVyRnJvbVR5cGVkQXJyYXkoZ2wsIGFycmF5LCB0eXBlPywgZHJhd1R5cGU/KSB7XHJcbiAgICAgICAgdHlwZSA9IHR5cGUgfHwgZ2wuQVJSQVlfQlVGRkVSO1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgYnVmZmVyKTtcclxuICAgICAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGFycmF5LCBkcmF3VHlwZSB8fCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWxsQnV0SW5kaWNlcyhuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIG5hbWUgIT09ICdpbmRpY2VzJztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlTWFwcGluZyhvYmopIHtcclxuICAgICAgICBjb25zdCBtYXBwaW5nID0ge307XHJcbiAgICAgICAgT2JqZWN0LmtleXMob2JqKS5maWx0ZXIodGhpcy5hbGxCdXRJbmRpY2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgbWFwcGluZ1snYV8nICsga2V5XSA9IGtleTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbWFwcGluZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbWFrZVR5cGVkQXJyYXkoYXJyYXksIG5hbWUpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0FycmF5QnVmZmVyKGFycmF5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhcnJheS5kYXRhICYmIHRoaXMuaXNBcnJheUJ1ZmZlcihhcnJheS5kYXRhKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyYXkpKSB7XHJcbiAgICAgICAgICAgIGFycmF5ID0ge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogYXJyYXksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghYXJyYXkubnVtQ29tcG9uZW50cykge1xyXG4gICAgICAgICAgICBhcnJheS5udW1Db21wb25lbnRzID0gdGhpcy5ndWVzc051bUNvbXBvbmVudHNGcm9tTmFtZShuYW1lLCBhcnJheS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdHlwZSA9IGFycmF5LnR5cGU7XHJcbiAgICAgICAgaWYgKCF0eXBlKSB7XHJcbiAgICAgICAgICAgIGlmIChuYW1lID09PSAnaW5kaWNlcycpIHtcclxuICAgICAgICAgICAgICAgIHR5cGUgPSBVaW50MTZBcnJheTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0eXBlZEFycmF5ID0gdGhpcy5jcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KGFycmF5Lm51bUNvbXBvbmVudHMsIGFycmF5LmRhdGEubGVuZ3RoIC8gYXJyYXkubnVtQ29tcG9uZW50cyB8IDAsIHR5cGUpO1xyXG4gICAgICAgIHR5cGVkQXJyYXkucHVzaChhcnJheS5kYXRhKTtcclxuICAgICAgICByZXR1cm4gdHlwZWRBcnJheTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBjcmVhdGVBdHRyaWJzRnJvbUFycmF5cyhnbCwgYXJyYXlzLCBvcHRfbWFwcGluZykge1xyXG4gICAgICAgIGNvbnN0IG1hcHBpbmcgPSBvcHRfbWFwcGluZyB8fCB0aGlzLmNyZWF0ZU1hcHBpbmcoYXJyYXlzKTtcclxuICAgICAgICBjb25zdCBhdHRyaWJzID0ge307XHJcbiAgICAgICAgT2JqZWN0LmtleXMobWFwcGluZykuZm9yRWFjaCgoYXR0cmliTmFtZSk9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlck5hbWUgPSBtYXBwaW5nW2F0dHJpYk5hbWVdO1xyXG4gICAgICAgICAgICBjb25zdCBvcmlnQXJyYXkgPSBhcnJheXNbYnVmZmVyTmFtZV07XHJcbiAgICAgICAgICAgIGlmIChvcmlnQXJyYXkudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnNbYXR0cmliTmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG9yaWdBcnJheS52YWx1ZSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhcnJheSA9IHRoaXMubWFrZVR5cGVkQXJyYXkob3JpZ0FycmF5LCBidWZmZXJOYW1lKTtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnNbYXR0cmliTmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiB0aGlzLmNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCBhcnJheSksXHJcbiAgICAgICAgICAgICAgICAgICAgbnVtQ29tcG9uZW50czogb3JpZ0FycmF5Lm51bUNvbXBvbmVudHMgfHwgYXJyYXkubnVtQ29tcG9uZW50cyB8fCB0aGlzLmd1ZXNzTnVtQ29tcG9uZW50c0Zyb21OYW1lKGJ1ZmZlck5hbWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2V0R0xUeXBlRm9yVHlwZWRBcnJheShnbCwgYXJyYXkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZTogdGhpcy5nZXROb3JtYWxpemF0aW9uRm9yVHlwZWRBcnJheShhcnJheSksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGF0dHJpYnM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMoYXJyYXlzLCBvcHRfbWFwcGluZz8pIHtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcclxuICAgICAgICBjb25zdCBidWZmZXJJbmZvOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnM6IHRoaXMuY3JlYXRlQXR0cmlic0Zyb21BcnJheXMoZ2wsIGFycmF5cywgb3B0X21hcHBpbmcpLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IGluZGljZXMgPSBhcnJheXMuaW5kaWNlcztcclxuICAgICAgICBpZiAoaW5kaWNlcykge1xyXG4gICAgICAgICAgICBpbmRpY2VzID0gdGhpcy5tYWtlVHlwZWRBcnJheShpbmRpY2VzLCAnaW5kaWNlcycpO1xyXG4gICAgICAgICAgICBidWZmZXJJbmZvLmluZGljZXMgPSB0aGlzLmNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCBpbmRpY2VzLCBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUik7XHJcbiAgICAgICAgICAgIGJ1ZmZlckluZm8ubnVtRWxlbWVudHMgPSBpbmRpY2VzLmxlbmd0aDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBidWZmZXJJbmZvLm51bUVsZW1lbnRzID0gdGhpcy5nZXROdW1FbGVtZW50c0Zyb21Ob25JbmRleGVkQXJyYXlzKGFycmF5cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyQXR0cmlic0RhdGEoYnVmZmVySW5mby5hdHRyaWJzLGJ1ZmZlckluZm8ubnVtRWxlbWVudHMsYnVmZmVySW5mby5pbmRpY2VzKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBHX1NoYWRlckZhY3RvcnkgPSBuZXcgU2hhZGVyRmFjdG9yeSgpO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNoYWRlciB7XHJcbiAgICBwcml2YXRlIGFfcG9zaXRpb25fbG9jOy8v6aG254K55bGe5oCn5L2N572uXHJcbiAgICBwcml2YXRlIGFfbm9ybWFsX2xvYzsvL+azlee6v+WxnuaAp+eahOS9jee9rlxyXG4gICAgcHJpdmF0ZSBhX3V2X2xvYzsvL3V25bGe5oCn5L2N572uXHJcbiAgICBwcml2YXRlIGFfdGFuZ2VudF9sb2M7Ly/liIfnur/lsZ7mgKfkvY3nva5cclxuICAgIHByaXZhdGUgdV9jb2xvcl9sb2M7Ly/lhYnnhaflsZ7mgKfkvY3nva5cclxuICAgIHByaXZhdGUgdV9jb2xvcl9kaXJfbG9jOy8v5YWJ54Wn5pa55ZCR5bGe5oCn5L2N572uXHJcbiAgICBwcml2YXRlIHVfTVZNYXRyaXhfbG9jOy8v5qih5Z6L6KeG5Y+j55+p6Zi15bGe5oCn5L2N572uXHJcbiAgICBwcml2YXRlIHVfUE1hdHJpeF9sb2M7Ly/pgI/op4bmipXlvbHnn6npmLXlsZ7mgKfkvY3nva5cclxuICAgIHByaXZhdGUgdV9NTWF0cml4X2xvYzsvL+aooeWei+efqemYteWxnuaAp+S9jee9rlxyXG4gICAgcHJpdmF0ZSB1X1ZNYXRyaXhfbG9jOy8v6KeG5Y+j55+p6Zi15bGe5oCn5L2N572uXHJcbiAgICBwcml2YXRlIHVfdGV4Q29vcmRfbG9jOy8v57q555CG5bGe5oCn5L2N572uXHJcbiAgICBwcml2YXRlIHVfc2t5Ym94X2xvYzsvL+WkqeepuuebkuWxnuaAp+S9jee9rlxyXG4gICAgcHJpdmF0ZSB1X3B2bV9tYXRyaXhfbG9jOy8v5oqV5b2x6KeG5Y+j5qih5Z6L55+p6Zi1XHJcbiAgICBwcml2YXRlIHVfcHZtX21hdHJpeF9pbnZlcnNlX2xvYzsvL+aooeWei+inhuWbvuaKleW9seeahOmAhuefqemYtVxyXG5cclxuICAgIHB1YmxpYyBVU0VfTk9STUFMOiBib29sZWFuID0gZmFsc2U7Ly/ms5Xnur9cclxuICAgIHB1YmxpYyBVU0VfTElHSFQ6IGJvb2xlYW4gPSBmYWxzZTsvL+WFieeFp1xyXG4gICAgcHVibGljIFVTRV9TS1lCT1g6IGJvb2xlYW4gPSBmYWxzZTsvL+WkqeepuuebklxyXG5cclxuXHJcbiAgICBwdWJsaWMgaXNTaG93RGVidWdMb2c6IGJvb2xlYW47Ly/mmK/lkKbmmL7npLrmiqXplJnml6Xlv5dcclxuXHJcbiAgICBwcm90ZWN0ZWQgX2dsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XHJcbiAgICBwcm90ZWN0ZWQgX3NwR0xJRDtcclxuICAgIGNvbnN0cnVjdG9yKGdsLCBnbElEKSB7XHJcbiAgICAgICAgdGhpcy5fZ2wgPSBnbDtcclxuICAgICAgICB0aGlzLl9zcEdMSUQgPSBnbElEO1xyXG4gICAgICAgIHRoaXMub25DcmVhdGVTaGFkZXIoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65LiA5Liqc2hhZGVyXHJcbiAgICAgKiBAcGFyYW0gdmVydCBcclxuICAgICAqIEBwYXJhbSBmcmFnIFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKHZlcnQsIGZyYWcpOiBTaGFkZXIge1xyXG4gICAgICAgIHZhciBnbElEID0gR19TaGFkZXJGYWN0b3J5LmNyZWF0ZVNoYWRlcih2ZXJ0LCBmcmFnKTtcclxuICAgICAgICByZXR1cm4gbmV3IFNoYWRlcihHX1NoYWRlckZhY3RvcnkuX2dsLCBnbElEKVxyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIG9uQ3JlYXRlU2hhZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIHZhciBzaGFkZXJQcm9ncmFtR0xJRCA9IHRoaXMuX3NwR0xJRDtcclxuICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcclxuICAgICAgICB0aGlzLmFfcG9zaXRpb25fbG9jID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLlBPU0lUSU9OKTtcclxuICAgICAgICB0aGlzLmFfbm9ybWFsX2xvYyA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5OT1JNQUwpO1xyXG4gICAgICAgIHRoaXMuYV91dl9sb2MgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuVVYpO1xyXG4gICAgICAgIHRoaXMuYV90YW5nZW50X2xvYyA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5UQU5HRU5UKTtcclxuICAgICAgICB0aGlzLnVfY29sb3JfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5DT0xPUik7XHJcbiAgICAgICAgdGhpcy51X2NvbG9yX2Rpcl9sb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLkNPTE9SX0RJUik7XHJcbiAgICAgICAgdGhpcy51X01WTWF0cml4X2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuTVZNYXRyaXgpO1xyXG4gICAgICAgIHRoaXMudV9QTWF0cml4X2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuUE1hdHJpeCk7XHJcbiAgICAgICAgdGhpcy51X3RleENvb3JkX2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuVEVYX0NPT1JEKTtcclxuICAgICAgICB0aGlzLnVfc2t5Ym94X2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuU0tZQk9YKTtcclxuICAgICAgICB0aGlzLnVfcHZtX21hdHJpeF9sb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLlBNVl9NQVRSSVgpO1xyXG4gICAgICAgIHRoaXMudV9wdm1fbWF0cml4X2ludmVyc2VfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5QTVZfTUFUUklYX0lOVkVSU0UpO1xyXG4gICAgICAgIHRoaXMudV9NTWF0cml4X2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuTU1hdHJpeCk7XHJcbiAgICAgICAgdGhpcy51X1ZNYXRyaXhfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5WTWF0cml4KVxyXG4gICAgfVxyXG4gICAgcHVibGljIGdldEN1c3RvbUF0dHJpYnV0ZUxvY2F0aW9uKHZhck5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9nbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLl9zcEdMSUQsIHZhck5hbWUpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEdMSUQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NwR0xJRDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOajgOafpXNoYWRlcuS4reWPmOmHj+eahOS9jee9ruaYr+WQpuacieaViFxyXG4gICAgICogQHBhcmFtIGxvYyBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja2xvY1ZhbGlkKGxvYywgdGFnTmFtZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAhKGxvYyA9PSBudWxsIHx8IGxvYyA8IDApO1xyXG4gICAgICAgIGlmICghcmVzdWx0ICYmIHRoaXMuaXNTaG93RGVidWdMb2cpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImVyci0tLS0tLS1cIiwgbG9jLCB0YWdOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgY2hlY2tHTElEVmFsaWQoZ2xJRCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoZ2xJRCA9PSBudWxsIHx8IGdsSUQgPD0gMCkgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy/lkK/nlKjlsZ7mgKfku47nvJPlhrLljLrkuK3ojrflj5bmlbDmja7nmoTlip/og71cclxuICAgIHByaXZhdGUgZW5hYmxlVmVydGV4QXR0cmlidXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy5hX3Bvc2l0aW9uX2xvYywgXCJhX3Bvc2l0aW9uX2xvY1wiKSkgey8vIOiuvuWumuS4uuaVsOe7hOexu+Wei+eahOWPmOmHj+aVsOaNrlxyXG4gICAgICAgICAgICB0aGlzLl9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfcG9zaXRpb25fbG9jKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfdXZfbG9jLCBcImFfdXZfbG9jXCIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYV91dl9sb2MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMuYV9ub3JtYWxfbG9jLCBcImFfbm9ybWFsX2xvY1wiKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfbm9ybWFsX2xvYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIC8vc2hhZGVy5Lit5omA5pyJ55qEYXR0cmlidXRlc+WPmOmHj1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVBdHRyaWJ1dGVzKHNoYWRlclByb2dyYW1HTElEKTogdm9pZCB7XHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5fZ2w7XHJcbiAgICAgICAgY29uc3QgbnVtQXR0cmlicyA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIoc2hhZGVyUHJvZ3JhbUdMSUQsIGdsLkFDVElWRV9BVFRSSUJVVEVTKTtcclxuICAgICAgICBmb3IgKGxldCBpaSA9IDA7IGlpIDwgbnVtQXR0cmliczsgKytpaSkge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJJbmZvID0gZ2wuZ2V0QWN0aXZlQXR0cmliKHNoYWRlclByb2dyYW1HTElELCBpaSk7XHJcbiAgICAgICAgICAgIGlmICghYXR0cmliSW5mbykge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhdHRyaWJJbmZvLS1cIiwgYXR0cmliSW5mby5uYW1lKTtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgYXR0cmliSW5mby5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy/mv4DmtLtzaGFkZXJcclxuICAgIHB1YmxpYyBhY3RpdmUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoKTtcclxuICAgICAgICB0aGlzLmVuYWJsZVZlcnRleEF0dHJpYnV0ZSgpO1xyXG4gICAgICAgIHRoaXMuX2dsLnVzZVByb2dyYW0odGhpcy5fc3BHTElEKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gY29sb3Ig5YWJ55qE6aKc6ImyXHJcbiAgICAgKiBAcGFyYW0gZGlyZWN0aW9uIOWFieeahOaWueWQkVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0VXNlTGlnaHQoY29sb3IgPSBbMC4yLCAxLCAwLjIsIDFdLCBkaXJlY3Rpb24gPSBbMC41LCAwLjcsIDFdKTogdm9pZCB7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5VU0VfTElHSFQgfHwgIXRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLnVfY29sb3JfbG9jLCBcInVfY29sb3JfbG9jXCIpIHx8ICF0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X2NvbG9yX2Rpcl9sb2MsIFwidV9jb2xvcl9kaXJfbG9jXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU2V0IHRoZSBjb2xvciB0byB1c2VcclxuICAgICAgICB0aGlzLl9nbC51bmlmb3JtNGZ2KHRoaXMudV9jb2xvcl9sb2MsIGNvbG9yKTsgLy8gZ3JlZW5cclxuXHJcbiAgICAgICAgLy8gc2V0IHRoZSBsaWdodCBkaXJlY3Rpb24uXHJcbiAgICAgICAgdGhpcy5fZ2wudW5pZm9ybTNmdih0aGlzLnVfY29sb3JfZGlyX2xvYywgZGlyZWN0aW9uKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXRVc2VTa3lCb3godV9wdm1fbWF0cml4X2ludmVyc2UpOiB2b2lkIHtcclxuXHJcbiAgICAgICAgdmFyIGdsID0gdGhpcy5fZ2w7XHJcblxyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSB1bmlmb3Jtc1xyXG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoXHJcbiAgICAgICAgICAgIHRoaXMudV9wdm1fbWF0cml4X2ludmVyc2VfbG9jLCBmYWxzZSxcclxuICAgICAgICAgICAgdV9wdm1fbWF0cml4X2ludmVyc2UpO1xyXG5cclxuICAgICAgICAvLyBUZWxsIHRoZSBzaGFkZXIgdG8gdXNlIHRleHR1cmUgdW5pdCAwIGZvciB1X3NreWJveFxyXG4gICAgICAgIGdsLnVuaWZvcm0xaSh0aGlzLnVfc2t5Ym94X2xvYywgMCk7XHJcblxyXG4gICAgICAgIC8vIGxldCBvdXIgcXVhZCBwYXNzIHRoZSBkZXB0aCB0ZXN0IGF0IDEuMFxyXG4gICAgICAgIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xyXG4gICAgfVxyXG4gICAgLy/orr7nva7kvb/nlKjmipXlvbHop4blj6PmqKHlnovnn6npmLVcclxuICAgIHB1YmxpYyBzZXRVc2VQcm9qZWN0Vmlld01vZGVsTWF0cml4KHB2bU1hdHJpeCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X3B2bV9tYXRyaXhfbG9jLCBcInVfcHZtX21hdHJpeF9sb2NcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVfcHZtX21hdHJpeF9sb2MsIGZhbHNlLCBwdm1NYXRyaXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v6K6+572u5YWJ54WnXHJcbiAgICBwdWJsaWMgc2V0VXNlQ29sb3IodUNvbG9yKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLnVfY29sb3JfbG9jLCBcInVfY29sb3JfbG9jXCIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dsLnVuaWZvcm00ZnYodGhpcy51X2NvbG9yX2xvYywgdUNvbG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL+iuvue9ruaooeWei+inhuWPo+efqemYtVxyXG4gICAgcHVibGljIHNldFVzZU1vZGVsVmlld01hdHJpeChtdk1hdHJpeCk6IHZvaWQge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMudV9NVk1hdHJpeF9sb2MsIFwidV9NVk1hdHJpeF9sb2NcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVfTVZNYXRyaXhfbG9jLCBmYWxzZSwgbXZNYXRyaXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v6K6+572u6YCP6KeG5oqV5b2x55+p6Zi1XHJcbiAgICBwdWJsaWMgc2V0VXNlUHJvamVjdGlvbk1hdHJpeChwcm9qTWF0cml4KTogdm9pZCB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X1BNYXRyaXhfbG9jLCBcInVfUE1hdHJpeF9sb2NcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVfUE1hdHJpeF9sb2MsIGZhbHNlLCBwcm9qTWF0cml4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL+iuvue9rumhtueCueWAvFxyXG4gICAgcHVibGljIHNldFVzZVZlcnRleEF0dHJpYlBvaW50ZXJGb3JWZXJ0ZXgoZ2xJRCwgaXRlbVNpemU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5jaGVja0dMSURWYWxpZChnbElEKSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy5hX3Bvc2l0aW9uX2xvYywgXCJhX3Bvc2l0aW9uX2xvY1wiKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9nbC5iaW5kQnVmZmVyKHRoaXMuX2dsLkFSUkFZX0JVRkZFUiwgZ2xJRCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2dsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYV9wb3NpdGlvbl9sb2MpO1xyXG4gICAgICAgICAgICBHTGFwaS52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuYV9wb3NpdGlvbl9sb2MsIGl0ZW1TaXplLCB0aGlzLl9nbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v6K6+572u5rOV57q/5YC8XHJcbiAgICBwdWJsaWMgc2V0VXNlVmVydGV4QXR0cmlQb2ludGVyRm9yTm9ybWFsKGdsSUQsIGl0ZW1TaXplOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuY2hlY2tHTElEVmFsaWQoZ2xJRCkpIHJldHVybjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBsb2NhbHRpb246c2hhZGVy5LitYXR0cmlidXRl5aOw5piO5Y+Y6YeP55qE5L2N572uXHJcbiAgICAgICAgICogc2l6ZTrmr4/mrKHov63ku6Pkvb/nlKjnmoTljZXkvY3mlbDmja5cclxuICAgICAgICAgKiB0eXBlOuWNleS9jeaVsOaNruexu+Wei1xyXG4gICAgICAgICAqIG5vcm1hbGxpemU65Y2V5L2N5YyW77yI44CQMC0yNTXjgJEtLeOAi+OAkDAtMeOAke+8iVxyXG4gICAgICAgICAqIHN0cmlkZTrmr4/mrKHov63ku6Pot7PlpJrlsJHkuKrmlbDmja7liLDkuIvkuIDkuKrmlbDmja5cclxuICAgICAgICAgKiBvZmZzZXQ65LuO57uR5a6a57yT5Yay5Yy655qE5YGP56e75L2N572uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfbm9ybWFsX2xvYywgXCJhX25vcm1hbF9sb2NcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2wuYmluZEJ1ZmZlcih0aGlzLl9nbC5BUlJBWV9CVUZGRVIsIGdsSUQpO1xyXG4gICAgICAgICAgICB0aGlzLl9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfbm9ybWFsX2xvYyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2dsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hX25vcm1hbF9sb2MsIGl0ZW1TaXplLCB0aGlzLl9nbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8v6K6+572udXblgLxcclxuICAgIHB1YmxpYyBzZXRVc2VWZXJ0ZXhBdHRyaWJQb2ludGVyRm9yVVYoZ2xJRCwgaXRlbVNpemU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghdGhpcy5jaGVja0dMSURWYWxpZChnbElEKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMuYV91dl9sb2MsIFwiYV91dl9sb2NcIikpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2wuYmluZEJ1ZmZlcih0aGlzLl9nbC5BUlJBWV9CVUZGRVIsIGdsSUQpO1xyXG4gICAgICAgICAgICB0aGlzLl9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfdXZfbG9jKTtcclxuICAgICAgICAgICAgdGhpcy5fZ2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFfdXZfbG9jLCBpdGVtU2l6ZSwgdGhpcy5fZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL+iuvue9ruS9v+eUqOeahOe6ueeQhlxyXG4gICAgLy/ms6jmhI/lpoLmnpzmraTlpITkuI3ph43mlrDorr7nva7kvb/nlKjnmoTnurnnkIbvvIzpgqPkuYjkvJrpu5jorqTkvb/nlKjkuIrkuIDmrKHnu5jliLbml7bnmoTnurnnkIZcclxuICAgIHB1YmxpYyBzZXRVc2VUZXh0dXJlKGdsSUQsIHBvcyA9IDApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuY2hlY2tHTElEVmFsaWQoZ2xJRCkpIHJldHVybjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgICogYWN0aXZlVGV4dHVyZeW/hemhu+WcqGJpbmRUZXh0dXJl5LmL5YmN44CC5aaC5p6c5rKhYWN0aXZlVGV4dHVyZeWwsWJpbmRUZXh0dXJl77yM5Lya6buY6K6k57uR5a6a5YiwMOWPt+e6ueeQhuWNleWFg1xyXG4gICAgICAgICovXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X3RleENvb3JkX2xvYywgXCJ1X3RleENvb3JkX2xvY1wiKSkge1xyXG4gICAgICAgICAgICAvLyDmv4DmtLsgMCDlj7fnurnnkIbljZXlhYNcclxuICAgICAgICAgICAgdGhpcy5fZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLl9nbFtnbFRFWFRVUkVfVU5JVF9WQUxJRFtwb3NdXSk7XHJcbiAgICAgICAgICAgIC8vIOaMh+WumuW9k+WJjeaTjeS9nOeahOi0tOWbvlxyXG4gICAgICAgICAgICB0aGlzLl9nbC5iaW5kVGV4dHVyZSh0aGlzLl9nbC5URVhUVVJFXzJELCBnbElEKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dsLnVuaWZvcm0xaSh0aGlzLnVfdGV4Q29vcmRfbG9jLCBwb3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy5hX3Bvc2l0aW9uX2xvYywgXCJhX3Bvc2l0aW9uX2xvY1wiKSkgey8vIOiuvuWumuS4uuaVsOe7hOexu+Wei+eahOWPmOmHj+aVsOaNrlxyXG4gICAgICAgICAgICB0aGlzLl9nbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hX3Bvc2l0aW9uX2xvYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy5hX3V2X2xvYywgXCJhX3V2X2xvY1wiKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9nbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hX3V2X2xvYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy5hX25vcm1hbF9sb2MsIFwiYV9ub3JtYWxfbG9jXCIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfbm9ybWFsX2xvYyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG59Il19
