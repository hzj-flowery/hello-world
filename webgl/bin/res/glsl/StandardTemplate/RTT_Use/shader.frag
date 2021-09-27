
precision highp float;

uniform sampler2D gColor;
uniform sampler2D gPosition;
uniform sampler2D gNormal;

uniform sampler2D gUv;
varying vec2 v_uv;
varying vec4 v_position;

void main() {
 vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
 vec2 screenPos = homogeneousDivisionPos.xy*0.5+vec2(0.5);  //转换到屏幕坐标系下

 vec4 cor = texture2D(gColor,screenPos.xy);
// vec4 cor = texture2D(gNormal,screenPos.xy);
//  vec4 cor = texture2D(gColor,vec2(2.0*gl_FragCoord.x/960.0,gl_FragCoord.y/640.0));
 
 gl_FragColor = cor;

}

/*
gl_FragCoord:片元坐标，单位是像素，坐标原点在左上角（0，0），左下角为（screenW,screenH）
screenW:代表实际屏幕的宽度
screenH：代表实际屏幕的高度

viewportW:[0,1] 视口的宽度 如果为0.5，表示将屏幕的宽度缩放到一半进行渲染，如果为1，表示将按照屏幕的宽度进行1:1渲染
viewportH:[0,1] 视口的高度 如果为0.5，表示将屏幕的高度度缩放到一半进行渲染，如果为1，表示将按照屏幕的高度进行1:1渲染

Vpos:从顶点着色器插值过来的顶点坐标

screenPos = (Vpos_xyz/Vpos_w).xy*0.5+vec2(0.5,0.5)

screenPos = vec2((1/viewportW)*gl_FragCoord.x/screenW,(1/viewportH)gl_FragCoord.y/screenH)

感悟1：
生成的纹理数据，他们的坐标范围是[0,1]


*/