"use strict";
import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { SY } from "../base/Sprite";
import { syRender } from "../data/RenderData";
import { StateString, StateValueMap } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";

var testLetterInfors = {
  'a': { x: 0, y: 0, width: 8, height: 8 },
  'b': { x: 8, y: 0, width: 8, height: 8 },
  'c': { x: 16, y: 0, width: 8, height: 8 },
  'd': { x: 24, y: 0, width: 8, height: 8 },
  'e': { x: 32, y: 0, width: 8, height: 8 },
  'f': { x: 40, y: 0, width: 8, height: 8 },
  'g': { x: 48, y: 0, width: 8, height: 8 },
  'h': { x: 56, y: 0, width: 8, height: 8 },
  'i': { x: 0, y: 8, width: 8, height: 8 },
  'j': { x: 8, y: 8, width: 8, height: 8 },
  'k': { x: 16, y: 8, width: 8, height: 8 },
  'l': { x: 24, y: 8, width: 8, height: 8 },
  'm': { x: 32, y: 8, width: 8, height: 8 },
  'n': { x: 40, y: 8, width: 8, height: 8 },
  'o': { x: 48, y: 8, width: 8, height: 8 },
  'p': { x: 56, y: 8, width: 8, height: 8 },
  'q': { x: 0, y: 16, width: 8, height: 8 },
  'r': { x: 8, y: 16, width: 8, height: 8 },
  's': { x: 16, y: 16, width: 8, height: 8 },
  't': { x: 24, y: 16, width: 8, height: 8 },
  'u': { x: 32, y: 16, width: 8, height: 8 },
  'v': { x: 40, y: 16, width: 8, height: 8 },
  'w': { x: 48, y: 16, width: 8, height: 8 },
  'x': { x: 56, y: 16, width: 8, height: 8 },
  'y': { x: 0, y: 24, width: 8, height: 8 },
  'z': { x: 8, y: 24, width: 8, height: 8 },
  '0': { x: 16, y: 24, width: 8, height: 8 },
  '1': { x: 24, y: 24, width: 8, height: 8 },
  '2': { x: 32, y: 24, width: 8, height: 8 },
  '3': { x: 40, y: 24, width: 8, height: 8 },
  '4': { x: 48, y: 24, width: 8, height: 8 },
  '5': { x: 56, y: 24, width: 8, height: 8 },
  '6': { x: 0, y: 32, width: 8, height: 8 },
  '7': { x: 8, y: 32, width: 8, height: 8 },
  '8': { x: 16, y: 32, width: 8, height: 8 },
  '9': { x: 24, y: 32, width: 8, height: 8 },
  '-': { x: 32, y: 32, width: 8, height: 8 },
  '*': { x: 40, y: 32, width: 8, height: 8 },
  '!': { x: 48, y: 32, width: 8, height: 8 },
  '?': { x: 56, y: 32, width: 8, height: 8 },
}
interface LetterInfo{
  x:number;
  y:number;
  width:number;
  height:number;
  xoffset:number;
  yoffset:number;
}
class FontInfo {
  public spaceWidth: number = 8; //空字符的宽度
  public spacing: number = -1;   //字符间距
  public textureWidth: number = 64; //字符纹理的宽度
  public textureHeight: number = 40; //字符纹理的高度
  public fontSize:number = 26;//字体大小
  public lineHeight:number = 26;//行高
  public letterInfos = testLetterInfors;

  public makeVerticesForString(content: string) {
    var len = content.length;
    //每个字符有六个点绘制成一个四边形
    //每个点有两个坐标组成 即(x,y)
    var numVertices = len * 6; 
    var positions = new Float32Array(numVertices * 2);
    var texcoords = new Float32Array(numVertices * 2);
    var offset = 0;
    var r_x = 0; //左x
    var switchLineCount:number = 0;//换行次数
    /**
     * (0,0)**********
     * ***************
     * ***************
     * ***********(1,1)
     */
    for (var ii = 0; ii < len; ++ii) {
      var letter = content[ii];
      var Linfo:LetterInfo = this.letterInfos[letter];
      if(letter=='\n')
      {
          //换行
          r_x = 0;
          switchLineCount++;
      }
      else if (Linfo) {
        //右x
        var l_x = r_x + Linfo.width+Linfo.xoffset;
        //上y
        var t_y = 0-switchLineCount*this.lineHeight+Linfo.yoffset;
        //下y
        var b_y = t_y+Linfo.height

        //uv坐标
        var u1 = Linfo.x / this.textureWidth;
        var v1 = (Linfo.y + Linfo.height - 1) / this.textureHeight;
        var u2 = (Linfo.x + Linfo.width - 1) / this.textureWidth;
        var v2 = Linfo.y / this.textureHeight;

        // 6 vertices per letter
        positions[offset + 0] = r_x;
        positions[offset + 1] = t_y;
        texcoords[offset + 0] = u1;   //--1  (0,0) 左上
        texcoords[offset + 1] = v1;

        positions[offset + 2] = l_x;
        positions[offset + 3] = t_y;
        texcoords[offset + 2] = u2;   //--2   (1,0)右上
        texcoords[offset + 3] = v1;

        positions[offset + 4] = r_x;
        positions[offset + 5] = b_y;
        texcoords[offset + 4] = u1;   //--3   (0,1)左下
        texcoords[offset + 5] = v2;

        positions[offset + 6] = r_x;
        positions[offset + 7] = b_y;
        texcoords[offset + 6] = u1;   //--4  (0,1)左下
        texcoords[offset + 7] = v2;

        positions[offset + 8] = l_x;
        positions[offset + 9] = t_y;
        texcoords[offset + 8] = u2;  //--5  (1,0)右上
        texcoords[offset + 9] = v1;

        positions[offset + 10] = l_x;
        positions[offset + 11] = b_y;
        texcoords[offset + 10] = u2;  //--6  (1,1)右下
        texcoords[offset + 11] = v2;

        r_x += Linfo.width + this.spacing;
        offset += 12;
      } else {
        // we don't have this character so just advance
        r_x += this.spaceWidth;
      }
    }

    // return ArrayBufferViews for the portion of the TypedArrays
    // that were actually used.
    return {
      arrays: {
        position: new Float32Array(positions.buffer, 0, offset),
        texcoord: new Float32Array(texcoords.buffer, 0, offset),
      },
      numVertices: offset / 2,
    };
  }
}




export class Label extends SY.SpriteBase {
  constructor() {
    super();
    this._node__type = syRender.NodeType.D2;
    this.pushPassContent(syRender.ShaderType.Sprite, [
      [StateString.primitiveType, StateValueMap.primitiveType.PT_TRIANGLES]
    ], [
      [syRender.PassCustomKey.DefineUse, syRender.ShaderDefineValue.SY_USE_RGB_TEST, 0.1]
    ]);
  }

  private _content: string = "zm520";
  public fontSize:number;
  public set content(str: string) {
    this._content = str;
    this.onInit();
  }
  protected onInit(): void {
    if (!this._content) return;
    var fontInfo = new FontInfo();

    var letter = LoaderManager.instance.getRes("res/fnt/word.fnt");
    fontInfo.letterInfos = letter.letterInfos;
    fontInfo.textureHeight = letter.textureHeight;
    fontInfo.textureWidth = letter.textureWidth;
    fontInfo.fontSize = letter.fontSize;
    fontInfo.lineHeight = letter.lineHeight
    var data = fontInfo.makeVerticesForString(this._content);

    var arrPos = [];
    var arrUV = [];
    var posData = (data.arrays.position.toString()).split(',');
    var uvData = (data.arrays.texcoord.toString()).split(',');
    

    var changeScaleX = fontInfo.textureWidth/256;
    var changeScaleX = fontInfo.textureHeight/256;
    for (var j = 0; j < posData.length; j++) {
      //归一化
      if (j % 2 == 0) {
        arrPos.push(parseFloat(posData[j]) /fontInfo.textureWidth*changeScaleX);
        //宽
      }
      else if (j % 2 == 1) {
        arrPos.push(parseFloat(posData[j]) /fontInfo.textureHeight*changeScaleX);
      }


      arrUV.push(parseFloat(uvData[j]));

      //0 1 2 3 4 5 6 7 8 9
      //插入z轴
      if (j % 2 != 0) {
        arrPos.push(-0.1);
      }
    }

  
    this.createVertexsBuffer(arrPos, 3);
    this.createUVsBuffer(arrUV, 2);

  }
}

