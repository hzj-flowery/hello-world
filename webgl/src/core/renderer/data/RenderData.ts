import { ColonToken, isThisTypeNode } from "typescript";
import Device from "../../Device";
import { G_InputControl } from "../../InputControl";
import { glMatrix } from "../../math/Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { Color } from "../../value-types/color";
import Vec3 from "../../value-types/vec3";
import { Node } from "../base/Node";
import { GameMainCamera } from "../camera/GameMainCamera";
import { glEnums } from "../gfx/GLapi";
import { State, syStateStringKey, syStateStringValue } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { IGeometry } from "../primitive/define";
import { Pass } from "../shader/Pass";
import { BufferAttribsData, ShaderProgramBase, ShaderProgram } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


let renderDataId: number = 0;
export namespace syRender {

    export enum PassCustomKey {
        offlineRender = "offlineRender", //离线渲染
        drawInstanced = "drawInstanced", //实例化绘制
        DrawingOrder = "DrawingOrder",//绘制顺序
        ShaderType = "ShaderType",//shader的类型
        DefineUse = "DefineUse",//宏的使用
        ProgramBaseType = "ProgramBaseType",
    }

    export enum ColorMask {
        NONE = 0x0, //00000000 
        R = 0x1, //00000001
        G = 0x2, //00000010
        B = 0x4, //00000100
        A = 0x8, //00001000
        ALL = R | G | B | A,//表示全部开启
    }

    /**
     * 网格数据
     */
    export class Mesh {
        constructor() {
            this.positions = [];
            this.normals = [];
            this.uvs = [];
            this.indices = [];
        }
        positions: Array<number>;
        normals: Array<number>;
        uvs: Array<number>;
        indices: Array<number>;
        static create(): Mesh {
            return new Mesh();
        }

        /**
         * 网格合并
         */
        public combine(data: IGeometry, offsetX: number = 0, offsetY: number = 0, offsetZ: number = 0): void {

            var curPosLen = this.positions.length / 3;
            var tempPositions = [].concat(data.positions);
            if (offsetX != 0 || offsetY != 0 || offsetZ != 0) {
                //需要对位置进行整体调整
                for (let k = 0; k < tempPositions.length; k = k + 3) {
                    tempPositions[k] = tempPositions[k] + offsetX;
                    tempPositions[k + 1] = tempPositions[k + 1] + offsetY;
                    tempPositions[k + 2] = tempPositions[k + 2] + offsetZ;
                }
            }
            //新的位置数据
            this.positions = [].concat(this.positions, tempPositions);
            //新的法线数据
            this.normals = [].concat(this.normals, data.normals);
            //新的uv数据
            this.uvs = [].concat(this.uvs, data.uvs);

            if (curPosLen > 0) {
                //三角形管带绘制
                //输入两个不存在的索引，让其无法绘制三角形 从而让网格断开
                // (尾-2 尾-1 尾) ==> (尾-1 尾 -1) (尾 -1 -1) (-1 -1 头) (-1 头 头+1) ==>(头 头+1 头+2)
                this.indices.push(-1)
                this.indices.push(-1)
            }
            //新的索引数据
            let newIndices = [];
            for (let k = 0; k < data.indices.length; k++) {
                newIndices.push(data.indices[k] + curPosLen);
            }
            this.indices = [].concat(this.indices, newIndices)

        }
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

    export const ShaderDefineValue = {

        SY_USE_NORMAL: "SY_USE_NORMAL",            //使用法线
        SY_USE_MAT: "SY_USE_MAT",                  //万能矩阵
        SY_USE_FLOAT_ARRAY_LENGTH: "SY_USE_FLOAT_ARRAY_LENGTH",//使用float数组 定义其长度 
        SY_USE_ALPHA_TEST: "SY_USE_ALPHA_TEST",    //alpha测试
        SY_USE_RGB_TEST: "SY_USE_RGB_TEST",        //rgb测试
        SY_USE_TEXTURE: "SY_USE_TEXTURE",          //使用纹理
        SY_USE_LIGHT_AMBIENT: "SY_USE_LIGHT_AMBIENT",          //使用环境光
        SY_USE_LIGHT_PARALLEL: "SY_USE_LIGHT_PARALLEL",        //使用平行光
        SY_USE_LIGHT_SPOT: "SY_USE_LIGHT_SPOT",                //使用聚光
        SY_USE_LIGHT_POINT: "SY_USE_LIGHT_POINT",              //使用点光
        SY_USE_LIGHT_SPECULAR: "SY_USE_LIGHT_SPECULAR",        //使用高光
        SY_USE_SHADOW_PARALLEL: "SY_USE_SHADOW_PARALLEL",      //使用平行光阴影
        SY_USE_FOG: "SY_USE_FOG",                              //使用雾
        SY_USE_FOG_EXP: "SY_USE_FOG_EXP",
        SY_USE_FOG_EXP2: "SY_USE_FOG_EXP2",
        SY_USE_POINT_SIZE: "SY_USE_POINT_SIZE",                //点的大小
        SY_USE_ADD_POSITION_SPACE: "SY_USE_ADD_POSITION_SPACE", //追加一个位置空间
        SY_USE_EMISSIVE: "SY_USE_EMISSIVE",                              //使用自发光
        //下面是函数
        SY_USE_FUNC_PACK: "SY_USE_FUNC_PACK",                        //压缩函数
        SY_USE_FUNC_UNPACK: "SY_USE_FUNC_UNPACK",                        //解压缩函数

        //变形目标
        SY_USE_MORPHTARGETS: "SY_USE_MORPHTARGETS",                      //变形目标
        SY_USE_MORPHTARGETS_RELATIVE: "SY_USE_MORPHTARGETS_RELATIVE",                      //变形目标 减去当前位置

        SY_USE_REMOVE_DEFINE: "SY_USE_REMOVE_DEFINE",//任何一个宏与这个宏 "$"使用 就是删除不使用的意思
    }

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
     * 内置纹理
     */
    export enum BuiltinTexture {
        DeferredPosition = 1, //延迟渲染--位置纹理
        DeferredNormal,  //延迟渲染--法线纹理
        DeferredColor,  //延迟渲染--颜色纹理
        DeferredUV,     //延迟渲染--uv纹理
        DeferredDepth,  //延迟渲染--深度纹理
        Custom, //自定义

        ShadowMap,//阴影贴图
        LightMap,//光照贴图
        NormalMap,//法线贴图
        DiffuseMap,//漫反射贴图
        SpecularMap,//高光贴图
        JointMap,   //谷歌贴图

        None   //非延迟渲染输出的纹理 
    }
    /**
     * 延迟渲染所有类型的纹理
     */
    export var DeferredAllTypeTexture = [
        BuiltinTexture.None,
        BuiltinTexture.DeferredPosition,
        BuiltinTexture.DeferredNormal,
        BuiltinTexture.DeferredColor,
        BuiltinTexture.DeferredUV,
        BuiltinTexture.DeferredDepth
    ];

    //bufferData
    export class WebGLBufferData {
        public glID: WebGLBuffer;//显存地址
        public itemSize: number;//单个buffer单元的数据数目
        public itemNums: number;//所有buffer单元数目
        public itemOffset: number = 0;//从显存的buffer数组的哪一个位置开始读取数据
    }

    //绘制信息
    export class Primitive {
        constructor() {
            this.nodeVertColor = new WebGLBufferData()
            this.vertMatrix = new WebGLBufferData()
            this.position = new WebGLBufferData()
            this.index = new WebGLBufferData()
            this.uv = new WebGLBufferData()
            this.normal = new WebGLBufferData();
            this.type = syGL.PrimitiveType.TRIANGLE_STRIP;
            this.customMatrix = glMatrix.mat4.identity(null);
            this.color = new Color(255, 255, 255, 255);
            this.emissive = new Color(0, 0, 0, 255);
        }
        public nodeVertColor: WebGLBufferData;//节点自定义顶点颜色
        public vertMatrix: WebGLBufferData;//节点自定义矩阵
        public position: WebGLBufferData;//顶点buffer
        public index: WebGLBufferData;//索引buffer
        public uv: WebGLBufferData;//uv buffer
        public normal: WebGLBufferData;//法线buffer

        public color: Color;//节点自定义颜色
        public emissive: Color;//自发光
        public diffuse: Color; //漫反射颜色
        public customFloatValue: number; //一个自定义的值
        public alpha: number;        //节点自定义透明度
        public customMatrix: Float32Array;//自定义矩阵
        public modelMatrix: Float32Array;//模型矩阵
        public type: syGL.PrimitiveType; //绘制类型

        public instancedNums: number = 0;//实例的数目
        public instancedVertNums: number = 0;//每个实例的顶点数目


        //变形
        public morphPositions: Array<WebGLBufferData>;
        //变形目标的数量
        public morphTargetCount: number = 0;
        //变形因子
        public morphTargetInfluences: Array<number> = [];
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
            public color = new Color(0, 0, 0, 255);
            public position = new Vec3(0, 0, 0);
            public direction = new Vec3(0, 0, 0);
            public reset(): void {

                this.color.r = 255;
                this.color.g = 0;
                this.color.b = 0;
                this.color.a = 255;//默认的颜色
                this.direction.x = 1;
                this.direction.y = 1;
                this.direction.z = 1;
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
                this.position = new Vec3(0, 0, 0);
            }
            public spot: Light.Spot;    //聚光灯
            public fog: Light.Fog;     //雾
            public parallel: Light.Parallel;//平行光
            public specular: Light.Specular;//高光
            public point: Light.Point;     //点光
            public shadow: Light.Shadow;    //阴影
            public ambient: Light.Ambient;//环境光
            public position: Vec3; //光的位置

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
            this._cameraPosition = new Vec3(0, 0, 0)
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
        public _cameraPosition: Vec3;//相机的位置
        private _pass: Pass;
        public light: Light.Center;
        public primitive: Primitive;


        public time: number;
        public useFlag: boolean = false;//使用状态

        protected _type: syRender.QueueItemType;

        private _id: number;//每一个渲染数据都一个唯一的id
        private _texture2DGLIDArray: Array<WebGLTexture>;//2d纹理
        private _textureCubeGLIDArray: Array<WebGLTexture>;//立方体纹理
        private _texture2DGLIDMap: Map<BuiltinTexture, WebGLTexture> = new Map()
        private _temp_model_view_matrix;//视口模型矩阵
        private _temp_model_view_matrix_inverse_transform;//视口模型矩阵逆矩阵的转置矩阵
        private _temp_model_inverse_matrix;//模型世界矩阵的逆矩阵
        private _temp_model_transform_matrix;//模型世界矩阵的转置矩阵
        private _temp_model_inverse_transform_matrix;//模型世界矩阵的逆矩阵的转置矩阵
        private _temp001_matrix;//
        private _temp002_matrix;//
        private _temp003_matrix;//
        private _temp004_matrix;//
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

        public push2DTexture(texture: WebGLTexture, deferredTex: BuiltinTexture = BuiltinTexture.None): void {
            if (deferredTex == BuiltinTexture.None) {
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
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.POSITION, this.primitive.position.glID, this.primitive.position.itemSize);
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
                        _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(BuiltinTexture.DeferredPosition), useTextureAddres, syGL.AttributeUniform.TEX_GPosition);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GNormal:
                        _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(BuiltinTexture.DeferredNormal), useTextureAddres, syGL.AttributeUniform.TEX_GNormal);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GColor:
                        _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(BuiltinTexture.DeferredColor), useTextureAddres, syGL.AttributeUniform.TEX_GColor);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GUv:
                        _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(BuiltinTexture.DeferredUV), useTextureAddres, syGL.AttributeUniform.TEX_GUv);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.GDepth:
                        _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(BuiltinTexture.DeferredDepth), useTextureAddres, syGL.AttributeUniform.TEX_GDepth);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.TEX_CUSTOM:
                        //延迟渲染中的万能矩阵
                        _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(BuiltinTexture.Custom), useTextureAddres, syGL.AttributeUniform.TEX_CUSTOM);
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
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LIGHT_PARALLEL_DIRECTION, this.light.parallel.direction.toArray())
                        break;
                    //聚光灯
                    case ShaderUseVariantType.SpotLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_SPOT, this.light.spot.color.toNormalizeArray());
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LIGHT_SPOT_CENTER_DIRECTION, this.light.spot.direction.toArray())
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
                    case ShaderUseVariantType.EMISSIVE:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.EMISSIVE, this.primitive.emissive.toNormalizeArray());
                        break;
                    case ShaderUseVariantType.Diffuse:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.DIFFUSE, this.primitive.diffuse.toNormalizeArray());
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
                    case ShaderUseVariantType.FloatArray:
                        _shader.setCustomUniformFloatArray(syGL.AttributeUniform.FLOAT_ARRAY, [0, 0, 0, 0, 0, 0, 0, 1])
                        break;
                    case ShaderUseVariantType.ShadowMap:
                        _shader.setUseBuiltinTexture(this.light.shadow.map, useTextureAddres, syGL.AttributeUniform.SHADOW_MAP);
                        useTextureAddres++;
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_0:
                        if(this.primitive.morphPositions[0])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_0, this.primitive.morphPositions[0].glID, this.primitive.morphPositions[0].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_1:
                        if(this.primitive.morphPositions[1])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_1, this.primitive.morphPositions[1].glID, this.primitive.morphPositions[1].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_2:
                        if(this.primitive.morphPositions[2])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_2, this.primitive.morphPositions[2].glID, this.primitive.morphPositions[2].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_3:
                        if(this.primitive.morphPositions[3])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_3, this.primitive.morphPositions[3].glID, this.primitive.morphPositions[3].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_4:
                        if(this.primitive.morphPositions[4])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_4, this.primitive.morphPositions[4].glID, this.primitive.morphPositions[4].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_5:
                        if(this.primitive.morphPositions[5])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_5, this.primitive.morphPositions[5].glID, this.primitive.morphPositions[5].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_6:
                        if(this.primitive.morphPositions[6])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_6, this.primitive.morphPositions[6].glID, this.primitive.morphPositions[6].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_7:
                        if(this.primitive.morphPositions[7])
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.MORPH_TARGET_7, this.primitive.morphPositions[7].glID, this.primitive.morphPositions[7].itemSize);
                        break;
                    case ShaderUseVariantType.MORPH_TARGET_INFLUENCES:
                        _shader.setCustomUniformFloatArray(syGL.AttributeUniform.MORPH_TARGET_INFLUENCES,  this.primitive.morphTargetInfluences)
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