import Ref from "./Ref";
import { glMatrix } from "../../math/Matrix";
import Device from "../../Device";
import { syRender } from "../data/RenderData";

enum TransformWay {
    Matrix=1,
    Quat_Euler
}
/**
 * 递归渲染
 * 从根节点依次往下找 更新数据
 */
export class Node extends Ref {
    constructor() {
        super();
        this.initBaseNode();
    }
    /**
     * 是否基于父节点中心进行变换
     * 只有两个选择 要么基于父节点 要么基于自己
     * 比如一个立方体，基于父节点就是绕着父节点转，基于自己，就是自己旋转
     * 从常理上，一般都是基于自己中心进行变换
     */
    private _baseFatherOriginTransform: boolean = false;
    private _x: number = 0;//本地坐标 即相对于父节点坐标
    private _y: number = 0;//本地坐标 即相对于父节点坐标
    private _z: number = 0;//本地坐标 即相对于父节点坐标
    private _worldX:number = 0;//世界坐标
    private _worldY:number = 0;//世界坐标
    private _worldZ:number = 0;//世界坐标
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
    /**
     * 设置全局的渲染顺序
     * 此值越大 渲染越靠后
     */
    public gZOrder: number=0;
    private __node__type: syRender.NodeType = syRender.NodeType.D3;//2代表2d节点 3代表3d节点
    private _visible:boolean = true;//节点是否可见
    protected _glMatrix = glMatrix;//矩阵操作api
    /**
     * 此处务必注意
     * modelMatrix是一个模型世界矩阵
     * worldMatrix是父节点传过来的矩阵，它是一个衔接矩阵，真正起作用的modelMatrix矩阵
     * 当前节点各种旋转平移缩放都只记录在modelMatrix中，最后modelMatrix和worldMatrix相乘,就可以得到一个模型世界矩阵，再赋给modelMatrix
     */
    private _modelMatrix: Float32Array; //模型世界矩阵
    private _worldMatrix: any[] | Float32Array;//父节点矩阵
    private _localMatrix: Float32Array;//本地矩阵，该矩阵只负责管理缩放旋转平移，不受父节点矩阵影响

    private _scaleMatrix: Float32Array;//缩放矩阵
    private _rotateMatrix: Float32Array;//旋转矩阵
    private _translateMatrix: Float32Array;//平移矩阵
    private _parent: Node;//父亲
    private _children: Array<Node>;//孩子节点

    /**
     * 设置节点是否基于父节点进行旋转变换
     * 只有两个选择：要么基于父节点，要么基于自己节点
     */
    protected set baseFatherOriginTransform(b: boolean) {
        this._baseFatherOriginTransform = b
    }

    private initBaseNode(): void {
        this.name = this.constructor.name;
        this._children = [];
        this._worldMatrix = glMatrix.mat4.identity(null);
        this._modelMatrix = glMatrix.mat4.identity(null);
        this._localMatrix = glMatrix.mat4.identity(null);

        this._scaleMatrix = glMatrix.mat4.identity(null);
        this._rotateMatrix = glMatrix.mat4.identity(null);
        this._translateMatrix = glMatrix.mat4.identity(null);

        this._updateModelMatrixFlag = true;
    }
    /**
     * 此函数不可以轻易调用,除非你知道你想干啥
     */
    protected set _node__type(_ty: syRender.NodeType) {
        if (_ty == syRender.NodeType.D2 || _ty == syRender.NodeType.D3) {
            this.__node__type = _ty;
        }
        else {
            this.__node__type = syRender.NodeType.D3;
            console.log("你传入的节点类型有问题---", _ty);
        }
    }
    /**
     * 判断是否为3d节点
     * @returns 
     */
    public is3DNode(): boolean {
        return this.__node__type == syRender.NodeType.D3;
    }
    /**
     * 判断是否为2d节点
     * @returns 
     */
    public is2DNode(): boolean {
        return this.__node__type == syRender.NodeType.D2;
    }
    /**
     * 获取节点的类型
     * @returns 
     */
    public getNodeType(): syRender.NodeType{
        return this.__node__type;
    }
    public get x(): number {
        return this._x;
    }
    public set x(dd) {
        if (this._x != dd) {
            dd = this.checkPosition(0, dd);
            this._updateModelMatrixFlag = true;
            this._x = dd;
        }
    }
    public get y(): number {
        return this._y;
    }
    public set y(dd) {
        if (this._y != dd) {
            dd = this.checkPosition(1, dd);
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
    /**
     * 
     * @param pos 0 代表x 1代表y 2代表z
     * @param value 
     */
    private checkPosition(pos, value): number {
        if (this.__node__type == syRender.NodeType.D3) {
            return value;
        }
        if (pos == 0) {
            return this.convertShiYouSpaceToClipSpaceX(value);
        }
        else if (pos == 1) {
            return this.convertShiYouSpaceToClipSpaceY(value);
        }
        return value;
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

    public setVisible(p:boolean){
        this._visible = p;
    }
    public isVisible():boolean{
        return this._visible;
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
        //节点被添加到父节点上了
        node.onEnter();
    }
    /**
     * 移除孩子节点
     * @param node 
     */
    public removeChild(node: Node): void {
        var index = this._children.indexOf(node);
        if (index >= 0) {
            //节点被移除了
            node.onEixt();
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

    //绑定GPU数据之前
    public onBindGPUBufferDataBefore(rd: syRender.QueueItemBaseData, view: Float32Array, proj: Float32Array): void {

    }
    //绘制之前
    public onDrawBefore(time: number, rd: syRender.QueueItemBaseData): void {

    }
    //绘制之后
    public onDrawAfter(time: number): void {

    }

    //开启绘制
    public visit(time: number): void {

        if(!this._visible) return ;
        //更新世界节点
        this.updateWorldMatrix();
        //开始绘制
        this.collectRenderData(time);
        //更新
        this.onUpdate();
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
        glMatrix.mat4.copy(this._worldMatrix,mvMatrix)
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
            glMatrix.mat4.identity(this._modelMatrix);
            glMatrix.mat4.identity(this._localMatrix);
            //先缩放
            this.scaleModelMatrix();
            //再旋转
            this.rotateModelMatrix();
            //最后平移
            this.translateModelMatrix();
        }
        if (!this._baseFatherOriginTransform&&this._updateModelMatrixFlag) { 
            glMatrix.mat4.multiply(this._localMatrix, this._rotateMatrix, this._scaleMatrix)
            glMatrix.mat4.multiply(this._localMatrix, this._translateMatrix, this._localMatrix)
        }
        //将本地矩阵拷贝过来
        glMatrix.mat4.copy(this._modelMatrix, this._localMatrix);
        glMatrix.mat4.multiply(this._modelMatrix, this._worldMatrix, this._modelMatrix);


        this._updateModelMatrixFlag = false;
    }
    
    /**----------------------------------------------------------------------------------------------------------------------
     * 计算模型矩阵完全通过矩阵的方式
     */
    private calculateModelMatrixByMatrix():void{

    }
    //缩放模型矩阵
    private scaleModelMatrix(): void {
        if (this._baseFatherOriginTransform) {
            glMatrix.mat4.scale(this._localMatrix, this._localMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
        }
        else {
            glMatrix.mat4.identity(this._scaleMatrix);
            glMatrix.mat4.scale(this._scaleMatrix, this._scaleMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
        }
    }
    //旋转模型矩阵
    private rotateModelMatrix(): void {
        if (this._baseFatherOriginTransform) {
            glMatrix.mat4.rotateX(this._localMatrix, this._localMatrix, this.rotateX * (Math.PI / 180));
            glMatrix.mat4.rotateY(this._localMatrix, this._localMatrix, this.rotateY * (Math.PI / 180));
            glMatrix.mat4.rotateZ(this._localMatrix, this._localMatrix, this.rotateZ * (Math.PI / 180));
        }
        else {
            glMatrix.mat4.identity(this._rotateMatrix);
            glMatrix.mat4.rotateX(this._rotateMatrix, this._rotateMatrix, this.rotateX * (Math.PI / 180));
            glMatrix.mat4.rotateY(this._rotateMatrix, this._rotateMatrix, this.rotateY * (Math.PI / 180));
            glMatrix.mat4.rotateZ(this._rotateMatrix, this._rotateMatrix, this.rotateZ * (Math.PI / 180));
        }
    }
    //平移模型矩阵
    private translateModelMatrix(): void {
        if (this._baseFatherOriginTransform) {
            glMatrix.mat4.translate(this._localMatrix, this._localMatrix, [this.x, this.y, this.z]);
        }
        else {
            glMatrix.mat4.identity(this._translateMatrix);
            glMatrix.mat4.translate(this._translateMatrix, this._translateMatrix, [this.x, this.y, this.z]);
        }
    }
    //---------------------------------------------------------------------------------------------------------------
    /**
     * 模型世界矩阵
     */
    public get modelMatrix(): Float32Array {
        return this._modelMatrix;
    }

    public convertToNodeSpace(worldPoint: Array<number>) {
        // Mat4 tmp = getWorldToNodeTransform();
        // Vec3 vec3(worldPoint.x, worldPoint.y, 0);
        // Vec3 ret;
        // tmp.transformPoint(vec3,&ret);
        // return Vec2(ret.x, ret.y);
    }
    private _tempSpacePoint:Float32Array = new Float32Array(3);
    public convertToWorldSpace(nodePoint: Array<number>):Array<number> {
        nodePoint = nodePoint ||[this.x,this.y,this.z];
        this.updateWorldMatrix();
        glMatrix.mat4.transformPoint(this._tempSpacePoint,this.modelMatrix,nodePoint);
        return [this._tempSpacePoint[0],this._tempSpacePoint[1],this._tempSpacePoint[2]]
    }

    /**
     * 模型世界的逆矩阵
     */
    public getInversModelMatrix(): any {
        var invers = glMatrix.mat4.create();
        glMatrix.mat4.invert(invers, this._modelMatrix)
        return invers;
    }
    public setPosition(x: number, y: number, z: number): void {
        this.x = x;
        this.y = y;
        this.z = z; //此值非常重要 将关系到渲染顺序
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

    /**
        * 诗游坐标转为齐次裁切坐标 x
        */
     public convertShiYouSpaceToClipSpaceX(x: number): number {
        var width = Device.Instance.width;
        var centerX = width / 2;//0
        return ((x - centerX) / centerX)
    }
    /**
     * 诗游坐标转为齐次裁切坐标 y
     */
    public convertShiYouSpaceToClipSpaceY(y: number): number {
        var height = Device.Instance.height;
        var centerY = height / 2;//0
        return (y-centerY) / centerY
    }
    /**
     * 诗游坐标转为齐次裁切坐标
     * 诗游坐标：左下角【0,0】=>右上角【screenWidth,screenHeight】
     * 齐次裁切坐标：左下角【-1,-1】=>中间【0,0】=>右上角[1,1]
     */
    public convertShiYouSpaceToClipSpace(x: number, y: number): Array<number> {
        return [this.convertShiYouSpaceToClipSpaceX(x), this.convertShiYouSpaceToClipSpaceY(y)]
    }



    /**
        * 屏幕坐标转为齐次裁切坐标 x
        */
    public convertScreenSpaceToClipSpaceX(x: number): number {
        var width = Device.Instance.width;
        var centerX = width / 2;//0
        return ((x - centerX) / centerX)
    }
    /**
     * 屏幕坐标转为齐次裁切坐标 y
     */
    public convertScreenSpaceToClipSpaceY(y: number): number {
        var height = Device.Instance.height;
        var centerY = height / 2;//0
        return (centerY-y) / centerY
    }
    /**
     * 屏幕坐标转为齐次裁切坐标
     * 屏幕坐标：左上角【0,0】=>右下角【screenWidth,screenHeight】
     * 齐次裁切坐标：左下角【-1,-1】=>中间【0,0】=>右上角[1,1]
     */
    public convertScreenSpaceToClipSpace(x: number, y: number): Array<number> {
        return [this.convertScreenSpaceToClipSpaceX(x), this.convertScreenSpaceToClipSpaceY(y)]
    }

    /**
     * uv坐标系：原点在左上角
     * webgl坐标系：原点在左下角
     * 将uv坐标系下的坐标转为webgl坐标系下的坐标
     * @param u 
     * @param v 
     * @returns 
     */
    public convertUVSpaceToWebglSpace(u:number,v:number):Array<number>{
         return [u,1.0-v]
    }


    //----------------四元数 欧拉角 
    

}

