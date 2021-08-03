import { glMatrix } from "../../math/Matrix";
import { G_UISetting } from "../../ui/UiSetting";
import { MathUtils } from "../../utils/MathUtils";
import { LightData } from "../data/LightData";

/**
 * 物体呈现出颜色亮度就是表面的反射光导致，计算反射光公式如下：
<表面的反射光颜色> = <漫反射光颜色> + <环境反射光颜色> + <镜面反射光颜色>

1. 其中漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * <光线入射强度>

光线入射角度可以由光线方向和表面的法线进行点积求得：
<光线入射强度> = <光线方向> * <法线方向>

最后的漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * (<光线方向> * <法线方向>)

2. 环境反射光颜色根据如下公式得到：
<环境反射光颜色> = <入射光颜色> * <表面基底色>

3. 镜面（高光）反射光颜色公式，这里使用的是冯氏反射原理
<镜面反射光颜色> = <高光颜色> * <镜面反射亮度权重> 

其中镜面反射亮度权重又如下
<镜面反射亮度权重> = (<观察方向的单位向量> * <入射光反射方向>) ^ 光泽度
 */

/**
* 光照知识1：
* 使用环境光源的时候，需要注意颜色的亮度。环境光照的是全部，比如上面的代码中指定的0.1，如果全都换成1.0的话，模型就会变成全白了。和平行光源不一样，所以要注意。
  环境光的颜色，最好是限制在0.2左右以下
* 环境光，模拟了自然界的光的漫反射，弥补了平行光源的缺点。一般，这两种光会同时使用。只使用环境光的话，无法表现出模型的凹凸，只使用平行光源的话，阴影过于严重无法分清模型的轮廓
  环境光是没有方向的

  平行光：这个光一般指的是太阳光，是一种有方向有颜色但是不会衰减的光，你可以理解为它是没有位置的
*/

class LightCenter {
    constructor() {
        this._lightData = new LightData();
    }
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
    public reset() {
        this._lightData.reset();
    }

    public render(setting: any): void {

        
        //平行光
        this._lightData.parallel.colR = setting.parallelColR;
        this._lightData.parallel.colG = setting.parallelColG;
        this._lightData.parallel.colB = setting.parallelColB;
        this._lightData.parallel.colA = setting.parallelColA;
        this._lightData.parallel.dirX = setting.parallelDirX;
        this._lightData.parallel.dirY = setting.parallelDirY;
        this._lightData.parallel.dirZ = setting.parallelDirZ;
        
        //聚光
        this._lightData.spot.innerLimitAngle = setting.spotInnerLimit;
        this._lightData.spot.outerLimitAngle = setting.spotOuterLimit;
        this._lightData.spot.dirX = setting.spotDirX;
        this._lightData.spot.dirY = setting.spotDirY;
        this._lightData.spot.dirZ = setting.spotDirZ;
        this._lightData.spot.colR = setting.spotColR;
        this._lightData.spot.colG = setting.spotColG;
        this._lightData.spot.colB = setting.spotColB;
        this._lightData.spot.colA = setting.spotColA;

        //高光
        this._lightData.specular.colR = setting.specularColR;
        this._lightData.specular.colG = setting.specularColG;
        this._lightData.specular.colB = setting.specularColB;
        this._lightData.specular.colA = setting.specularColA;
        this.lightData.specular.shininess = setting.specularShininess;

        //环境光
        this._lightData.ambient.colR = setting.ambientColR;
        this._lightData.ambient.colG = setting.ambientColG;
        this._lightData.ambient.colB = setting.ambientColB;
        this._lightData.ambient.colA = setting.ambientColA;
        
        //雾
        this._lightData.fog.colR = setting.fogColR;
        this._lightData.fog.colG = setting.fogColG;
        this._lightData.fog.colB = setting.fogColB;
        this._lightData.fog.colA = setting.fogColA;
        this._lightData.fog.density = setting.fogDensity;

        //点光
        this._lightData.point.colR = setting.pointColR;
        this._lightData.point.colG = setting.pointColG;
        this._lightData.point.colB = setting.pointColB;
        this._lightData.point.colA = setting.pointColA;


        this._posX =  this._lightData.eyeX = setting.eyeX;
        this._posY = this._lightData.eyeY = setting.eyeY;
        this._posZ =  this._lightData.eyeZ = setting.eyeZ;
        this._targetX = this._lightData.targetX = setting.lightTargetX;
        this._targetY =  this._lightData.targetY = setting.lightTargetY;
        this._targetZ =  this._lightData.targetZ = setting.lightTargetZ;

        this._projHeight = this._lightData.projHeight = setting.lightProjHeight;
        this._projWidth =  this._lightData.projWidth = setting.lightProjWidth;
        this._lightData.fieldOfView = setting.lightFieldOfView;
        this._lightData.shadowBias = setting.lightBias;
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
            [this._posX, this._posY, this._posZ],          // position
            [this._targetX, this._targetY, this._targetZ], // target
            [0, 1, 0],                                              // up
        )
        glMatrix.vec3.normalize(this._lightReverseDir, this._cameraMatrix.slice(8, 11));
        this._lightData.perspective ? glMatrix.mat4.perspective(this._projectMatrix,
            MathUtils.degToRad(this._lightData.fieldOfView),
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
        return {
            mat: this._cameraMatrix,
            reverseDir: this._lightReverseDir,
            project: this._projectMatrix,
            pos: [this._posX, this._posY, this._posZ]
        }
    }
}
export var G_LightCenter = new LightCenter();