// input.glsl

#pragma glslify: sum = require(./module)

void main() {
  float s = sum(0.5, 0.5);
  gl_FragColor = vec4(s, s, s, 1.0);
}