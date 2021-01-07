
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
import { NormalRenderData, RenderData, RenderDataPool, RenderDataType, ShaderUseVariantType } from "../data/RenderData";
import { glprimitive_type } from "../gfx/GLEnums";
import { BufferAttribsData, Shader, ShaderData } from "../shader/Shader";
import { G_ShaderFactory } from "../shader/ShaderFactory";
import { Node } from "./Node";
import { Texture, TextureOpts } from "./texture/Texture";
import { Texture2D } from "./texture/Texture2D";
import TextureCube from "./texture/TextureCube";
import TextureCustom from "./texture/TextureCustom";
import { glBaseBuffer, G_BufferManager, IndexsBuffer, NodeCustomColorBuffer, NodeCustomMatrixBuffer, NormalBuffer, UVsBuffer, VertexsBuffer } from "./buffer/BufferManager";
import enums from "../camera/enums";


/**
 * 现阶段 核心渲染计算都要放在此类中
 */







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
        COLOR,  //节点自定义颜色
        MATRIX,//节点自定义矩阵
        TEXTURE_2D, //2D纹理
        TEXTURE_CUBE //立方体纹理
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
        private _customColorBuffer: NodeCustomColorBuffer;//节点自定义颜色buffer
        private _customMatrixBuffer: NodeCustomMatrixBuffer;//节点自定义矩阵buffer
        private _materialId: string;//这里存放一个材质id
        //纹理buffer
        private _uvsBuffer: UVsBuffer;
        protected _texture: Texture;
        protected gl: WebGL2RenderingContext;
        protected _shader: Shader;
        protected _renderData: RenderData;
        //参考glprimitive_type
        protected _glPrimitiveType: glprimitive_type;//绘制的类型
        protected _cameraType: number = 0;//相机的类型(0表示透视1表示正交)
        constructor() {
            super();
            materialId++;
            this._materialId = "materialId_" + materialId;
            this.gl = Device.Instance.gl;
            this._glPrimitiveType = glprimitive_type.TRIANGLES;
            this._renderData = RenderDataPool.get(RenderDataType.Base);
            this.init();
        }
        private init(): void {
            this.onInit();
        }
        protected onInit(): void {

        }
        //获取shader
        public get shader(): Shader {
            return this._shader;
        }

        public setShader(vert: string, frag: string) {
            this._shader = Shader.create(vert, frag);
        }
        //创建顶点缓冲
        public createVertexsBuffer(vertexs: Array<number>, itemSize: number): VertexsBuffer {
            this._vertexsBuffer = G_BufferManager.createBuffer(GLID_TYPE.VERTEX,
                this._materialId, vertexs, itemSize) as VertexsBuffer;
            this._renderData.pushShaderVariant(ShaderUseVariantType.Vertex);
            return this._vertexsBuffer;
        }
        //创建法线缓冲
        public createNormalsBuffer(normals: Array<number>, itemSize: number): NormalBuffer {
            this._normalsBuffer = G_BufferManager.createBuffer(GLID_TYPE.NORMAL,
                this._materialId, normals, itemSize) as NormalBuffer;
            this._renderData.pushShaderVariant(ShaderUseVariantType.Normal);
            return this._normalsBuffer;
        }
        //创建索引缓冲
        //索引缓冲的单位数据个数肯定为1
        public createIndexsBuffer(indexs: Array<number>): IndexsBuffer {
            this._indexsBuffer = G_BufferManager.createBuffer(GLID_TYPE.INDEX,
                this._materialId, indexs, 1) as IndexsBuffer;
            return this._indexsBuffer;
        }
        //创建uv缓冲
        public createUVsBuffer(uvs: Array<number>, itemSize: number): UVsBuffer {
            this._uvsBuffer = G_BufferManager.createBuffer(GLID_TYPE.UV,
                this._materialId, uvs, itemSize) as UVsBuffer;
            this._renderData.pushShaderVariant(ShaderUseVariantType.UVs);
            return this._uvsBuffer
        }
        //创建节点自定义矩阵buffer
        public createNodeCustomMatrixBuffer(matrix: Array<number>, itemSize: number, preAllocateLen: number = 0): NodeCustomMatrixBuffer {
            this._customMatrixBuffer = G_BufferManager.createBuffer(GLID_TYPE.MATRIX, this._materialId, matrix, itemSize, preAllocateLen) as NodeCustomMatrixBuffer;
            this._renderData.pushShaderVariant(ShaderUseVariantType.NodeCustomMatrix);
            return this._customMatrixBuffer;
        }
        //创建节点自定义颜色buffer
        public createNodeCustomColorBuffer(color: Array<number>, itemSize: number): NodeCustomColorBuffer {
            this._customColorBuffer = G_BufferManager.createBuffer(GLID_TYPE.COLOR, this._materialId, color, itemSize) as NodeCustomColorBuffer;
            this._renderData.pushShaderVariant(ShaderUseVariantType.NodeCustomColor);
            return this._customColorBuffer;
        }
        //创建一个纹理buffer
        private createTexture2DBuffer(url: string): Texture {
            this._texture = new Texture2D(this.gl);
            (this._texture as Texture2D).url = url;
            this._renderData.pushShaderVariant(ShaderUseVariantType.TEX_COORD);
            return this._texture
        }
        private createTextureCubeBuffer(arr: Array<string>): Texture {
            this._texture = new TextureCube(this.gl);
            (this._texture as TextureCube).url = arr;
            this._renderData.pushShaderVariant(ShaderUseVariantType.TEX_COORD);
            return this._texture;
        }
        private createCustomTextureBuffer(data: TextureOpts): Texture {
            this._texture = new TextureCustom(this.gl);
            (this._texture as TextureCustom).url = data;
            this._renderData.pushShaderVariant(ShaderUseVariantType.TEX_COORD);
            return this._texture;
        }
        /**
         * 创建一个渲染纹理
         * @param data {type,place,width,height}
         */
        private createRenderTextureBuffer(data: any): Texture {
            this._texture = new RenderTexture(this.gl);
            (this._texture as RenderTexture).attach(data.place, data.width, data.height);
            this._renderData.pushShaderVariant(ShaderUseVariantType.TEX_COORD);
            return this._texture;
        }
        public set url(url: string | Array<string> | TextureOpts | Object) {
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
        public getBuffer(type: GLID_TYPE): glBaseBuffer {
            switch (type) {
                case GLID_TYPE.INDEX: return this._indexsBuffer;
                case GLID_TYPE.UV: return this._uvsBuffer;
                case GLID_TYPE.NORMAL: return this._normalsBuffer;
                case GLID_TYPE.VERTEX: return this._vertexsBuffer;
                case GLID_TYPE.COLOR: return this._customColorBuffer;
                case GLID_TYPE.MATRIX: return this._customMatrixBuffer;
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
        protected draw(time: number): void {
            if (this._texture && this._texture.loaded == false) {
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

            //节点自定义颜色组
            this._renderData._nodeCustomColorGLID = this.getGLID(SY.GLID_TYPE.COLOR);
            if (this._renderData._nodeCustomColorGLID != -1) {
                this._renderData._nodeCustomColorItemSize = this.getBuffer(SY.GLID_TYPE.COLOR).itemSize;
                this._renderData._nodeCustomColorItemNums = this.getBuffer(SY.GLID_TYPE.COLOR).itemNums;
            }

            //节点自定义矩阵组
            this._renderData._nodeCustomMatrixGLID = this.getGLID(SY.GLID_TYPE.MATRIX);
            if (this._renderData._nodeCustomMatrixGLID != -1) {
                this._renderData._nodeCustomMatrixItemSize = this.getBuffer(SY.GLID_TYPE.MATRIX).itemSize;
                this._renderData._nodeCustomMatrixItemNums = this.getBuffer(SY.GLID_TYPE.MATRIX).itemNums;
            }


            this._renderData._modelMatrix = this.modelMatrix;
            this._renderData._time = time;
            if (this._texture && this._texture._glID && this._texture.isTexture2D) {
                this._renderData.pushTexture(this.getGLID(SY.GLID_TYPE.TEXTURE_2D));
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
        protected _glPrimitiveType: glprimitive_type;//绘制的类型
        private init(): void {
            this._glPrimitiveType = glprimitive_type.TRIANGLES;
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
        protected draw(time: number): void {
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
            this._renderData._glPrimitiveType = glprimitive_type.TRIANGLES;//三角形
        }
        //设置shader
        protected setShader(vert: string, frag: string): void {
            this._shaderData = G_ShaderFactory.createProgramInfo(vert, frag);
        }
        //更新unifoms变量
        public updateUniformsData(cameraData: CameraData): any {

        }
        /**
         * 此接口用于测试使用 日后删除
         */
        public testDraw(): void {
            G_ShaderFactory.setBuffersAndAttributes(this._shaderData.attrSetters, this._attrData);
            G_ShaderFactory.setUniforms(this._shaderData.uniSetters, this._uniformData);
            G_ShaderFactory.drawBufferInfo(this._attrData, glprimitive_type.TRIANGLES);
        }
    }

    //2d显示节点
    export class Sprite2D extends SY.SpriteBase {

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


            var floorVertexPosition = [].concat(this._lb, this._rb, this._rt, this._lt);
            this.createVertexsBuffer(floorVertexPosition, 3);

            this.updateUV();

        }
        
    }
    
    /**
     * 实例化绘制
     */
    export class SpriteInstance extends SY.Sprite2D {
        constructor() {
            super();
            this._renderData._isDrawInstanced = true;
        }
        public setData(data:any):void{
             let nums = data.instanceNums;//多少个实例
             let vertNums = data.instanceVertNums;//单个实例含有多少个顶点
             let positions = data.positions;//顶点位置
             let uvs = data.uvs;  //uv数据
        }
    }



}