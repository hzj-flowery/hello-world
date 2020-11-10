"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var quat_1 = require("./quat");
var tmp_quat = new quat_1.Quat();
var Trs = /** @class */ (function () {
    function Trs() {
    }
    Trs.toRotation = function (out, a) {
        out.x = a[3];
        out.y = a[4];
        out.z = a[5];
        out.w = a[6];
        return out;
    };
    Trs.fromRotation = function (out, a) {
        out[3] = a.x;
        out[4] = a.y;
        out[5] = a.z;
        out[6] = a.w;
        return out;
    };
    Trs.toEuler = function (out, a) {
        Trs.toRotation(tmp_quat, a);
        quat_1.Quat.toEuler(out, tmp_quat);
        return out;
    };
    Trs.fromEuler = function (out, a) {
        quat_1.Quat.fromEuler(tmp_quat, a.x, a.y, a.z);
        Trs.fromRotation(out, tmp_quat);
        return out;
    };
    Trs.fromEulerNumber = function (out, x, y, z) {
        quat_1.Quat.fromEuler(tmp_quat, x, y, z);
        Trs.fromRotation(out, tmp_quat);
        return out;
    };
    Trs.toScale = function (out, a) {
        out.x = a[7];
        out.y = a[8];
        out.z = a[9];
        return out;
    };
    Trs.fromScale = function (out, a) {
        out[7] = a.x;
        out[8] = a.y;
        out[9] = a.z;
        return out;
    };
    Trs.toPosition = function (out, a) {
        out.x = a[0];
        out.y = a[1];
        out.z = a[2];
        return out;
    };
    Trs.fromPosition = function (out, a) {
        out[0] = a.x;
        out[1] = a.y;
        out[2] = a.z;
        return out;
    };
    Trs.fromAngleZ = function (out, a) {
        quat_1.Quat.fromAngleZ(tmp_quat, a);
        Trs.fromRotation(out, tmp_quat);
        return out;
    };
    Trs.toMat4 = function (out, trs) {
        var x = trs[3], y = trs[4], z = trs[5], w = trs[6];
        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;
        var xx = x * x2;
        var xy = x * y2;
        var xz = x * z2;
        var yy = y * y2;
        var yz = y * z2;
        var zz = z * z2;
        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;
        var sx = trs[7];
        var sy = trs[8];
        var sz = trs[9];
        var m = out.m;
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
    };
    return Trs;
}());
exports.default = Trs;
//# sourceMappingURL=trs.js.map