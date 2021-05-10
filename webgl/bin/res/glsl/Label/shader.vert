attribute vec3 a_position;
  attribute vec2 a_uv;

  uniform mat4 u_Mmat;
  uniform mat4 u_Vmat;
  uniform mat4 u_Pmat;

  varying vec2 vTextureCoordinates;

  void main() {
  gl_Position = u_Pmat * u_Vmat *u_Mmat* vec4(a_position, 1.0);
  vTextureCoordinates = vec2(a_uv.x,a_uv.y); //取反
  }