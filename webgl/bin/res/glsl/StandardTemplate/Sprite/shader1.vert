#version 300 es
in vec3 a_position;
in vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
out vec2 v_uv;

void main() {
gl_Position = u_projection * u_view *u_world* vec4(a_position, 1.0);
v_uv = a_texcoord;
}