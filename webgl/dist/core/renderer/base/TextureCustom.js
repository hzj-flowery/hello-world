"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Texture_1 = require("./Texture");
var GLapi_1 = require("../gfx/GLapi");
/**
 * 自定义纹理
 */
var TextureCustom = /** @class */ (function (_super) {
    __extends(TextureCustom, _super);
    function TextureCustom(gl) {
        var _this = _super.call(this, gl) || this;
        _this._target = gl.TEXTURE_2D;
        return _this;
    }
    Object.defineProperty(TextureCustom.prototype, "url", {
        /**
         * @param {level,internalFormat,width,height,border,format,type,data,alignment} urlData
         */
        set: function (urlData) {
            this.initTexture(urlData);
        },
        enumerable: false,
        configurable: true
    });
    TextureCustom.prototype.initTexture = function (urlData) {
        this.loaded = true;
        var gl = this._gl;
        gl.bindTexture(this._target, this._glID);
        // fill texture with 3x2 pixels
        var level = urlData.level || 0;
        var internalFormat = urlData.internalFormat;
        var width = urlData.width;
        var height = urlData.height;
        var border = urlData.border || 0;
        var format = urlData.format;
        var type = urlData.type || gl.UNSIGNED_BYTE;
        var data = urlData.data;
        var alignment = urlData.alignment || 1;
        GLapi_1.GLapi.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
        GLapi_1.GLapi.texImage2D(this._target, level, internalFormat, width, height, border, format, type, data);
        // set the filtering so we don't need mips and it's not filtered
        GLapi_1.GLapi.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        GLapi_1.GLapi.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        GLapi_1.GLapi.texParameteri(this._target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        GLapi_1.GLapi.texParameteri(this._target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    return TextureCustom;
}(Texture_1.Texture));
exports.default = TextureCustom;
//# sourceMappingURL=TextureCustom.js.map