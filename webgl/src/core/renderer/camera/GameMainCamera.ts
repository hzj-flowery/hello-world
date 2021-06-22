
import Device from "../../Device";
import { G_UISetting } from "../../ui/UiSetting";
import { RenderTexture } from "../base/texture/RenderTexture";
import FrameBuffer from "../gfx/FrameBuffer";
import { glEnums } from "../gfx/GLapi";
import Camera from "./Camera";
import enums from "./enums";
import OrthoCamera from "./OrthoCamera";
import PerspectiveCamera from "./PerspectiveCamera";


export enum CameraIndex {
  min = 0,
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
export class CameraRenderData{
   public fb:FrameBuffer;
   public index:CameraIndex;
   public viewPort:any;
   public isClear:boolean;
   public isScene:boolean;
   public isRenderToScreen:boolean;
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

    this._cameraMap.set(CameraIndex.base2D, camera2D);
    this._cameraMap.set(CameraIndex.base3D, camera3D)
    this.initRenderData();
    G_UISetting.pushRenderCallBack(this.renderCallBack.bind(this));
  }
  private _cameraMap: Map<number, Camera> = new Map();
  private _renderData:Array<CameraRenderData> = [];
  private gl: WebGLRenderingContext;
  private updateCameraData(index: CameraIndex, aspect: number, angle: number = 60, near: number = 0.1, far: number = 50): Camera {
    var camera = this._cameraMap.get(index)
    camera.Fovy = angle * Math.PI / 180;
    camera.Aspect = aspect;
    camera.Near = near;
    camera.Far = far;
    return camera;
  }
  private createCamera(type:number,fovy:number,aspect:number,near:number,far:number):Camera{
      if(type==0)
      {
         //透视相机
         return new PerspectiveCamera(fovy,aspect,near,far);
      }
      else if(type==1)
      {
        //正交相机
         return new OrthoCamera(fovy,aspect,near,far);
      }
  }
  public getCameraIndex(index): Camera {
    return this._cameraMap.get(index)
  }
  public getBase3DCamera(): PerspectiveCamera {
    return this.getCameraIndex(CameraIndex.base3D) as PerspectiveCamera;
  }
  public getBase2DCamera(): OrthoCamera {
    return this.getCameraIndex(CameraIndex.base2D);
  }

  public initRenderData():void{
    this._renderData = [];
    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(CameraIndex.base2D).getFramebuffer()
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.index = CameraIndex.base2D;
    temp.isClear = true;
    temp.isScene = false;
    temp.isRenderToScreen = false;
    this._renderData.push(temp);

    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(CameraIndex.base3D).getFramebuffer()
    temp.index = CameraIndex.base3D;
    temp.viewPort = { x: 0, y: 0, w: 0.5, h: 1 }
    temp.isClear = true;
    temp.isScene = false;
    temp.isRenderToScreen = true;
    this._renderData.push(temp);

    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(CameraIndex.base3D).getFramebuffer()
    temp.index = CameraIndex.base3D;
    temp.viewPort = { x: 0.5, y: 0, w: 0.5, h: 1 }
    temp.isClear = false;
    temp.isScene = true;
    temp.isRenderToScreen = true;
    this._renderData.push(temp);
  }
  
  /**
   * 
   */
  public getRenderData():Array<CameraRenderData>{
        for(var k=0;k<this._renderData.length;k++)
        {
          this._renderData[k].fb = this.getCameraIndex(this._renderData[k].index).getFramebuffer()
        }
        return this._renderData;
  }

  private renderCallBack(settings: any): void {
    let gl = Device.Instance.gl;
    this.updateCameraData(CameraIndex.base3D, gl.canvas.width / gl.canvas.height, settings.cam3DFieldOfView, settings.cam3DNear, settings.cam3DFar);
    this.getCameraIndex(CameraIndex.base3D).setPosition(settings.cam3DPosX, settings.cam3DPosY, settings.cam3DPosZ);
    this.getCameraIndex(CameraIndex.base3D).setRotation(settings.cam3DRotX, settings.cam3DRotY, settings.cam3DRotZ);

    this.getCameraIndex(CameraIndex.base2D).setPosition(settings.cam2DPosX, settings.cam2DPosY, settings.cam2DPosZ);
    this.getCameraIndex(CameraIndex.base2D).setRotation(settings.cam2DRotX, settings.cam2DRotY, settings.cam2DRotZ)
  }

}