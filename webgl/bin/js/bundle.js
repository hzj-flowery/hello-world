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
},{"./core/renderer/gfx/GLapi":5}],2:[function(require,module,exports){
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
function loadText(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, loadFile(url, 'text')];
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
    /**
     * 加载obj
     */
    LoaderManager.prototype.loadObjData = function (path, callBackProgress, callBackFinish) {
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
            case "obj": return this.loadObjData;
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
    "res/models/Robart/blockGuyNodeDescriptions.json",
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
var myHeaders = new Headers();
var myInit = { method: 'GET',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default' };
var myRequest = new Request('http:localhost:3000//res/models/windmill/windmill.obj', myInit);
fetch(myRequest).then(function (response) {
    return response.text();
}).then(function (myBlob) {
    console.log("myBlob-------", myBlob);
});
LoaderManager_1.default.instance.loadData(arr, null, function () {
    // new RenderFlow().startup();
    // RampTextureTest.run();
    // CameraTest.run();
    // RobartTest.run();
    // ObjTest.run();
});
},{"./Device":1,"./LoaderManager":2,"./core/renderer/shader/Shader":6}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
                    // console.log("error  绑定uniform变量失败------",name);
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
},{"../gfx/GLEnums":4,"../gfx/GLapi":5}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRGV2aWNlLnRzIiwic3JjL0xvYWRlck1hbmFnZXIudHMiLCJzcmMvTWFpbi50cyIsInNyYy9jb3JlL3JlbmRlcmVyL2dmeC9HTEVudW1zLnRzIiwic3JjL2NvcmUvcmVuZGVyZXIvZ2Z4L0dMYXBpLnRzIiwic3JjL2NvcmUvcmVuZGVyZXIvc2hhZGVyL1NoYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDTUEsbURBQWtEO0FBRWxEOztFQUVFO0FBQ0YsU0FBUyxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBUTtJQUFSLHFCQUFBLEVBQUEsUUFBUTtJQUMvQyx5Q0FBeUM7SUFDekMsK0JBQStCO0lBQy9CLDBCQUEwQjtJQUMxQixvQkFBb0I7SUFDcEIseUJBQXlCO0lBQ3pCLDRCQUE0QjtJQUM1QixZQUFZO0lBQ1osU0FBUztJQUNULEtBQUs7SUFDTCxnREFBZ0Q7SUFDaEQsK0JBQStCO0lBQy9CLDBCQUEwQjtJQUMxQixvQkFBb0I7SUFDcEIsaURBQWlEO0lBQ2pELDRCQUE0QjtJQUM1QixZQUFZO0lBQ1osU0FBUztJQUNULFdBQVc7SUFDWCxrQ0FBa0M7SUFDbEMsMEJBQTBCO0lBQzFCLG9CQUFvQjtJQUNwQiwyQkFBMkI7SUFDM0IsMkJBQTJCO0lBQzNCLFNBQVM7SUFDVCxJQUFJO0FBQ1IsQ0FBQztBQUVEO0lBQ0k7UUFHUSxXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFzRXBCLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFvSXBDLHVHQUF1RztRQUMvRixVQUFLLEdBQUc7WUFDWixnQkFBZ0IsRUFBRSxDQUFDO1lBQ25CLGlCQUFpQixFQUFFLENBQUM7WUFDcEIsZUFBZSxFQUFFLENBQUM7WUFDbEIsZUFBZSxFQUFFLENBQUM7WUFDbEIsZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixj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O1lBQ3RCLE9BQU8sVUFBVSxDQUFDO2dCQUNkLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQztTQUNMO1FBQ0QsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRTtZQUN0QixPQUFPLFVBQVUsQ0FBQztnQkFDZCxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUM7U0FDTDtRQUNELElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDdEIsT0FBTyxVQUFVLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDO1NBQ0w7UUFDRCxJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFO1lBQ2xCLE9BQU8sVUFBVSxDQUFDO2dCQUNkLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQztTQUNMO1FBQ0QsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRTtZQUN2QixPQUFPLFVBQVUsQ0FBQztnQkFDZCxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUM7U0FDTDtRQUNELElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUU7WUFDdkIsT0FBTyxVQUFVLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDO1NBQ0w7UUFDRCxJQUFJLElBQUksS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFO1lBQ3ZCLE9BQU8sVUFBVSxDQUFDO2dCQUNkLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQztTQUNMO1FBQ0QsSUFB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LEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEQ7UUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsRUFBRTtZQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN4RDtJQUNMLENBQUM7SUFJTCxhQUFDO0FBQUQsQ0FqUEEsQUFpUEMsSUFBQTtBQWpQWSx3QkFBTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlxuaW1wb3J0IGJyb3dzZXJpZnkgPSByZXF1aXJlKFwiYnJvd3NlcmlmeVwiKTtcbmltcG9ydCB7IHVwZGF0ZVNvdXJjZUZpbGVOb2RlIH0gZnJvbSBcInR5cGVzY3JpcHRcIjtcbmltcG9ydCBTY2VuZTJEIGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvYmFzZS9TY2VuZTJEXCI7XG5pbXBvcnQgU2NlbmUzRCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyL2Jhc2UvU2NlbmUzRFwiO1xuaW1wb3J0IEZyYW1lQnVmZmVyIGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvZ2Z4L0ZyYW1lQnVmZmVyXCI7XG5pbXBvcnQgeyBHTGFwaSB9IGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvZ2Z4L0dMYXBpXCI7XG5cbi8qKlxuKiBfYXR0YWNoXG4qL1xuZnVuY3Rpb24gX2F0dGFjaChnbCwgbG9jYXRpb24sIGF0dGFjaG1lbnQsIGZhY2UgPSAwKSB7XG4gICAgLy8gaWYgKGF0dGFjaG1lbnQgaW5zdGFuY2VvZiBUZXh0dXJlMkQpIHtcbiAgICAvLyAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgLy8gICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAvLyAgICAgICAgIGxvY2F0aW9uLFxuICAgIC8vICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAvLyAgICAgICAgIGF0dGFjaG1lbnQuX2dsSUQsXG4gICAgLy8gICAgICAgICAwXG4gICAgLy8gICAgICk7XG4gICAgLy8gfSBcbiAgICAvLyBlbHNlIGlmIChhdHRhY2htZW50IGluc3RhbmNlb2YgVGV4dHVyZUN1YmUpIHtcbiAgICAvLyAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgLy8gICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAvLyAgICAgICAgIGxvY2F0aW9uLFxuICAgIC8vICAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgZmFjZSxcbiAgICAvLyAgICAgICAgIGF0dGFjaG1lbnQuX2dsSUQsXG4gICAgLy8gICAgICAgICAwXG4gICAgLy8gICAgICk7XG4gICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoXG4gICAgLy8gICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAvLyAgICAgICAgIGxvY2F0aW9uLFxuICAgIC8vICAgICAgICAgZ2wuUkVOREVSQlVGRkVSLFxuICAgIC8vICAgICAgICAgYXR0YWNobWVudC5fZ2xJRFxuICAgIC8vICAgICApO1xuICAgIC8vIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGV2aWNlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfTtcbiAgICBwdWJsaWMgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBfZ2wyZDtcbiAgICBwcml2YXRlIF93aWR0aDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlciA9IDA7XG4gICAgcHVibGljIGNhbnZhczogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBEZXZpY2U7XG4gICAgcHVibGljIHN0YXRpYyBnZXQgSW5zdGFuY2UoKTogRGV2aWNlIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2UgPSBuZXcgRGV2aWNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlO1xuICAgIH1cbiAgICBwdWJsaWMgaW5pdCgpOiB2b2lkIHtcblxuICAgICAgICB2YXIgY2FudmFzOiBIVE1MRWxlbWVudCA9IHdpbmRvd1tcImNhbnZhc1wiXTtcbiAgICAgICAgdmFyIGdsID0gdGhpcy5jcmVhdGVHTENvbnRleHQoY2FudmFzKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgR0xhcGkuYmluZEdMKGdsKTtcbiAgICAgICAgY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgICAgICBjYW52YXMub25tb3VzZW1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgICAgIGNhbnZhcy5vbm1vdXNldXAgPSB0aGlzLm9uTW91c2VVcC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl93aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aDtcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc29sZS5sb2coXCLnlLvluIPnmoTlsLrlr7gtLS0tXCIsIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xuXG5cbiAgICAgICAgdGhpcy5pbml0RXh0KCk7XG4gICAgfVxuICAgIHB1YmxpYyBnZXRXZWJnbENvbnRleHQoKTogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmNhbnZhcyBhcyBhbnkpLmdldENvbnRleHQoXCJ3ZWJnbFwiKVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgV2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICAgIH1cblxuICAgIC8v6I635Y+Wd2ViZ2znlLvnrJTnmoTnsbvlnotcbiAgICBwdWJsaWMgZ2V0Q29udGV4dFR5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuZ2wgaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ3ZWJnbDJcIlxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCh0aGlzLmdsIGFzIGFueSkgaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBcIndlYmdsXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/liJvlu7p3ZWJnbOeUu+eslFxuICAgIHByaXZhdGUgY3JlYXRlR0xDb250ZXh0KGNhbnZhcyk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xuICAgICAgICB2YXIgbmFtZXMgPSBbXCJ3ZWJnbDJcIiwgXCJ3ZWJnbFwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbFwiXTtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiLW5hbWVzLS0tXCIsIG5hbWVzW2ldKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQobmFtZXNbaV0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIC8v5re75Yqg5Yqo5oCB5bGe5oCn6K6w5b2V55S75biD55qE5aSn5bCPXG4gICAgICAgICAgICBjb250ZXh0LnZpZXdwb3J0V2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgICAgICAgICBjb250ZXh0LnZpZXdwb3J0SGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiRmFpbGVkIHRvIGNyZWF0ZSBXZWJHTCBjb250ZXh0IVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pc0NhcHR1cmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2lzQ2FwdHVyZSA9IHRydWU7XG5cbiAgICB9XG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZShldik6IHZvaWQge1xuXG4gICAgfVxuICAgIHByaXZhdGUgb25Nb3VzZVVwKGV2KTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2lzQ2FwdHVyZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWwhue7k+aenOe7mOWItuWIsFVJ5LiKXG4gICAgICovXG4gICAgcHVibGljIGRyYXdUb1VJKHRpbWU6IG51bWJlciwgc2NlbmUyRDogU2NlbmUyRCwgc2NlbmUzRDogU2NlbmUzRCk6IHZvaWQge1xuICAgICAgICB0aGlzLmdsLmNsZWFyQ29sb3IoMC41MCwgMC41MCwgMC41MCwgMS4wKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgc2NlbmUyRC5nZXRGcmFtZUJ1ZmZlcigpKTtcbiAgICAgICAgdGhpcy5nbC5jbGVhcih0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQgfCB0aGlzLmdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBzY2VuZTNELnJlYWR5RHJhdyh0aW1lKTtcbiAgICAgICAgc2NlbmUyRC5yZWFkeURyYXcodGltZSk7XG5cbiAgICB9XG4gICAgLy/lsIbnu5Pmnpznu5jliLbliLDnqpflj6NcbiAgICBwdWJsaWMgZHJhdzJzY3JlZW4odGltZTogbnVtYmVyLCBzY2VuZTJEOiBTY2VuZTJELCBzY2VuZTNEOiBTY2VuZTNEKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZ2wuY2xlYXJDb2xvcigwLjgsIDAuOCwgMC44LCAxLjApO1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgdGhpcy5nbC5jbGVhcih0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQgfCB0aGlzLmdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBzY2VuZTNELnJlYWR5RHJhdyh0aW1lKTtcbiAgICAgICAgLy8gc2NlbmUyRC5yZWFkeURyYXcodGltZSk7XG4gICAgICAgIGlmICh0aGlzLl9pc0NhcHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzQ2FwdHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jYXB0dXJlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG5cbiAgICBwcml2YXRlIF9mcmFtZWJ1ZmZlcjogRnJhbWVCdWZmZXI7Ly/luKfnvJPlrZhcbiAgICAvKipcbiAgICogQG1ldGhvZCBzZXRGcmFtZUJ1ZmZlclxuICAgKiBAcGFyYW0ge0ZyYW1lQnVmZmVyfSBmYiAtIG51bGwgbWVhbnMgdXNlIHRoZSBiYWNrYnVmZmVyXG4gICAqL1xuICAgIHNldEZyYW1lQnVmZmVyKGZiOiBGcmFtZUJ1ZmZlcikge1xuICAgICAgICBpZiAodGhpcy5fZnJhbWVidWZmZXIgPT09IGZiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9mcmFtZWJ1ZmZlciA9IGZiO1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG5cbiAgICAgICAgaWYgKCFmYikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLnu5HlrprluKfnvJPlhrLlpLHotKUtLS0tLS0tLVwiKTtcbiAgICAgICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIue7keWumuW4p+e8k+WGsuaIkOWKn1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZmIuZ2V0SGFuZGxlKCkpO1xuXG4gICAgICAgIC8vIGxldCBudW1Db2xvcnMgPSBmYi5fY29sb3JzLmxlbmd0aDtcbiAgICAgICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db2xvcnM7ICsraSkge1xuICAgICAgICAvLyAgICAgbGV0IGNvbG9yQnVmZmVyID0gZmIuX2NvbG9yc1tpXTtcbiAgICAgICAgLy8gICAgIF9hdHRhY2goZ2wsIGdsLkNPTE9SX0FUVEFDSE1FTlQwICsgaSwgY29sb3JCdWZmZXIpO1xuXG4gICAgICAgIC8vICAgICAvLyBUT0RPOiB3aGF0IGFib3V0IGN1YmVtYXAgZmFjZT8/PyBzaG91bGQgYmUgdGhlIHRhcmdldCBwYXJhbWV0ZXIgZm9yIGNvbG9yQnVmZmVyXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gZm9yIChsZXQgaSA9IG51bUNvbG9yczsgaSA8IHRoaXMuX2NhcHMubWF4Q29sb3JBdHRhY2htZW50czsgKytpKSB7XG4gICAgICAgIC8vICAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChcbiAgICAgICAgLy8gICAgICAgICBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgLy8gICAgICAgICBnbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGksXG4gICAgICAgIC8vICAgICAgICAgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgLy8gICAgICAgICBudWxsLFxuICAgICAgICAvLyAgICAgICAgIDBcbiAgICAgICAgLy8gICAgICk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBpZiAoZmIuX2RlcHRoKSB7XG4gICAgICAgIC8vICAgICBfYXR0YWNoKGdsLCBnbC5ERVBUSF9BVFRBQ0hNRU5ULCBmYi5fZGVwdGgpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gaWYgKGZiLl9zdGVuY2lsKSB7XG4gICAgICAgIC8vICAgICBfYXR0YWNoKGdsLCBnbC5TVEVOQ0lMX0FUVEFDSE1FTlQsIGZiLl9zdGVuY2lsKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIGlmIChmYi5fZGVwdGhTdGVuY2lsKSB7XG4gICAgICAgIC8vICAgICBfYXR0YWNoKGdsLCBnbC5ERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlQsIGZiLl9kZXB0aFN0ZW5jaWwpO1xuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXcoc2NlbmVEYXRhKTogdm9pZCB7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gb2JqZWN0IFxuICAgICAqIHtcbiAgICAgKiB4OlxuICAgICAqIHk6XG4gICAgICogdzpcbiAgICAgKiBoOlxuICAgICAqIH1cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Vmlld1BvcnQob2JqZWN0OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydChvYmplY3QueCwgb2JqZWN0LnksIG9iamVjdC53ICogdGhpcy5nbC5jYW52YXMud2lkdGgsIG9iamVjdC5oICogdGhpcy5nbC5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6ZSBhIGNhbnZhcyB0byBtYXRjaCB0aGUgc2l6ZSBpdHMgZGlzcGxheWVkLlxuICAgICAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcyBUaGUgY2FudmFzIHRvIHJlc2l6ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW211bHRpcGxpZXJdIGFtb3VudCB0byBtdWx0aXBseSBieS5cbiAgICAgKiAgICBQYXNzIGluIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIGZvciBuYXRpdmUgcGl4ZWxzLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNhbnZhcyB3YXMgcmVzaXplZC5cbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOndlYmdsLXV0aWxzXG4gICAgICovXG4gICAgcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShjYW52YXMsIG11bHRpcGxpZXI/KSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSBtdWx0aXBsaWVyIHx8IDE7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoICogbXVsdGlwbGllciB8IDA7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBtdWx0aXBsaWVyIHwgMDtcbiAgICAgICAgaWYgKGNhbnZhcy53aWR0aCAhPT0gd2lkdGggfHwgY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy9jb3B5LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHByaXZhdGUgX2NhcHMgPSB7XG4gICAgICAgIG1heFZlcnRleFN0cmVhbXM6IDQsXG4gICAgICAgIG1heFZlcnRleFRleHR1cmVzOiAwLFxuICAgICAgICBtYXhGcmFnVW5pZm9ybXM6IDAsICAvL+eJh+auteedgOiJsuWZqOacgOWkp+WPr+S7peeUqOeahHVuaWZvcm3lj5jph49cbiAgICAgICAgbWF4VGV4dHVyZVVuaXRzOiAwLCAvL+acgOWkp+S9v+eUqOeahOe6ueeQhuWNleWFg+aVsFxuICAgICAgICBtYXhWZXJ0ZXhBdHRyaWJzOiAwLC8vc2hhZGVy5Lit5pyA5aSn5YWB6K646K6+572u55qE6aG254K55bGe5oCn5Y+Y6YeP5pWw55uuXG4gICAgICAgIG1heFRleHR1cmVTaXplOiAwLC8v5Zyo5pi+5a2Y5Lit5pyA5aSn5a2Y5Y+W57q555CG55qE5bC65a+4MTYzODRrYizkuZ/lsLHmmK8xNm0sWzQwOTYsNDA5Nl1cbiAgICAgICAgbWF4RHJhd0J1ZmZlcnM6IDAsXG4gICAgICAgIG1heENvbG9yQXR0YWNobWVudHM6IDBcbiAgICB9O1xuICAgIHByaXZhdGUgX2V4dGVuc2lvbnM6IEFycmF5PGFueT4gPSBbXTtcbiAgICBwcml2YXRlIF9zdGF0czogYW55O1xuICAgIHByaXZhdGUgaW5pdEV4dCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdHMgPSB7XG4gICAgICAgICAgICB0ZXh0dXJlOiAwLFxuICAgICAgICAgICAgdmI6IDAsXG4gICAgICAgICAgICBpYjogMCxcbiAgICAgICAgICAgIGRyYXdjYWxsczogMCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy96aC1DTi9kb2NzL1dlYi9BUEkvV2ViR0xfQVBJL1VzaW5nX0V4dGVuc2lvbnNcbiAgICAgICAgdGhpcy5faW5pdEV4dGVuc2lvbnMoW1xuICAgICAgICAgICAgJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycsXG4gICAgICAgICAgICAnRVhUX3NoYWRlcl90ZXh0dXJlX2xvZCcsXG4gICAgICAgICAgICAnT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyxcbiAgICAgICAgICAgICdPRVNfdGV4dHVyZV9mbG9hdCcsXG4gICAgICAgICAgICAnT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyxcbiAgICAgICAgICAgICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0JyxcbiAgICAgICAgICAgICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgICAgICAnT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnLFxuICAgICAgICAgICAgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9hdGMnLFxuICAgICAgICAgICAgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9ldGMnLFxuICAgICAgICAgICAgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9ldGMxJyxcbiAgICAgICAgICAgICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfcHZydGMnLFxuICAgICAgICAgICAgJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJyxcbiAgICAgICAgICAgICdXRUJHTF9kZXB0aF90ZXh0dXJlJyxcbiAgICAgICAgICAgICdXRUJHTF9kcmF3X2J1ZmZlcnMnLFxuICAgICAgICBdKTtcbiAgICAgICAgdGhpcy5faW5pdENhcHMoKTtcbiAgICAgICAgLy8gdGhpcy5faW5pdFN0YXRlcygpO1xuXG4gICAgICAgIHRoaXMuaGFuZGxlUHJlY2lzaW9uKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCLmi5PlsZUtLS0tLVwiLCB0aGlzLmdsLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAnRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCcsIFxuICAgICAgICAgKiAnRVhUX2Rpc2pvaW50X3RpbWVyX3F1ZXJ5X3dlYmdsMicsXG4gICAgICAgICAqICdFWFRfZmxvYXRfYmxlbmQnLCBcbiAgICAgICAgICogJ0VYVF90ZXh0dXJlX2NvbXByZXNzaW9uX2JwdGMnLCBcbiAgICAgICAgICogJ0VYVF90ZXh0dXJlX2NvbXByZXNzaW9uX3JndGMnLCBcbiAgICAgICAgICogJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycsIFxuICAgICAgICAgKiAnS0hSX3BhcmFsbGVsX3NoYWRlcl9jb21waWxlJywgXG4gICAgICAgICAqICdPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInLCBcbiAgICAgICAgICogJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJywgXG4gICAgICAgICAqICdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0Y19zcmdiJywgXG4gICAgICAgICAqICdXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvJywgXG4gICAgICAgICAqICdXRUJHTF9kZWJ1Z19zaGFkZXJzJywgXG4gICAgICAgICAqICdXRUJHTF9sb3NlX2NvbnRleHQnLCBcbiAgICAgICAgICogJ1dFQkdMX211bHRpX2RyYXcnLCBcbiAgICAgICAgICogJ09WUl9tdWx0aXZpZXcyXG4gICAgICAgICAqL1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBoYW5kbGVQcmVjaXNpb24oKTogdm9pZCB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi5aSE55CG57K+5bqmXCIpO1xuICAgICAgICB2YXIgZGF0YTEgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuVkVSVEVYX1NIQURFUiwgZ2wuTE9XX0ZMT0FUKTtcbiAgICAgICAgdmFyIGRhdGEyID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLlZFUlRFWF9TSEFERVIsIGdsLk1FRElVTV9GTE9BVCk7XG4gICAgICAgIHZhciBkYXRhMyA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5WRVJURVhfU0hBREVSLCBnbC5ISUdIX0ZMT0FUKTtcbiAgICAgICAgdmFyIGRhdGE0ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLlZFUlRFWF9TSEFERVIsIGdsLkxPV19JTlQpO1xuICAgICAgICB2YXIgZGF0YTUgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuVkVSVEVYX1NIQURFUiwgZ2wuTUVESVVNX0lOVCk7XG4gICAgICAgIHZhciBkYXRhNiA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5WRVJURVhfU0hBREVSLCBnbC5ISUdIX0lOVCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidmVydGV4IOeyvuW6puWAvC0tLVwiLCBkYXRhMSwgZGF0YTIsIGRhdGEzLCBkYXRhNCwgZGF0YTUsIGRhdGE2KTtcblxuICAgICAgICB2YXIgZGF0YTEgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5MT1dfRkxPQVQpO1xuICAgICAgICB2YXIgZGF0YTIgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5NRURJVU1fRkxPQVQpO1xuICAgICAgICB2YXIgZGF0YTMgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5ISUdIX0ZMT0FUKTtcbiAgICAgICAgdmFyIGRhdGE0ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuTE9XX0lOVCk7XG4gICAgICAgIHZhciBkYXRhNSA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5GUkFHTUVOVF9TSEFERVIsIGdsLk1FRElVTV9JTlQpO1xuICAgICAgICB2YXIgZGF0YTYgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5ISUdIX0lOVCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZnJhZ21lbnQg57K+5bqm5YC8LS0tXCIsIGRhdGExLCBkYXRhMiwgZGF0YTMsIGRhdGE0LCBkYXRhNSwgZGF0YTYpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIneWni+WMlua4suafk+eKtuaAgVxuICAgICAqL1xuICAgIF9pbml0U3RhdGVzKCkge1xuICAgICAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XG5cbiAgICAgICAgLy8gZ2wuZnJvbnRGYWNlKGdsLkNDVyk76L+Z5LiA5Y+l5Luj56CB5piv5aSa5L2Z55qE77yMd2ViZ2zpu5jorqTnmoTlsLHmmK/pgIbml7bpkojkuLrmraPpnaJcbiAgICAgICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7XG4gICAgICAgIGdsLmJsZW5kRnVuYyhnbC5PTkUsIGdsLlpFUk8pO1xuICAgICAgICBnbC5ibGVuZEVxdWF0aW9uKGdsLkZVTkNfQUREKTtcbiAgICAgICAgZ2wuYmxlbmRDb2xvcigxLCAxLCAxLCAxKTtcblxuICAgICAgICBnbC5jb2xvck1hc2sodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XG5cbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xuXG4gICAgICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIGdsLmRlcHRoRnVuYyhnbC5MRVNTKTtcbiAgICAgICAgZ2wuZGVwdGhNYXNrKHRydWUpO1xuICAgICAgICBnbC5kaXNhYmxlKGdsLlBPTFlHT05fT0ZGU0VUX0ZJTEwpO1xuICAgICAgICBnbC5kZXB0aFJhbmdlKDAsIDEpO1xuXG4gICAgICAgIGdsLmRpc2FibGUoZ2wuU1RFTkNJTF9URVNUKTtcbiAgICAgICAgZ2wuc3RlbmNpbEZ1bmMoZ2wuQUxXQVlTLCAwLCAweEZGKTtcbiAgICAgICAgZ2wuc3RlbmNpbE1hc2soMHhGRik7XG4gICAgICAgIGdsLnN0ZW5jaWxPcChnbC5LRUVQLCBnbC5LRUVQLCBnbC5LRUVQKTtcblxuXG4gICAgICAgIGdsLmNsZWFyRGVwdGgoMSk7XG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMCk7XG4gICAgICAgIGdsLmNsZWFyU3RlbmNpbCgwKTtcblxuICAgICAgICBnbC5kaXNhYmxlKGdsLlNDSVNTT1JfVEVTVCk7XG4gICAgfVxuXG4gICAgX2luaXRFeHRlbnNpb25zKGV4dGVuc2lvbnMpIHtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gZXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgIGxldCB2ZW5kb3JQcmVmaXhlcyA9IFtcIlwiLCBcIldFQktJVF9cIiwgXCJNT1pfXCJdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZlbmRvclByZWZpeGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4dCA9IGdsLmdldEV4dGVuc2lvbih2ZW5kb3JQcmVmaXhlc1tqXSArIG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9leHRlbnNpb25zW25hbWVdID0gZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4qIEBtZXRob2QgZXh0XG4qIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4qL1xuICAgIGV4dChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9leHRlbnNpb25zW25hbWVdO1xuICAgIH1cblxuICAgIF9pbml0Q2FwcygpIHtcbiAgICAgICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBjb25zdCBleHREcmF3QnVmZmVycyA9IHRoaXMuZXh0KCdXRUJHTF9kcmF3X2J1ZmZlcnMnKTtcblxuICAgICAgICB0aGlzLl9jYXBzLm1heFZlcnRleFN0cmVhbXMgPSA0O1xuICAgICAgICB0aGlzLl9jYXBzLm1heFZlcnRleFRleHR1cmVzID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVEVYVFVSRV9JTUFHRV9VTklUUyk7XG4gICAgICAgIHRoaXMuX2NhcHMubWF4RnJhZ1VuaWZvcm1zID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlMpO1xuICAgICAgICB0aGlzLl9jYXBzLm1heFRleHR1cmVVbml0cyA9IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyk7XG4gICAgICAgIHRoaXMuX2NhcHMubWF4VmVydGV4QXR0cmlicyA9IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX0FUVFJJQlMpO1xuICAgICAgICB0aGlzLl9jYXBzLm1heFRleHR1cmVTaXplID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX1NJWkUpO1xuXG4gICAgICAgIHRoaXMuX2NhcHMubWF4RHJhd0J1ZmZlcnMgPSBleHREcmF3QnVmZmVycyA/IGdsLmdldFBhcmFtZXRlcihleHREcmF3QnVmZmVycy5NQVhfRFJBV19CVUZGRVJTX1dFQkdMKSA6IDE7XG4gICAgICAgIHRoaXMuX2NhcHMubWF4Q29sb3JBdHRhY2htZW50cyA9IGV4dERyYXdCdWZmZXJzID8gZ2wuZ2V0UGFyYW1ldGVyKGV4dERyYXdCdWZmZXJzLk1BWF9DT0xPUl9BVFRBQ0hNRU5UU19XRUJHTCkgOiAxO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwidGhpcy5fY2Fwcy0tLVwiLCB0aGlzLl9jYXBzKTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInptXCIsIFwibmloYW9hXCIpO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmiKrlm75cbiAgICAgKi9cbiAgICBwcml2YXRlIGNhcHR1cmUoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNhdmVCbG9iID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpO1xuICAgICAgICAgICAgYS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNhdmVEYXRhKGJsb2IsIGZpbGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICAgICAgICAgIGEuZG93bmxvYWQgPSBmaWxlTmFtZTtcbiAgICAgICAgICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpO1xuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuICAgICAgICAoZ2wuY2FudmFzIGFzIGFueSkudG9CbG9iKChibG9iKSA9PiB7XG4gICAgICAgICAgICBzYXZlQmxvYihibG9iLCBgc2NyZWVuY2FwdHVyZS0ke2dsLmNhbnZhcy53aWR0aH14JHtnbC5jYW52YXMuaGVpZ2h0fS5wbmdgKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvL+WJlOmZpOafkOS4gOS4qumdolxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBiYWNrIHRydWUg5Luj6KGo5YmU6Zmk6IOM6Z2iIGZhbHNlIOS7o+ihqOWJlOmZpOWJjemdolxuICAgICAqIEBwYXJhbSBib3RoIOihqOekuuWJjeWQjumdoumDveWJlOmZpFxuICAgICAqL1xuICAgIHB1YmxpYyBjdWxsRmFjZShiYWNrOiBib29sZWFuID0gdHJ1ZSwgYm90aD8pOiB2b2lkIHtcbiAgICAgICAgdmFyIGdsID0gdGhpcy5nbDtcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7Ly/lvIDlkK/pnaLliZTpmaTlip/og71cbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNXKTsvL+mAhuaXtumSiOe7mOWItueahOS7o+ihqOato+mdoiDmraPluLjnkIbop6PvvIznnIvliLDnmoTpnaLmmK/mraPpnaJnbC5GUk9OVO+8jOeci+S4jeWIsOeahOmdouaYr+iDjOmdomdsLkJBQ0tcbiAgICAgICAgLy8gZ2wuZnJvbnRGYWNlKGdsLkNDVyk7Ly/pobrml7bpkojnu5jliLbnmoTku6PooajmraPpnaIgIOmcgOimgeWPjei/h+adpeeQhuino++8jOWNs+aIkeS7rOeci+WIsOeahOmdouaYr+iDjOmdou+8jOeci+S4jeWIsOeahOmdouaYr+ato+mdolxuICAgICAgICBpZiAoYm90aCkge1xuICAgICAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuRlJPTlRfQU5EX0JBQ0spOyAvL+WJjeWQjuS4pOS4qumdoumDveWJlOmZpFxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGJhY2spIHtcbiAgICAgICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spOy8v5Y+q5YmU6Zmk6IOM6Z2iXG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdsLmN1bGxGYWNlKGdsLkZST05UKTsvL+WPquWJlOmZpOWJjemdolxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOWFs+mXremdouWJlOmZpOWKn+iDvVxuICAgICAqL1xuICAgIHB1YmxpYyBjbG9zZUN1bGxGYWNlKCk6IHZvaWQge1xuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuICAgICAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICBnbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgICAgIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICB9XG59XG4iLCIvKipcbiAqIOWKoOi9veeuoeeQhuWRmFxuICovXG5cbmNsYXNzIENhY2hlSW1hZ2VEYXRhIHtcbiAgICBjb25zdHJ1Y3Rvcih1cmwsaW1nKXtcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICAgIHRoaXMuaW1nID0gaW1nO1xuICAgIH1cbiAgICBwdWJsaWMgdXJsOnN0cmluZyA9IFwiXCI7XG4gICAgcHVibGljIGltZzpIVE1MSW1hZ2VFbGVtZW50O1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkRmlsZSh1cmwsIHR5cGVGdW5jKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3QgbG9hZDogJHt1cmx9YCk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZVt0eXBlRnVuY10oKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZEJpbmFyeSh1cmwpIHtcbiAgICByZXR1cm4gbG9hZEZpbGUodXJsLCAnYXJyYXlCdWZmZXInKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZEpTT04odXJsKSB7XG4gICAgcmV0dXJuIGxvYWRGaWxlKHVybCwgJ2pzb24nKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0KHVybCkge1xuICAgIHJldHVybiBsb2FkRmlsZSh1cmwsICd0ZXh0Jyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvYWRlck1hbmFnZXJ7XG4gICAgcHJpdmF0ZSBfY2FjaGVJbWFnZTpBcnJheTxDYWNoZUltYWdlRGF0YT4gPSBbXTtcbiAgICBwcml2YXRlIF9jYWNoZTpNYXA8c3RyaW5nLGFueT47Ly/otYTmupDnvJPlrZhcbiAgICBwdWJsaWMgc3RhdGljIF9pbnN0YW5jZTpMb2FkZXJNYW5hZ2VyO1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6TG9hZGVyTWFuYWdlclxuICAgIHtcbiAgICAgICAgaWYoIXRoaXMuX2luc3RhbmNlKVxuICAgICAgICB0aGlzLl9pbnN0YW5jZSA9IG5ldyBMb2FkZXJNYW5hZ2VyKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBNYXA8c3RyaW5nLGFueT4oKTtcbiAgICB9XG4gICAgXG4gICAgLy/liqDovb1nbHRm5Yqo55S75paH5Lu2XG4gICAgYXN5bmMgbG9hZEdMVEYocGF0aDpzdHJpbmcpe1xuICAgICAgICBjb25zdCBnbHRmID0gYXdhaXQgbG9hZEpTT04ocGF0aCk7XG4gICAgICAgIC8vIGxvYWQgYWxsIHRoZSByZWZlcmVuY2VkIGZpbGVzIHJlbGF0aXZlIHRvIHRoZSBnbHRmIGZpbGVcbiAgICAgICAgY29uc3QgYmFzZVVSTCA9IG5ldyBVUkwocGF0aCwgbG9jYXRpb24uaHJlZik7XG4gICAgICAgIGdsdGYuYnVmZmVycyA9IGF3YWl0IFByb21pc2UuYWxsKGdsdGYuYnVmZmVycy5tYXAoKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChidWZmZXIudXJpLCBiYXNlVVJMLmhyZWYpO1xuICAgICAgICAgICAgcmV0dXJuIGxvYWRCaW5hcnkodXJsLmhyZWYpO1xuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuX2NhY2hlLnNldChwYXRoLGdsdGYpO1xuICAgIH1cblxuICAgIC8v5Yqg6L29anNvbuagvOW8j+eahOS6jOi/m+WItlxuICAgIC8v5bCx5piv5bCGanNvbui9rOS4uuS6jOi/m+WItiDnhLblkI7ku6Xkuozov5vliLbor7vlj5blho3ovazkvJpqc29uXG4gICAgcHJpdmF0ZSBsb2FkSnNvbkJsb2JEYXRhKHBhdGg6c3RyaW5nLGNhbGxCYWNrUHJvZ3Jlc3M/LGNhbGxCYWNrRmluaXNoPyk6dm9pZHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgcmVxdWVzdC5vcGVuKFwiZ2V0XCIscGF0aCk7XG4gICAgICAgIHJlcXVlc3Quc2VuZChudWxsKTtcbiAgICAgICAgLy/ku6Xkuozov5vliLbmlrnlvI/or7vlj5bmlbDmja4s6K+75Y+W5Yiw55qE57uT5p6c5bCG5pS+5YWlQmxvYueahOS4gOS4quWvueixoeS4reWtmOaUvlxuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKHJlcXVlc3Quc3RhdHVzPT0wKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBmciA9IG5ldyBGaWxlUmVhZGVyKCk7IC8vRmlsZVJlYWRlcuWPr+S7peivu+WPlkJsb2LlhoXlrrkgIFxuICAgICAgICAgICAgICAgIGZyLnJlYWRBc0FycmF5QnVmZmVyKHJlcXVlc3QucmVzcG9uc2UpOyAvL+S6jOi/m+WItui9rOaNouaIkEFycmF5QnVmZmVyXG4gICAgICAgICAgICAgICAgZnIub25sb2FkID0gZnVuY3Rpb24gKGUpIHsgIC8v6L2s5o2i5a6M5oiQ5ZCO77yM6LCD55Sob25sb2Fk5pa55rOVXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmluIGZpbGUtLS1cIixmci5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmF3RGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoZnIucmVzdWx0IGFzIEFycmF5QnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0ciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmF3RGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyK1N0cmluZy5mcm9tQ2hhckNvZGUoKHJhd0RhdGFbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKHN0cik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0IC0tXCIsc3RyKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2NhY2hlLnNldChwYXRoLGZyLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNhbGxCYWNrRmluaXNoKWNhbGxCYWNrRmluaXNoLmNhbGwobnVsbCxmci5yZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiDliqDovb1vYmpcbiAgICAgKi9cbiAgICBwdWJsaWMgbG9hZE9iakRhdGEocGF0aDpzdHJpbmcsY2FsbEJhY2tQcm9ncmVzcz8sY2FsbEJhY2tGaW5pc2g/KTp2b2lke1xuXG4gICAgfVxuXG4gICAgXG4gICAgLy/liqDovb3kuozov5vliLbmlbDmja5cbiAgICBwdWJsaWMgbG9hZEJsb2JEYXRhKHBhdGg6c3RyaW5nLGNhbGxCYWNrUHJvZ3Jlc3M/LGNhbGxCYWNrRmluaXNoPyk6dm9pZHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgcmVxdWVzdC5vcGVuKFwiZ2V0XCIscGF0aCk7XG4gICAgICAgIHJlcXVlc3Quc2VuZChudWxsKTtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcbiAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZihyZXF1ZXN0LnN0YXR1cz09MClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpOyAvL0ZpbGVSZWFkZXLlj6/ku6Xor7vlj5ZCbG9i5YaF5a65ICBcbiAgICAgICAgICAgICAgICBmci5yZWFkQXNBcnJheUJ1ZmZlcihyZXF1ZXN0LnJlc3BvbnNlKTsgLy/kuozov5vliLbovazmjaLmiJBBcnJheUJ1ZmZlclxuICAgICAgICAgICAgICAgIGZyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7ICAvL+i9rOaNouWujOaIkOWQju+8jOiwg+eUqG9ubG9hZOaWueazlVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fY2FjaGUuc2V0KHBhdGgsZnIucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYoY2FsbEJhY2tGaW5pc2gpY2FsbEJhY2tGaW5pc2guY2FsbChudWxsLGZyLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8v5Yqg6L29anNvbuaVsOaNrlxuICAgIHB1YmxpYyBsb2FkSnNvbkRhdGEocGF0aDpzdHJpbmcsY2FsbEJhY2tQcm9ncmVzcz8sY2FsbEJhY2tGaW5pc2g/KTp2b2lke1xuICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICByZXF1ZXN0Lm9wZW4oXCJnZXRcIixwYXRoKTtcbiAgICAgICAgcmVxdWVzdC5zZW5kKG51bGwpO1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwianNvblwiO1xuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKHJlcXVlc3Quc3RhdHVzPT0wKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBqc29uRGF0YSA9IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgX3RoaXMuX2NhY2hlLnNldChwYXRoLGpzb25EYXRhKVxuICAgICAgICAgICAgICAgIGlmKGNhbGxCYWNrRmluaXNoKWNhbGxCYWNrRmluaXNoLmNhbGwobnVsbCxqc29uRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/liqDovb3lj6/ku6XovazljJbkuLpqc29u55qE5pWw5o2uXG4gICAgcHVibGljIGxvYWRKc29uU3RyaW5nRGF0YShwYXRoOnN0cmluZyxjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pOnZvaWR7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHJlcXVlc3Qub3BlbihcImdldFwiLHBhdGgpO1xuICAgICAgICByZXF1ZXN0LnNlbmQobnVsbCk7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gXCJ0ZXh0XCI7XG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYocmVxdWVzdC5zdGF0dXM9PTApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGpzb25EYXRhID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgX3RoaXMuX2NhY2hlLnNldChwYXRoLGpzb25EYXRhKVxuICAgICAgICAgICAgICAgIGlmKGNhbGxCYWNrRmluaXNoKWNhbGxCYWNrRmluaXNoLmNhbGwobnVsbCxqc29uRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/liqDovb3pqqjpqrzmlbDmja5cbiAgICBwcml2YXRlIGxvYWRTa2VsRGF0YShwYXRoOnN0cmluZyxjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pOnZvaWR7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3Qub3BlbihcImdldFwiLHBhdGgpO1xuICAgICAgICByZXF1ZXN0LnNlbmQobnVsbCk7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYocmVxdWVzdC5zdGF0dXM9PTApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGZyID0gbmV3IEZpbGVSZWFkZXIoKTsgLy9GaWxlUmVhZGVy5Y+v5Lul6K+75Y+WQmxvYuWGheWuuSAgXG4gICAgICAgICAgICAgICAgZnIucmVhZEFzQXJyYXlCdWZmZXIocmVxdWVzdC5yZXNwb25zZSk7IC8v5LqM6L+b5Yi26L2s5o2i5oiQQXJyYXlCdWZmZXJcbiAgICAgICAgICAgICAgICAvLyBmci5yZWFkQXNUZXh0KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGZyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7ICAvL+i9rOaNouWujOaIkOWQju+8jOiwg+eUqG9ubG9hZOaWueazlVxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIuWKoOi9veS6jOi/m+WItuaIkOWKny0tLVwiLGZyLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl9jYWNoZS5zZXQocGF0aCxmci5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gdmFyIHVpbnQ4X21zZyA9IG5ldyBVaW50OEFycmF5KGZyLnJlc3VsdCBhcyBBcnJheUJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIOino+eggeaIkOWtl+espuS4slxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgZGVjb2RlZFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdWludDhfbXNnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCLlrZfnrKbkuLItLVwiLGRlY29kZWRTdHJpbmcpOyBcbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gcGFyc2Us6L2s5oiQanNvbuaVsOaNrlxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZGVjb2RlZFN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBjb250ZW50ID0gZnIucmVzdWx0Oy8vYXJyYXlidWZmZXLnsbvlnovmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IHJlc0Jsb2IgPSBuZXcgQmxvYihbY29udGVudF0pXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlYWRlci5yZWFkQXNUZXh0KHJlc0Jsb2IsIFwidXRmLThcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVhZGVyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiZ2FnYWctLS1cIixyZWFkZXIucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBsZXQgcmVzID0gSlNPTi5wYXJzZShyZWFkZXIucmVzdWx0IGFzIHN0cmluZylcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoY2FsbEJhY2tGaW5pc2gpY2FsbEJhY2tGaW5pc2guY2FsbChudWxsLGZyLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy/liqDovb3lm77niYfmlbDmja5cbiAgICBwdWJsaWMgbG9hZEltYWdlRGF0YShwYXRoOnN0cmluZyxjYWxsQmFja1Byb2dyZXNzPyxjYWxsQmFja0ZpbmlzaD8pOnZvaWR7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKGltZzpIVE1MSW1hZ2VFbGVtZW50KXtcbiAgICAgICAgICAgIGlmKCFpbWcpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLliqDovb3nmoTlm77niYfot6/lvoTkuI3lrZjlnKgtLS1cIixwYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY2FjaGVJbWFnZS5wdXNoKG5ldyBDYWNoZUltYWdlRGF0YShwYXRoLGltZykpO1xuICAgICAgICAgICAgaWYoY2FsbEJhY2tGaW5pc2gpY2FsbEJhY2tGaW5pc2guY2FsbChudWxsLGltZyk7XG4gICAgICAgIH0uYmluZCh0aGlzLGltZyk7XG4gICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgIH1cbiAgICBwcml2YXRlIGdldExvYWRGdW5jKHBhdGg6c3RyaW5nKTpGdW5jdGlvbntcbiAgICAgICAgICAgIGxldCBzdHJBcnIgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBsZXQgZXh0TmFtZSA9IHN0ckFycltzdHJBcnIubGVuZ3RoLTFdO1xuICAgICAgICAgICAgc3dpdGNoKGV4dE5hbWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBjYXNlIFwianBnXCI6cmV0dXJuIHRoaXMubG9hZEltYWdlRGF0YTtcbiAgICAgICAgICAgICAgIGNhc2UgXCJwbmdcIjpyZXR1cm4gdGhpcy5sb2FkSW1hZ2VEYXRhO1xuICAgICAgICAgICAgICAgY2FzZSBcImJpblwiOnJldHVybiB0aGlzLmxvYWRCbG9iRGF0YTtcbiAgICAgICAgICAgICAgIGNhc2UgXCJvYmpcIjpyZXR1cm4gdGhpcy5sb2FkT2JqRGF0YTtcbiAgICAgICAgICAgICAgIGNhc2UgXCJqc29uXCI6cmV0dXJuIHRoaXMubG9hZEpzb25EYXRhO1xuICAgICAgICAgICAgICAgY2FzZSBcImdsdGZcIjpyZXR1cm4gdGhpcy5sb2FkSnNvblN0cmluZ0RhdGE7XG4gICAgICAgICAgICAgICBjYXNlIFwic2tlbFwiOnJldHVybiB0aGlzLmxvYWRTa2VsRGF0YTtcbiAgICAgICAgICAgICAgIGRlZmF1bHQ6Y29uc29sZS5sb2coXCLlj5HnjrDmnKrnn6XlkI7nvIDlkI3nmoTmlofku7YtLS0tXCIscGF0aCk7bnVsbDticmVhaztcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgLy/liqDovb3mlbDmja5cbiAgICBwdWJsaWMgYXN5bmMgbG9hZERhdGEoYXJyOkFycmF5PHN0cmluZz4sY2FsbEJhY2tQcm9ncmVzcz8sY2FsbEJhY2tGaW5pc2g/KXtcbiAgICAgICAgIFxuICAgICAgICAvL3Rlc3RcbiAgICAgICAgLy8gYXdhaXQgdGhpcy5sb2FkR0xURihcImh0dHBzOi8vd2ViZ2xmdW5kYW1lbnRhbHMub3JnL3dlYmdsL3Jlc291cmNlcy9tb2RlbHMva2lsbGVyX3doYWxlL3doYWxlLkNZQ0xFUy5nbHRmXCIpO1xuXG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIGZvcih2YXIgaiA9MDtqPGFyci5sZW5ndGg7aisrKVxuICAgICAgICB7XG4gICAgICAgICAgbGV0IHBhdGg6c3RyaW5nID0gYXJyW2pdO1xuICAgICAgICAgIHZhciBsb2FkRnVuYyA9IHRoaXMuZ2V0TG9hZEZ1bmMocGF0aCk7XG4gICAgICAgICAgbG9hZEZ1bmMuY2FsbCh0aGlzLHBhdGgsbnVsbCwocmVzKT0+e1xuICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICB0aGlzLm9uTG9hZFByb2dyZXNzKGNvdW50L2Fyci5sZW5ndGgpO1xuICAgICAgICAgICAgICBpZihjb3VudD09YXJyLmxlbmd0aClcbiAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Mb2FkRmluaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYoY2FsbEJhY2tGaW5pc2gpY2FsbEJhY2tGaW5pc2goKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8v6I635Y+W57yT5a2Y5Lit55qE5pWw5o2uXG4gICAgcHVibGljIGdldENhY2hlRGF0YSh1cmw6c3RyaW5nKTphbnl7XG4gICAgICAgICAgIGNvbnNvbGUubG9nKHVybCx0aGlzLl9jYWNoZS5oYXModXJsKSk7XG4gICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZS5nZXQodXJsKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6I635Y+W57yT5a2Y55qE57q555CG5pWw5o2uXG4gICAgICogQHBhcmFtIHVybCBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q2FjaGVJbWFnZSh1cmw6c3RyaW5nKTpIVE1MSW1hZ2VFbGVtZW50e1xuICAgICAgICAgZm9yKHZhciBqID0gMDtqPHRoaXMuX2NhY2hlSW1hZ2UubGVuZ3RoO2orKylcbiAgICAgICAgIHtcbiAgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlSW1hZ2Vbal07XG4gICAgICAgICAgICAgaWYoZGF0YS51cmw9PXVybClcbiAgICAgICAgICAgICByZXR1cm4gZGF0YS5pbWc7XG4gICAgICAgICB9XG4gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog56e76ZmkQ1BV56uv5YaF5a2Y5Lit55qE5Zu+54mH57yT5a2YXG4gICAgICogQHBhcmFtIHVybCBcbiAgICAgKi8gXG4gICAgcHVibGljIHJlbW92ZUltYWdlKHVybDpzdHJpbmcpOnZvaWR7XG4gICAgICAgIFxuICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgdmFyIGltZzpIVE1MSW1hZ2VFbGVtZW50O1xuICAgICAgICBmb3IodmFyIGogPSAwO2o8dGhpcy5fY2FjaGVJbWFnZS5sZW5ndGg7aisrKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlSW1hZ2Vbal07XG4gICAgICAgICAgICBpZihkYXRhLnVybD09dXJsKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgaW5kZXggPSBqO1xuICAgICAgICAgICAgICAgaW1nID0gZGF0YS5pbWc7XG4gICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihpbmRleD49MClcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLop6PpmaTlvJXnlKhcIik7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZUltYWdlLnNwbGljZShpbmRleCwxKTtcbiAgICAgICAgICAgIHRoaXMucmVsZWFzZUNQVU1lbW9yeUZvckltYWdlQ2FjaGUoaW1nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5rKh5om+5YiwLS0tLVwiLGltZyxpbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIGltZyBcbiAgICAgKiDph4rmlL5DUFXnq6/lhoXlrZjkuK3nmoTlm77niYfnvJPlrZhcbiAgICAgKi8gXG4gICAgcHVibGljIHJlbGVhc2VDUFVNZW1vcnlGb3JJbWFnZUNhY2hlKGltZzpIVE1MSW1hZ2VFbGVtZW50KTp2b2lke1xuICAgICAgICBpbWcuc3JjID0gXCJcIjtcbiAgICAgICAgaW1nID0gbnVsbDtcbiAgICB9XG4gICAgcHVibGljIG9uTG9hZFByb2dyZXNzKHByb2dyZXNzOm51bWJlcik6dm9pZHtcbiAgICAgICAgIGNvbnNvbGUubG9nKFwi5Yqg6L296L+b5bqmLS0tLS0tLS0tXCIscHJvZ3Jlc3MpO1xuICAgIH1cbiAgICBwdWJsaWMgb25Mb2FkRmluaXNoKCk6dm9pZHtcbiAgICAgICAgY29uc29sZS5sb2coXCLliqDovb3lrozmiJDllaZcIik7XG4gICAgfVxuXG59IiwiLy/nrKwx5q2lIC0g5YeG5aSHQ2FudmFz5ZKM6I635Y+WV2ViR0znmoTmuLLmn5PkuIrkuIvmlodcclxuXHJcblxyXG5cclxuXHJcbmltcG9ydCBEZXZpY2UgZnJvbSBcIi4vRGV2aWNlXCI7XHJcbmltcG9ydCBMb2FkZXJNYW5hZ2VyIGZyb20gXCIuL0xvYWRlck1hbmFnZXJcIjtcclxuaW1wb3J0IHsgR19TaGFkZXJGYWN0b3J5IH0gZnJvbSBcIi4vY29yZS9yZW5kZXJlci9zaGFkZXIvU2hhZGVyXCI7XHJcbmltcG9ydCBQb2ludExpZ2h0VGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyL2xpZ2h0L1BvaW50TGlnaHRUZXN0XCI7XHJcbmltcG9ydCBSZW5kZXJGbG93IGZyb20gXCIuL1JlbmRlckZsb3dcIjtcclxuaW1wb3J0IFN0YWdlIGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvM2QvU3RhZ2VcIjtcclxuaW1wb3J0IEZvZ1Rlc3QgZnJvbSBcIi4vY29yZS9yZW5kZXJlci8zZC9Gb2dUZXN0XCI7XHJcbmltcG9ydCBFYXJ0aFN1blRlc3QgZnJvbSBcIi4vY29yZS9yZW5kZXJlci8zZC9FYXJ0aFN1blRlc3RcIjtcclxuaW1wb3J0IFJvYmFydFRlc3QgZnJvbSBcIi4vY29yZS9yZW5kZXJlci8zZC9Sb2JhcnRUZXN0XCI7XHJcbmltcG9ydCBDYXB0dXJlVGVzdCBmcm9tIFwiLi9jb3JlL3JlbmRlcmVyLzNkL0NhcHR1cmVUZXN0XCI7XHJcbmltcG9ydCBSYW1wVGV4dHVyZVRlc3QgZnJvbSBcIi4vY29yZS9yZW5kZXJlci8zZC9SYW1wVGV4dHVyZVRlc3RcIjtcclxuaW1wb3J0IENhbWVyYVRlc3QgZnJvbSBcIi4vY29yZS9yZW5kZXJlci8zZC9DYW1lcmFUZXN0XCI7XHJcbmltcG9ydCBPYmpUZXN0IGZyb20gXCIuL2NvcmUvcmVuZGVyZXIvM2QvT2JqVGVzdFwiO1xyXG5cclxuXHJcblxyXG5EZXZpY2UuSW5zdGFuY2UuaW5pdCgpO1xyXG5HX1NoYWRlckZhY3RvcnkuaW5pdChEZXZpY2UuSW5zdGFuY2UuZ2wpO1xyXG5cclxuLy90ZXN0V2VibF9MYWJlbC5ydW4oKTtcclxuXHJcbi8vTGlnaHRUZXN0LnJ1bigpO1xyXG5cclxuLy8gc2t5Qm94VGVzdC5ydW4oKTtcclxuXHJcbi8vIFNraW5UZXMxLnJ1bigpO1xyXG5cclxuIHZhciBhcnIgPSBbXHJcbiAgICBcInJlcy9tb2RlbHMva2lsbGVyX3doYWxlL3doYWxlLkNZQ0xFUy5iaW5cIixcclxuICAgIFwicmVzL21vZGVscy9raWxsZXJfd2hhbGUvd2hhbGUuQ1lDTEVTLmdsdGZcIixcclxuICAgIFwicmVzL21vZGVscy9IZWFkRGF0YS9oZWFkLmpzb25cIixcclxuICAgIFwicmVzL21vZGVscy9Sb2JhcnQvYmxvY2tHdXlOb2RlRGVzY3JpcHRpb25zLmpzb25cIixcclxuICAgIFwicmVzLzh4OC1mb250LnBuZ1wiLFxyXG4gICAgXCJyZXMvd29vZC5qcGdcIixcclxuICAgIFwicmVzL3RyZWUuanBnXCIsXHJcbiAgICBcInJlcy9ncm91bmQuanBnXCIsXHJcbiAgICBcInJlcy93aWNrZXIuanBnXCJcclxuIF1cclxuXHJcbi8vIFRocmVlRFRleHR1cmUucnVuKCk7XHJcbi8vIExhYmVsVGVzdC5ydW4oKTtcclxuLy8gU2hhZGVyU2hhZG93VGVzdC5ydW4oKTtcclxuXHJcbi8vIFN0YWdlLnJ1bigpO1xyXG5cclxuLy8gRWFydGhTdW5UZXN0LnJ1bigpO1xyXG5cclxuLy8gUm9iYXJ0VGVzdC5ydW4oKTtcclxuLy8gQ2FwdHVyZVRlc3QucnVuKCk7XHJcblxyXG4vLyBDYW1lcmFUZXN0LnJ1bigpO1xyXG5cclxuLy8gVGV4dHVyZVRlc3QucnVuKCk7XHJcblxyXG4vLyBTcGVlZFRlc3QucnVuKCk7XHJcbi8vICBIYWlUd24xLnJ1bigpO1xyXG5cclxuLy8gVGhyZWVETGlnaHRUZXN0LnJ1bigpO1xyXG4vLyBTcG90TGlnaHRUZXN0LnJ1bigpO1xyXG4vLyBQb2ludExpZ2h0VGVzdC5ydW4oKTtcclxuXHJcbi8vIEZvZ1Rlc3QucnVuKCk7XHJcblxyXG52YXIgbXlIZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxudmFyIG15SW5pdDphbnkgPSB7IG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgIGhlYWRlcnM6IG15SGVhZGVycyxcclxuICAgICAgICAgICAgICAgbW9kZTogJ2NvcnMnLFxyXG4gICAgICAgICAgICAgICBjYWNoZTogJ2RlZmF1bHQnIH07XHJcbnZhciBteVJlcXVlc3QgPSBuZXcgUmVxdWVzdCgnaHR0cDpsb2NhbGhvc3Q6MzAwMC8vcmVzL21vZGVscy93aW5kbWlsbC93aW5kbWlsbC5vYmonLCBteUluaXQpO1xyXG5cclxuZmV0Y2gobXlSZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xyXG4gIH0pLnRoZW4oZnVuY3Rpb24obXlCbG9iKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIm15QmxvYi0tLS0tLS1cIixteUJsb2IpO1xyXG4gIH0pO1xyXG5cclxuXHJcbkxvYWRlck1hbmFnZXIuaW5zdGFuY2UubG9hZERhdGEoYXJyLG51bGwsZnVuY3Rpb24oKXtcclxuICAgIC8vIG5ldyBSZW5kZXJGbG93KCkuc3RhcnR1cCgpO1xyXG4gICAgLy8gUmFtcFRleHR1cmVUZXN0LnJ1bigpO1xyXG4gICAgLy8gQ2FtZXJhVGVzdC5ydW4oKTtcclxuICAgIC8vIFJvYmFydFRlc3QucnVuKCk7XHJcbiAgICAvLyBPYmpUZXN0LnJ1bigpO1xyXG4gICAgXHJcbn0pXHJcbiIsIi8vdGV4dHVyZSDlj5blgLxcblxuXG4vLyB0ZXh0dXJlIGZpbHRlclxuZXhwb3J0IGNvbnN0IGdsdGV4X2ZpbHRlciA9IHtcblxuICAgIE5FQVJFU1Q6IDk3MjgsICAgICAgICAgICAgICAgIC8vIGdsLk5FQVJFU1RcbiAgICBMSU5FQVI6IDk3MjksICAgICAgICAgICAgICAgICAvLyBnbC5MSU5FQVJcbiAgICAvL+S4i+mdouaYr+mSiOWvuee8qeWwj+eahOaYr+mHh+eUqG1pcG1hcOaKgOacr1xuICAgIE5FQVJFU1RfTUlQTUFQX05FQVJFU1Q6IDk5ODQsIC8vIGdsLk5FQVJFU1RfTUlQTUFQX05FQVJFU1RcbiAgICBMSU5FQVJfTUlQTUFQX05FQVJFU1Q6IDk5ODUsICAvLyBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1RcbiAgICBORUFSRVNUX01JUE1BUF9MSU5FQVI6IDk5ODYsICAvLyBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVJcbiAgICBMSU5FQVJfTUlQTUFQX0xJTkVBUjogOTk4NywgICAvLyBnbC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxufVxuXG5cbmV4cG9ydCBjb25zdCBlbnVtIGdsVHlwZXtcbiAgICAvLyBjb25zdCBHTF9CWVRFID0gNTEyMDsgICAgICAgICAgICAgICAgICAvLyBnbC5CWVRFXG4gICAgVU5TSUdORURfQllURSA9IDUxMjEsICAgICAgICAgICAgLy8gZ2wuVU5TSUdORURfQllURVxuICAgIC8vIGNvbnN0IEdMX1NIT1JUOjUxMjIsICAgICAgICAgICAgICAgICAvLyBnbC5TSE9SVFxuICAgIFVOU0lHTkVEX1NIT1JUID0gNTEyMywgICAgICAgICAgIC8vIGdsLlVOU0lHTkVEX1NIT1JUXG4gICAgVU5TSUdORURfSU5UID0gNTEyNSwgICAgICAgICAgICAgLy8gZ2wuVU5TSUdORURfSU5UXG4gICAgRkxPQVQgPSA1MTI2LCAgICAgICAgICAgICAgICAgICAgLy8gZ2wuRkxPQVRcbiAgICBVTlNJR05FRF9TSE9SVF81XzZfNSA9IDMzNjM1LCAgICAvLyBnbC5VTlNJR05FRF9TSE9SVF81XzZfNVxuICAgIFVOU0lHTkVEX1NIT1JUXzRfNF80XzQgPSAzMjgxOSwgIC8vIGdsLlVOU0lHTkVEX1NIT1JUXzRfNF80XzRcbiAgICBVTlNJR05FRF9TSE9SVF81XzVfNV8xID0gMzI4MjAsICAvLyBnbC5VTlNJR05FRF9TSE9SVF81XzVfNV8xXG4gICAgSEFMRl9GTE9BVF9PRVMgPSAzNjE5MywgICAgICAgICAgLy8gZ2wuSEFMRl9GTE9BVF9PRVNcbn1cblxuLy90ZXh0dXJlIG5vcm1hbCBmb3JtYXRcbmNvbnN0IGVudW0gZ2x0ZXhfbmZtdHtcbiAgICBERVBUSF9DT01QT05FTlQgPSA2NDAyLCAvLyBnbC5ERVBUSF9DT01QT05FTlRcbiAgICBBTFBIQSA9IDY0MDYsICAgICAgICAgICAgLy8gZ2wuQUxQSEFcbiAgICBSR0IgPSA2NDA3LCAgICAgICAgICAgICAgLy8gZ2wuUkdCXG4gICAgUkdCQSA9IDY0MDgsICAgICAgICAgICAgIC8vIGdsLlJHQkFcbiAgICBMVU1JTkFOQ0UgPSA2NDA5LCAgICAgICAgLy8gZ2wuTFVNSU5BTkNFXG4gICAgTFVNSU5BTkNFX0FMUEhBID0gNjQxMCwgIC8vIGdsLkxVTUlOQU5DRV9BTFBIQVxufVxuLy90ZXh0dXJlIGNvbXByZXNzZWQgZm9ybWF0XG5jb25zdCBlbnVtIGdsdGV4X2NmbXR7XG4gICAgUkdCX1MzVENfRFhUMV9FWFQgPSAweDgzRjAsICAgLy8gZXh0LkNPTVBSRVNTRURfUkdCX1MzVENfRFhUMV9FWFRcbiAgICBSR0JBX1MzVENfRFhUMV9FWFQgPSAweDgzRjEsICAvLyBleHQuQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUMV9FWFRcbiAgICBSR0JBX1MzVENfRFhUM19FWFQgPSAweDgzRjIsICAvLyBleHQuQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUM19FWFRcbiAgICBSR0JBX1MzVENfRFhUNV9FWFQgPSAweDgzRjMsICAvLyBleHQuQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUNV9FWFRcblxuICAgIFJHQl9QVlJUQ180QlBQVjFfSU1HID0gMHg4QzAwLCAgLy8gZXh0LkNPTVBSRVNTRURfUkdCX1BWUlRDXzRCUFBWMV9JTUdcbiAgICBSR0JfUFZSVENfMkJQUFYxX0lNRyA9IDB4OEMwMSwgIC8vIGV4dC5DT01QUkVTU0VEX1JHQl9QVlJUQ18yQlBQVjFfSU1HXG4gICAgUkdCQV9QVlJUQ180QlBQVjFfSU1HID0gMHg4QzAyLCAvLyBleHQuQ09NUFJFU1NFRF9SR0JBX1BWUlRDXzRCUFBWMV9JTUdcbiAgICBSR0JBX1BWUlRDXzJCUFBWMV9JTUcgPSAweDhDMDMsIC8vIGV4dC5DT01QUkVTU0VEX1JHQkFfUFZSVENfMkJQUFYxX0lNR1xuXG4gICAgUkdCX0VUQzFfV0VCR0wgPSAweDhENjQsIC8vIGV4dC5DT01QUkVTU0VEX1JHQl9FVEMxX1dFQkdMXG5cbiAgICBSR0I4X0VUQzIgPSAweDkyNzQsICAgICAgIC8vIGV4dC5DT01QUkVTU0VEX1JHQjhfRVRDMlxuICAgIFJHQkE4X0VUQzJfRUFDID0gMHg5Mjc4LCAgLy8gZXh0LkNPTVBSRVNTRURfUkdCQThfRVRDMl9FQUNcbn1cblxuY29uc3QgX2ZpbHRlckdMID0gW1xuICAgIFtnbHRleF9maWx0ZXIuTkVBUkVTVCwgZ2x0ZXhfZmlsdGVyLk5FQVJFU1RfTUlQTUFQX05FQVJFU1QsIGdsdGV4X2ZpbHRlci5ORUFSRVNUX01JUE1BUF9MSU5FQVJdLFxuICAgIFtnbHRleF9maWx0ZXIuTElORUFSLCBnbHRleF9maWx0ZXIuTElORUFSX01JUE1BUF9ORUFSRVNULCBnbHRleF9maWx0ZXIuTElORUFSX01JUE1BUF9MSU5FQVJdLFxuXTtcblxuXG5jb25zdCBfdGV4dHVyZUZtdEdMID0gW1xuICAgIC8vIFJHQl9EWFQxOiAwXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JfUzNUQ19EWFQxX0VYVCwgcGl4ZWxUeXBlOiBudWxsIH0sXG5cbiAgICAvLyBSR0JBX0RYVDE6IDFcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0JBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JBX1MzVENfRFhUMV9FWFQsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG4gICAgLy8gUkdCQV9EWFQzOiAyXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCQV9TM1RDX0RYVDNfRVhULCBwaXhlbFR5cGU6IG51bGwgfSxcblxuICAgIC8vIFJHQkFfRFhUNTogM1xuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9jZm10LlJHQkFfUzNUQ19EWFQ1X0VYVCwgcGl4ZWxUeXBlOiBudWxsIH0sXG5cbiAgICAvLyBSR0JfRVRDMTogNFxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQiwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCX0VUQzFfV0VCR0wsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG4gICAgLy8gUkdCX1BWUlRDXzJCUFBWMTogNVxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQiwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCX1BWUlRDXzJCUFBWMV9JTUcsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG4gICAgLy8gUkdCQV9QVlJUQ18yQlBQVjE6IDZcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0JBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JBX1BWUlRDXzJCUFBWMV9JTUcsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG4gICAgLy8gUkdCX1BWUlRDXzRCUFBWMTogN1xuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQiwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCX1BWUlRDXzRCUFBWMV9JTUcsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG4gICAgLy8gUkdCQV9QVlJUQ180QlBQVjE6IDhcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0JBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JBX1BWUlRDXzRCUFBWMV9JTUcsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG5cbiAgICAvLyBBODogOVxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkFMUEhBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfbmZtdC5BTFBIQSwgcGl4ZWxUeXBlOiBnbFR5cGUuVU5TSUdORURfQllURSB9LFxuXG4gICAgLy8gTDg6IDEwXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuTFVNSU5BTkNFLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfbmZtdC5MVU1JTkFOQ0UsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX0JZVEUgfSxcblxuICAgIC8vIEw4X0E4OiAxMVxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkxVTUlOQU5DRV9BTFBIQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBLCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9CWVRFIH0sXG5cbiAgICAvLyBSNV9HNl9CNTogMTJcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQiwgcGl4ZWxUeXBlOiBnbFR5cGUuVU5TSUdORURfU0hPUlRfNV82XzUgfSxcblxuICAgIC8vIFI1X0c1X0I1X0ExOiAxM1xuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzVfNV81XzEgfSxcblxuICAgIC8vIFI0X0c0X0I0X0E0OiAxNFxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzRfNF80XzQgfSxcblxuICAgIC8vIFJHQjg6IDE1XG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX0JZVEUgfSxcblxuICAgIC8vIFJHQkE4OiAxNlxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQkEsIHBpeGVsVHlwZTogZ2xUeXBlLlVOU0lHTkVEX0JZVEUgfSxcblxuICAgIC8vIFJHQjE2RjogMTdcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQiwgcGl4ZWxUeXBlOiBnbFR5cGUuSEFMRl9GTE9BVF9PRVMgfSxcblxuICAgIC8vIFJHQkExNkY6IDE4XG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgcGl4ZWxUeXBlOiBnbFR5cGUuSEFMRl9GTE9BVF9PRVMgfSxcblxuICAgIC8vIFJHQjMyRjogMTlcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0IsIGludGVybmFsRm9ybWF0OiBnbHRleF9uZm10LlJHQiwgcGl4ZWxUeXBlOiBnbFR5cGUuRkxPQVQgfSxcblxuICAgIC8vIFJHQkEzMkY6IDIwXG4gICAgeyBmb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuUkdCQSwgcGl4ZWxUeXBlOiBnbFR5cGUuRkxPQVQgfSxcblxuICAgIC8vIFIzMkY6IDIxXG4gICAgeyBmb3JtYXQ6IG51bGwsIGludGVybmFsRm9ybWF0OiBudWxsLCBwaXhlbFR5cGU6IG51bGwgfSxcblxuICAgIC8vIF8xMTExMTBGOiAyMlxuICAgIHsgZm9ybWF0OiBudWxsLCBpbnRlcm5hbEZvcm1hdDogbnVsbCwgcGl4ZWxUeXBlOiBudWxsIH0sXG5cbiAgICAvLyBTUkdCOiAyM1xuICAgIHsgZm9ybWF0OiBudWxsLCBpbnRlcm5hbEZvcm1hdDogbnVsbCwgcGl4ZWxUeXBlOiBudWxsIH0sXG5cbiAgICAvLyBTUkdCQTogMjRcbiAgICB7IGZvcm1hdDogbnVsbCwgaW50ZXJuYWxGb3JtYXQ6IG51bGwsIHBpeGVsVHlwZTogbnVsbCB9LFxuXG4gICAgLy8gRDE2OiAyNVxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkRFUFRIX0NPTVBPTkVOVCwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuREVQVEhfQ09NUE9ORU5ULCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9TSE9SVCB9LFxuXG4gICAgLy8gRDMyOiAyNlxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkRFUFRIX0NPTVBPTkVOVCwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuREVQVEhfQ09NUE9ORU5ULCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9JTlQgfSxcblxuICAgIC8vIEQyNFM4OiAyN1xuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LkRFUFRIX0NPTVBPTkVOVCwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X25mbXQuREVQVEhfQ09NUE9ORU5ULCBwaXhlbFR5cGU6IGdsVHlwZS5VTlNJR05FRF9JTlQgfSxcblxuICAgIC8vIFJHQl9FVEMyOiAyOFxuICAgIHsgZm9ybWF0OiBnbHRleF9uZm10LlJHQiwgaW50ZXJuYWxGb3JtYXQ6IGdsdGV4X2NmbXQuUkdCOF9FVEMyLCBwaXhlbFR5cGU6IG51bGwgfSxcblxuICAgIC8vIFJHQkFfRVRDMjogMjlcbiAgICB7IGZvcm1hdDogZ2x0ZXhfbmZtdC5SR0JBLCBpbnRlcm5hbEZvcm1hdDogZ2x0ZXhfY2ZtdC5SR0JBOF9FVEMyX0VBQywgcGl4ZWxUeXBlOiBudWxsIH0sXG5dO1xuXG4vKipcbiAqIHdlYmds5pyJ5pWI55qE57q555CG5Y2V5YWDXG4gKiDnu4/ov4fmtYvor5XmnIDlpKfnmoTnurnnkIbljZXlhYPmlbDnm67mmK8zMuS4qlxuICovXG5leHBvcnQgY29uc3QgZ2xURVhUVVJFX1VOSVRfVkFMSUQgPSBbXG4gICAgXCJURVhUVVJFMFwiLCBcIlRFWFRVUkUxXCIsIFwiVEVYVFVSRTJcIiwgXCJURVhUVVJFM1wiLCBcIlRFWFRVUkU0XCIsIFwiVEVYVFVSRTVcIiwgXCJURVhUVVJFNlwiLCBcIlRFWFRVUkU3XCIsXG4gICAgXCJURVhUVVJFOFwiLCBcIlRFWFRVUkU5XCIsIFwiVEVYVFVSRTEwXCIsIFwiVEVYVFVSRTExXCIsIFwiVEVYVFVSRTEyXCIsIFwiVEVYVFVSRTEzXCIsIFwiVEVYVFVSRTE0XCIsIFwiVEVYVFVSRTE1XCIsXG4gICAgXCJURVhUVVJFMTZcIiwgXCJURVhUVVJFMTdcIiwgXCJURVhUVVJFMThcIiwgXCJURVhUVVJFMTlcIiwgXCJURVhUVVJFMjBcIiwgXCJURVhUVVJFMjFcIiwgXCJURVhUVVJFMjJcIiwgXCJURVhUVVJFMjNcIixcbiAgICBcIlRFWFRVUkUyNFwiLCBcIlRFWFRVUkUyNVwiLCBcIlRFWFRVUkUyNlwiLCBcIlRFWFRVUkUyN1wiLCBcIlRFWFRVUkUyOFwiLCBcIlRFWFRVUkUyOVwiLCBcIlRFWFRVUkUzMFwiLCBcIlRFWFRVUkUzMVwiLFxuXVxuXG4vLyB2ZXJ0ZXggYXR0cmlidXRlIHNlbWFudGljXG5leHBvcnQgY29uc3QgZW51bSBnbHZlcnRfYXR0cl9zZW1hbnRpY3tcbiAgICBQT1NJVElPTiA9ICdhX3Bvc2l0aW9uJyxcbiAgICBOT1JNQUwgPSAnYV9ub3JtYWwnLFxuICAgIFRBTkdFTlQgPSAnYV90YW5nZW50JyxcbiAgICBCSVRBTkdFTlQgPSAnYV9iaXRhbmdlbnQnLFxuICAgIFdFSUdIVFMgPSAnYV93ZWlnaHRzJyxcbiAgICBKT0lOVFMgPSAnYV9qb2ludHMnLFxuICAgIENPTE9SID0gJ3VfY29sb3InLFxuICAgIENPTE9SX0RJUiA9ICd1X2NvbG9yX2RpcicsXG4gICAgQ09MT1IwID0gJ3VfY29sb3IwJyxcbiAgICBDT0xPUjBfRElSID0gJ3VfY29sb3IwX2RpcicsXG4gICAgQ09MT1IxID0gJ3VfY29sb3IxJyxcbiAgICBDT0xPUjFfRElSID0gJ3VfY29sb3IxX2RpcicsXG4gICAgVVYgPSAnYV91dicsXG4gICAgVVYwID0gJ2FfdXYwJyxcbiAgICBVVjEgPSAnYV91djEnLFxuICAgIFVWMiA9ICdhX3V2MicsXG4gICAgVVYzID0gJ2FfdXYzJyxcbiAgICBVVjQgPSAnYV91djQnLFxuICAgIFVWNSA9ICdhX3V2NScsXG4gICAgVVY2ID0gJ2FfdXY2JyxcbiAgICBVVjcgPSAnYV91djcnLFxuICAgIFRFWF9DT09SRCA9ICd1X3RleENvb3JkJyxcbiAgICBURVhfQ09PUkQxID0gJ3VfdGV4Q29vcmQxJyxcbiAgICBURVhfQ09PUkQyID0gJ3VfdGV4Q29vcmQyJyxcbiAgICBURVhfQ09PUkQzID0gJ3VfdGV4Q29vcmQzJyxcbiAgICBURVhfQ09PUkQ0ID0gJ3VfdGV4Q29vcmQ0JyxcbiAgICBURVhfQ09PUkQ1ID0gJ3VfdGV4Q29vcmQ1JyxcbiAgICBURVhfQ09PUkQ2ID0gJ3VfdGV4Q29vcmQ2JyxcbiAgICBURVhfQ09PUkQ3ID0gJ3VfdGV4Q29vcmQ3JyxcbiAgICBURVhfQ09PUkQ4ID0gJ3VfdGV4Q29vcmQ4JyxcbiAgICBTS1lCT1ggPSBcInVfc2t5Ym94XCIsXG4gICAgTVZNYXRyaXggPSAndV9NVk1hdHJpeCcsXG4gICAgTU1hdHJpeCA9ICd1X01NYXRyaXgnLFxuICAgIFZNYXRyaXggPSAndV9WTWF0cml4JyxcbiAgICBQTWF0cml4ID0gJ3VfUE1hdHJpeCcsXG4gICAgUE1WX01BVFJJWCA9IFwidV9QVk1fTWF0cml4XCIsXG4gICAgUE1WX01BVFJJWF9JTlZFUlNFID0gXCJ1X1BWTV9NYXRyaXhfSW52ZXJzZVwiXG5cbn1cblxuXG5cbi8vIHRleHR1cmUgd3JhcCBtb2RlXG5leHBvcnQgY29uc3QgZW51bSBnbHRleF93cmFwe1xuICAgIFJFUEVBVCA9IDEwNDk3LCAvLyBnbC5SRVBFQVQgICAgICAgICAgIOW5s+mTuuW8j+eahOmHjeWkjee6ueeQhlxuICAgIENMQU1QID0gMzMwNzEsICAvLyBnbC5DTEFNUF9UT19FREdFICAgIOS9v+eUqOe6ueeQhuWbvuWDj+i+uee8mOWAvFxuICAgIE1JUlJPUiA9IDMzNjQ4LCAvLyBnbC5NSVJST1JFRF9SRVBFQVQgIOmVnOWDj+WvueensOeahOmHjeWkjee6ueeQhlxufVxuLy8gdGV4dHVyZSBmb3JtYXRcbi8v5aSW6YOo5L2/55SoXG5leHBvcnQgY29uc3QgZW51bSBnbHRleF9mb3JtYXQge1xuXG4gICAgLy8gY29tcHJlc3MgZm9ybWF0c1xuICAgIFJHQl9EWFQxID0gMCwgLy8wXG4gICAgUkdCQV9EWFQxLCAgLy8xLFxuICAgIFJHQkFfRFhUMywgIC8vMixcbiAgICBSR0JBX0RYVDUsICAvLzMsXG4gICAgUkdCX0VUQzEsICAvLzQsXG4gICAgUkdCX1BWUlRDXzJCUFBWMSwgIC8vNSxcbiAgICBSR0JBX1BWUlRDXzJCUFBWMSwgIC8vNixcbiAgICBSR0JfUFZSVENfNEJQUFYxLCAgLy83LFxuICAgIFJHQkFfUFZSVENfNEJQUFYxLCAgLy84LFxuXG4gICAgLy8gbm9ybWFsIGZvcm1hdHNcbiAgICBBOCwgIC8vOSxcbiAgICBMOCwgIC8vMTAsXG4gICAgTDhfQTgsICAvLzExLFxuICAgIFI1X0c2X0I1LCAgLy8xMixcbiAgICBSNV9HNV9CNV9BMSwgIC8vMTMsXG4gICAgUjRfRzRfQjRfQTQsICAvLzE0LFxuICAgIFJHQjgsICAvLzE1LCAg5bi455SoanBnXG4gICAgUkdCQTgsICAvLzE2LOW4uOeUqHBuZ1xuICAgIFJHQjE2RiwgIC8vMTcsXG4gICAgUkdCQTE2RiwgIC8vMTgsXG4gICAgUkdCMzJGLCAgLy8xOSxcbiAgICBSR0JBMzJGLCAgLy8yMCxcbiAgICBSMzJGLCAgLy8yMSxcbiAgICBfMTExMTEwRiwgIC8vMjIsXG4gICAgU1JHQiwgIC8vMjMsXG4gICAgU1JHQkEsICAvLzI0LFxuXG4gICAgLy8gZGVwdGggZm9ybWF0c1xuICAgIEQxNiwgIC8vMjUsXG4gICAgRDMyLCAgLy8yNixcbiAgICBEMjRTOCwgIC8vMjcsXG5cbiAgICAvLyBldGMyIGZvcm1hdFxuICAgIFJHQl9FVEMyLCAgLy8yOCxcbiAgICBSR0JBX0VUQzIsICAvLzI5LFxuXG59XG5cbi8vIHJlbmRlci1idWZmZXIgZm9ybWF0XG5leHBvcnQgY29uc3QgZ2xyZW5kZXJfYnVmZmVyX2Zvcm1hdCA9IHtcbiAgICBSR0JBNDogMzI4NTQsICAgIC8vIGdsLlJHQkE0XG4gICAgUkdCNV9BMTogMzI4NTUsICAvLyBnbC5SR0I1X0ExXG4gICAgUkdCNTY1OiAzNjE5NCwgICAvLyBnbC5SR0I1NjVcbiAgICBEMTY6IDMzMTg5LCAgICAgIC8vIGdsLkRFUFRIX0NPTVBPTkVOVDE2XG4gICAgUzg6IDM2MTY4LCAgICAgICAvLyBnbC5TVEVOQ0lMX0lOREVYOFxuICAgIEQyNFM4OiAzNDA0MSwgICAgLy8gZ2wuREVQVEhfU1RFTkNJTFxufVxuXG4vLyBwcmltaXRpdmUgdHlwZVxuZXhwb3J0IGNvbnN0IGVudW0gZ2xwcmltaXRpdmVfdHlwZSB7XG5cbiAgICBQT0lOVFMgPSAwLCAgICAgICAgIC8vIGdsLlBPSU5UUyAg6KaB57uY5Yi25LiA57O75YiX55qE54K5XG4gICAgTElORVMgPSAxLCAgICAgICAgICAvLyBnbC5MSU5FUyAgIOimgee7mOWItuS6huS4gOezu+WIl+acqui/nuaOpeebtOe6v+autSjljZXni6zooYwpXG4gICAgTElORV9MT09QID0gMiwgICAgICAvLyBnbC5MSU5FX0xPT1AgIOimgee7mOWItuS4gOezu+WIl+i/nuaOpeeahOe6v+autVxuICAgIExJTkVfU1RSSVAgPSAzLCAgICAgLy8gZ2wuTElORV9TVFJJUCAg6KaB57uY5Yi25LiA57O75YiX6L+e5o6l55qE57q/5q6144CC5a6D6L+Y6L+e5o6l55qE56ys5LiA5ZKM5pyA5ZCO55qE6aG254K577yM5Lul5b2i5oiQ5LiA5Liq546vXG4gICAgVFJJQU5HTEVTID0gNCwgICAgICAvLyBnbC5UUklBTkdMRVMgIOS4gOezu+WIl+WNleeLrOeahOS4ieinkuW9ou+8m+e7mOWItuaWueW8j++8mu+8iHYwLHYxLHYy77yJLCh2MSx2Myx2NClcbiAgICBUUklBTkdMRV9TVFJJUCA9IDUsIC8vIGdsLlRSSUFOR0xFX1NUUklQICDkuIDns7vliJfluKbnirbnmoTkuInop5LlvaJcbiAgICBUUklBTkdMRV9GQU4gPSA2LCAgIC8vIGdsLlRSSUFOR0xFX0ZBTiAg5omH5b2i57uY5Yi25pa55byPXG59XG5cbi8vIGN1bGxcbmV4cG9ydCBjb25zdCBnbGN1bGwgPSB7XG5cbiAgICBOT05FOiAwLFxuICAgIEZST05UOiAxMDI4LFxuICAgIEJBQ0s6IDEwMjksXG4gICAgRlJPTlRfQU5EX0JBQ0s6IDEwMzIsXG59XG5cbi8vIHN0ZW5jaWwgb3BlcmF0aW9uXG5leHBvcnQgY29uc3QgZ2xzdGVuY2lsX29wZXJhdGlvbiA9IHtcblxuICAgIERJU0FCTEU6IDAsICAgICAgICAgICAgIC8vIGRpc2FibGUgc3RlbmNpbFxuICAgIEVOQUJMRTogMSwgICAgICAgICAgICAgIC8vIGVuYWJsZSBzdGVuY2lsXG4gICAgSU5IRVJJVDogMiwgICAgICAgICAgICAgLy8gaW5oZXJpdCBzdGVuY2lsIHN0YXRlc1xuXG4gICAgT1BfS0VFUDogNzY4MCwgICAgICAgICAgLy8gZ2wuS0VFUFxuICAgIE9QX1pFUk86IDAsICAgICAgICAgICAgIC8vIGdsLlpFUk9cbiAgICBPUF9SRVBMQUNFOiA3NjgxLCAgICAgICAvLyBnbC5SRVBMQUNFXG4gICAgT1BfSU5DUjogNzY4MiwgICAgICAgICAgLy8gZ2wuSU5DUlxuICAgIE9QX0lOQ1JfV1JBUDogMzQwNTUsICAgIC8vIGdsLklOQ1JfV1JBUFxuICAgIE9QX0RFQ1I6IDc2ODMsICAgICAgICAgIC8vIGdsLkRFQ1JcbiAgICBPUF9ERUNSX1dSQVA6IDM0MDU2LCAgICAvLyBnbC5ERUNSX1dSQVBcbiAgICBPUF9JTlZFUlQ6IDUzODYsICAgICAgICAvLyBnbC5JTlZFUlRcbn1cblxuLy8gZGVwdGggYW5kIHN0ZW5jaWwgZnVuY3Rpb25cbi8vIOeugOWGmVwiZHNcIlxuZXhwb3J0IGNvbnN0IGdsZGVwdGhfc3RlbmNpbF9mdW5jID0ge1xuXG4gICAgTkVWRVI6IDUxMiwgICAgLy8gZ2wuTkVWRVJcbiAgICBMRVNTOiA1MTMsICAgICAvLyBnbC5MRVNTXG4gICAgRVFVQUw6IDUxNCwgICAgLy8gZ2wuRVFVQUxcbiAgICBMRVFVQUw6IDUxNSwgICAvLyBnbC5MRVFVQUxcbiAgICBHUkVBVEVSOiA1MTYsICAvLyBnbC5HUkVBVEVSXG4gICAgTk9URVFVQUw6IDUxNywgLy8gZ2wuTk9URVFVQUxcbiAgICBHRVFVQUw6IDUxOCwgICAvLyBnbC5HRVFVQUxcbiAgICBBTFdBWVM6IDUxOSwgICAvLyBnbC5BTFdBWVNcbn1cblxuIC8vIGluZGV4IGJ1ZmZlciBmb3JtYXRcbmV4cG9ydCBjb25zdCBnbGluZGV4X2J1ZmZlcl9mb3JtYXQgPSB7XG4gICBcbiAgSU5ERVhfRk1UX1VJTlQ4OiA1MTIxLCAgLy8gZ2wuVU5TSUdORURfQllURVxuICBJTkRFWF9GTVRfVUlOVDE2OiA1MTIzLCAvLyBnbC5VTlNJR05FRF9TSE9SVFxuICBJTkRFWF9GTVRfVUlOVDMyOiA1MTI1LCAvLyBnbC5VTlNJR05FRF9JTlQgKE9FU19lbGVtZW50X2luZGV4X3VpbnQpXG59XG5cbiAvLyBidWZmZXIgdXNhZ2VcbmV4cG9ydCBjb25zdCBnbGJ1ZmZlcl91c2FnZT0ge1xuICBVU0FHRV9TVEFUSUM6IDM1MDQ0LCAgLy8gZ2wuU1RBVElDX0RSQVdcbiAgVVNBR0VfRFlOQU1JQzogMzUwNDgsIC8vIGdsLkRZTkFNSUNfRFJBV1xuICBVU0FHRV9TVFJFQU06IDM1MDQwLCAgLy8gZ2wuU1RSRUFNX0RSQVdcbn1cblxuLy8gYmxlbmQtZnVuY1xuZXhwb3J0IGNvbnN0IGdsYmxlbmRfZnVuYyA9IHtcbiAgICBBREQ6IDMyNzc0LCAgICAgICAgICAgICAgLy8gZ2wuRlVOQ19BRERcbiAgICBTVUJUUkFDVDogMzI3NzgsICAgICAgICAgLy8gZ2wuRlVOQ19TVUJUUkFDVFxuICAgIFJFVkVSU0VfU1VCVFJBQ1Q6IDMyNzc5LCAvLyBnbC5GVU5DX1JFVkVSU0VfU1VCVFJBQ1Rcbn1cblxuLy8gYmxlbmRcbmV4cG9ydCBjb25zdCBnbGJsZW5kID0ge1xuICAgIFpFUk86IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnbC5aRVJPXG4gICAgT05FOiAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdsLk9ORVxuICAgIFNSQ19DT0xPUjogNzY4LCAgICAgICAgICAgICAgICAgICAvLyBnbC5TUkNfQ09MT1JcbiAgICBPTkVfTUlOVVNfU1JDX0NPTE9SOiA3NjksICAgICAgICAgLy8gZ2wuT05FX01JTlVTX1NSQ19DT0xPUlxuICAgIERTVF9DT0xPUjogNzc0LCAgICAgICAgICAgICAgICAgICAvLyBnbC5EU1RfQ09MT1JcbiAgICBPTkVfTUlOVVNfRFNUX0NPTE9SOiA3NzUsICAgICAgICAgLy8gZ2wuT05FX01JTlVTX0RTVF9DT0xPUlxuICAgIFNSQ19BTFBIQTogNzcwLCAgICAgICAgICAgICAgICAgICAvLyBnbC5TUkNfQUxQSEFcbiAgICBPTkVfTUlOVVNfU1JDX0FMUEhBOiA3NzEsICAgICAgICAgLy8gZ2wuT05FX01JTlVTX1NSQ19BTFBIQVxuICAgIERTVF9BTFBIQTogNzcyLCAgICAgICAgICAgICAgICAgICAvLyBnbC5EU1RfQUxQSEFcbiAgICBPTkVfTUlOVVNfRFNUX0FMUEhBOiA3NzMsICAgICAgICAgLy8gZ2wuT05FX01JTlVTX0RTVF9BTFBIQVxuICAgIENPTlNUQU5UX0NPTE9SOiAzMjc2OSwgICAgICAgICAgICAvLyBnbC5DT05TVEFOVF9DT0xPUlxuICAgIE9ORV9NSU5VU19DT05TVEFOVF9DT0xPUjogMzI3NzAsICAvLyBnbC5PTkVfTUlOVVNfQ09OU1RBTlRfQ09MT1JcbiAgICBDT05TVEFOVF9BTFBIQTogMzI3NzEsICAgICAgICAgICAgLy8gZ2wuQ09OU1RBTlRfQUxQSEFcbiAgICBPTkVfTUlOVVNfQ09OU1RBTlRfQUxQSEE6IDMyNzcyLCAgLy8gZ2wuT05FX01JTlVTX0NPTlNUQU5UX0FMUEhBXG4gICAgU1JDX0FMUEhBX1NBVFVSQVRFOiA3NzYsICAgICAgICAgIC8vIGdsLlNSQ19BTFBIQV9TQVRVUkFURVxufVxuXG4vKipcbiAqIEBtZXRob2QgZ2xGaWx0ZXJcbiAqIEBwYXJhbSB7V2ViR0xDb250ZXh0fSBnbFxuICogQHBhcmFtIHtGSUxURVJfKn0gZmlsdGVyXG4gKiBAcGFyYW0ge0ZJTFRFUl8qfSBtaXBGaWx0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdsRmlsdGVyKGdsLCBmaWx0ZXIsIG1pcEZpbHRlciA9IC0xKSB7XG4gICAgbGV0IHJlc3VsdCA9IF9maWx0ZXJHTFtmaWx0ZXJdW21pcEZpbHRlciArIDFdO1xuICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFVua25vd24gRklMVEVSOiAke2ZpbHRlcn1gKTtcbiAgICAgICAgcmV0dXJuIG1pcEZpbHRlciA9PT0gLTEgPyBnbHRleF9maWx0ZXIuTElORUFSIDogZ2x0ZXhfZmlsdGVyLkxJTkVBUl9NSVBNQVBfTElORUFSO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQG1ldGhvZCBnbFRleHR1cmVGbXRcbiAqIEBwYXJhbSB7Z2x0ZXhfZm9ybWF0fSBmbXRcbiAqIEByZXR1cm4ge2Zvcm1hdCxpbnRlcm5hbEZvcm1hdCxwaXhlbFR5cGV9IHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2xUZXh0dXJlRm10SW5mb3IoZm10OmdsdGV4X2Zvcm1hdCkge1xuICAgIGxldCByZXN1bHQgPSBfdGV4dHVyZUZtdEdMW2ZtdF07XG4gICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBURVhUVVJFX0ZNVDogJHtmbXR9YCk7XG4gICAgICAgIHJldHVybiBfdGV4dHVyZUZtdEdMW2dsdGV4X2Zvcm1hdC5SR0JBOF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbmZvcm1hdCAgICAgICAgICAgICAgICB0eXBlICAgICAgICAgICAg6YCa6YGT5pWwIOmAmumBk+aAu+Wtl+iKguaVsFxuUkdCQSAgICAgICAgIFx0IFVOU0lHTkVEX0JZVEVcdCAgICAgICAgNFx0ICAgIDRcblJHQlx0ICAgICAgICAgICAgIFVOU0lHTkVEX0JZVEVcdCAgICAgICAgM1x0ICAgIDNcblJHQkEgICAgICAgICAgICAgVU5TSUdORURfU0hPUlRfNF80XzRfNFx0NFx0ICAgIDJcblJHQkEgICAgICAgICBcdCBVTlNJR05FRF9TSE9SVF81XzVfNV8xXHQ0XHQgICAgMlxuUkdCXHQgICAgICAgICAgICAgVU5TSUdORURfU0hPUlRfNV82XzUgICAzXHQgICAgMlxuTFVNSU5BTkNFX0FMUEhBXHQgVU5TSUdORURfQllURSAgICAgICBcdDJcdCAgICAyXG5MVU1JTkFOQ0UgICBcdCBVTlNJR05FRF9CWVRFICAgICAgXHQxXHQgICAgMVxuQUxQSEEgICAgICAgXHQgVU5TSUdORURfQllURSAgICAgICBcdDFcdCAgICAxXG4qL1xuY29uc3QgZ2xmb3JtYXRfdHlwZV9ieXRlcyA9IHt9O1xuZ2xmb3JtYXRfdHlwZV9ieXRlc1tnbHRleF9uZm10LlJHQkFdID0ge307XG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuUkdCXSA9IHt9O1xuZ2xmb3JtYXRfdHlwZV9ieXRlc1tnbHRleF9uZm10LkxVTUlOQU5DRV9BTFBIQV0gPSB7fTtcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5MVU1JTkFOQ0VdID0ge307XG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuQUxQSEFdID0ge307XG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuUkdCQV1bZ2xUeXBlLlVOU0lHTkVEX0JZVEVdID0gNDtcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5SR0JdW2dsVHlwZS5VTlNJR05FRF9CWVRFXSA9IDM7XG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuUkdCQV1bZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzRfNF80XzRdID0gMjtcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5SR0JBXVtnbFR5cGUuVU5TSUdORURfU0hPUlRfNV81XzVfMV0gPSAyO1xuZ2xmb3JtYXRfdHlwZV9ieXRlc1tnbHRleF9uZm10LlJHQl1bZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzVfNl81XSA9IDI7XG5nbGZvcm1hdF90eXBlX2J5dGVzW2dsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAyO1xuZ2xmb3JtYXRfdHlwZV9ieXRlc1tnbHRleF9uZm10LkxVTUlOQU5DRV1bZ2xUeXBlLlVOU0lHTkVEX0JZVEVdID0gMTtcbmdsZm9ybWF0X3R5cGVfYnl0ZXNbZ2x0ZXhfbmZtdC5BTFBIQV1bZ2xUeXBlLlVOU0lHTkVEX0JZVEVdID0gMTtcblxuY29uc3QgZ2xmb3JtYXRfdHlwZV9jaGFuZWxzID0ge307XG5nbGZvcm1hdF90eXBlX2NoYW5lbHNbZ2x0ZXhfbmZtdC5SR0JBXSA9IHt9O1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCXSA9IHt9O1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBXSA9IHt9O1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuTFVNSU5BTkNFXSA9IHt9O1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuQUxQSEFdID0ge307XG5nbGZvcm1hdF90eXBlX2NoYW5lbHNbZ2x0ZXhfbmZtdC5SR0JBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSA0O1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAzO1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuUkdCQV1bZ2xUeXBlLlVOU0lHTkVEX1NIT1JUXzRfNF80XzRdID0gNDtcbmdsZm9ybWF0X3R5cGVfY2hhbmVsc1tnbHRleF9uZm10LlJHQkFdW2dsVHlwZS5VTlNJR05FRF9TSE9SVF81XzVfNV8xXSA9IDQ7XG5nbGZvcm1hdF90eXBlX2NoYW5lbHNbZ2x0ZXhfbmZtdC5SR0JdW2dsVHlwZS5VTlNJR05FRF9TSE9SVF81XzZfNV0gPSAzO1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuTFVNSU5BTkNFX0FMUEhBXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAyO1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuTFVNSU5BTkNFXVtnbFR5cGUuVU5TSUdORURfQllURV0gPSAxO1xuZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW2dsdGV4X25mbXQuQUxQSEFdW2dsVHlwZS5VTlNJR05FRF9CWVRFXSA9IDE7XG5cbi8qKlxuICog6I635Y+W57q555CG55qE6YCa6YGT5pWwXG4gKiBAbWV0aG9kIGdsVGV4dHVyZUNoYW5lbFRvdGFsQnl0ZXNcbiAqIEBwYXJhbSB7Z2x0ZXhfZm9ybWF0fSBmbXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdsVGV4dHVyZVRvdGFsQ2hhbmVscyhmbXQpOm51bWJlcntcbiAgICBsZXQgcmVzdWx0ID0gIGdsVGV4dHVyZUZtdEluZm9yKGZtdCk7XG4gICAgbGV0IHJlID0gZ2xmb3JtYXRfdHlwZV9jaGFuZWxzW3Jlc3VsdC5mb3JtYXRdW3Jlc3VsdC5waXhlbFR5cGVdO1xuICAgIGlmKCFyZSlcbiAgICB7XG4gICAgICAgIGNvbnNvbGUud2FybihcImdsVGV4dHVyZVRvdGFsQ2hhbmVscyDmiqXplJksXCIscmVzdWx0KTtcbiAgICAgICAgcmUgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gcmU7XG59XG4vKipcbiAqIOiOt+WPlue6ueeQhueahOmAmumBk+Wtl+iKguaVsFxuICogQG1ldGhvZCBnbFRleHR1cmVDaGFuZWxUb3RhbEJ5dGVzXG4gKiBAcGFyYW0ge2dsdGV4X2Zvcm1hdH0gZm10XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnbFRleHR1cmVDaGFuZWxUb3RhbEJ5dGVzKGZtdCk6bnVtYmVye1xuICAgICBsZXQgcmVzdWx0ID0gIGdsVGV4dHVyZUZtdEluZm9yKGZtdCk7XG4gICAgIGxldCByZSA9IGdsZm9ybWF0X3R5cGVfYnl0ZXNbcmVzdWx0LmZvcm1hdF1bcmVzdWx0LnBpeGVsVHlwZV07XG4gICAgIGlmKCFyZSlcbiAgICAge1xuICAgICAgICAgY29uc29sZS53YXJuKFwiZ2xUZXh0dXJlQ2hhbmVsVG90YWxCeXRlcyDmiqXplJksXCIscmVzdWx0KTtcbiAgICAgICAgIHJlID0gMDtcbiAgICAgfVxuICAgICByZXR1cm4gcmU7XG59XG5cblxuXG4iLCJcblxuZXhwb3J0IGNvbnN0IGdsRXJyb3JzID0ge1xuICAgIFsxXTp7ZXJyb3I6XCJmYWlsZWQgdG8gY29tcGlsZSBzaGFkZXI6IEVSUk9SOiAwOjEgOiBObyBwcmNlaXNpb24gc3BlY2lmaWVkIGZvciAoZmxvYXQpXCIsXG4gICAgcmVhc29uOlwi5rKh5pyJ5Zyo54mH5YWD552A6Imy5Zmo5Lit5oyH5a6aZmxvYXTnmoTnsr7luqZcIn0sXG4gICAgWzJdOntlcnJvcjpcIuexu+Wei+S4jeWMuemFjVwiLHJlYXNvbjpcIue8lueoi+eahOaXtuWAme+8jOWmguaenOa1rueCueaVsOWImuWlveaYrzDjgIEx562J5pW05pWw5YC877yM6KaB5rOo5oSP5Lmm5YaZ5Li6MC4wLDEuMO+8jFxcXG4gICAg5LiN6IO955yB55Wl54K577yM5aaC5p6c55u05o6l5YaZMOOAgTHnrYnlvaLlvI/vvIzns7vnu5/kvJror4bliKvkuLrmlbTlnovmlbDvvIzov5vooYzov5DnrpfnmoTov4fnqIvkuK3vvIzlpoLmnpzmiormlbDmja7nsbvlnovmkJ7plJnlj6/og73kvJrmiqXplJlcIn0sXG4gICAgWzNdOntlcnJvcjpcIldlYkdMOiBJTlZBTElEX09QRVJBVElPTjogdGV4SW1hZ2UyRDogQXJyYXlCdWZmZXJWaWV3IG5vdCBiaWcgZW5vdWdoIGZvciByZXF1ZXN0XCIsXG4gICAgcmVhc29uOlwi5oiR5Lus5Lyg5YWl55qE57q555CG5pWw5o2u5ZKM57q555CG5qC85byP5LiN5Yy56YWN77yM57q555CG5pWw5o2u5pyJ5a696auYLOe6ueeQhuagvOW8j+S8muWGs+Wumuavj+S4gOS4quWDj+e0oOWPluWHoOS4que6ueeQhuaVsOaNrlwifVxuXG59XG4vKipcbiAqIGVudW1zXG4gKi9cbmV4cG9ydCBjb25zdCBnbEVudW1zID0ge1xuICAgIC8vIGJ1ZmZlciB1c2FnZVxuICAgIFVTQUdFX1NUQVRJQzogMzUwNDQsICAvLyBnbC5TVEFUSUNfRFJBV1xuICAgIFVTQUdFX0RZTkFNSUM6IDM1MDQ4LCAvLyBnbC5EWU5BTUlDX0RSQVdcbiAgICBVU0FHRV9TVFJFQU06IDM1MDQwLCAgLy8gZ2wuU1RSRUFNX0RSQVdcbiAgXG4gICAgLy8gaW5kZXggYnVmZmVyIGZvcm1hdFxuICAgIElOREVYX0ZNVF9VSU5UODogNTEyMSwgIC8vIGdsLlVOU0lHTkVEX0JZVEVcbiAgICBJTkRFWF9GTVRfVUlOVDE2OiA1MTIzLCAvLyBnbC5VTlNJR05FRF9TSE9SVFxuICAgIElOREVYX0ZNVF9VSU5UMzI6IDUxMjUsIC8vIGdsLlVOU0lHTkVEX0lOVCAoT0VTX2VsZW1lbnRfaW5kZXhfdWludClcbiAgXG4gICAgLy8gdmVydGV4IGF0dHJpYnV0ZSBzZW1hbnRpY1xuICAgIEFUVFJfUE9TSVRJT046ICdhX3Bvc2l0aW9uJyxcbiAgICBBVFRSX05PUk1BTDogJ2Ffbm9ybWFsJyxcbiAgICBBVFRSX1RBTkdFTlQ6ICdhX3RhbmdlbnQnLFxuICAgIEFUVFJfQklUQU5HRU5UOiAnYV9iaXRhbmdlbnQnLFxuICAgIEFUVFJfV0VJR0hUUzogJ2Ffd2VpZ2h0cycsXG4gICAgQVRUUl9KT0lOVFM6ICdhX2pvaW50cycsXG4gICAgQVRUUl9DT0xPUjogJ2FfY29sb3InLFxuICAgIEFUVFJfQ09MT1IwOiAnYV9jb2xvcjAnLFxuICAgIEFUVFJfQ09MT1IxOiAnYV9jb2xvcjEnLFxuICAgIEFUVFJfVVY6ICdhX3V2JyxcbiAgICBBVFRSX1VWMDogJ2FfdXYwJyxcbiAgICBBVFRSX1VWMTogJ2FfdXYxJyxcbiAgICBBVFRSX1VWMjogJ2FfdXYyJyxcbiAgICBBVFRSX1VWMzogJ2FfdXYzJyxcbiAgICBBVFRSX1VWNDogJ2FfdXY0JyxcbiAgICBBVFRSX1VWNTogJ2FfdXY1JyxcbiAgICBBVFRSX1VWNjogJ2FfdXY2JyxcbiAgICBBVFRSX1VWNzogJ2FfdXY3JyxcbiAgICBBVFRSX1RFWF9DT09SRDogJ2FfdGV4Q29vcmQnLFxuICAgIEFUVFJfVEVYX0NPT1JEMTogJ2FfdGV4Q29vcmQxJyxcbiAgICBBVFRSX1RFWF9DT09SRDI6ICdhX3RleENvb3JkMicsXG4gICAgQVRUUl9URVhfQ09PUkQzOiAnYV90ZXhDb29yZDMnLFxuICAgIEFUVFJfVEVYX0NPT1JENDogJ2FfdGV4Q29vcmQ0JyxcbiAgICBBVFRSX1RFWF9DT09SRDU6ICdhX3RleENvb3JkNScsXG4gICAgQVRUUl9URVhfQ09PUkQ2OiAnYV90ZXhDb29yZDYnLFxuICAgIEFUVFJfVEVYX0NPT1JENzogJ2FfdGV4Q29vcmQ3JyxcbiAgICBBVFRSX1RFWF9DT09SRDg6ICdhX3RleENvb3JkOCcsXG4gIFxuICBcbiAgICAvLyB2ZXJ0ZXggYXR0cmlidXRlIHR5cGVcbiAgICBBVFRSX1RZUEVfSU5UODogNTEyMCwgICAgLy8gZ2wuQllURVxuICAgIEFUVFJfVFlQRV9VSU5UODogNTEyMSwgICAvLyBnbC5VTlNJR05FRF9CWVRFXG4gICAgQVRUUl9UWVBFX0lOVDE2OiA1MTIyLCAgIC8vIGdsLlNIT1JUXG4gICAgQVRUUl9UWVBFX1VJTlQxNjogNTEyMywgIC8vIGdsLlVOU0lHTkVEX1NIT1JUXG4gICAgQVRUUl9UWVBFX0lOVDMyOiA1MTI0LCAgIC8vIGdsLklOVFxuICAgIEFUVFJfVFlQRV9VSU5UMzI6IDUxMjUsICAvLyBnbC5VTlNJR05FRF9JTlRcbiAgICBBVFRSX1RZUEVfRkxPQVQzMjogNTEyNiwgLy8gZ2wuRkxPQVRcbiAgXG4gICAgLy8gdGV4dHVyZSBmaWx0ZXJcbiAgICBGSUxURVJfTkVBUkVTVDogMCxcbiAgICBGSUxURVJfTElORUFSOiAxLFxuICBcbiAgICAvLyB0ZXh0dXJlIHdyYXAgbW9kZVxuICAgIFdSQVBfUkVQRUFUOiAxMDQ5NywgLy8gZ2wuUkVQRUFUXG4gICAgV1JBUF9DTEFNUDogMzMwNzEsICAvLyBnbC5DTEFNUF9UT19FREdFXG4gICAgV1JBUF9NSVJST1I6IDMzNjQ4LCAvLyBnbC5NSVJST1JFRF9SRVBFQVRcbiAgXG4gICAgLy8gdGV4dHVyZSBmb3JtYXRcbiAgICAvLyBjb21wcmVzcyBmb3JtYXRzXG4gICAgVEVYVFVSRV9GTVRfUkdCX0RYVDE6IDAsXG4gICAgVEVYVFVSRV9GTVRfUkdCQV9EWFQxOiAxLFxuICAgIFRFWFRVUkVfRk1UX1JHQkFfRFhUMzogMixcbiAgICBURVhUVVJFX0ZNVF9SR0JBX0RYVDU6IDMsXG4gICAgVEVYVFVSRV9GTVRfUkdCX0VUQzE6IDQsXG4gICAgVEVYVFVSRV9GTVRfUkdCX1BWUlRDXzJCUFBWMTogNSxcbiAgICBURVhUVVJFX0ZNVF9SR0JBX1BWUlRDXzJCUFBWMTogNixcbiAgICBURVhUVVJFX0ZNVF9SR0JfUFZSVENfNEJQUFYxOiA3LFxuICAgIFRFWFRVUkVfRk1UX1JHQkFfUFZSVENfNEJQUFYxOiA4LFxuICBcbiAgICAvLyBub3JtYWwgZm9ybWF0c1xuICAgIFRFWFRVUkVfRk1UX0E4OiA5LFxuICAgIFRFWFRVUkVfRk1UX0w4OiAxMCxcbiAgICBURVhUVVJFX0ZNVF9MOF9BODogMTEsXG4gICAgVEVYVFVSRV9GTVRfUjVfRzZfQjU6IDEyLFxuICAgIFRFWFRVUkVfRk1UX1I1X0c1X0I1X0ExOiAxMyxcbiAgICBURVhUVVJFX0ZNVF9SNF9HNF9CNF9BNDogMTQsXG4gICAgVEVYVFVSRV9GTVRfUkdCODogMTUsXG4gICAgVEVYVFVSRV9GTVRfUkdCQTg6IDE2LFxuICAgIFRFWFRVUkVfRk1UX1JHQjE2RjogMTcsXG4gICAgVEVYVFVSRV9GTVRfUkdCQTE2RjogMTgsXG4gICAgVEVYVFVSRV9GTVRfUkdCMzJGOiAxOSxcbiAgICBURVhUVVJFX0ZNVF9SR0JBMzJGOiAyMCxcbiAgICBURVhUVVJFX0ZNVF9SMzJGOiAyMSxcbiAgICBURVhUVVJFX0ZNVF8xMTExMTBGOiAyMixcbiAgICBURVhUVVJFX0ZNVF9TUkdCOiAyMyxcbiAgICBURVhUVVJFX0ZNVF9TUkdCQTogMjQsXG4gIFxuICAgIC8vIGRlcHRoIGZvcm1hdHNcbiAgICBURVhUVVJFX0ZNVF9EMTY6IDI1LFxuICAgIFRFWFRVUkVfRk1UX0QzMjogMjYsXG4gICAgVEVYVFVSRV9GTVRfRDI0Uzg6IDI3LFxuICBcbiAgICAvLyBldGMyIGZvcm1hdFxuICAgIFRFWFRVUkVfRk1UX1JHQl9FVEMyOiAyOCxcbiAgICBURVhUVVJFX0ZNVF9SR0JBX0VUQzI6IDI5LFxuICBcbiAgICAvLyBkZXB0aCBhbmQgc3RlbmNpbCBmdW5jdGlvblxuICAgIERTX0ZVTkNfTkVWRVI6IDUxMiwgICAgLy8gZ2wuTkVWRVJcbiAgICBEU19GVU5DX0xFU1M6IDUxMywgICAgIC8vIGdsLkxFU1NcbiAgICBEU19GVU5DX0VRVUFMOiA1MTQsICAgIC8vIGdsLkVRVUFMXG4gICAgRFNfRlVOQ19MRVFVQUw6IDUxNSwgICAvLyBnbC5MRVFVQUxcbiAgICBEU19GVU5DX0dSRUFURVI6IDUxNiwgIC8vIGdsLkdSRUFURVJcbiAgICBEU19GVU5DX05PVEVRVUFMOiA1MTcsIC8vIGdsLk5PVEVRVUFMXG4gICAgRFNfRlVOQ19HRVFVQUw6IDUxOCwgICAvLyBnbC5HRVFVQUxcbiAgICBEU19GVU5DX0FMV0FZUzogNTE5LCAgIC8vIGdsLkFMV0FZU1xuICBcbiAgICAvLyByZW5kZXItYnVmZmVyIGZvcm1hdFxuICAgIFJCX0ZNVF9SR0JBNDogMzI4NTQsICAgIC8vIGdsLlJHQkE0XG4gICAgUkJfRk1UX1JHQjVfQTE6IDMyODU1LCAgLy8gZ2wuUkdCNV9BMVxuICAgIFJCX0ZNVF9SR0I1NjU6IDM2MTk0LCAgIC8vIGdsLlJHQjU2NVxuICAgIFJCX0ZNVF9EMTY6IDMzMTg5LCAgICAgIC8vIGdsLkRFUFRIX0NPTVBPTkVOVDE2XG4gICAgUkJfRk1UX1M4OiAzNjE2OCwgICAgICAgLy8gZ2wuU1RFTkNJTF9JTkRFWDhcbiAgICBSQl9GTVRfRDI0Uzg6IDM0MDQxLCAgICAvLyBnbC5ERVBUSF9TVEVOQ0lMXG4gIFxuICAgIC8vIGJsZW5kLWVxdWF0aW9uXG4gICAgQkxFTkRfRlVOQ19BREQ6IDMyNzc0LCAgICAgICAgICAgICAgLy8gZ2wuRlVOQ19BRERcbiAgICBCTEVORF9GVU5DX1NVQlRSQUNUOiAzMjc3OCwgICAgICAgICAvLyBnbC5GVU5DX1NVQlRSQUNUXG4gICAgQkxFTkRfRlVOQ19SRVZFUlNFX1NVQlRSQUNUOiAzMjc3OSwgLy8gZ2wuRlVOQ19SRVZFUlNFX1NVQlRSQUNUXG4gIFxuICAgIC8vIGJsZW5kXG4gICAgQkxFTkRfWkVSTzogMCwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdsLlpFUk9cbiAgICBCTEVORF9PTkU6IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2wuT05FXG4gICAgQkxFTkRfU1JDX0NPTE9SOiA3NjgsICAgICAgICAgICAgICAgICAgIC8vIGdsLlNSQ19DT0xPUlxuICAgIEJMRU5EX09ORV9NSU5VU19TUkNfQ09MT1I6IDc2OSwgICAgICAgICAvLyBnbC5PTkVfTUlOVVNfU1JDX0NPTE9SXG4gICAgQkxFTkRfRFNUX0NPTE9SOiA3NzQsICAgICAgICAgICAgICAgICAgIC8vIGdsLkRTVF9DT0xPUlxuICAgIEJMRU5EX09ORV9NSU5VU19EU1RfQ09MT1I6IDc3NSwgICAgICAgICAvLyBnbC5PTkVfTUlOVVNfRFNUX0NPTE9SXG4gICAgQkxFTkRfU1JDX0FMUEhBOiA3NzAsICAgICAgICAgICAgICAgICAgIC8vIGdsLlNSQ19BTFBIQVxuICAgIEJMRU5EX09ORV9NSU5VU19TUkNfQUxQSEE6IDc3MSwgICAgICAgICAvLyBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBXG4gICAgQkxFTkRfRFNUX0FMUEhBOiA3NzIsICAgICAgICAgICAgICAgICAgIC8vIGdsLkRTVF9BTFBIQVxuICAgIEJMRU5EX09ORV9NSU5VU19EU1RfQUxQSEE6IDc3MywgICAgICAgICAvLyBnbC5PTkVfTUlOVVNfRFNUX0FMUEhBXG4gICAgQkxFTkRfQ09OU1RBTlRfQ09MT1I6IDMyNzY5LCAgICAgICAgICAgIC8vIGdsLkNPTlNUQU5UX0NPTE9SXG4gICAgQkxFTkRfT05FX01JTlVTX0NPTlNUQU5UX0NPTE9SOiAzMjc3MCwgIC8vIGdsLk9ORV9NSU5VU19DT05TVEFOVF9DT0xPUlxuICAgIEJMRU5EX0NPTlNUQU5UX0FMUEhBOiAzMjc3MSwgICAgICAgICAgICAvLyBnbC5DT05TVEFOVF9BTFBIQVxuICAgIEJMRU5EX09ORV9NSU5VU19DT05TVEFOVF9BTFBIQTogMzI3NzIsICAvLyBnbC5PTkVfTUlOVVNfQ09OU1RBTlRfQUxQSEFcbiAgICBCTEVORF9TUkNfQUxQSEFfU0FUVVJBVEU6IDc3NiwgICAgICAgICAgLy8gZ2wuU1JDX0FMUEhBX1NBVFVSQVRFXG4gIFxuICAgIC8vIHN0ZW5jaWwgb3BlcmF0aW9uXG4gICAgU1RFTkNJTF9ESVNBQkxFOiAwLCAgICAgICAgICAgICAvLyBkaXNhYmxlIHN0ZW5jaWxcbiAgICBTVEVOQ0lMX0VOQUJMRTogMSwgICAgICAgICAgICAgIC8vIGVuYWJsZSBzdGVuY2lsXG4gICAgU1RFTkNJTF9JTkhFUklUOiAyLCAgICAgICAgICAgICAvLyBpbmhlcml0IHN0ZW5jaWwgc3RhdGVzXG4gIFxuICAgIFNURU5DSUxfT1BfS0VFUDogNzY4MCwgICAgICAgICAgLy8gZ2wuS0VFUFxuICAgIFNURU5DSUxfT1BfWkVSTzogMCwgICAgICAgICAgICAgLy8gZ2wuWkVST1xuICAgIFNURU5DSUxfT1BfUkVQTEFDRTogNzY4MSwgICAgICAgLy8gZ2wuUkVQTEFDRVxuICAgIFNURU5DSUxfT1BfSU5DUjogNzY4MiwgICAgICAgICAgLy8gZ2wuSU5DUlxuICAgIFNURU5DSUxfT1BfSU5DUl9XUkFQOiAzNDA1NSwgICAgLy8gZ2wuSU5DUl9XUkFQXG4gICAgU1RFTkNJTF9PUF9ERUNSOiA3NjgzLCAgICAgICAgICAvLyBnbC5ERUNSXG4gICAgU1RFTkNJTF9PUF9ERUNSX1dSQVA6IDM0MDU2LCAgICAvLyBnbC5ERUNSX1dSQVBcbiAgICBTVEVOQ0lMX09QX0lOVkVSVDogNTM4NiwgICAgICAgIC8vIGdsLklOVkVSVFxuICBcbiAgICAvLyBjdWxsXG4gICAgQ1VMTF9OT05FOiAwLFxuICAgIENVTExfRlJPTlQ6IDEwMjgsXG4gICAgQ1VMTF9CQUNLOiAxMDI5LFxuICAgIENVTExfRlJPTlRfQU5EX0JBQ0s6IDEwMzIsXG4gIFxuICAgIC8vIHByaW1pdGl2ZSB0eXBlXG4gICAgUFRfUE9JTlRTOiAwLCAgICAgICAgIC8vIGdsLlBPSU5UU1xuICAgIFBUX0xJTkVTOiAxLCAgICAgICAgICAvLyBnbC5MSU5FU1xuICAgIFBUX0xJTkVfTE9PUDogMiwgICAgICAvLyBnbC5MSU5FX0xPT1BcbiAgICBQVF9MSU5FX1NUUklQOiAzLCAgICAgLy8gZ2wuTElORV9TVFJJUFxuICAgIFBUX1RSSUFOR0xFUzogNCwgICAgICAvLyBnbC5UUklBTkdMRVNcbiAgICBQVF9UUklBTkdMRV9TVFJJUDogNSwgLy8gZ2wuVFJJQU5HTEVfU1RSSVBcbiAgICBQVF9UUklBTkdMRV9GQU46IDYsICAgLy8gZ2wuVFJJQU5HTEVfRkFOXG59O1xuXG5leHBvcnQgbmFtZXNwYWNlIEdMYXBpIHtcblxuICAgIC8v5pys5Zywb3BlZ2zkuIrkuIvmlodcbiAgICB2YXIgZ2w6V2ViR0xSZW5kZXJpbmdDb250ZXh0O1xuXG4gICAgLy/mraTlh73mlbDliqHlv4XosIPnlKhcbiAgICBleHBvcnQgZnVuY3Rpb24gYmluZEdMKGdsVCk6IHZvaWQge1xuICAgICAgICBnbCA9IGdsVDtcblxuICAgICAgICBHTGFwaS5nbFRFWFRVUkVfTUFHX0ZJTFRFUiA9IGdsLlRFWFRVUkVfTUFHX0ZJTFRFUjtcbiAgICAgICAgR0xhcGkuZ2xURVhUVVJFX01JTl9GSUxURVIgPSBnbC5URVhUVVJFX01JTl9GSUxURVI7XG4gICAgfVxuICAgIGV4cG9ydCB2YXIgZ2xURVhUVVJFX01BR19GSUxURVI7XG4gICAgZXhwb3J0IHZhciBnbFRFWFRVUkVfTUlOX0ZJTFRFUjtcbiAgIFxuXG5cbiAgICAvKipcbiAqIEBtZXRob2QgYXR0clR5cGVCeXRlc1xuICogQHBhcmFtIHtBVFRSX1RZUEVfKn0gYXR0clR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHJUeXBlQnl0ZXMoYXR0clR5cGUpIHtcbiAgICBcbiAgICBpZiAoYXR0clR5cGUgPT09IGdsRW51bXMuQVRUUl9UWVBFX0lOVDgpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoYXR0clR5cGUgPT09IGdsRW51bXMuQVRUUl9UWVBFX1VJTlQ4KSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGF0dHJUeXBlID09PSBnbEVudW1zLkFUVFJfVFlQRV9JTlQxNikge1xuICAgICAgcmV0dXJuIDI7XG4gICAgfSBlbHNlIGlmIChhdHRyVHlwZSA9PT0gZ2xFbnVtcy5BVFRSX1RZUEVfVUlOVDE2KSB7XG4gICAgICByZXR1cm4gMjtcbiAgICB9IGVsc2UgaWYgKGF0dHJUeXBlID09PSBnbEVudW1zLkFUVFJfVFlQRV9JTlQzMikge1xuICAgICAgcmV0dXJuIDQ7XG4gICAgfSBlbHNlIGlmIChhdHRyVHlwZSA9PT0gZ2xFbnVtcy5BVFRSX1RZUEVfVUlOVDMyKSB7XG4gICAgICByZXR1cm4gNDtcbiAgICB9IGVsc2UgaWYgKGF0dHJUeXBlID09PSBnbEVudW1zLkFUVFJfVFlQRV9GTE9BVDMyKSB7XG4gICAgICByZXR1cm4gNDtcbiAgICB9XG4gIFxuICAgIGNvbnNvbGUud2FybihgVW5rbm93biBBVFRSX1RZUEU6ICR7YXR0clR5cGV9YCk7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgXG5cbiAgICAvKipcbiAgICAgKiDlsIZidWZmZXLnu5HlrprliLDnm67moIfnvJPlhrLljLpcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxuICAgICAqIEdMZW51beaMh+Wumue7k+WQiOeCue+8iOebruagh++8ieOAguWPr+iDveeahOWAvO+8mlxuICAgICAgICBnbC5BUlJBWV9CVUZGRVLvvJrljIXlkKvpobbngrnlsZ7mgKfnmoTnvJPlhrLljLrvvIzkvovlpoLpobbngrnlnZDmoIfvvIznurnnkIblnZDmoIfmlbDmja7miJbpobbngrnpopzoibLmlbDmja7jgIJcbiAgICAgICAgZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVLvvJrnlKjkuo7lhYPntKDntKLlvJXnmoTnvJPlhrLljLrjgIJcbiAgICAgICAg5L2/55SoV2ViR0wgMuS4iuS4i+aWh+aXtu+8jOi/mOWPr+S7peS9v+eUqOS7peS4i+WAvO+8mlxuICAgICAgICBnbC5DT1BZX1JFQURfQlVGRkVS77ya55So5LqO5LuO5LiA5Liq57yT5Yay5Yy65a+56LGh5aSN5Yi25Yiw5Y+m5LiA5Liq57yT5Yay5Yy65a+56LGh55qE57yT5Yay5Yy644CCXG4gICAgICAgIGdsLkNPUFlfV1JJVEVfQlVGRkVS77ya55So5LqO5LuO5LiA5Liq57yT5Yay5Yy65a+56LGh5aSN5Yi25Yiw5Y+m5LiA5Liq57yT5Yay5Yy65a+56LGh55qE57yT5Yay5Yy644CCXG4gICAgICAgIGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVLvvJrnlKjkuo7lj5jmjaLlj43ppojmk43kvZznmoTnvJPlhrLljLrjgIJcbiAgICAgICAgZ2wuVU5JRk9STV9CVUZGRVLvvJrnlKjkuo7lrZjlgqjnu5/kuIDlnZfnmoTnvJPlhrLljLrjgIJcbiAgICAgICAgZ2wuUElYRUxfUEFDS19CVUZGRVLvvJrnlKjkuo7lg4/ntKDkvKDovpPmk43kvZznmoTnvJPlhrLljLrjgIJcbiAgICAgICAgZ2wuUElYRUxfVU5QQUNLX0JVRkZFUu+8mueUqOS6juWDj+e0oOS8oOi+k+aTjeS9nOeahOe8k+WGsuWMuuOAglxuICAgICAqIEBwYXJhbSBidWZmZXIgXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGJpbmRCdWZmZXIodGFyZ2V0LCBidWZmZXIpIHtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIG1vZGUgXG4gICAgICog5p6a5Li+57G75Z6LIOaMh+Wumuimgea4suafk+eahOWbvuWFg+exu+Wei+OAguWPr+S7peaYr+S7peS4i+exu+WeizpcbiAgICAgICAgZ2wuUE9JTlRTOiDnlLvljZXni6znmoTngrnjgIJcbiAgICAgICAgZ2wuTElORV9TVFJJUDog55S75LiA5p2h55u057q/5Yiw5LiL5LiA5Liq6aG254K544CCXG4gICAgICAgIGdsLkxJTkVfTE9PUDog57uY5Yi25LiA5p2h55u057q/5Yiw5LiL5LiA5Liq6aG254K577yM5bm25bCG5pyA5ZCO5LiA5Liq6aG254K56L+U5Zue5Yiw56ys5LiA5Liq6aG254K5LlxuICAgICAgICBnbC5MSU5FUzog5Zyo5LiA5a+56aG254K55LmL6Ze055S75LiA5p2h57q/LlxuICAgICAgICBnbC5UUklBTkdMRV9TVFJJUFxuICAgICAgICBnbC5UUklBTkdMRV9GQU5cbiAgICAgICAgZ2wuVFJJQU5HTEVTOiDkuLrkuIDnu4TkuInkuKrpobbngrnnu5jliLbkuIDkuKrkuInop5LlvaIuXG4gICAgICogQHBhcmFtIGNvdW50IFxuICAgICAgICDmlbTmlbDlnosg5oyH5a6a6KaB5riy5p+T55qE5YWD57Sg5pWw6YePXG4gICAgICogQHBhcmFtIHR5cGUgXG4gICAgICAgIOaemuS4vuexu+WeiyDmjIflrprlhYPntKDmlbDnu4TnvJPlhrLljLrkuK3nmoTlgLznmoTnsbvlnovjgILlj6/og73nmoTlgLzmmK86XG4gICAgICAgIGdsLlVOU0lHTkVEX0JZVEVcbiAgICAgICAgZ2wuVU5TSUdORURfU0hPUlRcbiAgICAgICAg5b2T5L2/55SoIE9FU19lbGVtZW50X2luZGV4X3VpbnQg5omp5bGV5pe2OlxuICAgICAgICBnbC5VTlNJR05FRF9JTlRcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IFxuICAgICAgICAg5a2X6IqC5Y2V5L2NIOaMh+WumuWFg+e0oOaVsOe7hOe8k+WGsuWMuuS4reeahOWBj+enu+mHj+OAguW/hemhu+aYr+e7meWumuexu+Wei+Wkp+Wwj+eahOacieaViOWAjeaVsFxuICAgICAgICBAcmV0dXJuc1xuICAgICAgICBub25lXG4gICAgICAgIEBlcnJvclxuICAgICAgICDlpoLmnpwgbW9kZSDkuI3mmK/mraPnoa7lgLwsICBnbC5JTlZBTElEX0VOVU0g5bCG5Lya5oqb5Ye66ZSZ6K+v5byC5bi4LlxuICAgICAgICDlpoLmnpxvZmZzZXQg5LiN5piv57uZ5a6a57G75Z6L5aSn5bCP55qE5pyJ5pWI5YCN5pWwLCBnbC5JTlZBTElEX09QRVJBVElPTiDlsIbkvJrmipvlh7rplJnor6/lvILluLguXG4gICAgICAgIOWmguaenCBjb3VudCDmmK/otJ/nmoQsICBnbC5JTlZBTElEX1ZBTFVFIOWwhuS8muaKm+WHuumUmeivr+W8guW4uC5cbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gZHJhd0VsZW1lbnRzKG1vZGUsIGNvdW50LCB0eXBlLCBvZmZzZXQpIHtcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKG1vZGUsIGNvdW50LCB0eXBlLCBvZmZzZXQpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBtb2RlIFxuICAgICAqIEdMZW51bSDnsbvlnovvvIzmjIflrprnu5jliLblm77lhYPnmoTmlrnlvI/vvIzlj6/og73lgLzlpoLkuIvjgIJcbiAgICAgICAgZ2wuUE9JTlRTOiDnu5jliLbkuIDns7vliJfngrnjgIJcbiAgICAgICAgZ2wuTElORV9TVFJJUDog57uY5Yi25LiA5Liq57q/5p2h44CC5Y2z77yM57uY5Yi25LiA57O75YiX57q/5q6177yM5LiK5LiA54K56L+e5o6l5LiL5LiA54K544CCXG4gICAgICAgIGdsLkxJTkVfTE9PUDog57uY5Yi25LiA5Liq57q/5ZyI44CC5Y2z77yM57uY5Yi25LiA57O75YiX57q/5q6177yM5LiK5LiA54K56L+e5o6l5LiL5LiA54K577yM5bm25LiU5pyA5ZCO5LiA54K55LiO56ys5LiA5Liq54K555u46L+e44CCXG4gICAgICAgIGdsLkxJTkVTOiDnu5jliLbkuIDns7vliJfljZXni6znur/mrrXjgILmr4/kuKTkuKrngrnkvZzkuLrnq6/ngrnvvIznur/mrrXkuYvpl7TkuI3ov57mjqXjgIJcbiAgICAgICAgZ2wuVFJJQU5HTEVfU1RSSVDvvJrnu5jliLbkuIDkuKrkuInop5LluKbjgIJcbiAgICAgICAgZ2wuVFJJQU5HTEVfRkFO77ya57uY5Yi25LiA5Liq5LiJ6KeS5omH44CCXG4gICAgICAgIGdsLlRSSUFOR0xFUzog57uY5Yi25LiA57O75YiX5LiJ6KeS5b2i44CC5q+P5LiJ5Liq54K55L2c5Li66aG254K5XG4gICAgICogQHBhcmFtIGZpcnN0IFxuICAgICAgICBHTGludCDnsbvlnosg77yM5oyH5a6a5LuO5ZOq5Liq54K55byA5aeL57uY5Yi2XG4gICAgICogQHBhcmFtIGNvdW50IFxuICAgICAgICBHTHNpemVpIOexu+Wei++8jOaMh+Wumue7mOWItumcgOimgeS9v+eUqOWIsOWkmuWwkeS4queCuVxuICAgICBAcmV0dXJuc1xuICAgICBub25lXG4gICAgIEBlcnJvclxuICAgICAgICDlpoLmnpwgbW9kZSDkuI3mmK/kuIDkuKrlj6/mjqXlj5flgLzvvIzlsIbkvJrmipvlh7ogZ2wuSU5WQUxJRF9FTlVNIOW8guW4uOOAglxuICAgICAgICDlpoLmnpwgZmlyc3Qg5oiW6ICFIGNvdW50IOaYr+i0n+WAvO+8jOS8muaKm+WHuiBnbC5JTlZBTElEX1ZBTFVFIOW8guW4uOOAglxuICAgICAgICDlpoLmnpwgZ2wuQ1VSUkVOVF9QUk9HUkFNIOS4uiBudWxs77yM5Lya5oqb5Ye6IGdsLklOVkFMSURfT1BFUkFUSU9OIOW8guW4uFxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiBkcmF3QXJyYXlzKG1vZGUsIGZpcnN0LCBjb3VudCkge1xuICAgICAgICBnbC5kcmF3QXJyYXlzKG1vZGUsIGZpcnN0LCBjb3VudCk7XG4gICAgfVxuICAgIC8qXG4gICAgICAgIC8vIFdlYkdMMTpcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBBcnJheUJ1ZmZlclZpZXc/IHBpeGVscyk7XG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCBmb3JtYXQsIHR5cGUsIEltYWdlRGF0YT8gcGl4ZWxzKTtcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIGZvcm1hdCwgdHlwZSwgSFRNTEltYWdlRWxlbWVudD8gcGl4ZWxzKTtcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIGZvcm1hdCwgdHlwZSwgSFRNTENhbnZhc0VsZW1lbnQ/IHBpeGVscyk7XG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCBmb3JtYXQsIHR5cGUsIEhUTUxWaWRlb0VsZW1lbnQ/IHBpeGVscyk7XG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCBmb3JtYXQsIHR5cGUsIEltYWdlQml0bWFwPyBwaXhlbHMpO1xuICAgIC8vIFdlYkdMMjpcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBHTGludHB0ciBvZmZzZXQpO1xuICAgIHZvaWQgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIEhUTUxDYW52YXNFbGVtZW50IHNvdXJjZSk7XG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgSFRNTEltYWdlRWxlbWVudCBzb3VyY2UpOyBcbiAgICB2b2lkIGdsLnRleEltYWdlMkQodGFyZ2V0LCBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgZm9ybWF0LCB0eXBlLCBIVE1MVmlkZW9FbGVtZW50IHNvdXJjZSk7IFxuICAgIHZvaWQgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIEltYWdlQml0bWFwIHNvdXJjZSk7XG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgSW1hZ2VEYXRhIHNvdXJjZSk7XG4gICAgdm9pZCBnbC50ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgQXJyYXlCdWZmZXJWaWV3IHNyY0RhdGEsIHNyY09mZnNldCk7XG4gICAgKi9cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFxuICAgICAqICAgIEdMZW51bSDmjIflrprnurnnkIbnmoTnu5Hlrprlr7nosaEu5Y+v6IO955qE5YC8OlxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfMkQ6IOS6jOe7tOe6ueeQhui0tOWbvi5cbiAgICAgICAgICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1g656uL5pa55L2T5pig5bCE57q555CG55qE5q2jWOmdouOAglxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWDog56uL5pa55L2T5pig5bCE57q555CG55qE6LSfWOmdouOAglxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWTog56uL5pa55L2T5pig5bCE57q555CG55qE5q2jWemdouOAglxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWTog56uL5pa55L2T5pig5bCE57q555CG55qE6LSfWemdouOAglxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWjog56uL5pa55L2T5pig5bCE57q555CG55qE5q2jWumdouOAglxuICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWjog56uL5pa55L2T5pig5bCE57q555CG55qE6LSfWumdouOAglxuICAgICAqIEBwYXJhbSBsZXZlbCBcbiAgICAgKiAgR0xpbnQg5oyH5a6a6K+m57uG57qn5YirLiAw57qn5piv5Z+65pys5Zu+5YOP562J57qn77yMbue6p+aYr+esrG7kuKrph5HlrZfloZTnroDljJbnuqcuXG4gICAgICogQHBhcmFtIGludGVybmFsZm9ybWF0IFxuICAgICAqIEBwYXJhbSB3aWR0aCBcbiAgICAgKiAgR0xzaXplaSDmjIflrprnurnnkIbnmoTlrr3luqZcbiAgICAgKiBAcGFyYW0gaGVpZ2h0IFxuICAgICAqIEdMc2l6ZWkg5oyH5a6a57q555CG55qE6auY5bqmXG4gICAgICogQHBhcmFtIGJvcmRlciBcbiAgICAgKiBHTGludCDmjIflrprnurnnkIbnmoTovrnmoYblrr3luqbjgILlv4XpobvkuLogMFxuICAgICAqIEBwYXJhbSBmb3JtYXQgXG4gICAgICogIEdMZW51bSDmjIflrpp0ZXhlbOaVsOaNruagvOW8j+OAguWcqCBXZWJHTCAx5Lit77yM5a6D5b+F6aG75LiOIGludGVybmFsZm9ybWF0IOebuOWQjO+8iOafpeeci+S4iumdoikuIOWcqFdlYkdMIDLkuK0sIOi/meW8oOihqOS4reWIl+WHuuS6hui/meS6m+e7hOWQiFxuICAgICAqIEBwYXJhbSB0eXBlIFxuICAgICAqIEdMZW51bSDmjIflrpp0ZXhlbOaVsOaNrueahOaVsOaNruexu+Wei+OAguWPr+iDveeahOWAvDpcbiAgICAgICAgIGdsLlVOU0lHTkVEX0JZVEU6ICBnbC5SR0JB5q+P5Liq6YCa6YGTOOS9jVxuICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlRfNV82XzU6IDUgYml0c+e6oiwgNiBiaXRz57u/LCA1IGJpdHPok51cbiAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JUXzRfNF80XzQ6IDQgYml0c+e6oiwgNCBiaXRz57u/LCA0IGJpdHPok50sIDQgYWxwaGEgYml0cy5cbiAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JUXzVfNV81XzE6IDUgYml0c+e6oiwgNSBiaXRz57u/LCA1IGJpdHPok50sIDEgYWxwaGEgYml0LlxuICAgICAgICAg5b2T5L2/55SoIFdFQkdMX2RlcHRoX3RleHR1cmUg5omp5bGVOlxuICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlRcbiAgICAgICAgIGdsLlVOU0lHTkVEX0lOVFxuICAgICAgICAgZXh0LlVOU0lHTkVEX0lOVF8yNF84X1dFQkdMIChjb25zdGFudCBwcm92aWRlZCBieSB0aGUgZXh0ZW5zaW9uKVxuICAgICAgICAg5b2T5L2/55SoIE9FU190ZXh0dXJlX2Zsb2F05omp5bGVIDpcbiAgICAgICAgIGdsLkZMT0FUXG4gICAgICAgICDlvZPkvb/nlKggT0VTX3RleHR1cmVfaGFsZl9mbG9hdCDmianlsZU6XG4gICAgICAgICBleHQuSEFMRl9GTE9BVF9PRVMgKGNvbnN0YW50IHByb3ZpZGVkIGJ5IHRoZSBleHRlbnNpb24pXG4gICAgICAgICDlvZPkvb/nlKggV2ViR0wgMiBjb250ZXh0LOS4i+mdoueahOWAvOS5n+aYr+WPr+eUqOeahDpcbiAgICAgICAgIGdsLkJZVEVcbiAgICAgICAgIGdsLlVOU0lHTkVEX1NIT1JUXG4gICAgICAgICBnbC5TSE9SVFxuICAgICAgICAgZ2wuVU5TSUdORURfSU5UXG4gICAgICAgICBnbC5JTlRcbiAgICAgICAgIGdsLkhBTEZfRkxPQVRcbiAgICAgICAgIGdsLkZMT0FUXG4gICAgICAgICBnbC5VTlNJR05FRF9JTlRfMl8xMF8xMF8xMF9SRVZcbiAgICAgICAgIGdsLlVOU0lHTkVEX0lOVF8xMEZfMTFGXzExRl9SRVZcbiAgICAgICAgIGdsLlVOU0lHTkVEX0lOVF81XzlfOV85X1JFVlxuICAgICAgICAgZ2wuVU5TSUdORURfSU5UXzI0XzhcbiAgICAgICAgIGdsLkZMT0FUXzMyX1VOU0lHTkVEX0lOVF8yNF84X1JFViAocGl4ZWxzIG11c3QgYmUgbnVsbClcbiAgICAgKiBAcGFyYW0gcGl4ZWxzIFxuICAgICAqIOS4i+WIl+WvueixoeS5i+S4gOWPr+S7peeUqOS9nOe6ueeQhueahOWDj+e0oOa6kDpcbiAgICAgICAgIEFycmF5QnVmZmVyVmlldyxcbiAgICAgICAgIFVpbnQ4QXJyYXkgIOWmguaenCB0eXBlIOaYryBnbC5VTlNJR05FRF9CWVRF5YiZ5b+F6aG75L2/55SoXG4gICAgICAgICBVaW50MTZBcnJheSDlpoLmnpwgdHlwZSDmmK8gZ2wuVU5TSUdORURfU0hPUlRfNV82XzUsIGdsLlVOU0lHTkVEX1NIT1JUXzRfNF80XzQsIGdsLlVOU0lHTkVEX1NIT1JUXzVfNV81XzEsIGdsLlVOU0lHTkVEX1NIT1JUIOaIlmV4dC5IQUxGX0ZMT0FUX09FU+WImeW/hemhu+S9v+eUqFxuICAgICAgICAgVWludDMyQXJyYXkg5aaC5p6cdHlwZSDmmK8gZ2wuVU5TSUdORURfSU5UIOaIlmV4dC5VTlNJR05FRF9JTlRfMjRfOF9XRUJHTOWImeW/hemhu+S9v+eUqFxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiB0ZXhJbWFnZTJEKHRhcmdldCwgbGV2ZWwsIGludGVybmFsZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIGZvcm1hdCwgdHlwZSwgcGl4ZWxzOiBBcnJheUJ1ZmZlclZpZXcpOiB2b2lkIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIGxldmVsLCBpbnRlcm5hbGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgYm9yZGVyLCBmb3JtYXQsIHR5cGUsIHBpeGVscylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlm77lg4/pooTlpITnkIblh73mlbBcbiAgICAgKiDop4Tlrprkuoblm77lg4/lpoLkvZXku47lhoXlrZjkuK3or7vlh7rvvIzlj4jmiJbogIXlpoLkvZXku47mmL7lrZjor7vlhaXlhoXlrZhcbiAgICAgKiBAcGFyYW0gcG5hbWUgXG4gICAgICogIEdsZW51bSDnsbvlnosg77yM6KGo56S65aSE55CG55qE5pa55byP44CC5YWz5LqO6K+l5Y+C5pWw5Y+v6YCJ5YC877yM6K+36KeB5LiL6Z2i6KGo5qC8XG4gICAgICogQHBhcmFtIHBhcmFtIFxuICAgICAqICBHTGludCAg57G75Z6L77yM6KGo56S6IHBuYW1lIOWkhOeQhuaWueW8j+eahOWPguaVsOOAguWFs+S6juivpeWPguaVsOWPr+mAieWAvO+8jOivt+ingeS4i+mdouihqOagvFxuICAgICAqIOaUr+aMgeeahOW5s+WPsHdlYmdsIDEuMCxvcGVuZ2wgZXMgMi4wXG4gICAgICogcG5hbWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQgICAgICAgICAgICBwYXJhbSAgICAgICAgICBkZXNcbiAgICAgKiBnbC5QQUNLX0FMSUdOTUVOVCAgICAgICAgICAgICAgICAgICAgICAgICA0ICAgICAgICAgICAgIDEsIDIsIDQsIDggICAgICAg5bCG5YOP57Sg5pWw5o2u5omT5YyF5Yiw5YaF5a2Y5Lit77yI5LuO5pi+5a2Y5bCG5pWw5o2u5Y+R5b6A5YaF5a2Y77yJXG4gICAgICogZ2wuVU5QQUNLX0FMSUdOTUVOVCAgICAgICAgICAgICAgICAgICAgICAgNCAgICAgICAgICAgICAxLCAyLCA0LCA4ICAgICAgIOS7juWGheWtmOS4reino+WMheWDj+e0oOaVsOaNrijmjqXlrozku6XlkI7lj5HlvoDmmL7lrZgpXG4gICAgICogZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCAgICAgICAgICAgICAgICAgICAgZmFsc2UgICAgICAgICB0cnVlLGZhbHNlICAgICAgIOWmguaenOS4unRydWXvvIzliJnmiorlm77niYfkuIrkuIvlr7nnp7Dnv7vovazlnZDmoIfovbQo5Zu+54mH5pys6Lqr5LiN5Y+YKVxuICAgICAqIGdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCAgICAgICAgIGZhbHNlICAgICAgICAgdHJ1ZSwgZmFsc2UgICAgICDlsIZhbHBoYemAmumBk+S5mOS7peWFtuS7luminOiJsumAmumBk1xuICAgICAqIGdsLlVOUEFDS19DT0xPUlNQQUNFX0NPTlZFUlNJT05fV0VCR0wgIChnbC5CUk9XU0VSX0RFRkFVTFRfV0VCR0wpIChnbC5CUk9XU0VSX0RFRkFVTFRfV0VCR0wsIGdsLk5PTkUpIOm7mOiupOminOiJsuepuumXtOi9rOaNouaIluaXoOminOiJsuepuumXtOi9rOaNolxuICAgICAqIFxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiBwaXhlbFN0b3JlaShwbmFtZSwgcGFyYW0pIHtcbiAgICAgICAgZ2wucGl4ZWxTdG9yZWkocG5hbWUsIHBhcmFtKVxuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gdGV4UGFyYW1ldGVyZih0YXJnZXQ6IEdMZW51bSwgcG5hbWU6IEdMZW51bSwgcGFyYW06IEdMZmxvYXQpIHtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyZih0YXJnZXQsIHBuYW1lLCBwYXJhbSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOiuvue9rue6ueeQhui/h+a7pOeahOWxnuaAp1xuICAgICAqIOW9k+WbvueJh+i/m+ihjOS4gOS6m+WPmOaNouivuOWmguaUvuWkp+e8qeWwj+etie+8jOWmguS9leS7jue6ueeQhuS4reWPluaVsOaNrlxuICAgICAqIEBwYXJhbSB0YXJnZXQgXG4gICAgICogR0xlbnVtIOaMh+Wumue7keWumueCuSjnm67moIcp44CC5Y+v6IO955qE5YC877yaXG4gICAgICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRDog5LqM57u057q555CGLlxuICAgICAgICAgICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVA6IOeri+aWueS9k+e6ueeQhi5cbiAgICAgICAgICAgICAgICDlvZPkvb/nlKggV2ViR0wgMiBjb250ZXh0IOaXtizov5jlj6/ku6Xkvb/nlKjku6XkuIvlgLxcbiAgICAgICAgICAgICAgICBnbC5URVhUVVJFXzNEOiDkuInnu7TotLTlm74uXG4gICAgICAgICAgICAgICAgZ2wuVEVYVFVSRV8yRF9BUlJBWTog5LqM57u05pWw57uE6LS05Zu+LlxuICAgICAqIEBwYXJhbSBwbmFtZSBcbiAgICAgKiBAcGFyYW0gcGFyYW0gXG4gICAgICogXG4gICAgICogIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUlx057q555CG5pS+5aSn5ruk5rOi5ZmoXHRnbC5MSU5FQVIgKOm7mOiupOWAvCksIGdsLk5FQVJFU1QuXG4gICAgICAgIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUlx057q555CG57yp5bCP5ruk5rOi5ZmoXHRnbC5MSU5FQVIsIGdsLk5FQVJFU1QsIGdsLk5FQVJFU1RfTUlQTUFQX05FQVJFU1QsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCwgZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSICjpu5jorqTlgLwpLCBnbC5MSU5FQVJfTUlQTUFQX0xJTkVBUi5cbiAgICAgICAgZ2wuVEVYVFVSRV9XUkFQX1NcdOe6ueeQhuWdkOagh+awtOW5s+Whq+WFhSBzXHRnbC5SRVBFQVQgKOm7mOiupOWAvCksZ2wuQ0xBTVBfVE9fRURHRSwgZ2wuTUlSUk9SRURfUkVQRUFULlxuICAgICAgICBnbC5URVhUVVJFX1dSQVBfVFx057q555CG5Z2Q5qCH5Z6C55u05aGr5YWFIHRcdGdsLlJFUEVBVCAo6buY6K6k5YC8KSxnbC5DTEFNUF9UT19FREdFLCBnbC5NSVJST1JFRF9SRVBFQVQuXG4gICAgICAgIEFkZGl0aW9uYWxseSBhdmFpbGFibGUgd2hlbiB1c2luZyB0aGUgRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljIGV4dGVuc2lvblxuICAgICAgICBleHQuVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFRcdOe6ueeQhuacgOWkp+WQkeW8guaAp1x0IEdMZmxvYXQg5YC8LlxuICAgICAgICBBZGRpdGlvbmFsbHkgYXZhaWxhYmxlIHdoZW4gdXNpbmcgYSBXZWJHTCAyIGNvbnRleHRcbiAgICAgICAgZ2wuVEVYVFVSRV9CQVNFX0xFVkVMXHTnurnnkIbmmKDlsITnrYnnuqdcdOS7u+S9leaVtOWei+WAvC5cbiAgICAgICAgZ2wuVEVYVFVSRV9DT01QQVJFX0ZVTkNcdOe6ueeQhuWvueavlOWHveaVsFx0Z2wuTEVRVUFMICjpu5jorqTlgLwpLCBnbC5HRVFVQUwsIGdsLkxFU1MsIGdsLkdSRUFURVIsIGdsLkVRVUFMLCBnbC5OT1RFUVVBTCwgZ2wuQUxXQVlTLCBnbC5ORVZFUi5cbiAgICAgICAgZ2wuVEVYVFVSRV9DT01QQVJFX01PREVcdOe6ueeQhuWvueavlOaooeW8j1x0Z2wuTk9ORSAo6buY6K6k5YC8KSwgZ2wuQ09NUEFSRV9SRUZfVE9fVEVYVFVSRS5cbiAgICAgICAgZ2wuVEVYVFVSRV9NQVhfTEVWRUxcdOacgOWkp+e6ueeQhuaYoOWwhOaVsOe7hOetiee6p1x05Lu75L2V5pW05Z6L5YC8LlxuICAgICAgICBnbC5URVhUVVJFX01BWF9MT0RcdOe6ueeQhuacgOWkp+e7huiKguWxguasoeWAvFx05Lu75L2V5pW05Z6L5YC8LlxuICAgICAgICBnbC5URVhUVVJFX01JTl9MT0RcdOe6ueeQhuacgOWwj+e7huiKguWxguasoeWAvFx05Lu75L2V5rWu54K55Z6L5YC8LlxuICAgICAgICBnbC5URVhUVVJFX1dSQVBfUlx057q555CG5Z2Q5qCHcuWMheijheWKn+iDvVx0Z2wuUkVQRUFUICjpu5jorqTlgLwpLCBnbC5DTEFNUF9UT19FREdFLCBnbC5NSVJST1JFRF9SRVBFQVQuXG4gICAgICAgIEBlcnJvclxuICAgICAgICBJTlZBTElEX0VOVU0gdGFyZ2V05LiN5piv5ZCI5rOV55qE5YC844CCXG4gICAgICAgIElOVkFMSURfT1BSQVRJT04g5b2T5YmN55uu5qCH5LiK5rKh5pyJ57uR5a6a57q555CG5a+56LGhXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHRleFBhcmFtZXRlcmkodGFyZ2V0OiBHTGVudW0sIHBuYW1lOiBHTGVudW0sIHBhcmFtOiBHTGludCkge1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgcG5hbWUsIHBhcmFtKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPlnNoYWRlcuS4rWF0dHJpYnV0ZeS4i+WvueW6lOeahOWxnuaAp+S9jee9rlxuICAgICAqIEBwYXJhbSBwcm9ncmFtIHNoYWRlcueahGdsSURcbiAgICAgKiBAcGFyYW0gbmFtZSDlsZ7mgKfnmoTlkI3lrZdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIOihqOaYjuWxnuaAp+S9jee9rueahOS4i+aghyBHTGludCDmlbDlrZfvvIzlpoLmnpzmib7kuI3liLDor6XlsZ7mgKfliJnov5Tlm54tMVxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBuYW1lKTogR0x1aW50IHtcbiAgICAgICAgcmV0dXJuIGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIG5hbWUpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIOa/gOa0u+mhtueCueWxnuaAp1xuICAgICAqIEBwYXJhbSBpbmRleCBcbiAgICAgKiDnsbvlnovkuLpHTHVpbnQg55qE57Si5byV77yM5oyH5ZCR6KaB5r+A5rS755qE6aG254K55bGe5oCn44CC5aaC5p6c5oKo5Y+q55+l6YGT5bGe5oCn55qE5ZCN56ew77yM5LiN55+l6YGT57Si5byV77yMXG4gICAgICog5oKo5Y+v5Lul5L2/55So5Lul5LiL5pa55rOV5p2l6I635Y+W57Si5byVZ2V0QXR0cmliTG9jYXRpb24oKVxuICAgICAqIFxuICAgICAqIOeJueWIq+ivtOaYjlxuICAgICAqIOWcqFdlYkdM5Lit77yM5L2c55So5LqO6aG254K555qE5pWw5o2u5Lya5YWI5YKo5a2Y5ZyoYXR0cmlidXRlc+OAglxuICAgICAqIOi/meS6m+aVsOaNruS7heWvuUphdmFTY3JpcHTku6PnoIHlkozpobbngrnnnYDoibLlmajlj6/nlKjjgIJcbiAgICAgKiDlsZ7mgKfnlLHntKLlvJXlj7flvJXnlKjliLBHUFXnu7TmiqTnmoTlsZ7mgKfliJfooajkuK3jgILlnKjkuI3lkIznmoTlubPlj7DmiJZHUFXkuIrvvIzmn5DkupvpobbngrnlsZ7mgKfntKLlvJXlj6/og73lhbfmnInpooTlrprkuYnnmoTlgLzjgIJcbiAgICAgKiDliJvlu7rlsZ7mgKfml7bvvIxXZWJHTOWxguS8muWIhumFjeWFtuS7luWxnuaAp+OAglxuICAgICAgIOaXoOiuuuaAjuagt++8jOmDvemcgOimgeS9oOS9v+eUqGVuYWJsZVZlcnRleEF0dHJpYkFycmF5KCnmlrnms5XvvIzmnaXmv4DmtLvmr4/kuIDkuKrlsZ7mgKfku6Xkvr/kvb/nlKjvvIzkuI3ooqvmv4DmtLvnmoTlsZ7mgKfmmK/kuI3kvJrooqvkvb/nlKjnmoTjgIJcbiAgICAgICDkuIDml6bmv4DmtLvvvIzku6XkuIvlhbbku5bmlrnms5XlsLHlj6/ku6Xojrflj5bliLDlsZ7mgKfnmoTlgLzkuobvvIxcbiAgICAgICDljIXmi6x2ZXJ0ZXhBdHRyaWJQb2ludGVyKCnvvIx2ZXJ0ZXhBdHRyaWIqKCnvvIzlkowgZ2V0VmVydGV4QXR0cmliKClcbiAgICAgICBAZXJyb3JcbiAgICAgICDmgqjlj6/ku6Xkvb/nlKhnZXRFcnJvcigp5pa55rOV77yM5p2l5qOA5p+l5L2/55SoZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoKeaXtuWPkeeUn+eahOmUmeivr+OAglxuICAgICAgIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5JTlZBTElEX1ZBTFVFIOmdnuazleeahCBpbmRleCDjgIJcbiAgICAgICDkuIDoiKzmmK8gaW5kZXgg5aSn5LqO5oiW562J5LqO5LqG6aG254K55bGe5oCn5YiX6KGo5YWB6K6455qE5pyA5aSn5YC844CC6K+l5YC85Y+v5Lul6YCa6L+HIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5NQVhfVkVSVEVYX0FUVFJJQlPojrflj5ZcbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5kZXg6IEdMdWludCkge1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShpbmRleCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOaWueazleWcqOe7meWumueahOe0ouW8leS9jee9ruWFs+mXremAmueUqOmhtueCueWxnuaAp+aVsOe7hFxuICAgICAqIEBwYXJhbSBpbmRleCBcbiAgICAgKiBzaGFkZXIg5Y+Y6YeP55qE5L2N572uXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpbmRleDogR0x1aW50KSB7XG4gICAgICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpbmRleClcbiAgICB9XG4gICAgLyoqXG4gICAgICog5ZGK6K+J5pi+5Y2h5LuO5b2T5YmN57uR5a6a55qE57yT5Yay5Yy677yIYmluZEJ1ZmZlcigp5oyH5a6a55qE57yT5Yay5Yy677yJ5Lit6K+75Y+W6aG254K55pWw5o2u44CCXG4gICAgICAgV2ViR0wgQVBJIOeahFdlYkdMUmVuZGVyaW5nQ29udGV4dC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCnmlrnms5Xnu5HlrprlvZPliY3nvJPlhrLljLrojIPlm7TliLBnbC5BUlJBWV9CVUZGRVIsXG4gICAgICAg5oiQ5Li65b2T5YmN6aG254K557yT5Yay5Yy65a+56LGh55qE6YCa55So6aG254K55bGe5oCn5bm25oyH5a6a5a6D55qE5biD5bGAKOe8k+WGsuWMuuWvueixoeS4reeahOWBj+enu+mHjylcbiAgICAgKiBAcGFyYW0gaW5kZXggXG4gICAgICAg5oyH5a6a6KaB5L+u5pS555qE6aG254K55bGe5oCn55qE57Si5byVIOWFtuWunuWwseaYr+afkOS4qmF0dHJpYnV0ZeWPmOmHj+WcqHNoYWRlcuS4reeahOS9jee9rlxuICAgICAqIEBwYXJhbSBzaXplIFxuICAgICAgIOaMh+Wumuavj+S4qumhtueCueWxnuaAp+eahOe7hOaIkOaVsOmHj++8jOW/hemhu+aYrzHvvIwy77yMM+aIljRcbiAgICAgKiBAcGFyYW0gdHlwZSBcbiAgICAgICAg5oyH5a6a5pWw57uE5Lit5q+P5Liq5YWD57Sg55qE5pWw5o2u57G75Z6L5Y+v6IO95piv77yaXG4gICAgICAgICAgICBnbC5CWVRFOiBzaWduZWQgOC1iaXQgaW50ZWdlciwgd2l0aCB2YWx1ZXMgaW4gWy0xMjgsIDEyN11cbiAgICAgICAgICAgIOacieespuWPt+eahDjkvY3mlbTmlbDvvIzojIPlm7RbLTEyOCwgMTI3XVxuICAgICAgICAgICAgZ2wuU0hPUlQ6IHNpZ25lZCAxNi1iaXQgaW50ZWdlciwgd2l0aCB2YWx1ZXMgaW4gWy0zMjc2OCwgMzI3NjddXG4gICAgICAgICAgICDmnInnrKblj7fnmoQxNuS9jeaVtOaVsO+8jOiMg+WbtFstMzI3NjgsIDMyNzY3XVxuICAgICAgICAgICAgZ2wuVU5TSUdORURfQllURTogdW5zaWduZWQgOC1iaXQgaW50ZWdlciwgd2l0aCB2YWx1ZXMgaW4gWzAsIDI1NV1cbiAgICAgICAgICAgIOaXoOespuWPt+eahDjkvY3mlbTmlbDvvIzojIPlm7RbMCwgMjU1XVxuICAgICAgICAgICAgZ2wuVU5TSUdORURfU0hPUlQ6IHVuc2lnbmVkIDE2LWJpdCBpbnRlZ2VyLCB3aXRoIHZhbHVlcyBpbiBbMCwgNjU1MzVdXG4gICAgICAgICAgICDml6DnrKblj7fnmoQxNuS9jeaVtOaVsO+8jOiMg+WbtFswLCA2NTUzNV1cbiAgICAgICAgICAgIGdsLkZMT0FUOiAzMi1iaXQgSUVFRSBmbG9hdGluZyBwb2ludCBudW1iZXJcbiAgICAgICAgICAgIDMy5L2NSUVFReagh+WHhueahOa1rueCueaVsFxuICAgICAgICAgICAgV2hlbiB1c2luZyBhIFdlYkdMIDIgY29udGV4dCwgdGhlIGZvbGxvd2luZyB2YWx1ZXMgYXJlIGF2YWlsYWJsZSBhZGRpdGlvbmFsbHk6XG4gICAgICAgICAgICDkvb/nlKhXZWJHTDLniYjmnKznmoTov5jlj6/ku6Xkvb/nlKjku6XkuIvlgLzvvJpcbiAgICAgICAgICAgIGdsLkhBTEZfRkxPQVQ6IDE2LWJpdCBJRUVFIGZsb2F0aW5nIHBvaW50IG51bWJlclxuICAgICAgICAgICAgMTbkvY1JRUVF5qCH5YeG55qE5rWu54K55pWwXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWQgXG4gICAgICAgIOW9k+i9rOaNouS4uua1rueCueaVsOaXtuaYr+WQpuW6lOivpeWwhuaVtOaVsOaVsOWAvOW9kuS4gOWMluWIsOeJueWumueahOiMg+WbtOOAglxuICAgICAgICAgICAgRm9yIHR5cGVzIGdsLkJZVEUgYW5kIGdsLlNIT1JULCBub3JtYWxpemVzIHRoZSB2YWx1ZXMgdG8gWy0xLCAxXSBpZiB0cnVlLlxuICAgICAgICAgICAg5a+55LqO57G75Z6LZ2wuQllUReWSjGdsLlNIT1JU77yM5aaC5p6c5pivdHJ1ZeWImeWwhuWAvOW9kuS4gOWMluS4ulstMSwgMV1cbiAgICAgICAgICAgIEZvciB0eXBlcyBnbC5VTlNJR05FRF9CWVRFIGFuZCBnbC5VTlNJR05FRF9TSE9SVCwgbm9ybWFsaXplcyB0aGUgdmFsdWVzIHRvIFswLCAxXSBpZiB0cnVlLlxuICAgICAgICAgICAg5a+55LqO57G75Z6LZ2wuVU5TSUdORURfQllUReWSjGdsLlVOU0lHTkVEX1NIT1JU77yM5aaC5p6c5pivdHJ1ZeWImeWwhuWAvOW9kuS4gOWMluS4ulswLCAxXVxuICAgICAgICAgICAgRm9yIHR5cGVzIGdsLkZMT0FUIGFuZCBnbC5IQUxGX0ZMT0FULCB0aGlzIHBhcmFtZXRlciBoYXMgbm8gZWZmZWN0LlxuICAgICAgICAgICAg5a+55LqO57G75Z6LZ2wuRkxPQVTlkoxnbC5IQUxGX0ZMT0FU77yM5q2k5Y+C5pWw5peg5pWIXG4gICAgICogQHBhcmFtIHN0cmlkZSBcbiAgICAgICAg5LiA5LiqR0xzaXplae+8jOS7peWtl+iKguS4uuWNleS9jeaMh+Wumui/nue7remhtueCueWxnuaAp+W8gOWni+S5i+mXtOeahOWBj+enu+mHjyjljbPmlbDnu4TkuK3kuIDooYzplb/luqYp44CCXG4gICAgICAgIOS4jeiDveWkp+S6jjI1NeOAguWmguaenHN0cmlkZeS4ujDvvIzliJnlgYflrpror6XlsZ7mgKfmmK/ntKflr4bmiZPljIXnmoTvvIzljbPkuI3kuqTplJnlsZ7mgKfvvIxcbiAgICAgICAg5q+P5Liq5bGe5oCn5Zyo5LiA5Liq5Y2V54us55qE5Z2X5Lit77yM5LiL5LiA5Liq6aG254K555qE5bGe5oCn57Sn6Lef5b2T5YmN6aG254K55LmL5ZCOXG4gICAgICogQHBhcmFtIG9mZnNldCBcbiAgICAgICAgIEdMaW50cHRy5oyH5a6a6aG254K55bGe5oCn5pWw57uE5Lit56ys5LiA6YOo5YiG55qE5a2X6IqC5YGP56e76YeP44CC5b+F6aG75piv57G75Z6L55qE5a2X6IqC6ZW/5bqm55qE5YCN5pWwXG5cbiAgICAgICAgQGVycm9yXG4gICAgICAgIEEgZ2wuSU5WQUxJRF9WQUxVRSBlcnJvciBpcyB0aHJvd24gaWYgb2Zmc2V0IGlzIG5lZ2F0aXZlLlxuICAgICAgICDlpoLmnpzlgY/np7vph4/kuLrotJ/vvIzliJnmipvlh7pnbC5JTlZBTElEX1ZBTFVF6ZSZ6K+v44CCXG4gICAgICAgIEEgZ2wuSU5WQUxJRF9PUEVSQVRJT04gZXJyb3IgaXMgdGhyb3duIGlmIHN0cmlkZSBhbmQgb2Zmc2V0IGFyZSBub3QgbXVsdGlwbGVzIG9mIHRoZSBzaXplIG9mIHRoZSBkYXRhIHR5cGUuXG4gICAgICAgIOWmguaenHN0cmlkZeWSjG9mZnNldOS4jeaYr+aVsOaNruexu+Wei+Wkp+Wwj+eahOWAjeaVsO+8jOWImeaKm+WHumdsLklOVkFMSURfT1BFUkFUSU9O6ZSZ6K+v44CCXG4gICAgICAgIEEgZ2wuSU5WQUxJRF9PUEVSQVRJT04gZXJyb3IgaXMgdGhyb3duIGlmIG5vIFdlYkdMQnVmZmVyIGlzIGJvdW5kIHRvIHRoZSBBUlJBWV9CVUZGRVIgdGFyZ2V0LlxuICAgICAgICDlpoLmnpzmsqHmnInlsIZXZWJHTEJ1ZmZlcue7keWumuWIsEFSUkFZX0JVRkZFUuebruagh++8jOWImeaKm+WHumdsLklOVkFMSURfT1BFUkFUSU9O6ZSZ6K+v44CCXG4gICAgICAgIFdoZW4gdXNpbmcgYSBXZWJHTCAyIGNvbnRleHRcbiAgICAgICAgYSBnbC5JTlZBTElEX09QRVJBVElPTiBlcnJvciBpcyB0aHJvd24gaWYgdGhpcyB2ZXJ0ZXggYXR0cmlidXRlIGlzIGRlZmluZWQgYXMgYSBpbnRlZ2VyIGluIHRoZSB2ZXJ0ZXggc2hhZGVyIChlLmcuIHV2ZWM0IG9yIGl2ZWM0LCBpbnN0ZWFkIG9mIHZlYzQpLlxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiB2ZXJ0ZXhBdHRyaWJQb2ludGVyKGluZGV4LCBzaXplLCB0eXBlLCBub3JtYWxpemVkLCBzdHJpZGUsIG9mZnNldCkge1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGluZGV4LCBzaXplLCB0eXBlLCBub3JtYWxpemVkLCBzdHJpZGUsIG9mZnNldClcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICog6K6+572u57yT5Yay5Yy65aSn5bCPXG4gICAgICogQHBhcmFtIHRhcmdldCBcbiAgICAgKiBAcGFyYW0gc2l6ZSBcbiAgICAgKiBHTHNpemVpcHRyIOiuvuWumkJ1ZmZlcuWvueixoeeahOaVsOaNruWtmOWCqOWMuuWkp+Wwj1xuICAgICAqIEBwYXJhbSB1c2FnZSBcbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gYnVmZmVyRGF0YUxlbmd0aCh0YXJnZXQsIHNpemU6IEdMc2l6ZWlwdHIsIHVzYWdlKSB7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEodGFyZ2V0LCBzaXplLCB1c2FnZSlcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlckRhdGEodGFyZ2V0LCBzcmNEYXRhOiBBcnJheUJ1ZmZlciwgdXNhZ2UpIHtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YSh0YXJnZXQsIHNyY0RhdGEsIHVzYWdlKVxuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gYnVmZmVyU3ViRGF0YSh0YXJnZXQsIG9mZnNldCxzcmNEYXRhOkFycmF5QnVmZmVyVmlldylcbiAgICB7XG4gICAgICAgIGdsLmJ1ZmZlclN1YkRhdGEodGFyZ2V0LCBvZmZzZXQsc3JjRGF0YSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHRhcmdldCBcbiAgICAgKiBHTGVudW0g5oyH5a6aQnVmZmVy57uR5a6a54K577yI55uu5qCH77yJ44CC5Y+v5Y+W5Lul5LiL5YC877yaXG4gICAgICAgIGdsLkFSUkFZX0JVRkZFUjog5YyF5ZCr6aG254K55bGe5oCn55qEQnVmZmVy77yM5aaC6aG254K55Z2Q5qCH77yM57q555CG5Z2Q5qCH5pWw5o2u5oiW6aG254K56aKc6Imy5pWw5o2u44CCXG4gICAgICAgIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSOiDnlKjkuo7lhYPntKDntKLlvJXnmoRCdWZmZXLjgIJcbiAgICAgICAg5b2T5L2/55SoIFdlYkdMIDIgY29udGV4dCDml7bvvIzlj6/ku6Xkvb/nlKjku6XkuIvlgLzvvJpcbiAgICAgICAgZ2wuQ09QWV9SRUFEX0JVRkZFUjog5LuO5LiA5LiqQnVmZmVy5a+56LGh5aSN5Yi25Yiw5Y+m5LiA5LiqQnVmZmVy5a+56LGh44CCXG4gICAgICAgIGdsLkNPUFlfV1JJVEVfQlVGRkVSOiDku47kuIDkuKpCdWZmZXLlr7nosaHlpI3liLbliLDlj6bkuIDkuKpCdWZmZXLlr7nosaHjgIJcbiAgICAgICAgZ2wuVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUjog55So5LqO6L2s5o2i5Y+N6aaI5pON5L2c55qEQnVmZmVy44CCXG4gICAgICAgIGdsLlVOSUZPUk1fQlVGRkVSOiDnlKjkuo7lrZjlgqjnu5/kuIDlnZfnmoRCdWZmZXLjgIJcbiAgICAgICAgZ2wuUElYRUxfUEFDS19CVUZGRVI6IOeUqOS6juWDj+e0oOi9rOaNouaTjeS9nOeahEJ1ZmZlcuOAglxuICAgICAgICBnbC5QSVhFTF9VTlBBQ0tfQlVGRkVSOiDnlKjkuo7lg4/ntKDovazmjaLmk43kvZznmoRCdWZmZXJcbiAgICAgKiBAcGFyYW0gc3JjRGF0YSBcbiAgICAgICAg5LiA5LiqQXJyYXlCdWZmZXLvvIxTaGFyZWRBcnJheUJ1ZmZlciDmiJbogIUgQXJyYXlCdWZmZXJWaWV3IOexu+Wei+eahOaVsOe7hOWvueixoe+8jOWwhuiiq+WkjeWItuWIsEJ1ZmZlcueahOaVsOaNruWtmOWCqOWMuuOAglxuICAgICAgICAg5aaC5p6c5Li6bnVsbO+8jOaVsOaNruWtmOWCqOWMuuS7jeS8muiiq+WIm+W7uu+8jOS9huaYr+S4jeS8mui/m+ihjOWIneWni+WMluWSjOWumuS5iVxuICAgICAqIEBwYXJhbSB1c2FnZSBcbiAgICAgICAgIEdMZW51bSDmjIflrprmlbDmja7lrZjlgqjljLrnmoTkvb/nlKjmlrnms5XjgILlj6/lj5bku6XkuIvlgLzvvJpcbiAgICAgICAgICAgIGdsLlNUQVRJQ19EUkFXOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73nu4/luLjkvb/nlKjvvIzogIzkuI3kvJrnu4/luLjmm7TmlLnjgILlhoXlrrnooqvlhpnlhaXnvJPlhrLljLrvvIzkvYbkuI3ooqvor7vlj5bjgIJcbiAgICAgICAgICAgIGdsLkRZTkFNSUNfRFJBVzog57yT5Yay5Yy655qE5YaF5a655Y+v6IO957uP5bi46KKr5L2/55So77yM5bm25LiU57uP5bi45pu05pS544CC5YaF5a656KKr5YaZ5YWl57yT5Yay5Yy677yM5L2G5LiN6KKr6K+75Y+W44CCXG4gICAgICAgICAgICBnbC5TVFJFQU1fRFJBVzog57yT5Yay5Yy655qE5YaF5a655Y+v6IO95LiN5Lya57uP5bi45L2/55So44CC5YaF5a656KKr5YaZ5YWl57yT5Yay5Yy677yM5L2G5LiN6KKr6K+75Y+W44CCXG4gICAgICAgICAgICDlvZPkvb/nlKggV2ViR0wgMiBjb250ZXh0IOaXtu+8jOWPr+S7peS9v+eUqOS7peS4i+WAvO+8mlxuICAgICAgICAgICAgZ2wuU1RBVElDX1JFQUQ6IOe8k+WGsuWMuueahOWGheWuueWPr+iDvee7j+W4uOS9v+eUqO+8jOiAjOS4jeS8mue7j+W4uOabtOaUueOAguWGheWuueS7jue8k+WGsuWMuuivu+WPlu+8jOS9huS4jeWGmeWFpeOAglxuICAgICAgICAgICAgZ2wuRFlOQU1JQ19SRUFEOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73nu4/luLjkvb/nlKjvvIzlubbkuJTnu4/luLjmm7TmlLnjgILlhoXlrrnku47nvJPlhrLljLror7vlj5bvvIzkvYbkuI3lhpnlhaXjgIJcbiAgICAgICAgICAgIGdsLlNUUkVBTV9SRUFEOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73kuI3kvJrnu4/luLjkvb/nlKjjgILlhoXlrrnku47nvJPlhrLljLror7vlj5bvvIzkvYbkuI3lhpnlhaXjgIJcbiAgICAgICAgICAgIGdsLlNUQVRJQ19DT1BZOiDnvJPlhrLljLrnmoTlhoXlrrnlj6/og73nu4/luLjkvb/nlKjvvIzogIzkuI3kvJrnu4/luLjmm7TmlLnjgILnlKjmiLfkuI3kvJrku47nvJPlhrLljLror7vlj5blhoXlrrnvvIzkuZ/kuI3lhpnlhaXjgIJcbiAgICAgICAgICAgIGdsLkRZTkFNSUNfQ09QWTog57yT5Yay5Yy655qE5YaF5a655Y+v6IO957uP5bi45L2/55So77yM5bm25LiU57uP5bi45pu05pS544CC55So5oi35LiN5Lya5LuO57yT5Yay5Yy66K+75Y+W5YaF5a6577yM5Lmf5LiN5YaZ5YWl44CCXG4gICAgICAgICAgICBnbC5TVFJFQU1fQ09QWTog57yT5Yay5Yy655qE5YaF5a655Y+v6IO95LiN5Lya57uP5bi45L2/55So44CC55So5oi35LiN5Lya5LuO57yT5Yay5Yy66K+75Y+W5YaF5a6577yM5Lmf5LiN5YaZ5YWlXG4gICAgICogQHBhcmFtIHNyY09mZnNldCBcbiAgICAgICAgICAgR0x1aW50IOaMh+Wumuivu+WPlue8k+WGsuaXtueahOWIneWni+WFg+e0oOe0ouW8leWBj+enu+mHj1xuICAgICAqIEBwYXJhbSBsZW5ndGggXG4gICAgICAgICAgICBHTHVpbnQg6buY6K6k5Li6MFxuICAgICAgICBAZXJyb3JcbiAgICAgICAgICAgIOWmguaenOaXoOazleWIm+W7unNpemXmjIflrprlpKflsI/nmoTmlbDmja7lrZjlgqjljLrvvIzliJnkvJrmipvlh7pnbC5PVVRfT0ZfTUVNT1JZ5byC5bi444CCXG4gICAgICAgICAgICDlpoLmnpxzaXpl5piv6LSf5YC877yM5YiZ5Lya5oqb5Ye6Z2wuSU5WQUxJRF9WQUxVReW8guW4uOOAglxuICAgICAgICAgICAg5aaC5p6cdGFyZ2V05oiWdXNhZ2XkuI3lsZ7kuo7mnprkuL7lgLzkuYvliJfvvIzliJnkvJrmipvlh7pnbC5JTlZBTElEX0VOVU3lvILluLhcbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gYnVmZmVyRGF0YUZvcldlYmdsMih0YXJnZXQsIHNyY0RhdGE6IEFycmF5QnVmZmVyVmlldywgdXNhZ2UsIHNyY09mZnNldCwgbGVuZ3RoKSB7XG4gICAgICAgIC8vZ2wuYnVmZmVyRGF0YSh0YXJnZXQsIHNyY0RhdGEsIHVzYWdlLCBzcmNPZmZzZXQsIGxlbmd0aClcbiAgICB9XG5cbn0iLCJcbmltcG9ydCB7IGdsdmVydF9hdHRyX3NlbWFudGljLCBnbFRFWFRVUkVfVU5JVF9WQUxJRCB9IGZyb20gXCIuLi9nZngvR0xFbnVtc1wiO1xuaW1wb3J0IHsgR0xhcGkgfSBmcm9tIFwiLi4vZ2Z4L0dMYXBpXCI7XG5cbmVudW0gU2hhZGVyVHlwZSB7XG4gICAgVkVSVEVYID0gMSxcbiAgICBGUkFHTUVOVFxufVxuXG5cbnZhciB2ZXJ0ZXh0QmFzZUNvZGUgPVxuICAgICdhdHRyaWJ1dGUgdmVjMyBhX3Bvc2l0aW9uOycgK1xuICAgICdhdHRyaWJ1dGUgdmVjMyBhX25vcm1hbDsnICtcbiAgICAnYXR0cmlidXRlIHZlYzIgYV91djsnICtcblxuICAgICd1bmlmb3JtIG1hdDQgdV9NVk1hdHJpeDsnICtcbiAgICAndW5pZm9ybSBtYXQ0IHVfUE1hdHJpeDsnICtcbiAgICAndW5pZm9ybSBtYXQ0IHVfTU1hdHJpeDsnICtcbiAgICAndW5pZm9ybSBtYXQ0IHVfVk1hdHJpeDsnICtcblxuICAgICd2YXJ5aW5nIHZlYzMgdl9ub3JtYWw7JyArXG4gICAgJ3ZhcnlpbmcgdmVjMiB2X3V2OycgK1xuXG4gICAgJ3ZvaWQgbWFpbigpIHsnICtcbiAgICAnZ2xfUG9zaXRpb24gPSB1X1BNYXRyaXggKiB1X01WTWF0cml4ICogdmVjNChhX3Bvc2l0aW9uLCAxLjApOycgK1xuICAgICd2X3V2ID0gYV91djsnICtcbiAgICAnfSdcbi8v5Z+656GA55qEc2hhZGVy55qE54mH5q61552A6Imy5ZmoXG52YXIgZnJhZ0Jhc2VDb2RlID1cbiAgICAncHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7JyArXG5cbiAgICAndmFyeWluZyB2ZWMyIHZfdXY7JyArXG4gICAgJ3VuaWZvcm0gc2FtcGxlckN1YmUgdV9za3lib3g7JyArXG4gICAgJ3VuaWZvcm0gc2FtcGxlcjJEIHVfdGV4Q29vcmQ7JyArXG4gICAgJ3VuaWZvcm0gbWF0NCB1X1BWTV9NYXRyaXhfSW52ZXJzZTsnICtcbiAgICAndW5pZm9ybSB2ZWM0IHVfY29sb3I7JyArXG4gICAgJ3VuaWZvcm0gdmVjNCB1X2NvbG9yX2RpcjsnICtcblxuICAgICd2b2lkIG1haW4oKSB7JyArXG4gICAgJ2dsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1X3RleENvb3JkLCB2X3V2KTsnICtcbiAgICAnfSdcblxuZXhwb3J0IGNsYXNzIFNoYWRlckRhdGEge1xuICAgIGNvbnN0cnVjdG9yKHNwR0xJRCwgaW5kZXgpIHtcbiAgICAgICAgdGhpcy5fc3BHTElEID0gc3BHTElEO1xuICAgICAgICB0aGlzLl90ZXh0dXJlVW5pdCA9IDA7XG4gICAgICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gICAgfVxuICAgIHByaXZhdGUgX3NwR0xJRDtcbiAgICBwcml2YXRlIF90ZXh0dXJlVW5pdDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF91bmlmb3JtU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH07XG4gICAgcHJpdmF0ZSBfYXR0cmliU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH07XG4gICAgcHJpdmF0ZSBfaW5kZXg6IG51bWJlciA9IC0xO1xuICAgIHB1YmxpYyBnZXQgc3BHbElEKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3BHTElEO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHRleHR1cmVVbml0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGV4dHVyZVVuaXQ7XG4gICAgfVxuICAgIHB1YmxpYyBhZGRUZXh0dXJlVW5pdCgpIHtcbiAgICAgICAgdmFyIGJlZm9yZSA9IHRoaXMuX3RleHR1cmVVbml0O1xuICAgICAgICB0aGlzLl90ZXh0dXJlVW5pdCsrO1xuICAgICAgICByZXR1cm4gYmVmb3JlO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0IHVuaVNldHRlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl91bmlmb3JtU2V0dGVycztcbiAgICB9XG4gICAgcHVibGljIGdldCBhdHRyU2V0dGVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F0dHJpYlNldHRlcnM7XG4gICAgfVxuICAgIHB1YmxpYyBzZXQgdW5pU2V0dGVycyhzZXQ6IHsgW2luZGV4OiBzdHJpbmddOiBGdW5jdGlvbiB9KSB7XG4gICAgICAgIHRoaXMuX3VuaWZvcm1TZXR0ZXJzID0gc2V0O1xuICAgIH1cbiAgICBwdWJsaWMgc2V0IGF0dHJTZXR0ZXJzKHNldDogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0pIHtcbiAgICAgICAgdGhpcy5fYXR0cmliU2V0dGVycyA9IHNldDtcbiAgICB9XG4gICAgcHVibGljIGdldCBJbmRleCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBCdWZmZXJBdHRyaWJzRGF0YXtcbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJzLG51bUVsZW1lbnRzLGluZGljZXMpe1xuICAgICAgICB0aGlzLmF0dHJpYnMgPSBhdHRyaWJzO1xuICAgICAgICB0aGlzLm51bUVsZW1lbnRzID0gbnVtRWxlbWVudHM7XG4gICAgICAgIHRoaXMuaW5kaWNlcyA9IGluZGljZXM7XG4gICAgfVxuICAgIHB1YmxpYyByZWFkb25seSBpbmRpY2VzOkFycmF5PG51bWJlcj47XG4gICAgcHVibGljIHJlYWRvbmx5IG51bUVsZW1lbnRzOm51bWJlcjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXR0cmliczpPYmplY3Q7XG59XG4vKipcbiAqIHNoYWRlcuW3peWOglxuICovXG5jbGFzcyBTaGFkZXJGYWN0b3J5IHtcbiAgICBwdWJsaWMgX2dsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJvdGVjdGVkIF9zaGFkZXJEYXRhOiBBcnJheTxTaGFkZXJEYXRhPjtcbiAgICBpbml0KGdsKSB7XG4gICAgICAgIHRoaXMuX2dsID0gZ2w7XG4gICAgICAgIHRoaXMuX3NoYWRlckRhdGEgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bkuIDkuKpzaGFkZXJEYXRhXG4gICAgICogQHBhcmFtIGluZGV4IFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRTaGFyZURhdGFCeUluZGV4KGluZGV4KTogU2hhZGVyRGF0YSB7XG4gICAgICAgIHZhciByZXQ6IFNoYWRlckRhdGE7XG4gICAgICAgIHRoaXMuX3NoYWRlckRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUuSW5kZXggPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXQgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6I635Y+W5LiA5Liqc2hhZGVyRGF0YVxuICAgICAqIEBwYXJhbSBnbElEIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRTaGFyZURhdGFCeUdsSUQoZ2xJRCk6IFNoYWRlckRhdGEge1xuICAgICAgICB2YXIgcmV0OiBTaGFkZXJEYXRhO1xuICAgICAgICB0aGlzLl9zaGFkZXJEYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLnNwR2xJRCA9PSBnbElEKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOeUn+aIkOS4gOS4qnNoYWRlckRhdGFcbiAgICAgKiBAcGFyYW0gR0xJRCBcbiAgICAgKiBAcGFyYW0gdGV4dHVyZVVuaXQgXG4gICAgICogQHBhcmFtIFVTZXQgXG4gICAgICogQHBhcmFtIEFTZXQgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVNoYWRlckRhdGEoR0xJRCk6IFNoYWRlckRhdGEge1xuICAgICAgICB2YXIgcmV0ID0gdGhpcy5nZXRTaGFyZURhdGFCeUdsSUQoR0xJRCk7XG4gICAgICAgIGlmIChyZXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fc2hhZGVyRGF0YS5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgcmVzOiBTaGFkZXJEYXRhID0gbmV3IFNoYWRlckRhdGEoR0xJRCwgaW5kZXgpO1xuICAgICAgICAgICAgdGhpcy5fc2hhZGVyRGF0YS5wdXNoKHJlcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICogXG4gICAgKiBAcGFyYW0gc2hhZGVyVHlwZSBzaGFkZXLnmoTnsbvlnosgMeS7o+ihqOmhtueCueedgOiJsuWZqCAy5Luj6KGo5YOP57Sg552A6Imy5ZmoXG4gICAgKiBAcGFyYW0gc2hhZGVyU291cmNlIHNoYWRlcueahOa6kOeggVxuICAgICovXG4gICAgcHJpdmF0ZSBsb2FkU2hhZGVyKHNoYWRlclR5cGU6IFNoYWRlclR5cGUsIHNoYWRlclNvdXJjZSkge1xuICAgICAgICAvLyDliJvlu7rnnYDoibLlmahcbiAgICAgICAgdmFyIHNoYWRlcjtcbiAgICAgICAgaWYgKHNoYWRlclR5cGUgPT0gU2hhZGVyVHlwZS5GUkFHTUVOVCkge1xuICAgICAgICAgICAgc2hhZGVyID0gdGhpcy5fZ2wuY3JlYXRlU2hhZGVyKHRoaXMuX2dsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgICAgIH0gZWxzZSBpZiAoc2hhZGVyVHlwZSA9PSBTaGFkZXJUeXBlLlZFUlRFWCkge1xuICAgICAgICAgICAgc2hhZGVyID0gdGhpcy5fZ2wuY3JlYXRlU2hhZGVyKHRoaXMuX2dsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8g57yW6K+R552A6Imy5ZmoXG4gICAgICAgIHRoaXMuX2dsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNoYWRlclNvdXJjZSk7XG4gICAgICAgIHRoaXMuX2dsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgLy8g5Yik5pat57yW6K+R5piv5ZCm5oiQ5YqfXG4gICAgICAgIGlmICghdGhpcy5fZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgdGhpcy5fZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgICAgICBhbGVydCh0aGlzLl9nbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIHZlcnRleHRDb2RlIOmhtueCuXNoYWRlciBcbiAgICAgKiBAcGFyYW0gZnJhZ0NvZGUg54mH5q61c2hhZGVyXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVNoYWRlcih2ZXJ0ZXh0Q29kZTogc3RyaW5nID0gdmVydGV4dEJhc2VDb2RlLCBmcmFnQ29kZTogc3RyaW5nID0gZnJhZ0Jhc2VDb2RlKTogYW55IHtcbiAgICAgICAgLy8g5LuOIERPTSDkuIrliJvlu7rlr7nlupTnmoTnnYDoibLlmahcbiAgICAgICAgdmFyIHZlcnRleFNoYWRlciA9IHRoaXMubG9hZFNoYWRlcihTaGFkZXJUeXBlLlZFUlRFWCwgdmVydGV4dENvZGUpO1xuICAgICAgICB2YXIgZnJhZ21lbnRTaGFkZXIgPSB0aGlzLmxvYWRTaGFkZXIoU2hhZGVyVHlwZS5GUkFHTUVOVCwgZnJhZ0NvZGUpO1xuXG4gICAgICAgIC8vIOWIm+W7uueoi+W6j+W5tui/nuaOpeedgOiJsuWZqFxuICAgICAgICB2YXIgc2hhZGVyR0xJRCA9IHRoaXMuX2dsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgdGhpcy5fZ2wuYXR0YWNoU2hhZGVyKHNoYWRlckdMSUQsIHZlcnRleFNoYWRlcik7XG4gICAgICAgIHRoaXMuX2dsLmF0dGFjaFNoYWRlcihzaGFkZXJHTElELCBmcmFnbWVudFNoYWRlcik7XG5cbiAgICAgICAgdGhpcy5fZ2wubGlua1Byb2dyYW0oc2hhZGVyR0xJRCk7XG4gICAgICAgIC8vIOi/nuaOpeWksei0peeahOajgOa1i1xuICAgICAgICBpZiAoIXRoaXMuX2dsLmdldFByb2dyYW1QYXJhbWV0ZXIoc2hhZGVyR0xJRCwgdGhpcy5fZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgICAgICBhbGVydChcIkZhaWxlZCB0byBzZXR1cCBzaGFkZXJzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaGFkZXJHTElEO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBvbkNyZWF0ZVNoYWRlcigpOiB2b2lkIHtcblxuICAgIH1cbiAgICBwdWJsaWMgZGVzdHJveVNoZGVyKHNoYWRlclByb2dyYW0pOiB2b2lkIHtcblxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQXR0cmliU2V0dGVyKGluZGV4KSB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgICAgIGlmIChiLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZ2wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4KTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGIudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYjRmdihpbmRleCwgYi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliM2Z2KGluZGV4LCBiLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWIyZnYoaW5kZXgsIGIudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnZlcnRleEF0dHJpYjFmdihpbmRleCwgYi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGhlIGxlbmd0aCBvZiBhIGZsb2F0IGNvbnN0YW50IHZhbHVlIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA0IScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGIuYnVmZmVyKTtcbiAgICAgICAgICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShpbmRleCk7XG4gICAgICAgICAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihpbmRleCwgYi5udW1Db21wb25lbnRzIHx8IGIuc2l6ZSwgYi50eXBlIHx8IGdsLkZMT0FULCBiLm5vcm1hbGl6ZSB8fCBmYWxzZSwgYi5zdHJpZGUgfHwgMCwgYi5vZmZzZXQgfHwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHByaXZhdGUgY3JlYXRlQXR0cmlidXRlU2V0dGVycyhzaGFkZXJEYXRhOiBTaGFkZXJEYXRhKTogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0ge1xuICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcbiAgICAgICAgdmFyIHByb2dyYW0gPSBzaGFkZXJEYXRhLnNwR2xJRDtcbiAgICAgICAgY29uc3QgYXR0cmliU2V0dGVyczogeyBbaW5kZXg6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG51bUF0dHJpYnMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IG51bUF0dHJpYnM7ICsraWkpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYkluZm8gPSBnbC5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaWkpO1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJJbmZvKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIGF0dHJpYkluZm8ubmFtZSk7XG4gICAgICAgICAgICBhdHRyaWJTZXR0ZXJzW2F0dHJpYkluZm8ubmFtZV0gPSB0aGlzLmNyZWF0ZUF0dHJpYlNldHRlcihpbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0dHJpYlNldHRlcnM7XG4gICAgfVxuICAgIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIGJpbmQgcG9pbnQgZm9yIGEgZ2l2ZW4gc2FtcGxlciB0eXBlXG4gICAqL1xuICAgIHByaXZhdGUgZ2V0QmluZFBvaW50Rm9yU2FtcGxlclR5cGUoZ2wsIHR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLlNBTVBMRVJfMkQpIHJldHVybiBnbC5URVhUVVJFXzJEOyAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl9DVUJFKSByZXR1cm4gZ2wuVEVYVFVSRV9DVUJFX01BUDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGEgc2V0dGVyIGZvciBhIHVuaWZvcm0gb2YgdGhlIGdpdmVuIHByb2dyYW0gd2l0aCBpdCdzXG4gICAgICAgKiBsb2NhdGlvbiBlbWJlZGRlZCBpbiB0aGUgc2V0dGVyLlxuICAgICAgICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW1cbiAgICAgICAqIEBwYXJhbSB7V2ViR0xVbmlmb3JtSW5mb30gdW5pZm9ybUluZm9cbiAgICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gdGhlIGNyZWF0ZWQgc2V0dGVyLlxuICAgICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVVbmlmb3JtU2V0dGVyKHVuaWZvcm1JbmZvLCBzaGFkZXJEYXRhOiBTaGFkZXJEYXRhKSB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xuICAgICAgICB2YXIgcHJvZ3JhbSA9IHNoYWRlckRhdGEuc3BHbElEO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCB1bmlmb3JtSW5mby5uYW1lKTtcbiAgICAgICAgY29uc3QgdHlwZSA9IHVuaWZvcm1JbmZvLnR5cGU7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoaXMgdW5pZm9ybSBpcyBhbiBhcnJheVxuICAgICAgICBjb25zdCBpc0FycmF5ID0gKHVuaWZvcm1JbmZvLnNpemUgPiAxICYmIHVuaWZvcm1JbmZvLm5hbWUuc3Vic3RyKC0zKSA9PT0gJ1swXScpO1xuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVQgJiYgaXNBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFmdihsb2NhdGlvbiwgdik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFmKGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX1ZFQzIpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0yZnYobG9jYXRpb24sIHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfVkVDMykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTNmdihsb2NhdGlvbiwgdik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVF9WRUM0KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtNGZ2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVCAmJiBpc0FycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMWl2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVF9WRUMyKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMml2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVF9WRUMzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtM2l2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLklOVF9WRUM0KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtNGl2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0wpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0xaXYobG9jYXRpb24sIHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuQk9PTF9WRUMyKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBnbC51bmlmb3JtMml2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0xfVkVDMykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybTNpdihsb2NhdGlvbiwgdik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSBnbC5CT09MX1ZFQzQpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfTUFUMikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDJmdihsb2NhdGlvbiwgZmFsc2UsIHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfTUFUMykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDNmdihsb2NhdGlvbiwgZmFsc2UsIHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfTUFUNCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihsb2NhdGlvbiwgZmFsc2UsIHYpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHR5cGUgPT09IGdsLlNBTVBMRVJfMkQgfHwgdHlwZSA9PT0gZ2wuU0FNUExFUl9DVUJFKSAmJiBpc0FycmF5KSB7XG4gICAgICAgICAgICBjb25zdCB1bml0cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IHVuaWZvcm1JbmZvLnNpemU7ICsraWkpIHtcbiAgICAgICAgICAgICAgICB1bml0cy5wdXNoKHNoYWRlckRhdGEuYWRkVGV4dHVyZVVuaXQoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGJpbmRQb2ludCwgdW5pdHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHRleHR1cmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0xaXYobG9jYXRpb24sIHVuaXRzKTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZXMuZm9yRWFjaChmdW5jdGlvbiAodGV4dHVyZSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyB1bml0c1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoYmluZFBvaW50LCB0ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0odGhpcy5nZXRCaW5kUG9pbnRGb3JTYW1wbGVyVHlwZShnbCwgdHlwZSksIHVuaXRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl8yRCB8fCB0eXBlID09PSBnbC5TQU1QTEVSX0NVQkUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYmluZFBvaW50LCB1bml0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0xaShsb2NhdGlvbiwgdW5pdCk7XG4gICAgICAgICAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyB1bml0KTtcbiAgICAgICAgICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoYmluZFBvaW50LCB0ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSh0aGlzLmdldEJpbmRQb2ludEZvclNhbXBsZXJUeXBlKGdsLCB0eXBlKSwgc2hhZGVyRGF0YS5hZGRUZXh0dXJlVW5pdCgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyAoJ3Vua25vd24gdHlwZTogMHgnICsgdHlwZS50b1N0cmluZygxNikpOyAvLyB3ZSBzaG91bGQgbmV2ZXIgZ2V0IGhlcmUuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdW5pZm9ybeWPmOmHj+iuvue9ruWZqFxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVW5pZm9ybVNldHRlcnMoc2hhZGVyRGF0YTogU2hhZGVyRGF0YSk6IHsgW2luZGV4OiBzdHJpbmddOiBGdW5jdGlvbiB9IHtcbiAgICAgICAgdmFyIHByb2dyYW0gPSBzaGFkZXJEYXRhLnNwR2xJRDtcbiAgICAgICAgbGV0IGdsID0gdGhpcy5fZ2w7XG5cblxuICAgICAgICB2YXIgdW5pZm9ybVNldHRlcnM6IHsgW2luZGV4OiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge31cbiAgICAgICAgY29uc3QgbnVtVW5pZm9ybXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkFDVElWRV9VTklGT1JNUyk7XG5cbiAgICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IG51bVVuaWZvcm1zOyArK2lpKSB7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtSW5mbyA9IGdsLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgaWkpO1xuICAgICAgICAgICAgaWYgKCF1bmlmb3JtSW5mbykge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IG5hbWUgPSB1bmlmb3JtSW5mby5uYW1lO1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBhcnJheSBzdWZmaXguXG4gICAgICAgICAgICBpZiAobmFtZS5zdWJzdHIoLTMpID09PSAnWzBdJykge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigwLCBuYW1lLmxlbmd0aCAtIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc2V0dGVyID0gdGhpcy5jcmVhdGVVbmlmb3JtU2V0dGVyKHVuaWZvcm1JbmZvLCBzaGFkZXJEYXRhKTtcbiAgICAgICAgICAgIHVuaWZvcm1TZXR0ZXJzW25hbWVdID0gc2V0dGVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmlmb3JtU2V0dGVycztcbiAgICB9XG5cblxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65LiA5Liqc2hhZGVyXG4gICAgICogQHBhcmFtIHZzIFxuICAgICAqIEBwYXJhbSBmcyBcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlUHJvZ3JhbUluZm8odnM6IHN0cmluZywgZnM6IHN0cmluZyk6IFNoYWRlckRhdGEge1xuICAgICAgICB2YXIgZ2xJRCA9IHRoaXMuY3JlYXRlU2hhZGVyKHZzLCBmcyk7XG4gICAgICAgIHZhciBzaGFkZXJEYXRhID0gdGhpcy5jcmVhdGVTaGFkZXJEYXRhKGdsSUQpO1xuICAgICAgICBjb25zdCB1bmlmb3JtU2V0dGVycyA9IHRoaXMuY3JlYXRlVW5pZm9ybVNldHRlcnMoc2hhZGVyRGF0YSk7XG4gICAgICAgIGNvbnN0IGF0dHJpYlNldHRlcnMgPSB0aGlzLmNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMoc2hhZGVyRGF0YSk7XG4gICAgICAgIHNoYWRlckRhdGEudW5pU2V0dGVycyA9IHVuaWZvcm1TZXR0ZXJzO1xuICAgICAgICBzaGFkZXJEYXRhLmF0dHJTZXR0ZXJzID0gYXR0cmliU2V0dGVycztcblxuICAgICAgICByZXR1cm4gc2hhZGVyRGF0YTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXRTaGFkZXJQcm9ncmFtKGluZGV4KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hhcmVEYXRhQnlJbmRleChpbmRleCkuc3BHbElEO1xuICAgIH1cbiAgICAvL+iuvue9rmF0dHJpYnV0ZeWPmOmHj1xuICAgIHB1YmxpYyBzZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhhdHRyaWJTZXR0ZXJzOiB7IFtpbmRleDogc3RyaW5nXTogRnVuY3Rpb24gfSwgYnVmZmVycykge1xuICAgICAgICB2YXIgZ2wgPSB0aGlzLl9nbDtcbiAgICAgICAgdmFyIGF0dHJpYnMgPSBidWZmZXJzLmF0dHJpYnM7XG4gICAgICAgIHZhciBzZXR0ZXJzID0gYXR0cmliU2V0dGVycztcbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlicykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGVyID0gc2V0dGVyc1tuYW1lXTtcbiAgICAgICAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgICAgICAgICBzZXR0ZXIoYXR0cmlic1tuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciAg57uR5a6aYXR0cmlidXRl5Y+Y6YeP5aSx6LSlLS0tLS1cIixuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlcnMuaW5kaWNlcykge1xuICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVycy5pbmRpY2VzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL+iuvue9rnVuaWZvcm3lj5jph49cbiAgICBwdWJsaWMgc2V0VW5pZm9ybXModW5pZm9ybVNldHRlcnM6IHsgW2luZGV4OiBzdHJpbmddOiBGdW5jdGlvbiB9LCAuLi52YWx1ZXMpIHtcbiAgICAgICAgdmFyIHNldHRlcnMgPSB1bmlmb3JtU2V0dGVycztcbiAgICAgICAgZm9yIChjb25zdCB1bmlmb3JtcyBvZiB2YWx1ZXMpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHVuaWZvcm1zKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGVyID0gc2V0dGVyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldHRlcih1bmlmb3Jtc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZXJyb3IgIOe7keWumnVuaWZvcm3lj5jph4/lpLHotKUtLS0tLS1cIixuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL+WQr+WKqOmhtueCueedgOiJsuWZqOe7mOWItlxuICAgIHB1YmxpYyBkcmF3QnVmZmVySW5mbyhidWZmZXJJbmZvLCBwcmltaXRpdmVUeXBlPywgY291bnQ/LCBvZmZzZXQ/KSB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gYnVmZmVySW5mby5pbmRpY2VzO1xuICAgICAgICBwcmltaXRpdmVUeXBlID0gcHJpbWl0aXZlVHlwZSA9PT0gdW5kZWZpbmVkID8gZ2wuVFJJQU5HTEVTIDogcHJpbWl0aXZlVHlwZTtcbiAgICAgICAgY29uc3QgbnVtRWxlbWVudHMgPSBjb3VudCA9PT0gdW5kZWZpbmVkID8gYnVmZmVySW5mby5udW1FbGVtZW50cyA6IGNvdW50O1xuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgPT09IHVuZGVmaW5lZCA/IDAgOiBvZmZzZXQ7XG4gICAgICAgIGlmIChpbmRpY2VzKSB7XG4gICAgICAgICAgICBnbC5kcmF3RWxlbWVudHMocHJpbWl0aXZlVHlwZSwgbnVtRWxlbWVudHMsIGdsLlVOU0lHTkVEX1NIT1JULCBvZmZzZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyhwcmltaXRpdmVUeXBlLCBvZmZzZXQsIG51bUVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vZXh0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQWRkIGBwdXNoYCB0byBhIHR5cGVkIGFycmF5LiBJdCBqdXN0IGtlZXBzIGEgJ2N1cnNvcidcbiAgICAvLyBhbmQgYWxsb3dzIHVzZSB0byBgcHVzaGAgdmFsdWVzIGludG8gdGhlIGFycmF5IHNvIHdlXG4gICAgLy8gZG9uJ3QgaGF2ZSB0byBtYW51YWxseSBjb21wdXRlIG9mZnNldHNcbiAgICBwdWJsaWMgYXVnbWVudFR5cGVkQXJyYXkodHlwZWRBcnJheSwgbnVtQ29tcG9uZW50cykge1xuICAgICAgICBsZXQgY3Vyc29yID0gMDtcbiAgICAgICAgdHlwZWRBcnJheS5wdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaWkgPSAwOyBpaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraWkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGFyZ3VtZW50c1tpaV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgfHwgKHZhbHVlLmJ1ZmZlciAmJiB2YWx1ZS5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgamogPSAwOyBqaiA8IHZhbHVlLmxlbmd0aDsgKytqaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZWRBcnJheVtjdXJzb3IrK10gPSB2YWx1ZVtqal07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0eXBlZEFycmF5W2N1cnNvcisrXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdHlwZWRBcnJheS5yZXNldCA9IGZ1bmN0aW9uIChvcHRfaW5kZXgpIHtcbiAgICAgICAgICAgIGN1cnNvciA9IG9wdF9pbmRleCB8fCAwO1xuICAgICAgICB9O1xuICAgICAgICB0eXBlZEFycmF5Lm51bUNvbXBvbmVudHMgPSBudW1Db21wb25lbnRzO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodHlwZWRBcnJheSwgJ251bUVsZW1lbnRzJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoIC8gdGhpcy5udW1Db21wb25lbnRzIHwgMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHlwZWRBcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIGNyZWF0ZXMgYSB0eXBlZCBhcnJheSB3aXRoIGEgYHB1c2hgIGZ1bmN0aW9uIGF0dGFjaGVkXG4gICAgKiBzbyB0aGF0IHlvdSBjYW4gZWFzaWx5ICpwdXNoKiB2YWx1ZXMuXG4gICAgKlxuICAgICogYHB1c2hgIGNhbiB0YWtlIG11bHRpcGxlIGFyZ3VtZW50cy4gSWYgYW4gYXJndW1lbnQgaXMgYW4gYXJyYXkgZWFjaCBlbGVtZW50XG4gICAgKiBvZiB0aGUgYXJyYXkgd2lsbCBiZSBhZGRlZCB0byB0aGUgdHlwZWQgYXJyYXkuXG4gICAgKlxuICAgICogRXhhbXBsZTpcbiAgICAqXG4gICAgKiAgICAgbGV0IGFycmF5ID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCAyKTsgIC8vIGNyZWF0ZXMgYSBGbG9hdDMyQXJyYXkgd2l0aCA2IHZhbHVlc1xuICAgICogICAgIGFycmF5LnB1c2goMSwgMiwgMyk7XG4gICAgKiAgICAgYXJyYXkucHVzaChbNCwgNSwgNl0pO1xuICAgICogICAgIC8vIGFycmF5IG5vdyBjb250YWlucyBbMSwgMiwgMywgNCwgNSwgNl1cbiAgICAqXG4gICAgKiBBbHNvIGhhcyBgbnVtQ29tcG9uZW50c2AgYW5kIGBudW1FbGVtZW50c2AgcHJvcGVydGllcy5cbiAgICAqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gbnVtQ29tcG9uZW50cyBudW1iZXIgb2YgY29tcG9uZW50c1xuICAgICogQHBhcmFtIHtudW1iZXJ9IG51bUVsZW1lbnRzIG51bWJlciBvZiBlbGVtZW50cy4gVGhlIHRvdGFsIHNpemUgb2YgdGhlIGFycmF5IHdpbGwgYmUgYG51bUNvbXBvbmVudHMgKiBudW1FbGVtZW50c2AuXG4gICAgKiBAcGFyYW0ge2NvbnN0cnVjdG9yfSBvcHRfdHlwZSBBIGNvbnN0cnVjdG9yIGZvciB0aGUgdHlwZS4gRGVmYXVsdCA9IGBGbG9hdDMyQXJyYXlgLlxuICAgICogQHJldHVybiB7QXJyYXlCdWZmZXJ9IEEgdHlwZWQgYXJyYXkuXG4gICAgKiBAbWVtYmVyT2YgbW9kdWxlOndlYmdsLXV0aWxzXG4gICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheShudW1Db21wb25lbnRzLCBudW1FbGVtZW50cywgb3B0X3R5cGU/KSB7XG4gICAgICAgIGNvbnN0IFR5cGUgPSBvcHRfdHlwZSB8fCBGbG9hdDMyQXJyYXk7XG4gICAgICAgIHJldHVybiB0aGlzLmF1Z21lbnRUeXBlZEFycmF5KG5ldyBUeXBlKG51bUNvbXBvbmVudHMgKiBudW1FbGVtZW50cyksIG51bUNvbXBvbmVudHMpO1xuICAgIH1cbiAgICBwdWJsaWMgZ2V0QXJyYXkoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5Lmxlbmd0aCA/IGFycmF5IDogYXJyYXkuZGF0YTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdGV4Y29vcmRSRSA9IC9jb29yZHx0ZXh0dXJlL2k7XG4gICAgcHVibGljIGNvbG9yUkUgPSAvY29sb3J8Y29sb3VyL2k7XG4gICAgcHVibGljIGd1ZXNzTnVtQ29tcG9uZW50c0Zyb21OYW1lKG5hbWUsIGxlbmd0aD8pIHtcbiAgICAgICAgbGV0IG51bUNvbXBvbmVudHM7XG4gICAgICAgIGlmICh0aGlzLnRleGNvb3JkUkUudGVzdChuYW1lKSkge1xuICAgICAgICAgICAgbnVtQ29tcG9uZW50cyA9IDI7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb2xvclJFLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgIG51bUNvbXBvbmVudHMgPSA0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbnVtQ29tcG9uZW50cyA9IDM7ICAvLyBwb3NpdGlvbiwgbm9ybWFscywgaW5kaWNlcyAuLi5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsZW5ndGggJSBudW1Db21wb25lbnRzID4gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IGd1ZXNzIG51bUNvbXBvbmVudHMgZm9yIGF0dHJpYnV0ZSAnJHtuYW1lfScuIFRyaWVkICR7bnVtQ29tcG9uZW50c30gYnV0ICR7bGVuZ3RofSB2YWx1ZXMgaXMgbm90IGV2ZW5seSBkaXZpc2libGUgYnkgJHtudW1Db21wb25lbnRzfS4gWW91IHNob3VsZCBzcGVjaWZ5IGl0LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bUNvbXBvbmVudHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE51bUNvbXBvbmVudHMoYXJyYXksIGFycmF5TmFtZSkge1xuICAgICAgICByZXR1cm4gYXJyYXkubnVtQ29tcG9uZW50cyB8fCBhcnJheS5zaXplIHx8IHRoaXMuZ3Vlc3NOdW1Db21wb25lbnRzRnJvbU5hbWUoYXJyYXlOYW1lLCB0aGlzLmdldEFycmF5KGFycmF5KS5sZW5ndGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHRyaWVzIHRvIGdldCB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGZyb20gYSBzZXQgb2YgYXJyYXlzLlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSBwb3NpdGlvbktleXMgPSBbJ3Bvc2l0aW9uJywgJ3Bvc2l0aW9ucycsICdhX3Bvc2l0aW9uJ107XG4gICAgcHVibGljIGdldE51bUVsZW1lbnRzRnJvbU5vbkluZGV4ZWRBcnJheXMoYXJyYXlzKSB7XG4gICAgICAgIGxldCBrZXk7XG4gICAgICAgIGZvciAoY29uc3QgayBvZiB0aGlzLnBvc2l0aW9uS2V5cykge1xuICAgICAgICAgICAgaWYgKGsgaW4gYXJyYXlzKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBrZXkgPSBrZXkgfHwgT2JqZWN0LmtleXMoYXJyYXlzKVswXTtcbiAgICAgICAgY29uc3QgYXJyYXkgPSBhcnJheXNba2V5XTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5nZXRBcnJheShhcnJheSkubGVuZ3RoO1xuICAgICAgICBjb25zdCBudW1Db21wb25lbnRzID0gdGhpcy5nZXROdW1Db21wb25lbnRzKGFycmF5LCBrZXkpO1xuICAgICAgICBjb25zdCBudW1FbGVtZW50cyA9IGxlbmd0aCAvIG51bUNvbXBvbmVudHM7XG4gICAgICAgIGlmIChsZW5ndGggJSBudW1Db21wb25lbnRzID4gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBudW1Db21wb25lbnRzICR7bnVtQ29tcG9uZW50c30gbm90IGNvcnJlY3QgZm9yIGxlbmd0aCAke2xlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVtRWxlbWVudHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEdMVHlwZUZvclR5cGVkQXJyYXkoZ2wsIHR5cGVkQXJyYXkpIHtcbiAgICAgICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpIHsgcmV0dXJuIGdsLkJZVEU7IH0gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgVWludDhBcnJheSkgeyByZXR1cm4gZ2wuVU5TSUdORURfQllURTsgfSAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBJbnQxNkFycmF5KSB7IHJldHVybiBnbC5TSE9SVDsgfSAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIFVpbnQxNkFycmF5KSB7IHJldHVybiBnbC5VTlNJR05FRF9TSE9SVDsgfSAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDMyQXJyYXkpIHsgcmV0dXJuIGdsLklOVDsgfSAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgVWludDMyQXJyYXkpIHsgcmV0dXJuIGdsLlVOU0lHTkVEX0lOVDsgfSAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7IHJldHVybiBnbC5GTE9BVDsgfSAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB0aHJvdyAndW5zdXBwb3J0ZWQgdHlwZWQgYXJyYXkgdHlwZSc7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyByZWFsbHkganVzdCBhIGd1ZXNzLiBUaG91Z2ggSSBjYW4ndCByZWFsbHkgaW1hZ2luZSB1c2luZ1xuICAgIC8vIGFueXRoaW5nIGVsc2U/IE1heWJlIGZvciBzb21lIGNvbXByZXNzaW9uP1xuICAgIHB1YmxpYyBnZXROb3JtYWxpemF0aW9uRm9yVHlwZWRBcnJheSh0eXBlZEFycmF5KSB7XG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50OEFycmF5KSB7IHJldHVybiB0cnVlOyB9ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgVWludDhBcnJheSkgeyByZXR1cm4gdHJ1ZTsgfSAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGlzQXJyYXlCdWZmZXIoYSkge1xuICAgICAgICByZXR1cm4gYS5idWZmZXIgJiYgYS5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlQnVmZmVyRnJvbVR5cGVkQXJyYXkoZ2wsIGFycmF5LCB0eXBlPywgZHJhd1R5cGU/KSB7XG4gICAgICAgIHR5cGUgPSB0eXBlIHx8IGdsLkFSUkFZX0JVRkZFUjtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgYnVmZmVyKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YSh0eXBlLCBhcnJheSwgZHJhd1R5cGUgfHwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBhbGxCdXRJbmRpY2VzKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5hbWUgIT09ICdpbmRpY2VzJztcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlTWFwcGluZyhvYmopIHtcbiAgICAgICAgY29uc3QgbWFwcGluZyA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZpbHRlcih0aGlzLmFsbEJ1dEluZGljZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgbWFwcGluZ1snYV8nICsga2V5XSA9IGtleTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtYXBwaW5nO1xuICAgIH1cblxuICAgIHB1YmxpYyBtYWtlVHlwZWRBcnJheShhcnJheSwgbmFtZSkge1xuICAgICAgICBpZiAodGhpcy5pc0FycmF5QnVmZmVyKGFycmF5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcnJheS5kYXRhICYmIHRoaXMuaXNBcnJheUJ1ZmZlcihhcnJheS5kYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyYXkpKSB7XG4gICAgICAgICAgICBhcnJheSA9IHtcbiAgICAgICAgICAgICAgICBkYXRhOiBhcnJheSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhcnJheS5udW1Db21wb25lbnRzKSB7XG4gICAgICAgICAgICBhcnJheS5udW1Db21wb25lbnRzID0gdGhpcy5ndWVzc051bUNvbXBvbmVudHNGcm9tTmFtZShuYW1lLCBhcnJheS5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0eXBlID0gYXJyYXkudHlwZTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2luZGljZXMnKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IFVpbnQxNkFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGVkQXJyYXkgPSB0aGlzLmNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoYXJyYXkubnVtQ29tcG9uZW50cywgYXJyYXkuZGF0YS5sZW5ndGggLyBhcnJheS5udW1Db21wb25lbnRzIHwgMCwgdHlwZSk7XG4gICAgICAgIHR5cGVkQXJyYXkucHVzaChhcnJheS5kYXRhKTtcbiAgICAgICAgcmV0dXJuIHR5cGVkQXJyYXk7XG4gICAgfVxuICAgIHB1YmxpYyBjcmVhdGVBdHRyaWJzRnJvbUFycmF5cyhnbCwgYXJyYXlzLCBvcHRfbWFwcGluZykge1xuICAgICAgICBjb25zdCBtYXBwaW5nID0gb3B0X21hcHBpbmcgfHwgdGhpcy5jcmVhdGVNYXBwaW5nKGFycmF5cyk7XG4gICAgICAgIGNvbnN0IGF0dHJpYnMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMobWFwcGluZykuZm9yRWFjaCgoYXR0cmliTmFtZSk9PiB7XG4gICAgICAgICAgICBjb25zdCBidWZmZXJOYW1lID0gbWFwcGluZ1thdHRyaWJOYW1lXTtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdBcnJheSA9IGFycmF5c1tidWZmZXJOYW1lXTtcbiAgICAgICAgICAgIGlmIChvcmlnQXJyYXkudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJzW2F0dHJpYk5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogb3JpZ0FycmF5LnZhbHVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5ID0gdGhpcy5tYWtlVHlwZWRBcnJheShvcmlnQXJyYXksIGJ1ZmZlck5hbWUpO1xuICAgICAgICAgICAgICAgIGF0dHJpYnNbYXR0cmliTmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogdGhpcy5jcmVhdGVCdWZmZXJGcm9tVHlwZWRBcnJheShnbCwgYXJyYXkpLFxuICAgICAgICAgICAgICAgICAgICBudW1Db21wb25lbnRzOiBvcmlnQXJyYXkubnVtQ29tcG9uZW50cyB8fCBhcnJheS5udW1Db21wb25lbnRzIHx8IHRoaXMuZ3Vlc3NOdW1Db21wb25lbnRzRnJvbU5hbWUoYnVmZmVyTmFtZSksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2V0R0xUeXBlRm9yVHlwZWRBcnJheShnbCwgYXJyYXkpLFxuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemU6IHRoaXMuZ2V0Tm9ybWFsaXphdGlvbkZvclR5cGVkQXJyYXkoYXJyYXkpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXR0cmlicztcbiAgICB9XG4gICAgcHVibGljIGNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzKGFycmF5cywgb3B0X21hcHBpbmc/KSB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xuICAgICAgICBjb25zdCBidWZmZXJJbmZvOiBhbnkgPSB7XG4gICAgICAgICAgICBhdHRyaWJzOiB0aGlzLmNyZWF0ZUF0dHJpYnNGcm9tQXJyYXlzKGdsLCBhcnJheXMsIG9wdF9tYXBwaW5nKSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGluZGljZXMgPSBhcnJheXMuaW5kaWNlcztcbiAgICAgICAgaWYgKGluZGljZXMpIHtcbiAgICAgICAgICAgIGluZGljZXMgPSB0aGlzLm1ha2VUeXBlZEFycmF5KGluZGljZXMsICdpbmRpY2VzJyk7XG4gICAgICAgICAgICBidWZmZXJJbmZvLmluZGljZXMgPSB0aGlzLmNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCBpbmRpY2VzLCBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUik7XG4gICAgICAgICAgICBidWZmZXJJbmZvLm51bUVsZW1lbnRzID0gaW5kaWNlcy5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXJJbmZvLm51bUVsZW1lbnRzID0gdGhpcy5nZXROdW1FbGVtZW50c0Zyb21Ob25JbmRleGVkQXJyYXlzKGFycmF5cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXJBdHRyaWJzRGF0YShidWZmZXJJbmZvLmF0dHJpYnMsYnVmZmVySW5mby5udW1FbGVtZW50cyxidWZmZXJJbmZvLmluZGljZXMpO1xuICAgIH1cbn1cblxuZXhwb3J0IHZhciBHX1NoYWRlckZhY3RvcnkgPSBuZXcgU2hhZGVyRmFjdG9yeSgpO1xuXG5leHBvcnQgY2xhc3MgU2hhZGVyIHtcbiAgICBwcml2YXRlIGFfcG9zaXRpb25fbG9jOy8v6aG254K55bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSBhX25vcm1hbF9sb2M7Ly/ms5Xnur/lsZ7mgKfnmoTkvY3nva5cbiAgICBwcml2YXRlIGFfdXZfbG9jOy8vdXblsZ7mgKfkvY3nva5cbiAgICBwcml2YXRlIGFfdGFuZ2VudF9sb2M7Ly/liIfnur/lsZ7mgKfkvY3nva5cbiAgICBwcml2YXRlIHVfY29sb3JfbG9jOy8v5YWJ54Wn5bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSB1X2NvbG9yX2Rpcl9sb2M7Ly/lhYnnhafmlrnlkJHlsZ7mgKfkvY3nva5cbiAgICBwcml2YXRlIHVfTVZNYXRyaXhfbG9jOy8v5qih5Z6L6KeG5Y+j55+p6Zi15bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSB1X1BNYXRyaXhfbG9jOy8v6YCP6KeG5oqV5b2x55+p6Zi15bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSB1X01NYXRyaXhfbG9jOy8v5qih5Z6L55+p6Zi15bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSB1X1ZNYXRyaXhfbG9jOy8v6KeG5Y+j55+p6Zi15bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSB1X3RleENvb3JkX2xvYzsvL+e6ueeQhuWxnuaAp+S9jee9rlxuICAgIHByaXZhdGUgdV9za3lib3hfbG9jOy8v5aSp56m655uS5bGe5oCn5L2N572uXG4gICAgcHJpdmF0ZSB1X3B2bV9tYXRyaXhfbG9jOy8v5oqV5b2x6KeG5Y+j5qih5Z6L55+p6Zi1XG4gICAgcHJpdmF0ZSB1X3B2bV9tYXRyaXhfaW52ZXJzZV9sb2M7Ly/mqKHlnovop4blm77mipXlvbHnmoTpgIbnn6npmLVcblxuICAgIHB1YmxpYyBVU0VfTk9STUFMOiBib29sZWFuID0gZmFsc2U7Ly/ms5Xnur9cbiAgICBwdWJsaWMgVVNFX0xJR0hUOiBib29sZWFuID0gZmFsc2U7Ly/lhYnnhadcbiAgICBwdWJsaWMgVVNFX1NLWUJPWDogYm9vbGVhbiA9IGZhbHNlOy8v5aSp56m655uSXG5cblxuICAgIHB1YmxpYyBpc1Nob3dEZWJ1Z0xvZzogYm9vbGVhbjsvL+aYr+WQpuaYvuekuuaKpemUmeaXpeW/l1xuXG4gICAgcHJvdGVjdGVkIF9nbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIHByb3RlY3RlZCBfc3BHTElEO1xuICAgIGNvbnN0cnVjdG9yKGdsLCBnbElEKSB7XG4gICAgICAgIHRoaXMuX2dsID0gZ2w7XG4gICAgICAgIHRoaXMuX3NwR0xJRCA9IGdsSUQ7XG4gICAgICAgIHRoaXMub25DcmVhdGVTaGFkZXIoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog5Yib5bu65LiA5Liqc2hhZGVyXG4gICAgICogQHBhcmFtIHZlcnQgXG4gICAgICogQHBhcmFtIGZyYWcgXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZSh2ZXJ0LCBmcmFnKTogU2hhZGVyIHtcbiAgICAgICAgdmFyIGdsSUQgPSBHX1NoYWRlckZhY3RvcnkuY3JlYXRlU2hhZGVyKHZlcnQsIGZyYWcpO1xuICAgICAgICByZXR1cm4gbmV3IFNoYWRlcihHX1NoYWRlckZhY3RvcnkuX2dsLCBnbElEKVxuICAgIH1cbiAgICBwcm90ZWN0ZWQgb25DcmVhdGVTaGFkZXIoKTogdm9pZCB7XG4gICAgICAgIHZhciBzaGFkZXJQcm9ncmFtR0xJRCA9IHRoaXMuX3NwR0xJRDtcbiAgICAgICAgdmFyIGdsID0gdGhpcy5fZ2w7XG4gICAgICAgIHRoaXMuYV9wb3NpdGlvbl9sb2MgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuUE9TSVRJT04pO1xuICAgICAgICB0aGlzLmFfbm9ybWFsX2xvYyA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5OT1JNQUwpO1xuICAgICAgICB0aGlzLmFfdXZfbG9jID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLlVWKTtcbiAgICAgICAgdGhpcy5hX3RhbmdlbnRfbG9jID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLlRBTkdFTlQpO1xuICAgICAgICB0aGlzLnVfY29sb3JfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5DT0xPUik7XG4gICAgICAgIHRoaXMudV9jb2xvcl9kaXJfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5DT0xPUl9ESVIpO1xuICAgICAgICB0aGlzLnVfTVZNYXRyaXhfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5NVk1hdHJpeCk7XG4gICAgICAgIHRoaXMudV9QTWF0cml4X2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuUE1hdHJpeCk7XG4gICAgICAgIHRoaXMudV90ZXhDb29yZF9sb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLlRFWF9DT09SRCk7XG4gICAgICAgIHRoaXMudV9za3lib3hfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5TS1lCT1gpO1xuICAgICAgICB0aGlzLnVfcHZtX21hdHJpeF9sb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbUdMSUQsIGdsdmVydF9hdHRyX3NlbWFudGljLlBNVl9NQVRSSVgpO1xuICAgICAgICB0aGlzLnVfcHZtX21hdHJpeF9pbnZlcnNlX2xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgZ2x2ZXJ0X2F0dHJfc2VtYW50aWMuUE1WX01BVFJJWF9JTlZFUlNFKTtcbiAgICAgICAgdGhpcy51X01NYXRyaXhfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5NTWF0cml4KTtcbiAgICAgICAgdGhpcy51X1ZNYXRyaXhfbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW1HTElELCBnbHZlcnRfYXR0cl9zZW1hbnRpYy5WTWF0cml4KVxuICAgIH1cbiAgICBwdWJsaWMgZ2V0Q3VzdG9tQXR0cmlidXRlTG9jYXRpb24odmFyTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLl9zcEdMSUQsIHZhck5hbWUpXG4gICAgfVxuXG4gICAgcHVibGljIGdldEdMSUQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zcEdMSUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5qOA5p+lc2hhZGVy5Lit5Y+Y6YeP55qE5L2N572u5piv5ZCm5pyJ5pWIXG4gICAgICogQHBhcmFtIGxvYyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrbG9jVmFsaWQobG9jLCB0YWdOYW1lKTogYm9vbGVhbiB7XG4gICAgICAgIHZhciByZXN1bHQgPSAhKGxvYyA9PSBudWxsIHx8IGxvYyA8IDApO1xuICAgICAgICBpZiAoIXJlc3VsdCAmJiB0aGlzLmlzU2hvd0RlYnVnTG9nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyLS0tLS0tLVwiLCBsb2MsIHRhZ05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHByaXZhdGUgY2hlY2tHTElEVmFsaWQoZ2xJRCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKGdsSUQgPT0gbnVsbCB8fCBnbElEIDw9IDApID8gZmFsc2UgOiB0cnVlO1xuICAgIH1cblxuICAgIC8v5ZCv55So5bGe5oCn5LuO57yT5Yay5Yy65Lit6I635Y+W5pWw5o2u55qE5Yqf6IO9XG4gICAgcHJpdmF0ZSBlbmFibGVWZXJ0ZXhBdHRyaWJ1dGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy5hX3Bvc2l0aW9uX2xvYywgXCJhX3Bvc2l0aW9uX2xvY1wiKSkgey8vIOiuvuWumuS4uuaVsOe7hOexu+Wei+eahOWPmOmHj+aVsOaNrlxuICAgICAgICAgICAgdGhpcy5fZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hX3Bvc2l0aW9uX2xvYyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfdXZfbG9jLCBcImFfdXZfbG9jXCIpKSB7XG4gICAgICAgICAgICB0aGlzLl9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfdXZfbG9jKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMuYV9ub3JtYWxfbG9jLCBcImFfbm9ybWFsX2xvY1wiKSkge1xuICAgICAgICAgICAgdGhpcy5fZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hX25vcm1hbF9sb2MpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgLy9zaGFkZXLkuK3miYDmnInnmoRhdHRyaWJ1dGVz5Y+Y6YePXG4gICAgcHJpdmF0ZSB1cGRhdGVBdHRyaWJ1dGVzKHNoYWRlclByb2dyYW1HTElEKTogdm9pZCB7XG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xuICAgICAgICBjb25zdCBudW1BdHRyaWJzID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihzaGFkZXJQcm9ncmFtR0xJRCwgZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgICAgICBmb3IgKGxldCBpaSA9IDA7IGlpIDwgbnVtQXR0cmliczsgKytpaSkge1xuICAgICAgICAgICAgY29uc3QgYXR0cmliSW5mbyA9IGdsLmdldEFjdGl2ZUF0dHJpYihzaGFkZXJQcm9ncmFtR0xJRCwgaWkpO1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJJbmZvKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImF0dHJpYkluZm8tLVwiLCBhdHRyaWJJbmZvLm5hbWUpO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtR0xJRCwgYXR0cmliSW5mby5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8v5r+A5rS7c2hhZGVyXG4gICAgcHVibGljIGFjdGl2ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoKTtcbiAgICAgICAgdGhpcy5lbmFibGVWZXJ0ZXhBdHRyaWJ1dGUoKTtcbiAgICAgICAgdGhpcy5fZ2wudXNlUHJvZ3JhbSh0aGlzLl9zcEdMSUQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY29sb3Ig5YWJ55qE6aKc6ImyXG4gICAgICogQHBhcmFtIGRpcmVjdGlvbiDlhYnnmoTmlrnlkJFcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VXNlTGlnaHQoY29sb3IgPSBbMC4yLCAxLCAwLjIsIDFdLCBkaXJlY3Rpb24gPSBbMC41LCAwLjcsIDFdKTogdm9pZCB7XG5cbiAgICAgICAgaWYgKCF0aGlzLlVTRV9MSUdIVCB8fCAhdGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMudV9jb2xvcl9sb2MsIFwidV9jb2xvcl9sb2NcIikgfHwgIXRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLnVfY29sb3JfZGlyX2xvYywgXCJ1X2NvbG9yX2Rpcl9sb2NcIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBTZXQgdGhlIGNvbG9yIHRvIHVzZVxuICAgICAgICB0aGlzLl9nbC51bmlmb3JtNGZ2KHRoaXMudV9jb2xvcl9sb2MsIGNvbG9yKTsgLy8gZ3JlZW5cblxuICAgICAgICAvLyBzZXQgdGhlIGxpZ2h0IGRpcmVjdGlvbi5cbiAgICAgICAgdGhpcy5fZ2wudW5pZm9ybTNmdih0aGlzLnVfY29sb3JfZGlyX2xvYywgZGlyZWN0aW9uKTtcbiAgICB9XG4gICAgcHVibGljIHNldFVzZVNreUJveCh1X3B2bV9tYXRyaXhfaW52ZXJzZSk6IHZvaWQge1xuXG4gICAgICAgIHZhciBnbCA9IHRoaXMuX2dsO1xuXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSB1bmlmb3Jtc1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KFxuICAgICAgICAgICAgdGhpcy51X3B2bV9tYXRyaXhfaW52ZXJzZV9sb2MsIGZhbHNlLFxuICAgICAgICAgICAgdV9wdm1fbWF0cml4X2ludmVyc2UpO1xuXG4gICAgICAgIC8vIFRlbGwgdGhlIHNoYWRlciB0byB1c2UgdGV4dHVyZSB1bml0IDAgZm9yIHVfc2t5Ym94XG4gICAgICAgIGdsLnVuaWZvcm0xaSh0aGlzLnVfc2t5Ym94X2xvYywgMCk7XG5cbiAgICAgICAgLy8gbGV0IG91ciBxdWFkIHBhc3MgdGhlIGRlcHRoIHRlc3QgYXQgMS4wXG4gICAgICAgIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xuICAgIH1cbiAgICAvL+iuvue9ruS9v+eUqOaKleW9seinhuWPo+aooeWei+efqemYtVxuICAgIHB1YmxpYyBzZXRVc2VQcm9qZWN0Vmlld01vZGVsTWF0cml4KHB2bU1hdHJpeCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMudV9wdm1fbWF0cml4X2xvYywgXCJ1X3B2bV9tYXRyaXhfbG9jXCIpKSB7XG4gICAgICAgICAgICB0aGlzLl9nbC51bmlmb3JtTWF0cml4NGZ2KHRoaXMudV9wdm1fbWF0cml4X2xvYywgZmFsc2UsIHB2bU1hdHJpeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/orr7nva7lhYnnhadcbiAgICBwdWJsaWMgc2V0VXNlQ29sb3IodUNvbG9yKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X2NvbG9yX2xvYywgXCJ1X2NvbG9yX2xvY1wiKSkge1xuICAgICAgICAgICAgdGhpcy5fZ2wudW5pZm9ybTRmdih0aGlzLnVfY29sb3JfbG9jLCB1Q29sb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8v6K6+572u5qih5Z6L6KeG5Y+j55+p6Zi1XG4gICAgcHVibGljIHNldFVzZU1vZGVsVmlld01hdHJpeChtdk1hdHJpeCk6IHZvaWQge1xuXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X01WTWF0cml4X2xvYywgXCJ1X01WTWF0cml4X2xvY1wiKSkge1xuICAgICAgICAgICAgdGhpcy5fZ2wudW5pZm9ybU1hdHJpeDRmdih0aGlzLnVfTVZNYXRyaXhfbG9jLCBmYWxzZSwgbXZNYXRyaXgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8v6K6+572u6YCP6KeG5oqV5b2x55+p6Zi1XG4gICAgcHVibGljIHNldFVzZVByb2plY3Rpb25NYXRyaXgocHJvak1hdHJpeCk6IHZvaWQge1xuXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X1BNYXRyaXhfbG9jLCBcInVfUE1hdHJpeF9sb2NcIikpIHtcbiAgICAgICAgICAgIHRoaXMuX2dsLnVuaWZvcm1NYXRyaXg0ZnYodGhpcy51X1BNYXRyaXhfbG9jLCBmYWxzZSwgcHJvak1hdHJpeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/orr7nva7pobbngrnlgLxcbiAgICBwdWJsaWMgc2V0VXNlVmVydGV4QXR0cmliUG9pbnRlckZvclZlcnRleChnbElELCBpdGVtU2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5jaGVja0dMSURWYWxpZChnbElEKSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5jaGVja2xvY1ZhbGlkKHRoaXMuYV9wb3NpdGlvbl9sb2MsIFwiYV9wb3NpdGlvbl9sb2NcIikpIHtcbiAgICAgICAgICAgIHRoaXMuX2dsLmJpbmRCdWZmZXIodGhpcy5fZ2wuQVJSQVlfQlVGRkVSLCBnbElEKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYV9wb3NpdGlvbl9sb2MpO1xuICAgICAgICAgICAgR0xhcGkudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLmFfcG9zaXRpb25fbG9jLCBpdGVtU2l6ZSwgdGhpcy5fZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL+iuvue9ruazlee6v+WAvFxuICAgIHB1YmxpYyBzZXRVc2VWZXJ0ZXhBdHRyaVBvaW50ZXJGb3JOb3JtYWwoZ2xJRCwgaXRlbVNpemU6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuY2hlY2tHTElEVmFsaWQoZ2xJRCkpIHJldHVybjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGxvY2FsdGlvbjpzaGFkZXLkuK1hdHRyaWJ1dGXlo7DmmI7lj5jph4/nmoTkvY3nva5cbiAgICAgICAgICogc2l6ZTrmr4/mrKHov63ku6Pkvb/nlKjnmoTljZXkvY3mlbDmja5cbiAgICAgICAgICogdHlwZTrljZXkvY3mlbDmja7nsbvlnotcbiAgICAgICAgICogbm9ybWFsbGl6ZTrljZXkvY3ljJbvvIjjgJAwLTI1NeOAkS0t44CL44CQMC0x44CR77yJXG4gICAgICAgICAqIHN0cmlkZTrmr4/mrKHov63ku6Pot7PlpJrlsJHkuKrmlbDmja7liLDkuIvkuIDkuKrmlbDmja5cbiAgICAgICAgICogb2Zmc2V0OuS7jue7keWumue8k+WGsuWMuueahOWBj+enu+S9jee9rlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfbm9ybWFsX2xvYywgXCJhX25vcm1hbF9sb2NcIikpIHtcbiAgICAgICAgICAgIHRoaXMuX2dsLmJpbmRCdWZmZXIodGhpcy5fZ2wuQVJSQVlfQlVGRkVSLCBnbElEKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYV9ub3JtYWxfbG9jKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hX25vcm1hbF9sb2MsIGl0ZW1TaXplLCB0aGlzLl9nbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8v6K6+572udXblgLxcbiAgICBwdWJsaWMgc2V0VXNlVmVydGV4QXR0cmliUG9pbnRlckZvclVWKGdsSUQsIGl0ZW1TaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrR0xJRFZhbGlkKGdsSUQpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfdXZfbG9jLCBcImFfdXZfbG9jXCIpKSB7XG4gICAgICAgICAgICB0aGlzLl9nbC5iaW5kQnVmZmVyKHRoaXMuX2dsLkFSUkFZX0JVRkZFUiwgZ2xJRCk7XG4gICAgICAgICAgICB0aGlzLl9nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfdXZfbG9jKTtcbiAgICAgICAgICAgIHRoaXMuX2dsLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5hX3V2X2xvYywgaXRlbVNpemUsIHRoaXMuX2dsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy/orr7nva7kvb/nlKjnmoTnurnnkIZcbiAgICAvL+azqOaEj+WmguaenOatpOWkhOS4jemHjeaWsOiuvue9ruS9v+eUqOeahOe6ueeQhu+8jOmCo+S5iOS8mum7mOiupOS9v+eUqOS4iuS4gOasoee7mOWItuaXtueahOe6ueeQhlxuICAgIHB1YmxpYyBzZXRVc2VUZXh0dXJlKGdsSUQsIHBvcyA9IDApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrR0xJRFZhbGlkKGdsSUQpKSByZXR1cm47XG4gICAgICAgIC8qKlxuICAgICAgICAgICogYWN0aXZlVGV4dHVyZeW/hemhu+WcqGJpbmRUZXh0dXJl5LmL5YmN44CC5aaC5p6c5rKhYWN0aXZlVGV4dHVyZeWwsWJpbmRUZXh0dXJl77yM5Lya6buY6K6k57uR5a6a5YiwMOWPt+e6ueeQhuWNleWFg1xuICAgICAgICAqL1xuXG4gICAgICAgIGlmICh0aGlzLmNoZWNrbG9jVmFsaWQodGhpcy51X3RleENvb3JkX2xvYywgXCJ1X3RleENvb3JkX2xvY1wiKSkge1xuICAgICAgICAgICAgLy8g5r+A5rS7IDAg5Y+357q555CG5Y2V5YWDXG4gICAgICAgICAgICB0aGlzLl9nbC5hY3RpdmVUZXh0dXJlKHRoaXMuX2dsW2dsVEVYVFVSRV9VTklUX1ZBTElEW3Bvc11dKTtcbiAgICAgICAgICAgIC8vIOaMh+WumuW9k+WJjeaTjeS9nOeahOi0tOWbvlxuICAgICAgICAgICAgdGhpcy5fZ2wuYmluZFRleHR1cmUodGhpcy5fZ2wuVEVYVFVSRV8yRCwgZ2xJRCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dsLnVuaWZvcm0xaSh0aGlzLnVfdGV4Q29vcmRfbG9jLCBwb3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfcG9zaXRpb25fbG9jLCBcImFfcG9zaXRpb25fbG9jXCIpKSB7Ly8g6K6+5a6a5Li65pWw57uE57G75Z6L55qE5Y+Y6YeP5pWw5o2uXG4gICAgICAgICAgICB0aGlzLl9nbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hX3Bvc2l0aW9uX2xvYyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfdXZfbG9jLCBcImFfdXZfbG9jXCIpKSB7XG4gICAgICAgICAgICB0aGlzLl9nbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hX3V2X2xvYyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tsb2NWYWxpZCh0aGlzLmFfbm9ybWFsX2xvYywgXCJhX25vcm1hbF9sb2NcIikpIHtcbiAgICAgICAgICAgIHRoaXMuX2dsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSh0aGlzLmFfbm9ybWFsX2xvYyk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59Il19
