import { glEnums } from "../gfx/GLapi"
import State from "../gfx/State"
import { Pass, PassType } from "./Pass"
import { G_ShaderCenter, ShaderType } from "./ShaderCenter"



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
    public createPass(type:ShaderType,vert:string,frag:string,passJson?:any,ptype:PassType=PassType.Normal){
        var ret = this.checkPassType(type)
        if(ret.length==0)
        {
            console.log("传入无效的pass类型-------",ptype)
            return null
        }
        var code = G_ShaderCenter.createShader(type, vert, frag)
        var pass = new Pass(ptype)
        pass.order = ret[1]
        pass.code = code
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
                    var str1 = new String(tempValue); 
                    var index = str1.indexOf("glEnums");
                    if(index>=0)
                    {
                        //符合预期
                        let value = str1.split(".")[1];
                        if(glEnums[value])
                        {
                            pass.state[tempKey] = glEnums[value];
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
        this._pass.push(pass)
        return pass
    }
}

export var G_PassFactory = new PassFactory()