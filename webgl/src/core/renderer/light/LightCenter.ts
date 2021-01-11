import { G_UISetting } from "../../ui/UiSetting";
import { LightData } from "../data/LightData";

class  LightCenter {
    constructor() {
        this._lightData = new LightData();
    }
    public init():void{
        G_UISetting.pushRenderCallBack(this.render.bind(this))
    }
    private _lightData:LightData;
    public get lightData(){
        return this._lightData;
    }
    public setData(pos: Array<number>, dir: Array<number>, color: Array<number>):void{
        this._lightData.setData(pos,dir,color)
    }
    public reset(){
        this._lightData.reset();
    }

    public render(setting:any):void{

         this._lightData.posX = setting.lightPosX;
         this._lightData.posY = setting.lightPosY;
         this._lightData.posZ = setting.lightPosZ;

         this._lightData.colR = setting.lightColorR;
         this._lightData.colG = setting.lightColorG;
         this._lightData.colB = setting.lightColorB;
         this._lightData.colA = setting.lightColorA;

         this._lightData.dirX = setting.lightDirX;
         this._lightData.dirY = setting.lightDirY;
         this._lightData.dirZ = setting.lightDirZ;

         this._lightData.targetX = setting.lightTargetX;
         this._lightData.targetY = setting.lightTargetY;
         this._lightData.targetZ = setting.lightTargetZ;

         this._lightData.projHeight = setting.lightProjHeight;
         this._lightData.projWidth = setting.lightProjWidth;
         this._lightData.fieldOfView = setting.lightFieldOfView;
         this._lightData.bias = setting.lightBias;
    }

}
export var G_LightCenter = new LightCenter();