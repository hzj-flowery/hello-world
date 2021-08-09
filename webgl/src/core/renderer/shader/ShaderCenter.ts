import Device from "../../Device";
import { syRender } from "../data/RenderData";
import { Shader } from "./Shader";
import { ShaderCode } from "./ShaderCode";
import { G_ShaderFactory } from "./ShaderFactory";


class ShaderCenter {
    private _shaderMap: Map<string, Shader> = new Map();
    private _shaderCustomUUid: number;
    constructor() {
        this._shaderCustomUUid = 0;
    }
    private createShaderName(type: syRender.ShaderType): string {

        if(type==syRender.ShaderType.Custom)
        {
            this._shaderCustomUUid++;
            return syRender.ShaderTypeString[type]+this._shaderCustomUUid;
        }
        else
        {
            var str = syRender.ShaderTypeString[type];
            if(str&&str!="NULL")
            {
               return str;
            }
            else
            {
                console.log("您输入的shader类型非法,", type);
            }
        }
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
        var name = syRender.ShaderTypeString[type];
        if(!name||name=="NULL")
        {
            if(type!=syRender.ShaderType.Custom)
            {
                console.log("您输入的shader类型非法,", type);
            }
        }
        if (name != "")
            return this._shaderMap.get(name);
    }

}
export var G_ShaderCenter = new ShaderCenter();