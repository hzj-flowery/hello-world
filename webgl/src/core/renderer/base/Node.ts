import Ref from "../../../Ref";
import { glMatrix } from "../../Matrix";

export class Node extends Ref {
    constructor() {
        super();
        this.initBaseNode();
    }

    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    public scaleX: number = 1;
    public scaleY: number = 1;
    public scaleZ: number = 1;
    
    //x轴旋转的角度
    public rotateX: number = 0;
    //y轴旋转的角度
    public rotateY: number = 0;
    //z轴旋转的角度
    public rotateZ: number = 0;

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
    protected _modelMatrix: Float32Array; //模型世界矩阵
    protected _worldMatrix: any[]|Float32Array;//父节点矩阵
    private _parent: Node;//父亲
    private _children: Array<Node>;//孩子节点

    private initBaseNode(): void {
        this.name = "defaultName";
        this._children = [];
        this._worldMatrix = this._glMatrix.mat4.identity(null);
        this._modelMatrix = this._glMatrix.mat4.identity(null);
    }
    public set parent(node: Node) {
        this._parent = node;
    }
    public get parent(): Node {
        return this._parent;
    }
    /**
     * 
     * @param node 
     */
    public addChild(node: Node): void {
        this._children.push(node);
        node.parent = this;
    }
    /**
     * 移除孩子节点
     * @param node 
     */
    public removeChild(node: Node): void {
        var index = this._children.indexOf(node);
        if (index >= 0) {
            this._children.splice(index, 1);
            node.parent = null;
        }
    }
    //更新世界矩阵
    protected updateWorldMatrix(): void {
        if (this._parent) {
            //二处调用
            this.setFatherMatrix(this._parent.getModelViewMatrix());
            return;
        }
        //否则这就是场景节点，不需要变换
    }
    //绘制之前
    protected onDrawBefore(): void {

    }
    protected onDrawAfter(): void {

    }
    private drawBefore(): void {
        //更新矩阵数据

    }
    private drawAfter(): void {

    }

    //开启绘制
    public visit(time: number): void {
        //更新世界节点
        this.updateWorldMatrix();
        //更新当前节点的矩阵数据
        this.updateMatrixData();
        //开始绘制
        this.draw(time);
        for (var j = 0; j < this._children.length; j++) {
            this._children[j].visit(time);
        }

    }
    protected draw(time: number): void {

    }
    /**
     * 
     * @param mvMatrix 设置父节点矩阵
     */
    public setFatherMatrix(mvMatrix): void {
        this._worldMatrix = glMatrix.mat4.clone(mvMatrix);
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
    protected updateMatrixData(): void {
        //初始化模型矩阵
        glMatrix.mat4.identity(this._modelMatrix);
        //先缩放
        glMatrix.mat4.scale(this._modelMatrix, this._modelMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
        //再旋转
        glMatrix.mat4.rotateX(this._modelMatrix, this._modelMatrix, this.rotateX * (Math.PI / 180));
        glMatrix.mat4.rotateY(this._modelMatrix, this._modelMatrix, this.rotateY * (Math.PI / 180));
        glMatrix.mat4.rotateZ(this._modelMatrix, this._modelMatrix, this.rotateZ * (Math.PI / 180));
        //最后平移
        glMatrix.mat4.translate(this._modelMatrix, this._modelMatrix, [this.x, this.y, this.z]);
        glMatrix.mat4.multiply(this._modelMatrix,this._worldMatrix,this._modelMatrix);
    }
    /**
     * 模型世界矩阵
     */
    public getModelViewMatrix(): any {
        return this._modelMatrix;
    }
    public setPosition(x, y, z): void {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    public setScale(x, y, z): void {
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
    public setRotation(x, y, z): void {
        this.rotateX = x;
        this.rotateY = y;
        this.rotateZ = z;
    }
    public rotate(x = 0, y = 0, z = 0): void {
        this.rotateX = this.rotateX + x;
        this.rotateY = this.rotateY + y;
        this.rotateZ = this.rotateZ + z;
    }

}
