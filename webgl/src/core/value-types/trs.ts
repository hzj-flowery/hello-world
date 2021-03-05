
import { Quat } from './quat';
import Vec3 from './vec3';
import { Mat4 } from './Mat4';

let tmp_quat = new Quat();

/*
trs[0] = 0; // position.x
trs[1] = 0; // position.y
trs[2] = 0; // position.z
trs[3] = 0; // rotation.x
trs[4] = 0; // rotation.y
trs[5] = 0; // rotation.z
trs[6] = 1; // rotation.w
trs[7] = 1; // scale.x
trs[8] = 1; // scale.y
trs[9] = 1; // scale.z
下面所说的数组就是值的这个数组
这个数组很特别，特别之处在其存储了四元数的值
位置四元数缩放：那简称一下就是 "位4缩"
*/
export default class Trs {
    /**
     * 从位4缩数组中取出四元数数据赋值给四元数
     * @param out 
     * @param a 位4缩
     */
    static toRotation(out: Quat, a: FloatArray): Quat {
        out.x = a[3];
        out.y = a[4];
        out.z = a[5];
        out.w = a[6];
        return out;
    }
    
    /**
     * 将一个四元数中的数据赋值给我们的“位4缩”中的四元数
     * @param out 
     * @param a 位4缩
     */
    static fromRotation(out: FloatArray, a: Quat): FloatArray {
        out[3] = a.x;
        out[4] = a.y;
        out[5] = a.z;
        out[6] = a.w;
        return out;
    }
    /**
     * 从位4缩数组中找出对应的值赋给欧拉角
     * 这个角度就是我们理解让xxx轴旋转xxx度
     * @param out 
     * @param a 位4缩
     */
    static toEuler(out: Vec3, a: FloatArray): Vec3 {
        //找出四元数数据
        Trs.toRotation(tmp_quat, a);
        //将四元数转为欧拉角
        Quat.toEuler(out, tmp_quat);
        return out;
    }
    
    /**
     * 使用欧拉角来更新我们的“位4缩”
     * @param out 位4缩
     * @param a 欧拉角
     */
    static fromEuler(out: FloatArray, a: Vec3): FloatArray {
        //从给定的欧拉角来生成我们的四元数数据
        Quat.fromEuler(tmp_quat, a.x, a.y, a.z);
        //使用四元数数据来更新我们的“位4缩”数组
        Trs.fromRotation(out, tmp_quat);
        return out;
    }
    /**
     * 下面这个函数和fromEuler是一样的功能，只是参数不一样
     * @param out 位4缩
     * @param x 
     * @param y 
     * @param z 
     */
    static fromEulerNumber(out: FloatArray, x: number, y: number, z: number): FloatArray {
        Quat.fromEuler(tmp_quat, x, y, z);
        Trs.fromRotation(out, tmp_quat);
        return out;
    }
    
    /**
     * 
     * @param out 
     * @param a 位4缩
     */
    static toScale(out: Vec3, a: FloatArray): Vec3 {
        out.x = a[7];
        out.y = a[8];
        out.z = a[9];
        return out;
    }
    
    /**
     * 
     * @param out 位4缩
     * @param a 
     */
    static fromScale(out: FloatArray, a: Vec3): FloatArray {
        out[7] = a.x;
        out[8] = a.y;
        out[9] = a.z;
        return out;
    }
    
    /**
     * 
     * @param out 
     * @param a 位4缩
     */
    static toPosition(out: Vec3, a: FloatArray): Vec3 {
        out.x = a[0];
        out.y = a[1];
        out.z = a[2];
        return out;
    }
    
    /**
     * 
     * @param out 位4缩
     * @param a 
     */
    static fromPosition(out: FloatArray, a: Vec3): FloatArray {
        out[0] = a.x;
        out[1] = a.y;
        out[2] = a.z;
        return out;
    }
    
    /**
     * 
     * @param out 位4缩
     * @param a 
     */
    static fromAngleZ(out: FloatArray, a: number): FloatArray {
        Quat.fromAngleZ(tmp_quat, a);
        Trs.fromRotation(out, tmp_quat);
        return out;
    }
    
    /**
     * 传入一个“位四缩”的对象，使用它的数据来赋值给一个矩阵
     * 这就是我们最终想要的，只有它才可以完成空间变换
     * @param out 
     * @param trs 位4缩
     */
    static toMat4(out: Mat4, trs: FloatArray): Mat4 {
        let x = trs[3], y = trs[4], z = trs[5], w = trs[6];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let sx = trs[7];
        let sy = trs[8];
        let sz = trs[9];

        let m = out.m;
        m[0] = (1 - (yy + zz)) * sx;
        m[1] = (xy + wz) * sx;
        m[2] = (xz - wy) * sx;
        m[3] = 0;
        m[4] = (xy - wz) * sy;
        m[5] = (1 - (xx + zz)) * sy;
        m[6] = (yz + wx) * sy;
        m[7] = 0;
        m[8] = (xz + wy) * sz;
        m[9] = (yz - wx) * sz;
        m[10] = (1 - (xx + yy)) * sz;
        m[11] = 0;
        m[12] = trs[0];
        m[13] = trs[1];
        m[14] = trs[2];
        m[15] = 1;

        return out;
    }
}