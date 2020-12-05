
import Device from "../../Device";
import { MathUtils } from "../../utils/MathUtils";
import Camera from "./Camera";
import enums from "./enums";
import OrthoCamera from "./OrthoCamera";
import PerspectiveCamera from "./PerspectiveCamera";

/**
 * 游戏主相机
 */
export default class GameMainCamera {
    private static _instance: GameMainCamera;
    public static get instance(): GameMainCamera {
        if (!this._instance) {
            var gl = Device.Instance.gl;
            this._instance = new GameMainCamera();
        }
        return this._instance;
    }

    private _2dCamera: OrthoCamera;
    private _3dCamera: PerspectiveCamera;
    private _cameraType: number;
    public setCamera(type: number, aspect: number, angle: number = 60, near: number = 0.1, far: number = 50): Camera {
        this._cameraType = type;
        if (type == enums.PROJ_PERSPECTIVE) {
            this._3dCamera = new PerspectiveCamera(angle * Math.PI / 180, aspect, near, far);
            // this.createUI();
            // this._3dCamera.showFrustum();
            return this._3dCamera;
        }
        else if (type == enums.PROJ_ORTHO) {
            this._2dCamera = new OrthoCamera(angle * Math.PI / 180, aspect, near, far);
            return this._2dCamera;
        }

    }
    public getCamera(type?): Camera {
        return type == enums.PROJ_PERSPECTIVE ? this._3dCamera : this._2dCamera;
    }
    public get3DCamera():PerspectiveCamera{
        return this._3dCamera;
    }
    public get2DCamera():OrthoCamera{
        return this._2dCamera;
    }
    
    //ui部分----------------------------------------------------------------------------
    private zNear = 10;//相机最近能看到的距离
    private zFar = 50;//相机最远能看到的距离
    private fieldOfView = 30;//相机张开的角度
    private zPosition = -25;//场景的位置
    private eyePosition = new Float32Array([31, 17, 15]);//相机的位置
    private eyeRotation = new Float32Array([0, 0, 0]);//相机的旋转

    public updateFieldOfView(event, ui) {
        this.fieldOfView = ui.value;
      }
      public updateZNear(event, ui) {
        this.zNear = ui.value;
      }
      public updateZFar(event, ui) {
        this.zFar = ui.value;
      }
      public updateZPosition(event, ui) {
        this.zPosition = ui.value;
      }
      public updateCamearXPos(event, ui) {
        this.eyePosition[0] = ui.value;
      }
      public updateCamearYPos(event, ui) {
        this.eyePosition[1] = ui.value;
      }
      public updateCamearZPos(event, ui) {
        this.eyePosition[2] = ui.value;
      }
      public updateCamearXRotation(event, ui) {
        this.eyeRotation[0] = MathUtils.degToRad(ui.value);
      }
      public updateCamearYRotation(event, ui) {
        this.eyeRotation[1] = MathUtils.degToRad(ui.value);
      }
      public updateCamearZRotation(event, ui) {
        this.eyeRotation[2] = MathUtils.degToRad(ui.value);
      }
    //创建相机UI
    private createUI():void{
        var webglLessonsUI = window["webglLessonsUI"];
        webglLessonsUI.setupSlider("#fieldOfView", { value: this.fieldOfView, slide: this.updateFieldOfView.bind(this), max: 179 });
        webglLessonsUI.setupSlider("#zNear", { value: this.zNear, slide: this.updateZNear.bind(this), min: 1, max: 50 });
        webglLessonsUI.setupSlider("#zFar", { value: this.zFar, slide: this.updateZFar.bind(this), min: 1, max: 50 });
        webglLessonsUI.setupSlider("#zPosition", { value: this.zPosition, slide: this.updateZPosition.bind(this), min: -60, max: 0 });
        webglLessonsUI.setupSlider("#cameraPosX", { value: this.eyePosition[0], slide: this.updateCamearXPos.bind(this), min: 1, max: 50 });//31
        webglLessonsUI.setupSlider("#cameraPosY", { value: this.eyePosition[1], slide: this.updateCamearYPos.bind(this), min: 1, max: 50 });//17
        webglLessonsUI.setupSlider("#cameraPosZ", { value: this.eyePosition[2], slide: this.updateCamearZPos.bind(this), min: 1, max: 50 });//15
        webglLessonsUI.setupSlider("#cameraRotateX", { value: this.eyeRotation[0], slide: this.updateCamearXRotation.bind(this), min: 0, max: 360 });//31
        webglLessonsUI.setupSlider("#cameraRotateY", { value: this.eyeRotation[1], slide: this.updateCamearYRotation.bind(this), min: 0, max: 360 });//17
        webglLessonsUI.setupSlider("#cameraRotateZ", { value: this.eyeRotation[2], slide: this.updateCamearZRotation.bind(this), min: 0, max: 360 });//15
    }

}