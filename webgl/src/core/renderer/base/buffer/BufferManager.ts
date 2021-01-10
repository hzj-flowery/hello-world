import { SY } from "../Sprite";

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
     * @param data 
     * @param itemSize 
     * @param arrbufferType 
     * @param itemBytes 
     * @param preAllocateLen  
     */
    constructor(gl: WebGLRenderingContext, data: Array<number>, itemSize: number, arrbufferType: number, itemBytes: number, preAllocateLen: number) {
        this._glID = gl.createBuffer();
        this._itemSize = itemSize;
        this.gl = gl;
        this._arrayBufferType = arrbufferType;
        this._itemBytes = itemBytes;
        // //默认使用以下数据
        this._usage = gl.STATIC_DRAW;
        this._curMapTotalBytes = 0;
        if (preAllocateLen == 0) {
            //走正常的分配逻辑
            this.mergeData(data);
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
    private _mapSourceData: Map<number, Array<number>> = new Map();//源数据
    private _itemBytes: number = 2;    //每个数据的存储字节数
    private _curMapTotalBytes: number;//当前map中含有的总的字节数
    private _itemSize: number = 0;     //在缓冲区中，一个单元有几个数据组成
    private _itemNums: number = 0;     //在缓冲区中，一共含有多少个单元
    private _glID: WebGLBuffer;//显存存储数据的地址
    private _arrayBufferType: number;//缓冲区的类型
    private _usage: number;
    private _preAllocateLen: number;//动态预分配的字节长度
    protected gl: WebGLRenderingContext;

    protected useDynamicUsage() {
        this._usage = this.gl.DYNAMIC_DRAW;
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
    public mergeData(data: Array<number>) {
        //将数据放置在map中
        this._mapSourceData.set(this._curMapTotalBytes, data);
        this._curMapTotalBytes = this._curMapTotalBytes + data.length * this._itemBytes;
        this._itemNums = this._itemNums + data.length / this._itemSize;
        this.uploadData2GPU();
    }
    public updateSubData(data: Float32Array): void {
        this.gl.bindBuffer(this._arrayBufferType, this._glID);
        this.gl.bufferSubData(this._arrayBufferType, 0, data);
    }
    /**
     * 在GPU显存中预分配一块内存为该buffer
     */
    private preAllocateBuffer(): void {
        //默认设置为4
        //凡是走这个逻辑 统统都要float32array
        this._itemBytes = 4;
        this.gl.bindBuffer(this._arrayBufferType, this._glID);
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
    //上传数据到GPU显存
    private uploadData2GPU(): void {
        this.bufferSet();
        this._usage == this.gl.STATIC_DRAW ? this.staticDraw() : this.dynamicDraw();
    }
    //静态绑定数据绘制
    private staticDraw(): void {
        let Arr = this.getBytesArray();
        this.gl.bindBuffer(this._arrayBufferType, this._glID);
        this.gl.bufferData(this._arrayBufferType, new Arr(this._mapSourceData.get(0)), this._usage);
    }
    //动态绑定数据绘制
    private dynamicDraw(): void {
        let Arr = this.getBytesArray();
        this.gl.bindBuffer(this._arrayBufferType, this._glID);
        //重新调整数组大小
        this.gl.bufferData(this._arrayBufferType, this._curMapTotalBytes, this._usage);
        this._mapSourceData.forEach((values, key) => {
            this.gl.bufferSubData(this._arrayBufferType, key, new Arr(values));
        })
    }
    protected abstract bufferSet();

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
//节点矩阵buffer
export class NodeCustomMatrixBuffer extends glBaseBuffer {
    constructor(gl, matrix: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, matrix, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//节点颜色buffer
export class NodeCustomColorBuffer extends glBaseBuffer {
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
    private _mapNodeColorBuffer: Map<string, UVsBuffer> = new Map();
    private _mapNodeMatrixBuffer: Map<string, UVsBuffer> = new Map();
    /**
     * 
     * @param type 
     * @param materialId 
     * @param data  源数据
     * @param itemSize 一个单元的数据个数
     */
    public createBuffer(type: SY.GLID_TYPE, materialId: string = "default", data: Array<number>, itemSize: number, preAllocateLen: number = 0): glBaseBuffer {
        console.log("materialId------",type,materialId);
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                return this.createVertex(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.INDEX:
                return this.createIndex(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.NORMAL:
                return this.createNormal(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.UV:
                return this.createUV(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.COLOR:
                return this.createColor(materialId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MATRIX:
                return this.createMatrix(materialId, data, itemSize, preAllocateLen);
            default: break;
        }
    }
    public getBuffer(type:SY.GLID_TYPE,materialId:string):glBaseBuffer{
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                return this._mapVertexBuffer.get(materialId);
            case SY.GLID_TYPE.INDEX:
                return this._mapIndexBuffer.get(materialId);
            case SY.GLID_TYPE.NORMAL:
                return this._mapNormalBuffer.get(materialId);
            case SY.GLID_TYPE.UV:
                return this._mapUVBuffer.get(materialId);
            case SY.GLID_TYPE.COLOR:
                return this._mapNodeColorBuffer.get(materialId);
            case SY.GLID_TYPE.MATRIX:
                return this._mapNodeMatrixBuffer.get(materialId);
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
    private createColor(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): NodeCustomColorBuffer {
        let buffer = new NodeCustomColorBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapNodeColorBuffer.set(id, buffer);
        return buffer;
    }
    private createMatrix(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): NodeCustomMatrixBuffer {
        let buffer = new NodeCustomMatrixBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapNodeMatrixBuffer.set(id, buffer);
        return buffer;
    }
}

export var G_BufferManager = new BufferManager();