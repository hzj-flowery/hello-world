/**
 * 光照数据
 */
export class LightData {
    constructor() {
        this.reset();
    }
    private _position: Array<number>;//位置
    private _direction: Array<number>;//方向
    private _color: Array<number>;//颜色
    private _specularColor: Array<number>;//高光的颜色
    private _specularShininess: number;//高光的指数(值越大光越小，值越小光越大)
    public reset(): void {
        this._position = [];
        this._direction = [8,5,-10];
        this._color = [1,0,0,1.0];
        this._specularShininess = 140;
        this._specularColor = [1, 0.2, 0.2];
    }
    setData(pos: Array<number>, dir: Array<number>, color: Array<number>): void {
        this._position = pos;
        this._direction = dir;
        this._color = color;
    }
    public get position(): Array<number> {
        return this._position;
    }
    public get direction(): Array<number> {
        return this._direction;
    }
    public get color(): Array<number> {
        return this._color;
    }
    public get specularColor(): Array<number> {
        return this._specularColor;
    }
    public get specularShininess(): number {
        return this._specularShininess;
    }
}