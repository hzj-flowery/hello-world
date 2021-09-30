#version 300 es
#ifdef SY_HIGH_PRECISION
precision highp float;
#elif defined(SY_MEDIUM_PRECISION)
precision mediump float;
#elif defined(SY_LOW_PRECISION)
precision lowp float;
#else
precision mediump float;
#endif
out vec4 FragColor;   // 颜色
in vec2 v_uv;
uniform sampler2D u_texture;
void main() {
FragColor = vec4(texture(u_texture, v_uv).rgb,1.0);
}