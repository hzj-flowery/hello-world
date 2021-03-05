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

常用函数：
角度函数和三角函数
WebGL着色器内置函数三角函数，名称和初高中数学写法基本一致，函数参数是角度的弧度值，函数参数数据类型是浮点数float
radians()	角度值转弧度值
degrees()	弧度值转角度值
sin(弧度)	正弦值
cos(弧度)	余弦值
tan(弧度)	正切值
asin()	反正弦值(弧度)
acos()	反余弦值(弧度)
atan()	反正切值(弧度)
几何函数
内置函数几何函数主要是与几何相关计算的函数，比如计算两点之间的距离，计算两个向量的叉乘、点乘
length(a)	向量a长度
distance(a,b)	a、b两点之间距离
dot(a,b)	两向量点积
cross(a,b)	两向量叉乘
normalize(a)	向量a归一化,长度变为1，方向不变，即返回值单位向量
faceforward(a,b,c)	向量朝前：如果c、b两向量点乘小于0(dot(c,b) < 0)，则返回a，否则返回-a
reflect(Ru,Fa) 或 reflect(Ru,Fa,Zh)	向量反射：比如通过入射光计算反射光方向向量,Fa表示反射平面的法线方向(单位向量)，Ru表示入射光线的方向(单位向量)，Zh表示折射率
指数函数
着色器常见内置函数可以参考数学或javascript语言
pow(x,n)	x的n次幂函数
exp(x)	x的自然指数e
log(x)	x自然对数
exp2(x)	2的指数x
log2()	对数函数，底数为2
sqrt()	平方根
inversesqrt()	平方根倒数
通用函数
内置函数	功能
abs(x)	绝对值
sign(x)	判断参数符号，x是正数返回1.0；x是0.0返回0.0，x是负数返回-1.0
floor(x)	取整，向下取整
ceil(x)	取整，向上取整
fract(x)	返回x小数部分
min(a,b)	比较大小，返回较小的值
max(a,b)	比较大小，返回较大的值
mod(x,y)	表示x–y*floor(x/y)
clamp(x,min,max)	规整输入值,x与min和max比较大小返回中间大小的值，运算规则：min (max (x, min), max)
mix(m,n,k)	线性插值计算,插值区间[m,n],插值系数k，插值计算公式：m*(1-k)+n*k
向量关系函数
着色器向量关系函数和javascript关系函数类似，区别在于着色器向量关系函数不是直接比较两个数的大小，而是对两个向量的每个元素都进行比较。
比较函数返回值是true或flase
lessThan(x,y)	x是否小于y ,参数是vec或ivec
lessThanEqual(x,y)	x是否小于或等于y,参数是vec或ivec
greaterThan(x,y)	x是否大于y ,参数是vec或ivec
greaterThanEqual(x,y)	x是否大于或等于y,参数是vec或ivec
equal(x,y)	x是否等于y，向量每个分量是否都相等,参数是vec或ivec
any(x)	x向量是否存在一个分量是true，参数是bvec
all(x)	x向量所有分量是否全部为true ，参数是bvec
not(x)	x所有分量执行逻辑非运算 ，参数是bvec
纹理采样函数
纹理采用函数主要用于处理WebGL的纹理贴图，根据uv坐标从图像上获取像素值
texture2D()	2D纹理
textureCube()	立方体纹理
参数1-sampler：第一个参数是sampler2D数据类型
参数2-uv：第二个参数是vec2类型，表示纹理贴图的UV坐标
参数3-k：第三个参数是可选参数，类型是浮点数float，在为具有mipmap的纹理计算适当的细节级别之后，在执行实际纹理查找操作之前添加偏差。
vec4 texture2D(sampler,uv)  
vec4 texture2D(sampler,uv,k)
vec4 textureCube(sampler,uv)  
vec4 textureCube(sampler,uv,k)
WebGL实现图片作为纹理贴图的片元着色器部分代码
// 接收插值后的纹理坐标
varying vec2 v_TexCoord;
// 纹理图片像素数据
uniform sampler2D u_Sampler;
void main() {
  // 采集纹素，逐片元赋值像素值
  gl_FragColor = texture2D(u_Sampler,v_TexCoord);
}


`

