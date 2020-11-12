
import enums from "./enums";
import { RenderTexture } from "../assets/RenderTexture";
import FrameBuffer from "../gfx/FrameBuffer";
import { Node } from "../base/Node";

/**
 * 
 * 【0  4  8   12】
 * 【1  5  9   13】
 * 【2  6  10  14】
 * 【3  7  11  15】
 * 
 * 基础理解1：
 * 摄像机会造一个模型矩阵和一个透视矩阵
 * 模型矩阵VM
 * 
 * 平移----------------------------------------------------
 * 只有（12，13，14，15）参与运算
 *  out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
 *    (4x4)          (4x1)
 *   x  y  z  w
 * 【1  0  0  0】    【x1】                 【x1】                 【1  0  0  x1】
 * 【0  1  0  0】    【y1】                 【y1】trnslate         【0  1  0  y1】
 * 【0  0  1  0】--->【z1】-->两个矩阵相乘-->【z1】------------->   【0  0  1  z1】
 * 【0  0  0  1】    【1 】                 【1 】  self build     【0  0  0  1 】
 * 
 * 缩放---------------------------------------------------------
 *  out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;

    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;

    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
 * 【1  0  0  0】    【x2】                 【x2】                 【x2  0   0   x1】
 * 【0  1  0  0】    【y2】                 【y2】scale            【0   y2  0   y1】
 * 【0  0  1  0】--->【z2】-->两个矩阵相乘-->【z2】------------->   【0   0   z2  z1】
 * 【0  0  0  1】    【1 】                 【1 】  self build     【0   0   0    1】
 * 
 * 旋转-------------------------------------------------------------
 * 
 * 这是一个非常干净的模型矩阵，任何一个向量乘以这个矩阵都等于它自身
 * 相机的位置pos 【x1,y1,z1】
 * 相机的缩放scal【x2,y2,z2】
 * 相机的平移tras【x3,y3,z3】
 * 假设相机放在世界坐标系的正中心【0,0,0】[1,1,1][0,0,0]
 * 
 * 场景会从相机哪里继承这个矩阵VM
 * 场景也继承节点Node 他也有这个位置 缩放 平移的变化
 */

/**
 * 坐标系：
 * 笛卡尔坐标系：X轴为水平方向，Y轴为垂直方向
 * 视口坐标:左下角为(0,0),右上角为（1,1)
 * 屏幕坐标:屏幕的左下角为(0,0),但右上角为(screen.width,screen.height)，screen.width表示屏幕宽度，screen.height表示屏幕高度
 * UI坐标系:这个坐标系与屏幕坐标系相似，左下角为（0，0）点，右上角为（Screen.width，Screen.height）
 * uv坐标系：左下角为【0，0】，右上角为【1,1】
 * 齐次裁切坐标:屏幕正中心为原点（0,0），坐标范围是【-1,1】
 * 
 * 左手坐标系：大拇指向右（+x）,食指向上（+y）,中指向前（+z）
 * 右手坐标系：大拇指向左（+x）,食指向上（+y）,中指向前（+z）
 * 
 * 一:opengl属于右手坐标系
 * 二：设备坐标系属于左手坐标系
 * 三：unity属于左手坐标系
 * 四：Direct3D使用的是左手坐标系
 */

/**
 * !#en Values for Camera.clearFlags, determining what to clear when rendering a Camera.
 * !#zh 摄像机清除标记位，决定摄像机渲染时会清除哪些状态
 * @enum Camera.ClearFlags
 */

enum ClearFlags {
    /**
    * !#en
    * Clear the background color.
    * !#zh
    * 清除背景颜色
    * @property COLOR
    */
    COLOR = 1,
    /**
     * !#en
     * Clear the depth buffer.
     * !#zh
     * 清除深度缓冲区
     * @property DEPTH
     */
    DEPTH = 2,
    /**
     * !#en
     * Clear the stencil.
     * !#zh
     * 清除模板缓冲区
     * @property STENCIL
     */
    STENCIL = 4,
}
enum StageFlags {
    OPAQUE = 1,
    TRANSPARENT = 2
}

export default class Camera extends Node {
    /**
     * 
     * @param fovy    //相机张开的角度
     * @param aspect //宽高横纵比
     * @param near   //最近能看到的距离
     * @param far    //最远能看到的距离
     * @param type   //相机的类型    
     */
    constructor(fovy, aspect, near, far, type: number) {
        super();
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        //创建透视矩阵
        this._projectionMatrix = this._glMatrix.mat4.create();
        this._type = type;
        this._center = [0, 0, 0];//看向原点
        this._up = [0, 1, 0];//向上看
        this._eye = [0, 0, 0];//默认看向原点
        this.updateCameraMatrix();
    }

    /**
    * 也可以理解为他是一个齐次裁切空间
    * 因为一个视口坐标系下的点左乘以这个矩阵就可以转换为齐次裁切空间坐标系下的点了
    * 这个矩阵有两个类型
    * 透视投影：会有近大远小的作用
    * 正交投影：目视前方，把所有的能看到的物体都放到同一个z值处，呈像
    * 这里的投影指的是：我们屏幕作为一个平面，眼睛也构造一个平面出来，眼睛平面在屏幕平面上的投影
    */
    protected _projectionMatrix: any;//透视矩阵

    protected _fovy: number;//相机张开的弧度
    protected _aspect: number;//相机的横纵比(width/height)
    protected _near: number;//相机最近能看到的位置
    protected _far: number;//相机最远能看到的位置
    private _center: Array<number>;//相机正在看向的位置
    private _up: Array<number>;//相机的摆放
    private _eye: Array<number>;
    private _targetTexture: RenderTexture;//目标渲染纹理
    private _framebuffer: FrameBuffer;//渲染buffer
    
    /**
     * 弧度
     */
    public set Fovy(fov: number) {
        this._fovy = fov;
    }
    public set Aspect(aspect: number) {
        this._aspect = aspect;
    }
    public set Near(near: number) {
        this._near = near;
    }
    public set Far(far) {
        this._far = far;
    }
    
    /**
     * 弧度
     */
    public get Fovy():number {
        return this._fovy;
    }
    public get Aspect():number {
        return this._aspect;
    }
    public get Near():number{
        return this._near;
    }
    public get Far():number {
        return this._far;
    }


    /**
     * 清除标志
     * 在GPU的一次绘制过程中，会在在帧缓冲区产生三个附件
     * 颜色缓冲附件:存储RGB
     * 深度附件:存储深度z值
     * 模板缓冲附件：存储模板值，用于测试，比如我们只绘制某一些具有特定模板值的像素
     * 我们将像素信息绘制到屏幕，都是依靠这三个附件的，
     * 绘制结束后，我们需要及时清理
     */
    private _clearFlags = enums.CLEAR_COLOR | enums.CLEAR_DEPTH;
    /**
     * 清理屏幕时使用的颜色
     * 当我们把帧缓冲的附件置空的时候，那么就会出现黑屏，原因是GPU从帧缓冲取不到颜色数据用于渲染
     * 这个时候需要我们指定一种颜色来更换帧缓冲的颜色附件中的像素信息
     */
    _clearColor: Array<number> = [];

    // ortho properties
    /**
     * 下面这个值将会影响齐次裁切空间的高度的范围大小
     * 【-_orthoHeight,_orthoHeight】
     * 非常重要，相当于视口的宽和屏幕宽的比例
     * 这个一般用于2D渲染
     * 屏幕空间--》齐次裁切空间--》屏幕空间
     */
    private _orthoHeight = 1;
    /**
     * 下面这个值将会影响齐次裁切空间的宽度的范围大小
     * 【-_orthoWidth,_orthoWidth】
     * 非常重要，相当于视口的高和屏幕高的比例
     */
    private _orthoWidth = 1;

    // priority. the smaller one will be rendered first
    //当场景有多个相机时，决定那个相机先渲染
    _priority = 0;


    /**
     * 视口与屏幕的对齐设置
     * 笛卡尔坐标系
     * x:表示视口的x轴方向的起始位置
     * y:表示视口的y轴方向的起始位置
     * w:表示视口的宽度和屏幕的宽度的比值
     * h:表示视口的高度和屏幕的高度的比值
     */
    private _rect = {
        x: 0, y: 0, w: 1, h: 1
    };

    public setRect(x = 0, y = 0, w = 1, h = 1): void {
        this._rect.x = x;
        this._rect.y = y;
        this._rect.w = w;
        this._rect.h = h;
    }
    //获取视口
    public get rect(): any {
        return this._rect;
    }

    /**
     * 透视矩阵
     */
    public getProjectionMatrix(): any {
        return this._projectionMatrix;
    }


    /**
     * Get the clearing flags of the camera
     * @returns {number} camera clearing flags
     */
    getClearFlags() {
        return this._clearFlags;
    }

    /**
     * Set the clearing flags of the camera
     * @param {number} flags camera clearing flags
     */
    setClearFlags(flags) {
        this._clearFlags = flags;
    }


    private _type: number = enums.PROJ_PERSPECTIVE;

    /**
     * 更新相机矩阵
     * 主要是投影矩阵和模型矩阵
     */
    private updateCameraMatrix(): void {

        if (this._type == enums.PROJ_PERSPECTIVE) {
            this._glMatrix.mat4.perspective(this._projectionMatrix, this._fovy, this._aspect, this._near, this._far);
        }
        else {
            let x = this._orthoWidth;
            let y = this._orthoHeight;
            /**
             * 下面将会构造一个正交投影矩阵
             * 可以把齐次裁切坐标的位置想象成屏幕正中心
             * x的范围是【-x,x】
             * y的范围是【-y,y】
             * 这个将会映射到屏幕坐标系上，而屏幕坐标的范围是【0,1】
             * 这里就会存在映射关系
             * 对于2d，在我们的逻辑中，通常是把物体放在屏幕坐标系下，我们只关心这个屏幕坐标系下的坐标
             * 但其实齐次裁切坐标它的正中心确是视口的中心，并非左下角，所以这里边的映射就需要注意
             * 最后：
             * 1可以提供给用户，就让他去使用屏幕坐标系，只是最后上传渲染数据的时候，我们把它映射到齐次裁切空间下
             * 屏幕--》齐次裁切
             * 【0,1】->【-x,x】
             * 【0,1】->【-y,y】
             * 2渲染完成以后，我们再把它从齐次裁切空间映射到屏幕坐标系
             * 齐次裁切 --》屏幕
             * 【-x,x】->【0,1】
             * 【-y,y】->【0,1】
             */
            this._glMatrix.mat4.ortho(this._projectionMatrix,
                -x, x, -y, y, this._near, this._far
            );
        }
        var m = this._glMatrix.mat4.create();
        // 初始化模型视图矩阵
        this._glMatrix.mat4.identity(m);
        // //摄像机的位置
        this._glMatrix.mat4.lookAt(m, this._eye, this._center, this._up);


        //有肯能相机被放在了某个物上
        if (this.parent) {
            this._glMatrix.mat4.mul(this._worldMatrix, this._worldMatrix, m);
        }
        else {
            this._glMatrix.mat4.copy(this._worldMatrix, m);
        }

        this.updateMatrixData();
    }

    public getInversModelViewMatrix(): any {
        var invers = this._glMatrix.mat4.create();
        this._glMatrix.mat4.invert(invers, this._modelMatrix)
        return invers;
    }

    /**
     * 此函数务必调用
     * @param eye  相机的位置
     * @param center 相机看向的位置
     * @param up 
     * 按照我设定的默认参数，
     * 看向原点，此处的原点指的是屏幕的中心，
     * 相机正着摆放，可以把自己的头当做摄像机
     * eye.z>=0,正面看屏幕的中心
     * eye.z<0,背面看屏幕的中心
     */
    public lookAt(eye: Array<number>, center: Array<number> = [0, 0, 0], up: Array<number> = [0, 1, 0]): void {
        this._eye = eye;
        this._center = center;
        this._up = up;
        this.updateCameraMatrix();
    }
    public setUp(x, y, z): void {
        this._up = [];
        this._up.push(x);
        this._up.push(y);
        this._up.push(z);
    }
    public setCenter(x, y, z): void {
        this._center = [];
        this._center.push(x);
        this._center.push(y);
        this._center.push(z);
    }


    /**
     * !#en
     * Destination render texture.
     * Usually cameras render directly to screen, but for some effects it is useful to make a camera render into a texture.
     * !#zh
     * 摄像机渲染的目标 RenderTexture。
     * 一般摄像机会直接渲染到屏幕上，但是有一些效果可以使用摄像机渲染到 RenderTexture 上再对 RenderTexture 进行处理来实现。
     * @property {RenderTexture} targetTexture
     */
    set targetTexture(targetTexture: RenderTexture) {
        this._targetTexture = targetTexture;
        this._updateTargetTexture();
    }
    get targetTexture(): RenderTexture {
        return this._targetTexture
    }
    private _updateTargetTexture() {
        let texture = this._targetTexture;
        this.setFrameBuffer(texture ? texture._frameBuffer : null);
    }
    /**
    * Get the framebuffer of the camera
    * @returns {FrameBuffer} camera framebuffer
    */
    getFramebuffer() {
        return this._framebuffer;
    }
    /**
     * Set the framebuffer of the camera
     * @param {FrameBuffer} framebuffer camera framebuffer
     */
    setFrameBuffer(framebuffer) {
        this._framebuffer = framebuffer;
    }




}