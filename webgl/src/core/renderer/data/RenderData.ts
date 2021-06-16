import Device from "../../Device";
import { glMatrix } from "../../math/Matrix";
import { Node } from "../base/Node";
import { glEnums } from "../gfx/GLapi";
import State from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { Pass } from "../shader/Pass";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


let renderDataId: number = 0;
export namespace syRender {
    export enum Type{
        Forward = 1,//前线渲染
        Deferred,   //延迟渲染
    }
    export enum DataType {
        Base = 1,
        Normal,
        Spine
    }
    
    //bufferData
    export class WebGLBufferData{
        public glID: WebGLBuffer;//显存地址
        public itemSize: number;//单个buffer单元的数据数目
        public itemNums: number;//所有buffer单元数目
    }

    /**
     * 定义渲染数据
     */
    export class BaseData {
        constructor() {
            
            this._id = renderDataId++;
            this._type = syRender.DataType.Base;
            this._temp_model_view_matrix = glMatrix.mat4.identity(null);
            this._temp_model_inverse_matrix = glMatrix.mat4.identity(null);
            this._temp_model_inverse_transform_matrix = glMatrix.mat4.identity(null);
            this._temp_model_transform_matrix = glMatrix.mat4.identity(null);
            this._temp001_matrix = glMatrix.mat4.identity(null);
            this._temp002_matrix = glMatrix.mat4.identity(null);
            this._temp003_matrix = glMatrix.mat4.identity(null);
            this._temp004_matrix = glMatrix.mat4.identity(null);
            this._customMatrix = glMatrix.mat4.identity(null);
            
            this.nodeVertColor = new WebGLBufferData()
            this.reset();
        }
         
        /**
         * 唯一id
         */
        public get id(){
            return this._id
        }

        public get type(){
            return this._type
        }
       

        public node: Node;//渲染的节点
        public drawInstancedNums: number = 0;//实例的数目
        public drawInstancedVertNums: number = 0;//每个实例的顶点数目
      
        public _cameraType: number;//相机的类型
        public _cameraPosition: Array<number>;//相机的位置
        private _pass:Pass;
        

       

        public _nodeColor: Array<number>;//节点自定义颜色buffer的显存地址
        public _nodeAlpha:number;        //节点自定义透明度

        public _spotColor: Array<number>;//聚光的颜色
        public _spotDirection: Array<number>;//聚光的方向
        public _spotInnerLimit: number;//聚光的内部限制
        public _spotOuterLimit: number;//聚光的外部限制

        

        public _customMatrix: Float32Array;//自定义矩阵

        public _fogColor: Array<number>;//雾的颜色
        public _fogDensity: number;//雾的密度

        public nodeVertColor:WebGLBufferData;//节点自定义颜色


        public vertMatrixGLID: WebGLBuffer;//节点自定义矩阵buffer的显存地址
        public vertMatrixItemSize: number;//一个节点自定义矩阵的buffer单元的数据数目
        public vertMatrixItemNums: number;//所有节点自定义矩阵buffer单元数目

        public vertGLID: WebGLBuffer;//顶点buffer的显存地址
        public vertItemSize: number;//一个顶点buffer单元的顶点数目
        public vertItemNums: number;//所有顶点buffer单元数目

        public indexGLID: WebGLBuffer;//索引buffer的显存地址
        public indexItemSize: number;//一个索引buffer单元的顶点数目
        public indexItemNums: number;//所有索引buffer单元的数目

        public uvGLID: WebGLBuffer;//uv buffer的显存地址
        public uvItemSize: number;//一个uv buffer单元的顶点数目

        public normalGLID: WebGLBuffer;//法线buffer的显存地址
        public normalItemSize: number;//一个法线buffer单元的顶点数目

        public _parallelColor: Array<number>;//平行光的颜色
        public _parallelDirection: Array<number>;//平行光的方向
        public _lightPosition: Array<number>;//光的位置
        public _specularColor: Array<number>;//高光的颜色
        public _pointColor: Array<number>;//点光的颜色
        public _ambientColor: Array<number>;//环境光的颜色
        public _specularShiness: number;//高光指数
        public _nodeCustomMatrix: Float32Array;//节点自定义矩阵
        public _glPrimitiveType: syGL.PrimitiveType;//绘制的类型
        public _modelMatrix: Float32Array;//模型矩阵
        public time: number;
        public useFlag: boolean = false;//使用状态

        protected _type: syRender.DataType;

        private _id: number;//每一个渲染数据都一个唯一的id
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
            this._pass = null;
            this._cameraType = 0;//默认情况下是透视投影
            this._cameraPosition = [];
            this.vertGLID = null;
            this.vertItemSize = -1;
            this.indexGLID = null;
            this.indexItemSize = -1;
            this.uvGLID = null;
            this.uvItemSize = -1;
            this.normalGLID = null;
            this.normalItemSize = -1;
            this._parallelColor = [];
            this._parallelDirection = [];
            this._lightPosition = [];
            this._spotColor = [];
            this._spotDirection = [];
            this._spotInnerLimit = 0;
            this._spotOuterLimit = 0;
            this._specularColor = [];
            this._ambientColor = [];
            this._pointColor = [];
            this._specularShiness = 0;
            this._fogColor = [];
            this._fogDensity = 0;
            this._texture2DGLIDArray = [];
            this._textureCubeGLIDArray = [];
            this._nodeCustomMatrix = null;
            this._modelMatrix = null;
            this.time = 0;
            this._glPrimitiveType = syGL.PrimitiveType.TRIANGLE_FAN;
            this.useFlag = false;
            glMatrix.mat4.identity(this._customMatrix);
               
        }

        public set pass(pass:Pass){
            this._pass = pass
        }
        public get pass(){
            return this._pass
        }
        public get shader(){
            return this._pass.code
        }
        public get isOffline(){
            if(this._pass)return this._pass.offlineRender
            return false
        }
        public get isDrawInstanced(){
            if(this._pass)return this._pass.drawInstanced
            return  false
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
        private updateShaderVariant(view, proj, _shader: Shader): void {
            let useTextureAddres: number = 0;
            let useVariantType = _shader.useVariantType;
            useVariantType.forEach((value: ShaderUseVariantType) => {
                switch (value) {
                    case ShaderUseVariantType.Vertex:
                        _shader.setUseVertexAttribPointerForVertex(this.vertGLID, this.vertItemSize);
                        break;
                    case ShaderUseVariantType.Normal:
                        _shader.setUseVertexAttriPointerForNormal(this.normalGLID, this.normalItemSize);
                        break;
                    case ShaderUseVariantType.UVs:
                        _shader.setUseVertexAttribPointerForUV(this.uvGLID, this.uvItemSize);
                        break;
                    case ShaderUseVariantType.TEX_COORD:
                        _shader.setUseTexture(this._texture2DGLIDArray[0], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD1:
                        _shader.setUseTexture(this._texture2DGLIDArray[1], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD2:
                        _shader.setUseTexture(this._texture2DGLIDArray[2], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD3:
                        _shader.setUseTexture(this._texture2DGLIDArray[3], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD4:
                        _shader.setUseTexture(this._texture2DGLIDArray[4], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD5:
                        _shader.setUseTexture(this._texture2DGLIDArray[5], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD6:
                        _shader.setUseTexture(this._texture2DGLIDArray[6], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD7:
                        _shader.setUseTexture(this._texture2DGLIDArray[7], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_COORD8:
                        _shader.setUseTexture(this._texture2DGLIDArray[8], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.CUBE_COORD:
                        //立方体纹理数据
                        //-****-------------
                        _shader.setUseTexture(this._textureCubeGLIDArray[0], useTextureAddres,false);
                        useTextureAddres++;
                        break;
                    //天空盒
                    case ShaderUseVariantType.SKYBOX:
                        _shader.setUseSkyBox(this._textureCubeGLIDArray[0], useTextureAddres);
                        glMatrix.mat4.copy(this._temp001_matrix, view);
                        this._temp001_matrix[12] = 0;
                        this._temp001_matrix[13] = 0;
                        this._temp001_matrix[14] = 0;
                        glMatrix.mat4.multiply(this._temp002_matrix, proj, this._temp001_matrix);
                        glMatrix.mat4.invert(this._temp001_matrix, this._temp002_matrix);
                        _shader.setUseProjectionViewInverseMatrix(this._temp001_matrix);
                        useTextureAddres++;
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
                    case ShaderUseVariantType.CustomMatrix:
                        _shader.setUseMatrix(this._customMatrix);
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
                    case ShaderUseVariantType.SpecularLight:
                        _shader.setUseSpecularLightColor(this._specularColor, this._specularShiness);
                        break;
                    case ShaderUseVariantType.AmbientLight:
                        _shader.setUseAmbientLightColor(this._ambientColor);
                        break;
                    case ShaderUseVariantType.PointLight:
                        _shader.setUsePointLightColor(this._pointColor);
                        break;
                    //平行光
                    case ShaderUseVariantType.ParallelLight:
                        _shader.setUseParallelLight(this._parallelColor, this._parallelDirection);
                        break;
                    //聚光灯
                    case ShaderUseVariantType.SpotLight:
                        _shader.setUseSpotLight(this._spotColor, this._spotDirection, this._spotInnerLimit, this._spotOuterLimit);
                        break;
                    case ShaderUseVariantType.Fog:
                        _shader.setUseFog(this._fogColor, this._fogDensity);
                        break;
                    case ShaderUseVariantType.Color:
                        _shader.setUseNodeColor(this._nodeColor);
                        break;
                    case ShaderUseVariantType.Alpha:
                        _shader.setUseNodeAlpha(this._nodeAlpha);
                        break;
                    case ShaderUseVariantType.VertColor:
                        _shader.setUseNodeVertColor(this.nodeVertColor.glID, this.nodeVertColor.itemSize);
                        break;
                    case ShaderUseVariantType.VertMatrix:
                        _shader.setUseVertMatrix(this.vertMatrixGLID, this.vertMatrixItemSize);
                        break;
                    case ShaderUseVariantType.Time:
                        _shader.setUseTime(Device.Instance.triggerRenderTime);
                    default:
                    // console.log("目前还没有处理这个矩阵类型");
                }
            })
        }
        /**
         * 
         * @param view 视口矩阵
         * @param proj 投影矩阵
         */
        public bindGPUBufferData(view, proj, shader: Shader): void {
            //激活shader
            shader.active();
            this.updateShaderVariant(view, proj, shader);
        }
    }

    export class NormalData extends syRender.BaseData {
        constructor() {
            super();
            this._tempMatrix1 = glMatrix.mat4.identity(null);
            this._type = syRender.DataType.Normal;
            this._state = new State();

             //渲染状态
             this._state.depthFunc = glEnums.DS_FUNC_LESS;
             this._state.depthTest = true;
             this._state.depthWrite = true;

        }
        public reset() {
            super.reset();
            this._uniformData = [];
            this._shaderData = null;
            this._attrbufferData = null;
            this._projKey = "";
            this._viewKey = "";
            this._glPrimitiveType = syGL.PrimitiveType.TRIANGLES;
            glMatrix.mat4.identity(this._tempMatrix1);
        }
         /**
         * 渲染状态
         */
        public _state:State;

        public _shaderData: ShaderData;
        //顶点着色器属性数据
        public _attrbufferData: BufferAttribsData;
        //uniform变量的数据
        public _uniformData: Array<any>;
        public _tempMatrix1: Float32Array;
        public _projKey: string;//投影矩阵的key
        public _viewKey: string;//视口矩阵key
        public _worldKey: string;//世界矩阵key

    }

    export class SpineData extends syRender.NormalData {
        constructor() {
            super();
            this._type = syRender.DataType.Spine;
        }
    }

    /**
     * 渲染数据缓存池
     */
    export class DataPool {
        private static _pool: Array<syRender.BaseData> = [];
        static get(type: syRender.DataType): syRender.BaseData {
            let pool = syRender.DataPool._pool;
            let retItem: syRender.BaseData;
            for (var j = 0; j < pool.length; j++) {
                let item = pool[j];
                if (item.type == type && item.useFlag == false) {
                    retItem = item;
                    break;
                }
            }

            switch (type) {
                case syRender.DataType.Base: retItem = new syRender.BaseData(); pool.push(retItem); break;
                case syRender.DataType.Normal: retItem = new syRender.NormalData(); pool.push(retItem); break;
                case syRender.DataType.Spine: retItem = new syRender.SpineData(); pool.push(retItem); break;
            }
            retItem.useFlag = true;
            return retItem;
        }
        static return(retData: syRender.BaseData | Array<syRender.BaseData>): void {
            if (retData instanceof Array) {
                let arr = retData as Array<syRender.BaseData>;
                for (let j = 0; j < arr.length; j++) {
                    arr[j].reset();
                }
            }
            else {
                (retData as syRender.BaseData).reset();
            }
        }
    }
}