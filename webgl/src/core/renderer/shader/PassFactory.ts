import { syRender } from "../data/RenderData";
import { glEnums } from "../gfx/GLapi"
import { State } from "../gfx/State";
import { Pass, PassType } from "./Pass"
import { G_ShaderCenter } from "./ShaderCenter"
import { G_ShaderFactory } from "./ShaderFactory";



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
                    if(tempValue.indexOf("0x")>=0)
                    {
                        //这是一个16进制 特殊处理
                        pass.state[tempKey] = tempValue;
                    }
                    //符合预期
                    else if(glEnums[tempValue]!=null)
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
                if(key==syRender.PassCustomString.offlineRender&&typeof(value)=="boolean")
                {
                    //离线渲染
                    pass.offlineRender = value;
                }
                else if(key==syRender.PassCustomString.drawInstanced&&typeof(value)=="boolean")
                {
                    //实例化渲染
                    pass.drawInstanced = value;
                }
                else if(key==syRender.PassCustomString.DrawingOrder&&typeof(value)=="number")
                {
                    pass.drawingOrder = value;
                }
                else if(key==syRender.PassCustomString.ShaderType&&typeof(value)=="string")
                {
                    var st = syRender.ShaderTypeString.indexOf(value);
                    if(st<0)
                    {
                        console.log("非法变量------",value);
                        return;
                    }
                    pass.shaderType = st;
                }
                else if(key==syRender.PassCustomString.DefineUse&&typeof(value)=="string"&&pass.defineUse.indexOf(value)<0)
                {
                    pass.defineUse.push(value)
                }

            }
        }
        var normalShaderType=[
            syRender.ShaderType.Spine_Mesh,
            syRender.ShaderType.Spine_Skin,
            syRender.ShaderType.Obj,
        ]
        
        //关于宏预处理操作
        vert = this.preShaderCodeAboutDefine(vert,pass.defineUse);
        frag = this.preShaderCodeAboutDefine(frag,pass.defineUse);

        if(normalShaderType.indexOf(pass.shaderType)>=0)
        {
             var program = G_ShaderFactory.createProgramInfo(vert, frag);
             pass.program = program
        }
        else
        {
            //创建shader
            var baseProgram = G_ShaderCenter.createShader(pass.shaderType, vert, frag)
            pass.baseProgram = baseProgram 
        }

        this._pass.push(pass);

        return pass
    }
    
    /**
     * 预处理顶点shader
     * @param vert 
     */
    private preShaderCodeAboutDefine(code:string,custom:Array<string>):string{
        if(!custom||custom.length<=0)return code;
        custom.forEach((value,key)=>{
            code = "#define "+value+"\n " + code;
        })
        return code;
    }
} 

export var G_PassFactory = new PassFactory()