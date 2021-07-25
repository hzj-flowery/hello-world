
import Device from "../../Device";
import { sy } from "../../Director";
import { G_UISetting } from "../../ui/UiSetting";
import { Node } from "../base/Node";
import { RenderTexture } from "../base/texture/RenderTexture";
import { syRender } from "../data/RenderData";
import FrameBuffer from "../gfx/FrameBuffer";
import { glEnums } from "../gfx/GLapi";
import { Shader } from "../shader/Shader";
import Camera from "./Camera";
import enums from "./enums";
import OrthoCamera from "./OrthoCamera";
import PerspectiveCamera from "./PerspectiveCamera";



export class CameraRenderData {
  constructor() {
    this.drawType = syRender.DrawType.Normal;
    this.clearColor = [0.5, 0.5, 0.5, 1.0];
    this.viewPort = { x: 0, y: 0, w: 1, h: 1 };
    this.cColor = true;
    this.cDepth = true;
    this.cStencil = true;
  }
  public fb: FrameBuffer;   //帧缓冲 null表示渲染到屏幕 否则渲染到其它缓冲
  public uuid: syRender.CameraUUid; //相机的uuid
  public viewPort: any;
  public isClear: boolean;     //清除缓冲区的数据
  public clearColor: Array<number>;
  public cColor: boolean;//清除颜色缓存
  public cDepth: boolean;//清除深度缓存
  public cStencil: boolean;//清除模板缓存
  public VA: number = 0;//视角 0代表玩家自己 1代表别人视角 2代表别人视角 3代表别人视角 依次类推
  public VAPos: Array<number> = []; //视角的位置
  public drawType: syRender.DrawType;//绘制类型
  public isSecondVisualAngle(): boolean {
    return this.VA == 1;
  }
  public isFirstVisualAngle(): boolean {
    return this.VA == 0;
  }
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

  /**
   * 注册相机 
   * @param type 相机的类型 0表示透视相机 1表示正交相机 
   * @param cameraIdex 
   * @param node 挂载的节点
   */
  public registerCamera(type: number, cameraIdex: syRender.CameraUUid, node: Node): void {
    var camera: Camera;
    if (type == 0) {
      camera = this.createCamera(0, this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 100) as PerspectiveCamera;
    }
    else if (type == 1) {
      camera = this.createCamera(1, this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 1000);
    }
    if (camera) {
      this.pushCamera(cameraIdex, camera);
      node.addChild(camera)
    }
  }
  /**
   * 创建虚拟化相机
   * 
   * @param type  0透视 1正交
   * @param cameraIdex 
   * @param drawType 
   */
  public createVituralCamera(type, cameraIdex: syRender.CameraUUid, drawType: syRender.DrawType = syRender.DrawType.Normal): void {
    if (this._cameraMap.has(cameraIdex)) {
      return;
    }
    var camera: Camera;
    if (type == 0) {
      camera = this.createCamera(0, this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 100) as PerspectiveCamera;
    }
    else if (type == 1) {
      camera = this.createCamera(1, this.gl.canvas.width / this.gl.canvas.height, 60, 0.1, 1000);
    }
    if (camera) {
      this.pushCamera(cameraIdex, camera);
      this.pushVirtualCameraDataToRenderData(cameraIdex, drawType);
    }
  }

  private init(): void {
    this.gl = Device.Instance.gl;
  }
  private _cameraMap: Map<number, Camera> = new Map();
  private _renderData: Array<CameraRenderData> = [];
  private gl: WebGLRenderingContext;
  private updateCameraData(index: syRender.CameraUUid, aspect: number, angle: number = 60, near: number = 0.1, far: number = 50): Camera {
    var camera = this._cameraMap.get(index)
    if (!camera) return;
    camera.Fovy = angle * Math.PI / 180;
    camera.Aspect = aspect;
    camera.Near = near;
    camera.Far = far;
    return camera;
  }
  private createCamera(type: number, fovy: number, aspect: number, near: number, far: number): Camera {
    if (type == 0) {
      //透视相机
      return new PerspectiveCamera(fovy, aspect, near, far);
    }
    else if (type == 1) {
      //正交相机
      return new OrthoCamera(fovy, aspect, near, far);
    }
  }
  public getCameraIndex(index): Camera {
    return this._cameraMap.get(index)
  }
  private pushCamera(index: number, camera: Camera, forceReplace: boolean = false): void {
    if (!this._cameraMap.has(index)) {
      this._cameraMap.set(index, camera);
    }
    else if (forceReplace) {
      this._cameraMap.set(index, camera);
    }
  }

  public initRenderData(): void {
    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(syRender.CameraUUid.base2D).getFramebuffer()
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.uuid = syRender.CameraUUid.base2D;
    temp.isClear = true;
    temp.VA = 0;
    this._renderData.push(temp);

    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(syRender.CameraUUid.Depth).getFramebuffer()
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.uuid = syRender.CameraUUid.Depth;
    temp.isClear = true;
    temp.VA = 0;
    this._renderData.push(temp);

    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(syRender.CameraUUid.base3D).getFramebuffer()
    temp.uuid = syRender.CameraUUid.base3D;
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.isClear = true;
    temp.VA = 0;
    this._renderData.push(temp);

    // var temp = new CameraRenderData();
    // temp.fb = this.getCameraIndex(syRender.CameraUUid.base3D).getFramebuffer()
    // temp.uuid = syRender.CameraUUid.base3D;
    // temp.viewPort = { x: 0.5, y: 0, w: 0.5, h: 1 }
    // temp.isClear = false;
    // temp.VAPos = [-70,10,10]
    // temp.VA = 1;
    // this._renderData.push(temp);

    // var temp = new CameraRenderData();
    // temp.fb = this.getCameraIndex(syRender.CameraUUid.base3D).getFramebuffer()
    // temp.uuid = syRender.CameraUUid.base3D;
    // temp.viewPort = { x: 0.65, y: 0, w: 0.15, h: 1 }
    // temp.isClear = false;
    // temp.VAPos = [70,10,10]
    // temp.VA = 2;
    // this._renderData.push(temp);

    // var temp = new CameraRenderData();
    // temp.fb = this.getCameraIndex(syRender.CameraUUid.base3D).getFramebuffer()
    // temp.uuid = syRender.CameraUUid.base3D;
    // temp.viewPort = { x: 0.8, y: 0, w: 0.2, h: 1 }
    // temp.isClear = false;
    // temp.VAPos = [10,10,10]
    // temp.VA = 3;
    // this._renderData.push(temp);

    G_UISetting.pushRenderCallBack(this.renderCallBack.bind(this));
  }

  private pushVirtualCameraDataToRenderData(index: syRender.CameraUUid, drawType: syRender.DrawType = syRender.DrawType.Normal): void {
    var temp = new CameraRenderData();
    temp.fb = this.getCameraIndex(index).getFramebuffer()
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.uuid = index;
    temp.isClear = true;
    temp.clearColor = [0.3, 0.3, 0.3, 1.0]
    temp.VA = 0;
    temp.drawType = drawType;
    this._renderData.push(temp);
  }

  /**
   * 
   */
  public getRenderData(): Array<CameraRenderData> {
    for (var k = 0; k < this._renderData.length; k++) {
      this._renderData[k].fb = this.getCameraIndex(this._renderData[k].uuid).getFramebuffer()
    }
    return this._renderData;
  }

  private renderCallBack(settings: any): void {
    let gl = Device.Instance.gl;
    this.updateCameraData(syRender.CameraUUid.base3D, gl.canvas.width / gl.canvas.height, settings.cam3DFieldOfView, settings.cam3DNear, settings.cam3DFar);
    var base3D = this.getCameraIndex(syRender.CameraUUid.base3D);
    if (base3D) {
      base3D.setPosition(settings.cam3DPosX, settings.cam3DPosY, settings.cam3DPosZ);
      base3D.setRotation(settings.cam3DRotX, settings.cam3DRotY, settings.cam3DRotZ);
    }
    var base2D = this.getCameraIndex(syRender.CameraUUid.base2D);
    if (base2D) {
      base2D.setPosition(settings.cam2DPosX, settings.cam2DPosY, settings.cam2DPosZ);
      base2D.setRotation(settings.cam2DRotX, settings.cam2DRotY, settings.cam2DRotZ);
    }
  }

}