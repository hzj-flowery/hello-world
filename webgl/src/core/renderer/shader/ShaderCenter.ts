import Device from "../../Device";
import { Shader } from "./Shader";
import { ShaderCode } from "./ShaderCode";
import { G_ShaderFactory } from "./ShaderFactory";

let vertBase =
    `attribute vec4 a_position;
    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;
    void main() {
    gl_Position = u_projection * u_view * u_world * a_position;
    }`
let fragBase =
    `precision mediump float;
  
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
    void main() {
    gl_FragColor =  (gl_FragCoord.z);  //将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
    }`

export enum ShaderType {
    Custom = 1,
    Sprite,
    Label,
    Spine,
    ShadowMap
}
class ShaderCenter {
    private _shaderMap: Map<string, Shader> = new Map();
    private _shaderCount: number;
    constructor() {
        this._shaderCount = 0;
    }
    private createShaderName(type: ShaderType): string {
        switch (type) {
            case ShaderType.Custom:
                this._shaderCount++;
                return "custom" + this._shaderCount;
            case ShaderType.Label:
                return "label";
            case ShaderType.Sprite:
                return "sprite";
            case ShaderType.Spine:
                return "spine";
            case ShaderType.ShadowMap:
                return "shadowMap";
            default: console.log("您输入的shader类型非法,", type);
        }
    }
    public init(): void {
        this.createShader(ShaderType.ShadowMap, ShaderCode.shadowMap.vert, ShaderCode.shadowMap.frag);
    }
    public createShader(type: ShaderType, vert: string, frag: string): Shader {
        var glID = G_ShaderFactory.createShader(vert, frag);
        let name = this.createShaderName(type);
        this._shaderMap.set(name, glID);
        return new Shader(Device.Instance.gl, glID, name)
    }
    public getCustomShader(name: string): Shader {
        return this._shaderMap.get(name);
    }
    public getShader(type: ShaderType): Shader {
        let name = "";
        switch (type) {
            case ShaderType.Label:
                name = "label";
                break;
            case ShaderType.Sprite:
                name = "sprite";
                break;
            case ShaderType.Spine:
                name = "spine";
                break;
            case ShaderType.ShadowMap:
                name = "shadowMap";
                break;
            default: console.log("您输入的shader类型非法,", type);
        }
        if (name != "")
            return this._shaderMap.get(name);
    }

}
export var G_ShaderCenter = new ShaderCenter();