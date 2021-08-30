import { syRender } from "../data/RenderData";
import { glEnums } from "../gfx/GLapi"
import State from "../gfx/State"
import { Pass, PassType } from "./Pass"
import { G_ShaderCenter } from "./ShaderCenter"

export enum PassCustomString{
    offlineRender = "offlineRender", //离线渲染
    drawInstanced = "drawInstanced", //实例化绘制
    DrawingOrder = "DrawingOrder",//绘制顺序
    ShaderType="ShaderType",//shader的类型
}

class PassFactory{
    constructor(){
        this._passOrder.set(PassType.Normal,0);
        this._passOrder.set(PassType.Middle,0);
        this._passOrder.set(PassType.High,0);
    }
    private _pass:Array<Pass> = [];
    public _passOrder:Map<number,number> = new Map();
    public getPass(){
         
    }

    private checkPassType(pType):Array<number>{
       if(this._passOrder.has(pType))
       {
           var count = this._passOrder.get(pType);
           this._passOrder.set(pType,count);
           return [pType,count]
       }
       return [];
    }
    public createPass(vert:string,frag:string,passJson?:any,ptype:PassType=PassType.Normal){
        var ret = this.checkPassType(ptype)
        if(ret.length==0)
        {
            console.log("传入无效的pass类型-------",ptype)
            return null
        }
        
        var pass = new Pass(ptype)
        pass.order = ret[1]
        pass.state = new State();
        if(passJson&&passJson.state) 
        {
            let stateData = passJson.state;
            for(let k=0;k<stateData.length;k++)
            { 
                let temp = stateData[k];
                let tempValue = temp["value"];
                let tempKey = temp["key"];
                if(typeof(tempValue)=="boolean")
                {
                    pass.state[tempKey] = tempValue;
                }
                else if(typeof(tempValue)=="number")
                {
                    pass.state[tempKey] = tempValue;
                }
                else if(typeof(tempValue)=="string")
                {
                    //符合预期
                    if(glEnums[tempValue])
                    {
                        pass.state[tempKey] = glEnums[tempValue];
                    }
                    else
                    {
                        console.log("你的配置有问题--",tempValue);
                    }
                }
                else
                {
                    console.log("你的配置有问题--",tempValue);
                }
                  
                
            }
        }
        else
        {
            //默认渲染状态
            pass.state.depthFunc = glEnums.DS_FUNC_LESS;
            pass.state.depthTest = true;
            pass.state.depthWrite = true;
            pass.state.blendSrcAlpha = glEnums.BLEND_SRC_ALPHA
            pass.state.blendDstAlpha = glEnums.BLEND_ONE_MINUS_SRC_ALPHA
        }

        if(passJson&&passJson.custom)
        {
            //自定义数据
            let customData = passJson.custom
            for(let k=0;k<customData.length;k++)
            {
                let key = customData[k]["key"];
                let value = customData[k]["value"];
                if(key==PassCustomString.offlineRender&&typeof(value)=="boolean")
                {
                    //离线渲染
                    pass.offlineRender = value;
                }
                else if(key==PassCustomString.drawInstanced&&typeof(value)=="boolean")
                {
                    //实例化渲染
                    pass.drawInstanced = value;
                }
                else if(key==PassCustomString.DrawingOrder&&typeof(value)=="number")
                {
                    pass.drawingOrder = value;
                }
                else if(key==PassCustomString.ShaderType&&typeof(value)=="string")
                {
                    var st = syRender.ShaderTypeString.indexOf(value);
                    if(st<0)
                    {
                        console.log("非法变量------",value);
                        return;
                    }
                    pass.shaderType = st;
                }

            }
        }
       
        //创建shader
        var code = G_ShaderCenter.createShader(pass.shaderType, vert, frag)
        pass.code = code
        this._pass.push(pass);

        return pass
    }
} 

export var G_PassFactory = new PassFactory()