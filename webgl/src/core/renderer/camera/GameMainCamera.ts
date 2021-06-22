
import Device from "../../Device";
import { G_UISetting } from "../../ui/UiSetting";
import Camera from "./Camera";
import enums from "./enums";
import OrthoCamera from "./OrthoCamera";
import PerspectiveCamera from "./PerspectiveCamera";


export enum CameraIndex{
      min=0,
      base2D,
      base3D,
      normal1,
      normal2,
      normal3,
      normal4,
      normal5,
      normal6,
      normal7,
      normal8,
      normal9,
      max
}
/**
 * 游戏主相机
 */
export class GameMainCamera {
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
    var camera2D = new OrthoCamera(this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 1000);
    // this._2dCamera.lookAt([0, 0, 0]);
    //初始化3D相机
    var camera3D = new PerspectiveCamera(this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 50) as PerspectiveCamera;


    this._cameraMap.set(CameraIndex.base2D,camera2D);
    this._cameraMap.set(CameraIndex.base3D,camera3D)

    G_UISetting.pushRenderCallBack(this.renderCallBack.bind(this));
  }
  private _cameraMap:Map<number,Camera> = new Map();
  private gl: WebGLRenderingContext;
  private updateCameraData(index: CameraIndex, aspect: number, angle: number = 60, near: number = 0.1, far: number = 50): Camera {
    var camera =  this._cameraMap.get(index)
    camera.Fovy = angle * Math.PI / 180;
    camera.Aspect = aspect;
    camera.Near = near;
    camera.Far = far;
    return camera;

  }
  public getCameraIndex(index):Camera{
       return this._cameraMap.get(index)
  }
  public getCamera(type?): Camera {
    return type == enums.PROJ_PERSPECTIVE ? this.getCameraIndex(CameraIndex.base3D) : this.getCameraIndex(CameraIndex.base2D);
  }
  public get3DCamera(): PerspectiveCamera {
    return this.getCameraIndex(CameraIndex.base3D) as PerspectiveCamera;
  }
  public get2DCamera(): OrthoCamera {
    return this.getCameraIndex(CameraIndex.base2D);
  }

  private renderCallBack(settings:any):void{
    let gl = Device.Instance.gl;
    this.updateCameraData(CameraIndex.base3D, gl.canvas.width / gl.canvas.height,settings.cam3DFieldOfView,settings.cam3DNear,settings.cam3DFar);
    this.getCameraIndex(CameraIndex.base3D).setPosition(settings.cam3DPosX,settings.cam3DPosY,settings.cam3DPosZ);
    this.getCameraIndex(CameraIndex.base3D).setRotation(settings.cam3DRotX,settings.cam3DRotY,settings.cam3DRotZ);

    this.getCameraIndex(CameraIndex.base2D).setPosition(settings.cam2DPosX,settings.cam2DPosY,settings.cam2DPosZ);
    this.getCameraIndex(CameraIndex.base2D).setRotation(settings.cam2DRotX,settings.cam2DRotY,settings.cam2DRotZ)
}

}