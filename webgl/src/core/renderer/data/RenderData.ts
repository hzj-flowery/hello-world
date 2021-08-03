import { isThisTypeNode } from "typescript";
import Device from "../../Device";
import { G_InputControl } from "../../InputControl";
import { glMatrix } from "../../math/Matrix";
import { MathUtils } from "../../utils/MathUtils";
import { Node } from "../base/Node";
import { glEnums } from "../gfx/GLapi";
import State from "../gfx/State";
import { syGL } from "../gfx/syGLEnums";
import { Pass } from "../shader/Pass";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";
import { ShaderUseVariantType } from "../shader/ShaderUseVariantType";


let renderDataId: number = 0;
export namespace syRender {


    /**
     * 模板通道tag
     */
    export enum TemplatePassTag {
        Normal = 1,    //普通,表示该pass没有关联任何的模板pass
        Depth,       //深度pass
    }

    export enum CameraUUid {
        min = 0,
        base2D,
        base3D,
        Deferred,//用于延迟渲染
        Depth, //用于深度纹理
        normal1,
        normal2,
        normal3,
        normal4,
        normal5,
        normal6,
        normal7,
        normal8,
        normal9,
        light,//光照摄像机
        max
    }

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

        /**
 * 光照的基础数据
 */
        export class BaseData {
            constructor() {

            }
            private _colR: number = 0;
            private _colG: number = 0;
            private _colB: number = 0;
            private _colA: number = 1.0;//透明通道
            public get colR(): number { return this._colR };
            public set colR(p: number) { this._colR = p };
            public get colG(): number { return this._colG };
            public set colG(p: number) { this._colG = p };
            public get colB(): number { return this._colB };
            public set colB(p: number) { this._colB = p };
            public get colA(): number { return this._colA };
            public set colA(p: number) { this._colA = p };
            public get color(): Array<number> {
                return [this._colR, this._colG, this._colB, this._colA];
            }
            public set color(p: Array<number>) {
                this.colR = p[0] != null ? p[0] : this._colR;
                this.colG = p[1] != null ? p[1] : this._colG;
                this.colB = p[2] != null ? p[2] : this._colB;
                this.colA = p[3] != null ? p[3] : this._colA;
            }
            private _posX: number = 0;
            private _posY: number = 0;
            private _posZ: number = 0;
            public get posX(): number { return this._posX };
            public set posX(p: number) { this._posX = p };
            public get posY(): number { return this._posY };
            public set posY(p: number) { this._posY = p };
            public get posZ(): number { return this._posZ };
            public set posZ(p: number) { this._posZ = p };
            public get position(): Array<number> {
                return [this._posX, this._posY, this._posZ];
            }
            public set position(p: Array<number>) {
                this.posX = p[0] != null ? p[0] : this._posX;
                this.posY = p[1] != null ? p[1] : this._posY;
                this.posZ = p[2] != null ? p[2] : this._posZ;
            }
            private _dirX: number = 0;
            private _dirY: number = 0;
            private _dirZ: number = 0;
            public get dirX(): number { return this._dirX };
            public set dirX(p: number) { this._dirX = p };
            public get dirY(): number { return this._dirY };
            public set dirY(p: number) { this._dirY = p };
            public get dirZ(): number { return this._dirZ };
            public set dirZ(p: number) { this._dirZ = p };
            public get direction(): Array<number> {
                return [this._dirX, this._dirY, this._dirZ];
            }
            public set direction(p: Array<number>) {
                this.dirX = p[0] != null ? p[0] : this._dirX;
                this.dirY = p[1] != null ? p[1] : this._dirY;
                this.dirZ = p[2] != null ? p[2] : this._dirZ;
            }
            public reset(): void {
                this.color = [1, 0, 0, 1]; //默认的颜色
                this.direction = [1, 1, 1]; //默认的方向
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

            public viewMatrix: Float32Array;//光照摄像机的视口
            public projectionMatrix: Float32Array;//光照摄像机的投影

            //阴影贴图
            private _shadowBias: number = 0.005; //阴影贴图的马赫带
            private _shadowSize: number = 1 / 1024;//阴影的像素尺寸 值越小 阴影越逼真
            private _shadowOpacity: number = 0.1; //阴影的alpha值 值越小暗度越深
            private _shadowMin: number = 0;       //阴影最小值
            public get shadowBias(): number { return this._shadowBias };
            public set shadowBias(p: number) { this._shadowBias = p };
            public get shadowSize(): number { return this._shadowSize };
            public set shadowSize(p: number) { this._shadowSize = p };
            public get shadowOpacity(): number { return this._shadowOpacity };
            public set shadowOpacity(p: number) { this._shadowOpacity = p };
            public get shadowMin(): number { return this._shadowMin };
            public set shadowMin(p: number) { this._shadowMin = p };
            public get shadowInfo() {
                return [this._shadowBias, this._shadowSize, this._shadowMin, this._shadowOpacity]
            }

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

        public get drawingOrder() {
            if (this._pass) return this._pass.drawingOrder;
            return syRender.DrawingOrder.Normal;
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
                    case ShaderUseVariantType.Position:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.POSITION, this.primitive.vert.glID, this.primitive.vert.itemSize);
                        break;
                    case ShaderUseVariantType.Normal:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.NORMAL, this.primitive.normal.glID, this.primitive.normal.itemSize);
                        break;
                    case ShaderUseVariantType.UVs:
                        _shader.setUseVertexAttribPointer(syGL.AttributeUniform.UV, this.primitive.uv.glID, this.primitive.uv.itemSize);
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
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.CameraWorldPosition, this._cameraPosition);
                        break;
                    case ShaderUseVariantType.LightWorldPosition:
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LightWorldPosition, this.light.position);
                        break;
                    case ShaderUseVariantType.SpecularLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_SPECULAR, this.light.specular.color)
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.LIGHT_SPECULAR_SHININESS, this.light.specular.shininess)
                        break;
                    case ShaderUseVariantType.AmbientLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_AMBIENT, this.light.ambient.color);
                        break;
                    case ShaderUseVariantType.PointLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_POINT, this.light.point.color);
                        break;
                    //平行光
                    case ShaderUseVariantType.ParallelLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_PARALLEL, this.light.parallel.color)
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LIGHT_PARALLEL_DIR, this.light.parallel.direction)
                        break;
                    //聚光灯
                    case ShaderUseVariantType.SpotLight:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.LIGHT_SPOT, this.light.spot.color);
                        _shader.setCustomUniformFloatVec3(syGL.AttributeUniform.LIGHT_SPOT_DIRECTION, this.light.spot.direction)
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.LIGHT_SPOT_INNER_LIMIT, this.light.spot.innerLimit)
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.LIGHT_SPOT_OUTER_LIMIT, this.light.spot.outerLimit);
                        break;
                    case ShaderUseVariantType.Fog:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.FOG_COLOR, this.light.fog.color);
                        _shader.setCustomUniformFloat(syGL.AttributeUniform.FOG_DENSITY, this.light.fog.density);
                        break;
                    case ShaderUseVariantType.Color:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.COLOR, this.primitive.color);
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
                    case ShaderUseVariantType.Resolution:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.RESOLUTION, [Device.Instance.width, Device.Instance.height, 0, 0]);
                        break;
                    case ShaderUseVariantType.Mouse:
                        var p = G_InputControl.getLastPressPos();
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.MOUSE, [p[0], p[1], 0, 0]);
                        break;
                    case ShaderUseVariantType.ShadowInfo:
                        _shader.setCustomUniformFloatVec4(syGL.AttributeUniform.SHADOW_INFO, this.light.shadowInfo);
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