import { glMatrix } from "../../Matrix";
import { G_UISetting } from "../../ui/UiSetting";
import { MathUtils } from "../../utils/MathUtils";
import { LightData } from "../data/LightData";

class LightCenter {
    constructor() {
        this._lightData = new LightData();
    }
    public init(): void {
        this._cameraMatrix = glMatrix.mat4.identity(null);
        this._projectMatrix = glMatrix.mat4.identity(null);
        this._lightReverseDir = new Float32Array(3);
        G_UISetting.pushRenderCallBack(this.render.bind(this));
    }
    private _lightData: LightData;
    public get lightData() {
        return this._lightData;
    }
    public setData(pos: Array<number>, dir: Array<number>, color: Array<number>): void {
        this._lightData.setData(pos, dir, color)
    }
    public reset() {
        this._lightData.reset();
    }

    public render(setting: any): void {

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
    
    private _cameraMatrix:Float32Array;
    private _projectMatrix:Float32Array;
    private _lightReverseDir:Float32Array;
    /**
     * 获取光照摄像机数据
     */
    public updateLightCameraData() {
        // first draw from the POV of the light
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
        glMatrix.mat4.lookAt2(this._cameraMatrix,
            [this._lightData.posX, this._lightData.posY, this._lightData.posZ],          // position
            [this._lightData.targetX, this._lightData.targetY, this._lightData.targetZ], // target
            [0, 1, 0],                                              // up
        )
        glMatrix.vec3.normalize(this._lightReverseDir, this._cameraMatrix.slice(8, 11));
        this._lightData.perspective ? glMatrix.mat4.perspective(this._projectMatrix,
            MathUtils.degToRad(this._lightData.fieldOfView),
            this._lightData.projWidth / this._lightData.projHeight,
            0.5,  // near
            1000)   // far
            : glMatrix.mat4.ortho(this._projectMatrix,
                -this._lightData.projWidth / 2,   // left
                this._lightData.projWidth / 2,   // right
                -this._lightData.projHeight / 2,  // bottom
                this._lightData.projHeight / 2,  // top
                0.5,                      // near
                1000);                      // far
        return {
            mat: this._cameraMatrix,
            reverseDir: this._lightReverseDir,
            project: this._projectMatrix,
            pos: [this._lightData.posX, this._lightData.posY, this._lightData.posZ]
        }
    }

}
export var G_LightCenter = new LightCenter();