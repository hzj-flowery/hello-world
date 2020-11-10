"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 纹理缓存管理员
 */
var TextureCacheManager = /** @class */ (function () {
    function TextureCacheManager() {
        this._textureArray = [];
    }
    Object.defineProperty(TextureCacheManager, "instance", {
        get: function () {
            if (!this._instance)
                this._instance = new TextureCacheManager();
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    TextureCacheManager.prototype.cacheTexture = function (tex) {
        if (tex)
            this._textureArray.push(tex);
    };
    TextureCacheManager.prototype.uncacheTexture = function (tex) {
        var index = this._textureArray.indexOf(tex);
        if (index >= 0)
            this._textureArray.splice(index, 1);
    };
    return TextureCacheManager;
}());
exports.default = TextureCacheManager;
//# sourceMappingURL=TextureCacheManager.js.map