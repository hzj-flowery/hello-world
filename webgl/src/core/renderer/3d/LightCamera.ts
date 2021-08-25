import { sy } from "../../Director";
import { glMatrix } from "../../math/Matrix";
import { G_UISetting } from "../../ui/UiSetting";
import { MathUtils } from "../../utils/MathUtils";
import { Node } from "../base/Node";
import { SY } from "../base/Sprite";
import { G_Stage } from "../base/Stage";
import Camera from "../camera/Camera";
import { GameMainCamera } from "../camera/GameMainCamera";
import OrthoCamera from "../camera/OrthoCamera";
import { LightData } from "../data/LightData";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";
import { syPrimitives } from "../shader/Primitives";
import { Line } from "./Line";
import { LineFrustum } from "./LineFrustum";
import Sphere from "./Sphere";

/**
 * 绘制的顶点数据
 */
var VertData = {
    position: [
        0, 0, 0, 20, 0, 0,   //x轴
        0, 0, 0, 0, 20, 0,   //y轴
        0, 0, 0, 0, 0, 20    //z轴
    ]
}
/**
 * 光照摄像机
 */
export class LightCamera extends Node {
    constructor(){
        super();
        this.onInit();
    }
   
    onInit(): void {
        this._cameraMatrix = glMatrix.mat4.identity(null);
        this._projectMatrix = glMatrix.mat4.identity(null);
        this._lightReverseDir = new Float32Array(3);
        this._camera = GameMainCamera.instance.registerCamera(syRender.CameraType.Ortho,syRender.CameraUUid.light,G_Stage);
        this.addFrustum()
        this.addSmallSun();
        this.addLine();
        G_UISetting.pushRenderCallBack(this.render.bind(this))
    }
    protected collectRenderData(time): void {
        this._sunSprite.rotate(1, 1, 1);

        super.collectRenderData(time);
    }
    private _camera:OrthoCamera;
    private _cameraMatrix: Float32Array;   //相机矩阵
    private _projectMatrix: Float32Array;  //投影矩阵
    private _lightReverseDir: Float32Array;
    private _sunSprite: Sphere;
    private _lightLine: Line;
    private _frustum: LineFrustum;
    private addSmallSun(): void {
        this._sunSprite = new Sphere();
        this._sunSprite.setScale(0.3, 0.3, 0.3);
        this._sunSprite.spriteFrame = "res/light.jpg";
        this.addChild(this._sunSprite);
    }
    private addLine(): void {
        this._lightLine = new Line();
        this._lightLine.updateLinePos(VertData.position.concat([0, 0, 0, 1, 1, 1]));
        this.addChild(this._lightLine);
    }
    /**
     * 添加裁切空间
     */
    private addFrustum(): void {
        this._frustum = new LineFrustum();
        this.addChild(this._frustum);
    }

    private render(setting): void {
        this._camera.OrthoHeight = setting.lightProjHeight/2;
        this._camera.OrthoWidth = setting.lightProjWidth/2;
        this._camera.Near = 0.1;
        this._camera.Far = 50;
        this._camera.Fovy = 60;
        /**
         * lightWorldMatrix是光照摄像机的视野坐标系
         * x  y  z  p
         * 0  4  8  12
         * 1  5  9  13
         * 2  6  10 14 这个其实是光照方向
         * 3  7  11 15 
         * 
         * 1  0  0  0
         * 0  1  0  0
         * 0  0  1  0 这个其实是光照方向
         * 0  0  0  1 
         */
        this._camera.lookAt([setting.eyeX, setting.eyeY, setting.eyeZ],
            [setting.lightTargetX, setting.lightTargetY, setting.lightTargetZ],
            [0, 1, 0]);
        glMatrix.mat4.copy(this._cameraMatrix,this._camera.modelMatrix);
        glMatrix.vec3.normalize(this._lightReverseDir, this._cameraMatrix.slice(8, 11));
        this._camera.forceUpdateProjectMatrix()
        glMatrix.mat4.copy(this._projectMatrix,this._camera.getProjectionMatrix())
        
        var lightData = G_LightCenter.lightData;
        lightData.viewMatrix = this._cameraMatrix;
        lightData.projectionMatrix = this._projectMatrix;
        
    
        //取摄像机的中心方向作为聚光灯的方向
        lightData.spot.direction = [this._lightReverseDir[0], this._lightReverseDir[1], this._lightReverseDir[2]];
        this._lightLine.updateLinePos(VertData.position.concat([0, 0, 0, lightData.parallel.dirX, lightData.parallel.dirY, lightData.parallel.dirZ]));
        this._lightLine.color = [lightData.parallel.colR, lightData.parallel.colG, lightData.parallel.colB, lightData.parallel.colA];

        this._frustum.updateProjView(this._projectMatrix, this._cameraMatrix);
        this._sunSprite.setPosition(setting.eyeX, setting.eyeY, setting.eyeZ);
        this._lightLine.setPosition(setting.eyeX, setting.eyeY, setting.eyeZ);

      
    }
}