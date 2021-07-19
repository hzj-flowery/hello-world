precision mediump float;
uniform sampler2D gDepth;
varying vec4 v_position;
void main(){
    vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
    vec2 screenPos = homogeneousDivisionPos.xy*0.5+vec2(0.5);
    gl_FragColor=texture2D(gDepth,screenPos);//将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
}