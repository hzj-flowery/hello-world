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

LoaderManager.instance.load(arr,null,function(){
     
    runBeforeInit();
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
