#ifdef SY_HIGH_PRECISION
precision highp float;
#elif defined(SY_MEDIUM_PRECISION)
precision mediump float;
#elif defined(SY_LOW_PRECISION)
precision lowp float;
#else
precision mediump float;
#endif

//分解保存深度值
vec4 pack (float depth) {
    // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
    const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
    // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
    vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
    rgbaDepth -= rgbaDepth.rgba * bitMask; // Cut off the value which do not fit in 8 bits
    return rgbaDepth;
}

void main(){
    gl_FragColor=pack(gl_FragCoord.z);
}
/*
感受：
屏幕是一张大图Screen（width,height）
每一次调用片元着色器其实就是往这个数组里写数据
指定位置写数据，这个当前位置就是当前点的屏幕坐标位置，点源自于三角形，三角形源自于面，面源自模型
想要将一个模型的某一个数据写入到渲染纹理中
屏幕的宽：20
屏幕的高：10
....................
.                  .
.                  .
.                  .
.                  .
.                  .
.                  .
.                  .
.                  .
....................
纹理的宽：20
纹理的高：10
....................
.                  .
.                  .
.                  .
.                  .
.                  .
.                  .
.                  .
.                  .
....................
将纹理贴到屏幕上，屏幕坐标和纹理的uv坐标对应即可，那这张纹理就会完整的显示在屏幕上
重点：凡是继承sprite2D这个类的，系统会为其自动计算uv坐标
无论是离线渲染还是延迟渲染，他们将各种数据渲染到一张纹理上，当我们希望显示这张纹理的时候，势必会将这张纹理依附在某个2d节点上
使用2d节点显示一张纹理，就是用四个点和内置的uv即可，如果这个节点的尺寸和屏幕的宽高比将决定展示的缩放情况
务必切记：想要取纹理的数据，只能根据自己节点的uv去拿，我们将结果渲染到纹理上，只是一个纹理而已，

*/