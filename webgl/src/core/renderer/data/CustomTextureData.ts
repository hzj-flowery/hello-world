import { MathUtils } from "../../utils/MathUtils";
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
    static getBoardData(width:number,height:number,colorKinds:Array<number> = [0xFF,0xCC]):TextureOpts{
         let cformat = syGL.TextureFormat.L8;
         var urlData: TextureOpts = new TextureOpts();
         urlData.configFormat = cformat;
         urlData.width = width;
         urlData.height = height;
         urlData.magFilter = syGL.TexFilter.NEAREST;
         urlData.minFilter = syGL.TexFilter.NEAREST_MIPMAP_NEAREST;
         urlData.genMipmaps = true;
         var colorData = [];
         for(let i=1;i<=width;i++)
         {
             for(let j = 1;j<=height;j++)
             {
                 if(colorData.length==0)
                 {
                     //第一次随机插入一个值
                     colorData.push(colorKinds[MathUtils.randInt(0,1)])
                 }
                 else if(i>1&&j==1)
                 {
                     //一排的第一个 第一排忽略 从第二排开始
                     //上一排的最后一个 一定要和下一排的第一个一样的颜色
                     colorData.push(colorData[colorData.length-1])
                 }
                 else
                 {
                     //
                     var curData = colorData[colorData.length-1];
                     var pos = colorKinds.indexOf(curData)+1;
                     if(pos==colorKinds.length)
                     {
                        pos = 0;
                     }
                     colorData.push(colorKinds[pos])
                 }

             }
         }
         urlData.data = new Uint8Array(colorData)
          return urlData;
    }

    static getData(width:number,height:number,colorKinds:Array<number> = [1,1,1,1]):TextureOpts{
        let cformat = syGL.TextureFormat.RGBA8;
        var urlData: TextureOpts = new TextureOpts();
        urlData.configFormat = cformat;
        urlData.width = width;
        urlData.height = height;
        urlData.magFilter = syGL.TexFilter.NEAREST;
        urlData.minFilter = syGL.TexFilter.NEAREST_MIPMAP_NEAREST;
        urlData.genMipmaps = true;
        var colorData = [];
        for(let i=1;i<=width;i++)
        {
            for(let j = 1;j<=height;j++)
            {
                colorData.push(colorKinds[0])
                colorData.push(colorKinds[1])
                colorData.push(colorKinds[2])
                colorData.push(colorKinds[3])
            }
        }
        urlData.data = new Uint8Array(colorData)
        return urlData;
   }
}