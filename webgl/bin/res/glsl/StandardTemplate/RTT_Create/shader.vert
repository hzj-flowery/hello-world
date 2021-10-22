#version 300 es
in vec4 a_position;
in vec4 a_normal;
in vec2 a_texcoord;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
out vec3 vPosition;
out vec3 vNormal;
out vec2 v_uv;


void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
  vNormal = vec3(transpose(inverse(u_world)) * a_normal);
  vPosition = vec3(u_world * a_position);
  v_uv = a_texcoord;
}