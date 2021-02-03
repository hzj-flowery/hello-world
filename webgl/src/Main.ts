//第1步 - 准备Canvas和获取WebGL的渲染上下文




import Device from "./core/Device";
import LoaderManager from "./core/LoaderManager";
import PointLightTest from "./core/renderer/light/PointLightTest";
import RenderFlow from "./core/RenderFlow";
import EarthSunTest from "./core/renderer/3d/EarthSunTest";
import RobartTest from "./core/renderer/3d/RobartTest";
import CaptureTest from "./core/renderer/3d/CaptureTest";
import RampTextureTest from "./core/renderer/3d/RampTextureTest";
import ObjTest from "./core/renderer/3d/ObjTest";
import { CameraTest } from "./core/renderer/3d/CameraTest";
import ThreeDLightTest from "./core/renderer/light/ThreeDLightTest";
import ShaderShadowTest from "./core/renderer/3d/ShaderShadowTest";
import SpotLightTest from "./core/renderer/light/SpotLightTest";
import { StencilTest } from "./core/renderer/3d/StencilTest";
import { RenderTargetTexture } from "./core/renderer/3d/RenderTargetTexture";
import { G_ShaderFactory } from "./core/renderer/shader/ShaderFactory";
import { G_BufferManager } from "./core/renderer/base/buffer/BufferManager";
import { ShadowMapProjectionTest } from "./core/renderer/3d/ShadowMapProjectionTest";
import { G_DrawEngine } from "./core/renderer/base/DrawEngine";
import { G_ShaderCenter } from "./core/renderer/shader/ShaderCenter";
import { G_LightCenter } from "./core/renderer/light/LightCenter";
import { G_LightModel } from "./core/renderer/light/LightModel";
import { G_UISetting } from "./core/ui/UiSetting";
import { G_CameraModel } from "./core/renderer/camera/CameraModel";



Device.Instance.init();
G_DrawEngine.init(Device.Instance.gl);
G_ShaderFactory.init(Device.Instance.gl);
G_BufferManager.init(Device.Instance.gl);
G_ShaderCenter.init();
G_LightCenter.init();
G_LightModel.init();
G_UISetting.setUI();
//UI


// G_CameraModel.init(Device.Instance.gl);
//testWebl_Label.run();

//LightTest.run();

// skyBoxTest.run();

// SkinTes1.run();

 var arr = [
    "res/f-texture.png",
    "res/bindu.jpg",
    "res/light.jpg",
    "res/dragon.jpg",
    "res/models/killer_whale/whale.CYCLES.bin",
    "res/models/killer_whale/whale.CYCLES.gltf",
    "res/models/HeadData/head.json",
    "res/models/char/F.json",
    "res/models/Robart/blockGuyNodeDescriptions.json",
    "res/8x8-font.png",
    "res/wood.jpg",
    "res/tree.jpg",
    "res/ground.jpg",
    "res/wicker.jpg"
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




LoaderManager.instance.load(arr,null,function(){

    console.log("-888888----",/mobile|android|iphone|ipad/.test("mobilczjjjjj"));


    new RenderFlow().startup();
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
