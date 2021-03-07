#version 300 es
in vec3 a_position;
in vec2 a_uv;

uniform mat4 u_MMatrix;
uniform mat4 u_VMatrix;
uniform mat4 u_PMatrix;
out vec2 v_uv;

void main() {
gl_Position = u_PMatrix * u_VMatrix *u_MMatrix* vec4(a_position, 1.0);
v_uv = a_uv;
}