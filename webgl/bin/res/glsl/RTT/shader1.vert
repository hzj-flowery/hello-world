
attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec2 a_uv;
uniform mat4 u_Mmat;
uniform mat4 u_Vmat;
uniform mat4 u_Pmat;

varying vec2 v_uv;
varying vec4 v_position;

void main() {
  gl_Position = u_Pmat * u_Vmat * u_Mmat * a_position;
  v_uv = a_uv;
  v_position = gl_Position;
}