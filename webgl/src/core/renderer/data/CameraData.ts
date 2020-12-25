import { glMatrix } from "../../Matrix";

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
/**
 * 相机数据
 */
export class CameraData {
    constructor() {
        this.lightData = new LightData();
        this._viewProjectionMat = glMatrix.mat4.identity(null);
        this._viewMat = glMatrix.mat4.identity(null);
        this.reset();
    }
    /*
    相机的位置
    */
    public position: Array<number>;
    //相机的投影矩阵
    private _projectMat: Float32Array;
    //相机的节点矩阵
    private _modelMat: Float32Array;
    //相机的视口矩阵
    private _viewMat: Float32Array;
    //相机的视口投影矩阵
    private _viewProjectionMat: Float32Array;
    /**
     * 光照数据
     */
    public lightData: LightData;
    private _isNeedUpdate: boolean;

    public reset(): void {
        this.position = [];
        this.projectMat = null;
        this.modelMat = null;
        this._isNeedUpdate = false;
        this.lightData.reset();
    }
    public set projectMat(proj: Float32Array) {
        this._projectMat = proj;
        this._isNeedUpdate = true;
    }
    public set modelMat(model: Float32Array) {
        this._modelMat = model;
        this._isNeedUpdate = true;
    }
    public get projectMat(): Float32Array {
        return this._projectMat;
    }
    public get modelMat(): Float32Array {
        return this._modelMat
    }
    /**
     * 更新高铁站
     */
    private updateMat(): void {
        if (this._isNeedUpdate) {
            glMatrix.mat4.invert(this._viewMat, this._modelMat);
            glMatrix.mat4.multiply(this._viewProjectionMat, this._projectMat, this._viewMat);
            this._isNeedUpdate = false;
        }
    }
    /**
     * 视图投影矩阵
     */
    public get viewProjectionMat(): Float32Array {
        this.updateMat();
        return this._viewProjectionMat;
    }
    /**
     * 视图矩阵
     */
    public get viewMat(): Float32Array {
        this.updateMat();
        return this._viewMat;
    }

}