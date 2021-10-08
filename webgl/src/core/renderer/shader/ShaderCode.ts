import { syRender } from "../data/RenderData"

export namespace ShaderCode {
    export var commonFuncion: Map<string, string> = new Map();
    export function init() {
        commonFuncion.set(syRender.ShaderDefineValue.SY_FUNC_PACK, `
        //分解保存深度值
        vec4 pack (float depth) {
            // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
            const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
            const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
            // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
            vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
            rgbaDepth -= rgbaDepth.rgba * bitMask; // Cut off the value which do not fit in 8 bits
            return rgbaDepth;
        }
        `)
        commonFuncion.set(syRender.ShaderDefineValue.SY_FUNC_UNPACK, `
        float unpack(const in vec4 rgbaDepth) {
            const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
            return dot(rgbaDepth, bitShift);
        }
        `)
    }
}