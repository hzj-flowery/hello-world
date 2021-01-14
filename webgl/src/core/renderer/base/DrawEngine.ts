import { RenderData } from "../data/RenderData";
import { glTEXTURE_UNIT_VALID } from "../gfx/GLEnums";
import { Shader } from "../shader/Shader";

/**
 * 绘制发动机
 */
class DrawEngine {
    constructor() {

    }
    private gl:WebGLRenderingContext;
    init(gl:WebGLRenderingContext):void{
       this.gl = gl;
    }
    /**
     * @param mode  绘制类型
     * @param count 索引的数目
     * @param type  每个索引数据的类型 此处gl.UNSIGNED_SHORT 表示2个字节
     * @param offset 绘制的数据在索引缓冲数组中的起始地址
     */
    private drawElements(mode:number,count:number,type:number,offset:number):void{
        let gl = this.gl;
        gl.drawElements(mode, count, type, offset);
    }
    /**
     * @param mode  绘制类型
     * @param first 绘制数据在顶点缓冲数组中的起始地址
     * @param count 一共有多少个顶点需要绘制
     */
    private drawArrays(mode:number,first:number,count:number):void{
        let gl = this.gl;
        gl.drawArrays(mode,first,count);
    }
    /**
     * 
     * @param mode 绘制类型
     * @param first 绘制数据在顶点缓冲数组中的起始地址
     * @param count 单个实例所包含的顶点数目
     * @param instanceCount 一共有多少个实例
     */
    private drawArraysInstanced(mode:number,first:number,count:number,instanceCount:number):void{
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
    private drawElementsInstanced(mode:number,count:number,type:number,offset:number,instanceCount: number):void{
        let gl = this.gl as WebGL2RenderingContext;
        gl.drawElementsInstanced(mode,count,type,offset,instanceCount)
    }
    public run(rd: RenderData, view, proj,shader:Shader): void {
        let gl = this.gl;
        rd.bindGPUBufferData(view, proj,shader);
        //绘制前
        rd._node ? rd._node.onDrawBefore(rd._time) : null;
        if (!rd._isDrawInstanced) {
            var indexglID = rd._indexGLID;
            indexglID != -1 ? (
                //绑定索引缓冲
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID),
                this.drawElements(rd._glPrimitiveType, rd._indexItemNums, gl.UNSIGNED_SHORT, 0)
            ) : (
                    this.drawArrays(rd._glPrimitiveType, 0, rd._vertItemNums)
                )
        }
        else {
            var indexglID = rd._indexGLID;
            
            !indexglID == true ? this.drawArraysInstanced(
                rd._glPrimitiveType,
                0,             // offset
                rd._drawInstancedVertNums,   // num vertices per instance
                rd._drawInstancedNums,  // num instances
            ) : (
                    //绑定索引缓冲
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID),
                    this.drawElementsInstanced(rd._glPrimitiveType, rd._indexItemNums, gl.UNSIGNED_SHORT, 0, rd._drawInstancedNums)
                )
        }
        //解除缓冲区对于目标纹理的绑定
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        rd._shader.disableVertexAttribArray();
        //绘制后
        rd._node ? rd._node.onDrawAfter(rd._time) : null;
    }
    
    /**
     * 获取shader中变量的位置
     * @param glID shader在显存中的地址
     * @param varName 变量名
     */
    public getAttribLocation(glID:WebGLShader,varName:string):number{
       return this.gl.getAttribLocation(glID, varName);
    }

    public useProgram(glID:WebGLShader):void{
        this.gl.useProgram(glID);
    }

    /**
     * 设置一个uniform的float变量
     * @param loc 
     * @param v 
     */
    public setUniform1f(loc:number,v:number):void{
        this.gl.uniform1f(loc, v);
    }
    /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
    public setUniformMatrix(loc:number,matrix:Float32Array):void{
        this.gl.uniformMatrix4fv(loc, false, matrix);
    }
    /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
    public setUniformFloatVec3(loc:number,arr:Array<number>):void{
        this.gl.uniform3fv(loc, arr);
    }
    /**
     * 设置shader中Uniform变量的值
     * 在着色器中此值相当于const 不可以修改
     * 另外在顶点和片段着色器中如果同时声明一样，则都可以使用
     * @param loc shader中变量的位置
     * @param matrix 矩阵数据
     */
    public setUniformFloatVec4(loc:number,arr:Array<number>):void{
        this.gl.uniform4fv(loc, arr);
    }
    
    /**
     * 此函数的作用是激活纹理单元
     * @param glID 纹理单元在显存的地址
     * @param loc shader中变量的位置
     * @param pos 具体要使用那块纹理
     */
    public active2DTexture(glID:WebGLTexture,loc:number,pos:number):void{
         /**
          * activeTexture必须在bindTexture之前。如果没activeTexture就bindTexture，会默认绑定到0号纹理单元
        */
        let gl = this.gl;
        // 激活 指定 号纹理单元
        gl.activeTexture(gl[glTEXTURE_UNIT_VALID[pos]]);
        // 指定当前操作的贴图
        gl.bindTexture(gl.TEXTURE_2D, glID);
        //将贴图的纹理数据赋给shader中的变量
        gl.uniform1i(loc, pos);
    }
     /**
     * 此函数的作用是激活纹理单元
     * @param glID 纹理单元在显存的地址
     * @param loc shader中变量的位置
     * @param pos 具体要使用那块纹理
     */
    public activeCubeTexture(glID:WebGLTexture,loc:number,pos:number):void{
        /**
         * activeTexture必须在bindTexture之前。如果没activeTexture就bindTexture，会默认绑定到0号纹理单元
       */
       let gl = this.gl;
       if(glID)
       {
            // 激活 指定 号纹理单元
            gl.activeTexture(gl[glTEXTURE_UNIT_VALID[pos]]);
            // 指定当前操作的贴图
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, glID);
       }
       else
       {
           //默认使用上次的纹理单元
       }
       //将贴图的纹理数据赋给shader中的变量
       gl.uniform1i(loc, pos);
   }
   
   /**
    * 关闭shader当前位置的变量对于数组缓冲中数据的使用
    * @param loc 
    */
   public disableVertexAttribArray(loc:number):void{
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
    public activeVertexAttribArray(glID:WebGLBuffer,loc:number,itemSize:number):void{
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
    public activeMatrixVertexAttribArray(glID:WebGLBuffer,loc:number,itemSize:number):void{
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
            this.enableVertexAttribArray(locTemp,itemSize,gl.FLOAT,false,bytesPerMatrix,offset)
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
    private enableVertexAttribArray(loc,itemSize,type,normalized:boolean=false,stride:number=0,offset:number=0):void{
        let gl = this.gl;
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, itemSize,type,normalized,stride,offset);
    }
}
export var G_DrawEngine = new DrawEngine();