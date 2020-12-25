import { glMatrix } from "../../Matrix";
import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";


let renderDataId: number = 0;
export enum RenderDataType {
    Base = 1,
    Normal,
    Spine
}
export enum ShaderUseVariantType {
    UndefinedMin = 0,

    Vertex,  //顶点缓冲
    Normal, //法线缓冲
    UVs,    //uv坐标缓冲
    
    //目前支持同时使用9块纹理单元
    TEX_COORD, //纹理0号单元
    TEX_COORD1, //纹理1号单元
    TEX_COORD2, //纹理2号单元
    TEX_COORD3, //纹理3号单元
    TEX_COORD4, //纹理4号单元
    TEX_COORD5, //纹理5号单元
    TEX_COORD6, //纹理6号单元
    TEX_COORD7, //纹理7号单元
    TEX_COORD8, //纹理8号单元
    CUBE_COORD, //立方体纹理单元
    SKYBOX,//cube纹理单元


    Model,  //模型世界矩阵
    View,       //视口矩阵
    Projection,  //投影矩阵
    ModelInverse, //模型世界矩阵的逆矩阵
    ModelTransform, //模型世界矩阵的转置矩阵
    ModelInverseTransform,//模型世界矩阵的逆矩阵的转置矩阵
    ViewModel,//视口*模型世界矩阵
    ProjectionViewModel,//投影*视口*模型世界矩阵
    ProjectionView,//投影*视口矩阵
    ProjectionViewInverse,//投影*视口矩阵的逆矩阵
    ProjectionInverse,//投影矩阵的逆矩阵
    ProjectionViewModelInverse,//(投影*视口*模型世界矩阵)的逆矩阵
    LightWorldPosition, //世界中光的位置
    CameraWorldPosition,//世界中相机的位置
    LightColor,         //光的颜色
    LightDirection,     //光的方向
    NodeColor,          //节点的颜色
    UndefinedMax,//无效
}
/**
 * 定义渲染数据
 */
export class RenderData {
    constructor() {
        this.id = renderDataId++;
        this._type = RenderDataType.Base;
        this._temp_model_view_matrix = glMatrix.mat4.identity(null);
        this._temp_model_inverse_matrix = glMatrix.mat4.identity(null);
        this._temp_model_inverse_transform_matrix = glMatrix.mat4.identity(null);
        this._temp_model_transform_matrix = glMatrix.mat4.identity(null);
        this._temp001_matrix = glMatrix.mat4.identity(null);
        this._temp002_matrix = glMatrix.mat4.identity(null);
        this._temp003_matrix = glMatrix.mat4.identity(null);
        this._temp004_matrix = glMatrix.mat4.identity(null);
        this._useVariantType = [ShaderUseVariantType.ViewModel, ShaderUseVariantType.Projection];
        this._isOffline = false;
        this.reset();
    }
    public _isOffline: boolean = false; //是否是离线渲染
    public _type: RenderDataType;
    public id: number;//每一个渲染数据都一个唯一的id
    public _cameraType: number;//相机的类型
    public _cameraPosition: Array<number>;//相机的位置
    public _shader: Shader;//着色器
    public _vertGLID: WebGLBuffer;//顶点buffer的显存地址
    public _vertItemSize: number;//一个顶点buffer单元的顶点数目
    public _vertItemNums: number;//所有顶点buffer单元的数目
    public _indexGLID: WebGLBuffer;//索引buffer的显存地址
    public _indexItemSize: number;//一个索引buffer单元的顶点数目
    public _indexItemNums: number;//所有索引buffer单元的数目
    public _uvGLID: WebGLBuffer;//uv buffer的显存地址
    public _uvItemSize: number;//一个uv buffer单元的顶点数目
    public _normalGLID: WebGLBuffer;//法线buffer的显存地址
    public _normalItemSize: number;//一个法线buffer单元的顶点数目
    public _lightColor: Array<number>;//光的颜色
    public _lightDirection: Array<number>;//光的方向
    public _lightPosition: Array<number>;//光的位置
    public _nodeColor: Array<number>;//节点的颜色
    public _glPrimitiveType: glprimitive_type;//绘制的类型
    public _modelMatrix: Float32Array;//模型矩阵
    public _time: number;
    public _isUse: boolean = false;//使用状态

    private _useVariantType: Array<ShaderUseVariantType> = [];
    private _textureGLIDArray: Array<WebGLTexture>;
    private _temp_model_view_matrix;//视口模型矩阵
    private _temp_model_inverse_matrix;//模型世界矩阵的逆矩阵
    private _temp_model_transform_matrix;//模型世界矩阵的转置矩阵
    private _temp_model_inverse_transform_matrix;//模型世界矩阵的逆矩阵的转置矩阵
    private _temp001_matrix;//
    private _temp002_matrix;//
    private _temp003_matrix;//
    private _temp004_matrix;//
    public reset(): void {
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
        this._nodeColor = [0, 0, 0, 0];//一般默认节点的颜色是全黑的
        this._modelMatrix = null;
        this._time = 0;
        this._glPrimitiveType = glprimitive_type.TRIANGLE_FAN;
        this._isUse = false;
    }
    public pushTexture(texture:WebGLTexture):void{
        if(this._textureGLIDArray.indexOf(texture)<0)
        {
            this._textureGLIDArray.push(texture);
        }
    }
    public pushShaderVariant(type: ShaderUseVariantType): void {
        if (type >= ShaderUseVariantType.UndefinedMax || type <= ShaderUseVariantType.UndefinedMin) {
            console.log("这个类型的矩阵是不合法的！！！！", type);
            return;
        }
        if (this._useVariantType.indexOf(type) >= 0) {
            console.log("这个类型的矩阵已经有了！！！！", type);
            return;
        }
        this._useVariantType.push(type);
    }
    /**
     * 设置矩阵
     * @param view 
     * @param proj 
     */
    private updateShaderVariant(view, proj): void {
        this._useVariantType.forEach((value: ShaderUseVariantType) => {
            switch (value) {
                case ShaderUseVariantType.Vertex:
                    this._shader.setUseVertexAttribPointerForVertex(this._vertGLID, this._vertItemSize);
                    break;
                case ShaderUseVariantType.Normal:
                    this._shader.setUseVertexAttriPointerForNormal(this._normalGLID, this._normalItemSize);
                    break;
                case ShaderUseVariantType.UVs:
                    this._shader.setUseVertexAttribPointerForUV(this._uvGLID, this._uvItemSize);
                    break;
                case ShaderUseVariantType.TEX_COORD:
                    this._shader.setUseTexture(this._textureGLIDArray[0], 0);
                    break;
                case ShaderUseVariantType.TEX_COORD1:
                    this._shader.setUseTexture(this._textureGLIDArray[1], 1);
                    break;
                case ShaderUseVariantType.TEX_COORD2:
                    this._shader.setUseTexture(this._textureGLIDArray[2], 2);
                    break;
                case ShaderUseVariantType.TEX_COORD3:
                    this._shader.setUseTexture(this._textureGLIDArray[3], 3);
                    break;
                case ShaderUseVariantType.TEX_COORD4:
                    this._shader.setUseTexture(this._textureGLIDArray[4], 4);
                    break;
                case ShaderUseVariantType.TEX_COORD5:
                    this._shader.setUseTexture(this._textureGLIDArray[5], 5);
                    break;
                case ShaderUseVariantType.TEX_COORD6:
                    this._shader.setUseTexture(this._textureGLIDArray[6], 6);
                    break;
                case ShaderUseVariantType.TEX_COORD7:
                    this._shader.setUseTexture(this._textureGLIDArray[7], 7);
                    break;
                case ShaderUseVariantType.TEX_COORD8:
                    this._shader.setUseTexture(this._textureGLIDArray[8], 8);
                    break;
                case ShaderUseVariantType.CUBE_COORD:
                        //立方体纹理数据
                        //-****-------------
                        this._shader.setUseCubeTexture();
                        break;
                //天空盒
                case ShaderUseVariantType.SKYBOX:
                    this._shader.setUseSkyBox();
                    glMatrix.mat4.copy(this._temp001_matrix,view);
                    this._temp001_matrix[12] = 0;
                    this._temp001_matrix[13] = 0;
                    this._temp001_matrix[14] = 0;                    
                    glMatrix.mat4.multiply(this._temp002_matrix,proj,this._temp001_matrix);
                    glMatrix.mat4.invert(this._temp001_matrix,this._temp002_matrix);
                    this._shader.setUseProjectionViewInverseMatrix(this._temp001_matrix);

                    break;
                case ShaderUseVariantType.Projection:
                    this._shader.setUseProjectionMatrix(proj);
                    break;
                case ShaderUseVariantType.Model:
                    this._shader.setUseModelWorldMatrix(this._modelMatrix);
                    break;
                case ShaderUseVariantType.View:
                    this._shader.setUseViewMatrix(view);
                    break;
                case ShaderUseVariantType.ViewModel:
                    glMatrix.mat4.mul(this._temp_model_view_matrix, view, this._modelMatrix);
                    this._shader.setUseModelViewMatrix(this._temp_model_view_matrix);
                    break;
                case ShaderUseVariantType.ModelInverseTransform:
                    glMatrix.mat4.invert(this._temp_model_inverse_matrix, this._modelMatrix);
                    glMatrix.mat4.transpose(this._temp_model_inverse_transform_matrix, this._temp_model_inverse_matrix);
                    this._shader.setUseModelInverseTransformWorldMatrix(this._temp_model_inverse_transform_matrix);
                    break;
                case ShaderUseVariantType.ProjectionViewModelInverse:
                    glMatrix.mat4.multiply(this._temp001_matrix,view,this._modelMatrix);
                    glMatrix.mat4.multiply(this._temp002_matrix,proj,this._temp001_matrix);
                    glMatrix.mat4.invert(this._temp003_matrix,this._temp002_matrix);
                    this._shader.setUseProjectViewModelInverseMatrix(this._temp003_matrix);
                    break;
                case ShaderUseVariantType.ProjectionView:
                    glMatrix.mat4.multiply(this._temp001_matrix,proj,view);
                    this._shader.setUseProjectionViewMatrix(this._temp001_matrix);
                    break;
                case ShaderUseVariantType.ProjectionViewInverse:
                    glMatrix.mat4.multiply(this._temp001_matrix,proj,view);
                    glMatrix.mat4.invert(this._temp002_matrix,this._temp001_matrix);
                    this._shader.setUseProjectionViewInverseMatrix(this._temp002_matrix);
                    break;
                case ShaderUseVariantType.CameraWorldPosition:
                    this._shader.setUseCameraWorldPosition(this._cameraPosition);
                    break;
                case ShaderUseVariantType.LightWorldPosition:
                    this._shader.setUseLightWorldPosition(this._lightPosition);
                    break;
                case ShaderUseVariantType.LightColor:
                    this._shader.setUseLightColor(this._lightColor);
                    break;
                case ShaderUseVariantType.LightDirection:
                    this._shader.setUseLightDirection(this._lightDirection);
                    break;
                case ShaderUseVariantType.NodeColor:
                    this._shader.setUseNodeColor(this._nodeColor);
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
    private bindGPUBufferData(view, proj): void {

        //激活shader
        this._shader.active();
        this.updateShaderVariant(view, proj);
    }
    /**
     * 启动绘制
     * @param gl 
     * @param view 
     * @param proj 
     */
    public startDraw(gl: WebGLRenderingContext, view, proj): void {
        this.bindGPUBufferData(view, proj);
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

export class NormalRenderData extends RenderData {
    constructor() {
        super();
        this._extraViewLeftMatrix = glMatrix.mat4.identity(null);
        this._tempMatrix1 = glMatrix.mat4.identity(null);
        this._type = RenderDataType.Normal;
    }
    public reset() {
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
    public _shaderData: ShaderData;
    //顶点着色器属性数据
    public _attrbufferData: BufferAttribsData;
    //uniform变量的数据
    public _uniformData: Array<any>;
    public _extraViewLeftMatrix: Float32Array;
    public _tempMatrix1: Float32Array;
    public _projKey: string;//投影矩阵的key
    public _viewKey: string;//视口矩阵key
    public _worldKey: string;//世界矩阵key
    public _node: SY.Sprite;//渲染的节点
}

export class SpineRenderData extends NormalRenderData {
    constructor() {
        super();
        this._type = RenderDataType.Spine;
    }
}

/**
 * 渲染数据缓存池
 */
export class RenderDataPool {
    private static _pool: Array<RenderData> = [];
    static get(type: RenderDataType): RenderData {
        let pool = RenderDataPool._pool;
        let retItem: RenderData;
        for (var j = 0; j < pool.length; j++) {
            let item = pool[j];
            if (item._type == type && item._isUse == false) {
                retItem = item;
                break;
            }
        }

        switch (type) {
            case RenderDataType.Base: retItem = new RenderData(); pool.push(retItem); break;
            case RenderDataType.Normal: retItem = new NormalRenderData(); pool.push(retItem); break;
            case RenderDataType.Spine: retItem = new SpineRenderData(); pool.push(retItem); break;
        }
        retItem._isUse = true;
        return retItem;
    }
    static return(retData: RenderData | Array<RenderData>): void {
        if (retData instanceof Array) {
            let arr = retData as Array<RenderData>;
            for (let j = 0; j < arr.length; j++) {
                arr[j].reset();
            }
        }
        else {
            (retData as RenderData).reset();
        }
    }
}