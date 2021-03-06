import { TextureOpts } from "../base/texture/Texture";
import {syGL } from "../gfx/syGLEnums";

export default class CustomTextureData {
    static getRandomData(width, height, format: syGL.TextureFormat):TextureOpts {
        var chanels = syGL.getTextureTotalChanels(format);
        var urlData: TextureOpts = new TextureOpts();
        urlData.level = 0;
        urlData.width = width;
        urlData.height = height;
        urlData.configFormat = format;
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
        return urlData;
    }
    
    /**
     * 自定义棋盘纹理
     * @param width 
     * @param height 
     */
    static getBoardData(width:number,height:number):TextureOpts{
         let cformat = syGL.TextureFormat.L8;
         var urlData: TextureOpts = new TextureOpts();
         urlData.configFormat = cformat;
         urlData.width = width;
         urlData.height = height;
         urlData.magFilter = syGL.TexFilter.NEAREST;
         urlData.minFilter = syGL.TexFilter.NEAREST_MIPMAP_NEAREST;
         urlData.genMipmaps = true;
         urlData.data = new Uint8Array([  // data
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
            0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
          ])
          return urlData;
    }
}