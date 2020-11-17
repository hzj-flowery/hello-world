//第1步 - 准备Canvas和获取WebGL的渲染上下文




import Device from "./Device";
import LoaderManager from "./LoaderManager";
import { G_ShaderFactory } from "./core/renderer/shader/Shader";
import PointLightTest from "./core/renderer/light/PointLightTest";
import RenderFlow from "./RenderFlow";
import Stage from "./core/renderer/3d/Stage";
import FogTest from "./core/renderer/3d/FogTest";
import EarthSunTest from "./core/renderer/3d/EarthSunTest";
import RobartTest from "./core/renderer/3d/RobartTest";
import CaptureTest from "./core/renderer/3d/CaptureTest";
import RampTextureTest from "./core/renderer/3d/RampTextureTest";
import CameraTest from "./core/renderer/3d/CameraTest";
import ObjTest from "./core/renderer/3d/ObjTest";



Device.Instance.init();
G_ShaderFactory.init(Device.Instance.gl);

//testWebl_Label.run();

//LightTest.run();

// skyBoxTest.run();

// SkinTes1.run();

 var arr = [
    "res/models/killer_whale/whale.CYCLES.bin",
    "res/models/killer_whale/whale.CYCLES.gltf",
    "res/models/HeadData/head.json",
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

var myHeaders = new Headers();
var myInit:any = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' };
var myRequest = new Request('http:localhost:3000//res/models/windmill/windmill.obj', myInit);

fetch(myRequest).then(function(response) {
    return response.text();
  }).then(function(myBlob) {
    console.log("myBlob-------",myBlob);
  });


LoaderManager.instance.loadData(arr,null,function(){
    // new RenderFlow().startup();
    // RampTextureTest.run();
    // CameraTest.run();
    // RobartTest.run();
    // ObjTest.run();
    
})
