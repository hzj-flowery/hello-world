#define GLSLIFY 1
// input.glsl

// module.glsl

highp float sum(highp float x, highp float y) {
  return x + y;
}

// 其中，最后一句#pragma glslify: export(sum)非常重要，表示该模块导出时的名字。

void main() {
  float s = sum(0.5, 0.5);
  gl_FragColor = vec4(s, s, s, 1.0);
}