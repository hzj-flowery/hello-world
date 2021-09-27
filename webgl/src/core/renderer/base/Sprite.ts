
/**
 * 字节数组的使用
 * 整型：这个可以是一个字节Uint8Array,Int8Array,也可是双字节Uint16Array,Int16Array,
 * 也可是四字节Unit32Array,Int32Array
 * 浮点型：这个要四个字节，适用于float类型，例如Float32Array,当然也只有这一种类型
 * 双精度型：这个要八个字节，适用于double类型，例如Float64Array,当然也只有这一种类型
 * 
 * 使用
 *  // From a length
var float32 = new Float32Array(2);
float32[0] = 42;
console.log(float32[0]); // 42
console.log(float32.length); // 2
console.log(float32.BYTES_PER_ELEMENT); // 4

// From an array
var arr = new Float32Array([21,31]);
console.log(arr[1]); // 31

// From another TypedArray
var x = new Float32Array([21, 31]);
var y = new Float32Array(x);
console.log(y[0]); // 21

// From an ArrayBuffer
// var buffer = new ArrayBuffer(16);
var buffer = new ArrayBuffer(16);
// buffer[0] = 10;
// buffer[1] = 20;
// buffer[2] = 30;
// buffer[3] = 40;
// buffer[4] = 50;
var z = new Float32Array(buffer, 0, 4);
console.log(z);
// z.forEach(function(value,index,arr){
//     console.log(value,index,arr);
// })

 */

import Device from "../../Device";
import LoaderManager from "../../LoaderManager";
import { CameraData } from "../data/CameraData";
import { syRender } from "../data/RenderData";
import { G_ShaderFactory } from "../shader/ShaderFactory";
import { Node } from "./Node";
import { Texture, TextureOpts } from "./texture/Texture";
import { Texture2D } from "./texture/Texture2D";
import TextureCube from "./texture/TextureCube";
import TextureCustom from "./texture/TextureCustom";
import { glBaseBuffer, G_BufferManager, IndexsBuffer, VertColorBuffer, VertMatrixBuffer, NormalBuffer, UVsBuffer, VertexsBuffer } from "./buffer/BufferManager";
import enums from "../camera/enums";
import { G_ShaderCenter } from "../shader/ShaderCenter";
import { LightData } from "../data/LightData";
import { ShaderCode } from "../shader/ShaderCode";
import { syGL } from "../gfx/syGLEnums";
import { G_DrawEngine } from "./DrawEngine";
import { handler } from "../../../utils/handler";
import { G_TextureManager } from "./texture/TextureManager";
import { G_PassFactory } from "../shader/PassFactory";
import { Pass } from "../shader/Pass";
import { RenderTexture } from "./texture/RenderTexture";
import { glMatrix } from "../../math/Matrix";
import { glEnums } from "../gfx/GLapi";
import { StateString, StateValueMap } from "../gfx/State";
import { GameMainCamera } from "../camera/GameMainCamera";

/**
 * 显示节点
 * author:hzj
 */
export namespace SY {
    export enum GLID_TYPE {
        VERTEX = 1, //顶点
        INDEX,   //索引
        NORMAL, //法线
        UV,     //uv
        VERT_COLOR,  //顶点颜色
        VERT_MATRIX,//节点自定义矩阵
        TEXTURE_2D, //2D纹理
        TEXTURE_CUBE //立方体纹理
    }

    export enum SpriteSizeMode {
        /**
     * !#en Use the customized node size.
     * !#zh 使用节点预设的尺寸
     * @property {Number} CUSTOM
     */
        CUSTOM = 0,
        /**
         * !#en Match the trimmed size of the sprite frame automatically.
         * !#zh 自动适配为精灵裁剪后的尺寸
         * @property {Number} TRIMMED
         */
        TRIMMED,
        /**
         * !#en Match the raw size of the sprite frame automatically.
         * !#zh 自动适配为精灵原图尺寸
         * @property {Number} RAW
         */
        RAW
    }
    var materialId: number = 0;//材质id
    /**
     * 这个渲染类可以用于基础研究
     * 数据生成 绑定  
     */
    export class SpriteBase extends Node {
        //节点buffer
        private _vertexsBuffer: VertexsBuffer;
        //索引buffer
        private _indexsBuffer: IndexsBuffer;
        //法线buffer
        private _normalsBuffer: NormalBuffer;
        private _VertColorBuffer: VertColorBuffer;//节点自定义顶点颜色buffer
        private _vertMatrixBuffer: VertMatrixBuffer;//顶点矩阵buffer
        private _materialId: string;//这里存放一个材质id

        private _passContent: Array<any> = [];//pass的内容

        private _color: Array<number>;//节点自定义颜色
        private _diffuse: Array<number>;//漫反射颜色
        private _alpha: number = 1;//节点自定义透明度
        private _customMatrix: Float32Array = glMatrix.mat4.identity(null);//节点自定义矩阵
        //纹理buffer
        private _uvsBuffer: UVsBuffer;
        protected _texture: Texture;
        protected gl: WebGL2RenderingContext;
        private _pass: Array<Pass>;
        private _renderData: Array<syRender.QueueItemBaseData>;
        //参考glprimitive_type
        protected _sizeMode: SpriteSizeMode;//节点的尺寸模式
        public defineUse: syRender.DefineUse = new syRender.DefineUse(); //是否支持png 
        constructor() {
            super();
            materialId++;
            this._materialId = "materialId_" + materialId;
            this.gl = Device.Instance.gl;
            this._renderData = []
            this._color = [1.0, 1.0, 1.0, 1.0];//默认颜色为白色
            this._diffuse = [1.0, 1.0, 1.0, 1.0];//默认颜色为白色
            this._sizeMode = SpriteSizeMode.CUSTOM;//默认加载图片的尺寸大小为自定义
            this.init();
        }
        private init(): void {
            this.onInit();
        }

        public pushPassContent(shaderTy: syRender.ShaderType, stateArr?: Array<Array<any>>,customArr?:Array<Array<any>>,isForce?:boolean): void {

            var tag = syRender.ShaderTypeString[shaderTy]
            if (tag) {
                var state = null;
                if (stateArr && stateArr.length) {
                    state = []
                    for (let k = 0; k < stateArr.length; k++) {
                        state.push({ "key": stateArr[k][0], "value": stateArr[k][1] });
                    }
                }
                var custom = null;
                if (customArr && customArr.length) {
                    custom = []
                    for (let k = 0; k < customArr.length; k++) {
                        custom.push({ "key": customArr[k][0], "value": customArr[k][1] });
                    }
                }
                this._passContent.push({ "name": "TemplatePass", "tag": tag, state: state,custom:custom});
            }

            if(isForce)
            {
                this.handleShader();
            }
        };
        /**
         * 设置精灵图片的尺寸模式
         */
        public set sizeMode(mode: SpriteSizeMode) {
            this._sizeMode = mode;
        };
        protected onInit(): void {

        }
        /**
         * 节点被添加到父节点上
         */
        protected onEnter(): void {
            this.handleShader();
        }
        /**
         * 节点从父节点上移除
         */
        protected onEixt(): void {

        }
        protected onLoadShaderFinish(): void {
        }

        /**
         * 获取当前正在使用的shader
         */
        protected get baseProgram() {
            if(this._pass&&this._pass.length>0)
            {
                return this._pass[0].baseProgram;
            }
            else
            {
                console.error("当前还没创建pass")
            }
        }

        protected get program(){
            if(this._pass&&this._pass.length>0)
            {
                return this._pass[0].program;
            }
            else
            {
                console.error("当前还没创建pass")
            }
        }

        protected get pass(){
            return this._pass;
        }
        /**
         * 处理着色器
         */
        private handleShader() {
            this._pass = []
            let name = this.name;
            LoaderManager.instance.loadGlsl(name, (res) => {
                this._pass.push(G_PassFactory.createPass(res[0], res[1], res[2]));
            }, () => {
                this.onLoadShaderFinish();
            }, this._passContent);

        }
        //创建顶点缓冲
        /**
         * 
         * @param vertexs 
         * @param itemSize 
         * @param preAllocateLen 
         */
        public createVertexsBuffer(vertexs: Array<number>, itemSize: number, preAllocateLen: number = 0): VertexsBuffer {
            this._vertexsBuffer = G_BufferManager.createBuffer(GLID_TYPE.VERTEX,
                this._materialId, vertexs, itemSize, preAllocateLen) as VertexsBuffer;
            return this._vertexsBuffer;
        }
        //创建法线缓冲
        /**
         * 
         * @param normals 
         * @param itemSize 
         * @param preAllocateLen 
         */
        public createNormalsBuffer(normals: Array<number>, itemSize: number, preAllocateLen: number = 0): NormalBuffer {
            this._normalsBuffer = G_BufferManager.createBuffer(GLID_TYPE.NORMAL,
                this._materialId, normals, itemSize, preAllocateLen) as NormalBuffer;
            return this._normalsBuffer;
        }
        //创建索引缓冲
        //索引缓冲的单位数据个数肯定为1
        /**
         * 
         * @param indexs 
         */
        public createIndexsBuffer(indexs: Array<number>, preAllocateLen: number = 0): IndexsBuffer {
            this._indexsBuffer = G_BufferManager.createBuffer(GLID_TYPE.INDEX,
                this._materialId, indexs, 1, preAllocateLen) as IndexsBuffer;
            return this._indexsBuffer;
        }
        //创建uv缓冲
        /**
         * 
         * @param uvs 
         * @param itemSize 
         * @param preAllocateLen 
         */
        public createUVsBuffer(uvs: Array<number>, itemSize: number, preAllocateLen: number = 0): UVsBuffer {
            this._uvsBuffer = G_BufferManager.createBuffer(GLID_TYPE.UV,
                this._materialId, uvs, itemSize, preAllocateLen) as UVsBuffer;
            return this._uvsBuffer
        }
        //创建顶点自定义矩阵buffer
        /**
         * 
         * @param matrix 
         * @param itemSize 
         * @param preAllocateLen 
         */
        public createVertMatrixBuffer(matrix: Array<number>, itemSize: number, preAllocateLen: number = 0): VertMatrixBuffer {
            this._vertMatrixBuffer = G_BufferManager.createBuffer(GLID_TYPE.VERT_MATRIX, this._materialId, matrix, itemSize, preAllocateLen) as VertMatrixBuffer;
            return this._vertMatrixBuffer;
        }
        /** 
         * @param color 
         * @param itemSize 
         * @param preAllocateLen 
         */
        public createNodeVertColorBuffer(color: Array<number>, itemSize: number, preAllocateLen: number = 0): VertColorBuffer {
            this._VertColorBuffer = G_BufferManager.createBuffer(GLID_TYPE.VERT_COLOR, this._materialId, color, itemSize, preAllocateLen) as VertColorBuffer;
            return this._VertColorBuffer;
        }
        public createCustomMatrix(mat): void {
            this._customMatrix = mat;
        }

        /**
         * 设置节点颜色
         */
        public set color(color: Array<number>) {
            this._color[0] = color[0] != null ? color[0] : this._color[0];
            this._color[1] = color[1] != null ? color[1] : this._color[1];
            this._color[2] = color[2] != null ? color[2] : this._color[2];
            this._color[3] = color[3] != null ? color[3] : this._color[3];
        }
        /**
         * 设置慢反射颜色
         */
        public set diffuse(diffuse: Array<number>) {
            this._diffuse[0] = diffuse[0] != null ? diffuse[0] : this._diffuse[0];
            this._diffuse[1] = diffuse[1] != null ? diffuse[1] : this._diffuse[1];
            this._diffuse[2] = diffuse[2] != null ? diffuse[2] : this._diffuse[2];
            this._diffuse[3] = diffuse[3] != null ? diffuse[3] : this._diffuse[3];
        }
        /**
         * 设置节点的透明度
         */
        public set alpha(value: number) {
            this._alpha = value
        }
        /**
         * 获取节点透明度
         */
        public get alpha(): number {
            return this._alpha
        }
        public set spriteFrame(url: string | Array<string> | TextureOpts | Object) {
            this._texture = G_TextureManager.createTexture(url);
            this.onSetTextureUrl();
        }
        /**
         * 直接设置纹理
         */
        public set texture(tex: Texture) {
            if (this._texture == tex) {
                //纹理相同 无需重新设置
                return;
            }
            if (this._texture) {
                //之前存在纹理 需要将其销毁
                this._texture.destroy();
            }
            this._texture = tex;
            this.onSetTextureUrl();
        }
        /**
         * 设置完纹理之后调用
         */
        protected onSetTextureUrl(): void {

        }
        protected getGLID(type: GLID_TYPE): any {
            switch (type) {
                case GLID_TYPE.TEXTURE_2D: return this._texture ? this._texture.glID : -1;
                case GLID_TYPE.TEXTURE_CUBE: return this._texture ? this._texture.glID : -1;
                default: var buffer = this.getBuffer(type); return buffer ? buffer.glID : -1;
            }
        }
        /**
         * 获取顶点数据的buffer
         * @param type 
         */
        public getBuffer(type: GLID_TYPE): glBaseBuffer {
            switch (type) {
                case GLID_TYPE.INDEX: return this._indexsBuffer;
                case GLID_TYPE.UV: return this._uvsBuffer;
                case GLID_TYPE.NORMAL: return this._normalsBuffer;
                case GLID_TYPE.VERTEX:return this._vertexsBuffer;
                case GLID_TYPE.VERT_COLOR: return this._VertColorBuffer;
                case GLID_TYPE.VERT_MATRIX: return this._vertMatrixBuffer;
                default: return null;//未知
            }
        }
        protected getBufferItemSize(type: GLID_TYPE): number {
            var buffer = this.getBuffer(type);
            return buffer ? buffer.itemSize : -1
        }
        //采集数据以后的行为
        protected onCollectRenderDataAfter(data: syRender.QueueItemBaseData) {

        }
        //采集数据之前的行为
        protected onCollectRenderDataBefore() {

        }
        /**
         * 
         * @param texture 纹理的GLID
         */
        protected collectRenderData(time: number): void {
            if (this._texture && this._texture.loaded == false) {
                //说明使用了纹理 但纹理还没有被加载完成
                return;
            }
            this.onCollectRenderDataBefore();
            if (!this._pass || this._pass.length == 0) {
                //一次渲染shader是必不可少的
                return
            }
            for (let i = 0; i < this._pass.length; i++) {
                let pass = this._pass[i];
                if (!pass) {
                    continue;
                }
                if (!this._renderData[i]) {
                    this._renderData.push(syRender.DataPool.get(syRender.QueueItemType.Base));
                }
                this._renderData[i].node = this as Node;
                this._renderData[i].pass = pass;
                this._renderData[i].time = time;
               
                this.updateRenderData(this._renderData[i]);
                this.onCollectRenderDataAfter(this._renderData[i])
                Device.Instance.collectData(this._renderData[i]);
            }
        }
        private updateRenderData(rData: syRender.QueueItemBaseData): void {
            //顶点组----------------------------------------------------------------------
            rData.primitive.vert.glID = this.getGLID(SY.GLID_TYPE.VERTEX);
            rData.primitive.vert.itemSize = this.getBufferItemSize(SY.GLID_TYPE.VERTEX);
            rData.primitive.vert.itemNums = this.getBuffer(SY.GLID_TYPE.VERTEX).itemNums;
            //索引组----------------------------------------------------------------------
            rData.primitive.index.glID = this.getGLID(SY.GLID_TYPE.INDEX);
            if (rData.primitive.index.glID != -1) {
                rData.primitive.index.itemSize = this.getBuffer(SY.GLID_TYPE.INDEX).itemSize;
                rData.primitive.index.itemNums = this.getBuffer(SY.GLID_TYPE.INDEX).itemNums;
            }
            //uv组-------------------------------------------------------------------------
            rData.primitive.uv.glID = this.getGLID(SY.GLID_TYPE.UV);
            rData.primitive.uv.itemSize = this.getBufferItemSize(SY.GLID_TYPE.UV);
            //法线组-----------------------------------------------------------------------
            rData.primitive.normal.glID = this.getGLID(SY.GLID_TYPE.NORMAL);
            rData.primitive.normal.itemSize = this.getBufferItemSize(SY.GLID_TYPE.NORMAL);

            //节点自定义顶点颜色组----------------------------------------------------------
            rData.primitive.nodeVertColor.glID = this.getGLID(SY.GLID_TYPE.VERT_COLOR);
            if (rData.primitive.nodeVertColor.glID != -1) {
                rData.primitive.nodeVertColor.itemSize = this.getBuffer(SY.GLID_TYPE.VERT_COLOR).itemSize;
                rData.primitive.nodeVertColor.itemNums = this.getBuffer(SY.GLID_TYPE.VERT_COLOR).itemNums;
            }

            //节点的颜色
            rData.primitive.color = this._color;
            //漫反射颜色
            rData.primitive.diffuse = this._diffuse;
            //节点的透明度
            rData.primitive.alpha = this._alpha;
            //自定义的矩阵
            rData.primitive.customMatrix = this._customMatrix;

            //宏-------------------------------------------------------------------------------------
            //是否支持png的使用
            rData.defineUse.SY_USE_ALPHA_TEST = (this.defineUse.SY_USE_ALPHA_TEST)
            rData.defineUse.SY_USE_MAT = (this.defineUse.SY_USE_MAT)

            //节点自定义矩阵组------------------------------------------------------------------------
            rData.primitive.vertMatrix.glID = this.getGLID(SY.GLID_TYPE.VERT_MATRIX);
            if (rData.primitive.vertMatrix.glID != -1) {
                rData.primitive.vertMatrix.itemSize = this.getBuffer(SY.GLID_TYPE.VERT_MATRIX).itemSize;
                rData.primitive.vertMatrix.itemNums = this.getBuffer(SY.GLID_TYPE.VERT_MATRIX).itemNums;
            }
            rData.primitive.modelMatrix = this.modelMatrix;
            if (this._texture instanceof RenderTexture && (this._texture as RenderTexture).isDeferred()) {
                syRender.DeferredAllTypeTexture.forEach((value, index) => {
                    var texS = (this._texture as RenderTexture).getDeferredTex(value);
                    texS ? rData.push2DTexture(texS, value) : null;
                })
            }
            else if(rData.pass.shaderType == syRender.ShaderType.RTT_Use)
            {
                //mrt
                var mrtTex = GameMainCamera.instance.getRenderTexture(syRender.RenderTextureUUid.RTT)
                syRender.DeferredAllTypeTexture.forEach((value, index) => {
                    var texS = mrtTex.getDeferredTex(value);
                    texS ? rData.push2DTexture(texS, value) : null;
                })
            }
            else if (this._texture && this._texture.glID) {
                if (this._texture.isTexture2D)
                    rData.push2DTexture(this.getGLID(SY.GLID_TYPE.TEXTURE_2D));
                else if (this._texture.isTextureCube)
                    rData.pushCubeTexture(this.getGLID(SY.GLID_TYPE.TEXTURE_CUBE));
            }
            rData.primitive.type = rData.pass.state.primitiveType;
        }
        public get texture(): Texture {
            return this._texture;
        }
        public destroy(): void {
            this._texture.destroy();
        }
    }
    /**
     * 阴影
     */
    export class ShadowSprite extends SpriteBase {
        constructor() {
            super();
            this._customTempMatrix = glMatrix.mat4.identity(null);
            this._tempMatrix = glMatrix.mat4.identity(null);
        }
        private _customTempMatrix: Float32Array;
        private _tempMatrix: Float32Array;

        protected onInit(): void {
            this.pushPassContent(syRender.ShaderType.ShadowMap);
            this.pushPassContent(syRender.ShaderType.Shadow);
        }
        protected collectRenderData(time: number) {
            glMatrix.mat4.copy(this._tempMatrix, this._customTempMatrix)
            this.createCustomMatrix(this._tempMatrix);
            super.collectRenderData(time)
        }
        /**
         * 更新pv矩阵
         * @param proj 
         * @param view 
         */
        public onBindGPUBufferDataBefore(rd: syRender.QueueItemBaseData, proj: Float32Array, view: Float32Array): void {
            glMatrix.mat4.copy(this._customTempMatrix, rd.light.projectionMatrix);
            glMatrix.mat4.multiply(this._customTempMatrix, this._customTempMatrix, glMatrix.mat4.invert(null, rd.light.viewMatrix));
        }
    }
    /**
     * 多边形
     * 可以画线
     * 可以画点
     */
    export class SpriteBasePolygon extends SY.SpriteBase {
        constructor() {
            super();
        }
        private _polygon: Float32Array;//点坐标{x,y,z}
        public updatePositionData(posArr: Array<number>, isClear: boolean = true) {
            if (!posArr || posArr.length < 3) {
                if (this.is2DNode()) {
                    this.check();
                    this.updateScreenPosition(posArr, isClear)
                }
                return;
            }
            this.check();
            if (this.is2DNode()) {
                this.updateScreenPosition(posArr, isClear)
            }
            else if (this.is3DNode()) {
                this._polygon = new Float32Array(posArr);
                this.getBuffer(SY.GLID_TYPE.VERTEX).updateSubData(this._polygon);
            }
        }
        private updateScreenPosition(data: Array<any>, isClear: boolean = true): void {
            if ((!data || data.length == 0) && isClear == false) {
                return;
            }
            var clipPos: Array<number> = [];
            var z = -1;
            for (var k = 0; k < data.length; k++) {
                var temp = this.convertScreenSpaceToClipSpace(data[k].x, data[k].y);
                clipPos.push(temp[0]);
                clipPos.push(temp[1]);
                clipPos.push(z);
            }

            this._polygon = new Float32Array(clipPos);
            this.getBuffer(SY.GLID_TYPE.VERTEX).updateSubData(this._polygon);
        }
        private check(): void {
            if (!this._polygon) {
                this.createVertexsBuffer([], 3, 10);
            }
        }
        protected collectRenderData(time): void {
            if (!this._polygon || this._polygon.length < 3) return;
            super.collectRenderData(time);
        }
    }


    //2d显示节点
    /**lt(3)    rt(2)
     * ************
     * *          *
     * *          *
     * *          *
     * *          *
     * ************
     * lb(0)    rb(1) 
     * 
     * gl.TRIANGLES:表示以正常的三角形顺序进行绘制
     * 1：我们可以发送六个点给GPU,GPU就会按照给定点的顺序，每三个一组进行绘制
     * 注意每三个一组点的顺序非常重要，到底是顺时针还是逆时针，在执行剔除的时候，会决定是否剔除
     * (0,1,2)==>代表逆时针，（0,3,2）==>代表顺时针，而GPU那边默认剔除面的规则是顺时针是背面，逆时针是正面
     * 如果我们开启剔除，然后选择剔除的面是背面，那这个2d图片就只可以看到右下半部分这个三角形，左上半部分这个三角形被剔除了
     * 
     * 注意到上面是发六个顶点，每个顶点又有三个坐标（x,y,z）组成，如果每个坐标都是float,那每个坐标又是占4个字节，这里占的内存也是需要考虑的
     * 介于此,可以使用下面的方法
     * 2：如果我们要画一个四边形，我们只需要给GPU发送四个顶点就可以了，其本质上就是两个三角形拼接而成，然后再发送绘制索引，就好了，GPU会像发送顶点一样来找，三个三个取
     * 一个模型的顶点数是有限的，一般一个字节就足以了，当有很多三角形需要绘制的时候，这样可以省去不少内存
     * 
     * 总结：使用三角形绘制，不管是发送全部三角形的顶点数组，还是发送所有顶点的数组+所有三角形的索引数组，其绘制的规律一律是，三个三个取，最后面几个点如果不是3的倍数，则直接丢弃
     * 
     * gl.TRIANGLE_STRIP:三角形带绘制，
     * 发往GPU的数组：（0，1，2，3，4，5，6，7，8，9，....）
     * 这个数组的信息可以是纯粹的顶点，也可以是顶点+索引
     * 目前发现的规律是，从顶点数组或者索引数组中，先取三个顶点组成第一个三角形（0,1,2）,再从数组中取两个组成第三个三角形（2，3，4），
     * 再从数组中取两个组成第三个三角形（4，5，6），依次往下找
     * 
     * gl.LINES:表示画线，每次从数组中取出两个顶点，依次往下取
     * gl.LINES_STRIP:表示画线管带，第一次从数组中取出两个顶点组成一条线，后面依次取出一个点与上一次取出的最后一个点组成一条线
     *       
     * 凡继承此类的显示节点，则默认会干以下几件事
     * 1：根据尺寸，创建四个顶点坐标 组成一个顶点数组传送到GPU中
     * 2：根据四个顶点坐标的索引来画两个三角形刚好可以组成一个四边形，这些索引就组成了一个索引数组发往GPU中
     * 3：传四个顶点的UV坐标到GPU的显存中
     */
    export class Sprite2D extends SpriteBase {
        private _lt: Array<number> = [];//左上
        private _lb: Array<number> = [];//左下
        private _rt: Array<number> = [];//右上
        private _rb: Array<number> = [];//右下
        private _mask:Mask2D;//遮罩
        constructor() {
            super();
            this._node__type = syRender.NodeType.D2;
            this._sizeMode = SpriteSizeMode.RAW;
        }
        protected isUnpackY:boolean = false;
        private updateUV(): void {
            //uv 数据
            var texCoordinates_uv = [
                0.0,1.0, //v0
                1.0,1.0, //v1
                1.0,0.0, //v2    //标准的uv坐标 左上角为原点 
                0.0,0.0  //v3
            ];

            var texCoordinates_webgl = [
                0.0, 0.0, //v1
                1.0, 0.0, //v2       //webgl坐标 左下脚为原点
                1.0, 1.0, //v3
                0.0, 1.0, //v0
            ];

            this.createUVsBuffer(this.isUnpackY?texCoordinates_webgl:texCoordinates_uv, 2);
            // 索引数据
            var floorVertexIndices = [0, 1, 2, 3, 0];
            this.createIndexsBuffer(floorVertexIndices);

        }

        protected onSetTextureUrl(): void {
            if (this._texture)
                (this._texture as Texture2D).textureOnLoad = this.onTextureLoaded.bind(this);
        }

        /**
        * 加载纹理之后调用
        */
        public onTextureLoaded(image: HTMLImageElement): void {
            if (image) {
                if (this._sizeMode == SpriteSizeMode.RAW) {
                    this.setContentSize(image.width, image.height);
                }
            }
        }

        /**
        *
        * @param width
        * @param height
        */
        public setContentSize(width: number, height: number): void {
            this.width = width;
            this.height = height;

            var clipW = this.width / Device.Instance.width;
            var clipH = this.height / Device.Instance.height;

            var z = -1;

            //[-1,1] = >[0,1]
            var w = 2 * clipW;
            var h = 2 * clipH;

            this._lb = [];
            this._lb.push(-this.anchorX * w);
            this._lb.push(-this.anchorY * h);
            this._lb.push(z);                    //左下

            this._rb = [];
            this._rb.push(w - this.anchorX * w);  //右下
            this._rb.push(-this.anchorY * h);
            this._rb.push(z);

            this._rt = [];
            this._rt.push(w - this.anchorX * w); //右上
            this._rt.push(h - this.anchorY * h);
            this._rt.push(z);

            this._lt = [];
            this._lt.push(-this.anchorX * w);
            this._lt.push(h - this.anchorY * h);  //左上
            this._lt.push(z)


            var pos = [].concat(this._lb, this._rb, this._rt, this._lt);
            this.createVertexsBuffer(pos, 3);
            this.updateUV();
        }

        public set mask(mk)
        {
            this._mask = mk;
        }
    }

    /**
     * mask
     */
    export class Mask2D extends Sprite2D {
        constructor() {
            super();
        }
        protected onInit(){
            super.onInit()
            this.defineUse.SY_USE_ALPHA_TEST = 0.1;

            this.pushPassContent(syRender.ShaderType.Sprite, [
                //深度 
                [StateString.depthTest,StateValueMap.depthTest.ON],
                [StateString.depthFunc,StateValueMap.depthFunc.LEQUAL],
                [StateString.depthWrite,StateValueMap.depthWrite.ON],
                
                [StateString.blendColorMask,syRender.ColorMask.NONE],
    
                [StateString.stencilTest,StateValueMap.stencilTest.ON],
                [StateString.stencilSep,StateValueMap.stencilSep.OFF],
                [StateString.stencilFunc,StateValueMap.stencilFunc.ALWAYS],
                [StateString.stencilRef,10],
                [StateString.stencilMask,0xffff],
                [StateString.stencilFailOp,StateValueMap.stencilFailOp.KEEP],
                [StateString.stencilZFailOp,StateValueMap.stencilZFailOp.KEEP],
                [StateString.stencilZPassOp,StateValueMap.stencilZPassOp.REPLACE],
    
    
                // [StateString.stencilTestFront,StateValueMap.stencilTestFront.ON],
                // [StateString.stencilFuncFront,StateValueMap.stencilFuncFront.ALWAYS],
                // [StateString.stencilRefFront,3],
                // [StateString.stencilMaskFront,0xffff],
                // [StateString.stencilFailOpFront,StateValueMap.stencilFailOpFront.KEEP],
                // [StateString.stencilZFailOpFront,StateValueMap.stencilZFailOpFront.KEEP],
                // [StateString.stencilZPassOpFront,StateValueMap.stencilZPassOpFront.REPLACE],
            ])
        }
    }



    /**
     * 实例化绘制
     * 假设我们在界面上需要绘制1000个三角形，这些三角形大小都是一样的
     * 只是位置和颜色不同，那么就可以考虑使用实例化绘制
     * 首先把顶点数据发送给GPU，
     * 那么位置不同其实也就是空间坐标系不同，可以做一个矩阵来单独发送给GPU
     * 颜色不同，也就多发一个颜色属性给GPU
     * 有多少个实例三角形就需要发送多少个矩阵和颜色属性
     * 在GPU端，只需要开启一次draw就可以绘制多个三角形了
     * 在GPU端的数据是这样的
     * 【a,b,c】:这是三角形的顶点数据，只有一份哦
     * 【mat1,mat2,mat3,...】:这是实例化的矩阵数组，有多少个实例化，就有多少个矩阵
     * 【color1，color2,...】:这是实力化的颜色，有多少个实例化，就有多少个颜色
     *  启用这个drawArraysInstanced方法以后，GPU就拿着上面顶点数据，沿着实例化的个数，逐一从上面取数组中的item来进行绘制
     * 
     */
    export class Sprite2DInstance extends SY.Sprite2D {
        constructor() {
            super();
        }
        /**
         * 实例化的数目
         */
        private _numInstances: number;
        /**
         * 单个实例的顶点数目
         */
        private _InstanceVertNums: number;
        protected onInit(): void {
            this.pushPassContent(syRender.ShaderType.Instantiate)
            this._divisorNameData = new Map();
            this._divisorLocData = new Map();
        }
        private _divisorNameData: Map<string, boolean>;
        private _divisorLocData: Map<number, boolean>;
        public pushDivisor(name: string, isMatrix: boolean): void {
            if (this._divisorNameData.has(name) == false)
                this._divisorNameData.set(name, isMatrix);
        }
        protected set InstanceVertNums(nums: number) {
            this._InstanceVertNums = nums;
        }
        protected get InstanceVertNums(): number {
            return this._InstanceVertNums;
        }
        protected set numInstances(nums: number) {
            this._numInstances = nums;
        }
        protected get numInstances(): number {
            return this._numInstances;
        }
        protected onLoadShaderFinish() {
            this._divisorNameData.forEach((value, key) => {
                let loc = this.baseProgram.getCustomAttributeLocation(key);
                this._divisorLocData.set(loc, value)
            })
        }
        protected onCollectRenderDataAfter(renderData: syRender.QueueItemBaseData): void {
            renderData.primitive.instancedNums = this._numInstances
            renderData.primitive.instancedVertNums = this._InstanceVertNums
        }
        public onDrawBefore(time: number) {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.vertexAttribDivisor(key, 1, true);
                else
                    G_DrawEngine.vertexAttribDivisor(key);
            })
        }
        public onDrawAfter(): void {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.disableVertexAttribArrayDivisor(key, true);
                else
                    G_DrawEngine.disableVertexAttribArrayDivisor(key);
            })
        }

    }


    export class Sprite3DInstance extends SY.SpriteBase {
        constructor() {
            super();
        }
        /**
         * 实例化的数目
         */
        private _numInstances: number;
        /**
         * 单个实例的顶点数目
         */
        private _InstanceVertNums: number;
        protected onInit(): void {

            this._divisorNameData = new Map();
            this._divisorLocData = new Map();
            this.pushPassContent(syRender.ShaderType.Instantiate)
        }
        private _divisorNameData: Map<string, boolean>;
        private _divisorLocData: Map<number, boolean>;
        public pushDivisor(name: string, isMatrix: boolean): void {
            if (this._divisorNameData.has(name) == false)
                this._divisorNameData.set(name, isMatrix);
        }
        protected set InstanceVertNums(nums: number) {
            this._InstanceVertNums = nums;
        }
        protected get InstanceVertNums(): number {
            return this._InstanceVertNums;
        }
        protected set numInstances(nums: number) {
            this._numInstances = nums;
        }
        protected get numInstances(): number {
            return this._numInstances;
        }
        protected onLoadShaderFinish() {
            this._divisorNameData.forEach((value, key) => {
                let loc = this.baseProgram.getCustomAttributeLocation(key);
                this._divisorLocData.set(loc, value)
            })
        }
        protected onCollectRenderDataAfter(renderData: syRender.QueueItemBaseData): void {
            renderData.primitive.instancedNums = this._numInstances
            renderData.primitive.instancedVertNums = this._InstanceVertNums
        }
        public onDrawBefore(time: number) {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.vertexAttribDivisor(key, 1, true);
                else
                    G_DrawEngine.vertexAttribDivisor(key);
            })
        }
        public onDrawAfter(): void {
            this._divisorLocData.forEach((value, key) => {
                if (value)
                    G_DrawEngine.disableVertexAttribArrayDivisor(key, true);
                else
                    G_DrawEngine.disableVertexAttribArrayDivisor(key);
            })
        }

    }


}