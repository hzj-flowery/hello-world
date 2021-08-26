
import { isNoSubstitutionTemplateLiteral } from "typescript";
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
    this.drawingOrder = syRender.DrawingOrder.Normal;
    this.uuid = syRender.CameraUUid.adapt;
    this.clearColor = [0.5, 0.5, 0.5, 1.0];
    this.viewPort = { x: 0, y: 0, w: 1, h: 1 };
    this.cColor = true;
    this.cDepth = true;
    this.cStencil = true;
  }
  public fb: WebGLFramebuffer;   //帧缓冲 null表示渲染到屏幕 否则渲染到其它缓冲
  public rtuuid:syRender.RenderTextureUUid;//渲染纹理的uuid
  public uuid:syRender.CameraUUid;//相机的uuid        
  public viewPort: any;
  public isClear: boolean;     //清除缓冲区的数据
  public clearColor: Array<number>;
  public cColor: boolean;//清除颜色缓存
  public cDepth: boolean;//清除深度缓存
  public cStencil: boolean;//清除模板缓存
  public VA: number = 0;//视角 0代表玩家自己 1代表别人视角 2代表别人视角 3代表别人视角 依次类推
  public VAPos: Array<number> = []; //视角的位置
  public drawingOrder: syRender.DrawingOrder;//绘制类型
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
   * 渲染纹理
   */
  private _renderTextureMap:Map<syRender.RenderTextureUUid,RenderTexture> = new Map();
  public  pushRenderTexture(uuid:syRender.RenderTextureUUid,tex:RenderTexture):void{
       if(this._renderTextureMap.has(uuid))
       {
         console.log("该渲染纹理已经加了啊");
         return;
       }
       this._renderTextureMap.set(uuid,tex)
  }
  public getRenderTexture(uuid:syRender.RenderTextureUUid){
      return this._renderTextureMap.get(uuid);
  }
  /**
   * 注册相机 
   * @param type 相机的类型 0表示透视相机 1表示正交相机 
   * @param uuid 
   * @param node 挂载的节点
   */
  public registerCamera(type: syRender.CameraType, uuid: syRender.CameraUUid, node: Node): Camera {
    var camera: Camera = this.createCamera(type, 60,this.gl.canvas.width / this.gl.canvas.height, 0.1, 1000);
    if (camera) {
      this.pushCamera(uuid, camera);
      node.addChild(camera)
    }
    return camera;
  }
  /**
   * 创建虚拟化摄像机
   * 所谓虚拟化 就是指该相机并不是真实存在 而是搭载在已有的基础相机身上去完成一些特殊的渲染
   * 系统自带的相机:base2d base3d
   * @param type  0透视 1正交
   * @param uuid 
   * @param drawOrder 
   */
  public createBaseVituralCamera(uuid: syRender.RenderTextureUUid, drawingOrder: syRender.DrawingOrder = syRender.DrawingOrder.Normal): void {
    var temp = new CameraRenderData();
    temp.fb = null;
    temp.rtuuid = uuid;
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 };
    temp.isClear = true;
    temp.clearColor = [0.3, 0.3, 0.3, 1.0]
    temp.VA = 0;
    temp.drawingOrder = drawingOrder;
    this._renderData.push(temp);
  }

  private init(): void {
    this.gl = Device.Instance.gl;
    this._renderTextureMap.set(syRender.RenderTextureUUid.screen,null)
  }
  private _cameraMap: Map<syRender.CameraUUid, Camera> = new Map();
  private _renderData: Array<CameraRenderData> = [];
  private gl: WebGLRenderingContext;
  private updateCameraData(uuid: syRender.CameraUUid, aspect: number, angle: number = 60, near: number = 0.1, far: number = 50): Camera {
    var camera = this._cameraMap.get(uuid)
    if (!camera) return;
    camera.Fovy = angle * Math.PI / 180;
    camera.Aspect = aspect;
    camera.Near = near;
    camera.Far = far;
    return camera;
  }
  private createCamera(type: syRender.CameraType, fovy: number, aspect: number, near: number, far: number): Camera {
    if (type == syRender.CameraType.Projection) {
      //透视相机
      return new PerspectiveCamera(fovy, aspect, near, far);
    }
    else if (type == syRender.CameraType.Ortho) {
      //正交相机
      return new OrthoCamera(fovy, aspect, near, far);
    }
  }
  public getCameraByUUid(uuid: syRender.CameraUUid): Camera {
    return this._cameraMap.get(uuid)
  }
  /**
   * 压入一个相机
   * @param uuid 
   * @param camera 
   * @param forceReplace 
   */
  private pushCamera(uuid: syRender.CameraUUid, camera: Camera, forceReplace: boolean = false): void {
    if (!this._cameraMap.has(uuid)) {
      this._cameraMap.set(uuid, camera);
    }
    else if (forceReplace) {
      this._cameraMap.set(uuid, camera);
    }
  }

  public initRenderData(): void {

    //离线渲染
    var temp = new CameraRenderData();
    temp.fb = null;
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.rtuuid = syRender.RenderTextureUUid.offline2D;
    temp.isClear = true;
    temp.VA = 0;
    this._renderData.push(temp);

    //光照相机
    var temp = new CameraRenderData();
    temp.fb = null;
    temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    temp.rtuuid = syRender.RenderTextureUUid.shadowMap;
    temp.uuid = syRender.CameraUUid.light;
    temp.isClear = true;
    temp.VA = 0;
    this._renderData.push(temp);
    
    
    //绘制深度
    // var temp = new CameraRenderData();
    // temp.fb = null;
    // temp.viewPort = { x: 0, y: 0, w: 1, h: 1 }
    // temp.rtuuid = syRender.RenderTextureUUid.Depth;
    // temp.isClear = true;
    // temp.VA = 0;
    // this._renderData.push(temp);
    
    

    
    //绘制左边
    var temp = new CameraRenderData();
    temp.fb = null;
    temp.rtuuid = syRender.RenderTextureUUid.screen;
    temp.viewPort = { x: 0, y: 0, w: 0.5, h: 1 }
    temp.isClear = true;
    temp.VA = 0;
    this._renderData.push(temp);
    
    //绘制右边
    var temp = new CameraRenderData();
    temp.fb = null;
    temp.rtuuid = syRender.RenderTextureUUid.screen;
    temp.viewPort = { x: 0.5, y: 0, w: 0.5, h: 1 }
    temp.isClear = false;
    temp.VAPos = [-70, 10, 10]
    temp.VA = 1;
    this._renderData.push(temp);


    G_UISetting.pushRenderCallBack(this.renderCallBack.bind(this));
  }
  /**
   * 
   */
  public getRenderData(): Array<CameraRenderData> {
    for (var k = 0; k < this._renderData.length; k++) {
      var rt = this.getRenderTexture(this._renderData[k].rtuuid)
      this._renderData[k].fb = rt?rt.frameBuffer:null;
    }
    return this._renderData;
  }

  private renderCallBack(settings: any): void {
    let gl = Device.Instance.gl;
    this.updateCameraData(syRender.CameraUUid.base3D, gl.canvas.width / gl.canvas.height, settings.cam3DFieldOfView, settings.cam3DNear, settings.cam3DFar);
    var base3D = this.getCameraByUUid(syRender.CameraUUid.base3D);
    if (base3D) {
      base3D.setPosition(settings.cam3DPosX, settings.cam3DPosY, settings.cam3DPosZ);
      base3D.setRotation(settings.cam3DRotX, settings.cam3DRotY, settings.cam3DRotZ);
    }
    var base2D = this.getCameraByUUid(syRender.CameraUUid.base2D);
    if (base2D) {
      base2D.setPosition(settings.cam2DPosX, settings.cam2DPosY, settings.cam2DPosZ);
      base2D.setRotation(settings.cam2DRotX, settings.cam2DRotY, settings.cam2DRotZ);
    }
  }
  
  private _customTexture:WebGLTexture;
  private setCustomTexture(tex:WebGLTexture):void{
       this._customTexture = tex;
  }
  public getCustomTexture():WebGLTexture{
       return this._customTexture;
  }

}