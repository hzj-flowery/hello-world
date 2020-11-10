"use strict";
/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.sy_v3 = void 0;
var CCDebug_1 = require("../../CCDebug");
var misc_1 = require("../utils/misc");
var utils_1 = require("./utils");
var value_type_1 = require("./value-type");
var vec2_1 = require("./vec2");
var _x = 0.0;
var _y = 0.0;
var _z = 0.0;
/**
 * !#en Representation of 3D vectors and points.
 * !#zh 表示 3D 向量和坐标
 *
 * @class Vec3
 * @extends ValueType
 */
var Vec3 = /** @class */ (function (_super) {
    __extends(Vec3, _super);
    /**
     * !#en
     * Constructor
     * see {{#crossLink "cc/vec3:method"}}cc.v3{{/crossLink}}
     * !#zh
     * 构造函数，可查看 {{#crossLink "cc/vec3:method"}}cc.v3{{/crossLink}}
     * @method constructor
     * @param {Vec3|number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    function Vec3(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        var _this = _super.call(this) || this;
        /**
         * !#en Returns the length of this vector.
         * !#zh 返回该向量的长度。
         * @method mag
         * @return {number} the result
         * @example
         * var v = cc.v3(10, 10, 10);
         * v.mag(); // return 17.320508075688775;
         */
        _this.mag = function () {
            return Vec3.len(this);
        };
        /**
         * !#en Returns the squared length of this vector.
         * !#zh 返回该向量的长度平方。
         * @method magSqr
         * @return {number} the result
         */
        _this.magSqr = Vec3.lengthSqr;
        /**
         * !#en Subtracts one vector from this. If you want to save result to another vector, use sub() instead.
         * !#zh 向量减法。如果你想保存结果到另一个向量，可使用 sub() 代替。
         * @method subSelf
         * @param {Vec3} vector
         * @return {Vec3} returns this
         * @chainable
         */
        _this.subSelf = Vec3.subtract;
        /**
         * !#en Multiplies this by a number. If you want to save result to another vector, use mul() instead.
         * !#zh 缩放当前向量。如果你想结果保存到另一个向量，可使用 mul() 代替。
         * @method mulSelf
         * @param {number} num
         * @return {Vec3} returns this
         * @chainable
         */
        _this.mulSelf = Vec3.multiplyScalar;
        /**
         * !#en Divides by a number. If you want to save result to another vector, use div() instead.
         * !#zh 向量除法。如果你想结果保存到另一个向量，可使用 div() 代替。
         * @method divSelf
         * @param {number} num
         * @return {Vec3} returns this
         * @chainable
         */
        _this.divSelf = Vec3.divide;
        /**
         * !#en Multiplies two vectors.
         * !#zh 分量相乘。
         * @method scaleSelf
         * @param {Vec3} vector
         * @return {Vec3} returns this
         * @chainable
         */
        _this.scaleSelf = Vec3.multiply;
        /**
         * !#en Negates the components. If you want to save result to another vector, use neg() instead.
         * !#zh 向量取反。如果你想结果保存到另一个向量，可使用 neg() 代替。
         * @method negSelf
         * @return {Vec3} returns this
         * @chainable
         */
        _this.negSelf = Vec3.negate;
        /**
         * !#en Get angle in radian between this and vector.
         * !#zh 夹角的弧度。
         * @method angle
         * @param {Vec3} vector
         * @return {number} from 0 to Math.PI
         */
        _this.angle = vec2_1.Vec2.angle;
        if (x && typeof x === 'object') {
            _this.x = x.x;
            _this.y = x.y;
            _this.z = x.z;
        }
        else {
            _this.x = x;
            _this.y = y;
            _this.z = z;
        }
        return _this;
    }
    /**
     * !#en Subtracts one vector from this, and returns the new result.
     * !#zh 向量减法，并返回新结果。
     * @method sub
     * @param {Vec3} vector
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} the result
     */
    Vec3.prototype.sub = function (vector, out) {
        return Vec3.subtract(out || new Vec3(), this, vector);
    };
    /**
     * !#en Multiplies by a number, and returns the new result.
     * !#zh 缩放向量，并返回新结果。
     * @method mul
     * @param {number} num
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} the result
     */
    Vec3.prototype.mul = function (num, out) {
        return Vec3.multiplyScalar(out || new Vec3(), this, num);
    };
    /**
     * !#en Divides by a number, and returns the new result.
     * !#zh 向量除法，并返回新的结果。
     * @method div
     * @param {number} num
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} the result
     */
    Vec3.prototype.div = function (num, out) {
        return Vec3.multiplyScalar(out || new Vec3(), this, 1 / num);
    };
    /**
     * !#en Multiplies two vectors, and returns the new result.
     * !#zh 分量相乘，并返回新的结果。
     * @method scale
     * @param {Vec3} vector
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} the result
     */
    Vec3.prototype.scale = function (vector, out) {
        return Vec3.multiply(out || new Vec3(), this, vector);
    };
    /**
     * !#en Negates the components, and returns the new result.
     * !#zh 返回取反后的新向量。
     * @method neg
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} the result
     */
    Vec3.prototype.neg = function (out) {
        return Vec3.negate(out || new Vec3(), this);
    };
    Object.defineProperty(Vec3, "ONE", {
        /**
         * !#en return a Vec3 object with x = 1, y = 1, z = 1.
         * !#zh 新 Vec3 对象。
         * @property ONE
         * @type Vec3
         * @static
         */
        get: function () { return new Vec3(1, 1, 1); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vec3, "ZERO", {
        /**
         * !#en return a Vec3 object with x = 0, y = 0, z = 0.
         * !#zh 返回 x = 0，y = 0，z = 0 的 Vec3 对象。
         * @property ZERO
         * @type Vec3
         * @static
         */
        get: function () { return new Vec3(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vec3, "UP", {
        /**
         * !#en return a Vec3 object with x = 0, y = 1, z = 0.
         * !#zh 返回 x = 0, y = 1, z = 0 的 Vec3 对象。
         * @property UP
         * @type Vec3
         * @static
         */
        get: function () { return new Vec3(0, 1, 0); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vec3, "RIGHT", {
        /**
         * !#en return a Vec3 object with x = 1, y = 0, z = 0.
         * !#zh 返回 x = 1，y = 0，z = 0 的 Vec3 对象。
         * @property RIGHT
         * @type Vec3
         * @static
         */
        get: function () { return new Vec3(1, 0, 0); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vec3, "FORWARD", {
        /**
         * !#en return a Vec3 object with x = 0, y = 0, z = 1.
         * !#zh 返回 x = 0，y = 0，z = 1 的 Vec3 对象。
         * @property FORWARD
         * @type Vec3
         * @static
         */
        get: function () { return new Vec3(0, 0, 1); },
        enumerable: false,
        configurable: true
    });
    /**
     * !#zh 将目标赋值为零向量
     * !#en The target of an assignment zero vector
     * @method zero
     * @typescript
     * zero<Out extends IVec3Like> (out: Out): Out
     * @static
     */
    Vec3.zero = function (out) {
        out.x = 0;
        out.y = 0;
        out.z = 0;
        return out;
    };
    /**
     * !#zh 获得指定向量的拷贝
     * !#en Obtaining copy vectors designated
     * @method clone
     * @typescript
     * clone<Out extends IVec3Like> (a: Out): Vec3
     * @static
     */
    Vec3.clone = function (a) {
        return new Vec3(a.x, a.y, a.z);
    };
    /**
     * !#zh 复制目标向量
     * !#en Copy the target vector
     * @method copy
     * @typescript
     * copy<Out extends IVec3Like, Vec3Like extends IVec3Like> (out: Out, a: Vec3Like): Out
     * @static
     */
    Vec3.copy = function (out, a) {
        out.x = a.x;
        out.y = a.y;
        out.z = a.z;
        return out;
    };
    /**
     * !#zh 设置向量值
     * !#en Set to value
     * @method set
     * @typescript
     * set<Out extends IVec3Like> (out: Out, x: number, y: number, z: number): Out
     * @static
     */
    Vec3.set = function (out, x, y, z) {
        out.x = x;
        out.y = y;
        out.z = z;
        return out;
    };
    /**
     * !#zh 逐元素向量加法
     * !#en Element-wise vector addition
     * @method add
     * @typescript
     * add<Out extends IVec3Like> (out: Out, a: Out, b: Out): Out
     * @static
     */
    Vec3.add = function (out, a, b) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
        return out;
    };
    /**
     * !#zh 逐元素向量减法
     * !#en Element-wise vector subtraction
     * @method subtract
     * @typescript
     * subtract<Out extends IVec3Like> (out: Out, a: Out, b: Out): Out
     * @static
     */
    Vec3.subtract = function (out, a, b) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
        return out;
    };
    /**
     * !#zh 逐元素向量乘法 (分量积)
     * !#en Element-wise vector multiplication (product component)
     * @method multiply
     * @typescript
     * multiply<Out extends IVec3Like, Vec3Like_1 extends IVec3Like, Vec3Like_2 extends IVec3Like> (out: Out, a: Vec3Like_1, b: Vec3Like_2): Out
     * @static
     */
    Vec3.multiply = function (out, a, b) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
        return out;
    };
    /**
     * !#zh 逐元素向量除法
     * !#en Element-wise vector division
     * @method divide
     * @typescript
     * divide<Out extends IVec3Like> (out: Out, a: Out, b: Out): Out
     * @static
     */
    Vec3.divide = function (out, a, b) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        out.z = a.z / b.z;
        return out;
    };
    /**
     * !#zh 逐元素向量向上取整
     * !#en Rounding up by elements of the vector
     * @method ceil
     * @typescript
     * ceil<Out extends IVec3Like> (out: Out, a: Out): Out
     * @static
     */
    Vec3.ceil = function (out, a) {
        out.x = Math.ceil(a.x);
        out.y = Math.ceil(a.y);
        out.z = Math.ceil(a.z);
        return out;
    };
    /**
     * !#zh 逐元素向量向下取整
     * !#en Element vector by rounding down
     * @method floor
     * @typescript
     * floor<Out extends IVec3Like> (out: Out, a: Out): Out
     * @static
     */
    Vec3.floor = function (out, a) {
        out.x = Math.floor(a.x);
        out.y = Math.floor(a.y);
        out.z = Math.floor(a.z);
        return out;
    };
    /**
     * !#zh 逐元素向量最小值
     * !#en The minimum by-element vector
     * @method min
     * @typescript
     * min<Out extends IVec3Like> (out: Out, a: Out, b: Out): Out
     * @static
     */
    Vec3.min = function (out, a, b) {
        out.x = Math.min(a.x, b.x);
        out.y = Math.min(a.y, b.y);
        out.z = Math.min(a.z, b.z);
        return out;
    };
    /**
     * !#zh 逐元素向量最大值
     * !#en The maximum value of the element-wise vector
     * @method max
     * @typescript
     * max<Out extends IVec3Like> (out: Out, a: Out, b: Out): Out
     * @static
     */
    Vec3.max = function (out, a, b) {
        out.x = Math.max(a.x, b.x);
        out.y = Math.max(a.y, b.y);
        out.z = Math.max(a.z, b.z);
        return out;
    };
    /**
     * !#zh 逐元素向量四舍五入取整
     * !#en Element-wise vector of rounding to whole
     * @method round
     * @typescript
     * round<Out extends IVec3Like> (out: Out, a: Out): Out
     * @static
     */
    Vec3.round = function (out, a) {
        out.x = Math.round(a.x);
        out.y = Math.round(a.y);
        out.z = Math.round(a.z);
        return out;
    };
    /**
     * !#zh 向量标量乘法
     * !#en Vector scalar multiplication
     * @method multiplyScalar
     * @typescript
     * multiplyScalar<Out extends IVec3Like, Vec3Like extends IVec3Like> (out: Out, a: Vec3Like, b: number): Out
     * @static
     */
    Vec3.multiplyScalar = function (out, a, b) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
        return out;
    };
    /**
     * !#zh 逐元素向量乘加: A + B * scale
     * !#en Element-wise vector multiply add: A + B * scale
     * @method scaleAndAdd
     * @typescript
     * scaleAndAdd<Out extends IVec3Like> (out: Out, a: Out, b: Out, scale: number): Out
     * @static
     */
    Vec3.scaleAndAdd = function (out, a, b, scale) {
        out.x = a.x + b.x * scale;
        out.y = a.y + b.y * scale;
        out.z = a.z + b.z * scale;
        return out;
    };
    /**
     * !#zh 求两向量的欧氏距离
     * !#en Seeking two vectors Euclidean distance
     * @method distance
     * @typescript
     * distance<Out extends IVec3Like> (a: Out, b: Out): number
     * @static
     */
    Vec3.distance = function (a, b) {
        _x = b.x - a.x;
        _y = b.y - a.y;
        _z = b.z - a.z;
        return Math.sqrt(_x * _x + _y * _y + _z * _z);
    };
    /**
     * !#zh 求两向量的欧氏距离平方
     * !#en Euclidean distance squared seeking two vectors
     * @method squaredDistance
     * @typescript
     * squaredDistance<Out extends IVec3Like> (a: Out, b: Out): number
     * @static
     */
    Vec3.squaredDistance = function (a, b) {
        _x = b.x - a.x;
        _y = b.y - a.y;
        _z = b.z - a.z;
        return _x * _x + _y * _y + _z * _z;
    };
    /**
     * !#zh 求向量长度
     * !#en Seeking vector length
     * @method len
     * @typescript
     * len<Out extends IVec3Like> (a: Out): number
     * @static
     */
    Vec3.len = function (a) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        return Math.sqrt(_x * _x + _y * _y + _z * _z);
    };
    /**
     * !#zh 求向量长度平方
     * !#en Seeking squared vector length
     * @method lengthSqr
     * @typescript
     * lengthSqr<Out extends IVec3Like> (a: Out): number
     * @static
     */
    Vec3.lengthSqr = function (a) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        return _x * _x + _y * _y + _z * _z;
    };
    /**
     * !#zh 逐元素向量取负
     * !#en By taking the negative elements of the vector
     * @method negate
     * @typescript
     * negate<Out extends IVec3Like> (out: Out, a: Out): Out
     * @static
     */
    Vec3.negate = function (out, a) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;
        return out;
    };
    /**
     * !#zh 逐元素向量取倒数，接近 0 时返回 Infinity
     * !#en Element vector by taking the inverse, return near 0 Infinity
     * @method inverse
     * @typescript
     * inverse<Out extends IVec3Like> (out: Out, a: Out): Out
     * @static
     */
    Vec3.inverse = function (out, a) {
        out.x = 1.0 / a.x;
        out.y = 1.0 / a.y;
        out.z = 1.0 / a.z;
        return out;
    };
    /**
     * !#zh 逐元素向量取倒数，接近 0 时返回 0
     * !#en Element vector by taking the inverse, return near 0 0
     * @method inverseSafe
     * @typescript
     * inverseSafe<Out extends IVec3Like> (out: Out, a: Out): Out
     * @static
     */
    Vec3.inverseSafe = function (out, a) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        if (Math.abs(_x) < utils_1.EPSILON) {
            out.x = 0;
        }
        else {
            out.x = 1.0 / _x;
        }
        if (Math.abs(_y) < utils_1.EPSILON) {
            out.y = 0;
        }
        else {
            out.y = 1.0 / _y;
        }
        if (Math.abs(_z) < utils_1.EPSILON) {
            out.z = 0;
        }
        else {
            out.z = 1.0 / _z;
        }
        return out;
    };
    /**
     * !#zh 归一化向量
     * !#en Normalized vector
     * @method normalize
     * @typescript
     * normalize<Out extends IVec3Like, Vec3Like extends IVec3Like> (out: Out, a: Vec3Like): Out
     * @static
     */
    Vec3.normalize = function (out, a) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        var len = _x * _x + _y * _y + _z * _z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = _x * len;
            out.y = _y * len;
            out.z = _z * len;
        }
        return out;
    };
    /**
     * !#zh 向量点积（数量积）
     * !#en Vector dot product (scalar product)
     * @method dot
     * @typescript
     * dot<Out extends IVec3Like> (a: Out, b: Out): number
     * @static
     */
    Vec3.dot = function (a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    };
    /**
     * !#zh 向量叉积（向量积）
     * !#en Vector cross product (vector product)
     * @method cross
     * @typescript
     * cross<Out extends IVec3Like, Vec3Like_1 extends IVec3Like, Vec3Like_2 extends IVec3Like> (out: Out, a: Vec3Like_1, b: Vec3Like_2): Out
     * @static
     */
    Vec3.cross = function (out, a, b) {
        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;
        out.x = ay * bz - az * by;
        out.y = az * bx - ax * bz;
        out.z = ax * by - ay * bx;
        return out;
    };
    /**
     * !#zh 逐元素向量线性插值： A + t * (B - A)
     * !#en Vector element by element linear interpolation: A + t * (B - A)
     * @method lerp
     * @typescript
     * lerp<Out extends IVec3Like> (out: Out, a: Out, b: Out, t: number): Out
     * @static
     */
    Vec3.lerp = function (out, a, b, t) {
        out.x = a.x + t * (b.x - a.x);
        out.y = a.y + t * (b.y - a.y);
        out.z = a.z + t * (b.z - a.z);
        return out;
    };
    /**
     * !#zh 生成一个在单位球体上均匀分布的随机向量
     * !#en Generates a uniformly distributed random vectors on the unit sphere
     * @method random
     * @typescript
     * random<Out extends IVec3Like> (out: Out, scale?: number): Out
     * @param scale 生成的向量长度
     * @static
     */
    Vec3.random = function (out, scale) {
        scale = scale || 1.0;
        var phi = utils_1.random() * 2.0 * Math.PI;
        var cosTheta = utils_1.random() * 2 - 1;
        var sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        out.x = sinTheta * Math.cos(phi) * scale;
        out.y = sinTheta * Math.sin(phi) * scale;
        out.z = cosTheta * scale;
        return out;
    };
    /**
     * !#zh 向量与四维矩阵乘法，默认向量第四位为 1。
     * !#en Four-dimensional vector and matrix multiplication, the default vectors fourth one.
     * @method transformMat4
     * @typescript
     * transformMat4<Out extends IVec3Like, Vec3Like extends IVec3Like, MatLike extends IMat4Like> (out: Out, a: Vec3Like, mat: MatLike): Out
     * @static
     */
    Vec3.transformMat4 = function (out, a, mat) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        var m = mat.m;
        var rhw = m[3] * _x + m[7] * _y + m[11] * _z + m[15];
        rhw = rhw ? 1 / rhw : 1;
        out.x = (m[0] * _x + m[4] * _y + m[8] * _z + m[12]) * rhw;
        out.y = (m[1] * _x + m[5] * _y + m[9] * _z + m[13]) * rhw;
        out.z = (m[2] * _x + m[6] * _y + m[10] * _z + m[14]) * rhw;
        return out;
    };
    /**
     * !#zh 向量与四维矩阵乘法，默认向量第四位为 0。
     * !#en Four-dimensional vector and matrix multiplication, vector fourth default is 0.
     * @method transformMat4Normal
     * @typescript
     * transformMat4Normal<Out extends IVec3Like, MatLike extends IMat4Like> (out: Out, a: Out, mat: MatLike): Out
     * @static
     */
    Vec3.transformMat4Normal = function (out, a, mat) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        var m = mat.m;
        var rhw = m[3] * _x + m[7] * _y + m[11] * _z;
        rhw = rhw ? 1 / rhw : 1;
        out.x = (m[0] * _x + m[4] * _y + m[8] * _z) * rhw;
        out.y = (m[1] * _x + m[5] * _y + m[9] * _z) * rhw;
        out.z = (m[2] * _x + m[6] * _y + m[10] * _z) * rhw;
        return out;
    };
    /**
     * !#zh 向量与三维矩阵乘法
     * !#en Dimensional vector matrix multiplication
     * @method transformMat3
     * @typescript
     * transformMat3<Out extends IVec3Like, MatLike extends IMat3Like> (out: Out, a: Out, mat: MatLike): Out
     * @static
     */
    Vec3.transformMat3 = function (out, a, mat) {
        _x = a.x;
        _y = a.y;
        _z = a.z;
        var m = mat.m;
        out.x = _x * m[0] + _y * m[3] + _z * m[6];
        out.y = _x * m[1] + _y * m[4] + _z * m[7];
        out.z = _x * m[2] + _y * m[5] + _z * m[8];
        return out;
    };
    /**
     * !#zh 向量仿射变换
     * !#en Affine transformation vector
     * @method transformAffine
     * @typescript
     * transformAffine<Out extends IVec3Like, VecLike extends IVec3Like, MatLike extends IMat4Like>(out: Out, v: VecLike, mat: MatLike): Out
     * @static
     */
    Vec3.transformAffine = function (out, v, mat) {
        _x = v.x;
        _y = v.y;
        _z = v.z;
        var m = mat.m;
        out.x = m[0] * _x + m[1] * _y + m[2] * _z + m[3];
        out.y = m[4] * _x + m[5] * _y + m[6] * _z + m[7];
        out.x = m[8] * _x + m[9] * _y + m[10] * _z + m[11];
        return out;
    };
    /**
     * !#zh 向量四元数乘法
     * !#en Vector quaternion multiplication
     * @method transformQuat
     * @typescript
     * transformQuat<Out extends IVec3Like, VecLike extends IVec3Like, QuatLike extends IQuatLike> (out: Out, a: VecLike, q: QuatLike): Out
     * @static
     */
    Vec3.transformQuat = function (out, a, q) {
        // benchmarks: http://jsperf.com/quaternion-transform-Vec3-implementations
        // calculate quat * vec
        var ix = q.w * a.x + q.y * a.z - q.z * a.y;
        var iy = q.w * a.y + q.z * a.x - q.x * a.z;
        var iz = q.w * a.z + q.x * a.y - q.y * a.x;
        var iw = -q.x * a.x - q.y * a.y - q.z * a.z;
        // calculate result * inverse quat
        out.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
        out.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
        out.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
        return out;
    };
    /**
     * !#zh 以缩放 -> 旋转 -> 平移顺序变换向量
     * !#en To scale -> rotation -> transformation vector sequence translation
     * @method transformQuat
     * @typescript
     * transformRTS<Out extends IVec3Like, VecLike extends IVec3Like, QuatLike extends IQuatLike>(out: Out, a: VecLike, r: QuatLike, t: VecLike, s: VecLike): Out
     * @static
     */
    Vec3.transformRTS = function (out, a, r, t, s) {
        var x = a.x * s.x;
        var y = a.y * s.y;
        var z = a.z * s.z;
        var ix = r.w * x + r.y * z - r.z * y;
        var iy = r.w * y + r.z * x - r.x * z;
        var iz = r.w * z + r.x * y - r.y * x;
        var iw = -r.x * x - r.y * y - r.z * z;
        out.x = ix * r.w + iw * -r.x + iy * -r.z - iz * -r.y + t.x;
        out.y = iy * r.w + iw * -r.y + iz * -r.x - ix * -r.z + t.y;
        out.z = iz * r.w + iw * -r.z + ix * -r.y - iy * -r.x + t.z;
        return out;
    };
    /**
     * !#zh 以平移 -> 旋转 -> 缩放顺序逆变换向量
     * !#en Translational -> rotation -> Zoom inverse transformation vector sequence
     * @method transformInverseRTS
     * @typescript
     * transformInverseRTS<Out extends IVec3Like, VecLike extends IVec3Like, QuatLike extends IQuatLike>(out: Out, a: VecLike, r: QuatLike, t: VecLike, s: VecLike): Out
     * @static
     */
    Vec3.transformInverseRTS = function (out, a, r, t, s) {
        var x = a.x - t.x;
        var y = a.y - t.y;
        var z = a.z - t.z;
        var ix = r.w * x - r.y * z + r.z * y;
        var iy = r.w * y - r.z * x + r.x * z;
        var iz = r.w * z - r.x * y + r.y * x;
        var iw = r.x * x + r.y * y + r.z * z;
        out.x = (ix * r.w + iw * r.x + iy * r.z - iz * r.y) / s.x;
        out.y = (iy * r.w + iw * r.y + iz * r.x - ix * r.z) / s.y;
        out.z = (iz * r.w + iw * r.z + ix * r.y - iy * r.x) / s.z;
        return out;
    };
    /**
     * !#zh 绕 X 轴旋转向量指定弧度
     * !#en Rotation vector specified angle about the X axis
     * @method rotateX
     * @typescript
     * rotateX<Out extends IVec3Like> (out: Out, v: Out, o: Out, a: number): Out
     * @param v 待旋转向量
     * @param o 旋转中心
     * @param a 旋转弧度
     * @static
     */
    Vec3.rotateX = function (out, v, o, a) {
        // Translate point to the origin
        _x = v.x - o.x;
        _y = v.y - o.y;
        _z = v.z - o.z;
        // perform rotation
        var cos = Math.cos(a);
        var sin = Math.sin(a);
        var rx = _x;
        var ry = _y * cos - _z * sin;
        var rz = _y * sin + _z * cos;
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    };
    /**
     * !#zh 绕 Y 轴旋转向量指定弧度
     * !#en Rotation vector specified angle around the Y axis
     * @method rotateY
     * @typescript
     * rotateY<Out extends IVec3Like> (out: Out, v: Out, o: Out, a: number): Out
     * @param v 待旋转向量
     * @param o 旋转中心
     * @param a 旋转弧度
     * @static
     */
    Vec3.rotateY = function (out, v, o, a) {
        // Translate point to the origin
        _x = v.x - o.x;
        _y = v.y - o.y;
        _z = v.z - o.z;
        // perform rotation
        var cos = Math.cos(a);
        var sin = Math.sin(a);
        var rx = _z * sin + _x * cos;
        var ry = _y;
        var rz = _z * cos - _x * sin;
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    };
    /**
     * !#zh 绕 Z 轴旋转向量指定弧度
     * !#en Around the Z axis specified angle vector
     * @method rotateZ
     * @typescript
     * rotateZ<Out extends IVec3Like> (out: Out, v: Out, o: Out, a: number): Out
     * @param v 待旋转向量
     * @param o 旋转中心
     * @param a 旋转弧度
     * @static
     */
    Vec3.rotateZ = function (out, v, o, a) {
        // Translate point to the origin
        _x = v.x - o.x;
        _y = v.y - o.y;
        _z = v.z - o.z;
        // perform rotation
        var cos = Math.cos(a);
        var sin = Math.sin(a);
        var rx = _x * cos - _y * sin;
        var ry = _x * sin + _y * cos;
        var rz = _z;
        // translate to correct position
        out.x = rx + o.x;
        out.y = ry + o.y;
        out.z = rz + o.z;
        return out;
    };
    /**
     * !#zh 向量等价判断
     * !#en Equivalent vectors Analyzing
     * @method strictEquals
     * @typescript
     * strictEquals<Out extends IVec3Like> (a: Out, b: Out): boolean
     * @static
     */
    Vec3.strictEquals = function (a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    };
    /**
     * !#zh 排除浮点数误差的向量近似等价判断
     * !#en Negative error vector floating point approximately equivalent Analyzing
     * @method equals
     * @typescript
     * equals<Out extends IVec3Like> (a: Out, b: Out, epsilon?: number): boolean
     * @static
     */
    Vec3.equals = function (a, b, epsilon) {
        if (epsilon === void 0) { epsilon = utils_1.EPSILON; }
        var a0 = a.x, a1 = a.y, a2 = a.z;
        var b0 = b.x, b1 = b.y, b2 = b.z;
        return (Math.abs(a0 - b0) <=
            epsilon * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <=
                epsilon * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <=
                epsilon * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
    };
    /**
     * !#zh 求两向量夹角弧度
     * !#en Radian angle between two vectors seek
     * @method angle
     * @typescript
     * angle<Out extends IVec3Like> (a: Out, b: Out): number
     * @static
     */
    Vec3.angle = function (a, b) {
        Vec3.normalize(v3_1, a);
        Vec3.normalize(v3_2, b);
        var cosine = Vec3.dot(v3_1, v3_2);
        if (cosine > 1.0) {
            return 0;
        }
        if (cosine < -1.0) {
            return Math.PI;
        }
        return Math.acos(cosine);
    };
    /**
     * !#zh 计算向量在指定平面上的投影
     * !#en Calculating a projection vector in the specified plane
     * @method projectOnPlane
     * @typescript
     * projectOnPlane<Out extends IVec3Like> (out: Out, a: Out, n: Out): Out
     * @param a 待投影向量
     * @param n 指定平面的法线
     * @static
     */
    Vec3.projectOnPlane = function (out, a, n) {
        return Vec3.subtract(out, a, Vec3.project(out, a, n));
    };
    /**
     * !#zh 计算向量在指定向量上的投影
     * !#en Projection vector calculated in the vector designated
     * @method project
     * @typescript
     * project<Out extends IVec3Like> (out: Out, a: Out, b: Out): Out
     * @param a 待投影向量
     * @param n 目标向量
     * @static
     */
    Vec3.project = function (out, a, b) {
        var sqrLen = Vec3.lengthSqr(b);
        if (sqrLen < 0.000001) {
            return Vec3.set(out, 0, 0, 0);
        }
        else {
            return Vec3.multiplyScalar(out, b, Vec3.dot(a, b) / sqrLen);
        }
    };
    /**
     * !#zh 向量转数组
     * !#en Vector transfer array
     * @method toArray
     * @typescript
     * toArray <Out extends IWritableArrayLike<number>> (out: Out, v: IVec3Like, ofs?: number): Out
     * @param ofs 数组起始偏移量
     * @static
     */
    Vec3.toArray = function (out, v, ofs) {
        if (ofs === void 0) { ofs = 0; }
        out[ofs + 0] = v.x;
        out[ofs + 1] = v.y;
        out[ofs + 2] = v.z;
        return out;
    };
    /**
     * !#zh 数组转向量
     * !#en Array steering amount
     * @method fromArray
     * @typescript
     * fromArray <Out extends IVec3Like> (out: Out, arr: IWritableArrayLike<number>, ofs?: number): Out
     * @param ofs 数组起始偏移量
     * @static
     */
    Vec3.fromArray = function (out, arr, ofs) {
        if (ofs === void 0) { ofs = 0; }
        out.x = arr[ofs + 0];
        out.y = arr[ofs + 1];
        out.z = arr[ofs + 2];
        return out;
    };
    /**
     * !#en clone a Vec3 value
     * !#zh 克隆一个 Vec3 值
     * @method clone
     * @return {Vec3}
     */
    Vec3.prototype.clone = function () {
        return new Vec3(this.x, this.y, this.z);
    };
    /**
     * !#en Set the current vector value with the given vector.
     * !#zh 用另一个向量设置当前的向量对象值。
     * @method set
     * @param {Vec3} newValue - !#en new value to set. !#zh 要设置的新值
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.set = function (newValue) {
        this.x = newValue.x;
        this.y = newValue.y;
        this.z = newValue.z;
        return this;
    };
    /**
     * !#en Check whether the vector equals another one
     * !#zh 当前的向量是否与指定的向量相等。
     * @method equals
     * @param {Vec3} other
     * @return {Boolean}
     */
    Vec3.prototype.equals = function (other) {
        return other && this.x === other.x && this.y === other.y && this.z === other.z;
    };
    /**
     * !#en Check whether two vector equal with some degree of variance.
     * !#zh
     * 近似判断两个点是否相等。<br/>
     * 判断 2 个向量是否在指定数值的范围之内，如果在则返回 true，反之则返回 false。
     * @method fuzzyEquals
     * @param {Vec3} other
     * @param {Number} variance
     * @return {Boolean}
     */
    Vec3.prototype.fuzzyEquals = function (other, variance) {
        if (this.x - variance <= other.x && other.x <= this.x + variance) {
            if (this.y - variance <= other.y && other.y <= this.y + variance) {
                if (this.z - variance <= other.z && other.z <= this.z + variance)
                    return true;
            }
        }
        return false;
    };
    /**
     * !#en Transform to string with vector informations
     * !#zh 转换为方便阅读的字符串。
     * @method toString
     * @return {string}
     */
    Vec3.prototype.toString = function () {
        return "(" +
            this.x.toFixed(2) + ", " +
            this.y.toFixed(2) + ", " +
            this.z.toFixed(2) + ")";
    };
    /**
     * !#en Calculate linear interpolation result between this vector and another one with given ratio
     * !#zh 线性插值。
     * @method lerp
     * @param {Vec3} to
     * @param {number} ratio - the interpolation coefficient
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3}
     */
    Vec3.prototype.lerp = function (to, ratio, out) {
        out = out || new Vec3();
        Vec3.lerp(out, this, to, ratio);
        return out;
    };
    /**
     * !#en Clamp the vector between from float and to float.
     * !#zh
     * 返回指定限制区域后的向量。<br/>
     * 向量大于 max_inclusive 则返回 max_inclusive。<br/>
     * 向量小于 min_inclusive 则返回 min_inclusive。<br/>
     * 否则返回自身。
     * @method clampf
     * @param {Vec3} min_inclusive
     * @param {Vec3} max_inclusive
     * @return {Vec3}
     */
    Vec3.prototype.clampf = function (min_inclusive, max_inclusive) {
        this.x = misc_1.misc.clampf(this.x, min_inclusive.x, max_inclusive.x);
        this.y = misc_1.misc.clampf(this.y, min_inclusive.y, max_inclusive.y);
        this.z = misc_1.misc.clampf(this.z, min_inclusive.z, max_inclusive.z);
        return this;
    };
    /**
     * !#en Adds this vector. If you want to save result to another vector, use add() instead.
     * !#zh 向量加法。如果你想保存结果到另一个向量，使用 add() 代替。
     * @method addSelf
     * @param {Vec3} vector
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.addSelf = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    };
    /**
     * !#en Adds two vectors, and returns the new result.
     * !#zh 向量加法，并返回新结果。
     * @method add
     * @param {Vec3} vector
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} the result
     */
    Vec3.prototype.add = function (vector, out) {
        out = out || new Vec3();
        out.x = this.x + vector.x;
        out.y = this.y + vector.y;
        out.z = this.z + vector.z;
        return out;
    };
    /**
     * !#en Subtracts one vector from this.
     * !#zh 向量减法。
     * @method subtract
     * @param {Vec3} vector
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.subtract = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    };
    /**
     * !#en Multiplies this by a number.
     * !#zh 缩放当前向量。
     * @method multiplyScalar
     * @param {number} num
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.multiplyScalar = function (num) {
        this.x *= num;
        this.y *= num;
        this.z *= num;
        return this;
    };
    /**
     * !#en Multiplies two vectors.
     * !#zh 分量相乘。
     * @method multiply
     * @param {Vec3} vector
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.multiply = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    };
    /**
     * !#en Divides by a number.
     * !#zh 向量除法。
     * @method divide
     * @param {number} num
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.divide = function (num) {
        this.x /= num;
        this.y /= num;
        this.z /= num;
        return this;
    };
    /**
     * !#en Negates the components.
     * !#zh 向量取反。
     * @method negate
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.negate = function () {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    };
    /**
     * !#en Dot product
     * !#zh 当前向量与指定向量进行点乘。
     * @method dot
     * @param {Vec3} [vector]
     * @return {number} the result
     */
    Vec3.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    };
    /**
     * !#en Cross product
     * !#zh 当前向量与指定向量进行叉乘。
     * @method cross
     * @param {Vec3} vector
     * @param {Vec3} [out]
     * @return {Vec3} the result
     */
    Vec3.prototype.cross = function (vector, out) {
        out = out || new Vec3();
        Vec3.cross(out, this, vector);
        return out;
    };
    /**
     * !#en Returns the length of this vector.
     * !#zh 返回该向量的长度。
     * @method len
     * @return {number} the result
     * @example
     * var v = cc.v3(10, 10, 10);
     * v.len(); // return 17.320508075688775;
     */
    Vec3.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    /**
     * !#en Returns the squared length of this vector.
     * !#zh 返回该向量的长度平方。
     * @method lengthSqr
     * @return {number} the result
     */
    Vec3.prototype.lengthSqr = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };
    /**
     * !#en Make the length of this vector to 1.
     * !#zh 向量归一化，让这个向量的长度为 1。
     * @method normalizeSelf
     * @return {Vec3} returns this
     * @chainable
     */
    Vec3.prototype.normalizeSelf = function () {
        Vec3.normalize(this, this);
        return this;
    };
    ;
    /**
     * !#en
     * Returns this vector with a magnitude of 1.<br/>
     * <br/>
     * Note that the current vector is unchanged and a new normalized vector is returned. If you want to normalize the current vector, use normalizeSelf function.
     * !#zh
     * 返回归一化后的向量。<br/>
     * <br/>
     * 注意，当前向量不变，并返回一个新的归一化向量。如果你想来归一化当前向量，可使用 normalizeSelf 函数。
     * @method normalize
     * @param {Vec3} [out] - optional, the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @return {Vec3} result
     */
    Vec3.prototype.normalize = function (out) {
        out = out || new Vec3();
        Vec3.normalize(out, this);
        return out;
    };
    /**
     * Transforms the vec3 with a mat4. 4th vector component is implicitly '1'
     * @method transformMat4
     * @param {Mat4} m matrix to transform with
     * @param {Vec3} [out] the receiving vector, you can pass the same vec3 to save result to itself, if not provided, a new vec3 will be created
     * @returns {Vec3} out
     */
    Vec3.prototype.transformMat4 = function (m, out) {
        out = out || new Vec3();
        Vec3.transformMat4(out, this, m);
        return out;
    };
    /**
     * Returns the maximum value in x, y, and z
     * @method maxAxis
     * @returns {number}
     */
    Vec3.prototype.maxAxis = function () {
        return Math.max(this.x, this.y, this.z);
    };
    /**
     * !#en Get angle in radian between this and vector with direction. <br/>
     * In order to compatible with the vec2 API.
     * !#zh 带方向的夹角的弧度。该方法仅用做兼容 2D 计算。
     * @method signAngle
     * @param {Vec3 | Vec2} vector
     * @return {number} from -MathPI to Math.PI
     * @deprecated
     */
    Vec3.prototype.signAngle = function (vector) {
        CCDebug_1.cc.warnID(1408, 'vec3.signAngle', 'v2.1', 'cc.v2(selfVector).signAngle(vector)');
        var vec1 = new vec2_1.Vec2(this.x, this.y);
        var vec2 = new vec2_1.Vec2(vector.x, vector.y);
        return vec1.signAngle(vec2);
    };
    // deprecated
    Vec3.sub = Vec3.subtract;
    Vec3.mul = Vec3.multiply;
    Vec3.scale = Vec3.multiplyScalar;
    Vec3.squaredMagnitude = Vec3.lengthSqr;
    Vec3.div = Vec3.divide;
    Vec3.ONE_R = Vec3.ONE;
    Vec3.ZERO_R = Vec3.ZERO;
    Vec3.UP_R = Vec3.UP;
    Vec3.RIGHT_R = Vec3.RIGHT;
    Vec3.FRONT_R = Vec3.FORWARD;
    return Vec3;
}(value_type_1.default));
exports.default = Vec3;
var v3_1 = new Vec3();
var v3_2 = new Vec3();
// CCClass.fastDefine('cc.Vec3', Vec3, { x: 0, y: 0, z: 0 });
// /**
//  * @module cc
//  */
/**
 * !#en The convenience method to create a new {{#crossLink "Vec3"}}cc.Vec3{{/crossLink}}.
 * !#zh 通过该简便的函数进行创建 {{#crossLink "Vec3"}}cc.Vec3{{/crossLink}} 对象。
 * @method v3
 * @param {Number|Object} [x=0]
 * @param {Number} [y=0]
 * @param {Number} [z=0]
 * @return {Vec3}
 * @example
 * var v1 = cc.v3();
 * var v2 = cc.v3(0, 0, 0);
 * var v3 = cc.v3(v2);
 * var v4 = cc.v3({x: 100, y: 100, z: 0});
 */
function sy_v3(x, y, z) {
    return new Vec3(x, y, z);
}
exports.sy_v3 = sy_v3;
;
//# sourceMappingURL=vec3.js.map