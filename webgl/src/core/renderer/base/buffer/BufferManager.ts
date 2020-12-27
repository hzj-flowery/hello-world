import { SY } from "../Sprite";

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
    constructor(gl: WebGLRenderingContext,
        data: Array<number>,
        itemSize: number,
        arrbufferType: number,
        itemBytes: number) {
        this._glID = gl.createBuffer();
        this.itemSize = itemSize;
        this.itemNums = data.length / itemSize;
        this.gl = gl;
        this._arrayBufferType = arrbufferType;
        this._itemBytes = itemBytes;
        // //默认使用以下数据
        this._usage = gl.STATIC_DRAW;
        this._curMapTotalBytes = 0;
        this.pushData(data);
    }
    private _mapSourceData: Map<number, Array<number>> = new Map();//源数据
    private _itemBytes: number = 2;    //每个数据的存储字节数
    private _curMapTotalBytes: number;//当前map中含有的总的字节数
    itemSize: number = 0;     //在缓冲区中，一个单位数据有几个数据组成
    itemNums: number = 0;     //在缓冲区中，单位数据的数目
    _glID: WebGLBuffer;//显存存储数据的地址
    private _arrayBufferType: number;//缓冲区的类型
    private _usage: number;
    protected gl: WebGLRenderingContext;

    protected useDynamicUsage() {
        this._usage = this.gl.DYNAMIC_DRAW;
    }
    public pushData(data: Array<number>) {
        //将数据放置在map中
        this._mapSourceData.set(this._curMapTotalBytes, data);
        this._curMapTotalBytes = this._curMapTotalBytes + data.length * this._itemBytes;
        this.uploadData2GPU();
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
    constructor(gl, vertexs: Array<number>, itemSize: number) {
        super(gl, vertexs, itemSize, gl.ARRAY_BUFFER, 4);

    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//索引buffer
export class IndexsBuffer extends glBaseBuffer {
    constructor(gl, indexs: Array<number>, itemSize: number) {
        super(gl, indexs, itemSize, gl.ELEMENT_ARRAY_BUFFER, 2);
    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//uvbuffer
export class UVsBuffer extends glBaseBuffer {
    constructor(gl, uvs: Array<number>, itemSize: number) {
        super(gl, uvs, itemSize, gl.ARRAY_BUFFER, 4);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//法线buffer
export class NormalBuffer extends glBaseBuffer {
    constructor(gl, normals: Array<number>, itemSize: number) {
        super(gl, normals, itemSize, gl.ARRAY_BUFFER, 4);
    }
    bufferSet() {
        this.useDynamicUsage();
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
    public createBuffer(type:SY.GLID_TYPE, materialId: string = "default", data: Array<number>, itemSize: number): glBaseBuffer {
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                return this.createVertex(materialId, data, itemSize);
            case SY.GLID_TYPE.INDEX:
                return this.createIndex(materialId, data, itemSize);
            case SY.GLID_TYPE.NORMAL:
                return this.createNormal(materialId, data, itemSize);
            case SY.GLID_TYPE.UV:
                return this.createUV(materialId, data, itemSize);
            default: break;
        }
    }
    private createVertex(id: string, data: Array<number>, itemSize: number): VertexsBuffer {
        let buffer = new VertexsBuffer(this._gl, data, itemSize);
        this._mapVertexBuffer.set(id, buffer);
        return buffer;
    }
    private createIndex(id: string, data: Array<number>, itemSize: number): IndexsBuffer {
        let buffer = new IndexsBuffer(this._gl, data, itemSize);
        this._mapIndexBuffer.set(id, buffer);
        return buffer;
    }
    private createNormal(id: string, data: Array<number>, itemSize: number): NormalBuffer {
        let buffer = new NormalBuffer(this._gl, data, itemSize);
        this._mapNormalBuffer.set(id, buffer);
        return buffer;
    }
    private createUV(id: string, data: Array<number>, itemSize: number): UVsBuffer {
        let buffer = new UVsBuffer(this._gl, data, itemSize);
        this._mapUVBuffer.set(id, buffer);
        return buffer;
    }
}

export var G_BufferManager = new BufferManager();