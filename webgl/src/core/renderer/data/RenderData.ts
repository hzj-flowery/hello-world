import { isThisTypeNode } from "typescript";
import Device from "../../Device";
import { glMatrix } from "../../math/Matrix";
import { Node } from "../base/Node";
import { CameraUUid } from "../camera/GameMainCamera";
import { glEnums } from "../gfx/GLapi";
import State from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { Pass } from "../shader/Pass";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


let renderDataId: number = 0;
export namespace syRender {

    /**
     * 节点的类型
     */
    export enum NodeType {
        D2 = 1, //2d节点
        D3,//3d节点
    }
    export enum Type {
        Forward = 1,//前线渲染
        Deferred,   //延迟渲染
    }
    //渲染数据的类型
    export enum DataType {
        Base = 1,
        Normal,
        Spine
    }

    //绘制的类型
    export enum DrawType {
        Normal = 0,//常规渲染
        Single,//单独渲染
    }

    export enum AttachPlace {
        Color = 1,          //将结果渲染到颜色附件中
        Depth,              //将结果渲染到深度附件中
        MoreColor           //将结果渲染到更多的颜色附件中
    }

    /**
     * 延迟渲染纹理
     */
    export enum DeferredTexture {
        Position = 1, //位置纹理
        Normal,  //法线纹理
        Color,  //颜色纹理
        UV,     //uv纹理
        Depth,  //深度纹理
        None   //非延迟渲染输出的纹理 
    }

    //bufferData
    export class WebGLBufferData {
        public glID: WebGLBuffer;//显存地址
        public itemSize: number;//单个buffer单元的数据数目
        public itemNums: number;//所有buffer单元数目
    }

    //绘制信息
    export class Primitive {
        constructor() {
            this.nodeVertColor = new WebGLBufferData()
            this.vertMatrix = new WebGLBufferData()
            this.vert = new WebGLBufferData()
            this.index = new WebGLBufferData()
            this.uv = new WebGLBufferData()
            this.normal = new WebGLBufferData();
            this.type = syGL.PrimitiveType.TRIANGLE_FAN;
            this.customMatrix = glMatrix.mat4.identity(null);
        }
        public nodeVertColor: WebGLBufferData;//节点自定义顶点颜色
        public vertMatrix: WebGLBufferData;//节点自定义矩阵
        public vert: WebGLBufferData;//顶点buffer
        public index: WebGLBufferData;//索引buffer
        public uv: WebGLBufferData;//uv buffer
        public normal: WebGLBufferData;//法线buffer

        public color: Array<number>;//节点自定义颜色
        public alpha: number;        //节点自定义透明度
        public customMatrix: Float32Array;//自定义矩阵
        public modelMatrix: Float32Array;//模型矩阵
        public type: syGL.PrimitiveType; //绘制类型

        public instancedNums: number = 0;//实例的数目
        public instancedVertNums: number = 0;//每个实例的顶点数目

        public reset() {
            glMatrix.mat4.identity(this.customMatrix);
            this.modelMatrix = null;
        }
    }

    //光的数据
    export namespace Light {
        export class Spot {
            constructor() {
                this.reset();
            }
            public reset(): void {
                this.color = [];
                this.direction = [];
                this.innerLimit = 0;
                this.outerLimit = 0;
            }
            public color: Array<number>;//聚光的颜色
            public direction: Array<number>;//聚光的方向
            public innerLimit: number;//聚光的内部限制
            public outerLimit: number;//聚光的外部限制
        }
        export class Fog {
            constructor() {
                this.reset();
            }
            public color: Array<number>;//雾的颜色
            public density: number;//雾的密度
            public reset() {
                this.color = []
                this.density = 0;
            }
        }
        //平行光
        export class Parallel {
            constructor() {
                this.reset()
            }
            public reset(): void {
                this.color = [];
                this.direction = [];
            }
            public color: Array<number>;//平行光的颜色
            public direction: Array<number>;//平行光的方向
        }
        //聚光灯
        export class Specular {
            constructor() {
                this.reset()
            }
            public color: Array<number>;//高光的颜色
            public shiness: number;//高光指数
            public reset(): void {
                this.color = [];
                this.shiness = 0;
            }
        }
        //点光
        export class Point {
            constructor() {
                this.reset()
            }
            public color: Array<number>;//光的颜色
            public reset(): void {
                this.color = [];
            }
        }
        //幻境光
        export class Ambient {
            constructor() {
                this.reset()
            }
            public color: Array<number>;//光的颜色
            public reset(): void {
                this.color = [];
            }
        }
        //外界取数据接口
        export class Center {
            constructor() {
                this.spot = new Light.Spot();
                this.fog = new Light.Fog();
                this.parallel = new Light.Parallel();
                this.specular = new Light.Specular();
                this.point = new Light.Point();
                this.ambient = new Light.Ambient();
                this.position = []
            }
            public spot: Light.Spot;    //聚光灯
            public fog: Light.Fog;     //雾
            public parallel: Light.Parallel;//平行光
            public specular: Light.Specular;//高光
            public point: Light.Point;     //点光
            public ambient: Light.Ambient;//环境光

            public position: Array<number>; //光的位置
            public reset(): void {
                this.spot.reset();
                this.fog.reset();
                this.parallel.reset();
                this.specular.reset();
                this.point.reset();
                this.ambient.reset();
                this.position = [];
            }
        }
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

            this.light = new Light.Center();
            this.primitive = new Primitive()

            this.reset();
        }

        /**
         * 唯一id
         */
        public get id() {
            return this._id
        }

        public get type() {
            return this._type
        }

        public get drawType() {
            if (this._pass) return this._pass.drawType;
            return syRender.DrawType.Normal;
        }

        public node: Node;//渲染的节点
        public _cameraPosition: Array<number>;//相机的位置
        private _pass: Pass;
        public light: Light.Center;
        public primitive: Primitive;


        public time: number;
        public useFlag: boolean = false;//使用状态

        protected _type: syRender.DataType;

        private _id: number;//每一个渲染数据都一个唯一的id
        private _texture2DGLIDArray: Array<WebGLTexture>;//2d纹理
        private _textureCubeGLIDArray: Array<WebGLTexture>;//立方体纹理
        private _texture2DGLIDMap: Map<DeferredTexture, WebGLTexture> = new Map()
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
            this._cameraPosition = [];
            this.light.reset();
            this.primitive.reset();
            this._texture2DGLIDMap.clear();
            this._texture2DGLIDArray = [];
            this._textureCubeGLIDArray = [];
            this.time = 0;
            this.useFlag = false;
        }

        public set pass(pass: Pass) {
            this._pass = pass
        }
        public get pass() {
            return this._pass
        }
        public get shader() {
            return this._pass.code
        }
        public get isOffline() {
            if (this._pass) return this._pass.offlineRender
            return false
        }
        public get isDrawInstanced() {
            if (this._pass) return this._pass.drawInstanced
            return false
        }

        public push2DTexture(texture: WebGLTexture, deferredTex: DeferredTexture = DeferredTexture.None): void {
            if (deferredTex == DeferredTexture.None) {
                if (this._texture2DGLIDArray.indexOf(texture) < 0) {
                    this._texture2DGLIDArray.push(texture);
                }
            }
            else {
                this._texture2DGLIDMap.set(deferredTex, texture);
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
                        _shader.setUseVertexAttribPointerForVertex(this.primitive.vert.glID, this.primitive.vert.itemSize);
                        break;
                    case ShaderUseVariantType.Normal:
                        _shader.setUseVertexAttriPointerForNormal(this.primitive.normal.glID, this.primitive.normal.itemSize);
                        break;
                    case ShaderUseVariantType.UVs:
                        _shader.setUseVertexAttribPointerForUV(this.primitive.uv.glID, this.primitive.uv.itemSize);
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
                        _shader.setUseTexture(this._textureCubeGLIDArray[0], useTextureAddres, false);
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
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PVMatrix_INVERSE, this._temp001_matrix);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GPosition:
                        _shader.setUseDeferredTexture(this._texture2DGLIDMap.get(DeferredTexture.Position), useTextureAddres, syGL.AttributeUniform.TEX_GPosition);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GNormal:
                        _shader.setUseDeferredTexture(this._texture2DGLIDMap.get(DeferredTexture.Normal), useTextureAddres, syGL.AttributeUniform.TEX_GNormal);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GColor:
                        _shader.setUseDeferredTexture(this._texture2DGLIDMap.get(DeferredTexture.Color), useTextureAddres, syGL.AttributeUniform.TEX_GColor);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GUv:
                        _shader.setUseDeferredTexture(this._texture2DGLIDMap.get(DeferredTexture.UV), useTextureAddres, syGL.AttributeUniform.TEX_GUv);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GDepth:
                        _shader.setUseDeferredTexture(this._texture2DGLIDMap.get(DeferredTexture.Depth), useTextureAddres, syGL.AttributeUniform.TEX_GDepth);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.Projection:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PMatrix, proj);
                        break;
                    case ShaderUseVariantType.Model:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.MMatrix, this.primitive.modelMatrix);
                        break;
                    case ShaderUseVariantType.View:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.VMatrix, view);
                        break;
                    case ShaderUseVariantType.CustomMatrix:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.Matrix, this.primitive.customMatrix);
                        break;
                    case ShaderUseVariantType.ViewModel:
                        glMatrix.mat4.mul(this._temp_model_view_matrix, view, this.primitive.modelMatrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.VMMatrix, this._temp_model_view_matrix);
                        break;
                    case ShaderUseVariantType.ModelInverseTransform:
                        glMatrix.mat4.invert(this._temp_model_inverse_matrix, this.primitive.modelMatrix);
                        glMatrix.mat4.transpose(this._temp_model_inverse_transform_matrix, this._temp_model_inverse_matrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.MITMatrix, this._temp_model_inverse_transform_matrix);
                        break;
                    case ShaderUseVariantType.ProjectionViewModelInverse:
                        glMatrix.mat4.multiply(this._temp001_matrix, view, this.primitive.modelMatrix);
                        glMatrix.mat4.multiply(this._temp002_matrix, proj, this._temp001_matrix);
                        glMatrix.mat4.invert(this._temp003_matrix, this._temp002_matrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PVM_MATRIX_INVERSE, this._temp003_matrix);
                        break;
                    case ShaderUseVariantType.ProjectionView:
                        glMatrix.mat4.multiply(this._temp001_matrix, proj, view);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PVMatrix, this._temp001_matrix);
                        break;
                    case ShaderUseVariantType.ProjectionViewInverse:
                        glMatrix.mat4.multiply(this._temp001_matrix, proj, view);
                        glMatrix.mat4.invert(this._temp002_matrix, this._temp001_matrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PVMatrix_INVERSE, this._temp002_matrix);
                        break;
                    case ShaderUseVariantType.CameraWorldPosition:
                        _shader.setUseCameraWorldPosition(this._cameraPosition);
                        break;
                    case ShaderUseVariantType.LightWorldPosition:
                        _shader.setUseLightWorldPosition(this.light.position);
                        break;
                    case ShaderUseVariantType.SpecularLight:
                        _shader.setUseSpecularLightColor(this.light.specular.color, this.light.specular.shiness);
                        break;
                    case ShaderUseVariantType.AmbientLight:
                        _shader.setUseAmbientLightColor(this.light.ambient.color);
                        break;
                    case ShaderUseVariantType.PointLight:
                        _shader.setUsePointLightColor(this.light.point.color);
                        break;
                    //平行光
                    case ShaderUseVariantType.ParallelLight:
                        _shader.setUseParallelLight(this.light.parallel.color, this.light.parallel.direction);
                        break;
                    //聚光灯
                    case ShaderUseVariantType.SpotLight:
                        _shader.setUseSpotLight(this.light.spot.color, this.light.spot.direction, this.light.spot.innerLimit, this.light.spot.outerLimit);
                        break;
                    case ShaderUseVariantType.Fog:
                        _shader.setUseFog(this.light.fog.color, this.light.fog.density);
                        break;
                    case ShaderUseVariantType.Color:
                        _shader.setUseNodeColor(this.primitive.color);
                        break;
                    case ShaderUseVariantType.Alpha:
                        _shader.setUseNodeAlpha(this.primitive.alpha);
                        break;
                    case ShaderUseVariantType.VertColor:
                        _shader.setUseNodeVertColor(this.primitive.nodeVertColor.glID, this.primitive.nodeVertColor.itemSize);
                        break;
                    case ShaderUseVariantType.VertMatrix:
                        _shader.setUseVertMatrix(this.primitive.vertMatrix.glID, this.primitive.vertMatrix.itemSize);
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
            this.primitive.type = syGL.PrimitiveType.TRIANGLES;
            glMatrix.mat4.identity(this._tempMatrix1);
        }
        /**
        * 渲染状态
        */
        public _state: State;

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