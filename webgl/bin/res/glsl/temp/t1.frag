#version 300 es
precision highp float;
#define GLSLIFY 1
layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gColor;

uniform vec4 color;
in vec3 vPosition;
in vec3 vNormal;

void main() {    
  // Store the fragment position vector in the first gbuffer texture
  gPosition = vPosition;
  // Also store the per-fragment normals into the gbuffer
  gNormal = normalize(vNormal);
  gColor = color;
}