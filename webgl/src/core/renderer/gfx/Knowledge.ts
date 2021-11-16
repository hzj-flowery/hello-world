`
drawcall:CPU给GPU发送一次渲染数据
overdraw:GPU对同一个像素位置的顶点绘制次数

纹理值的范围是：【0,1】
向量值的范围是：【-1,1】

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

#--------------------精度
顶点着色器
precision highp float;
precision highp int;
precision lowp sampler2D;
precision lowp samplerCube;
片元着色器
precision mediump int;
precision lowp sampler2D;
precision lowp samplerCube;


/**
 * 物体呈现出颜色亮度就是表面的反射光导致，计算反射光公式如下：
<表面的反射光颜色> = <漫反射光颜色> + <环境反射光颜色> + <镜面反射光颜色>

1. 其中漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * <光线入射角度>

光线入射角度可以由光线方向和表面的法线进行点积求得：
<光线入射角度> = <光线方向> * <法线方向>

最后的漫反射公式如下：
<漫反射光颜色> = <入射光颜色> * <表面基底色> * (<光线方向> * <法线方向>)

2. 环境反射光颜色根据如下公式得到：
<环境反射光颜色> = <入射光颜色> * <表面基底色>

3. 镜面（高光）反射光颜色公式，这里使用的是冯氏反射原理
<镜面反射光颜色> = <高光颜色> * <镜面反射亮度权重> 

其中镜面反射亮度权重又如下
<镜面反射亮度权重> = (<观察方向的单位向量> * <入射光反射方向>) ^ 光泽度
 */

/**
* 光照知识1：
* 使用环境光源的时候，需要注意颜色的亮度。环境光照的是全部，比如上面的代码中指定的0.1，如果全都换成1.0的话，模型就会变成全白了。和平行光源不一样，所以要注意。
  环境光的颜色，最好是限制在0.2左右以下
* 环境光，模拟了自然界的光的漫反射，弥补了平行光源的缺点。一般，这两种光会同时使用。只使用环境光的话，无法表现出模型的凹凸，只使用平行光源的话，阴影过于严重无法分清模型的轮廓
  环境光是没有方向的
*/

内置api解析
第一个通用函数：float abs(float x)
此函数会返回x的无符号绝对值，即如果x大于0则返回x，否则返回-x。

第二个通用函数：float sign(float x)
此函数又称为符号函数，如果x>0返回1.0，如果x=0返回0.0，否则返回-1.0

第三个通用函数：float floor(float x)
此函数会返回小于等于x并且最接近x的整数，通俗来说就是像下取整。

第四个通用函数：float ceil(float x)
此函数会返回大于等于x并且最接近x的整数，通俗来说就是向上取整。

第五个通用函数：float fract(float x)
此函数会返回x的小数部分，即x-floor(x)。

第六个通用函数：float mod(float x, float y)
此函数会返回x除以y的余数。

 为什么这个图像和fract函数的图像这个相似呢？因为mod的这个函数图像的第二个参数我写的是1.0
第七个通用函数：float min(float x, float y)
此函数会返回x和y两个值中的最小值。

第八个通用函数：float max(float x, float y)
此函数会返回x和y两个值中的最大值。

第九个通用函数：float clamp(float x, float minVal, float maxVal)
此函数会将x限制在minVal和maxVal之间。

上面的图像中我将minVal的值调节为0.0，将maxVal的值调节为1.0，那么x的值比0.0小的时候，就会返回0.0，在0.0到1.0之间就会返回x值本身，而大于1.0的时候就会返回1.0。

第十个通用函数：float mix(float x, float y, float a)
此函数会返回x和y的线性混合，即x*(1-a)+y*a
下面我们看一下y = mix(0.,1.,x);这个函数的图像。

第十一个通用函数：float step(float edge, float)
此函数会根据两个数值生成阶梯函数，如果x<edge则返回0.0，否则返回1.0

第十二个通用函数：float smoothstep(float edge0, float edge1, float x) 如果x<=edge0则返回0.0，如果x>=edge1则返回1.0,否则
t=clamp((x-edge0)/(edge1-edge0), 0, 1)
return t*t(3-2*t)

内置变量------------------------------------------------------------------------------------------------------------

gl_PointSize
访问地方：顶点着色器
GLSL定义了一个叫做gl_PointSize输出变量，它是一个float变量，你可以使用它来设置点的宽高（像素）。
在顶点着色器中修改点的大小的话，你就能对每个顶点设置不同的值了

gl_VertexID
访问地方：顶点着色器
gl_Position和gl_PointSize都是输出变量，因为它们的值是作为顶点着色器的输出被读取的。我们可以对它们进行写入，来改变结果。
顶点着色器还为我们提供了一个有趣的输入变量，我们只能对它进行读取，它叫做gl_VertexID。
整型变量gl_VertexID储存了正在绘制顶点的当前ID。当（使用glDrawElements）进行索引渲染的时候，这个变量会存储正在绘制顶点的当前索引。
当（使用glDrawArrays）不使用索引进行绘制的时候，这个变量会储存从渲染调用开始的已处理顶点数量。
虽然现在它没有什么具体的用途，但知道我们能够访问这个信息总是好的

gl_FragCoord
访问地方：顶点着色器
在讨论深度测试的时候，我们已经见过gl_FragCoord很多次了，因为gl_FragCoord的z分量等于对应片段的深度值。
然而，我们也能使用它的x和y分量来实现一些有趣的效果。
gl_FragCoord的x和y分量是片段的窗口空间(Window-space)坐标，其原点为窗口的左下角。
我们已经使用glViewport设定了一个800x600的窗口了，所以片段窗口空间坐标的x分量将在0到800之间，y分量在0到600之间。
通过利用片段着色器，我们可以根据片段的窗口坐标，计算出不同的颜色。
gl_FragCoord的一个常见用处是用于对比不同片段计算的视觉输出效果，这在技术演示中可以经常看到。
比如说，我们能够将屏幕分成两部分，在窗口的左侧渲染一种输出，在窗口的右侧渲染另一种输出

gl_FrontFacing
访问地方：片元着色器
gl_FrontFacing变量是一个bool，如果当前片段是正向面的一部分那么就是true，否则就是false
注意，如果你开启了面剔除，你就看不到箱子内部的面了，所以现在再使用gl_FrontFacing就没有意义了

gl_FragDepth
访问地方：片元着色器
要想设置深度值，我们直接写入一个0.0到1.0之间的float值到输出变量就可以了：
gl_FragDepth = 0.0; // 这个片段现在的深度值为 0.0
如果着色器没有写入值到gl_FragDepth，它会自动取用gl_FragCoord.z的值。
然而，由我们自己设置深度值有一个很大的缺点，只要我们在片段着色器中对gl_FragDepth进行写入，
OpenGL就会（像深度测试小节中讨论的那样）禁用所有的提前深度测试(Early Depth Testing)。
它被禁用的原因是，OpenGL无法在片段着色器运行之前得知片段将拥有的深度值，因为片段着色器可能会完全修改这个深度值


threejs
网格=几何体+材料
场景=网格+灯光
渲染=场景+相机


`

