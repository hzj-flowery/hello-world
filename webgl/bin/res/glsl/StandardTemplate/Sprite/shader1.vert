#version 300 es
in vec3 a_position;
in vec2 a_uv;

uniform mat4 u_Mmat;
uniform mat4 u_Vmat;
uniform mat4 u_Pmat;
out vec2 v_uv;

void main() {
gl_Position = u_Pmat * u_Vmat *u_Mmat* vec4(a_position, 1.0);
v_uv = a_uv;
}