attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_uv;
varying vec3 v_position;
void main(){
  gl_Position=u_projection*u_view*u_world*a_position;
  v_uv=a_texcoord;
  v_position=(u_view*u_world*a_position).xyz;
}