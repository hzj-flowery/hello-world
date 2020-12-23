import { glMatrix } from "../../Matrix";
import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";


let renderDataId:number = 0;
export enum RenderDataType{
    Base = 1,
    Normal,
    Spine
}
export enum ShaderUseMatrixType{
    Model = 1,  //模型世界矩阵
    View,       //视口矩阵
    Projection,  //投影矩阵
    ModelInverse, //模型世界矩阵的逆矩阵
    ModelTransform, //模型世界矩阵的转置矩阵
    ModelInverseTransform,//模型世界矩阵的逆矩阵的转置矩阵
    ModelView,//视口*模型世界矩阵
    ModelViewProjection,//投影*视口*模型世界矩阵
    ViewProjection,//投影*视口矩阵
    ProjectionInverse,//投影矩阵的逆矩阵
    ModelViewProjectionInverse,//(投影*视口*模型世界矩阵)的逆矩阵
    UndefinedMatrix,//无效的矩阵类型
}
/**
 * 定义渲染数据
 */
export  class RenderData{
    constructor(){
        this.id = renderDataId++;
        this._type = RenderDataType.Base;

        this._temp_model_view_matrix = glMatrix.mat4.identity(null);
        this._temp_model_inverse_matrix = glMatrix.mat4.identity(null);
        this._temp_model_inverse_transform_matrix = glMatrix.mat4.identity(null);
        this. _temp_model_transform_matrix = glMatrix.mat4.identity(null);
        this._useMatrixType = [ShaderUseMatrixType.ModelView,ShaderUseMatrixType.Projection];
        this.reset();
    }
    public _type:RenderDataType;
    public id:number;//每一个渲染数据都一个唯一的id
    public _cameraType:number;//相机的类型
    public _cameraPosition:Array<number>;//相机的位置
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
    public _lightPosition:Array<number>;//光的位置
    public _textureGLIDArray:Array<WebGLTexture>;
    public _glPrimitiveType: glprimitive_type;//绘制的类型
    public _modelMatrix:Float32Array;//模型矩阵
    public _u_pvm_matrix_inverse:Float32Array;//
    public _time:number;
    public _isUse:boolean = false;//使用状态
    
    private _useMatrixType:Array<ShaderUseMatrixType> = [];
    private _temp_model_view_matrix;//视口模型矩阵
    private _temp_model_inverse_matrix;//模型世界矩阵的逆矩阵
    private _temp_model_transform_matrix;//模型世界矩阵的转置矩阵
    private _temp_model_inverse_transform_matrix;//模型世界矩阵的逆矩阵的转置矩阵
    public reset():void{
        this._cameraType = 0;//默认情况下是透视投影
        this._cameraPosition = [];
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
        this._lightPosition = [];
        this._textureGLIDArray = [];
        this._modelMatrix =  null;
        this._u_pvm_matrix_inverse = null;
        this._time = 0;
        this._glPrimitiveType = glprimitive_type.TRIANGLE_FAN;
        this._isUse = false;
        
    }
    public pushMatrix(type:ShaderUseMatrixType):void{
        if(type>=ShaderUseMatrixType.UndefinedMatrix||type<ShaderUseMatrixType.Model)
        {
            console.log("这个类型的矩阵是不合法的！！！！",type);
            return;
        }
        if(this._useMatrixType.indexOf(type)>=0)
        {
            console.log("这个类型的矩阵已经有了！！！！",type);
            return;
        }
        this._useMatrixType.push(type);
    }
    /**
     * 设置矩阵
     * @param view 
     * @param proj 
     */
    private updateMatrix(view,proj):void{
        this._useMatrixType.forEach((value:ShaderUseMatrixType)=>{
               switch(value){
                   case ShaderUseMatrixType.Projection:
                        this._shader.setUseProjectionMatrix(proj);
                        break;
                    case ShaderUseMatrixType.ModelView:
                        glMatrix.mat4.mul(this._temp_model_view_matrix,view,this._modelMatrix);
                        this._shader.setUseModelViewMatrix(this._temp_model_view_matrix);
                        break;
                    case ShaderUseMatrixType.ModelInverseTransform:
                        glMatrix.mat4.invert(this._temp_model_inverse_matrix,this._modelMatrix);
                        glMatrix.mat4.transpose(this._temp_model_inverse_transform_matrix,this._temp_model_inverse_matrix);
                        this._shader.setUseModelInverseTransformWorldMatrix(this._temp_model_inverse_transform_matrix);
                        break;
                    default:
                        console.log("目前还没有处理这个矩阵类型");
               }
        })
    }
    /**
     * 
     * @param view 
     * @param proj 
     */
    private bindGPUBufferData(view,proj):void{

        //激活shader
        this._shader.active();
        //给shader中的变量赋值
        this._shader.setUseLight(this._lightColor, this._lightDirection);
        if (this._u_pvm_matrix_inverse) {
            this._shader.setUseSkyBox(this._u_pvm_matrix_inverse);
        }

        this.updateMatrix(view,proj);
        this._shader.setUseVertexAttribPointerForVertex(this._vertGLID, this._vertItemSize);
        this._shader.setUseVertexAttribPointerForUV(this._uvGLID, this._uvItemSize);
        this._shader.setUseVertexAttriPointerForNormal(this._normalGLID, this._normalItemSize);
        if (this._textureGLIDArray.length > 0) {
            this._shader.setUseTexture(this._textureGLIDArray[0]);
        }
    }
    /**
     * 启动绘制
     * @param gl 
     * @param view 
     * @param proj 
     */
    public startDraw(gl:WebGLRenderingContext,view,proj):void{
        this.bindGPUBufferData(view,proj);
        var indexglID = this._indexGLID;
        if (indexglID != -1) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID);
            gl.drawElements(this._glPrimitiveType, this._indexItemNums, gl.UNSIGNED_SHORT, 0);
        }
        else {
            gl.drawArrays(this._glPrimitiveType, 0, this._vertItemNums);
        }
        //解除缓冲区对于目标纹理的绑定
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this._shader.disableVertexAttribArray();
    }
}

export class NormalRenderData extends RenderData{
    constructor(){
        super();
        this._extraViewLeftMatrix = glMatrix.mat4.identity(null);
        this._tempMatrix1 = glMatrix.mat4.identity(null);
        this._type = RenderDataType.Normal;
    }
    public reset(){
        super.reset();
        this._uniformData = [];
        this._shaderData = null;
        this._attrbufferData = null;
        this._projKey = "";
        this._viewKey = "";
        this._glPrimitiveType = glprimitive_type.TRIANGLES;
        glMatrix.mat4.identity(this._extraViewLeftMatrix);
        glMatrix.mat4.identity(this._tempMatrix1);
    }
    public _shaderData:ShaderData;
    //顶点着色器属性数据
    public _attrbufferData:BufferAttribsData;
    //uniform变量的数据
    public _uniformData:Array<any>;
    public _extraViewLeftMatrix:Float32Array;
    public _tempMatrix1:Float32Array;
    public _projKey:string;//投影矩阵的key
    public _viewKey:string;//视口矩阵key
    public _worldKey:string;//世界矩阵key
    public _node:SY.Sprite;//渲染的节点
}

export class SpineRenderData extends NormalRenderData{
    constructor(){
        super();
        this._type = RenderDataType.Spine;
    }
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
                case RenderDataType.Normal:retItem = new NormalRenderData();pool.push(retItem);break;
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