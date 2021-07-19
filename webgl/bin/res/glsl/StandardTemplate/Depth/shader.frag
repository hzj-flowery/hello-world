#version 300 es
precision mediump float;
layout (location = 0) out vec4 gDepth;   // 颜色
void main(){
    // vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
    gDepth=vec4(gl_FragCoord.z,0.,0.,1.);//将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
}