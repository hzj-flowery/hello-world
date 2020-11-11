//第1步 - 准备Canvas和获取WebGL的渲染上下文

import Device from "./Device";
import LoaderManager from "./LoaderManager";
import { G_ShaderFactory } from "./core/renderer/shader/Shader";
import PointLightTest from "./core/renderer/light/PointLightTest";
import RenderFlow from "./RenderFlow";
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

Stage.run();

// CameraTest.run();

// TextureTest.run();

// SpeedTest.run();
//  HaiTwn1.run();

// ThreeDLightTest.run();
// SpotLightTest.run();
// PointLightTest.run();


LoaderManager.instance.loadData(arr,null,function(){
    // debugger;
    // new RenderFlow().startup();
    
})
