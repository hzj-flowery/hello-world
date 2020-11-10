"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SY = void 0;
var Texture2D_1 = require("./Texture2D");
var Shader_1 = require("../../../Shader");
var Node_1 = require("./Node");
var TextureCube_1 = require("./TextureCube");
var GLapi_1 = require("../gfx/GLapi");
var TextureCustom_1 = require("./TextureCustom");
/**
 * 字节数组的使用
 * 整型：这个可以是一个字节Uint8Array,Int8Array,也可是双字节Uint16Array,Int16Array,
 * 也可是四字节Unit32Array,Int32Array
 * 浮点型：这个要四个字节，适用于float类型，例如Float32Array,当然也只有这一种类型
 * 双精度型：这个要八个字节，适用于double类型，例如Float64Array,当然也只有这一种类型
 *
 * 使用
 *  // From a length
var float32 = new Float32Array(2);
float32[0] = 42;
console.log(float32[0]); // 42
console.log(float32.length); // 2
console.log(float32.BYTES_PER_ELEMENT); // 4

// From an array
var arr = new Float32Array([21,31]);
console.log(arr[1]); // 31

// From another TypedArray
var x = new Float32Array([21, 31]);
var y = new Float32Array(x);
console.log(y[0]); // 21

// From an ArrayBuffer
// var buffer = new ArrayBuffer(16);
var buffer = new ArrayBuffer(16);
// buffer[0] = 10;
// buffer[1] = 20;
// buffer[2] = 30;
// buffer[3] = 40;
// buffer[4] = 50;
var z = new Float32Array(buffer, 0, 4);
console.log(z);
// z.forEach(function(value,index,arr){
//     console.log(value,index,arr);
// })

 */
var glBaseBuffer = /** @class */ (function () {
    function glBaseBuffer(gl, data, itemSize, itemNums) {
        this.itemSize = 0;
        this.itemNums = 0;
        this.itemBytes = 2; //每个数据的存储字节数
        this._glID = gl.createBuffer();
        this.sourceData = data;
        this.itemSize = itemSize;
        this.itemNums = itemNums;
        this.gl = gl;
    }
    //连接数据
    glBaseBuffer.prototype.linkData = function () {
        this.bindBuffer();
        this.bindData();
    };
    /**
   * @method destroy
   */
    glBaseBuffer.prototype.destroy = function () {
        if (this._glID === -1) {
            console.error('The buffer already destroyed');
            return;
        }
        this.gl.deleteBuffer(this._glID);
        this._glID = -1;
    };
    return glBaseBuffer;
}());
//顶点buffer
var VertexsBuffer = /** @class */ (function (_super) {
    __extends(VertexsBuffer, _super);
    function VertexsBuffer(gl, vertexs, itemSize, itemNums) {
        return _super.call(this, gl, vertexs, itemSize, itemNums) || this;
    }
    VertexsBuffer.prototype.bindBuffer = function () {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glID);
    };
    VertexsBuffer.prototype.bindData = function () {
        this.itemBytes = 32 / 8;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sourceData), this.gl.STATIC_DRAW);
    };
    return VertexsBuffer;
}(glBaseBuffer));
//索引buffer
var IndexsBuffer = /** @class */ (function (_super) {
    __extends(IndexsBuffer, _super);
    function IndexsBuffer(gl, indexs, itemSize, itemNums) {
        return _super.call(this, gl, indexs, itemSize, itemNums) || this;
    }
    IndexsBuffer.prototype.bindBuffer = function () {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._glID);
    };
    IndexsBuffer.prototype.bindData = function () {
        this.itemBytes = 16 / 8;
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sourceData), this.gl.STATIC_DRAW);
    };
    return IndexsBuffer;
}(glBaseBuffer));
//uvbuffer
var UVsBuffer = /** @class */ (function (_super) {
    __extends(UVsBuffer, _super);
    function UVsBuffer(gl, uvs, itemSize, itemNums) {
        return _super.call(this, gl, uvs, itemSize, itemNums) || this;
    }
    UVsBuffer.prototype.bindBuffer = function () {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glID);
    };
    UVsBuffer.prototype.bindData = function () {
        this.itemBytes = 32 / 8;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sourceData), this.gl.STATIC_DRAW);
    };
    return UVsBuffer;
}(glBaseBuffer));
//法线buffer
var NormalBuffer = /** @class */ (function (_super) {
    __extends(NormalBuffer, _super);
    function NormalBuffer(gl, normals, itemSize, itemNums) {
        return _super.call(this, gl, normals, itemSize, itemNums) || this;
    }
    NormalBuffer.prototype.bindBuffer = function () {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glID);
    };
    NormalBuffer.prototype.bindData = function () {
        this.itemBytes = 32 / 8;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sourceData), this.gl.STATIC_DRAW);
    };
    return NormalBuffer;
}(glBaseBuffer));
/**
 * 显示节点
 * author:hzj
 */
var SY;
(function (SY) {
    var GLID_TYPE;
    (function (GLID_TYPE) {
        GLID_TYPE[GLID_TYPE["VERTEX"] = 1] = "VERTEX";
        GLID_TYPE[GLID_TYPE["INDEX"] = 2] = "INDEX";
        GLID_TYPE[GLID_TYPE["NORMAL"] = 3] = "NORMAL";
        GLID_TYPE[GLID_TYPE["UV"] = 4] = "UV";
        GLID_TYPE[GLID_TYPE["TEXTURE_2D"] = 5] = "TEXTURE_2D";
        GLID_TYPE[GLID_TYPE["TEXTURE_CUBE"] = 6] = "TEXTURE_CUBE"; //立方体纹理
    })(GLID_TYPE = SY.GLID_TYPE || (SY.GLID_TYPE = {}));
    var Sprite = /** @class */ (function (_super) {
        __extends(Sprite, _super);
        function Sprite(gl) {
            var _this = _super.call(this) || this;
            _this.gl = gl;
            _this._glPrimitiveType = 6 /* TRIANGLE_FAN */;
            return _this;
        }
        Object.defineProperty(Sprite.prototype, "shader", {
            //获取shader
            get: function () {
                return this._shader;
            },
            enumerable: false,
            configurable: true
        });
        Sprite.prototype.setShader = function (vert, frag) {
            this._shader = Shader_1.Shader.create(vert, frag);
        };
        //创建顶点缓冲
        Sprite.prototype.createVertexsBuffer = function (vertexs, itemSize, itemNums) {
            this._vertexsBuffer = new VertexsBuffer(this.gl, vertexs, itemSize, itemNums);
            this._vertexsBuffer.linkData();
            return this._vertexsBuffer;
        };
        //创建法线缓冲
        Sprite.prototype.createNormalsBuffer = function (normals, itemSize, itemNums) {
            this._normalsBuffer = new NormalBuffer(this.gl, normals, itemSize, itemNums);
            this._normalsBuffer.linkData();
            return this._normalsBuffer;
        };
        //创建索引缓冲
        Sprite.prototype.createIndexsBuffer = function (indexs, itemSize, itemNums) {
            this._indexsBuffer = new IndexsBuffer(this.gl, indexs, itemSize, itemNums);
            this._indexsBuffer.linkData();
            return this._indexsBuffer;
        };
        //创建uv缓冲
        Sprite.prototype.createUVsBuffer = function (uvs, itemSize, itemNums) {
            this._uvsBuffer = new UVsBuffer(this.gl, uvs, itemSize, itemNums);
            this._uvsBuffer.linkData();
            return this._uvsBuffer;
        };
        //创建一个纹理buffer
        Sprite.prototype.createTexture2DBuffer = function (url) {
            this._texture = new Texture2D_1.Texture2D(this.gl);
            this._texture.url = url;
            return this._texture;
        };
        Sprite.prototype.createTextureCubeBuffer = function (arr) {
            this._texture = new TextureCube_1.default(this.gl);
            this._texture.url = arr;
            return this._texture;
        };
        Sprite.prototype.createCustomTextureBuffer = function (data) {
            this._texture = new TextureCustom_1.default(this.gl);
            this._texture.url = data;
            return this._texture;
        };
        Object.defineProperty(Sprite.prototype, "url", {
            set: function (url) {
                if (typeof url == "string") {
                    this.createTexture2DBuffer(url);
                }
                else if (url instanceof Array && url.length == 6) {
                    this.createTextureCubeBuffer(url);
                }
                else if (typeof (url) == "object") {
                    this.createCustomTextureBuffer(url);
                }
            },
            enumerable: false,
            configurable: true
        });
        Sprite.prototype.getGLID = function (type) {
            switch (type) {
                case GLID_TYPE.INDEX: return this._indexsBuffer ? this._indexsBuffer._glID : -1;
                case GLID_TYPE.TEXTURE_2D: return this._texture ? this._texture._glID : -1;
                case GLID_TYPE.TEXTURE_CUBE: return this._texture ? this._texture._glID : -1;
                case GLID_TYPE.UV: return this._uvsBuffer ? this._uvsBuffer._glID : -1;
                case GLID_TYPE.NORMAL: return this._normalsBuffer ? this._normalsBuffer._glID : -1;
                case GLID_TYPE.VERTEX: return this._vertexsBuffer ? this._vertexsBuffer._glID : -1;
                default: return -1; //未知
            }
        };
        Sprite.prototype.getBuffer = function (type) {
            switch (type) {
                case GLID_TYPE.INDEX: return this._indexsBuffer;
                case GLID_TYPE.UV: return this._uvsBuffer;
                case GLID_TYPE.NORMAL: return this._normalsBuffer;
                case GLID_TYPE.VERTEX: return this._vertexsBuffer;
                default: return null; //未知
            }
        };
        Sprite.prototype.getBufferItemSize = function (type) {
            var buffer = this.getBuffer(type);
            return buffer ? buffer.itemSize : -1;
        };
        Sprite.prototype.updateCamera = function (time) {
        };
        /**
         *
         * @param texture 纹理的GLID
         */
        Sprite.prototype.draw = function (time) {
            if (this._texture.loaded == false) {
                return;
            }
            //激活shader
            this._shader.active();
            var out = this._glMatrix.vec3.create();
            //给shader中的变量赋值
            this._shader.setUseLight([0.0, 1, 1.0, 1], this._glMatrix.vec3.normalize(out, [8, 5, -10]));
            if (this._shader.USE_SKYBOX) {
                var resu = (this).updateCamera(time);
                this._shader.setUseSkyBox(resu);
            }
            this._shader.setUseModelViewMatrix(this._modelMatrix);
            this._shader.setUseProjectionMatrix(this._projectionMatrix);
            this._shader.setUseVertexAttribPointerForVertex(this.getGLID(SY.GLID_TYPE.VERTEX), this.getBufferItemSize(SY.GLID_TYPE.VERTEX));
            this._shader.setUseVertexAttribPointerForUV(this.getGLID(SY.GLID_TYPE.UV), this.getBufferItemSize(SY.GLID_TYPE.UV));
            this._shader.setUseVertexAttriPointerForNormal(this.getGLID(SY.GLID_TYPE.NORMAL), this.getBufferItemSize(SY.GLID_TYPE.NORMAL));
            if (this._texture && this._texture._glID && !this._shader.USE_SKYBOX) {
                this._shader.setUseTexture(this.getGLID(SY.GLID_TYPE.TEXTURE_2D));
            }
            this.startVertexShader();
        };
        //启动顶点着色器
        Sprite.prototype.startVertexShader = function () {
            var indexglID = this.getGLID(SY.GLID_TYPE.INDEX);
            if (indexglID != -1) {
                GLapi_1.GLapi.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexglID);
                GLapi_1.GLapi.drawElements(this._glPrimitiveType, this.getBuffer(SY.GLID_TYPE.INDEX).itemNums, this.gl.UNSIGNED_SHORT, 0);
            }
            else {
                var points = this.getBuffer(SY.GLID_TYPE.VERTEX);
                GLapi_1.GLapi.drawArrays(this._glPrimitiveType, 0, points.itemNums);
            }
            //解除缓冲区对于目标纹理的绑定
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        };
        Sprite.prototype.destroy = function () {
            this._texture.destroy();
        };
        return Sprite;
    }(Node_1.Node));
    SY.Sprite = Sprite;
})(SY = exports.SY || (exports.SY = {}));
//# sourceMappingURL=Sprite.js.map