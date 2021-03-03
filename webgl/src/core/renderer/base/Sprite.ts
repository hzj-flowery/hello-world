
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
import { RenderTexture } from "./texture/RenderTexture";
import { CameraData } from "../data/CameraData";
import { NormalRenderData, RenderData, RenderDataPool, RenderDataType } from "../data/RenderData";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";
import { G_ShaderFactory } from "../shader/ShaderFactory";
import { Node } from "./Node";
import { Texture, TextureOpts } from "./texture/Texture";
import { Texture2D } from "./texture/Texture2D";
import TextureCube from "./texture/TextureCube";
import TextureCustom from "./texture/TextureCustom";
import { glBaseBuffer, G_BufferManager, IndexsBuffer, VertColorBuffer, VertMatrixBuffer, NormalBuffer, UVsBuffer, VertexsBuffer } from "./buffer/BufferManager";
import enums from "../camera/enums";
import { G_ShaderCenter, ShaderType } from "../shader/ShaderCenter";
import { LightData } from "../data/LightData";
import { ShaderCode } from "../shader/ShaderCode";
import { syGL } from "../gfx/syGLEnums";
import { G_DrawEngine } from "./DrawEngine";
import { handler } from "../../../utils/handler";

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

        private _color: Array<number>;//节点自定义颜色
        private _customMatrix: Float32Array;//节点自定义矩阵
        //纹理buffer
        private _uvsBuffer: UVsBuffer;
        protected _texture: Texture;
        protected gl: WebGL2RenderingContext;
        protected _shader: Shader;
        protected _renderData: RenderData;
        //参考glprimitive_type
        protected _glPrimitiveType: syGL.PrimitiveType;//绘制的类型
        protected _cameraType: number = 0;//相机的类型(0表示透视1表示正交)
        private _vertStr: string = "";
        private _fragStr: string = "";
        protected _sizeMode:SpriteSizeMode;//节点的尺寸模式
        private _url: string;//资源路径
        constructor() {
            super();
            materialId++;
            this._materialId = "materialId_" + materialId;
            this.gl = Device.Instance.gl;
            this._glPrimitiveType = syGL.PrimitiveType.TRIANGLES;
            this._renderData = RenderDataPool.get(RenderDataType.Base);
            this._color = [1.0, 1.0, 1.0, 1.0];//默认颜色为白色

            this._sizeMode = SpriteSizeMode.CUSTOM;//默认加载图片的尺寸大小为自定义

            this.init();
        }
        private init(): void {
            this.onInit();
            this.handleShader();
        }
        public set shaderVert(vert: string) {
            this._vertStr = vert;
        }
        public set shaderFrag(frag: string) {
            this._fragStr = frag;
        }
        
        /**
         * 设置精灵图片的尺寸模式
         */
        public set sizeMode(mode:SpriteSizeMode){
             this._sizeMode = mode;
        }
        protected onInit(): void {

        }
        protected onShader():void{

        }
        /**
         * 处理着色器
         */
        private handleShader() {
            if(this._vertStr==""||this._fragStr=="")
            {
                LoaderManager.instance.loadGlsl(this.name,(res)=>{
                    this._vertStr = res[0];
                    this._fragStr = res[1];
                    this._shader = G_ShaderCenter.createShader(ShaderType.Custom, this._vertStr, this._fragStr);
                    this.onShader();
                });
            }
            else
            {
                this._shader = G_ShaderCenter.createShader(ShaderType.Custom, this._vertStr, this._fragStr);
                this.onShader();
            }
            
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
        //创建一个纹理buffer
        private createTexture2DBuffer(url: string): Texture {
            this._texture = new Texture2D();
            (this._texture as Texture2D).url = url;
            return this._texture
        }
        private createTextureCubeBuffer(arr: Array<string>): Texture {
            this._texture = new TextureCube();
            (this._texture as TextureCube).url = arr;
            return this._texture;
        }
        private createCustomTextureBuffer(data: TextureOpts): Texture {
            this._texture = new TextureCustom();
            (this._texture as TextureCustom).url = data;
            return this._texture;
        }


        /**
         * 创建一个渲染纹理
         * @param data {type,place,width,height}
         */
        private createRenderTextureBuffer(data: any): Texture {
            this._texture = new RenderTexture();
            (this._texture as RenderTexture).attach(data.place, data.width, data.height);
            return this._texture;
        }
        public set spriteFrame(url: string | Array<string> | TextureOpts | Object) {
            //普通图片
            if (typeof url == "string") {
                this.createTexture2DBuffer(url);
            }
            //天空盒
            else if (url instanceof Array && url.length == 6) {
                this.createTextureCubeBuffer(url);
            }
            //自定义纹理
            else if (url instanceof TextureOpts) {
                console.log("自定义纹理------", url);
                this.createCustomTextureBuffer(url);
            }
            else if (url instanceof Object && url["type"] == "RenderTexture") {
                this.createRenderTextureBuffer(url);
            }
            
            this.onSetTextureUrl();

        }
        /**
         * 设置完纹理之后调用
         */
        protected onSetTextureUrl(): void {

        }
        protected getGLID(type: GLID_TYPE): any {
            switch (type) {
                case GLID_TYPE.TEXTURE_2D: return this._texture ? this._texture._glID : -1;
                case GLID_TYPE.TEXTURE_CUBE: return this._texture ? this._texture._glID : -1;
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
                case GLID_TYPE.VERTEX: return this._vertexsBuffer;
                case GLID_TYPE.VERT_COLOR: return this._VertColorBuffer;
                case GLID_TYPE.VERT_MATRIX: return this._vertMatrixBuffer;
                default: return null;//未知
            }
        }
        protected getBufferItemSize(type: GLID_TYPE): number {
            var buffer = this.getBuffer(type);
            return buffer ? buffer.itemSize : -1
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
            if(!this._shader)
            {
                //一次渲染shader是必不可少的
                return;
            }
            this._renderData._node = this as Node;
            this._renderData._cameraType = this._cameraType;//默认情况下是透视投影
            this._renderData._shader = this._shader;
            //顶点组
            this._renderData._vertGLID = this.getGLID(SY.GLID_TYPE.VERTEX);
            this._renderData._vertItemSize = this.getBufferItemSize(SY.GLID_TYPE.VERTEX);
            this._renderData._vertItemNums = this.getBuffer(SY.GLID_TYPE.VERTEX).itemNums;
            //索引组
            this._renderData._indexGLID = this.getGLID(SY.GLID_TYPE.INDEX);
            if (this._renderData._indexGLID != -1) {
                this._renderData._indexItemSize = this.getBuffer(SY.GLID_TYPE.INDEX).itemSize;
                this._renderData._indexItemNums = this.getBuffer(SY.GLID_TYPE.INDEX).itemNums;
            }
            //uv组
            this._renderData._uvGLID = this.getGLID(SY.GLID_TYPE.UV);
            this._renderData._uvItemSize = this.getBufferItemSize(SY.GLID_TYPE.UV);
            //法线组
            this._renderData._normalGLID = this.getGLID(SY.GLID_TYPE.NORMAL);
            this._renderData._normalItemSize = this.getBufferItemSize(SY.GLID_TYPE.NORMAL);

            //节点自定义顶点颜色组
            this._renderData._nodeVertColorGLID = this.getGLID(SY.GLID_TYPE.VERT_COLOR);
            if (this._renderData._nodeVertColorGLID != -1) {
                this._renderData._nodeVertColorItemSize = this.getBuffer(SY.GLID_TYPE.VERT_COLOR).itemSize;
                this._renderData._nodeVertColorItemNums = this.getBuffer(SY.GLID_TYPE.VERT_COLOR).itemNums;
            }

            this._renderData._nodeColor = this._color;

            this._renderData._customMatrix = this._customMatrix;


            //节点自定义矩阵组
            this._renderData._vertMatrixGLID = this.getGLID(SY.GLID_TYPE.VERT_MATRIX);
            if (this._renderData._vertMatrixGLID != -1) {
                this._renderData._vertMatrixItemSize = this.getBuffer(SY.GLID_TYPE.VERT_MATRIX).itemSize;
                this._renderData._vertMatrixItemNums = this.getBuffer(SY.GLID_TYPE.VERT_MATRIX).itemNums;
            }
            this._renderData._modelMatrix = this.modelMatrix;
            this._renderData._time = time;
            if (this._texture && this._texture._glID) {
                if (this._texture.isTexture2D)
                    this._renderData.push2DTexture(this.getGLID(SY.GLID_TYPE.TEXTURE_2D));
                else if (this._texture.isTextureCube)
                    this._renderData.pushCubeTexture(this.getGLID(SY.GLID_TYPE.TEXTURE_CUBE));
            }
            this._renderData._glPrimitiveType = this._glPrimitiveType;
            Device.Instance.collectData(this._renderData);
        }
        public get texture(): Texture {
            return this._texture;
        }
        public destroy(): void {
            this._texture.destroy();
        }
    }
    export class sySprite extends SpriteBase {
        constructor() {
            super();
            this.name = "sySprite";
        }
        protected onInit() {
            this.shaderVert = ShaderCode.sprite.vert;
            this.shaderFrag = ShaderCode.sprite.frag;
        }

    }
    export class Sprite extends Node {
        constructor() {
            super();
            this.init();
        }
        public _attrData: BufferAttribsData;
        public _uniformData: any;
        public _shaderData: ShaderData;
        private _renderData: NormalRenderData;
        protected _cameraType: number = 0;//相机的类型(0表示透视1表示正交)
        private _url: string;//资源路径
        //参考glprimitive_type
        protected _glPrimitiveType: syGL.PrimitiveType;//绘制的类型
        private init(): void {
            this._glPrimitiveType = syGL.PrimitiveType.TRIANGLES;
            this._renderData = RenderDataPool.get(RenderDataType.Normal) as NormalRenderData;
            this.onInit();
        }
        protected onInit(): void {

        }

        public set Url(url) {
            this._url = url;
            let datas = LoaderManager.instance.getRes(url);
            this.onLoadFinish(datas);
        }
        protected onLoadFinish(data: any): void {

        }
        protected collectRenderData(time: number): void {
            this.updateRenderData();
            Device.Instance.collectData(this._renderData);
        }
        //更新渲染数据
        protected updateRenderData(): void {
            this._renderData._shaderData = this._shaderData;
            this._renderData._uniformData = [];
            this._renderData._uniformData.push(this._uniformData);

            this._renderData._projKey = "u_projection";//投影矩阵的key
            this._renderData._viewKey = "u_view";//视口矩阵的key
            this._renderData._worldKey = "u_world";//世界坐标系的key
            this._renderData._attrbufferData = this._attrData;//顶点着色器的顶点相关属性
            this._renderData._node = this;//渲染的节点
            this._renderData._glPrimitiveType = syGL.PrimitiveType.TRIANGLES;//三角形
        }
        //设置shader
        protected setShader(vert: string, frag: string): void {
            this._shaderData = G_ShaderFactory.createProgramInfo(vert, frag);
        }
        //更新unifoms变量
        public updateUniformsData(cameraData: CameraData, lightData: LightData): any {

        }
        /**
         * 此接口用于测试使用 日后删除
         */
        public testDraw(): void {
            G_ShaderFactory.setBuffersAndAttributes(this._shaderData.attrSetters, this._attrData);
            G_ShaderFactory.setUniforms(this._shaderData.uniSetters, this._uniformData);
            G_ShaderFactory.drawBufferInfo(this._attrData, syGL.PrimitiveType.TRIANGLES);
        }
    }
    //动态
    export class SpriteBaseLine extends SY.SpriteBase {
        constructor() {
            super();
            this._glPrimitiveType = syGL.PrimitiveType.LINES;
        }
        private _linePositions: Array<number>;
        public updateLinePos(posArr: Array<number>) {
            if (!posArr || posArr.length < 3) return;
            if (!this._linePositions) {
                this._linePositions = posArr;
                this.createVertexsBuffer(this._linePositions, 3, 0);
            }
            else {
                this._linePositions = posArr;
                this.getBuffer(SY.GLID_TYPE.VERTEX).updateSubData(new Float32Array(this._linePositions));
            }
        }
        protected collectRenderData(time): void {
            if (!this._linePositions || this._linePositions.length == 0) return;
            super.collectRenderData(time);
        }
    }

    //2d显示节点
    export class Sprite2D extends SpriteBase {

        private _lt: Array<number> = [];//左上
        private _lb: Array<number> = [];//左下
        private _rt: Array<number> = [];//右上
        private _rb: Array<number> = [];//右下
        constructor() {
            super();
            this._cameraType = enums.PROJ_ORTHO;
            this._glPrimitiveType = this.gl.TRIANGLE_STRIP;
        }
        private updateUV(): void {
            //uv 数据
            var floorVertexTextureCoordinates = [
                0.0, 0.0, //v0
                1.0, 0.0, //v1
                1.0, 1.0, //v2
                0.0, 1.0, //v3
            ];
            this.createUVsBuffer(floorVertexTextureCoordinates, 2);
            // 索引数据
            var floorVertexIndices = [0, 1, 2, 3, 2, 0];
            this.createIndexsBuffer(floorVertexIndices);

        }

        protected onSetTextureUrl():void{
            if(this._texture)
            (this._texture as Texture2D).textureOnLoad = this.onTextureLoaded.bind(this);
        }

         /**
         * 加载纹理之后调用
         */
        public onTextureLoaded(image:HTMLImageElement):void{
            if(image)
            {
                if(this._sizeMode==SpriteSizeMode.RAW)
                {
                    this.setContentSize(image.width,image.height);
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
    export class SpriteInstance extends SY.Sprite2D {
        constructor() {
            super();
            this._glPrimitiveType = syGL.PrimitiveType.TRIANGLE_STRIP;
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
            this._renderData._isDrawInstanced = true;
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
            this._renderData._drawInstancedVertNums = nums;
        }
        protected get InstanceVertNums(): number {
            return this._InstanceVertNums;
        }
        protected set numInstances(nums: number) {
            this._numInstances = nums;
            this._renderData._drawInstancedNums = nums;
        }
        protected get numInstances(): number {
            return this._numInstances;
        }
        protected onShader() {
            this._divisorNameData.forEach((value, key) => {
                let loc = this._shader.getCustomAttributeLocation(key);
                this._divisorLocData.set(loc, value)
            })
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