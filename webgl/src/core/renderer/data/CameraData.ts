import { glMatrix } from "../../math/Matrix";
import Vec3 from "../../value-types/vec3";



/**
 * 相机数据
 */
export class CameraData {
    constructor() {
        this._viewProjectionMat = glMatrix.mat4.identity(null);
        this._viewMat = glMatrix.mat4.identity(null);
        this.position = new Vec3(0,0,0)
        this.reset();
    }
    /*
    相机的位置
    */
    public position: Vec3;
    //相机的投影矩阵
    private _projectMat: Float32Array;
    //相机的节点矩阵
    private _modelMat: Float32Array;
    //相机的视口矩阵
    private _viewMat: Float32Array;
    //相机的视口投影矩阵
    private _viewProjectionMat: Float32Array;
    private _isNeedUpdate: boolean;

    public reset(): void {
        this.position.x =0 ;
        this.position.y = 0;
        this.position.z = 0;
        this.projectMat = null;
        this.modelMat = null;
        this._isNeedUpdate = false;
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