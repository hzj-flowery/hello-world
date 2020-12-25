`
drawcall:CPU给GPU发送一次渲染数据
overdraw:GPU对同一个像素位置的顶点绘制次数

混合：
透明和不透明物体共存
实现 a 混合最简单的方式是屏蔽掉隐藏面消除功能，即去掉 gl.enable(gl.DEPTH_TEST)，
但关闭隐藏面消除功能是一个粗暴的解决方案，并不能满足实际需求。其实可通过某些机制，同时实现隐藏面消除和半透明效果，步骤如下
//1.开启隐藏面消除功能:
gl.enable(gl.DEPTH_TEST)。

//2.绘制所有不透明的物体(a == 1.0)

//3.锁定深度缓冲区的写入操作，使之只读 (深度缓冲区用于隐藏面消除):
gl.depthMask(false);

//4.绘制所有半透明的物体 a < 1.0，注意将物体按深度排序，a 最小最先绘制

//5.释放深度缓冲区，使之可读可写: 
gl.depthMask(true)
gl.depthMask(mask)
锁定或释放深度缓冲区的写入操作

mask: 锁定深度缓冲区的写入操作 false，释放 true
if(i < 4){ // 非透明物体
    gl.depthMask(true);
    gl.disable(gl.BLEND);
} else { //透明物体
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
}
drawBufferInfo(gl, vao);
`