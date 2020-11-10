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
}