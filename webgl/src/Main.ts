//第1步 - 准备Canvas和获取WebGL的渲染上下文




import Device from "./core/Device";
import LoaderManager from "./core/LoaderManager";
import RenderFlow from "./core/RenderFlow";
import ThreeDLightTest from "./core/renderer/light/ThreeDLightTest";
import SpotLightTest from "./core/renderer/light/SpotLightTest";
import { G_ShaderFactory } from "./core/renderer/shader/ShaderFactory";
import { G_BufferManager } from "./core/renderer/base/buffer/BufferManager";
import { G_DrawEngine } from "./core/renderer/base/DrawEngine";
import { G_LightCenter } from "./core/renderer/light/LightCenter";
import { G_LightModel } from "./core/renderer/light/LightModel";
import { G_UISetting } from "./core/ui/UiSetting";
import { ShaderCode } from "./core/renderer/shader/ShaderCode";




//UI


// G_CameraModel.init(Device.Instance.gl);
//testWebl_Label.run();

//LightTest.run();

// skyBoxTest.run();

// SkinTes1.run();

 var arr = [
    "res/f-texture.png",
    "res/bindu.jpg",
    "res/friend.png",
    "res/map1.png",
    "res/dragon.png",
    "res/deferred.png",
    "res/light.jpg",
    "res/dragon.jpg",
    "res/dragon.png",
    "res/caustics.png",
    "res/models/killer_whale/whale.CYCLES.bin",
    "res/models/killer_whale/whale.CYCLES.gltf",
    "res/models/gltf/Flamingo.glb",
    "res/models/HeadData/head.json",
    "res/models/char/F.json",
    "res/models/Robart/blockGuyNodeDescriptions.json",
    "res/fnt/word.fnt",
    "res/8x8-font.png",
    "res/wood.jpg",
    "res/tree.jpg",
    "res/tree.png",
    "res/ground.jpg",
    "res/wicker.jpg",
 ]

// ThreeDTexture.run();
// LabelTest.run();
// ShaderShadowTest.run();

// Stage.run();

// EarthSunTest.run();

// RobartTest.run();
// CaptureTest.run();

// CameraTest.run();

// TextureTest.run();

// SpeedTest.run();
//  HaiTwn1.run();

// ThreeDLightTest.run();
// SpotLightTest.run();
// PointLightTest.run();

// FogTest.run();


function runBeforeInit(){
    Device.Instance.init();
    ShaderCode.init();
    G_DrawEngine.init(Device.Instance.gl);
    G_ShaderFactory.init(Device.Instance.gl);
    G_BufferManager.init(Device.Instance.gl);
    G_LightCenter.init();
    G_LightModel.init();
    G_UISetting.setUI();
    
}

function readInt(buf:Array<number>,pos:number) {
    var len = 1;
    var b = buf[pos] & 0xff;
    var n = b & 0x7f;
    if (b > 0x7f) {
      b = buf[pos + len++] & 0xff;
      n ^= (b & 0x7f) << 7;
      if (b > 0x7f) {
        b = buf[pos + len++] & 0xff;
        n ^= (b & 0x7f) << 14;
        if (b > 0x7f) {
          b = buf[pos + len++] & 0xff;
          n ^= (b & 0x7f) << 21;
          if (b > 0x7f) {
            b = buf[pos + len++] & 0xff;
            n ^= (b & 0x7f) << 28;
            if (b > 0x7f) {
              console.error("解析整数出错-----buf--pos",pos);
            }
          }
        }
      }
    }
    pos += len;
    return (n >>> 1) ^ -(n & 1); // back to two's-complement
  }

 function encodeInt(n:number,buf:Array<number>,pos:number) {
    // move sign to low-order bit, and flip others if negative
      n = (n << 1) ^ (n >> 31);
      var start = pos;
      if ((n & ~0x7F) != 0) {
        buf[pos++] = ((n | 0x80) & 0xFF);
        n >>>= 7;
        if (n > 0x7F) {
          buf[pos++] = ((n | 0x80) & 0xFF);
          n >>>= 7;
          if (n > 0x7F) {
            buf[pos++] = ((n | 0x80) & 0xFF);
            n >>>= 7;
            if (n > 0x7F) {
              buf[pos++] = ((n | 0x80) & 0xFF);
              n >>>= 7;
            }
          }
        }
      } 
      buf[pos++] =  n;
      return pos - start;
    }
    
    //压缩字符串
    function encodeString(str:string,buf:Array<number>,pos:number){
         var len = str.length;
         if(len==1)
         {
            buf[pos] = 0x8200+str.charCodeAt(0); 
         }
         else if(len>1)
         {
            var sexValue=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
            var strAscii = [];//用于接收ASCII码
            for(var i = 0 ; i < len-1 ; i++ ){
                 strAscii[i] = str.charCodeAt(i);//只能把字符串中的字符一个一个的解码
            }
            //截至字符
            var endAscill = str.charCodeAt(len-1);
            var sexAscill = endAscill.toString(16);
            var sexLen=sexAscill.length;
            var testStr = sexAscill.substr(sexLen-2);
            //正常情况下 能够用ascill码表示的字符 它的前四位一定小于8 最大值为0x7f
            var hi4 = (endAscill & 0xf0) >> 4;//高四位
            var lo4 = endAscill & 0x0f;//低四位
            
            var endAscillStr = sexValue[hi4+8]+lo4

            for(var i = 0 ; i < strAscii.length ; i++ ){
                buf[pos+i]=parseInt(strAscii[i])
            }
            buf[pos+i]=parseInt(endAscillStr,16)
         }
         return pos+len;
    }
    //读取字符串
    function readString(buf:Array<number>,pos:number){
       var len = buf.length;
       var targetCharLen=0;
       var targetCharStr = "";
       var sexValue=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
       for(var k=pos;k<len;k++)
       {
           var char = buf[k];
           if(k==pos && char==0x82&&buf[k+1])
           {
              //只有一个字符
              targetCharStr=String.fromCharCode(buf[k+1]);
              targetCharLen=2
           }
           else
           {
               //多个字符
               var hi4 = (char & 0xf0) >> 4;//高四位
               var lo4 = char & 0x0f;//低四位
               var end:boolean = hi4>=8;
               if(end)
               {
                   //结尾
                   char = parseInt(sexValue[hi4-8]+lo4,16);
               }
               targetCharStr=targetCharStr+String.fromCharCode(char);
               targetCharLen++;
               if(end)break;
              
           }
       }
       pos = pos+targetCharLen;
       return targetCharStr;
    }

    function parseBinary(buf:string){
        var ret = [];
       for(var k=0;k<buf.length;k=k+2)
       {
         var p = parseInt((buf[k]+buf[k+1]),16)
         ret.push(p)
       }
       return ret
    }


LoaderManager.instance.load(arr,null,function(){
     
    runBeforeInit();
    // var buf = [0x04,0x31]
    // var buf1 = [];
    // var buf2 = [];
    // encodeInt(1000000,buf1,0);
    // encodeString("猜",buf2,0)
    // parseBinary("863132e78c9cb2")
    // var t=readString(buf2,0)
    // var p = readInt(buf,0)
    console.log("-888888----",/mobile|android|iphone|ipad/.test("mobilczjjjjj"));
    let name = "zhangman";
    let value = "xiaogui hen";
    let str = `#define ${name} ${value}`;
    console.log("---hzj------",str);

    LoaderManager.instance.loadTemplate(function(){
         //启动游戏
         new RenderFlow().startup();
    })
     

    // ObjTest.run()
    
    // EarthSunTest.run();
   
    // RampTextureTest.run();
    // CameraTest.run();
    // RobartTest.run();
    // ObjTest.run();
    // Stage.run();

    // SpotLightTest.run();

    // PointLightTest.run();
    // ThreeDLightTest.run();

    // ShaderShadowTest.run();

    // StencilTest.run();

    // RenderTargetTexture.run();
    
    // ShadowMapProjectionTest.run();

    // FogTest.run(); 
})
