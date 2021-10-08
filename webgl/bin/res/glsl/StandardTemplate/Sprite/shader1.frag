#version 300 es
precision mediump float;
out vec4 FragColor;   // 颜色
in vec2 v_uv;
uniform sampler2D u_texture;
void main() {
FragColor = vec4(texture(u_texture, v_uv).rgb,1.0);
}