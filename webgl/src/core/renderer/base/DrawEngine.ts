import { Rect } from "../../value-types/rect";
import Vec4 from "../../value-types/vec4";
import { syRender } from "../data/RenderData";
import { syGL } from "../gfx/syGLEnums";
import { Shader } from "../shader/Shader";

/**
 * 顶点信息：
 *         名称      单元数目
 * --------位置------[x,y,z]------------数组
 * --------法线------[x,y,z]------------数组
 * --------切线------[x,y]--------------数组
 * --------uv--------[u,v]-------------数组
 */

/**
 * 绘制发动机
 */
class DrawEngine {
    constructor() {

    }
    private gl: WebGL2RenderingContext;
    init(gl: WebGL2RenderingContext): void {
        this.gl = gl;
    }
    
    /**
     * 当清空颜色缓冲区的时候
     * 设置用什么颜色来替换颜色缓冲中的颜色
     * @param red 
     * @param green 
     * @param blue 
     * @param alpha 
     */
    public clearColor(red:number,green:number,blue:number,alpha:number):void{
        let gl = this.gl;
        gl.clearColor(red,green,blue,alpha);
    }
    /**
     * 清空缓冲
     * mask值包括：
     * 颜色缓冲(gl.COLOR_BUFFER_BIT)，
     * 深度缓冲(gl.DEPTH_BUFFER_BIT)，
     * 模板缓冲(gl.STENCIL_BUFFER_BIT)，
     * 以及这三种任意组合
     * 类似gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT：表示清除颜色和深度两个附件缓冲区
     * 
     * @param mask 
     */
    public clear(mask:number):void{
        let gl = this.gl;
        gl.clear(mask);
    }
    
    /**
     * 清空缓冲
     * @param color  选择指定的颜色来替换颜色缓冲中的颜色
     * @param mask 
     */
    public clearBuffer(color:Vec4,mask:number):void{
        this.clearColor(color.x,color.y,color.z,color.w);
        this.clear(mask);
    }
    /**
     * 设置视口
     * 将屏幕想象成一个矩形
     * 坐标系的原点在屏幕的左下角
     * 尺寸为(screenWidth,screenHeight)
     * 下面这个函数就是要把绘制结果显示在这个矩形的指定区域
     * 如果设置的矩形原点和屏幕原点重合，宽高都和屏幕的宽高相等，则1：1显示
     * 否则会相应的缩放显示
     * @param x 绘制原点x坐标
     * @param y 绘制原点y坐标
     * @param width 绘制的宽度
     * @param height 绘制的高度
     */
    public viewport(x:number,y:number,width:number,height:number):void{
        this.gl.viewport(x,y, width,height);
    }

    

    
    /**
     * @param mode  绘制类型
     * @param count 索引的数目
     * @param type  每个索引数据的类型 此处gl.UNSIGNED_SHORT 表示2个字节
     * @param offset 绘制的数据在索引缓冲数组中的起始地址
     */
    private drawElements(mode: number, count: number, type: number, offset: number): void {
        let gl = this.gl;
        gl.drawElements(mode, count, type, offset);
    }
    /**
     * @param mode  绘制类型
     * @param first 绘制数据在顶点缓冲数组中的起始地址
     * @param count 一共有多少个顶点需要绘制
     */
    private drawArrays(mode: number, first: number, count: number): void {
        let gl = this.gl;
        gl.drawArrays(mode, first, count);
    }
    /**
     * 
     * @param mode 绘制类型
     * @param first 绘制数据在顶点缓冲数组中的起始地址
     * @param count 单个实例所包含的顶点数目
     * @param instanceCount 一共有多少个实例
     */
    private drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void {
        let gl = this.gl as WebGL2RenderingContext;
        gl.drawArraysInstanced(
            mode,
            first,             // offset
            count,   // num vertices per instance
            instanceCount,  // num instances
        )
    }
    /**
     * 
     * @param mode  绘制类型
     * @param count 索引的数目
     * @param type  每个索引数据的类型 此处设置gl.UNSIGNED_SHORT，这个表示两个字节代表一个数据
     * @param offset 绘制数据在索引缓冲数组中的起始地址
     * @param instanceCount 一共有多少个实例
     */
    private drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void {
        let gl = this.gl as WebGL2RenderingContext;
        gl.drawElementsInstanced(mode, count, type, offset, instanceCount)
    }
    public run(rd: syRender.BaseData, view, proj, shader: Shader): void {
        if (!shader) 
        {
            return;
        }

        let gl = this.gl;
        
        rd.node?rd.node.onBindGPUBufferDataBefore(rd,view,proj):null;
        //绑定状态机数据
        rd.bindGPUBufferData(view, proj, shader);


        //绘制前
        rd.node ? rd.node.onDrawBefore(rd.time,rd) : null;
        if (!rd.isDrawInstanced) {
            var indexglID = rd.primitive.index.glID;
            indexglID != -1 ? (
                //绑定索引缓冲
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID),
                this.drawElements(rd.primitive.type, rd.primitive.index.itemNums, gl.UNSIGNED_SHORT, 0)
            ) : (
                    this.drawArrays(rd.primitive.type, 0, rd.primitive.vert.itemNums)
                )
        }
        else {
            var indexglID = rd.primitive.index.glID;

            !indexglID == true ? this.drawArraysInstanced(
                rd.primitive.type,
                0,             // offset
                rd.primitive.instancedVertNums,   // num vertices per instance
                rd.primitive.instancedNums,  // num instances
            ) : (
                    //绑定索引缓冲
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID),
                    this.drawElementsInstanced(rd.primitive.type, rd.primitive.index.itemNums, gl.UNSIGNED_SHORT, 0, rd.primitive.instancedNums)
                )
        }
        //解除缓冲区对于目标纹理的绑定
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        rd.shader.disableVertexAttribArray();
        //绘制后
        rd.node ? rd.node.onDrawAfter(rd.time) : null;
    }

    /**
     * 获取shader中变量的位置
     * @param glID shader在显存中的地址
     * @param varName 变量名
     */
    public getAttribLocation(glID: WebGLProgram, varName: string): number {
        return this.gl.getAttribLocation(glID, varName);
    }

    public useProgram(glID: WebGLProgram): void {
        this.gl.useProgram(glID);
    }

    /**
     * 设置一个uniform的float变量
     * @param loc 
     * @param v 
     */
    public setUniform1f(loc: number, v: number): void {
        this.gl.uniform1f(loc, v);
    }
    /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
    public setUniformMatrix(loc: number, matrix: Float32Array): void {
        //false参数表示不需要转置（行变列，列变行）这个矩阵，WebGL要求这个参数必须设置为false
        this.gl.uniformMatrix4fv(loc, false, matrix);
    }
    /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
    public setUniformFloatVec3(loc: number, arr: Array<number>): void {
        this.gl.uniform3fv(loc, arr);
    }
    /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
    public setUniformFloatVec4(loc: number, arr: Array<number>): void {
        this.gl.uniform4fv(loc, arr);
    }

       /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
        public setUniform1i(loc: number, p:number): void {
            this.gl.uniform1i(loc, p);
        }
    
    /**
     * 此函数的作用是激活纹理单元
     * 在GPU显存中，有若干块显存专门用来存放纹理数据
     * 我们在使用的时候，必须要激活指定具体使用那块显存，然后给这块显存绑定纹理数据，以及绑定shader变量和这块纹理的使用关系
     * 我们在一次绘制中可以使用多块纹理
     * 
     *  我们将纹理从本地加载到内存再从内存发送到显存 ，此时在显存中的纹理并不是活动纹理
     *  只有我们想使用它的时候，将其放入插槽中，它才是活动纹理
     *   一般在GPU中会为我们预留八个插槽来存放活动纹理
     *   当我们要使用某个纹理时，可以把纹理丢尽指定插槽中，然后再shader中可以访问这个纹理
     * 
     * 关于纹理的类型也要说一下，一般是2d纹理，这个比较简单，就是一个纹理，如果是立方体纹理的化，这个会稍微有点绕，但其实
     * 立方体纹理与2d纹理几乎是一样的，关于立方体的使用，我们也是在显存中创建一个立方体纹理，然后再创建六个2d纹理，与这个立方体纹理关联
     * 我们在激活这个立方体纹理的时候，只是把这个立方体纹理放入插槽中即可，不需要将与这个立方体关联的6个2d纹理也放入插槽中，
     * 普通2d纹理和立方体纹理的区别就是：
     * 普通2d纹理是有纹理数据的，而立方体纹理本身是没有纹理数据的，它的纹理数据存储在和它关联的六个2d纹理中
     * 普通2d纹理和立方体纹理的共同点就是：他们共用纹理插槽，激活方式完全一模一样
     *  
     * * [0][texture]
     * * [1][texture]
     * * [2][texture]
     *   ...
     *   [8][texture]
     * @param target  TEXTURE_2D|TEXTURE_CUBE_MAP
     * @param glID 纹理单元在显存的地址
     * @param loc  shader中变量的位置
     * @param pos  具体要使用那块纹理
     */
    public activeTexture(target:number,glID: WebGLTexture, loc: number, pos: number):void{
         /**
           * activeTexture必须在bindTexture之前。如果没activeTexture就bindTexture，会默认绑定到0号纹理单元
         */
        let gl = this.gl;
        // 激活 指定 号纹理单元
        //在GPU那边有若干个纹理单元 下面这句话的意思就是说激活那个纹理单元
        gl.activeTexture(gl[syGL.TextureValidUnit[pos]]);
        // 指定当前操作的贴图
        //将纹理贴图的显存地址放入到刚刚激活的纹理单元中
        gl.bindTexture(target, glID);
        //将贴图的纹理数据赋给shader中的变量
        //我们的shader变量要从那一块纹理单元中取数据
        gl.uniform1i(loc, pos);
    }

    /**
     * 关闭shader当前位置的变量对于数组缓冲中数据的使用
     * @param loc 
     */
    public disableVertexAttribArray(loc: number): void {
        this.gl.disableVertexAttribArray(loc);
    }

    /**
    * 此函数的作用是要告诉GPU做下面三件事
    * 1：当前要操作的数组缓冲是那个，这个缓冲其实就是一个数组
    * 2：把这个数组缓冲复制给顶点着色器的那个变量
    * 3：在赋值的时候，取多少个数据为一个单元
    * 此处关于每个数据的类型默认设置为float,即一个数据有4个字节组成
    * @param glID    数组缓冲的显存地址
    * @param loc     shader中变量的位置
    * @param itemSize 一个单元的数据数目
    */
    public activeVertexAttribArray(glID: WebGLBuffer, loc: number, itemSize: number): void {
        if(!(glID instanceof WebGLBuffer))
        {
            return;
        }
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, glID);
        this.enableVertexAttribArray(loc, itemSize, gl.FLOAT, false, 0, 0);
    }
    /**
     * 这是一个矩阵数组缓冲，它和普通数组缓冲略有区别
    * 此函数的作用是要告诉GPU做下面三件事
    * 1：当前要操作的数组缓冲是那个，这个缓冲其实就是一个数组
    * 2：把这个数组缓冲复制给顶点着色器的那个变量
    * 3：在赋值的时候，取多少个数据为一个单元
    * 此处关于每个数据的类型默认设置为float,即一个数据有4个字节组成
    * @param glID    数组缓冲的显存地址
    * @param loc     shader中变量的位置
    * @param itemSize 一个单元的数据数目
    */
    public activeMatrixVertexAttribArray(glID: WebGLBuffer, loc: number, itemSize: number): void {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, glID);
        const bytesPerMatrix = 4 * 16;
        // set all 4 attributes for matrix
        // 解析 
        // 每一个矩阵的大小是四行四列，矩阵中元素的类型是gl.FLOAT,即元素占用四个字节
        // 所以一个矩阵的占用字节数为4*4*4
        // 关于矩阵在shader中的位置计算，可以把矩阵想象成一个一维数组，元素类型是vec4
        // matrixLoc:表示矩阵的第1行在shader中的位置
        // matrixLoc+1:表示矩阵的第2行在shader中的位置
        // matrixLoc+2:表示矩阵的第3行在shader中的位置
        // matrixLoc+3:表示矩阵的第4行在shader中的位置    
        for (let i = 0; i < 4; ++i) {
            const locTemp = loc + i;
            // note the stride and offset
            const offset = i * 16;  // 4 floats per row, 4 bytes per float
            this.enableVertexAttribArray(locTemp, itemSize, gl.FLOAT, false, bytesPerMatrix, offset)
        }
    }
    /**
     * 
     * @param loc    shader中变量的位置
     * @param itemSize 一个单元包含几个数据
     * @param type    数据的类型
     * @param normalized 是否归一化
     * @param stride 管道字节数 默认为0表示数据是紧密存放的
     * @param offset 单元偏移，注意这个不是以字节为单位的，它是以单元为单位的
     */
    private enableVertexAttribArray(loc:number, itemSize:number, type:number, normalized: boolean = false, stride: number = 0, offset: number = 0): void {
        let gl = this.gl;
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, itemSize, type,normalized, stride, offset);
    }

    /**
     * 激活实例化绘制对于顶点数据的读取
     * @param loc shader变量的显存地址
     * @param instanceNum 每一波数据对应实例化的数量
     * @param isMatrix  是否是矩阵
     */
    public vertexAttribDivisor(loc: number, instanceNum: number = 1, isMatrix: boolean = false): void {
        let gl = this.gl as WebGL2RenderingContext;
        if (isMatrix) {
            for (let i = 0; i < 4; ++i) {
                const locp = loc + i;
                // this line says this attribute only changes for each 1 instance
                gl.vertexAttribDivisor(locp, instanceNum);
            }
        }
        else {
            // this line says this attribute only changes for each 1 instance
            gl.vertexAttribDivisor(loc, instanceNum);

        }
    }
    /**
     * 关闭实例化绘制对于顶点数据的读取
     * @param loc  shader变量的显存地址
     * @param isMatrix 
     */
    public disableVertexAttribArrayDivisor(loc: number, isMatrix: boolean = false): void {
        let gl = this.gl as WebGL2RenderingContext;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (isMatrix) {
            gl.vertexAttribDivisor(loc, 0);
        }
        {
            for (let i = 0; i < 4; ++i) {
                const locp = loc + i;
                gl.vertexAttribDivisor(locp, 0);
            }
        }
        gl.disableVertexAttribArray(loc);
    }
    
    /**
     * 获取shader中的一些参数
     * 
     * @param program 
     * @param pname 
     * gl.ACTIVE_UNIFORMS ：获取shader中有效的uniform变量的数量 return 数量 
     * gl.ACTIVE_ATTRIBUTES : 获取shader中有效的attribute变量的数量 return 数量
     * @returns 
     */
    public getProgramParameter(program:WebGLProgram,pname:number):any{
        let gl = this.gl as WebGL2RenderingContext;
        return gl.getProgramParameter(program,pname)
    }
    /**
     * 获取shader中指定位置激活的uniform变量的信息
     * @param program 
     * @param index 
     */
    public getActiveUniform(program: WebGLProgram, index: number):any{
        let gl = this.gl as WebGL2RenderingContext;
        return gl.getActiveUniform(program, index);
    }
    /**
     * 获取shader中指定位置激活的attribute变量的信息
     * @param program 
     * @param index 
     */
    public getActiveAttrib(program: WebGLProgram, index: number):any{
        let gl = this.gl as WebGL2RenderingContext;
        return gl.getActiveAttrib(program, index);
    }
    
    /**
     * 获取shader中uniform变量的位置
     * @param program 
     * @param name shader代码中相关变量的名字
     * @returns 
     */
    public getUniformLocation(program: WebGLProgram, name: string):WebGLUniformLocation{

        return this.gl.getUniformLocation(program,name)
    }
}
export var G_DrawEngine = new DrawEngine();