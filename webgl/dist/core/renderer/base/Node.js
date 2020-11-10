"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var Ref_1 = require("../../../Ref");
var Matrix_1 = require("../../Matrix");
var Node = /** @class */ (function (_super) {
    __extends(Node, _super);
    function Node() {
        var _this = _super.call(this) || this;
        _this.x = 0;
        _this.y = 0;
        _this.z = 0;
        _this.scaleX = 1;
        _this.scaleY = 1;
        _this.scaleZ = 1;
        _this.rotateX = 0;
        _this.rotateY = 0;
        _this.rotateZ = 0;
        _this.width = 0; //宽度
        _this.height = 0; //高度
        _this.anchorX = 0.5; //x轴锚点
        _this.anchorY = 0.5; //y轴锚点
        _this._glMatrix = Matrix_1.glMatrix; //矩阵操作api
        _this._isNeedUpdateMatrix = false; //是否需要更新矩阵
        _this.initBaseNode();
        return _this;
    }
    Node.prototype.initBaseNode = function () {
        this.name = "defaultName";
        this._children = [];
        this._modelMatrix = this._glMatrix.mat4.create();
        this._fatherMatrix = this._glMatrix.mat4.create();
        this._glMatrix.mat4.identity(this._fatherMatrix);
    };
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (node) {
            this._parent = node;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * @param node
     */
    Node.prototype.addChild = function (node) {
        this._children.push(node);
        node.parent = this;
    };
    /**
     *
     * @param node
     */
    Node.prototype.removeChild = function (node) {
        var index = this._children.indexOf(node);
        if (index >= 0) {
            this._children.splice(index, 1);
        }
    };
    /**
     * 给节点添加相机
     * 此节点目前只支持scene
     * @param camera
     */
    Node.prototype.addCamera = function (camera) {
        //1处调用
        this.setMatrix(camera.getModelViewMatrix(), camera.getProjectionMatrix());
    };
    //更新世界矩阵
    Node.prototype.updateWorldMatrix = function () {
        if (this._parent) {
            //二处调用
            this.setMatrix(this._parent.getModelViewMatrix(), this._parent.getProjectionMatrix());
            return;
        }
        //否则这就是场景节点，不需要变换
    };
    //绘制之前
    Node.prototype.onDrawBefore = function () {
    };
    Node.prototype.onDrawAfter = function () {
    };
    Node.prototype.drawBefore = function () {
        //更新矩阵数据
    };
    Node.prototype.drawAfter = function () {
    };
    //开启绘制
    Node.prototype.readyDraw = function (time) {
        //更新世界节点
        this.updateWorldMatrix();
        //更新当前节点的矩阵数据
        this.updateMatrixData();
        //开始绘制
        this.draw(time);
        for (var j = 0; j < this._children.length; j++) {
            this._children[j].readyDraw(time);
        }
    };
    Node.prototype.draw = function (time) {
    };
    /**
     *
     * @param mvMatrix 模型视口矩阵
     * @param projMatrix 透视矩阵
     */
    Node.prototype.setMatrix = function (mvMatrix, projMatrix) {
        this._fatherMatrix = this.mat4Clone$3(mvMatrix);
        this._projectionMatrix = this.mat4Clone$3(projMatrix);
    };
    /**
    * 更新2D矩阵
    * 将此节点的数据更新到这个矩阵中
    */
    Node.prototype.updateMatrixData = function () {
        //旋转
        this.matrix4RotateX(this._modelMatrix, this._fatherMatrix, this.rotateX * (Math.PI / 180));
        this.matrix4RotateY(this._modelMatrix, this._modelMatrix, this.rotateY * (Math.PI / 180));
        this.matrix4RotateZ(this._modelMatrix, this._modelMatrix, this.rotateZ * (Math.PI / 180));
        //处理旋转
        this.mat4Scale$3(this._modelMatrix, this._modelMatrix, [this.scaleX, this.scaleY, this.scaleZ]);
        //平移
        this.mat4Translate$2(this._modelMatrix, this._modelMatrix, [this.x, this.y, this.z]);
    };
    /**
     * 本地矩阵
     */
    Node.prototype.getModelViewMatrix = function () {
        return this._modelMatrix;
    };
    /**
     * 透视矩阵
     */
    Node.prototype.getProjectionMatrix = function () {
        return this._projectionMatrix;
    };
    Node.prototype.setPosition = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };
    Node.prototype.setScale = function (x, y, z) {
        this.scaleX = x;
        this.scaleY = y;
        this.scaleZ = z;
    };
    Node.prototype.setRotation = function (x, y, z) {
        this.rotateX = x;
        this.rotateY = y;
        this.rotateZ = z;
    };
    Node.prototype.rotate = function (x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.rotateX = this.rotateX + x;
        this.rotateY = this.rotateY + y;
        this.rotateZ = this.rotateZ + z;
    };
    //矩阵运算---------------------------------------------------------------------
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    Node.prototype.matrix4RotateY = function (out, a, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        var a00 = a[0];
        var a01 = a[1];
        var a02 = a[2];
        var a03 = a[3];
        var a20 = a[8];
        var a21 = a[9];
        var a22 = a[10];
        var a23 = a[11];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged rows
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        } // Perform axis-specific matrix multiplication
        /**
         *  【0  4  8   12】
         *  【1  5  9   13】
         *  【2  6  10  14】
         *  【3  7  11  15】
         *   x轴 y轴 z轴
         *  【1  0  0   0】
         *  【0  1  0   0】
         *  【0  0  1   0】
         *  【0  1  0   1】
         */
        out[0] = a00 * c - a20 * s; //x轴的x坐标在世界坐标系下的投影
        out[1] = a01 * c - a21 * s; //
        out[2] = a02 * c - a22 * s;
        out[3] = a03 * c - a23 * s;
        out[8] = a00 * s + a20 * c;
        out[9] = a01 * s + a21 * c;
        out[10] = a02 * s + a22 * c;
        out[11] = a03 * s + a23 * c;
        return out;
    };
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */
    Node.prototype.matrix4RotateX = function (out, a, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        var a10 = a[4];
        var a11 = a[5];
        var a12 = a[6];
        var a13 = a[7];
        var a20 = a[8];
        var a21 = a[9];
        var a22 = a[10];
        var a23 = a[11];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged rows
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        } // Perform axis-specific matrix multiplication
        out[4] = a10 * c + a20 * s;
        out[5] = a11 * c + a21 * s;
        out[6] = a12 * c + a22 * s;
        out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s;
        out[9] = a21 * c - a11 * s;
        out[10] = a22 * c - a12 * s;
        out[11] = a23 * c - a13 * s;
        return out;
    };
    /**
    * Rotates a matrix by the given angle around the Z axis
    *
    * @param {mat4} out the receiving matrix
    * @param {mat4} a the matrix to rotate
    * @param {Number} rad the angle to rotate the matrix by
    * @returns {mat4} out
    */
    Node.prototype.matrix4RotateZ = function (out, a, rad) {
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        var a00 = a[0];
        var a01 = a[1];
        var a02 = a[2];
        var a03 = a[3];
        var a10 = a[4];
        var a11 = a[5];
        var a12 = a[6];
        var a13 = a[7];
        if (a !== out) {
            // If the source and destination differ, copy the unchanged last row
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        } // Perform axis-specific matrix multiplication
        out[0] = a00 * c + a10 * s;
        out[1] = a01 * c + a11 * s;
        out[2] = a02 * c + a12 * s;
        out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s;
        out[5] = a11 * c - a01 * s;
        out[6] = a12 * c - a02 * s;
        out[7] = a13 * c - a03 * s;
        return out;
    };
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to translate
     * @param {vec3} v vector to translate by
     * @returns {mat4} out
     */
    Node.prototype.mat4Translate$2 = function (out, a, v) {
        var x = v[0], y = v[1], z = v[2];
        var a00, a01, a02, a03;
        var a10, a11, a12, a13;
        var a20, a21, a22, a23;
        /**
        *  【0  4  8   12】
        *  【1  5  9   13】
        *  【2  6  10  14】
        *  【3  7  11  15】
        *   x轴 y轴 z轴
        *  【1  0  0   0】  [x]
        *  【0  1  0   0】  [y]
        *  【0  0  1   0】  [z]
        *  【0  1  0   1】
        *   解析
        *   世界空间坐标系属于右手坐标系，右手手背背着屏幕，大拇指向右+x,食指向上+y,中指指向自己+z
        *   一个向量可以构成一个线，两个向量可以构成一个面，三个向量可以构成一个空间
        *   x轴向量：【1，0，0】
        *   y轴向量：【0，1，0】
        *   z轴向量：【0，0，1】
        *
        *   特别规定1，这三个坐标轴都是两两互相垂直的
        *   特别规定2，世界空间坐标系是以一个参照物，是不允许发生任何改变的，比如旋转 缩放，平移
        *
        *   空间坐标系的长度单位就是【1，1，1】，三个轴两两互相垂直
        *   这个长度单位很重要，不可以忽视，它其实起到了一个缩放的作用，我们在外界会有一个长度，这个长度映射到空间坐标系中就需要和这个单位相乘
        *   举个例子，对于一个存在于世界空间坐标系中的点，我们对于它的坐标的定义为（x1,y1,z1）,那他的位置究竟在哪呢，由于它直接位于世界空间坐标系
        *   系中，所以它的坐标位置就是（x1,y1,z1）,其实这个结果是基于下面这个运算方法：
        *   （x1和x轴向量相乘，y1和y轴坐标相乘，z1和z轴向量相乘），只是他们是基于原点，并且长度单位为1，所以结果就是（x1,y1,z1）
        *   关于这个
        *   对于实际的渲染运算中，我们通常会构造一个矩阵来和世界坐标系相对应，虽然他是4维矩阵，但是这只是构造出来的而已，前面三列指的是坐标轴，
        *   就是和世界空间坐标系的那个坐标轴一样的，只是它允许缩放，旋转，和平移，后面的一列其实是记录这个矩阵的坐标系的位置
        *   我们通常会用一个摄像机来干这样的事情，摄像机的位置（x,y,z）,就可以构造出来这么一个对应的矩阵坐标系，如果摄像机的位置为【0，0，0】，说明这个摄像机构造出来
        *   的摄像机坐标系位于世界坐标系的原点，如果摄像机坐标系的长度单位是【1，1，1】，旋转【0，0，0】，那说明这个摄像机所构造的空间坐标系就是世界空间坐标系
        *   然而事实上我们不会这样做，摄像机作为一个节点存在，它可以进行任何变换，这里的变换指的是缩放，旋转，平移，缩放变换修改的是每个坐标轴的长度单位
        *   旋转变换修改的是坐标轴向量的（x,y,z）值，平移变换修改的是整个节点空间坐标系的位置，那么我们为什么会构造一个四维方针矩阵呢，就是用第四列来存放当前坐标系的位置用的
        *
        *   空间坐标系推演
        *
        *   世界空间坐标系
        *
        *   相机，它作为一个节点存在于世界空间坐标系中，它会构造一个相机的节点坐标系，这个节点的位置记录在第四列向量中，它的前三列记录的是当前相机节点是如何修改这个节点坐标系的
        *   修改的行为包含了缩放和旋转，其实就是修改三个坐标轴的向量，凡是位于这个节点坐标系下的顶点乘以这个矩阵都可以得出来世界空间坐标系下的位置
        *
        *    宏观上看，一个节点坐标系，不过是对世界坐标系进行变换
        *
        *    在相机的节点坐标系中，又包含很多节点，比如场景节点，同样场景作为一个节点存在，他也会去构造一个节点坐标系，
        *
        *    场景中也会包含很多节点，每个节点也会去构造自己的节点坐标系
        *
        *    节点本身也是可以包含很多节点，这些节点都有自己的节点坐标系
        *
        *
        *    相机是世界坐标系的节点，把相机看成一个点，由于世界坐标系不会生任何变换，所以这个点就处在世界坐标系空间中
        *    但是相机不是吃醋的，他要生根发芽，所以它也会构造一个空间坐标系出来，这个坐标系起初和世界坐标系是完全吻合的，但由于相机天生好动，它会缩放，旋转，平移
        *    这会造成这个空间坐标系不同于世界坐标系，相机的空间坐标系里包含了很多点，那这些点如果想转换为世界空间坐标系下，就需要乘以相机这个空间坐标系
        *
        *    场景是相机空间坐标系下的一个节点，把场景看成一个点，只要乘以相机的空间坐标系就可以转换到世界坐标系下的点
        *    但场景也不是吃醋的，它也要生根发芽，所以它也要造一个空间坐标系出来，起初这个坐标系和相机坐标系完全吻合的，但由于场景天生好动，它也会缩放，旋转，平移
        *    这会造成这个空间坐标系不同与相机的坐标系，场景的空间坐标系里包含了很多点，那这些点如果要想转换为相机空间坐标下的点，就需要乘以场景这个空间坐标系
        *
        *    节点是场景空间坐标系下的一个节点，把节点看成一个点，只要乘以场景的空间坐标系就可以转换到相机的坐标系下的点
        *    但节点也不是吃醋的，它也要生根发芽，所以它也要造一个节点坐标系，起初这个节点坐标系和场景的节点坐标系完全吻合的，但由于这个节点天生好动，它也会缩放，旋转，平移
        *    这会造成这个节点坐标系不同于场景的空间坐标系，对于节点中的点，如果它要想变为场景空间坐标系下的点，就需要乘以这个节点坐标系
        *
        *    。。。接下来就是节点的各种继承了
        *
        *    对于旋转和缩放，我们制定了一个前三列向量分别用来记录，当前节点对于它构造的空间坐标系的变换，其实这个前三列向量就是指的是x轴，y轴，z轴
        *    对于第四列，我们用来保存当前节点将自己的空间坐标系平移变换的位置
        */
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        }
        else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
        return out;
    };
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {mat4} a the matrix to scale
     * @param {vec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/
    Node.prototype.mat4Scale$3 = function (out, a, v) {
        var x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x;
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
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    };
    /**
    * Creates a new mat4 initialized with values from an existing matrix
    *
    * @param {mat4} a matrix to clone
    * @returns {mat4} a new 4x4 matrix
    */
    Node.prototype.mat4Clone$3 = function (a) {
        var out = new Float32Array(16);
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    };
    return Node;
}(Ref_1.default));
exports.Node = Node;
//# sourceMappingURL=Node.js.map