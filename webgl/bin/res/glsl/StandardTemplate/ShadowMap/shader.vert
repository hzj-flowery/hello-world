attribute vec4 a_position;
attribute vec2 a_uv;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
void main(){
    gl_Position=u_projection*u_view*u_world*a_position;
}