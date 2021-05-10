#version 300 es
in vec4 a_position;
in vec4 a_normal;
in vec2 a_uv;
uniform mat4 u_Mmat;
uniform mat4 u_Vmat;
uniform mat4 u_Pmat;
out vec3 vPosition;
out vec3 vNormal;
out vec2 v_uv;

void main() {
  gl_Position = u_Pmat * u_Vmat * u_Mmat * a_position;
  vNormal = vec3(transpose(inverse(u_Mmat)) * a_normal);
  vPosition = vec3(u_Mmat * a_position);
  v_uv = a_uv;
}