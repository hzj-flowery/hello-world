attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
varying vec3 v_normal;
varying vec2 v_texcoord;
void main(){
   gl_Position=u_projection*u_view*u_world*a_position;
   v_normal=mat3(u_world)*a_normal;
   v_texcoord = a_texcoord;
}