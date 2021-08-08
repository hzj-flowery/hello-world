attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;
uniform mat4 u_Mmat;
uniform mat4 u_Vmat;
uniform mat4 u_Pmat;
uniform mat4 u_Mmat_I_T;  //模型的世界矩阵
varying vec2 v_uv;
varying vec3 v_normal;
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_Pmat *u_Vmat*u_Mmat* a_position;
  // Pass the normal to the fragment shader
  v_normal = mat3(u_Mmat_I_T)* a_normal;
  v_uv = a_uv;
}