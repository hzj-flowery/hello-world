attribute vec4 a_position;
attribute vec2 a_uv;
uniform mat4 u_PMatrix;
uniform mat4 u_VMatrix;
uniform mat4 u_MMatrix;
varying vec2 v_uv;
void main(){
    gl_Position=u_PMatrix*u_VMatrix*u_MMatrix*a_position;
    v_uv=a_uv;
}