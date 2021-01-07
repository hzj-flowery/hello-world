import { RenderData } from "../data/RenderData";

/**
 * 绘制发动机
 */
class DrawEngine {
    constructor() {

    }
    public run(rd: RenderData, gl: WebGL2RenderingContext, view, proj): void {
        rd.bindGPUBufferData(view, proj);
        //绘制前
        rd._node ? rd._node.onDrawBefore(rd._time) : null;
        if (!rd._isDrawInstanced) {
            var indexglID = rd._indexGLID;
            indexglID != -1 ? (
                //绑定索引缓冲
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID),
                /**
                 * 绘制类型
                 * 索引的数目
                 * 每个索引数据的类型 此处gl.UNSIGNED_SHORT 表示2个字节
                 * 绘制的数据在索引缓冲数组中的起始地址
                 */
                gl.drawElements(rd._glPrimitiveType, rd._indexItemNums, gl.UNSIGNED_SHORT, 0)
            ) : (
                    /**
                     * 绘制类型
                     * 绘制数据在顶点缓冲数组中的起始地址
                     * 一共有多少个顶点需要绘制
                     */
                    gl.drawArrays(rd._glPrimitiveType, 0, rd._vertItemNums))
        }
        else {
            var indexglID = rd._indexGLID;
            /**
             * 绘制类型
             * 绘制数据在顶点缓冲数组中的起始地址
             * 单个实例所包含的顶点数目
             * 一共有多少个实例
             */
            !indexglID == true ? gl.drawArraysInstanced(
                rd._glPrimitiveType,
                0,             // offset
                rd._drawInstancedVertNums,   // num vertices per instance
                rd._drawInstancedNums,  // num instances
            ) : (
                    //绑定索引缓冲
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexglID),
                    /**
                     * 绘制类型
                     * 索引的数目
                     * 每个索引数据的类型 此处设置gl.UNSIGNED_SHORT，这个表示两个字节代表一个数据
                     * 绘制数据在索引缓冲数组中的起始地址
                     * 一共有多少个实例
                     */
                    gl.drawElementsInstanced(rd._glPrimitiveType, rd._indexItemNums, gl.UNSIGNED_SHORT, 0, rd._drawInstancedNums)
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
}
export var G_DrawEngine = new DrawEngine();