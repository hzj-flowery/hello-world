#version 300 es
precision mediump float;

in vec2 v_uv;
uniform sampler2D u_texture;
out vec4 FragColor;

void main() {
FragColor = vec4(texture(u_texture, v_uv).rgb,1.0);
}