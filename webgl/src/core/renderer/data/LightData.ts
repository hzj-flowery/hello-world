import { sy } from "../../Director";
import { MathUtils } from "../../utils/MathUtils";
import { syRender } from "./RenderData";

/**
 * 物体呈现出颜色亮度就是表面的反射光导致，计算反射光公式如下：
<表面的反射光颜色> = <漫反射光颜色> + <环境反射光颜色> + <镜面反射光颜色>

1. 其中漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * <光线入射角度>

光线入射角度可以由光线方向和表面的法线进行点积求得：
<光线入射角度> = <光线方向> * <法线方向>

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
*/

export enum LightType {
    Parallel,  //平行光
    Point,     //点光
    Spot       //聚光
}
/**
 * 光照数据
 */
export class LightData {
    constructor() {
        this.reset();
    }
    private _fieldOfView: number = 120;//光张开的视角
    private _projWidth: number = 10;
    private _projHeight: number = 10;
    private _perspective: boolean = false;//是否为透视

    public viewMatrix:Float32Array;//光照摄像机的视口
    public projectionMatrix:Float32Array;//光照摄像机的投影

    public reset(): void {
        this.position = [0, 0, 0];
        this.parallel.direction = [8, 5, -10];      //平行光的方向
        this.parallel.color = [0.1, 0.1, 0.1, 1.0]; //平行光的颜色
        this.specular.shininess = 140;
        this.specular.color = [1.0, 0.0, 0.0, 1.0];
        this.ambient.color = [0.1, 0.1, 0.1, 1.0];//环境光
        this.point.color = [1.0, 1.0, 1.0, 1.0];//默认点光的颜色为红色

        this.spot.innerLimitAngle = 20;
        this.spot.outerLimitAngle = 30;
        this.spot.direction = [0, 0, 1];
        this.spot.color = [1, 0, 0, 1];

        this.fog.color = [0.8, 0.9, 1, 1];
        this.fog.density = 0.092;
    }

    public get perspective(): boolean {
        return this._perspective;
    }
    public set perspective(p: boolean) {
        this._perspective = p;
    }

    public get projWidth(): number { return this._projWidth };
    public set projWidth(p: number) { this._projWidth = p };
    public get projHeight(): number { return this._projHeight };
    public set projHeight(p: number) { this._projHeight = p };
    public get fieldOfView(): number { return this._fieldOfView };
    public set fieldOfView(p: number) { this._fieldOfView = p };


    /**
     * 光看向的位置
     */
    private _targetX: number = 3.5;//看向哪里
    private _targetY: number = 0;//看向哪里
    private _targetZ: number = 3.5;//看向哪里
    public get targetX(): number { return this._targetX };
    public set targetX(p: number) { this._targetX = p };
    public get targetY(): number { return this._targetY };
    public set targetY(p: number) { this._targetY = p };
    public get targetZ(): number { return this._targetZ };
    public set targetZ(p: number) { this._targetZ = p };
    public get targetPosition(): Array<number> {
        return [this._targetX, this._targetY, this._targetZ]
    }
    public set targetPosition(p: Array<number>) {
        this.targetX = p[0] ? p[0] : this._targetX;
        this.targetY = p[1] ? p[1] : this._targetY;
        this.targetZ = p[2] ? p[2] : this._targetZ;
    }
    //眼睛的位置
    private _eyeX: number = 0;
    private _eyeY: number = 0;
    private _eyeZ: number = 0;
    public get eyeX(): number { return this._eyeX };
    public set eyeX(p: number) { this._eyeX = p };
    public get eyeY(): number { return this._eyeY };
    public set eyeY(p: number) { this._eyeY = p };
    public get eyeZ(): number { return this._eyeZ };
    public set eyeZ(p: number) { this._eyeZ = p };
    public get position(): Array<number> {
        return [this._eyeX, this._eyeY, this._eyeZ];
    }
    public set position(p: Array<number>) {
        this.eyeX = p[0] ? p[0] : this._eyeX;
        this.eyeY = p[1] ? p[1] : this._eyeY;
        this.eyeZ = p[2] ? p[2] : this._eyeZ;
    }

    public shadow = new syRender.Light.Shadow();
    //雾
    public fog:syRender.Light.Fog = new syRender.Light.Fog();
    //聚光
    public spot: syRender.Light.Spot = new syRender.Light.Spot();

    //平行光
    public parallel: syRender.Light.Parallel = new syRender.Light.Parallel();
    //高光
    public specular: syRender.Light.Specular = new syRender.Light.Specular();

    //环境光
    public ambient: syRender.Light.Ambient = new syRender.Light.Ambient();

    //点光
    public point: syRender.Light.Point = new syRender.Light.Point();
}