attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_world_I_T;  //模型的世界矩阵
varying vec2 v_uv;
varying vec3 v_normal;
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_projection *u_view*u_world* a_position;
  // Pass the normal to the fragment shader
  v_normal = mat3(u_world_I_T)* a_normal;
  v_uv = a_texcoord;
}