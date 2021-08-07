import Device from "../../Device";
import { syRender } from "../data/RenderData";
import { Shader } from "./Shader";
import { ShaderCode } from "./ShaderCode";
import { G_ShaderFactory } from "./ShaderFactory";


class ShaderCenter {
    private _shaderMap: Map<string, Shader> = new Map();
    private _shaderCount: number;
    constructor() {
        this._shaderCount = 0;
    }
    private createShaderName(type: syRender.ShaderType): string {
        switch (type) {
            case syRender.ShaderType.Custom:
                this._shaderCount++;
                return "custom" + this._shaderCount;
            case syRender.ShaderType.Label:
                return "label";
            case syRender.ShaderType.Line:
                return "line";
            case syRender.ShaderType.Sprite:
                return "sprite";
            case syRender.ShaderType.Spine:
                return "spine";
            case syRender.ShaderType.Spot:
                return "spot";
            case syRender.ShaderType.Depth:
                return "depth";
            case syRender.ShaderType.ShadowMap:
                return "shadowMap";
            default: 
            {
                console.log("您输入的shader类型非法,", type);
            }
        }
    }
    public init(): void {
        //预先初始化一些shader
        this.createShader(syRender.ShaderType.ShadowMap, ShaderCode.shadowMap.vert, ShaderCode.shadowMap.frag);
        this.createShader(syRender.ShaderType.Line,ShaderCode.line.vert,ShaderCode.line.frag);
    }
    /**
     * 创建shader
     * @param type 
     * @param vert 
     * @param frag 
     */
    public createShader(type: syRender.ShaderType, vert?: string, frag?: string): Shader {
        var oldShader = this.getShader(type);
        if(oldShader)
        {
            //之前shader就已经创建好了啊
            return oldShader;
        }
        if(!vert||!frag||vert==""||frag=="")
        {
            return ;
        }
        var glID = G_ShaderFactory.createShader(vert, frag);
        let name = this.createShaderName(type);
        let shader = new Shader(Device.Instance.gl, glID, name)
        this._shaderMap.set(name, shader);
        return shader;
    }
    public getCustomShader(name: string): Shader {
        return this._shaderMap.get(name);
    }
    public getShader(type: syRender.ShaderType): Shader {
        let name = "";
        switch (type) {
            case syRender.ShaderType.Label:
                name = "label";
                break;
            case syRender.ShaderType.Sprite:
                name = "sprite";
                break;
            case syRender.ShaderType.Spine:
                name = "spine";
                break;
            case syRender.ShaderType.Line:
                name = "line";
                break;
            case syRender.ShaderType.ShadowMap:
                name = "shadowMap";
                break;
            case syRender.ShaderType.Depth:
                name = "depth";
                break;
            case syRender.ShaderType.Spot:
                name = "spot";
                break;
            default: 
            {
                if(type!=syRender.ShaderType.Custom)
                {
                    console.log("您输入的shader类型非法,", type);
                }
            }
        }
        if (name != "")
            return this._shaderMap.get(name);
    }

}
export var G_ShaderCenter = new ShaderCenter();