attribute vec4 a_position;
attribute vec2 a_uv;
uniform mat4 u_Pmat;
uniform mat4 u_Vmat;
uniform mat4 u_Mmat;
varying vec4 v_position;
varying vec2 v_uv;
void main(){
    gl_Position=u_Pmat*u_Vmat*u_Mmat*a_position;
    v_position = gl_Position;
    v_uv = a_uv;
}