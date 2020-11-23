import { glMatrix } from "../../Matrix";
import { glprimitive_type } from "../gfx/GLEnums";
import { Shader, ShaderData } from "../shader/Shader";

/**
 * 定义渲染数据
 */
export  class RenderData{
    constructor(){
        this.reset();
    }
    public _type:number = 1;
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
        this._type = 2;
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