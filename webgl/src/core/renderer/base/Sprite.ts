
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


 /**
  * 现阶段 核心渲染计算都要放在此类中
  */
import { BufferAttribsData, G_ShaderFactory, Shader, ShaderData } from "../shader/Shader";
import { glprimitive_type } from "../gfx/GLEnums";
import { Texture } from "./Texture";
import { Texture2D } from "./Texture2D";
import TextureCube from "./TextureCube";
import TextureCustom from "./TextureCustom";
import Device from "../../../Device";
import { NormalRenderData, RenderData, RenderDataPool, RenderDataType } from "../data/RenderData";
import LoaderManager from "../../../LoaderManager";
import { CameraData } from "../data/CameraData";
import { Node } from "./Node";

/**
 * 缓冲区中的数据就是一个二进制流，一般我们会按照字节处理，八个二进制为一个字节，又称字节流
 * 我们用字节流来表示数据，一个数据可以用若干个字节来表示
 * 一般用下面这几个数组来组织字节流
 * Int8Array：每个数据占1个字节
 * Uint8Array：每个数据占1个字节
 * Int16Array：每个数据占2个字节
 * Uint16Array：每个数据占2个字节
 * Float32Array：每个数据占4个字节
 */
abstract class glBaseBuffer {
    constructor(gl:WebGLRenderingContext, data: Array<number>, itemSize: number) {
        this._glID = gl.createBuffer();
        this.sourceData = data;
        this.itemSize = itemSize;
        this.itemNums = data.length/itemSize;
        this.gl = gl;
    }
    sourceData: Array<number>;//源数据，
    itemSize: number = 0;     //在缓冲区中，一个单位数据有几个数据组成
    itemNums: number = 0;     //在缓冲区中，单位数据的数目
    itemBytes: number = 2;    //每个数据的存储字节数
    _glID: WebGLBuffer;//显存存储数据的地址
    protected gl: WebGLRenderingContext;
    
    //上传数据到GPU显存
    public uploadData2GPU(): void {
        this.bindBuffer();
        this.bindData();
    }
    protected abstract bindBuffer();
    protected abstract bindData();

    /**
   * @method destroy
   */
    destroy() {
        if (this._glID === -1) {
            console.error('The buffer already destroyed');
            return;
        }
        this.gl.deleteBuffer(this._glID);
        this._glID = -1;
    }
}
//顶点buffer
class VertexsBuffer extends glBaseBuffer {
    constructor(gl, vertexs: Array<number>, itemSize: number) {
        super(gl, vertexs, itemSize);
    }
    bindBuffer(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glID);
    }
    bindData(): void {
        this.itemBytes = 32 / 8;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sourceData), this.gl.STATIC_DRAW);
    }
}
//索引buffer
class IndexsBuffer extends glBaseBuffer {
    constructor(gl, indexs: Array<number>, itemSize: number) {
        super(gl, indexs, itemSize);
    }
    bindBuffer(): void {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._glID);
    }
    bindData(): void {
        this.itemBytes = 16 / 8;
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sourceData), this.gl.STATIC_DRAW);
    }
}
//uvbuffer
class UVsBuffer extends glBaseBuffer {
    constructor(gl, uvs: Array<number>, itemSize: number) {
        super(gl, uvs, itemSize);
    }
    bindBuffer(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glID);
    }
    bindData(): void {
        this.itemBytes = 32 / 8;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sourceData), this.gl.STATIC_DRAW);
    }
}
//法线buffer
class NormalBuffer extends glBaseBuffer {
    constructor(gl, normals: Array<number>, itemSize: number) {
        super(gl, normals, itemSize);
    }
    bindBuffer(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glID);
    }
    bindData(): void {
        this.itemBytes = 32 / 8;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.sourceData), this.gl.STATIC_DRAW);
    }
}

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
        TEXTURE_2D, //2D纹理
        TEXTURE_CUBE //立方体纹理
    }
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
        //纹理buffer
        private _uvsBuffer: UVsBuffer;
        protected _texture: Texture;


        protected gl: WebGL2RenderingContext;

        protected _shader: Shader;

        private _renderData:RenderData;

        //参考glprimitive_type
        protected _glPrimitiveType: glprimitive_type;//绘制的类型


        protected _cameraType: number = 0;//相机的类型(0表示透视1表示正交)

        constructor(gl) {
            super();
            this.gl = gl;
            this._glPrimitiveType = glprimitive_type.TRIANGLE_FAN;
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
            this._vertexsBuffer = new VertexsBuffer(this.gl, vertexs, itemSize);
            this._vertexsBuffer.uploadData2GPU();
            return this._vertexsBuffer;
        }
        //创建法线缓冲
        public createNormalsBuffer(normals: Array<number>, itemSize: number): NormalBuffer {
            this._normalsBuffer = new NormalBuffer(this.gl, normals, itemSize);
            this._normalsBuffer.uploadData2GPU();
            return this._normalsBuffer;
        }
        //创建索引缓冲
        //索引缓冲的单位数据个数肯定为1
        public createIndexsBuffer(indexs: Array<number>): IndexsBuffer {
            this._indexsBuffer = new IndexsBuffer(this.gl, indexs,1);
            this._indexsBuffer.uploadData2GPU();
            return this._indexsBuffer;
        }
        //创建uv缓冲
        public createUVsBuffer(uvs: Array<number>, itemSize: number): UVsBuffer {
            this._uvsBuffer = new UVsBuffer(this.gl, uvs, itemSize);
            this._uvsBuffer.uploadData2GPU();
            return this._uvsBuffer
        }
        //创建一个纹理buffer
        private createTexture2DBuffer(url: string): Texture {
            this._texture = new Texture2D(this.gl);
            (this._texture as Texture2D).url = url;
            return this._texture
        }
        private createTextureCubeBuffer(arr: Array<string>): Texture {
            this._texture = new TextureCube(this.gl);
            (this._texture as TextureCube).url = arr;
            return this._texture;
        }
        private createCustomTextureBuffer(data): Texture {
            this._texture = new TextureCustom(this.gl);
            (this._texture as TextureCustom).url = data;
            return this._texture;
        }

        public set url(url: string | Array<string> | object) {
            //普通图片
            if (typeof url == "string") {
                this.createTexture2DBuffer(url);
            }
            //天空盒
            else if (url instanceof Array && url.length == 6) {
                this.createTextureCubeBuffer(url);
            }
            //自定义纹理
            else if (typeof (url) == "object") {
                this.createCustomTextureBuffer(url);
            }
        }


        public getGLID(type: GLID_TYPE): any {
            switch (type) {
                case GLID_TYPE.INDEX: return this._indexsBuffer ? this._indexsBuffer._glID : -1;
                case GLID_TYPE.TEXTURE_2D: return this._texture ? this._texture._glID : -1;
                case GLID_TYPE.TEXTURE_CUBE: return this._texture ? this._texture._glID : -1;
                case GLID_TYPE.UV: return this._uvsBuffer ? this._uvsBuffer._glID : -1;
                case GLID_TYPE.NORMAL: return this._normalsBuffer ? this._normalsBuffer._glID : -1;
                case GLID_TYPE.VERTEX: return this._vertexsBuffer ? this._vertexsBuffer._glID : -1;
                default: return -1;//未知
            }
        }
        public getBuffer(type: GLID_TYPE): glBaseBuffer {
            switch (type) {
                case GLID_TYPE.INDEX: return this._indexsBuffer;
                case GLID_TYPE.UV: return this._uvsBuffer;
                case GLID_TYPE.NORMAL: return this._normalsBuffer;
                case GLID_TYPE.VERTEX: return this._vertexsBuffer;
                default: return null;//未知
            }
        }
        protected getBufferItemSize(type: GLID_TYPE): number {
            var buffer = this.getBuffer(type);
            return buffer ? buffer.itemSize : -1
        }

        protected updateCamera(time: number): any {

        }
       
        /**
         * 
         * @param texture 纹理的GLID
         */
        protected draw(time: number): void {
            if (this._texture && this._texture.loaded == false) {
                return;
            }
            this._renderData._cameraType = this._cameraType;//默认情况下是透视投影
            this._renderData._shader = this._shader;
            this._renderData._vertGLID = this.getGLID(SY.GLID_TYPE.VERTEX);
            this._renderData._vertItemSize = this.getBufferItemSize(SY.GLID_TYPE.VERTEX);
            this._renderData._vertItemNums = this.getBuffer(SY.GLID_TYPE.VERTEX).itemNums;
            this._renderData._indexGLID = this.getGLID(SY.GLID_TYPE.INDEX);
            if(this._renderData._indexGLID!=-1)
            {
                this._renderData._indexItemSize = this.getBuffer(SY.GLID_TYPE.INDEX).itemSize;
                this._renderData._indexItemNums = this.getBuffer(SY.GLID_TYPE.INDEX).itemNums;
            }
            this._renderData._uvGLID = this.getGLID(SY.GLID_TYPE.UV);
            this._renderData._uvItemSize = this.getBufferItemSize(SY.GLID_TYPE.UV);
            this._renderData._normalGLID = this.getGLID(SY.GLID_TYPE.NORMAL);
            this._renderData._normalItemSize = this.getBufferItemSize(SY.GLID_TYPE.NORMAL);
            this._renderData._lightColor = [0.0, 1, 1.0, 1];
            this._renderData._modelMatrix = this._modelMatrix;
            this._renderData._time = time;
            this._renderData._lightDirection = this._glMatrix.vec3.normalize(null, [8, 5, -10]);
            if (this._shader.USE_SKYBOX) {
                this._renderData._u_pvm_matrix_inverse = (this).updateCamera(time);
            }
            if (this._texture && this._texture._glID && !this._shader.USE_SKYBOX) {
                this._renderData._textureGLIDArray.push(this.getGLID(SY.GLID_TYPE.TEXTURE_2D));
            }
            this._renderData._glPrimitiveType = this._glPrimitiveType;
            Device.Instance.collectData(this._renderData);
        }
        public get texture():Texture{
            return this._texture;
        }
        public destroy(): void {
            this._texture.destroy();
        }
    }

    export class Sprite extends Node{
        constructor(){
            super();
            this.init();
        }
        protected _attrData:BufferAttribsData;
        protected _uniformsData:any;
        private _shaderData:ShaderData;
        private _renderData:NormalRenderData;
        protected _cameraType: number = 0;//相机的类型(0表示透视1表示正交)
        private _url:string;//资源路径
        //参考glprimitive_type
        protected _glPrimitiveType: glprimitive_type;//绘制的类型
        private init(): void {
            this._glPrimitiveType = glprimitive_type.TRIANGLES;
            this._renderData = RenderDataPool.get(RenderDataType.Normal) as NormalRenderData;
            this.onInit();
        }
        protected onInit(): void {

        }

        public set Url(url){
              this._url = url;
              let datas = LoaderManager.instance.getCacheData(url);
              this.onLoadFinish(datas);
        }
        protected onLoadFinish(data:any):void{

        }
        protected draw(time: number): void {
            this._renderData._shaderData = this._shaderData;
            this._renderData._uniformInfors = [];
            for(let k in this._uniformsData)
            {
                this._renderData._uniformInfors.push(this._uniformsData[k]);
            }
            this._renderData._projKey = "u_projection";//投影矩阵的key
            this._renderData._viewKey = "u_view";//视口矩阵的key
            this._renderData._worldKey = "u_world";//世界坐标系的key
            this._renderData._attrbufferInfo = this._attrData;//顶点着色器的顶点相关属性
            this._renderData._node = this;//渲染的节点
            Device.Instance.collectData(this._renderData);
        }
        //设置shader
        protected setShader(vert: string, frag: string):void{
            this._shaderData = G_ShaderFactory.createProgramInfo(vert, frag);
        }
        //更新unifoms变量
        public updateUniformsData(cameraData:CameraData):void{
      
        }
    }
    
    //2d显示节点
    export class Sprite2D extends SY.SpriteBase {

        private _lt: Array<number> = [];//左上
        private _lb: Array<number> = [];//左下
        private _rt: Array<number> = [];//右上
        private _rb: Array<number> = [];//右下
        constructor(gl) {
            super(gl);
        }
        private updateUV():void{
             //uv 数据
            var floorVertexTextureCoordinates = [
                0.0, 0.0, //v0
                1.0, 0.0, //v1
                1.0, 1.0, //v2
                0.0, 1.0, //v3
            ];
            this.createUVsBuffer(floorVertexTextureCoordinates, 2);

            // 索引数据
            var floorVertexIndices = [0, 1, 2, 3];
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

            var clipW = this.width / Device.Instance.Width;
            var clipH = this.height / Device.Instance.Height;

            var z = -0.1;

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



}