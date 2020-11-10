"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Texture_1 = require("./Texture");
var GLEnums_1 = require("../gfx/GLEnums");
/**
 * 立方体纹理
 */
var TextureCube = /** @class */ (function (_super) {
    __extends(TextureCube, _super);
    function TextureCube(gl) {
        var _this = _super.call(this, gl) || this;
        _this._target = gl.TEXTURE_CUBE_MAP;
        return _this;
    }
    Object.defineProperty(TextureCube.prototype, "url", {
        /**
         * @param path
         * 0:right
         * 1:left
         * 2:up
         * 3:down
         * 4:back
         * 5:front
         */
        set: function (path) {
            this.faceInfos = [
                {
                    target: this._gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                    url: path[0],
                },
                {
                    target: this._gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    url: path[1],
                },
                {
                    target: this._gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                    url: path[2],
                },
                {
                    target: this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    url: path[3],
                },
                {
                    target: this._gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                    url: path[4],
                },
                {
                    target: this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                    url: path[5],
                },
            ];
            this.loadFaceInfor();
        },
        enumerable: false,
        configurable: true
    });
    //加载各个面信息
    TextureCube.prototype.loadFaceInfor = function () {
        var _this = this;
        var gl = this._gl;
        var texture = this._glID;
        gl.bindTexture(this._target, texture);
        var loadedCount = 0;
        this.faceInfos.forEach(function (faceInfo) {
            var target = faceInfo.target, url = faceInfo.url;
            // Upload the canvas to the cubemap face.
            var level = 0;
            var internalFormat = gl.RGBA;
            var format = gl.RGBA;
            var type = gl.UNSIGNED_BYTE;
            var width = 512;
            var height = 512;
            // setup each face so it's immediately renderable
            gl.texImage2D(target, level, format, width, height, 0, internalFormat, type, null);
            // Asynchronously load an image
            var image = new Image();
            image.src = url;
            image.addEventListener('load', function () {
                console.log("加载图片成功啦---");
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(this._target, texture);
                // Y 轴取反
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(target, level, format, internalFormat, type, image);
                loadedCount++;
                if (loadedCount == 6)
                    this.loaded = true;
                //   gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }.bind(_this));
        });
        //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        //放大
        gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, GLEnums_1.gltex_filter.LINEAR);
        //缩小
        gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, GLEnums_1.gltex_filter.LINEAR);
        //水平方向
        gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, 33648 /* MIRROR */);
        //垂直方向
        gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, 33648 /* MIRROR */);
    };
    return TextureCube;
}(Texture_1.Texture));
exports.default = TextureCube;
//# sourceMappingURL=TextureCube.js.map