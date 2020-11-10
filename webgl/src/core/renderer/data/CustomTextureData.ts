import { glTextureFmtInfor, gltex_format, glTextureTotalChanels } from "../gfx/GLEnums";

export default class CustomTextureData {
    static getRandomData(width, height, format: gltex_format) {

        var formatInfo = glTextureFmtInfor(format);
        var chanels = glTextureTotalChanels(format);
        var urlData: any = {
            level: 0,
            internalFormat: formatInfo.internalFormat,
            width: width,
            height: height,
            border: 0,
            format: formatInfo.format,
            type: formatInfo.pixelType,
            alignment: 1,
        }
        var getRandomColor = function () {
            var ret = [];
            for (let i = 1; i <= chanels; i++) {
                ret.push(Math.random() * 256);
            }
            return ret;
        }
        var retData = [];
        for (var j = 1; j <= height; j++) {
            var curColor = getRandomColor();
            for (var i = 1; i <= width; i++) {
                retData = [].concat(retData,curColor);
            }
        }
        urlData.data = new Uint8Array(retData);
        console.log(urlData);
        return urlData;
    }
}