/**
 * 数学库工具类
 */
export namespace MathUtils{
    /**
     * 求弧度
     * @param deg 角度
     */
    export function degToRad(deg) {
        return deg * Math.PI / 180;
      }
    export function px(v) {
        return `${v | 0}px`;
    }
    export  function radToDeg(r) {
        return r * 180 / Math.PI;
    }
    // Check if the image is a power of 2 in both dimensions.
    export function isPowerOf2(value) {
      return (value & (value - 1)) === 0;
    }
}