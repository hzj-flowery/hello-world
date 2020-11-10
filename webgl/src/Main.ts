//第1步 - 准备Canvas和获取WebGL的渲染上下文

import Device from "./Device";
import ImageTestExample from "./RenderFlow";
import LoaderManager from "./LoaderManager";
import { G_ShaderFactory } from "./core/renderer/shader/Shader";
import HaiTwn1 from "./core/renderer/3d/HaiTwn1";
import Stream from "./tool/Stream";
import ShaderShadowTest from "./core/renderer/3d/ShaderShadowTest";
import Stage from "./core/renderer/3d/Stage";



Device.Instance.init();
G_ShaderFactory.init(Device.Instance.gl);

//testWebl_Label.run();

//LightTest.run();

// skyBoxTest.run();

// SkinTes1.run();

 var arr = [
    "res/models/killer_whale/whale.CYCLES.bin",
    "res/models/killer_whale/whale.CYCLES.gltf",
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

// CameraTest.run();

// TextureTest.run();

// SpeedTest.run();
//  HaiTwn1.run();


LoaderManager.instance.loadData(arr,null,function(){
    // debugger;
    new ImageTestExample().startup();
    
})
