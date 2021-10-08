import { MD5 } from "../../../tool/MD5";
import Device from "../../Device";
import { syRender } from "../data/RenderData";
import { ShaderProgramBase } from "./Shader";
import { G_ShaderFactory } from "./ShaderFactory";


class ShaderCenter {
    private _shaderMap: Map<string, ShaderProgramBase> = new Map();
    private _shaderCustomUUid: number;
    constructor() {
        this._shaderCustomUUid = 0;
    }
    private getShaderName(type: syRender.ShaderType,vert:string,frag:string): string {

        if(type==syRender.ShaderType.Custom)
        {
            this._shaderCustomUUid++;
            return syRender.ShaderTypeString[type]+this._shaderCustomUUid;
        }
        else
        {
            //md5
            var str = syRender.ShaderTypeString[type];
            if(str&&str!="NULL")
            {
               var targetKey = MD5.hex_md5(str+vert+frag)
               return targetKey;
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
    public createShader(type: syRender.ShaderType, vert: string, frag: string): ShaderProgramBase {
        var oldShader = this._shaderMap.get(this.getShaderName(type,vert,frag));
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
        let name = this.getShaderName(type,vert,frag);
        let shader = new ShaderProgramBase(Device.Instance.gl, glID, name)
        this._shaderMap.set(name, shader);
        return shader;
    }

}
export var G_ShaderCenter = new ShaderCenter();