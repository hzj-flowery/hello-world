import { MathUtils } from "../../utils/MathUtils";

export enum LightType{
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
    private _bias: number = 0.005;
    private _projWidth: number = 10;
    private _projHeight: number = 10;
    private _perspective: boolean = false;//是否为透视
    public reset(): void {
        this.position = [0, 0, 0];
        this.parallelDirection = [8, 5, -10];      //平行光的方向
        this.parallelColor = [0.1, 0.1, 0.1, 1.0]; //平行光的颜色
        this._specularShininess = 140;
        this.specularColor = [1.0, 0.0, 0.0, 1.0];
        this.ambientColor = [0.1, 0.1, 0.1, 1.0];//环境光
        this.pointColor = [1.0, 1.0, 1.0, 1.0];//默认点光的颜色为红色

        this._spotInnerLimit = Math.cos(MathUtils.degToRad(20));
        this._spotOuterLimit = Math.cos(MathUtils.degToRad(30));
        this.spotDirection = [0, 0, 1];
        this.spotColor = [0, 1, 0, 1];

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
    private _fogDensity:number;//雾的密度
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
        return [this._fogColR,this._fogColG,this._fogColB,this._fogColA];
    }
    public set fogColor(p:Array<number>){
        this.fogColR = p[0] ? p[0] : this._fogColR;
        this.fogColG = p[1] ? p[1] : this._fogColG;
        this.fogColB = p[2] ? p[2] : this._fogColB;
        this.fogColA = p[3] ? p[3] : this._fogColA;
    }
    public get fogDensity(){
        return this._fogDensity;
    }
    public set fogDensity(p:number){
        this._fogDensity=p;
    }

     //聚光
     private _spotInnerLimit: number;//聚光的内圈
     private _spotOuterLimit: number;//聚光的外圈
     private _spotColR: number = 0;
     private _spotColG: number = 0;
     private _spotColB: number = 0;
     private _spotColA: number = 1.0;//透明通道
     public get spotColR(): number { return this._spotColR };
     public set spotColR(p: number) { this._spotColR = p };
     public get spotColG(): number { return this._spotColG };
     public set spotColG(p: number) { this._spotColG = p };
     public get spotColB(): number { return this._spotColB };
     public set spotColB(p: number) { this._spotColB = p };
     public get spotColA(): number { return this._spotColA };
     public set spotColA(p: number) { this._spotColA = p };
     public set spotColor(p: Array<number>) {
         this.spotColR = p[0] ? p[0] : this._spotColR;
         this.spotColG = p[1] ? p[1] : this._spotColG;
         this.spotColB = p[2] ? p[2] : this._spotColB;
         this.spotColA = p[3] ? p[3] : this._spotColA;
     }
     public get spotColor(): Array<number> {
         return [this._spotColR,this._spotColG,this._spotColB,this._spotColA];
     }
     private _spotDirX: number = 0;
     private _spotDirY: number = 0;
     private _spotDirZ: number = 0;
     public get spotDirX(): number { return this._spotDirX };
     public set spotDirX(p: number) { this._spotDirX = p };
     public get spotDirY(): number { return this._spotDirY };
     public set spotDirY(p: number) { this._spotDirY = p };
     public get spotDirZ(): number { return this._spotDirZ };
     public set spotDirZ(p: number) { this._spotDirZ = p };
     public get spotDirection(): Array<number> {
         return [this._spotDirX, this._spotDirY, this._spotDirZ];
     }
     public set spotDirection(p: Array<number>) {
         this.spotDirX = p[0] ? p[0] : this._spotDirX;
         this.spotDirY = p[1] ? p[1] : this._spotDirY;
         this.spotDirZ = p[2] ? p[2] : this._spotDirZ;
     }
     
     public get spotInnerLimit(): number {
         return this._spotInnerLimit;
     }
     public set spotInnerLimit(angle:number) {
         this._spotInnerLimit = Math.cos(MathUtils.degToRad(angle));
     }
     public get spotOuterLimit(): number {
         return this._spotOuterLimit;
     }
     public set spotOuterLimit(angle:number) {
         this._spotOuterLimit = Math.cos(MathUtils.degToRad(angle));
     }

    
    //平行光
    private _parallelColR: number = 0;
    private _parallelColG: number = 0;
    private _parallelColB: number = 0;
    private _parallelColA: number = 1.0;//透明通道
    public get parallelColR(): number { return this._parallelColR };
    public set parallelColR(p: number) { this._parallelColR = p };
    public get parallelColG(): number { return this._parallelColG };
    public set parallelColG(p: number) { this._parallelColG = p };
    public get parallelColB(): number { return this._parallelColB };
    public set parallelColB(p: number) { this._parallelColB = p };
    public get parallelColA(): number { return this._parallelColA };
    public set parallelColA(p: number) { this._parallelColA = p };
    public get parallelColor(): Array<number> {
        return [this._parallelColR, this._parallelColG, this._parallelColB, this._parallelColA];
    }
    public set parallelColor(p: Array<number>) {
        this.parallelColR = p[0] ? p[0] : this._parallelColR;
        this.parallelColG = p[1] ? p[1] : this._parallelColG;
        this.parallelColB = p[2] ? p[2] : this._parallelColB;
        this.parallelColA = p[3] ? p[3] : this._parallelColA;
    }
    private _parallelDirX: number = 0;
    private _parallelDirY: number = 0;
    private _parallelDirZ: number = 0;
    public get parallelDirX(): number { return this._parallelDirX };
    public set parallelDirX(p: number) { this._parallelDirX = p };
    public get parallelDirY(): number { return this._parallelDirY };
    public set parallelDirY(p: number) { this._parallelDirY = p };
    public get parallelDirZ(): number { return this._parallelDirZ };
    public set parallelDirZ(p: number) { this._parallelDirZ = p };
    public get parallelDirection(): Array<number> {
        return [this._parallelDirX, this._parallelDirY, this._parallelDirZ];
    }
    public set parallelDirection(p: Array<number>) {
        this.parallelDirX = p[0] ? p[0] : this._parallelDirX;
        this.parallelDirY = p[1] ? p[1] : this._parallelDirY;
        this.parallelDirZ = p[2] ? p[2] : this._parallelDirZ;
    }

    //高光
    private _specularShininess: number;//高光的指数(值越大光越小，值越小光越大)
    private _specularColR: number = 0;
    private _specularColG: number = 0;
    private _specularColB: number = 0;
    private _specularColA: number = 1.0;//透明通道
    public get specularColR(): number { return this._specularColR };
    public set specularColR(p: number) { this._specularColR = p };
    public get specularColG(): number { return this._specularColG };
    public set specularColG(p: number) { this._specularColG = p };
    public get specularColB(): number { return this._specularColB };
    public set specularColB(p: number) { this._specularColB = p };
    public get specularColA(): number { return this._specularColA };
    public set specularColA(p: number) { this._specularColA = p };
    public get specularColor(): Array<number> {
        return [this._specularColR,this._specularColG,this._specularColB,this._specularColA];
    }
    public set specularColor(p:Array<number>){
        this.specularColR = p[0] ? p[0] : this._specularColR;
        this.specularColG = p[1] ? p[1] : this._specularColG;
        this.specularColB = p[2] ? p[2] : this._specularColB;
        this.specularColA = p[3] ? p[3] : this._specularColA;
    }
    public get specularShininess(): number {
        return this._specularShininess;
    }

    //环境光
    private _ambientColR: number = 0;
    private _ambientColG: number = 0;
    private _ambientColB: number = 0;
    private _ambientColA: number = 1.0;//透明通道
    public get ambientColR(): number { return this._ambientColR };
    public set ambientColR(p: number) { this._ambientColR = p };
    public get ambientColG(): number { return this._ambientColG };
    public set ambientColG(p: number) { this._ambientColG = p };
    public get ambientColB(): number { return this._ambientColB };
    public set ambientColB(p: number) { this._ambientColB = p };
    public get ambientColA(): number { return this._ambientColA };
    public set ambientColA(p: number) { this._ambientColA = p };
    public get ambientColor(): Array<number> {
        return [this._ambientColR,this._ambientColG,this._ambientColB,this._ambientColA];
    }
    public set ambientColor(p:Array<number>){
        this.ambientColR = p[0] ? p[0] : this._ambientColR;
        this.ambientColG = p[1] ? p[1] : this._ambientColG;
        this.ambientColB = p[2] ? p[2] : this._ambientColB;
        this.ambientColA = p[3] ? p[3] : this._ambientColA;
    }
    
    //点光
    private _pointColR: number = 0;
    private _pointColG: number = 0;
    private _pointColB: number = 0;
    private _pointColA: number = 1.0;//透明通道
    public get pointColR(): number { return this._pointColR };
    public set pointColR(p: number) { this._pointColR = p };
    public get pointColG(): number { return this._pointColG };
    public set pointColG(p: number) { this._pointColG = p };
    public get pointColB(): number { return this._pointColB };
    public set pointColB(p: number) { this._pointColB = p };
    public get pointColA(): number { return this._pointColA };
    public set pointColA(p: number) { this._pointColA = p };
    public get pointColor(): Array<number> {
        return [this._pointColR,this._pointColG,this._pointColB,this._pointColA];
    }
    public set pointColor(p:Array<number>){
        this.pointColR = p[0] ? p[0] : this._pointColR;
        this.pointColG = p[1] ? p[1] : this._pointColG;
        this.pointColB = p[2] ? p[2] : this._pointColB;
        this.pointColA = p[3] ? p[3] : this._ambientColA;
    }
}