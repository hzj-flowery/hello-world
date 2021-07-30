import { MathUtils } from "../../utils/MathUtils";

export enum LightType {
    Parallel,  //平行光
    Point,     //点光
    Spot       //聚光
}

/**
 * 光照的基础数据
 */
export class LightBaseData {
    constructor() {

    }
    private _colR: number = 0;
    private _colG: number = 0;
    private _colB: number = 0;
    private _colA: number = 1.0;//透明通道
    public get colR(): number { return this._colR };
    public set colR(p: number) { this._colR = p };
    public get colG(): number { return this._colG };
    public set colG(p: number) { this._colG = p };
    public get colB(): number { return this._colB };
    public set colB(p: number) { this._colB = p };
    public get colA(): number { return this._colA };
    public set colA(p: number) { this._colA = p };
    public get color(): Array<number> {
        return [this._colR, this._colG, this._colB, this._colA];
    }
    public set color(p: Array<number>) {
        this.colR = p[0] ? p[0] : this._colR;
        this.colG = p[1] ? p[1] : this._colG;
        this.colB = p[2] ? p[2] : this._colB;
        this.colA = p[3] ? p[3] : this._colA;
    }
    private _posX: number = 0;
    private _posY: number = 0;
    private _posZ: number = 0;
    public get posX(): number { return this._posX };
    public set posX(p: number) { this._posX = p };
    public get posY(): number { return this._posY };
    public set posY(p: number) { this._posY = p };
    public get posZ(): number { return this._posZ };
    public set posZ(p: number) { this._posZ = p };
    public get position(): Array<number> {
        return [this._posX, this._posY, this._posZ];
    }
    public set position(p: Array<number>) {
        this.posX = p[0] ? p[0] : this._posX;
        this.posY = p[1] ? p[1] : this._posY;
        this.posZ = p[2] ? p[2] : this._posZ;
    }
    private _dirX: number = 0;
    private _dirY: number = 0;
    private _dirZ: number = 0;
    public get dirX(): number { return this._dirX };
    public set dirX(p: number) { this._dirX = p };
    public get dirY(): number { return this._dirY };
    public set dirY(p: number) { this._dirY = p };
    public get dirZ(): number { return this._dirZ };
    public set dirZ(p: number) { this._dirZ = p };
    public get direction(): Array<number> {
        return [this._dirX, this._dirY, this._dirZ];
    }
    public set direction(p: Array<number>) {
        this.dirX = p[0] ? p[0] : this._dirX;
        this.dirY = p[1] ? p[1] : this._dirY;
        this.dirZ = p[2] ? p[2] : this._dirZ;
    }

    //高光的时候使用
    private _specularShininess: number;//高光的指数(值越大光越小，值越小光越大)
    public get specularShininess(): number {
        return this._specularShininess;
    }
    public set specularShininess(p: number) {
        this._specularShininess = p;
    }

    //聚光
    private _spotInnerLimit: number;//聚光的内圈
    private _spotOuterLimit: number;//聚光的外圈
    public get spotInnerLimit(): number {
        return this._spotInnerLimit;
    }
    public set spotInnerLimit(angle: number) {
        this._spotInnerLimit = Math.cos(MathUtils.degToRad(angle));
    }
    public get spotOuterLimit(): number {
        return this._spotOuterLimit;
    }
    public set spotOuterLimit(angle: number) {
        this._spotOuterLimit = Math.cos(MathUtils.degToRad(angle));
    }

}
/**
 * 光照数据
 */
export class LightData {
    constructor() {
        this.reset();
    }
    private _fieldOfView: number = 120;//光张开的视角
    private _bias: number = 0.005;
    private _projWidth: number = 10;
    private _projHeight: number = 10;
    private _perspective: boolean = false;//是否为透视
    public reset(): void {
        this.position = [0, 0, 0];
        this.parallel.direction = [8, 5, -10];      //平行光的方向
        this.parallel.color = [0.1, 0.1, 0.1, 1.0]; //平行光的颜色
        this.specular.specularShininess = 140;
        this.specular.color = [1.0, 0.0, 0.0, 1.0];
        this.ambient.color = [0.1, 0.1, 0.1, 1.0];//环境光
        this.point.color = [1.0, 1.0, 1.0, 1.0];//默认点光的颜色为红色

        this.spot.spotInnerLimit = Math.cos(MathUtils.degToRad(20));
        this.spot.spotOuterLimit = Math.cos(MathUtils.degToRad(30));
        this.spot.direction = [0, 0, 1];
        this.spot.color = [0, 1, 0, 1];

        this.fogColor = [0.8, 0.9, 1, 1];
        this.fogDensity = 0.092;
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
    public get bias(): number { return this._bias };
    public set bias(p: number) { this._bias = p };
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

    //雾
    private _fogDensity: number;//雾的密度
    private _fogColR: number = 0;
    private _fogColG: number = 0;
    private _fogColB: number = 0;
    private _fogColA: number = 1.0;//透明通道
    public get fogColR(): number { return this._fogColR };
    public set fogColR(p: number) { this._fogColR = p };
    public get fogColG(): number { return this._fogColG };
    public set fogColG(p: number) { this._fogColG = p };
    public get fogColB(): number { return this._fogColB };
    public set fogColB(p: number) { this._fogColB = p };
    public get fogColA(): number { return this._fogColA };
    public set fogColA(p: number) { this._fogColA = p };
    public get fogColor(): Array<number> {
        return [this._fogColR, this._fogColG, this._fogColB, this._fogColA];
    }
    public set fogColor(p: Array<number>) {
        this.fogColR = p[0] ? p[0] : this._fogColR;
        this.fogColG = p[1] ? p[1] : this._fogColG;
        this.fogColB = p[2] ? p[2] : this._fogColB;
        this.fogColA = p[3] ? p[3] : this._fogColA;
    }
    public get fogDensity() {
        return this._fogDensity;
    }
    public set fogDensity(p: number) {
        this._fogDensity = p;
    }


    //聚光
    public spot: LightBaseData = new LightBaseData();

    //平行光
    public parallel: LightBaseData = new LightBaseData();
    //高光
    public specular: LightBaseData = new LightBaseData();

    //环境光
    public ambient: LightBaseData = new LightBaseData();

    //点光
    public point: LightBaseData = new LightBaseData();
}