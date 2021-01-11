
import Device from "../../Device";
import { G_UISetting } from "../../ui/UiSetting";
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
      this._instance = new GameMainCamera();

      this._instance.init();
    }
    return this._instance;
  }

  private init(): void {
    this.gl = Device.Instance.gl;
    //初始化2D相机
    this._2dCamera = new OrthoCamera(this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 1000);
    // this._2dCamera.lookAt([0, 0, 0]);
    //初始化3D相机
    this._3dCamera = new PerspectiveCamera(this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 50) as PerspectiveCamera;

    G_UISetting.pushRenderCallBack(this.renderCallBack.bind(this));
  }

  private _2dCamera: OrthoCamera;
  private _3dCamera: PerspectiveCamera;
  private _cameraType: number;
  private gl: WebGLRenderingContext;
  private updateCameraData(type: number, aspect: number, angle: number = 60, near: number = 0.1, far: number = 50): Camera {
    this._cameraType = type;
    if (type == enums.PROJ_PERSPECTIVE) {

      this._3dCamera.Fovy = angle * Math.PI / 180;
      this._3dCamera.Aspect = aspect;
      this._3dCamera.Near = near;
      this._3dCamera.Far = far;
      return this._3dCamera;
    }
    else if (type == enums.PROJ_ORTHO) {
      this._2dCamera.Fovy = angle * Math.PI / 180;
      this._2dCamera.Aspect = aspect;
      this._2dCamera.Near = near;
      this._2dCamera.Far = far;
      return this._2dCamera;
    }

  }
  public getCamera(type?): Camera {
    return type == enums.PROJ_PERSPECTIVE ? this._3dCamera : this._2dCamera;
  }
  public get3DCamera(): PerspectiveCamera {
    return this._3dCamera;
  }
  public get2DCamera(): OrthoCamera {
    return this._2dCamera;
  }

  private renderCallBack(settings:any):void{
    let gl = Device.Instance.gl;
    this.updateCameraData(enums.PROJ_PERSPECTIVE, gl.canvas.width / gl.canvas.height,settings.cam3DFieldOfView,settings.cam3DNear,settings.cam3DFar);
    this._3dCamera.setPosition(settings.cam3DPosX,settings.cam3DPosY,settings.cam3DPosZ);
    this._3dCamera.setRotation(settings.cam3DRotX,settings.cam3DRotY,settings.cam3DRotZ);

    this._2dCamera.setPosition(settings.cam2DPosX,settings.cam2DPosY,settings.cam2DPosZ);
    this._2dCamera.setRotation(settings.cam2DRotX,settings.cam2DRotY,settings.cam2DRotZ)
}

}