attribute vec4 a_position;
attribute vec2 a_uv;

uniform mat4 u_MMatrix;
uniform mat4 u_VMatrix;
uniform mat4 u_PMatrix;

varying vec2 v_texcoord;
varying vec3 v_position;
void main(){
  gl_Position=u_PMatrix*u_VMatrix*u_MMatrix*a_position;
  v_texcoord=a_uv;
  v_position=(u_VMatrix*u_MMatrix*a_position).xyz;
}