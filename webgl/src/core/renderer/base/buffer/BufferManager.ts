import { Matrix3 } from "../../../math/Matrix3";
import { Matrix4 } from "../../../math/Matrix4";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
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
const _vector = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector2();
export abstract class BufferAttribute {
    /**
     * 构造一个buffer对象
     * @param gl 
     * @param data 顶点数据（pos,uv,normal,切线，节点颜色，节点矩阵）
     * @param itemSize 一个单元数据有多少个数据组成
     * @param arrbufferType 顶点缓冲的类型
     * @param itemBytes 存储每一个数据的字节数
     * @param preAllocateLen  预先分配的长度 一般默认为0 否则第一次只是在显存中分配内存 后边才会更新和赋值到这块内存区域
     */
    constructor(gl: WebGLRenderingContext, data: Array<number>, itemSize: number, arrbufferType: number, elementBytes: number, preAllocateLen: number) {
        this.glID = gl.createBuffer();
        this._itemSize = itemSize;
        this.gl = gl;
        this._arrayBufferType = arrbufferType;
        this._elementBytes = elementBytes;
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
    private _sourceData: Array<number>;  //源数据
    private _elementBytes: number = 2;    //每个数据的存储字节数
    private _curMapTotalBytes: number;//当前map中含有的总的字节数
    private _itemSize: number = 0;     //在缓冲区中，一个单元有几个数据组成
    private _itemNums: number = 0;     //在缓冲区中，一共含有多少个单元(一个顶点就一个单元 一个法线叫一个单元 一个uv叫一个单元)
    private _itemOffset: number = 0;    //在缓冲区中，从哪一个位置开始存储这个数据
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
    public needsUpdate: boolean = true;//是否需要更新
    public needsMorphUpdate: boolean = false;//是否需要更新
    public isGLBufferAttribute: boolean = false;//
    public normalized: boolean;//是否归一化
    protected useDynamicUsage() {
        this._usage = syGL.BufferUsage.DYNAMIC;
    }
    //一个单元有多少个数据
    public get itemSize(): number {
        return this._itemSize;
    }
    //一共有多少个单元
    public get itemNums(): number {
        return this._itemNums;
    }
    public get count() {
        return this._itemNums;
    }
    //数据存储在显存的buffer的偏移地址
    public get itemOffset(): number {
        return this._itemOffset;
    }
    public get glID(): WebGLBuffer {
        return this._glID;
    }
    public set glID(glID: WebGLBuffer) {
        this._glID = glID;
    }
    private uploadData2GPU(data: Array<number>) {
        this._curMapTotalBytes = data.length * this._elementBytes;
        this._itemNums = data.length / this._itemSize;
        this.bufferSet();
        this._sourceData = data;
        var arr = this.getBytesArray();
        this.gl.bindBuffer(this._arrayBufferType, this.glID);
        this.gl.bufferData(this._arrayBufferType, new arr(this._sourceData), this._usage)
        this.needsUpdate = false;
    }
    public updateSubData(data: Float32Array, offset: number = 0): void {
        this.gl.bindBuffer(this._arrayBufferType, this.glID);
        let curByteLen = data.byteLength;
        if (this._hasAllocateByteLen < curByteLen) {
            //说明当前显存中对于这块数据的存储内存不够用了，需要加
            this.gl.bufferData(this._arrayBufferType, curByteLen, this._usage);
        }
        this.gl.bufferSubData(this._arrayBufferType, offset, data);
        this._hasAllocateByteLen = curByteLen;
        this._itemNums = data.length / this._itemSize;
        this._curMapTotalBytes = data.length * this._elementBytes;
        this.needsUpdate = false;
    }
    transformDirection(m: Matrix4) {
        for (let i = 0, l = this.count; i < l; i++) {
            _vector.x = this.getX(i);
            _vector.y = this.getY(i);
            _vector.z = this.getZ(i);
            _vector.transformDirection(m);
            this.setXYZ(i, _vector.x, _vector.y, _vector.z);
        }
        return this;
    }
    public applyNormalMatrix(m: Matrix3) {
        for (let i = 0, l = this.count; i < l; i++) {
            _vector.x = this.getX(i);
            _vector.y = this.getY(i);
            _vector.z = this.getZ(i);
            _vector.applyNormalMatrix(m);
            this.setXYZ(i, _vector.x, _vector.y, _vector.z);
        }
        return this;
    }
    public applyMatrix4(m: Matrix4) {
        for (let i = 0, l = this.count; i < l; i++) {
            _vector.x = this.getX(i);
            _vector.y = this.getY(i);
            _vector.z = this.getZ(i);
            _vector.applyMatrix4(m);
            this.setXYZ(i, _vector.x, _vector.y, _vector.z);
        }
        return this;
    }
    public update(): void {
        if (!this.needsUpdate) return;
        var arr = this.getBytesArray();
        this.gl.bindBuffer(this._arrayBufferType, this.glID);
        this.gl.bufferData(this._arrayBufferType, new arr(this._sourceData), this._usage)
        this.needsUpdate = false;
    }

    public updateMorph(mortphData: Array<number>): void {
        if (!this.needsMorphUpdate) return;
        var arr = this.getBytesArray();
        this.gl.bindBuffer(this._arrayBufferType, this.glID);
        this.gl.bufferData(this._arrayBufferType, new arr(mortphData), this._usage)
        this.needsMorphUpdate = false;
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
        switch (this._elementBytes) {
            case 1: return Uint8Array;
            case 2: return Uint16Array;
            case 4: return Float32Array;
            case 8: return Float64Array;
        }
    }
    ///---------------------------------------------------
    //获取源数据
    public get sourceData() {
        return this._sourceData;
    }
    getX(index) {
        return this._sourceData[index * this.itemSize];
    }
    setX(index, x) {
        this._sourceData[index * this.itemSize] = x;
        return this;
    }
    getY(index) {
        return this._sourceData[index * this.itemSize + 1];
    }
    setY(index, y) {
        this._sourceData[index * this.itemSize + 1] = y;
        return this;
    }
    getZ(index) {
        return this._sourceData[index * this.itemSize + 2];
    }
    setZ(index, z) {
        this._sourceData[index * this.itemSize + 2] = z;
        return this;
    }
    getW(index) {
        return this._sourceData[index * this.itemSize + 3];
    }
    setW(index, w) {
        this._sourceData[index * this.itemSize + 3] = w;
        return this;
    }
    public setXY(index, x, y) {
        index *= this.itemSize;
        this._sourceData[index + 0] = x;
        this._sourceData[index + 1] = y;
        return this;
    }
    public setXYZ(index, x, y, z) {
        index *= this.itemSize;
        this._sourceData[index + 0] = x;
        this._sourceData[index + 1] = y;
        this._sourceData[index + 2] = z;
        return this;
    }
    public setXYZW(index, x, y, z, w) {
        index *= this.itemSize;
        this._sourceData[index + 0] = x;
        this._sourceData[index + 1] = y;
        this._sourceData[index + 2] = z;
        this._sourceData[index + 3] = w;
        return this;
    }
    //--
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
export class VertexsBuffer extends BufferAttribute {
    constructor(gl, vertexs: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, vertexs, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//切线buffer
export class TangentsBuffer extends BufferAttribute {
    constructor(gl, tangents: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, tangents, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//索引buffer
export class IndexsBuffer extends BufferAttribute {
    constructor(gl, indexs: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, indexs, itemSize, gl.ELEMENT_ARRAY_BUFFER, 2, preAllocateLen);
    }
    bufferSet(): void {
        this.useDynamicUsage();
    }
}
//uvbuffer
export class UVsBuffer extends BufferAttribute {
    constructor(gl, uvs: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, uvs, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//法线buffer
export class NormalBuffer extends BufferAttribute {
    constructor(gl, normals: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, normals, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//顶点矩阵buffer
export class VertMatrixBuffer extends BufferAttribute {
    constructor(gl, matrix: Array<number>, itemSize: number, preAllocateLen: number) {
        super(gl, matrix, itemSize, gl.ARRAY_BUFFER, 4, preAllocateLen);
    }
    bufferSet() {
        this.useDynamicUsage();
    }
}
//顶点颜色buffer
export class VertColorBuffer extends BufferAttribute {
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
    private _mapTangentBuffer: Map<string, TangentsBuffer> = new Map();
    private _mapVertColorBuffer: Map<string, VertColorBuffer> = new Map();
    private _mapVertMatrixBuffer: Map<string, VertMatrixBuffer> = new Map();
    /**
     * 
     * @param type buffer类型
     * @param attributeId 属性id
     * @param data 顶点源数据
     * @param itemSize 一个单元的数据个数
     * @param preAllocateLen 
     */
    public createBuffer(type: SY.GLID_TYPE, attributeId: string, data: Array<number>, itemSize: number, preAllocateLen: number = 0): BufferAttribute {
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.TANGENT:
                itemSize = 4;
                return this.createTangent(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.INDEX:
                itemSize = 1;//(1,2,3,4)数组中每一个值代表一个顶点
                return this.createIndex(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.NORMAL:
                itemSize = 3;//(x,y,z)数组中每三个值代表一个法线
                return this.createNormal(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.UV:
                itemSize = 2;//(u,v)数组中每两个值代表一个uv坐标
                return this.createUV(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.VERT_COLOR:
                return this.createVertColor(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.VERT_MATRIX:
                return this.createMatrix(attributeId, data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION0:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION1:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION2:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION3:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION4:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION5:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION6:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION7:
                itemSize = 3; //(x,y,z)数组中每三个值代表顶点坐标
                return this.createVertex(this.getMorphTargetPositionId(type,attributeId), data, itemSize, preAllocateLen);
            default: break;
        }
    }
    public getBuffer(type: SY.GLID_TYPE, attributeId: string): BufferAttribute {
        switch (type) {
            case SY.GLID_TYPE.VERTEX:
                return this._mapVertexBuffer.get(attributeId);
            case SY.GLID_TYPE.TANGENT:
                return this._mapTangentBuffer.get(attributeId);
            case SY.GLID_TYPE.INDEX:
                return this._mapIndexBuffer.get(attributeId);
            case SY.GLID_TYPE.NORMAL:
                return this._mapNormalBuffer.get(attributeId);
            case SY.GLID_TYPE.UV:
                return this._mapUVBuffer.get(attributeId);
            case SY.GLID_TYPE.VERT_COLOR:
                return this._mapVertColorBuffer.get(attributeId);
            case SY.GLID_TYPE.VERT_MATRIX:
                return this._mapVertMatrixBuffer.get(attributeId);
            case SY.GLID_TYPE.MORPH_TARGET_POSITION0:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION1:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION2:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION3:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION4:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION5:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION6:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            case SY.GLID_TYPE.MORPH_TARGET_POSITION7:
                return this._mapVertexBuffer.get(this.getMorphTargetPositionId(type,attributeId));
            default: console.log("未知类型，请指明类型"); break;
        }
    }
    private getMorphTargetPositionId(glidType:SY.GLID_TYPE,attributeId:string){
       var id = 0;
       switch(glidType)
       {
        case SY.GLID_TYPE.MORPH_TARGET_POSITION0:
            id = 0;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION1:
            id = 1;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION2:
            id = 2;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION3:
            id = 3;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION4:
            id = 4;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION5:
            id = 5;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION6:
            id = 6;break;
        case SY.GLID_TYPE.MORPH_TARGET_POSITION7:
            id = 7;break;
       }
       return attributeId + "morphtarget"+ id;
    }
    private createVertex(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): VertexsBuffer {
        let buffer = new VertexsBuffer(this._gl, data, itemSize, preAllocateLen);
        this._mapVertexBuffer.set(id, buffer);
        return buffer;
    }
    private createTangent(id: string, data: Array<number>, itemSize: number, preAllocateLen: number): VertexsBuffer {
        let buffer = new TangentsBuffer(this._gl, data, itemSize, preAllocateLen);
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
    /**
     * 更新缓冲
     */
    public updateBuffer(): void {
        this._mapVertexBuffer.forEach((buffer, key) => {
            buffer.update();
        })
        this._mapIndexBuffer.forEach((buffer, key) => {
            buffer.update();
        })
        this._mapNormalBuffer.forEach((buffer, key) => {
            buffer.update();
        })
        this._mapUVBuffer.forEach((buffer, key) => {
            buffer.update();
        })
        this._mapTangentBuffer.forEach((buffer, key) => {
            buffer.update();
        })
        this._mapVertColorBuffer.forEach((buffer, key) => {
            buffer.update();
        })
        this._mapVertMatrixBuffer.forEach((buffer, key) => {
            buffer.update();
        })
    }
}
export var G_BufferManager = new BufferManager();