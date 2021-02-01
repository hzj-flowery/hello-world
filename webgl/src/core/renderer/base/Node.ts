import Ref from "../../../Ref";
import { glMatrix } from "../../math/Matrix";


export class Node extends Ref {
    constructor() {
        super();
        this.initBaseNode();
    }
    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private _scaleX: number = 1;
    private _scaleY: number = 1;
    private _scaleZ: number = 1;
    //x轴旋转的角度
    private _rotateX: number = 0;
    //y轴旋转的角度
    private _rotateY: number = 0;
    //z轴旋转的角度
    private _rotateZ: number = 0;
    private _updateModelMatrixFlag: boolean = false;//是否更新模型矩阵的一个标志

    public width: number = 0;//宽度
    public height: number = 0;//高度
    public anchorX: number = 0.5;//x轴锚点
    public anchorY: number = 0.5;//y轴锚点

    protected name: string;
    protected tag: number;

    protected _glMatrix = glMatrix;//矩阵操作api
    /**
     * 此处务必注意
     * modelMatrix是一个模型世界矩阵
     * worldMatrix是父节点传过来的矩阵，它是一个衔接矩阵，真正起作用的modelMatrix矩阵
     * 当前节点各种旋转平移缩放都只记录在modelMatrix中，最后modelMatrix和worldMatrix相乘,就可以得到一个模型世界矩阵，再赋给modelMatrix
     */
    private _modelMatrix: Float32Array; //模型世界矩阵
    protected _worldMatrix: any[] | Float32Array;//父节点矩阵
    protected _localMatrix: Float32Array;//本地矩阵，该矩阵只负责管理缩放旋转平移，不受父节点矩阵影响
    private _parent: Node;//父亲
    private _children: Array<Node>;//孩子节点

    private initBaseNode(): void {
        this.name = "defaultName";
        this._children = [];
        this._worldMatrix = this._glMatrix.mat4.identity(null);
        this._modelMatrix = this._glMatrix.mat4.identity(null);
        this._localMatrix = this._glMatrix.mat4.identity(null);
        this._updateModelMatrixFlag = true;
    }
    public get x(): number {
        return this._x;
    }
    public set x(dd) {
        if (this._x != dd) {
            this._updateModelMatrixFlag = true;
            this._x = dd;
        }
    }
    public get y(): number {
        return this._y;
    }
    public set y(dd) {
        if (this._y != dd) {
            this._updateModelMatrixFlag = true;
            this._y = dd;
        }
    }
    public get z(): number {
        return this._z;
    }
    public set z(dd) {
        if (this._z != dd) {
            this._updateModelMatrixFlag = true;
            this._z = dd;
        }
    }
    public get scaleX(): number {
        return this._scaleX;
    }
    public set scaleX(dd) {
        if (this._scaleX != dd) {
            this._updateModelMatrixFlag = true;
            this._scaleX = dd;
        }
    }
    public get scaleY(): number {
        return this._scaleY;
    }
    public set scaleY(dd) {
        if (this._scaleY != dd) {
            this._updateModelMatrixFlag = true;
            this._scaleY = dd;
        }
    }
    public get scaleZ(): number {
        return this._scaleZ;
    }
    public set scaleZ(dd) {
        if (this._scaleZ != dd) {
            this._updateModelMatrixFlag = true;
            this._scaleZ = dd;
        }
    }
    public get rotateX(): number {
        return this._rotateX;
    }
    public set rotateX(dd) {
        if (this._rotateX != dd) {
            this._updateModelMatrixFlag = true;
            this._rotateX = dd;
        }
    }
    public get rotateY(): number {
        return this._rotateY;
    }
    public set rotateY(dd) {
        if (this._rotateY != dd) {
            this._updateModelMatrixFlag = true;
            this._rotateY = dd;
        }
    }
    public get rotateZ(): number {
        return this._rotateZ;
    }
    public set rotateZ(dd) {
        if (this._rotateZ != dd) {
            this._updateModelMatrixFlag = true;
            this._rotateZ = dd;
        }
    }

    public get parent(): Node {
        return this._parent;
    }
    /**
     * 
     * @param node 
     */
    public addChild(node: Node): void {
        console.assert(node && node.parent == null, "添加节点失败", node);
        if (this._children.indexOf(node) >= 0) {
            console.log("该节点已经添加！！！！");
            return;
        }
        this._children.push(node);
        node._parent = this;
    }
    /**
     * 移除孩子节点
     * @param node 
     */
    public removeChild(node: Node): void {
        var index = this._children.indexOf(node);
        if (index >= 0) {
            this._children.splice(index, 1);
            node._parent = null;
        }
    }
    //更新世界矩阵
    private updateWorldMatrix(): void {
        if (this._parent) {
            this.setFatherMatrix(this._parent.modelMatrix);
        }
        //更新当前节点的矩阵数据
        this.updateMatrixData();
    }
    //绘制之前
    public onDrawBefore(time: number): void {

    }
    public onDrawAfter(time: number): void {

    }
    //开启绘制
    public visit(time: number): void {
        //更新世界节点
        this.updateWorldMatrix();
        //开始绘制
        this.collectRenderData(time);
        for (var j = 0; j < this._children.length; j++) {
            this._children[j].visit(time);
        }

    }
    protected collectRenderData(time: number): void {

    }
    /**
     * 
     * @param mvMatrix 设置父节点矩阵
     */
    private setFatherMatrix(mvMatrix): void {
        this._worldMatrix = this._glMatrix.mat4.clone(mvMatrix);
    }
    /**
    * 更新2D矩阵
    * 将此节点的数据更新到这个矩阵中
    * 
    * 世界坐标变换要先缩放、后旋转、再平移的原因
    * 
    * 缩放变换不改变坐标轴的走向，也不改变原点的位置，所以两个坐标系仍然重合。 
      旋转变换改变坐标轴的走向，但不改变原点的位置，所以两个坐标系坐标轴不再处于相同走向。 
      平移变换不改变坐标轴走向，但改变原点位置，两个坐标系原点不再重合
    */
    private updateMatrixData(): void {
        if (this._updateModelMatrixFlag) {
            //初始化模型矩阵
            this._glMatrix.mat4.identity(this._modelMatrix);
            this._glMatrix.mat4.identity(this._localMatrix);
            //先缩放
            this.scaleModelMatrix();
            //再旋转
            this.rotateModelMatrix();
            //最后平移
            this.translateModelMatrix();
            this._updateModelMatrixFlag = false;
        }
        //将本地矩阵拷贝过来
        this._glMatrix.mat4.copy(this._modelMatrix, this._localMatrix);
        this._glMatrix.mat4.multiply(this._modelMatrix, this._worldMatrix, this._modelMatrix);
    }
    //缩放模型矩阵
    private scaleModelMatrix(): void {
        this._glMatrix.mat4.scale(this._localMatrix, this._localMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
    }
    //旋转模型矩阵
    private rotateModelMatrix(): void {
        this._glMatrix.mat4.rotateX(this._localMatrix, this._localMatrix, this.rotateX * (Math.PI / 180));
        this._glMatrix.mat4.rotateY(this._localMatrix, this._localMatrix, this.rotateY * (Math.PI / 180));
        this._glMatrix.mat4.rotateZ(this._localMatrix, this._localMatrix, this.rotateZ * (Math.PI / 180));
    }
    //平移模型矩阵
    protected translateModelMatrix(): void {
        this._glMatrix.mat4.translate(this._localMatrix, this._localMatrix, [this.x, this.y, this.z]);
    }
    /**
     * 模型世界矩阵
     */
    public get modelMatrix(): Float32Array {
        return this._modelMatrix;
    }
    /**
     * 模型世界的逆矩阵
     */
    public getInversModelMatrix(): any {
        var invers = this._glMatrix.mat4.create();
        this._glMatrix.mat4.invert(invers, this._modelMatrix)
        return invers;
    }
    public setPosition(x: number, y: number, z: number): void {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    public setScale(x: number, y: number, z: number): void {
        this.scaleX = x;
        this.scaleY = y;
        this.scaleZ = z;
    }
    /**
     * 
     * @param x angle
     * @param y angle
     * @param z angle
     */
    public setRotation(x: number, y: number, z: number): void {
        this.rotateX = x;
        this.rotateY = y;
        this.rotateZ = z;
    }
    public rotate(x = 0, y = 0, z = 0): void {
        this.rotateX = this._rotateX + x;
        this.rotateY = this._rotateY + y;
        this.rotateZ = this._rotateZ + z;
    }

}

