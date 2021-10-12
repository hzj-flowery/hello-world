import { MathUtils } from "../utils/MathUtils";
import Vec3 from "../value-types/vec3";
import { glMatrix } from "./Matrix";
import { Quat } from "./Quat";
import { Vector3 } from "./Vector3";

/**
 * 欧拉角中关于万向锁产生的根本原因是：
 * 旋转是按照特定顺序进行的，模型无论进行多少次怎么样的旋转，任何一次的旋转一定是从（0，0，0）==》（rotateX,rotateY,rotateZ）
 * 当有一个轴旋转(90*n)度的时候，就会出现模型坐标系的一个轴与世界坐标系的一个轴重合
 * 
 * 3维坐标系有三个轴，我们把一次旋转分到各个轴上可以看成旋转了3次
 * 假定我们的旋转顺序是Y X Z
 * 在没有旋转之前，模型坐标系是与世界坐标系完全重合的，
 * 假定第一次旋转是绕Y轴（模型坐标系或者世界坐标系）旋转30度
 * 第二次旋转是绕X轴（模型坐标系）旋转90度，此时模型坐标系的z轴与世界坐标系的Y轴平行了
 * 第三次旋转继续绕z轴（模型坐标系）旋转20度，很明显，这次旋转也是在绕着世界坐标系的y轴旋转，
 * 所以第一次和第三次的旋转轴是一样的，即相当于失去了一个旋转轴，出现了万向锁
 * 
 * Y轴的旋转，一定是在世界坐标系下的，Y轴的旋转平面是X轴和Z轴组建的，所以第一次无论Y轴如何旋转，都只是在XZ轴这个平面上
 * 当第二次绕着X轴旋转，只要旋转了n*90这个度数，一定能让世界坐标系的Y轴和模型坐标系的Z轴重合，
 * 模型旋转都是在模型坐标系下进行的，第一次由于和世界坐标系重合，所以绕着模型坐标系下的Y轴旋转，就等价于绕着世界坐标系下的Y轴进行
 * 当我们在第二次旋转，不小心将绕着模型坐标系的x轴的旋转度数设置成90*n度数时，就会造成模型坐标系的Z轴和世界坐标系的Y轴重合，
 * 当我们第三次再继续绕Z轴的旋转的时候，就好像在绕着世界坐标系的Y轴旋转，第一次和第三次都是绕着同一个轴
 */
export interface Euler {
    isEuler(): boolean;
}

export enum Euler_Order {
    XYZ = "XYZ",
    YZX = "YZX",
    ZXY = "ZXY",
    XZY = "XZY",
    YXZ = "YXZ",
    ZYX = "ZYX"
}

export class Euler {
    private _x: number;
    private _y: number;
    private _z: number;
    private _order: Euler_Order;
    static DefaultOrder = Euler_Order.XYZ;
    static RotationOrders: Array<Euler_Order> = [Euler_Order.XYZ, Euler_Order.YZX, Euler_Order.ZXY, Euler_Order.XZY, Euler_Order.YXZ, Euler_Order.ZYX];
    constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
        this._onChangeCallback();
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
        this._onChangeCallback();
    }
    get z() {
        return this._z;
    }
    set z(value) {
        this._z = value;
        this._onChangeCallback();
    }
    get order() {
        return this._order;
    }
    set order(value) {
        this._order = value;
        this._onChangeCallback();
    }
    /**
     * 设置欧拉角
     * @param x 
     * @param y 
     * @param z 
     * @param order 
     * @returns 
     */
    set(x: number, y: number, z: number, order: Euler_Order) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order || this._order;
        this._onChangeCallback();
        return this;
    }
    clone() {
        return new Euler(this._x, this._y, this._z, this._order);
    }
    copy(euler: Euler) {
        this._x = euler._x;
        this._y = euler._y;
        this._z = euler._z;
        this._order = euler._order;
        this._onChangeCallback();
        return this;
    }
    /**
     * 从一个旋转矩阵中找出欧拉值
     * 矩阵转欧拉
     * @param m 
     * @param order 
     * @param update 
     */
    setFromRotationMatrix(m: Float32Array, order: Euler_Order, update: boolean): Euler {
        const clamp = MathUtils.clamp;
        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
        const te = m;
        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];
        order = order || this._order;
        switch (order) {
            case Euler_Order.XYZ:
                this._y = Math.asin(clamp(m13, - 1, 1));
                if (Math.abs(m13) < 0.9999999) {
                    this._x = Math.atan2(- m23, m33);
                    this._z = Math.atan2(- m12, m11);
                } else {
                    this._x = Math.atan2(m32, m22);
                    this._z = 0;
                }
                break;
            case Euler_Order.YXZ:
                this._x = Math.asin(- clamp(m23, - 1, 1));
                if (Math.abs(m23) < 0.9999999) {
                    this._y = Math.atan2(m13, m33);
                    this._z = Math.atan2(m21, m22);
                } else {
                    this._y = Math.atan2(- m31, m11);
                    this._z = 0;
                }
                break;
            case Euler_Order.ZXY:
                this._x = Math.asin(clamp(m32, - 1, 1));
                if (Math.abs(m32) < 0.9999999) {
                    this._y = Math.atan2(- m31, m33);
                    this._z = Math.atan2(- m12, m22);
                } else {
                    this._y = 0;
                    this._z = Math.atan2(m21, m11);
                }
                break;
            case Euler_Order.ZYX:
                this._y = Math.asin(- clamp(m31, - 1, 1));
                if (Math.abs(m31) < 0.9999999) {
                    this._x = Math.atan2(m32, m33);
                    this._z = Math.atan2(m21, m11);
                } else {
                    this._x = 0;
                    this._z = Math.atan2(- m12, m22);
                }
                break;
            case Euler_Order.YZX:
                this._z = Math.asin(clamp(m21, - 1, 1));
                if (Math.abs(m21) < 0.9999999) {
                    this._x = Math.atan2(- m23, m22);
                    this._y = Math.atan2(- m31, m11);
                } else {
                    this._x = 0;
                    this._y = Math.atan2(m13, m33);
                }
                break;
            case Euler_Order.XZY:
                this._z = Math.asin(- clamp(m12, - 1, 1));
                if (Math.abs(m12) < 0.9999999) {
                    this._x = Math.atan2(m32, m22);
                    this._y = Math.atan2(m13, m11);
                } else {
                    this._x = Math.atan2(- m23, m33);
                    this._y = 0;
                }
                break;
            default:
                console.warn('THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order);
        }
        this._order = order;
        if (update !== false) this._onChangeCallback();
        return this;
    }
    /**
     * 从一个四元数转欧拉角
     * @param q 
     * @param order 
     * @param update 
     */
    setFromQuaternion(q: Quat, order: Euler_Order, update?: boolean): Euler {
        if(!_matrix)
        {
            _matrix = /*@__PURE__*/ glMatrix.mat4.identity(null);
        }
        _matrix.makeRotationFromQuaternion(q);
        return this.setFromRotationMatrix(_matrix, order, update);
    }
    /**
     * 向量转欧拉
     * @param v 
     * @param order 
     */
    setFromVector3(v: Vector3, order: Euler_Order) {
        return this.set(v.x, v.y, v.z, order || this._order);
    }
    /**
     * 重新设置欧拉角的排序
     * @param newOrder 
     * @returns 
     */
    reorder(newOrder: Euler_Order) {
        
        if(!_quaternion)
        {
            _quaternion = /*@__PURE__*/ new Quat();
        }
        _quaternion.setFromEuler(this);
        return this.setFromQuaternion(_quaternion, newOrder);
    }
    /**
     * 判断欧拉角是否相等
     * @param euler 
     */
    equals(euler: Euler) {
        return (euler._x === this._x) && (euler._y === this._y) && (euler._z === this._z) && (euler._order === this._order);
    }
    /**
     * 从一个数组中拷贝值给欧拉
     * @param array 
     */
    fromArray(array: Array<any>) {
        this._x = array[0];
        this._y = array[1];
        this._z = array[2];
        if (array[3] !== undefined) this._order = array[3];
        this._onChangeCallback();
        return this;
    }
    /**
     * 将欧拉值赋给一个数组
     * 将欧拉值转为一个数组
     * @param array 
     * @param offset 
     */
    toArray(array = [], offset = 0) {
        array[offset] = this._x;
        array[offset + 1] = this._y;
        array[offset + 2] = this._z;
        array[offset + 3] = this._order;
        return array;
    }
    /**
     * 将欧拉值转为一个向量
     * @param optionalResult 
     */
    toVector3(optionalResult) {
        if (optionalResult) {
            return optionalResult.set(this._x, this._y, this._z);
        } else {
            return new Vector3(this._x, this._y, this._z);
        }
    }
    _onChange(callback) {
        this._onChangeCallback = callback;
        return this;
    }
    _onChangeCallback() { }
}



var _matrix =null;
var _quaternion =null;
