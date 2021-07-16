
precision highp float;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gColor;
uniform sampler2D gUv;
varying vec2 v_uv;
varying vec4 v_position;

void main() {
 vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
 vec2 screenPos = homogeneousDivisionPos.xy*0.5+vec2(0.5);  //转换到屏幕坐标系下
 vec4 cor = texture2D(gColor,screenPos.xy);
//  vec4 cor = texture2D(gColor,vec2(gl_FragCoord.x/960.0,gl_FragCoord.y/640.0));
 
 gl_FragColor = cor;
}