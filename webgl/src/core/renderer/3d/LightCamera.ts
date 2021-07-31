import { glMatrix } from "../../math/Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { SY } from "../base/Sprite";
import { LightData } from "../data/LightData";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";

/**
 * 光照摄像机
 */
export class  LightCamera extends SY.SpriteBase {
    constructor() {
        super();
        this._glPrimitiveType = syGL.PrimitiveType.LINES;
    }
    private _lightWorldMatrix: Float32Array;
    private _lightProjectInverseMatrix: Float32Array;
    onInit():void{
        let position = [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            0,0,-1,
            0,0,1,
        ];
        let indices = [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            4, 5,
            5, 7,
            7, 6,
            6, 4,

            0, 4,
            1, 5,
            3, 7,
            2, 6,
            8,9,
        ];
        this.createVertexsBuffer(position,3);
        this.createIndexsBuffer(indices);
        this._lightWorldMatrix = glMatrix.mat4.identity(null);
        this._lightProjectInverseMatrix = glMatrix.mat4.identity(null);

        this._cameraMatrix = glMatrix.mat4.identity(null);
        this._projectMatrix = glMatrix.mat4.identity(null);
        this._lightReverseDir = new Float32Array(3);
    }
    protected collectRenderData(time):void{
        this.updateLightCameraData();
        glMatrix.mat4.invert(this._lightProjectInverseMatrix, this._projectMatrix)
        glMatrix.mat4.multiply(this._lightWorldMatrix, this._cameraMatrix, this._lightProjectInverseMatrix);
        this.createCustomMatrix(this._lightWorldMatrix);
         super.collectRenderData(time);
    }

    private _cameraMatrix:Float32Array;   //相机矩阵
    private _projectMatrix:Float32Array;  //投影矩阵
    private _lightReverseDir:Float32Array;  
    private _near:number = 0.1;
    private _far:number = 50;
    private _projWidth:number = 10;
    private _projHeight:number = 10;
    private _posX:number = 0;
    private _posY:number = 0;
    private _posZ:number = 0;
    private _targetX:number = 0;
    private _targetY:number = 0;
    private _targetZ:number = 0;

    /**
     * 获取光照摄像机数据
     */
    public updateLightCameraData() {

        var lightData:LightData = G_LightCenter.lightData;
        this._projWidth = lightData.projWidth;
        this._projHeight = lightData.projHeight;
        this._posX = lightData.eyeX;
        this._posY = lightData.eyeY;
        this._posZ = lightData.eyeZ;
        this._targetX = lightData.targetX;
        this._targetY = lightData.targetY;
        this._targetZ = lightData.targetZ;
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
            [this._posX, this._posY, this._posZ],          // position
            [this._targetX, this._targetY, this._targetZ], // target
            [0, 1, 0],                                              // up
        )
        glMatrix.vec3.normalize(this._lightReverseDir, this._cameraMatrix.slice(8, 11));
        lightData.perspective ? glMatrix.mat4.perspective(this._projectMatrix,
            MathUtils.degToRad(lightData.fieldOfView),
            this._projWidth / this._projHeight,
            this._near,  // near
            this._far)   // far
            : glMatrix.mat4.ortho(this._projectMatrix,
                -this._projWidth / 2,   // left
                this._projWidth / 2,   // right
                -this._projHeight / 2,  // bottom
                this._projHeight / 2,  // top
                this._near,                      // near
                this._far);                      // far
        
        //取摄像机的中心方向作为聚光灯的方向
        lightData.spot.direction = [this._lightReverseDir[0],this._lightReverseDir[1],this._lightReverseDir[2]];
    }
}