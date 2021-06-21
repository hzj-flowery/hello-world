#version 300 es
#define GLSLIFY 1
in vec3 aPosition;
in vec2 aTexcoord;
out vec2 texcoord;

void main() {
  texcoord = aTexcoord;
  gl_Position = vec4(aPosition, 1.0);
}