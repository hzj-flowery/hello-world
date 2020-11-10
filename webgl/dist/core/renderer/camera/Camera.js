"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("./enums");
var Node_1 = require("../base/Node");
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
var ClearFlags;
(function (ClearFlags) {
    /**
    * !#en
    * Clear the background color.
    * !#zh
    * 清除背景颜色
    * @property COLOR
    */
    ClearFlags[ClearFlags["COLOR"] = 1] = "COLOR";
    /**
     * !#en
     * Clear the depth buffer.
     * !#zh
     * 清除深度缓冲区
     * @property DEPTH
     */
    ClearFlags[ClearFlags["DEPTH"] = 2] = "DEPTH";
    /**
     * !#en
     * Clear the stencil.
     * !#zh
     * 清除模板缓冲区
     * @property STENCIL
     */
    ClearFlags[ClearFlags["STENCIL"] = 4] = "STENCIL";
})(ClearFlags || (ClearFlags = {}));
var StageFlags;
(function (StageFlags) {
    StageFlags[StageFlags["OPAQUE"] = 1] = "OPAQUE";
    StageFlags[StageFlags["TRANSPARENT"] = 2] = "TRANSPARENT";
})(StageFlags || (StageFlags = {}));
var Camera = /** @class */ (function (_super) {
    __extends(Camera, _super);
    /**
     *
     * @param fovy    //相机张开的角度
     * @param aspect //宽高横纵比
     * @param near   //最近能看到的距离
     * @param far    //最远能看到的距离
     * @param type   //相机的类型
     */
    function Camera(fovy, aspect, near, far, type) {
        var _this = _super.call(this) || this;
        /**
         * 清除标志
         * 在GPU的一次绘制过程中，会在在帧缓冲区产生三个附件
         * 颜色缓冲附件:存储RGB
         * 深度附件:存储深度z值
         * 模板缓冲附件：存储模板值，用于测试，比如我们只绘制某一些具有特定模板值的像素
         * 我们将像素信息绘制到屏幕，都是依靠这三个附件的，
         * 绘制结束后，我们需要及时清理
         */
        _this._clearFlags = enums_1.default.CLEAR_COLOR | enums_1.default.CLEAR_DEPTH;
        /**
         * 清理屏幕时使用的颜色
         * 当我们把帧缓冲的附件置空的时候，那么就会出现黑屏，原因是GPU从帧缓冲取不到颜色数据用于渲染
         * 这个时候需要我们指定一种颜色来更换帧缓冲的颜色附件中的像素信息
         */
        _this._clearColor = [];
        // ortho properties
        /**
         * 下面这个值将会影响齐次裁切空间的高度的范围大小
         * 【-_orthoHeight,_orthoHeight】
         * 非常重要，相当于视口的宽和屏幕宽的比例
         * 这个一般用于2D渲染
         * 屏幕空间--》齐次裁切空间--》屏幕空间
         */
        _this._orthoHeight = 1;
        /**
         * 下面这个值将会影响齐次裁切空间的宽度的范围大小
         * 【-_orthoWidth,_orthoWidth】
         * 非常重要，相当于视口的高和屏幕高的比例
         */
        _this._orthoWidth = 1;
        // priority. the smaller one will be rendered first
        //当场景有多个相机时，决定那个相机先渲染
        _this._priority = 0;
        /**
         * 视口与屏幕的对齐设置
         * 笛卡尔坐标系
         * x:表示视口的x轴方向的起始位置
         * y:表示视口的y轴方向的起始位置
         * w:表示视口的宽度和屏幕的宽度的比值
         * h:表示视口的高度和屏幕的高度的比值
         */
        _this._rect = {
            x: 0, y: 0, w: 1, h: 1
        };
        _this._type = enums_1.default.PROJ_PERSPECTIVE;
        _this.fovy = fovy;
        _this.aspect = aspect;
        _this._near = near;
        _this._far = far;
        //创建透视矩阵
        _this._projectionMatrix = _this._glMatrix.mat4.create();
        _this._type = type;
        _this._center = [0, 0, 0]; //看向原点
        _this._up = [0, 1, 0]; //向上看
        _this._eye = [0, 0, 0]; //默认看向原点
        _this.updateLocalMatrix();
        return _this;
    }
    Camera.prototype.setRect = function (x, y, w, h) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (w === void 0) { w = 1; }
        if (h === void 0) { h = 1; }
        this._rect.x = x;
        this._rect.y = y;
        this._rect.w = w;
        this._rect.h = h;
    };
    Object.defineProperty(Camera.prototype, "rect", {
        //获取视口
        get: function () {
            return this._rect;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the clearing flags of the camera
     * @returns {number} camera clearing flags
     */
    Camera.prototype.getClearFlags = function () {
        return this._clearFlags;
    };
    /**
     * Set the clearing flags of the camera
     * @param {number} flags camera clearing flags
     */
    Camera.prototype.setClearFlags = function (flags) {
        this._clearFlags = flags;
    };
    /**
     * 获取透视矩阵
     */
    Camera.prototype.getProjectionMatrix = function () {
        return this._projectionMatrix;
    };
    //更新矩阵
    Camera.prototype.updateLocalMatrix = function () {
        if (this._type == enums_1.default.PROJ_PERSPECTIVE) {
            this._glMatrix.mat4.perspective(this._projectionMatrix, this.fovy, this.aspect, this._near, this._far);
        }
        else {
            var x = this._orthoWidth;
            var y = this._orthoHeight;
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
            this._glMatrix.mat4.ortho(this._projectionMatrix, -x, x, -y, y, this._near, this._far);
        }
        var m = this._glMatrix.mat4.create();
        // 初始化模型视图矩阵
        this._glMatrix.mat4.identity(m);
        // //摄像机的位置
        this._glMatrix.mat4.lookAt(m, this._eye, this._center, this._up);
        console.log(m);
        this._glMatrix.mat4.copy(this._modelMatrix, m);
        this.updateScaleRotateMatrix();
    };
    /**
     * 更新缩放旋转
     */
    Camera.prototype.updateScaleRotateMatrix = function () {
        //处理旋转
        this.mat4Scale$3(this._modelMatrix, this._modelMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
        //旋转
        this.matrix4RotateX(this._modelMatrix, this._modelMatrix, this.rotateX * (Math.PI / 180));
        this.matrix4RotateY(this._modelMatrix, this._modelMatrix, this.rotateY * (Math.PI / 180));
        this.matrix4RotateZ(this._modelMatrix, this._modelMatrix, this.rotateZ * (Math.PI / 180));
        //平移
        this.mat4Translate$2(this._modelMatrix, this._modelMatrix, [this.x, this.y, this.z]);
    };
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
    Camera.prototype.lookAt = function (eye, center, up) {
        if (center === void 0) { center = [0, 0, 0]; }
        if (up === void 0) { up = [0, 1, 0]; }
        // this.setPosition(eye[0], eye[1], eye[2]);
        this._eye = eye;
        this._center = center;
        this._up = up;
        this.updateLocalMatrix();
    };
    Camera.prototype.setUp = function (x, y, z) {
        this._up = [];
        this._up.push(x);
        this._up.push(y);
        this._up.push(z);
    };
    Camera.prototype.setCenter = function (x, y, z) {
        this._center = [];
        this._center.push(x);
        this._center.push(y);
        this._center.push(z);
    };
    //日后删除
    Camera.prototype.forceUpdateLocalMatrix = function () {
        this.mat4Translate$2(this._modelMatrix, this._modelMatrix, [this.x, this.y, this.z]);
        //处理旋转
        this.mat4Scale$3(this._modelMatrix, this._modelMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
        //旋转
        this.matrix4RotateX(this._modelMatrix, this._modelMatrix, this.rotateX * (Math.PI / 180));
        this.matrix4RotateY(this._modelMatrix, this._modelMatrix, this.rotateY * (Math.PI / 180));
        this.matrix4RotateZ(this._modelMatrix, this._modelMatrix, this.rotateZ * (Math.PI / 180));
    };
    Object.defineProperty(Camera.prototype, "targetTexture", {
        get: function () {
            return this._targetTexture;
        },
        /**
         * !#en
         * Destination render texture.
         * Usually cameras render directly to screen, but for some effects it is useful to make a camera render into a texture.
         * !#zh
         * 摄像机渲染的目标 RenderTexture。
         * 一般摄像机会直接渲染到屏幕上，但是有一些效果可以使用摄像机渲染到 RenderTexture 上再对 RenderTexture 进行处理来实现。
         * @property {RenderTexture} targetTexture
         */
        set: function (targetTexture) {
            this._targetTexture = targetTexture;
            this._updateTargetTexture();
        },
        enumerable: false,
        configurable: true
    });
    Camera.prototype._updateTargetTexture = function () {
        var texture = this._targetTexture;
        this.setFrameBuffer(texture ? texture._frameBuffer : null);
    };
    /**
    * Get the framebuffer of the camera
    * @returns {FrameBuffer} camera framebuffer
    */
    Camera.prototype.getFramebuffer = function () {
        return this._framebuffer;
    };
    /**
     * Set the framebuffer of the camera
     * @param {FrameBuffer} framebuffer camera framebuffer
     */
    Camera.prototype.setFrameBuffer = function (framebuffer) {
        this._framebuffer = framebuffer;
    };
    return Camera;
}(Node_1.Node));
exports.default = Camera;
//# sourceMappingURL=Camera.js.map