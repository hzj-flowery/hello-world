import { ColonToken, isThisTypeNode } from "typescript";
import Device from "../../Device";
import { G_InputControl } from "../../InputControl";
import { glMatrix } from "../../math/Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { Color } from "../../value-types/color";
import Vec3 from "../../value-types/vec3";
import { UCS } from "../3d/UCS";
import { G_DrawEngine } from "../base/DrawEngine";
import { Node } from "../base/Node";
import { SY } from "../base/Sprite";
import { GameMainCamera } from "../camera/GameMainCamera";
import { glEnums } from "../gfx/GLapi";
import { State, syStateStringKey, syStateStringValue } from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { G_LightCenter } from "../light/LightCenter";
import { IGeometry } from "../primitive/define";
import { Pass } from "../shader/Pass";
import { BufferAttribsData, ShaderProgramBase, ShaderProgram } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";
import { LightData } from "./LightData";


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
        SY_USE_TANGENT:"SY_USE_TANGENT",//使用切线
        SY_USE_UV:"SY_USE_UV",//使用切线
        SY_USE_VERT_COLOR:"SY_USE_VERT_COLOR",//使用顶点颜色
        SY_USE_VERT_MATRIX:"SY_USE_VERT_MATRIX",//使用顶点矩阵
        SY_USE_MAT: "SY_USE_MAT",                  //万能矩阵
        SY_USE_FLOAT_ARRAY_LENGTH: "SY_USE_FLOAT_ARRAY_LENGTH",//使用float数组 定义其长度 
        SY_USE_ALPHA_TEST: "SY_USE_ALPHA_TEST",    //alpha测试
        SY_USE_RGB_TEST: "SY_USE_RGB_TEST",        //rgb测试
        SY_USE_TEXTURE: "SY_USE_TEXTURE",          //使用0号纹理单元
        SY_USE_TEXTURE_ONE: "SY_USE_TEXTURE_ONE",          //使用1号纹理单元
        SY_USE_MAP_BUMP: "SY_USE_MAP_BUMP",          //使用凹凸贴图
        SY_USE_TANGENTSPACE_NORMALMAP:"SY_USE_TANGENTSPACE_NORMALMAP",//使用法线贴图 该法线位于切线空间下
        SY_USE_CLEARCOAT_NORMALMAP:"SY_USE_CLEARCOAT_NORMALMAP", //透明涂层双法线
        SY_USE_LIGHT_AMBIENT: "SY_USE_LIGHT_AMBIENT",          //使用环境光
        SY_USE_LIGHT_PARALLEL_NUM: "SY_USE_LIGHT_PARALLEL_NUM",        //使用平行光
        SY_USE_LIGHT_SPOT_NUM: "SY_USE_LIGHT_SPOT_NUM",                //使用聚光
        SY_USE_LIGHT_POINT_NUM: "SY_USE_LIGHT_POINT_NUM",              //使用点光
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

        SY_USE_FUNC_UNPACK_CUSTOM_TONE_MAPPING: "SY_USE_FUNC_UNPACK_CUSTOM_TONE_MAPPING", //色调映射

        SY_USE_FUNC_RIVER_FLOW: "SY_USE_FUNC_RIVER_FLOW",//模拟水面流动

        SY_USE_FUNC_CATCH_FIRE: "SY_USE_FUNC_CATCH_FIRE",//着火
        SY_USE_FUNC_MAGNIFIER: "SY_USE_FUNC_MAGNIFIER",//放大镜

        //变形目标
        SY_USE_MORPHTARGETS: "SY_USE_MORPHTARGETS",                      //变形目标
        SY_USE_MORPHTARGETS_RELATIVE: "SY_USE_MORPHTARGETS_RELATIVE",                      //变形目标 减去当前位置

        SY_USE_REMOVE_DEFINE: "SY_USE_REMOVE_DEFINE",//任何一个宏与这个宏 "$"使用 就是删除不使用的意思
    }

    export enum ToneMapping {
        LinearToneMapping = 1,
        ReinhardToneMapping = 2,
        CineonToneMapping = 3,
        ACESFilmicToneMapping = 4,
        CustomToneMapping = 5
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

        TEXTURE0 = 1, //纹理0号单元
        TEXTURE1, //纹理1号单元
        TEXTURE2, //纹理2号单元
        TEXTURE3, //纹理3号单元
        TEXTURE4, //纹理4号单元
        TEXTURE5, //纹理5号单元
        TEXTURE6, //纹理6号单元
        TEXTURE7, //纹理7号单元
        TEXTURE8, //纹理8号单元

        MAP_G_POSITION, //延迟渲染--位置纹理
        MAP_G_NORMAL,  //延迟渲染--法线纹理
        MAP_G_COLOR,  //延迟渲染--颜色纹理
        MAP_G_UV,     //延迟渲染--uv纹理
        MAP_G_DEPTH,  //延迟渲染--深度纹理
        MAP_CUSTOM, //自定义

        MAP_SHADOW,  //阴影贴图
        MAP_LIGHT,   //光照贴图
        MAP_EMISSIVE,//自发光贴图
        MAP_DIFFUSE,//漫反射贴图
        MAP_NORMAL,//法线贴图
        MAP_BUMP,     //凹凸贴图
        MAP_BUMP_SCALE,   //凹凸贴图因子
        MAP_AMBIENT,//环境贴图
        MAP_ALPHA,     //alpha贴图
        MAP_SPECULAR, //高光贴图
        MAP_JOINT,   //骨骼贴图


        None   //非延迟渲染输出的纹理 
    }



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
            this.tagent = new WebGLBufferData();
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
        public tagent:WebGLBufferData;//切线buffer

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
            static structNames =  {
                innerLimit:"innerLimit",
                outerLimit:"outerLimit",
                direction:"direction",
                position:"position",
                ambient:"ambient",
                diffuse:"diffuse",
                specular:"specular",
                constant:"constant",
                linear:"linear",
                quadratic:"quadratic",
            }
            public static getPreStructName(pointNum){
                return "u_spotLights[" + pointNum + "].";
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
                this.reset();
               
            }
            static structNames = {
                direction:"direction",
                ambient:"ambient",
                diffuse:"diffuse",
                specular:"specular",
            }
            public static getPreStructName(lightNum){
                return "u_dirLights[" + lightNum + "].";
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
                this.reset();
               
            }
            static structNames =  {
                position:"position",
                ambient:"ambient",
                diffuse:"diffuse",
                specular:"specular",
                constant:"constant",
                linear:"linear",
                quadratic:"quadratic",
            }
            public static getPreStructName(pointNum){
                return "u_pointLights[" + pointNum + "].";
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
        
        //内置变形变量
        private static BuiltinMorphTargetMap={
            [ShaderUseVariantType.MORPH_TARGET_0]:[0,syGL.AttributeUniform.MORPH_TARGET_0],
            [ShaderUseVariantType.MORPH_TARGET_1]:[1,syGL.AttributeUniform.MORPH_TARGET_1],
            [ShaderUseVariantType.MORPH_TARGET_2]:[2,syGL.AttributeUniform.MORPH_TARGET_2],
            [ShaderUseVariantType.MORPH_TARGET_3]:[3,syGL.AttributeUniform.MORPH_TARGET_3],
            [ShaderUseVariantType.MORPH_TARGET_4]:[4,syGL.AttributeUniform.MORPH_TARGET_4],
            [ShaderUseVariantType.MORPH_TARGET_5]:[5,syGL.AttributeUniform.MORPH_TARGET_5],
            [ShaderUseVariantType.MORPH_TARGET_6]:[6,syGL.AttributeUniform.MORPH_TARGET_6],
            [ShaderUseVariantType.MORPH_TARGET_7]:[7,syGL.AttributeUniform.MORPH_TARGET_7],
            [ShaderUseVariantType.MORPH_TARGET_INFLUENCES]:[8,syGL.AttributeUniform.MORPH_TARGET_INFLUENCES],
        }
        //内置纹理map
        public static BuiltinTextureMap = {
            [ShaderUseVariantType.TEXTURE0]: [BuiltinTexture.TEXTURE0, syGL.AttributeUniform.TEXTURE0],  //常规贴图 
            [ShaderUseVariantType.TEXTURE1]: [BuiltinTexture.TEXTURE1, syGL.AttributeUniform.TEXTURE1],  //常规贴图 
            [ShaderUseVariantType.TEXTURE2]: [BuiltinTexture.TEXTURE2, syGL.AttributeUniform.TEXTURE2],  //常规贴图 
            [ShaderUseVariantType.TEXTURE3]: [BuiltinTexture.TEXTURE3, syGL.AttributeUniform.TEXTURE3],  //常规贴图 
            [ShaderUseVariantType.TEXTURE4]: [BuiltinTexture.TEXTURE4, syGL.AttributeUniform.TEXTURE4],  //常规贴图 
            [ShaderUseVariantType.TEXTURE5]: [BuiltinTexture.TEXTURE5, syGL.AttributeUniform.TEXTURE5],  //常规贴图 
            [ShaderUseVariantType.TEXTURE6]: [BuiltinTexture.TEXTURE6, syGL.AttributeUniform.TEXTURE6],  //常规贴图 
            [ShaderUseVariantType.TEXTURE7]: [BuiltinTexture.TEXTURE7, syGL.AttributeUniform.TEXTURE7],  //常规贴图
            [ShaderUseVariantType.TEXTURE8]: [BuiltinTexture.TEXTURE8, syGL.AttributeUniform.TEXTURE8],  //常规贴图


            [ShaderUseVariantType.MAP_G_POSITION]: [BuiltinTexture.MAP_G_POSITION, syGL.AttributeUniform.MAP_G_POSITION],  //延迟渲染位置贴图
            [ShaderUseVariantType.MAP_G_NORMAL]: [BuiltinTexture.MAP_G_NORMAL, syGL.AttributeUniform.MAP_G_NORMAL],  //延迟渲染法线贴图
            [ShaderUseVariantType.MAP_G_COLOR]: [BuiltinTexture.MAP_G_COLOR, syGL.AttributeUniform.MAP_G_COLOR],  //延迟渲染颜色贴图
            [ShaderUseVariantType.MAP_G_UV]: [BuiltinTexture.MAP_G_UV, syGL.AttributeUniform.MAP_G_UV],  //延迟渲染uv贴图
            [ShaderUseVariantType.MAP_G_DEPTH]: [BuiltinTexture.MAP_G_DEPTH, syGL.AttributeUniform.MAP_G_DEPTH],  //延迟渲染深度贴图
            [ShaderUseVariantType.MAP_CUSTOM]: [BuiltinTexture.MAP_CUSTOM, syGL.AttributeUniform.MAP_CUSTOM],  //延迟渲染万能贴图

            [ShaderUseVariantType.MAP_SHADOW]: [BuiltinTexture.MAP_SHADOW, syGL.AttributeUniform.MAP_SHADOW],  //阴影贴图
            [ShaderUseVariantType.MAP_LIGHT]: [BuiltinTexture.MAP_LIGHT, syGL.AttributeUniform.MAP_LIGHT],   //光照贴图
            [ShaderUseVariantType.MAP_EMISSIVE]: [BuiltinTexture.MAP_EMISSIVE, syGL.AttributeUniform.MAP_EMISSIVE],//自发光贴图
            [ShaderUseVariantType.MAP_DIFFUSE]: [BuiltinTexture.MAP_DIFFUSE, syGL.AttributeUniform.MAP_DIFFUSE],//漫反射贴图
            [ShaderUseVariantType.MAP_NORMAL]: [BuiltinTexture.MAP_NORMAL, syGL.AttributeUniform.MAP_NORMAL],//法线贴图
            [ShaderUseVariantType.MAP_BUMP]: [BuiltinTexture.MAP_BUMP, syGL.AttributeUniform.MAP_BUMP],     //凹凸贴图
            // [ShaderUseVariantType.MAP_BUMP_SCALE]: [BuiltinTexture.MAP_BUMP_SCALE, syGL.AttributeUniform.MAP_BUMP_SCALE],   //凹凸贴图因子
            [ShaderUseVariantType.MAP_AMBIENT]: [BuiltinTexture.MAP_AMBIENT, syGL.AttributeUniform.MAP_AMBIENT],//环境贴图
            [ShaderUseVariantType.MAP_ALPHA]: [BuiltinTexture.MAP_ALPHA, syGL.AttributeUniform.MAP_ALPHA],     //alpha贴图
            [ShaderUseVariantType.MAP_SPECULAR]: [BuiltinTexture.MAP_SPECULAR, syGL.AttributeUniform.MAP_SPECULAR], //高光贴图
            [ShaderUseVariantType.MAP_JOINT]: [BuiltinTexture.MAP_JOINT, syGL.AttributeUniform.MAP_JOINT],   //骨骼贴图
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

        public push2DTexture(texture: WebGLTexture, builtTex: BuiltinTexture): void {
            this._texture2DGLIDMap.set(builtTex, texture);
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
                    case ShaderUseVariantType.POSITION:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.POSITION, this.primitive.position.glID, this.primitive.position.itemSize);
                        break;
                    case ShaderUseVariantType.NORMAL:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.NORMAL, this.primitive.normal.glID, this.primitive.normal.itemSize);
                        break;
                    case ShaderUseVariantType.TANGENT:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.TANGENT, this.primitive.tagent.glID, this.primitive.tagent.itemSize);
                        break;
                    case ShaderUseVariantType.TEXTURE_COORD0:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.TEXTURE_COORD0, this.primitive.uv.glID, this.primitive.uv.itemSize);
                        break;
                    case ShaderUseVariantType.CUBE_TEXTURE:
                        //立方体纹理数据
                        //-****-------------
                        _shader.setUseCubeTexture(this._textureCubeGLIDArray[0], useTextureAddres);
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
                    case ShaderUseVariantType.TONEMAPPINGExposure:
                        //色调映射 曝光级别
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.TONEMAPPINGExposure, 1.0);
                        break;
                    case ShaderUseVariantType.Custom_Float_Value:
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.CUSTOM_FLOAT_VALUE, this.primitive.customFloatValue);
                        break;
                    case ShaderUseVariantType.Resolution:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.RESOLUTION, [Device.Instance.width, Device.Instance.height, 0, 0]);
                        break;
                    case ShaderUseVariantType.Mouse:
                        var p = G_InputControl.getLastPressPos();
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.MOUSE, [p[0] == null ? 0 : p[0], p[1] == null ? 0 : p[1], 0, 0]);
                        break;
                    case ShaderUseVariantType.ShadowInfo:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.SHADOW_INFO, this.light.shadow.info);
                        break;
                    case ShaderUseVariantType.FloatArray:
                        _shader.setCustomUniformFloatArray(syGL.AttributeUniform.FLOAT_ARRAY, [0, 0, 0, 0, 0, 0, 0, 1])
                        break;
                    case ShaderUseVariantType.MAP_BUMP_SCALE:
                        //影响凹凸贴图的因子
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.MAP_BUMP_SCALE,(this.node as SY.SpriteBase).material.bumpScale);
                        break;
                    case ShaderUseVariantType.MAP_NORMAL_SCALE:
                        //影响法线贴图的因子
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.MAP_NORMAL_SCALE,(this.node as SY.SpriteBase).material.normalMapScale);
                        break;
                    case ShaderUseVariantType.MAP_SHADOW:
                        _shader.setUseBuiltinTexture(this.light.shadow.map, useTextureAddres, syGL.AttributeUniform.MAP_SHADOW);
                        useTextureAddres++;
                        break;
                    default:
                        if (QueueItemBaseData.BuiltinMorphTargetMap[value])
                        {
                            var st = QueueItemBaseData.BuiltinMorphTargetMap[value][0]
                            if(st<=7)
                            {
                                if(this.primitive.morphPositions[st])
                                _shader.setUseVertexAttribPointer(QueueItemBaseData.BuiltinMorphTargetMap[value][1], this.primitive.morphPositions[st].glID, this.primitive.morphPositions[st].itemSize);
                            }
                            else
                            {
                                _shader.setCustomUniformFloatArray(QueueItemBaseData.BuiltinMorphTargetMap[value][1], this.primitive.morphTargetInfluences) 
                            }
                        }
                        else if (QueueItemBaseData.BuiltinTextureMap[value]) {
                            _shader.setUseBuiltinTexture(this._texture2DGLIDMap.get(QueueItemBaseData.BuiltinTextureMap[value][0]), 
                            useTextureAddres, QueueItemBaseData.BuiltinTextureMap[value][1]);
                            useTextureAddres++;
                        }
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
            this.handleLight(shader.getGLID());
            this.updateShaderVariant(view, proj, shader);
        }
        
        /**
         * 处理光照
         */
        private handleLight(glID:WebGLProgram):void{
            
            var structNames: Map<string, any> = new Map();
            
            // //平行光
            // var dirNum = 0;
            // var preName = Light.Parallel.getPreStructName(dirNum);
            // structNames.clear();
            // structNames.set(Light.Parallel.structNames.direction, this.light.parallel.direction.toArray())
            // structNames.set(Light.Parallel.structNames.ambient, [0.05, 0.05, 0.05])
            // structNames.set(Light.Parallel.structNames.diffuse, this.light.parallel.color.toArray())
            // structNames.set(Light.Parallel.structNames.specular, [1.0, 1.0, 1.0])
            // structNames.forEach((value, index) => {
            //     var name = preName + index
            //     var loc = G_DrawEngine.getUniformLocation(glID, name);
            //     if (loc!=null) {
            //         if (value instanceof Array) {
            //             G_DrawEngine.setUniformFloatVec3(loc as number, value);
            //         }
            //         else {
            //             G_DrawEngine.setUniform1f(loc as number, value);
            //         }
            //     }
            // })

            // //点光
            // var pointNum = 0;
            // var preName = Light.Point.getPreStructName(pointNum);
            // structNames.clear();
            // structNames.set(Light.Point.structNames.position,  LightData.structValues.position)
            // structNames.set(Light.Point.structNames.ambient, [0.05, 0.05, 0.05])
            // structNames.set(Light.Point.structNames.diffuse,LightData.structValues.diffuse)
            // structNames.set(Light.Point.structNames.specular, [1.0, 1.0, 1.0])
            // structNames.set(Light.Point.structNames.constant, LightData.structValues.constant)
            // structNames.set(Light.Point.structNames.linear, LightData.structValues.linear)
            // structNames.set(Light.Point.structNames.quadratic,LightData.structValues.quadratic)
            // structNames.forEach((value, index) => {
            //     var name = preName + index
            //     var loc = G_DrawEngine.getUniformLocation(glID, name);
            //     if (loc!=null) {
            //         if (value instanceof Array) {
            //             G_DrawEngine.setUniformFloatVec3(loc as number, value);
            //         }
            //         else {
            //             G_DrawEngine.setUniform1f(loc as number, value);
            //         }
            //     }
            // })

            
            //聚光
            var lDatas = LightData.StructValuesArray;
            var spotNum = 0;
            lDatas.forEach((lData,k)=>{
                structNames.clear();
                var preName = Light.Spot.getPreStructName(spotNum);
                spotNum++;
                structNames.clear();
                structNames.set(Light.Spot.structNames.innerLimit, this.light.spot.innerLimit)
                structNames.set(Light.Spot.structNames.outerLimit, this.light.spot.outerLimit)
                structNames.set(Light.Spot.structNames.direction,lData.direction)
                structNames.set(Light.Spot.structNames.position, lData.position)
                structNames.set(Light.Spot.structNames.ambient, lData.ambient)
                structNames.set(Light.Spot.structNames.diffuse, lData.diffuse)
                structNames.set(Light.Spot.structNames.specular, lData.specular)
                structNames.set(Light.Spot.structNames.constant, lData.constant)
                structNames.set(Light.Spot.structNames.linear,lData.linear)
                structNames.set(Light.Spot.structNames.quadratic,lData.quadratic)
                structNames.forEach((value, index) => {
                    var name = preName + index
                    var loc = G_DrawEngine.getUniformLocation(glID, name);
                    if (loc!=null) {
                        if (value instanceof Array) {
                            G_DrawEngine.setUniformFloatVec3(loc as number, value);
                        }
                        else {
                            G_DrawEngine.setUniform1f(loc as number, value);
                        }
                    }
                })
            })
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