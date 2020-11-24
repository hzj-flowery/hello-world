import { VoidExpression } from "typescript";
import { glMatrix } from "../../Matrix";
import { glprimitive_type } from "../gfx/GLEnums";
import { Shader, ShaderData } from "../shader/Shader";


let renderDataId:number = 0;
export enum RenderDataType{
    Base = 1,
    Spine
}
/**
 * 定义渲染数据
 */
export  class RenderData{
    constructor(){
        this.id = renderDataId++;
        this.reset();
    }
    public _type:RenderDataType = RenderDataType.Base;
    public id:number;//每一个渲染数据都一个唯一的id
    public _cameraType:number;//相机的类型
    public _shader:Shader;//着色器
    public _vertGLID:WebGLBuffer;//顶点buffer的显存地址
    public _vertItemSize:number;//一个顶点buffer单元的顶点数目
    public _vertItemNums:number;//所有顶点buffer单元的数目
    public _indexGLID:WebGLBuffer;//索引buffer的显存地址
    public _indexItemSize:number;//一个索引buffer单元的顶点数目
    public _indexItemNums:number;//所有索引buffer单元的数目
    public _uvGLID:WebGLBuffer;//uv buffer的显存地址
    public _uvItemSize:number;//一个uv buffer单元的顶点数目
    public _normalGLID:WebGLBuffer;//法线buffer的显存地址
    public _normalItemSize:number;//一个法线buffer单元的顶点数目
    public _lightColor:Array<number>;//光的颜色
    public _lightDirection:Array<number>;//光的方向
    public _textureGLIDArray:Array<WebGLTexture>;
    public _glPrimitiveType: glprimitive_type;//绘制的类型
    public _modelMatrix:Float32Array;//模型矩阵
    public _u_pvm_matrix_inverse:Float32Array;//
    public _time:number;
    public _isUse:boolean = false;//使用状态
    public reset():void{
        this._cameraType = 0;//默认情况下是透视投影
        this._shader = null;
        this._vertGLID = null;
        this._vertItemSize = -1;
        this._indexGLID = null;
        this._indexItemSize = -1;
        this._uvGLID = null;
        this._uvItemSize = -1;
        this._normalGLID = null;
        this._normalItemSize = -1;
        this._lightColor = [];
        this._lightDirection = [];
        this._textureGLIDArray = [];
        this._modelMatrix =  null;
        this._u_pvm_matrix_inverse = null;
        this._time = 0;
        this._glPrimitiveType = glprimitive_type.TRIANGLE_FAN;
        this._isUse = false;
    }
}

export class SpineRenderData extends RenderData{
    constructor(){
        super();
        this._extraViewLeftMatrix = glMatrix.mat4.identity(null);
        this._tempMatrix1 = glMatrix.mat4.identity(null);
        this.reset();
    }
    public reset(){
        super.reset();
        this._uniformInfors = [];
        this._shaderData = null;
        this._attrbufferInfo = null;
        this._projKey = "";
        this._viewKey = "";
        this._type = RenderDataType.Spine;
        this._glPrimitiveType = glprimitive_type.TRIANGLES;
        glMatrix.mat4.identity(this._extraViewLeftMatrix);
        glMatrix.mat4.identity(this._tempMatrix1);
    }
    public _shaderData:ShaderData;
    public _attrbufferInfo:any;
    public _uniformInfors:Array<any>;
    public _extraViewLeftMatrix:Float32Array;
    public _tempMatrix1:Float32Array;
    public _projKey:string;
    public _viewKey:string;
}

/**
 * 渲染数据缓存池
 */
export class RenderDataPool{
     private static _pool:Array<RenderData> = [];
     static get(type:RenderDataType):RenderData{
            let pool = RenderDataPool._pool;
            let retItem:RenderData;
            for(var j = 0;j<pool.length;j++)
            {
                let item = pool[j];
                if(item._type==type&&item._isUse==false)
                {
                    retItem =  item;
                    break;
                }
            }
            
            switch(type)
            {
                case RenderDataType.Base:retItem = new RenderData();pool.push(retItem);break;
                case RenderDataType.Spine:retItem = new SpineRenderData();pool.push(retItem);break;
            }
            retItem._isUse = true;
            return retItem;
     }
     static return(retData:RenderData|Array<RenderData>):void{
          if(retData instanceof Array)
          {
              let arr = retData as Array<RenderData>;
              for(let j = 0;j<arr.length;j++)
              {
                  arr[j].reset();
              }
          }
          else
          {
              (retData as RenderData).reset();
          }
     }
}