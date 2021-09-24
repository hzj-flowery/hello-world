import { syGL } from "../../gfx/syGLEnums";
import { SY } from "../Sprite";
/**
 * 该类主要用来生成顶点数据的buffer,顶点数据的种类如下：
 * 位置：pos 在shader中的变量类型是vec3 所以一个单元的数据个数是3，每个数据由若干字节存放，一般是float类型，那就是4个字节
 * uv:  vec2
 * 法线：vec3
 * 切线：vec3
 * 颜色:vec4,一个单元数据有4个数据，因为颜色一般是rgba 4个通道
 * 矩阵：matrix 在shader中的变量类型是mat4,但这种类型其实是一个结构体，其实它就是4个连续存放的vec4类型的变量，矩阵首地址就是第一个vec4变量的地址
 * 后边的地址，就是依次+1，注意我这里说的是在shader中的地址，所以对于矩阵数据，它的一个单元数据就是一个vec4类型的变量，他们它就有4个数据组成，每个数据的类型也一般都是
 * float类型，即4个字节
 * 索引：为了节省字节而产生的，他有单独的索引缓冲存放 
 *
 */

/**
 * 顶点buffer:若干字节组成一个数据，若干数据组成一个单元，若干单元组成一个图形
 * 一般情况：存储顶点buffer的数组都是float类型，所以一个顶点的坐标便是4个字节，一个顶点有三个坐标（x,y,z）,所以就有三个数据组成一个顶点，一个顶点就代表一个单元
 * 所以我们将顶点数组发给GPU的时候，GPU需要知道一个顶点或者说一个顶点单元，有多少数据表示
 * 当我们绑定好当前的顶点缓冲，GPU就拿到了当前要操作的顶点缓冲，当GPU要绘制的时候，我们还需要告诉它从这个数组哪一个顶点单元开始绘制，一共要绘制多少个顶点单元，以及这些顶点
 * 单元是如何分布的，比如点分布，线分布，三角形分布
 * 
 */

/**
 * 缓冲区中的数据就是一个二进制流，一般我们会按照字节处理，八个二进制为一个字节，又称字节流
 * 我们用字节流来表示数据，一个数据可以用若干个字节来表示
 * 一般用下面这几个数组来组织字节流
 * Int8Array：每个数据占1个字节
 * Uint8Array：每个数据占1个字节
 * Int16Array：每个数据占2个字节
 * Uint16Array：每个数据占2个字节
 * Float32Array：每个数据占4个字节
 *
 * 在使用bindBuffer() 
gl.STREAM_DRAW：代码输入，用于绘制。设置一次，并且很少使用。
gl.STREAM_READ：接受OpenGL输出，用于绘制。设置一次，并且很少使用。
gl.STREAM_COPY：接受OpenGL输出，用于绘制或者用于拷贝至图片。设置一次，很少使用。
gl.STATIC_DRAW：代码输入，用于绘制或者拷贝至图片。设置一次，经常使用。
gl.STATIC_READ：接受OpenGL输出，用于绘制。设置一次，代码经常查询。
gl.STATIC_COPY：接受OpenGL输出，用于绘制或者用于拷贝至图片。设置一次，经常使用。
gl.DYNAMIC_DRAW：代码经常更新其内容，用于绘制或者用于拷贝至图片，使用频率高。
gl.DYNAMIC_READ：OpenGL输出经常更新其内容，代码经常查询。
gl.DYNAMIC_COPY：OpenGL输出经常更新其内容，用于绘制或者用于拷贝至图片，使用频率高。
 */
export abstract class glBaseBuffer {
    /**
     * 构造一个buffer对象
     * @param gl 
     * @param data 顶点数据（pos,uv,normal,切线，节点颜色，节点矩阵）
     * @param itemSize 一个单元数据有多少个数据组成
     * @param arrbufferType 顶点缓冲的类型
     * @param itemBytes 存储每一个数据的字节数
     * @param preAllocateLen  预先分配的长度 一般默认为0 否则第一次只是在显存中分配内存 后边才会更新和赋值到这块内存区域
     */
    constructor(gl: WebGLRenderingContext, data: Array<number>, itemSize: number, arrbufferType: number, itemBytes: number, preAllocateLen: number) {
        this.glID = gl.createBuffer();
        this._itemSize = itemSize;
        this.gl = gl;
        this._arrayBufferType = arrbufferType;
        this._itemBytes = itemBytes;
        // //默认使用以下数据
        this._usage = syGL.BufferUsage.STATIC;

        this._curMapTotalBytes = 0;
        this._hasAllocateByteLen = 0;
        if (preAllocateLen == 0) {
            //走正常的分配逻辑
            this.uploadData2GPU(data);
        }
        else if (!data || data.length == 0) {
            //表示想要预先申请一段GPU内存来存当前的buffer 日后再更新这个buffer
            this._preAllocateLen = preAllocateLen;
            this.preAllocateBuffer();
        }
        else {
            console.log("无法创建，您传入的参数不合法！！！！！！");
        }
    }
    // private _mapSourceData: Map<number, Array<number>> = new Map();//源数据
    private _sourceData: Array<number>;
    private _itemBytes: number = 2;    //每个数据的存储字节数
    private _curMapTotalBytes: number;//当前map中含有的总的字节数
    private _itemSize: number = 0;     //在缓冲区中，一个单元有几个数据组成
    private _itemNums: number = 0;     //在缓冲区中，一共含有多少个单元
    private _glID: WebGLBuffer;//显存存储数据的地址
    /**
     * 只有两个值：
     * 1： gl.ARRAY_BUFFER         除索引数据外其它一切顶点数据
     * 2： gl.ELEMENT_ARRAY_BUFFER 专门针对索引数据
     */
    private _arrayBufferType: number;//缓冲区的类型
    private _usage: number;
    private _preAllocateLen: number;//动态预分配的字节长度
    private _hasAllocateByteLen: number;//已经分配的字节长度
    protected gl: WebGLRenderingContext;

    protected useDynamicUsage() {
        this._usage = syGL.BufferUsage.DYNAMIC;
    }
    //一个数据有几个字节组成
    public get itemBytes(): number {
        return this._itemBytes;
    }
    //一个单元有多少个数据
    public get itemSize(): number {
        return this._itemSize;
    }
    //一共有多少个单元
    public get itemNums(): number {
        return this._itemNums;
    }
    public get glID(): WebGLBuffer {
        return this._glID;
    }
    public set glID(glID:WebGLBuffer) {
        this._glID = glID;
    }
    private uploadData2GPU(data: Array<number>) {
        this._curMapTotalBytes = data.length * this._itemBytes;
        this._itemNums = data.length / this._itemSize;
        this._sourceData = data;
        this.bufferSet();
        let Arr = this.getBytesArray();
        this.gl.bindBuffer(this._arrayBufferType, this.glID),
        this.gl.bufferData(this._arrayBufferType, new Arr(this._sourceData), this._usage)
    }
    public updateSubData(data: Float32Array): void {
        this.gl.bindBuffer(this._arrayBufferType, this.glID);
        let curByteLen = data.byteLength;
        if (this._hasAllocateByteLen < curByteLen) {
            //说明当前显存中对于这块数据的存储内存不够用了，需要加
            this.gl.bufferData(this._arrayBufferType, curByteLen, this._usage);
        }
        this.gl.bufferSubData(this._arrayBufferType, 0, data);
        this._hasAllocateByteLen = curByteLen;
        this._itemNums = data.length / this._itemSize;
        this._curMapTotalBytes = data.length * this._itemBytes;
    }
    /**
     * 在GPU显存中预分配一块内存为该buffer
     */
    private preAllocateBuffer(): void {
        this._hasAllocateByteLen = this._preAllocateLen;
        this.gl.bindBuffer(this._arrayBufferType, this.glID);
        this.gl.bufferData(this._arrayBufferType, this._preAllocateLen, this._usage);
    }
    /**
     * 获取字节数组
     */
    private getBytesArray() {
        switch (this._itemBytes) {
            case 1: return Uint8Array;
            case 2: return Uint16Array;
            case 4: return Float32Array;
            case 8: return Float64Array;
        }
    }
    protected abstract bufferSet();

    /**
   * @method destroy
   */
    destroy() {
        if (this.glID === -1) {
            console.error('The buffer already destroyed');
            return;
        }
        this.gl.deleteBuffer(this.glID);
        this.glID = -1;
    }
}

//顶点buffer
export class VertexsBuffer extends glBaseBuffer {
    constructor(gl, vertexs: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, vertexs, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);

    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//索引buffer
export class IndexsBuffer extends glBaseBuffer {
    constructor(gl, indexs: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, indexs, itemSize, gl.ELEMENT_ARRAY_BUFFER, 2, preAllocateLen);
    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//uvbuffer
export class UVsBuffer extends glBaseBuffer {
    constructor(gl, uvs: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, uvs, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//法线buffer
export class NormalBuffer extends glBaseBuffer {
    constructor(gl, normals: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, normals, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//顶点矩阵buffer
export class VertMatrixBuffer extends glBaseBuffer {
    constructor(gl, matrix: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, matrix, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//顶点颜色buffer
export class VertColorBuffer extends glBaseBuffer {
    constructor(gl, color: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, color, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        // this.useDynamicUsage();
    }
}

/**
 * buffer 管理员
 */
class BufferManager {
    constructor() {

    }
    public init(gl: WebGLRenderingContext): void {
        this._gl = gl;
    }
    private _gl: WebGLRenderingContext;
    private _mapVertexBuffer: Map<string, VertexsBuffer> = new Map();
    private _mapIndexBuffer: Map<string, IndexsBuffer> = new Map();
    private _mapNormalBuffer: Map<string, NormalBuffer> = new Map();
    private _mapUVBuffer: Map<string, UVsBuffer> = new Map();
    private _mapVertColorBuffer: Map<string, VertColorBuffer> = new Map();
    private _mapVertMatrixBuffer: Map<string, VertMatrixBuffer> = new Map();
    /**
     * 
     * @param type buffer类型
     * @param materialId 材质的id
     * @param data 顶点源数据
     * @param itemSize 一个单元的数据个数
     * @param preAllocateLen 
     */
    public createBuffer(type: SY.GLID_TYPE, materialId: string = "default", data: Array<number>, itemSize: number, preAllocateLen: number): glBaseBuffer {
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                return this.createVertex(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.INDEX:
                return this.createIndex(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.NORMAL:
                return this.createNormal(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.UV:
                return this.createUV(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.VERT_COLOR:
                return this.createVertColor(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.VERT_MATRIX:
                return this.createMatrix(materialId, data, itemSize, preAllocateLen);
            default: break;
        }
    }
    public getBuffer(type: SY.GLID_TYPE, materialId: string): glBaseBuffer {
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                return this._mapVertexBuffer.get(materialId);
            case SY.GLID_TYPE.INDEX:
                return this._mapIndexBuffer.get(materialId);
            case SY.GLID_TYPE.NORMAL:
                return this._mapNormalBuffer.get(materialId);
            case SY.GLID_TYPE.UV:
                return this._mapUVBuffer.get(materialId);
            case SY.GLID_TYPE.VERT_COLOR:
                return this._mapVertColorBuffer.get(materialId);
            case SY.GLID_TYPE.VERT_MATRIX:
                return this._mapVertMatrixBuffer.get(materialId);
            default: console.log("未知类型，请指明类型"); break;
        }
    }
    private createVertex(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): VertexsBuffer {
        let buffer = new VertexsBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapVertexBuffer.set(id, buffer);
        return buffer;
    }
    private createIndex(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): IndexsBuffer {
        let buffer = new IndexsBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapIndexBuffer.set(id, buffer);
        return buffer;
    }
    private createNormal(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): NormalBuffer {
        let buffer = new NormalBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapNormalBuffer.set(id, buffer);
        return buffer;
    }
    private createUV(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): UVsBuffer {
        let buffer = new UVsBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapUVBuffer.set(id, buffer);
        return buffer;
    }
    private createVertColor(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): VertColorBuffer {
        let buffer = new VertColorBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapVertColorBuffer.set(id, buffer);
        return buffer;
    }
    private createMatrix(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): VertMatrixBuffer {
        let buffer = new VertMatrixBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapVertMatrixBuffer.set(id, buffer);
        return buffer;
    }
}

export var G_BufferManager = new BufferManager();