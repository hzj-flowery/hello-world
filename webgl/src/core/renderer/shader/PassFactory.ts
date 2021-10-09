import { syRender } from "../data/RenderData";
import { glEnums } from "../gfx/GLapi"
import { State } from "../gfx/State";
import { Pass, PassType } from "./Pass"
import { G_ShaderCenter } from "./ShaderCenter"
import { ShaderCode } from "./ShaderCode";
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
                if(key==syRender.PassCustomKey.offlineRender&&typeof(value)=="boolean")
                {
                    //离线渲染
                    pass.offlineRender = value;
                }
                else if(key==syRender.PassCustomKey.drawInstanced&&typeof(value)=="boolean")
                {
                    //实例化渲染
                    pass.drawInstanced = value;
                }
                else if(key==syRender.PassCustomKey.DrawingOrder&&typeof(value)=="number")
                {
                    pass.drawingOrder = value;
                }
                else if(key==syRender.PassCustomKey.ShaderType&&typeof(value)=="string")
                {
                    var st = syRender.ShaderTypeString.indexOf(value);
                    if(st<0)
                    {
                        console.log("非法变量------",value);
                        return;
                    }
                    pass.shaderType = st;
                }
                else if(key==syRender.PassCustomKey.DefineUse&&typeof(value)=="string"&&pass.defineUse.indexOf(value)<0)
                {
                    pass.defineUse.push(value)
                }
                else if(key==syRender.PassCustomKey.ProgramBaseType&&typeof(value)=="boolean")
                {
                    pass.ProgramBaseType = value;
                }

            }
        }
        
        //关于宏预处理操作
        vert = this.preShaderCodeAboutDefine(vert,pass.defineUse,0);
        frag = this.preShaderCodeAboutDefine(frag,pass.defineUse,1);

        if(pass.ProgramBaseType==false)
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
    private preShaderCodeAboutDefine(code:string,custom:Array<string>,step:number):string{

        if(!custom||custom.length<=0)return code;

        //删除注释
        code = code.replace(/\/\/(.*)\s\n/g,"")
        
        //前缀版本号控制
        var versionString = code.match(/\s*#version\s*300\s*es\s*\n/)
        if(versionString)
        {
            //预先将版本号剔除
            code = code.replace(/\s*#version\s*300\s*es\s*\n/,"")
        }
        
        //精度
        var precision=code.match(/\s*precision\s*mediump\s*float\s*;\s*\n/)
        if(precision)
        {
            code = code.replace(/\s*precision\s*mediump\s*float\s*;\s*\n/,"")
        }
    
        custom.forEach((value,key)=>{
            if(typeof(value)=="string")
            {
                let valueStr = (value as string).split("$")
                if(valueStr.length>=2)
                {
                    code = "\n #define "+valueStr[0]+"  " +valueStr[1]+"\n " + code;
                }
                else
                {
                    code = "\n #define "+value+"\n " + code;
                    //check add function
                    var func = ShaderCode.commonFuncion.get(value);
                    if(func&&step==1)
                    {
                        code = "\n "+func+"\n  " +code
                    }
                }
            }
            else
            {
                code = "\n #define "+value+"\n " + code;

                //check add function
                var func = ShaderCode.commonFuncion.get(value);
                if(func&&step==1)
                {
                    code = "\n "+func+"\n  " +code
                }
            }
        })

        //再加上精度
        if(precision)
        {
            code = "\nprecision mediump float;\n"+code;
        }

        //再加上版本号
        if(versionString)
        {
            code = "\n#version 300 es\n"+code
        }
        return code;
    }
    private generatePrecision( parameters ) {

        let precisionstring = 'precision ' + parameters.precision + ' float;\nprecision ' + parameters.precision + ' int;';
    
        if ( parameters.precision === 'highp' ) {
    
            precisionstring += '\n#define HIGH_PRECISION';
    
        } else if ( parameters.precision === 'mediump' ) {
    
            precisionstring += '\n#define MEDIUM_PRECISION';
    
        } else if ( parameters.precision === 'lowp' ) {
    
            precisionstring += '\n#define LOW_PRECISION';
    
        }
    
        return precisionstring;
    
    }
} 

export var G_PassFactory = new PassFactory()