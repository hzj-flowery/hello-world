/**
 * 光照数据
 */
export class LightData {
    constructor() {
        this.reset();
    }
    private _specularColor: Array<number>;//高光的颜色
    private _specularShininess: number;//高光的指数(值越大光越小，值越小光越大)
    private _posX: number = 0;
    private _posY: number = 0;
    private _posZ: number = 0;
    private _dirX: number = 0;
    private _dirY: number = 0;
    private _dirZ: number = 0;
    private _colR: number = 0;
    private _colG: number = 0;
    private _colB: number = 0;
    private _colA: number = 1.0;//透明通道

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
        this.direction = [8, 5, -10];
        this.color = [0.1, 0.1, 0.1, 1.0];
        this._specularShininess = 140;
        this._specularColor = [1, 0.2, 0.2,1.0];
    }
    setData(pos: Array<number>, dir: Array<number>, color: Array<number>): void {
        this.position = pos;
        this.direction = dir;
        this.color = color;
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
    public get dirX(): number { return this._dirX };
    public set dirX(p: number) { this._dirX = p };
    public get dirY(): number { return this._dirY };
    public set dirY(p: number) { this._dirY = p };
    public get dirZ(): number { return this._dirZ };
    public set dirZ(p: number) { this._dirZ = p };
    public get colR(): number { return this._colR };
    public set colR(p: number) { this._colR = p };
    public get colG(): number { return this._colG };
    public set colG(p: number) { this._colG = p };
    public get colB(): number { return this._colB };
    public set colB(p: number) { this._colB = p };
    public get colA(): number { return this._colA };
    public set colA(p: number) { this._colA = p };

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
    public get direction(): Array<number> {
        return [this._dirX, this._dirX, this._dirZ];
    }
    public set direction(p: Array<number>) {
        this.dirX = p[0] ? p[0] : this._dirX;
        this.dirY = p[1] ? p[1] : this._dirY;
        this.dirZ = p[2] ? p[2] : this._dirZ;
    }
    public get color(): Array<number> {
        return [this._colR, this._colG, this._colB, this._colA];
    }
    public set color(p: Array<number>) {
        this.colR = p[0] ? p[0] : this._colR;
        this.colG = p[1] ? p[1] : this._colG;
        this.colB = p[2] ? p[2] : this._colB;
        this.colA = p[3] ? p[3] : this._colA;
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
}