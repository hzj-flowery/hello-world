"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GLEnums_1 = require("../gfx/GLEnums");
var CustomTextureData = /** @class */ (function () {
    function CustomTextureData() {
    }
    CustomTextureData.getRandomData = function (width, height, format) {
        var formatInfo = GLEnums_1.glTextureFmtInfor(format);
        var chanels = GLEnums_1.glTextureTotalChanels(format);
        var urlData = {
            level: 0,
            internalFormat: formatInfo.internalFormat,
            width: width,
            height: height,
            border: 0,
            format: formatInfo.format,
            type: formatInfo.pixelType,
            alignment: 1,
        };
        var getRandomColor = function () {
            var ret = [];
            for (var i_1 = 1; i_1 <= chanels; i_1++) {
                ret.push(Math.random() * 256);
            }
            return ret;
        };
        var retData = [];
        for (var j = 1; j <= height; j++) {
            var curColor = getRandomColor();
            for (var i = 1; i <= width; i++) {
                retData = [].concat(retData, curColor);
            }
        }
        urlData.data = new Uint8Array(retData);
        console.log(urlData);
        return urlData;
    };
    return CustomTextureData;
}());
exports.default = CustomTextureData;
//# sourceMappingURL=CustomTextureData.js.map