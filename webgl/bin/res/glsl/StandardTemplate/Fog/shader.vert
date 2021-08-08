attribute vec4 a_position;
attribute vec2 a_uv;

uniform mat4 u_Mmat;
uniform mat4 u_Vmat;
uniform mat4 u_Pmat;

varying vec2 v_uv;
varying vec3 v_position;
void main(){
  gl_Position=u_Pmat*u_Vmat*u_Mmat*a_position;
  v_uv=a_uv;
  v_position=(u_Vmat*u_Mmat*a_position).xyz;
}