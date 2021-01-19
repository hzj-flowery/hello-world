import { glMatrix } from "../../Matrix";
import { Node } from "../base/Node";
import { SY } from "../base/Sprite";
import { glprimitive_type } from "../gfx/GLEnums";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


let renderDataId: number = 0;
export enum RenderDataType {
    Base = 1,
    Normal,
    Spine
}

/**
 * 定义渲染数据
 */
export class  RenderData {
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
        this._isOffline = false;
        this.reset();
    }

    public _node:Node;//渲染的节点

    public _isOffline: boolean = false; //是否是离线渲染

    public _isDrawInstanced: boolean = false;//是否是实例化绘制
    public _drawInstancedNums: number = 0;//实例的数目
    public _drawInstancedVertNums: number = 0;//每个实例的顶点数目

    public _type: RenderDataType;
    public id: number;//每一个渲染数据都一个唯一的id
    public _cameraType: number;//相机的类型
    public _cameraPosition: Array<number>;//相机的位置
    public _shader: Shader;//着色器
    public _vertGLID: WebGLBuffer;//顶点buffer的显存地址
    public _vertItemSize: number;//一个顶点buffer单元的顶点数目
    public _vertItemNums: number;//所有顶点buffer单元数目

    public _nodeVertColorGLID: WebGLBuffer;//节点自定义颜色buffer的显存地址
    public _nodeVertColorItemSize: number;//一个节点自定义颜色buffer单元的数据数目
    public _nodeVertColorItemNums: number;//所有节点自定义颜色buffer单元数目

    public _nodeColor:Array<number>;//节点自定义颜色buffer的显存地址

    public _nodeCustomMatrixGLID: WebGLBuffer;//节点自定义矩阵buffer的显存地址
    public _nodeCustomMatrixItemSize: number;//一个节点自定义矩阵的buffer单元的数据数目
    public _nodeCustomMatrixItemNums: number;//所有节点自定义矩阵buffer单元数目


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
    public _specularColor:Array<number>;//高光的颜色
    public _pointColor:Array<number>;//点光的颜色
    public _ambientColor:Array<number>;//环境光的颜色
    public _specularShiness:number;//高光指数
    public _nodeCustomMatrix: Float32Array;//节点自定义矩阵
    public _glPrimitiveType: glprimitive_type;//绘制的类型
    public _modelMatrix: Float32Array;//模型矩阵
    public _time: number;
    public _isUse: boolean = false;//使用状态

    private _texture2DGLIDArray: Array<WebGLTexture>;//2d纹理
    private _textureCubeGLIDArray: Array<WebGLTexture>;//立方体纹理
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
        this._specularColor = [];
        this._ambientColor = [];
        this._pointColor = [];
        this._specularShiness = 0;
        this._texture2DGLIDArray = [];
        this._textureCubeGLIDArray = [];
        this._nodeCustomMatrix = null;
        this._modelMatrix = null;
        this._time = 0;
        this._glPrimitiveType = glprimitive_type.TRIANGLE_FAN;
        this._isUse = false;
    }
    public push2DTexture(texture: WebGLTexture): void {
        if (this._texture2DGLIDArray.indexOf(texture) < 0) {
            this._texture2DGLIDArray.push(texture);
        }
    }
    public pushCubeTexture(texture: WebGLTexture): void {
        if (this._textureCubeGLIDArray.indexOf(texture) < 0) {
            this._textureCubeGLIDArray.push(texture);
        }
    }
    /**
     * 设置矩阵
     * @param view 
     * @param proj 
     */
    private updateShaderVariant(view, proj,_shader:Shader): void {
        let useVariantType = _shader.useVariantType;
        useVariantType.forEach((value: ShaderUseVariantType) => {
            switch (value) {
                case ShaderUseVariantType.Vertex:
                    _shader.setUseVertexAttribPointerForVertex(this._vertGLID, this._vertItemSize);
                    break;
                case ShaderUseVariantType.Normal:
                    _shader.setUseVertexAttriPointerForNormal(this._normalGLID, this._normalItemSize);
                    break;
                case ShaderUseVariantType.UVs:
                    _shader.setUseVertexAttribPointerForUV(this._uvGLID, this._uvItemSize);
                    break;
                case ShaderUseVariantType.TEX_COORD:
                    _shader.setUseTexture(this._texture2DGLIDArray[0], 0);
                    break;
                case ShaderUseVariantType.TEX_COORD1:
                    _shader.setUseTexture(this._texture2DGLIDArray[1], 1);
                    break;
                case ShaderUseVariantType.TEX_COORD2:
                    _shader.setUseTexture(this._texture2DGLIDArray[2], 2);
                    break;
                case ShaderUseVariantType.TEX_COORD3:
                    _shader.setUseTexture(this._texture2DGLIDArray[3], 3);
                    break;
                case ShaderUseVariantType.TEX_COORD4:
                    _shader.setUseTexture(this._texture2DGLIDArray[4], 4);
                    break;
                case ShaderUseVariantType.TEX_COORD5:
                    _shader.setUseTexture(this._texture2DGLIDArray[5], 5);
                    break;
                case ShaderUseVariantType.TEX_COORD6:
                    _shader.setUseTexture(this._texture2DGLIDArray[6], 6);
                    break;
                case ShaderUseVariantType.TEX_COORD7:
                    _shader.setUseTexture(this._texture2DGLIDArray[7], 7);
                    break;
                case ShaderUseVariantType.TEX_COORD8:
                    _shader.setUseTexture(this._texture2DGLIDArray[8], 8);
                    break;
                case ShaderUseVariantType.CUBE_COORD:
                    //立方体纹理数据
                    //-****-------------
                    _shader.setUseCubeTexture(this._textureCubeGLIDArray[0]);
                    break;
                //天空盒
                case ShaderUseVariantType.SKYBOX:
                    _shader.setUseSkyBox(this._textureCubeGLIDArray[0]);
                    glMatrix.mat4.copy(this._temp001_matrix, view);
                    this._temp001_matrix[12] = 0;
                    this._temp001_matrix[13] = 0;
                    this._temp001_matrix[14] = 0;
                    glMatrix.mat4.multiply(this._temp002_matrix, proj, this._temp001_matrix);
                    glMatrix.mat4.invert(this._temp001_matrix, this._temp002_matrix);
                    _shader.setUseProjectionViewInverseMatrix(this._temp001_matrix);
                    break;
                case ShaderUseVariantType.Projection:
                    _shader.setUseProjectionMatrix(proj);
                    break;
                case ShaderUseVariantType.Model:
                    _shader.setUseModelWorldMatrix(this._modelMatrix);
                    break;
                case ShaderUseVariantType.View:
                    _shader.setUseViewMatrix(view);
                    break;
                case ShaderUseVariantType.ViewModel:
                    glMatrix.mat4.mul(this._temp_model_view_matrix, view, this._modelMatrix);
                    _shader.setUseModelViewMatrix(this._temp_model_view_matrix);
                    break;
                case ShaderUseVariantType.ModelInverseTransform:
                    glMatrix.mat4.invert(this._temp_model_inverse_matrix, this._modelMatrix);
                    glMatrix.mat4.transpose(this._temp_model_inverse_transform_matrix, this._temp_model_inverse_matrix);
                    _shader.setUseModelInverseTransformWorldMatrix(this._temp_model_inverse_transform_matrix);
                    break;
                case ShaderUseVariantType.ProjectionViewModelInverse:
                    glMatrix.mat4.multiply(this._temp001_matrix, view, this._modelMatrix);
                    glMatrix.mat4.multiply(this._temp002_matrix, proj, this._temp001_matrix);
                    glMatrix.mat4.invert(this._temp003_matrix, this._temp002_matrix);
                    _shader.setUseProjectViewModelInverseMatrix(this._temp003_matrix);
                    break;
                case ShaderUseVariantType.ProjectionView:
                    glMatrix.mat4.multiply(this._temp001_matrix, proj, view);
                    _shader.setUseProjectionViewMatrix(this._temp001_matrix);
                    break;
                case ShaderUseVariantType.ProjectionViewInverse:
                    glMatrix.mat4.multiply(this._temp001_matrix, proj, view);
                    glMatrix.mat4.invert(this._temp002_matrix, this._temp001_matrix);
                    _shader.setUseProjectionViewInverseMatrix(this._temp002_matrix);
                    break;
                case ShaderUseVariantType.CameraWorldPosition:
                    _shader.setUseCameraWorldPosition(this._cameraPosition);
                    break;
                case ShaderUseVariantType.LightWorldPosition:
                    _shader.setUseLightWorldPosition(this._lightPosition);
                    break;
                case ShaderUseVariantType.LightColor:
                    _shader.setUseLightColor(this._lightColor);
                    break;
                case ShaderUseVariantType.SpecularColor:
                    _shader.setUseSpecularLightColor(this._specularColor,this._specularShiness);
                    break;
                case ShaderUseVariantType.AmbientColor:
                    _shader.setUseAmbientLightColor(this._ambientColor);
                    break;
                case ShaderUseVariantType.PointColor:
                    _shader.setUseAmbientLightColor(this._pointColor);
                    break;
                case ShaderUseVariantType.LightDirection:
                    _shader.setUseLightDirection(this._lightDirection);
                    break;
                case ShaderUseVariantType.Color:
                    _shader.setUseNodeColor(this._nodeColor);
                    break;
                case ShaderUseVariantType.VertColor:
                    _shader.setUseNodeVertColor(this._nodeVertColorGLID, this._nodeVertColorItemSize);
                    break;
                case ShaderUseVariantType.NodeCustomMatrix:
                    _shader.setUseNodeCustomMatrix(this._nodeCustomMatrixGLID, this._nodeCustomMatrixItemSize);
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
    public bindGPUBufferData(view, proj,shader:Shader): void {
        //激活shader
        shader.active();
        this.updateShaderVariant(view, proj,shader);
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