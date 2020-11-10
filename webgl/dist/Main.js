"use strict";
//第1步 - 准备Canvas和获取WebGL的渲染上下文
Object.defineProperty(exports, "__esModule", { value: true });
var Device_1 = require("./Device");
var RenderFlow_1 = require("./RenderFlow");
var LoaderManager_1 = require("./LoaderManager");
var Shader_1 = require("./Shader");
Device_1.default.Instance.init();
Shader_1.G_ShaderFactory.init(Device_1.default.Instance.gl);
//testWebl_Label.run();
//LightTest.run();
// skyBoxTest.run();
// SkinTes1.run();
var arr = [
    "res/8x8-font.png",
    "res/wood.jpg",
    "res/ground.jpg",
    "res/wicker.jpg"
];
// ThreeDTexture.run();
// LabelTest.run();
// ShaderShadowTest.run();
// CameraTest.run();
// TextureTest.run();
// SpeedTest.run();
// HaiTwn1.run();
LoaderManager_1.default.instance.loadImageArrayRes(arr, null, function () {
    // debugger;
    new RenderFlow_1.default().startup();
});
//# sourceMappingURL=Main.js.map