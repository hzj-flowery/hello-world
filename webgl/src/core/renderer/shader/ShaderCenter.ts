import Device from "../../Device";
import { Shader } from "./Shader";
import { ShaderCode } from "./ShaderCode";
import { G_ShaderFactory } from "./ShaderFactory";

export enum ShaderType {
    Custom = 1,
    Line,
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
            case ShaderType.Line:
                return "line";
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
        this.createShader(ShaderType.Line,ShaderCode.line.vert,ShaderCode.line.frag);
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
            case ShaderType.Line:
                name = "line";
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