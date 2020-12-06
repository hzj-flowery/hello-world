"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
/**
 * 数学库工具类
 */
var MathUtils;
(function (MathUtils) {
    /**
     * 求弧度
     * @param deg 角度
     */
    function degToRad(deg) {
        return deg * Math.PI / 180;
    }
    MathUtils.degToRad = degToRad;
    function px(v) {
        return (v | 0) + "px";
    }
    MathUtils.px = px;
    function radToDeg(r) {
        return r * 180 / Math.PI;
    }
    MathUtils.radToDeg = radToDeg;
    // Check if the image is a power of 2 in both dimensions.
    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    MathUtils.isPowerOf2 = isPowerOf2;
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }
    MathUtils.rand = rand;
    function emod(x, n) {
        return x >= 0 ? (x % n) : ((n - (-x % n)) % n);
    }
    MathUtils.emod = emod;
})(MathUtils = exports.MathUtils || (exports.MathUtils = {}));
//# sourceMappingURL=MathUtils.js.map