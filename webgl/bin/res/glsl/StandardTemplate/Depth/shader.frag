#version 300 es
precision mediump float;
layout (location = 0) out vec4 gDepth;   // 深度
layout (location = 1) out vec2 gUv;   // uv坐标
in vec2 v_uv;
in vec4 v_position;
void main(){
    vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
    vec2 screenPos = homogeneousDivisionPos.xy*0.5+vec2(0.5); 
    gDepth=vec4(screenPos.x,0.0,0.0,1.);//将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
    gUv = v_uv;
}