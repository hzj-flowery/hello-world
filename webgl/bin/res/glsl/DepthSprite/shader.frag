precision mediump float;
uniform sampler2D gDepth;
uniform sampler2D gUv;
uniform sampler2D gColor;

varying vec4 v_position;
varying vec2 v_uv;
void main(){
    vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
    vec2 screenPos = homogeneousDivisionPos.xy*0.5+vec2(0.5);
    // gl_FragColor=vec4(texture2D(gUv,screenPos).r,0.0,0.0,1.0);
    vec2 testPos = vec2(gl_FragCoord.x/(960.0),gl_FragCoord.y/(640.0));
    vec2 uv = texture2D(gUv,screenPos).rg;
    gl_FragColor=vec4(texture2D(gDepth,v_uv).rgb,1.0);
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