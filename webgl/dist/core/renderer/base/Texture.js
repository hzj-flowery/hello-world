"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Texture = exports.TextureUpdateOpts = void 0;
var GLEnums_1 = require("../gfx/GLEnums");
/**
 * 创建一个纹理的一些设置参数
 */
var TextureUpdateOpts = /** @class */ (function () {
    function TextureUpdateOpts() {
        this.width = 1;
        this.height = 1;
        this.genMipmaps = false; //是否开启mipmap技术
        this.compressed = false; //纹理是否是压缩的
        this.anisotropy = 1; //设置纹理所有方向的最大值
        this.minFilter = GLEnums_1.gltex_filter.LINEAR; //纹理缩小过滤模式
        this.magFilter = GLEnums_1.gltex_filter.LINEAR; //纹理放大过滤模式
        this.mipFilter = GLEnums_1.gltex_filter.LINEAR_MIPMAP_LINEAR; //设置纹理缩小过滤的模式为特殊的线性过滤GL_LINEAR_MIPMAP_NEAREST
        this.wrapS = 33648 /* MIRROR */; //设置s方向上的贴图模式为镜像对称重复
        this.wrapT = 33648 /* MIRROR */; //设置t方向上的贴图模式为镜像对称重复
        this.format = 16 /* RGBA8 */; //纹理的格式
    }
    return TextureUpdateOpts;
}());
exports.TextureUpdateOpts = TextureUpdateOpts;
var _nullWebGLTexture = null;
var _textureID = 0;
var Texture = /** @class */ (function () {
    function Texture(gl) {
        this.loaded = false; //是否加载到内存
        this._bites = 0; //纹理在GPU端所占的内存
        this._gl = gl;
        this._target = -1;
        this._id = _textureID++;
        this._glID = gl.createTexture();
        this._bites = 0;
        this.loaded = false;
        console.log("-_id-------", this._id);
    }
    Texture.prototype.updateOptions = function (options) {
        this._width = options.width;
        this._height = options.height;
        this._genMipmaps = options.genMipmaps;
        this._anisotropy = options.anisotropy;
        this._minFilter = options.minFilter;
        this._magFilter = options.magFilter;
        this._mipFilter = options.mipFilter;
        this._wrapS = options.wrapS;
        this._wrapT = options.wrapT;
        // wrapR available in webgl2
        // this._wrapR = enums.WRAP_REPEAT;
        this._format = options.format;
        this._format = options.format;
        this._compressed =
            (this._format >= 0 /* RGB_DXT1 */ && this._format <= 8 /* RGBA_PVRTC_4BPPV1 */) ||
                (this._format >= 28 /* RGB_ETC2 */ && this._format <= 29 /* RGBA_ETC2 */);
        this.updateNormalBytes();
    };
    //更新字节数
    Texture.prototype.updateNormalBytes = function () {
        if (this._compressed == false) {
            this._bites = (this._width * this._height * GLEnums_1.glTextureChanelTotalBytes(this._format)) / 1024;
        }
    };
    //更新由于开启了mipmap而造成的纹理内存增大的字节数
    Texture.prototype.updateGenMipMapsAddBites = function () {
        //（1/）
        this.updateNormalBytes();
        this._bites = this._bites * (4 / 3);
    };
    /**
     * @method destroy
     */
    Texture.prototype.destroy = function () {
        if (this._glID === _nullWebGLTexture) {
            console.error('The texture already destroyed');
            return;
        }
        this._gl.deleteTexture(this._glID);
        this._glID = _nullWebGLTexture;
    };
    return Texture;
}());
exports.Texture = Texture;
//# sourceMappingURL=Texture.js.map