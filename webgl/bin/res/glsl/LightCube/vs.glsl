attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;
uniform mat4 u_MMatrix;
uniform mat4 u_VMatrix;
uniform mat4 u_PMatrix;
uniform mat4 u_MITMatrix;  //模型的世界矩阵
varying vec2 v_uv;
varying vec3 v_normal;
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_PMatrix *u_VMatrix*u_MMatrix* a_position;
  // Pass the normal to the fragment shader
  v_normal = mat3(u_MITMatrix)* a_normal;
  v_uv = a_uv;
}