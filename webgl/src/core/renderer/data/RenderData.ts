import { isThisTypeNode } from "typescript";
import Device from "../../Device";
import { G_InputControl } from "../../InputControl";
import { glMatrix } from "../../math/Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { Color } from "../../value-types/color";
import Vec3 from "../../value-types/vec3";
import { Node } from "../base/Node";
import { GameMainCamera } from "../camera/GameMainCamera";
import { glEnums } from "../gfx/GLapi";
import { State, StateString, StateValueMap } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { Pass } from "../shader/Pass";
import { BufferAttribsData, ShaderProgramBase, ShaderProgram } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


let renderDataId: number = 0;
export namespace syRender {

    export var StateData = {
        name: StateString,
        value: StateValueMap
    }

    export enum ColorMask {
        NONE = 0x0, //00000000 
        R = 0x1, //00000001
        G = 0x2, //00000010
        B = 0x4, //00000100
        A = 0x8, //00001000
        ALL = R | G | B | A,//表示全部开启
    }

    //着色器的类型
    export const enum ShaderType {
        Custom = 0,
        Line,
        Point,
        Sprite,
        SolidColor,
        UvSprite,
        Label,
        Spine_Skin,    //
        Spine_Mesh,    //
        Obj,           //
        Shadow,        //绘制阴影
        ShadowMap,
        Light_Parallel,      //平行光
        Light_Spot,         //聚光灯
        Light_Point,        //点光
        RTT_Create,          //多目标渲染创建
        RTT_Use,             //多目标渲染使用
        SkyBox,       //天空盒
        Mirror,       //镜子
        Fog,          //雾
        OutLine,      //描边
        Purity,       //纯色绘制
        Instantiate,  //实例化绘制
        Test,         //只是测试使用
        NULL          //不用shader渲染
    }

    export var ShaderTypeString: Array<string> = [
        "Custom",
        "Line",
        "Point",
        "Sprite",
        "SolidColor",
        "UvSprite",
        "Label",
        "Spine_Skin",
        "Spine_Mesh",
        "Obj",
        "Shadow",
        "ShadowMap",
        "Light_Parallel",
        "Light_Spot",         //7聚光灯
        "Light_Point",        //点光
        "RTT_Create",          //多目标渲染
        "RTT_Use",          //多目标渲染
        "SkyBox",
        "Mirror",
        "Fog",
        "OutLine",
        "Purity",
        "Instantiate",
        "Test",
        "NULL"          //不用shader渲染
    ]

    export enum CameraType {
        Projection = 0, //透视
        Ortho         //正交
    }
    export enum CameraUUid {
        adapt = 0, //自适应 他没有任何相机与之唯一对应 当节点是2d的时候，就是2d相机，当节点是3d的时候，就是3d相机
        base2D,
        base3D,
        light,//光照摄像机
        max
    }
    /**
     * 一个相机最多允许搭配10个渲染纹理
      渲染纹理的UUid
     */
    export enum RenderTextureUUid {
        screen = 1,  //将结果渲染到屏幕，此为正常渲染
        offline2D,   //将结果渲染到一张纹理上，这张纹理对应的是一个2d节点
        offline3D,   //将结果渲染到一张纹理上，这张纹理对应的是一个3d节点
        shadowMap,//深度
        RTT,         //多目标渲染
        other1,
        other2,
        other3,
        other4,
        other5,
        other6,
    }

    /**
     * 节点的类型
     */
    export enum NodeType {
        D2 = 2, //2d节点
        D3,//3d节点
    }
    export enum Type {
        Forward = 1,//前线渲染
        Deferred,   //延迟渲染
    }
    //渲染数据的类型
    export enum QueueItemType {
        Base = 1,
        Normal
    }

    //绘制的顺序
    /**
     这个绘制的顺序是从大的方向概括的：
     我们在收集渲染数据的时候，会以这个顺序作为一个大的分类
     一次完整的渲染，一定是按照下面这个等级进行的
     */
    export enum DrawingOrder {
        Normal = 0,//常规渲染
        Middle,//优先渲染+1
        High,  //优先渲染+2
        Super, //最优先渲染
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
        Custom, //自定义
        None   //非延迟渲染输出的纹理 
    }
    /**
     * 延迟渲染所有类型的纹理
     */
    export var DeferredAllTypeTexture = [
        DeferredTexture.None,
        DeferredTexture.Position,
        DeferredTexture.Normal,
        DeferredTexture.Color,
        DeferredTexture.UV,
        DeferredTexture.Depth
    ];

    //bufferData
    export class WebGLBufferData {
        public glID: WebGLBuffer;//显存地址
        public itemSize: number;//单个buffer单元的数据数目
        public itemNums: number;//所有buffer单元数目
    }

    //shader 中使用的宏
    export class DefineUse {
        public SY_USE_ALPHA_TEST: number = 0; //alpha测试
        public SY_USE_MAT: number = 0;//使用万能矩阵
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
            this.type = syGL.PrimitiveType.TRIANGLE_STRIP;
            this.customMatrix = glMatrix.mat4.identity(null);
            this.color = new Color(255,255,255,255);
        }
        public nodeVertColor: WebGLBufferData;//节点自定义顶点颜色
        public vertMatrix: WebGLBufferData;//节点自定义矩阵
        public vert: WebGLBufferData;//顶点buffer
        public index: WebGLBufferData;//索引buffer
        public uv: WebGLBufferData;//uv buffer
        public normal: WebGLBufferData;//法线buffer

        public color: Color;//节点自定义颜色
        public diffuse: Array<number>; //漫反射颜色
        public customFloatValue: number; //一个自定义的值
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

        /**
 * 光照的基础数据
 */
        export class BaseData {
            constructor() {

            }
            public color = new Color(0,0,0,255);
            public position = new Vec3(0,0,0);
            public direction = new Vec3(0,0,0);
            public reset(): void {
                
                this.color.r = 255;
                this.color.g = 0;
                this.color.b = 0;
                this.color.a = 255;//默认的颜色
                this.direction.x = 1;
                this.direction.y=1;
                this.direction.z =1;
            }
        }
        export class Spot extends BaseData {
            constructor() {
                super();
                this.reset();
            }
            public reset(): void {
                super.reset();
                this.outerLimitAngle = 0;
                this.innerLimitAngle = 0;
            }
            //聚光
            private _innerLimitAngle: number;//聚光的内圈
            private _outerLimitAngle: number;//聚光的外圈
            public get innerLimitAngle(): number {
                return this._innerLimitAngle;
            }
            public set innerLimitAngle(angle: number) {
                this._innerLimitAngle = angle;
            }
            public get outerLimitAngle(): number {
                return this._outerLimitAngle;
            }
            public set outerLimitAngle(angle: number) {
                this._outerLimitAngle = angle;
            }

            public get innerLimit(): number {
                return Math.cos(MathUtils.degToRad(this._innerLimitAngle));
            }
            public get outerLimit(): number {
                return Math.cos(MathUtils.degToRad(this._outerLimitAngle));
            }
        }
        export class Fog extends BaseData {
            constructor() {
                super()
                this.reset();
            }
            public density: number;//雾的密度
            public reset() {
                super.reset();
                this.density = 0;
            }
        }
        //平行光
        export class Parallel extends BaseData {
            constructor() {
                super()
                this.reset()
            }
        }
        //聚光灯
        export class Specular extends BaseData {
            constructor() {
                super();
                this.reset()
            }
            public reset(): void {
                super.reset();
                this.shininess = 0;
            }

            //高光的时候使用
            private _shininess: number;//高光的指数(值越大光越小，值越小光越大)
            public get shininess(): number {
                return this._shininess;
            }
            public set shininess(p: number) {
                this._shininess = p;
            }

        }
        //点光
        export class Point extends BaseData {
            constructor() {
                super()
                this.reset()
            }
        }
        //幻境光
        export class Ambient extends BaseData {
            constructor() {
                super()
                this.reset()
            }
        }
        /**
         * 阴影
         */
        export class Shadow {
            //阴影贴图
            private _bias: number = 0.005; //阴影贴图的马赫带
            private _size: number = 1 / 1024;//阴影的像素尺寸 值越小 阴影越逼真
            private _opacity: number = 0.1; //阴影的alpha值 值越小暗度越深
            private _min: number = 0;       //阴影最小值
            private _map: WebGLTexture;      //深度纹理
            public get bias(): number { return this._bias };
            public set bias(p: number) { this._bias = p };
            public get size(): number { return this._size };
            public set size(p: number) { this._size = p };
            public get opacity(): number { return this._opacity };
            public set opacity(p: number) { this._opacity = p };
            public get min(): number { return this._min };
            public set min(p: number) { this._min = p };
            public get map(): WebGLTexture { return this._map };
            public set map(p: WebGLTexture) { this._map = p };
            public get info() {
                //x马赫带            //y阴影像素尺寸,值越小阴影越逼真
                return [this._bias, this._size, this._min, this._opacity]
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
                this.shadow = new Light.Shadow();
                this.position = new Vec3(0,0,0);
            }
            public spot: Light.Spot;    //聚光灯
            public fog: Light.Fog;     //雾
            public parallel: Light.Parallel;//平行光
            public specular: Light.Specular;//高光
            public point: Light.Point;     //点光
            public shadow: Light.Shadow;    //阴影
            public ambient: Light.Ambient;//环境光
            public position:Vec3; //光的位置

            public viewMatrix: Float32Array;//光照摄像机的视口
            public projectionMatrix: Float32Array;//光照摄像机的投影

            public reset(): void {
                this.spot.reset();
                this.fog.reset();
                this.parallel.reset();
                this.specular.reset();
                this.point.reset();
                this.ambient.reset();
                this.position.x = 0;
                this.position.y = 0;
                this.position.z = 0;
            }
        }
    }


    /**
     * 定义渲染数据
     */
    export class QueueItemBaseData {
        constructor() {
            this._id = renderDataId++;
            this._type = syRender.QueueItemType.Base;
            this._temp_model_view_matrix = glMatrix.mat4.identity(null);
            this._temp_model_view_matrix_inverse_transform = glMatrix.mat4.identity(null);
            this._temp_model_inverse_matrix = glMatrix.mat4.identity(null);
            this._temp_model_inverse_transform_matrix = glMatrix.mat4.identity(null);
            this._temp_model_transform_matrix = glMatrix.mat4.identity(null);
            this._temp001_matrix = glMatrix.mat4.identity(null);
            this._temp002_matrix = glMatrix.mat4.identity(null);
            this._temp003_matrix = glMatrix.mat4.identity(null);
            this._temp004_matrix = glMatrix.mat4.identity(null);

            this.light = new Light.Center();
            this.primitive = new Primitive()
            this.defineUse = new DefineUse();
            this._cameraPosition = new Vec3(0,0,0)
            this.reset();
        }
        /**
         * 唯一id
         */
        public get id() {
            return this._id
        }
        public father: number;//父亲的渲染数据
        public son: number;//儿子的渲染数据
        public get type() {
            return this._type
        }
        public get drawingOrder() {
            if (this._pass) return this._pass.drawingOrder;
            return syRender.DrawingOrder.Normal;
        }

        public node: Node;//渲染的节点
        public _cameraPosition:Vec3;//相机的位置
        private _pass: Pass;
        public light: Light.Center;
        public primitive: Primitive;


        public time: number;
        public useFlag: boolean = false;//使用状态

        protected _type: syRender.QueueItemType;

        private _id: number;//每一个渲染数据都一个唯一的id
        private _texture2DGLIDArray: Array<WebGLTexture>;//2d纹理
        private _textureCubeGLIDArray: Array<WebGLTexture>;//立方体纹理
        private _texture2DGLIDMap: Map<DeferredTexture, WebGLTexture> = new Map()
        private _temp_model_view_matrix;//视口模型矩阵
        private _temp_model_view_matrix_inverse_transform;//视口模型矩阵逆矩阵的转置矩阵
        private _temp_model_inverse_matrix;//模型世界矩阵的逆矩阵
        private _temp_model_transform_matrix;//模型世界矩阵的转置矩阵
        private _temp_model_inverse_transform_matrix;//模型世界矩阵的逆矩阵的转置矩阵
        private _temp001_matrix;//
        private _temp002_matrix;//
        private _temp003_matrix;//
        private _temp004_matrix;//
        public defineUse: DefineUse;
        public reset(): void {
            this._pass = null;
            this._cameraPosition.x = 0;
            this._cameraPosition.y = 0;
            this._cameraPosition.z = 0;
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
            return this._pass.baseProgram
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
        private updateShaderVariant(view, proj, _shader: ShaderProgramBase): void {
            let useTextureAddres: number = 0;
            let useVariantType = _shader.useVariantType;
            useVariantType.forEach((value: ShaderUseVariantType) => {
                switch (value) {
                    case ShaderUseVariantType.Position:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.POSITION, this.primitive.vert.glID, this.primitive.vert.itemSize);
                        break;
                    case ShaderUseVariantType.Normal:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.NORMAL, this.primitive.normal.glID, this.primitive.normal.itemSize);
                        break;
                    case ShaderUseVariantType.TEXTURE_COORD0:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.TEXTURE_COORD0, this.primitive.uv.glID, this.primitive.uv.itemSize);
                        break;
                    case ShaderUseVariantType.TEXTURE0:
                        _shader.setUseTexture(this._texture2DGLIDArray[0], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE1:
                        _shader.setUseTexture(this._texture2DGLIDArray[1], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE2:
                        _shader.setUseTexture(this._texture2DGLIDArray[2], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE3:
                        _shader.setUseTexture(this._texture2DGLIDArray[3], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE4:
                        _shader.setUseTexture(this._texture2DGLIDArray[4], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE5:
                        _shader.setUseTexture(this._texture2DGLIDArray[5], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE6:
                        _shader.setUseTexture(this._texture2DGLIDArray[6], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE7:
                        _shader.setUseTexture(this._texture2DGLIDArray[7], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEXTURE8:
                        _shader.setUseTexture(this._texture2DGLIDArray[8], useTextureAddres);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.CUBE_TEXTURE:
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
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PV_Mat_I, this._temp001_matrix);
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
                    case ShaderUseVariantType.TEX_CUSTOM:
                        //延迟渲染中的万能矩阵
                        _shader.setUseDeferredTexture(this._texture2DGLIDMap.get(DeferredTexture.Custom), useTextureAddres, syGL.AttributeUniform.TEX_CUSTOM);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.Projection:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.P_Mat, proj);
                        break;
                    case ShaderUseVariantType.Model:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.W_Mat, this.primitive.modelMatrix);
                        break;
                    case ShaderUseVariantType.View:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.V_Mat, view);
                        break;
                    case ShaderUseVariantType.ViewModelInverseTransform:
                        glMatrix.mat4.multiply(this._temp_model_view_matrix_inverse_transform, view, this.primitive.modelMatrix);
                        glMatrix.mat4.invert(this._temp_model_view_matrix_inverse_transform, this._temp_model_view_matrix_inverse_transform);
                        glMatrix.mat4.transpose(this._temp_model_view_matrix_inverse_transform, this._temp_model_view_matrix_inverse_transform);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.VW_Mat_I_T, this._temp_model_view_matrix_inverse_transform);
                        break;
                    case ShaderUseVariantType.CustomMatrix:
                        _shader.bindMatrixToShader(syGL.AttributeUniform.Matrix, this.primitive.customMatrix);
                        break;
                    case ShaderUseVariantType.ViewModel:
                        glMatrix.mat4.mul(this._temp_model_view_matrix, view, this.primitive.modelMatrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.VW_Mat, this._temp_model_view_matrix);
                        break;
                    case ShaderUseVariantType.ModelInverseTransform:
                        glMatrix.mat4.invert(this._temp_model_inverse_matrix, this.primitive.modelMatrix);
                        glMatrix.mat4.transpose(this._temp_model_inverse_transform_matrix, this._temp_model_inverse_matrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.W_Mat_I_T, this._temp_model_inverse_transform_matrix);
                        break;
                    case ShaderUseVariantType.ProjectionViewModelInverse:
                        glMatrix.mat4.multiply(this._temp001_matrix, view, this.primitive.modelMatrix);
                        glMatrix.mat4.multiply(this._temp002_matrix, proj, this._temp001_matrix);
                        glMatrix.mat4.invert(this._temp003_matrix, this._temp002_matrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PVW_Mat_I, this._temp003_matrix);
                        break;
                    case ShaderUseVariantType.ProjectionView:
                        glMatrix.mat4.multiply(this._temp001_matrix, proj, view);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PV_Mat, this._temp001_matrix);
                        break;
                    case ShaderUseVariantType.ProjectionViewInverse:
                        glMatrix.mat4.multiply(this._temp001_matrix, proj, view);
                        glMatrix.mat4.invert(this._temp002_matrix, this._temp001_matrix);
                        _shader.bindMatrixToShader(syGL.AttributeUniform.PV_Mat_I, this._temp002_matrix);
                        break;
                    case ShaderUseVariantType.CameraWorldPosition:
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.CameraWorldPosition, this._cameraPosition.toArray());
                        break;
                    case ShaderUseVariantType.LightWorldPosition:
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LightWorldPosition, this.light.position.toArray());
                        break;
                    case ShaderUseVariantType.SpecularLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_SPECULAR, this.light.specular.color.toNormalizeArray())
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.LIGHT_SPECULAR_SHININESS, this.light.specular.shininess)
                        break;
                    case ShaderUseVariantType.AmbientLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_AMBIENT, this.light.ambient.color.toNormalizeArray());
                        break;
                    case ShaderUseVariantType.PointLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_POINT, this.light.point.color.toNormalizeArray());
                        break;
                    //平行光
                    case ShaderUseVariantType.ParallelLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_PARALLEL, this.light.parallel.color.toNormalizeArray())
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LIGHT_PARALLEL_DIR, this.light.parallel.direction.toArray())
                        break;
                    //聚光灯
                    case ShaderUseVariantType.SpotLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_SPOT, this.light.spot.color.toNormalizeArray());
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LIGHT_SPOT_DIRECTION, this.light.spot.direction.toArray())
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.LIGHT_SPOT_INNER_LIMIT, this.light.spot.innerLimit)
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.LIGHT_SPOT_OUTER_LIMIT, this.light.spot.outerLimit);
                        break;
                    case ShaderUseVariantType.Fog:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.FOG_COLOR, this.light.fog.color.toNormalizeArray());
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.FOG_DENSITY, this.light.fog.density);
                        break;
                    case ShaderUseVariantType.Color:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.COLOR, this.primitive.color.toNormalizeArray());
                        break;
                    case ShaderUseVariantType.Diffuse:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.DIFFUSE, this.primitive.diffuse);
                        break;
                    case ShaderUseVariantType.Alpha:
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.ALPHA, this.primitive.alpha);
                        break;
                    case ShaderUseVariantType.VertColor:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.VERT_COLOR, this.primitive.nodeVertColor.glID, this.primitive.nodeVertColor.itemSize);
                        break;
                    case ShaderUseVariantType.VertMatrix:
                        _shader.setUseVertMatrix(syGL.AttributeUniform.VERT_Matrix, this.primitive.vertMatrix.glID, this.primitive.vertMatrix.itemSize);
                        break;
                    case ShaderUseVariantType.Time:
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.TIME, Device.Instance.triggerRenderTime);
                        break;
                    case ShaderUseVariantType.Custom_Float_Value:
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.CUSTOM_FLOAT_VALUE, this.primitive.customFloatValue);
                        break;
                    case ShaderUseVariantType.Resolution:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.RESOLUTION, [Device.Instance.width, Device.Instance.height, 0, 0]);
                        break;
                    case ShaderUseVariantType.Mouse:
                        var p = G_InputControl.getLastPressPos();
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.MOUSE, [p[0], p[1], 0, 0]);
                        break;
                    case ShaderUseVariantType.ShadowInfo:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.SHADOW_INFO, this.light.shadow.info);
                        break;
                    case ShaderUseVariantType.ShadowMap:
                        _shader.setUseDeferredTexture(this.light.shadow.map, useTextureAddres, syGL.AttributeUniform.SHADOW_MAP);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.Define_UseAlphaTest:
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.DefineUseAlphaTest, this.defineUse.SY_USE_ALPHA_TEST)
                        break;
                    case ShaderUseVariantType.Define_UseMat:
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.DefineUseMat, this.defineUse.SY_USE_MAT)
                        break;
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
        public bindGPUBufferData(view, proj, shader: ShaderProgramBase): void {
            //激活shader
            shader.active();
            this.updateShaderVariant(view, proj, shader);
        }
    }

    export class QueueItemData extends syRender.QueueItemBaseData {
        constructor() {
            super();
            this._tempMatrix1 = glMatrix.mat4.identity(null);
            this._type = syRender.QueueItemType.Normal;
        }
        public reset() {
            super.reset();
            this._uniformData = [];
            this._shaderData = null;
            this._attrbufferData = null;
            this.primitive.type = syGL.PrimitiveType.TRIANGLES;
            glMatrix.mat4.identity(this._tempMatrix1);
        }
        public _shaderData: ShaderProgram;
        //顶点着色器属性数据
        public _attrbufferData: BufferAttribsData;
        //uniform变量的数据
        public _uniformData: Array<any>;
        public _tempMatrix1: Float32Array;

        /**
         * 压入相机的位置
         * @param pos 
         */
        public pushCameraPosition(pos: Array<number>) {
            this.pushUniform("u_viewWorldPosition", pos)
        }
        /**
         * 压入光的方向
         * @param dir 
         */
        public pushLightDirection(dir: Array<number>) {
            this.pushUniform("u_lightDirection", dir)
        }
        //--------------------------压入矩阵--------------------------
        public pushProjectMat(proj: Float32Array): void {
            this.pushUniform("u_projection", proj)
        }
        public pushViewMat(view: Float32Array): void {
            this.pushUniform("u_view", view)
        }
        public pushWorldMat(world: Float32Array): void {
            this.pushUniform("u_world", world);
        }
        //------------------------向统一变量中压入一组key value
        private pushUniform(name: string, value: any): void {
            for (let k = 0; k < this._uniformData.length; k++) {
                var searchData = this._uniformData[k]
                for (let s in searchData) {
                    if (s == name) {
                        this._uniformData[k][name] = value;
                        return;
                    }
                }
            }
            var st = {}
            st[name] = value
            this._uniformData.push(st)
        }

    }

    /**
     * 渲染数据缓存池
     */
    export class DataPool {
        private static _pool: Array<syRender.QueueItemBaseData> = [];
        static get(type: syRender.QueueItemType): syRender.QueueItemBaseData {
            let pool = syRender.DataPool._pool;
            let retItem: syRender.QueueItemBaseData;
            for (var j = 0; j < pool.length; j++) {
                let item = pool[j];
                if (item.type == type && item.useFlag == false) {
                    retItem = item;
                    break;
                }
            }

            switch (type) {
                case syRender.QueueItemType.Base: retItem = new syRender.QueueItemBaseData(); pool.push(retItem); break;
                case syRender.QueueItemType.Normal: retItem = new syRender.QueueItemData(); pool.push(retItem); break;
            }
            retItem.useFlag = true;
            return retItem;
        }
        static return(retData: syRender.QueueItemBaseData | Array<syRender.QueueItemBaseData>): void {
            if (retData instanceof Array) {
                let arr = retData as Array<syRender.QueueItemBaseData>;
                for (let j = 0; j < arr.length; j++) {
                    arr[j].reset();
                }
            }
            else {
                (retData as syRender.QueueItemBaseData).reset();
            }
        }
    }
}