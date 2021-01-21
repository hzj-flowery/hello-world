import { MathUtils } from "../../utils/MathUtils";

/**
 * 光照数据
 */
export class LightData {
    constructor() {
        this.reset();
    }
    private _specularColor: Array<number>;//高光的颜色
    private _specularShininess: number;//高光的指数(值越大光越小，值越小光越大)
    private _ambientColor: Array<number>;//环境光颜色
    private _pointColor: Array<number>;//点光的颜色
    private _spotInnerLimit: number;//聚光的内圈
    private _spotOuterLimit: number;//聚光的外圈
    private _spotColor: Array<number>;//聚光的颜色
    private _spotDirection: Array<number>;//聚光的方向
    private _posX: number = 0;
    private _posY: number = 0;
    private _posZ: number = 0;

    //1组平行光的方向和颜色
    private _parallelDirX: number = 0;
    private _parallelDirY: number = 0;
    private _parallelDirZ: number = 0;
    private _parallelColR: number = 0;
    private _parallelColG: number = 0;
    private _parallelColB: number = 0;
    private _parallelColA: number = 1.0;//透明通道

    private _targetX: number = 3.5;//看向哪里
    private _targetY: number = 0;//看向哪里
    private _targetZ: number = 3.5;//看向哪里

    private _fieldOfView: number = 120;//光张开的视角
    private _bias: number = 0.005;
    private _projWidth: number = 10;
    private _projHeight: number = 10;
    private _perspective: boolean = false;//是否为透视
    public reset(): void {
        this.position = [0, 0, 0];
        this.parallelDirection = [8, 5, -10];      //平行光的方向
        this.parallelColor = [0.1, 0.1, 0.1, 1.0]; //平行光的颜色
        this._specularShininess = 140;
        this._specularColor = [1.0, 0.0, 0.0, 1.0];
        this._ambientColor = [0.1, 0.1, 0.1, 1.0];
        this._pointColor = [1.0, 1.0, 1.0, 1.0];//默认点光的颜色为红色

        this._spotInnerLimit = MathUtils.degToRad(20);
        this._spotOuterLimit = MathUtils.degToRad(30);
        this._spotDirection = [0, 0, 1];
        this._spotColor = [0, 1, 0, 1];
    }
    public get perspective(): boolean {
        return this._perspective;
    }
    public set perspective(p: boolean) {
        this._perspective = p;
    }
    public set spotDirection(dir: Array<number>) {
        this._spotDirection = dir;
    }
    public get spotDirection(): Array<number> {
        return this._spotDirection;
    }
    public set spotColor(color: Array<number>) {
        this._spotColor = color;
    }
    public get spotColor(): Array<number> {
        return this._spotColor;
    }
    public get spotInnerLimit(): number {
        return this._spotInnerLimit;
    }
    public set spotInnerLimit(angle:number) {
        this._spotInnerLimit = MathUtils.degToRad(angle);
    }
    public get spotOuterLimit(): number {
        return this._spotOuterLimit;
    }
    public set spotOuterLimit(angle:number) {
        this._spotOuterLimit = MathUtils.degToRad(angle);
    }
    public get projWidth(): number { return this._projWidth };
    public set projWidth(p: number) { this._projWidth = p };
    public get projHeight(): number { return this._projHeight };
    public set projHeight(p: number) { this._projHeight = p };
    public get bias(): number { return this._bias };
    public set bias(p: number) { this._bias = p };
    public get fieldOfView(): number { return this._fieldOfView };
    public set fieldOfView(p: number) { this._fieldOfView = p };
    public get targetX(): number { return this._targetX };
    public set targetX(p: number) { this._targetX = p };
    public get targetY(): number { return this._targetY };
    public set targetY(p: number) { this._targetY = p };
    public get targetZ(): number { return this._targetZ };
    public set targetZ(p: number) { this._targetZ = p };

    public get posX(): number { return this._posX };
    public set posX(p: number) { this._posX = p };
    public get posY(): number { return this._posY };
    public set posY(p: number) { this._posY = p };
    public get posZ(): number { return this._posZ };
    public set posZ(p: number) { this._posZ = p };
    public get dirX(): number { return this._parallelDirX };
    public set dirX(p: number) { this._parallelDirX = p };
    public get dirY(): number { return this._parallelDirY };
    public set dirY(p: number) { this._parallelDirY = p };
    public get dirZ(): number { return this._parallelDirZ };
    public set dirZ(p: number) { this._parallelDirZ = p };
    public get colR(): number { return this._parallelColR };
    public set colR(p: number) { this._parallelColR = p };
    public get colG(): number { return this._parallelColG };
    public set colG(p: number) { this._parallelColG = p };
    public get colB(): number { return this._parallelColB };
    public set colB(p: number) { this._parallelColB = p };
    public get colA(): number { return this._parallelColA };
    public set colA(p: number) { this._parallelColA = p };

    /**
     * 光看向的位置
     */
    public get targetPosition(): Array<number> {
        return [this._targetX, this._targetY, this._targetZ]
    }
    public set targetPosition(p: Array<number>) {
        this.targetX = p[0] ? p[0] : this._targetX;
        this.targetY = p[1] ? p[1] : this._targetY;
        this.targetZ = p[2] ? p[2] : this._targetZ;
    }
    public get position(): Array<number> {
        return [this._posX, this._posY, this._posZ];
    }
    public set position(p: Array<number>) {
        this.posX = p[0] ? p[0] : this._posX;
        this.posY = p[1] ? p[1] : this._posY;
        this.posZ = p[2] ? p[2] : this._posZ;
    }
    public get parallelDirection(): Array<number> {
        return [this._parallelDirX, this._parallelDirY, this._parallelDirZ];
    }
    public set parallelDirection(p: Array<number>) {
        this.dirX = p[0] ? p[0] : this._parallelDirX;
        this.dirY = p[1] ? p[1] : this._parallelDirY;
        this.dirZ = p[2] ? p[2] : this._parallelDirZ;
    }
    public get parallelColor(): Array<number> {
        return [this._parallelColR, this._parallelColG, this._parallelColB, this._parallelColA];
    }
    public set parallelColor(p: Array<number>) {
        this.colR = p[0] ? p[0] : this._parallelColR;
        this.colG = p[1] ? p[1] : this._parallelColG;
        this.colB = p[2] ? p[2] : this._parallelColB;
        this.colA = p[3] ? p[3] : this._parallelColA;
    }
    public get specularColor(): Array<number> {
        return this._specularColor;
    }
    public set specularColor(p: Array<number>) {
        this._specularColor = p;
    }
    public get specularShininess(): number {
        return this._specularShininess;
    }
    public get ambientColor(): Array<number> {
        return this._ambientColor;
    }
    public get pointColor(): Array<number> {
        return this._pointColor;
    }
}