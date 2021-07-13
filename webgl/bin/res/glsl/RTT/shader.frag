#version 300 es
precision highp float;
/*
惊喜发现：
location=0 最好会默认输出到显示的帧缓冲中去 无论这个变量的名字叫啥
*/
layout (location = 0) out vec3 gPosition;// 位置
layout (location = 1) out vec3 gNormal;  // 法向量
layout (location = 2) out vec4 gColor;   // 颜色
uniform sampler2D u_texture;
in vec3 vPosition;
in vec3 vNormal;
in vec2 v_uv;

void main() {
  gPosition = vec3(1.0,0.0,0.0);
  gNormal = vec3(0.0, 0.102, 1.0);
  gColor = vec4(texture(u_texture, v_uv).rgb,1.0);
  
}